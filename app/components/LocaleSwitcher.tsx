/**
 * 简繁切换 — Apple 风格纯文字链接
 *
 * 放在 header 右侧，不抢视觉权重
 */

import { setClientLocale } from '~/i18n/client'
import { useLocale } from '~/i18n/use-locale'
import { Button } from './ui/button'

export function LocaleSwitcher() {
  const [locale] = useLocale()

  const toggle = () => {
    const next = locale === 'zh-TW' ? 'zh-CN' : 'zh-TW'
    setClientLocale(next)
    window.location.reload()
  }

  return (
    <Button
      onClick={toggle}
      variant="ghost"
      size="sm"
      className="text-sm text-foreground/50"
    >
      {locale === 'zh-CN' ? '简' : '繁'}
    </Button>
  )
}
