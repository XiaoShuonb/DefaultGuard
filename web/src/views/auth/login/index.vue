<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">动态密钥登录</h3>
          <p class="sub-title">在 Telegram 私聊机器人获取一次性登录密钥</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                placeholder="一次性登录密钥（3 分钟有效）"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="captchaCode">
              <div class="captcha-row">
                <ElInput
                  v-model.trim="formData.captchaCode"
                  class="custom-height captcha-input"
                  :placeholder="$t('login.placeholder.captcha')"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="4"
                />
                <button
                  class="captcha-image-button"
                  type="button"
                  :aria-label="$t('login.refreshCaptcha')"
                  :title="$t('login.refreshCaptcha')"
                  @click="refreshCaptcha"
                >
                  <img
                    v-if="captcha.image"
                    class="captcha-image"
                    :src="captcha.image"
                    :alt="$t('login.captchaImageAlt')"
                  />
                  <span v-else class="captcha-placeholder">
                    {{ $t('login.loadCaptcha') }}
                  </span>
                  <span v-if="captchaLoading" class="captcha-loading">
                    <ElIcon class="is-loading"><RefreshRight /></ElIcon>
                  </span>
                </button>
              </div>
              <p class="captcha-tip">{{ $t('login.captchaTip') }}</p>
            </ElFormItem>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSystemBranding } from '@/hooks/useSystemBranding'
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchCaptcha, fetchLogin } from '@/api/auth'
  import { resetRouterState } from '@/router/guards/beforeEach'
  import { useWorktabStore } from '@/store/modules/worktab'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { RefreshRight } from '@element-plus/icons-vue'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  const { systemName } = useSystemBranding()
  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: 'OWNER',
    password: '',
    captchaCode: '',
    rememberPassword: true
  })

  const captcha = reactive<Api.Auth.CaptchaResponse>({
    captchaId: '',
    image: '',
    expiresIn: 0
  })
  const captchaLoading = ref(false)

  const rules = computed<FormRules>(() => ({
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
    captchaCode: [
      { required: true, message: t('login.placeholder.captcha'), trigger: 'blur' },
      { pattern: /^\d{4}$/, message: t('login.captchaFormat'), trigger: 'blur' }
    ]
  }))

  const loading = ref(false)

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    if (!captcha.captchaId) {
      await refreshCaptcha()
      return
    }

    let loginSucceeded = false
    try {
      loading.value = true

      // 登录请求
      const { username, password, captchaCode } = formData

      const { csrfToken, admin } = await fetchLogin({
        userName: username,
        password,
        captchaId: captcha.captchaId,
        captchaCode
      })

      if (!csrfToken) {
        throw new Error('Login failed - no CSRF token received')
      }

      userStore.setCsrfToken(csrfToken)
      userStore.setLoginStatus(true)

      // 存储用户信息
      userStore.setUserInfo({
        userId: admin.id,
        userName: admin.username,
        roles: ['R_SUPER'],
        buttons: admin.permissions,
        email: '',
        avatar: ''
      })
      const worktabStore = useWorktabStore()
      worktabStore.opened = []
      worktabStore.keepAliveExclude = []

      // A signed-in user can still open the login URL directly. Reset routes
      // before entering the app so switching accounts never reuses the
      // previous account's menus or page registrations.
      resetRouterState(0)
      await new Promise((resolve) => setTimeout(resolve, 0))

      // 登录成功处理
      loginSucceeded = true
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const queryRedirect = Array.isArray(route.query.redirect)
        ? route.query.redirect[0]
        : route.query.redirect
      const redirect = typeof queryRedirect === 'string' ? queryRedirect : ''
      // Only accept an internal, non-authentication destination.  Besides
      // avoiding open redirects, this also recovers cleanly from stale nested
      // login redirects created by an expired session.
      const safeRedirect =
        redirect.startsWith('/') &&
        !redirect.startsWith('//') &&
        !/^\/(?:auth\/)?login(?:[/?#]|$)/.test(redirect)
          ? redirect
          : '/'
      await router.push(safeRedirect)
    } catch (error) {
      const message = error instanceof HttpError ? error.message : '登录失败，请稍后重试'
      showAuthNotice('error', '登录失败', message, 4000)
      if (!(error instanceof HttpError)) {
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
      if (!loginSucceeded) await refreshCaptcha()
    }
  }

  const refreshCaptcha = async () => {
    if (captchaLoading.value) return
    captchaLoading.value = true
    formData.captchaCode = ''
    try {
      const challenge = await fetchCaptcha()
      Object.assign(captcha, challenge)
    } catch (error) {
      captcha.captchaId = ''
      captcha.image = ''
      captcha.expiresIn = 0
      const message = error instanceof HttpError ? error.message : '请检查网络或后台服务状态'
      showAuthNotice('error', '验证码加载失败', message, 4000)
    } finally {
      captchaLoading.value = false
    }
  }

  onMounted(refreshCaptcha)

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      showAuthNotice(
        'success',
        t('login.success.title'),
        `${t('login.success.message')}, ${systemName.value}!`,
        2500
      )
    }, 1000)
  }

  const showAuthNotice = (
    type: 'success' | 'error',
    title: string,
    message: string,
    duration: number
  ) => {
    ElNotification({
      title,
      type,
      duration,
      zIndex: 10000,
      message,
      position: 'top-right',
      customClass: 'auth-feedback-notification'
    })
  }
</script>

<style scoped>
  @import './style.css';
</style>
