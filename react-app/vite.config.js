import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Custom plugin to serve and copy JSON data files
    {
      name: 'serve-json-data',
      configureServer(server) {
        // Serve JSON files during development
        server.middlewares.use('/data/json', (req, res, next) => {
          const filePath = path.resolve(__dirname, '../data/json', req.url.slice(1))
          if (fs.existsSync(filePath) && filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(filePath, 'utf-8'))
          } else {
            next()
          }
        })
      },
      closeBundle() {
        const srcDir = path.resolve(__dirname, '../data/json')
        const destDir = path.resolve(__dirname, 'dist/data/json')

        // Create destination directory
        fs.mkdirSync(destDir, { recursive: true })

        // Copy all JSON files
        const files = fs.readdirSync(srcDir)
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.copyFileSync(
              path.join(srcDir, file),
              path.join(destDir, file)
            )
          }
        }
        console.log('Copied JSON data files to dist/data/json')
      },
    },
  ],
  server: {
    fs: {
      // Allow serving files from the root data directory
      allow: ['..'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    testTimeout: 10000,
    fileParallelism: false,
  },
})
