/**
 * 搜索逻辑 — 纯函数，服务端和客户端共用
 *
 * 搜索策略：
 * - 同时匹配 zh-TW 和 zh-CN 字段
 * - 大小写不敏感
 * - 支持系列筛选、集数筛选、排序
 */

import type { ImageEntry } from './images'

export interface SearchParams {
  q?: string
  series?: string
  episode?: number
  order?: 'oldest' | 'newest'
}

export interface SearchResult {
  images: ImageEntry[]
  total: number
  query: string
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

function matchesQuery(image: ImageEntry, q: string): boolean {
  const lowerQ = normalize(q)
  return (
    normalize(image.text['zh-TW']).includes(lowerQ)
    || normalize(image.text['zh-CN']).includes(lowerQ)
  )
}

export function searchImages(allImages: ImageEntry[], params: SearchParams): SearchResult {
  let images = [...allImages]

  // 系列筛选
  if (params.series) {
    images = images.filter(img => img.id.startsWith(params.series!))
  }

  // 关键词搜索
  const query = params.q?.trim() ?? ''
  if (query) {
    images = images.filter(img => matchesQuery(img, query))
  }

  // 集数筛选
  if (params.episode && params.episode > 0) {
    images = images.filter(img => img.episode === params.episode)
  }

  // 排序
  const order = params.order ?? 'oldest'
  images.sort((a, b) => {
    const cmp = a.episode - b.episode || a.id.localeCompare(b.id)
    return order === 'newest' ? -cmp : cmp
  })

  return {
    images,
    total: images.length,
    query,
  }
}

/**
 * 获取指定系列的所有集数列表
 */
export function getEpisodeList(images: ImageEntry[]): number[] {
  const episodes = new Set(images.map(img => img.episode))
  return [...episodes].sort((a, b) => a - b)
}
