/**
 * 首页 — Apple UX
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
import { getAllImages, getImagesBySeries, getSeriesList } from '~/lib/images'
import { getEpisodeList } from '~/lib/search'

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
  const series = url.searchParams.get('series') || ''

  const isAll = !series || series === 'all'
  const images = isAll ? getAllImages() : getImagesBySeries(series)

  return {
    seriesList: getSeriesList(),
    ui: uiStrings[locale],
    locale,
    currentSeries: isAll ? '' : series,
    episodes: getEpisodeList(images),
  }
}

export function meta({ data }: Route.MetaArgs) {
  const ui = (data as LoaderData)?.ui
  return [
    { title: ui?.siteTitle ?? 'Ave Mujica 截圖搜尋器' },
    { name: 'description', content: ui?.siteDescription ?? '' },
  ]
}

function SearchResults() {
  const data = useLoaderData<LoaderData>()
  const [locale] = useLocale()
  const { images, isLoading, hasMore, loadMore, total } = useImageSearch({
    series: data.currentSeries || 'all',
  })

  return (
    <ImageGrid
      images={images}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      total={total}
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

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
              {data.ui.siteShortTitle}
            </h1>
          </div>
          <LocaleSwitcher />
        </div>

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

      <div className="container mx-auto px-3 sm:px-4 py-3">
        <SearchResults />
      </div>

      <div className="text-center py-8">
        <p className="text-[10px] text-muted-foreground/50">
          {data.ui.version}
          {' '}
          2.0.0 ·
          {' '}
          {data.ui.updated}
          {' '}
          2026-05-10
        </p>
      </div>
    </div>
  )
}
