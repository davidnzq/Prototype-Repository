// 预设筛选器 —— Markets 页的 Screeners 模块用。
// Demo 不跑实时筛选,直接给出结果候选列表。

export interface Screener {
  id: string;
  name: string;
  tagline: string;
  criteria: { label: string; value: string }[];
  resultSymbols: string[]; // 命中的候选 · 可能不在 Demo 10 只覆盖内
  methodology: "基本面" | "技术" | "宏观" | "混合";
}

export const MOCK_SCREENERS: Screener[] = [
  {
    id: "high-roe-low-pe",
    name: "高 ROE + 低 PE",
    tagline: "巴菲特式质地好 + 估值合理",
    methodology: "基本面",
    criteria: [
      { label: "ROE", value: "> 15%" },
      { label: "PE", value: "< 20" },
      { label: "D/E", value: "< 0.5" },
      { label: "5Y Rev CAGR", value: "> 5%" },
    ],
    resultSymbols: ["JPM", "META", "MSFT", "UNH", "V"],
  },
  {
    id: "momentum-breakout",
    name: "动量突破",
    tagline: "趋势刚起、成交放量的技术突破",
    methodology: "技术",
    criteria: [
      { label: "Price vs 50DMA", value: "> +5%" },
      { label: "Volume ratio", value: "> 1.5x" },
      { label: "RSI(14)", value: "55-75(偏强未超买)" },
      { label: "MACD", value: "金叉近 3 日" },
    ],
    resultSymbols: ["MSFT", "TSLA", "AMD", "ARM"],
  },
  {
    id: "high-growth-ai",
    name: "AI 赛道高成长",
    tagline: "Wood 画像 · 营收加速 + TAM 扩张",
    methodology: "基本面",
    criteria: [
      { label: "Rev CAGR(3Y)", value: "> 25%" },
      { label: "季度环比加速", value: "≥ 2 季度" },
      { label: "AI/HPC 占比", value: "> 30%" },
    ],
    resultSymbols: ["NVDA", "AMD", "CRDO", "ARM", "SMCI"],
  },
  {
    id: "dividend-yield",
    name: "高股息稳健",
    tagline: "守卫者画像 · 连续分红 + 覆盖率健康",
    methodology: "基本面",
    criteria: [
      { label: "股息率", value: "> 3%" },
      { label: "连续分红", value: "≥ 10 年" },
      { label: "Payout Ratio", value: "< 70%" },
      { label: "FCF 覆盖", value: "> 1.5x" },
    ],
    resultSymbols: ["KO", "PEP", "JNJ", "JPM", "XOM"],
  },
  {
    id: "oversold-reversal",
    name: "超卖反转",
    tagline: "RSI < 30 + 基本面未恶化",
    methodology: "混合",
    criteria: [
      { label: "RSI(14)", value: "< 30" },
      { label: "距 52 周低点", value: "< 10%" },
      { label: "ROE 变化", value: "未显著恶化" },
    ],
    resultSymbols: ["BA", "DIS", "BABA"],
  },
];
