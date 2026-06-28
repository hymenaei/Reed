# Reed

A minimal Windows-only Markdown viewer/editor built on **Electron + React + TipTap + electron-vite**.

## Design language

- Dark theme inspired by `miguelsolorio/min-theme`: near-black backgrounds (`#0d0d0d` / `#111`), muted warm-gray surfaces
- Icons exclusively from `miguelsolorio/symbols` (bundled as inline SVGs in `src/renderer/components/icons.tsx`)
- UI personality: Notion's calm document focus + Raycast's tight spacing and instant command palette + Auorum's systematic component language
- No scrollbars unless hovered; no window chrome beyond a custom slim titlebar

## Architecture decisions

| Concern       | Decision                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storage model | Recents only — no vault concept. Drag-and-drop is the primary open method; a slim rail button on the left edge opens a Recents popover.                                    |
| Doc format    | Markdown round-trip. `.md` files on disk, TipTap JSON ↔ GFM via `tiptap-markdown`.                                                                                         |
| Palette scope | Raycast-style everything: recent files + file ops + editor commands (bold, insert table, etc.) + app commands (theme, reader mode, reload). Fuzzy match with highlighting. |
| Side panels   | None. Editor + palette only — maximum focus mode.                                                                                                                          |
| Titlebar      | Mac-Typora-style frameless bar: file name (left), word/char/read-time stats (center), action buttons + Windows min/max/close (right). No bottom status bar.                |
| Distribution  | NSIS installer via electron-builder.                                                                                                                                       |

## Project layout

```
src/
├── main/                  # Electron main process
│   ├── index.ts           # App lifecycle, single-instance lock
│   ├── window.ts          # Frameless BrowserWindow, persisted window state
│   ├── ipc-handlers.ts    # File dialogs, recents, prefs, window controls
│   ├── recents-store.ts   # Recent-files JSON store under userData
│   └── prefs-store.ts     # User preferences (theme, lastOpenPath)
├── preload/
│   └── index.ts           # Secure contextBridge → window.api
├── shared/
│   └── types.ts           # IPC channel names + shared types
└── renderer/              # React + TipTap
    ├── App.tsx            # Top-level wiring, keyboard shortcuts, autosave
    ├── components/
    │   ├── Titlebar.tsx
    │   ├── Editor.tsx          # TipTap with GFM extensions
    │   ├── FrontmatterBlock.tsx  # Notion-style YAML property block
    │   ├── CommandPalette.tsx    # Raycast-style fuzzy palette
    │   ├── RecentsRail.tsx       # Left-edge side tab + popover
    │   ├── DropZone.tsx          # Full-window drag-drop overlay
    │   ├── EmptyState.tsx
    │   └── icons.tsx             # miguelsolorio/symbols-styled SVGs
    ├── hooks/
    │   └── useDebounced.ts
    ├── lib/
    │   ├── markdown.ts          # Frontmatter split/join + stats
    │   ├── fuzzy.ts             # Sublime/Raycast-style fuzzy matcher
    │   └── commands.ts          # Command registry for palette
    └── store/
        └── editor-store.ts      # Zustand global store
```

## Getting started

### Prerequisites

- Node.js ≥ 20
- Windows 10/11 (build target); dev runs on any OS for testing

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Launches electron-vite dev server with HMR for the renderer.

### Typecheck

```bash
npm run typecheck
```

### Build installers (Windows)

```bash
npm run build:win
```

Outputs an NSIS installer under `dist/Markdown Editor-Setup-0.1.0.exe`.

## Keyboard shortcuts

| Shortcut            | Action                  |
| ------------------- | ----------------------- |
| `Ctrl+K`            | Toggle command palette  |
| `Ctrl+R`            | Toggle recents popover  |
| `Ctrl+O`            | Open file dialog        |
| `Ctrl+N`            | New untitled file       |
| `Ctrl+S`            | Save (Save As if new)   |
| `Ctrl+Shift+S`      | Save As                 |
| `Ctrl+B`            | Bold                    |
| `Ctrl+I`            | Italic                  |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo             |
| `Ctrl+Shift+R`      | Reload window           |
| `Esc`               | Close palette / popover |

## Features

### Editor

- TipTap with StarterKit (paragraphs, headings, lists, blockquotes, hr, bold/italic/strike/code)
- GFM tables (Table / TableRow / TableCell / TableHeader)
- Task lists (TaskList / TaskItem with nested support)
- Fenced code blocks with syntax highlighting via `lowlight` (common languages)
- Inline links via `@tiptap/extension-link`
- Character count via `@tiptap/extension-character-count`
- Markdown serialization round-trip via `tiptap-markdown`

### Frontmatter

YAML frontmatter (`---\n...\n---`) is parsed on file open and rendered as a Notion-style property block above the editor body. Edit key/value pairs inline; values are coerced to booleans/numbers/null/strings on save. Frontmatter is excluded from word/char/read-time stats.

### Autosave

Debounced (1.2 s after last keystroke). Only fires for files that exist on disk; untitled documents require an explicit Save / Save As.

### Window state

Window size, position, and maximized state persist across launches via `electron-window-state`. The last-opened file path is also persisted and re-opened on next launch.

### Single-instance lock

`app.requestSingleInstanceLock()` — second launch attempts focus the existing window and forward any `.md` argument to it.

### Drag-and-drop

Drop a `.md` / `.markdown` / `.mdx` file anywhere on the window to open it. A full-window overlay appears during drag-over.

## Distribution

`electron-builder.yml` is configured for Windows x64 NSIS only:

- Per-user install (no admin required by default)
- Allows install directory customization
- Creates Start Menu + Desktop shortcuts
- Uninstaller preserves user data (recent files, preferences, window state)

## Customizing icons

All icons live in `src/renderer/components/icons.tsx` and follow the miguelsolorio/symbols visual language: 16px optical grid, 1.5px stroke, square caps. To add a new icon, add a new exported component following the same pattern.
