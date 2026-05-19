# Phase 3 · Route Group 1 — Token Sweep Report

Agent: **Phase 3 Agent C**
Date: **2026-05-19**
Scope: 7 路由文件 (P3-R03 ~ P3-R09)
工程根: `/Users/david/原型港口/longbridge-web-next/`

---

## Token 映射(执行顺序：specific → general)

| # | 旧 | 新 |
|---|---|---|
| 1 | `bg-brand-soft` | `bg-accent-soft` |
| 2 | `text-brand-bright` | `text-accent` |
| 3 | `text-brand-ink` | `text-fg-inverse` |
| 4 | `border-divider-strong` | `border-hairline-strong` |
| 5 | `bg-warning` | `bg-warn` |
| 6 | `text-brand` | `text-accent`（含 `hover:text-brand` 等变体） |
| 7 | `bg-brand` | `bg-accent` |
| 8 | `border-brand` | `border-accent` |
| 9 | `ring-brand` | `ring-accent` |
| 10 | `text-warning` | `text-warn` |
| 11 | `border-divider` | `border-hairline-strong` |
| 12 | `bg-divider` | `bg-hairline-strong` |
| 13 | `lb-num`（class） | `num` |
| 14 | `lb-caps`（class） | `caps` |
| — | inline `var(--lb-*)` | 去 `lb-` 前缀 |

---

## 每文件结果

✅ 2026-05-19 `app/(app)/insight/[id]/page.tsx` (P3-R03) — 改 41 行，残余 4（保留 4：`divide-divider` × 4 @ L321/L339/L549/L567）
✅ 2026-05-19 `app/(app)/insights/page.tsx` (P3-R04) — 改 1 行，残余 0（保留 0）
✅ 2026-05-19 `app/(app)/marketplace/page.tsx` (P3-R05) — 改 27 行，残余 0（保留 0）
✅ 2026-05-19 `app/(app)/markets/page.tsx` (P3-R06) — 改 5 行，残余 1（保留 1：`divide-divider` × 1 @ L45）
✅ 2026-05-19 `app/(app)/markets/themes/[slug]/page.tsx` (P3-R07) — 改 8 行，残余 0（保留 0）
✅ 2026-05-19 `app/(app)/news/page.tsx` (P3-R08) — 改 0 行，残余 0（保留 0，文件为 redirect-only stub）
✅ 2026-05-19 `app/(app)/calendar/page.tsx` (P3-R09) — 改 0 行，残余 0（保留 0，文件为 redirect-only stub）

**总计**：改 82 行 · 残余 5 · 保留 5（全部为 `divide-divider`，不在本 Phase 映射表中，等 Phase 6 兼容层清理时统一删除）

---

## 处理要点

1. **执行顺序**：严格按 specific → general，避免 `text-brand-bright` 被 `text-brand` 误抢；`bg-brand-soft` 在 `bg-brand` 之前。
2. **hover/active 变体**：`hover:text-brand` / `hover:border-brand` / `hover:bg-brand` 这类前缀变体，因 `replace_all` 是子串替换，自动覆盖（如 `markets/themes/[slug]/page.tsx` L19 的 `hover:text-brand` → `hover:text-accent`）。
3. **inline CSS var**：`insight/[id]/page.tsx` L138/L147 的 inline `style={{ background: "var(--lb-down-soft)" }}` / `var(--lb-up-soft)` 已改为 `var(--down-soft)` / `var(--up-soft)`（Design-System SSOT 已存在）。
4. **redirect stubs**：`news/page.tsx` 和 `calendar/page.tsx` 已并入 `/markets?tab=*`，仅含 `redirect()` 调用，无 token 残留。
5. **`divide-divider` 保留说明**：本 Phase 3 映射表只列 `border-divider` 与 `bg-divider`，未列 Tailwind 工具类 `divide-{color}`。为遵守"严格按表"约束，保留 5 处 `divide-divider`。`app/globals.css` 兼容层仍定义 `--color-divider-strong`，且 `divider` token 在 `tokens.css` 中存在，Phase 6 收尾统一处理。

---

## 验证

```bash
$ npx tsc --noEmit
# exit 0，无 error
```

按表残余 grep（pattern 含 `divide-divider`）：

```
insight/[id]/page.tsx        : 4  (全部 divide-divider，保留)
insights/page.tsx            : 0
marketplace/page.tsx         : 0
markets/page.tsx             : 1  (divide-divider，保留)
markets/themes/[slug]/page.tsx: 0
news/page.tsx                : 0
calendar/page.tsx            : 0
```

按映射表所列 token 残余 = **0**。
非表外溢 `divide-divider` 残余 = **5**（待 Phase 6 一并清理）。
