# Phase 3 · Agent B Components Token Sweep

**Date**: 2026-05-19
**Scope**: dynamic + gallery + insights + chat + stock 共 13 个文件
**Verification**: `npx tsc --noEmit` 0 error · 全部文件 0 个 stale token 残余

## 映射规则(执行顺序 specific → general)

| 旧 | 新 |
|---|---|
| `bg-brand-soft` | `bg-accent-soft` |
| `text-brand-ink` | `text-fg-inverse` |
| `border-divider-strong` | `border-hairline-strong` |
| `bg-warning` / `bg-warning/15` / `bg-warning/10` | `bg-warn` / `bg-warn/15` / `bg-warn/10` |
| `text-warning` / `border-warning/40` / `border-l-warning` | `text-warn` / `border-warn/40` / `border-l-warn` |
| `text-brand` (含 `hover:text-brand`) | `text-accent` |
| `bg-brand` | `bg-accent` |
| `border-brand` (含 `hover:border-brand`) | `border-accent` |
| `border-divider` / `bg-divider` / `divide-divider` | `border-hairline-strong` / `bg-hairline-strong` / `divide-hairline-strong` |
| `.lb-num` | `.num` |
| `.lb-caps` | `.caps` |
| inline `var(--lb-up-dark)` / `var(--lb-down-dark)` / `var(--lb-up-soft)` / `var(--lb-down-soft)` | `var(--up)` / `var(--down)` / `var(--up-soft)` / `var(--down-soft)` |
| inline `var(--lb-brand)` | `var(--accent)` |
| inline `var(--lb-fg-1)` | `var(--fg-1)` |

`.lb-kicker` 不在本次清单(映射表未列),保留(globals.css temp-compat 仍提供,Phase 6 集中清理)。

## 文件级 changelog

| Code | 文件 | 改动 token 种数 | 残余 stale | 备注 |
|---|---|---|---|---|
| P3-D01 | components/dynamic/AgentPanel.tsx | 2 | 0 | border-divider×2 → border-hairline-strong;lb-caps → caps |
| P3-D02 | components/dynamic/DynView.tsx | 5 | 0 | border-divider×3 / border-divider-strong / text-brand / bg-divider / lb-caps×2 |
| P3-G01 | components/gallery/GalleryChrome.tsx | 2 | 0 | border-divider×4 / hover:text-brand |
| P3-G02 | components/gallery/primitives.tsx | 14 | 2 lb-kicker(保留) | bg-brand-soft / text-brand-ink / border-divider-strong / text-brand / bg-brand / border-brand / text-warning / bg-warning / border-l-warning / border-divider / bg-divider / divide-divider / lb-num / lb-caps + inline var(--lb-brand) var(--lb-fg-1) |
| P3-G03 | components/gallery/shared.tsx | 8 | 1 lb-kicker(保留) | text-brand / bg-brand / border-brand / hover:border-brand hover:text-brand / text-warning / bg-warning / border-l-warning / border-divider / lb-num |
| P3-I01 | components/insights/InsightsBoard.tsx | 4 | 0 | text-brand×2 / bg-brand×2 / border-divider×2 / divide-divider×2 |
| P3-C01 | components/chat/ToolBlock.tsx | 3 | 0 | text-warning / bg-warning/10 / border-warning/40 |
| P3-C02 | components/chat/widgets/CatalystCardInline.tsx | 6 | 0 | text-brand / text-warning / bg-warning/10 / border-warning/40 / border-divider×2 / lb-caps |
| P3-C03 | components/chat/widgets/HitlConfirm.tsx | 5 | 0 | bg-brand-soft / text-brand / bg-brand / border-brand / border-divider |
| P3-C04 | components/chat/widgets/HitlMultiselect.tsx | 5 | 0 | bg-brand-soft / text-brand / bg-brand / border-brand / border-divider |
| P3-C05 | components/chat/widgets/QuoteCardInline.tsx | 5 | 0 | text-warning / bg-warning/10 / border-warning/40 / border-divider×2 / lb-num |
| P3-C06 | components/chat/widgets/SignalCardInline.tsx | 9 | 0 | text-brand / bg-brand / border-brand / text-warning / bg-warning/15 / border-warning/40 / border-divider×2 / lb-num / lb-caps |
| P3-C07 | components/stock/PriceSparkline.tsx | 2 | 0 | inline `var(--lb-up-dark)` `var(--lb-down-dark)` `var(--lb-up-soft)` `var(--lb-down-soft)` → `var(--up)` `var(--down)` `var(--up-soft)` `var(--down-soft)`;lb-num×3 → num |

## 验证

```bash
$ npx tsc --noEmit
# 0 error

$ for f in <13 files>; do
    grep -cE 'text-brand|bg-brand|border-divider|bg-divider|divide-divider|text-warning|bg-warning|border-warning|border-l-warning|border-brand|ring-brand|lb-num|lb-caps|--lb-' "$f"
  done
# 0 0 0 0 0 0 0 0 0 0 0 0 0
```

## 完成清单

- 2026-05-19 components/dynamic/AgentPanel.tsx — 改 4 行,残余 stale 0
- 2026-05-19 components/dynamic/DynView.tsx — 改 8 行,残余 stale 0
- 2026-05-19 components/gallery/GalleryChrome.tsx — 改 4 行,残余 stale 0
- 2026-05-19 components/gallery/primitives.tsx — 改 ~50 行,残余 stale 0(保留 lb-kicker×2)
- 2026-05-19 components/gallery/shared.tsx — 改 ~15 行,残余 stale 0(保留 lb-kicker×1)
- 2026-05-19 components/insights/InsightsBoard.tsx — 改 8 行,残余 stale 0
- 2026-05-19 components/chat/ToolBlock.tsx — 改 1 行,残余 stale 0
- 2026-05-19 components/chat/widgets/CatalystCardInline.tsx — 改 6 行,残余 stale 0
- 2026-05-19 components/chat/widgets/HitlConfirm.tsx — 改 6 行,残余 stale 0
- 2026-05-19 components/chat/widgets/HitlMultiselect.tsx — 改 7 行,残余 stale 0
- 2026-05-19 components/chat/widgets/QuoteCardInline.tsx — 改 6 行,残余 stale 0
- 2026-05-19 components/chat/widgets/SignalCardInline.tsx — 改 13 行,残余 stale 0
- 2026-05-19 components/stock/PriceSparkline.tsx — 改 5 行,残余 stale 0
