import request from '@/utils/http'

/** 获取一次性登录图片验证码 */
export function fetchCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/api/auth/captcha',
    showErrorMessage: false
  })
}

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  // 转换参数格式：前端使用 userName，后端期望 username
  const backendParams = {
    username: params.userName,
    password: params.password,
    captchaId: params.captchaId,
    captchaCode: params.captchaCode
  }
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params: backendParams,
    // 登录页使用和成功提示一致的 Notification 卡片，避免重复弹出 ElMessage。
    showErrorMessage: false,
    // 登录失败属于匿名业务校验，保留后端的验证码、密码或停用原因，
    // 不触发已登录页面使用的全局 401 退出处理。
    skipUnauthorizedHandler: true
  })
}

export function fetchCsrfToken() {
  return request.get<{ csrfToken: string }>({ url: '/api/auth/csrf' })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export async function fetchGetUserInfo() {
  const response = await request.get<Api.Auth.UserInfoResponse>({
    url: '/api/auth/me'
  })

  // 转换后端响应格式为前端期望的格式
  return {
    userId: response.admin.id,
    userName: response.admin.username,
    roles: ['R_SUPER'],
    buttons: response.admin.permissions,
    email: '',
    avatar: ''
  } as Api.Auth.UserInfo
}
