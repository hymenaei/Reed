import { useEffect } from 'react'
import { useEditorStore } from '../store/editor-store'
import { splitFrontmatter, computeStats } from '../lib/markdown'

/**
 * Watch the editor's markdown content and update word/char/reading-time stats
 * in the global store. Stats are computed from the body only (frontmatter excluded).
 *
 * `getContent` should return the current raw markdown string from the editor.
 */
export function useDocumentStats(getContent: () => string, deps: unknown[]): void {
  const setStats = useEditorStore((s) => s.setStats)

  useEffect(() => {
    const raw = getContent()
    const { body } = splitFrontmatter(raw)
    setStats(computeStats(body))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
