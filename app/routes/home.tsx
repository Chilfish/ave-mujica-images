/**
 * 首页 — 搜索 + 图片网格
 *
 * 组件树：
 *   Header (logo + 标语)
 *   SearchPanel (SearchBar + EpisodeFilter + SortToggleButtons)
 *   SeriesTabs
 *   ImageGrid (react-window 虚拟滚动)
 *   Footer
 *   BrowserWarning
 */

import type { Route } from './+types/home'
import type { UIStrings } from '~/i18n/types'
import type { SeriesInfo } from '~/lib/images'
import type { SearchParams, SearchResult } from '~/lib/search'
import { useLoaderData } from 'react-router'
import { BrowserWarning } from '~/components/BrowserWarning'
import { EpisodeFilter } from '~/components/EpisodeFilter'
import { Footer } from '~/components/Footer'
import { ImageGrid } from '~/components/ImageGrid'
import { SearchBar } from '~/components/SearchBar'

import { SeriesTabs } from '~/components/SeriesTabs'
import { SortToggleButtons } from '~/components/SortToggleButtons'
import { getLocale } from '~/i18n/server'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'
import { getImagesBySeries, getSeriesList } from '~/lib/images'
import { getEpisodeList, searchImages } from '~/lib/search'

export function meta() {
  return [
    { title: 'Ave Mujica 截圖搜尋器' },
    { name: 'description', content: '可透過關鍵字搜尋 MyGO 與 Ave Mujica 的台詞截圖、梗圖' },
  ]
}

export interface LoaderData {
  results: SearchResult
  seriesList: SeriesInfo[]
  ui: UIStrings
  locale: string
  currentSeries: string
  episodes: number[]
}

export function loader({ request }: Route.LoaderArgs): LoaderData {
  const url = new URL(request.url)
  const locale = getLocale(request)

  const params: SearchParams = {
    q: url.searchParams.get('q') || undefined,
    series: url.searchParams.get('series') || 'ave-mujica',
    episode: Number.parseInt(url.searchParams.get('episode') || '0', 10) || undefined,
    order: (url.searchParams.get('order') as 'oldest' | 'newest') || 'oldest',
  }

  const seriesList = getSeriesList()
  const images = getImagesBySeries(params.series!)
  const results = searchImages(images, params)
  const episodes = getEpisodeList(images)

  return {
    results,
    seriesList,
    ui: uiStrings[locale],
    locale,
    currentSeries: params.series!,
    episodes,
  }
}

export default function Home() {
  const data = useLoaderData<LoaderData>()
  const [locale] = useLocale()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrowserWarning />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary">
            {data.ui.siteTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.ui.siteDescription}
          </p>
        </div>
      </header>

      {/* Search panel */}
      <div className="sticky top-[60px] z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar />
            <EpisodeFilter episodes={data.episodes} />
            <SortToggleButtons />
          </div>
          <div className="mt-3">
            <SeriesTabs seriesList={data.seriesList} />
          </div>
        </div>
      </div>

      {/* Results info */}
      {data.results.query && (
        <div className="container mx-auto px-4 py-2 text-sm text-muted-foreground">
          {data.ui.searchResults}
          :
          {data.results.total}
        </div>
      )}

      {/* Image grid */}
      <div className="flex-1 container mx-auto px-4 py-4">
        <ImageGrid
          images={data.results.images}
          seriesId={data.currentSeries}
          locale={locale}
          ui={data.ui}
        />
      </div>

      <Footer />
    </div>
  )
}
