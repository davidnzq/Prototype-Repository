import type { Signal } from "@/types/domain";

const T = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600_000).toISOString();

export const MOCK_SIGNALS: Signal[] = [
  // ─── MSFT × Buffett Value(同股多策略对比 A:LOW Conviction) ──────
  {
    id: "sig-msft-buffett",
    issuedAt: T(10),
    symbol: "MSFT.US",
    company: "Microsoft",
    strategyId: "strat-buffett-value",
    strategyName: "Buffett Value Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Neutral",
    outlook: "Neutral",
    action: "WATCH",
    currentPrice: 422.79,
    targetPrice: 390.0,
    upsidePct: -7.8,
    convictionScore: 38,
    conviction: "LOW",
    strategyFitScore: 45,
    oneLineConclusion:
      "生意质量足够『伟大』,但当前估值不留安全边际,建议观察等待。",
    thesis: [
      "ROE 38%,护城河(Azure 渠道锁定)稳固,公司质量远超策略底线",
      "但 PE 36x 处历史 5 年 82 分位,折价深度不足 10%(策略阈值 20%)",
      "若出现 CPI 超预期 / Azure 增速失速等回调催化,$380 以下可重新审视",
    ],
    risks: [
      "Azure 增速若回落至 20% 以下,估值重构压力显著",
      "AI capex 回报周期若被证伪,整段叙事失灵",
    ],
    horizon: "本次判断有效期约 1-2 季度,等回调或基本面变化再评估",
    catalystIds: ["cat-msft-earnings-q3", "cat-msft-analyst-upgrade"],
    factors: [
      { name: "ROE", category: "QUALITY", value: "38%", threshold: "> 15%", passed: true, weight: 0.25 },
      { name: "毛利率稳定性", category: "PROFITABILITY", value: "70.1% (±0.8pp)", threshold: "稳定 ±3pp", passed: true, weight: 0.15 },
      { name: "负债/权益", category: "QUALITY", value: "0.31", threshold: "< 0.5", passed: true, weight: 0.15 },
      { name: "PE 5Y 分位", category: "VALUE", value: "82 分位", threshold: "< 60 分位", passed: false, weight: 0.25 },
      { name: "相对内在价值折价", category: "VALUE", value: "-5%(溢价)", threshold: "≥ 20% 折价", passed: false, weight: 0.2 },
    ],
    personalization:
      "你的画像是『先驱者』,安全边际不是你的核心约束 —— 这条 Signal 仅供对照参考。",
  },

  // ─── MSFT × Wood Innovation(同股多策略对比 B:HIGH Conviction) ───
  {
    id: "sig-msft-wood",
    issuedAt: T(8),
    symbol: "MSFT.US",
    company: "Microsoft",
    strategyId: "strat-wood-innovation",
    strategyName: "Wood Innovation Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "UPGRADE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 422.79,
    targetPrice: 485.0,
    upsidePct: 14.7,
    convictionScore: 78,
    conviction: "HIGH",
    strategyFitScore: 85,
    oneLineConclusion:
      "AI infra 仍处周期早期,Azure 第 3 个加速季 + capex 上调,新高突破成立。",
    thesis: [
      "Azure 连续 3 个加速季,AI 服务贡献 11pp(上季 9pp)—— 成长加速曲线成立",
      "Hyperscaler capex 合计 +$45B YoY,MSFT 自身 capex 指引上调至 $23B/季",
      "技术面放量突破 50DMA · RS 位于纳指成分 Top 15%",
    ],
    risks: [
      "估值已不便宜,PE 36x 是市场情绪敏感区",
      "若 AI capex 回报周期延长至 4+ 年,中期叙事可能回摆",
    ],
    horizon: "建议窗口 1-2 周,下次 Azure 月度数据或 CPI 前重新评估",
    catalystIds: [
      "cat-msft-earnings-q3",
      "cat-msft-analyst-upgrade",
      "cat-msft-macro-rate",
      "cat-msft-tech-breakout",
    ],
    factors: [
      { name: "营收 CAGR(5Y)", category: "GROWTH", value: "15.8%", threshold: "> 12%", passed: true, weight: 0.25 },
      { name: "季度环比加速", category: "GROWTH", value: "第 3 季加速", threshold: "≥ 2 季连续加速", passed: true, weight: 0.2 },
      { name: "相对强度 RS", category: "MOMENTUM", value: "92 分位", threshold: "> 70 分位", passed: true, weight: 0.2 },
      { name: "TAM 扩张", category: "GROWTH", value: "AI infra TAM +$180B", threshold: "TAM 加速", passed: true, weight: 0.2 },
      { name: "创新平台契合度", category: "QUALITY", value: "AI / Cloud / Enterprise SaaS 3 赛道交集", threshold: "≥ 2 个主赛道", passed: true, weight: 0.15 },
    ],
    personalization:
      "你的画像(先驱者)与这条 Signal 的风险偏好高度匹配,这是『你的机会』。",
  },

  // ─── NVDA × Soros Reflexivity(泡沫加速顺势介入) ──────────────────
  {
    id: "sig-nvda-soros",
    issuedAt: T(5),
    symbol: "NVDA.US",
    company: "NVIDIA",
    strategyId: "strat-soros-reflexivity",
    strategyName: "Soros Reflexivity Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Strong_bullish",
    outlook: "Strong_bullish",
    action: "BUY",
    currentPrice: 942.12,
    targetPrice: 1120.0,
    upsidePct: 18.9,
    convictionScore: 92,
    conviction: "HIGH",
    strategyFitScore: 100,
    oneLineConclusion:
      "反身性自我强化阶段 10/10 因子共振,金字塔式试探 10-15%。",
    thesis: [
      "主流偏见显著:市场低估了 AI capex 周期长度,实际订单簿厚于共识 2 个季度",
      "价格 / 成交量 / 波动率三维同时处于极值区间(20D +35% · Vol 3.2x · RSI 82 · ATR +25%)",
      "VIX 11.5 极度贪婪 —— 反身性正反馈还未达峰值",
      "catalyst 侧:hyperscaler capex 指引 +$45B,下游需求可见性延伸到 2027",
    ],
    risks: [
      "泡沫顶点不可预测,入场必须金字塔控制初始仓位 ≤ 15%",
      "反身性循环可能因宏观冲击(CPI / 地缘事件)突然中断,需预设逻辑证伪即清仓",
      "RSI 82 已深入超买区,短期 3-5% 回撤的概率高",
    ],
    horizon: "动态 —— 假设成立期间持续持有,证伪即刻清仓,不等待",
    catalystIds: ["cat-nvda-parabolic", "cat-nvda-hyperscaler-capex", "cat-nvda-vix-complacency"],
    factors: [
      { name: "主流偏见", category: "MOMENTUM", value: "Excellent", threshold: "共识与现实裂痕", passed: true, weight: 0.2 },
      { name: "泡沫阶段", category: "MOMENTUM", value: "自我强化加速期", threshold: "正反馈循环成立", passed: true, weight: 0.2 },
      { name: "VIX", category: "LOW_VOLATILITY", value: "11.5", threshold: "< 12 或 > 40", passed: true, weight: 0.15 },
      { name: "20 日涨幅", category: "MOMENTUM", value: "+35.1%", threshold: "> 30% 或 < -25%", passed: true, weight: 0.15 },
      { name: "成交量 ratio", category: "MOMENTUM", value: "3.2x", threshold: "> 3x", passed: true, weight: 0.15 },
      { name: "RSI(14)", category: "TREND", value: "82", threshold: "> 80 或 < 20", passed: true, weight: 0.15 },
    ],
    personalization:
      "Pioneer 画像天然偏好这类风格,但请严守金字塔建仓纪律。",
  },

  // ─── TSLA × Simons Quant(多因子共振) ─────────────────────────────
  {
    id: "sig-tsla-simons",
    issuedAt: T(3),
    symbol: "TSLA.US",
    company: "Tesla",
    strategyId: "strat-simons-quant",
    strategyName: "Simons Quant Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 400.62,
    targetPrice: 426.0,
    upsidePct: 6.3,
    convictionScore: 85,
    conviction: "HIGH",
    strategyFitScore: 100,
    oneLineConclusion: "10 项量化因子全过,按 <2% 单票仓位分散建仓。",
    thesis: [
      "MA20 / MA50 双突破,形态从震荡转为趋势",
      "成交量 3.2x 确认资金动向",
      "RSI 72(强势区间,未超买) + MACD 0 轴上方金叉",
      "基本面辅证:Q1 交付数据同比首次转正(+3.7%),低基数反转叙事成立",
    ],
    risks: [
      "量化策略胜率 52-55%,单笔不应重仓",
      "市场机制突变(regime change)时历史统计失效",
      "信号滞后:RSI / MACD 基于已发生的价格行为",
    ],
    horizon: "短线,数日至数周 · 退出条件触发即平仓",
    catalystIds: ["cat-tsla-multifactor", "cat-tsla-delivery"],
    factors: [
      { name: "RSI(14)", category: "MOMENTUM", value: "72", threshold: "> 70", passed: true, weight: 0.1 },
      { name: "MA20/50 突破", category: "TREND", value: "PASS", threshold: "突破均线", passed: true, weight: 0.15 },
      { name: "Volume vs 20DMA", category: "MOMENTUM", value: "3.2x", threshold: "> 1.5x", passed: true, weight: 0.15 },
      { name: "ATR 扩张", category: "LOW_VOLATILITY", value: "+25%", threshold: "> 20%", passed: true, weight: 0.1 },
      { name: "MACD 信号", category: "TREND", value: "0 轴金叉", threshold: "0 轴上方金叉", passed: true, weight: 0.15 },
      { name: "布林带位置", category: "TREND", value: "上轨区域", threshold: "接近上轨", passed: true, weight: 0.1 },
      { name: "随机指标", category: "MOMENTUM", value: "78", threshold: "> 70", passed: true, weight: 0.1 },
      { name: "价格多因子共振", category: "MOMENTUM", value: "PASS", threshold: "3 项同时触发", passed: true, weight: 0.15 },
    ],
    personalization:
      "量化策略需要严格分散和纪律,单笔 <2% 是核心约束。",
  },

  // ─── AAPL × Buffett Value(轻覆盖) ────────────────────────────────
  {
    id: "sig-aapl-buffett",
    issuedAt: T(12),
    symbol: "AAPL.US",
    company: "Apple",
    strategyId: "strat-buffett-value",
    strategyName: "Buffett Value Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "REITERATE",
    recommendation: "Neutral",
    outlook: "Neutral",
    action: "HOLD",
    currentPrice: 270.23,
    targetPrice: 260.0,
    upsidePct: -3.8,
    convictionScore: 52,
    conviction: "MEDIUM",
    strategyFitScore: 68,
    oneLineConclusion: "品牌护城河稳固,估值合理偏贵,维持 HOLD。",
    thesis: [
      "生态护城河无争议,ROE 160% 极高",
      "中国区 Q1 出货回升(+5.2% YoY),最大不确定性缓解",
      "但 PE 31x 处历史 73 分位,折价空间有限",
    ],
    risks: ["iPhone 17 换机周期需要验证", "AI 差距相对 Google / Anthropic 仍在拉大"],
    horizon: "季度级 · 下次财报后重评",
    catalystIds: ["cat-aapl-itc-ruling", "cat-aapl-china-share"],
    factors: [
      { name: "ROE", category: "QUALITY", value: "160%", threshold: "> 15%", passed: true, weight: 0.25 },
      { name: "毛利率", category: "PROFITABILITY", value: "46.3%", threshold: "稳定", passed: true, weight: 0.15 },
      { name: "PE 分位", category: "VALUE", value: "73 分位", threshold: "< 60", passed: false, weight: 0.25 },
      { name: "FCF/Sales", category: "PROFITABILITY", value: "28%", threshold: "> 20%", passed: true, weight: 0.15 },
    ],
  },

  // ─── GOOGL × Wood(轻覆盖) ────────────────────────────────────────
  {
    id: "sig-googl-wood",
    issuedAt: T(18),
    symbol: "GOOGL.US",
    company: "Alphabet",
    strategyId: "strat-wood-innovation",
    strategyName: "Wood Innovation Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "UPGRADE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 182.4,
    targetPrice: 215.0,
    upsidePct: 17.9,
    convictionScore: 74,
    conviction: "HIGH",
    strategyFitScore: 80,
    oneLineConclusion: "Gemini 3 反攻 + Workspace ARPU 重估,AI 货币化路径清晰。",
    thesis: [
      "Gemini 3 Pro 在 SWE-bench 首次超越 Claude Sonnet 4.5",
      "Workspace Enterprise 默认打包 Gemini 3,订阅 ARPU 预期 +$8-12/用户",
      "搜索广告基本盘仍在 +11% YoY,提供利润缓冲",
    ],
    risks: ["DOJ 反垄断最终裁决预期 2026 下半年", "Cloud 增速仍落后 AWS/Azure"],
    horizon: "1-2 周 · 下次 Capex 指引前",
    catalystIds: ["cat-googl-gemini"],
    factors: [
      { name: "营收加速", category: "GROWTH", value: "+14.3%", threshold: "加速", passed: true, weight: 0.3 },
      { name: "创新平台契合", category: "QUALITY", value: "AI + Cloud + 搜索", threshold: "≥ 2 赛道", passed: true, weight: 0.2 },
      { name: "RS", category: "MOMENTUM", value: "78 分位", threshold: "> 70", passed: true, weight: 0.2 },
    ],
  },

  // ─── AMZN × Wood(轻覆盖) ────────────────────────────────────────
  {
    id: "sig-amzn-wood",
    issuedAt: T(36),
    symbol: "AMZN.US",
    company: "Amazon",
    strategyId: "strat-wood-innovation",
    strategyName: "Wood Innovation Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "UPGRADE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 212.45,
    targetPrice: 248.0,
    upsidePct: 16.7,
    convictionScore: 76,
    conviction: "HIGH",
    strategyFitScore: 82,
    oneLineConclusion: "AWS 重回加速,AI inference workload 占比快速攀升。",
    thesis: [
      "AWS 增速 +19% → +22%,跨入 20%+ 梯队",
      "AI inference 占 AWS workload 25%,贡献主要加速",
      "Retail 运营利润率 +1.8pp,capex 可被 FCF 覆盖",
    ],
    risks: ["零售消费者信心若走弱", "AI 资本开支节奏 vs 回报匹配度"],
    horizon: "1-2 周",
    catalystIds: ["cat-amzn-aws-reaccel"],
    factors: [
      { name: "AWS YoY", category: "GROWTH", value: "22%", threshold: "> 18%", passed: true, weight: 0.35 },
      { name: "AWS 利润率", category: "PROFITABILITY", value: "38.4%", threshold: "> 35%", passed: true, weight: 0.2 },
    ],
  },

  // ─── META × Buffett(轻覆盖) ─────────────────────────────────────
  {
    id: "sig-meta-buffett",
    issuedAt: T(48),
    symbol: "META.US",
    company: "Meta Platforms",
    strategyId: "strat-buffett-value",
    strategyName: "Buffett Value Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 568.3,
    targetPrice: 650.0,
    upsidePct: 14.4,
    convictionScore: 72,
    conviction: "HIGH",
    strategyFitScore: 78,
    oneLineConclusion: "现金牛属性强化,回购加速 + 股息提升等于价值释放。",
    thesis: [
      "$70B 新增回购授权 + 股息 +27%,资本返还信号明确",
      "Reality Labs 亏损好于预期(-$4.1B vs 预期 -$4.5B)",
      "PE 22x 处 5Y 分位 48%,折价深度合理",
    ],
    risks: ["Reels 变现转化率 vs TikTok", "AI 资本支出会否侵蚀 FCF"],
    horizon: "季度级",
    catalystIds: ["cat-meta-buyback"],
    factors: [
      { name: "PE 分位", category: "VALUE", value: "48 分位", threshold: "< 60", passed: true, weight: 0.25 },
      { name: "FCF/Sales", category: "PROFITABILITY", value: "34%", threshold: "> 20%", passed: true, weight: 0.2 },
      { name: "回购 / 市值", category: "VALUE", value: "~5% yield", threshold: "> 3%", passed: true, weight: 0.2 },
    ],
  },

  // ─── TSM × Wood(轻覆盖) ─────────────────────────────────────────
  {
    id: "sig-tsm-wood",
    issuedAt: T(54),
    symbol: "TSM.US",
    company: "Taiwan Semi",
    strategyId: "strat-wood-innovation",
    strategyName: "Wood Innovation Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "REITERATE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 215.8,
    targetPrice: 248.0,
    upsidePct: 14.9,
    convictionScore: 68,
    conviction: "MEDIUM",
    strategyFitScore: 72,
    oneLineConclusion: "3nm 亚利桑那扩产 + NVDA/AAPL 订单锁定 = 风险对冲 + 成长延续。",
    thesis: [
      "$15B 亚利桑那 Fab 升级 3nm,缓解地缘折价",
      "N2 节点 2026 H2 量产,ASP 仍可提升",
      "AI / HPC 贡献从 51% 升至 54%(产品结构优化)",
    ],
    risks: ["台海地缘仍为尾部风险", "成熟节点产能利用率回落"],
    horizon: "1-2 月",
    catalystIds: ["cat-tsm-3nm"],
    factors: [
      { name: "AI/HPC 占比", category: "GROWTH", value: "54%", threshold: "上升", passed: true, weight: 0.3 },
      { name: "N3 毛利率", category: "PROFITABILITY", value: "55%", threshold: "> 50%", passed: true, weight: 0.2 },
    ],
  },

  // ─── JPM × Buffett(轻覆盖) ──────────────────────────────────────
  {
    id: "sig-jpm-buffett",
    issuedAt: T(42),
    symbol: "JPM.US",
    company: "JPMorgan Chase",
    strategyId: "strat-buffett-value",
    strategyName: "Buffett Value Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 248.6,
    targetPrice: 285.0,
    upsidePct: 14.6,
    convictionScore: 70,
    conviction: "HIGH",
    strategyFitScore: 76,
    oneLineConclusion: "NII 指引上调 + 不良贷款稳定,银行龙头估值合理。",
    thesis: [
      "全年 NII 指引 $90B → $92B",
      "信用卡余额 +14% YoY,循环 APR 稳定",
      "不良贷款率 0.58%(环比平),Tier 1 资本充足率 15.2%",
    ],
    risks: ["降息周期开启后 NIM 承压", "商业地产违约率抬升"],
    horizon: "季度级",
    catalystIds: ["cat-jpm-nii-guide"],
    factors: [
      { name: "ROE", category: "QUALITY", value: "18.2%", threshold: "> 15%", passed: true, weight: 0.2 },
      { name: "Tier 1 充足率", category: "QUALITY", value: "15.2%", threshold: "> 13%", passed: true, weight: 0.15 },
      { name: "PE 分位", category: "VALUE", value: "42 分位", threshold: "< 60", passed: true, weight: 0.25 },
      { name: "P/TBV", category: "VALUE", value: "2.4x", threshold: "< 2.5x", passed: true, weight: 0.2 },
    ],
  },

  // ─── COIN × Simons(轻覆盖,量化短线) ────────────────────────────
  {
    id: "sig-coin-simons",
    issuedAt: T(10),
    symbol: "COIN.US",
    company: "Coinbase",
    strategyId: "strat-simons-quant",
    strategyName: "Simons Quant Strategy",
    supersedes: null,
    supersededBy: null,
    analystTerm: "INITIATE",
    recommendation: "Bullish",
    outlook: "Bullish",
    action: "BUY",
    currentPrice: 318.4,
    targetPrice: 345.0,
    upsidePct: 8.4,
    convictionScore: 78,
    conviction: "HIGH",
    strategyFitScore: 92,
    oneLineConclusion:
      "BTC 突破 + 交易量放大 + RSI 强势,量化共振触发,单票仓位 <2%。",
    thesis: [
      "BTC 突破 $110k + COIN 本周 +18% outperform",
      "交易量周环比 +65%,零售占比回升至 34%(8 月高位)",
      "RSI 75 强势区间,MACD 金叉",
    ],
    risks: [
      "加密市场高 beta,BTC 回撤会放大 COIN 跌幅",
      "监管风险不对称 —— 负面消息影响更大",
    ],
    horizon: "短线 1-2 周",
    catalystIds: ["cat-coin-volume"],
    factors: [
      { name: "BTC WoW", category: "MOMENTUM", value: "+12%", threshold: "> 5%", passed: true, weight: 0.2 },
      { name: "交易量 WoW", category: "MOMENTUM", value: "+65%", threshold: "> 30%", passed: true, weight: 0.25 },
      { name: "RSI(14)", category: "MOMENTUM", value: "75", threshold: "> 70", passed: true, weight: 0.2 },
    ],
  },
];

export function getSignalById(id: string): Signal | undefined {
  return MOCK_SIGNALS.find((s) => s.id === id);
}

export function getSignalsBySymbol(symbol: string): Signal[] {
  return MOCK_SIGNALS.filter((s) => s.symbol === symbol).sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export function getSignalsByStrategy(strategyId: string): Signal[] {
  return MOCK_SIGNALS.filter((s) => s.strategyId === strategyId);
}

export function getRecentSignals(limit = 10): Signal[] {
  return [...MOCK_SIGNALS]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, limit);
}

export function getSignalsByCatalyst(catalystId: string): Signal[] {
  return MOCK_SIGNALS.filter((s) => s.catalystIds.includes(catalystId));
}
