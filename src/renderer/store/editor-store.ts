import { create } from 'zustand'
import type { RecentFile, AppPreferences } from '../../shared/types'

interface EditorState {
  // File
  filePath: string | null
  fileName: string | null
  isNew: boolean
  dirty: boolean

  // Recents
  recents: RecentFile[]

  // Prefs
  prefs: AppPreferences | null

  // UI
  paletteOpen: boolean
  recentsOpen: boolean
  isMaximized: boolean

  // Stats (set by editor hook)
  stats: { words: number; chars: number; readingTimeMin: number }

  // Actions
  setFile: (path: string | null, name: string | null, isNew: boolean) => void
  setDirty: (dirty: boolean) => void
  setRecents: (recents: RecentFile[]) => void
  setPrefs: (prefs: AppPreferences) => void
  setPaletteOpen: (open: boolean) => void
  setRecentsOpen: (open: boolean) => void
  setMaximized: (m: boolean) => void
  setStats: (s: { words: number; chars: number; readingTimeMin: number }) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  filePath: null,
  fileName: null,
  isNew: false,
  dirty: false,
  recents: [],
  prefs: null,
  paletteOpen: false,
  recentsOpen: false,
  isMaximized: false,
  stats: { words: 0, chars: 0, readingTimeMin: 0 },

  setFile: (path, name, isNew) =>
    set({ filePath: path, fileName: name, isNew, dirty: false }),
  setDirty: (dirty) => set({ dirty }),
  setRecents: (recents) => set({ recents }),
  setPrefs: (prefs) => set({ prefs }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setRecentsOpen: (recentsOpen) => set({ recentsOpen }),
  setMaximized: (isMaximized) => set({ isMaximized }),
  setStats: (stats) => set({ stats })
}))
