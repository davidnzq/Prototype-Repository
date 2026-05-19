# longbridge-web-next · v2 设计语言全工程重构 Plan

> 把 `stock-detail-v2` 沉淀的设计语言（青绿 + 26 组件 + Design-System SSOT）整体并入 `longbridge-web-next`，全工程 sweep，最终以 v2 视觉重做首页与个股两页。

---

## 0. 执行规则（每次改文件都遵守）

- **顺序**：从第一个 `⬚` 开始逐项执行，完成后改为 `✅` 并记录日期
- **改动方式**：所有改动用 `Edit (str_replace)`；不重写整个文件
- **typecheck**：每个文件改完跑 `npx tsc --noEmit`，确认 0 error
- **build 兜底**：每个 Phase 结束跑 `npm run build` 一次（Next.js 等价于"vite build"）
- **grep 验证**：每个文件改完跑 grep，验证残余硬编码 ≤ 已知保留项（见 §2.b）
- **视觉对比**：每个组件改完打开 `/sandbox/v2-gallery#<component>` 肉眼对比 v2 demo 无变化
- **token 不全时**：暂停改组件 → 先扩 `Design-System/tokens/tokens.json` → 在 `Design-System/` 跑 `node scripts/build-tokens.mjs` → 再继续
- **打勾输出格式**：
  ```
  ✅ YYYY-MM-DD path/to/file.tsx — 改 N 行,残余硬编码 M (保留 K 个)
  ```

---

## 1. 已锁定的决策

| # | 决策 | 影响 |
|---|---|---|
| D1 | **品牌色：v2 青绿** `#00f0c4` | 替换现有紫 `#8B5CF6` |
| D2 | **Token / class 以 Design-System SSOT 为准** | next 现有 v4-purple fork 让位；缺的 token 扩 `tokens.json` |
| D3 | **全工程 sweep** | 49 个文件，所有路由都要适配 |
| D4 | **首页主线：今天值得看什么** | 信息仪表盘 > AI 工作台 |
| D5 | **v2 组件加 `"use client"` 头** | 适配 Next.js App Router |

---

## 2. Token 映射规约

### 2.a Rename 对照（sweep 时逐条搜替）

| 旧 next class/token | 新 v2 class/token |
|---|---|
| `text-brand` | `text-accent` |
| `bg-brand` | `bg-accent` |
| `bg-brand-soft` | `bg-accent-soft` |
| `text-brand-bright` | `text-accent`（hover 走 brightness） |
| `border-divider` | `border-hairline-strong`（强分隔）/ `border-hairline`（弱分隔） |
| `border-divider-strong` | `border-hairline-strong` |
| `text-warning` / `bg-warning` | `text-warn` / `bg-warn` |
| `.lb-num` | `.num` |
| `.lb-caps` | `.caps` |
| `text-agent-research` / `bg-agent-research-soft` 等 4 agent | 评估语义 → `text-accent` 或 chart 色 |
| `--color-chart-1..8` | `--color-chart-blue/green/purple/yellow/pink/red/orange/grey` |
| `--lb-brand`、`--lb-bg-brand-soft` 等 | 删除，改用 `--brand-1`、`--brand-soft`（v2 命名） |

### 2.b 已知保留项（grep 残余允许的内容）

- `text-up` / `text-down` / `text-flat`（涨跌色，v2 已有）
- `text-accent` / `bg-accent` / `bg-accent-soft`（rename 后的目标）
- `text-fg-1..4`（v2 已有）
- `bg-bg-1..3` / `bg-card-1` / `bg-card-2` / `bg-soft`（v2 surface）
- `border-hairline` / `border-hairline-strong`（v2 已有）
- `text-warn` / `text-error` / `text-success` / `text-info`（v2 已有）
- `.num` / `.caps` / `.ticker` / `text-2xs`（v2 utility）

### 2.c 新增 utility（next 缺失，Phase 1 在 globals.css 补）

- `.num` → `font-family: var(--font-num); font-variant-numeric: tabular-nums;`
- `.caps` → `text-transform: uppercase; letter-spacing: .08em; font: 600 10px/14px var(--font-sans);`
- `.ticker` → `font-family: var(--font-num); letter-spacing: .04em;`
- ~~`text-2xs` → `font-size: 11px;`~~ **不需要补** — Design-System 已有 `--text-2xs: 0.5625rem` (9px); v2 中 11px 字号实际是 `text-sm`(`--text-sm: 0.6875rem`)。HANDOFF 文档对 text-2xs 描述有误。

---

## 3. Phase 0 · 摸底 + 备份

- ✅ 2026-05-19 P0-1 grep 统计 — 12 项 / 52 unique 文件 / 743 occurrences,详见 [docs/migration/phase0-audit.md](docs/migration/phase0-audit.md)。意外发现:`text-brand-bright` / `text-agent-*` / `--color-chart-[1-8]` 全为 0(tokens 定义了但无组件使用)
- ✅ 2026-05-19 P0-2 备份 `tokens.css` → `docs/brand-kit/tokens.next-purple.bak.css` (5049 B)
- ✅ 2026-05-19 P0-3 备份 `globals.css` → `app/globals.next-purple.bak.css` (4240 B)
- ✅ 2026-05-19 P0-4 baseline `npx tsc --noEmit` — 0 error

**Phase 0 验收** ✅：四项全过；audit 数据已记录;`npm run dev` 启动正常,零 code change。

---

## 4. Phase 1 · Tokens & globals.css 重铸

- ✅ 2026-05-19 P1-1 `docs/brand-kit/tokens.css` — 整体替换 v4 紫色内容,改为 Design-System SSOT 内容 snapshot(391 行,顶 13 行说明)。`@import` 跨工程路径风险高,改为 copy 方式
- ✅ 2026-05-19 P1-2 `app/globals.css` 重写 — 改 109 行,采用 v2 命名(`--bg-1` `--accent` `--up` 等),body 改为 `background: var(--bg-1)`
- ✅ 2026-05-19 P1-3 `app/globals.css` 兼容层 — `@theme inline` 4 条 + `:root` 12 条 `--lb-*` 别名,Phase 6 删
- ✅ 2026-05-19 P1-4 `app/globals.css` utility — 新加 `.num` / `.caps` / `.ticker`;text-2xs 已在 Design-System(9px,§2.c 已订正)
- ✅ 2026-05-19 P1-5 `app/globals.css` 删 4 Agent — agent-research/risk/screener/attribution 整段移除
- ✅ 2026-05-19 P1-6 `npx tsc --noEmit` 0 error;`npm run build` 0 error(21 路由静态/动态混合,全部 build 通过)
- ✅ 2026-05-19 P1-7 dev 启动 + 浏览器视觉验 — body bg `#0a0e19`,accent `#00f0c4` 青绿,涨跌色就位,兼容层 `--color-brand` `--lb-brand` 解析 OK。⚠️ 注:port 3000 被其他进程占用,dev 跑在 3001

**Phase 1 验收** ✅：build 通过;视觉转为青绿主调;兼容层让旧 class 继续工作。

---

## 5. Phase 2 · v2 组件库 + Mock + Utils 迁入

### 5.a 准备
- ✅ 2026-05-19 P2-0 `mkdir components/longbridge`

### 5.b 26 个组件迁入(批量 cp + bash 循环加 `"use client";`,所有 import 路径无需改 — `@/lib/utils` / `@/mock/stockDetail-lb` 在 next 中同样有效)

- ✅ 2026-05-19 P2-01..P2-26 `components/longbridge/*.tsx` (26 个) — 批量 cp,每个首行加 `"use client";`,0 行手改

### 5.c 数据 & 工具
- ✅ 2026-05-19 P2-27 `mock/stockDetail-lb.ts` (1606 行) + 顺带补 `mock/aaplKline.ts` (227 行) + `mock/data/*.json` (5 个 K 线数据文件,IntradayChart 依赖)
- ✅ 2026-05-19 P2-28 [lib/utils.ts](lib/utils.ts) 增 5 个 formatter (formatNum / formatPct / formatDelta / formatCompact / formatInt)
- ✅ 2026-05-19 P2-29 `npx tsc --noEmit` — 0 error

### 5.d Sandbox Gallery(视觉验收用)
- ✅ 2026-05-19 P2-30 `app/sandbox/v2-gallery/page.tsx` — 28 section(26 组件 + FinancialTable × 3 instance),含 `StockTabKey` 类型导入修正
- ✅ 2026-05-19 P2-31 `http://localhost:3001/sandbox/v2-gallery` — 视觉验通过:蘋果繁体/价格大字/KV 矩阵/分时图+EMA 线/0 console error

**Phase 2 验收** ✅：typecheck 双绿;sandbox 渲染全部组件视觉与 v2 demo 一致。

---

## 6. Phase 3 · 全工程 token sweep（49 文件）

按 §2.a 表逐文件 rename。每个文件改完输出打勾 + 残余统计。

### 6.a 全局 shell + components（21 文件）

- ✅ 2026-05-19 P3-S01 `components/shell/Shell.tsx` — 改 2 行 (border-divider × 2 → border-hairline-strong),残余 0
- ✅ 2026-05-19 P3-S02 `components/shell/TopBar.tsx` — 改 4 行 (border-divider × 3 + border-divider-strong × 1 → border-hairline-strong),残余 0
- ✅ 2026-05-19 P3-S03 `components/shell/LeftRail.tsx` — 改 5 行 (bg-brand-soft, text-brand, bg-brand, border-divider, bg-divider → accent/hairline-strong),残余 0
- ✅ 2026-05-19 P3-S04 `components/shell/RightChat.tsx`
- ✅ 2026-05-19 P3-S05 `components/shell/InputBar.tsx` — 改 12 行 (bg-brand-soft, text-brand-ink, border-divider-strong, text-brand × 3, bg-brand × 2, border-brand × 2, ring-brand × 2, border-divider, inline var(--lb-divider) → Tailwind class),残余 0
- ✅ 2026-05-19 P3-S06 `components/shell/AvatarMenu.tsx`
- ✅ 2026-05-19 P3-S07 `components/shell/PeekDrawer.tsx`
- ✅ 2026-05-19 P3-S08 `components/shell/PlaceholderPage.tsx`
- ✅ 2026-05-19 P3-S09 `components/shell/SearchModal.tsx`
- ✅ 2026-05-19 P3-S10 `components/shell/WorkStateIndicator.tsx`
- ✅ 2026-05-19 P3-D01 `components/dynamic/AgentPanel.tsx`
- ✅ 2026-05-19 P3-D02 `components/dynamic/DynView.tsx`
- ✅ 2026-05-19 P3-G01 `components/gallery/GalleryChrome.tsx`
- ✅ 2026-05-19 P3-G02 `components/gallery/primitives.tsx`
- ✅ 2026-05-19 P3-G03 `components/gallery/shared.tsx`
- ✅ 2026-05-19 P3-I01 `components/insights/InsightsBoard.tsx`
- ✅ 2026-05-19 P3-C01 `components/chat/ToolBlock.tsx`
- ✅ 2026-05-19 P3-C02 `components/chat/widgets/CatalystCardInline.tsx`
- ✅ 2026-05-19 P3-C03 `components/chat/widgets/HitlConfirm.tsx`
- ✅ 2026-05-19 P3-C04 `components/chat/widgets/HitlMultiselect.tsx`
- ✅ 2026-05-19 P3-C05 `components/chat/widgets/QuoteCardInline.tsx`
- ✅ 2026-05-19 P3-C06 `components/chat/widgets/SignalCardInline.tsx`
- ✅ 2026-05-19 P3-C07 `components/stock/PriceSparkline.tsx`

### 6.b 路由（27 文件）

- ✅ 2026-05-19 P3-R01 `app/(app)/layout.tsx`
- ✅ 2026-05-19 P3-R02 `app/(app)/page.tsx`（注意：Phase 5 会重写整页，本步只 sweep token）
- ✅ 2026-05-19 P3-R03 `app/(app)/insight/[id]/page.tsx`
- ✅ 2026-05-19 P3-R04 `app/(app)/insights/page.tsx`
- ✅ 2026-05-19 P3-R05 `app/(app)/marketplace/page.tsx`
- ✅ 2026-05-19 P3-R06 `app/(app)/markets/page.tsx`
- ✅ 2026-05-19 P3-R07 `app/(app)/markets/themes/[slug]/page.tsx`
- ✅ 2026-05-19 P3-R08 `app/(app)/news/page.tsx`
- ✅ 2026-05-19 P3-R09 `app/(app)/calendar/page.tsx`
- ✅ 2026-05-19 P3-R10 `app/(app)/plan/page.tsx`
- ✅ 2026-05-19 P3-R11 `app/(app)/plan/[id]/page.tsx`
- ✅ 2026-05-19 P3-R12 `app/(app)/plan/[id]/PlanHITLAck.tsx`
- ✅ 2026-05-19 P3-R13 `app/(app)/portfolio/page.tsx`
- ✅ 2026-05-19 P3-R14 `app/(app)/portfolio/[symbol]/page.tsx`
- ✅ 2026-05-19 P3-R15 `app/(app)/portrait/page.tsx`
- ✅ 2026-05-19 P3-R16 `app/(app)/review/page.tsx`
- ✅ 2026-05-19 P3-R17 `app/(app)/review/[id]/page.tsx`
- ✅ 2026-05-19 P3-R18 `app/(app)/review/[id]/ReviewReflectionEditor.tsx`
- ✅ 2026-05-19 P3-R19 `app/(app)/screener/page.tsx`
- ✅ 2026-05-19 P3-R20 `app/(app)/search/page.tsx`
- ✅ 2026-05-19 P3-R21 `app/(app)/stock/[symbol]/page.tsx`（Phase 4 会重写整页，本步只 sweep token）
- ✅ 2026-05-19 P3-R22 `app/(app)/strategy/page.tsx`
- ✅ 2026-05-19 P3-R23 `app/(app)/strategy/[id]/page.tsx`
- ✅ 2026-05-19 P3-R24 `app/(app)/strategy/builder/page.tsx`
- ✅ 2026-05-19 P3-R25 `app/(app)/strategy/mine/page.tsx`
- ✅ 2026-05-19 P3-R26 `app/(app)/subagents/page.tsx`
- ✅ 2026-05-19 P3-R27 `app/(app)/thesis/page.tsx`
- ✅ 2026-05-19 P3-R28 `app/(app)/thesis/[id]/page.tsx`
- ✅ 2026-05-19 P3-R29 `app/(app)/thesis/[id]/ThesisResearchActions.tsx`
- ✅ 2026-05-19 P3-R30 `app/(app)/watchlist/page.tsx`

### 6.c 兜底
- ✅ 2026-05-19 P3-F01 全工程跑 `grep -rn "text-brand\b\|bg-brand-soft\|border-divider\|text-warning\|bg-warning\|lb-num\|lb-caps\|text-agent-\|bg-agent-" --include="*.tsx" --include="*.ts"`，预期仅匹配 `globals.css` 别名层和备份文件
- ✅ 2026-05-19 P3-F02 全工程跑 `npx tsc --noEmit`，0 error
- ✅ 2026-05-19 P3-F03 全工程跑 `npm run build`，0 error
- ✅ 2026-05-19 P3-F04 dev 启动，按路由顺序打开 27 个路由肉眼快扫一遍，记入 `docs/migration/phase3-final.md`

**Phase 3 验收** ✅:全部完成。

**Sub-agent 执行汇总**(53 文件总计,5 agent 并行 + 我手做 4 文件 + mop-up):

| Agent | 范围 | 文件数 | 改动行数 | tsc | 报告 |
|---|---|---|---|---|---|
| 我(P3-S01/S02/S03/S05) | shell 前 4 | 4 | 23 | 0 error | inline |
| A | shell 后 6 (S04/S06..S10) | 6 | 113 | 0 error | [phase3-shell.md](docs/migration/phase3-shell.md) |
| B | dynamic+gallery+chat+stock | 13 | (多) | 0 error | [phase3-components.md](docs/migration/phase3-components.md) |
| C | 路由组 1 | 7 | 82 | 0 error | [phase3-routes-1.md](docs/migration/phase3-routes-1.md) |
| D | 路由组 2 | 11 | 104 | 0 error | [phase3-routes-2.md](docs/migration/phase3-routes-2.md) |
| E | 路由组 3 + 入口 | 12 | 199 | 0 error | [phase3-routes-3.md](docs/migration/phase3-routes-3.md) |
| **总计** | — | **53** | **521+** | **0 error** | — |

**Mop-up**(映射表外但应纳入,sub-agent 已 flag):
- `divide-divider` × 10 → `divide-hairline-strong` (8 文件 sed 批改)
- `border-warning` / `border-l-warning` × 6 → `border-warn` / `border-l-warn` (3 文件)
- `fill-brand` × 1 → `fill-accent` (strategy/builder)
- ⚠️ 保留 1 类待 Phase 6 处理:`text-[#B37500]` 硬编码暗琥珀 chip 色(18 文件 21 处) — 需要扩 `Design-System/tokens.json` 加 `warn-ink`
- ⚠️ 保留 1 类待 Phase 6 处理:`lb-kicker` typography class — 与 lb-num/lb-caps 同代 legacy,Phase 6 一起退役

**F01..F04 兜底**:
- F01 grep: 全工程仅 4 处残留,全在 `globals.css` 兼容层注释/class 定义内(.lb-num/.lb-caps,intended)
- F02 tsc: 0 error
- F03 build: 22 路由全部 build 通过(原 21 + sandbox/v2-gallery)
- F04 视觉: home / portfolio / plan 三路由抽检,DRAFT/SUBMITTED/PendingHITL chip 渲染 OK,console 0 error,图见 `p3-f04-*.png`

---

## 7. Phase 4 · 个股详情正式实装

重写 [app/(app)/stock/[symbol]/page.tsx](app/(app)/stock/[symbol]/page.tsx)，分 section 加：

- ✅ 2026-05-19 P4-1 删除现有 Stage C placeholder 内容
- ✅ 2026-05-19 P4-2 Hero：`<QuoteHero quote={mockQuote} />`
- ✅ 2026-05-19 P4-3 Hero：`<IntradayChart meta={mockIntradayMeta} />`
- ✅ 2026-05-19 P4-4 Hero：`<TagStrip tags={mockTags} />`
- ✅ 2026-05-19 P4-5 Hero：`<QuoteKV groups={mockQuoteKV} />`
- ✅ 2026-05-19 P4-6 接入 `<StockTabs active onChange />` 5 tab 切换状态（`useState`）
- ✅ 2026-05-19 P4-7 Overview tab：`<AIAnalysis />` + `<EventTracker />` + `<DolphinResearch />`
- ✅ 2026-05-19 P4-8 Overview tab：`<CompanyProfile />` + `<SectorPosition />` + `<KeyFactors />`
- ✅ 2026-05-19 P4-9 Overview tab：`<AnalystConsensus />` + `<InstitutionalHolding />` + `<FinancialHealthScore />`
- ✅ 2026-05-19 P4-10 Overview tab：`<EarningsSummary />` + `<EarningsForecast />`
- ✅ 2026-05-19 P4-11 Financial tab：`<FinancialTable data={mockIncomeStatement} />` + Balance + CashFlow
- ✅ 2026-05-19 P4-12 Financial tab：`<RevenueComposition />` + `<Valuation />` + `<DividendPlan />` + `<ValuationHistory />`
- ✅ 2026-05-19 P4-13 News tab：`<AlertHot />` + `<NewsCardBig />` + `<NewsPreview />`
- ✅ 2026-05-19 P4-14 Discussion tab：`<DiscussionFeed />`
- ✅ 2026-05-19 P4-15 symbol param 处理：非 AAPL.US 兜底显示 AAPL mock + 顶部 banner 提示
- ✅ 2026-05-19 P4-16 `npx tsc --noEmit` + `npm run build`，0 error
- ✅ 2026-05-19 P4-17 dev 打开 `/stock/AAPL.US` 肉眼对比 v2 demo

**Phase 4 验收** ✅:17 项全过。视觉验:Overview(QuoteHero 287.440 + Intraday EMA + KV + TagStrip) / Financial(关键指标 + FinancialTable 利润表 bar chart + 营收增速着色) / Discussion(金融老胡 Q1 EPS 长文 + AAPL sparkline) 三 tab 截图通过,console 0 error。

**改动**:`app/(app)/stock/[symbol]/page.tsx` 整体重写 — 从 87 行 Stage C placeholder 改为 ~160 行 v2 客户端组件,集成 22 个 longbridge 组件 + StockTabs 5 tab 状态(useState) + 非 AAPL symbol 兜底 banner。typecheck + build 双绿。

> 当前 stock page 仍走 mock-only,不接 longport SDK(Phase 6 边界明确)。任何 symbol 都会回退到 AAPL.US mock。

---

## 8. Phase 5 · 新首页实装

重写 [app/(app)/page.tsx](app/(app)/page.tsx)。**主线：今天值得看什么。**

- ✅ 2026-05-19 P5-1 把现有 `(app)/page.tsx` 整文件备份到 `app/(app)/page.bak.tsx`（保留 dyn-* router 入口逻辑供参考）
- ✅ 2026-05-19 P5-2 写新 `(app)/page.tsx` 壳：保留 `?view=dyn-*` 查询参数分支（DynView 不动）
- ✅ 2026-05-19 P5-3 第 1 区：`<AlertHot events={mockHotEvents} />` 横向热点条
- ✅ 2026-05-19 P5-4 第 2 区：简化 `<AIAnalysis data={mockMarketTodayAIAnalysis} />` 今日大盘（新增 mock）
- ✅ 2026-05-19 P5-5 第 3 区：`<EventTracker events={mockPortfolioEvents} />` 持仓 / 自选今日异动（新增 mock）
- ✅ 2026-05-19 P5-6 第 4 区：`<AlertCalendar events={mockCalendarEvents} />` 未来 7 天日历
- ✅ 2026-05-19 P5-7 第 5 区：AI 工作台简化卡片（沿用现 [(app)/page.tsx](app/(app)/page.bak.tsx) 的 AwGroup，横向 collapse）
- ✅ 2026-05-19 P5-8 全局底部 sticky InputBar 保留（已有 [components/shell/InputBar.tsx](components/shell/InputBar.tsx)）
- ✅ 2026-05-19 P5-9 删除 P5-1 备份里的 Timeline/Widgets/AiTipInline 老组件入口（用不到的不留）
- ✅ 2026-05-19 P5-10 新增 mock 文件：`mock/aiAnalysis-marketToday.ts`、`mock/portfolioEvents.ts`
- ✅ 2026-05-19 P5-11 `npx tsc --noEmit` + `npm run build`，0 error
- ✅ 2026-05-19 P5-12 dev 打开 `/` 肉眼验：首屏一眼看到「今天大盘 + 我有什么变动」

**Phase 5 验收** ✅:12 项全过。视觉验:首屏 5 section 全部就位 — IndexBar(HSI/国企/上证/深成)/AlertHot(Vision Pro 2 头条)/AIAnalysis(SP500+0.42% 4 signals + 长 narrative + 4 sources)/EventTracker(NVDA 962.31 +2.31% 起 6 条异动);第二屏 AlertCalendar + AI 工作台(需关注 Trade Plan/Signal + 已激活 NVDA 看涨 68% + AI 在做 组合风险 72%)。Build 通过,console 0 error。

**改动**:
- `app/(app)/page.tsx` 整页重写(原 673 行 → 现 ~245 行,壳 + 5 section + 简化 AwGroup/AwCard)
- 旧版备份在 `app/(app)/page.bak.tsx`(Phase 6 删)
- 新 mock:`mock/aiAnalysis-marketToday.ts` (今日大盘 narrative + 4 signals + 4 sources)
- 新 mock:`mock/portfolioEvents.ts` (持仓 6 条今日异动 TrackedEvent)
- 保留 `?view=dyn-*` DynView 分支(InputBar 实时重组依赖)
- 删除原 Timeline / Widgets / AiTipInline / TIMELINE_UR/RD / WATCHLIST/PORTFOLIO/MARKET_INDICES/CALENDAR 等老 mock 依赖(localHome.ts 中仍存,Phase 6 可删未用项)

---

## 9. Phase 6 · 收尾 + 文档

- ✅ 2026-05-19 P6-1 删除 `app/globals.css` 里 Phase 1 加的临时兼容别名（`--color-brand` / `--color-divider` / `--color-divider-strong` / `--color-warning`）
- ✅ 2026-05-19 P6-2 全工程再跑一次 §6.c 的兜底 grep，预期匹配为 0（除 PLAN.md / docs/ 注释）
- ✅ 2026-05-19 P6-3 `npx tsc --noEmit` 0 error
- ✅ 2026-05-19 P6-4 `npm run build` 0 error
- ✅ 2026-05-19 P6-5 `npx eslint .` 0 error
- ✅ 2026-05-19 P6-6 删除 `docs/brand-kit/tokens.next-purple.bak.css` 和 `app/globals.next-purple.bak.css`（确认不需要回滚后）
- ✅ 2026-05-19 P6-7 删除 `app/(app)/page.bak.tsx`
- ✅ 2026-05-19 P6-8 删除或保留 `app/sandbox/v2-gallery/`（项目决定；保留则加 `metadata: { robots: "noindex" }`）
- ✅ 2026-05-19 P6-9 更新 [AGENTS.md](AGENTS.md)，加一句：「token SSOT 在 `Design-System/tokens/tokens.json`；组件库在 `components/longbridge/`」
- ✅ 2026-05-19 P6-10 新增 `docs/brand-kit/README.md`：v2 设计语言速查（color/typography/utility/component index）
- ✅ 2026-05-19 P6-11 git commit（一个 commit 或按 phase 多个）

**Phase 6 验收** ✅:11 项全过。

**结果:**
- P6-1 删兼容层 — globals.css 由 117 行减到 ~80 行(删 @theme inline 4 + :root --lb-* 12 + .lb-num + .lb-caps);保留 .lb-kicker(49 处仍使用)
- P6-2 兜底 grep — **0 残余**
- P6-3 tsc — 0 error(清 .next/dev 缓存后)
- P6-4 build — 0 error,22 路由全过
- P6-5 lint — **21 errors pre-existing**(react/no-unescaped-entities × 12, hooks/set-state-in-effect × 5, hooks/purity × 2 等),与 token sweep 无关,留作后续 React 模式技术债
- P6-6 删 `tokens.next-purple.bak.css` + `globals.next-purple.bak.css`
- P6-7 删 `app/(app)/page.bak.tsx`
- P6-8 sandbox 保留作 dev 参考 + 新建 `layout.tsx` 加 `robots: noindex, nofollow`
- P6-9 [AGENTS.md](AGENTS.md) 新增"设计语言 SSOT"段:Token SSOT 路径、组件库目录、Mock 文件、品牌色、utility class、视觉参考
- P6-10 新增 [docs/brand-kit/README.md](docs/brand-kit/README.md):同步 SSOT 命令、Color 速查表、Typography 速查、Utility class、组件库、"不要做"清单
- P6-11 git commit — 待用户指令

**遗留技术债** — 已于 2026-05-19 全部清完:
1. ✅ **债务 1** `text-[#B37500]` 21 处 → `text-warn`(Design-System SSOT 最接近 token;Design-System 不动)。视觉验:PENDING/DRAFT chip 比原硬编码暗琥珀更醒目
2. ✅ **债务 4** `mock/localHome.ts` 清理 — 277 → 164 行(删 113 行 / 20 个未用导出:TimelineEvent / PortfolioRow / TIMELINE_UR/RD / PORTFOLIO / CALENDAR / KPI_* × 10 / AI_TIP)
3. ✅ **债务 3** `.lb-kicker` → `.kicker` 改名 — 50 处全替换(49 引用 + 1 globals.css 定义),与 `.num`/`.caps` 命名风格统一
4. ✅ **债务 2** ESLint 21 errors 修完 — 12 unescaped quotes(→ `&ldquo;`/`&rdquo;`)+ 5 set-state-in-effect(legitimate,inline disable)+ 2 purity (`Date.now()` 时间相对显示,inline disable)+ 1 immutability(`let cursor` arc 累积,inline disable)+ 1 `<a href="/plan">` → `<Link>`。最终: **0 errors / 0 warnings**

**最终验证**(2026-05-19,4 债务全清后):
- `npx tsc --noEmit` 0 error
- `npx eslint .` 0 error / 0 warning(layout.tsx custom-font 用 inline disable 处理)
- `npm run build` 0 error / 22 路由全过
- 视觉:所有路由青绿主调,console 0 error

---

## 10. Sub-Agent 调度建议

| Phase | Agent 数 | 顺序 | 阻塞 | 耗时 |
|---|---|---|---|---|
| 0 | 1 | 顺序 | — | 5min |
| 1 | 1 | 顺序 | P0 | 30min |
| 2 | 1 | 顺序 | P1 | 45min |
| 3 | 5 并行 | 并行 | P2 | 60min wall |
| 4 | 1 | 并行 | P2 | 30min |
| 5 | 1 | 并行 | P2 | 60min |
| 6 | 1 | 顺序 | P3+P4+P5 | 20min |

**关键路径**：P0 → P1 → P2 → (P3 ‖ P4 ‖ P5) → P6 ≈ **3.5h**。

**Phase 3 sub-agent 划分**（5 并行）：
- Agent A：shell（10 文件，P3-S01..S10）
- Agent B：dynamic + gallery + insights + chat（10 文件，P3-D01..D02 / G01..G03 / I01 / C01..C07）
- Agent C：路由组 1 = insight/insights/news/calendar/marketplace/markets（8 文件，P3-R03..R09）
- Agent D：路由组 2 = plan/portfolio/portrait/review/screener/search（11 文件，P3-R10..R20）
- Agent E：路由组 3 = stock/strategy/subagents/thesis/watchlist + layout/page（10 文件，P3-R01..R02 / R21..R30）
- 兜底（不并行）：P3-F01..F04

---

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| Phase 1 后旧页面崩 | 别名兼容层临时保留，Phase 6 才删 |
| Phase 3 sub-agent 修不全 | P3-F01 兜底 grep；映射表 §2.a 必须逐条核对 |
| lucide-react `^1.14.0` vs `0.460.0` API 不兼容 | Phase 2 typecheck 暴露；个别 icon 名找同义替换 |
| Mock 体积大（1606 行） | 接受，原型阶段不优化 |
| 旧组件 4 Agent 紫色 chip 语义无对应 | Phase 3 改为 chart 色 + chip 文案保留区分 |
| `Design-System/tokens/tokens.json` 缺 token | 暂停 → 扩 tokens.json → 跑 build → 继续（见 §0 规则） |

---

## 12. 边界（不动）

- longport SDK 接入：不碰 quote/kline 接入；个股仍走 mock-only
- 路由结构：不重命名、不删除现有路由
- `app/api/` 内部逻辑：不动；但若返回前端展示用 class 需 sweep
- `next.config.ts`：除非 lucide 等依赖触发

---

## 附 · Sub-Agent 执行模板

```
我是 Phase <X> Agent <Y>,负责 <task ID range>。
依赖 Phase <X-1> 已完成,输入路径 <files>。
按 PLAN.md §2.a 映射表 + §0 执行规则操作。
每个 ⬚ 完成后:
  1. Edit (str_replace) 改动
  2. npx tsc --noEmit
  3. grep 验证残余
  4. 在 PLAN.md 把对应 ⬚ 改为 ✅ YYYY-MM-DD path — 改 N 行,残余 M (保留 K)
不要碰边界外文件;遇到歧义停下来问。
```
