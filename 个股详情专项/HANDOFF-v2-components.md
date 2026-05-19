# Handoff · V2 长桥版个股详情组件库

> **给另一个 Claude Code 会话的接手文档** — 让你能直接复用本项目的 26 个 React 组件 + 设计 token + Mock 数据结构，开新项目时不重新踩坑。

---

## 0. TL;DR（先读这段）

- **源工程**：`/Users/david/原型港口/个股详情专项/stock-detail-v2/`
- **可复用资产**（三选一/可叠加）：
  - **组件**：`src/components-longbridge/` 共 26 个 `.tsx`
  - **Mock 数据**：`src/mock/stockDetail-lb.ts` 一份 1606 行
  - **设计 Token**：`src/tokens.css` 一份 377 行（SSOT，不要改）
- **演进版本**：经 Plan8 / 9 / 10 / 11 / 12 / 13 六轮迭代，token 一致性 / 字段完备 / 业务属性逼近都过完
- **fork 边界**：项目还有 V1 Bloomberg (`src/components/`) 和 V3 US (`src/components-us/`)，**不要碰**

---

## 1. 工程脚手架

```
node >= 20
vite 6 + react 19 + typescript 5.6 strict
tailwindcss 4 (via @tailwindcss/vite)
clsx + tailwind-merge → `cn()` helper
lucide-react (icons, 按需)
```

### tsconfig.json 关键开关

```jsonc
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "jsx": "react-jsx",
  "moduleResolution": "bundler",
  "paths": { "@/*": ["./src/*"] }
}
```

### vite.config.ts 关键

```ts
plugins: [react(), tailwindcss()],
resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
server: { port: 5273 }
```

### package.json 脚本

```jsonc
"dev": "vite",
"build": "tsc -b && vite build",
"typecheck": "tsc --noEmit"
```

---

## 2. 设计 Token 体系

### 入口 + 加载方式

`src/index.css` 第 1-12 行：

```css
@import "tailwindcss";
@import "./tokens.css";  /* 项目本地拷贝,SSOT 在 Design-System/tokens/tokens.css */
```

### 颜色 token 命名规范

所有颜色都走 `var(--color-*)` 前缀（**严格规则**，违反会被工具链或 Plan10/11 的扫描发现）。

| 用途 | Token | 典型 Tailwind class |
|------|-------|--------------------|
| 主背景 | `--color-bg-1` | `bg-bg-1` |
| 卡片背景 | `--color-card-1` / `--color-card-2` | `bg-card-1` |
| 文字主色 | `--color-fg-1` | `text-fg-1` |
| 文字辅 | `--color-fg-2 / fg-3 / fg-4` | `text-fg-3` |
| 涨（绿） | `--color-up` | `text-up` |
| 跌（粉红） | `--color-down` | `text-down` |
| 中性 | `--color-flat` | `text-flat` |
| 强调（品牌 cyan） | `--color-accent` | `text-accent` / `bg-accent-soft` |
| 警告 | `--color-warn` | `text-warn` |
| 分隔线 | `--color-hairline` / `hairline-strong` | `border-hairline` |
| 软背景 | `--color-soft` | `bg-soft` |
| chart 系列 | `--color-chart-blue / green / purple / red / grey / pink` | `fill="var(--color-chart-blue)"` |

### 字体 token

| 用途 | Token | 备注 |
|------|-------|------|
| 中英文正文 | `--font-sans` | 默认 |
| 数字 | `--font-num` | 用 `className="num"` 触发（已在 index.css 定义） |
| caps 标签 | `.caps` class | `text-transform: uppercase + letter-spacing` |

### 其它常用 class（自定义）

- `.num` — 数字字体 + tabular-nums
- `.caps` — uppercase + tracking
- `.ticker` — ticker 风格 monospace
- `text-2xs` — 11px 比 text-xs 更小一档

---

## 3. 组件清单（按 Gallery `#lb-components` 编号）

26 个组件位于 `src/components-longbridge/`。引用方式：

```tsx
import { QuoteHero } from "@/components-longbridge/QuoteHero";
import { mockQuote } from "@/mock/stockDetail-lb";

<QuoteHero quote={mockQuote} />
```

### Hero 区（5 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 01 | QuoteHero | `QuoteHero.tsx` | `{ quote: Quote }` |
| 02 | IntradayChart | `IntradayChart.tsx` | `{ meta: IntradayMeta }` |
| 03 | TagStrip | `TagStrip.tsx` | `{ tags: StockTag[] }` |
| 04 | QuoteKV | `QuoteKV.tsx` | `{ groups: QuoteKVGroup[] }` |

### 公司/行业（3 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 05 | CompanyProfile | `CompanyProfile.tsx` | `{ profile: CompanyProfile }` |
| 06 | SectorPosition | `SectorPosition.tsx` | `{ data: SectorPosition }` |
| 07 | KeyFactors | `KeyFactors.tsx` | `{ root: KeyFactorNode }` 含 hover 高亮路径 |

### 分析师/持仓/健康（3 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 08 | AnalystConsensus | `AnalystConsensus.tsx` | `{ data: AnalystConsensus }` |
| 09 | InstitutionalHolding | `InstitutionalHolding.tsx` | `{ data: InstitutionalHolding }` |
| 10 | FinancialHealthScore | `FinancialHealthScore.tsx` | `{ data: FinancialHealthScore }` |

### 财务报表（1 个组件 / 3 数据源）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 11 | FinancialTable · Income | `FinancialTable.tsx` | `{ data: mockIncomeStatement }` |
| 12 | FinancialTable · Balance | 同上 | `{ data: mockBalanceSheet }` |
| 13 | FinancialTable · CashFlow | 同上 | `{ data: mockCashFlow }`（支持 bar-line 复合图模式） |

### 估值/分红（3 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 14 | RevenueComposition | `RevenueComposition.tsx` | `{ data: RevenueCompositionData }` |
| 15 | Valuation | `Valuation.tsx` | `{ metrics: ValuationMetric[] }`（4 张子卡，图例 5 项动态首项） |
| 16 | DividendPlan | `DividendPlan.tsx` | `{ history, records }` |

### 顶部条/全局（3 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 17 | AlertHot | `AlertHot.tsx` | `{ events: HotEvent[], onItemClick? }` |
| 18 | AlertCalendar | `AlertCalendar.tsx` | `{ events: CalendarEvent[] }` |
| 19 | StockTabs | `StockTabs.tsx` | `{ active, onChange }` 5 tab 切换 |

### Overview / 资讯 / 讨论 Tab 专属（8 个）

| # | 组件 | 文件 | Props |
|---|------|------|-------|
| 20 | AIAnalysis | `AIAnalysis.tsx` | `{ data: AIAnalysisData }` |
| 21 | EventTracker | `EventTracker.tsx` | `{ events: TrackedEvent[] }` 含虚线 timeline |
| 22 | DolphinResearch | `DolphinResearch.tsx` | `{ reports: DolphinReport[] }` |
| 23 | NewsPreview | `NewsPreview.tsx` | `{ items, variant: "feed"\|"preview" }` |
| 24 | EarningsSummary | `EarningsSummary.tsx` | `{ data: EarningsHighlight }` 新预测/旧 ERN 双 layout |
| 25 | EarningsForecast | `EarningsForecast.tsx` | `{ data }` |
| 26 | ValuationHistory | `ValuationHistory.tsx` | 零 props，自己从 mock 读 |
| 27 | NewsCardBig | `NewsCardBig.tsx` | `{ items }` |
| 28 | DiscussionFeed | `DiscussionFeed.tsx` + `DiscussionPreview` | `{ posts: DiscussionPost[] }` |

---

## 4. Mock 数据结构（`src/mock/stockDetail-lb.ts`）

### 顶层 exports

| Export | Interface | 用途 |
|--------|-----------|------|
| `mockQuote` | `Quote` | QuoteHero 主数据（价格/KV/afterHours/chips/watchers） |
| `mockIntradayMeta` | `IntradayMeta` | 分时 K 线 |
| `mockTags` | `StockTag[]` | TagStrip |
| `mockQuoteKV` | `QuoteKVGroup[]` | QuoteKV 矩阵 |
| `mockCompanyProfile` | `CompanyProfile` | 公司概况 + 行业胶囊 + sparkline |
| `mockSectorPosition` | `SectorPosition` | 行业排名 + peer |
| `mockKeyFactorsTree` | `KeyFactorNode` | 37 节点思维导图 |
| `mockAnalystConsensus` | `AnalystConsensus` | donut + 3 折线 + KV |
| `mockInstitutionalHolding` | `InstitutionalHolding` | 持股变动表 |
| `mockFinancialHealth` | `FinancialHealthScore` | grade + 雷达 + 4 类别 |
| `mockIncomeStatement / mockBalanceSheet / mockCashFlow` | `FinancialBarReport` | 三大表 |
| `mockRevenueComposition` | `RevenueCompositionData` | 多年叠柱 + segment 明细 |
| `mockValuation` | `ValuationMetric[]` | PE/PB/PS/Yield 4 卡 |
| `mockValuationHistoryRolling` | `ValuationHistoryRollingData` | 5Y P/E 序列 |
| `mockDividendHistory / mockDividendRecords` | - | 分红 |
| `mockHotEvents` | `HotEvent[]` | 横向热点条 |
| `mockCalendarEvents` | `CalendarEvent[]` | 日程（含 tz 字段） |
| `mockAIAnalysis` | `AIAnalysisData` | Perplexity 风长正文 + sources |
| `mockTrackedEvents` | `TrackedEvent[]` | 垂直 timeline |
| `mockDolphinReports` | `DolphinReport[]` | 海豚研究报告（含 link） |
| `mockNewsItems` | `NewsItem[]` | 新闻 feed |
| `mockDiscussions` | `DiscussionPost[]` | 讨论流（含头像 + chart） |
| `mockEarningsHighlight` | `EarningsHighlight` | 业绩摘要（支持新 forecast layout） |
| `mockEarningsForecast` | `EarningsForecastQuarter[]` | 4 个未来季度预测 |

### Mock 基准标的

**AAPL.US（苹果）** 一份完整 mock，覆盖所有 26 组件的字段。如果接入新标的，按这个 schema 复制一份即可。

---

## 5. 关键设计决策（六轮迭代沉淀）

这些是**踩过坑后的不动条款**，新项目应继承：

### 5.1 语言策略

- **中文为主，业务术语括号注**：例「目标价 (PT)」「市盈率 (P/E)」「业绩摘要 (Earnings Summary)」
- **例外 #01 QuoteHero 顶栏**：使用英文 + 繁体「蘋果」（港股版 mobile 风）。KV 列名也用英文 `Open / High / Low / Prev. Close / Volume / P/E^TTM`
- 繁简转换通过 `TRAD_NAME_MAP` 在 QuoteHero 内部映射

### 5.2 颜色语义（严格）

| 场景 | 颜色 | 反例 |
|------|------|------|
| 涨 | `text-up`（绿） | ❌ 用 accent |
| 跌 | `text-down`（粉红） | ❌ 用 warn |
| 强调（品牌） | `text-accent`（cyan） | ❌ 用 chart-blue 替代 |
| 警告 | `text-warn`（橙） | ❌ 用在中性数据如 yield |
| 中性 | `text-fg-1/2/3` | ❌ 用 fg-4 当主文字 |

### 5.3 typography 层级

| 角色 | 字号 | 例 |
|------|------|------|
| 价格大字 / grade | text-6xl / text-4xl | QuoteHero `287.44` / FHS `A+` |
| 主指标强调 | text-2xl / text-xl | DividendPlan 股息率 / EarningsSummary 标题 |
| 主数据 | text-base / text-sm | 表格内数值 |
| 副信息 | text-xs / text-2xs | hint / 同比 / period 标签 |
| 强调字保留例外 | text-2xl+ | 仅 grade / 价格 / 股息率 主指标 |

### 5.4 P/E 上标

`<sup className="ml-0.5 text-[0.55em] font-normal">TTM</sup>` — 跟雪球/同花顺一致

### 5.5 afterHours 三段统一上色

`PRE 288.161 +0.721 +0.25%` 三段（price/delta/pct）**全部**用 `text-up`/`text-down`，不要只给 pct 上色

### 5.6 SectionHeader hint

中文为主，业务术语英文括号注，例：
- `财务评分 (Financial Health) · 15/05/2026`
- `近期事件 (Recent Events)`
- `机构持仓 (13F)`（注：Plan13 #09 已删此 hint）

### 5.7 chart 间距标准（FinancialTable / RevenueComposition 对齐）

```
VBH = 260
PAD_TOP = 48 (legend + value 标签)
PAD_BOTTOM = 32 (period 标签)
period label fontSize=10, y={VBH-12}
svg wrapper: px-4 py-3
```

### 5.8 Sparkline 风格

Catmull-Rom 平滑曲线 + 渐变 area fill（顶 32% → 底 0%） + 终端原点（r=3）。参考 CompanyProfile.tsx 实现。

### 5.9 timeline 虚线

`border-dashed` 在 1px 不可见，用 `repeating-linear-gradient(to bottom, var(--color-fg-3) 0 3px, transparent 3px 6px)` 替代。

---

## 6. 复用方案（三选一）

### 方案 A：整体拷贝（最快）

```bash
cp -r /Users/david/原型港口/个股详情专项/stock-detail-v2 /path/to/new-project
cd /path/to/new-project
npm install
npm run dev
```

然后改 `package.json` name，按需删 V1/V3 部分。

### 方案 B：抽取需要的组件（最小依赖）

```bash
mkdir -p new-project/src/{components,mock,lib}
# 必须拷贝
cp stock-detail-v2/src/tokens.css new-project/src/
cp stock-detail-v2/src/index.css new-project/src/  # 改 @import 路径
cp stock-detail-v2/src/lib/utils.ts new-project/src/lib/

# 按需拷贝组件（一次拷一个组件 + 它依赖的 mock 类型）
cp stock-detail-v2/src/components-longbridge/QuoteHero.tsx new-project/src/components/
# 在新项目里加 Quote interface（从 stockDetail-lb.ts 抽出来）
```

### 方案 C：git submodule / npm workspace

适合长期协作多项目。

```bash
git submodule add <stock-detail-v2-repo-url> packages/stock-components
```

新项目 vite alias 加 `"@stock": path.resolve(__dirname, "packages/stock-components/src")`。

---

## 7. 接手 checklist

新项目搭起来后，建议这样验证：

1. **依赖装齐**：`npm install` 通过
2. **token 加载**：`src/index.css` import 了 `tokens.css`
3. **tsc 干净**：`npx tsc --noEmit` EXIT=0
4. **build 通过**：`npx vite build` 成功
5. **挂第一个组件**：`<QuoteHero quote={mockQuote} />` 跑起来不报错
6. **token 可见**：`text-up`、`text-accent`、`var(--color-hairline)` 都能渲染
7. **Gallery 验证**：可以复制 `pages/ComponentGalleryLB.tsx` 当目录，挨个挂组件

---

## 8. 不要踩的坑（前人血泪）

| 坑 | 原因 | 对策 |
|----|------|------|
| 改 `tokens.css` | SSOT 在 `Design-System/tokens/`，被多项目共享 | 只在本地 `index.css` 加新样式 |
| 在 SVG 用 `var(--accent)` | 没有 `--color-` 前缀的 token 是 undefined | 一律 `var(--color-accent)` |
| 用 `text-warn` 描述 yield/股息率 | warn 是警告语义，不是高价值 | 用 `text-fg-1` 或 `text-accent` |
| `border-dashed` 在 1px | 浏览器渲染不可见 | 用 `repeating-linear-gradient` |
| KV `label` 只接 string | 想加上标会卡住 | 在新项目里改成 `React.ReactNode` |
| 组件直接读 mock 全局 | 难复用、难测试 | 强制走 props 注入，mock 在 page/gallery 层装 |
| Catmull-Rom 起手 | 起点终点容易抽筋 | 看 CompanyProfile.tsx 现成实现 |
| chart viewBox `preserveAspectRatio="none"` | 会拉伸失真 | 用 `xMidYMid meet` |
| afterHours 只给 pct 上色 | 视觉不一致 | 三段（price/delta/pct）全部 trend 上色 |

---

## 9. 关联文档（按需查阅）

| 文档 | 内容 |
|------|------|
| `~/原型港口/个股详情专项/Plan8.md` ~ `Plan13.md` | 六轮迭代历史 + 每轮验收报告 |
| `~/原型港口/个股详情专项/stock-detail-refactor-spec.md` | 20 信息原子 / 11 模块 重构规格 |
| `~/原型港口/个股详情专项/schema/atoms-schema.md` | JSON Schema 设计说明 |
| `~/原型港口/个股详情专项/mock/AAPL.US.atoms.json` | 原子级 mock 样例（覆盖全部 20 原子） |
| `~/原型港口/个股详情专项/README.md` | 项目总入口 |

---

## 10. 给接手 Claude 的开场白模板

复制下面这段，发到新对话作为第一句话：

```
我要开新项目复用一份现成的 React 组件库。请先读这份 handoff:
  /Users/david/原型港口/个股详情专项/HANDOFF-v2-components.md

源工程: /Users/david/原型港口/个股详情专项/stock-detail-v2/
可复用资产:
- src/components-longbridge/ (26 个组件)
- src/mock/stockDetail-lb.ts (全套 mock + 类型)
- src/tokens.css (设计 token)
- src/lib/utils.ts (cn + format helpers)

不要碰: src/components/ (V1 Bloomberg), src/components-us/ (V3 US),
       这俩是 fork 隔离的别版本。

我的新项目目标: [____描述项目目的 / 标的 / 哪几个组件____]

按 handoff 第 6 节方案 [A/B/C] 帮我搭起来,跑 tsc + 第一个组件验证。
```

---

## 11. 维护说明

- 本 handoff 由 Plan13 收官时生成（2026-05-18）
- 如果源工程后续有新轮 Plan14+，需要重新生成此文档同步新决策
- 文档版本与源工程 git commit hash 锚定可选（当前 head: `22c2754`）
