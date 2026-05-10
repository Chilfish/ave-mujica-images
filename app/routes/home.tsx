/**
 * 首页 — Apple UX
 *
 * 单 sticky header：标题 + 语言切换 + 工具栏（搜索/系列/集数/排序全在一排）
 * 无 footer，版本信息在网格底部
 */

import type { Route } from './+types/home'
import type { UIStrings } from '~/i18n/types'
import type { SeriesInfo } from '~/lib/images'
import { useLoaderData } from 'react-router'
import { BrowserWarning } from '~/components/BrowserWarning'
import { EpisodeFilter } from '~/components/EpisodeFilter'
import { ImageGrid } from '~/components/ImageGrid'
import { LocaleSwitcher } from '~/components/LocaleSwitcher'
import { SearchBar } from '~/components/SearchBar'
import { SeriesTabs } from '~/components/SeriesTabs'
import { SortToggleButtons } from '~/components/SortToggleButtons'
import { useImageSearch } from '~/hooks/use-image-search'
import { getLocale } from '~/i18n/server'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'
import { getImagesBySeries, getSeriesList } from '~/lib/images'
import { getEpisodeList } from '~/lib/search'

export function meta() {
  return [
    { title: 'Ave Mujica 截圖搜尋器' },
    { name: 'description', content: '可透過關鍵字搜尋 MyGO 與 Ave Mujica 的台詞截圖、梗圖' },
  ]
}

export interface LoaderData {
  seriesList: SeriesInfo[]
  ui: UIStrings
  locale: string
  currentSeries: string
  episodes: number[]
}

export function loader({ request }: Route.LoaderArgs): LoaderData {
  const url = new URL(request.url)
  const locale = getLocale(request)
  const series = url.searchParams.get('series') || 'ave-mujica'

  return {
    seriesList: getSeriesList(),
    ui: uiStrings[locale],
    locale,
    currentSeries: series,
    episodes: getEpisodeList(getImagesBySeries(series)),
  }
}

function SearchResults() {
  const data = useLoaderData<LoaderData>()
  const [locale] = useLocale()
  const { images, isLoading, hasMore, loadMore, total } = useImageSearch({
    series: data.currentSeries,
  })

  return (
    <ImageGrid
      images={images}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      total={total}
      seriesId={data.currentSeries}
      locale={locale}
      ui={data.ui}
    />
  )
}

export default function Home() {
  const data = useLoaderData<LoaderData>()

  return (
    <div className="min-h-screen bg-background">
      <BrowserWarning />

      {/* Apple-style single sticky header bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        {/* Title row */}
        <div className="container mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
              截圖搜尋器
            </h1>
          </div>
          <LocaleSwitcher />
        </div>

        {/* Toolbar — search full width, filters wrap below */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar />
            <div className="flex items-center gap-2">
              <SeriesTabs seriesList={data.seriesList} />
              <EpisodeFilter episodes={data.episodes} />
              <SortToggleButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Image grid */}
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <SearchResults />
      </div>

      {/* Subtle version at very bottom */}
      <div className="text-center py-8">
        <p className="text-[10px] text-muted-foreground/50">
          {data.ui.version}
          {' '}
          2.0.0 ·
          {data.ui.updated}
          {' '}
          2026-05-10
        </p>
      </div>
    </div>
  )
}
