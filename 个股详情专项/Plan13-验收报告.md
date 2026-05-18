# Plan13 — V2 长桥版组件业务属性逼近 · 验收报告

> 配套 `Plan13.md`，验收 18 张 🔵 卡片（按 Gallery `#lb-components` 编号）的执行结果。

## 版本

| 版本 | 状态 | 完成日期 |
|------|------|---------|
| v1.0 — 标注与对齐 | ✅ 完成 | 2026-05-18 |
| v2.0 — 执行与验证 | ✅ 完成 | 2026-05-18 |

---

# v1.0 — 标注与对齐

## 协作模式

- **用户驱动**：用户从 Gallery 顶往下，逐组件填「改什么 + 对标/备注」，必要时截图标红框
- **Claude 派发**：扫所有 🔵 卡，按影响范围分组并行 agent，主流程协调 mock
- **状态翻牌**：⬚ → 🟡 → 🔵 → 🟢

## 卡片编号映射（基于 Gallery `#lb-components`）

用户填卡时按 Gallery 编号填内容，但模板里 #02-#27 的「标题字 + 文件路径」用的是页面 top-to-bottom 顺序，**两者不一致**。验证时按内容/截图重新对齐：

| Gallery # | 实际组件 | 用户卡片标题 | 状态 |
|-----------|---------|------------|------|
| 01 | QuoteHero | QuoteHero ✅ | 🟢 |
| 02 | IntradayChart | IntradayChart ✅ | 🟢 |
| 03 | TagStrip | AlertHot ❌ | ⛔ |
| 04 | QuoteKV | AlertCalendar ❌ | ⛔ |
| **05** | **CompanyProfile** | StockTabs ❌ | 🟢 |
| 06 | SectorPosition | AIAnalysis ❌ | ⛔ |
| **07** | **KeyFactors** | CompanyProfile ❌ | 🟢 |
| **08** | **AnalystConsensus** | EventTracker ❌ | 🟢 |
| **09** | **InstitutionalHolding** | DolphinResearch ❌ | 🟢 |
| **10** | **FinancialHealthScore** | NewsPreview ❌ | 🟢 |
| 11-13 | FinancialTable Income/Balance/CashFlow | ✅ | 🟢 |
| 14 | RevenueComposition | ✅ | 🟢 |
| 15 | Valuation | ✅ | 🟢 |
| 16 | DividendPlan | ✅ | 🟢 |
| 17 | AlertHot | ✅ | 🟢 |
| 18 | AlertCalendar | ✅ (路径错) | 🟢 |
| 19 | StockTabs | ⛔ | ⛔ |
| 20 | AIAnalysis | ✅ (路径错) | 🟢 |
| 21 | EventTracker | ✅ | 🟢 |
| 22 | DolphinResearch | ✅ | 🟢 |
| 23-28 | NewsPreview / EarningsForecast / ValuationHistory / NewsCardBig / DiscussionFeed | ⛔ | ⛔ |

**共 18 张 🔵 执行 / 9 张 ⛔ 跳过**。

---

# v2.0 — 执行与验证

## 派发分工（4 路并行 agent）

| Agent | 范围 | 组件数 | Mock owns |
|-------|------|--------|-----------|
| Agent 1 | 7 张文案卡（#10/14/16/17/18/20/22） | 7 | （不动 mock） |
| Agent 2 | 3 张 FinancialTable（#11/12/13） | 3 | IncomeStatement / BalanceSheet / CashFlow |
| Agent 3 | 6 张视觉卡（#02/05/08/09/15/21） | 6 | （不动 mock） |
| Agent 4 | 3 张大改卡（#01/07/24） | 3 | KeyFactorsTree / EarningsHighlight |

所有 4 路 agent **tsc EXIT=0**，无冲突。

## 验证结果

| 项 | 结果 |
|----|------|
| `npx tsc --noEmit` | ✅ EXIT=0 |
| `npx vite build` | ✅ 成功（927ms，836.90 kB / gzip 229.52 kB） |
| V1 `src/components/` 改动 | ✅ 0 |
| V3 `src/components-us/` 改动 | ✅ 0 |
| `src/tokens.css` 改动 | ✅ 0 |
| `src/mock/stockDetail.ts` / `stockDetail-us.ts` 改动 | ✅ 0 |
| V2 改动文件 | **17 V2 组件 + 1 mock = 18 文件** |
| 改动行数 | +875 / −370 |

## 逐卡执行摘要

### Agent 1 · 文案/字段简单删改

| # | 组件 | 改动 |
|---|------|------|
| 10 | FinancialHealthScore | hint `"财务评分 (Financial Health) · {date}"` → `"{date} 更新"` |
| 14 | RevenueComposition | 删 hint；默认 view → `industry`；Y/X 轴字号 13→10；删图例 dot 行 |
| 16 | DividendPlan | 删 `Dividend Plan` 英文 / 删 hint / `最近股息率 (TTM Yield)` → `股息率` 居左 / 删派发率 / 删 `DPS 趋势` 副标题 / `DPS (USD)` → `股息 (USD)` / 删整列宣布日 |
| 17 | AlertHot | 删 source label（Bloomberg/Reuters/WSJ）/ 每条加 `onClick` + hover / 新 prop `onItemClick?` |
| 18 | AlertCalendar | `全部日程 →` → `更多 →` |
| 20 | AIAnalysis | 删 `▲ 海豚 AI 驱动` / `New York 时间 16:00` → `16:00` / `查看完整原始分析` → `更多` |
| 22 | DolphinResearch | `海豚投研` → `海豚研究` / 删 hint / 删 `阅读全文 →` |

### Agent 2 · FinancialTable（Income/Balance/CashFlow）

**共同改动**：
- 删 SectionHeader hint `"IS/BS/CF · 单季"` 前缀
- dropdown `"单季 / 累计 ▾"` → `"单季 ▾"`
- 柱状图下方加 Q 时间标签（与表格 period 列 X 对齐）
- chart padding 标准化（VBH 240→260，PAD_TOP 36→48，PAD_BOTTOM 36→56）
- `ratio` format 渲染加 `x` 后缀

**Income (#11)**：`每股收益(USD)` → `每股收益`；新增 `利润含金量 (利润含金量)` 可切换 tab（净现金流/净利润比率）

**Balance (#12)**：8 项重排：资产与负债 / 权益乘数 / 每股净资产 / 资产周转率 / 现金及短投 / 存货与应收 / 长期投资 / 净债务

**CashFlow (#13)**：7 项重排 + **bar-line 复合图**：经营 / 投资 / 融资 / 自由 / 现金流充裕率 / 举债与偿债 / 资本支出
- bar (cyan) + polyline (orange) + area fill (blue dashed) 三层

**Interface 扩展**（向后兼容，全 optional）：
- `FinancialPeriodPoint.secondary?` / `.baseline?`
- `FinancialMetric.chartMode?: "dual-bar" | "bar-line"` / `.secondaryLabel?`

### Agent 3 · 视觉调整

| # | 组件 | 改动 |
|---|------|------|
| 02 | IntradayChart | 删 3 处：顶部 KV strip（今开/最高/最低/昨收/市盈率）/ 左下 source 底注 / 右下 VWAP·前收 |
| 05 | CompanyProfile | `5.46 万亿` 加 trend 色；Sparkline 改 Catmull-Rom 平滑；最后一点加 final dot；终端原点 |
| 08 | AnalystConsensus | KV strip 与 donut 顶部对齐 / 百分比靠近评级 label / 3 线左侧起点对齐到 Y 轴右侧 / 3 线 Catmull-Rom 平滑 / chart 高度对齐 donut |
| 09 | InstitutionalHolding | 删 hint `机构持仓 (13F)` / 列头 → `期內增減持 (万股)` 繁体 / 持股比例去掉 `+` 号前缀 |
| 15 | Valuation | 删 hint `Valuation Analysis` / 删 4 处百分位 label / 图例 dot 改 5 项（第一项动态：市盈率/市净率/市销率/股息率）/ 图例移到大字下方 / chart H 172 修字裁切 |
| 21 | EventTracker | 月份与日期 color 统一 fg-3 / 删 impact 高/中/低 badge / 虚线 timeline 保留 |

### Agent 4 · 大改卡

**#01 QuoteHero**（顶栏完全重排）：
- 新顶栏：`[← 返回] 蘋果 AAPL.US [Closed badge] ··· [share/bell/more icons] [❤️ 38.60万]`
- 删 `bbgType` / `nameEn` / 简体 `nameZh`；加 `TRAD_NAME_MAP`（苹果→蘋果）
- `SessionBadge`：PRE→Pre-Market / REG→Open / POST/CLOSED→Closed
- Row 2 afterHours 三段（price/delta/pct）统一用 `afterHours.trend` 上色
- Row 2 右列：`较前收 287.510` → `Last Updated HH:MM:SS ET`
- Row 4 KV：`Open / High / Low / Prev. Close / Volume / P/E TTM`（删 Mkt Cap，加 Prev.Close，P/E → P/E TTM）

**#07 KeyFactors**（37 节点 + hover 高亮线）：
- mock 扩 33 → 37 节点：新增 `iphone-pro` / `iphone-air` / `tvplus` / `gc-ai` 4 子节点
- Hint 改 `"共 37 个节点, 拖拽查看"`
- 实现 hover 高亮：`useState<hoveredId>` + `parentMap` 预算 + `ancestorChain()` DFS 找祖先 → 路径上 line stroke 1.75 + accent 色 / 节点 circle 加大 + 标签加粗

**#24 EarningsSummary**（基于 24-1.jpg 完全重做）：
- mock `EarningsHighlight` interface 加 7 optional 字段（currency / reportType / fiscalPeriodLabel / reportDateRange / forewordText / forecastMetrics[] / disclosureDate），新增 `EarningsHighlightForecastMetric` interface
- mock 填 NVDA 模板（USD / 单季报 / 2027 财年 Q1 / 营业收入 792 亿 +79.82% / 息税前 522 亿 / EPS 1.75）
- 组件检测 `data.forecastMetrics?.length`：有 → 新 `ForecastLayout`（公布值/预测值双栏 + info/external/calendar icons + 前瞻文字段）；无 → 保留旧 ERN layout（向后兼容）

## 残留 / 下一轮

| 项 | 说明 |
|----|------|
| Plan13.md 卡片标题/路径错位（#03-10、#18/20/23/25-27） | 用户填内容时基于 Gallery 编号，模板标题用页面顺序，cosmetic 错位但不影响执行。可下轮做 doc cleanup |
| `IntradayChart.tsx(109)` 旧 unused 'range' var | Agent 3 已删（清理 IntradayChart 时顺手） |
| 9 张 ⛔ 卡片（#03/04/06/19/23/25/26/27/28） | 本轮明确不动，按需开下一卡 |

---

# 总结

V2 经 Plan13 后：
- ✅ **18 张 🔵 卡片 100% 执行**（业务属性逼近：字段命名 / 数据格式 / 视觉规范向真实长桥 App + NVDA 业绩预测 + AAPL 思维导图等真实形态靠齐）
- ✅ **17 V2 组件 + mock schema 5 处扩展**（KeyFactorsTree 37 节点 / EarningsHighlight Forecast 字段 / BS+CF 字段重排 / FinancialMetric chartMode）
- ✅ **tsc + vite build EXIT=0**
- ✅ **V1 / V3 / tokens.css / V1+V3 mock 0 改动**（严守 fork 边界）
- ✅ QuoteHero 顶栏完全 mobile 化（返回 icon + Closed badge + action icons + 繁体「蘋果」）
- ✅ EarningsSummary 完全重做为 NVDA 风预测/公布双栏

V2 现达到「Plan8/9/10/11/12（前 5 轮通用精修）+ Plan13（业务属性逼近）」共 6 轮迭代后的稳定态。
