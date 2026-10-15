<!-- 布局容器 -->
<template>
  <div class="app-layout">
    <aside id="app-sidebar">
      <ArtSidebarMenu />
    </aside>

    <main id="app-main">
      <div id="app-header">
        <ArtHeaderBar @open-settings="settingsOpen = true" />
      </div>
      <div id="app-content">
        <ArtPageContent />
      </div>
    </main>

    <div v-if="systemWatermarkEnabled" class="app-watermark" aria-hidden="true">
      <span v-for="index in 24" :key="index">{{ systemWatermarkText }}</span>
    </div>

    <ArtSettingsPanel v-model="settingsOpen" />
  </div>
</template>

<script setup lang="ts">
  import ArtSettingsPanel from '@/components/core/layouts/art-settings-panel/index.vue'
  import { useSystemBranding } from '@/hooks/useSystemBranding'

  defineOptions({ name: 'AppLayout' })

  const settingsOpen = ref(false)
  const { systemWatermarkEnabled, systemWatermarkText } = useSystemBranding()
</script>

<style lang="scss" scoped>
  @use './style';
</style>
