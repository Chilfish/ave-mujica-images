/**
 * 数据校验脚本：确保 JSON 中每条记录都在 public/images/ 找到对应文件
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface JsonEntry {
  id: string
  episode: number
  text: { 'zh-TW': string, 'zh-CN': string }
  filename: string
}

interface SeriesConfig {
  id: string
  title: { 'zh-TW': string, 'zh-CN': string }
  episodes: number
  logo: string
}

function main() {
  const root = join(import.meta.dirname, '..')
  const seriesPath = join(root, 'app', 'data', 'series.json')
  const seriesConfig: { series: SeriesConfig[] } = JSON.parse(readFileSync(seriesPath, 'utf-8'))

  let allValid = true
  let totalCount = 0
  let missingCount = 0

  for (const series of seriesConfig.series) {
    const jsonPath = join(root, 'app', 'data', 'images', `${series.id}.json`)
    const entries: JsonEntry[] = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    totalCount += entries.length

    console.log(`\n${series.id}: ${entries.length} 条记录`)

    const missing: JsonEntry[] = []
    for (const entry of entries) {
      const filePath = join(root, 'public', 'images', series.id, entry.filename)
      if (!existsSync(filePath)) {
        missing.push(entry)
      }
    }

    if (missing.length > 0) {
      allValid = false
      missingCount += missing.length
      console.log(`  ❌ 缺失 ${missing.length} 个文件:`)
      for (const m of missing.slice(0, 10)) {
        console.log(`    ${m.id}: ${m.filename} (${m.text['zh-TW']})`)
      }
      if (missing.length > 10) {
        console.log(`    ... 还有 ${missing.length - 10} 个`)
      }
    }
    else {
      console.log('  ✅ 全部文件存在')
    }
  }

  console.log(`\n总计: ${totalCount} 条记录, ${missingCount} 个缺失文件`)
  if (allValid) {
    console.log('✅ 校验通过')
  }
  else {
    console.log('❌ 校验失败')
    process.exit(1)
  }
}

main()
