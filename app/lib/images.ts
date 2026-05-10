/**
 * 图片数据加载层
 *
 * 数据来源：app/data/ 下的 JSON 文件
 * 在 Vercel serverless 环境中，这些 JSON 被 Vite 静态打包进 bundle
 */

import type { Locale } from '~/i18n/types'
import aveMujicaData from '~/data/images/ave-mujica.json'
import mygoData from '~/data/images/mygo.json'
import seriesCatalog from '~/data/series.json'

export interface ImageEntry {
  id: string
  episode: number
  text: Record<Locale, string>
  filename: string
}

export interface SeriesInfo {
  id: string
  title: Record<Locale, string>
  episodes: number
  logo: string
}

const imagesBySeries = new Map<string, ImageEntry[]>([
  ['ave-mujica', aveMujicaData as ImageEntry[]],
  ['mygo', mygoData as ImageEntry[]],
])

export function getSeriesList(): SeriesInfo[] {
  return seriesCatalog.series as SeriesInfo[]
}

export function getAllImages(): ImageEntry[] {
  const all: ImageEntry[] = []
  for (const images of imagesBySeries.values()) {
    all.push(...images)
  }
  return all
}

export function getImagesBySeries(seriesId: string): ImageEntry[] {
  return imagesBySeries.get(seriesId) ?? []
}

export function getImageUrl(seriesId: string, filename: string): string {
  return `/images/${seriesId}/${filename}`
}

export function getJpgUrl(seriesId: string, filename: string): string {
  return getImageUrl(seriesId, filename.replace('.webp', '.jpg'))
}
