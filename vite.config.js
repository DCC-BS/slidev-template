import { defineConfig } from 'vite'
import slidevClicks from 'slidev-clicks/vite-plugin'

export default defineConfig({
  plugins: [
    slidevClicks()
  ]
})