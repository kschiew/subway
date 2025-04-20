import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'Subtitle Translator',
  version: '0.1.0',
  permissions: ['storage', 'activeTab', 'scripting'],
  // Breaks HMR in dev mode.
  // Short term TODO: Dynamically set this value based on env
  // Long term TODO: bump crxjs version when changes from this PR is released: https://github.com/crxjs/chrome-extension-tools/pull/999
  // host_permissions: ['https://www.youtube.com/*', 'http://localhost:5173'],
  host_permissions: ['<all_urls>'],
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['src/content-script.ts'],
    },
  ],
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  legacy: {
    skipWebSocketTokenCheck: true, // If unset, HMR dev mode breaks. See https://github.com/crxjs/chrome-extension-tools/issues/971#issuecomment-2608871639
    // TODO: bump crxjs version when changes from this PR is released: https://github.com/crxjs/chrome-extension-tools/pull/999
  },
  server: {
    // Port number needs to be explicitly set for HMR websockets, because in chrome extensions theres no localhost and port number
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
  },
})
