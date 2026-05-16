# Stock Detail v2 · 重构原型

个股详情页的 React 重写版本,与现有 HTML 原型(`stock-detail-optimized.html` / `stock-detail-page.html`)同源,严格按 `plan.md` 逐组件推进。

## 设计语言

- **基调**:浅色、克制、信息密集型金融 UI
- **主色**:长桥青 `#056658`
- **涨**:`#047A4D` / **跌**:`#C53E36`(文字安全色)
- **字体**:Inter + JetBrains Mono(等宽数字 `tabular-nums`)

完整 token 定义见 `src/index.css`。

## 技术栈

| 维度 | 选型 |
|------|------|
| 框架 | React 19 |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 4(`@theme inline` 接 token) |
| 图标 | lucide-react |
| 工具 | clsx + tailwind-merge → `cn()` |
| 类型 | TypeScript 5(strict) |

不使用 shadcn/ui — 这是单页原型,卡片/按钮直接 Tailwind class 写。

## 跑起来

```bash
cd /Users/david/原型港口/个股详情专项/stock-detail-v2
npm install
npm run dev
# 浏览器自动打开 http://localhost:5273
```

## 类型检查

```bash
npm run typecheck   # 等价于 tsc --noEmit
```

## 目录结构

```
stock-detail-v2/
  index.html                ← Vite 入口 + Google Fonts
  src/
    main.tsx                ← React 挂载点
    App.tsx                 ← 页面容器,按 plan.md 顺序堆叠组件
    index.css               ← Tailwind + 完整 design token
    components/
      QuoteHero.tsx         ← 任务 1
      IntradayChart.tsx     ← 任务 2
      TagStrip.tsx          ← 任务 3
      …(后续 13 个原子)
    mock/
      stockDetail.ts        ← AAPL.US 基线 mock,按需扩展
    lib/
      utils.ts              ← cn() + formatNum/Pct/Delta
```

## 进度

见 `../plan.md`。当前完成:

- [x] 任务 0:脚手架(Vite + React 19 + Tailwind 4 + TS strict)
- [x] 任务 1:`QuoteHero` 报价头部
- [x] 任务 2:`IntradayChart` 实时分时图(60 候选 + MA5/MA20 + 成交量)
- [x] 任务 3:`TagStrip` 标签区(3 类目 × 涨跌 inline)
- [ ] 任务 4-16:其余 13 个阶段一原子
- [ ] 阶段二:5 Tab 结构 + 12 个新原子
