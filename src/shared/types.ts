/**
 * Shared types used by main, preload, and renderer.
 * Kept framework-agnostic so it can be imported from both Node and web contexts.
 */

export interface RecentFile {
  path: string
  name: string
  /** ISO timestamp of last open */
  openedAt: string
}

export interface FileContent {
  path: string
  name: string
  content: string
  /** True when the file was newly created (untitled) and not yet saved to disk */
  isNew: boolean
}

export interface WindowBounds {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized?: boolean
}

export interface AppPreferences {
  theme: 'dark' | 'light'
  lastOpenPath?: string | null
}

export interface SaveOptions {
  path: string
  content: string
}

/**
 * IPC channel names — kept here so main and preload reference the same strings.
 */
export const IPC = {
  // File operations
  FILE_OPEN_DIALOG: 'file:open-dialog',
  FILE_SAVE_DIALOG: 'file:save-dialog',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  // Recents
  RECENTS_LIST: 'recents:list',
  RECENTS_ADD: 'recents:add',
  RECENTS_CLEAR: 'recents:clear',
  RECENTS_REMOVE: 'recents:remove',
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE_TOGGLE: 'window:maximize-toggle',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
  WINDOW_MAXIMIZED_CHANGED: 'window:maximized-changed',
  // Preferences
  PREFS_GET: 'prefs:get',
  PREFS_SET: 'prefs:set',
  // File events from main → renderer (e.g. drag-drop, file argument)
  FILE_OPEN_REQUESTED: 'file:open-requested'
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]
