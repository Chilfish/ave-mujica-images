/**
 * 浏览器兼容性检测 — Facebook/Line 内置浏览器弹窗提示
 *
 * 仅在移动端触发，在首次渲染时同步检测
 */

import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { useIsMobile } from '~/hooks/use-mobile'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

function detectBrowser(): string | null {
  const ua = navigator.userAgent
  if (ua.includes('FBAN') || ua.includes('FBAV'))
    return 'Facebook'
  if (ua.includes('Line'))
    return 'LINE'
  return null
}

export function BrowserWarning() {
  const [locale] = useLocale()
  const isMobile = useIsMobile()
  const ui = uiStrings[locale]

  // 同步检测（首次渲染时确定，避免 effect setState）
  const browser = useMemo(() => {
    return isMobile ? detectBrowser() : null
  }, [isMobile])

  const [open, setOpen] = useState(!!browser)

  if (!browser)
    return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {browser}
          {' '}
          浏览器提示
        </AlertDialogTitle>
        <AlertDialogDescription>
          {ui.browserWarning.replace('{browser}', browser)}
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  )
}
