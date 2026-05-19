import type { TradePlan } from "@/types/domain";

const T = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600_000).toISOString();

export const MOCK_TRADE_PLANS: TradePlan[] = [
  // ─── MSFT(承接 Wood Signal) ────────────────────────────────────────
  {
    id: "plan-msft-wood",
    signalId: "sig-msft-wood",
    strategyId: "strat-wood-innovation",
    symbol: "MSFT.US",
    status: "DRAFT",
    createdAt: T(2),
    targetPlan: {
      action: "BUY",
      targetWeight: 0.1,
      currentWeight: 0.04,
      riskBoundary: "回撤达 -5% 时重新评估,-8% 止损",
      invalidation: "Azure 增速若回落至 20% 以下或 AI capex 指引明显下修",
      window: "48 hours",
      phases: [
        { weight: 0.06, condition: "现价附近建仓至 6% 仓位" },
        { weight: 0.04, condition: "回撤 2-3% 或放量确认后补至 10%" },
      ],
    },
    executionPlan: {
      entryApproach: "single_or_gradual",
      orders: [
        {
          id: "ord-msft-1",
          side: "BUY",
          qty: 45,
          orderType: "LIMIT",
          price: 422.5,
          validity: "Day",
          note: "首批 6% 仓位 · 限价略低于现价",
        },
        {
          id: "ord-msft-2",
          side: "BUY",
          qty: 30,
          orderType: "CONDITIONAL",
          triggerCondition: "MSFT 回撤至 $410 以下 或 放量新高 +1% 后 30 分钟",
          validity: "48h",
          note: "第二批 · 条件触发补至 10% 仓位",
        },
        {
          id: "ord-msft-stop",
          side: "SELL",
          qty: 75,
          orderType: "STOP",
          triggerCondition: "价格跌破 $391(-7.5%) 时触发 · 基本面止损触发后另行决定",
          validity: "48h",
          note: "保护止损单",
        },
      ],
      checkpoints: [
        "首批成交 30 分钟后检查成交均价 vs 限价偏差",
        "若 48h 内第二批未触发,检查条件是否需调整",
        "每日盘前对照 Azure 数据是否有新披露",
      ],
    },
  },

  // ─── NVDA(承接 Soros Signal · 已执行首批,等 CPI 验证补仓) ───────
  {
    id: "plan-nvda-soros",
    signalId: "sig-nvda-soros",
    strategyId: "strat-soros-reflexivity",
    symbol: "NVDA.US",
    status: "ACTIVE",
    createdAt: T(6),
    confirmedAt: T(5).toString(),
    targetPlan: {
      action: "BUY",
      targetWeight: 0.15,
      currentWeight: 0.1, // 首批 10% 已建仓,等验证后补至 15%
      riskBoundary: "逻辑证伪(VIX 回升 > 20 或 RSI 破 60 向下)立即清仓,不等待",
      invalidation: "反身性循环中断信号:VIX 单日跳升 > 3,或 20 日涨幅回落 < 20%",
      window: "动态(策略内建机制)",
      phases: [
        { weight: 0.1, condition: "首批试探 10% 仓位 · 已完成" },
        { weight: 0.05, condition: "CPI 验证 + 3 日站稳后补至 15%" },
      ],
    },
    executionPlan: {
      entryApproach: "gradual_ladder",
      orders: [
        {
          id: "ord-nvda-1",
          side: "BUY",
          qty: 25,
          orderType: "MARKET",
          validity: "Day",
          note: "首批试探 10% · 市价快速入场",
        },
        {
          id: "ord-nvda-2",
          side: "BUY",
          qty: 12,
          orderType: "CONDITIONAL",
          triggerCondition: "3 日后价格仍在 $930 以上且 VIX 仍 < 13",
          validity: "1 week",
          note: "验证后补仓至 15%",
        },
        {
          id: "ord-nvda-invalidate",
          side: "SELL",
          qty: 37,
          orderType: "CONDITIONAL",
          triggerCondition: "VIX 跳升 > 20 或 20D 累计涨幅回落 < 20% 时立即平仓",
          validity: "2 weeks",
          note: "逻辑证伪 → 清仓(Soros: 勇于认错)",
        },
      ],
      checkpoints: [
        "每 4 小时检查 VIX 走势",
        "RSI 跌破 60 向下时立即复核持仓",
        "若连续 2 日未创新高,减仓一半",
      ],
    },
  },

  // ─── TSLA(承接 Simons Signal) ────────────────────────────────────
  {
    id: "plan-tsla-simons",
    signalId: "sig-tsla-simons",
    strategyId: "strat-simons-quant",
    symbol: "TSLA.US",
    status: "DRAFT",
    createdAt: T(0.5),
    targetPlan: {
      action: "BUY",
      targetWeight: 0.018,
      currentWeight: 0,
      riskBoundary: "技术信号衰减(RSI 跌破 60 / MACD 死叉)立即平仓",
      invalidation: "多因子共振破坏(CheckList 10 项中跌至 < 5 项 Pass)",
      window: "短线数日至数周",
      phases: [{ weight: 0.018, condition: "一次性入场(量化策略依赖样本数)" }],
    },
    executionPlan: {
      entryApproach: "single_or_gradual",
      orders: [
        {
          id: "ord-tsla-1",
          side: "BUY",
          qty: 9,
          orderType: "LIMIT",
          price: 400,
          validity: "Day",
          note: "单笔 1.8% 仓位 · 符合量化纪律(<2% 上限)",
        },
        {
          id: "ord-tsla-stop",
          side: "SELL",
          qty: 9,
          orderType: "STOP",
          triggerCondition: "RSI(14) 跌破 60 · 或 MACD 死叉",
          validity: "1 week",
          note: "技术反转止损",
        },
      ],
      checkpoints: [
        "日终检查 CheckList Pass 项数,跌破 7/10 时减半",
        "MA20 跌破时立即复核",
      ],
    },
  },
];

// 额外 mock · 为 Plan 行动中心 IA 4.3 的 5 状态 tab 凑全
MOCK_TRADE_PLANS.push(
  // PendingHITL · Thesis 生成 · 等最终确认
  {
    id: "plan-nvda-ai-ladder",
    signalId: "sig-nvda-soros",
    strategyId: "strat-wood-innovation",
    symbol: "NVDA.US",
    status: "PENDING",
    createdAt: T(1),
    targetPlan: {
      action: "BUY",
      targetWeight: 0.1,
      currentWeight: 0.06,
      riskBoundary: "回撤 -8% 重新评估 · Thesis 证伪则清仓",
      invalidation:
        "任一季度 Data Center 营收 QoQ 增速 < 5% · 或 hyperscaler 明确削减 2026 AI capex",
      window: "7D · 分 3 次",
      phases: [
        { weight: 0.02, condition: "第一批 +2pp · 限价 $870" },
        { weight: 0.02, condition: "第二批 +2pp · 触发回撤 3% 后" },
      ],
    },
    executionPlan: {
      entryApproach: "gradual_ladder",
      orders: [
        {
          id: "ord-nvda-ladder-1",
          side: "BUY",
          qty: 12,
          orderType: "LIMIT",
          price: 870,
          validity: "Day",
          note: "第一批 · 基于 Thesis NVDA AI 基建",
        },
      ],
      checkpoints: [
        "每日对照 hyperscaler 最新 capex 口径",
        "Blackwell 毛利率披露后重新校验 Thesis A2",
      ],
    },
  },
  // Executed · 已完成的历史 Plan
  {
    id: "plan-aapl-hold",
    signalId: "sig-nvda-soros",
    strategyId: "strat-buffett-value",
    symbol: "AAPL.US",
    status: "COMPLETED",
    createdAt: T(24 * 10),
    confirmedAt: T(24 * 10).toString(),
    targetPlan: {
      action: "HOLD",
      targetWeight: 0.08,
      currentWeight: 0.08,
      riskBoundary: "服务业务增速 < 10% 时重新评估",
      invalidation: "服务业务毛利率回落 200bp 以下",
      window: "季度",
    },
    executionPlan: {
      entryApproach: "single_or_gradual",
      orders: [],
      checkpoints: ["已完成 · 无进一步操作"],
    },
  },
  // Cancelled · 归档
  {
    id: "plan-amd-skipped",
    signalId: "sig-nvda-soros",
    strategyId: "strat-wood-innovation",
    symbol: "AMD.US",
    status: "CANCELLED",
    createdAt: T(24 * 6),
    targetPlan: {
      action: "BUY",
      targetWeight: 0.05,
      currentWeight: 0,
      riskBoundary: "无",
      invalidation: "Signal 已 superseded",
      window: "无",
    },
    executionPlan: {
      entryApproach: "wait",
      orders: [],
      checkpoints: ["用户跳过 · Signal 被更新的 Catalyst superseded"],
    },
  },
);

export function getTradePlanById(id: string): TradePlan | undefined {
  return MOCK_TRADE_PLANS.find((p) => p.id === id);
}

export function getTradePlansBySymbol(symbol: string): TradePlan[] {
  return MOCK_TRADE_PLANS.filter((p) => p.symbol === symbol);
}

export function getTradePlansBySignal(signalId: string): TradePlan[] {
  return MOCK_TRADE_PLANS.filter((p) => p.signalId === signalId);
}
