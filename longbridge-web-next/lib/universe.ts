// The 10 demo symbols. AI-covered objects (Catalyst/Signal/TradePlan/Review)
// are mocked in depth for these. Other symbols will show "AI coverage pending".

export interface DemoSecurity {
  symbol: string;
  name: string;
  nameZh: string;
  market: "US" | "HK" | "CN" | "SG";
  sector: string;
  tags: readonly string[];
  coverage: "deep" | "light"; // deep = full Catalyst/Signal/Plan/Review; light = Catalyst+Signal only
}

export const DEMO_UNIVERSE: readonly DemoSecurity[] = [
  // Primary 3 — deep coverage, designed to showcase multi-strategy differences
  { symbol: "MSFT.US", name: "Microsoft", nameZh: "微软", market: "US", sector: "Tech · 软件", tags: ["value+growth", "ai-infra", "mega-cap"], coverage: "deep" },
  { symbol: "NVDA.US", name: "NVIDIA", nameZh: "英伟达", market: "US", sector: "Tech · 半导体", tags: ["ai-bubble", "high-vol", "mega-cap", "semi"], coverage: "deep" },
  { symbol: "TSLA.US", name: "Tesla", nameZh: "特斯拉", market: "US", sector: "Auto · EV", tags: ["high-vol", "momentum"], coverage: "deep" },
  // Light coverage — 1-2 Catalysts + 1 Signal each
  { symbol: "AAPL.US", name: "Apple", nameZh: "苹果", market: "US", sector: "Tech · 消费电子", tags: ["value", "mega-cap"], coverage: "light" },
  { symbol: "GOOGL.US", name: "Alphabet", nameZh: "谷歌", market: "US", sector: "Tech · 互联网", tags: ["growth", "mega-cap"], coverage: "light" },
  { symbol: "AMZN.US", name: "Amazon", nameZh: "亚马逊", market: "US", sector: "Tech · 电商+云", tags: ["growth", "mega-cap"], coverage: "light" },
  { symbol: "META.US", name: "Meta Platforms", nameZh: "Meta", market: "US", sector: "Tech · 社交", tags: ["value", "mega-cap"], coverage: "light" },
  { symbol: "TSM.US", name: "Taiwan Semi", nameZh: "台积电", market: "US", sector: "Tech · 半导体代工", tags: ["semi", "cyclical"], coverage: "light" },
  { symbol: "JPM.US", name: "JPMorgan Chase", nameZh: "摩根大通", market: "US", sector: "Finance · 银行", tags: ["finance", "macro-sensitive"], coverage: "light" },
  { symbol: "COIN.US", name: "Coinbase", nameZh: "Coinbase", market: "US", sector: "Finance · Crypto", tags: ["crypto", "high-risk"], coverage: "light" },
] as const;

export type DemoSymbol = (typeof DEMO_UNIVERSE)[number]["symbol"];

export function getSecurity(symbol: string): DemoSecurity | undefined {
  return DEMO_UNIVERSE.find((s) => s.symbol === symbol);
}

export function isCoveredSymbol(symbol: string): boolean {
  return DEMO_UNIVERSE.some((s) => s.symbol === symbol);
}

export function isDeepCoverage(symbol: string): boolean {
  return DEMO_UNIVERSE.find((s) => s.symbol === symbol)?.coverage === "deep";
}
