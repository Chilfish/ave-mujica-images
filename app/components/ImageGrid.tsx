/**
 * 虚拟滚动图片网格 — react-window VariableSizeList + 自适应列数
 *
 * 替代原来的 react-virtualized (WindowScroller/AutoSizer/CellMeasurer)
 * 列数依据 viewport 宽度：<640 → 2, <1024 → 3, >=1024 → 4
 */

import type { Locale } from '~/i18n/types'
import type { ImageEntry } from '~/lib/images'
import { useCallback, useEffect, useRef, useState } from 'react'
import { List } from 'react-window'
import { ImageCard } from './ImageCard'

interface ImageGridProps {
  images: ImageEntry[]
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

function getCols(width: number): number {
  if (width < 640)
    return 2
  if (width < 1024)
    return 3
  return 4
}

const CARD_GAP = 16
const CARD_ASPECT = 9 / 16

export function ImageGrid({ images, seriesId, locale, ui }: ImageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<List>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const cols = getCols(containerWidth)
  const colWidth = Math.floor((containerWidth - CARD_GAP * (cols - 1)) / cols)
  const rowHeight = Math.floor(colWidth * CARD_ASPECT + 80) // + 台词区域
  const rowCount = Math.ceil(images.length / cols)

  // 监听容器尺寸
  useEffect(() => {
    const el = containerRef.current
    if (!el)
      return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerWidth(width)
        setContainerHeight(height)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 当 images/cols 变化时刷新列表
  useEffect(() => {
    listRef.current?.scrollToItem(0, 'start')
  }, [images, cols])

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setShowScrollTop(scrollOffset > 500)
  }, [])

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToItem(0, 'start')
  }, [])

  // 无结果
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">{ui.noResults}</p>
      </div>
    )
  }

  if (containerWidth === 0) {
    return <div ref={containerRef} className="flex-1" />
  }

  return (
    <div ref={containerRef} className="flex-1 relative">
      <List
        ref={listRef}
        width={containerWidth}
        height={containerHeight}
        itemCount={rowCount}
        itemSize={rowHeight + CARD_GAP}
        onScroll={handleScroll}
        overscanCount={2}
      >
        {({ index, style }) => {
          const start = index * cols
          const rowImages = images.slice(start, start + cols)

          return (
            <div
              style={{
                ...style,
                paddingBottom: CARD_GAP,
              }}
              className="flex gap-4"
            >
              {rowImages.map(image => (
                <div key={image.id} style={{ width: colWidth }}>
                  <ImageCard
                    image={image}
                    seriesId={seriesId}
                    locale={locale}
                    ui={ui}
                  />
                </div>
              ))}
            </div>
          )
        }}
      </List>

      {/* 回到顶部 */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 size-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-50"
        >
          ↑
        </button>
      )}
    </div>
  )
}
