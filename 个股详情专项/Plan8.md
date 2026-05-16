# Plan8 · V2 全方位设计美观与合理性验收(Bloomberg 对照,Token 严格)

## Context

Plan5 完成了 token 合规审计 + a11y 补全(0 hex / 0 rgba / opacity 数字归 token / aria 补全)。
Plan6/7 完成了 V2 布局重排 + #08 AnalystConsensus 重设计。

**Plan8 任务**:在 token 合规与布局合理的基础上,以**最严格设计要求**做 V2 全 26 个组件的**美观与合理性**深度验收 + 修复。

| 维度 | 范围 |
|------|------|
| **基准 SSOT** | `Design-System/tokens/tokens.css`(300 tokens)— 严格不动 |
| **审计目标** | V2 26 个组件(`src/components-longbridge/*.tsx`)|
| **对照** | V1 Bloomberg 26 个同名组件(`src/components/*.tsx`)|
| **不动** | V1 组件 / V3 US 组件 / mock 数据 schema / 任意 token |
| **报告** | `Plan8-验收报告.md`(v1.0 pre-fix → v2.0 post-fix)|

## 硬伤自批(Hard Truths)— 先识破再执行

| # | 硬伤 | 应对 |
|---|------|------|
| 1 | **审美主观陷阱** — "美观"是主观的,容易陷入个人偏好 | 用**可量化标准**:对比度数字、字号比、间距比例、Bloomberg 同位 |
| 2 | **Bloomberg 不是 LB 参照** — V1 是密集型 Bloomberg 风,V2 是 LB 现代风,过度参照失去 LB 特色 | 只对照**信息密度**和**层次清晰度**,不照搬色调/圆角/字体 |
| 3 | **token 合规 ≠ 合理使用** — Plan5 已让所有 token 用对语法,但场景错用是新问题 | 不查"用了 var 吗",查"用对场景吗"(如 `text-fg-3` 用在数据上 vs label 上)|
| 4 | **密集 vs 干净是矛盾** — 表格需要密集,卡片需要呼吸 | 区分**密集型组件**(table、kline、grid)vs **展示型组件**(hero、card、profile)适用不同标准 |
| 5 | **26 × 8 维度 = 200+ 项可能爆炸** — 容易输出大量低价值项 | 设定**优先级**:P0(阻塞理解)→ P1(明显粗糙)→ P2(精修优化),P0/P1 必修,P2 选择性 |
| 6 | **修复回归风险** — 视觉调整可能破坏现有布局 | 每修一组件 `npx tsc --noEmit` + 浏览器抽查 |
| 7 | **Plan5 已修过部分** — Plan8 不能复制 Plan5 已修项 | Plan1 审计时**对照 Plan5-验证报告.md**,跳过已修 |

## 8 个验证维度(每组件审计清单)

### A. 视觉层次 (Visual Hierarchy)

- A1. 标题 / 数据 / 描述 / 辅助 4 层是否分明(字号梯度 ≥ 1 step)
- A2. 同行多元素 font-weight 区分(label 400-500 / value 600-700)
- A3. 色彩层次:fg-1(主)→ fg-2(次)→ fg-3(弱)→ fg-4(超弱)使用正确
- A4. 大数字应用 num 字体 + ls-tight(tabular nums)
- A5. SectionHeader 全统一,hint 风格一致

### B. 信息密度 (Information Density)

- B1. 表格 row 高度合理(dense 24px / 默认 32px)— 表格不能 padding 太大
- B2. 卡片内 padding 符合 `--cmp-card-px/py`(16/12)
- B3. 单屏 1280px 不浪费(空白区不超过 30%)
- B4. 同信息分组内元素间距用 sp-2 / sp-3(8/12),不混用

### C. 颜色语义 (Color Semantics)

- C1. `up / down` **仅**用于涨跌,不用于"好/坏"或"高/低"
- C2. `accent` 仅用于品牌强调 / CTA / ticker,不滥用作普通强调
- C3. `warn` 仅用于真正预警(财务红线 / 大幅下跌预测)
- C4. `chart-blue / purple / yellow` 等仅用于多维数据可视化(多分类),不混 up/down
- C5. `fg-3 / fg-4` 必须是真正辅助,不能放主信息

### D. 间距节奏 (Spacing Rhythm)

- D1. Section 容器统一:`px-4 pt-3 pb-2`(via SectionHeader + 内容 `px-4 pb-4`)
- D2. 垂直 stack 用 `space-y-*`,不混 `mt-*` + `mb-*`
- D3. Grid gap 一致:`gap-2`(8)/`gap-3`(12)/`gap-4`(16),不用 `gap-1.5`(6,除非 sp-row)
- D4. 卡片间用 `border-b border-line`,不混 `mb-N` + `border-t`

### E. 对齐 (Alignment)

- E1. 数字列右对齐(text-right + num)
- E2. 标签列左对齐
- E3. 表格 header 与 row 用同 grid 模板(grid-cols-* 一致)
- E4. 多列等宽 / 自适应用 `grid-cols-N` + `fr` 或 `flex-1`

### F. Bloomberg 对照 (V1 Reference)

- F1. 同名组件 V2 vs V1,看**信息密度差异**(V2 太稀疏?)
- F2. **层次清晰度对比**(V2 标题不够突出?)
- F3. **关键字段缺失**(V1 显示但 V2 漏的字段)
- F4. **冗余字段**(V2 添加但无价值的字段)

### G. 可读性 (Readability)

- G1. `text-fg-3 (#60626a)` 在 `bg-1 (#0a0e19)` 对比度 ≈ 4.2:1 ✓ AA
- G2. `text-fg-4 (#363a47)` 在 `bg-1` 对比度 ≈ 1.5:1 ⚠️ 仅 decorative
- G3. 数字必须用 `var(--font-num)` 等宽(JetBrains Mono / SF Mono)
- G4. caps label 用 `tracking-wider`(0.1em),区别于正文

### H. 边界与卡片 (Borders & Cards)

- H1. `border-hairline (#2c3039)` 用于卡片内细分(table row、微分组)
- H2. `border-line (#3b3e47)` 用于 section 间分隔
- H3. `border-line-button (#363a47)` 用于辅助按钮描边
- H4. 卡片背景:`bg-2 / card / soft` 选择(bg-1 默认,bg-2 卡片,soft 列表斑马)

---

## 任务列表

### Phase 0 — 准备 + 报告骨架 + 计划落盘

1. ✅ 读 token SSOT + V2 组件清单(已完成,基础数据已采)
2. ⬚ 落盘 `~/原型港口/个股详情专项/Plan8.md`(本文件)
3. ⬚ 落盘 `~/原型港口/个股详情专项/Plan8-验收报告.md` 骨架(矩阵: 26 行 × 8 列 + v1.0/v2.0 双版本)

### Phase 1 — 逐组件 8 维度审计(read-only)

按使用 Tab 分组审计:

**Tab 概览 / 公共**(10 组件):
4. ⬚ QuoteHero — A/B/C/D/E/F/G/H 审计
5. ⬚ AlertHot — 同上
6. ⬚ AlertCalendar — 同上
7. ⬚ IntradayChart — 重点 B(K 线密度)/ C(涨跌色)/ E(轴对齐)
8. ⬚ QuoteKV — 重点 A(KV 层次)/ E(K 在左 V 在右)
9. ⬚ CompanyProfile — 重点 B(基本面卡片紧凑)/ D(列间距)
10. ⬚ EventTracker — 重点 A(事件时序层次)
11. ⬚ DolphinResearch — 重点 H(卡片背景)
12. ⬚ NewsPreview — 重点 A(标题与摘要层次)
13. ⬚ DiscussionFeed / DiscussionPreview — 同上

**Tab 财务**(7 组件):
14. ⬚ EarningsSummary — 重点 A/B(KPI 卡密度)
15. ⬚ FinancialHealthScore — 重点 A/C/H(评分卡)
16. ⬚ FinancialTable — 重点 B/E(表格密度 + 对齐)
17. ⬚ RevenueComposition — 重点 C(多维 chart 色)/ E(legend 对齐)
18. ⬚ DividendPlan — 重点 A/E(历史表)
19. ⬚ EarningsForecast — 重点 C(forecast band)
20. ⬚ ValuationHistory — 重点 A/E(估值历史表)

**Tab 分析**(4 组件):
21. ⬚ AnalystConsensus — Plan7 已重设计,复核 A/C/E
22. ⬚ InstitutionalHolding — 重点 A/E(机构持股表)
23. ⬚ KeyFactors — 重点 A(因子层次)/ C(评分色)
24. ⬚ Valuation — 重点 B(估值卡密度)

**Tab 新闻 / 讨论**(1 组件):
25. ⬚ NewsCardBig — 重点 A(大卡层次)

**全局组件**(4 组件):
26. ⬚ StockTabs — 重点 A(active 对比度)/ D(间距)
27. ⬚ TagStrip — 重点 C(tag 色)/ D(间距)
28. ⬚ AIAnalysis — 重点 A(AI 文本层次)
29. ⬚ SectorPosition — 重点 A/C(sector 散点)

### Phase 2 — 输出验收报告 v1.0

30. ⬚ 整合 26 组件 8 维度审计结果到 `Plan8-验收报告.md` v1.0(pre-fix)
31. ⬚ 列 Top P0 / P1 问题清单 + 修复优先级

### Phase 3 — 逐组件修复

32. ⬚ Phase 3.1: 公共组件批量修复(SectionHeader / SectionHeader hint 一致化)
33. ⬚ Phase 3.2: Tab 概览 10 组件修复
34. ⬚ Phase 3.3: Tab 财务 7 组件修复
35. ⬚ Phase 3.4: Tab 分析 4 组件修复
36. ⬚ Phase 3.5: Tab 新闻 + 全局 5 组件修复

每 Phase 3.x 完成跑:
- `npx tsc --noEmit` EXIT=0
- `npx vite build` EXIT=0
- `git diff src/components/ src/components-us/ src/mock/` 确认 V1/V3/mock 0 改动

### Phase 4 — 输出报告 v2.0 + 收尾

37. ⬚ 重审计 26 组件 8 维度(post-fix)
38. ⬚ 输出 `Plan8-验收报告.md` v2.0 + Diff 表(每维度 v1 → v2 问题数下降)
39. ⬚ 浏览器走查 `#lb-stock` 视觉确认无回归
40. ⬚ Plan8.md 全 ⬚ → ✅
41. ⬚ git commit + push 部署

---

## DoD (Definition of Done)

**报告级**:
- ✅ `Plan8-验收报告.md` 含 26 组件 × 8 维度矩阵 × v1.0/v2.0 双版本
- ✅ 每条问题 file:line + 优先级 (P0/P1/P2) + 修复建议
- ✅ Diff 表显示修复前后问题数下降

**修复级**:
- ✅ 所有 P0 问题 100% 修复
- ✅ 所有 P1 问题 ≥ 80% 修复
- ✅ P2 问题选择性修复(预算够则做)
- ✅ tsc + build EXIT=0
- ✅ V1 / V3 / mock 0 改动(`git diff` 为空)
- ✅ V2 视觉无回归(浏览器走查 `#lb-stock`)

## 进度跟踪

| 阶段 | 任务范围 | 任务数 | 状态 |
|------|---------|--------|------|
| 0 | 准备 + 报告骨架 | 3 | ⬚ 0/3 |
| 1 | 26 组件 8 维度审计 | 26 | ⬚ 0/26 |
| 2 | 报告 v1.0 | 2 | ⬚ 0/2 |
| 3 | 5 批修复 | 5 | ⬚ 0/5 |
| 4 | 报告 v2.0 + 收尾 | 5 | ⬚ 0/5 |
| **TOTAL** | | **41** | ⬚ 0/41 |

## 风险与回滚

| 风险 | 应对 |
|------|------|
| 视觉回归 | 每修一组件浏览器抽查 + git diff 仅看 V2 |
| Token 缺失(发现需要新增) | 标 ⚠️ 留 Plan9/10,本轮接受 ad-hoc 合理值 |
| Bloomberg 过度模仿 | 只对照密度/层次,不动颜色 |
| 范围扩散 | 严格按维度 A-H 限定,不动 schema/API |
| Plan5 重复劳动 | 审计时对照 Plan5-验证报告.md 跳过已修 |

## 关键文件路径

**新增**:
- `~/原型港口/个股详情专项/Plan8.md`(本计划)
- `~/原型港口/个股详情专项/Plan8-验收报告.md`(v1.0 + v2.0)

**修改**(Phase 3):
- `src/components-longbridge/` 26 个 .tsx

**不动**:
- `src/components/`(V1 Bloomberg)
- `src/components-us/`(V3 US)
- `src/mock/*.ts`(所有 mock,prop API 不动)
- `Design-System/tokens/tokens.css`(SSOT)
- 其他 Plan*.md

## 备注 — 与历史 Plan 的边界

- **Plan5**(已完成):token 合规 + a11y(54 条违规 → 0)
- **Plan6**(已完成):V2 组件宽度修复(1280px 适配)
- **Plan7**(已完成):V2 layout 重排 + #08 AnalystConsensus 重设计
- **Plan8(本)**:V2 26 组件设计美观 + 合理性深度验收(Bloomberg 对照,8 维度)
- **Plan9(后续)**:视觉合理性复审 + 金融数据完备性
- **Plan10(后续)**:Token / 组件 / 页面应用一致性收尾验收

## 已完成

| 任务 | 日期 |
|------|------|
| Phase 0.1 读 token SSOT + V2 组件清单 | 2026-05-17 |
| Phase 0.2 落盘 Plan8.md + Plan8-验收报告.md 骨架 | 2026-05-17 |
| Phase 1 26 组件 8 维度审计(5 并行 agents)| 2026-05-17 |
| Phase 2 输出验收报告 v1.0 + Top P0/P1 清单 | 2026-05-17 |
| Phase 3.1 Tab 概览 公共修复(QuoteHero / QuoteKV / AlertCalendar / EventTracker / CompanyProfile / DolphinResearch) | 2026-05-17 |
| Phase 3.2 Tab 财务修复(EarningsSummary / FinancialHealthScore / RevenueComposition) | 2026-05-17 |
| Phase 3.3 Tab 分析修复(AnalystConsensus 调色 / InstitutionalHolding 语义)| 2026-05-17 |
| Phase 3.4 全局修复(TagStrip / Valuation / AIAnalysis / SectorPosition) | 2026-05-17 |
| Phase 4 tsc EXIT=0 + vite build OK + git diff V1/V3/mock 0 改动 | 2026-05-17 |
| Phase 4 输出 Plan8-验收报告.md v2.0 + Diff 表 | 2026-05-17 |

## 进度统计

| 维度 | v1 → v2 |
|------|--------|
| P0 | 11 → 0(6 修复 + 5 重判误报) |
| P1 | 35 → 20(15 修复)|
| P2 | 24 留 Plan10 polish 阶段 |
| F 维度退化 | 7 项留 Plan9 数据完备性补回 |
