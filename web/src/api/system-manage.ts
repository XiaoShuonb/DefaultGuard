import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus'
  })
}

export interface SystemBranding {
  siteName: string
  siteFavicon: string
  avatarPath: string | null
  watermarkEnabled: boolean
  watermarkText: string
  updatedAt: number | null
}

export function fetchSystemBranding() {
  return request.get<SystemBranding>({
    url: '/api/system/branding',
    showErrorMessage: false
  })
}
