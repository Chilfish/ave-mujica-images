/**
 * 搜索框 — cossui InputGroup + 250ms debounce + URL searchParams
 *
 * 使用 InputGroup / InputGroupInput / InputGroupAddon 模式
 */

import { Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

export function SearchBar() {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const value = searchParams.get('q') || ''

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
      if (q.trim())
        params.set('q', q.trim())
      else params.delete('q')
      setSearchParams(params, { replace: true })
    }, 250)
  }

  const placeholder = uiStrings[locale].searchPlaceholder

  return (
    <InputGroup className="flex-1 min-w-fit">
      <InputGroupInput
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleChange}
      />
      <InputGroupAddon>
        <Search className="size-4" aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
  )
}
