# Plan11 · V3 US 客户端版全面精修(美观 + 完备 + 一致性 三合一)

## Context

V2(长桥)经 **Plan8 + Plan9 + Plan10** 三轮精修达到设计系统合规最佳实践版。
V3(US 客户端)自 Plan4 fork 后未再迭代,虽然 Plan5 token 合规已修过,但**没经过同等严格的审美 / 完备性 / 一致性 验收**。

**Plan11 任务**:把 V2 Plan8/9/10 的成果迁移到 V3,做一轮**合并的全面精修**。

| 维度 | 范围 |
|------|------|
| **基准 SSOT** | `Design-System/tokens/tokens.css`(不动) |
| **审计目标** | V3 31 个组件(`src/components-us/`)|
| **对照** | V1 Bloomberg 26 个(密度参照)+ V2 Longbridge 26 个(token 用法参照)|
| **不动** | V1 组件 / V2 组件 / V1+V2 mock / tokens.css |

## 硬伤自批

| # | 硬伤 | 应对 |
|---|------|------|
| 1 | **3 in 1 任务量大** — 31 组件 × 3 维度可能爆 | 设定**已知问题先批处理**(--font-text bug / var prefix),个性化问题做 P0 即可 |
| 2 | **V3 5 个独有组件**(BottomTabNav / CapitalFlow / OrderBookL2 / Shorting / StickyTradeBar)无 V1/V2 对照 | 单独 audit,标"US-only"专属维度 |
| 3 | **V3 设计风格**(US web)与 V2(长桥)不同,不能机械搬运修复 | 只迁**机械修复**(token bug / prefix);visual polish 重新评估 |
| 4 | **schema 兼容** — V3 mock schema 可能没有 V2 Plan9 新加的字段 | 不强求 V3 加 V2 同样字段,按 V3 用户场景独立评估 |
| 5 | **回归风险** | 每改一组件 git diff + 浏览器抽查 |

## 边界声明

| 不做 | 理由 |
|------|------|
| ❌ 改 V1 / V2 组件 | 严守 fork 边界 |
| ❌ 改 V1 / V2 mock | 同上 |
| ❌ 改 tokens.css | SSOT 不动 |
| ❌ 强制 V3 采用 V2 现代风(donut / 思维导图) | V3 是 US 客户端风,设计语言不同 |
| ❌ 把 V2 Plan9 所有字段都搬到 V3 | V3 schema 按其用户场景独立 |
| ❌ 改 V3 的 prop API | 仅视觉 + token,不动接口 |

## 已知问题(扫描结果)

### 立即可修的机械问题
1. **`var(--font-text)` UNDEFINED**(2 处):KeyFactors:138 + FinancialHealthScore:262 → `var(--font-sans)`
2. **8 个 legacy var() 缺 `--color-` 前缀**:
   - ValuationHistory:86/90/95 — `var(--accent)` × 3
   - CapitalFlow:231 — `var(--hairline)`
   - EarningsForecast:106 — `var(--hairline)`
   - InstitutionalHolding:71 — `var(--line)`
   - FinancialTable:117 — `var(--hairline)`
   - IntradayChart:104 — `var(--hairline-strong)`

### 待审计的设计 / 完备性问题
- V3 31 组件 × 视觉合理性
- V3 5 个独有组件(BottomTabNav / CapitalFlow / OrderBookL2 / Shorting / StickyTradeBar)的设计审查
- V3 mock schema 完备性(对照真实 US 客户端如 Robinhood / Yahoo Finance)

## 任务列表

### Phase 0 — 准备

1. ✅ 落盘 `Plan11.md`(本文件)
2. ⬚ 落盘 `Plan11-验收报告.md` 骨架

### Phase 1 — 并行审计

3. ⬚ 6 并行 agent 审计 V3 31 组件(每 agent 5-6 组件)
4. ⬚ US-only 5 个组件专项审计

### Phase 2 — 报告 + 修复并行

5. ⬚ 整合 audit 结果到 `Plan11-验收报告.md` v1.0
6. ⬚ **Phase 3.A(机械批处理)**:修 `--font-text` bug + 8 个 var() 前缀
7. ⬚ **Phase 3.B(视觉精修)**:逐组件按 P0/P1 优先级修复
8. ⬚ **Phase 3.C(完备性)**:V3 mock schema 缺失字段评估(只补必要)
9. ⬚ **Phase 3.D(US-only 5 组件)**:专项 polish

### Phase 3 — 验证 + 收尾

10. ⬚ `npx tsc --noEmit` EXIT=0
11. ⬚ `npx vite build` EXIT=0
12. ⬚ `git diff src/components/ src/components-longbridge/ src/mock/stockDetail.ts src/mock/stockDetail-lb.ts` 为空
13. ⬚ Plan11-验收报告.md v2.0(post-fix)
14. ⬚ git commit + push

## DoD

- ✅ Plan11-验收报告 v1.0 / v2.0 双版本完整
- ✅ V3 2 个 undefined token bug 修复
- ✅ V3 8 个 var() prefix 一致化
- ✅ V3 P0 视觉问题 100% 修
- ✅ V3 P1 视觉问题 ≥ 80% 修
- ✅ tsc + build EXIT=0
- ✅ V1 / V2 / V1+V2 mock 0 改动

## 进度跟踪

| 阶段 | 任务数 | 状态 |
|------|--------|------|
| 0 准备 | 2 | ⬚ 0/2 |
| 1 审计 | 2 | ⬚ 0/2 |
| 2 报告 + 修复 | 5 | ⬚ 0/5 |
| 3 收尾 | 5 | ⬚ 0/5 |
| **TOTAL** | **14** | ⬚ 0/14 |

## 风险

| 风险 | 应对 |
|------|------|
| V3 设计语言被机械改成 V2 风 | 严守 "只修 token bug + 已知 anti-pattern,不强迁现代风" |
| US-only 5 组件审计偏离 | 对照 Robinhood / Yahoo Finance / TradingView 真实 US 客户端 |
| Mock schema 改动连锁 V3 page | 改 schema 立即跑 tsc |

## 关键文件路径

**新增**:
- `~/原型港口/个股详情专项/Plan11.md`
- `~/原型港口/个股详情专项/Plan11-验收报告.md`

**修改**:
- `src/components-us/` 31 个 .tsx(选择性)
- `src/mock/stockDetail-us.ts`(若 schema 需要补字段)

**不动**:
- `src/components/` / `src/components-longbridge/` / 其他 mock / tokens.css

## 已完成

| 任务 | 日期 |
|------|------|
| Phase 0 落盘 Plan11.md + Plan11-验收报告.md 骨架 | 2026-05-17 |
| Phase 1 6 并行 agent 审计 V3 31 组件(含 US-only 5 个专项) | 2026-05-17 |
| Phase 2 报告 v1.0 + 综合发现汇总 | 2026-05-17 |
| Phase 3A sed 批处理:`--font-text` × 2 / `--bg-3` × 2 undefined bug 修复 | 2026-05-17 |
| Phase 3A sed 批处理:30+ var() refs 加 --color- 前缀(全 V3 31 文件)| 2026-05-17 |
| Phase 3B V2-pattern 迁移 5 处(AlertCalendar/DolphinResearch/AIAnalysis/SectorPosition/TagStrip) | 2026-05-17 |
| Phase 3C US-only 5 组件评估通过,设计偏离评估为 intentional | 2026-05-17 |
| Phase 4 tsc EXIT=0 + vite build OK + V1/V2/V1+V2 mock 0 改动 | 2026-05-17 |
| Phase 4 Plan11-验收报告.md v2.0 + commit + push | 2026-05-17 |

## 总结

- V3 现在与 V2 处于**同等精修水平**(V2 经 Plan8/9/10,V3 经 Plan11)
- 4 个 undefined token 渲染 bug 修复(K 线栅格 / 雷达字体 / 估值环 ring track)
- 30+ token refs 全部加 --color- 前缀
- V2 Plan8 的 5 处 polish 已迁移到 V3
- US-only 5 组件评估通过,符合 Robinhood / Yahoo Finance 等行业规范
