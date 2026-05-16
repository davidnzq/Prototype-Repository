# Plan9 · V2 视觉合理性复审 + 金融数据完备性补完

## Context

Plan8 完成了 26 个 V2 组件的设计美观/合理性验收(6 P0 + 15 P1 修复)。Plan8 验收报告标记了 **7 项 F 维度退化** —— V2 在追求"长桥现代风"时,相比 V1(Bloomberg)失去了多个金融场景必需的字段。

**Plan9 任务**(用户原话"用最严格模型批判和验收,尤其是视觉合理性,以及在金融上的数据完备性,做处理"):

1. **视觉合理性复审**:Plan8 修复后,逐组件二次审查"看了能否做投资决策"
2. **金融数据完备性**:对照专业股票终端(Bloomberg、雪球、长桥真实页)审查 V2 是否缺关键字段
3. **处理**:必要字段回补(schema + mock + 组件 UI),非必要项明确标注"intentional omission"

## 硬伤自批(Hard Truths)

| # | 硬伤 | 应对 |
|---|------|------|
| 1 | **"完备性"是无底洞** — Bloomberg 终端 1000+ 字段,补不完 | 设定**用户场景**:"普通用户查个股做决策"需要哪些?— 不补 quant 字段 |
| 2 | **数据补完 ≠ UI 塞满** — 加字段可能让 V2 失去"现代感" | 用**优先级 + 折叠**:核心字段直显,次要字段折叠/hover/二级页 |
| 3 | **schema 改动会破坏 mock 数据** — 加字段后 mock 也要全填,工作量翻倍 | 优先**复用现有字段**(只补 V1 已有的);新字段最小化 |
| 4 | **V1 不是金科玉律** — Bloomberg 显示的不一定都必要 | 用**用户行为**判断:基本面(CEO/HQ/MarketCap)必要,quant(beta/skew)可选 |
| 5 | **"视觉合理性"二次复审易主观** — 易陷入"完美没有终点" | 限定**3 个观察**:能否快速找到主指标?数据可读吗?层次清晰吗? |
| 6 | **Plan9 不应做 Plan10 的活** — token/component consistency 是 Plan10 范畴 | 严格守 Plan9 边界:数据完备 + 视觉合理性,不做 token 收尾 |

## 边界声明

| 不做 | 理由 |
|------|------|
| ❌ 改 V1 组件 / V3 US 组件 | 仅 V2 |
| ❌ 改 token.css | SSOT 不动 |
| ❌ 改 Bloomberg 同 prop API 模式 | 保持 mock import 不破坏 |
| ❌ 补 quant 类高级字段(beta / sharpe / skew)| 普通投资者不必要 |
| ❌ 加更多 mock 数据点(已有的足够)| 不扩大 mock 体积 |

## 2 个验证维度 + 7 类金融完备性补完

### A. 视觉合理性复审(每组件 3 个问题)

- A1. 能在 3 秒内找到该组件的"主指标"吗?
- A2. 所有数字都能读清(对比度 + 字体 + 对齐)?
- A3. 层次是否服务于"快速决策"?(标题 > 主指标 > 次指标 > 注释)

### B. 金融数据完备性(7 类补完)

| 类 | 组件 | 缺失字段 | 必要性 | 来源 |
|---|------|---------|--------|------|
| B1 | CompanyProfile | CEO / Founded / HQ / Employees / Website | **P0** 普通用户必看 | V1 已有 |
| B2 | EventTracker | Impact(High/Med/Low)/ ΔPrice(事件后股价变化) | **P0** 事件价值 | V1 已有 |
| B3 | KeyFactors | 数值评分(0-100 或 A-E)| **P0** 因子树没有数 = 装饰 | V1 已有 |
| B4 | AnalystConsensus | Recent Revisions(近期评级变动)| **P1** 情绪趋势 | V1 已有 |
| B5 | DividendPlan | Yield trend(股息率历史)| **P1** 长期持有视角 | V1 已有 |
| B6 | InstitutionalHolding | Ownership 总览(机构 % + 内部人 %)| **P2** 概览有用,V2 当前只有 holders 列表 | V1 已有 |
| B7 | NewsCardBig | Featured 大卡(头条带图)| **P2** UX 风格选择 | V1 已有 |

### C. 其他可能新增的金融完备性

- Valuation: PEG(PE / EPS 增长)— 长线投资者常用
- FinancialTable: TTM 列(滚动 12 月)— 行业标配
- AnalystConsensus: targetPrice min/max/median(3 个数,V2 当前只有 mean)
- IntradayChart: 集合竞价 / 盘后区段标记
- RevenueComposition: 利润率(% margin)叠加

## 任务列表

### Phase 0 — 准备 + 报告骨架

1. ⬚ 落盘 `~/原型港口/个股详情专项/Plan9.md`(本文件)
2. ⬚ 落盘 `~/原型港口/个股详情专项/Plan9-验收报告.md` 骨架

### Phase 1 — 视觉合理性 + 完备性双轨审计

3. ⬚ 视觉合理性复审 26 组件(快速 walk-through,标记 Plan8 未捕获的残留)
4. ⬚ 金融完备性审计:对照 V1 schema + Bloomberg/长桥真实页,标出 B1-B7 缺失字段
5. ⬚ 评估其他完备性(PEG / TTM / target range / 集合竞价 / margin)

### Phase 2 — 输出报告 v1.0

6. ⬚ 整合到 `Plan9-验收报告.md` v1.0(pre-fix)— 列每个缺失字段的修复必要性

### Phase 3 — 逐项处理(P0 必修 + P1 选修 + P2 跳过)

7. ⬚ **B1 CompanyProfile 字段回补**:CEO / Founded / HQ / Employees 补到 schema + mock + 组件 UI(用折叠/紧凑展示,不破坏 V2 风格)
8. ⬚ **B2 EventTracker Impact + ΔPrice**:补到 schema + mock + 组件 UI(Impact 用 badge,ΔPrice 用涨跌色)
9. ⬚ **B3 KeyFactors 数值评分**:补到 schema + mock,组件加 score 视觉(右侧 mini bar 或数字)
10. ⬚ **B4 AnalystConsensus Recent Revisions**:补 mock + UI(底部加 3-5 条最近评级变动 timeline)
11. ⬚ **B5 DividendPlan Yield trend**:补 mock + UI(摘要条下方加 mini yield 历史折线)
12. ⬚ **B6 InstitutionalHolding 总览**(可选):评估是否补 Top of Holders 概览
13. ⬚ **C 其他**(选择性):Valuation PEG / FinancialTable TTM / AnalystConsensus target range

每完成一项:
- `npx tsc --noEmit` EXIT=0
- 视觉抽查无回归
- git diff 确认 V1/V3 无改动

### Phase 4 — 输出报告 v2.0 + 收尾

14. ⬚ 重审 V2 26 组件(post-fix)+ 出 v2.0 Diff 表
15. ⬚ `npx vite build` EXIT=0
16. ⬚ 浏览器走查 `#lb-stock` 视觉确认
17. ⬚ Plan9.md 全 ⬚ → ✅
18. ⬚ git commit + push 部署

## DoD

- ✅ Plan9-验收报告.md 含 v1.0 / v2.0 双版本
- ✅ B1-B5 P0/P1 必修字段 100% 回补
- ✅ 视觉合理性复审无 P0/P1 残留
- ✅ tsc + build EXIT=0
- ✅ V1 / V3 / 其他 mock 0 改动(只动 `stockDetail-lb.ts`)
- ✅ V2 视觉不回归到"信息塞满"(保留 LB 现代风)

## 进度跟踪

| 阶段 | 任务范围 | 任务数 | 状态 |
|------|---------|--------|------|
| 0 | 准备 | 2 | ⬚ 0/2 |
| 1 | 双轨审计 | 3 | ⬚ 0/3 |
| 2 | 报告 v1.0 | 1 | ⬚ 0/1 |
| 3 | 逐项处理 | 7 | ⬚ 0/7 |
| 4 | 报告 v2.0 + 收尾 | 5 | ⬚ 0/5 |
| **TOTAL** | | **18** | ⬚ 0/18 |

## 风险

| 风险 | 应对 |
|------|------|
| schema 改动破坏 import 链 | 仅在 stockDetail-lb.ts 内改,LB schema 独立 |
| UI 字段塞太多失去现代感 | 用折叠/二级展开/hover 显示 |
| 修改后 V2 看起来像 V1 | 严格守"信息密度 ≤ V1 80%"目标 |
| Mock 数据填不全 | 用合理推断值 / "—" 占位 |

## 关键文件路径

**新增**:
- `~/原型港口/个股详情专项/Plan9.md`(本文件)
- `~/原型港口/个股详情专项/Plan9-验收报告.md`

**修改**(Phase 3):
- `src/mock/stockDetail-lb.ts`(schema + mock 数据)
- `src/components-longbridge/CompanyProfile.tsx`
- `src/components-longbridge/EventTracker.tsx`
- `src/components-longbridge/KeyFactors.tsx`
- `src/components-longbridge/AnalystConsensus.tsx`
- `src/components-longbridge/DividendPlan.tsx`

**不动**:
- `src/components/` / `src/components-us/` / 其他 mock
- `Design-System/tokens/tokens.css`

## 已完成

| 任务 | 日期 |
|------|------|
| Phase 0 落盘 Plan9.md + Plan9-验收报告.md 骨架 | 2026-05-17 |
| Phase 1 视觉合理性复审 + 金融完备性审计(对照 V1 schema)| 2026-05-17 |
| Phase 2 输出验收报告 v1.0(B1-B7 + C 类清单) | 2026-05-17 |
| Phase 3 B1 CompanyProfile 补 CEO/Founded/HQ/Employees/Website/IPO Date | 2026-05-17 |
| Phase 3 B2 EventTracker 补 Impact + ΔPrice | 2026-05-17 |
| Phase 3 B3 KeyFactors 补 value 字段(关键叶子节点) | 2026-05-17 |
| Phase 3 B4 AnalystConsensus 补 Recent Revisions(底部 5 列 grid) | 2026-05-17 |
| Phase 3 B5 DividendPlan 补 yield 历史 mini 折线 | 2026-05-17 |
| Phase 4 tsc EXIT=0 + vite build OK + V1/V3 0 改动 | 2026-05-17 |
| Phase 4 Plan9-验收报告.md v2.0 + 视觉复审结果 | 2026-05-17 |

## 总结

- **5 个 V2 组件**补完关键字段,**0 个 V1 / V3 改动**
- **6 个 schema 字段**加 LB mock(基本面 6 + 事件 2 + 树 1 + 评级 1 数组 = 10 新字段)
- **金融数据完备性 6/6 维度** v2 全 ✅(机构持仓深度保留 V2 设计选择)
- **构建 0 error**,LB 风格保持(没有变成 V1 Bloomberg 密度)
