/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 认证参数与响应
 * - 唯一超级管理员信息
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = {
 *   userName: 'Default',
 *   password: 'PASSWORD',
 *   captchaId: 'CAPTCHA_ID',
 *   captchaCode: '1234'
 * }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 */

declare namespace Api {
  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
      captchaId: string
      captchaCode: string
    }

    /** 登录图片验证码 */
    interface CaptchaResponse {
      captchaId: string
      image: string
      expiresIn: number
    }

    /** 登录响应 */
    interface LoginResponse {
      csrfToken: string
      admin: {
        id: number
        username: string
        role: 'super'
        permissions: string[]
      }
    }

    /** 用户信息响应 */
    interface UserInfoResponse {
      admin: {
        id: number
        username: string
        role: 'super'
        permissions: string[]
      }
      permissionCatalogue: Record<string, string>
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }
}
