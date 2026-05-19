// 股票详情页用的"基本面快照" · Demo mock 数据
// 数值方向正确,具体数字假设性,与 Catalyst / Signal factors 大致一致。

export interface StockFundamentals {
  symbol: string;
  marketCap: number; // USD, billions
  peRatio: number;
  pegRatio?: number;
  dividendYield: number; // 百分数 · 0 表示不分红
  week52High: number;
  week52Low: number;
  avgVolume: number; // 股/日均
  beta: number;
  // Growth
  revenueYoY: number; // %
  revenueCagr5y: number; // %
  operatingMargin: number; // %
  roe: number; // %
  // Analyst consensus
  analystRating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  analystCount: number;
  ratingBreakdown: { buy: number; hold: number; sell: number };
  consensusTarget: number; // $
}

export const MOCK_STOCK_FUNDAMENTALS: StockFundamentals[] = [
  {
    symbol: "MSFT.US",
    marketCap: 3120,
    peRatio: 36.2,
    pegRatio: 2.1,
    dividendYield: 0.72,
    week52High: 491.17,
    week52Low: 356.28,
    avgVolume: 22_400_000,
    beta: 0.93,
    revenueYoY: 17.2,
    revenueCagr5y: 15.8,
    operatingMargin: 47.1,
    roe: 38.0,
    analystRating: "Buy",
    analystCount: 52,
    ratingBreakdown: { buy: 42, hold: 8, sell: 2 },
    consensusTarget: 465.0,
  },
  {
    symbol: "NVDA.US",
    marketCap: 3580,
    peRatio: 68.4,
    pegRatio: 1.4,
    dividendYield: 0.02,
    week52High: 180.2,
    week52Low: 88.4,
    avgVolume: 285_000_000,
    beta: 1.72,
    revenueYoY: 94.0,
    revenueCagr5y: 62.0,
    operatingMargin: 58.2,
    roe: 98.3,
    analystRating: "Strong Buy",
    analystCount: 58,
    ratingBreakdown: { buy: 54, hold: 3, sell: 1 },
    consensusTarget: 195.0,
  },
  {
    symbol: "TSLA.US",
    marketCap: 1200,
    peRatio: 82.1,
    pegRatio: 4.2,
    dividendYield: 0,
    week52High: 488.5,
    week52Low: 212.3,
    avgVolume: 95_000_000,
    beta: 2.18,
    revenueYoY: 8.3,
    revenueCagr5y: 32.4,
    operatingMargin: 7.8,
    roe: 22.1,
    analystRating: "Hold",
    analystCount: 45,
    ratingBreakdown: { buy: 18, hold: 20, sell: 7 },
    consensusTarget: 385.0,
  },
  {
    symbol: "AAPL.US",
    marketCap: 3420,
    peRatio: 32.1,
    pegRatio: 3.5,
    dividendYield: 0.48,
    week52High: 260.1,
    week52Low: 164.3,
    avgVolume: 54_000_000,
    beta: 1.24,
    revenueYoY: 3.2,
    revenueCagr5y: 9.1,
    operatingMargin: 30.7,
    roe: 148.0,
    analystRating: "Buy",
    analystCount: 48,
    ratingBreakdown: { buy: 32, hold: 14, sell: 2 },
    consensusTarget: 250.0,
  },
  {
    symbol: "GOOGL.US",
    marketCap: 2250,
    peRatio: 27.4,
    pegRatio: 1.6,
    dividendYield: 0.28,
    week52High: 360.4,
    week52Low: 210.5,
    avgVolume: 28_000_000,
    beta: 1.08,
    revenueYoY: 13.8,
    revenueCagr5y: 14.2,
    operatingMargin: 32.1,
    roe: 31.4,
    analystRating: "Buy",
    analystCount: 51,
    ratingBreakdown: { buy: 40, hold: 10, sell: 1 },
    consensusTarget: 340.0,
  },
  {
    symbol: "AMZN.US",
    marketCap: 2340,
    peRatio: 48.2,
    pegRatio: 1.9,
    dividendYield: 0,
    week52High: 270.8,
    week52Low: 178.6,
    avgVolume: 45_000_000,
    beta: 1.21,
    revenueYoY: 12.0,
    revenueCagr5y: 17.8,
    operatingMargin: 11.2,
    roe: 21.3,
    analystRating: "Strong Buy",
    analystCount: 56,
    ratingBreakdown: { buy: 49, hold: 6, sell: 1 },
    consensusTarget: 265.0,
  },
  {
    symbol: "META.US",
    marketCap: 1620,
    peRatio: 25.8,
    pegRatio: 1.2,
    dividendYield: 0.38,
    week52High: 752.0,
    week52Low: 478.0,
    avgVolume: 15_000_000,
    beta: 1.34,
    revenueYoY: 21.5,
    revenueCagr5y: 18.4,
    operatingMargin: 42.6,
    roe: 35.8,
    analystRating: "Buy",
    analystCount: 49,
    ratingBreakdown: { buy: 41, hold: 7, sell: 1 },
    consensusTarget: 740.0,
  },
  {
    symbol: "TSM.US",
    marketCap: 1180,
    peRatio: 31.2,
    pegRatio: 1.3,
    dividendYield: 1.12,
    week52High: 251.0,
    week52Low: 142.0,
    avgVolume: 18_000_000,
    beta: 1.15,
    revenueYoY: 36.4,
    revenueCagr5y: 28.2,
    operatingMargin: 44.3,
    roe: 31.8,
    analystRating: "Strong Buy",
    analystCount: 38,
    ratingBreakdown: { buy: 34, hold: 4, sell: 0 },
    consensusTarget: 280.0,
  },
  {
    symbol: "JPM.US",
    marketCap: 820,
    peRatio: 13.4,
    pegRatio: 1.8,
    dividendYield: 2.08,
    week52High: 312.0,
    week52Low: 231.0,
    avgVolume: 8_500_000,
    beta: 1.08,
    revenueYoY: 9.2,
    revenueCagr5y: 8.6,
    operatingMargin: 34.7,
    roe: 16.8,
    analystRating: "Buy",
    analystCount: 27,
    ratingBreakdown: { buy: 18, hold: 8, sell: 1 },
    consensusTarget: 315.0,
  },
  {
    symbol: "COIN.US",
    marketCap: 78,
    peRatio: 54.8,
    pegRatio: 2.4,
    dividendYield: 0,
    week52High: 445.0,
    week52Low: 122.0,
    avgVolume: 12_000_000,
    beta: 3.24,
    revenueYoY: 48.6,
    revenueCagr5y: 22.3,
    operatingMargin: 24.1,
    roe: 19.4,
    analystRating: "Hold",
    analystCount: 28,
    ratingBreakdown: { buy: 12, hold: 12, sell: 4 },
    consensusTarget: 310.0,
  },
];

export function getFundamentals(symbol: string): StockFundamentals | undefined {
  return MOCK_STOCK_FUNDAMENTALS.find((f) => f.symbol === symbol);
}

export function formatMarketCap(billion: number): string {
  if (billion >= 1000) return `$${(billion / 1000).toFixed(2)}T`;
  return `$${billion.toFixed(0)}B`;
}
