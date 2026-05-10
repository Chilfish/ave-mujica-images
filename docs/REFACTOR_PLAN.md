# Ave Mujica 截圖搜尋器 — 重构方案 v2

> 目标：从纯前端 SPA 重构为 React Router v7 全栈 SSR 项目，使用 shadcn/cossui + Tailwind CSS，支持简繁双语、多系列扩展、Vercel 部署。

---

## 现状问题

| 问题 | 现状 | 影响 |
|------|------|------|
| 数据写死在 TS 文件 | `contentLayoutSlice.ts` 135KB，含 2491 行硬编码数组 | 加一张图都要改 TS，容易冲突 |
| 无简体中文 | 仅繁体中文台词 | 大陆用户搜索困难 |
| 纯客户端 SPA | Vite CSR，无 SSR | SEO 差、首屏慢、无法给外部提供 API |
| 添加新系列困难 | 数据、组件、过滤逻辑分散多处 | 每加一个番要改 5+ 个文件 |
| Redux 过度设计 | 纯静态数据用 Redux 管理 | 样板代码多，数据流向绕 |
| 图片路径耦合 | 文件名必须 == `name` 字段，路径硬编码 | 文件名含特殊字符容易出错 |
| MUI 体量大 | @mui/material ~2MB gzipped | 首屏加载重，且本项目用到的 MUI 功能很少 |

---

## 技术选型（对齐脚手架 `reacr-router-cossui`）

| 层面 | 旧 | 新 | 理由 |
|------|-----|-----|------|
| 全栈框架 | - | **React Router v7** (Framework Mode) | SSR + API routes 一体，Vercel 原生支持 |
| 运行时 | - | **Bun**（开发）/ **Node.js**（Vercel） | 比照脚手架 |
| 数据层 | Redux + 硬编码 TS | **JSON 文件**（Vite 静态导入） | 无需数据库，serverless 友好 |
| 状态管理 | Redux Toolkit | **Zustand**（仅 theme 等少量客户端状态） | 轻量，脚手架已验证 |
| UI 组件 | MUI | **shadcn/cossui**（基于 base-ui） | 脚手架已有完整组件库 |
| 样式 | SCSS + MUI sx prop | **Tailwind CSS 4** + `tw-animate-css` | 与 cossui 配套，开发效率高 |
| 图标 | @mui/icons-material | **lucide-react** | cossui 标准图标库 |
| 虚拟滚动 | react-virtualized | **react-window** | 更轻，API 更简洁 |
| 懒加载 | lazysizes | 保留或换 **IntersectionObserver** | 可能不需要了，react-window 本身只渲染可见区域 |
| 图片处理 | sharp | 保留 **sharp** | WebP→JPG 转换脚本不变 |
| 部署 | GitHub Pages | **Vercel** + `@vercel/react-router` | 零配置 SSR，Edge CDN |
| 包管理 | pnpm | **Bun**（原生 lock） | 比照脚手架 |
| Lint | eslint 平铺配置 | **@antfu/eslint-config** | 脚手架已验证 |
| Git hooks | - | **lefthook** | 脚手架已验证 |
| HTTP 客户端 | - | **axios** + `axios-cache-interceptor` | 脚手架提供，用于 API 调用 |
| 验证 | - | **zod** | 脚手架提供 |
| 类型安全 | TypeScript 6 | TypeScript 6 | 不变 |

---

## 脚手架参考：`reacr-router-cossui`

### 目录结构

```
I:\starters\reacr-router-cossui/
├── app/
│   ├── root.tsx               # Layout + ErrorBoundary + HydrateFallback
│   ├── routes.ts              # 路由配置（index, route）
│   ├── app.css                # Tailwind + shadcn + 主题变量
│   ├── routes/
│   │   ├── home.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ThemeProvider.tsx   # 主题切换（light/dark/system）
│   │   ├── error-boundary.tsx
│   │   ├── progress-bar.tsx
│   │   └── ui/                # 40+ shadcn 组件
│   ├── hooks/
│   │   └── use-*.ts           # useHydrated, useMobile, useNonce
│   ├── lib/
│   │   ├── utils.ts           # cn() 工具函数
│   │   └── env.server.ts      # 服务端环境变量
│   └── stores/
│       └── appConfig.ts       # Zustand（theme 持久化）
├── server/
│   └── app.ts                 # 自定义 server 入口
├── public/
├── components.json            # shadcn 配置
├── react-router.config.ts     # SSR + Vercel preset
├── vite.config.ts             # tailwindcss + reactRouter 插件
├── vercel.json
└── package.json
```

### 关键模式

**1. 路由配置** (`app/routes.ts`):
```ts
import { index, route } from '@react-router/dev/routes'
export default [
  index('routes/home.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
```

**2. SSR 数据加载**（loader 模式）:
- 在路由模块中 `export async function loader({ request }: LoaderFunctionArgs)`
- 组件中用 `useLoaderData()` 获取数据
- 服务端渲染时自动调用 loader，客户端导航时通过 fetch 调用

**3. API 路由**（resource routes）:
- 创建一个只 export loader/action（不 export default component）的路由
- 通过 `Content-Type: application/json` 返回数据

**4. 主题**:
- Zustand store 持久化 theme 偏好（localStorage）
- ThemeProvider 在 `document.documentElement` 上切换 `light`/`dark` class
- Tailwind `dark:` variant 自动响应

**5. Vercel 部署**:
```ts
// react-router.config.ts
import { vercelPreset } from '@vercel/react-router/vite'
export default {
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config
```

---

## i18n 方案

### 设计原则

1. **URL 优先**：`?lang=zh-CN`（不破坏现有 URL 结构）
2. **Cookie 持久化**：记录用户偏好
3. **Accept-Language 降级**：服务端读取请求头
4. **类型安全**：TypeScript 确保所有 key 都有翻译

### 文件结构

```
app/i18n/
├── types.ts           # 类型定义
├── server.ts          # 服务端语言检测（从 Request 读取）
├── client.ts          # 客户端语言读写（localStorage + URL）
├── ui.ts              # UI 文案翻译 key → { zh-TW, zh-CN }
└── use-locale.ts      # React hook：读取/切换语言
```

### 类型定义

```ts
// app/i18n/types.ts
export type Locale = 'zh-TW' | 'zh-CN'

export interface UIStrings {
  // 搜索
  searchPlaceholder: string
  searchResults: string
  noResults: string
  // 标签
  tabAll: string
  tabAveMujica: string
  tabMyGO: string
  // 操作
  copyImage: string
  downloadJpg: string
  copyLink: string
  copied: string
  copiedLink: string
  // 排序
  oldestFirst: string
  newestFirst: string
  // 集数
  allEpisodes: string
  episode: string
  // 通用
  version: string
  updated: string
  loading: string
  backToTop: string
  // 元信息
  siteTitle: string
  siteDescription: string
  // 弹出提示
  browserWarning: string  // Facebook/Line 浏览器检测
}

export type UIStringsMap = Record<Locale, UIStrings>
```

### UI 文案（中文示例）

```ts
// app/i18n/ui.ts
import type { UIStringsMap } from './types'

export const uiStrings: UIStringsMap = {
  'zh-TW': {
    searchPlaceholder: '請輸入關鍵字...',
    searchResults: '相關結果',
    noResults: '查無截圖 QQ',
    tabAll: '全部',
    tabAveMujica: 'Ave Mujica',
    tabMyGO: 'MyGO!!!!!',
    copyImage: '複製圖片',
    downloadJpg: '下載 JPG 檔',
    copyLink: '圖片連結複製',
    copied: '已複製圖片',
    copiedLink: '已複製圖片連結',
    oldestFirst: '首集優先',
    newestFirst: '最新優先',
    allEpisodes: '全部',
    episode: '第 {episode} 集',
    version: '版本',
    updated: '更新日期',
    loading: '載入中...',
    backToTop: '回到上方',
    siteTitle: '截圖搜尋器 MyGO & Mujica',
    siteDescription: '可透過關鍵字搜尋 MyGO 與 Ave Mujica 母雞卡的台詞截圖、梗圖',
    browserWarning: '因 {browser} 瀏覽器支援較差，建議改用外部瀏覽器 (Chrome、Safari)',
  },
  'zh-CN': {
    searchPlaceholder: '请输入关键词...',
    searchResults: '相关结果',
    noResults: '查无截图 QQ',
    tabAll: '全部',
    tabAveMujica: 'Ave Mujica',
    tabMyGO: 'MyGO!!!!!',
    copyImage: '复制图片',
    downloadJpg: '下载 JPG 档',
    copyLink: '图片链接复制',
    copied: '已复制图片',
    copiedLink: '已复制图片链接',
    oldestFirst: '首集优先',
    newestFirst: '最新优先',
    allEpisodes: '全部',
    episode: '第 {episode} 集',
    version: '版本',
    updated: '更新日期',
    loading: '加载中...',
    backToTop: '回到顶部',
    siteTitle: '截图搜寻器 MyGO & Mujica',
    siteDescription: '可通过关键词搜寻 MyGO 与 Ave Mujica 母鸡卡的台词截图、表情包',
    browserWarning: '{browser} 浏览器兼容性较差，建议使用外部浏览器 (Chrome、Safari)',
  },
}
```

### 语言检测逻辑

```ts
// app/i18n/server.ts — 服务端
export function getLocale(request: Request): Locale {
  const url = new URL(request.url)

  // 1. URL 参数 ?lang=zh-CN
  const urlLang = url.searchParams.get('lang')
  if (urlLang === 'zh-CN' || urlLang === 'zh-TW') return urlLang

  // 2. Cookie
  const cookieLang = getCookie(request, 'lang')
  if (cookieLang === 'zh-CN' || cookieLang === 'zh-TW') return cookieLang

  // 3. Accept-Language 请求头
  const acceptLang = request.headers.get('Accept-Language') || ''
  if (acceptLang.includes('zh-CN') || acceptLang.includes('zh-Hans')) return 'zh-CN'

  // 4. 默认繁体
  return 'zh-TW'
}
```

```ts
// app/i18n/client.ts — 客户端
export function getClientLocale(): Locale {
  // 1. URL 参数
  const params = new URLSearchParams(window.location.search)
  const urlLang = params.get('lang')
  if (urlLang === 'zh-CN' || urlLang === 'zh-TW') return urlLang

  // 2. localStorage（跨页面持久化）
  const stored = localStorage.getItem('lang')
  if (stored === 'zh-CN' || stored === 'zh-TW') return stored

  // 3. 浏览器语言
  if (navigator.language.startsWith('zh-CN') || navigator.language.startsWith('zh-Hans')) return 'zh-CN'

  return 'zh-TW'
}

export function setClientLocale(locale: Locale) {
  localStorage.setItem('lang', locale)
  // 更新 URL 参数（不刷新页面）
  const url = new URL(window.location.href)
  url.searchParams.set('lang', locale)
  window.history.replaceState({}, '', url)
}
```

### 图片文本的 i18n

图片台词本身已经是数据的一部分（`text.zh-TW` / `text.zh-CN`），不需要走 UI i18n：

```ts
// 数据模型
interface ImageEntry {
  id: string
  episode: number
  text: { 'zh-TW': string; 'zh-CN': string }
  filename: string
}

// 使用时
const locale = useLocale()
const displayText = image.text[locale]
```

### 搜索行为

搜索时**同时匹配 `zh-TW` 和 `zh-CN`** 字段，无论用户当前语言是什么：

```ts
function matchesQuery(image: ImageEntry, q: string): boolean {
  const lowerQ = q.toLowerCase()
  return image.text['zh-TW'].toLowerCase().includes(lowerQ)
      || image.text['zh-CN'].toLowerCase().includes(lowerQ)
}
```

这意味着输入「一辈子」能搜到繁体版的「一輩子」，反之亦然。

### 语言切换器

在 Header 或 Footer 放置一个切换按钮：

```tsx
function LocaleSwitcher() {
  const locale = useLocale()
  const toggle = () => setClientLocale(locale === 'zh-TW' ? 'zh-CN' : 'zh-TW')

  return (
    <Button variant="ghost" size="sm" onClick={toggle}>
      {locale === 'zh-TW' ? '简' : '繁'}
    </Button>
  )
}
```

### 注意事项

- **SSR hydration**：服务端和客户端首次渲染必须使用相同的 locale，否则会 hydration mismatch。解决方案：服务端把检测到的 locale 写入 `<script>window.__LOCALE__ = 'zh-TW'</script>`，客户端初始化时读取。
- **OG meta**：`<meta property="og:title">` 等标签也需要根据 locale 显示不同内容。
- **不适用 react-i18next**：本项目只有两组语言（简/繁），UI 文案不到 30 条，用 i18next 反而增加配置复杂度。直接用 TypeScript + 纯函数更简单。

---

## 数据模型设计（与 v1 相同，确认不变）

### `data/series.json` — 系列目录

```json
{
  "series": [
    {
      "id": "ave-mujica",
      "title": { "zh-TW": "Ave Mujica", "zh-CN": "Ave Mujica" },
      "episodes": 13,
      "logo": "/images/ave-mujica/logo.png"
    },
    {
      "id": "mygo",
      "title": { "zh-TW": "MyGO!!!!!", "zh-CN": "MyGO!!!!!" },
      "episodes": 13,
      "logo": "/images/mygo/logo.png"
    }
  ]
}
```

### `data/images/ave-mujica.json` — 图片元数据

```json
[
  {
    "id": "ave-mujica-e01-001",
    "episode": 1,
    "text": {
      "zh-TW": "需不需要我把她叫醒",
      "zh-CN": "需不需要我把她叫醒"
    },
    "filename": "e01-001.webp"
  }
]
```

### 图片文件结构

```
public/images/
├── ave-mujica/
│   ├── logo.png
│   ├── e01-001.webp
│   └── ...
└── mygo/
    ├── logo.png
    └── ...
```

---

## 项目结构（重构后）

```
ave-mujica-images/
├── app/
│   ├── root.tsx                   # Layout + ErrorBoundary + HydrateFallback
│   ├── routes.ts                  # 路由配置
│   ├── app.css                    # Tailwind + shadcn 主题
│   ├── routes/
│   │   ├── _index.tsx             # 首页（loader + 组件）
│   │   ├── api.images.ts          # GET /api/images?q=&series=&episode=
│   │   ├── api.image.$.ts         # GET /api/images/:series/:id
│   │   └── not-found.tsx          # 404 页面
│   ├── components/
│   │   ├── ThemeProvider.tsx       # （复用脚手架，微调配色）
│   │   ├── progress-bar.tsx       # （复用脚手架）
│   │   ├── SearchBar.tsx          # 搜索框
│   │   ├── EpisodeFilter.tsx      # 集数筛选下拉
│   │   ├── SeriesTabs.tsx         # 系列切换标签
│   │   ├── ImageGrid.tsx          # 虚拟滚动图片网格（react-window）
│   │   ├── ImageCard.tsx          # 单张图片卡片
│   │   ├── ImageActions.tsx       # 悬浮操作按钮组
│   │   ├── LocaleSwitcher.tsx     # 简繁切换
│   │   ├── ToTopButton.tsx        # 回到顶部
│   │   ├── Footer.tsx             # 版本 + GitHub Star
│   │   └── ui/                    # 40+ shadcn 组件（脚手架复制）
│   ├── hooks/
│   │   ├── use-hydrated.ts        # （复用）
│   │   ├── use-mobile.ts          # （复用）
│   │   └── use-image-search.ts    # 搜索 hook（URL searchParams 驱动）
│   ├── i18n/
│   │   ├── types.ts               # Locale, UIStrings 类型
│   │   ├── server.ts              # getLocale(request)
│   │   ├── client.ts              # getClientLocale, setClientLocale
│   │   ├── ui.ts                  # uiStrings: UIStringsMap
│   │   └── use-locale.ts          # useLocale() hook
│   ├── lib/
│   │   ├── utils.ts               # cn() 工具
│   │   ├── search.ts              # 搜索逻辑（服务端+客户端共用）
│   │   └── images.ts              # 图片路径生成
│   ├── data/
│   │   ├── series.json            # 系列目录
│   │   └── images/
│   │       ├── ave-mujica.json
│   │       └── mygo.json
│   └── styles/                    # 如有需要，少量全局样式
├── server/
│   └── app.ts                     # Vercel serverless 入口
├── public/
│   ├── images/                    # 静态图片目录（走 Vercel CDN）
│   │   ├── ave-mujica/
│   │   └── mygo/
│   └── icon.webp
├── scripts/
│   ├── migrate-data.ts            # 数据迁移脚本
│   ├── rename-images.ts           # 图片重命名脚本
│   └── convert-webp-to-jpg.ts     # WebP→JPG 转换（原 convertWebpToJpg.js）
├── components.json                # shadcn 配置
├── react-router.config.ts
├── vite.config.ts
├── vercel.json
├── tsconfig.json
└── package.json
```

---

## 组件树

```
root.tsx (Layout — HTML shell + Toast + ProgressBar + ScrollRestoration)
└── App (ThemeProvider)
    └── Outlet
        └── _index.tsx (loader → json)
            ├── Header（Logo + LocaleSwitcher + 标语）
            ├── SearchPanel
            │   ├── SearchBar（?q= → URL searchParams）
            │   ├── EpisodeFilter（?episode=）
            │   └── SortToggleButtons（?order=）
            ├── SeriesTabs（?series=）
            ├── ImageGrid（react-window VariableSizeList）
            │   └── ImageCard × N
            │       ├── <img>（WebP, loading="lazy"）
            │       └── ImageActions（复制/下载/链接）
            └── Footer（版本号 + GitHub Star + 语言切换）
```

---

## 搜索数据流

```
用户输入 "一辈子"
  ↓
SearchBar onChange → 更新 URL searchParams (?q=一辈子)
  ↓
react-router 检测 URL 变化 → 触发 loader 重新执行
  ↓
loader 调用 searchImages({ q: "一辈子", series, episode })
  ↓
searchImages 遍历当前系列的所有图片：
  - image.text['zh-TW'].includes("一辈子") → false
  - image.text['zh-CN'].includes("一辈子") → true ✅
  ↓
返回 json({ results, query })
  ↓
ImageGrid 用 useLoaderData() 获取结果 → react-window 渲染
```

---

## 添加新系列的步骤

只需要 3 步，不需要改代码：

1. 创建 `data/images/{series-id}.json`
2. 把图片放到 `public/images/{series-id}/`
3. 在 `data/series.json` 的 `series` 数组加一条记录

系列名、集数、Logo 全部从 `series.json` 读取，前端自动适配。

---

## 为什么不用 SQLite？

Vercel 是 serverless 无状态环境，没有持久文件系统。SQLite 需要写磁盘，在 Vercel 上：
- 每次冷启动数据库文件丢失
- 或者需要用 Turso/Cloudflare D1 等外部服务 → 增加复杂度

对于 2000+ 条静态图片数据，JSON 文件在构建时被 Vite 打包进 bundle，`import data from './data.json'` 就完了。零运行时开销。Vercel serverless 函数启动时直接访问内存中的数据，比读文件系统更快。

## 渐进式迁移策略

分 7 个阶段，每阶段出成果，不等最后才能跑。

### 阶段 1：脚手架对齐（1 天）
- 用脚手架 `reacr-router-cossui` 的结构初始化新项目
- 复制 `app/root.tsx`、`app/components/ui/`、`app/hooks/`、`server/app.ts`
- 配置 `react-router.config.ts`、`vite.config.ts`、`tsconfig.json`、`vercel.json`
- `bun dev` 验证脚手架跑通

### 阶段 2：数据剥离（1-2 天）
- 写 `scripts/migrate-data.ts`：从 `contentLayoutSlice.ts` 抽数据到 JSON
- 写 `scripts/rename-images.ts`：图片重命名为 `e{ep}-{seq}.webp`
- 图片从 `src/assets/webp/` 迁移到 `public/images/`
- 写校验脚本：确保 JSON 和文件一一对应

### 阶段 3：数据加载层（1 天）
- 实现 `app/lib/images.ts`：数据加载 + 系列列表
- 实现 `app/lib/search.ts`：搜索逻辑（纯函数，客户端服务端共用）
- 实现 i18n：`app/i18n/` 全部文件
- 实现首页 loader（`app/routes/_index.tsx`）
- 实现 API routes（`app/routes/api.images.ts`、`app/routes/api.image.$.ts`）

### 阶段 4：前端组件迁移（2-3 天）
- SearchBar（shadcn Input + URL searchParams）
- EpisodeFilter（shadcn Select）
- SeriesTabs（shadcn Tabs）
- ImageGrid（react-window VariableSizeList）
- ImageCard + ImageActions（shadcn Button + Tooltip）
- LocaleSwitcher
- ToTopButton
- Footer

### 阶段 5：简繁双语填充（1 天）
- 为 JSON 数据填充 `text.zh-CN`（OpenCC 自动转换 + 人工校对）
- 验证：搜索简体关键词命中繁体台词，反之亦然

### 阶段 6：多系列验证 + 旧功能迁移（1 天）
- 验证 MyGO + Ave Mujica 两个系列功能完整
- 手动验证「加新系列只需 3 步」
- 写 `docs/ADD_SERIES.md`
- 迁移 convertWebpToJpg.js → `scripts/convert-webp-to-jpg.ts`

### 阶段 7：清理与上线（0.5 天）
- 删除旧代码（`src/`、`contentLayoutSlice.ts`）
- 更新 `README.md`
- Vercel 域名配置
- Lighthouse 测试 + 冒烟测试
