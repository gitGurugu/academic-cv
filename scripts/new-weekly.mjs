// Create the next Weekly issue: node scripts/new-weekly.mjs "四字主题"
// Makes content/weekly/<n>/index.md with front matter and a body skeleton. Put cover.jpg
// and other photos in the same folder, write the body, then commit and push.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WEEKLY_DIR = join(import.meta.dirname, '..', 'content', 'weekly')
const theme = process.argv[2] || '四字主题'

const pad = (n) => String(n).padStart(2, '0')
const dot = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`

// Monday to Sunday of the current week, e.g. 2026.09.07–09.13
function currentWeekInterval(now) {
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return `${dot(monday)}–${pad(sunday.getMonth() + 1)}.${pad(sunday.getDate())}`
}

// ISO timestamp in local time with offset, so Hugo never treats the issue as a future page
function localIso(now) {
  const offset = -now.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  return `${date}T${time}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

function nextIssueNumber() {
  if (!existsSync(WEEKLY_DIR)) return 1
  const numbers = readdirSync(WEEKLY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map((entry) => Number(entry.name))
  return numbers.length ? Math.max(...numbers) + 1 : 1
}

const now = new Date()
const issue = nextIssueNumber()
const dir = join(WEEKLY_DIR, String(issue))
const stamp = localIso(now)

const body = `---
title: "Weekly ${issue} · ${theme}"
date: ${stamp}
lastmod: ${stamp}
summary: "用一句话概括这一周的主要内容。"
issue: ${issue}
interval: "${currentWeekInterval(now)}"
draft: false
tags:
  - Weekly
# 封面图：把图片命名为 cover.jpg / cover.png 放在本文件夹，没有封面会显示渐变占位图
cover_alt: "封面图片内容"
cover_caption: "封面图片说明"
---

## 写在前面

用一小段话概括这一周。

## 本周记录

### 1. 第一件事

记录事情本身，以及为什么值得留下。

插图的写法见 content/weekly/1/index.md（weekly-photo 短代码），写完这行可以删掉。
`

mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'index.md'), body, { flag: 'wx' })
console.log(`Created content/weekly/${issue}/index.md`)
