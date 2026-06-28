import { useEffect, useState } from 'react'
import { IconChevronDown, IconChevronRight, IconClose, IconPlus } from './icons'

interface FrontmatterBlockProps {
  initial: Record<string, unknown> | null
  readOnly?: boolean
  onChange: (fm: Record<string, unknown> | null) => void
}

/**
 * Notion-style structured property block rendered above the editor body.
 * Renders YAML frontmatter as a list of key/value rows the user can edit
 * inline. Empty state lets the user add the first property.
 *
 * Values are stored as strings. Booleans and numbers round-trip through
 * YAML on save (the parent handles serialization).
 */
export function FrontmatterBlock({ initial, readOnly, onChange }: FrontmatterBlockProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [entries, setEntries] = useState<Array<{ key: string; value: string }>>([])

  // Normalise initial → array of {key, value} pairs
  useEffect(() => {
    if (!initial || Object.keys(initial).length === 0) {
      setEntries([])
      return
    }
    const next = Object.entries(initial).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    }))
    setEntries(next)
  }, [initial])

  function commit(next: Array<{ key: string; value: string }>): void {
    setEntries(next)
    const obj: Record<string, unknown> = {}
    let hasAny = false
    for (const entry of next) {
      const k = entry.key.trim()
      if (!k) continue
      hasAny = true
      obj[k] = coerceValue(entry.value)
    }
    onChange(hasAny ? obj : null)
  }

  if (readOnly && entries.length === 0) return null

  return (
    <div className="mb-6 -mx-2">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1.5 mb-2 text-xs text-ink-low hover:text-ink-mid transition-colors"
      >
        {collapsed ? <IconChevronRight size={12} /> : <IconChevronDown size={12} />}
        <span className="uppercase tracking-wider">Properties</span>
        {entries.length > 0 && (
          <span className="text-ink-dim">· {entries.length}</span>
        )}
      </button>

      {!collapsed && (
        <div className="rounded-md bg-bg-surface border border-line">
          {/* Existing entries */}
          {entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-stretch border-b border-line last:border-b-0 group"
            >
              <input
                value={entry.key}
                placeholder="property"
                readOnly={readOnly}
                spellCheck={false}
                className="w-[140px] flex-shrink-0 px-3 py-2 text-xs font-medium text-ink-mid bg-transparent outline-none border-r border-line"
                onChange={(e) => {
                  const next = [...entries]
                  next[i] = { ...next[i], key: e.target.value }
                  commit(next)
                }}
              />
              <input
                value={entry.value}
                placeholder="value"
                readOnly={readOnly}
                spellCheck={false}
                className="flex-1 px-3 py-2 text-xs text-ink-high bg-transparent outline-none"
                onChange={(e) => {
                  const next = [...entries]
                  next[i] = { ...next[i], value: e.target.value }
                  commit(next)
                }}
              />
              {!readOnly && (
                <button
                  type="button"
                  className="px-2 text-ink-dim opacity-0 group-hover:opacity-100 hover:text-ink-high transition-opacity"
                  onClick={() => commit(entries.filter((_, j) => j !== i))}
                  title="Remove property"
                >
                  <IconClose size={12} />
                </button>
              )}
            </div>
          ))}

          {/* Add property button (when not read-only) */}
          {!readOnly && (
            <button
              type="button"
              className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-ink-dim hover:text-ink-mid hover:bg-bg-hover transition-colors"
              onClick={() =>
                commit([...entries, { key: '', value: '' }])
              }
            >
              <IconPlus size={12} />
              <span>Add property</span>
            </button>
          )}

          {/* Empty-state hint when read-only and no entries */}
          {readOnly && entries.length === 0 && (
            <div className="px-3 py-2 text-xs text-ink-dim">No properties</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Coerce a user-typed string into the most appropriate YAML type.
 * - "true" / "false" → boolean
 * - integer-looking → number
 * - float-looking → number
 * - everything else → string
 */
function coerceValue(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null' || trimmed === '~') return null
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10)
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
  return trimmed
}
