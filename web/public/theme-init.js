// Apply the saved theme before Vue mounts without requiring inline script
// execution. Keeping this as a same-origin static asset allows the production
// CSP to retain `script-src 'self'` without adding unsafe-inline.
;(function () {
  try {
    if (typeof Storage === 'undefined' || !window.localStorage) {
      return
    }

    const themeType = localStorage.getItem('sys-theme')
    if (themeType === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch (error) {
    console.warn('Failed to apply initial theme:', error)
  }
})()
