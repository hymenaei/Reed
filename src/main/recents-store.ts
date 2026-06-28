import { app } from 'electron'
import { resolve } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import type { RecentFile } from '../shared/types'

/**
 * Persists recent-files list to disk as JSON.
 * Lives under app.getPath('userData') / recent-files.json
 */
class RecentsStore {
  private filePath: string
  private recents: RecentFile[] = []
  private dirty = false

  constructor() {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.filePath = resolve(dir, 'recent-files.json')
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf8')
        const parsed = JSON.parse(raw) as RecentFile[]
        if (Array.isArray(parsed)) {
          this.recents = parsed.filter((r) => r && typeof r.path === 'string')
        }
      }
    } catch {
      this.recents = []
    }
  }

  list(): RecentFile[] {
    return [...this.recents]
  }

  add(path: string, name: string): RecentFile[] {
    // De-duplicate by path, bump to top
    const filtered = this.recents.filter((r) => r.path !== path)
    const entry: RecentFile = {
      path,
      name,
      openedAt: new Date().toISOString()
    }
    this.recents = [entry, ...filtered].slice(0, 25)
    this.dirty = true
    this.flush()
    return [...this.recents]
  }

  remove(path: string): RecentFile[] {
    this.recents = this.recents.filter((r) => r.path !== path)
    this.dirty = true
    this.flush()
    return [...this.recents]
  }

  clear(): RecentFile[] {
    this.recents = []
    this.dirty = true
    this.flush()
    return []
  }

  flush(): void {
    if (!this.dirty) return
    try {
      writeFileSync(this.filePath, JSON.stringify(this.recents, null, 2), 'utf8')
      this.dirty = false
    } catch (err) {
      console.error('[recents] flush failed', err)
    }
  }
}

export const recentsStore = new RecentsStore()
