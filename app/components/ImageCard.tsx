/**
 * 单张图片卡片 — 原生 lazy loading + hover 台词 + 悬浮操作按钮
 */

import type { Locale } from '~/i18n/types'
import type { ImageEntry } from '~/lib/images'
import { useCallback, useRef, useState } from 'react'
import { ImageActions } from './ImageActions'

interface ImageCardProps {
  image: ImageEntry
  seriesId: string
  locale: Locale
  ui: {
    copyImage: string
    downloadJpg: string
    copyLink: string
    copied: string
    copiedLink: string
    episode: string
  }
}

export function ImageCard({ image, seriesId, locale, ui }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const url = `/images/${seriesId}/${image.filename}`
  const displayText = image.text[locale] || image.text['zh-TW']
  const episodeLabel = ui.episode.replace('{episode}', String(image.episode))

  const handleLoad = useCallback(() => setLoaded(true), [])

  return (
    <div
      className="group relative rounded-lg overflow-hidden border bg-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 图片 */}
      <div className="aspect-[16/9] relative">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          ref={imgRef}
          src={url}
          alt={displayText}
          loading="lazy"
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Hover 台词覆盖层 */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 transition-opacity duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-sm text-white font-medium line-clamp-3">{displayText}</p>
        <p className="text-xs text-white/60 mt-1">{episodeLabel}</p>
      </div>

      {/* 悬浮操作按钮 */}
      <ImageActions
        image={image}
        seriesId={seriesId}
        ui={ui}
        visible={hovered}
      />
    </div>
  )
}
