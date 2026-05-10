/**
 * GET /api/images?q=&series=&episode=&order=
 *
 * 返回 JSON 格式的图片搜索结果
 */

import type { Route } from './+types/api.images'
import type { SearchParams } from '~/lib/search'
import { getAllImages, getImagesBySeries } from '~/lib/images'
import { searchImages } from '~/lib/search'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)

  const params: SearchParams = {
    q: url.searchParams.get('q') || undefined,
    series: url.searchParams.get('series') || undefined,
    episode: Number.parseInt(url.searchParams.get('episode') || '0', 10),
    order: (url.searchParams.get('order') as 'oldest' | 'newest') || 'oldest',
  }

  const images = params.series ? getImagesBySeries(params.series) : getAllImages()
  const results = searchImages(images, params)

  const limit = Number.parseInt(url.searchParams.get('limit') || '100', 10)
  const offset = Number.parseInt(url.searchParams.get('offset') || '0', 10)
  const paged = results.images.slice(offset, offset + limit)

  return {
    total: results.total,
    query: results.query,
    limit,
    offset,
    images: paged,
  }
}
