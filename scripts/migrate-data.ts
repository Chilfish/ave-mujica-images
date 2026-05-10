/**
 * 数据迁移脚本：从 contentLayoutSlice.ts 抽取图片元数据到 JSON
 *
 * 输入：src/layout/contentLayoutSlice.ts
 * 输出：
 *   app/data/images/ave-mujica.json
 *   app/data/images/mygo.json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface ParsedEntry {
  name: string
  episode: number
}

interface OutputEntry {
  id: string
  episode: number
  text: { 'zh-TW': string, 'zh-CN': string }
  filename: string
}

function pad(num: number): string {
  return String(num).padStart(2, '0')
}

function parseArrayContent(content: string, arrayName: string): ParsedEntry[] {
  const startMarker = `${arrayName}: [`
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1)
    throw new Error(`找不到 ${arrayName}`)

  const fromStart = content.slice(startIdx + startMarker.length)

  // 找到匹配的 ]
  let depth = 1
  let endIdx = 0
  for (let i = 0; i < fromStart.length; i++) {
    if (fromStart[i] === '[') {
      depth++
    }
    else if (fromStart[i] === ']') {
      depth--
      if (depth === 0) {
        endIdx = i
        break
      }
    }
  }

  const arrayStr = fromStart.slice(0, endIdx)

  // 解析每个 { name: "...", episode: X }
  const entries: ParsedEntry[] = []
  const objRegex = /\{\s*name:\s*(['"])(.+?)\1\s*,\s*episode:\s*(\d+)\s*\}/gs
  let match
  match = objRegex.exec(arrayStr)
  while (match !== null) {
    entries.push({
      name: match[2]!,
      episode: Number.parseInt(match[3]!, 10),
    })
    match = objRegex.exec(arrayStr)
  }

  return entries
}

function generateOutput(entries: ParsedEntry[], seriesId: string): OutputEntry[] {
  // 按 episode 分组，组内按原始顺序编号
  const byEpisode = new Map<number, ParsedEntry[]>()
  for (const e of entries) {
    const list = byEpisode.get(e.episode)
    if (list)
      list.push(e)
    else byEpisode.set(e.episode, [e])
  }

  const output: OutputEntry[] = []
  for (const [ep, items] of [...byEpisode.entries()].sort((a, b) => a[0] - b[0])) {
    items.forEach((item, idx) => {
      const seq = idx + 1
      const epStr = pad(ep)
      const seqStr = pad(seq)
      output.push({
        id: `${seriesId}-e${epStr}-${seqStr}`,
        episode: ep,
        text: {
          'zh-TW': item.name,
          'zh-CN': '', // 阶段 5 填充
        },
        filename: `e${epStr}-${seqStr}.webp`,
      })
    })
  }

  return output
}

function printStats(entries: OutputEntry[], label: string) {
  const eps = new Set(entries.map(e => e.episode))
  console.log(`\n${label}: ${entries.length} 张图片, 跨越 ${eps.size} 集`)
  for (const ep of [...eps].sort((a, b) => a - b)) {
    const count = entries.filter(e => e.episode === ep).length
    console.log(`  第 ${ep} 集: ${count} 张`)
  }
}

function main() {
  const root = join(import.meta.dirname, '..')
  const slicePath = join(root, 'src', 'layout', 'contentLayoutSlice.ts')
  const content = readFileSync(slicePath, 'utf-8')

  // 解析两个系列
  const aveMujica = parseArrayContent(content, 'aveMujicaImages')
  const myGO = parseArrayContent(content, 'myGOImages')
  console.log(`从 contentLayoutSlice.ts 解析到:`)
  console.log(`  Ave Mujica: ${aveMujica.length} 条`)
  console.log(`  MyGO: ${myGO.length} 条`)

  // 生成输出
  const aveOutput = generateOutput(aveMujica, 'ave-mujica')
  const mygoOutput = generateOutput(myGO, 'mygo')

  printStats(aveOutput, 'Ave Mujica')
  printStats(mygoOutput, 'MyGO')

  // 写入 JSON
  const outDir = join(root, 'app', 'data', 'images')
  mkdirSync(outDir, { recursive: true })

  writeFileSync(
    join(outDir, 'ave-mujica.json'),
    `${JSON.stringify(aveOutput, null, 2)}\n`,
    'utf-8',
  )
  writeFileSync(
    join(outDir, 'mygo.json'),
    `${JSON.stringify(mygoOutput, null, 2)}\n`,
    'utf-8',
  )

  console.log(`\n✅ 数据迁移完成`)
  console.log(`   app/data/images/ave-mujica.json (${aveOutput.length} 条)`)
  console.log(`   app/data/images/mygo.json (${mygoOutput.length} 条)`)
}

main()
