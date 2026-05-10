/**
 * 悬浮操作按钮组 — 复制图片 / 下载 JPG / 复制链接
 *
 * Apple UX：min 44px touch target，半透明毛玻璃背景
 */

import { Copy, Download, Link2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toastManager } from '~/components/ui/toast'
import { useIsMobile } from '~/hooks/use-mobile'

interface ImageResult {
  id: string
  episode: number
  text: Record<string, string>
  filename: string
}

interface ImageActionsProps {
  image: ImageResult
  seriesId: string
  ui: {
    copyImage: string
    downloadJpg: string
    copyLink: string
    copied: string
    copiedLink: string
  }
  visible: boolean
}

export function ImageActions({ image, seriesId, ui, visible }: ImageActionsProps) {
  const [pending, setPending] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const webpUrl = `/images/${seriesId}/${image.filename}`
  const jpgUrl = webpUrl.replace('.webp', '.jpg')

  const copyImage = useCallback(async () => {
    setPending('copy')
    try {
      const resp = await fetch(webpUrl)
      const blob = await resp.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
      toastManager.add({ title: ui.copied })
    }
    catch {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = webpUrl
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ])
          toastManager.add({ title: ui.copied })
          return
        }
      }
      toastManager.add({ title: '复制失败' })
    }
    finally {
      setPending(null)
    }
  }, [webpUrl, ui])

  const copyLink = useCallback(async () => {
    setPending('link')
    const url = new URL(webpUrl, window.location.origin).href
    await navigator.clipboard.writeText(url)
    toastManager.add({ title: ui.copiedLink })
    setPending(null)
  }, [webpUrl, ui])

  const btnSize = isMobile ? 'size-11' : 'size-8'
  const iconSize = isMobile ? 'size-4.5' : 'size-3.5'

  return (
    <div
      className={`absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 复制图片 */}
      <button
        type="button"
        onClick={copyImage}
        disabled={pending !== null}
        title={ui.copyImage}
        className={`${btnSize} rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 active:bg-white/35 flex items-center justify-center text-white transition-colors disabled:opacity-50`}
      >
        <Copy className={iconSize} />
      </button>

      {/* 下载 JPG */}
      <a
        href={jpgUrl}
        download
        title={ui.downloadJpg}
        className={`${btnSize} rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 active:bg-white/35 flex items-center justify-center text-white transition-colors`}
      >
        <Download className={iconSize} />
      </a>

      {/* 复制链接 */}
      <button
        type="button"
        onClick={copyLink}
        disabled={pending !== null}
        title={ui.copyLink}
        className={`${btnSize} rounded-lg bg-white/15 backdrop-blur-sm hover:bg-white/25 active:bg-white/35 flex items-center justify-center text-white transition-colors disabled:opacity-50`}
      >
        <Link2 className={iconSize} />
      </button>
    </div>
  )
}
