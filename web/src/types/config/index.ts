/**
 * 配置类型定义模块
 *
 * 提供系统配置相关的类型定义
 *
 * ## 主要功能
 *
 * - 主题设置类型
 * - 菜单布局类型
 * - 节日配置类型
 * - 系统基础配置类型
 * - 快速入口配置类型
 * - 顶部栏功能配置类型
 * - 环境配置类型
 * - 应用配置类型
 *
 * ## 使用场景
 *
 * - 系统配置文件类型约束
 * - 配置项类型定义
 * - 配置数据验证
 *
 * @module types/config/index
 */

import { MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { MenuThemeType, SystemThemeTypes } from '@/types/store'

interface ThemeSetting {
  name: string
  theme: SystemThemeEnum
  color: string[]
  leftLineColor: string
  rightLineColor: string
  img: string
}

interface MenuLayout {
  name: string
  value: MenuTypeEnum
  img: string
}

// 系统基础配置
interface SystemBasicConfig {
  // 系统名称
  name: string
  // 系统描述
  description?: string
  // 系统logo
  logo?: string
  // 系统favicon
  favicon?: string
  // 版权信息
  copyright?: string
}

// 系统配置
export interface SystemConfig {
  // 系统基础信息
  systemInfo: SystemBasicConfig
  // 系统主题样式
  systemThemeStyles: SystemThemeTypes
  // 设置中心主题列表
  settingThemeList: ThemeSetting[]
  // 菜单布局列表
  menuLayoutList: MenuLayout[]
  // 主题列表
  themeList: MenuThemeType[]
  // 暗色菜单样式
  darkMenuStyles: MenuThemeType[]
  // 系统主色调
  systemMainColor: readonly string[]
}
