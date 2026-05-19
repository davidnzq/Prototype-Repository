/* Phase 5 · 首页"今日大盘"AIAnalysis mock
 * 引用 stockDetail-lb.ts 的 AIAnalysisData schema */

import type { AIAnalysisData } from "./stockDetail-lb";

export const mockMarketTodayAIAnalysis: AIAnalysisData = {
  generatedAt: "5/19 16:32 ET",
  signals: [
    { label: "S&P 500", value: "5,234.18 +0.42%", trend: "up" },
    { label: "Nasdaq", value: "16,742.39 +0.58%", trend: "up" },
    { label: "VIX", value: "13.86 −2.3%", trend: "down" },
    { label: "10Y Yield", value: "4.42% +2bp", trend: "up" },
  ],
  entryDate: "5月19日",
  entryLocale: "New York 时间 16:32",
  priceSnapshot: {
    price: 5234.18,
    changePct: 0.0042,
    sessionLabel: "收盘",
  },
  narrative:
    "今日美股小幅收涨,科技板块继续领跑,半导体指数 SOX +1.18% 创年内新高。市场延续上周 NVDA 财报后的乐观情绪,关注本周三 Fed 会议纪要与周五 PCE 数据 —— 这是判断 6 月降息概率的关键窗口。\n\n持仓与自选今日呈现分化:NVDA +2.31%(关键支撑位站稳),AAPL -0.62%(WWDC 前防御性回调),MSFT +0.84%(Azure 主导增长),TSM +1.45%(地缘缓和)。建议盘后关注:(1) 半导体 ETF SOXL 是否站稳 50 日线,(2) FCF 健康度排名前 5 标的的 entry,(3) 高 beta 标的的 stop 调整。",
  sources: [
    { label: "B", color: "var(--chart-blue)" },
    { label: "R", color: "var(--chart-purple)" },
    { label: "F", color: "var(--up)" },
    { label: "M", color: "var(--chart-orange)" },
  ],
  fullAnalysisHint: "查看完整今日大盘分析",
};
