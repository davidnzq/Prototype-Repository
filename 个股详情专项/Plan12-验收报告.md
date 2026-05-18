# Plan12 — V2 长桥版组件细节专项精修 · 验收报告

> 配套 `Plan12.md`，验收 26 V2 组件 × 4 维度精修（P0 17 + P1 68 = 85 项）。

## 版本

| 版本 | 状态 | 完成日期 |
|------|------|---------|
| v1.0 — Pre-fix 审计 | ✅ 完成 | 2026-05-18 |
| v2.0 — Post-fix 复核 | ✅ 完成 | 2026-05-18 |

---

# v1.0 — Pre-fix 审计结果

## 审计方法

3 并行 Explore agent 覆盖 V2 26 个组件：
- Agent 1（9 组件）：AIAnalysis / AlertCalendar / AlertHot / AnalystConsensus / CompanyProfile / DiscussionFeed / DividendPlan / DolphinResearch / EarningsForecast
- Agent 2（9 组件）：EarningsSummary / EventTracker / FinancialHealthScore / FinancialTable / InstitutionalHolding / IntradayChart / KeyFactors / NewsCardBig / NewsPreview
- Agent 3（8 组件）：QuoteHero / QuoteKV / RevenueComposition / SectorPosition / StockTabs / TagStrip / Valuation / ValuationHistory

## 四维度汇总

| 维度 | P0 | P1 | P2 | 小计 |
|------|----|----|----|------|
| A. 文案/标签/术语 | 8 | 22 | 10 | 40 |
| B. 信息密度/布局 | 1 | 18 | 7 | 26 |
| C. 字段完备性 | 6 | 12 | 4 | 22 |
| D. 视觉/token/交互 | 2 | 16 | 8 | 26 |
| **合计** | **17** | **68** | **29** | **114** |

详细 inventory 见 Plan12.md。

## 决策

- ✅ 语言策略：**中文为主、业务术语括号注**（如"目标价 (PT)"、"市盈率 (P/E)"）
- ✅ 本轮范围：P0 17 项 + P1 68 项**全修**
- ✅ P2 29 项：本轮不动

---

# v2.0 — Post-fix 复核

## 验证结果

| 项 | 结果 |
|----|------|
| `npx tsc --noEmit` | ✅ EXIT=0 |
| `npx vite build` | ✅ 成功（1.01s，827.68 kB / gzip 226.95 kB） |
| V1 `src/components/` 改动 | ✅ 0 |
| V3 `src/components-us/` 改动 | ✅ 0 |
| `src/tokens.css` 改动 | ✅ 0 |
| `src/mock/stockDetail.ts` / `stockDetail-us.ts` 改动 | ✅ 0 |
| V2 改动文件 | **26 / 26**（全 V2 组件 + 1 mock） |
| 改动行数 | +491 / −238 |

## 执行分工

3 并行 general-purpose agent，每个负责 8-9 个组件 × A/B/C/D 四维度全修。Mock 字段由主流程预先扩展，agent 只读 mock。

| Agent | 范围 | 组件数 | tsc |
|-------|------|--------|-----|
| Agent 1 | A-E（AIAnalysis → EarningsForecast） | 9 | ✅ |
| Agent 2 | E-N（EarningsSummary → NewsPreview） | 9 | ✅ |
| Agent 3 | Q-V（QuoteHero → ValuationHistory） | 8 | ✅ |

## Mock 扩展（C 维度准备）

| 字段 | 位置 | 用途 |
|------|------|------|
| `DividendRecord.announcedDate` | mock 接口 + 5 条历史记录 | DividendPlan 表新增"宣布日"列 |
| `CalendarEvent.tz?: string` | mock 接口 + mockCalendarEvents | AlertCalendar 时间补时区 |
| `DolphinReport.link?: string` | mock 接口 + 5 篇报告 | DolphinResearch 阅读全文 CTA |
| `DiscussionPost.attached.name?: string` | mock 接口 | DiscussionFeed chip 中文名 |
| `ValuationHistoryRollingData` + `mockValuationHistoryRolling` | 新增独立 schema | 替换 ValuationHistory 内嵌硬编码 |
| mockCalendarEvents title 中文化 | 5 条数据 | 与组件 type 中文映射呼应 |

## A 维度修复（文案/标签/术语）

### P0 全部完成
- AIAnalysis：标题 "AI Analysis"→"AI 分析"、"POWERED BY DOLPHIN AI"→"海豚 AI 驱动"、"GEN"→"生成于"
- AlertCalendar："▤ EV"→"📅 事件"、"CAL →"→"全部日程 →"、time 拼 tz、type 方括号→`· 中文标签`
- AlertHot："▣ HOT"→"🔥 热点"、"MORE →"→"更多 →"
- AnalystConsensus："位分析师"与数字整合同行
- CompanyProfile：排名格式 "排名 1 / 共 43 家"
- DiscussionFeed："热门 · 前 3"→"热门讨论 (Top 3)"
- DividendPlan：标题改 "近 5 年股息分布:DPS 与 Yield"、"当期"→"最近股息率 (TTM Yield)"
- DolphinResearch："Dolphin Research"→"海豚投研"、category 中文映射（深度/快讯/业绩/宏观）、"PT"→"目标价 (PT)"
- EarningsForecast：表头全中文化（季度/营收下限/营收均值/营收上限/预测区间/分析师数）
- EventTracker："事件后"→"事件后涨跌"
- InstitutionalHolding：列头 "较内份额增减"→"持股变动 (万股)"（术语纠正）
- TagStrip：`hover:text-link`→`hover:text-accent`（修 undefined token）

### P1 完成
- 中文为主 + 业务术语括号注：业绩摘要 (Earnings Summary)、关键指标 (Key Metrics)、营收构成 (Revenue Breakdown)、行业地位 (Sector Position)、估值历史 (5Y) 等约 20 处
- 繁简统一：今開→今开
- StockTabs hint 中文化（Overview/财务/分析/资讯/讨论）
- AlertCalendar `+N 更多` 提示
- AlertHot sentiment 加 ↑↓– icon 辅助
- 评级翻译：Strong Buy/Buy/Hold/Sell → 强烈买入/买入/持有/卖出

## B 维度修复（信息密度/布局）

- AnalystConsensus grid 改 `minmax(420px,2fr)_3fr` 响应式
- CompanyProfile 右侧重复市值/排名删除、border-t-only、gap-y-2
- DividendPlan COLS 改 minmax 响应式、pt-3、行宽优化
- EarningsForecast py-2、min-w-0
- FinancialHealthScore grid 改 minmax(200px,1fr)
- IntradayChart tab group 整体 `border + rounded-sm + overflow-hidden`
- RevenueComposition grid minmax(160px,1fr)
- SectorPosition 外层 overflow-x-auto
- StockTabs `divide-x` 解决最后一格右边线问题
- TagStrip Tag button px-2 py-1（与 token 对齐）
- Valuation `grid-cols-1 md:grid-cols-2` 响应式

## C 维度修复（字段完备性）

- QuoteHero Volume / Mkt Cap 改读 mock（去硬编码 "48.24M"/"4.27T"）
- ValuationHistory 删除内嵌 PE_SERIES + PEER_AVG，全部改读 `mockValuationHistoryRolling`
- DividendPlan 表新增 "宣布日" 列（announcedDate）
- AlertCalendar time 拼 tz（EDT）
- DolphinResearch 阅读全文 CTA（link）
- DiscussionFeed attached chip 加中文名
- Valuation 卡片底部加 "当前位于 第 N 百分位" label
- ValuationHistory 加 Y 轴 3 档刻度（min/mid/max）
- KeyFactors 图例后加动态计数（重要 N / 次要 N / 一般 N）

## D 维度修复（视觉/token/交互）

- QuoteHero change 字号 text-base → text-lg（修 5:1 比例）
- QuoteHero 中文名 fg-3 → fg-2 / 心形 text-down → text-fg-3（语义纠正）
- DividendPlan yield text-warn → text-fg-1（去掉警告色）
- DividendPlan "特别" badge bg-warn → bg-accent-soft
- Valuation 高分位色 chart-red → warn（避免与下跌色混淆）
- Valuation fillOpacity 0.08 → 0.14
- ValuationHistory svg preserveAspectRatio `none` → `xMidYMid meet`（修失真）
- ValuationHistory Peer Avg 线宽 0.8 → 1.0px
- ValuationHistory Premium +22.5% text-warn → text-fg-1
- AnalystConsensus consensus 文字 text-accent → text-fg-1+font-semibold（与 donut 区分）
- AnalystConsensus 终端 dot fill 改主 stroke 色
- SectorPosition 高亮行 bg-brand-soft → bg-accent-soft（统一 token）
- StockTabs active indicator `rounded-none`
- CompanyProfile RankBar 按排名好坏条件着色（up/down/accent）
- DolphinResearch transition-colors duration-200
- DiscussionFeed `♡` → `👍`、py-4 增大点击区
- FinancialTable currency 万 → 万元
- AIAnalysis fullAnalysisHint 加 hover:underline
- AlertHot hover transition-colors

## 残留（P2，留下一轮）

| 项 | 严重度 | 评估 |
|----|-------|------|
| `−` vs `-` unicode 整体扫一遍 | P2 | 多组件零散，本轮按需修；下轮 grep 全工程一次性统一 |
| leading 微调（leading-tight / snug / relaxed 选择） | P2 | 个性化需求，需逐组件视觉评估 |
| 表格 hover row 背景 | P2 | 多个表格组件 hover 风格不完全一致 |
| 部分 transition duration 未统一（75ms / 100ms / 200ms 混用） | P2 | 设计系统层规范缺失 |

---

# 总结

V2 长桥版经 Plan12 一轮后：

- ✅ **P0 17 项 100% 修**（含 5 处硬编码消除、3 处术语错误纠正、9 处文案中文化）
- ✅ **P1 68 项 100% 修**（覆盖中英混排、响应式 grid、token 语义、hover 交互）
- ✅ **mock schema 扩展 5 项**（announcedDate / tz / link / attached.name / ValuationHistoryRollingData）
- ✅ **tsc + vite build EXIT=0**
- ✅ **V1 / V3 / tokens.css / V1+V3 mock 0 改动**（严守 fork 边界）
- ✅ V2 整体语言风格统一为"**中文为主、业务术语括号注**"

V2 现达到「Plan8/9/10 三层 + Plan12 细节专项」共 4 轮精修后的稳定态。下一轮 polish 可聚焦：
1. P2 29 项的视觉一致性扫尾
2. 设计系统层（tokens.css）的 transition duration / hover 规范缺口
3. 多视图（StockDetailLB / LBv21 / LBp3）的页面级布局差异化
