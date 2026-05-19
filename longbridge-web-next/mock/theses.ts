import type { Thesis } from "@/types/domain";

// Thesis mock · David 的 3 条核心 Thesis · 关联现有 Catalyst / Plan / Review。
// ISO timestamp 辅助函数 · demo "today" 锚点
const D = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86400_000).toISOString();

export const MOCK_THESES: Thesis[] = [
  {
    id: "thesis-nvda-ai-infra",
    symbol: "NVDA.US",
    company: "NVIDIA",
    title: "NVDA · AI 基建主升浪尚未结束",
    status: "Active",
    hypothesis:
      "NVDA 的 Data Center 营收可见性被 hyperscaler 的 capex 周期锁定至 2027,当前估值(forward P/E ~32x)相对 earnings 增速(40%+ CAGR)并不昂贵。AI 推理需求爆发将接力训练需求,延长增长窗口。",
    assumptions: [
      {
        id: "a1",
        text: "Microsoft / Google / Amazon / Meta 2026 capex 指引 ≥ $230B 合计 · AI 占比 ≥ 60%",
        confidence: 0.85,
      },
      {
        id: "a2",
        text: "Blackwell 系列毛利率维持在 75%+,不被 Amazon Trainium / Google TPU 显著侵蚀",
        confidence: 0.7,
      },
      {
        id: "a3",
        text: "推理市场规模 18 个月内至少是训练市场的 2x",
        confidence: 0.65,
      },
      {
        id: "a4",
        text: "中国出口管制不进一步升级 · 或即使升级 RoW 增量可对冲",
        confidence: 0.6,
      },
    ],
    invalidationConditions: [
      "任一季度 Data Center 营收 QoQ 增速 < 5%(过去 8 季均 > 10%)",
      "Hyperscaler 在电话会中明确削减 2026 AI capex",
      "Blackwell 毛利率连续两季度 < 72%",
    ],
    supportingCatalystIds: [
      "cat-nvda-hyperscaler-capex",
      "cat-msft-earnings-q3",
    ],
    linkedPlanIds: ["plan-nvda-ai-ladder"],
    linkedReviewIds: [],
    version: 3,
    createdAt: D(62),
    updatedAt: D(2),
  },
  {
    id: "thesis-msft-enterprise-moat",
    symbol: "MSFT.US",
    company: "Microsoft",
    title: "MSFT · 企业渠道护城河 + Azure AI 变现",
    status: "Active",
    hypothesis:
      "Microsoft 在企业客户端的渠道锁定 + Copilot 产品化能力,使 AI 货币化速度显著快于其它云厂。未来 6 季度 Azure AI 收入占比持续抬升,拉动整体毛利率。",
    assumptions: [
      {
        id: "a1",
        text: "Azure 增速未来 4 季度维持在 25%+",
        confidence: 0.8,
      },
      {
        id: "a2",
        text: "Copilot 渗透率(E5 席位)18 个月内达 30%+",
        confidence: 0.55,
      },
      {
        id: "a3",
        text: "OpenAI 合作条款不出现对 MSFT 不利的重大重构",
        confidence: 0.75,
      },
    ],
    invalidationConditions: [
      "Azure 增速连续两季度回落至 20% 以下",
      "Copilot 付费席位连续两季度 QoQ 下滑",
      "监管层面出现强制拆分 OpenAI 合作的判决",
    ],
    supportingCatalystIds: ["cat-msft-earnings-q3", "cat-msft-analyst-upgrade"],
    linkedPlanIds: [],
    linkedReviewIds: [],
    version: 2,
    createdAt: D(45),
    updatedAt: D(5),
  },
  {
    id: "thesis-semi-cyclical-top",
    symbol: "SEMI.SECTOR",
    company: "半导体行业",
    title: "半导体 · 周期顶部风险管理",
    status: "Active",
    hypothesis:
      "半导体整体估值已接近 2021 周期顶部水平(forward P/S 中位数 > 历史 85 分位)。即使个股 thesis 成立,行业整体 beta 回撤风险已经升高。对应仓位上限应下调。",
    assumptions: [
      {
        id: "a1",
        text: "费城半导体指数 forward P/S 若进一步抬升 10%,周期顶部信号增强",
        confidence: 0.7,
      },
      {
        id: "a2",
        text: "VIX 若升破 18,板块 beta 回撤风险放大 · 应优先减持高贝塔个股",
        confidence: 0.75,
      },
    ],
    invalidationConditions: [
      "费城半导体指数跌破 200 日均线并回补 · 周期下行确认",
      "连续两季 hyperscaler capex 指引下修",
    ],
    supportingCatalystIds: ["cat-nvda-parabolic", "cat-nvda-vix-complacency"],
    linkedPlanIds: [],
    linkedReviewIds: [],
    version: 1,
    createdAt: D(12),
    updatedAt: D(1),
  },
];

export function getThesis(id: string): Thesis | undefined {
  return MOCK_THESES.find((t) => t.id === id);
}

export function getThesesForSymbol(symbol: string): Thesis[] {
  return MOCK_THESES.filter((t) => t.symbol === symbol);
}
