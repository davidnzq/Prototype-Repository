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
  // 长桥版扩展
  /** 关注人数(用于 ❤️ 数字) */
  watchers?: number;
  /** 标签 chip(关注度排名/热点/概念) */
  chips?: { label: string; pct?: number; type?: "rank" | "tag" }[];
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
  /** 当日今开 */
  open: number;
  /** 当日最高 */
  high: number;
  /** 当日最低 */
  low: number;
  /** 上一交易日收盘 */
  prevClose: number;
  /** 滚动市盈率 TTM */
  peTtm: number;
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
// 5. CompanyProfile 公司概况 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 描述文字
// - 行业胶囊条:行业名 + 行业总市值 + 行业涨跌 + 公司总市值 + 市值排名 + 行业 mini chart
// - 去掉 CEO/Founded/HQ/Employees/IPO/FY/Website KV(线上无)
export interface CompanyProfile {
  description: string;
  industry: string;
  industryMarketCap: string;   // "5.46 万亿"
  industryChangePct: number;   // -0.0033
  companyMarketCap: string;    // "4.38 万亿"
  rank: { rank: number; total: number };  // 1/43
  /** 行业 mini chart 30 点 */
  industrySpark: number[];
  // Plan9 — 普通投资者基本面字段(由 V1 回补)
  /** 现任 CEO */
  ceo: string;
  /** 成立年份 */
  founded: number;
  /** 总部地址(国家 / 州 / 市)*/
  hq: string;
  /** 员工总数 */
  employees: number;
  /** 官网(只展示域名)*/
  website: string;
  /** IPO 日期 */
  ipoDate: string;
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
  /** Plan9 — 叶子节点可选数值(显示在 label 后面)*/
  value?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 8. AnalystConsensus 分析师一致预期
// ────────────────────────────────────────────────────────────────────────────
/** 长桥版 — 分析师评级(6 类 + 股价 / 预测高低时间序列)
 *  对应 Figma 设计:左 Donut(6 段)+ 中 评级表 + 右 折线图(股价/预测最高/预测最低)
 */
export type AnalystRatingLabel =
  | "强力推荐"
  | "买入"
  | "持有"
  | "跑输大盘"
  | "卖出"
  | "无意见";

export interface AnalystConsensus {
  /** 更新时间,显示在 SectionHeader hint */
  updatedAt: string;          // "14/05/2026"
  /** 分析师总数 */
  totalAnalysts: number;
  /** 当前共识(donut 中间大字 + 表格首项高亮)*/
  consensus: AnalystRatingLabel;
  /** 6 类评级占比(0-1,合计 1)*/
  distribution: {
    strongBuy: number;        // 强力推荐
    buy: number;              // 买入
    hold: number;             // 持有
    underperform: number;     // 跑输大盘
    sell: number;             // 卖出
    noOpinion: number;        // 无意见
  };
  /** 现价 */
  currentPrice: number;
  /** 股价 + 预测高/低 时间序列 — 月度,~24 点 */
  priceHistory: {
    date: string;             // "2024-06" 等
    price: number;
    predictHigh: number;
    predictLow: number;
  }[];
}

// ────────────────────────────────────────────────────────────────────────────
// 9. InstitutionalHolding 机构持仓 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:4 列表格(股东名称 / 持股比例 / 较内份额增减 / 披露时间)
// 不再有 ownership donut、netFlow waterfall
export interface Holder {
  name: string;
  pctOut: number;             // 持股比例 0–1
  sharesChange: number;       // 较内份额增减(单位 万股),正=增持 / 负=减持
  disclosureDate: string;     // 披露时间 DD/MM/YYYY
}

export interface InstitutionalHolding {
  holders: Holder[];
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

export interface FinancialPeriodPoint {
  period: string;             // Q2 2025
  value: number;
  /** 第二个值(双柱图用,如资产负债表 value=总资产,value2=总负债)*/
  value2?: number;
  yoy?: number;               // 同比 0–1
  stockChange?: number;       // 股价同期涨跌幅 0–1(可选)
}

export interface FinancialMetric {
  key: string;                // eps / roe / revenue ...
  label: string;              // 每股收益(USD)
  format: MetricFormat;
  /** 单季 5 期 */
  points: FinancialPeriodPoint[];
  /** 上一期摘要(可选,显示在 bar 上方) */
  highlightLabel?: string;
  /** 第二条线(对比,如 EPS 走势中的虚线) */
  trendLine?: number[];
  /** 双柱图第二列标签(如"总负债")— 当 points 含 value2 时启用双柱模式 */
  value2Label?: string;
}

export interface FinancialBarReport {
  title: string;              // 利润表 / 资产负债表 / 现金流表
  hint: string;               // IS / BS / CF
  defaultMetric: string;
  metrics: FinancialMetric[];
  periodType: "quarter" | "year";
}

// ────────────────────────────────────────────────────────────────────────────
// 14. RevenueComposition 营收构成 — 长桥版
// ────────────────────────────────────────────────────────────────────────────
// 长桥真实形态:
// - 多年(2013–2025)叠加柱状图
// - "行业 / 地区" tab 切换
// - 下方明细表:名称 / 营收(亿) / 占比
export interface RevenueSeriesPoint {
  /** 段名(地区或业务线) */
  label: string;
  /** 营收(亿元 RMB 等价单位) */
  revenue: number;
  /** 占比 0–1 */
  pct: number;
  color: string;
}

export interface RevenueYearBar {
  year: number;
  total: number;            // 当年总营收(亿)
  segments: { label: string; value: number }[];  // 与 latest segments 对应
}

export interface RevenueCompositionData {
  view: "industry" | "region";
  /** 最新一年的明细(用于下表) */
  latestSegments: RevenueSeriesPoint[];
  /** 多年叠加 bars 时序 */
  yearBars: RevenueYearBar[];
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

export interface ValuationMetric {
  key: string;              // pe / pb / ps / dividend
  label: string;            // 市盈率 / 市净率 / 市销率 / 股息率
  format: ValuationFormat;
  current: number;          // 35.73
  rank: { rank: number; total: number };
  /** mini chart 12 个月数据(默认 1 年视图) */
  history: ValuationHistoryPoint[];
  /** 参考分位 */
  percentiles: {
    high: number;
    median: number;
    low: number;
  };
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
  /** 登记日(record date)— 股权登记日 */
  recordDate: string;
  /** 除净日(ex-dividend date)— 当日开盘股票除息 */
  exDate: string;
  /** 派息日(pay date)— 股息发放日 */
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
  // 长桥版扩展
  watchers: 386_000,                            // 38.60 万 关注
  chips: [
    { label: "关注度 Top 20", type: "rank" },
    { label: "热点 Top 6",   type: "rank" },
    { label: "流媒体概念", pct: -0.0042, type: "tag" },
    { label: "苹果概念股", pct:  0.0086, type: "tag" },
  ],
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
  open: 299.820,
  high: 300.450,
  low: 295.380,
  prevClose: 298.870,
  peTtm: 35.73,
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

// 长桥版公司概况
export const mockCompanyProfile: CompanyProfile = {
  description:
    "Apple Inc. 设计、生产并销售智能手机、个人电脑、平板电脑、可穿戴设备、配件,并提供各类相关服务。" +
    "公司业务覆盖美洲、欧洲、大中华区、日本、亚太其他地区。其旗舰产品 iPhone 占公司总收入约 52%," +
    "服务业务(App Store / Apple Music / iCloud / AppleCare)增长迅速,毛利率显著高于硬件。",
  industry: "硬件、存储及外设",
  industryMarketCap: "5.46 万亿",
  industryChangePct: -0.0033,
  companyMarketCap: "4.38 万亿",
  rank: { rank: 1, total: 43 },
  industrySpark: Array.from({ length: 30 }, (_, i) =>
    100 + Math.sin(i * 0.5) * 4 + Math.cos(i * 0.3) * 2 + (i / 30) * 3,
  ),
  // Plan9 — 普通投资者基本面字段
  ceo: "Tim Cook",
  founded: 1976,
  hq: "Cupertino, CA · 美国",
  employees: 164_000,
  website: "apple.com",
  ipoDate: "1980-12-12",
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
                    { id: "iphone-asp", label: "iPhone 单价", importance: "high", value: "$928" },
                    { id: "iphone-vol", label: "iPhone 销量", importance: "high", value: "2.34 亿" },
                  ],
                },
                { id: "mac", label: "Mac", importance: "medium", value: "$30B" },
                { id: "ipad", label: "iPad", importance: "medium", value: "$26B" },
                { id: "wearables", label: "可穿戴/家居/配件", importance: "medium", value: "$37B" },
              ],
            },
            {
              id: "services",
              label: "服务收入",
              importance: "high",
              value: "$96B · +14%",
              children: [
                { id: "appstore", label: "App Store 抽成", importance: "medium", value: "$28B" },
                { id: "icloud", label: "iCloud / Apple One", importance: "low", value: "$8B" },
                { id: "advertising", label: "广告业务", importance: "low" },
              ],
            },
          ],
        },
        {
          id: "gross-margin",
          label: "毛利率",
          importance: "high",
          value: "46.2%",
          children: [
            { id: "hw-gm", label: "硬件毛利率", importance: "medium", value: "37.4%" },
            { id: "svc-gm", label: "服务毛利率", importance: "high", value: "71.0%" },
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

// 长桥版分析师评级 — 6 类占比 + 股价/预测高低 24 月时序
function genAnalystPriceHistory(): AnalystConsensus["priceHistory"] {
  // 24 个月,从 2024-06 → 2026-05
  const start = new Date(2024, 5, 1);
  const out: AnalystConsensus["priceHistory"] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // 股价 100 → 298 缓慢上升,带波动
    const t = i / 23;
    const price = 110 + t * 180 + Math.sin(i * 0.7) * 10 + Math.cos(i * 0.4) * 6;
    // 预测最高 / 最低(在 price 周围 ±30-50)
    const predictHigh = price + 50 + Math.sin(i * 0.5) * 8;
    const predictLow = price - 40 + Math.cos(i * 0.6) * 6;
    out.push({
      date,
      price: Number(price.toFixed(2)),
      predictHigh: Number(predictHigh.toFixed(2)),
      predictLow: Number(predictLow.toFixed(2)),
    });
  }
  return out;
}

export const mockAnalystConsensus: AnalystConsensus = {
  updatedAt: "14/05/2026",
  totalAnalysts: 50,
  consensus: "强力推荐",
  distribution: {
    strongBuy:    0.46,
    buy:          0.14,
    hold:         0.32,
    underperform: 0.02,
    sell:         0.02,
    noOpinion:    0.04,
  },
  currentPrice: 298.21,
  priceHistory: genAnalystPriceHistory(),
};

// 长桥版 — 持股股东 Top 10(对齐真实页:持股比例 + 较内份额增减万股 + 披露时间)
export const mockInstitutionalHolding: InstitutionalHolding = {
  holders: [
    { name: "The Vanguard Group, Inc.",          pctOut: 0.0971, sharesChange:  2685.68, disclosureDate: "31/12/2025" },
    { name: "BlackRock, Inc.",                    pctOut: 0.0782, sharesChange:   859.56, disclosureDate: "31/12/2025" },
    { name: "State Street Global Advisors, Inc.", pctOut: 0.0411, sharesChange:   655.54, disclosureDate: "31/12/2025" },
    { name: "Geode Capital Management, LLC",      pctOut: 0.0244, sharesChange:   186.61, disclosureDate: "31/12/2025" },
    { name: "FMR LLC",                            pctOut: 0.0183, sharesChange:   324.58, disclosureDate: "31/12/2025" },
    { name: "Berkshire Hathaway Inc.",            pctOut: 0.0155, sharesChange: -1029.50, disclosureDate: "31/12/2025" },
    { name: "T. Rowe Price Group, Inc.",          pctOut: 0.0150, sharesChange: -1212.39, disclosureDate: "31/12/2025" },
    { name: "Norges Bank Investment Management",  pctOut: 0.0131, sharesChange:   245.03, disclosureDate: "31/12/2025" },
    { name: "JP Morgan Asset Management",         pctOut: 0.0115, sharesChange:   317.57, disclosureDate: "31/12/2025" },
    { name: "Northern Trust Global Investments",  pctOut: 0.0109, sharesChange:  -399.63, disclosureDate: "31/12/2025" },
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

// 长桥版财报通用 5 期标签
const LB_PERIODS = ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"];

// 利润表 — Income Statement
export const mockIncomeStatement: FinancialBarReport = {
  title: "利润表",
  hint: "IS",
  periodType: "quarter",
  defaultMetric: "eps",
  metrics: [
    {
      key: "eps", label: "每股收益(USD)", format: "currency",
      highlightLabel: "利润含金量",
      points: [
        { period: LB_PERIODS[0], value: 1.65, yoy: -0.3125, stockChange: undefined },
        { period: LB_PERIODS[1], value: 1.57, yoy: -0.0485, stockChange: -0.0751 },
        { period: LB_PERIODS[2], value: 1.84, yoy:  0.1718, stockChange:  0.2425 },
        { period: LB_PERIODS[3], value: 2.84, yoy:  0.5437, stockChange:  0.0687 },
        { period: LB_PERIODS[4], value: 2.01, yoy: -0.2923, stockChange: -0.0656 },
      ],
    },
    {
      key: "roe", label: "ROE", format: "percent",
      points: [
        { period: LB_PERIODS[0], value: 1.4612, yoy:  0.0832 },
        { period: LB_PERIODS[1], value: 1.4848, yoy:  0.0640 },
        { period: LB_PERIODS[2], value: 1.5172, yoy:  0.0826 },
        { period: LB_PERIODS[3], value: 1.5938, yoy:  0.1182 },
        { period: LB_PERIODS[4], value: 1.4147, yoy: -0.0318 },
      ],
    },
    {
      key: "revenue", label: "营业收入", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 85_780,  yoy:  0.012 },
        { period: LB_PERIODS[1], value: 94_930,  yoy:  0.062 },
        { period: LB_PERIODS[2], value: 119_580, yoy:  0.057 },
        { period: LB_PERIODS[3], value: 124_300, yoy:  0.064 },
        { period: LB_PERIODS[4], value: 89_240,  yoy:  0.040 },
      ],
    },
    {
      key: "netIncome", label: "净利润", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 19_440, yoy:  0.062 },
        { period: LB_PERIODS[1], value: 21_450, yoy:  0.104 },
        { period: LB_PERIODS[2], value: 30_220, yoy:  0.110 },
        { period: LB_PERIODS[3], value: 31_310, yoy:  0.128 },
        { period: LB_PERIODS[4], value: 22_180, yoy:  0.056 },
      ],
    },
    {
      key: "opIncome", label: "营业利润", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 24_210, yoy:  0.054 },
        { period: LB_PERIODS[1], value: 27_600, yoy:  0.072 },
        { period: LB_PERIODS[2], value: 37_480, yoy:  0.092 },
        { period: LB_PERIODS[3], value: 38_770, yoy:  0.086 },
        { period: LB_PERIODS[4], value: 26_840, yoy:  0.038 },
      ],
    },
    {
      key: "grossMargin", label: "毛利率", format: "percent",
      points: [
        { period: LB_PERIODS[0], value: 0.4488, yoy:  0.0082 },
        { period: LB_PERIODS[1], value: 0.4521, yoy:  0.0094 },
        { period: LB_PERIODS[2], value: 0.4638, yoy:  0.0112 },
        { period: LB_PERIODS[3], value: 0.4621, yoy:  0.0098 },
        { period: LB_PERIODS[4], value: 0.4927, yoy:  0.0238 },
      ],
    },
    {
      key: "netMargin", label: "净利率", format: "percent",
      points: [
        { period: LB_PERIODS[0], value: 0.2266, yoy:  0.0048 },
        { period: LB_PERIODS[1], value: 0.2259, yoy:  0.0058 },
        { period: LB_PERIODS[2], value: 0.2527, yoy:  0.0124 },
        { period: LB_PERIODS[3], value: 0.2518, yoy:  0.0112 },
        { period: LB_PERIODS[4], value: 0.2487, yoy:  0.0072 },
      ],
    },
  ],
};

// 资产负债表 — Balance Sheet
export const mockBalanceSheet: FinancialBarReport = {
  title: "资产负债表",
  hint: "BS",
  periodType: "quarter",
  defaultMetric: "assetsLiabilities",
  metrics: [
    {
      key: "assetsLiabilities", label: "总资产", format: "currency",
      value2Label: "总负债",
      points: [
        { period: LB_PERIODS[0], value: 3312, value2: 2644 },
        { period: LB_PERIODS[1], value: 3315, value2: 2657, stockChange: -0.0751 },
        { period: LB_PERIODS[2], value: 3592, value2: 2855, stockChange:  0.2425 },
        { period: LB_PERIODS[3], value: 3793, value2: 2911, stockChange:  0.0687 },
        { period: LB_PERIODS[4], value: 3711, value2: 2646, stockChange: -0.0656 },
      ],
    },
    {
      key: "equity", label: "权益类股", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 668,  yoy: 0.084 },
        { period: LB_PERIODS[1], value: 658,  yoy: 0.072 },
        { period: LB_PERIODS[2], value: 737,  yoy: 0.108 },
        { period: LB_PERIODS[3], value: 882,  yoy: 0.156 },
        { period: LB_PERIODS[4], value: 1065, yoy: 0.184 },
      ],
    },
    {
      key: "bookValue", label: "每股净资产", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 4.42, yoy:  0.062 },
        { period: LB_PERIODS[1], value: 4.38, yoy:  0.054 },
        { period: LB_PERIODS[2], value: 4.92, yoy:  0.082 },
        { period: LB_PERIODS[3], value: 5.86, yoy:  0.124 },
        { period: LB_PERIODS[4], value: 7.04, yoy:  0.198 },
      ],
    },
    {
      key: "assetTurnover", label: "资产周转率", format: "ratio",
      points: [
        { period: LB_PERIODS[0], value: 1.04, yoy:  0.008 },
        { period: LB_PERIODS[1], value: 1.06, yoy:  0.012 },
        { period: LB_PERIODS[2], value: 1.09, yoy:  0.018 },
        { period: LB_PERIODS[3], value: 1.05, yoy:  0.006 },
        { period: LB_PERIODS[4], value: 1.02, yoy: -0.018 },
      ],
    },
  ],
};

// 现金流表 — Cash Flow
export const mockCashFlow: FinancialBarReport = {
  title: "现金流表",
  hint: "CF",
  periodType: "quarter",
  defaultMetric: "ocf",
  metrics: [
    {
      key: "ocf", label: "经营现金流", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 26_840, yoy:  0.082 },
        { period: LB_PERIODS[1], value: 30_120, yoy:  0.094 },
        { period: LB_PERIODS[2], value: 38_640, yoy:  0.106 },
        { period: LB_PERIODS[3], value: 41_280, yoy:  0.082 },
        { period: LB_PERIODS[4], value: 28_440, yoy:  0.058 },
      ],
    },
    {
      key: "fcf", label: "自由现金流", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: 24_660, yoy:  0.072 },
        { period: LB_PERIODS[1], value: 27_780, yoy:  0.088 },
        { period: LB_PERIODS[2], value: 36_020, yoy:  0.098 },
        { period: LB_PERIODS[3], value: 38_440, yoy:  0.092 },
        { period: LB_PERIODS[4], value: 26_240, yoy:  0.054 },
      ],
    },
    {
      key: "icf", label: "投资现金流", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: -4_280, yoy:  0.354 },
        { period: LB_PERIODS[1], value: -5_240, yoy:  0.224 },
        { period: LB_PERIODS[2], value: -6_840, yoy:  0.305 },
        { period: LB_PERIODS[3], value: -8_240, yoy:  0.354 },
        { period: LB_PERIODS[4], value: -5_640, yoy:  0.318 },
      ],
    },
    {
      key: "ffc", label: "融资现金流", format: "currency",
      points: [
        { period: LB_PERIODS[0], value: -24_840, yoy:  0.224 },
        { period: LB_PERIODS[1], value: -27_280, yoy:  0.198 },
        { period: LB_PERIODS[2], value: -30_140, yoy:  0.208 },
        { period: LB_PERIODS[3], value: -32_640, yoy:  0.224 },
        { period: LB_PERIODS[4], value: -22_180, yoy:  0.184 },
      ],
    },
    {
      key: "cashRatio", label: "现金流充裕率", format: "percent",
      points: [
        { period: LB_PERIODS[0], value: 0.794, yoy:  0.024 },
        { period: LB_PERIODS[1], value: 0.842, yoy:  0.038 },
        { period: LB_PERIODS[2], value: 0.892, yoy:  0.046 },
        { period: LB_PERIODS[3], value: 0.918, yoy:  0.054 },
        { period: LB_PERIODS[4], value: 0.886, yoy:  0.038 },
      ],
    },
  ],
};

// 长桥版 — 地区收入,2013–2025 叠加柱状图
const REGION_LABELS = ["美洲", "欧洲", "大中华区", "亚太其他", "日本"];
const REGION_COLORS = [
  "var(--chart-green)",
  "var(--chart-blue)",
  "var(--chart-purple)",
  "var(--chart-pink)",
  "var(--chart-red)",
];

// 生成年度数据(模拟苹果地区营收:整体增长 + 大中华区波动 + 美洲领先)
function genYearBars(): RevenueYearBar[] {
  // 2013 总营收 ~1700 亿,2025 ~4994 亿(对齐长桥真实截图)
  const startTotal = 1700;
  const endTotal = 4994;
  const years = 2025 - 2013 + 1;
  // 各地区占比(末端)
  const finalPcts = [0.4286, 0.2668, 0.1547, 0.081, 0.069];
  // 起点占比(2013 大中华区占比更高)
  const startPcts = [0.36, 0.22, 0.235, 0.105, 0.08];
  return Array.from({ length: years }, (_, i) => {
    const year = 2013 + i;
    const t = i / (years - 1);
    const total = startTotal + (endTotal - startTotal) * (0.4 + 0.6 * t * t);
    const segs = finalPcts.map((endPct, j) => {
      const pct = startPcts[j] + (endPct - startPcts[j]) * t;
      return { label: REGION_LABELS[j], value: Math.round(total * pct) };
    });
    return { year, total: Math.round(total), segments: segs };
  });
}

export const mockRevenueComposition: RevenueCompositionData = {
  view: "region",
  latestSegments: [
    { label: "美洲",      revenue: 1784, pct: 0.4286, color: REGION_COLORS[0] },
    { label: "欧洲",      revenue: 1110, pct: 0.2668, color: REGION_COLORS[1] },
    { label: "大中华区",  revenue: 644,  pct: 0.1547, color: REGION_COLORS[2] },
    { label: "亚太其他地区", revenue: 337, pct: 0.081,  color: REGION_COLORS[3] },
    { label: "日本",      revenue: 287,  pct: 0.069,  color: REGION_COLORS[4] },
  ],
  yearBars: genYearBars(),
};

// 生成 12 个月估值历史(围绕基准值波动 ±30%)
function genValuationHistory(base: number, vol = 0.3, seed = 1): ValuationHistoryPoint[] {
  const months = 12;
  const points: ValuationHistoryPoint[] = [];
  // 简单 deterministic 波动
  for (let i = 0; i < months; i++) {
    const t = i / (months - 1);
    const wiggle = Math.sin(i * (seed * 0.7 + 1.2)) * vol;
    const trend = (t - 0.5) * vol * 0.5;
    const price = base * (1 + wiggle * 0.3 + trend);
    const month = ((4 + i) % 12) + 1;
    const year = 2025 + (i >= 8 ? 1 : 0);
    points.push({
      date: `${String(month).padStart(2, "0")}/${year}`,
      price: Number(price.toFixed(2)),
    });
  }
  return points;
}

// 长桥版估值分析 — 4 个 metric(市盈率/市净率/市销率/股息率)
export const mockValuation: ValuationMetric[] = [
  {
    key: "pe", label: "市盈率", format: "ratio",
    current: 35.73, rank: { rank: 14, total: 43 },
    history: genValuationHistory(28, 0.45, 1.0),
    percentiles: { high: 44.63, median: 22.31, low: 11.65 },
  },
  {
    key: "pb", label: "市净率", format: "ratio",
    current: 41.13, rank: { rank: 33, total: 43 },
    history: genValuationHistory(36, 0.32, 2.0),
    percentiles: { high: 67.30, median: 33.05, low: 16.82 },
  },
  {
    key: "ps", label: "市销率", format: "ratio",
    current: 9.70, rank: { rank: 31, total: 43 },
    history: genValuationHistory(8.4, 0.28, 3.0),
    percentiles: { high: 11.59, median: 5.59, low: 2.79 },
  },
  {
    key: "dividend", label: "股息率", format: "percent",
    current: 0.0035, rank: { rank: 13, total: 43 },
    history: genValuationHistory(0.0042, 0.18, 4.0),
    percentiles: { high: 0.0057, median: 0.0028, low: 0.0014 },
  },
];

export const mockDividendHistory: DividendYear[] = [
  { year: 2021, dps: 0.86, yieldPct: 0.0058, payoutRatio: 0.156 },
  { year: 2022, dps: 0.91, yieldPct: 0.0062, payoutRatio: 0.148 },
  { year: 2023, dps: 0.94, yieldPct: 0.0054, payoutRatio: 0.158 },
  { year: 2024, dps: 0.99, yieldPct: 0.0048, payoutRatio: 0.162 },
  { year: 2025, dps: 1.03, yieldPct: 0.0046, payoutRatio: 0.158 },
];

export const mockDividendRecords: DividendRecord[] = [
  // recordDate / exDate / payDate — AAPL 真实形态:登记日 ≈ 除净日(同日 T+0),派息日 = T+3
  { recordDate: "2026-05-11", exDate: "2026-05-11", payDate: "2026-05-14", amount: 0.27, type: "Regular" },
  { recordDate: "2026-02-09", exDate: "2026-02-09", payDate: "2026-02-12", amount: 0.26, type: "Regular" },
  { recordDate: "2025-11-10", exDate: "2025-11-10", payDate: "2025-11-13", amount: 0.26, type: "Regular" },
  { recordDate: "2025-08-11", exDate: "2025-08-11", payDate: "2025-08-14", amount: 0.26, type: "Regular" },
  { recordDate: "2025-05-12", exDate: "2025-05-12", payDate: "2025-05-15", amount: 0.25, type: "Regular" },
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
  signals: { label: string; value: string; trend: Trend }[];
  /** 单条 narrative entry(参考 Perplexity 时间线样式)*/
  entryDate: string;          // 例:"5月17日"
  entryLocale: string;        // 例:"New York 时间 08:29"
  priceSnapshot: {
    price: number;
    changePct: number;        // 例: 0.0068 = +0.68%
    sessionLabel: string;     // 例:"收盘时"
    afterHours?: { price: number; changePct: number; label: string };  // 例:"盘后"
  };
  /** 长正文 — 综合 bull/bear + summary 的叙事段落 */
  narrative: string;
  /** 来源(初始字母 + 颜色 token) */
  sources: { label: string; color: string }[];
  /** 更多入口 — 查看完整 / 原始分析 */
  fullAnalysisHint?: string;
}

// 长桥版 — 事件追踪(垂直时间线)
// 同一天的事件:仅第一条显示日期标签,其余只显示时间
export interface TrackedEvent {
  /** 月份(显示如 "5月")*/
  month: string;
  /** 日期数字(显示如 "15")*/
  day: string;
  /** 事件标题(可多行换行)*/
  title: string;
  /** 时间 HH:MM */
  time: string;
  // Plan9 — 事件价值字段(由 V1 回补)
  /** 事件影响力(由 V1 回补;不显示 = 普通新闻)*/
  impact?: "high" | "medium" | "low";
  /** 事件公布后股价短期变化 % */
  priceChange?: number;
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
  generatedAt: "2026-05-17 08:29 EDT",
  signals: [
    { label: "Technical",  value: "Bullish",  trend: "up" },
    { label: "Fundamental", value: "Strong", trend: "up" },
    { label: "Sentiment",   value: "Mixed",  trend: "flat" },
    { label: "Valuation",   value: "Stretched", trend: "down" },
  ],
  entryDate: "5月15日",
  entryLocale: "New York 时间 16:00",
  priceSnapshot: {
    price: 300.23,
    changePct: 0.0068,
    sessionLabel: "收盘时",
    afterHours: { price: 299.85, changePct: -0.0013, label: "盘后" },
  },
  narrative:
    "在科技板块普遍走弱、标普 500 与纳斯达克分别回落 1% 与 1.5% 的背景下,Apple 仍守住 +0.68% 涨幅,逼近 52 周高点,显示出强于大盘的相对韧性。" +
    "这种韧性根植于 Q1 2026 业绩:124.3B 营收(+6.4% YoY)与创纪录的 41B 自由现金流(FCF margin 27.8%)双双超预期,服务业务 YoY +14.2%、占比突破 21%,毛利结构持续向上。" +
    "资本回报方面,管理层同步释放 100B 回购 + 股息上调至 0.27 USD/股,叠加 Tigress Financial 上调目标价至 375、Evercore ISI 至 365 等卖方利好,机构对短期上行空间维持 buy-side 共识(44 位分析师中 34 位 Buy/Outperform,目标价中位数 305、隐含 +6.1%)。" +
    "催化层面,WWDC 2026 即将开幕,Apple Intelligence 第二阶段更新与 Vision Pro 2 ($1,999–$2,499)发布构成双重 AI 叙事支撑。" +
    "但需警惕:Wearables YoY -2.4% 持续疲软、P/E 34.8x 显著高于行业均值 28.4x、Berkshire Q1 减持 2.3% 反映机构信心边际下行,加之大中华区监管不确定性与 OpenAI 合作可能进入法律诉讼,均构成中期估值脆弱性。" +
    "综合判断:AI 叙事 + 现金流 + 股东回报形成短期支撑底,但偏离 peer median 40% 的估值要求中性配置——重点跟踪服务渗透速率、Wearables 触底信号与 WWDC 催化兑现度。",
  sources: [
    { label: "B",  color: "var(--color-chart-blue)"  },
    { label: "R",  color: "var(--color-up)"          },
    { label: "α",  color: "var(--color-warn)"        },
    { label: "E",  color: "var(--color-down)"        },
    { label: "W",  color: "var(--color-chart-grey)"  },
    { label: "F",  color: "var(--color-accent)"      },
  ],
  fullAnalysisHint: "查看完整原始分析",
};

export const mockTrackedEvents: TrackedEvent[] = [
  { month: "5月", day: "15", time: "16:13", title: "报道称苹果计划在 iPhone 18 系列中使用自研 5G 芯片", impact: "high",   priceChange: 0.0240 },
  { month: "5月", day: "15", time: "15:12", title: "Mythos5 攻破苹果最强硬件,20 亿设备告急",            impact: "high",   priceChange: -0.0180 },
  { month: "5月", day: "15", time: "11:21", title: "分析师郭明錤:苹果正与英特尔合作开发低端芯片",       impact: "medium", priceChange: 0.0035 },
  { month: "5月", day: "15", time: "11:15", title: "苹果 iOS 26.3 推新隐私功能:自研数据机用户独享限制精确位置权限", impact: "low" },
  { month: "5月", day: "15", time: "09:01", title: "Spotify 采用苹果 HLS 技术,将播客分发至 Apple Podcasts",     impact: "low" },
  { month: "5月", day: "15", time: "08:46", title: "苹果扩展 Apple Wallet 车钥匙功能,新增支持保时捷车型",       impact: "low" },
  { month: "5月", day: "14", time: "17:30", title: "苹果发布 iOS 26.3 开发者测试版 Beta 2",                       impact: "medium", priceChange: 0.0012 },
  { month: "5月", day: "14", time: "10:15", title: "WWDC 2025 时间确认 6 月 9 日开幕,Apple Intelligence 第二阶段更新预期", impact: "high",   priceChange: 0.0184 },
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
    date: "04/30",
    title: "Apple Intelligence 商业化进展:从 Siri 升级到 Agent 经济",
    category: "Quick",
    rating: "Buy",
    summary: "iOS 18.4 起 Apple Intelligence 月活突破 4.2 亿,订阅化在即。ARPU 抬升空间可观,关注 Q3 发布会。",
  },
  {
    date: "04/22",
    title: "Vision Pro 2:这次能成为 iPhone 时刻吗?",
    category: "Deep",
    rating: "Hold",
    summary: "Vision Pro 2 价格区间 $1,999-$2,499,定位 AR Pro Consumer。技术成熟但内容生态仍是关键。",
  },
  {
    date: "04/15",
    title: "美联储利率路径与科技股估值压力:Apple 是受益方还是受害方?",
    category: "Macro",
    summary: "若 25H2 降息节奏不及预期,科技股 P/E 中枢将面临回调;Apple 的高现金 + 股东回报模型相对抗压。",
  },
  {
    date: "04/10",
    title: "苹果中国市场:从渠道到 AI 本土化的全链条复盘",
    category: "Deep",
    summary: "大中华区 Q1 增长 8%,但市场份额仍受华为蚕食。AI 本土化(百度/阿里合作)是关键反击。",
  },
];

export const mockNewsItems: NewsItem[] = [
  { time: "11:21", source: "信投 · 2 小时前", title: "郭明錤:苹果正培养英特尔合成长期关键供应商", sentiment: "bull",
    tickers: [
      { market: "US", name: "台积电",  pct:  0.0440 },
      { market: "US", name: "苹果",    pct: -0.0022 },
      { market: "US", name: "英特尔",  pct: -0.0362 },
    ],
  },
  { time: "11:18", source: "智通财经 · 2 小时前", title: "美股大型科技股盘前普跌,特斯拉跌 1%", sentiment: "bear",
    tickers: [
      { market: "US", name: "谷歌",    pct:  0.0440 },
      { market: "US", name: "苹果",    pct: -0.0058 },
      { market: "US", name: "特斯拉",  pct: -0.0084 },
    ],
  },
  { time: "11:10", source: "华尔街见闻 · 2 小时前", title: "股指高歌猛进、上涨高度集中,债市已\"拉响警报\"高盛警告\"高利率会杀死美股\"", sentiment: "bear",
    tickers: [
      { market: "US", name: "英伟达",  pct:  0.0430 },
      { market: "US", name: "苹果",    pct: -0.0022 },
      { market: "US", name: "倍信多英特...", pct:  0.0931 },
    ],
  },
  { time: "10:18", source: "信投 · 2 小时前", title: "部分降价千元!苹果华为开启促销,iPhone17Pro 最低 6999 元", sentiment: "neutral",
    tickers: [
      { market: "US", name: "苹果",    pct: -0.0022 },
      { market: "US", name: "苹果每日 2 ...", pct: -0.0064 },
      { market: "US", name: "苹果每日 1...",  pct:  0.0030 },
    ],
  },
  { time: "10:07", source: "科技家居 · 2 小时前", title: "iPhone 18 传全面屏导入苹果自研数据机,增加\"隐藏版\"隐私保护", sentiment: "neutral",
    tickers: [
      { market: "US", name: "苹果每日 2 ...", pct: -0.0064 },
      { market: "US", name: "AAPX",   pct: -0.0089 },
      { market: "US", name: "苹果 2 倍做多 AAP...", pct: -0.0064 },
    ],
  },
  { time: "09:50", source: "Apple PR · 3 小时前", title: "Apple Intelligence 在 EU 市场推出新功能",  sentiment: "neutral",
    tickers: [{ market: "US", name: "苹果", pct: -0.0022 }],
  },
];

export const mockDiscussions: DiscussionPost[] = [
  {
    user: "金融老炮",
    avatar: "金",
    avatarColor: "var(--chart-purple)",
    time: "15 分钟前",
    content:
      "Q1 EPS 超预期 $0.18,服务业务再创新高。但 wearables 拖累有点超预期,Vision Pro 2 必须接力。整体看,iPhone 单季出货量回升 + 服务高毛利持续,是支撑估值的两个基本面。短期催化看 WWDC 的 Apple Intelligence 第二阶段更新,以及大中华区是否能稳住份额。\n\n我自己在 Q1 报告后小幅加仓,目标价上调到 $325,主仓位会等回踩 $280 附近再补一档。",
    likes: 142,
    comments: 38,
    embeddedChart: {
      ticker: "AAPL",
      values: [278, 281, 285, 282, 287, 290, 288, 287, 292, 295, 293, 297, 298],
      pct: 0.034,
    },
  },
  {
    user: "Tech 价值",
    avatar: "T",
    avatarColor: "var(--chart-blue)",
    time: "1 小时前",
    content:
      "34.8x P/E 在 AI 叙事下还能撑多久?Buffett 减持是个信号——巴菲特从来不卖好公司,只是觉得贵了。\n\n我建议等 Vision Pro 2 发布后回调买入。如果 WWDC 信息对市场是利好兑现型的,股价可能短线见顶后回调 8–12%,那个位置才是合理的中长期入场点。",
    likes: 86,
    comments: 24,
  },
  {
    user: "Apple 死忠",
    avatar: "A",
    avatarColor: "var(--chart-green)",
    time: "3 小时前",
    content: "服务 14% YoY 增长在大盘是稀缺资产。继续持有,目标 $320。",
    likes: 56,
    comments: 12,
    attached: { ticker: "AAPL", pct: 0.034 },
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
