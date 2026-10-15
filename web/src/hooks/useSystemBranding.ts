import { computed, onMounted, ref } from 'vue'
import AppConfig from '@/config'
import { fetchSystemBranding, type SystemBranding } from '@/api/system-manage'
import { resolveMediaUrl } from '@/utils/media'

const siteName = ref(AppConfig.systemInfo.name || 'DefaultBot')
const avatarUrl = ref('')
const watermarkEnabled = ref(true)
const watermarkText = ref('DefaultBot')
let activeRequest: Promise<SystemBranding> | null = null

export function applySystemBranding(branding: SystemBranding) {
  siteName.value = branding.siteName || 'DefaultBot'
  avatarUrl.value = branding.avatarPath
    ? resolveMediaUrl(`${branding.avatarPath}?v=${branding.updatedAt ?? Date.now()}`)
    : ''
  watermarkEnabled.value = branding.watermarkEnabled ?? true
  watermarkText.value = branding.watermarkText?.trim() || siteName.value
  const faviconPath = /^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/.test(branding.siteFavicon || '')
    ? branding.siteFavicon
    : '/favicon.ico'
  const favicon = faviconPath.startsWith('/media/') ? resolveMediaUrl(faviconPath) : faviconPath
  if (favicon) {
    const link =
      (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
      document.createElement('link')
    link.rel = 'shortcut icon'
    link.type = 'image/x-icon'
    link.href = favicon
    document.head.appendChild(link)
  }
  // Keep shared title helpers consistent while reactive layout components use refs.
  AppConfig.systemInfo.name = siteName.value
  const titleParts = document.title.split(' - ')
  document.title =
    titleParts.length > 1
      ? `${titleParts.slice(0, -1).join(' - ')} - ${siteName.value}`
      : siteName.value
  return branding
}

export function refreshSystemBranding() {
  if (!activeRequest) {
    activeRequest = fetchSystemBranding()
      .then(applySystemBranding)
      .finally(() => {
        activeRequest = null
      })
  }
  return activeRequest
}

export function useSystemBranding() {
  onMounted(() => {
    refreshSystemBranding().catch(() => undefined)
  })
  return {
    systemName: computed(() => siteName.value),
    systemAvatar: computed(() => avatarUrl.value),
    systemWatermarkEnabled: computed(() => watermarkEnabled.value),
    systemWatermarkText: computed(() => watermarkText.value)
  }
}
