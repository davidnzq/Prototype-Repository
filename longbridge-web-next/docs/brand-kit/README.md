# Brand-kit · 设计语言速查

> 工程内的设计 token snapshot。SSOT 在 `/Users/david/原型港口/Design-System/tokens/tokens.json`(W3C DTCG)。

## 文件

| 文件 | 角色 |
|---|---|
| `tokens.css` | SSOT snapshot · 391 行 · 不要手编辑 |
| `README.md` | 本文件 |

## 同步 SSOT

```bash
# 1. 改 SSOT
vim /Users/david/原型港口/Design-System/tokens/tokens.json

# 2. 重新生成 CSS
cd /Users/david/原型港口/Design-System && node scripts/build-tokens.mjs

# 3. 同步进 next 工程
cp /Users/david/原型港口/Design-System/tokens/tokens.css \
   /Users/david/原型港口/longbridge-web-next/docs/brand-kit/tokens.css
```

## Color 速查(暗主题)

| 用途 | Token | Hex | Tailwind class |
|---|---|---|---|
| 主背景 | `--bg-1` | `#0a0e19` | `bg-bg-1` |
| 二级背景 | `--bg-2` | `#232630` | `bg-bg-2` |
| 卡片填充 | `--card` | `#232630` | `bg-card` |
| 卡片二级 | `--card-2` | `#181b26` | `bg-card-2` |
| 列表斑马 | `--soft` | `#1a1e28` | `bg-soft` |
| 一级文字 | `--fg-1` | `#ffffff` | `text-fg-1` |
| 二级文字 | `--fg-2` | `#9d9fa3` | `text-fg-2` |
| 三级文字 | `--fg-3` | `#60626a` | `text-fg-3` |
| 反白文字 | `--fg-inverse` | `#0a0e19` | `text-fg-inverse` |
| **品牌(青)** | `--accent` | `#00f0c4` | `text-accent` / `bg-accent` / `bg-accent-soft` |
| 涨色(青绿) | `--up` | `#00ada2` | `text-up` / `bg-up` / `bg-up-soft` |
| 跌色(粉红) | `--down` | `#ff3a75` | `text-down` / `bg-down` / `bg-down-soft` |
| 错误 | `--error` | `#f7415f` | `text-error` |
| 警告 | `--warn` | `#ff9728` | `text-warn` / `bg-warn` |
| 安全 | `--safe` | `#00cc92` | `text-safe` |
| 信息 | `--info` | `#2a99fe` | `text-info` |
| 细分隔 | `--hairline` | `#2c3039` | `border-hairline` |
| 强分隔 | `--hairline-strong` | `#3b3e47` | `border-hairline-strong` / `divide-hairline-strong` |

**Chart 8-way**:`chart-blue` / `chart-purple` / `chart-yellow` / `chart-green` / `chart-pink` / `chart-red` / `chart-orange` / `chart-grey`(以语义命名,不要用 `chart-1..8`)。

## Typography

| 角色 | 字号 token | px | 用途 |
|---|---|---|---|
| 大字 | `text-6xl` | 60 | QuoteHero 价格 |
| 大字大 | `text-4xl` | 48 | FHS grade `A+` |
| 大字中 | `text-3xl` | 36 | 标题 |
| 大字小 | `text-2xl` | 24 | section 强标题 |
| 汇总值 | `text-xl` | 18 | KPI |
| 强调标题 | `text-lg` | 14 | section header |
| 段头 | `text-md` | 13 | sub-header |
| 数据/正文 | `text-base` | 12 | 表格、KV |
| Bloomberg 主力 | `text-sm` | 11 | 密集数据(注意:不是 14) |
| Caps label | `text-xs` | 10 | 大写小字 |
| 微小 | `text-2xs` | 9 | 坐标轴 |
| 最小 | `text-3xs` | 8 | K 线日期 |

## Utility class

| Class | 作用 |
|---|---|
| `.num` | 等宽数字(JetBrains Mono + tabular-nums) — 用于价格/百分比/数据 |
| `.caps` | 大写小字 + tracking — 用于 section label |
| `.ticker` | ticker monospace + slight tracking — 用于 `AAPL` `NVDA` 等代码 |
| `.lb-kicker` | brand-青色大写微小字 — 编辑性 kicker(49 处使用) |

## 组件库

`components/longbridge/` 共 26 个 React 组件,详见 [PLAN.md §5](../../PLAN.md) 和 [HANDOFF-v2-components.md](/Users/david/原型港口/个股详情专项/HANDOFF-v2-components.md)。

视觉参考(dev only):[/sandbox/v2-gallery](/sandbox/v2-gallery) 渲染全部 26 个。

## 不要做

- 不要直接编辑 `tokens.css` — 改 SSOT `tokens.json` 然后跑 build
- 不要用旧命名:`text-brand` `border-divider` `text-warning` `.lb-num` `.lb-caps` `--lb-*`(Phase 6 已全删兼容层)
- 不要用 `chart-1..8` 编号 — 用 `chart-blue/green/...` 语义名
- 不要 hardcode 颜色(目前 `text-[#B37500]` 暗琥珀 chip 色在 21 处仍是硬编码,**待加 `--warn-ink` token 到 SSOT 后改造**)
