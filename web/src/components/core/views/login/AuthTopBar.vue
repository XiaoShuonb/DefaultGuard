<!-- 登录页顶部栏：保留系统标识和明暗主题切换。 -->
<template>
  <div
    class="absolute w-full flex-cb top-4.5 z-10 flex-c !justify-end max-[1180px]:!justify-between"
  >
    <div class="flex-cc !hidden max-[1180px]:!flex ml-2 max-sm:ml-6">
      <ArtLogo class="icon" size="46" />
      <h1 class="text-xl font-medium ml-2">{{ systemName }}</h1>
    </div>

    <div class="flex-cc mr-2 max-sm:mr-5">
      <button
        type="button"
        class="btn theme-btn h-8 w-8 c-p flex-cc tad-300"
        aria-label="切换明暗主题"
        @click="themeAnimation"
      >
        <ArtSvgIcon
          :icon="isDark ? 'ri:sun-line' : 'ri:moon-line'"
          class="text-xl text-g-800 transition-colors duration-300"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/store/modules/setting'
  import { themeAnimation } from '@/utils/ui/animation'
  import { useSystemBranding } from '@/hooks/useSystemBranding'

  defineOptions({ name: 'AuthTopBar' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)
  const { systemName } = useSystemBranding()
</script>
