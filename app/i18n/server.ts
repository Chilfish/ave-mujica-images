import type { Locale } from './types'

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader)
    return null

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getLocale(request: Request): Locale {
  const url = new URL(request.url)

  // 1. URL 参数 ?lang=zh-CN
  const urlLang = url.searchParams.get('lang')
  if (urlLang === 'zh-CN' || urlLang === 'zh-TW')
    return urlLang

  // 2. Cookie
  const cookieLang = getCookie(request, 'lang')
  if (cookieLang === 'zh-CN' || cookieLang === 'zh-TW')
    return cookieLang

  // 3. Accept-Language 请求头
  const acceptLang = request.headers.get('Accept-Language') || ''
  if (acceptLang.includes('zh-CN') || acceptLang.includes('zh-Hans'))
    return 'zh-CN'

  // 4. 默认繁体
  return 'zh-TW'
}
