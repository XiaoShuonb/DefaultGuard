/**
 * Store 状态类型定义模块
 *
 * 提供 Pinia Store 的状态类型定义
 *
 * ## 主要功能
 *
 * - 系统主题类型
 * - 菜单主题类型
 * - 设置状态类型
 * - 工作标签页类型
 * - 用户状态类型
 * - 菜单状态类型
 * - 根状态类型
 *
 * ## 使用场景
 *
 * - Store 状态类型约束
 * - 状态数据结构定义
 * - 类型提示和自动补全
 *
 * @module types/store/index
 */

import { MenuThemeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { LocationQueryRaw } from 'vue-router'

// 系统主题样式（light | dark）
interface SystemThemeType {
  /** 主题类名 */
  className: string
}

// 定义包含多个主题的类型
export type SystemThemeTypes = {
  [key in Exclude<SystemThemeEnum, SystemThemeEnum.AUTO>]: SystemThemeType
}

// 菜单主题样式
export interface MenuThemeType {
  /** 主题类型 */
  theme: MenuThemeEnum
  /** 背景颜色 */
  background: string
  /** 系统名称颜色 */
  systemNameColor: string
  /** 文本颜色 */
  textColor: string
  /** 图标颜色 */
  iconColor: string
  /** 背景图片 */
  img?: string
}

// 多标签
export interface WorkTab {
  /** 标签标题 */
  title: string
  /** 自定义标题 */
  customTitle?: string
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name: string
  /** 是否缓存 */
  keepAlive: boolean
  /** 是否固定标签 */
  fixedTab?: boolean
  /** 路由参数 */
  params?: object
  /** 路由查询参数 */
  query?: LocationQueryRaw
  /** 图标 */
  icon?: string
  /** 是否激活 */
  isActive?: boolean
}
