/**
 * 排序切换 — shadcn ToggleGroup，oldest/newest
 */

import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
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
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="oldest" aria-label={ui.oldestFirst}>
            <ArrowDownWideNarrow className="size-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>{ui.oldestFirst}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="newest" aria-label={ui.newestFirst}>
            <ArrowUpWideNarrow className="size-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>{ui.newestFirst}</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  )
}
