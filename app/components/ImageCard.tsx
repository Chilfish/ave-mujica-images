/**
 * 单张图片卡片 — 16:9 比例、hover 台词覆盖层
 */

import type { Locale } from '~/i18n/types'
import { useCallback, useState } from 'react'
import { useIsMobile } from '~/hooks/use-mobile'
import { ImageActions } from './ImageActions'

interface ImageResult {
  id: string
  episode: number
  text: Record<Locale, string>
  filename: string
}

interface ImageCardProps {
  image: ImageResult
  locale: Locale
  ui: {
    copyImage: string
    downloadJpg: string
    copyLink: string
    copied: string
    copiedLink: string
    loadFailed: string
    episode: string
  }
}

/** 从 id 推导系列：ave-mujica-e01-001 → ave-mujica */
function seriesFromId(id: string): string {
  return id.replace(/-e\d+-\d+$/, '')
}

export function ImageCard({ image, locale, ui }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const isMobile = useIsMobile()

  const seriesId = seriesFromId(image.id)
  const url = `/images/${seriesId}/${image.filename}`
  const displayText = image.text[locale] || image.text['zh-TW']
  const episodeLabel = ui.episode.replace('{episode}', String(image.episode))

  const handleLoad = useCallback(() => setLoaded(true), [])
  const handleTap = useCallback(() => {
    if (isMobile)
      setTapped(v => !v)
  }, [isMobile])

  const showOverlay = isMobile ? tapped : hovered

  return (
    <div
      className="group relative rounded-lg overflow-hidden border bg-card cursor-pointer"
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={handleTap}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={url}
          alt={displayText}
          loading="lazy"
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className="px-2.5 py-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{episodeLabel}</span>
        <span className="text-[10px] opacity-50 tabular-nums">
          {image.id.split('-').pop()}
        </span>
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3 transition-opacity duration-200 ${
          showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-[13px] leading-snug text-white font-medium line-clamp-4">
          {displayText}
        </p>
      </div>

      <ImageActions image={image} ui={ui} visible={showOverlay} />
    </div>
  )
}
