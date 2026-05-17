# Plan11 — V3 US 全面精修验收报告

> 配套 `Plan11.md`,把 V2 Plan8/9/10 的成果迁移到 V3,合并三维度精修。

## 版本

| 版本 | 状态 | 完成日期 |
|------|------|---------|
| v1.0 — Pre-fix 审计 | ✅ 完成 | 2026-05-17 |
| v2.0 — Post-fix 复核 | ✅ 完成 | 2026-05-17 |

---

# v1.0 — Pre-fix 审计结果

## 审计方法

6 并行 agent 覆盖 V3 31 个组件:
- Agent 1: QuoteHero / AlertHot / AlertCalendar / IntradayChart / QuoteKV / CompanyProfile(6)
- Agent 2: EventTracker / DolphinResearch / NewsPreview / NewsCardBig / DiscussionFeed(5)
- Agent 3: EarningsSummary / FinancialHealthScore / FinancialTable / RevenueComposition / DividendPlan(5)
- Agent 4: EarningsForecast / ValuationHistory / AnalystConsensus / InstitutionalHolding / KeyFactors(5)
- Agent 5: Valuation / StockTabs / TagStrip / AIAnalysis / SectorPosition(5)
- Agent 6: **US-only 5 个** — BottomTabNav / CapitalFlow / OrderBookL2 / Shorting / StickyTradeBar

## 三个维度发现汇总

### A. Token 一致性问题(批量机械可修)

| # | 问题 | 文件 |
|---|------|------|
| 1 | `var(--font-text)` UNDEFINED token × 2 | KeyFactors.tsx:138 + FinancialHealthScore.tsx:262 |
| 2 | `var(--bg-3)` UNDEFINED token × 2 | Valuation.tsx:84/88 |
| 3 | `var(--accent)` 缺 --color- 前缀 × 4 | ValuationHistory.tsx:40/86/90/95 |
| 4 | `var(--fg-3)` 缺前缀 × N | ValuationHistory:68 + 多文件 |
| 5 | `var(--hairline)` 缺前缀 × 3 | CapitalFlow:231 / EarningsForecast:106 / FinancialTable:117 |
| 6 | `var(--line)` 缺前缀 × 1 | InstitutionalHolding:71 |
| 7 | `var(--hairline-strong)` 缺前缀 × 1 | IntradayChart:104 |
| 8 | `var(--chart-blue, ...)` 缺前缀 + fallback 链 | Valuation:83 |

**总计**:~30 处 token 引用问题 + **4 个 undefined token 渲染 bug**

### B. V2 已修但 V3 还有的视觉 polish 问题

V3 自 Plan4 fork 后未跟进 V2 的 Plan8 修复。以下问题 V2 已修过,V3 还原样:

| # | 组件 | 问题 | V2 已修 |
|---|------|------|---------|
| 1 | AlertCalendar:31 | event type bracket font-medium | → font-semibold |
| 2 | DolphinResearch:54 | title text-md(13px)| → text-lg(14px)+ leading-snug |
| 3 | AIAnalysis:94 | bullet leading-relaxed-tight 与段落不一致 | → leading-relaxed-snug |
| 4 | SectorPosition:68 | 高亮行 peer name 仅 fg-2,失高亮 | → highlighted ? font-semibold fg-1 : fg-2 |
| 5 | TagStrip:62 | tag 按钮缺 rounded-sm | → 加 rounded-sm |

### C. V3 US-only 5 组件评估

| 组件 | 设计评估 | Token | 语义 |
|------|---------|------|------|
| BottomTabNav | ✅ 与 Robinhood 底部 nav 一致 | ✅ | ✅ active accent / inactive fg-3 |
| CapitalFlow | ✅ 与 Yahoo Finance fund flow 一致 | ✅(--color-* 已用)| ✅ 资金流向 up/down 语义正确 |
| OrderBookL2 | ✅ 与 Bloomberg / TradingView L2 一致 | ✅ | ✅ bid=up / ask=down 正确 |
| Shorting | ✅ 与 Seeking Alpha 风格一致 | ✅ | ✅ 高 short ratio 用 warn 而非 down,正确 |
| StickyTradeBar | ✅ Robinhood 风格 CTA | ✅ | ✅ Trade=accent / Options=card-2 |

US-only 5 个**整体设计合格**,可投产。Agent 报告中 P1/P2 polish 项多为"标签 weight 微调 / hover state 一致性",非阻塞。

### D. V3 fork 设计偏离评估(intentional vs regression)

| 组件 | V3 vs V2 差异 | 评估 |
|------|--------------|------|
| QuoteHero | V3 加 pills + AI score chip,KV 矩阵分离到 QuoteKV | ✅ intentional(US 简化风)|
| QuoteKV | V3 3 列 grid vs V2 5-group 矩阵 | ✅ intentional(US 低密度)|
| IntradayChart | V3 单 24h + pre/reg/post 段 vs V2 9 Tab K 线 | ✅ intentional(US vs CN)|
| CompanyProfile | V3 单列 about vs V2 双列叙述 + 行业图 | ✅ intentional |
| EarningsSummary | V3 3 张紧凑卡 vs V2 ERN grid + Guidance | ✅ intentional(US 卡片风)|
| RevenueComposition | V3 Sankey 流图 vs V2 多年 stacked bar | ✅ intentional |
| FinancialHealthScore | V3 grade text-6xl + 雷达 vs V2 text-4xl + 雷达 | ✅ intentional(US Hero 风)|
| FinancialTable | V3 bar+line chart vs V2 bar+footer 表 | ✅ intentional |
| InstitutionalHolding | V3 净买卖 bar chart vs V2 holders 表 | ✅ intentional |
| AnalystConsensus | V3 简化 donut + KV vs V2 3 列(donut + 表 + 3 折线) | ✅ intentional |
| Valuation | V3 单 donut + center label vs V2 2×2 grid | ✅ intentional |
| DividendPlan | V3 3 列 KV(无 yield trend)vs V2 4 列含 trend | ⚠️ 可补 yield trend(可选) |
| StockTabs | V3 4 个英文 tab + bg-fg-1 underline vs V2 5 中文 + accent underline | ⚠️ underline 用 bg-fg-1 削弱品牌一致性 |

---

# v2.0 — Post-fix 复核

## 验证结果

| 项 | 结果 |
|----|------|
| `npx tsc --noEmit` | ✅ EXIT=0 |
| `npx vite build` | ✅ 成功(852ms) |
| V1 `src/components/` 改动 | ✅ 0 |
| V2 `src/components-longbridge/` 改动 | ✅ 0 |
| `src/mock/stockDetail.ts` / `stockDetail-lb.ts` 改动 | ✅ 0 |
| V3 改动文件 | 17 个 / 31 |
| 改动行数 | +49 / −49(纯替换) |

## A 维度修复(Phase 3A — sed 批处理)

| # | 修复 | 文件数 |
|---|------|-------|
| 1 | `var(--font-text)` → `var(--font-sans)`(undefined → defined) | 2 |
| 2 | `var(--bg-3)` → `var(--color-card-2)`(undefined → 合理替代) | 1(2 处) |
| 3 | `var(--accent)` → `var(--color-accent)` | 1(多处) |
| 4 | `var(--fg-N)` × N → `var(--color-fg-N)` | 多 |
| 5 | `var(--hairline)` → `var(--color-hairline)` | 多 |
| 6 | `var(--line)` → `var(--color-line)` | 1 |
| 7 | `var(--hairline-strong)` → `var(--color-hairline-strong)` | 1 |
| 8 | `var(--chart-blue, ...)` 简化为 `var(--color-chart-blue)` | 1 |
| 9 | `var(--up)/--down)/--chart-*)` 全统一加 --color- 前缀 | 多 |

**总计**:30+ token refs 一致化 + 4 undefined token bugs 修复。

## B 维度修复(Phase 3B — V2-pattern 迁移)

| # | 文件:行 | 修复 |
|---|---------|------|
| 1 | AlertCalendar.tsx:31 | event type bracket `font-medium` → `font-semibold` |
| 2 | DolphinResearch.tsx:54 | title `text-md` → `text-lg leading-snug` |
| 3 | AIAnalysis.tsx:94 | bullet `leading-relaxed-tight` → `leading-relaxed-snug` |
| 4 | SectorPosition.tsx:68 | 高亮行 peer name → `font-semibold text-fg-1` 否则 `text-fg-2` |
| 5 | TagStrip.tsx:62 | tag 按钮加 `rounded-sm` |

## C 维度评估(US-only 5 + 设计偏离)

| 项 | 决策 |
|----|------|
| US-only 5 个组件(BottomTabNav / CapitalFlow / OrderBookL2 / Shorting / StickyTradeBar) | ✅ 评估通过,无需修复(已对照 Robinhood / Yahoo / TradingView 规范) |
| EarningsSummary 无 SectionHeader | ✅ V3 卡片风的故意选择,不强加 SectionHeader |
| StockTabs underline 用 bg-fg-1 而非 bg-accent | ⚠️ **不动** — 这是 V3 US 风的故意选择(白色 underline 更克制,Yahoo Finance 风),非 bug |
| DividendPlan 无 yield trend | ⚠️ **不动** — V3 简化版选择,若需加可独立 Plan 处理 |

## 残留(留下一轮 polish)

| 项 | 严重度 | 评估 |
|----|-------|------|
| BottomTabNav emoji icon 占位 | P2 | 生产化时替换为 SVG icon |
| CapitalFlow / OrderBookL2 / Shorting SVG `gradientId` 全局唯一 ID 冲突风险 | P2 | 多实例渲染时才会触发,本原型无影响 |
| StickyTradeBar `sticky bottom-14` 写死 BottomTabNav 高度 | P2 | 若 BottomTabNav 高度变化会破 |

---

# 总结

V3 经 Plan11 一轮后:
- ✅ 4 个 **undefined token 渲染 bug 修复**(`--font-text` × 2 + `--bg-3` × 2)
- ✅ 30+ token 引用一致化(全 `var(--color-*)` 前缀)
- ✅ 5 个 V2-Plan8 已修的 polish 项迁移到 V3
- ✅ US-only 5 组件评估**全部合格**
- ✅ V1 / V2 / 其他 mock **0 改动**(严守 fork 边界)
- ✅ tsc + build EXIT=0

V3 现在与 V2 处于同一精修水平。三套版本的"风格分歧"是**故意的设计语言差异**,不是 bug。
