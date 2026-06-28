import type { Editor } from '@tiptap/react'

/**
 * Command registry — drives the Raycast-style command palette.
 * Each command has: id, group, label, optional hint keywords, optional
 * shortcut (display-only), and a `run` callback.
 *
 * `available` lets commands be conditionally hidden (e.g. "Save" only when
 * there's an open document).
 */

export type CommandGroup = 'File' | 'Edit' | 'Insert' | 'View' | 'App'

export interface CommandContext {
  editor: Editor | null
  hasDocument: boolean
  openFile: () => void
  newFile: () => void
  saveFile: () => void
  saveAsFile: () => void
  toggleTheme: () => void
  toggleReaderMode: () => void
  reloadWindow: () => void
  openRecents: () => void
}

export interface Command {
  id: string
  group: CommandGroup
  label: string
  keywords?: string
  shortcut?: string[]
  run: (ctx: CommandContext) => void
  available?: (ctx: CommandContext) => boolean
}

/**
 * Insert an empty GFM table at the current selection.
 */
function insertTable(editor: Editor): void {
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

/**
 * Insert a horizontal rule.
 */
function insertHr(editor: Editor): void {
  editor.chain().focus().setHorizontalRule().run()
}

/**
 * Insert a fenced code block.
 */
function insertCodeBlock(editor: Editor): void {
  editor.chain().focus().toggleCodeBlock().run()
}

/**
 * Insert a task list item.
 */
function insertTaskItem(editor: Editor): void {
  editor.chain().focus().toggleTaskList().run()
}

/**
 * Build the full command list given a context. Some commands (e.g. file
 * operations) close over callbacks from the context; editor commands read
 * from `ctx.editor`.
 */
export function buildCommands(): Command[] {
  return [
    // ── File ──────────────────────────────────────────────────────────
    {
      id: 'file.open',
      group: 'File',
      label: 'Open File…',
      keywords: 'open file markdown load',
      shortcut: ['Ctrl', 'O'],
      run: (ctx) => ctx.openFile()
    },
    {
      id: 'file.new',
      group: 'File',
      label: 'New File',
      keywords: 'new untitled create',
      shortcut: ['Ctrl', 'N'],
      run: (ctx) => ctx.newFile()
    },
    {
      id: 'file.save',
      group: 'File',
      label: 'Save',
      keywords: 'save write disk',
      shortcut: ['Ctrl', 'S'],
      run: (ctx) => ctx.saveFile(),
      available: (ctx) => ctx.hasDocument
    },
    {
      id: 'file.saveAs',
      group: 'File',
      label: 'Save As…',
      keywords: 'save as export rename',
      shortcut: ['Ctrl', 'Shift', 'S'],
      run: (ctx) => ctx.saveAsFile(),
      available: (ctx) => ctx.hasDocument
    },
    {
      id: 'file.recents',
      group: 'File',
      label: 'Open Recent…',
      keywords: 'recent history list',
      shortcut: ['Ctrl', 'R'],
      run: (ctx) => ctx.openRecents()
    },

    // ── Edit ──────────────────────────────────────────────────────────
    {
      id: 'edit.bold',
      group: 'Edit',
      label: 'Bold',
      keywords: 'bold strong',
      shortcut: ['Ctrl', 'B'],
      run: (ctx) => ctx.editor?.chain().focus().toggleBold().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.italic',
      group: 'Edit',
      label: 'Italic',
      keywords: 'italic emphasis',
      shortcut: ['Ctrl', 'I'],
      run: (ctx) => ctx.editor?.chain().focus().toggleItalic().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.strike',
      group: 'Edit',
      label: 'Strikethrough',
      keywords: 'strike delete',
      run: (ctx) => ctx.editor?.chain().focus().toggleStrike().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.inlineCode',
      group: 'Edit',
      label: 'Inline Code',
      keywords: 'code inline mono',
      run: (ctx) => ctx.editor?.chain().focus().toggleCode().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.link',
      group: 'Edit',
      label: 'Link',
      keywords: 'link url href',
      shortcut: ['Ctrl', 'K'],
      run: (ctx) => {
        const url = window.prompt('URL')
        if (url) ctx.editor?.chain().focus().setLink({ href: url }).run()
      },
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.undo',
      group: 'Edit',
      label: 'Undo',
      keywords: 'undo history back',
      shortcut: ['Ctrl', 'Z'],
      run: (ctx) => ctx.editor?.chain().focus().undo().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'edit.redo',
      group: 'Edit',
      label: 'Redo',
      keywords: 'redo forward repeat',
      shortcut: ['Ctrl', 'Y'],
      run: (ctx) => ctx.editor?.chain().focus().redo().run(),
      available: (ctx) => !!ctx.editor
    },

    // ── Insert ────────────────────────────────────────────────────────
    {
      id: 'insert.h1',
      group: 'Insert',
      label: 'Heading 1',
      keywords: 'h1 heading title',
      run: (ctx) => ctx.editor?.chain().focus().setHeading({ level: 1 }).run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.h2',
      group: 'Insert',
      label: 'Heading 2',
      keywords: 'h2 heading subtitle',
      run: (ctx) => ctx.editor?.chain().focus().setHeading({ level: 2 }).run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.h3',
      group: 'Insert',
      label: 'Heading 3',
      keywords: 'h3 heading section',
      run: (ctx) => ctx.editor?.chain().focus().setHeading({ level: 3 }).run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.bulletList',
      group: 'Insert',
      label: 'Bullet List',
      keywords: 'bullet list ul unordered',
      run: (ctx) => ctx.editor?.chain().focus().toggleBulletList().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.orderedList',
      group: 'Insert',
      label: 'Numbered List',
      keywords: 'ordered numbered list ol',
      run: (ctx) => ctx.editor?.chain().focus().toggleOrderedList().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.taskList',
      group: 'Insert',
      label: 'Task List',
      keywords: 'task todo checkbox check',
      run: (ctx) => ctx.editor && insertTaskItem(ctx.editor),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.table',
      group: 'Insert',
      label: 'Table',
      keywords: 'table grid cells columns',
      run: (ctx) => ctx.editor && insertTable(ctx.editor),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.codeBlock',
      group: 'Insert',
      label: 'Code Block',
      keywords: 'code block fence pre',
      run: (ctx) => ctx.editor && insertCodeBlock(ctx.editor),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.blockquote',
      group: 'Insert',
      label: 'Blockquote',
      keywords: 'quote blockquote cite',
      run: (ctx) => ctx.editor?.chain().focus().toggleBlockquote().run(),
      available: (ctx) => !!ctx.editor
    },
    {
      id: 'insert.hr',
      group: 'Insert',
      label: 'Horizontal Rule',
      keywords: 'horizontal rule divider line separator',
      run: (ctx) => ctx.editor && insertHr(ctx.editor),
      available: (ctx) => !!ctx.editor
    },

    // ── View ──────────────────────────────────────────────────────────
    {
      id: 'view.theme',
      group: 'View',
      label: 'Toggle Theme',
      keywords: 'theme dark light toggle',
      run: (ctx) => ctx.toggleTheme()
    },
    {
      id: 'view.reader',
      group: 'View',
      label: 'Toggle Reader Mode',
      keywords: 'reader preview read only',
      run: (ctx) => ctx.toggleReaderMode(),
      available: (ctx) => ctx.hasDocument
    },

    // ── App ───────────────────────────────────────────────────────────
    {
      id: 'app.reload',
      group: 'App',
      label: 'Reload Window',
      keywords: 'reload refresh restart',
      shortcut: ['Ctrl', 'Shift', 'R'],
      run: (ctx) => ctx.reloadWindow()
    }
  ]
}
