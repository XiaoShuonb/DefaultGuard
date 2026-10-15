import type { RippleDirective } from '@/directives'

declare module 'vue' {
  export interface GlobalDirectives {
    vRipple: RippleDirective
  }
}
