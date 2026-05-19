<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 设计语言 SSOT

- **Token SSOT**:`/Users/david/原型港口/Design-System/tokens/tokens.json`(W3C DTCG)。改 token 走 `cd Design-System && node scripts/build-tokens.mjs` 生成 `tokens.css` + `tokens.ts`,再 `cp ../Design-System/tokens/tokens.css docs/brand-kit/tokens.css` 同步进本工程。
- **组件库**:`components/longbridge/` 共 26 个 v2 组件(QuoteHero / IntradayChart / FinancialTable / AIAnalysis / ...)。统一加了 `"use client"` 头。
- **Mock 数据**:`mock/stockDetail-lb.ts`(AAPL 基线,1606 行)+ `mock/aaplKline.ts` + `mock/aiAnalysis-marketToday.ts`(今日大盘)+ `mock/portfolioEvents.ts`(持仓异动)。
- **品牌色**:`#00f0c4` 长桥青(`var(--accent)`)。涨绿 `--up` / 跌粉 `--down`。
- **常用 utility**:`.num` 等宽数字 / `.caps` 大写标签 / `.ticker` ticker 字体 / `.lb-kicker` 强调小字(brand 色)。
- **视觉参考**:`/sandbox/v2-gallery` 渲染全部 26 组件(noindex,dev 用)。

完整迁移历史见 [PLAN.md](PLAN.md) 和 [docs/migration/](docs/migration/)。
