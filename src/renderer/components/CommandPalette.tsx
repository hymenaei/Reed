import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../store/editor-store'
import { buildCommands, type Command, type CommandContext, type CommandGroup } from '../lib/commands'
import { fuzzyRank } from '../lib/fuzzy'
import { IconSearch, IconChevronRight } from './icons'

interface CommandPaletteProps {
  ctx: CommandContext
  onClose: () => void
}

const GROUP_ORDER: CommandGroup[] = ['File', 'Edit', 'Insert', 'View', 'App']

export function CommandPalette({ ctx, onClose }: CommandPaletteProps) {
  const recents = useEditorStore((s) => s.recents)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Build flat command list, filtered by `available`
  const commands = useMemo<Command[]>(() => {
    return buildCommands().filter((cmd) => !cmd.available || cmd.available(ctx))
  }, [ctx])

  // Combine into a single ranked list: recent files (if query empty) + commands
  type Item =
    | { kind: 'cmd'; cmd: Command }
    | { kind: 'recent'; path: string; name: string }

  const items = useMemo<Item[]>(() => {
    const cmdItems: Item[] = commands.map((cmd) => ({ kind: 'cmd', cmd }))
    const recentItems: Item[] = recents.map((r) => ({ kind: 'recent', path: r.path, name: r.name }))
    return [...recentItems, ...cmdItems]
  }, [commands, recents])

  // Rank items by fuzzy match
  const ranked = useMemo(() => {
    return fuzzyRank(items, query, (it) =>
      it.kind === 'cmd' ? `${it.cmd.label} ${it.cmd.keywords ?? ''}` : it.name
    )
  }, [items, query])

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector(`[data-index="${activeIndex}"]`)
    if (active) {
      active.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  function runItem(item: Item): void {
    if (item.kind === 'cmd') {
      item.cmd.run(ctx)
    } else {
      // Recent file — read & open
      void window.api.readFile(item.path).then((file) => {
        // Bubble up via context.openFile callback chain — but we don't have a
        // direct file-open callback; reuse newFile + readFile pathway through
        // a synthetic event. Simplest: dispatch a custom event the App listens for.
        window.dispatchEvent(new CustomEvent('app:open-file', { detail: file }))
      })
    }
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, ranked.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = ranked[activeIndex]?.item
      if (item) runItem(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  // Group ranked results for display (preserves ranking within each group)
  const grouped = useMemo(() => {
    const out: Record<CommandGroup | 'Recent', Item[]> = {
      Recent: [],
      File: [],
      Edit: [],
      Insert: [],
      View: [],
      App: []
    }
    for (const r of ranked) {
      const it = r.item
      if (it.kind === 'recent') out['Recent'].push(it)
      else out[it.cmd.group].push(it)
    }
    return out
  }, [ranked])

  // Flatten with group headers for keyboard nav index mapping
  const flatWithHeaders = useMemo(() => {
    const rows: Array<{ type: 'header'; label: string } | { type: 'item'; item: Item; rankIndex: number }> = []
    let rankIndex = 0
    const orderedGroups: Array<CommandGroup | 'Recent'> = ['Recent', ...GROUP_ORDER]
    for (const g of orderedGroups) {
      const groupItems = grouped[g]
      if (groupItems.length === 0) continue
      rows.push({ type: 'header', label: g })
      for (const item of groupItems) {
        rows.push({ type: 'item', item, rankIndex })
        rankIndex++
      }
    }
    return rows
  }, [grouped])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-[min(640px,90vw)] bg-bg-surface border border-line-strong rounded-lg shadow-2xl shadow-black/60 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-line">
          <IconSearch size={16} className="text-ink-low" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-base text-ink-high placeholder:text-ink-dim"
          />
          <span className="kbd">Esc</span>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[min(50vh,420px)] overflow-y-auto scroll-y py-1.5">
          {flatWithHeaders.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-low">No results</div>
          )}
          {flatWithHeaders.map((row, i) => {
            if (row.type === 'header') {
              return (
                <div
                  key={`h-${row.label}`}
                  className="px-4 pt-3 pb-1 text-2xs font-medium uppercase tracking-wider text-ink-dim"
                >
                  {row.label}
                </div>
              )
            }
            const item = row.item
            const isActive = row.rankIndex === activeIndex
            return (
              <button
                key={`i-${row.rankIndex}`}
                data-index={row.rankIndex}
                onMouseMove={() => setActiveIndex(row.rankIndex)}
                onClick={() => runItem(item)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  isActive ? 'bg-bg-hover' : 'hover:bg-bg-hover/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-high truncate">
                    {item.kind === 'cmd' ? item.cmd.label : item.name}
                  </div>
                  {item.kind === 'recent' && (
                    <div className="text-2xs text-ink-dim truncate">{item.path}</div>
                  )}
                </div>
                {item.kind === 'cmd' && item.cmd.shortcut && (
                  <div className="flex items-center gap-1">
                    {item.cmd.shortcut.map((k) => (
                      <span key={k} className="kbd">{k}</span>
                    ))}
                  </div>
                )}
                {isActive && <IconChevronRight size={12} className="text-ink-low" />}
              </button>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-line text-2xs text-ink-dim">
          <div className="flex items-center gap-3">
            <span><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
            <span><span className="kbd">↵</span> select</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="kbd">Ctrl</span>
            <span className="kbd">K</span>
            <span>toggle</span>
          </div>
        </div>
      </div>
    </div>
  )
}
