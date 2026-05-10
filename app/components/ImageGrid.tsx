/**
 * 图片网格 — CSS Grid + 无限滚动
 *
 * Apple UX 原则：
 * - 渐进加载，不一次性渲染全部
 * - 紧凑间距（12px gap），让图片呼吸
 * - 骨架屏加载态
 * - 大触控目标（手机端图片卡片足够大）
 */

import type { useImageSearch } from '~/hooks/use-image-search'
import type { Locale } from '~/i18n/types'
import { useEffect, useRef } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { ImageCard } from './ImageCard'

type HookReturn = ReturnType<typeof useImageSearch>

interface ImageGridProps {
  images: HookReturn['images']
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  total: number
  seriesId: string
  locale: Locale
  ui: {
    copyImage: string
    downloadJpg: string
    copyLink: string
    copied: string
    copiedLink: string
    episode: string
    noResults: string
  }
}

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-2 space-y-1.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
  )
}

export function ImageGrid({
  images,
  isLoading,
  hasMore,
  loadMore,
  total,
  seriesId,
  locale,
  ui,
}: ImageGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver 无限滚动
  useEffect(() => {
    const el = sentinelRef.current
    if (!el)
      return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }, // 提前 200px 触发
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  // 初始加载态
  if (images.length === 0 && isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // 无结果
  if (images.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">{ui.noResults}</p>
      </div>
    )
  }

  return (
    <div>
      {/* 网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map(img => (
          <ImageCard
            key={img.id}
            image={img}
            seriesId={seriesId}
            locale={locale}
            ui={ui}
          />
        ))}
      </div>

      {/* 加载更多骨架 */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
        </div>
      )}

      {/* Sentinel + 状态 */}
      <div ref={sentinelRef} className="py-8 text-center text-sm text-muted-foreground">
        {isLoading && images.length > 0
          ? '加载中...'
          : hasMore
            ? `已加载 ${images.length} / ${total}`
            : images.length > 0
              ? `共 ${total} 张`
              : null}
      </div>
    </div>
  )
}
