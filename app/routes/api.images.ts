/**
 * GET /api/images?q=&series=&episode=&order=&page=1&limit=60
 *
 * 支持分页的图片搜索 API
 */

import type { Route } from './+types/api.images'
import type { SearchParams } from '~/lib/search'
import { getAllImages, getImagesBySeries } from '~/lib/images'
import { searchImages } from '~/lib/search'

export interface PaginatedResult {
  images: Array<{
    id: string
    episode: number
    text: { 'zh-TW': string, 'zh-CN': string }
    filename: string
  }>
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
  query?: string
  series?: string
  episode?: number
  order?: string
}

export function loader({ request }: Route.LoaderArgs): PaginatedResult {
  const url = new URL(request.url)

  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(200, Math.max(12, Number.parseInt(url.searchParams.get('limit') || '60', 10)))

  const params: SearchParams = {
    q: url.searchParams.get('q') || undefined,
    series: url.searchParams.get('series') || undefined,
    episode: Number.parseInt(url.searchParams.get('episode') || '0', 10) || undefined,
    order: (url.searchParams.get('order') as 'oldest' | 'newest') || 'oldest',
  }

  const images = params.series ? getImagesBySeries(params.series) : getAllImages()
  const results = searchImages(images, params)

  const start = (page - 1) * limit
  const end = start + limit
  const pageImages = results.images.slice(start, end)

  return {
    images: pageImages,
    total: results.total,
    page,
    limit,
    totalPages: Math.ceil(results.total / limit),
    hasMore: end < results.total,
    query: params.q,
    series: params.series,
    episode: params.episode,
    order: params.order,
  }
}
