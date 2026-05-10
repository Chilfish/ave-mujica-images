/**
 * 排序切换 — shadcn ToggleGroup，oldest/newest
 *
 * 注意：不用 Tooltip 包裹 ToggleGroupItem，因为两者都渲染 <button>，
 * 会导致嵌套 button 的 hydration 错误。用 title 属性替代。
 */

import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

export function SortToggleButtons() {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const order = searchParams.get('order') || 'oldest'

  const ui = uiStrings[locale]

  const handleChange = (val: string) => {
    if (!val)
      return
    const params = new URLSearchParams(searchParams)
    params.set('order', val)
    setSearchParams(params, { replace: true })
  }

  return (
    <ToggleGroup
      type="single"
      value={order}
      onValueChange={handleChange}
    >
      <ToggleGroupItem value="oldest" aria-label={ui.oldestFirst} title={ui.oldestFirst}>
        <ArrowDownWideNarrow className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="newest" aria-label={ui.newestFirst} title={ui.newestFirst}>
        <ArrowUpWideNarrow className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
