# Ave Mujica 截圖搜尋器

<div align="center">
<small>就將一切委身於 Ave Mujica 吧！</small>
<br /><br />
<a href="https://ave-mujica-images.pages.dev/"><strong>前往 Ave Mujica 截圖搜尋器 »</strong></a>
</div>

## 關於

搜尋《BanG Dream - Ave Mujica》與《BanG Dream - MyGO!!!!!》的台詞截圖、梗圖、表情包，支援簡繁雙語搜尋。

**v2.0.0** 重構為 React Router v7 全棧 SSR 架構。

## 技術棧

- [React Router v7](https://reactrouter.com/) — 全棧 SSR 框架
- [shadcn/cossui](https://ui.shadcn.com/) — UI 組件庫（base-ui）
- [Tailwind CSS 4](https://tailwindcss.com/) — 原子化樣式
- [react-window](https://github.com/bvaughn/react-window) — 虛擬滾動
- [TypeScript 6](https://www.typescriptlang.org/) + [Bun](https://bun.sh/)
- [Vercel](https://vercel.com/) — 部署平台
- [OpenCC](https://github.com/nk2028/opencc-js) — 繁簡轉換

## 本地開發

```bash
bun install
bun dev        # http://localhost:9080
bun run build  # 構建 SSR bundle
```

## 添加新系列

只需 3 步，無需改程式碼：

1. 建立 `app/data/images/{series-id}.json`
2. 把圖片放到 `public/images/{series-id}/`
3. 在 `app/data/series.json` 加一條記錄

詳見 [`docs/ADD_SERIES.md`](docs/ADD_SERIES.md)。

## 專案結構

```
app/
├── routes/         # 路由（首頁 + API）
├── components/     # 前端組件（SearchBar, ImageGrid, ...）
├── components/ui/  # shadcn 組件庫
├── i18n/           # 簡繁雙語
├── lib/            # 數據加載 + 搜尋邏輯
├── data/           # 靜態數據（JSON）
└── stores/         # Zustand（主題）
scripts/            # 數據遷移與工具腳本
public/images/      # 圖片資源（WebP）
```

## 圖片來源

[BanG Dream - Ave Mujica (木棉花)](https://www.youtube.com/watch?v=dxmmSFQxWzM&list=PL12UaAf_xzfo6TAmxIM7rEvrJAB0rzAAO)

## 版本 2.0.0

重構自 v1 SPA（React + Vite + Redux + MUI），架構文件見 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。
