/**
 * 悬浮操作按钮组 — 复制图片 / 下载 JPG / 复制链接
 *
 * 浏览器兼容：
 * - ClipboardItem.write 需要安全上下文（HTTPS 或 localhost）
 * - 降级方案：创建临时 canvas → toBlob → ClipboardItem
 */

import type { ImageEntry } from '~/lib/images'
import { Copy, Download, Link2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '~/components/ui/button'
import { toastManager } from '~/components/ui/toast'

interface ImageActionsProps {
  image: ImageEntry
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
      toastManager.show({ title: ui.copied })
    }
    catch {
      // 降级：canvas → clipboard
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
          toastManager.show({ title: ui.copied })
          return
        }
      }
      toastManager.show({ title: '复制失败，请尝试下载' })
    }
    finally {
      setPending(null)
    }
  }, [webpUrl, ui])

  const copyLink = useCallback(async () => {
    setPending('link')
    const url = new URL(webpUrl, window.location.origin).href
    await navigator.clipboard.writeText(url)
    toastManager.show({ title: ui.copiedLink })
    setPending(null)
  }, [webpUrl, ui])

  return (
    <div
      className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={copyImage}
        disabled={pending !== null}
        title={ui.copyImage}
      >
        <Copy className="size-3.5" />
      </Button>
      <a
        href={jpgUrl}
        download
        title={ui.downloadJpg}
        className="inline-flex items-center justify-center size-8 sm:size-7 rounded-lg border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer"
      >
        <Download className="size-3.5" />
      </a>
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={copyLink}
        disabled={pending !== null}
        title={ui.copyLink}
      >
        <Link2 className="size-3.5" />
      </Button>
    </div>
  )
}
