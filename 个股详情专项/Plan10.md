# Plan10 · V2 设计 Token / 组件 / 页面应用 一致性最终验收

## Context

Plan8 完成设计美观/合理性验收(6 P0 + 15 P1 修复)。
Plan9 完成金融数据完备性补完(5 组件 + 10 新字段)。

**Plan10 任务**(用户原话"以最严格模型,针对设计 token 一致性、组件一致性和、页面应用组件一致性,进行验收"):

最终 polish pass — 不再加功能,只清理 inconsistency。

## 硬伤自批

| # | 硬伤 | 应对 |
|---|------|------|
| 1 | **"一致性"标准主观** — 不同人对"一致"理解不同 | 用**机械标准**:同 prop / 同 class / 同 token,grep 可定位 |
| 2 | **Plan8/9 已经修了一遍** — Plan10 可能找不到新问题 | 用 **3 维度交叉**(Token / 组件 / 页面)— 各自维度有专属检查项 |
| 3 | **Refactor 风险** — 一致性修复可能破坏 prop API | 严格守 **不改 prop API,只动 className/JSX 结构** |
| 4 | **过度抽象** — 想统一就抽 utility 反而难维护 | 不抽新 utility,只对齐现有 token / class 用法 |

## 3 个验证维度

### A. Token 一致性

- A1. SectionHeader 用法:所有 section 都用 `<SectionHeader label hint>` 而非手写 header
- A2. Hover / Transition:所有 hover state 都用 `transition-colors`(可选 duration)
- A3. num font:所有数字都有 `num` class(没有用其他 font 但忘加 num 的)
- A4. caps label:所有 ALL-CAPS 文本用 `.caps` utility class
- A5. Color tokens:所有 var(--xxx) 用 `--color-` 前缀(避免 `var(--chart-blue)` 这种缺前缀)
- A6. Spacing:px-4 py-3 标准 card padding,pt-3 pb-2 标准 section header,no random px-3 / py-2

### B. 组件一致性

- B1. Button 都有 `type="button"`(Plan5 已修)+ `aria-label`(icon-only)
- B2. Tab pill 用统一样式:rounded-sm / px-3 py-1 / active = bg-accent/15 text-accent
- B3. KV item 统一:`flex items-baseline justify-between` + caps label + num value
- B4. Mini chart 统一 padding(PAD = 4-8)+ stroke-width 1.5(细线)/ 1.8-2(主线)
- B5. 表格 row 统一 py-1.5(密集)或 py-2(默认)
- B6. Border 边:hairline 卡内 / line 卡间 / divider 强分隔

### C. 页面应用一致性

- C1. StockDetailLB.tsx 5 个 Tab 内容结构是否对齐(border-b border-line 在每 section 之间)
- C2. Mock data 是否完整传给所有组件(没有漏 prop)
- C3. Tab order 是否合理(概览 → 财务 → 分析 → 资讯 → 讨论)
- C4. 组件复用统一(NewsRow 在 NewsPreview / NewsCardBig 都用同一个)

## 任务列表

### Phase 0 — 准备

1. ✅ 落盘 `~/原型港口/个股详情专项/Plan10.md`(本文件)
2. ⬚ 落盘 `~/原型港口/个股详情专项/Plan10-验收报告.md` 骨架

### Phase 1 — 3 维度扫描

3. ⬚ A 维度 token 一致性 grep 扫
4. ⬚ B 维度组件一致性人审 + grep
5. ⬚ C 维度页面应用 一致性人审 StockDetailLB.tsx

### Phase 2 — 报告 v1.0 + 修复

6. ⬚ 整合报告 + 直接 fix(因 polish 项数量小,合并到 Phase 2)

### Phase 3 — 验证

7. ⬚ tsc + build EXIT=0
8. ⬚ git diff V1/V3/mock 0 改动
9. ⬚ 报告 v2.0 + commit + push

## DoD

- ✅ A/B/C 三维度无 P0/P1 残留(P2 可保留)
- ✅ tsc + build EXIT=0
- ✅ V1 / V3 0 改动
- ✅ Plan10.md 全 ⬚ → ✅

## 风险

| 风险 | 应对 |
|------|------|
| 一致性修复破坏视觉 | 每改一组件 git diff 抽查 |
| 找不到足够"不一致"反而瞎改 | 接受"一致性大致达成",不强凑数 |
| 与 Plan8/9 已修项重复 | Plan10 报告标"已 Plan8/9 处理"项跳过 |

## 已完成

| 任务 | 日期 |
|------|------|
| Phase 0 落盘 Plan10.md | 2026-05-17 |
| Phase 1 三维度扫描:发现 30+ var() prefix 不一致 + 2 个 undefined token bug | 2026-05-17 |
| Phase 2 修复 `var(--grid-hair)` → `--color-hairline`(IntradayChart 渲染 bug) | 2026-05-17 |
| Phase 2 修复 `var(--font-text)` × 2 → `var(--font-sans)`(KeyFactors / FinancialHealthScore) | 2026-05-17 |
| Phase 2 批量修复 `var(--accent/up/down/chart-yellow)` 13 处 → `var(--color-*)` | 2026-05-17 |
| Phase 2 sed 批量修复 `var(--fg-N)` ~15 处 → `var(--color-fg-N)` | 2026-05-17 |
| Phase 3 tsc EXIT=0 + vite build OK + V1/V3/mock 0 改动 | 2026-05-17 |
| Phase 3 Plan10-验收报告.md v2.0 + 一致性指标表 | 2026-05-17 |

## 总结

经 Plan8(美观验收)+ Plan9(数据完备)+ Plan10(一致性收尾)三轮:
- V2 修复 6 P0 + 15 P1 视觉问题(Plan8)
- 补完 5 P0/P1 金融字段(Plan9)
- 清理 30+ token 引用一致性 + 2 undefined token bug(Plan10)
- **0 个 V1 / V3 改动**(严守边界)
- **tsc EXIT=0 + vite build OK** 全程通过
