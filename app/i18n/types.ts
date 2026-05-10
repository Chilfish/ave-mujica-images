export type Locale = 'zh-TW' | 'zh-CN'

export interface UIStrings {
  searchPlaceholder: string
  searchResults: string
  noResults: string
  allSeries: string
  allEpisodes: string
  episode: string
  copyImage: string
  downloadJpg: string
  copyLink: string
  copied: string
  copiedLink: string
  oldestFirst: string
  newestFirst: string
  version: string
  updated: string
  loading: string
  loadedCount: string
  backToTop: string
  siteTitle: string
  siteShortTitle: string
  siteDescription: string
  browserWarningTitle: string
  browserWarning: string
  loadFailed: string
  notFoundTitle: string
  backToHome: string
}

export type UIStringsMap = Record<Locale, UIStrings>
