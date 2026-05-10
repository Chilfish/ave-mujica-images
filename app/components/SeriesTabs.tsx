/**
 * 系列切换 — Select 下拉，和 EpisodeFilter 一致
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
import { useLocale } from '~/i18n/use-locale'

interface SeriesTabsProps {
  seriesList: SeriesInfo[]
}

export function SeriesTabs({ seriesList }: SeriesTabsProps) {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const current = searchParams.get('series') || seriesList[0]?.id || 'ave-mujica'

  const handleChange = (val: string | null) => {
    if (!val)
      return
    const params = new URLSearchParams(searchParams)
    params.set('series', val)
    params.delete('episode')
    setSearchParams(params, { replace: true })
  }

  const currentTitle = seriesList.find(s => s.id === current)?.title[locale as 'zh-TW' | 'zh-CN']

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="min-w-fit">
        <SelectValue>
          {currentTitle}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {seriesList.map(series => (
          <SelectItem key={series.id} value={series.id}>
            {series.title[locale as 'zh-TW' | 'zh-CN']}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
