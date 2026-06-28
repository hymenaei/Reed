import { app } from 'electron'
import { resolve } from 'node:path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import type { AppPreferences } from '../shared/types'

const DEFAULTS: AppPreferences = {
  theme: 'dark',
  lastOpenPath: null
}

class PrefsStore {
  private filePath: string
  private prefs: AppPreferences = { ...DEFAULTS }
  private dirty = false

  constructor() {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.filePath = resolve(dir, 'preferences.json')
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf8')
        const parsed = JSON.parse(raw) as Partial<AppPreferences>
        this.prefs = { ...DEFAULTS, ...parsed }
      }
    } catch {
      this.prefs = { ...DEFAULTS }
    }
  }

  get(): AppPreferences {
    return { ...this.prefs }
  }

  set(patch: Partial<AppPreferences>): AppPreferences {
    this.prefs = { ...this.prefs, ...patch }
    this.dirty = true
    this.flush()
    return this.get()
  }

  flush(): void {
    if (!this.dirty) return
    try {
      writeFileSync(this.filePath, JSON.stringify(this.prefs, null, 2), 'utf8')
      this.dirty = false
    } catch (err) {
      console.error('[prefs] flush failed', err)
    }
  }
}

export const prefsStore = new PrefsStore()
