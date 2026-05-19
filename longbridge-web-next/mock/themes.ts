// 官方策划的主题(见 docs/ia.md §6 Markets · Themes)。
// 每个主题 = 一组成分股 + AI-维护的简介 + 热度

export interface Theme {
  slug: string;
  name: string;
  nameZh: string;
  tagline: string;
  description: string;
  symbols: string[]; // covered symbols first
  otherSymbols: string[]; // 不在 Demo 覆盖内,只展示不可深入
  heatPct: number; // 今日主题平均涨幅 %
  narrative: string; // AI 写的主题叙事
  keyDrivers: string[];
  relatedCatalystIds: string[];
}

export const MOCK_THEMES: Theme[] = [
  {
    slug: "ai-infra",
    name: "AI Infrastructure",
    nameZh: "AI 基础设施",
    tagline: "算力需求可见性延到 2027",
    description:
      "从 GPU 到数据中心,从光模块到电力 —— 整个 AI 基础设施产业链受益于大模型训练和推理的指数级需求增长。",
    symbols: ["NVDA.US", "MSFT.US", "TSM.US"],
    otherSymbols: ["AMD", "AVGO", "CRDO", "SMCI", "ARM", "MU"],
    heatPct: 8.4,
    narrative:
      "Hyperscaler 2026 合计 capex 上调 $45B,其中 AI 相关 ≥ 60%。订单簿可见性延长至 2027 H1。NVDA 作为算力核心占比 47%,TSM 3nm/2nm 产能扩张锁定关键节点。上游 HBM 和下游光互联(CPO)同样显著受益。",
    keyDrivers: [
      "Hyperscaler capex 上调 +$45B",
      "Hopper / Blackwell 产能紧张",
      "CPO 量产 · 硅光 互连革命",
      "3nm / 2nm 产能从 TSM 一家扩展到全球 3 个 fab",
    ],
    relatedCatalystIds: [
      "cat-nvda-parabolic",
      "cat-nvda-hyperscaler-capex",
      "cat-msft-earnings-q3",
      "cat-tsm-3nm",
    ],
  },
  {
    slug: "rate-cut-beneficiaries",
    name: "Rate Cut Beneficiaries",
    nameZh: "降息受益股",
    tagline: "久期敏感成长股",
    description:
      "Fed 降息周期里,高久期成长股(未来现金流大量在远期)估值支撑提升最明显。利率预期收敛窗口内表现显著跑赢价值股。",
    symbols: ["GOOGL.US", "AMZN.US", "META.US"],
    otherSymbols: ["NFLX", "CRM", "NOW", "ADBE", "SHOP"],
    heatPct: 3.1,
    narrative:
      "市场对 6 月降息概率从 58% 升至 72%,10Y 收益率跌 12bp。历史上类似窗口(利率预期收敛 + 科技股超卖后),MAG-7 前 60 天平均跑赢 SPX 380bp。组合 Beta 放大这个效应。",
    keyDrivers: [
      "CPI 3.1% 持稳 · 6 月降息概率 72%",
      "10Y 收益率 4.24%,相对 Fed rate 倒挂收敛中",
      "成长股估值扩张窗口",
    ],
    relatedCatalystIds: ["cat-msft-macro-rate", "cat-googl-gemini", "cat-amzn-aws-reaccel"],
  },
  {
    slug: "semi-capex-cycle",
    name: "Semi Capex Cycle",
    nameZh: "半导体 Capex 周期",
    tagline: "3nm 产能扩张周期",
    description:
      "台积电 3nm 扩到亚利桑那,ASML 新一代 EUV 订单饱和,设备和化学品全产业链资本开支大幅上修。",
    symbols: ["TSM.US", "NVDA.US"],
    otherSymbols: ["ASML", "AMAT", "KLAC", "LRCX", "TOELY"],
    heatPct: 5.7,
    narrative:
      "从 2025 下半年开始的 3nm 扩产进入峰值投放期。TSM 单季 capex 创历史新高,ASML 高端 EUV 订单排队到 2027。下游 AMAT/KLAC/LRCX 受益时点滞后 2-3 季度。",
    keyDrivers: [
      "TSM 亚利桑那 Fab $15B 扩产",
      "ASML High-NA EUV 订单饱和",
      "2nm 工艺 2026 H2 量产",
    ],
    relatedCatalystIds: ["cat-tsm-3nm"],
  },
  {
    slug: "dividend-defensive",
    name: "Dividend Defensive",
    nameZh: "高分红防御",
    tagline: "低波动 · 稳健现金流",
    description:
      "在 VIX 低位 + 高估值环境下,高分红 / 低波动板块作为组合防御层,提供稳定现金流和对冲效果。",
    symbols: ["META.US", "JPM.US"],
    otherSymbols: ["KO", "PEP", "JNJ", "PG", "MCD"],
    heatPct: 1.2,
    narrative:
      "Meta $70B 回购 + 股息 +27%,JPM NII 指引上调至 $92B —— 大型蓝筹用自有现金流持续给股东回报。适合波动率抬头时做平衡配置。",
    keyDrivers: ["Meta $70B 新回购", "JPM NII 指引上调", "利率敏感度低"],
    relatedCatalystIds: ["cat-meta-buyback", "cat-jpm-nii-guide"],
  },
  {
    slug: "crypto-beta",
    name: "Crypto Beta",
    nameZh: "加密溢出机会",
    tagline: "BTC 周期放大器",
    description:
      "Coinbase / MSTR / MARA 是加密资产在传统股市的代理敞口。BTC 突破新高时,这些股票因 beta 2-3 倍涨幅更为显著,但回撤同样被放大。",
    symbols: ["COIN.US"],
    otherSymbols: ["MSTR", "MARA", "RIOT", "HOOD"],
    heatPct: 12.6,
    narrative:
      "BTC 突破 $110k,零售交易活跃度 8 月新高。COIN 60D beta 2.4,过去 3 次 BTC +20% 期间 COIN 平均 +48%。高波动,仅适合高风险敞口的配置。",
    keyDrivers: [
      "BTC 突破 $110k",
      "零售交易量 +65% WoW",
      "现货 ETF 日均净流入高位",
    ],
    relatedCatalystIds: ["cat-coin-volume"],
  },
];

export function getTheme(slug: string): Theme | undefined {
  return MOCK_THEMES.find((t) => t.slug === slug);
}

export function getThemesBySymbol(symbol: string): Theme[] {
  return MOCK_THEMES.filter(
    (t) =>
      t.symbols.includes(symbol) ||
      t.otherSymbols.some((s) => s === symbol.split(".")[0])
  );
}
