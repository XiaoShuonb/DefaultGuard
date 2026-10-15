import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { MenuThemeType } from '@/types/store'
import AppConfig from '@/config'
import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { setElementThemeColor } from '@/utils/ui'
import { StorageConfig } from '@/utils'
import { SETTING_DEFAULT_CONFIG } from '@/config/setting'

/**
 * 会议后台布局与主题状态。
 * 仅保留业务壳层实际使用的菜单、主题、标签页和页面容器配置。
 */
export const useSettingStore = defineStore(
  'settingStore',
  () => {
    const menuType = ref(SETTING_DEFAULT_CONFIG.menuType)
    const menuOpenWidth = ref(SETTING_DEFAULT_CONFIG.menuOpenWidth)
    const menuOpen = ref(SETTING_DEFAULT_CONFIG.menuOpen)
    const dualMenuShowText = ref(SETTING_DEFAULT_CONFIG.dualMenuShowText)

    const systemThemeType = ref(SETTING_DEFAULT_CONFIG.systemThemeType)
    const systemThemeMode = ref(SETTING_DEFAULT_CONFIG.systemThemeMode)
    const menuThemeType = ref(SETTING_DEFAULT_CONFIG.menuThemeType)
    const systemThemeColor = ref(SETTING_DEFAULT_CONFIG.systemThemeColor)

    const showMenuButton = ref(SETTING_DEFAULT_CONFIG.showMenuButton)
    const showFastEnter = ref(SETTING_DEFAULT_CONFIG.showFastEnter)
    const showRefreshButton = ref(SETTING_DEFAULT_CONFIG.showRefreshButton)
    const showCrumbs = ref(SETTING_DEFAULT_CONFIG.showCrumbs)
    const showLanguage = ref(SETTING_DEFAULT_CONFIG.showLanguage)
    const showWorkTab = ref(SETTING_DEFAULT_CONFIG.showWorkTab)
    const showNprogress = ref(SETTING_DEFAULT_CONFIG.showNprogress)
    const uniqueOpened = ref(SETTING_DEFAULT_CONFIG.uniqueOpened)
    const colorWeak = ref(SETTING_DEFAULT_CONFIG.colorWeak)
    const watermarkVisible = ref(SETTING_DEFAULT_CONFIG.watermarkVisible)
    const boxBorderMode = ref(SETTING_DEFAULT_CONFIG.boxBorderMode)
    const refresh = ref(false)
    const pageTransition = ref(SETTING_DEFAULT_CONFIG.pageTransition)
    const tabStyle = ref(SETTING_DEFAULT_CONFIG.tabStyle)
    const customRadius = ref(SETTING_DEFAULT_CONFIG.customRadius)
    const containerWidth = ref(SETTING_DEFAULT_CONFIG.containerWidth)

    const isDark = computed(() => systemThemeType.value === SystemThemeEnum.DARK)

    const getMenuTheme = computed((): MenuThemeType => {
      if (isDark.value) return AppConfig.darkMenuStyles[0]
      return (
        AppConfig.themeList.find((item) => item.theme === menuThemeType.value) ??
        AppConfig.themeList[0]
      )
    })

    const getMenuOpenWidth = computed(() => `${menuOpenWidth.value}px`)
    const getCustomRadius = computed(() => `${customRadius.value}rem`)

    const setGlopTheme = (theme: SystemThemeEnum, themeMode: SystemThemeEnum) => {
      systemThemeType.value = theme
      systemThemeMode.value = themeMode
      localStorage.setItem(StorageConfig.THEME_KEY, theme)
    }

    const setElementTheme = (theme: string) => {
      systemThemeColor.value = theme
      setElementThemeColor(theme)
    }

    const switchMenuLayouts = (type: MenuTypeEnum) => {
      menuType.value = type
    }

    const setMenuOpenWidth = (width: number) => {
      menuOpenWidth.value = width
    }

    const switchMenuStyles = (theme: MenuThemeEnum) => {
      menuThemeType.value = theme
    }

    const setShowMenuButton = (show: boolean) => {
      showMenuButton.value = show
    }

    const setFastEnter = (show: boolean) => {
      showFastEnter.value = show
    }

    const setShowRefreshButton = (show: boolean) => {
      showRefreshButton.value = show
    }

    const setCrumbs = (show: boolean) => {
      showCrumbs.value = show
    }

    const setLanguage = (show: boolean) => {
      showLanguage.value = show
    }

    const setNprogress = (show: boolean) => {
      showNprogress.value = show
    }

    const setUniqueOpened = (unique: boolean) => {
      uniqueOpened.value = unique
    }

    const setColorWeak = (enabled: boolean) => {
      colorWeak.value = enabled
      document.documentElement.classList.toggle('color-weak', enabled)
    }

    const setWatermarkVisible = (visible: boolean) => {
      watermarkVisible.value = visible
    }

    const setBoxMode = (borderMode: boolean) => {
      boxBorderMode.value = borderMode
      document.documentElement.setAttribute(
        'data-box-mode',
        borderMode ? 'border-mode' : 'shadow-mode'
      )
    }

    const setContainerWidth = (width: ContainerWidthEnum) => {
      containerWidth.value = width
    }

    const setPageTransition = (transition: string) => {
      pageTransition.value = transition
    }

    const setTabStyle = (style: string) => {
      tabStyle.value = style
    }

    const setMenuOpen = (open: boolean) => {
      menuOpen.value = open
    }

    const setWorkTab = (show: boolean) => {
      showWorkTab.value = show
    }

    const setCustomRadius = (radius: string) => {
      customRadius.value = radius
      document.documentElement.style.setProperty('--custom-radius', `${radius}rem`)
    }

    const setDualMenuShowText = (show: boolean) => {
      dualMenuShowText.value = show
    }

    const reload = () => {
      refresh.value = !refresh.value
    }

    return {
      menuType,
      menuOpenWidth,
      menuOpen,
      dualMenuShowText,
      systemThemeType,
      systemThemeMode,
      menuThemeType,
      systemThemeColor,
      showMenuButton,
      showFastEnter,
      showRefreshButton,
      showCrumbs,
      showLanguage,
      showWorkTab,
      showNprogress,
      uniqueOpened,
      colorWeak,
      watermarkVisible,
      boxBorderMode,
      refresh,
      pageTransition,
      tabStyle,
      customRadius,
      containerWidth,
      isDark,
      getMenuTheme,
      getMenuOpenWidth,
      getCustomRadius,
      setGlopTheme,
      setElementTheme,
      switchMenuLayouts,
      setMenuOpenWidth,
      switchMenuStyles,
      setShowMenuButton,
      setFastEnter,
      setShowRefreshButton,
      setCrumbs,
      setLanguage,
      setNprogress,
      setUniqueOpened,
      setColorWeak,
      setWatermarkVisible,
      setBoxMode,
      setContainerWidth,
      setPageTransition,
      setTabStyle,
      setMenuOpen,
      setWorkTab,
      setCustomRadius,
      setDualMenuShowText,
      reload
    }
  },
  {
    persist: {
      key: 'setting',
      storage: localStorage
    }
  }
)
