# 添加新系列

只需 3 步，无需修改任何代码。

## 1. 创建图片元数据

```bash
# 在 app/data/images/ 下创建 {series-id}.json
touch app/data/images/example.json
```

格式：

```json
[
  {
    "id": "example-e01-001",
    "episode": 1,
    "text": {
      "zh-TW": "第一句台詞",
      "zh-CN": "第一句台词"
    },
    "filename": "e01-001.webp"
  }
]
```

**字段说明：**
- `id`: `{series-id}-e{ep}-{seq}`，ep 和 seq 都用 2 位补零
- `episode`: 集数（从 1 开始）
- `text.zh-TW`: 繁体台詞
- `text.zh-CN`: 简体台词（可用 `scripts/fill-zh-cn.ts` 自动生成）
- `filename`: 图片文件名（建议 `e{ep}-{seq}.webp`）

## 2. 放图片

```bash
mkdir -p public/images/example/
cp your-images/*.webp public/images/example/
```

可选：放入 `logo.png` 作为系列标签图标。

## 3. 注册系列

在 `app/data/series.json` 的 `series` 数组中加一条：

```json
{
  "id": "example",
  "title": {
    "zh-TW": "範例系列",
    "zh-CN": "范例系列"
  },
  "episodes": 12,
  "logo": "/images/example/logo.png"
}
```

**字段说明：**
- `id`: 与 JSON 文件名和图片目录名一致
- `episodes`: 总集数
- `logo`: logo 路径，相对于 `public/`

## 完成

前端会自动：
- 在标签栏显示新系列
- 按集数生成筛选选项
- 搜索时匹配新系列的台词

不需要修改任何 `.tsx` 或 `.ts` 文件。
