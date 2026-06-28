import { parse, stringify } from 'yaml'

/**
 * Split a Markdown document into (frontmatter, body).
 * Frontmatter is a YAML block delimited by leading `---\n ... \n---`.
 */
export function splitFrontmatter(raw: string): { frontmatter: Record<string, unknown> | null; body: string } {
  const match = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { frontmatter: null, body: raw }
  const yamlBlock = match[1]
  const body = raw.slice(match[0].length)
  try {
    const parsed = parse(yamlBlock)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { frontmatter: parsed as Record<string, unknown>, body }
    }
  } catch {
    // Invalid YAML — treat as no frontmatter, keep raw body
  }
  return { frontmatter: null, body: raw }
}

/**
 * Reassemble frontmatter + body into a single Markdown string.
 */
export function joinFrontmatter(frontmatter: Record<string, unknown> | null, body: string): string {
  if (!frontmatter || Object.keys(frontmatter).length === 0) return body
  const yamlStr = stringify(frontmatter).trimEnd()
  return `---\n${yamlStr}\n---\n\n${body.replace(/^\s+/, '')}`
}

/**
 * Compute word count, character count, and reading time (200 wpm) from a
 * Markdown body string. Frontmatter is excluded from the count.
 */
export function computeStats(body: string): { words: number; chars: number; readingTimeMin: number } {
  // Strip code blocks (don't count code as prose)
  const stripped = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
  const words = (stripped.match(/\b[\w'-]+\b/g) ?? []).length
  const chars = body.length
  const readingTimeMin = Math.max(1, Math.round(words / 200))
  return { words, chars, readingTimeMin }
}
