/**
 * 系列切换 — Apple-style segmented control
 *
 * iOS 风格：紧凑的 pill 分段控件，适合和搜索框同排
 */

import type { SeriesInfo } from '~/lib/images'
import { useSearchParams } from 'react-router'
import { useLocale } from '~/i18n/use-locale'

interface SeriesTabsProps {
  seriesList: SeriesInfo[]
}

export function SeriesTabs({ seriesList }: SeriesTabsProps) {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const current = searchParams.get('series') || seriesList[0]?.id || 'ave-mujica'

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('series', val)
    params.delete('episode')
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="inline-flex items-center rounded-lg bg-muted p-0.5 text-sm">
      {seriesList.map(series => (
        <button
          type="button"
          key={series.id}
          onClick={() => handleChange(series.id)}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            current === series.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {series.title[locale as 'zh-TW' | 'zh-CN']}
        </button>
      ))}
    </div>
  )
}
