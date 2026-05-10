import type { Route } from './+types/home'
import type { UIStrings } from '~/i18n/types'
import type { ImageEntry, SeriesInfo } from '~/lib/images'
import type { SearchParams, SearchResult } from '~/lib/search'
import { useLoaderData, useSearchParams } from 'react-router'
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
    episode: Number.parseInt(url.searchParams.get('episode') || '0', 10),
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
  const [searchParams, setSearchParams] = useSearchParams()

  const displayText = (image: ImageEntry) =>
    image.text[locale as 'zh-TW' | 'zh-CN'] || image.text['zh-TW']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">
            {locale === 'zh-CN' ? '截图搜寻器' : '截圖搜尋器'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{data.currentSeries === 'ave-mujica' ? 'Ave Mujica' : 'MyGO!!!!!'}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder={data.ui.searchPlaceholder}
            defaultValue={searchParams.get('q') || ''}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border bg-background text-foreground"
            onChange={(e) => {
              const params = new URLSearchParams(searchParams)
              if (e.target.value)
                params.set('q', e.target.value)
              else params.delete('q')
              setSearchParams(params, { replace: true })
            }}
          />

          {/* Series tabs */}
          <div className="flex rounded-lg border overflow-hidden">
            {data.seriesList.map(series => (
              <button
                type="button"
                key={series.id}
                className={`px-4 py-2 text-sm ${
                  data.currentSeries === series.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  params.set('series', series.id)
                  params.delete('episode')
                  setSearchParams(params, { replace: true })
                }}
              >
                {series.title[locale as 'zh-TW' | 'zh-CN']}
              </button>
            ))}
          </div>

          {/* Episode filter */}
          <select
            className="px-4 py-2 rounded-lg border bg-background text-foreground"
            value={searchParams.get('episode') || '0'}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams)
              if (e.target.value !== '0')
                params.set('episode', e.target.value)
              else params.delete('episode')
              setSearchParams(params, { replace: true })
            }}
          >
            <option value="0">{data.ui.allEpisodes}</option>
            {data.episodes.map(ep => (
              <option key={ep} value={ep}>
                {data.ui.episode.replace('{episode}', String(ep))}
              </option>
            ))}
          </select>

          {/* Sort toggle */}
          <button
            type="button"
            className="px-4 py-2 rounded-lg border hover:bg-muted text-sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('order', searchParams.get('order') === 'newest' ? 'oldest' : 'newest')
              setSearchParams(params, { replace: true })
            }}
          >
            {searchParams.get('order') === 'newest' ? data.ui.newestFirst : data.ui.oldestFirst}
          </button>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          {data.results.query
            ? `${data.results.total} ${data.results.query ? data.ui.searchResults : ''}`
            : ''}
        </div>

        {/* Image grid (basic, will be replaced by react-window in phase 4) */}
        {data.results.images.length === 0
          ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-lg">{data.ui.noResults}</p>
              </div>
            )
          : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.results.images.slice(0, 100).map(image => (
                  <div key={image.id} className="group relative rounded-lg overflow-hidden border bg-card">
                    <img
                      src={`/images/${data.currentSeries}/${image.filename}`}
                      alt={displayText(image)}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white">{displayText(image)}</p>
                      <p className="text-xs text-white/70">
                        {data.ui.episode.replace('{episode}', String(image.episode))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          {data.ui.version}
          : 2.0.0 |
          {data.ui.updated}
          : 2026-05-10
        </p>
      </footer>
    </div>
  )
}
