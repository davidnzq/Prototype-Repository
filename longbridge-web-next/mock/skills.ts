// Framework Part 7.4 · Skill 生态化 ——
// Skill 是 Agent 调用的最小能力单元 · 输入 → 输出 · 不对话。
// 和 Strategy / Sub-Agent 在 Marketplace 里完全对等 · 浏览 · 采纳(启用) · Fork · Rebase · 发布 · 评分。

export type SkillMethod = "基本面" | "技术" | "宏观" | "数据源" | "通用";

export interface SkillListing {
  id: string;
  name: string;
  nameZh: string;
  category: "官方" | "社区" | "用户自建";
  method: SkillMethod;
  author: string;
  publishedAt: string;
  updatedAt: string;
  enabled: number; // 启用人数(对应 Strategy 的 subscribers)
  fork: number;
  heat: number; // 热度 0-100
  tags: string[];
  capability: string; // 一句话描述
  io: { input: string; output: string };
}

export const MOCK_SKILLS: SkillListing[] = [
  {
    id: "skill-xbrl-filing",
    name: "XBRL Filing Parser",
    nameZh: "XBRL 财报数据解析",
    category: "官方",
    method: "数据源",
    author: "Longbridge 官方",
    publishedAt: "2025-12-10",
    updatedAt: "2026-04-10",
    enabled: 18_400,
    fork: 52,
    heat: 86,
    tags: ["10-K", "10-Q", "SEC"],
    capability: "从 XBRL 文件精确抽取财务项 · 含 footnote 关联 · 结构化输出",
    io: {
      input: "Symbol · Period",
      output: "JSON · 收入/利润/现金流/细项 + footnote",
    },
  },
  {
    id: "skill-fx-daily",
    name: "FX Daily Fetcher",
    nameZh: "汇率日度抓取",
    category: "官方",
    method: "数据源",
    author: "Longbridge 官方",
    publishedAt: "2026-01-05",
    updatedAt: "2026-03-28",
    enabled: 6_250,
    fork: 8,
    heat: 52,
    tags: ["汇率", "FX"],
    capability: "取任一货币对的日度收盘 · 历史回填 5 年",
    io: { input: "Pair · Range", output: "时间序列 OHLC" },
  },
  {
    id: "skill-tech-breakout",
    name: "Consolidation Breakout Detector",
    nameZh: "横盘突破识别",
    category: "社区",
    method: "技术",
    author: "@chart_master",
    publishedAt: "2026-02-18",
    updatedAt: "2026-04-15",
    enabled: 3_220,
    fork: 78,
    heat: 74,
    tags: ["横盘", "放量", "技术"],
    capability: "识别 20+ 日横盘整理后放量向上突破 · 含假突破过滤",
    io: {
      input: "Symbol · Timeframe(日/周)",
      output: "突破事件列表 + 支撑/阻力 + 置信度",
    },
  },
  {
    id: "skill-pgp-valuation",
    name: "P/GP Valuation",
    nameZh: "P/GP 估值",
    category: "社区",
    method: "基本面",
    author: "@value_seeker",
    publishedAt: "2026-03-02",
    updatedAt: "2026-04-08",
    enabled: 1_850,
    fork: 34,
    heat: 58,
    tags: ["估值", "毛利倍数"],
    capability:
      "用毛利倍数(P / Gross Profit)替代 P/E · 适合高增长低利润的互联网公司",
    io: {
      input: "Symbol · Period",
      output: "P/GP 历史分位 + 对比行业中位数",
    },
  },
  {
    id: "skill-my-semi-breakout",
    name: "My Semi Breakout",
    nameZh: "我的半导体横盘突破识别",
    category: "用户自建",
    method: "技术",
    author: "你 · David",
    publishedAt: "2026-04-01",
    updatedAt: "2026-04-18",
    enabled: 1,
    fork: 0,
    heat: 0,
    tags: ["自建", "半导体", "横盘"],
    capability: "基于 Consolidation Breakout Detector 的 fork · 专注半导体标的 · 调整过滤阈值",
    io: { input: "Symbol(半导体)", output: "突破事件 · 含 VIX 环境备注" },
  },
  {
    id: "skill-macro-yield-curve",
    name: "Yield Curve Monitor",
    nameZh: "收益率曲线监控",
    category: "官方",
    method: "宏观",
    author: "Longbridge 官方",
    publishedAt: "2026-01-18",
    updatedAt: "2026-04-01",
    enabled: 9_820,
    fork: 21,
    heat: 70,
    tags: ["宏观", "利率"],
    capability:
      "2Y/10Y 价差 · 期限结构分析 · 倒挂事件侦测 + 历史对照",
    io: { input: "Region", output: "曲线形态 + 倒挂事件 + 历史对照" },
  },
];

export function getSkill(id: string): SkillListing | undefined {
  return MOCK_SKILLS.find((s) => s.id === id);
}
