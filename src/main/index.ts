import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createMainWindow, getMainWindow } from './window'
import { registerIpcHandlers } from './ipc-handlers'
import { recentsStore } from './recents-store'
import { prefsStore } from './prefs-store'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Single instance lock ────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', (_event, argv) => {
  const win = getMainWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
  // Try to open any file path passed as an argument to the second instance
  const fileArg = extractFileArg(argv)
  if (fileArg && win) {
    win.webContents.send('file:open-requested', fileArg)
  }
})

function extractFileArg(argv: string[]): string | null {
  for (const arg of argv.slice(1)) {
    if (arg && !arg.startsWith('--') && !arg.startsWith('-') && /\.md$/i.test(arg)) {
      return arg
    }
  }
  return null
}

// ── App lifecycle ──────────────────────────────────────────────────────
app.whenReady().then(() => {
  registerIpcHandlers()
  createMainWindow()

  // Open any file passed via command line on first launch
  const fileArg = extractFileArg(process.argv)
  if (fileArg) {
    const win = getMainWindow()
    win?.webContents.once('did-finish-load', () => {
      win.webContents.send('file:open-requested', fileArg)
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// External links open in user's default browser, not in-app
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
})

// Flush stores on quit
app.on('before-quit', () => {
  recentsStore.flush()
  prefsStore.flush()
})

export { __dirname }
