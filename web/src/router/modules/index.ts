import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { telegramRoutes } from './telegram'
import { systemRoutes } from './system'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [dashboardRoutes, telegramRoutes, systemRoutes]
