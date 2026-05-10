/**
 * 首页 — 搜索 + 无限滚动图片网格
 *
 * 架构：
 * - SSR loader：只提供系列目录、UI 文案、集数列表（轻量 <5KB）
 * - 客户端：useImageSearch hook → fetch /api/images 分页加载
 *
 * Apple UX：
 * - 渐进加载、骨架屏、流畅滚动
 * - 手机端 2 列、平板 3 列、桌面 4 列
 * - Sticky header + search bar
 */

import type { Route } from './+types/home'
import type { UIStrings } from '~/i18n/types'
import type { SeriesInfo } from '~/lib/images'
import { useLoaderData } from 'react-router'
import { BrowserWarning } from '~/components/BrowserWarning'
import { EpisodeFilter } from '~/components/EpisodeFilter'
import { Footer } from '~/components/Footer'
import { ImageGrid } from '~/components/ImageGrid'
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
    <div className="min-h-screen flex flex-col bg-background">
      <BrowserWarning />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <h1 className="text-lg sm:text-xl font-bold text-primary">
            {data.ui.siteTitle}
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {data.ui.siteDescription}
          </p>
        </div>
      </header>

      {/* Search panel — sticky below header */}
      <div className="sticky top-[56px] sm:top-[60px] z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar />
            <EpisodeFilter episodes={data.episodes} />
            <SortToggleButtons />
          </div>
          <div className="mt-2">
            <SeriesTabs seriesList={data.seriesList} />
          </div>
        </div>
      </div>

      {/* Image grid — client-side data */}
      <div className="flex-1 container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <SearchResults />
      </div>

      <Footer />
    </div>
  )
}
