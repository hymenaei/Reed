import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import { IPC } from '../shared/types'
import type { FileContent, RecentFile, AppPreferences } from '../shared/types'
import { recentsStore } from './recents-store'
import { prefsStore } from './prefs-store'
import { getMainWindow } from './window'

const MD_FILTERS = [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] }]

export function registerIpcHandlers(): void {
  // ── File dialogs ──────────────────────────────────────────────────────
  ipcMain.handle(IPC.FILE_OPEN_DIALOG, async (event): Promise<FileContent | null> => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? getMainWindow()
    const result = await dialog.showOpenDialog(win!, {
      title: 'Open Markdown',
      filters: MD_FILTERS,
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const path = result.filePaths[0]
    return readFileIntoFileContent(path)
  })

  ipcMain.handle(IPC.FILE_SAVE_DIALOG, async (event, name: string): Promise<string | null> => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? getMainWindow()
    const result = await dialog.showSaveDialog(win!, {
      title: 'Save Markdown',
      defaultPath: name || 'untitled.md',
      filters: MD_FILTERS
    })
    if (result.canceled) return null
    return result.filePath
  })

  ipcMain.handle(IPC.FILE_READ, async (_e, path: string): Promise<FileContent> => {
    return readFileIntoFileContent(path)
  })

  ipcMain.handle(IPC.FILE_WRITE, async (_e, opts: { path: string; content: string }): Promise<{ path: string }> => {
    writeFileSync(opts.path, opts.content, 'utf8')
    return { path: opts.path }
  })

  // ── Recents ───────────────────────────────────────────────────────────
  ipcMain.handle(IPC.RECENTS_LIST, (): RecentFile[] => recentsStore.list())
  ipcMain.handle(IPC.RECENTS_ADD, (_e, path: string, name: string): RecentFile[] =>
    recentsStore.add(path, name)
  )
  ipcMain.handle(IPC.RECENTS_REMOVE, (_e, path: string): RecentFile[] =>
    recentsStore.remove(path)
  )
  ipcMain.handle(IPC.RECENTS_CLEAR, (): RecentFile[] => recentsStore.clear())

  // ── Window controls ───────────────────────────────────────────────────
  ipcMain.on(IPC.WINDOW_MINIMIZE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.on(IPC.WINDOW_MAXIMIZE_TOGGLE, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on(IPC.WINDOW_CLOSE, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
  ipcMain.handle(IPC.WINDOW_IS_MAXIMIZED, (event): boolean => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  // ── Preferences ───────────────────────────────────────────────────────
  ipcMain.handle(IPC.PREFS_GET, (): AppPreferences => prefsStore.get())
  ipcMain.handle(IPC.PREFS_SET, (_e, patch: Partial<AppPreferences>): AppPreferences =>
    prefsStore.set(patch)
  )
}

function readFileIntoFileContent(path: string): FileContent {
  const content = readFileSync(path, 'utf8')
  // Add to recents
  recentsStore.add(path, basename(path))
  prefsStore.set({ lastOpenPath: path })
  return {
    path,
    name: basename(path),
    content,
    isNew: false
  }
}

// Used by drag-drop handler in window.ts (registered as a one-off IPC listener)
// Kept here so all file-reading logic lives in one place.
export function openPathInRenderer(path: string): void {
  // Validate path exists and is a file
  try {
    const stat = statSync(path)
    if (!stat.isFile()) return
  } catch {
    return
  }
  const win = getMainWindow()
  win?.webContents.send(IPC.FILE_OPEN_REQUESTED, path)
}
