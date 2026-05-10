import type { Locale } from './types'

declare global {
  interface Window {
    __LOCALE__?: string
  }
}

export function getClientLocale(): Locale {
  // 1. SSG hydration: window.__LOCALE__ 由服务端设置
  if (typeof window !== 'undefined' && window.__LOCALE__) {
    const v = window.__LOCALE__
    if (v === 'zh-CN' || v === 'zh-TW')
      return v
  }

  // 2. URL 参数
  const params = new URLSearchParams(window.location.search)
  const urlLang = params.get('lang')
  if (urlLang === 'zh-CN' || urlLang === 'zh-TW')
    return urlLang

  // 3. localStorage
  const stored = localStorage.getItem('lang')
  if (stored === 'zh-CN' || stored === 'zh-TW')
    return stored

  // 4. 浏览器语言
  if (navigator.language.startsWith('zh-CN') || navigator.language.startsWith('zh-Hans'))
    return 'zh-CN'

  return 'zh-TW'
}

export function setClientLocale(locale: Locale) {
  localStorage.setItem('lang', locale)
  const url = new URL(window.location.href)
  url.searchParams.set('lang', locale)
  window.history.replaceState({}, '', url)
}
