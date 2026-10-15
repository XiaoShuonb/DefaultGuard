import AppConfig from '@/config'
import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'

/** DefaultBot 后台实际使用的界面默认值。 */
export const SETTING_DEFAULT_CONFIG = {
  menuType: MenuTypeEnum.LEFT,
  menuOpenWidth: 230,
  menuOpen: true,
  dualMenuShowText: true,
  systemThemeType: SystemThemeEnum.AUTO,
  systemThemeMode: SystemThemeEnum.AUTO,
  menuThemeType: MenuThemeEnum.DESIGN,
  systemThemeColor: AppConfig.systemMainColor[0],
  showMenuButton: true,
  showFastEnter: false,
  showRefreshButton: true,
  showCrumbs: true,
  showLanguage: false,
  showWorkTab: false,
  showNprogress: false,
  uniqueOpened: true,
  colorWeak: false,
  // 水印由系统配置统一管理，默认开启；保留字段用于旧版布局配置兼容。
  watermarkVisible: true,
  boxBorderMode: true,
  pageTransition: 'slide-left',
  tabStyle: 'tab-default',
  customRadius: '0.75',
  containerWidth: ContainerWidthEnum.FULL
}

export function getSettingDefaults() {
  return { ...SETTING_DEFAULT_CONFIG }
}
