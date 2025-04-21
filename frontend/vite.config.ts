import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  console.log({ viteEnv: env.VITE_ENV })

  const isDev = env.VITE_ENV === 'development'

  const manifest = defineManifest({
    manifest_version: 3,
    name: 'Subtitle Translator',
    version: '0.1.0',
    permissions: ['storage', 'activeTab', 'scripting'],
    // Breaks HMR in dev mode if we don't allow all urls.
    // Long term TODO: bump crxjs version when changes from this PR is released: https://github.com/crxjs/chrome-extension-tools/pull/999
    host_permissions: isDev ? ['<all_urls>'] : ['https://www.youtube.com/*'],

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

  return {
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
  }
})
