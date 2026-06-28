import { useEffect, useState } from 'react'
import { useEditorStore } from '../store/editor-store'
import {
  IconClose,
  IconMinimize,
  IconMaximize,
  IconRestore,
  IconCommand,
  IconHistory,
  IconTheme,
  IconReader,
  IconEdit
} from './icons'

interface TitlebarProps {
  onToggleTheme: () => void
  onToggleReaderMode: () => void
  onOpenPalette: () => void
  onOpenRecents: () => void
  readerMode: boolean
}

/**
 * Custom frameless titlebar — Mac-Typora-style.
 * Single slim bar holds: drag region with file name, inline stats
 * (words / chars / read time), action buttons, Windows system buttons.
 *
 * No bottom status bar — everything lives here.
 */
export function Titlebar(props: TitlebarProps) {
  const fileName = useEditorStore((s) => s.fileName)
  const isNew = useEditorStore((s) => s.isNew)
  const dirty = useEditorStore((s) => s.dirty)
  const stats = useEditorStore((s) => s.stats)
  const isMaximized = useEditorStore((s) => s.isMaximized)
  const setIsMaximized = useEditorStore((s) => s.setMaximized)

  // Query initial maximize state from main
  useEffect(() => {
    void window.api.isMaximized().then(setIsMaximized)
    const off = window.api.onMaximizedChanged(setIsMaximized)
    return off
  }, [setIsMaximized])

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    // Re-render every 30s so read-time stays current — cheap
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  void now

  const title = fileName ?? (isNew ? 'Untitled' : 'Markdown Editor')
  const hasDoc = !!fileName || isNew

  return (
    <div
      className="drag-region flex items-center h-9 bg-bg-surface border-b border-line select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: app + filename */}
      <div className="flex items-center gap-2 pl-3 min-w-0 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-xs bg-accent/80" aria-hidden />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-ink-high truncate max-w-[260px] font-medium" title={title}>
            {title}
          </span>
          {dirty && hasDoc && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* Center: stats — Typora frameless pattern */}
      <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
        {hasDoc ? (
          <div className="flex items-center gap-3 text-2xs text-ink-low tabular-nums">
            <span>{stats.words.toLocaleString()} words</span>
            <span className="text-ink-dim">·</span>
            <span>{stats.chars.toLocaleString()} chars</span>
            <span className="text-ink-dim">·</span>
            <span>{stats.readingTimeMin} min read</span>
          </div>
        ) : (
          <div className="text-2xs text-ink-dim">Drop a .md file or press Ctrl+K</div>
        )}
      </div>

      {/* Right: action buttons + window controls */}
      <div
        className="flex items-center gap-0.5 pr-1 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {hasDoc && (
          <button
            className="icon-btn"
            title={props.readerMode ? 'Switch to Edit mode' : 'Switch to Reader mode'}
            onClick={props.onToggleReaderMode}
          >
            {props.readerMode ? <IconEdit size={14} /> : <IconReader size={14} />}
          </button>
        )}
        <button
          className="icon-btn"
          title="Toggle theme"
          onClick={props.onToggleTheme}
        >
          <IconTheme size={14} />
        </button>
        <button
          className="icon-btn"
          title="Recents (Ctrl+R)"
          onClick={props.onOpenRecents}
        >
          <IconHistory size={14} />
        </button>
        <button
          className="icon-btn"
          title="Command palette (Ctrl+K)"
          onClick={props.onOpenPalette}
        >
          <IconCommand size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-line mx-1" />

        {/* Windows system buttons */}
        <button
          className="titlebar-btn"
          title="Minimize"
          onClick={() => window.api.minimize()}
        >
          <IconMinimize size={14} />
        </button>
        <button
          className="titlebar-btn"
          title={isMaximized ? 'Restore' : 'Maximize'}
          onClick={() => window.api.toggleMaximize()}
        >
          {isMaximized ? <IconRestore size={12} /> : <IconMaximize size={12} />}
        </button>
        <button
          className="titlebar-btn is-close"
          title="Close"
          onClick={() => window.api.close()}
        >
          <IconClose size={14} />
        </button>
      </div>
    </div>
  )
}
