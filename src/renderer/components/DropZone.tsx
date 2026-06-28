import { useEffect, useState } from 'react'
import { IconFile } from './icons'

interface DropZoneProps {
  onDropFile: (path: string) => void
}

/**
 * Full-window overlay shown while the user drags a file over the window.
 * Hidden by default; appears on first `dragenter` and disappears on `dragleave`/`drop`.
 *
 * Listens at the document level so the drop target is anywhere in the window.
 */
export function DropZone({ onDropFile }: DropZoneProps) {
  const [active, setActive] = useState(false)
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    function onDragEnter(e: DragEvent): void {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      setCounter((c) => c + 1)
      setActive(true)
    }
    function onDragOver(e: DragEvent): void {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
    function onDragLeave(e: DragEvent): void {
      if (!e.dataTransfer?.types?.includes('Files')) return
      e.preventDefault()
      setCounter((c) => {
        const next = c - 1
        if (next <= 0) setActive(false)
        return Math.max(0, next)
      })
    }
    function onDrop(e: DragEvent): void {
      if (!e.dataTransfer?.files?.length) return
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      // Electron exposes `path` on File objects dropped from the OS.
      // In modern Electron (>=32) use webUtils.getPathForFile instead.
      const path = (file as File & { path?: string }).path
      if (path && /\.md$/i.test(path)) {
        onDropFile(path)
      } else if (path) {
        // Non-markdown file dropped — ignore silently
      }
      setActive(false)
      setCounter(0)
    }

    document.addEventListener('dragenter', onDragEnter)
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('drop', onDrop)
    return () => {
      document.removeEventListener('dragenter', onDragEnter)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop', onDrop)
    }
  }, [onDropFile])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="w-[min(440px,80vw)] h-[min(280px,60vh)] border-2 border-dashed border-accent/60 rounded-xl flex flex-col items-center justify-center gap-3 bg-bg-surface/80 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <IconFile size={24} />
        </div>
        <div className="text-base text-ink-high font-medium">Drop Markdown file to open</div>
        <div className="text-2xs text-ink-low">.md · .markdown · .mdx</div>
      </div>
    </div>
  )
}
