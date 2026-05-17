/**
 * Mock data for stock detail v2 — Bloomberg + 长桥 US 设计语言.
 * AAPL.US 基线,覆盖阶段一 16 个组件所需全部 schema.
 */
import { formatNum, formatPct, formatCompact } from "@/lib/utils";

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
  // 长桥版扩展
  /** 关注人数(用于 ❤️ 数字) */
  watchers?: number;
  /** 标签 chip(关注度排名/热点/概念) */
  chips?: { label: string; pct?: number; type?: "rank" | "tag" }[];
  /** US 版扩展:延迟报价标记(显示 D 角标) */
  delayed?: boolean;
  /** US 版扩展:AI 评分(顶部 logo 旁小数字 chip,如 74) */
  aiScore?: number;
  /** US 版扩展:顶部双 pill(Earnings 03/24 / Live 03/24) */
  pills?: { kind: "earnings" | "live" | "info"; label: string; date?: string }[];
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

/** US 客户端 IntradayChart — 24hr 延长盘三段 + 多周期 K 线 */
export type IntradayRange = "1D" | "5D" | "1M" | "3M" | "YTD" | "1Y" | "5Y" | "Max";

export interface IntradaySegment {
  /** 三段标签 */
  kind: "pre" | "reg" | "post";
  /** Y 轴价格序列 */
  values: number[];
}

/** 5D+ 周期 K 线蜡烛 */
export interface Candle {
  /** X 轴标签 (e.g. "Apr 8" / "10:30") */
  t: string;
  /** 开盘 */
  o: number;
  /** 最高 */
  h: number;
  /** 最低 */
  l: number;
  /** 收盘 */
  c: number;
  /** 成交量 */
  v: number;
}

export interface CandleSeries {
  period: Exclude<IntradayRange, "1D">;
  candles: Candle[];
  /** X 轴稀疏标签 (3-5 个) */
  xLabels: string[];
}

export interface IntradayMeta {
  activeRange: IntradayRange;
  ranges: IntradayRange[];
  /** 1D 三段延长盘价格序列 */
  segments: IntradaySegment[];
  /** Day high / low 标注点 */
  high: number;
  low: number;
  /** 参考虚线 (e.g. 前收) */
  reference: number;
  /** 1D 时间轴标签(20:00 / 04:00 / 09:30 / 16:00 / 20:00) */
  ticks: string[];
  /** 5D+ 各周期 K 线数据 */
  candleSeries: CandleSeries[];
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
// 4. QuoteKV → US 客户端 Key statistics(Day/52W range slider + 6 KV + Expand)
// ────────────────────────────────────────────────────────────────────────────
export interface KeyStatRange {
  low: number;
  high: number;
  current: number;
}

export interface KeyStatKV {
  label: string;
  value: string;
  /** Optional accent color (e.g. for delta) */
  tone?: "default" | "up" | "down";
}

/**
 * US 客户端 Key statistics — Day's range / 52W range 双 slider + 6 KV + Expand。
 * 用 QuoteKVGroup 类型保留兼容(便于已有 import 不动),内部新结构。
 */
export interface QuoteKVGroup {
  dayRange: KeyStatRange;
  weekRange52: KeyStatRange;
  kvs: KeyStatKV[];
}

// ────────────────────────────────────────────────────────────────────────────
// 5. CompanyProfile 公司概况 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 描述文字
// - 行业胶囊条:行业名 + 行业总市值 + 行业涨跌 + 公司总市值 + 市值排名 + 行业 mini chart
// - 去掉 CEO/Founded/HQ/Employees/IPO/FY/Website KV(线上无)
export interface CompanyProfile {
  /** Long company description, truncated by line-clamp in compact form */
  description: string;
  /** Total market cap, big number e.g. "$3,608.76B" */
  marketCap: string;
  /** Section badges shown below description */
  badges: { label: string; tone?: "default" | "down" | "up" | "accent"; delta?: string }[];
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
// 7. KeyFactors 关键因子 — 长桥版思维导图
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:树状思维导图(中心节点 → 多层子节点)
// importance 3 色:high=重要 / medium=次要 / low=一般
// 无数字、无 score bar
export type KeyFactorImportance = "high" | "medium" | "low";

export interface KeyFactorNode {
  id: string;
  label: string;
  importance: KeyFactorImportance;
  children?: KeyFactorNode[];
}

// ────────────────────────────────────────────────────────────────────────────
// 8. AnalystConsensus 分析师一致预期
// ────────────────────────────────────────────────────────────────────────────
export type AnalystRating = "Strong buy" | "Buy" | "Hold" | "Sell" | "Strong sell";

export interface AnalystConsensus {
  /** As-of date e.g. "Jun 11, 2025" */
  date: string;
  /** Total analyst count, shown in donut center */
  totalAnalysts: number;
  /** 5-level distribution (pct, sums to 1) */
  distribution: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
  /** Price forecast KV */
  priceForecast: { target: number; pct: number };
  /** Overall analyst rating */
  rating: AnalystRating;
}

// ────────────────────────────────────────────────────────────────────────────
// 9. InstitutionalHolding 机构持仓 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:4 列表格(股东名称 / 持股比例 / 较内份额增减 / 披露时间)
// 不再有 ownership donut、netFlow waterfall
/** US 客户端 — Shareholder activity bar(双向柱) */
export interface ShareholderBar {
  /** Quarter label, e.g. "Q4 2022" */
  period: string;
  /** Net shares; positive = net buy / negative = net sell */
  netShares: number;
}

export interface InstitutionalHolding {
  date: string;       // "Jun 11, 2025"
  unit: string;       // "Shares"
  bars: ShareholderBar[];
}

// ────────────────────────────────────────────────────────────────────────────
// 10. FinancialHealthScore 财务评分 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 头部 card:大字 grade(B↓) + 行业名 + 同行业排名 + 行业中位数/平均值
// - 5 轴雷达图(盈利/成长/现金/运营/安全)
// - 右侧 5 类评分明细(每类 grade + 指标行 value + grade + trend)
export type RatingGrade = "A" | "B" | "C" | "D" | "E";
export type RatingTrend = "up" | "down" | "flat";

export interface FinancialHealthIndicator {
  label: string;        // 净资产收益率(ROE)
  value: string;         // 141.47%
  grade: RatingGrade;
  trend: RatingTrend;
}

export interface FinancialHealthCategory {
  label: string;                    // 盈利评分 / 成长评分 / 现金评分 / 运营评分 / 负债评分
  axis: string;                     // 雷达图轴名:盈利 / 成长 / 现金 / 运营 / 安全
  grade: RatingGrade;
  indicators: FinancialHealthIndicator[];
}

export interface FinancialHealthScore {
  overall: RatingGrade;             // B
  overallTrend: RatingTrend;        // down
  industry: string;                  // 硬件、存储及外设产品行业
  industryRank: { rank: number; total: number };  // 2/46
  industryMedian: RatingGrade;      // C
  industryAvg: RatingGrade;          // C
  categories: FinancialHealthCategory[];
  updatedAt: string;                 // 15/05/2026 更新
}

// ────────────────────────────────────────────────────────────────────────────
// 11/12/13. 三大财务报表 — 长桥版(柱状图替代纯表格)
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 顶部 metric tab(每股收益/ROE/营业收入/净利润/营业利润/毛利率/净利率 ...)
// - 中间 5 期柱状图(单季 / 年报可切换)
// - 下方 1–3 行明细(value + YoY + 股价)
export type MetricFormat = "currency" | "percent" | "number" | "ratio";

/** US 客户端 Financials — 单季快照(双柱 + Net margin 线) */
export interface FinancialQuarter {
  /** Quarter label e.g. "Q3 2024" */
  period: string;
  /** Fiscal period range e.g. "09/09/2024 - 12/30/2024" */
  rangeLabel: string;
  /** Total revenue ($B) */
  revenue: number;
  /** Net income ($B) */
  netIncome: number;
  /** Net margin 0–1 */
  netMargin: number;
}

/** US 客户端 Financials — P/L / Balance sheet / Cash flow tab 切换 */
export interface FinancialBarReport {
  /** Tab label,作为 unique key */
  title: "P/L" | "Balance sheet" | "Cash flow";
  /** 5 个季度趋势 */
  quarters: FinancialQuarter[];
}

// ────────────────────────────────────────────────────────────────────────────
// 14. RevenueComposition 营收构成 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 多年(2013–2025)叠加柱状图
// - "行业 / 地区" tab 切换
// - 下方明细表:名称 / 营收(亿) / 占比
/** Sankey 节点类型(决定配色 + label 语义) */
export type SankeyKind = "revenue" | "profit" | "cost";

/** US 客户端 Sankey 节点 (多阶段) */
export interface SankeyNode {
  /** 唯一 id, 用于 link 引用 */
  id: string;
  /** Display label */
  label: string;
  /** 实际数值(B 单位) — 决定节点高度 + flow 宽度 */
  rawValue: number;
  /** 格式化后的显示值,如 "$292.35B" */
  value: string;
  /** Period-over-period pct, signed e.g. 0.0125 / -0.1224 */
  pct: number;
  /** Stage 列位置 0..N (从左到右) */
  stage: number;
  /** 类型(决定配色) */
  kind: SankeyKind;
}

/** Sankey 流(连边),颜色随 to 节点的 kind 决定 */
export interface SankeyLink {
  from: string;
  to: string;
  /** flow 强度(B 单位) — 决定 path 宽度 */
  value: number;
}

/** US 客户端 Revenue breakdown — 5 阶段 Sankey */
export interface RevenueCompositionData {
  /** "Quarterly" / "Annual" cycle */
  cycle: "Quarterly" | "Annual";
  /** Bottom X-axis periods (横轴时间轴) */
  periods: string[];
  /** 当前激活的 period (高亮) */
  activePeriod: string;
  /** 所有节点 (跨 stage) */
  nodes: SankeyNode[];
  /** 所有连边 */
  links: SankeyLink[];
}

// ────────────────────────────────────────────────────────────────────────────
// 15. Valuation 估值分析 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:4 个 metric mini-chart 2x2 grid,每个内含:
// - 顶部:metric label + current value + 同行业排名 + 时间区间 tab(1年/3年/5年/10年)
// - 中部:股价折线 + 高/中/低分位 dashed reference 线
// - 图例 dot:股价 / 高分位 / 中位 / 低分位
export type ValuationFormat = "ratio" | "percent";

export interface ValuationHistoryPoint {
  date: string;             // "05/2025" 月份
  price: number;            // 估值倍数
}

/** US 客户端 Stock valuation — 三层 donut + 行业排名说明 banner */
export interface ValuationMetric {
  date: string;             // "Jun 11, 2025"
  stockPrice: number;       // 6.40
  eps: number;              // 1.00
  peRatio: number;          // 6.4
  /** 3-year low / median / high(用于"near 3-year low"判断) */
  peLow3y: number;
  peMedian3y: number;
  peHigh3y: number;
  /** 行业内排名(2/58) */
  industryRank: number;
  industryTotal: number;
  /** 行业 P/E 中位数 */
  industryMedian: number;
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
  nameEn: "Apple Inc.",
  bbgType: "US Equity",
  price: 287.44,
  delta: -0.07,
  pct: -0.0024,
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
  // 长桥版扩展
  watchers: 386_000,
  chips: [
    { label: "Attention Top3", type: "rank" },
    { label: "Growth Tech",    pct: -0.010, type: "tag" },
    { label: "Hot Deal Top2",  type: "rank" },
  ],
  delayed: true,
  aiScore: 74,
  pills: [
    { kind: "earnings", label: "Earnings", date: "03/24/2025" },
    { kind: "live",     label: "Live",     date: "03/24/2025" },
  ],
};

// US 客户端 — 24hr 延长盘价格序列(deterministic 模拟,均值回归到 anchor)
//   - 段间端点连续:下一段起点 = 上一段末值,避免视觉断裂
//   - anchor 拉回:wiggle 围绕 anchor,长程不漂移
function genSeries(
  start: number,
  count: number,
  vol: number,
  seed: number,
  anchor: number = start,
): number[] {
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < count; i++) {
    const wiggle = Math.sin((i + seed) * 0.6) * vol + Math.cos((i + seed) * 0.23) * vol * 0.4;
    // 均值回归: 偏离 anchor 越多, 回归力越强
    const meanRevert = (anchor - v) * 0.06;
    v += wiggle + meanRevert;
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

/** 生成一段 K 线蜡烛数据 (deterministic, 用 sin/cos) */
function genCandles(
  period: Exclude<IntradayRange, "1D">,
  start: number,
  count: number,
  vol: number,
  seed: number,
  labels: string[],
): CandleSeries {
  const candles: Candle[] = [];
  let c = start;
  for (let i = 0; i < count; i++) {
    const drift = Math.sin((i + seed) * 0.32) * vol + Math.cos((i + seed) * 0.11) * vol * 0.6;
    const o = c;
    c = Number((c + drift).toFixed(2));
    const h = Number((Math.max(o, c) + Math.abs(Math.sin((i + seed) * 0.7)) * vol * 0.5).toFixed(2));
    const l = Number((Math.min(o, c) - Math.abs(Math.cos((i + seed) * 0.9)) * vol * 0.5).toFixed(2));
    const v = Math.round(
      1_000_000 + Math.abs(Math.sin((i + seed) * 0.5)) * 3_000_000 + (i % 7) * 200_000,
    );
    candles.push({ t: `${i}`, o, h, l, c, v });
  }
  // 把 X 轴标签均匀分配到首/中/末等位置上,候选用 labels.length 个稀疏点
  return { period, candles, xLabels: labels };
}

// AAPL 基准价(与 mockQuote.price 对齐) — 全模块价位数据皆以此为锚
const BASE_PRICE = 287.44;
const PREV_CLOSE = 287.51;

// 三段端点连续:pre 末 → reg 首 → reg 末 → post 首 (无视觉跳跃)
const _preSeg  = genSeries(PREV_CLOSE,                   40, 0.4, 1, PREV_CLOSE);
const _regSeg  = genSeries(_preSeg[_preSeg.length - 1],  80, 0.9, 2, BASE_PRICE);
const _postSeg = genSeries(_regSeg[_regSeg.length - 1],  30, 0.3, 3, BASE_PRICE);

// 计算实际全段 high / low (用于标签)
const _allValues = [..._preSeg, ..._regSeg, ..._postSeg];
const _high = Math.max(..._allValues);
const _low  = Math.min(..._allValues);

export const mockIntradayMeta: IntradayMeta = {
  activeRange: "1D",
  ranges: ["1D", "5D", "1M", "3M", "YTD", "1Y", "5Y", "Max"],
  segments: [
    { kind: "pre",  values: _preSeg  },  // 04:00 → 09:30 pre-market   (5.5h)
    { kind: "reg",  values: _regSeg  },  // 09:30 → 16:00 regular      (6.5h)
    { kind: "post", values: _postSeg },  // 16:00 → 20:00 after-hours  (4h)
  ],
  high: Number(_high.toFixed(2)),
  low:  Number(_low.toFixed(2)),
  reference: PREV_CLOSE,
  // 时间标签按真实美股延长盘时间(总 16h, 04:00 → 20:00)
  ticks: ["04:00", "09:30", "12:45", "16:00", "20:00"],
  candleSeries: [
    genCandles("5D",  BASE_PRICE - 4,  60, 1.1, 11, ["Mon", "Tue", "Wed", "Thu", "Fri"]),
    genCandles("1M",  BASE_PRICE - 10, 60, 1.6, 22, ["Apr 8", "Apr 15", "Apr 22", "Apr 29", "May 6"]),
    genCandles("3M",  BASE_PRICE - 22, 60, 2.4, 33, ["Feb", "Mar", "Apr", "May"]),
    genCandles("YTD", BASE_PRICE - 35, 60, 3.1, 44, ["Jan", "Feb", "Mar", "Apr", "May"]),
    genCandles("1Y",  BASE_PRICE - 55, 60, 4.2, 55, ["Jun '24", "Sep '24", "Dec '24", "Mar '25"]),
    genCandles("5Y",   95.40,          60, 6.5, 66, ["2021", "2022", "2023", "2024", "2025"]),
    genCandles("Max",  18.50,          60, 9.0, 77, ["2005", "2010", "2015", "2020", "2025"]),
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

// US 客户端 Key statistics — Day's range + 52W range slider + 23 KV(8 行 3 列)
//   字段顺序严格按 Figma 1:205,数值口径用 lib/utils 格式化
//   AAPL 真实形态:price ≈ 287.44, P/E ≈ 35, EPS ≈ 8.26, mkt cap ≈ 4.27T
export const mockQuoteKV: QuoteKVGroup = {
  dayRange:    { low: 285.88, high: 289.41, current: BASE_PRICE },
  weekRange52: { low: 178.42, high: 299.21, current: BASE_PRICE },
  kvs: [
    // Row 1
    { label: "Prev. close",          value: formatNum(PREV_CLOSE, 2) },
    { label: "Open",                 value: formatNum(286.20, 2) },
    { label: "Market cap",           value: formatCompact(4_270_000_000_000, 2) },
    // Row 2
    { label: "Turnover ratio",       value: formatPct(0.33, 2) },
    { label: "P/E (TTM)",            value: formatNum(34.80, 2) },
    { label: "Bid/ask ratio",        value: "0.71" },
    // Row 3
    { label: "Vol. ratio",           value: formatNum(0.92, 2) },
    { label: "Vol.",                 value: formatCompact(48_237_412, 2) },
    { label: "Shares",               value: formatCompact(14_850_000_000, 2) },
    // Row 4
    { label: "Amplitude",            value: formatPct(1.23, 2) },
    { label: "Floating shares",      value: formatCompact(14_780_000_000, 2) },
    { label: "Free-float mkt. cap",  value: formatCompact(4_249_900_000_000, 2) },
    // Row 5
    { label: "EPS (TTM)",            value: formatNum(8.26, 2) },
    { label: "P/B",                  value: formatNum(58.40, 2) },
    { label: "Dividend yield (TTM)", value: formatPct(0.46, 2) },
    // Row 6
    { label: "P/E (dynamic)",        value: formatNum(33.10, 2) },
    { label: "EPS (dynamic)",        value: formatNum(8.68, 2) },
    { label: "Avg. price",           value: formatNum(287.62, 2) },
    // Row 7
    { label: "Dividend (TTM)",       value: formatNum(1.04, 2) },
    { label: "P/E (static)",         value: formatNum(36.20, 2) },
    { label: "EPS (static)",         value: formatNum(7.94, 2) },
    // Row 8
    { label: "BVPS",                 value: formatNum(4.92, 2) },
    { label: "Min. lot size",        value: "1" },
    { label: "Currency",             value: "USD" },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// US-only Quote 页组件 schema(OrderBookL2 / CapitalFlow / Shorting)
// ────────────────────────────────────────────────────────────────────────────

/** US 客户端 Order book(L2) — 中价 strip + 10 档明细 + 65/35 balance */
export interface OrderBookLevel {
  level: number;
  bidQty: number;
  bidPx: number;
  askPx: number;
  askQty: number;
}

export interface OrderBookL2Data {
  bidTotal: number;
  askTotal: number;
  midBid: number;
  midAsk: number;
  levelCount: number;          // 10
  bidBalancePct: number;       // 0.6527
  askBalancePct: number;       // 0.3265
  /** 5 个明细档 */
  rows: OrderBookLevel[];
  /** 中段 mini chart 数据(价格折线 + 量柱) */
  miniChart: {
    priceLow: number;
    priceHigh: number;
    priceLine: number[];
    /** 与 priceLine 等长的成交量序列 */
    volumeBars: number[];
    /** Y 轴量峰值标签 (e.g. "76.21K") */
    volumePeakLabel: string;
    /** Y 轴量谷值标签 (e.g. "22") */
    volumeFloorLabel: string;
    /** X 轴 4 个时间标签 (e.g. ["235.211","256.320","265.310","285.100"]) */
    xLabels: string[];
  };
}

/** US 客户端 Capital flow — Net Inflow donut + Inflow/Outflow + L/M/S 三档 + 区域图 */
export interface CapitalFlowBucket {
  /** Large / Medium / Small */
  size: "Large" | "Medium" | "Small";
  inflow: number;
  outflow: number;
}

export interface CapitalFlowData {
  unit: string;            // "M"
  netInflow: number;       // 31_816.500
  totalInflow: number;     // 681_276.47
  totalOutflow: number;    // 649_459.28
  buckets: CapitalFlowBucket[];
  /** Real-time series (M),用于区域图 */
  realtime: { t: string; v: number }[];
  /** 时间轴标签 */
  ticks: string[];
}

/** US 客户端 Shorting — Short sale / Short position ratio tab + 6 KV + 三线图 + 量柱 */
export type ShortingTab = "sale" | "position";

export interface ShortingMetrics {
  date: string;            // "Fri Apr 25, 2025"
  shortSalePct: number;    // 0.0058
  nasdaq: number;          // 334.00
  closingPrice: number;    // 9.07
  volume: number;          // 22.00
  shortVolume: number;     // 22.00
  pctChg: number;          // -0.022
}

export interface ShortingData {
  activeTab: ShortingTab;
  source: string;          // "NASDAQ"
  metrics: ShortingMetrics;
  /** 三线图(short sale% / NASDAQ / closing price) */
  lines: {
    label: string;
    color: string;
    points: number[];
  }[];
  /** 底部量柱 */
  volumeBars: number[];
  /** X 轴标签(3 个) */
  xLabels: string[];
}

// OrderBookL2 — 价位锚定 BASE_PRICE($287.44), 档间 spread ~$0.10
//   档位号设计:level 1 = 最优买/卖一, 向外档位价格递减/递增
//   BBO 总量 = sum(rows.bidQty / askQty), 保证内部一致
const _obRows: OrderBookLevel[] = [
  { level: 1,  bidQty:  820, bidPx: 287.40, askPx: 287.46, askQty: 1_240 },
  { level: 2,  bidQty: 1_540, bidPx: 287.32, askPx: 287.54, askQty:   964 },
  { level: 3,  bidQty:   650, bidPx: 287.25, askPx: 287.61, askQty: 1_810 },
  { level: 4,  bidQty: 2_340, bidPx: 287.18, askPx: 287.69, askQty:   720 },
  { level: 5,  bidQty:   480, bidPx: 287.10, askPx: 287.77, askQty: 1_405 },
  { level: 6,  bidQty: 1_120, bidPx: 287.02, askPx: 287.84, askQty:   930 },
  { level: 7,  bidQty:   780, bidPx: 286.94, askPx: 287.92, askQty:   515 },
  { level: 8,  bidQty:   340, bidPx: 286.86, askPx: 288.01, askQty: 1_260 },
  { level: 9,  bidQty: 1_960, bidPx: 286.78, askPx: 288.10, askQty:   665 },
  { level: 10, bidQty:   590, bidPx: 286.70, askPx: 288.18, askQty:   810 },
];
const _bidTotal = _obRows.reduce((a, r) => a + r.bidQty, 0);
const _askTotal = _obRows.reduce((a, r) => a + r.askQty, 0);

export const mockOrderBookL2: OrderBookL2Data = {
  bidTotal: _bidTotal,
  askTotal: _askTotal,
  midBid: _obRows[0].bidPx,
  midAsk: _obRows[0].askPx,
  levelCount: 10,
  bidBalancePct: _bidTotal / (_bidTotal + _askTotal),
  askBalancePct: _askTotal / (_bidTotal + _askTotal),
  rows: _obRows,
  miniChart: {
    // 盘中价格走势(过去 ~30 分钟,1m 一点)
    priceLow:  286.62,
    priceHigh: 287.84,
    priceLine: [
      287.20, 287.05, 286.92, 286.78, 286.72, 286.68, 286.65, 286.62,
      286.74, 286.91, 287.08, 287.22, 287.34, 287.46, 287.58, 287.72,
    ],
    volumeBars: [
      48_300, 62_100, 71_400, 58_200, 41_700, 39_900, 35_500, 28_400,
      44_200, 56_800, 68_300, 79_210, 65_400, 52_100, 41_500, 33_800,
    ],
    volumePeakLabel: "79.2K",
    volumeFloorLabel: "0",
    // 盘中时间刻度(过去 30 分钟,5 分钟一刻度)
    xLabels: ["10:30", "10:35", "10:40", "10:45", "10:50", "10:55", "11:00"],
  },
};

// Capital flow — AAPL 盘中资金流向($M, 自洽:Total = Large + Medium + Small)
//   AAPL 日成交额 ≈ $13.8B,资金流 inflow + outflow ≈ 全天成交额,符合量纲
const _cfBuckets = [
  { size: "Large"  as const, inflow: 3_482.40, outflow: 3_388.62 },
  { size: "Medium" as const, inflow: 1_864.18, outflow: 1_792.06 },
  { size: "Small"  as const, inflow:   795.32, outflow:   758.14 },
];
const _cfInflow  = _cfBuckets.reduce((a, b) => a + b.inflow,  0);
const _cfOutflow = _cfBuckets.reduce((a, b) => a + b.outflow, 0);

export const mockCapitalFlow: CapitalFlowData = {
  unit: "$M",
  netInflow: Number((_cfInflow - _cfOutflow).toFixed(2)),
  totalInflow:  Number(_cfInflow.toFixed(2)),
  totalOutflow: Number(_cfOutflow.toFixed(2)),
  buckets: _cfBuckets,
  // 盘中净流入序列(80 点, 9:30 → 16:00, 单位 $M)
  realtime: Array.from({ length: 80 }, (_, i) => {
    const t = i / 80;
    const hour = 9 + Math.floor(t * 6.5);
    const min  = Math.floor((t * 6.5 - Math.floor(t * 6.5)) * 60);
    // 从 -30M 起步,午后转正,收盘 +220M(波动 ±60M)
    const v = -30 + t * 250 + Math.sin(i * 0.22) * 55 + Math.cos(i * 0.09) * 20;
    return {
      t: `${hour}:${String(min < 30 ? min + 30 : min).padStart(2, "0")}`,
      v: Number(v.toFixed(2)),
    };
  }),
  ticks: ["9:30", "12:00", "13:00", "16:00"],
};

// Shorting — AAPL 做空数据(NASDAQ 来源, 与 BASE_PRICE / mockQuote 对齐)
//   口径:
//   - shortSalePct = 当日 short volume / 当日 total volume (NASDAQ)
//   - nasdaq       = 当日 NASDAQ 上的 short volume (M shares,即 short volume in millions)
//   - closingPrice = $287.44(与 hero 一致)
//   - volume       = NASDAQ 当日总成交量(M shares)
//   - shortVolume  = NASDAQ 当日 short volume(M shares,= nasdaq)
//   - pctChg       = 当日收盘涨跌幅 -0.24%
export const mockShorting: ShortingData = {
  activeTab: "sale",
  source: "NASDAQ",
  metrics: {
    date: "Fri May 16, 2025",
    shortSalePct: 0.185,     // 18.5% (典型 AAPL short volume ratio)
    nasdaq: 8.92,            // 8.92M short shares on NASDAQ
    closingPrice: BASE_PRICE,// 287.44
    volume: 48.24,           // 48.24M total shares
    shortVolume: 8.92,       // 8.92M short shares (= NASDAQ short volume)
    pctChg: -0.0024,         // -0.24% (与 mockQuote.pct 一致)
  },
  // 40 个交易日的双线(短率 vs 收盘价),量柱为同期 short volume
  lines: [
    {
      label: "Short sale %",
      color: "var(--color-warn)",
      // 18-22% 区间波动
      points: Array.from({ length: 40 }, (_, i) =>
        18.5 + Math.sin(i * 0.35) * 1.8 + Math.cos(i * 0.11) * 0.8,
      ),
    },
    {
      label: "Closing price",
      color: "var(--color-down)",
      // 收盘价 270-295 区间,终值 287.44
      points: Array.from({ length: 40 }, (_, i) =>
        270 + (i / 39) * 17.44 + Math.sin(i * 0.42) * 3.5 + Math.cos(i * 0.17) * 1.8,
      ),
    },
  ],
  // Short volume(M shares),40 个交易日
  volumeBars: Array.from({ length: 40 }, (_, i) =>
    Number((6 + Math.abs(Math.sin(i * 0.45)) * 5 + Math.cos(i * 0.21) * 1.5).toFixed(2)),
  ),
  xLabels: ["Mar 17", "Apr 14", "May 16"],
};

// US 客户端 About 卡(对应 PDF "About" section)
export const mockCompanyProfile: CompanyProfile = {
  description:
    "Apple Inc. is a global technology company headquartered in Cupertino, California. " +
    "Founded in 1976 by Steve Jobs, Steve Wozniak, and Ronald Wayne, it designs and " +
    "manufactures consumer electronics, software, and online services. Its iPhone product " +
    "line accounts for roughly half of total revenue, while Services (App Store, iCloud, " +
    "Apple Music, AppleCare) is the fastest-growing segment with structurally higher margins.",
  marketCap: "$3,608.76B",
  badges: [
    { label: "Attention Top3", tone: "accent" },
    { label: "Growth Tech",    tone: "down", delta: "-1.0B" },
    { label: "Hot Deal Top2",  tone: "accent" },
  ],
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

// 长桥版 — 37 节点思维导图(中心节点 = 苹果)
// importance:high(绿实心)/ medium(绿圆环)/ low(灰)
export const mockKeyFactorsTree: KeyFactorNode = {
  id: "root",
  label: "苹果",
  importance: "high",
  children: [
    {
      id: "performance",
      label: "业绩",
      importance: "high",
      children: [
        {
          id: "total-revenue",
          label: "总收入",
          importance: "high",
          children: [
            {
              id: "hardware",
              label: "硬件收入",
              importance: "high",
              children: [
                {
                  id: "iphone",
                  label: "iPhone",
                  importance: "high",
                  children: [
                    { id: "iphone-asp", label: "iPhone 单价", importance: "high" },
                    { id: "iphone-vol", label: "iPhone 销量", importance: "high" },
                  ],
                },
                { id: "mac", label: "Mac", importance: "medium" },
                { id: "ipad", label: "iPad", importance: "medium" },
                { id: "wearables", label: "可穿戴/家居/配件", importance: "medium" },
              ],
            },
            {
              id: "services",
              label: "服务收入",
              importance: "high",
              children: [
                { id: "appstore", label: "App Store 抽成", importance: "medium" },
                { id: "icloud", label: "iCloud / Apple One", importance: "low" },
                { id: "advertising", label: "广告业务", importance: "low" },
              ],
            },
          ],
        },
        {
          id: "gross-margin",
          label: "毛利率",
          importance: "high",
          children: [
            { id: "hw-gm", label: "硬件毛利率", importance: "medium" },
            { id: "svc-gm", label: "服务毛利率", importance: "high" },
          ],
        },
        {
          id: "expense-ratio",
          label: "费用率",
          importance: "medium",
          children: [
            { id: "rnd", label: "研发费用", importance: "medium" },
            { id: "sga", label: "销售管理费用", importance: "low" },
          ],
        },
      ],
    },
    {
      id: "geography",
      label: "地区收入占比",
      importance: "medium",
      children: [
        { id: "americas", label: "美洲", importance: "medium" },
        { id: "europe", label: "欧洲", importance: "medium" },
        { id: "greater-china", label: "大中华区", importance: "high" },
        { id: "japan", label: "日本", importance: "low" },
        { id: "asia-pacific", label: "亚太其他", importance: "low" },
      ],
    },
    {
      id: "industry-position",
      label: "行业地位",
      importance: "medium",
      children: [
        { id: "smartphone-share", label: "智能手机市占率", importance: "medium" },
        { id: "ecosystem", label: "生态闭环", importance: "high" },
        { id: "brand-premium", label: "品牌溢价", importance: "medium" },
      ],
    },
    {
      id: "capital-return",
      label: "股东回报",
      importance: "low",
      children: [
        { id: "buyback", label: "股票回购", importance: "medium" },
        { id: "dividend", label: "股息", importance: "low" },
      ],
    },
  ],
};

export const mockAnalystConsensus: AnalystConsensus = {
  date: "Jun 11, 2025",
  totalAnalysts: 75,
  distribution: {
    strongBuy:  0.6447,
    buy:        0.1564,
    hold:       0.1064,
    sell:       0.0736,
    strongSell: 0.0189,
  },
  priceForecast: { target: 30.87, pct: 0.0125 },
  rating: "Strong buy",
};

// US 客户端 Shareholder activity — Net buy/sell 双向柱(Q4 2022 → Q1 2025)
export const mockInstitutionalHolding: InstitutionalHolding = {
  date: "Jun 11, 2025",
  unit: "Shares",
  bars: [
    { period: "Q4 2022", netShares:  340_000_000 },
    { period: "Q1 2023", netShares:  520_000_000 },
    { period: "Q2 2023", netShares:  410_000_000 },
    { period: "Q3 2023", netShares:  280_000_000 },
    { period: "Q4 2023", netShares:  650_000_000 },
    { period: "Q1 2024", netShares: -180_000_000 },
    { period: "Q2 2024", netShares:  720_000_000 },
    { period: "Q3 2024", netShares:  590_000_000 },
    { period: "Q4 2024", netShares:  870_000_000 },
    { period: "Q1 2025", netShares: -310_000_000 },
  ],
};

// 长桥版财务评分 — 5 类维度(盈利/成长/现金/运营/安全),雷达图 + 指标明细
export const mockFinancialHealth: FinancialHealthScore = {
  overall: "B",
  overallTrend: "down",
  industry: "硬件、存储及外设产品行业",
  industryRank: { rank: 2, total: 46 },
  industryMedian: "C",
  industryAvg: "C",
  updatedAt: "15/05/2026 更新",
  categories: [
    {
      label: "盈利评分", axis: "盈利", grade: "A",
      indicators: [
        { label: "净资产收益率(ROE)", value: "141.47%", grade: "A", trend: "up" },
        { label: "净利率",            value: "27.15%",  grade: "A", trend: "up" },
        { label: "毛利率",            value: "49.27%",  grade: "B", trend: "down" },
      ],
    },
    {
      label: "成长评分", axis: "成长", grade: "B",
      indicators: [
        { label: "营业收入同比",       value: "8.4%",    grade: "B", trend: "up" },
        { label: "净利润同比",         value: "13.6%",   grade: "B", trend: "up" },
        { label: "EPS 同比",          value: "15.2%",   grade: "A", trend: "up" },
      ],
    },
    {
      label: "现金评分", axis: "现金", grade: "B",
      indicators: [
        { label: "经营现金流/净利润",   value: "112%",    grade: "A", trend: "flat" },
        { label: "自由现金流率",       value: "27.8%",   grade: "B", trend: "up" },
      ],
    },
    {
      label: "运营评分", axis: "运营", grade: "A",
      indicators: [
        { label: "存货周转天数",       value: "10.4 天", grade: "A", trend: "up" },
        { label: "应收账款周转",       value: "60.2 天", grade: "A", trend: "flat" },
        { label: "总资产周转率",       value: "1.05",    grade: "A", trend: "up" },
      ],
    },
    {
      label: "负债评分", axis: "安全", grade: "D",
      indicators: [
        { label: "资产负债率",         value: "82.6%",   grade: "D", trend: "down" },
        { label: "流动比率",           value: "0.92",    grade: "D", trend: "down" },
        { label: "利息覆盖倍数",       value: "30.4×",   grade: "A", trend: "up" },
      ],
    },
  ],
};


// US 客户端 Financials — P/L / Balance sheet / Cash flow 各 5 季度趋势(双柱 + Net margin 线)
const US_QUARTERS: { period: string; rangeLabel: string }[] = [
  { period: "Q2 2024", rangeLabel: "04/01/2024 - 06/30/2024" },
  { period: "Q3 2024", rangeLabel: "07/01/2024 - 09/30/2024" },
  { period: "Q4 2024", rangeLabel: "10/01/2024 - 12/31/2024" },
  { period: "Q1 2025", rangeLabel: "01/01/2025 - 03/31/2025" },
  { period: "Q2 2025", rangeLabel: "04/01/2025 - 06/30/2025" },
];

export const mockIncomeStatement: FinancialBarReport = {
  title: "P/L",
  quarters: [
    { ...US_QUARTERS[0], revenue: 198.5, netIncome:  88.4, netMargin: 0.4453 },
    { ...US_QUARTERS[1], revenue: 250.25, netIncome: 125.05, netMargin: 0.5112 },
    { ...US_QUARTERS[2], revenue: 224.0, netIncome: 106.5, netMargin: 0.4754 },
    { ...US_QUARTERS[3], revenue: 215.8, netIncome:  98.4, netMargin: 0.4560 },
    { ...US_QUARTERS[4], revenue: 232.1, netIncome: 112.6, netMargin: 0.4852 },
  ],
};

export const mockBalanceSheet: FinancialBarReport = {
  title: "Balance sheet",
  quarters: [
    { ...US_QUARTERS[0], revenue: 360.4, netIncome: 195.0, netMargin: 0.5410 },
    { ...US_QUARTERS[1], revenue: 374.2, netIncome: 210.6, netMargin: 0.5630 },
    { ...US_QUARTERS[2], revenue: 388.5, netIncome: 222.8, netMargin: 0.5734 },
    { ...US_QUARTERS[3], revenue: 401.2, netIncome: 230.4, netMargin: 0.5743 },
    { ...US_QUARTERS[4], revenue: 415.0, netIncome: 242.0, netMargin: 0.5831 },
  ],
};

export const mockCashFlow: FinancialBarReport = {
  title: "Cash flow",
  quarters: [
    { ...US_QUARTERS[0], revenue:  72.4, netIncome:  44.8, netMargin: 0.6188 },
    { ...US_QUARTERS[1], revenue:  98.2, netIncome:  68.5, netMargin: 0.6975 },
    { ...US_QUARTERS[2], revenue:  85.6, netIncome:  56.4, netMargin: 0.6589 },
    { ...US_QUARTERS[3], revenue:  76.4, netIncome:  48.0, netMargin: 0.6283 },
    { ...US_QUARTERS[4], revenue:  88.2, netIncome:  58.6, netMargin: 0.6644 },
  ],
};

// US 客户端 Revenue breakdown — 5 阶段 Sankey (Sources → Revenue → Gross/Cost → OpInc/OpEx → 5 Terminals)
//   口径:AAPL Q4 2024 季度 P&L 自洽
//   Sources 和 = Revenue ; Cost + Gross = Revenue ; OpInc + OpEx = Gross ; ...
const _fmtB = (v: number) => `$${v.toFixed(2)}B`;

export const mockRevenueComposition: RevenueCompositionData = {
  cycle: "Quarterly",
  periods: ["Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025"],
  activePeriod: "Q4 2024",
  nodes: [
    // Stage 0: 5 个营收来源 (sum = 94.0)
    { id: "src-cloud",    label: "Cloud service", rawValue: 28.20, value: _fmtB(28.20), pct:  0.0625, stage: 0, kind: "revenue" },
    { id: "src-computer", label: "Computer",      rawValue: 33.70, value: _fmtB(33.70), pct:  0.0420, stage: 0, kind: "revenue" },
    { id: "src-graphics", label: "Graphics",      rawValue: 14.10, value: _fmtB(14.10), pct: -0.0850, stage: 0, kind: "revenue" },
    { id: "src-network",  label: "Network",       rawValue: 10.34, value: _fmtB(10.34), pct:  0.0310, stage: 0, kind: "revenue" },
    { id: "src-others",   label: "Others",        rawValue:  7.66, value: _fmtB( 7.66), pct: -0.1220, stage: 0, kind: "revenue" },

    // Stage 1: Revenue 汇总
    { id: "revenue",      label: "Revenue",       rawValue: 94.00, value: _fmtB(94.00), pct:  0.0125, stage: 1, kind: "revenue" },

    // Stage 2: 拆分为 Cost / Gross profit
    { id: "gross-profit", label: "Gross profit",  rawValue: 51.70, value: _fmtB(51.70), pct:  0.0354, stage: 2, kind: "profit" },
    { id: "cost-revenue", label: "Cost of revenue", rawValue: 42.30, value: _fmtB(42.30), pct: -0.0152, stage: 2, kind: "cost" },

    // Stage 3: Gross profit 拆为 Operating income / Operating expenses
    { id: "op-income",    label: "Operating income",  rawValue: 28.43, value: _fmtB(28.43), pct:  0.0521, stage: 3, kind: "profit" },
    { id: "op-expenses",  label: "Operating expenses", rawValue: 23.27, value: _fmtB(23.27), pct:  0.0212, stage: 3, kind: "cost" },

    // Stage 4: 5 个终端 (Operating income → Net income + Tax; Operating expenses → Others + SG&A + R&D)
    { id: "net-income",   label: "Net income",   rawValue: 24.16, value: _fmtB(24.16), pct:  0.0612, stage: 4, kind: "profit" },
    { id: "tax-expense",  label: "Tax expense",  rawValue:  4.27, value: _fmtB( 4.27), pct: -0.0810, stage: 4, kind: "cost" },
    { id: "others",       label: "Others",       rawValue:  3.49, value: _fmtB( 3.49), pct:  0.0125, stage: 4, kind: "cost" },
    { id: "sga",          label: "SG&A",         rawValue: 10.47, value: _fmtB(10.47), pct: -0.0220, stage: 4, kind: "cost" },
    { id: "rd",           label: "R&D",          rawValue:  9.31, value: _fmtB( 9.31), pct:  0.0780, stage: 4, kind: "cost" },
  ],
  links: [
    // Sources → Revenue
    { from: "src-cloud",    to: "revenue",     value: 28.20 },
    { from: "src-computer", to: "revenue",     value: 33.70 },
    { from: "src-graphics", to: "revenue",     value: 14.10 },
    { from: "src-network",  to: "revenue",     value: 10.34 },
    { from: "src-others",   to: "revenue",     value:  7.66 },

    // Revenue → Gross / Cost
    { from: "revenue", to: "gross-profit",  value: 51.70 },
    { from: "revenue", to: "cost-revenue",  value: 42.30 },

    // Gross profit → OpInc / OpEx
    { from: "gross-profit", to: "op-income",   value: 28.43 },
    { from: "gross-profit", to: "op-expenses", value: 23.27 },

    // OpInc → Net income + Tax
    { from: "op-income", to: "net-income",  value: 24.16 },
    { from: "op-income", to: "tax-expense", value:  4.27 },

    // OpEx → Others + SG&A + R&D
    { from: "op-expenses", to: "others", value:  3.49 },
    { from: "op-expenses", to: "sga",    value: 10.47 },
    { from: "op-expenses", to: "rd",     value:  9.31 },
  ],
};

// US 客户端 Stock valuation — donut + 行业排名说明
export const mockValuation: ValuationMetric = {
  date: "Jun 11, 2025",
  stockPrice: 6.40,
  eps: 1.00,
  peRatio: 6.4,
  peLow3y: 5.8,
  peMedian3y: 12.4,
  peHigh3y: 22.6,
  industryRank: 2,
  industryTotal: 58,
  industryMedian: 21.00,
};

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

// NewsItem — 资讯(长桥版扩展:相关股票涨跌幅 chip)
export interface NewsItem {
  time: string;
  source: string;
  title: string;
  summary?: string;
  sentiment?: "bull" | "bear" | "neutral";
  cover?: boolean;
  /** 长桥版:相关股票涨跌幅 tag(例:US 谷歌 +4.40% / US 苹果 -0.22%) */
  tickers?: { market: string; name: string; pct: number }[];
}

// Discussion — 讨论(长桥版扩展:头像/长正文/嵌入 mini chart)
export interface DiscussionPost {
  user: string;
  /** 头像首字母(2 字以内,渲染为彩色圆形) */
  avatar?: string;
  /** 头像背景色 token(可选) */
  avatarColor?: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  attached?: { ticker: string; pct: number };
  /** 长桥版:嵌入 mini chart(若有,渲染为内嵌价格折线) */
  embeddedChart?: { ticker: string; values: number[]; pct: number };
}

// EarningsSummary — 业绩摘要
// US 客户端 Earnings cards — 3 个 variant
export type EarningsCardVariant = "report" | "call" | "summary";

export interface EarningsCard {
  variant: EarningsCardVariant;
  /** Card title e.g. "Upcoming earnings report" */
  title: string;
  /** KV rows shown in cards (variant=report/call) */
  rows?: { label: string; value: string }[];
  /** Body text (variant=summary) */
  body?: string;
  /** Optional thumbnail letter for variant=summary */
  thumbnail?: string;
}

export interface EarningsHighlight {
  cards: EarningsCard[];
}

// US 客户端 Earnings 散点 — EPS / Revenue / EBIT 3 metric × 多季度 actual vs estimate
export type EarningsMetricKey = "EPS" | "Revenue" | "EBIT";

export interface EarningsScatterPoint {
  /** Quarter label e.g. "Q1 2024" */
  period: string;
  /** Actual reported value (undefined for未公布季度) */
  actual?: number;
  /** Analyst estimate */
  estimate?: number;
  /** 是否 beat estimate(用于点的着色 — green = beat / red = miss) */
  beat?: boolean;
}

export interface EarningsForecastQuarter {
  metric: EarningsMetricKey;
  /** Unit label rendered next to numbers, e.g. "$" / "$B" */
  unit: string;
  /** 4-8 quarters of actual + 1-2 estimate */
  points: EarningsScatterPoint[];
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
  { time: "11:21", source: "Reuters · 2 hours ago",
    title: "Kuo: Apple grooming Intel as a long-term strategic supplier", sentiment: "bull",
    tickers: [
      { market: "US", name: "TSMC",  pct:  0.0440 },
      { market: "US", name: "AAPL",  pct: -0.0022 },
      { market: "US", name: "INTC",  pct: -0.0362 },
    ],
  },
  { time: "11:18", source: "CNBC · 2 hours ago",
    title: "Mega-cap tech slides in pre-market; Tesla off 1%", sentiment: "bear",
    tickers: [
      { market: "US", name: "GOOGL", pct:  0.0440 },
      { market: "US", name: "AAPL",  pct: -0.0058 },
      { market: "US", name: "TSLA",  pct: -0.0084 },
    ],
  },
  { time: "11:10", source: "Bloomberg · 2 hours ago",
    title: "Goldman warns 'higher-for-longer' rates could kill the equity rally as breadth narrows",
    sentiment: "bear",
    tickers: [
      { market: "US", name: "NVDA",  pct:  0.0430 },
      { market: "US", name: "AAPL",  pct: -0.0022 },
      { market: "US", name: "INTL",  pct:  0.0931 },
    ],
  },
  { time: "10:18", source: "9to5Mac · 3 hours ago",
    title: "Apple and Huawei kick off discounts; iPhone 17 Pro starts at $999",
    sentiment: "neutral",
    tickers: [
      { market: "US", name: "AAPL",  pct: -0.0022 },
      { market: "US", name: "AAPU",  pct: -0.0064 },
      { market: "US", name: "AAPL",  pct:  0.0030 },
    ],
  },
  { time: "10:07", source: "The Information · 3 hours ago",
    title: "iPhone 18 said to ship with Apple-designed cellular modem and 'hidden' privacy mode",
    sentiment: "neutral",
    tickers: [
      { market: "US", name: "AAPU",  pct: -0.0064 },
      { market: "US", name: "AAPX",  pct: -0.0089 },
      { market: "US", name: "AAPL",  pct: -0.0064 },
    ],
  },
  { time: "09:50", source: "Apple PR · 4 hours ago",
    title: "Apple Intelligence launches new EU-only privacy features",
    sentiment: "neutral",
    tickers: [{ market: "US", name: "AAPL", pct: -0.0022 }],
  },
];

export const mockDiscussions: DiscussionPost[] = [
  {
    user: "@valuegrinder",
    avatar: "V",
    avatarColor: "var(--chart-purple)",
    time: "15 min ago",
    content:
      "Q1 EPS beat by $0.18, services hits a new ATH. Wearables drag is worse than expected — Vision Pro 2 has to pick up the slack. The two pillars of the multiple: iPhone shipments stabilizing + services high-margin growth. Near-term catalysts: WWDC Apple Intelligence phase-2, and whether Greater China share holds.\n\nI added a small tranche after Q1 print, raising target to $325. Will add another tranche on a pullback to $280.",
    likes: 142,
    comments: 38,
    embeddedChart: {
      ticker: "AAPL",
      values: [278, 281, 285, 282, 287, 290, 288, 287, 292, 295, 293, 297, 298],
      pct: 0.034,
    },
  },
  {
    user: "@techvalue",
    avatar: "T",
    avatarColor: "var(--chart-blue)",
    time: "1 hour ago",
    content:
      "How long can 34.8x P/E hold up under the AI narrative? Buffett trimming is a signal — he doesn't sell great companies, only ones he thinks are expensive.\n\nWait for a Vision Pro 2 dip before adding. If WWDC is buy-the-rumor / sell-the-news, expect 8–12% pullback — that's the entry window for long-term holders.",
    likes: 86,
    comments: 24,
  },
  {
    user: "@aaplbull",
    avatar: "A",
    avatarColor: "var(--chart-green)",
    time: "3 hours ago",
    content: "Services 14% YoY in a flat market is a scarce asset. Holding, target $320.",
    likes: 56,
    comments: 12,
    attached: { ticker: "AAPL", pct: 0.034 },
  },
];

export const mockEarningsHighlight: EarningsHighlight = {
  cards: [
    {
      variant: "report",
      title: "Upcoming earnings report",
      rows: [
        { label: "Available date",    value: "Jun 23, 2025" },
        { label: "Estimated EPS",     value: "$1.42" },
        { label: "Estimated revenue", value: "$23.63B" },
      ],
    },
    {
      variant: "call",
      title: "Upcoming earnings conference call",
      rows: [{ label: "Available date", value: "Jun 23, 2025" }],
    },
    {
      variant: "summary",
      title: "2025 Q3 Earnings Report",
      body: "Overall forecast is positive, understand it at a glance.",
      thumbnail: "Q3",
    },
  ],
};

export const mockEarningsForecast: EarningsForecastQuarter[] = [
  {
    metric: "EPS",
    unit: "$",
    points: [
      { period: "Q1 2024", actual: 1.42, estimate: 1.30, beat: true },
      { period: "Q2 2024", actual: 1.18, estimate: 1.25, beat: false },
      { period: "Q3 2024", actual: 1.54, estimate: 1.40, beat: true },
      { period: "Q4 2024", actual: 0.92, estimate: 1.18, beat: false },
      { period: "Q1 2025", estimate: 1.42 },
    ],
  },
  {
    metric: "Revenue",
    unit: "$B",
    points: [
      { period: "Q1 2024", actual: 121.4, estimate: 117.0, beat: true },
      { period: "Q2 2024", actual: 85.8,  estimate: 86.5,  beat: false },
      { period: "Q3 2024", actual: 94.9,  estimate: 90.4,  beat: true },
      { period: "Q4 2024", actual: 124.3, estimate: 122.0, beat: true },
      { period: "Q1 2025", estimate: 95.6 },
    ],
  },
  {
    metric: "EBIT",
    unit: "$B",
    points: [
      { period: "Q1 2024", actual: 40.4, estimate: 36.8, beat: true },
      { period: "Q2 2024", actual: 27.9, estimate: 28.8, beat: false },
      { period: "Q3 2024", actual: 31.0, estimate: 29.5, beat: true },
      { period: "Q4 2024", actual: 42.6, estimate: 41.5, beat: true },
      { period: "Q1 2025", estimate: 33.1 },
    ],
  },
];
