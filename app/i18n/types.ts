export type Locale = 'zh-TW' | 'zh-CN'

export interface UIStrings {
  searchPlaceholder: string
  searchResults: string
  noResults: string
  tabAll: string
  tabAveMujica: string
  tabMyGO: string
  copyImage: string
  downloadJpg: string
  copyLink: string
  copied: string
  copiedLink: string
  oldestFirst: string
  newestFirst: string
  allEpisodes: string
  episode: string
  version: string
  updated: string
  loading: string
  backToTop: string
  siteTitle: string
  siteDescription: string
  browserWarning: string
}

export type UIStringsMap = Record<Locale, UIStrings>
