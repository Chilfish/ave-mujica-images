# TODO — 重构行动计划 v2

> 从纯前端 SPA → React Router v7 全栈 SSR + shadcn/cossui + Tailwind CSS + 简繁双语。

---

## 阶段 1：脚手架对齐

- [ ] **1.1** 用 `reacr-router-cossui` 脚手架结构初始化项目
- [ ] **1.2** 安装依赖：`react-router`, `@react-router/node`, `@vercel/react-router`, `shadcn`, `tailwindcss`, `@base-ui/react`, `lucide-react`, `zustand`, `react-window`, `axios`, `zod`, `sharp`, `tw-animate-css`, `clsx`, `tailwind-merge`
- [ ] **1.3** 复制脚手架文件：`app/root.tsx`, `app/routes.ts`, `app/app.css`, `app/components/ui/*`, `app/hooks/*`, `app/lib/utils.ts`, `app/stores/appConfig.ts`, `app/components/ThemeProvider.tsx`, `app/components/progress-bar.tsx`, `server/app.ts`
- [ ] **1.4** 配置：`react-router.config.ts`（ssr: true, vercelPreset）, `vite.config.ts`（tailwindcss + reactRouter + tsconfigPaths）, `tsconfig.json`（~/ → app/）, `vercel.json`, `components.json`, `lefthook.yml`
- [ ] **1.5** 配置字体：Noto Sans SC + Noto Sans TC（Google Fonts）
- [ ] **1.6** 配色调整：将 `app.css` 中的主题色从默认 neutral 改为 BanG Dream 风格（可选：紫色/深蓝）
- [ ] **1.7** `bun dev` 验证脚手架跑通 → 看到 cossui 示例页

## 阶段 2：数据剥离

- [ ] **2.1** 读取 `contentLayoutSlice.ts`，统计 aveMujicaImages（1226 条）和 myGOImages（1166 条）的集数分布
- [ ] **2.2** 写 `scripts/migrate-data.ts`：
  - 解析 `src/layout/contentLayoutSlice.ts` 中的两个数组
  - 输出 `app/data/images/ave-mujica.json` 和 `app/data/images/mygo.json`
  - 每条生成 `id`（`{series}-e{episode}-{seq}`）、`filename`（`e{episode}-{seq}.webp`）
  - `text.zh-TW` = 原 `name` 字段
  - `text.zh-CN` 暂空
- [ ] **2.3** 写 `scripts/rename-images.ts`：
  - 遍历 `src/assets/webp/ave-mujica/` 和 `src/assets/webp/mygo/`
  - 根据 JSON 中的对应关系，重命名为 `e{ep}-{seq}.webp`
  - 复制到 `public/images/{series}/`
- [ ] **2.4** 同步转换 JPG：运行现有的 sharp 转换脚本（适配新路径）
- [ ] **2.5** 创建 `app/data/series.json`
- [ ] **2.6** 写校验脚本 `scripts/validate-data.ts`：确保 JSON 中每条记录都在 `public/images/` 找到对应文件

## 阶段 3：i18n + 数据加载层

- [ ] **3.1** 实现 `app/i18n/types.ts`：Locale、UIStrings、UIStringsMap 类型
- [ ] **3.2** 实现 `app/i18n/ui.ts`：所有 UI 文案（zh-TW + zh-CN，约 30 条）
- [ ] **3.3** 实现 `app/i18n/server.ts`：`getLocale(request)` — URL 参数 → Cookie → Accept-Language → 默认 zh-TW
- [ ] **3.4** 实现 `app/i18n/client.ts`：`getClientLocale()` + `setClientLocale(locale)`
- [ ] **3.5** 实现 `app/i18n/use-locale.ts`：`useLocale()` hook + `LocaleSwitcher` 组件
- [ ] **3.6** 处理 SSR hydration：服务端将 locale 写入 `window.__LOCALE__`
- [ ] **3.7** 实现 `app/lib/images.ts`：
  - `loadAllImages()` — 聚合所有 JSON（`import.meta.glob` 或静态 import）
  - `getSeriesList()` — 读取 `series.json`
  - `getImageUrl(series, filename)` — 生成 `/images/{series}/{filename}`
- [ ] **3.8** 实现 `app/lib/search.ts`：
  - `searchImages({ q, series, episode, lang })` — 纯函数
  - 同时匹配 `zh-TW` 和 `zh-CN`，大小写不敏感
- [ ] **3.9** 实现首页 loader（`app/routes/_index.tsx`）：
  - URL searchParams 驱动：`q`, `series`, `episode`, `lang`
  - 调用 `searchImages()` + `uiStrings[locale]`
  - `json({ results, query, seriesList, ui })`
- [ ] **3.10** 实现 API routes：
  - `app/routes/api.images.ts`：`loader` 返回 `json({ total, images })`
  - `app/routes/api.image.$.ts`：`loader` 返回单图信息
  - 添加 CORS 头

## 阶段 4：前端组件迁移

- [ ] **4.1** SearchBar：shadcn `<Input>` + URL searchParams（250ms debounce 保持）
- [ ] **4.2** EpisodeFilter：shadcn `<Select>` + 根据当前系列动态生成选项
- [ ] **4.3** SortToggleButtons：shadcn `<ToggleGroup>` + `oldest`/`newest` 切换
- [ ] **4.4** SeriesTabs：shadcn `<Tabs>` + 从 `series.json` 动态生成
- [ ] **4.5** ImageGrid：`react-window` 的 `VariableSizeList` + 自适应 1-4 列
  - 替代原来的 react-virtualized（WindowScroller / AutoSizer / CellMeasurer 组合）
  - 列数依据 `useMediaQuery` 或 `window.innerWidth`
- [ ] **4.6** ImageCard：
  - 图片懒加载（`loading="lazy"` 原生属性，或 IntersectionObserver）
  - Hover 显示台词（根据当前 locale）
- [ ] **4.7** ImageActions（悬浮操作按钮组）：
  - 复制图片：Canvas → `navigator.clipboard.write([ClipboardItem])`
  - 下载 JPG：`<a download>` 触发
  - 复制链接：`navigator.clipboard.writeText(url)`
  - 操作反馈：shadcn `<Toast>`
- [ ] **4.8** ToTopButton：shadcn `<Button>` + `<Tooltip>`
- [ ] **4.9** Footer：版本号 + GitHub Star 按钮（react-github-btn 保留） + LocaleSwitcher
- [ ] **4.10** 浏览器检测（移自 ContentLayout）：UA 检测 → shadcn `<Dialog>`
- [ ] **4.11** `app/routes/_index.tsx` 首页组件组装

## 阶段 5：简繁双语填充

- [ ] **5.1** 用 OpenCC（`opencc-js`）自动将 `text.zh-TW` 转为 `text.zh-CN`
- [ ] **5.2** 人工校对：常见繁简差异（如一隻/一只、後/后）确保准确
- [ ] **5.3** 写脚本或手动填充所有 2392 条记录的 `text.zh-CN`
- [ ] **5.4** 验证搜索：
  - 输入简体「一辈子」→ 能命中繁体版「一輩子」
  - 输入繁体「對話」→ 能命中简体版「对话」
  - 输入日文角色名（如「祥子」）→ 简繁都能命中
- [ ] **5.5** 验证语言切换：右上角「简/繁」按钮切换后 UI 文案 + 台词展示都变化
- [ ] **5.6** OG meta 标签双语适配

## 阶段 6：多系列验证 + 旧功能迁移

- [ ] **6.1** 验证 MyGO + Ave Mujica 所有功能：搜索、筛选、排序、复制、下载
- [ ] **6.2** 模拟添加新系列：手写一个 `test-series.json` + 几张测试图
  - 验证前端无需改代码，自动显示新 tab、新集数选项
- [ ] **6.3** 写 `docs/ADD_SERIES.md`
- [ ] **6.4** 迁移 `convertWebpToJpg.js` → `scripts/convert-webp-to-jpg.ts`（适配新路径）
- [ ] **6.5** 写 `docs/DEVELOPMENT.md`：本地开发流程

## 阶段 7：清理与上线

- [ ] **7.1** 删除旧代码目录：`src/`、旧 `package.json` 中的无用依赖
- [ ] **7.2** 更新 `README.md`（对标新架构）
- [ ] **7.3** 更新 `index.html` → `app/root.tsx`（HTML shell 中的 meta）
- [ ] **7.4** Vercel 部署配置：
  - 项目导入 Vercel
  - 域名：`ave-mujica-images.pages.dev` 或自定义
  - 环境变量（如有）
- [ ] **7.5** 旧版域名 301 重定向（如果 URL 结构变化，需要处理）
- [ ] **7.6** 冒烟测试：
  - 搜索「祥子」→ 有结果
  - 切换到 MyGO tab → 过滤正确
  - 选「第 3 集」→ 只有第 3 集的图
  - 切换简/繁 → UI 和台词都变
  - 复制图片 → Toast 提示成功
  - 下载 JPG → 文件正确
  - API `/api/images?q=祥子` → 返回 JSON
  - 移动端 → 列数适配
- [ ] **7.7** 性能：Lighthouse（目标 90+）, TTFB < 500ms, 图片 CDN 命中率

---

## 风险与注意事项

| 风险 | 影响 | 缓解 |
|------|------|------|
| 图片重命名后旧链接失效 | 外部引用 404 | 保持域名不变；如有旧链接，加 redirect 映射表 |
| Vercel 冷启动 | SSR 首页加载慢 | JSON 数据小（< 100KB），loader 几乎瞬时 |
| OpenCC 繁简自动转换不准 | 台词歧义 | 必须人工校对 |
| react-window 列数自适应 | 窗口 resize 时列数不变 | 用 ResizeObserver + state 触发重算 |
| 图片量大（2392 张，~200MB） | Vercel 带宽超限（免费 100GB/月） | 正常使用够，之后可迁 R2 / Cloudflare Images |
| 脚手架版本不匹配 | 依赖冲突 | `bun install` 后先验证 `bun run build` 通过 |
