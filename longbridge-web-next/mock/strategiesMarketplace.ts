// Strategy 广场上的"社区策略"和"子 Agent"。官方 4 套在 mock/strategies.ts。
// 这里扩展广场所需的额外元数据:作者、订阅数、发布时间、热度、方法论标签。

import type { Strategy } from "@/types/domain";
import { MOCK_STRATEGIES } from "./strategies";

export type StrategyMethod = "基本面" | "技术" | "宏观" | "复合" | "量化";
export type StrategyKind = "official" | "community" | "agent" | "composite";

export interface StrategyListing {
  strategyId: string;
  kind: StrategyKind;
  method: StrategyMethod;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  updatedAt: string;
  subscribers: number;
  fork: number;
  heat: number; // 热度 0-100
  avgConviction?: number;
  tags: string[];
}

// Official 4 strategies
const OFFICIAL: StrategyListing[] = [
  {
    strategyId: "strat-buffett-value",
    kind: "official",
    method: "基本面",
    author: "Longbridge 官方",
    publishedAt: "2025-11-01",
    updatedAt: "2026-03-22",
    subscribers: 24_180,
    fork: 342,
    heat: 88,
    avgConviction: 62,
    tags: ["价值", "安全边际", "长线"],
  },
  {
    strategyId: "strat-wood-innovation",
    kind: "official",
    method: "基本面",
    author: "Longbridge 官方",
    publishedAt: "2025-11-01",
    updatedAt: "2026-04-10",
    subscribers: 18_450,
    fork: 287,
    heat: 94,
    avgConviction: 74,
    tags: ["成长", "颠覆创新", "主题"],
  },
  {
    strategyId: "strat-simons-quant",
    kind: "official",
    method: "量化",
    author: "Longbridge 官方",
    publishedAt: "2025-11-01",
    updatedAt: "2026-04-18",
    subscribers: 9_120,
    fork: 198,
    heat: 72,
    avgConviction: 68,
    tags: ["多因子", "共振", "短线"],
  },
  {
    strategyId: "strat-soros-reflexivity",
    kind: "official",
    method: "宏观",
    author: "Longbridge 官方",
    publishedAt: "2025-11-01",
    updatedAt: "2026-04-18",
    subscribers: 5_430,
    fork: 102,
    heat: 79,
    avgConviction: 71,
    tags: ["反身性", "泡沫识别", "高波动"],
  },
];

// 模拟 5 个社区策略(没有 OMR 完整定义,但会在广场显示)
// 注意 StrategyListing.kind 和 Strategy.kind 同名但含义不同 —— 这里用 Omit 隔离。
type CommunityStrategy = StrategyListing &
  Partial<Omit<Strategy, "kind">> & {
    kind: StrategyKind;
    omrKind?: Strategy["kind"];
  };

const COMMUNITY: CommunityStrategy[] = [
  {
    strategyId: "strat-community-lynch-mini",
    kind: "community",
    method: "基本面",
    author: "李蓓 · @macro-lab",
    publishedAt: "2026-01-12",
    updatedAt: "2026-04-15",
    subscribers: 3_820,
    fork: 58,
    heat: 67,
    avgConviction: 64,
    tags: ["PEG", "成长价值", "中小盘"],
    name: "Lynch-like Growth",
    nameZh: "林奇式成长",
    slogan: "Invest in what you know · PEG < 1 · 消费升级赛道",
    philosophy: "基于 Peter Lynch 的选股理念,聚焦 PEG 比率 < 1 的快成长公司。偏好在生活中能感知到的消费升级标的。",
    omrKind: "Stock-First",
  },
  {
    strategyId: "strat-community-macro-rotation",
    kind: "community",
    method: "宏观",
    author: "凌风 · @raydalio-fan",
    publishedAt: "2026-02-20",
    updatedAt: "2026-04-17",
    subscribers: 2_106,
    fork: 24,
    heat: 54,
    avgConviction: 58,
    tags: ["四季轮动", "风险平价", "宏观"],
    name: "All-Weather Rotation",
    nameZh: "全天候轮动",
    slogan: "Dalio 全天候精简版 · 按周期切换板块敞口",
    philosophy: "基于达利欧的四象限宏观框架,根据增长和通胀预期,动态调整资产类别敞口。",
    omrKind: "Portfolio-First",
  },
  {
    strategyId: "strat-community-technical-turtle",
    kind: "community",
    method: "技术",
    author: "Turtle 俱乐部",
    publishedAt: "2025-12-08",
    updatedAt: "2026-04-16",
    subscribers: 1_820,
    fork: 47,
    heat: 49,
    avgConviction: 61,
    tags: ["海龟", "趋势", "ATR"],
    name: "Turtle Trading",
    nameZh: "海龟交易法",
    slogan: "20/55 日新高突破 + ATR 止损",
    philosophy: "经典海龟法则的现代化实现,趋势突破入场,ATR-based 仓位管理和止损。",
    omrKind: "Stock-First",
  },
  {
    strategyId: "strat-community-dividend-king",
    kind: "community",
    method: "基本面",
    author: "现金流老 K · @dividendking",
    publishedAt: "2025-10-03",
    updatedAt: "2026-03-30",
    subscribers: 4_520,
    fork: 132,
    heat: 62,
    avgConviction: 55,
    tags: ["股息", "自由现金流", "稳健"],
    name: "Dividend Aristocrats Plus",
    nameZh: "股息贵族 +",
    slogan: "25 年连续增息 + FCF 覆盖 > 1.5x",
    philosophy: "在 S&P 500 Dividend Aristocrats 基础上叠加 FCF 覆盖率筛选,避开分红不可持续的公司。",
    omrKind: "Stock-First",
  },
  {
    strategyId: "strat-community-cpo-theme",
    kind: "community",
    method: "复合",
    author: "硅光研究员",
    publishedAt: "2026-03-08",
    updatedAt: "2026-04-18",
    subscribers: 892,
    fork: 9,
    heat: 84,
    avgConviction: 69,
    tags: ["CPO", "光通信", "产业链"],
    name: "CPO Supply Chain",
    nameZh: "CPO 产业链",
    slogan: "硅光互联 · AI 算力第二波",
    philosophy: "聚焦共封装光学(CPO)产业链,从光模块厂商到 PHY 芯片到数据中心连接。",
    omrKind: "Stock-First",
  },
];

// 3 个 Sub-Agent(不是完整 OMR 策略,而是专门 agent)
export interface SubAgentListing extends StrategyListing {
  agentName: string;
  capability: string;
  io: { input: string; output: string };
}

const SUB_AGENTS: SubAgentListing[] = [
  {
    strategyId: "agent-earnings-analyzer",
    kind: "agent",
    method: "基本面",
    author: "Longbridge 官方",
    publishedAt: "2026-01-20",
    updatedAt: "2026-04-14",
    subscribers: 7_450,
    fork: 0,
    heat: 82,
    tags: ["财报", "10-K/10-Q", "自动化"],
    agentName: "Earnings Analyzer",
    capability: "财报深度解读 · 自动对比预期 · 指引分析",
    io: { input: "Symbol · Quarter", output: "结构化财报摘要 + Catalyst 建议" },
  },
  {
    strategyId: "agent-chart-pattern",
    kind: "agent",
    method: "技术",
    author: "Longbridge 官方",
    publishedAt: "2026-02-01",
    updatedAt: "2026-04-10",
    subscribers: 5_120,
    fork: 0,
    heat: 70,
    tags: ["形态识别", "K 线", "技术"],
    agentName: "Chart Pattern Scout",
    capability: "识别 20+ 经典形态 · 标注关键支撑/阻力",
    io: { input: "Symbol · Timeframe", output: "形态列表 + 信号方向 + 置信度" },
  },
  {
    strategyId: "agent-sentiment-monitor",
    kind: "agent",
    method: "复合",
    author: "社媒分析团队",
    publishedAt: "2026-03-15",
    updatedAt: "2026-04-18",
    subscribers: 2_380,
    fork: 0,
    heat: 65,
    tags: ["舆情", "社媒", "量化"],
    agentName: "Sentiment Monitor",
    capability: "Twitter / Reddit / 雪球情绪指数 · 异动预警",
    io: { input: "Symbol · Period", output: "情绪热度曲线 + 异动事件" },
  },
];

export const ALL_LISTINGS = [
  ...OFFICIAL,
  ...COMMUNITY,
  ...SUB_AGENTS,
] as StrategyListing[];

export function getListing(id: string): StrategyListing | undefined {
  return ALL_LISTINGS.find((l) => l.strategyId === id);
}

export function getSubAgent(id: string): SubAgentListing | undefined {
  return SUB_AGENTS.find((a) => a.strategyId === id);
}

export function getCommunityStrategy(id: string) {
  return COMMUNITY.find((c) => c.strategyId === id);
}

// 合并 official mock + community 扩展的 strategies(for strategy detail page)
export function getFullStrategy(id: string) {
  const official = MOCK_STRATEGIES.find((s) => s.id === id);
  if (official) return official;
  return COMMUNITY.find((c) => c.strategyId === id) as
    | (Partial<Strategy> & { strategyId: string })
    | undefined;
}
