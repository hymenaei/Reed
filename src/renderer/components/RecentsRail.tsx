import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../store/editor-store'
import { IconHistory, IconClose, IconTrash, IconFile, IconChevronRight } from './icons'

interface RecentsRailProps {
  onOpenFile: (path: string) => void
  onClose: () => void
}

/**
 * Vertical side-tab button pinned to the left edge of the window.
 * Click to open a popover listing recent files; click a recent to open it.
 *
 * Pattern: an always-visible slim rail button (Mac-Typora-style frameless
 * chrome) + an anchored popover with the recent-files list.
 */
export function RecentsRail({ onOpenFile, onClose }: RecentsRailProps) {
  const recents = useEditorStore((s) => s.recents)
  const setRecents = useEditorStore((s) => s.setRecents)
  const isOpen = useEditorStore((s) => s.recentsOpen)
  const setIsOpen = useEditorStore((s) => s.setRecentsOpen)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load recents on mount
  useEffect(() => {
    void window.api.listRecents().then(setRecents)
  }, [setRecents])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    function onPointerDown(e: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen, setIsOpen])

  // Filter by query (simple includes — recents list is usually short)
  const filtered = recents.filter((r) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
  })

  async function handleRemove(path: string, e: React.MouseEvent): Promise<void> {
    e.stopPropagation()
    const next = await window.api.removeRecent(path)
    setRecents(next)
  }

  async function handleClearAll(): Promise<void> {
    const next = await window.api.clearRecents()
    setRecents(next)
  }

  return (
    <>
      {/* Rail button — slim vertical tab on the left edge */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          onClose()
        }}
        title="Recents (Ctrl+R)"
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-15 flex flex-col items-center justify-center gap-1 rounded-r-md border border-l-0 border-line transition-all duration-fast ${
          isOpen ? 'bg-bg-raised text-ink-high' : 'bg-bg-surface text-ink-mid hover:text-ink-high hover:w-8'
        }`}
        style={{ writingMode: 'vertical-rl' } as React.CSSProperties}
      >
        <IconHistory size={14} className="rotate-0" />
        <span className="text-2xs tracking-wider uppercase rotate-180">
          {recents.length > 0 ? recents.length : ''}
        </span>
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-40 w-[320px] bg-bg-surface border border-line-strong rounded-lg shadow-2xl shadow-black/60 overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-line">
            <div className="flex items-center gap-2">
              <IconHistory size={14} className="text-ink-mid" />
              <span className="text-xs font-medium text-ink-high">Recent Files</span>
              <span className="text-2xs text-ink-dim">{recents.length}</span>
            </div>
            <button
              className="icon-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <IconClose size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              spellCheck={false}
              className="flex-1 bg-transparent outline-none text-sm text-ink-high placeholder:text-ink-dim"
            />
            {query && (
              <button
                className="text-ink-dim hover:text-ink-high"
                onClick={() => setQuery('')}
              >
                <IconClose size={12} />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto scroll-y py-1">
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-ink-low">
                {recents.length === 0 ? 'No recent files' : 'No matches'}
              </div>
            )}
            {filtered.map((r) => (
              <button
                key={r.path}
                type="button"
                onClick={() => {
                  onOpenFile(r.path)
                  setIsOpen(false)
                }}
                className="group w-full flex items-center gap-2.5 px-3 py-2 hover:bg-bg-hover transition-colors"
              >
                <IconFile size={14} className="text-ink-mid flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm text-ink-high truncate">{r.name}</div>
                  <div className="text-2xs text-ink-dim truncate">{r.path}</div>
                </div>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 text-ink-dim hover:text-ink-high p-1"
                  onClick={(e) => void handleRemove(r.path, e)}
                  title="Remove from recents"
                >
                  <IconClose size={12} />
                </button>
                <IconChevronRight size={12} className="text-ink-dim opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Footer */}
          {recents.length > 0 && (
            <div className="flex items-center justify-end px-3 py-2 border-t border-line">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-2xs text-ink-dim hover:text-ink-high transition-colors"
              >
                <IconTrash size={12} />
                <span>Clear all</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
