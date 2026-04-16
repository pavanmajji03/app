import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    host: true, // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'fanzfolio.com',
      'www.fanzfolio.com',
      'quickstart-guide-6.cluster-8.preview.emergentcf.cloud',
      'quickstart-guide-6.preview.emergentagent.com',
      '.preview.emergentagent.com',
      '.emergentcf.cloud'
    ],
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
})