// Domain types derived from wiki/ PRDs.
// Naming follows the source docs; fields are a curated subset needed for the demo.

// ─── Core enums ─────────────────────────────────────────────────────────────

export type Market = "US" | "HK" | "CN" | "SG" | "Crypto";

export type FactualDirection = "positive" | "negative" | "neutral" | "mixed";

export type FactorGroup =
  | "QUALITY"
  | "GROWTH"
  | "PROFITABILITY"
  | "VALUE"
  | "MOMENTUM"
  | "TREND"
  | "LOW_VOLATILITY"
  | "NEWS"
  | "MACRO";

export type Conviction = "HIGH" | "MEDIUM" | "LOW";

export type Outlook =
  | "Strong_bullish"
  | "Bullish"
  | "Neutral"
  | "Bearish"
  | "Strong_bearish";

export type Recommendation = Outlook;

export type SignalAction = "BUY" | "HOLD" | "SELL" | "HEDGE" | "REBALANCE" | "WATCH";

export type AnalystTerm =
  | "INITIATE"
  | "UPGRADE"
  | "DOWNGRADE"
  | "RAISE_TARGET"
  | "LOWER_TARGET"
  | "REITERATE";

export type TradePlanStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type EntryApproach = "gradual_ladder" | "single_or_gradual" | "wait";

// ─── User portrait (KnowYourself) ───────────────────────────────────────────

export type PortraitRole =
  | "Appraiser" // 鉴宝师 — Buffett
  | "Pioneer" // 先驱者 — Wood
  | "Navigator" // 领航者 — Tudor Jones
  | "Arbitrageur" // 价差猎手 — Shaw
  | "Architect" // 架构师 — Dalio
  | "Keeper" // 守卫者 — Dreman
  | "Protector" // 稳本者 — Bogle / VFIAX
  | "Maverick"; // 独行侠 — Soros

export interface Portrait {
  role: PortraitRole;
  roleZh: string;
  representative: string; // e.g. "Warren Buffett"
  riskTolerance: number; // 1-5
  expectedReturn: number;
  decisionMethod: number;
  decisionBasis: number;
  timeHorizon: number;
  learningWillingness: number;
  tagline: string;
}

// ─── Strategy (OMRs) ────────────────────────────────────────────────────────

export interface Strategy {
  id: string;
  name: string; // e.g. "Buffett Value Strategy"
  nameZh: string;
  slogan: string;
  philosophy: string;
  kind: "Stock-First" | "Portfolio-First";
  objective: {
    universe: string[];
    goal: string;
    frequency: string;
    riskBudget: string;
  };
  model: {
    factors: { group: FactorGroup; weight: number; name: string }[];
    checklistSize: number; // typically 10
  };
  rules: {
    entry: string;
    exit: string;
    sizing: string;
  };
}

// ─── Catalyst (fact) ────────────────────────────────────────────────────────

export interface Catalyst {
  id: string;
  type: "FUNDAMENTAL_CHANGE" | "NEWS_EVENT" | "TECHNICAL_SIGNAL" | "MACRO_EVENT" | "PORTFOLIO_EVENT";
  symbol: string; // "AAPL.US"
  company: string;
  trigger: string; // e.g. "earnings_beat", "ma50_breakout"
  significance: "HIGH" | "MEDIUM" | "LOW" | "NORMAL";
  title: string;
  subtitle: string;
  summary: string;
  eli5: string;
  highlights: string[];
  factors: { name: string; value: number; delta: number; direction: "positive" | "negative" | "neutral" }[];
  groupTags: FactorGroup[];
  factualDirection: FactualDirection;
  factualStrength: number; // 0-1
  sources: { title: string; url?: string; kind: "news" | "filing" | "community" | "platform" }[];
  generatedAt: string; // ISO
}

// ─── Signal (opportunity) ───────────────────────────────────────────────────

export interface SignalFactor {
  name: string;
  category: FactorGroup;
  value: string;
  threshold: string;
  passed: boolean;
  weight: number;
}

export interface Signal {
  id: string;
  issuedAt: string;
  symbol: string;
  company: string;
  strategyId: string;
  strategyName: string;
  supersedes: string | null;
  supersededBy: string | null;
  analystTerm: AnalystTerm;
  recommendation: Recommendation;
  outlook: Outlook;
  action: SignalAction;
  currentPrice: number;
  targetPrice: number;
  upsidePct: number;
  convictionScore: number; // 0-100
  conviction: Conviction;
  strategyFitScore: number; // 0-100
  oneLineConclusion: string;
  thesis: string[]; // 3-5 bullet points
  risks: string[];
  horizon: string; // "48 hours" | "1-2 weeks"
  catalystIds: string[];
  factors: SignalFactor[];
  personalization?: string;
}

// ─── Trade Plan ─────────────────────────────────────────────────────────────

export interface OrderDraft {
  id: string;
  side: "BUY" | "SELL";
  qty: number;
  orderType: "LIMIT" | "MARKET" | "CONDITIONAL" | "STOP";
  price?: number;
  triggerCondition?: string;
  validity: string; // e.g. "Day", "48h"
  note?: string;
}

export interface TradePlan {
  id: string;
  signalId: string;
  strategyId: string;
  symbol: string;
  status: TradePlanStatus;
  createdAt: string;
  // Target Plan (goal)
  targetPlan: {
    action: SignalAction;
    targetWeight: number; // e.g. 0.1 means 10%
    currentWeight: number;
    riskBoundary: string;
    invalidation: string;
    window: string; // "48h"
    phases?: { weight: number; condition: string }[];
  };
  // Execution Plan (how)
  executionPlan: {
    entryApproach: EntryApproach;
    orders: OrderDraft[];
    checkpoints: string[];
  };
  // HITL
  confirmedAt?: string;
  userOverrides?: { field: string; value: string; at: string }[];
}

// ─── Thesis ─────────────────────────────────────────────────────────────────
// Framework Part 4 · Thesis = 用户的核心判断 + 关键假设 + 证伪条件 + 证据链。
// 是随时间演化的叙事(有 version 历史),不是静态文档。

export type ThesisStatus =
  | "Active" // 当前有效 · 判断成立
  | "Validated" // 被后续事实证实
  | "Invalidated" // 关键假设被证伪
  | "Archived"; // 已归档(标的卖掉或时间太久)

export interface Thesis {
  id: string;
  symbol: string;
  company: string;
  title: string; // "NVDA · AI 基建主升浪"
  status: ThesisStatus;
  // 核心判断(一两句话)
  hypothesis: string;
  // 3-5 条关键假设 · 每一条都可证伪
  assumptions: { id: string; text: string; confidence: number }[]; // confidence 0-1
  // 证伪条件(触发则 Invalidate)
  invalidationConditions: string[];
  // 支持证据(关联 Catalyst IDs)
  supportingCatalystIds: string[];
  // 关联资产
  linkedPlanIds: string[];
  linkedReviewIds: string[];
  // 版本
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  planId: string;
  signalId: string;
  symbol: string;
  closedAt: string;
  summary: {
    direction: string;
    targetWeight: number;
    window: string;
  };
  execution: {
    filledPct: number;
    avgPriceDeviation: number;
    unexecutedReason?: string;
  };
  performance: {
    realizedPnl: number;
    realizedPnlPct: number;
    maxDrawdown: number;
    benchmarkReturn: number;
  };
  attribution: {
    strategyChoice: "correct" | "partial" | "wrong";
    takeProfit: "early" | "on_target" | "late" | "n/a";
    stopLoss: "triggered" | "not_triggered" | "missed";
    marketEnvironment: string;
    notes: string;
  };
  behaviorPatterns: string[];
  userOverrides: { field: string; at: string }[];
  improvements: string[];
}

// ─── Quote (passthrough from Longport) ──────────────────────────────────────

export interface Quote {
  symbol: string;
  lastDone: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  turnover: number;
  changePct: number;
  status?: string;
  timestamp: string;
}
