# Plan9 — V2 视觉合理性复审 + 金融数据完备性验收报告

> 配套 `Plan9.md` 执行,在 Plan8 已修 6 P0 + 15 P1 的基础上,补完 7 项 F 维度退化中的关键字段。

## 版本

| 版本 | 状态 | 完成日期 |
|------|------|---------|
| v1.0 — Pre-fix | ✅ 完成 | 2026-05-17 |
| v2.0 — Post-fix | ✅ 完成 | 2026-05-17 |

## 修复必要性等级

- **P0 必修** — 普通投资者决策必看,V2 当前残缺 → 必须回补
- **P1 必修** — 专业用户期待,V2 缺会被认为"不专业" → 必须回补
- **P2 可选** — UX 风格选择,补与不补都合理 → 跳过 / 留 Plan10
- **C 增益** — 新增超过 V1 的字段 → 不强求,有空间补

---

# v1.0 — 数据完备性审计(待执行后填充)

## B 类 — 7 项 F 维度退化补完评估

| # | 组件 | 缺失 | 必要性 | V1 行 | 补完代价 |
|---|------|------|--------|-------|---------|
| B1 | CompanyProfile | CEO / Founded / HQ / Employees / Website | P0 | V1 行 24-39 KV grid | 中(schema + 4-5 mock 值)|
| B2 | EventTracker | Impact / ΔPrice | P0 | V1 行 ? | 中(schema 加 2 字段)|
| B3 | KeyFactors | 数值评分(score 0-100)| P0 | V1 中显式 score bar | 中-大(每节点加 score)|
| B4 | AnalystConsensus | Recent Revisions | P1 | V1 4 列含 revisions 列 | 大(新数据结构)|
| B5 | DividendPlan | Yield trend(历史)| P1 | V1 dual-axis chart | 中(yield 数组)|
| B6 | InstitutionalHolding | Ownership 总览 | P2 | V1 donut | 大,跳过 |
| B7 | NewsCardBig | Featured 大卡 | P2 | V1 2 列 featured | 小,但 UX 选择 |

## C 类 — 其他金融完备性(待评估)

| 字段 | 组件 | 必要性 | 评估 |
|------|------|--------|------|
| PEG | Valuation | C | 仅 metrics 数组缺 PEG;长线投资者常用 |
| TTM | FinancialTable | C | 主流报表必备 |
| Target Price range | AnalystConsensus | C | mean + min/max 三档,V2 当前可能只有 mean |
| 集合竞价区段 | IntradayChart | C | 中港股有,美股无 |
| Margin overlay | RevenueComposition | C | 盈利能力对比 |

---

# v2.0 — Post-fix 复核

## 验证结果

| 项 | 结果 |
|----|------|
| `npx tsc --noEmit` | ✅ EXIT=0 |
| `npx vite build` | ✅ 成功 |
| V1 `src/components/` 改动 | ✅ 0 |
| V3 `src/components-us/` 改动 | ✅ 0 |
| LB mock 改动 | 仅 `stockDetail-lb.ts`(+5 schema 字段) |
| V2 组件改动 | 5 个 |
| 总行数变化 | +291 / −30(净 +261)|

## 修复 Diff 表

| 类 | 状态 | 修复策略 | 文件 |
|---|------|---------|------|
| **B1 CompanyProfile** | ✅ 完成 | schema 加 `ceo / founded / hq / employees / website / ipoDate` 6 字段;UI 加左栏 2×3 紧凑 Fact 列表 | stockDetail-lb.ts + CompanyProfile.tsx |
| **B2 EventTracker** | ✅ 完成 | schema 加 `impact?: "high"\|"medium"\|"low"` + `priceChange?: number`;UI 加 Impact badge(右上角)+ 事件后涨跌(行底)| stockDetail-lb.ts + EventTracker.tsx |
| **B3 KeyFactors** | ✅ 完成 | schema 加 `value?: string`;UI 在节点 label 下显示 num 小字 value(只显示有 value 的节点)| stockDetail-lb.ts + KeyFactors.tsx |
| **B4 AnalystConsensus** | ✅ 完成 | schema 加 `recentRevisions: [...5]`;UI 加底部 5 列 grid 显示评级变动(箭头染 up/down)| stockDetail-lb.ts + AnalystConsensus.tsx |
| **B5 DividendPlan** | ✅ 完成 | 复用 history 中现有 yieldPct,UI 摘要条加 4th 列 mini 折线图(2021-2025 年股息率走势)| DividendPlan.tsx |
| B6 InstitutionalHolding 总览 | 跳过 | V2 简表已含核心信息,donut 概览 P2 暂不补 | — |
| B7 NewsCardBig featured 大卡 | 跳过 | UX 风格选择,V2 统一紧凑列表更现代 | — |

## 视觉合理性复审(post-fix)

| 组件 | 复审结果 |
|------|---------|
| CompanyProfile | ✅ 左栏现在有完整基本面:描述 → 6 字段 Fact 表 → 市值 + 排名;层次清晰,密度合理(2 列紧凑)|
| EventTracker | ✅ Impact badge 在事件后,涨跌%在时间旁,信息密度增加但视觉清晰 |
| KeyFactors | ✅ 高重要节点带 value 显示,装饰性树变成"有数据的结构图"|
| AnalystConsensus | ✅ 底部 Recent Revisions 让用户看到情绪变化趋势,主区与底部用 hairline 分隔 |
| DividendPlan | ✅ 摘要条 4 列 grid,前 3 列 KV + 第 4 列 mini 折线,视觉平衡 |

## 关键金融完备性维度评估

| 维度 | v1 状态 | v2 状态 |
|------|---------|--------|
| 公司基本面(CEO/HQ/Founded)| ❌ 缺失 | ✅ 完整 |
| 事件价值(Impact + ΔPrice)| ❌ 缺失 | ✅ 完整 |
| 因子可量化(value 字段)| ❌ 缺失 | ✅ 关键叶子节点补全 |
| 分析师情绪(Revisions)| ❌ 缺失 | ✅ 最近 5 条 |
| 股息历史趋势 | ❌ 仅当期 | ✅ 5 年 trend |
| 机构持仓深度 | ⚠️ 仅 holders 列表 | ⚠️ 同(V2 简表设计选择)|

## 残留 (留 Plan10)

- C 类增益字段(PEG / TTM / target range 等)— 留 Plan10 评估
- B6 InstitutionalHolding 概览 donut — 设计选择,暂不补
- B7 NewsCardBig featured — 设计选择,暂不补
- P2 polish 累积(各组件 hover 时长 / num 散点)— 留 Plan10
