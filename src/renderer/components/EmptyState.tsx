import { IconCommand, IconFile, IconHistory } from './icons'

interface EmptyStateProps {
  onOpenPalette: () => void
  onOpenRecents: () => void
  onNewFile: () => void
}

/**
 * Centered empty-state shown when no document is open.
 * Mirrors Raycast's empty-state pattern: large icon, headline, three actions.
 */
export function EmptyState({ onOpenPalette, onOpenRecents, onNewFile }: EmptyStateProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6 bg-bg-base px-8">
      <div className="w-14 h-14 rounded-lg bg-bg-raised border border-line flex items-center justify-center text-ink-mid">
        <IconFile size={26} />
      </div>
      <div className="text-center">
        <div className="text-xl text-ink-high font-medium tracking-tight">No document open</div>
        <div className="text-sm text-ink-low mt-1.5">
          Drag a <span className="text-ink-mid">.md</span> file onto the window, or pick one:
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNewFile}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
        >
          <IconFile size={14} />
          <span>New file</span>
        </button>
        <button
          onClick={onOpenRecents}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-hover text-ink-high hover:bg-bg-active transition-colors text-sm"
        >
          <IconHistory size={14} />
          <span>Recents</span>
        </button>
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-hover text-ink-high hover:bg-bg-active transition-colors text-sm"
        >
          <IconCommand size={14} />
          <span>Commands</span>
        </button>
      </div>
      <div className="mt-2 text-2xs text-ink-dim flex items-center gap-2">
        <span className="kbd">Ctrl</span>
        <span className="kbd">K</span>
        <span>for command palette</span>
      </div>
    </div>
  )
}
