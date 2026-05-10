/**
 * 简繁切换按钮
 */

import { Button } from '~/components/ui/button'
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
    <Button variant="ghost" size="sm" onClick={toggle}>
      {locale === 'zh-TW' ? '简' : '繁'}
    </Button>
  )
}
