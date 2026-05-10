export function meta() {
  return [
    { title: 'Ave Mujica 截圖搜尋器' },
    { name: 'description', content: '可透過關鍵字搜尋 MyGO 與 Ave Mujica 的台詞截圖、梗圖' },
  ]
}

export function loader() {
  return {
    message: 'Ave Mujica 截圖搜尋器 — Phase 1 腳手架就緒',
  }
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        Ave Mujica 截圖搜尋器
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl">
        可透過關鍵字搜尋 MyGO 與 Ave Mujica 的台詞截圖、梗圖
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        Phase 1 — 腳手架對齊完成 ✅
      </p>
    </div>
  )
}
