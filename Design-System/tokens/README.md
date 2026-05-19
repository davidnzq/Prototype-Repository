# Longbridge US 设计语言 · Design Tokens

**Single Source of Truth** —— `tokens.json` 是行业标准 W3C DTCG 格式的权威来源，所有原型共享一份 token，跟 Figma / Tokens Studio 等设计工具**双向无缝**对接。

---

## ⚠️ Token 来源现状

**颜色**：1:1 对齐 Figma `颜色·资源库 Colors.pdf`（深色版）✅

**其他维度**（字号 / 间距 / 圆角 / 字距 / 行高 / 阴影 / 动效 / opacity / z-index / 边框 / 组件 / 断点 / 图标）：基于 `stock-detail-v2` Bloomberg 风格归纳 + 参照 Bloomberg Terminal 行业规范。

**待补完**：
- [ ] Figma 字体/间距/圆角 frame 定稿后回填
- [ ] 浅色版颜色 token
- [ ] 状态色完整命名（warn/safe/info 临时占位）

Figma 规范出来后**优先于当前 token**。

---

## 文件结构

```
Design-System/
├── 颜色·资源库 Colors.pdf
├── tokens/
│   ├── tokens.json     ⭐ SSOT (W3C DTCG 格式,手维护)
│   ├── tokens.css      🤖 自动生成 — 不要手编辑
│   ├── tokens.ts       🤖 自动生成 — 不要手编辑
│   └── README.md       ← 本文件
└── scripts/
    └── build-tokens.mjs   ← 读 tokens.json,生成 css + ts
```

| 文件 | 角色 | 谁会改 |
|------|------|--------|
| **`tokens.json`** | ⭐ W3C DTCG SSOT | 设计师 / 前端 / Figma 插件 |
| `tokens.css` | Tailwind / 纯 CSS 消费 | 脚本生成 |
| `tokens.ts` | TypeScript 类型安全引用 | 脚本生成 |

**为什么 `tokens.json` 是 SSOT 而非自定义格式？**
- W3C DTCG 是设计 token **唯一在走标准化**的格式
- Figma / Tokens Studio / Style Dictionary 都对齐这个格式
- 设计工具能直接读写 `tokens.json`,不需要中间转换层
- 删掉了之前的 `source.tokens.json`(自定义格式),消除冗余维护点

---

## 怎么改 token

```bash
# 1. 改 SSOT(W3C DTCG)
vim Design-System/tokens/tokens.json

# 2. 重新生成 CSS / TS
cd Design-System && node scripts/build-tokens.mjs

# 3. HMR 自动 propagate 到所有 @import 的项目
```

**不要直接改 `tokens.css` / `tokens.ts`** —— 文件顶部已标 AUTO-GENERATED,下次 build 会被覆盖。

---

## W3C DTCG 格式速记

每个 token 至少有 `$type` + `$value`，可选 `$description`：

```jsonc
{
  "color": {
    "$description": "颜色 group",
    "bg-1": {
      "$type": "color",
      "$value": "#0a0e19",
      "$description": "一级背景色"
    },
    "accent": {
      "$type": "color",
      "$value": "{color.brand-1}",    // ← alias 引用
      "$description": "brand-1 别名"
    }
  },
  "fs": {
    "base": {
      "$type": "dimension",
      "$value": "0.75rem",
      "$description": "12px — 数据值"
    }
  }
}
```

支持的 `$type`：`color` / `dimension` / `fontFamily` / `fontWeight` / `number` / `duration` / `cubicBezier` / `shadow`

支持的 alias 引用语法：`{group.tokenName}` — build 时自动解析。

---

## 怎么用

### A. Tailwind 4 项目（推荐）

```css
@import "tailwindcss";
@import "/path/to/Design-System/tokens/tokens.css";
```

```tsx
<div className="bg-bg-1 text-fg-1 p-4 rounded-sm shadow-raised">
  <span className="text-display text-brand-1 leading-none tracking-tightest">287.440</span>
  <span className="text-data text-up tracking-tight">+1.24%</span>
</div>
```

### B. 纯 CSS

```css
.kv-row {
  background: var(--card);
  color: var(--fg-1);
  border: var(--bw-1) solid var(--stroke);
  padding: var(--sp-1-5) var(--sp-card-x);
  font-size: var(--fs-base);
  line-height: var(--lh-dense);
  transition: background var(--dur-fast) var(--ease-out);
}
```

### C. React / TypeScript

```tsx
import { color, fs, sp, r, dur, ease, z, component, icon } from "/path/to/Design-System/tokens/tokens";

const styles = {
  background: color["bg-1"],
  height: component["button-height-md"],
  fontSize: fs.base,
  zIndex: z.dropdown,
};

<Icon size={icon.md} />
```

### D. Figma / Tokens Studio

直接读 `tokens.json` —— W3C DTCG 标准格式，插件原生支持。

---

## Token 速查表（14 大类 + 4 新增）

### 1-5. 颜色 / 字号 / 字重 / 行高 / 字距

参见前一版 README（结构未变，仅 SSOT 文件格式从自定义改为 W3C DTCG）。

### 6. 间距（14 基础 + 6 语义）

`--sp-0 ~ --sp-16` 14 档 + `card-x / card-y / section / row / inline / stack` 语义。

### 7. 圆角（8 档）— Bloomberg 主用 `--r-sm` (4px)

### 8. 边框宽度（5 档）— `--bw-0/1/2/3/4`

### 9. 阴影（9 档）— `flat / raised / popover / modal / focus-ring / inset-pressed / glow-up / glow-down`

### 10. 透明度（7 档）— `transparent / hover-bg / overlay-bg / disabled / muted / emphasis / full`

### 11. 动效（7 时长 × 7 缓动）

### 12. Z-Index（10 档）— `base / sticky / dropdown / overlay / fab / modal / popover / tooltip / toast / debug`

### 13. ⭐ NEW · 组件尺寸 (`--cmp-*`)

| Token | 值 | 用途 |
|-------|-----|------|
| `--cmp-button-height-sm/md/lg` | 24/32/40 px | 按钮高度 3 档 |
| `--cmp-button-px-sm/md/lg` | 8/12/16 px | 按钮水平 padding |
| `--cmp-input-height` | 32 px | 输入框 |
| `--cmp-input-px` | 12 px | |
| `--cmp-card-px / -py` | 16 / 12 px | 卡片 padding |
| `--cmp-table-row-height` | 32 px | 默认 row |
| `--cmp-table-row-height-dense` | **24 px** | Bloomberg 密集 row |
| `--cmp-table-header-height` | 28 px | table header |
| `--cmp-topbar-height` | 32 px | 顶部命令栏 |
| `--cmp-footer-bar-height` | 32 px | 底部 function bar |
| `--cmp-tab-height` | 40 px | Tab Bar |
| `--cmp-checkbox-size` | 16 px | |
| `--cmp-radio-size` | 16 px | |
| `--cmp-switch-width / -height` | 32 / 18 px | |
| `--cmp-avatar-sm/md/lg` | 20 / 32 / 48 px | 头像 3 档 |

### 14. ⭐ NEW · 响应式断点 (`--bp-*`)

| Token | 值 | Tailwind 对应 |
|-------|-----|--------------|
| `--bp-sm` | 640 px | `sm:` |
| `--bp-md` | 768 px | `md:` |
| `--bp-lg` | 1024 px | `lg:` |
| `--bp-xl` | 1280 px | `xl:` |
| `--bp-2xl` | 1536 px | `2xl:` |

### 15. ⭐ NEW · 容器最大宽度 (`--ctn-*`)

| Token | 值 | 用途 |
|-------|-----|------|
| `--ctn-max` | 1280 px | 标准容器(stock-detail-v2 主区) |
| `--ctn-max-wide` | 1480 px | 宽容器(ComponentGallery) |
| `--ctn-max-narrow` | 920 px | 窄容器(阅读体) |

### 16. ⭐ NEW · 图标尺寸 (`--icon-*`)

| Token | 值 | 用途 |
|-------|-----|------|
| `--icon-2xs` | 10 px | inline 微图标 |
| `--icon-xs` | 12 px | button inline icon |
| `--icon-sm` | **14 px** | Bloomberg 主力 |
| `--icon-md` | 16 px | 默认 menu icon |
| `--icon-lg` | 20 px | navigation |
| `--icon-xl` | 24 px | 页面级 |
| `--icon-2xl` | 32 px | empty-state |

---

## Bloomberg 风实践示例

### 标准报价头部

```tsx
<header
  className="flex items-center justify-between bg-bg-2 border-b border-line px-4"
  style={{ height: 'var(--cmp-topbar-height)' }}
>
  <span className="text-sm text-accent font-bold tracking-wide">LB DETAIL</span>
  <button
    className="rounded-sm text-data text-fg-2 hover:bg-soft transition-colors duration-[var(--dur-fast)] ease-out"
    style={{
      height: 'var(--cmp-button-height-sm)',
      paddingInline: 'var(--cmp-button-px-sm)',
    }}
  >
    Search
  </button>
</header>
```

### 密集数据 table

```tsx
<table className="w-full">
  <thead>
    <tr style={{ height: 'var(--cmp-table-header-height)' }}>
      <th className="text-caps text-fg-3 tracking-wider">Ticker</th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => (
      <tr
        key={row.ticker}
        className="border-b border-hairline hover:bg-soft"
        style={{ height: 'var(--cmp-table-row-height-dense)', lineHeight: 'var(--lh-dense)' }}
      >
        <td className="text-data text-fg-1 num tracking-tight">{row.ticker}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### 响应式断点

```tsx
{/* Tailwind 默认 sm/md/lg/xl/2xl 已经对齐 SSOT */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">...</div>

{/* 或用 CSS 自定义 media query */}
<style>{`
  @media (min-width: var(--bp-lg)) {
    .container { max-width: var(--ctn-max); }
  }
`}</style>
```

### Icon 尺寸

```tsx
<Heart size={parseInt(icon.md)} strokeWidth={1.8} />
{/* 或 */}
<svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)' }} />
```

---

## 维护规则

1. **`tokens.json` 是唯一 SSOT** — 所有改动改这里
2. **改完跑 `node scripts/build-tokens.mjs`** — 生成 `tokens.css` + `tokens.ts`
3. **不要手编辑 `tokens.css` / `tokens.ts`** — 顶部标 AUTO-GENERATED
4. **alias 引用语法**:用 `"{group.name}"` (例: `{color.brand-1}`),build 时解析为 CSS `var(--brand-1)`
5. **每个 token 必须有 `$type` + `$value`** — 否则 build 会 warning 但仍生成

---

## 已应用项目

- `个股详情专项/stock-detail-v2/`(v1.0,2026-05-15)— Bloomberg 风 + 长桥品牌色

新增项目应在此追加。

---

## 命名规则

- **JSON**(SSOT): W3C DTCG 嵌套 + `$type`/`$value` 前缀
- **CSS**: kebab-case,前缀按 group:`--bg-1` / `--fs-base` / `--cmp-button-height-md` / `--icon-sm`
- **TS**: 跟 JSON 结构一致,key 用 `bracket["kebab"]` 或 camelCase:`color["bg-1"]` / `fs.base` / `component["button-height-md"]`
