/**
 * Mock data for stock detail v2 — Bloomberg + 长桥 US 设计语言.
 * AAPL.US 基线,覆盖阶段一 16 个组件所需全部 schema.
 */

export type Trend = "up" | "down" | "flat";

// ────────────────────────────────────────────────────────────────────────────
// 1. Quote 报价头
// ────────────────────────────────────────────────────────────────────────────
export interface Quote {
  symbol: string;
  ticker: string;
  exchange: string;
  market: string;
  nameZh: string;
  nameEn: string;
  bbgType: string;
  price: number;
  delta: number;
  pct: number;
  trend: Trend;
  currency: string;
  updatedAt: string;
  session: "PRE" | "REG" | "POST" | "CLOSED";
  afterHours?: {
    label: "PRE" | "POST";
    price: number;
    delta: number;
    pct: number;
    trend: Trend;
  };
  // KV 矩阵(精简,完整 KV 移到 QuoteKV)
  open: number;
  high: number;
  low: number;
  prev: number;
  vwap: number;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  yield: number;
  beta: number;
  eps: number;
  shares: number;
  high52w: number;
  low52w: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Intraday K 线
// ────────────────────────────────────────────────────────────────────────────
export type KlineTab =
  | "分时"
  | "5日"
  | "日K"
  | "周K"
  | "月K"
  | "年K"
  | "1分"
  | "5分"
  | "15分";

export interface IntradayMeta {
  activeTab: KlineTab;
  adjust: "前复权" | "后复权" | "不复权";
  currency: string;
  rangeLabel: string;
  mas: { label: string; value: number; color: string }[];
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Tag 标签
// ────────────────────────────────────────────────────────────────────────────
export type TagCategory = "industry" | "concept" | "holding";

export interface StockTag {
  label: string;
  category: TagCategory;
  pct?: number;
  selected?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// 4. QuoteKV — 完整扩展 KV(分组)
// ────────────────────────────────────────────────────────────────────────────
export interface QuoteKVGroup {
  label: string;
  items: { label: string; value: string; trend?: Trend; accent?: boolean }[];
}

// ────────────────────────────────────────────────────────────────────────────
// 5. CompanyProfile 公司概况
// ────────────────────────────────────────────────────────────────────────────
export interface CompanyProfile {
  description: string;
  ceo: string;
  founded: number;
  hq: string;
  employees: number;
  website: string;
  ipoDate: string;
  fiscalYearEnd: string;
  sector: string;
  industry: string;
  subIndustry: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 6. SectorPosition 行业定位
// ────────────────────────────────────────────────────────────────────────────
export interface SectorPeer {
  ticker: string;
  name: string;
  marketCap: number;
  pe: number;
  pct1d: number;
  pctYtd: number;
  highlighted?: boolean;
}

export interface SectorPosition {
  sectorName: string;
  industryRank: number;
  industryTotal: number;
  sectorPct1d: number;
  sectorPctYtd: number;
  peers: SectorPeer[];
}

// ────────────────────────────────────────────────────────────────────────────
// 7. KeyFactors 关键因子
// ────────────────────────────────────────────────────────────────────────────
export interface KeyFactorNode {
  label: string;
  value: string;
  benchmark?: string;        // peer median / index avg
  trend: Trend;
  score?: number;            // 0-100,显示在 bar 上
}

export interface KeyFactorGroup {
  groupLabel: string;
  nodes: KeyFactorNode[];
}

// ────────────────────────────────────────────────────────────────────────────
// 8. AnalystConsensus 分析师一致预期
// ────────────────────────────────────────────────────────────────────────────
export interface AnalystConsensus {
  totalAnalysts: number;
  buy: number;
  outperform: number;
  hold: number;
  underperform: number;
  sell: number;
  meanRating: number;        // 1-5(1 = strong buy)
  targetPrice: { low: number; mean: number; high: number; median: number };
  currentPrice: number;
  /** 最近 4 周评级变动 */
  revisions: { date: string; analyst: string; from: string; to: string; tp: number }[];
}

// ────────────────────────────────────────────────────────────────────────────
// 9. InstitutionalHolding 机构持仓
// ────────────────────────────────────────────────────────────────────────────
export interface Holder {
  name: string;
  shares: number;
  pctOut: number;            // % of shares outstanding
  pctChange: number;         // QoQ change
  value: number;             // market value USD
}

export interface InstitutionalHolding {
  institutionalPct: number;
  insiderPct: number;
  retailPct: number;
  topHolders: Holder[];
  /** 最近季度净流入(B 单位) */
  netFlow4q: { quarter: string; netFlow: number }[];
}

// ────────────────────────────────────────────────────────────────────────────
// 10. FinancialHealthScore 财务评分
// ────────────────────────────────────────────────────────────────────────────
export interface FinancialHealthScore {
  overall: number;           // 0-10
  /** 4 个维度 */
  dimensions: {
    label: string;
    score: number;           // 0-10
    peer: number;            // peer median
    description: string;
  }[];
  /** Morningstar 风格的评级 */
  rating: "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D";
}

// ────────────────────────────────────────────────────────────────────────────
// 11/12/13. 三大财务报表
// ────────────────────────────────────────────────────────────────────────────
export interface FinancialRow {
  label: string;
  values: number[];          // 4 期数据
  yoy?: number;              // 最新期 YoY
  bold?: boolean;            // 大类合计加粗
  indent?: number;           // 0/1/2 缩进
}

export interface FinancialStatement {
  periods: string[];         // ["Q1'26", "Q4'25", "Q3'25", "Q2'25"]
  unit: string;              // "百万美元"
  rows: FinancialRow[];
}

// ────────────────────────────────────────────────────────────────────────────
// 14. RevenueComposition 营收构成
// ────────────────────────────────────────────────────────────────────────────
export interface RevenueSegment {
  label: string;
  revenue: number;           // 营收 ($B)
  pct: number;               // 占比
  yoy: number;               // 同比变化
  color: string;             // chart color var
}

// ────────────────────────────────────────────────────────────────────────────
// 15. Valuation 估值分析
// ────────────────────────────────────────────────────────────────────────────
export interface ValuationMetric {
  label: string;
  current: number;
  peerMin: number;
  peerLow: number;           // 25%
  peerHigh: number;          // 75%
  peerMax: number;
  industryAvg: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 16. DividendPlan 分红方案
// ────────────────────────────────────────────────────────────────────────────
export interface DividendYear {
  year: number;
  dps: number;               // dividend per share
  yieldPct: number;
  payoutRatio: number;
}

export interface DividendRecord {
  exDate: string;
  payDate: string;
  amount: number;
  type: "Regular" | "Special";
}

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA — AAPL.US baseline
// ════════════════════════════════════════════════════════════════════════════

export const mockQuote: Quote = {
  symbol: "AAPL.US",
  ticker: "AAPL",
  exchange: "NASDAQ",
  market: "US",
  nameZh: "苹果",
  nameEn: "Apple Inc",
  bbgType: "US Equity",
  price: 287.44,
  delta: 0.07,
  pct: -0.0002,
  trend: "down",
  currency: "USD",
  updatedAt: "16:00:00 EDT 05/08",
  session: "POST",
  afterHours: {
    label: "PRE",
    price: 288.161,
    delta: 0.721,
    pct: 0.0025,
    trend: "up",
  },
  open: 286.20,
  high: 289.41,
  low: 285.88,
  prev: 287.51,
  vwap: 287.62,
  bid: 287.43,
  ask: 287.45,
  spread: 0.02,
  volume: 48_237_412,
  avgVolume: 52_400_000,
  marketCap: 4_270_000_000_000,
  pe: 34.8,
  yield: 0.0046,
  beta: 1.24,
  eps: 8.26,
  shares: 14_850_000_000,
  high52w: 299.21,
  low52w: 178.42,
};

export const mockIntradayMeta: IntradayMeta = {
  activeTab: "分时",
  adjust: "前复权",
  currency: "USD",
  rangeLabel: "60D",
  mas: [
    { label: "MA5", value: 286.42, color: "var(--chart-yellow)" },
    { label: "MA20", value: 274.85, color: "var(--chart-green)" },
    { label: "MA50", value: 261.30, color: "var(--chart-purple)" },
  ],
};

export const mockTags: StockTag[] = [
  { label: "Consumer Electronics", category: "industry", pct: 0.0124 },
  { label: "Hardware", category: "industry", pct: 0.0086 },
  { label: "AI Devices", category: "concept", pct: 0.0312, selected: true },
  { label: "Wearables", category: "concept", pct: -0.0045 },
  { label: "Services", category: "concept", pct: 0.0067 },
  { label: "Berkshire", category: "holding", pct: 0.0021 },
  { label: "ARK", category: "holding", pct: -0.0089 },
];

export const mockQuoteKV: QuoteKVGroup[] = [
  {
    label: "Trading",
    items: [
      { label: "Shares Out", value: "14.85B" },
      { label: "Float", value: "14.78B" },
      { label: "Short %", value: "0.78%" },
      { label: "Beta(1Y)", value: "1.24" },
      { label: "RSI(14)", value: "58.2" },
      { label: "ADR(20D)", value: "2.34" },
    ],
  },
  {
    label: "Valuation",
    items: [
      { label: "P/E (TTM)", value: "34.80", accent: true },
      { label: "P/E (FWD)", value: "28.92" },
      { label: "P/S", value: "8.45" },
      { label: "P/B", value: "47.21" },
      { label: "EV/EBITDA", value: "26.18" },
      { label: "PEG", value: "2.81" },
    ],
  },
  {
    label: "Profitability",
    items: [
      { label: "ROE", value: "164.6%", trend: "up" },
      { label: "ROA", value: "29.2%", trend: "up" },
      { label: "ROIC", value: "57.4%", trend: "up" },
      { label: "Net Margin", value: "25.3%" },
      { label: "Op Margin", value: "31.5%" },
      { label: "Gross Margin", value: "46.2%" },
    ],
  },
  {
    label: "Growth (YoY)",
    items: [
      { label: "Rev Growth", value: "+6.4%", trend: "up" },
      { label: "EPS Growth", value: "+12.8%", trend: "up" },
      { label: "FCF Growth", value: "+9.2%", trend: "up" },
      { label: "Div Growth", value: "+4.0%", trend: "up" },
      { label: "BV Growth", value: "−2.1%", trend: "down" },
      { label: "Asset Growth", value: "+3.6%", trend: "up" },
    ],
  },
  {
    label: "Returns",
    items: [
      { label: "1D", value: "−0.02%", trend: "down" },
      { label: "5D", value: "+1.24%", trend: "up" },
      { label: "1M", value: "+3.86%", trend: "up" },
      { label: "3M", value: "+8.92%", trend: "up" },
      { label: "YTD", value: "+12.4%", trend: "up" },
      { label: "1Y", value: "+24.6%", trend: "up" },
    ],
  },
];

export const mockCompanyProfile: CompanyProfile = {
  description:
    "Apple Inc. 设计、生产并销售智能手机、个人电脑、平板电脑、可穿戴设备、配件,并提供各类相关服务。" +
    "公司业务覆盖美洲、欧洲、大中华区、日本、亚太其他地区。其旗舰产品 iPhone 占公司总收入约 52%," +
    "服务业务(App Store / Apple Music / iCloud / AppleCare)增长迅速,毛利率显著高于硬件。" +
    "近年来公司持续布局 AI、AR/VR(Vision Pro)、自研芯片(Apple Silicon)等新兴方向。",
  ceo: "Tim Cook",
  founded: 1976,
  hq: "Cupertino, CA, USA",
  employees: 164_000,
  website: "apple.com",
  ipoDate: "1980-12-12",
  fiscalYearEnd: "09-28",
  sector: "Technology",
  industry: "Consumer Electronics",
  subIndustry: "Smartphones & Devices",
};

export const mockSectorPosition: SectorPosition = {
  sectorName: "Technology · Consumer Electronics",
  industryRank: 1,
  industryTotal: 28,
  sectorPct1d: 0.0042,
  sectorPctYtd: 0.1860,
  peers: [
    { ticker: "AAPL", name: "Apple Inc",      marketCap: 4_270e9, pe: 34.80, pct1d: -0.0002, pctYtd: 0.124, highlighted: true },
    { ticker: "MSFT", name: "Microsoft",      marketCap: 3_820e9, pe: 38.20, pct1d: 0.0021,  pctYtd: 0.142 },
    { ticker: "GOOGL", name: "Alphabet",      marketCap: 2_180e9, pe: 27.40, pct1d: -0.0008, pctYtd: 0.098 },
    { ticker: "AMZN", name: "Amazon",         marketCap: 1_940e9, pe: 56.10, pct1d: 0.0034,  pctYtd: 0.176 },
    { ticker: "META", name: "Meta Platforms", marketCap: 1_310e9, pe: 28.90, pct1d: 0.0042,  pctYtd: 0.218 },
    { ticker: "NVDA", name: "NVIDIA",         marketCap: 3_240e9, pe: 64.20, pct1d: 0.0087,  pctYtd: 0.342 },
    { ticker: "TSLA", name: "Tesla",          marketCap: 552e9,   pe: 78.40, pct1d: -0.0124, pctYtd: -0.084 },
  ],
};

export const mockKeyFactors: KeyFactorGroup[] = [
  {
    groupLabel: "Profitability",
    nodes: [
      { label: "ROE", value: "164.6%", benchmark: "vs 22.4% peer", trend: "up", score: 96 },
      { label: "Op Margin", value: "31.5%", benchmark: "vs 18.2% peer", trend: "up", score: 88 },
      { label: "FCF Margin", value: "27.8%", benchmark: "vs 12.1% peer", trend: "up", score: 92 },
    ],
  },
  {
    groupLabel: "Growth",
    nodes: [
      { label: "Rev CAGR(3Y)", value: "8.4%", benchmark: "vs 6.2% peer", trend: "up", score: 72 },
      { label: "EPS CAGR(3Y)", value: "13.6%", benchmark: "vs 9.8% peer", trend: "up", score: 78 },
      { label: "FCF CAGR(3Y)", value: "10.2%", benchmark: "vs 7.4% peer", trend: "up", score: 74 },
    ],
  },
  {
    groupLabel: "Valuation",
    nodes: [
      { label: "P/E (FWD)", value: "28.9x", benchmark: "vs 22.4x peer", trend: "down", score: 38 },
      { label: "EV/EBITDA", value: "26.2x", benchmark: "vs 17.8x peer", trend: "down", score: 32 },
      { label: "P/FCF", value: "32.4x", benchmark: "vs 24.1x peer", trend: "down", score: 36 },
    ],
  },
  {
    groupLabel: "Financial Strength",
    nodes: [
      { label: "Debt/Equity", value: "1.84", benchmark: "vs 0.72 peer", trend: "down", score: 42 },
      { label: "Current Ratio", value: "0.92", benchmark: "vs 1.45 peer", trend: "down", score: 38 },
      { label: "Interest Cov", value: "30.4x", benchmark: "vs 18.2x peer", trend: "up", score: 86 },
    ],
  },
];

export const mockAnalystConsensus: AnalystConsensus = {
  totalAnalysts: 44,
  buy: 22,
  outperform: 12,
  hold: 8,
  underperform: 1,
  sell: 1,
  meanRating: 1.84,
  targetPrice: { low: 220.0, mean: 312.5, high: 380.0, median: 305.0 },
  currentPrice: 287.44,
  revisions: [
    { date: "05/08", analyst: "Morgan Stanley",   from: "BUY",   to: "BUY",   tp: 325.0 },
    { date: "05/06", analyst: "Goldman Sachs",    from: "HOLD",  to: "BUY",   tp: 310.0 },
    { date: "05/02", analyst: "JP Morgan",        from: "BUY",   to: "BUY",   tp: 305.0 },
    { date: "04/28", analyst: "Bank of America",  from: "BUY",   to: "BUY",   tp: 320.0 },
    { date: "04/22", analyst: "Wedbush",          from: "HOLD",  to: "BUY",   tp: 330.0 },
    { date: "04/15", analyst: "UBS",              from: "BUY",   to: "HOLD",  tp: 280.0 },
  ],
};

export const mockInstitutionalHolding: InstitutionalHolding = {
  institutionalPct: 0.612,
  insiderPct: 0.0008,
  retailPct: 0.3872,
  topHolders: [
    { name: "Vanguard Group",       shares: 1_310e6, pctOut: 0.0882, pctChange:  0.0024, value: 376e9 },
    { name: "BlackRock",            shares: 1_090e6, pctOut: 0.0734, pctChange:  0.0012, value: 313e9 },
    { name: "Berkshire Hathaway",   shares: 905e6,   pctOut: 0.0610, pctChange: -0.0140, value: 260e9 },
    { name: "State Street",         shares: 558e6,   pctOut: 0.0376, pctChange:  0.0008, value: 160e9 },
    { name: "FMR (Fidelity)",       shares: 365e6,   pctOut: 0.0246, pctChange:  0.0034, value: 105e9 },
    { name: "Geode Capital",        shares: 280e6,   pctOut: 0.0189, pctChange:  0.0018, value: 80.4e9 },
    { name: "Norges Bank",          shares: 162e6,   pctOut: 0.0109, pctChange:  0.0006, value: 46.5e9 },
    { name: "T. Rowe Price",        shares: 144e6,   pctOut: 0.0097, pctChange: -0.0021, value: 41.4e9 },
  ],
  netFlow4q: [
    { quarter: "Q2 26", netFlow:  2.84 },
    { quarter: "Q1 26", netFlow:  1.62 },
    { quarter: "Q4 25", netFlow: -3.42 },
    { quarter: "Q3 25", netFlow:  4.18 },
  ],
};

export const mockFinancialHealth: FinancialHealthScore = {
  overall: 8.4,
  rating: "A",
  dimensions: [
    { label: "Profitability", score: 9.2, peer: 7.1, description: "ROE / 利润率显著高于同业" },
    { label: "Growth",        score: 7.6, peer: 6.8, description: "增长稳健,EPS CAGR 13.6%" },
    { label: "Solvency",      score: 6.8, peer: 7.4, description: "Debt/Equity 偏高,但利息覆盖充足" },
    { label: "Liquidity",     score: 7.2, peer: 7.6, description: "Current Ratio 0.92,资金运转高效" },
  ],
};

export const mockIncomeStatement: FinancialStatement = {
  periods: ["Q1'26", "Q4'25", "Q3'25", "Q2'25"],
  unit: "百万美元",
  rows: [
    { label: "Revenue",             values: [124_300, 119_580, 94_930, 85_780], yoy: 0.064, bold: true },
    { label: "  iPhone",            values: [65_770,  62_180,  46_220, 39_440], yoy: 0.056, indent: 1 },
    { label: "  Services",          values: [26_400,  25_010,  24_330, 22_890], yoy: 0.142, indent: 1 },
    { label: "  Wearables",         values: [11_840,  12_120,  9_040,  8_280],  yoy: -0.024, indent: 1 },
    { label: "  Mac",               values: [9_840,   9_320,   7_810,  6_840],  yoy: 0.082, indent: 1 },
    { label: "  iPad",              values: [7_320,   6_980,   6_280,  6_240],  yoy: 0.034, indent: 1 },
    { label: "Cost of Revenue",     values: [-66_870, -64_120, -52_010, -47_290], yoy: 0.058 },
    { label: "Gross Profit",        values: [57_430,  55_460,  42_920, 38_490], yoy: 0.071, bold: true },
    { label: "Operating Expenses",  values: [-18_660, -17_980, -15_320, -14_280], yoy: 0.044 },
    { label: "Operating Income",    values: [38_770,  37_480,  27_600, 24_210], yoy: 0.086, bold: true },
    { label: "Net Income",          values: [31_310,  30_220,  21_450, 19_440], yoy: 0.128, bold: true },
    { label: "EPS (Diluted)",       values: [2.11,    2.04,    1.45,   1.31],   yoy: 0.124 },
  ],
};

export const mockBalanceSheet: FinancialStatement = {
  periods: ["Q1'26", "Q4'25", "Q3'25", "Q2'25"],
  unit: "百万美元",
  rows: [
    { label: "Cash & Equivalents", values: [62_840, 65_180, 71_240, 68_420], yoy: -0.082 },
    { label: "Short-term Inv",     values: [34_220, 32_980, 28_640, 26_810], yoy: 0.276 },
    { label: "Receivables",        values: [28_460, 26_220, 22_180, 19_840], yoy: 0.434 },
    { label: "Inventory",          values: [7_280,  6_980,  6_440,  5_840],  yoy: 0.246 },
    { label: "Total Current Assets", values: [142_840, 138_440, 134_280, 126_840], yoy: 0.126, bold: true },
    { label: "PP&E",               values: [44_180, 43_820, 43_240, 42_680], yoy: 0.035 },
    { label: "Total Assets",       values: [375_240, 365_780, 358_460, 348_290], yoy: 0.078, bold: true },
    { label: "Accounts Payable",   values: [62_840, 58_980, 54_280, 49_280], yoy: 0.275 },
    { label: "Short-term Debt",    values: [16_240, 15_820, 14_980, 14_240], yoy: 0.141 },
    { label: "Long-term Debt",     values: [86_420, 88_240, 92_180, 95_820], yoy: -0.098 },
    { label: "Total Liabilities",  values: [274_280, 266_440, 263_180, 258_840], yoy: 0.060, bold: true },
    { label: "Total Equity",       values: [100_960, 99_340,  95_280,  89_450], yoy: 0.128, bold: true },
  ],
};

export const mockCashFlow: FinancialStatement = {
  periods: ["Q1'26", "Q4'25", "Q3'25", "Q2'25"],
  unit: "百万美元",
  rows: [
    { label: "Operating Cash Flow", values: [41_280, 38_640, 30_120, 26_840], yoy: 0.082, bold: true },
    { label: "  Net Income",        values: [31_310, 30_220, 21_450, 19_440], yoy: 0.128, indent: 1 },
    { label: "  D&A",               values: [3_240,  3_180,  3_080,  2_980],  yoy: 0.086, indent: 1 },
    { label: "  Working Capital",   values: [6_730,  5_240,  5_590,  4_420],  yoy: 0.214, indent: 1 },
    { label: "CapEx",               values: [-2_840, -2_620, -2_340, -2_180], yoy: 0.244 },
    { label: "Free Cash Flow",      values: [38_440, 36_020, 27_780, 24_660], yoy: 0.092, bold: true },
    { label: "Investing CF",        values: [-8_240, -6_840, -5_240, -4_280], yoy: 0.354 },
    { label: "Dividends Paid",      values: [-3_820, -3_780, -3_720, -3_680], yoy: 0.038 },
    { label: "Share Repurchase",    values: [-26_840, -24_280, -22_140, -19_640], yoy: 0.234 },
    { label: "Financing CF",        values: [-32_640, -30_140, -27_280, -24_840], yoy: 0.224 },
    { label: "Net Change in Cash",  values: [400,     1_660,   -2_400,  -2_280], yoy: 1.000, bold: true },
  ],
};

export const mockRevenueComposition: RevenueSegment[] = [
  { label: "iPhone",      revenue: 65.77, pct: 0.529, yoy: 0.056,  color: "var(--chart-blue)" },
  { label: "Services",    revenue: 26.40, pct: 0.212, yoy: 0.142,  color: "var(--chart-green)" },
  { label: "Wearables",   revenue: 11.84, pct: 0.095, yoy: -0.024, color: "var(--chart-purple)" },
  { label: "Mac",         revenue: 9.84,  pct: 0.079, yoy: 0.082,  color: "var(--chart-yellow)" },
  { label: "iPad",        revenue: 7.32,  pct: 0.059, yoy: 0.034,  color: "var(--chart-orange)" },
  { label: "Others",      revenue: 3.13,  pct: 0.026, yoy: 0.018,  color: "var(--chart-grey)" },
];

export const mockValuation: ValuationMetric[] = [
  { label: "P/E (TTM)",   current: 34.80, peerMin: 18.4, peerLow: 22.4, peerHigh: 38.2, peerMax: 64.2, industryAvg: 28.4 },
  { label: "P/E (FWD)",   current: 28.90, peerMin: 16.2, peerLow: 19.8, peerHigh: 32.4, peerMax: 52.8, industryAvg: 24.6 },
  { label: "EV/EBITDA",   current: 26.20, peerMin: 12.4, peerLow: 16.2, peerHigh: 24.8, peerMax: 42.6, industryAvg: 19.4 },
  { label: "P/S",         current: 8.45,  peerMin: 2.1,  peerLow: 3.8,  peerHigh: 7.2,  peerMax: 14.8, industryAvg: 5.4 },
  { label: "P/B",         current: 47.20, peerMin: 4.2,  peerLow: 8.4,  peerHigh: 18.2, peerMax: 52.4, industryAvg: 12.8 },
  { label: "P/FCF",       current: 32.40, peerMin: 14.8, peerLow: 18.6, peerHigh: 28.4, peerMax: 48.2, industryAvg: 23.6 },
];

export const mockDividendHistory: DividendYear[] = [
  { year: 2021, dps: 0.86, yieldPct: 0.0058, payoutRatio: 0.156 },
  { year: 2022, dps: 0.91, yieldPct: 0.0062, payoutRatio: 0.148 },
  { year: 2023, dps: 0.94, yieldPct: 0.0054, payoutRatio: 0.158 },
  { year: 2024, dps: 0.99, yieldPct: 0.0048, payoutRatio: 0.162 },
  { year: 2025, dps: 1.03, yieldPct: 0.0046, payoutRatio: 0.158 },
];

export const mockDividendRecords: DividendRecord[] = [
  { exDate: "2026-02-12", payDate: "2026-02-16", amount: 0.26, type: "Regular" },
  { exDate: "2025-11-13", payDate: "2025-11-17", amount: 0.26, type: "Regular" },
  { exDate: "2025-08-14", payDate: "2025-08-18", amount: 0.26, type: "Regular" },
  { exDate: "2025-05-15", payDate: "2025-05-19", amount: 0.25, type: "Regular" },
];

// ════════════════════════════════════════════════════════════════════════════
// 阶段二:5 Tab 框架 + 新增 12 个原子的 schema
// ════════════════════════════════════════════════════════════════════════════

// AlertHot — 热点事件条
export interface HotEvent {
  time: string;
  title: string;
  source: string;
  sentiment: "bull" | "bear" | "neutral";
}

// AlertCalendar — 公告与日程
export interface CalendarEvent {
  date: string;
  time?: string;
  title: string;
  type: "Earnings" | "Dividend" | "Conference" | "Filing" | "Other";
  isPast?: boolean;
}

// AIAnalysis — AI 分析
export interface AIAnalysisData {
  generatedAt: string;
  bullishPoints: string[];
  bearishPoints: string[];
  signals: { label: string; value: string; trend: Trend }[];
  summary: string;
}

// EventTracker — 事件跟踪
export interface TrackedEvent {
  date: string;
  type: "Earnings" | "M&A" | "Product" | "Regulatory" | "Analyst" | "Insider";
  title: string;
  impact: "high" | "medium" | "low";
  pctChange?: number;
}

// DolphinResearch — 海豚投研报告
export interface DolphinReport {
  date: string;
  title: string;
  category: "Deep" | "Quick" | "Earnings" | "Macro";
  rating?: "Strong Buy" | "Buy" | "Hold" | "Sell";
  targetPrice?: number;
  summary: string;
}

// NewsItem — 资讯
export interface NewsItem {
  time: string;
  source: string;
  title: string;
  summary?: string;
  sentiment?: "bull" | "bear" | "neutral";
  cover?: boolean;
}

// Discussion — 讨论
export interface DiscussionPost {
  user: string;
  avatar?: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  attached?: { ticker: string; pct: number };
}

// EarningsSummary — 业绩摘要
export interface EarningsHighlight {
  reportedAt: string;
  fiscalPeriod: string;
  revenue: { actual: number; estimate: number; yoy: number };
  eps: { actual: number; estimate: number; yoy: number };
  surprise: number; // %
  guidance?: { rev: [number, number]; eps: [number, number] };
}

// EarningsForecast — 业绩预测
export interface EarningsForecastQuarter {
  period: string;
  revLow: number;
  revHigh: number;
  revMean: number;
  epsLow: number;
  epsHigh: number;
  epsMean: number;
  analystCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Mock values
// ────────────────────────────────────────────────────────────────────────────

export const mockHotEvents: HotEvent[] = [
  { time: "15:32", title: "Apple to launch AI-powered Vision Pro 2 in Q3 2026", source: "Bloomberg", sentiment: "bull" },
  { time: "14:18", title: "China iPhone sales surge 18% YoY in April",         source: "Reuters",   sentiment: "bull" },
  { time: "13:45", title: "Antitrust probe expands to App Store fees",         source: "WSJ",       sentiment: "bear" },
  { time: "12:20", title: "Berkshire trims Apple stake by 2.3% in Q1",         source: "13F File",  sentiment: "bear" },
  { time: "10:05", title: "Apple Intelligence rolls out to EU markets",        source: "Apple PR",  sentiment: "neutral" },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { date: "05/14", time: "16:30", title: "Q2 2026 Earnings Call",         type: "Earnings",   isPast: false },
  { date: "05/15", time: "08:00", title: "10-Q Filing Deadline",          type: "Filing",     isPast: false },
  { date: "05/18",                title: "Ex-Dividend Date — $0.26",      type: "Dividend",   isPast: false },
  { date: "06/10",                title: "WWDC 2026 Keynote",             type: "Conference", isPast: false },
  { date: "05/08", time: "16:00", title: "Q1 2026 Earnings — Beat $0.18", type: "Earnings",   isPast: true },
];

export const mockAIAnalysis: AIAnalysisData = {
  generatedAt: "2026-05-08 16:42 EDT",
  bullishPoints: [
    "服务业务 YoY +14.2%,持续高毛利,占比突破 21%",
    "现金流 41B 创纪录,FCF margin 27.8%",
    "AI Devices 概念催化,Vision Pro 2 即将发布",
    "44 位分析师中 34 位 Buy/Outperform,目标价中位数 305(+6.1%)",
  ],
  bearishPoints: [
    "Wearables YoY -2.4%,可穿戴增长疲软",
    "P/E 34.8x 远高于行业均值 28.4x,估值偏高",
    "Berkshire Q1 减持 2.3%,机构信心边际下降",
    "大中华区监管不确定性持续",
  ],
  signals: [
    { label: "Technical",  value: "Bullish",  trend: "up" },
    { label: "Fundamental", value: "Strong", trend: "up" },
    { label: "Sentiment",   value: "Mixed",  trend: "flat" },
    { label: "Valuation",   value: "Stretched", trend: "down" },
  ],
  summary:
    "综合技术面、基本面、情绪面、估值面分析:Apple 短期受 AI 叙事和强劲现金流支撑,但估值偏离 peer median 40%以上。" +
    "建议在 Vision Pro 2 发布前后保持中性配置,关注服务业务持续渗透与 Wearables 触底回升信号。",
};

export const mockTrackedEvents: TrackedEvent[] = [
  { date: "05/08", type: "Earnings",  title: "Q1 2026 EPS $2.11 beats by $0.18",  impact: "high",   pctChange: 0.034 },
  { date: "05/06", type: "Analyst",   title: "Goldman upgrades to BUY, PT $310",  impact: "medium", pctChange: 0.012 },
  { date: "04/28", type: "Product",   title: "Vision Pro 2 Q3 launch confirmed",  impact: "high",   pctChange: 0.024 },
  { date: "04/22", type: "Regulatory", title: "EU DMA app store compliance ruling", impact: "medium", pctChange: -0.018 },
  { date: "04/15", type: "Insider",   title: "Cook sells 80K shares ($23M)",      impact: "low",    pctChange: -0.004 },
  { date: "04/10", type: "M&A",       title: "Acquires AI startup Perceptive ($800M)", impact: "medium", pctChange: 0.008 },
];

export const mockDolphinReports: DolphinReport[] = [
  {
    date: "05/08",
    title: "Apple Q1 2026:服务业务再创高,但 Wearables 拖累略超预期",
    category: "Earnings",
    rating: "Buy",
    targetPrice: 320.0,
    summary: "Q1 营收 124.3B(+6.4% YoY)超预期,服务贡献 26.4B(+14.2%)是亮点。Wearables 拖累 -2.4%。",
  },
  {
    date: "04/22",
    title: "Vision Pro 2:这次能成为 iPhone 时刻吗?",
    category: "Deep",
    rating: "Hold",
    summary: "Vision Pro 2 价格区间 $1,999-$2,499,定位 AR Pro Consumer。技术成熟但内容生态仍是关键。",
  },
  {
    date: "04/10",
    title: "苹果中国市场:从渠道到 AI 本土化的全链条复盘",
    category: "Deep",
    summary: "大中华区 Q1 增长 8%,但市场份额仍受华为蚕食。AI 本土化(百度/阿里合作)是关键反击。",
  },
];

export const mockNewsItems: NewsItem[] = [
  { time: "15:32", source: "Bloomberg", title: "Apple to launch AI-powered Vision Pro 2 in Q3 2026", sentiment: "bull", cover: true,
    summary: "Sources familiar with the matter say Apple is set to unveil a refreshed Vision Pro at WWDC 2026,featuring on-device LLM and 30% lower weight." },
  { time: "14:18", source: "Reuters",   title: "China iPhone sales surge 18% YoY in April",         sentiment: "bull" },
  { time: "13:45", source: "WSJ",       title: "Antitrust probe expands to App Store fees",         sentiment: "bear" },
  { time: "12:20", source: "13F",       title: "Berkshire trims Apple stake by 2.3% in Q1",         sentiment: "bear" },
  { time: "10:05", source: "Apple PR",  title: "Apple Intelligence rolls out to EU markets",        sentiment: "neutral" },
  { time: "09:15", source: "Reuters",   title: "TSMC confirms 2nm chip for Apple in 2026",          sentiment: "bull" },
];

export const mockDiscussions: DiscussionPost[] = [
  {
    user: "金融老炮",
    time: "15 min ago",
    content: "Q1 EPS 超预期 $0.18,服务业务再创新高。但 wearables 拖累有点超预期,Vision Pro 2 必须接力。",
    likes: 142,
    comments: 38,
    attached: { ticker: "AAPL", pct: 0.034 },
  },
  {
    user: "Tech 价值",
    time: "1 hour ago",
    content: "34.8x P/E 在 AI 叙事下还能撑多久?Buffett 减持是个信号。建议等 Vision Pro 2 发布后回调买入。",
    likes: 86,
    comments: 24,
  },
  {
    user: "Apple 死忠",
    time: "3 hours ago",
    content: "服务 14% YoY 增长在大盘是稀缺资产。继续持有,目标 $320。",
    likes: 56,
    comments: 12,
  },
];

export const mockEarningsHighlight: EarningsHighlight = {
  reportedAt: "2026-05-08 16:00 EDT",
  fiscalPeriod: "Q1 FY26 (ended Mar 29, 2026)",
  revenue: { actual: 124_300, estimate: 122_800, yoy: 0.064 },
  eps: { actual: 2.11, estimate: 1.93, yoy: 0.128 },
  surprise: 0.0933,
  guidance: { rev: [130_000, 134_000], eps: [2.18, 2.28] },
};

export const mockEarningsForecast: EarningsForecastQuarter[] = [
  { period: "Q2'26", revLow: 91_200, revHigh: 96_800,  revMean: 93_500,  epsLow: 1.41, epsHigh: 1.56, epsMean: 1.48, analystCount: 28 },
  { period: "Q3'26", revLow: 110_400, revHigh: 116_200, revMean: 113_200, epsLow: 1.82, epsHigh: 1.98, epsMean: 1.90, analystCount: 26 },
  { period: "Q4'26", revLow: 132_400, revHigh: 138_800, revMean: 135_400, epsLow: 2.34, epsHigh: 2.52, epsMean: 2.43, analystCount: 30 },
  { period: "Q1'27", revLow: 128_200, revHigh: 134_600, revMean: 131_200, epsLow: 2.24, epsHigh: 2.42, epsMean: 2.33, analystCount: 22 },
];
