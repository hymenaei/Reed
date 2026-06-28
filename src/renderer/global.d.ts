import type { MarkdownApi } from '../preload'

declare global {
  interface Window {
    api: MarkdownApi
  }
}

export {}
