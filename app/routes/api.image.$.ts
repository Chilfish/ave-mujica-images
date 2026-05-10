/**
 * GET /api/image/{series}/{id}
 *
 * 返回单张图片的详细信息
 */

import type { Route } from './+types/api.image.$'
import { getImagesBySeries, getImageUrl, getJpgUrl } from '~/lib/images'

export function loader({ request, params }: Route.LoaderArgs) {
  const splat = params['*'] ?? ''
  // splat format: {series}/{id}
  const slashIdx = splat.indexOf('/')
  if (slashIdx === -1) {
    return { error: 'Invalid path' }
  }

  const seriesId = splat.slice(0, slashIdx)
  const imageId = splat.slice(slashIdx + 1)

  const images = getImagesBySeries(seriesId)
  const image = images.find(img => img.id === imageId)

  if (!image) {
    return { error: 'Image not found' }
  }

  return {
    id: image.id,
    episode: image.episode,
    text: image.text,
    urls: {
      webp: getImageUrl(seriesId, image.filename),
      jpg: getJpgUrl(seriesId, image.filename),
    },
  }
}
