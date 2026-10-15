import type { Router } from 'vue-router'

const RELOAD_MARKER = 'defaultbot:asset-recovery-at'
const RELOAD_COOLDOWN_MS = 30_000

function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed|ChunkLoadError/i.test(
    message
  )
}

function reloadWithCurrentAssets(): void {
  const now = Date.now()
  let previous = 0
  try {
    previous = Number(sessionStorage.getItem(RELOAD_MARKER) ?? 0)
  } catch {
    // Private browsing or a restricted WebView may disable session storage.
  }
  if (now - previous < RELOAD_COOLDOWN_MS) return

  try {
    sessionStorage.setItem(RELOAD_MARKER, String(now))
  } catch {
    // Reload still works when storage is unavailable.
  }
  window.location.reload()
}

/**
 * A user may keep the administrator page open while a new Docker Web image is
 * deployed. Its old runtime then points at hashed lazy chunks that no longer
 * exist in the new image. Vite emits preloadError for that condition; the
 * router fallback covers browsers that only surface the rejected import.
 */
export function setupChunkRecovery(router: Router): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    reloadWithCurrentAssets()
  })

  router.onError((error) => {
    if (isStaleChunkError(error)) reloadWithCurrentAssets()
  })

  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RELOAD_MARKER)
    } catch {
      // No persistent state is required for this one-time recovery marker.
    }
  }, RELOAD_COOLDOWN_MS)
}
