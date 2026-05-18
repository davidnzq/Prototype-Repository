# Plan12 · V2 长桥版组件细节专项精修

## Context

V2 长桥版（`src/components-longbridge/`，26 组件）经 Plan8/9/10 三轮已完成 token 一致性 + 字段完备性 + Plan8 polish 五项，整体设计系统合规。但近期 commit 显示用户仍在做单点细节修正（`#16 DividendPlan 标签`、`#02 IntradayChart KV strip`），说明组件层"细节问题"仍有较多残留。

本 Plan 做**全量盘点 + 集中精修**：用 3 个并行 Explore agent 已审计 26 组件 × 4 维度（文案/密度/字段/视觉），输出本 inventory；待用户勾选优先级后批量执行修复。

**目标版本**：V2（src/components-longbridge/）+ V2 mock（src/mock/stockDetail-lb.ts）
**不动**：V1 / V3 / tokens.css

---

## 审计结果汇总

### 📊 总览

| 维度 | P0 | P1 | P2 |
|------|----|----|----|
| A. 文案/标签/术语 | 8 | 22 | 10 |
| B. 信息密度/布局 | 1 | 18 | 7 |
| C. 字段完备性 | 6 | 12 | 4 |
| D. 视觉/token/交互 | 2 | 16 | 8 |
| **合计** | **17** | **68** | **29** |

### 🔴 P0（必修，17 项 — bug / 硬编码 / 术语错误）

| # | 组件 | 行 | 问题 | 建议 |
|---|------|----|------|------|
| 1 | QuoteHero | 109 | Volume 硬编码 `"48.24M"` | 接 mock `quote.volume` + formatNum |
| 2 | QuoteHero | 110 | Mkt Cap 硬编码 `"4.27T"` | 接 mock `quote.marketCap` |
| 3 | ValuationHistory | 8-15 | `PE_SERIES` 硬编码在组件内 | 抽到 stockDetail-lb.ts |
| 4 | ValuationHistory | 17 | `PEER_AVG` 硬编码 | 同上 |
| 5 | ValuationHistory | 59-60 | `preserveAspectRatio="none"` 致 svg 失真 | 改 `xMidYMid meet` 或移除 height style |
| 6 | ValuationHistory | — | 缺 Y 轴刻度 | 补 20x/25x/30x 刻度 |
| 7 | TagStrip | 66 | `hover:text-link` — `--color-link` 未定义 | 改 `hover:text-accent` |
| 8 | InstitutionalHolding | 23 | 列头"较内份额增减"术语错误 | 改"增减持(万股)"或"较前份额增减" |
| 9 | DividendPlan | 90 | yield 颜色用 `text-warn`（负面色）语义错 | 改 `text-fg-1` 或 `text-accent` |
| 10 | DividendPlan | 35 | "当期股息率"术语不准确 | 改"最近股息率"或"截至 YYYY 股息率" |
| 11 | EventTracker | 111 | "事件后"与"价格变化"术语不一致 | 统一为"事件后涨跌" |
| 12 | RevenueComposition | 21 | TabPill 切换无回调/持久化 | 加 onChange 或保留组件 state |
| 13 | EarningsForecast | 18-28 | 表头全英文（Period / Rev Low / Spread / # ） | 改中文或中英对照 |
| 14 | EarningsForecast | — | 缺"未来预测"vs"历史"区分 | 标题补"未来 N 季度业绩预测" |
| 15 | DolphinResearch | — | 报告卡片无"查看详情"CTA | 补 link/按钮 |
| 16 | DolphinResearch | 36 | category 英文（Deep/Quick/Earnings/Macro）直渲 | 加中文映射"深度/快讯/业绩/宏观" |
| 17 | AlertCalendar | — | event 时间无时区（仅 "16:30"） | 补 "16:30 EDT" 或市场名 |

### 🟡 P1（应修，68 项 — 体验细节，按组件聚合）

下表按组件列出主要 P1 项（行号见 audit 原文，此处仅列代表性）：

| 组件 | P1 主要问题 |
|------|------------|
| AIAnalysis | 中英混（"AI Analysis"/"POWERED BY"）、hover 反馈太弱 |
| AlertCalendar | "▤ EV"缩写不清、缺溢出提示（+N more）、py-1.5 过紧 |
| AlertHot | "▣ HOT"缩写不清、sentiment 缺 icon 辅助、truncate 无 tooltip |
| AnalystConsensus | grid 固定 480px 响应式差、priceHistory 无时间轴标签、consensus 与 donut 同 accent 易混 |
| CompanyProfile | 右侧胶囊与左列 KV 重复市值、RankBar 不按排名好坏变色、border 与左列不一致 |
| DiscussionFeed | "热门 · 前 3"分隔混乱、line-clamp 无展开入口、attached 缺股票名 |
| DividendPlan | "近 5 年 每股股息(USD) · 股息率" 标题混乱、COLS 固定列宽溢出、缺宣布日期、"特别" badge 配色冲突 |
| DolphinResearch | "Dolphin Research" 混中英、"PT" 缩写不清、summary 无 line-clamp |
| EarningsForecast | py-1.5 过紧、min-w 固定溢出、缺方向 ↑↓ 标记、spread bar 无 legend |
| EarningsSummary | "Earnings Summary" / "▲ BEAT" 中英混 |
| EventTracker | hint 缺中英标识、impact key 与显示语言不一致 |
| FinancialHealthScore | hint 英文与正文不一致、CategoryRow trend 硬编码 "flat" |
| FinancialTable | "单季 ▾" 下拉提示不清、value2Label 中文一致性、formatValueShort 单位 |
| InstitutionalHolding | hint 中英混、缺"持股数量"绝对值 |
| IntradayChart | "今開" 繁简混（应"今开"）、"52W H/L" 中英混、tab 缺整体边框 |
| KeyFactors | "Key Factors" + 中文 hint 不一致、中心节点权重不够突出 |
| NewsPreview | feed variant hint "全部" 太简 |
| QuoteHero | "VS PREV" 缩写不一致、price/change 字号比 5:1 过大、WatcherBadge 心形用 down 色 |
| QuoteKV | hint 中英混、KVGroup label 应用 caps 样式 |
| RevenueComposition | "Revenue Composition" 翻译可优化、表格列宽固定、segmentColors 未校验 |
| SectorPosition | 表头未用 caps、无 overflow-x 响应式、bg-brand-soft 高亮过淡 |
| StockTabs | hint 缩写规范混乱（DES/FA/ANR）、sticky top-8 未文档化、active 圆角处理 |
| TagStrip | CategoryRow label 中英混、Tag button padding 与 token 不齐、selected 时数值色冲突 |
| Valuation | 图例"高分位"用 chart-red 易误读为下跌、缺百分位 label、fillOpacity 0.08 过淡 |
| ValuationHistory | "VAL · HIST" 缩写不规范、Premium 无基准说明、5Y Avg / Peer Avg 英文混 |

### ⚪ P2（可修，29 项 — nice polish，本轮不强求）

主要分布：硬编码 "−" vs "-" unicode、leading 微调、hover transition duration、border-radius 直角化、gap 微调等。

---

## 执行策略

### Phase 0 — 决策（已收口）
- ✅ **语言策略**：中文为主、业务术语括号注（如"目标价 (PT)"、"市盈率 (P/E)"、"业绩摘要 (Earnings Summary)"）
- ✅ **本轮范围**：P0 17 项 + P1 68 项**全修**
- ✅ **P2 29 项**：本轮不动，留下一轮 polish

### Phase 1 — 文案/术语批处理（A 维度，估 30 min）
所有 A 维度 P0/P1 集中改：
- 中文为主：标题、hint、列头、按钮文案全中文化
- 业务术语括号注：DPS / Yield / PE / EPS / PT / ROE 等保留英文，但首次出现处用"中文 (英文)"格式
- 繁简统一：今開→今开
- 时区/单位补齐：16:30 → 16:30 EDT
- 术语错误纠正：#16 已修；本轮纠 InstitutionalHolding "较内份额"、DividendPlan "当期股息率"、EventTracker "事件后"

回归风险低，可批 commit。

### Phase 2 — 字段完备性 + mock 扩展（C 维度，估 45 min）
- 抽 PE_SERIES / PEER_AVG 到 stockDetail-lb.ts
- QuoteHero Volume / MktCap 接 mock
- AlertCalendar 时区、DividendPlan announcedDate、DolphinResearch link 等补 mock 字段
- 改组件 props/interface 同步

### Phase 3 — 布局/密度精修（B 维度，估 60 min）
- 响应式 grid（minmax 替代固定 px）
- padding / leading / gap 统一
- 表头 caps 样式
- 高亮行色块深度

### Phase 4 — 视觉/交互（D 维度，估 30 min）
- DividendPlan yield 颜色纠正
- WatcherBadge 心形色
- Valuation 图例色语义化
- hover transition 完善

### Phase 5 — 验证
- `npx tsc --noEmit` → EXIT 0
- `npx vite build` → 成功
- `git diff src/components/ src/components-us/ src/tokens.css` → 0 改动（守 fork 边界）
- 浏览器抽查 StockDetailLB + StockDetailLBv21（V2 主页）

### Phase 6 — 落盘
- 写 Plan12-验收报告.md（pre/post 对照）
- commit + push

---

## 关键文件

**新增**：
- `~/原型港口/个股详情专项/Plan12.md`（本计划落盘到该路径，配合现有 Plan8-11 序列）
- `~/原型港口/个股详情专项/Plan12-验收报告.md`

**修改**：
- `src/components-longbridge/` 26 个 .tsx（选择性，预计 ~18 个）
- `src/mock/stockDetail-lb.ts`（补 PE_SERIES、announcedDate、时区等字段）

**不动**：
- `src/components/`（V1）
- `src/components-us/`（V3）
- `src/mock/stockDetail.ts` / `stockDetail-us.ts`
- `src/tokens.css`

---

## 风险与对策

| 风险 | 对策 |
|------|------|
| 术语统一改坏现有 mock 引用 | 改前 grep 全 mock 用例，同步改 |
| 响应式 minmax 触发未知断点 | 改完在浏览器抽 1280/1024/768 各跑一遍 |
| mock schema 改动影响 V3/V1 | 严格只改 stockDetail-lb.ts，不动其他 mock |
| 中英语言策略未拍板就动手 | Phase 0 先拿 AskUserQuestion 收 A/B 选择 |

## DoD

- ✅ P0 17 项 100% 修
- ✅ P1 用户勾选项 100% 修
- ✅ tsc + build EXIT=0
- ✅ V1 / V3 / tokens.css / 其他 mock 0 改动
- ✅ Plan12 + 验收报告 落盘到 `~/原型港口/个股详情专项/`
