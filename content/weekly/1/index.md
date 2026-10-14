---
title: "Weekly 1 · 使用说明"
date: 2026-10-14T17:56:45+08:00
lastmod: 2026-10-14T17:56:45+08:00
summary: "这是示例周记，说明怎么新增一期、放图片。写自己的第一期时，把这一期删掉或直接改写。"
issue: 1
interval: "2026.10.12–10.18"
draft: false
tags:
  - Weekly
cover_alt: "渐变占位封面"
cover_caption: "没有 cover 图片时显示渐变占位封面"
---

## 新增一期

在项目根目录运行下面的命令，括号里换成这一周的主题：

```bash
node scripts/new-weekly.mjs "四字主题"
```

它会创建 `content/weekly/<期数>/index.md`，期数自动加一，日期和 `interval`（本周周一到周日）也自动填好。

## 写内容

打开新生成的 `index.md`，修改 `summary`，在正文里用普通 Markdown 写：

- 二级标题 `##` 分段，三级标题 `###` 写小节
- 列表、**加粗**、[链接](https://example.com)、`行内代码` 和代码块都可以用
- 引用用 `>` 开头

## 放图片

把图片放进这一期的文件夹，也就是和 `index.md` 同一级。

- 命名为 `cover.jpg`（或 `cover.png`）的图片会自动成为封面，列表页和文章顶部都会用它
- 正文里的图片用 `weekly-photo` 短代码：`src` 是文件名，`caption` 是图片说明，宽屏截图加 `variant="wide"`
- 图片主体不在中间时，加 `anchor="Top"`、`"Bottom"`、`"Left"` 或 `"Right"` 调整裁剪位置
- 图片来自别的网站时，加上 `credit` 和 `credit_url` 注明出处

## 发布

保存后提交并推送到 main，网站会自动构建，新的一期会出现在 Weekly 列表和左侧的期数列表里。想先不公开，把 `draft` 改成 `true`。
