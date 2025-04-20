// content-script.ts

let lastCaptionText = ''

/**
 * Observe YouTube's caption container for changes.
 * Whenever new captions appear, extract the text and send it to the background script.
 */
function observeCaptions() {
  const captionContainer = document.querySelector(
    '.ytp-caption-window-container',
  )

  if (!captionContainer) {
    // Wait until captions are available (sometimes captions appear after playback starts)
    setTimeout(observeCaptions, 1000)
    return
  }

  const observer = new MutationObserver(() => {
    console.log('Mutation obsever triggered')
    const captionSpans = captionContainer.querySelectorAll(
      '.ytp-caption-segment',
    )

    const currentText = Array.from(captionSpans)
      .map((span) => span.textContent?.trim())
      .filter(Boolean)
      .join(' ')

    if (currentText && currentText !== lastCaptionText) {
      lastCaptionText = currentText
      console.debug('[Content Script] Caption detected:', currentText)

      // Send caption to background script
      chrome.runtime.sendMessage({
        type: 'NEW_CAPTION',
        text: currentText,
      })
    }
  })

  observer.observe(captionContainer, {
    childList: true,
    subtree: true,
  })

  console.log('[Content Script] Caption observer attached.')
}

// Inject our custom div for translated captions
function injectTranslationOverlay() {
  console.log('[Content Script] Injecting translation overlay')
  const existing = document.getElementById('translated-captions')
  if (existing) return

  const overlay = document.createElement('div')
  overlay.id = 'translated-captions'
  overlay.style.position = 'absolute'
  overlay.style.bottom = '10%'
  overlay.style.left = '50%'
  overlay.style.transform = 'translateX(-50%)'
  overlay.style.fontSize = '16px'
  overlay.style.color = '#aaf'
  overlay.style.textShadow = '1px 1px 2px black'
  overlay.style.zIndex = '9999'
  overlay.style.pointerEvents = 'none'

  // document.body.appendChild(overlay)
  const captionContainer = document.querySelector(
    '.ytp-caption-window-container',
  )
  captionContainer?.appendChild(overlay)
}

// Listen for translated caption from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRANSLATED_CAPTION') {
    const overlay = document.getElementById('translated-captions')
    if (overlay) {
      overlay.textContent = message.text
    }
  }

  return true
})

// Entry point
function init() {
  console.log('[Content Script] Initializing content script...')
  injectTranslationOverlay()
  observeCaptions()
}

// Ensure the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
