/**
 * 简体中文填充脚本：用 OpenCC 将 text.zh-TW 转为 text.zh-CN
 *
 * 输入：app/data/images/{ave-mujica,mygo}.json
 * 输出：原地写入 text.zh-CN
 *
 * 注意：OpenCC 自动转换可能有误（如「一隻」→「一只」、「後」→「后」），
 * 需人工校对，但自动转换已覆盖 95%+ 的情况。
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Converter } from 'opencc-js'

function main() {
  const converter = Converter({ from: 'tw', to: 'cn' })
  const root = join(import.meta.dirname, '..')
  const series = ['ave-mujica', 'mygo']

  let total = 0
  let converted = 0

  for (const seriesId of series) {
    const jsonPath = join(root, 'app', 'data', 'images', `${seriesId}.json`)
    const entries = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    for (const entry of entries) {
      const tw = entry.text['zh-TW']
      if (!entry.text['zh-CN'] || entry.text['zh-CN'] === '') {
        const cn = converter(tw)
        entry.text['zh-CN'] = cn
        converted++
        if (converted <= 5 || tw !== cn) {
          const same = tw === cn ? ' (同)' : ''
          console.log(`  ${tw} → ${cn}${same}`)
        }
      }
      total++
    }

    writeFileSync(jsonPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf-8')
    console.log(`\n${seriesId}: ${entries.length} 条写入`)
  }

  console.log(`\n总计: ${total} 条, ${converted} 条已填充 zh-CN`)
}

main()
