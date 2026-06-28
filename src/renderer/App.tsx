import { useCallback, useEffect, useRef, useState } from 'react'
import { Titlebar } from './components/Titlebar'
import { EditorPane, type EditorHandle } from './components/Editor'
import { CommandPalette } from './components/CommandPalette'
import { DropZone } from './components/DropZone'
import { EmptyState } from './components/EmptyState'
import { useEditorStore } from './store/editor-store'
import { useDebounced } from './hooks/useDebounced'
import { splitFrontmatter, joinFrontmatter } from './lib/markdown'
import { buildCommands, type CommandContext } from './lib/commands'
import type { FileContent } from '@shared/types'

export default function App() {
  // ── Document state ─────────────────────────────────────────────────
  const [file, setFile] = useState<FileContent | null>(null)
  const [body, setBody] = useState<string>('')
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null)
  const [readerMode, setReaderMode] = useState(false)

  // ── Store ──────────────────────────────────────────────────────────
  const setStoreFile = useEditorStore((s) => s.setFile)
  const setStoreDirty = useEditorStore((s) => s.setDirty)
  const paletteOpen = useEditorStore((s) => s.paletteOpen)
  const setPaletteOpen = useEditorStore((s) => s.setPaletteOpen)
  const setRecents = useEditorStore((s) => s.setRecents)
  const setPrefs = useEditorStore((s) => s.setPrefs)

  const editorRef = useRef<EditorHandle>(null)

  // ── Init: load prefs + recents + restore last file ─────────────────
  useEffect(() => {
    void (async () => {
      const prefs = await window.api.getPrefs()
      setPrefs(prefs)
      const recents = await window.api.listRecents()
      setRecents(recents)
      // Restore last-opened file if it still exists; otherwise open an
      // untitled file so the app always starts with a document open.
      let opened = false
      if (prefs.lastOpenPath) {
        try {
          const fc = await window.api.readFile(prefs.lastOpenPath)
          openFileContent(fc)
          opened = true
        } catch {
          // File no longer exists — fall through to newFile
        }
      }
      if (!opened) newFile()
    })()

    // Listen for open-file requests from main (drag-drop on Linux/macOS
    // second-instance, or command-line argument)
    const off = window.api.onFileOpenRequested((path) => {
      void window.api.readFile(path).then(openFileContent).catch(() => {})
    })

    // Listen for synthetic open-file events from the command palette
    const onCustom = (e: Event): void => {
      const detail = (e as CustomEvent<FileContent>).detail
      openFileContent(detail)
    }
    window.addEventListener('app:open-file', onCustom as EventListener)

    return () => {
      off()
      window.removeEventListener('app:open-file', onCustom as EventListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Global keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const ctrl = e.ctrlKey || e.metaKey
      // Ctrl+K → toggle palette
      if (ctrl && e.key.toLowerCase() === 'k' && !e.shiftKey) {
        e.preventDefault()
        setPaletteOpen(!useEditorStore.getState().paletteOpen)
        return
      }
      // Ctrl+R → toggle recents (overrides default reload)
      if (ctrl && e.key.toLowerCase() === 'r' && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.getState().setRecentsOpen(!useEditorStore.getState().recentsOpen)
        return
      }
      // Ctrl+S → save
      if (ctrl && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault()
        void save()
        return
      }
      // Ctrl+Shift+S → save as
      if (ctrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void saveAs()
        return
      }
      // Ctrl+N → new file
      if (ctrl && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        newFile()
        return
      }
      // Ctrl+O → open
      if (ctrl && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        void openDialog()
        return
      }
      // Ctrl+Shift+R → reload window
      if (ctrl && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        window.location.reload()
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Autosave with debounce ─────────────────────────────────────────
  const debouncedBody = useDebounced(body, 1200)
  const debouncedFm = useDebounced(frontmatter, 1200)

  useEffect(() => {
    // Only autosave if the file exists on disk (not new/untitled)
    if (!file || file.isNew) return
    const fullMd = joinFrontmatter(debouncedFm, debouncedBody)
    void window.api.writeFile(file.path, fullMd).then(() => {
      setStoreDirty(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBody, debouncedFm])

  // ── File operations ────────────────────────────────────────────────
  function openFileContent(fc: FileContent): void {
    const { frontmatter: fm, body: b } = splitFrontmatter(fc.content)
    setFile(fc)
    setBody(b)
    setFrontmatter(fm)
    setStoreFile(fc.path, fc.name, fc.isNew)
    setReaderMode(false)
    // Refresh recents list (main has just added the file)
    void window.api.listRecents().then(setRecents)
  }

  async function openDialog(): Promise<void> {
    const fc = await window.api.openFileDialog()
    if (fc) openFileContent(fc)
  }

  async function openPath(path: string): Promise<void> {
    try {
      const fc = await window.api.readFile(path)
      openFileContent(fc)
    } catch (err) {
      console.error('Failed to open file', err)
    }
  }

  function newFile(): void {
    const fc: FileContent = {
      path: '',
      name: null as unknown as string,
      content: '',
      isNew: true
    }
    setFile(fc)
    setBody('')
    setFrontmatter(null)
    setStoreFile(null, 'Untitled', true)
    setReaderMode(false)
  }

  async function save(): Promise<void> {
    if (!file) return
    if (file.isNew) {
      await saveAs()
      return
    }
    const fullMd = joinFrontmatter(frontmatter, body)
    await window.api.writeFile(file.path, fullMd)
    setStoreDirty(false)
    // Refresh recents (in case the file wasn't in there yet)
    const recents = await window.api.listRecents()
    setRecents(recents)
  }

  async function saveAs(): Promise<void> {
    if (!file) return
    const defaultName = (file.name && file.name.endsWith('.md')) ? file.name : `${file.name || 'untitled'}.md`
    const path = await window.api.saveFileDialog(defaultName)
    if (!path) return
    const fullMd = joinFrontmatter(frontmatter, body)
    await window.api.writeFile(path, fullMd)
    // Add to recents and update file state
    const recents = await window.api.addRecent(path, path.split(/[\\/]/).pop() ?? 'untitled.md')
    setRecents(recents)
    const newName = path.split(/[\\/]/).pop() ?? 'untitled.md'
    const updated: FileContent = { path, name: newName, content: fullMd, isNew: false }
    setFile(updated)
    setStoreFile(path, newName, false)
    setStoreDirty(false)
  }

  async function toggleTheme(): Promise<void> {
    const prefs = await window.api.getPrefs()
    const next = prefs.theme === 'dark' ? 'light' : 'dark'
    const updated = await window.api.setPrefs({ theme: next })
    setPrefs(updated)
    // Apply to <html>
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  function toggleReaderMode(): void {
    setReaderMode((r) => !r)
  }

  function reloadWindow(): void {
    window.location.reload()
  }

  function openRecents(): void {
    useEditorStore.getState().setRecentsOpen(true)
  }

  // ── Command context for palette ────────────────────────────────────
  const ctx: CommandContext = {
    editor: editorRef.current?.getEditor() ?? null,
    hasDocument: !!file,
    openFile: () => void openDialog(),
    newFile,
    saveFile: () => void save(),
    saveAsFile: () => void saveAs(),
    toggleTheme: () => void toggleTheme(),
    toggleReaderMode,
    reloadWindow,
    openRecents
  }

  // Warm the command list (so ctx freshness is tracked)
  void buildCommands

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-base">
      <Titlebar
        onToggleReaderMode={toggleReaderMode}
        onOpenPalette={() => setPaletteOpen(true)}
        readerMode={readerMode}
      />

      <div className="flex-1 min-h-0 flex">
        {file ? (
          <EditorPane
            ref={editorRef}
            initialBody={body}
            initialFrontmatter={frontmatter}
            readOnly={readerMode}
            onBodyChange={setBody}
            onFrontmatterChange={(fm) => {
              setFrontmatter(fm)
              setStoreDirty(true)
            }}
          />
        ) : (
          <EmptyState
            onOpenPalette={() => setPaletteOpen(true)}
            onOpenRecents={openRecents}
            onNewFile={newFile}
          />
        )}
      </div>

      {/* Drop zone covers entire window */}
      <DropZone onDropFile={(path) => void openPath(path)} />

      {/* Command palette overlay */}
      {paletteOpen && (
        <CommandPalette ctx={ctx} onClose={() => setPaletteOpen(false)} />
      )}
    </div>
  )
}
