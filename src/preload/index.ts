import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type { FileContent, RecentFile, AppPreferences } from '../shared/types'

/**
 * Secure IPC bridge exposed to the renderer as `window.api`.
 * Only the explicitly-listed methods are reachable from the renderer.
 */
const api = {
  // ── File ──────────────────────────────────────────────────────────────
  openFileDialog: (): Promise<FileContent | null> =>
    ipcRenderer.invoke(IPC.FILE_OPEN_DIALOG),
  saveFileDialog: (name: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC.FILE_SAVE_DIALOG, name),
  readFile: (path: string): Promise<FileContent> =>
    ipcRenderer.invoke(IPC.FILE_READ, path),
  writeFile: (path: string, content: string): Promise<{ path: string }> =>
    ipcRenderer.invoke(IPC.FILE_WRITE, { path, content }),

  // ── Recents ───────────────────────────────────────────────────────────
  listRecents: (): Promise<RecentFile[]> => ipcRenderer.invoke(IPC.RECENTS_LIST),
  addRecent: (path: string, name: string): Promise<RecentFile[]> =>
    ipcRenderer.invoke(IPC.RECENTS_ADD, path, name),
  removeRecent: (path: string): Promise<RecentFile[]> =>
    ipcRenderer.invoke(IPC.RECENTS_REMOVE, path),
  clearRecents: (): Promise<RecentFile[]> => ipcRenderer.invoke(IPC.RECENTS_CLEAR),

  // ── Window ────────────────────────────────────────────────────────────
  minimize: (): void => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  toggleMaximize: (): void => ipcRenderer.send(IPC.WINDOW_MAXIMIZE_TOGGLE),
  close: (): void => ipcRenderer.send(IPC.WINDOW_CLOSE),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW_IS_MAXIMIZED),
  onMaximizedChanged: (cb: (maximized: boolean) => void): (() => void) => {
    const listener = (_e: unknown, value: boolean): void => cb(value)
    ipcRenderer.on(IPC.WINDOW_MAXIMIZED_CHANGED, listener)
    return () => ipcRenderer.off(IPC.WINDOW_MAXIMIZED_CHANGED, listener)
  },

  // ── Preferences ───────────────────────────────────────────────────────
  getPrefs: (): Promise<AppPreferences> => ipcRenderer.invoke(IPC.PREFS_GET),
  setPrefs: (patch: Partial<AppPreferences>): Promise<AppPreferences> =>
    ipcRenderer.invoke(IPC.PREFS_SET, patch),

  // ── Main → renderer events ────────────────────────────────────────────
  onFileOpenRequested: (cb: (path: string) => void): (() => void) => {
    const listener = (_e: unknown, path: string): void => cb(path)
    ipcRenderer.on(IPC.FILE_OPEN_REQUESTED, listener)
    return () => ipcRenderer.off(IPC.FILE_OPEN_REQUESTED, listener)
  }
}

export type MarkdownApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error('[preload] contextBridge failed', err)
  }
} else {
  // Fallback (not used — contextIsolation is always on in our config)
  ;(globalThis as unknown as { api: MarkdownApi }).api = api
}
