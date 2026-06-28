/**
 * Lightweight fuzzy matcher inspired by Sublime Text / Raycast.
 * Score is based on:
 *  - consecutive character matches
 *  - matches at word boundaries (space, slash, hyphen, camelCase)
 *  - earlier matches score higher
 *
 * Returns a score (>0 means match) and indices of matched chars for highlighting.
 */
export interface FuzzyResult {
  score: number
  indices: number[]
}

export function fuzzyMatch(query: string, target: string): FuzzyResult | null {
  if (!query) return { score: 1, indices: [] }
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  let qi = 0
  let score = 0
  let consecutive = 0
  let prevWasBoundary = true
  const indices: number[] = []

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    const tc = t[ti]
    const isBoundary = ti === 0 || /[\s\-_/.\\]/.test(t[ti - 1] ?? '') || (
      // camelCase boundary
      t[ti - 1] !== undefined && t[ti - 1] === t[ti - 1].toLowerCase() && tc === tc.toUpperCase() && /[a-z]/i.test(tc)
    )

    if (tc === q[qi]) {
      indices.push(ti)
      let bonus = 1
      if (isBoundary || prevWasBoundary) bonus += 6
      if (ti === qi) bonus += 2 // same positional alignment
      consecutive = prevWasBoundary ? 1 : consecutive + 1
      bonus += consecutive * 2
      score += bonus
      qi++
      prevWasBoundary = false
    } else {
      prevWasBoundary = isBoundary
      consecutive = 0
      // small penalty for skipped chars
      score -= 0.1
    }
  }

  if (qi < q.length) return null
  // Slight bonus for shorter targets (less to search)
  score += Math.max(0, 10 - t.length * 0.05)
  return { score, indices }
}

export interface RankedItem<T> {
  item: T
  score: number
  indices: number[]
}

/**
 * Rank a list of items by fuzzy match against a string returned by `getText`.
 * Only items with a non-null match are returned, sorted by score desc.
 */
export function fuzzyRank<T>(items: T[], query: string, getText: (item: T) => string): RankedItem<T>[] {
  if (!query.trim()) {
    return items.map((item, i) => ({ item, score: -i, indices: [] as number[] }))
  }
  const results: RankedItem<T>[] = []
  for (const item of items) {
    const r = fuzzyMatch(query, getText(item))
    if (r && r.score > 0) {
      results.push({ item, score: r.score, indices: r.indices })
    }
  }
  results.sort((a, b) => b.score - a.score)
  return results
}
