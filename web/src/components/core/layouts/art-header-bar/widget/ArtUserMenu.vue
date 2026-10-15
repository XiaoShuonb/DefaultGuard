<!-- 用户菜单 -->
<template>
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    :width="132"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="false"
    popper-class="user-menu-popover"
    popper-style="padding: 10px;"
  >
    <template #reference>
      <div class="flex-c c-p mr-5 max-sm:mr-[16px]">
        <ElAvatar
          class="system-avatar size-8.5 max-sm:w-6.5 max-sm:h-6.5"
          :src="systemAvatar || undefined"
          >{{ avatarInitial }}</ElAvatar
        >
        <span class="ml-2 text-sm max-sm:hidden">{{ displayName }}</span>
      </div>
    </template>
    <template #default>
      <div class="log-out c-p" @click="loginOut"> 退出登录 </div>
    </template>
  </ElPopover>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { useSystemBranding } from '@/hooks/useSystemBranding'

  defineOptions({ name: 'ArtUserMenu' })

  const { t } = useI18n()
  const userStore = useUserStore()

  const { getUserInfo: userInfo } = storeToRefs(userStore)
  const userMenuPopover = ref()
  const { systemAvatar } = useSystemBranding()

  const displayName = computed(() => userInfo.value.userName || '管理员')

  const avatarInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      }).then(() => {
        void userStore.logOutRemote()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply py-1.5
    text-sm
    text-center
    border
    border-g-400
    rounded-md
    transition-all
    duration-200
    hover:shadow-xl;
  }
</style>

<style scoped>
  .system-avatar {
    display: block;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: 12px;
  }
</style>
