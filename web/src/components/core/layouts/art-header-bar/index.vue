<!-- 会议后台顶部栏：保留导航、刷新、全屏、主题和账号功能。 -->
<template>
  <div
    class="w-full bg-[var(--default-bg-color)]"
    :class="[
      tabStyle === 'tab-card' || tabStyle === 'tab-google' ? 'mb-5 max-sm:mb-3 !bg-box' : ''
    ]"
  >
    <div
      class="relative box-border flex-b h-15 leading-15 select-none"
      :class="[
        tabStyle === 'tab-card' || tabStyle === 'tab-google'
          ? 'border-b border-[var(--art-card-border)]'
          : ''
      ]"
    >
      <div class="flex-c flex-1 min-w-0 leading-15">
        <div v-if="isTopMenu" class="flex-c c-p" @click="toHome">
          <ArtLogo class="pl-4.5" />
          <p v-if="width >= 1400" class="my-0 mx-2 ml-2 text-lg">{{ systemName }}</p>
        </div>

        <ArtLogo
          class="!hidden pl-3.5 overflow-hidden align-[-0.15em] fill-current"
          @click="toHome"
        />

        <ArtIconButton
          v-if="showMenuButton && isLeftMenu && width < 800"
          icon="ri:menu-2-line"
          class="ml-3 max-sm:ml-[7px]"
          @click="visibleMenu"
        />

        <ArtIconButton
          v-if="showRefreshButton"
          icon="ri:refresh-line"
          class="!ml-3 max-sm:!hidden"
          :style="{ marginLeft: !isLeftMenu ? '10px' : '0' }"
          @click="reload"
        />

        <ArtBreadcrumb v-if="showCrumbs && (isLeftMenu || isDualMenu)" />
        <ArtHorizontalMenu v-if="isTopMenu" :list="menuList" />
        <ArtMixedMenu v-if="isTopLeftMenu" :list="menuList" />
      </div>

      <div class="flex-c gap-2.5">
        <ArtIconButton
          :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'"
          class="ml-3 max-md:!hidden"
          @click="toggleFullscreen"
        />
        <ArtIconButton :icon="isDark ? 'ri:sun-line' : 'ri:moon-line'" @click="themeAnimation" />
        <ElDropdown v-if="showLanguage" trigger="click" @command="changeLanguage">
          <span class="flex-c outline-none">
            <ArtIconButton icon="ri:translate-2" />
          </span>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="option in languageOptions"
                :key="option.value"
                :command="option.value"
                :class="{ 'is-active-language': option.value === language }"
              >
                {{ option.label }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <ArtIconButton icon="ri:settings-line" class="setting-btn" @click="emit('open-settings')" />
        <ArtUserMenu />
      </div>
    </div>

    <ArtWorkTab />
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useFullscreen, useWindowSize } from '@vueuse/core'
  import { LanguageEnum, MenuTypeEnum } from '@/enums/appEnum'
  import { languageOptions } from '@/locales'
  import { useSettingStore } from '@/store/modules/setting'
  import { useMenuStore } from '@/store/modules/menu'
  import { useUserStore } from '@/store/modules/user'
  import { useSystemBranding } from '@/hooks/useSystemBranding'
  import { themeAnimation } from '@/utils/ui/animation'
  import { useCommon } from '@/hooks/core/useCommon'
  import ArtUserMenu from './widget/ArtUserMenu.vue'

  defineOptions({ name: 'ArtHeaderBar' })

  const emit = defineEmits<{
    'open-settings': []
  }>()

  const router = useRouter()
  const { locale } = useI18n()
  const { width } = useWindowSize()
  const { systemName } = useSystemBranding()
  const settingStore = useSettingStore()
  const menuStore = useMenuStore()
  const userStore = useUserStore()
  const {
    menuOpen,
    menuType,
    isDark,
    tabStyle,
    showMenuButton,
    showRefreshButton,
    showCrumbs,
    showLanguage
  } = storeToRefs(settingStore)
  const { language } = storeToRefs(userStore)
  const { menuList } = storeToRefs(menuStore)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const { homePath, refresh } = useCommon()

  const isLeftMenu = computed(() => menuType.value === MenuTypeEnum.LEFT)
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)
  const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)

  const visibleMenu = () => settingStore.setMenuOpen(!menuOpen.value)
  const toHome = () => router.push(homePath.value)
  const reload = () => refresh()
  const changeLanguage = (value: LanguageEnum) => {
    locale.value = value
    userStore.setLanguage(value)
  }
</script>

<style lang="scss">
  .is-active-language {
    color: var(--theme-color) !important;
  }
</style>
