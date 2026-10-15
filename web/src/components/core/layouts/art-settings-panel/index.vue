<!-- 原版主题设置中心 -->
<template>
  <ElDrawer
    v-model="visible"
    size="300px"
    :lock-scroll="true"
    :with-header="false"
    :destroy-on-close="false"
    modal-class="setting-modal"
    @open="handleOpen"
    @closed="handleClose"
  >
    <div class="setting-drawer-content">
      <div class="setting-header">
        <span>{{ t('setting.title') }}</span>
        <button type="button" class="setting-close" @click="visible = false">
          <ArtSvgIcon icon="ri:close-fill" />
        </button>
      </div>

      <SettingSectionTitle :title="t('setting.theme.title')" />
      <div class="setting-box-wrap">
        <button
          v-for="(item, index) in AppConfig.settingThemeList"
          :key="item.theme"
          type="button"
          class="setting-item"
          @click="switchThemeStyles(item.theme)"
        >
          <span class="box" :class="{ 'is-active': item.theme === systemThemeMode }">
            <img :src="item.img" :alt="t(`setting.theme.list[${index}]`)" />
          </span>
          <span class="name">{{ t(`setting.theme.list[${index}]`) }}</span>
        </button>
      </div>

      <template v-if="width > 1000">
        <SettingSectionTitle :title="t('setting.menuType.title')" />
        <div class="setting-box-wrap">
          <button
            v-for="(item, index) in AppConfig.menuLayoutList"
            :key="item.value"
            type="button"
            class="setting-item"
            @click="switchMenuLayout(item.value)"
          >
            <span class="box" :class="{ 'is-active': item.value === menuType }">
              <img :src="item.img" :alt="t(`setting.menuType.list[${index}]`)" />
            </span>
            <span class="name">{{ t(`setting.menuType.list[${index}]`) }}</span>
          </button>
        </div>
      </template>

      <SettingSectionTitle :title="t('setting.menu.title')" />
      <div class="setting-box-wrap">
        <button
          v-for="item in AppConfig.themeList"
          :key="item.theme"
          type="button"
          class="setting-item"
          :class="{ 'is-disabled': menuThemeDisabled }"
          :disabled="menuThemeDisabled"
          @click="switchMenuStyle(item.theme)"
        >
          <span class="box" :class="{ 'is-active': item.theme === menuThemeType }">
            <img v-if="item.img" :src="item.img" :alt="item.theme" />
          </span>
        </button>
      </div>

      <SettingSectionTitle :title="t('setting.color.title')" />
      <div class="setting-colors">
        <button
          v-for="color in AppConfig.systemMainColor"
          :key="color"
          type="button"
          class="setting-color"
          :style="{ backgroundColor: color }"
          :aria-label="color"
          @click="selectColor(color)"
        >
          <ArtSvgIcon v-if="color === systemThemeColor" icon="ri:check-fill" />
        </button>
      </div>

      <SettingSectionTitle :title="t('setting.box.title')" />
      <div class="setting-segmented">
        <button
          type="button"
          :class="{ active: boxBorderMode }"
          @click="settingStore.setBoxMode(true)"
        >
          {{ t('setting.box.list[0]') }}
        </button>
        <button
          type="button"
          :class="{ active: !boxBorderMode }"
          @click="settingStore.setBoxMode(false)"
        >
          {{ t('setting.box.list[1]') }}
        </button>
      </div>

      <SettingSectionTitle :title="t('setting.container.title')" />
      <div class="setting-container-options">
        <button
          v-for="(option, index) in containerOptions"
          :key="option.value"
          type="button"
          :class="{ active: containerWidth === option.value }"
          @click="settingStore.setContainerWidth(option.value)"
        >
          <ArtSvgIcon :icon="option.icon" />
          <span>{{ t(`setting.container.list[${index}]`) }}</span>
        </button>
      </div>

      <SettingSectionTitle :title="t('setting.basics.title')" />
      <div class="setting-basic-list">
        <div class="setting-row">
          <span>{{ t('setting.basics.list.multiTab') }}</span>
          <ElSwitch :model-value="showWorkTab" @change="handleWorkTab" />
        </div>
        <div v-if="menuType !== MenuTypeEnum.TOP" class="setting-row">
          <span>菜单宽度</span>
          <ElSelect :model-value="menuOpenWidth" @change="handleMenuWidth">
            <ElOption
              v-for="option in menuWidthOptions"
              :key="option"
              :label="`${option}px`"
              :value="option"
            />
          </ElSelect>
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.fastEnter') }}</span>
          <ElSwitch :model-value="showFastEnter" @change="handleFastEnter" />
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.reloadPage') }}</span>
          <ElSwitch :model-value="showRefreshButton" @change="handleRefreshButton" />
        </div>
        <div class="setting-row mobile-hide">
          <span>{{ t('setting.basics.list.breadcrumb') }}</span>
          <ElSwitch :model-value="showCrumbs" @change="handleCrumbs" />
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.language') }}</span>
          <ElSwitch :model-value="showLanguage" @change="handleLanguage" />
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.progressBar') }}</span>
          <ElSwitch :model-value="showNprogress" @change="handleNprogress" />
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.weakMode') }}</span>
          <ElSwitch :model-value="colorWeak" @change="handleColorWeak" />
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.tabStyle') }}</span>
          <ElSelect :model-value="tabStyle" @change="settingStore.setTabStyle">
            <ElOption
              v-for="option in tabStyleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.pageTransition') }}</span>
          <ElSelect :model-value="pageTransition" @change="settingStore.setPageTransition">
            <ElOption
              v-for="option in transitionOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </div>
        <div class="setting-row">
          <span>{{ t('setting.basics.list.borderRadius') }}</span>
          <ElSelect :model-value="customRadius" @change="settingStore.setCustomRadius">
            <ElOption
              v-for="option in radiusOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </ElSelect>
        </div>
      </div>

      <div class="setting-actions">
        <ElButton type="primary" @click="copyConfig">{{
          t('setting.actions.copyConfig')
        }}</ElButton>
        <ElButton type="danger" plain @click="resetConfig">
          {{ t('setting.actions.resetConfig') }}
        </ElButton>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed, defineComponent, h, onBeforeUnmount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import { useWindowSize } from '@vueuse/core'
  import AppConfig from '@/config'
  import { getSettingDefaults } from '@/config/setting'
  import { ContainerWidthEnum, MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useTheme } from '@/hooks/core/useTheme'
  import { useSettingStore } from '@/store/modules/setting'

  defineOptions({ name: 'ArtSettingsPanel' })

  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

  const SettingSectionTitle = defineComponent({
    props: { title: { type: String, required: true } },
    setup(sectionProps) {
      return () => h('p', { class: 'setting-section-title' }, sectionProps.title)
    }
  })

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const { t } = useI18n()
  const { width } = useWindowSize()
  const { switchThemeStyles } = useTheme()
  const settingStore = useSettingStore()
  const {
    menuType,
    menuOpenWidth,
    systemThemeMode,
    menuThemeType,
    systemThemeColor,
    showFastEnter,
    showRefreshButton,
    showCrumbs,
    showLanguage,
    showWorkTab,
    showNprogress,
    uniqueOpened,
    colorWeak,
    boxBorderMode,
    pageTransition,
    tabStyle,
    customRadius,
    containerWidth,
    isDark
  } = storeToRefs(settingStore)

  const containerOptions = [
    { value: ContainerWidthEnum.FULL, icon: 'icon-park-outline:auto-width' },
    { value: ContainerWidthEnum.BOXED, icon: 'ix:width' }
  ]
  const radiusOptions = ['0', '0.25', '0.5', '0.75', '1']
  const menuWidthOptions = [200, 230, 260, 280, 300]
  const tabStyleOptions = computed(() => [
    { value: 'tab-default', label: t('setting.tabStyle.default') },
    { value: 'tab-card', label: t('setting.tabStyle.card') },
    { value: 'tab-google', label: t('setting.tabStyle.google') }
  ])
  const transitionOptions = computed(() => [
    { value: '', label: t('setting.transition.list.none') },
    { value: 'fade', label: t('setting.transition.list.fade') },
    { value: 'slide-left', label: t('setting.transition.list.slideLeft') },
    { value: 'slide-bottom', label: t('setting.transition.list.slideBottom') },
    { value: 'slide-top', label: t('setting.transition.list.slideTop') }
  ])
  const menuThemeDisabled = computed(
    () =>
      isDark.value ||
      menuType.value === MenuTypeEnum.TOP ||
      menuType.value === MenuTypeEnum.DUAL_MENU
  )

  let themeChangeTimer: number | undefined

  const handleOpen = () => {
    window.clearTimeout(themeChangeTimer)
    themeChangeTimer = window.setTimeout(() => document.body.classList.add('theme-change'), 500)
  }

  const handleClose = () => {
    window.clearTimeout(themeChangeTimer)
    document.body.classList.remove('theme-change')
  }

  const switchMenuLayout = (type: MenuTypeEnum) => {
    if (type === MenuTypeEnum.LEFT || type === MenuTypeEnum.TOP_LEFT) {
      settingStore.setMenuOpen(true)
    }
    settingStore.switchMenuLayouts(type)
    if (type === MenuTypeEnum.DUAL_MENU) {
      settingStore.switchMenuStyles(MenuThemeEnum.DESIGN)
      settingStore.setMenuOpen(true)
    }
  }

  const switchMenuStyle = (theme: MenuThemeEnum) => {
    if (!menuThemeDisabled.value) settingStore.switchMenuStyles(theme)
  }

  const selectColor = (color: string) => {
    settingStore.setElementTheme(color)
    settingStore.reload()
  }

  const asBoolean = (value: unknown) => Boolean(value)
  const handleWorkTab = (value: unknown) => settingStore.setWorkTab(asBoolean(value))
  const handleMenuWidth = (value: unknown) => {
    const nextWidth = Number(value)
    if (menuWidthOptions.includes(nextWidth)) settingStore.setMenuOpenWidth(nextWidth)
  }
  const handleFastEnter = (value: unknown) => settingStore.setFastEnter(asBoolean(value))
  const handleRefreshButton = (value: unknown) =>
    settingStore.setShowRefreshButton(asBoolean(value))
  const handleCrumbs = (value: unknown) => settingStore.setCrumbs(asBoolean(value))
  const handleLanguage = (value: unknown) => settingStore.setLanguage(asBoolean(value))
  const handleNprogress = (value: unknown) => settingStore.setNprogress(asBoolean(value))
  const handleColorWeak = (value: unknown) => settingStore.setColorWeak(asBoolean(value))

  const getConfigSnapshot = () => ({
    menuType: menuType.value,
    menuOpenWidth: menuOpenWidth.value,
    systemThemeMode: systemThemeMode.value,
    menuThemeType: menuThemeType.value,
    systemThemeColor: systemThemeColor.value,
    showFastEnter: showFastEnter.value,
    showRefreshButton: showRefreshButton.value,
    showCrumbs: showCrumbs.value,
    showLanguage: showLanguage.value,
    showWorkTab: showWorkTab.value,
    showNprogress: showNprogress.value,
    uniqueOpened: uniqueOpened.value,
    colorWeak: colorWeak.value,
    boxBorderMode: boxBorderMode.value,
    pageTransition: pageTransition.value,
    tabStyle: tabStyle.value,
    customRadius: customRadius.value,
    containerWidth: containerWidth.value
  })

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getConfigSnapshot(), null, 2))
      ElMessage.success(t('setting.actions.copySuccess'))
    } catch {
      ElMessage.error(t('setting.actions.copyFailed'))
    }
  }

  const resetConfig = () => {
    const defaults = getSettingDefaults()
    settingStore.$patch(defaults)
    switchThemeStyles(defaults.systemThemeMode as SystemThemeEnum)
    settingStore.setElementTheme(defaults.systemThemeColor)
    settingStore.setBoxMode(defaults.boxBorderMode)
    settingStore.setColorWeak(defaults.colorWeak)
    settingStore.setCustomRadius(defaults.customRadius)
    ElMessage.success(t('setting.actions.resetSuccess'))
  }

  onBeforeUnmount(handleClose)
</script>

<style lang="scss">
  @use '@styles/core/mixin.scss' as *;

  .setting-modal {
    background: transparent !important;

    .el-drawer {
      background: rgb(255 255 255 / 50%) !important;
      box-shadow: 0 0 30px rgb(0 0 0 / 10%) !important;

      @include backdropBlur();
    }

    .el-drawer__body {
      padding: 20px;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        width: 0;
      }
    }
  }

  .setting-drawer-content {
    color: var(--art-gray-800);

    .setting-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 600;
    }

    .setting-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      color: var(--art-gray-600);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 6px;
      transition: background-color 0.2s;

      &:hover {
        background: var(--art-gray-300);
      }

      .art-svg-icon {
        font-size: 20px;
      }
    }

    .setting-section-title {
      position: relative;
      margin: 30px 0 22px;
      font-size: 14px;
      text-align: center;

      &::before,
      &::after {
        position: absolute;
        top: 10px;
        width: 50px;
        content: '';
        border-bottom: 1px solid var(--art-gray-300);
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }
    }

    .setting-box-wrap {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      width: calc(100% + 15px);
      margin-bottom: 10px;
    }

    .setting-item {
      box-sizing: border-box;
      width: calc(33.333% - 15px);
      padding: 0;
      margin: 0 15px 16px 0;
      color: inherit;
      text-align: center;
      cursor: pointer;
      background: transparent;
      border: 0;

      &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .box {
        position: relative;
        box-sizing: border-box;
        display: flex;
        height: 52px;
        overflow: hidden;
        border: 2px solid var(--default-border);
        border-radius: 8px;
        box-shadow: 0 0 8px rgb(0 0 0 / 10%);
        transition: border-color 0.15s;

        &.is-active {
          border-color: var(--theme-color);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .name {
        display: block;
        margin-top: 6px;
        font-size: 14px;
      }
    }

    .setting-colors {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
    }

    .setting-color {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 23px;
      height: 23px;
      padding: 0;
      color: #fff;
      cursor: pointer;
      border: 0;
      border-radius: 50%;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.85;
      }
    }

    .setting-segmented {
      display: flex;
      justify-content: space-between;
      padding: 4px;
      background: var(--art-gray-200);
      border-radius: 8px;

      button {
        width: calc(50% - 3px);
        height: 34px;
        color: var(--art-gray-700);
        cursor: pointer;
        background: transparent;
        border: 0;
        border-radius: 6px;

        &.active {
          color: var(--art-gray-800);
          background: var(--default-box-color);
        }
      }
    }

    .setting-container-options {
      display: flex;
      gap: 14px;

      button {
        display: flex;
        flex: 1;
        gap: 8px;
        align-items: center;
        justify-content: center;
        height: 64px;
        color: var(--art-gray-800);
        cursor: pointer;
        background: transparent;
        border: 2px solid var(--default-border);
        border-radius: 8px;

        &.active {
          color: var(--theme-color);
          border-color: var(--theme-color);
        }
      }
    }

    .setting-basic-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .setting-row {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;
      font-size: 14px;

      > span {
        flex: 1;
      }

      .el-input-number,
      .el-select {
        width: 120px;
      }
    }

    .setting-actions {
      display: flex;
      gap: 16px;
      padding-top: 20px;
      margin-top: 30px;
      border-top: 1px solid var(--default-border);

      .el-button {
        flex: 1;
        height: 34px;
        margin: 0;
      }
    }
  }

  .dark .setting-modal .el-drawer {
    background: rgb(0 0 0 / 50%) !important;
  }

  @media screen and (width <= 800px) {
    .setting-drawer-content .mobile-hide {
      display: none !important;
    }
  }
</style>
