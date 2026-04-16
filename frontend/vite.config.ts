import { defineConfig } from 'vite'
import path from 'path'
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
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    strictPort: true,
    allowedHosts: [
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
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
