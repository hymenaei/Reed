import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { CharacterCount } from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Link } from '@tiptap/extension-link'
import { createLowlight, common } from 'lowlight'
import type { Editor } from '@tiptap/react'

import { FrontmatterBlock } from './FrontmatterBlock'
import { useEditorStore } from '../store/editor-store'

const lowlight = createLowlight(common)

export interface EditorHandle {
  getEditor: () => Editor | null
}

interface EditorPaneProps {
  /** Initial markdown content (body only — frontmatter handled separately) */
  initialBody: string
  /** Frontmatter object (or null) */
  initialFrontmatter: Record<string, unknown> | null
  /** Read-only reader mode */
  readOnly?: boolean
  /** Called with the new body whenever content changes */
  onBodyChange: (body: string) => void
  /** Called whenever frontmatter is edited */
  onFrontmatterChange: (fm: Record<string, unknown> | null) => void
}

export const EditorPane = forwardRef<EditorHandle, EditorPaneProps>(function EditorPane(
  { initialBody, initialFrontmatter, readOnly, onBodyChange, onFrontmatterChange },
  ref
) {
  const setDirty = useEditorStore((s) => s.setDirty)
  const setStats = useEditorStore((s) => s.setStats)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false // replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'md-link' }
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false, HTMLAttributes: { class: 'gfm-table' } }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
        breaks: false,
        linkify: true
      })
    ],
    content: initialBody,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose-editor',
        'data-placeholder': 'Start writing…  drop a .md file to open.'
      },
      handleDrop: (_view, event) => {
        // Drag-drop of files is handled at the window level — prevent TipTap
        // from interpreting the drop as inline content.
        if (event.dataTransfer?.files?.length) {
          event.preventDefault()
          return true
        }
        return false
      },
      handlePaste: (view, event) => {
        // Plain-text paste only — avoid rich-HTML contamination from browsers
        const text = event.clipboardData?.getData('text/plain')
        if (text && event.clipboardData?.types?.includes('text/html')) {
          event.preventDefault()
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      const md =
        // tiptap-markdown exposes serializer on editor.storage.markdown
        (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown() ??
        editor.getText()
      onBodyChange(md)
      setDirty(true)
      const text = editor.getText()
      const words = (text.match(/\b[\w'-]+\b/g) ?? []).length
      const chars = text.length
      setStats({
        words,
        chars,
        readingTimeMin: Math.max(1, Math.round(words / 200))
      })
    }
  })

  useImperativeHandle(ref, () => ({
    getEditor: () => editor
  }))

  // Sync editor when initialBody changes (i.e. a new file is opened)
  useEffect(() => {
    if (!editor) return
    const current =
      (editor.storage as { markdown?: { getMarkdown: () => string } }).markdown?.getMarkdown() ??
      ''
    if (current !== initialBody) {
      editor.commands.setContent(initialBody, false)
      // setContent(emitUpdate=false) won't fire onUpdate — manually refresh stats
      const text = editor.getText()
      const words = (text.match(/\b[\w'-]+\b/g) ?? []).length
      setStats({
        words,
        chars: text.length,
        readingTimeMin: Math.max(1, Math.round(words / 200))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBody])

  // Toggle read-only reactively
  useEffect(() => {
    if (editor) editor.setEditable(!readOnly)
  }, [editor, readOnly])

  // Track initialBody change for frontmatter component re-mount
  const bodyKey = useRef<string>(initialBody)
  useEffect(() => {
    bodyKey.current = initialBody
  }, [initialBody])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scroll-y bg-bg-base">
      <div className="max-w-[720px] mx-auto px-12 py-10">
        <FrontmatterBlock
          key={initialFrontmatter ? JSON.stringify(initialFrontmatter) : 'none'}
          initial={initialFrontmatter}
          readOnly={readOnly}
          onChange={onFrontmatterChange}
        />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})
