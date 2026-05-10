/**
 * 客户端图片搜索 hook — 无限滚动分页
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

export interface ImageResult {
  id: string
  episode: number
  text: { 'zh-TW': string, 'zh-CN': string }
  filename: string
}

interface UseImageSearchOptions {
  series: string
}

export function useImageSearch({ series }: UseImageSearchOptions) {
  const [searchParams] = useSearchParams()
  const [images, setImages] = useState<ImageResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | undefined>(undefined)
  const lastKey = useRef('')
  const didInit = useRef(false)

  const q = searchParams.get('q') || ''
  const ep = searchParams.get('episode') || ''
  const ord = searchParams.get('order') || 'oldest'
  const key = `${q}|${ep}|${ord}|${series}`

  const doFetch = useCallback(async (pageNum: number, reset: boolean) => {
    if (isLoading)
      return
    if (reset)
      lastKey.current = key

    setIsLoading(true)
    setError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const params = new URLSearchParams()
    if (q)
      params.set('q', q)
    if (series && series !== 'all')
      params.set('series', series)
    if (ep)
      params.set('episode', ep)
    params.set('order', ord)
    params.set('page', String(pageNum))
    params.set('limit', '60')

    try {
      const resp = await fetch(`/api/images?${params}`, {
        signal: abortRef.current.signal,
        headers: { Accept: 'application/json' },
      })
      if (!resp.ok)
        throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()

      if (reset)
        setImages(data.images)
      else setImages(prev => [...prev, ...data.images])

      setTotal(data.total)
      setPage(data.page)
      setHasMore(data.hasMore)
    }
    catch (err: any) {
      if (err.name !== 'AbortError')
        setError(err.message)
    }
    finally {
      setIsLoading(false)
    }
  }, [isLoading, key, q, ep, ord, series])

  // 监听 searchParams 变化
  useEffect(() => {
    if (!didInit.current) {
      // 首次：加载第一页
      didInit.current = true
      doFetch(1, true)
    }
    else if (key !== lastKey.current) {
      // 参数变化：重置
      setImages([])
      setPage(0)
      setHasMore(true)
      doFetch(1, true)
    }
  }, [key])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore)
      doFetch(page + 1, false)
  }, [isLoading, hasMore, page, doFetch])

  return { images, total, isLoading, hasMore, error, loadMore }
}
