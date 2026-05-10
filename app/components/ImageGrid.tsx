/**
 * 虚拟滚动图片网格 — react-window v2 List + 自适应列数
 *
 * react-window v2 API:
 *   List(rowCount, rowHeight, rowComponent, rowProps)
 *   子元素是 optionally overlay，不是 render prop
 */

import type { Locale } from '~/i18n/types'
import type { ImageEntry } from '~/lib/images'
import { useCallback, useEffect, useRef, useState } from 'react'
import { List, useListCallbackRef } from 'react-window'
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

function Row({
  index,
  style,
  images,
  cols,
  colWidth,
  seriesId,
  locale,
  ui,
}: {
  index: number
  style: React.CSSProperties
  images: ImageEntry[]
  cols: number
  colWidth: number
  seriesId: string
  locale: Locale
  ui: ImageGridProps['ui']
}) {
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
}

export function ImageGrid({ images, seriesId, locale, ui }: ImageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [listRef, listElement] = useListCallbackRef()
  const [containerWidth, setContainerWidth] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const cols = getCols(containerWidth)
  const colWidth = containerWidth > 0 ? Math.floor((containerWidth - CARD_GAP * (cols - 1)) / cols) : 0
  const rowHeight = colWidth > 0 ? Math.floor(colWidth * (9 / 16) + 80) : 0
  const rowCount = containerWidth > 0 ? Math.ceil(images.length / cols) : 0

  // 监听容器尺寸
  useEffect(() => {
    const el = containerRef.current
    if (!el)
      return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 当 images/cols 变化时滚回顶部
  useEffect(() => {
    listRef?.scrollToRow({ index: 0 })
  }, [images, cols, listRef])

  const handleRowsRendered = useCallback(
    ({ visibleRows }: { visibleRows: { startIndex: number, stopIndex: number } }) => {
      setShowScrollTop(visibleRows.startIndex > 5)
    },
    [],
  )

  const scrollToTop = useCallback(() => {
    listRef?.scrollToRow({ index: 0 })
  }, [listRef])

  // 无结果
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">{ui.noResults}</p>
      </div>
    )
  }

  // 等待容器测量
  if (containerWidth === 0 || rowHeight === 0) {
    return <div ref={containerRef} className="flex-1 min-h-[400px]" />
  }

  return (
    <div ref={containerRef} className="flex-1 relative">
      <List
        className="!h-full"
        listRef={listRef}
        rowComponent={Row}
        rowCount={rowCount}
        rowHeight={rowHeight + CARD_GAP}
        rowProps={{
          images,
          cols,
          colWidth,
          seriesId,
          locale,
          ui,
        }}
        onRowsRendered={handleRowsRendered}
        overscanCount={2}
      />

      {/* 回到顶部 */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 size-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-50"
          title="回到顶部"
        >
          ↑
        </button>
      )}
    </div>
  )
}
