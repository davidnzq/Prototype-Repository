// Demo 用户的 mock 持仓 + 画像绑定。没有通过 Longport 的 TradeContext 去拉
// 真实账户(demo 不需要,也避免暴露演示者账户)。

import type { PortraitRole } from "@/types/domain";

export interface PortfolioHolding {
  symbol: string;
  name: string;
  nameZh: string;
  shares: number;
  avgCost: number;
  sector: string;
}

export interface DemoUser {
  id: string;
  displayName: string;
  portraitRole: PortraitRole;
  portraitTagline: string;
  totalAssets: number; // USD
  cash: number;
  holdings: PortfolioHolding[];
}

export const MOCK_USER: DemoUser = {
  id: "demo-user-1",
  displayName: "Demo 用户",
  portraitRole: "Pioneer",
  portraitTagline: "偏好结构性成长 · 容忍高波动 · 长期持有 AI / 半导体主题",
  totalAssets: 284392.55,
  cash: 38420.12,
  holdings: [
    // 成本基对齐真实 Longport 行情,保证 PnL 在合理范围(+3% ~ +12%)
    { symbol: "NVDA.US", name: "NVIDIA", nameZh: "英伟达", shares: 42, avgCost: 180.5, sector: "Tech · 半导体" },
    { symbol: "MSFT.US", name: "Microsoft", nameZh: "微软", shares: 65, avgCost: 395.8, sector: "Tech · 软件" },
    { symbol: "GOOGL.US", name: "Alphabet", nameZh: "谷歌", shares: 120, avgCost: 315.2, sector: "Tech · 互联网" },
    { symbol: "TSM.US", name: "Taiwan Semi", nameZh: "台积电", shares: 80, avgCost: 342.6, sector: "Tech · 半导体" },
    { symbol: "TSLA.US", name: "Tesla", nameZh: "特斯拉", shares: 30, avgCost: 384.7, sector: "Auto · EV" },
    { symbol: "JPM.US", name: "JPMorgan", nameZh: "摩根大通", shares: 40, avgCost: 288.5, sector: "Finance · 银行" },
  ],
};

// Compute derived portfolio metrics against live quotes
export function computePortfolioMetrics(
  quotes: Map<string, number> // symbol -> last price
) {
  let equityValue = 0;
  const positions = MOCK_USER.holdings.map((h) => {
    const last = quotes.get(h.symbol) ?? h.avgCost;
    const value = h.shares * last;
    equityValue += value;
    return {
      ...h,
      last,
      value,
      costBasis: h.shares * h.avgCost,
      pnl: value - h.shares * h.avgCost,
      pnlPct: (last - h.avgCost) / h.avgCost,
    };
  });

  const totalAssets = equityValue + MOCK_USER.cash;
  const positionsWithWeight = positions.map((p) => ({
    ...p,
    weight: p.value / totalAssets,
  }));

  // Sector concentration
  const sectorMap = new Map<string, number>();
  for (const p of positionsWithWeight) {
    sectorMap.set(p.sector, (sectorMap.get(p.sector) ?? 0) + p.weight);
  }
  const sectorBreakdown = Array.from(sectorMap.entries())
    .map(([sector, weight]) => ({ sector, weight }))
    .sort((a, b) => b.weight - a.weight);

  const techWeight = sectorBreakdown
    .filter((s) => s.sector.startsWith("Tech"))
    .reduce((sum, s) => sum + s.weight, 0);

  return {
    totalAssets,
    equityValue,
    cash: MOCK_USER.cash,
    cashWeight: MOCK_USER.cash / totalAssets,
    positions: positionsWithWeight,
    sectorBreakdown,
    techConcentration: techWeight,
  };
}
