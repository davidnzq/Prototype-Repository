# Phase 3 · Agent E · Routes 3 + 入口文件 Token Sweep

执行人:Phase 3 Agent E
执行日期:2026-05-19
工程:`/Users/david/原型港口/longbridge-web-next/`
范围:路由组 3(strategy / subagents / thesis / watchlist)+ 入口文件(`app/(app)/layout.tsx`、`app/(app)/page.tsx`)+ 个股 placeholder(`stock/[symbol]/page.tsx`)

## Token 映射(按 specific → general 顺序)

| 优先级 | 旧 | 新 |
|---|---|---|
| 1 | `bg-brand-soft` | `bg-accent-soft` |
| 2 | `text-brand-bright` | `text-accent` |
| 3 | `text-brand-ink` | `text-fg-inverse` |
| 4 | `border-divider-strong` | `border-hairline-strong` |
| 5 | `bg-warning` | `bg-warn` |
| 6 | `text-brand`(含 hover) | `text-accent` |
| 7 | `bg-brand` | `bg-accent` |
| 8 | `border-brand`(含 hover) | `border-accent` |
| 9 | `ring-brand` | `ring-accent` |
| 10 | `text-warning` | `text-warn` |
| 11 | `border-divider` | `border-hairline-strong` |
| 12 | `bg-divider` | `bg-hairline-strong` |
| 13 | `lb-num` (class) | `num` |
| 14 | `lb-caps` (class) | `caps` |
| 15 | `var(--lb-*)` inline | 去掉 `lb-` 前缀(如 `var(--lb-up)` → `var(--up)`) |

## 文件清单 & 校验

✅ 2026-05-19 `app/(app)/layout.tsx` — 改 0 行,残余 0(原本即无 legacy token,跳过)
✅ 2026-05-19 `app/(app)/page.tsx` — 改 47 行,残余 0(保留:`divide-divider` × 3、`lb-kicker` × 0、`bg-info/text-info`、`text-up/text-down/bg-up/bg-down` 全部 keep)
✅ 2026-05-19 `app/(app)/stock/[symbol]/page.tsx` — 改 6 行,残余 0(占位页,Phase 4/5 将整页重写)
✅ 2026-05-19 `app/(app)/strategy/page.tsx` — 改 15 行,残余 0(保留:`divide-divider` 暂未触发、`text-up-dark`)
✅ 2026-05-19 `app/(app)/strategy/[id]/page.tsx` — 改 26 行,残余 0(保留:`divide-y divide-divider` × 1 — 不在 mapping)
✅ 2026-05-19 `app/(app)/strategy/builder/page.tsx` — 改 15 行,残余 0(保留:`fill-brand` × 1 — 不在 mapping,通过 `@theme inline { --color-brand: var(--accent) }` 兜底)
✅ 2026-05-19 `app/(app)/strategy/mine/page.tsx` — 改 23 行,残余 0(保留:`bg-up-soft text-up-dark` 等 up/down 系列)
✅ 2026-05-19 `app/(app)/subagents/page.tsx` — 改 9 行,残余 0(保留:`lb-kicker` × 1)
✅ 2026-05-19 `app/(app)/thesis/page.tsx` — 改 9 行,残余 0(保留:`lb-kicker` × 3、`bg-up-soft text-up-dark`、`bg-down-soft text-down-dark`)
✅ 2026-05-19 `app/(app)/thesis/[id]/page.tsx` — 改 23 行,残余 0(保留:`lb-kicker` × 6、`bg-up-soft text-up-dark`、`bg-down-soft text-down-dark`、`bg-bg-3`)
✅ 2026-05-19 `app/(app)/thesis/[id]/ThesisResearchActions.tsx` — 改 21 行,残余 0(保留:`lb-kicker` × 1、`text-up-dark`、`text-down-dark`、`bg-up-soft`)
✅ 2026-05-19 `app/(app)/watchlist/page.tsx` — 改 5 行,残余 0(保留:`divide-y divide-divider` — 不在 mapping)

**汇总:11 文件改动,共 199 处替换,layout.tsx 无需改动;`npx tsc --noEmit` 零错误。**

## 保留说明(类「不在 mapping 范围,但仍可生效」)

1. **`lb-kicker`**:`.lb-kicker` 是 `app/globals.css` 中显式定义的项目级 utility(非 Tailwind brand-token 别名),不在迁移表里,后续若统一改名再说。
2. **`fill-brand`**:Tailwind 自动生成的 `fill-*` 工具,通过 `@theme inline { --color-brand: var(--accent) }` 兼容层映射至 accent;mapping 未列入 → 不动。
3. **`divide-divider` / `divide-y divide-divider`**:Tailwind `divide-*` 工具,通过同样的兼容层兜底;mapping 未列入 → 不动。
4. **`bg-up / bg-down / text-up / text-down / bg-up-soft / text-up-dark / text-down-dark`**:涨跌色语义 token,Phase 3 任务不动。
5. **`bg-info / text-info / bg-info/15` 等**:info 语义 token,Phase 3 任务不动。
6. **`bg-bg-3 / bg-bg-2 / bg-bg-1 / text-fg-1/2/3`**:基础 surface / text token,Phase 3 任务不动。

## 验证步骤

```bash
# 残余 token 扫描(应为空)
grep -nE 'text-brand|bg-brand|border-brand|ring-brand|border-divider|bg-divider|text-warning|bg-warning|lb-num|lb-caps|--lb-' \
  app/\(app\)/layout.tsx \
  app/\(app\)/page.tsx \
  app/\(app\)/stock/\[symbol\]/page.tsx \
  app/\(app\)/strategy/page.tsx \
  app/\(app\)/strategy/\[id\]/page.tsx \
  app/\(app\)/strategy/builder/page.tsx \
  app/\(app\)/strategy/mine/page.tsx \
  app/\(app\)/subagents/page.tsx \
  app/\(app\)/thesis/page.tsx \
  app/\(app\)/thesis/\[id\]/page.tsx \
  app/\(app\)/thesis/\[id\]/ThesisResearchActions.tsx \
  app/\(app\)/watchlist/page.tsx

# tsc
npx tsc --noEmit
```

两条命令均无输出 / exit 0。

## 后续提示

- `app/(app)/page.tsx` (R02 首页) 和 `app/(app)/stock/[symbol]/page.tsx` (R21 个股详情) 仍是占位 / Stage A 形态,**Phase 4 / 5 会整页重写**。本 Sweep 仅迁移已有 legacy class,不引入新结构。
- `app/(app)/strategy/builder/page.tsx` 中 `fill-brand` 暂依赖 `@theme inline` 兼容层。Phase 6 删兼容层前需要把它一并改为 `fill-accent` 或换实现,届时另启 sweep。
