import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/main/index.ts') },
        external: ['electron-window-state']
      }
    },
    resolve: {
      alias: { '@main': resolve(__dirname, 'src/main') }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/preload/index.ts') }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/renderer/index.html') }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@components': resolve(__dirname, 'src/renderer/components'),
        '@lib': resolve(__dirname, 'src/renderer/lib'),
        '@hooks': resolve(__dirname, 'src/renderer/hooks'),
        '@store': resolve(__dirname, 'src/renderer/store')
      }
    },
    plugins: [react()]
  }
})
