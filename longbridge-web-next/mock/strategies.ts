import type { Strategy } from "@/types/domain";

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "strat-buffett-value",
    name: "Buffett Value Strategy",
    nameZh: "巴菲特价值策略",
    slogan: "以合理价买伟大公司,并且永远持有。",
    philosophy:
      "安全边际是核心。优先找有经济护城河、ROE 稳定在 15% 以上、负债权益比 < 0.5 的企业,并要求当前估值相对内在价值有 ≥20% 折价。",
    kind: "Stock-First",
    objective: {
      universe: ["US 大市值", "HK 蓝筹"],
      goal: "年化超额收益 > 8%,最大回撤 < 15%",
      frequency: "季度再评估",
      riskBudget: "单票上限 10%,行业集中度 < 30%",
    },
    model: {
      factors: [
        { group: "QUALITY", weight: 0.35, name: "ROE / 资本回报率" },
        { group: "VALUE", weight: 0.3, name: "折价率 / PE 分位" },
        { group: "PROFITABILITY", weight: 0.2, name: "毛利率稳定性" },
        { group: "QUALITY", weight: 0.15, name: "负债率 / 护城河评估" },
      ],
      checklistSize: 10,
    },
    rules: {
      entry: "折价 > 20% 时阶梯建仓(30/40/30);10–20% 弹性建仓;< 10% 挂单等待",
      exit: "基本面止损(ROE 连续 2 季度低于阈值 或 护城河受损),或价格 ≥ 乐观估值时减仓",
      sizing: "HIGH=20% · MEDIUM=15% · LOW=不建议交易",
    },
  },
  {
    id: "strat-wood-innovation",
    name: "Wood Innovation Strategy",
    nameZh: "木头姐创新策略",
    slogan: "押注改变世界的颠覆性技术。",
    philosophy:
      "聚焦 AI、基因组、自动化、区块链等长期结构性创新赛道。容忍短期波动,重视 5 年期营收 CAGR、TAM 扩张、Wright 定律成本曲线。",
    kind: "Stock-First",
    objective: {
      universe: ["US 创新成长股"],
      goal: "年化 15%+,5 年期跑赢纳指",
      frequency: "月度再评估",
      riskBudget: "单票上限 15%,主题集中度无硬性上限",
    },
    model: {
      factors: [
        { group: "GROWTH", weight: 0.35, name: "营收 CAGR / 季度环比加速" },
        { group: "MOMENTUM", weight: 0.2, name: "相对强度 RS" },
        { group: "GROWTH", weight: 0.2, name: "TAM 扩张潜力" },
        { group: "QUALITY", weight: 0.15, name: "创新平台契合度" },
        { group: "NEWS", weight: 0.1, name: "催化事件 / 产品里程碑" },
      ],
      checklistSize: 10,
    },
    rules: {
      entry: "新高突破 + 成交量 > 1.5x 时分批建仓",
      exit: "营收加速度连续两季度失速,或 RS 跌破 50 分位时减仓",
      sizing: "HIGH=15% · MEDIUM=10% · LOW=5%",
    },
  },
  {
    id: "strat-simons-quant",
    name: "Simons Quant Strategy",
    nameZh: "西蒙斯量化策略",
    slogan: "像机器一样执行,相信概率优势。",
    philosophy:
      "排除主观情绪,多因子共振验证统计优势。价格动量 / 成交量 / 技术指标 / 统计显著性,所有因子同时达标才入场。依赖大样本 + 高分散 + 严格纪律。",
    kind: "Stock-First",
    objective: {
      universe: ["US 高流动性股票"],
      goal: "低波动绝对回报",
      frequency: "日度 / 事件驱动",
      riskBudget: "单票上限 2%,总仓位无硬限",
    },
    model: {
      factors: [
        { group: "MOMENTUM", weight: 0.3, name: "价格动量(MA20/50 突破)" },
        { group: "MOMENTUM", weight: 0.25, name: "成交量确认(> 20 日均量 1.5x)" },
        { group: "TREND", weight: 0.3, name: "技术指标对齐(RSI/MACD/ATR)" },
        { group: "LOW_VOLATILITY", weight: 0.15, name: "统计显著性" },
      ],
      checklistSize: 10,
    },
    rules: {
      entry: "多因子共振(10 项至少 7 项 Pass)时按 1-2% 单票仓位入场",
      exit: "信号衰减 / 反转 / 统计优势消失即平仓,不等待",
      sizing: "所有 Conviction 等级统一 <2% 单票(靠分散获利)",
    },
  },
  {
    id: "strat-soros-reflexivity",
    name: "Soros Reflexivity Strategy",
    nameZh: "索罗斯反身性策略",
    slogan: "市场总是错的 —— 顺势进泡沫,拐点做空。",
    philosophy:
      "参与者的认知偏差会与价格形成自我强化的正反馈,最终演变为泡沫或崩塌。在趋势自我强化期顺势介入,在假设被证伪时立即清仓。",
    kind: "Stock-First",
    objective: {
      universe: ["US 高成交量个股", "宏观 ETF"],
      goal: "捕捉顶部泡沫或拐点反转的尾部收益",
      frequency: "事件驱动",
      riskBudget: "初始 10–15%,金字塔式加仓上限 25%",
    },
    model: {
      factors: [
        { group: "MOMENTUM", weight: 0.25, name: "主流偏见 / 市场共识裂痕" },
        { group: "MOMENTUM", weight: 0.25, name: "泡沫阶段识别" },
        { group: "LOW_VOLATILITY", weight: 0.2, name: "情绪指标(VIX / Put-Call)" },
        { group: "NEWS", weight: 0.15, name: "催化事件" },
        { group: "TREND", weight: 0.15, name: "反身性强化循环" },
      ],
      checklistSize: 10,
    },
    rules: {
      entry: "VIX < 12 或 > 40 + 20 日涨跌幅触及极值 + 成交量 3x+ 时,金字塔建仓",
      exit: "逻辑证伪即清仓(勇于认错),或背痛信号达到阈值主动退出",
      sizing: "试探仓 10–15% → 验证后加至 20–25%",
    },
  },
];

export function getStrategy(id: string): Strategy | undefined {
  return MOCK_STRATEGIES.find((s) => s.id === id);
}
