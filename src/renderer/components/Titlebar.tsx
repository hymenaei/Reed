import { useEffect } from 'react'
import { useEditorStore } from '../store/editor-store'
import {
  IconClose,
  IconMinimize,
  IconMaximize,
  IconRestore,
  IconCommand,
  IconReader,
  IconEdit
} from './icons'

interface TitlebarProps {
  onToggleReaderMode: () => void
  onOpenPalette: () => void
  readerMode: boolean
}

/**
 * Custom frameless titlebar — Mac-Typora-style.
 * Single slim bar holds: drag region with file name (center), action buttons,
 * Windows system buttons.
 *
 * No bottom status bar — everything lives here.
 */
export function Titlebar(props: TitlebarProps) {
  const fileName = useEditorStore((s) => s.fileName)
  const isMaximized = useEditorStore((s) => s.isMaximized)
  const setIsMaximized = useEditorStore((s) => s.setMaximized)

  // Query initial maximize state from main
  useEffect(() => {
    void window.api.isMaximized().then(setIsMaximized)
    const off = window.api.onMaximizedChanged(setIsMaximized)
    return off
  }, [setIsMaximized])

  const title = fileName ?? 'Untitled'

  return (
    <div
      className="drag-region flex items-center h-9 bg-bg-surface select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left spacer — mirrors right-side controls width so filename sits
          on the window's horizontal midline. */}
      <div className="w-[112px] flex-shrink-0" aria-hidden />

      {/* Center: file name */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <span className="text-xs text-ink-high truncate max-w-[260px] font-medium" title={title}>
          {title}
        </span>
      </div>

      {/* Right: action buttons + window controls */}
      <div
        className="flex items-center gap-0.5 pr-1 flex-shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          className="icon-btn"
          title={props.readerMode ? 'Switch to Edit mode' : 'Switch to Reader mode'}
          onClick={props.onToggleReaderMode}
        >
          {props.readerMode ? <IconEdit size={14} /> : <IconReader size={14} />}
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
