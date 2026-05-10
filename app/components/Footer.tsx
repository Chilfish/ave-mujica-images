/**
 * 页脚 — 版本号 + LocaleSwitcher
 */

import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'
import { LocaleSwitcher } from './LocaleSwitcher'

export function Footer() {
  const [locale] = useLocale()
  const ui = uiStrings[locale]

  return (
    <footer className="border-t py-6 mt-8">
      <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          <p>
            {ui.version}
            : 2.0.0 ·
            {ui.updated}
            : 2026-05-10
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  )
}
