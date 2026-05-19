# Phase 0 · 摸底 + 备份 Audit

**Audit date**: 2026-05-19

## P0-1 · grep 统计(按 PLAN §2.a 表 12 项)

| # | Pattern | Files | Occurrences |
|---|---------|-------|-------------|
| 1 | `\btext-brand\b` | 38 | 159 |
| 2 | `\bbg-brand\b` | 27 | 66 |
| 3 | `\bbg-brand-soft\b` | 16 | 27 |
| 4 | `\btext-brand-bright\b` | 0 | 0 |
| 5 | `\bborder-divider\b` | 46 | 232 |
| 6 | `\bborder-divider-strong\b` | 9 | 10 |
| 7a | `\btext-warning\b` | 16 | 28 |
| 7b | `\bbg-warning\b` | 17 | 39 |
| 8 | `\blb-num\b` | 28 | 129 |
| 9 | `\blb-caps\b` | 27 | 39 |
| 10 | `(text-agent-|bg-agent-)` | 0 | 0 |
| 11 | `--color-chart-[1-8]\b` | 0 | 0 |
| 12 | `(--lb-brand\b|--lb-bg-brand-soft\b)` | 3 | 14 |

## P0-2 · 备份

- `docs/brand-kit/tokens.next-purple.bak.css` (5049 B)
- `app/globals.next-purple.bak.css` (4240 B)

## Unique files needing sweep

- app/(app)/insight/[id]/page.tsx
- app/(app)/insights/page.tsx
- app/(app)/marketplace/page.tsx
- app/(app)/markets/page.tsx
- app/(app)/markets/themes/[slug]/page.tsx
- app/(app)/page.tsx
- app/(app)/plan/[id]/PlanHITLAck.tsx
- app/(app)/plan/[id]/page.tsx
- app/(app)/plan/page.tsx
- app/(app)/portfolio/[symbol]/page.tsx
- app/(app)/portfolio/page.tsx
- app/(app)/portrait/page.tsx
- app/(app)/review/[id]/ReviewReflectionEditor.tsx
- app/(app)/review/[id]/page.tsx
- app/(app)/review/page.tsx
- app/(app)/screener/page.tsx
- app/(app)/search/page.tsx
- app/(app)/stock/[symbol]/page.tsx
- app/(app)/strategy/[id]/page.tsx
- app/(app)/strategy/builder/page.tsx
- app/(app)/strategy/mine/page.tsx
- app/(app)/strategy/page.tsx
- app/(app)/subagents/page.tsx
- app/(app)/thesis/[id]/ThesisResearchActions.tsx
- app/(app)/thesis/[id]/page.tsx
- app/(app)/thesis/page.tsx
- app/(app)/watchlist/page.tsx
- app/globals.css
- components/chat/ToolBlock.tsx
- components/chat/widgets/CatalystCardInline.tsx
- components/chat/widgets/HitlConfirm.tsx
- components/chat/widgets/HitlMultiselect.tsx
- components/chat/widgets/QuoteCardInline.tsx
- components/chat/widgets/SignalCardInline.tsx
- components/dynamic/AgentPanel.tsx
- components/dynamic/DynView.tsx
- components/gallery/GalleryChrome.tsx
- components/gallery/primitives.tsx
- components/gallery/shared.tsx
- components/insights/InsightsBoard.tsx
- components/shell/AvatarMenu.tsx
- components/shell/InputBar.tsx
- components/shell/LeftRail.tsx
- components/shell/PeekDrawer.tsx
- components/shell/PlaceholderPage.tsx
- components/shell/RightChat.tsx
- components/shell/SearchModal.tsx
- components/shell/Shell.tsx
- components/shell/TopBar.tsx
- components/shell/WorkStateIndicator.tsx
- components/stock/PriceSparkline.tsx
- docs/brand-kit/tokens.css
