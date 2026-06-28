import { BrowserWindow, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import windowStateKeeper from 'electron-window-state'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Preload must be required as a string path; electron-vite emits it to out/preload/index.mjs
// (ESM output because package.json has "type": "module").
const PRELOAD_PATH = resolve(__dirname, '../preload/index.mjs')

let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createMainWindow(): BrowserWindow {
  // Persist window state across launches (size, position, maximized)
  const state = windowStateKeeper({
    defaultWidth: 1080,
    defaultHeight: 720,
    file: 'window-state.json'
  })

  const win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 560,
    minHeight: 400,
    backgroundColor: '#1f1f1f',
    frame: false, // Frameless — custom titlebar
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: PRELOAD_PATH,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  })

  // Wire window state persistence
  state.manage(win)

  win.once('ready-to-show', () => {
    win.show()
    if (state.isMaximized) {
      win.maximize()
    }
  })

  // Keep renderer informed of maximize/unmaximize for button icon swap
  win.on('maximize', () => win.webContents.send('window:maximized-changed', true))
  win.on('unmaximize', () => win.webContents.send('window:maximized-changed', false))

  // External links open in browser, not in-app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Prevent in-window navigation from drag-drop "open as URL" behaviour
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault()
    }
  })

  // electron-vite injects ELECTRON_RENDERER_URL in dev; load built file in prod
  if (process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(resolve(__dirname, '../renderer/index.html'))
  }

  mainWindow = win
  return win
}
