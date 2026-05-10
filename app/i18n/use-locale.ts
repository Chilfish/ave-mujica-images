import type { Locale } from './types'
import { useCallback } from 'react'
import { useLoaderData } from 'react-router'
import { getClientLocale, setClientLocale } from './client'

export function useLocale(): [Locale, (locale: Locale) => void] {
  // 优先使用 loader 数据（SSR），否则用客户端检测
  const loaderData = useLoaderData<{ locale?: Locale }>()
  const locale: Locale = loaderData?.locale ?? getClientLocale()

  const setLocale = useCallback((newLocale: Locale) => {
    setClientLocale(newLocale)
    // 刷新页面以重新获取 SSR 数据
    window.location.reload()
  }, [])

  return [locale, setLocale]
}
