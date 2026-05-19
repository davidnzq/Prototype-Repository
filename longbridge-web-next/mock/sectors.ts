// GICS 一级行业 + 今日涨跌幅(mock)。Markets 页 Sectors heatmap 用。

export interface Sector {
  key: string;
  nameZh: string;
  nameEn: string;
  pct: number; // 今日 %
  marketCap: number; // $T
  weight: number; // SPX 权重
  topSymbols: string[];
}

export const MOCK_SECTORS: Sector[] = [
  { key: "tech", nameZh: "科技", nameEn: "Information Technology", pct: 1.8, marketCap: 14.2, weight: 0.28, topSymbols: ["MSFT", "NVDA", "AAPL", "AVGO"] },
  { key: "comm", nameZh: "通信服务", nameEn: "Communication Services", pct: 1.3, marketCap: 6.1, weight: 0.085, topSymbols: ["GOOGL", "META", "NFLX"] },
  { key: "disc", nameZh: "可选消费", nameEn: "Consumer Discretionary", pct: 1.5, marketCap: 7.4, weight: 0.105, topSymbols: ["AMZN", "TSLA", "HD"] },
  { key: "fin", nameZh: "金融", nameEn: "Financials", pct: 0.4, marketCap: 9.8, weight: 0.135, topSymbols: ["JPM", "BRK.B", "BAC", "WFC"] },
  { key: "health", nameZh: "医疗保健", nameEn: "Health Care", pct: -0.2, marketCap: 8.9, weight: 0.12, topSymbols: ["UNH", "LLY", "JNJ"] },
  { key: "indust", nameZh: "工业", nameEn: "Industrials", pct: 0.6, marketCap: 5.2, weight: 0.085, topSymbols: ["CAT", "BA", "UNP"] },
  { key: "staples", nameZh: "必需消费", nameEn: "Consumer Staples", pct: -0.3, marketCap: 4.6, weight: 0.06, topSymbols: ["WMT", "PG", "KO"] },
  { key: "energy", nameZh: "能源", nameEn: "Energy", pct: -1.2, marketCap: 3.1, weight: 0.04, topSymbols: ["XOM", "CVX", "COP"] },
  { key: "util", nameZh: "公用事业", nameEn: "Utilities", pct: 0.2, marketCap: 2.8, weight: 0.025, topSymbols: ["NEE", "SO", "DUK"] },
  { key: "mat", nameZh: "材料", nameEn: "Materials", pct: -0.6, marketCap: 2.4, weight: 0.022, topSymbols: ["LIN", "SHW", "APD"] },
  { key: "re", nameZh: "房地产", nameEn: "Real Estate", pct: 0.8, marketCap: 2.1, weight: 0.022, topSymbols: ["PLD", "AMT", "EQIX"] },
];
