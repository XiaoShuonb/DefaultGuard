<!-- 图标组件 -->
<template>
  <Icon v-if="icon" :icon="icon" v-bind="bindAttrs" class="art-svg-icon inline" />
</template>

<script setup lang="ts">
  import { addCollection, Icon } from '@iconify/vue'
  import type { IconifyJSON } from '@iconify/types'
  import localIconCollections from '@/assets/icons/local-icon-collections.json'

  // Ship every icon collection used by the admin UI with the application.
  // Relying on the public Iconify API makes all icons disappear whenever the
  // browser, proxy, DNS, or deployment network blocks that external request.
  for (const collection of localIconCollections as unknown as IconifyJSON[])
    addCollection(collection)

  defineOptions({ name: 'ArtSvgIcon', inheritAttrs: false })

  interface Props {
    /** Iconify icon name */
    icon?: string
  }

  defineProps<Props>()

  const attrs = useAttrs()

  const bindAttrs = computed<{ class: string; style: string }>(() => ({
    class: (attrs.class as string) || '',
    style: (attrs.style as string) || ''
  }))
</script>
