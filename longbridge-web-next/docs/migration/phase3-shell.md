# Phase 3 — Shell components token sweep

> Agent A · 2026-05-19
> 范围:`components/shell/` 下 6 个 shell 组件 (P3-S04 / S06 / S07 / S08 / S09 / S10)
> 目标:把 Phase 1 兼容层覆盖的旧 token (`text-brand` / `bg-brand-soft` / `border-divider*` / `bg-warning` / `text-warning` / `lb-num` / `lb-caps`) 全部 sweep 到 Phase 2 终态 token。

## Token 映射表(执行顺序 specific → general)

| 优先级 | 旧 | 新 |
|---|---|---|
| 1 | `bg-brand-soft` | `bg-accent-soft` |
| 2 | `text-brand-bright` | `text-accent` |
| 3 | `text-brand-ink` | `text-fg-inverse` |
| 4 | `border-divider-strong` | `border-hairline-strong` |
| 5 | `bg-warning` | `bg-warn` |
| 6 | `text-brand` | `text-accent` |
| 7 | `bg-brand` | `bg-accent` |
| 8 | `border-brand` | `border-accent` |
| 9 | `ring-brand` | `ring-accent` |
| 10 | `text-warning` | `text-warn` |
| 11 | `border-divider` | `border-hairline-strong` |
| 12 | `bg-divider` | `bg-hairline-strong` |
| 13 | `lb-num` | `num` |
| 14 | `lb-caps` | `caps` |

## 各文件执行记录

| File | Plan ID | 改动行 | 残余硬编码 | 备注 |
|---|---|---:|---:|---|
| components/shell/RightChat.tsx | P3-S04 | 20 | 0 | 全部 sweep,无残余 |
| components/shell/AvatarMenu.tsx | P3-S06 | 3 | 0 | 仅 border-divider,sweep 完毕 |
| components/shell/PeekDrawer.tsx | P3-S07 | 73 | 46 (保留) | 见下方残余说明 |
| components/shell/PlaceholderPage.tsx | P3-S08 | 2 | 1 (保留 lb-kicker) | sweep 完毕 |
| components/shell/SearchModal.tsx | P3-S09 | 7 | 0 | 全部 sweep |
| components/shell/WorkStateIndicator.tsx | P3-S10 | 8 | 0 | 全部 sweep |

完成记录:

- ✅ 2026-05-19 components/shell/RightChat.tsx — 改 20 行,残余硬编码 0 (保留 0 个)
- ✅ 2026-05-19 components/shell/AvatarMenu.tsx — 改 3 行,残余硬编码 0 (保留 0 个)
- ✅ 2026-05-19 components/shell/PeekDrawer.tsx — 改 73 行,残余硬编码 46 (保留 46 个,见下)
- ✅ 2026-05-19 components/shell/PlaceholderPage.tsx — 改 2 行,残余硬编码 1 (保留 1 个 `lb-kicker`)
- ✅ 2026-05-19 components/shell/SearchModal.tsx — 改 7 行,残余硬编码 0 (保留 0 个)
- ✅ 2026-05-19 components/shell/WorkStateIndicator.tsx — 改 8 行,残余硬编码 0 (保留 0 个)

## tsc 验证

`npx tsc --noEmit` — 0 error(全部 6 个文件改完后)。

## 残余说明(都属于映射表未覆盖的、走 Phase 1 兼容层继续生效的项)

### 保留 1 · `lb-kicker` (PlaceholderPage / PeekDrawer 多处)
不在本次映射表里。`lb-kicker` 仍在 globals.css 里作为兼容 utility 存在,Phase 6 收尾前不删。

### 保留 2 · `divide-divider` (PeekDrawer L276 / L575)
映射表只列了 `border-divider` / `bg-divider`,未列 `divide-divider`。Tailwind divide-* 走 `--color-divider`,Phase 1 不需要 alias 兜底(`--color-divider` 在 tokens.css 直接定义)。等 Phase 4/5 在更广 sweep 时一并处理。

### 保留 3 · `border-warning` / `border-l-warning` (PeekDrawer L308 / L552 / L846 / L932)
映射表只覆盖 `bg-warning` 和 `text-warning`,`border-warning` 未列。`--color-warning` Phase 1 alias 仍有效。**建议:** 下一轮 sweep 在映射表加入 `border-warning → border-warn`。

### 保留 4 · `border-l-up` / `border-l-down` / `border-down` / `border-up` / `border-l-fg-3` (PeekDrawer L660 / L844 / L928 / L930 / L933)
映射表未覆盖任何 `*-up` / `*-down` / `*-fg-3` 边框工具类。这些走 `--color-up` / `--color-down` / `--color-fg-3`,在 tokens.css 直接定义,不依赖 Phase 1 兼容层。保留即可。

### 保留 5 · `text-[#B37500]` (PeekDrawer 5 处)
硬编码的 amber tint(用于 warn "中等" 标签的文字),不在 token 系。**疑问** ❓:是否应改为 `text-warn`?颜色含义一致(warning 文字色),但当前硬编码值偏暗。**建议:** 下一轮 sweep 时由设计确认是否替换为 `text-warn` 或保留作为 amber-dark。

### 保留 6 · `bg-warn/15`, `bg-warn/10`, `bg-warn/5` (PeekDrawer 多处)
这些已经是新 token (`bg-warn`) + opacity modifier,本身就是终态写法,无需再改。

## 疑问 / TODO 给下一轮

1. **❓ `text-[#B37500]`** — PeekDrawer 里 5 处硬编码 amber-dark。是替换为 `text-warn` 还是保留?需要设计 / 设计 token confirm。
2. **❓ `divide-divider`** — 是否要列入未来的 sweep 映射(类比 `border-divider → border-hairline-strong`,可能要变成 `divide-hairline-strong`)?
3. **❓ `border-warning` / `border-l-warning`** — 强烈建议下一轮映射加入 `border-warning → border-warn`,把 warning 系扫干净。
4. **❓ `lb-kicker`** — 何时下线? 该 class 还在 globals.css 定义,正常使用,但和 `lb-num` / `lb-caps` 是同一波 legacy utility。考虑 Phase 6 一起拆除。
