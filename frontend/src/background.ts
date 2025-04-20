// background.ts

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL! // e.g. "https://api.mytranslator.app"
const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN! // set via .env or define in vite.config.ts

console.log('[Service Worker] Background service worker initialized.')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Service Worker] Background script installed.')
})

// Listen for incoming messages from the content script
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('[Service worker] Service worker received message')
  if (message.type === 'NEW_CAPTION') {
    const originalText = message.text
    const targetLang = 'fr' // hardcoded for now; later, pull from user settings

    console.log('[Service Worker] Received caption:', originalText)

    // Call translation backend
    translateText(originalText, targetLang)
      .then((translated) => {
        // Send message back to the content script
        if (sender.tab?.id !== undefined) {
          console.log('content script received payload from service worker', {
            translated,
          })
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'TRANSLATED_CAPTION',
            text: translated,
          })
        }
      })
      .catch((err) =>
        console.error('[Service Worker] Translation failed:', err),
      )
  }

  // Returning true indicates we want to use sendResponse asynchronously
  return true
})

/**
 * Call your backend or translation API.
 * Replace this with a call to your Go server later.
 */
async function translateText(
  text: string,
  targetLang: string,
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/translate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BACKEND_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLang,
    }),
  })

  const data = await response.json()
  console.log('payload fetched from backend: ', data)
  const translated = data.Translation?.trim()

  return translated || '[Translation failed]'
}
