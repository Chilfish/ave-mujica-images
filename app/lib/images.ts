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

/** S3 存储根路径 */
export const S3_BASE = 'https://s3.chilfish.top/bangumi'

/** S3 上配置文件地址（本地 app/data/ 保留作备份） */
export const S3_SERIES_JSON = `${S3_BASE}/series.json`
export const S3_IMAGES_JSON = (seriesId: string) => `${S3_BASE}/${seriesId}.json`

/**
 * 从 image.id 推导系列名：ave-mujica-e01-001 → ave-mujica
 */
export function seriesIdFromImageId(id: string): string {
  return id.replace(/-e\d+-\d+$/, '')
}

export function getImageUrl(seriesId: string, filename: string): string {
  return `${S3_BASE}/webp/${seriesId}/${filename}`
}

export function getJpgUrl(seriesId: string, filename: string): string {
  return `${S3_BASE}/jpg/${seriesId}/${filename.replace('.webp', '.jpg')}`
}
