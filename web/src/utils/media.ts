/** Resolve a backend-owned /media path through the configured API prefix. */
export function resolveMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^(?:https?:|data:|blob:)/.test(path)) return path
  if (path.startsWith('/api/')) return path

  const apiBase = String(import.meta.env.VITE_API_URL || '/').replace(/\/$/, '')
  if (!apiBase) return `/api${path.startsWith('/') ? path : `/${path}`}`
  return `${apiBase}${path.startsWith('/') ? path : `/${path}`}`
}
