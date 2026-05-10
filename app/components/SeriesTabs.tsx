/**
 * 系列切换 — Select 下拉，含「全部系列」选项
 *
 * 无论多少系列都不会溢出，始终紧凑一个选择器宽度
 */

import type { SeriesInfo } from '~/lib/images'
import { useSearchParams } from 'react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

interface SeriesTabsProps {
  seriesList: SeriesInfo[]
}

export function SeriesTabs({ seriesList }: SeriesTabsProps) {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const current = searchParams.get('series') || 'all'

  const ui = uiStrings[locale]

  const handleChange = (val: string | null) => {
    if (!val)
      return
    const params = new URLSearchParams(searchParams)
    if (val === 'all')
      params.delete('series')
    else params.set('series', val)
    params.delete('episode')
    setSearchParams(params, { replace: true })
  }

  const currentTitle
    = current === 'all'
      ? ui.allSeries
      : seriesList.find(s => s.id === current)?.title[locale] ?? ui.allSeries

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="min-w-fit">
        <SelectValue>{currentTitle}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{ui.allSeries}</SelectItem>
        {seriesList.map(series => (
          <SelectItem key={series.id} value={series.id}>
            {series.title[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
