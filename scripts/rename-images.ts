/**
 * 图片重命名脚本：将旧文件名映射为新文件名（e{ep}-{seq}.webp）
 *
 * 处理逻辑：
 * - 按 contentLayoutSlice 中的原始顺序遍历每条记录
 * - 同名条目（如「求求妳」出现 2 次）按出现顺序分配：
 *   第 1 次 → {name}.webp
 *   第 2 次 → {name}_1.webp
 *   第 3 次 → {name}_2.webp
 * - 部分条目 name 字段本身已含 _1/_2 后缀（如「對不起_2」）
 * - 极少情况 2 条记录共用 1 张图片 → 重复复制
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface ImageEntry {
  name: string
  episode: number
}

function pad(num: number): string {
  return String(num).padStart(2, '0')
}

function parseArrayContent(content: string, arrayName: string): ImageEntry[] {
  const startMarker = `${arrayName}: [`
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1)
    throw new Error(`找不到 ${arrayName}`)

  const fromStart = content.slice(startIdx + startMarker.length)

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
  const entries: ImageEntry[] = []
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

/**
 * 为每个条目找到源文件路径
 * 同名条目按出现顺序依次分配 {name}.webp → {name}_1.webp → ...
 */
function resolveSourceFiles(entries: ImageEntry[], srcDir: string): string[] {
  const srcFiles = new Set(readdirSync(srcDir).filter(f => f.endsWith('.webp')))
  const nameOccurrences = new Map<string, number>() // 记录每个 name 已出现的次数
  const result: string[] = []

  for (const entry of entries) {
    const count = nameOccurrences.get(entry.name) ?? 0
    nameOccurrences.set(entry.name, count + 1)

    // 第 0 次 → {name}.webp
    // 第 1 次 → {name}_1.webp
    // 第 2 次 → {name}_2.webp
    let candidate: string
    if (count === 0) {
      candidate = `${entry.name}.webp`
    }
    else {
      candidate = `${entry.name}_${count}.webp`
    }

    // 如果在源目录中存在，直接使用
    if (srcFiles.has(candidate)) {
      result.push(candidate)
      continue
    }

    // 尝试不带后缀的（原 name 本身已包含 _1, _2）
    // 例如 name = "對不起_2"，那么文件名是 "對不起_2.webp"
    // 我们已经尝试了 candidate，如果不存在就尝试其他后缀
    const baseName = entry.name.replace(/_\d+$/, '')
    for (let i = 0; i < 10; i++) {
      const alt = i === 0 ? `${baseName}.webp` : `${baseName}_${i}.webp`
      if (srcFiles.has(alt)) {
        result.push(alt)
        break
      }
    }

    // 如果还没找到，回退到 candidate
    if (result.length <= entries.indexOf(entry)) {
      result.push(candidate)
    }
  }

  return result
}

function main() {
  const root = join(import.meta.dirname, '..')
  const sourceDir = join(root, 'src', 'assets', 'webp')
  const slicePath = join(root, 'src', 'layout', 'contentLayoutSlice.ts')
  const content = readFileSync(slicePath, 'utf-8')

  const configs: Array<{ id: string, arrayName: string }> = [
    { id: 'ave-mujica', arrayName: 'aveMujicaImages' },
    { id: 'mygo', arrayName: 'myGOImages' },
  ]

  for (const cfg of configs) {
    const srcDir = join(sourceDir, cfg.id)
    const destDir = join(root, 'public', 'images', cfg.id)
    mkdirSync(destDir, { recursive: true })

    const entries = parseArrayContent(content, cfg.arrayName)
    const sourceFiles = resolveSourceFiles(entries, srcDir)

    console.log(`\n${cfg.id}: ${entries.length} 条记录, 解析到 ${sourceFiles.length} 个源文件`)

    // 按 episode 分组编号
    const epCounter = new Map<number, number>()
    for (const ep of new Set(entries.map(e => e.episode))) {
      epCounter.set(ep, 0)
    }

    let copied = 0
    let missing = 0

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      const srcFile = sourceFiles[i]!

      const ep = entry.episode
      const seq = (epCounter.get(ep) ?? 0) + 1
      epCounter.set(ep, seq)

      const newName = `e${pad(ep)}-${pad(seq)}.webp`
      const srcPath = join(srcDir, srcFile)
      const destPath = join(destDir, newName)

      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath)
        copied++
      }
      else {
        missing++
        if (missing <= 10) {
          console.log(`  未找到: ${srcFile} → ${newName}`)
        }
      }
    }

    console.log(`  复制: ${copied}/${entries.length}${missing > 0 ? ` (缺失 ${missing})` : ' ✅'}`)
  }

  console.log('\n✅ 图片重命名完成')
}

main()
