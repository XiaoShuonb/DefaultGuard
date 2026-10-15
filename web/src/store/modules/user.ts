/**
 * 用户状态管理模块
 *
 * 提供用户相关的状态管理
 *
 * ## 主要功能
 *
 * - 用户登录状态管理
 * - 用户信息存储
 * - HttpOnly 会话 Cookie 与内存 CSRF Token 管理
 * - 语言设置
 * - 登出清理逻辑
 *
 * ## 使用场景
 *
 * - 用户登录和认证
 * - 权限验证
 * - 个人信息展示
 * - 多语言切换
 *
 * ## 持久化
 *
 * - 登录 Cookie 由浏览器 HttpOnly 保存，CSRF Token 只保存在内存
 * - 存储键：sys-v{version}-user
 * - 登出时自动清理
 *
 * @module store/modules/user
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'
import { setPageTitle } from '@/utils/router'
import { resetRouterState } from '@/router/guards/beforeEach'
import { useMenuStore } from './menu'

/**
 * 用户状态管理
 * 管理唯一超级管理员的登录状态、个人信息和语言设置
 */
export const useUserStore = defineStore(
  'userStore',
  () => {
    // 语言设置
    const language = ref(LanguageEnum.ZH)
    // 登录状态
    const isLogin = ref(false)
    // 用户信息
    const info = ref<Partial<Api.Auth.UserInfo>>({})
    // 会话 Cookie 由浏览器 HttpOnly 保存，CSRF Token 只驻留内存。
    const csrfToken = ref('')

    // 计算属性：获取用户信息
    const getUserInfo = computed(() => info.value)

    /**
     * 设置用户信息
     * @param newInfo 新的用户信息
     */
    const setUserInfo = (newInfo: Api.Auth.UserInfo) => {
      info.value = newInfo
    }

    /**
     * 设置登录状态
     * @param status 登录状态
     */
    const setLoginStatus = (status: boolean) => {
      isLogin.value = status
    }

    /**
     * 设置语言
     * @param lang 语言枚举值
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
    }

    const setCsrfToken = (token: string) => {
      csrfToken.value = token
    }

    /**
     * 退出登录
     * 清空所有用户相关状态并跳转到登录页
     */
    const logOut = () => {
      // 清空用户信息
      info.value = {}
      // 重置登录状态
      isLogin.value = false
      csrfToken.value = ''
      // 清空主页路径
      useMenuStore().setHomePath('')
      // 重置路由状态
      resetRouterState(500)
      // 跳转到登录页，携带当前路由作为 redirect 参数
      const currentRoute = router.currentRoute.value
      // Login lives at /auth/login.  Using the old `/login` comparison caused
      // repeated 401 handlers on the login page to wrap the existing target as
      // `/auth/login?redirect=/auth/login?...`, leaving a successful login on
      // the login screen.  Never use an authentication page as a redirect
      // destination.
      const isLoginRoute =
        currentRoute.name === 'Login' || /(^|\/)auth\/login\/?$/.test(currentRoute.path)
      const redirect = !isLoginRoute ? currentRoute.fullPath : undefined
      router.push({
        name: 'Login',
        query: redirect ? { redirect } : undefined
      })
    }

    /** 通知服务端注销当前会话；即使网络失败也一定清理本地登录状态。 */
    const logOutRemote = async () => {
      try {
        const base = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
        await fetch(`${base}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'X-CSRF-Token': csrfToken.value }
        })
      } catch {
        // Local sign-out must remain available when the API is unreachable.
      } finally {
        logOut()
      }
    }

    return {
      language,
      isLogin,
      info,
      csrfToken,
      getUserInfo,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setCsrfToken,
      logOut,
      logOutRemote
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage,
      pick: ['language', 'isLogin', 'info']
    }
  }
)
