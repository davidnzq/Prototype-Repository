// 意图识别 · 移植自 longbridge-web-demo/js/sidebar.js classifyIntent
// 优先级:选股 > 对比 > 建仓 > 归因 > 标的 > 风险
//
// 返回的 viewId 与 lib/ai/pageContext.ts 的 getContextForView 字典对齐。

export type DynViewId =
  | "dyn-screener"
  | "dyn-compare"
  | "dyn-tradeplan"
  | "dyn-attribution"
  | "dyn-research"
  | "dyn-risk";

const TICKERS = [
  "NVDA",
  "AAPL",
  "GOOG",
  "GOOGL",
  "TSM",
  "AMD",
  "META",
  "MSFT",
  "AMZN",
  "TSLA",
  "BABA",
] as const;

export function classifyIntent(text: string): DynViewId | null {
  const t = text.toLowerCase();
  if (
    /(选股|筛选|潜力股|中概股|高股息|高息|价值股|成长股|低估值|高成长|找股|挑股|选出)/.test(
      t,
    )
  ) {
    return "dyn-screener";
  }
  if (/(对比|比较|\bvs\b|哪个好|应该选)/.test(t)) return "dyn-compare";
  if (
    /(trade\s*plan|建单|建.*策略|策略草案|策略方案|加仓策略|止损策略|交易计划|建.*计划|止损|期权|加仓方案|建仓)/.test(
      t,
    )
  ) {
    return "dyn-tradeplan";
  }
  if (/(为什么跌|为什么亏|亏损来自|归因|影响多大|怎么回事)/.test(t)) {
    return "dyn-attribution";
  }
  if (/\b(nvda|aapl|googl?|tsm|amd|meta|msft|amzn|tsla|baba)\b/i.test(t)) {
    return "dyn-research";
  }
  if (/(风险|持仓|我的资产|我的仓位|组合)/.test(t)) {
    return "dyn-risk";
  }
  return null;
}

/** 从输入里抽出第一个识别到的 ticker(用于 dyn-research / dyn-tradeplan)。*/
export function extractSymbol(text: string): string | null {
  const upper = text.toUpperCase();
  for (const tk of TICKERS) {
    const re = new RegExp(`\\b${tk}\\b`);
    if (re.test(upper)) return tk;
  }
  return null;
}

/** 与 view 同步给 RightChat 的快捷追问参考(可选,真正字典在 pageContext.getContextForView)。*/
export const TRY_INTENTS: { label: string; text: string }[] = [
  { label: "试 · 持仓风险", text: "分析我的持仓风险" },
  { label: "试 · 中概潜力股", text: "我想筛选中概股中的潜力股" },
  { label: "试 · 建 NVDA 策略", text: "帮我建一个 NVDA 策略" },
  { label: "试 · NVDA 怎么看", text: "NVDA" },
  { label: "试 · 今天为什么跌", text: "今天为什么跌了" },
];
