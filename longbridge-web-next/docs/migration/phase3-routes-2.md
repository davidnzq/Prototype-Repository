# Phase 3 · 路由组 2 · Token Sweep

> Agent D · 2026-05-19 · longbridge-web-next
> 11 个路由文件按 Phase 3 token 映射表批量迁移完成,`tsc --noEmit` 0 error。

## 执行范围

| # | 文件 | 备注 |
|---|------|------|
| P3-R10 | `app/(app)/plan/page.tsx` | Plan Hub(状态机 5 tab) |
| P3-R11 | `app/(app)/plan/[id]/page.tsx` | Plan 详情 placeholder |
| P3-R12 | `app/(app)/plan/[id]/PlanHITLAck.tsx` | HITL Ack 按钮 |
| P3-R13 | `app/(app)/portfolio/page.tsx` | 组合 placeholder |
| P3-R14 | `app/(app)/portfolio/[symbol]/page.tsx` | 单股持仓 |
| P3-R15 | `app/(app)/portrait/page.tsx` | 用户画像 |
| P3-R16 | `app/(app)/review/page.tsx` | 复盘 Hub |
| P3-R17 | `app/(app)/review/[id]/page.tsx` | 复盘详情 |
| P3-R18 | `app/(app)/review/[id]/ReviewReflectionEditor.tsx` | 复盘三段式编辑器 |
| P3-R19 | `app/(app)/screener/page.tsx` | 选股工具 |
| P3-R20 | `app/(app)/search/page.tsx` | 跨对象搜索 |

## Token 映射(按 specific → general 顺序)

| 优先级 | 旧 | 新 |
|---|---|---|
| 1 | `bg-brand-soft` | `bg-accent-soft` |
| 2 | `text-brand-bright` | `text-accent` |
| 3 | `text-brand-ink` | `text-fg-inverse` |
| 4 | `border-divider-strong` | `border-hairline-strong` |
| 5 | `bg-warning` | `bg-warn` |
| 6 | `text-brand` | `text-accent`(含 hover:text-brand 等变体) |
| 7 | `bg-brand` | `bg-accent` |
| 8 | `border-brand` | `border-accent` |
| 9 | `ring-brand` | `ring-accent` |
| 10 | `text-warning` | `text-warn` |
| 11 | `border-warning` | `border-warn`(超集衍生,与 5/10 同步) |
| 12 | `border-divider` | `border-hairline-strong` |
| 13 | `ring-divider` | `ring-hairline-strong`(超集衍生) |
| 14 | `lb-num`(class) | `num` |
| 15 | `lb-caps`(class) | `caps` |

> 本批次未触发的旧 token:`text-brand-bright` / `text-brand-ink` / `bg-divider` / inline `var(--lb-*)`,11 个文件中均不存在。

## 每文件改动 & 残余

| 文件 | 改 N 行 | 残余 | 保留 K |
|------|---------|------|--------|
| `app/(app)/plan/page.tsx` | 12 | 0 | `lb-kicker` ×1 |
| `app/(app)/plan/[id]/page.tsx` | 9 | 0 | 0 |
| `app/(app)/plan/[id]/PlanHITLAck.tsx` | 1 | 0 | 0 |
| `app/(app)/portfolio/page.tsx` | 8 | 0 | `divide-divider` ×1 |
| `app/(app)/portfolio/[symbol]/page.tsx` | 3 | 0 | 0 |
| `app/(app)/portrait/page.tsx` | 12 | 0 | `lb-kicker` ×1 |
| `app/(app)/review/page.tsx` | 14 | 0 | `divide-divider` ×1 |
| `app/(app)/review/[id]/page.tsx` | 27 | 0 | 0 |
| `app/(app)/review/[id]/ReviewReflectionEditor.tsx` | 7 | 0 | `lb-kicker` ×1 |
| `app/(app)/screener/page.tsx` | 7 | 0 | `lb-kicker` ×3 |
| `app/(app)/search/page.tsx` | 4 | 0 | `lb-kicker` ×1 |

合计:11 个文件,**~104 行**改动,**0 残余**,9 处不在映射表的保留项(`lb-kicker` × 7、`divide-divider` × 2)。

## 保留项说明

- **`lb-kicker`(class)** — 不在 Phase 3 映射表内。当前所有路由统一暂留,留待后续 typography sweep。
- **`divide-divider`(class)** — Tailwind `divide-{color}` 工具类,映射表只覆盖 `bg-divider` / `border-divider`。`divide-divider` 是 `divide-y` 同族,需独立条目;本轮按"严格映射表"约束不动。建议后续映射 → `divide-hairline-strong`。

## 验证

- `npx tsc --noEmit` · 0 error · 0 warning(完整工程)
- `grep -nE 'text-brand|bg-brand|border-divider|bg-divider|text-warning|bg-warning|border-warning|ring-brand|border-brand|lb-num|lb-caps|--lb-'` 在 11 文件中 0 命中

## 执行日志

```
✅ 2026-05-19 app/(app)/plan/page.tsx              — 改 12 行, 残余 0 (保留 lb-kicker×1)
✅ 2026-05-19 app/(app)/plan/[id]/page.tsx         — 改  9 行, 残余 0 (保留 0)
✅ 2026-05-19 app/(app)/plan/[id]/PlanHITLAck.tsx  — 改  1 行, 残余 0 (保留 0)
✅ 2026-05-19 app/(app)/portfolio/page.tsx         — 改  8 行, 残余 0 (保留 divide-divider×1)
✅ 2026-05-19 app/(app)/portfolio/[symbol]/page.tsx — 改 3 行, 残余 0 (保留 0)
✅ 2026-05-19 app/(app)/portrait/page.tsx          — 改 12 行, 残余 0 (保留 lb-kicker×1)
✅ 2026-05-19 app/(app)/review/page.tsx            — 改 14 行, 残余 0 (保留 divide-divider×1)
✅ 2026-05-19 app/(app)/review/[id]/page.tsx       — 改 27 行, 残余 0 (保留 0)
✅ 2026-05-19 app/(app)/review/[id]/ReviewReflectionEditor.tsx — 改 7 行, 残余 0 (保留 lb-kicker×1)
✅ 2026-05-19 app/(app)/screener/page.tsx          — 改  7 行, 残余 0 (保留 lb-kicker×3)
✅ 2026-05-19 app/(app)/search/page.tsx            — 改  4 行, 残余 0 (保留 lb-kicker×1)
```
