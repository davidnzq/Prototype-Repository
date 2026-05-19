/* Phase 5 · 首页"持仓/自选今日异动"EventTracker mock
 * 引用 stockDetail-lb.ts 的 TrackedEvent schema */

import type { TrackedEvent } from "./stockDetail-lb";

export const mockPortfolioTodayEvents: TrackedEvent[] = [
  {
    month: "5月",
    day: "19",
    title: "NVDA 突破 950 关键阻力,收 962.31",
    time: "16:00",
    impact: "high",
    priceChange: 2.31,
  },
  {
    month: "5月",
    day: "19",
    title: "AAPL WWDC 前防御性回调,关注 6/10 主旨演讲",
    time: "14:30",
    impact: "low",
    priceChange: -0.62,
  },
  {
    month: "5月",
    day: "19",
    title: "MSFT Azure Q4 数据更新,云业务增速 30% YoY",
    time: "13:15",
    impact: "medium",
    priceChange: 0.84,
  },
  {
    month: "5月",
    day: "19",
    title: "TSM 台湾政府解禁 N3 出口,客户名单扩展",
    time: "10:20",
    impact: "high",
    priceChange: 1.45,
  },
  {
    month: "5月",
    day: "19",
    title: "AMD MI300X 第二轨产能更新,2025 全年指引上调",
    time: "09:45",
    impact: "medium",
    priceChange: 0.93,
  },
  {
    month: "5月",
    day: "19",
    title: "GOOG 法律费用 7.5 亿元拨备(欧盟反垄断尾声)",
    time: "08:30",
    impact: "low",
    priceChange: -0.18,
  },
];
