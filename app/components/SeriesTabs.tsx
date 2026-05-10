/**
 * 系列切换标签 — shadcn Tabs，从 series.json 动态生成
 */

import type { SeriesInfo } from '~/lib/images'
import { useSearchParams } from 'react-router'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
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
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        {seriesList.map(series => (
          <TabsTrigger key={series.id} value={series.id}>
            {series.title[locale as 'zh-TW' | 'zh-CN']}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
