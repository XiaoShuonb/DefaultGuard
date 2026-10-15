import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter, router } from './router'       // Router
import language from './locales'                    // 国际化
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import { setupChunkRecovery } from './utils/sys/chunk-recovery'

// The reverse-proxy gate consumes this one-time navigation parameter before
// the SPA loads. Remove it immediately so the entry secret is not retained in
// the visible URL or the current browser-history entry.
const currentUrl = new URL(window.location.href)
if (currentUrl.searchParams.has('Default')) {
  currentUrl.searchParams.delete('Default')
  window.history.replaceState(window.history.state, '', currentUrl.toString())
}

const app = createApp(App)
initStore(app)
setupChunkRecovery(router)
initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(language)
app.mount('#app')

import '@/views/platform-page.scss'
