<!-- 系统logo -->
<template>
  <div v-if="systemAvatar" class="flex-cc">
    <img :style="logoStyle" :src="systemAvatar" alt="系统 Logo" class="system-logo w-full h-full" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useSystemBranding } from '@/hooks/useSystemBranding'

  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 大小 */
    size?: number | string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36
  })

  const logoStyle = computed(() => ({ width: `${props.size}px` }))
  const { systemAvatar } = useSystemBranding()
</script>

<style scoped>
  .system-logo {
    display: block;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 12px;
  }
</style>
