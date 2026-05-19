import type { Review } from "@/types/domain";

// Historical Review — 演示归因四维 + 行为模式识别
export const MOCK_REVIEWS: Review[] = [
  {
    id: "review-msft-2026q1",
    planId: "plan-msft-past-2026q1",
    signalId: "sig-msft-past-2026q1",
    symbol: "MSFT.US",
    closedAt: "2026-02-28T16:00:00Z",
    summary: {
      direction: "BUY · 建仓并持有",
      targetWeight: 0.1,
      window: "48h",
    },
    execution: {
      filledPct: 60, // 只完成了 6/10 的仓位
      avgPriceDeviation: -0.3, // 成交均价略好于限价
      unexecutedReason: "第二批条件单未触发,回撤窗口未出现,窗口到期",
    },
    performance: {
      realizedPnl: 1240,
      realizedPnlPct: 2.3,
      maxDrawdown: -1.8,
      benchmarkReturn: 4.1, // MSFT 窗口期 +4.1%
    },
    attribution: {
      strategyChoice: "correct",
      takeProfit: "early", // 在目标位的 30% 处就离场
      stopLoss: "not_triggered",
      marketEnvironment: "Azure 增速超预期 · 宏观利率下行,窗口期整体顺风",
      notes:
        "策略判断方向正确(MSFT 窗口期 +4.1%),但目标仓位未建满(仅 6/10)。未建满的主因是条件单等待回撤,而回撤窗口未出现 —— 这是典型的『等不到完美入场,错失主升』模式。",
    },
    behaviorPatterns: [
      "首批建仓后倾向等待回撤,但上升趋势中回撤出现概率 <40%",
      "止盈平均在目标位的 50-60% 处触发,倾向提前锁定利润",
    ],
    userOverrides: [
      { field: "ord-msft-2.triggerCondition", at: "2026-02-27T14:30:00Z" }, // 手动把第二批条件收紧
    ],
    improvements: [
      "考虑首批直接建仓 8% 而非 6%,减少对回撤入场的依赖",
      "将止盈目标从 Evaluation.Optimistic 上调至 +125%,避免过早锁定",
      "若 72h 内条件单未触发,自动转为市价补仓,而不是放弃第二批",
    ],
  },
  {
    id: "review-tsla-2026q1",
    planId: "plan-tsla-past-2026q1",
    signalId: "sig-tsla-past-2026q1",
    symbol: "TSLA.US",
    closedAt: "2026-03-14T16:00:00Z",
    summary: {
      direction: "BUY → SELL · 快进快出",
      targetWeight: 0.02,
      window: "2 周",
    },
    execution: {
      filledPct: 100,
      avgPriceDeviation: 0.4,
    },
    performance: {
      realizedPnl: 248,
      realizedPnlPct: 4.1,
      maxDrawdown: -1.2,
      benchmarkReturn: 2.1,
    },
    attribution: {
      strategyChoice: "correct",
      takeProfit: "on_target",
      stopLoss: "not_triggered",
      marketEnvironment: "震荡偏强,科技板块领涨",
      notes:
        "Simons 量化信号成立,快进快出 2 周净赚 4.1%。跑赢同期 SPX(+2.1%)近 2 个百分点。执行纪律到位。",
    },
    behaviorPatterns: ["技术信号下执行纪律好", "快进快出符合画像 Pioneer 风格"],
    userOverrides: [],
    improvements: ["策略一致性高,保持当前节奏"],
  },
  {
    id: "review-coin-2026q2",
    planId: "plan-coin-past-2026q2",
    signalId: "sig-coin-past-2026q2",
    symbol: "COIN.US",
    closedAt: "2026-04-03T16:00:00Z",
    summary: {
      direction: "BUY · 加密溢出",
      targetWeight: 0.015,
      window: "1 周",
    },
    execution: {
      filledPct: 100,
      avgPriceDeviation: 1.2,
      unexecutedReason: "跳空开盘 · 成交价高于限价 1.2%",
    },
    performance: {
      realizedPnl: -184,
      realizedPnlPct: -3.8,
      maxDrawdown: -8.4,
      benchmarkReturn: 0.3,
    },
    attribution: {
      strategyChoice: "partial",
      takeProfit: "n/a",
      stopLoss: "missed",
      marketEnvironment: "BTC 单日闪崩 -12%,COIN beta 放大 → -24%",
      notes:
        "策略本身没错(BTC 强势期 COIN 跟涨逻辑成立),但单日闪崩时止损单未及时触发 · 跳空开盘绕过了预设止损价,实际亏损超出设计。",
    },
    behaviorPatterns: ["高 beta 品种的尾部风险被低估", "止损执行差"],
    userOverrides: [
      { field: "stop_loss.disabled", at: "2026-04-01T14:20:00Z" },
    ],
    improvements: [
      "高 beta 品种改为 3% 硬止损 + 保护性看跌期权",
      "跳空开盘场景加入专项保护:gap-down > 5% 自动触发市价平仓",
      "COIN 这类品种单票仓位从 1.5% 降到 1%",
    ],
  },
];

export function getReviewById(id: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.id === id);
}

export function getReviewsBySymbol(symbol: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.symbol === symbol);
}

export function getRecentReviews(limit = 10): Review[] {
  return [...MOCK_REVIEWS]
    .sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .slice(0, limit);
}
