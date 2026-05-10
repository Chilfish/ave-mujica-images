/**
 * 搜索框 — shadcn Input + 250ms debounce + URL searchParams
 */

import { Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { Input } from '~/components/ui/input'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

export function SearchBar() {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const value = searchParams.get('q') || ''

  // SSR hydration: 服务端传入的值可能和客户端不一致
  // DOM 本身就是 value source of truth，所以不强制同步
  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.value = value
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (q.trim()) {
        params.set('q', q.trim())
      }
      else {
        params.delete('q')
      }
      setSearchParams(params, { replace: true })
    }, 250)
  }

  const placeholder = uiStrings[locale].searchPlaceholder

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  )
}
