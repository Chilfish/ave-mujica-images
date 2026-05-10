/**
 * 集数筛选 — shadcn Select，根据当前系列动态生成选项
 */

import { useSearchParams } from 'react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { uiStrings } from '~/i18n/ui'
import { useLocale } from '~/i18n/use-locale'

interface EpisodeFilterProps {
  episodes: number[]
}

export function EpisodeFilter({ episodes }: EpisodeFilterProps) {
  const [locale] = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get('episode') || '0'

  const handleChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (val && val !== '0') {
      params.set('episode', val)
    }
    else {
      params.delete('episode')
    }
    setSearchParams(params, { replace: true })
  }

  const ui = uiStrings[locale]

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="min-w-fit">
        <SelectValue placeholder={ui.allEpisodes}>
          {(value !== '0' && ui.episode.replace('{episode}', value)) || '全集'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">
          {ui.allEpisodes}
        </SelectItem>
        {episodes.map(ep => (
          <SelectItem key={ep} value={String(ep)}>
            {ui.episode.replace('{episode}', String(ep))}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
