/**
 * 简繁切换 — Apple 风格纯文字链接
 *
 * 放在 header 右侧，不抢视觉权重
 */

import { setClientLocale } from '~/i18n/client'
import { useLocale } from '~/i18n/use-locale'

export function LocaleSwitcher() {
  const [locale] = useLocale()

  const toggle = () => {
    const next = locale === 'zh-TW' ? 'zh-CN' : 'zh-TW'
    setClientLocale(next)
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {locale === 'zh-TW' ? '简' : '繁'}
    </button>
  )
}
