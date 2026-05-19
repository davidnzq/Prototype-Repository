import type { Catalyst } from "@/types/domain";

// Timestamps are anchored around demo "today" (2026-04-18 Asia/Shanghai).
// Facts are synthetic but directionally consistent with real market data.
const T = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 3600_000).toISOString();

export const MOCK_CATALYSTS: Catalyst[] = [
  // ─── MSFT · 4 Catalysts ──────────────────────────────────────────────
  {
    id: "cat-msft-earnings-q3",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "MSFT.US",
    company: "Microsoft",
    trigger: "earnings_beat",
    significance: "HIGH",
    title: "MSFT Q3 财报双超:营收 +17% YoY · Azure 加速至 +27%",
    subtitle: "非 AI 业务也加速,毛利率同比提升 80bp",
    summary:
      "Microsoft 公布 FY26 Q3 财报,营收 $72.4B 同比 +17%,超 Street 预期 +2.8%。Azure 增速从上季 +24% 加速至 +27%,AI 服务贡献 11 个百分点。GAAP EPS $3.42 vs 预期 $3.28。指引下一季度 Azure 增速 +26%–+28%,capex 上调至 $23B/季。",
    eli5:
      "云业务(Azure)继续长得很快,并且比上一季还快了。AI 服务是主要贡献,但非 AI 业务也在加速。公司还在加大投入(capex),意味着管理层看到了持续的需求。",
    highlights: [
      "Azure 加速:+24% → +27%(第 3 个加速季)",
      "AI 服务贡献 11pp(上季 9pp)",
      "Capex 指引上调至 $23B/季(+15%)",
      "毛利率 70.1% · +80bp YoY",
    ],
    factors: [
      { name: "Revenue YoY", value: 17.2, delta: 1.8, direction: "positive" },
      { name: "Azure Growth", value: 27, delta: 3, direction: "positive" },
      { name: "GAAP EPS beat", value: 4.2, delta: 4.2, direction: "positive" },
      { name: "Operating Margin", value: 47.1, delta: 1.2, direction: "positive" },
    ],
    groupTags: ["GROWTH", "QUALITY", "PROFITABILITY"],
    factualDirection: "positive",
    factualStrength: 0.95,
    sources: [
      { title: "Microsoft FY26 Q3 Press Release", kind: "filing" },
      { title: "Microsoft Q3 Earnings Call Transcript", kind: "filing" },
      { title: "Bloomberg: Azure growth reaccelerates", kind: "news" },
    ],
    generatedAt: T(18),
  },
  {
    id: "cat-msft-analyst-upgrade",
    type: "NEWS_EVENT",
    symbol: "MSFT.US",
    company: "Microsoft",
    trigger: "analyst_upgrade",
    significance: "MEDIUM",
    title: "BNP Paribas 上调 MSFT 评级至 Outperform,目标价 $520",
    subtitle: "理由:AI infrastructure 周期早期,azure 份额仍在扩大",
    summary:
      "BNP Paribas 分析师 Sophie Verstraeten 将 MSFT 评级从 Neutral 上调至 Outperform,目标价从 $440 上调至 $520(+18% upside)。核心论点:AI 基础设施周期刚进入第 2 年,Microsoft 在大型企业端的渠道优势难被替代,未来 18 个月 Azure 增速可持续 25%+ 。",
    eli5:
      "一位有影响力的华尔街分析师把 MSFT 的评级从『中性』改为『强烈看好』,并把目标价调高了。她认为 AI 基建的故事才刚开始,MSFT 在企业客户里有卡位优势。",
    highlights: [
      "目标价 $440 → $520(+18% 空间)",
      "评级 Neutral → Outperform",
      "Azure 未来 18 个月 CAGR 预测 25%+",
    ],
    factors: [
      { name: "Analyst PT", value: 520, delta: 80, direction: "positive" },
    ],
    groupTags: ["NEWS", "GROWTH"],
    factualDirection: "positive",
    factualStrength: 0.7,
    sources: [{ title: "BNP Paribas Equity Research · MSFT", kind: "filing" }],
    generatedAt: T(8),
  },
  {
    id: "cat-msft-macro-rate",
    type: "MACRO_EVENT",
    symbol: "MSFT.US",
    company: "Microsoft",
    trigger: "rate_expectation_shift",
    significance: "MEDIUM",
    title: "Fed 降息预期收敛:市场预期 5 月不降息,6 月降息概率升至 72%",
    subtitle: "利率路径再定价,高久期成长股受益边际略强",
    summary:
      "本周 CPI 数据低于预期(核心 3.0% vs 3.1% Street),利率期货隐含的 6 月降息概率从上周的 58% 升至 72%。10Y US Treasury 收益率跌 12bp 至 4.24%。对高久期成长股(MSFT / GOOGL / AMZN)构成边际利好。",
    eli5:
      "通胀数据偏低,市场开始相信美联储会在 6 月降一次息。利率下去,成长股(未来现金流大多在远期)的估值支撑就上去了一点。",
    highlights: [
      "核心 CPI:3.0%(预期 3.1%)",
      "6 月降息概率:58% → 72%",
      "10Y 收益率:-12bp",
    ],
    factors: [
      { name: "6M Rate Cut Prob", value: 72, delta: 14, direction: "positive" },
    ],
    groupTags: ["MACRO"],
    factualDirection: "positive",
    factualStrength: 0.5,
    sources: [{ title: "CME FedWatch · 2026-04-18", kind: "platform" }],
    generatedAt: T(30),
  },
  {
    id: "cat-msft-tech-breakout",
    type: "TECHNICAL_SIGNAL",
    symbol: "MSFT.US",
    company: "Microsoft",
    trigger: "ma50_breakout",
    significance: "MEDIUM",
    title: "MSFT 放量突破 50 日均线 · 成交量 1.8x",
    subtitle: "技术面脱离 3 月以来的震荡区间",
    summary:
      "MSFT 昨日收盘价 $422.79,放量突破 50 日均线 $415.20 阻力,成交量 4860 万 vs 20 日均量 2700 万(1.8x)。技术形态从双顶转为上升三角形突破,RSI 63(上升中未超买)。",
    eli5:
      "过去一个多月股价一直在 $400–$420 之间横盘。昨天放量向上突破了这个区间,说明买方力量赢了。",
    highlights: [
      "突破 50DMA $415.20(阻力)",
      "成交量 1.8x 20 日均量",
      "RSI 63(未超买)",
    ],
    factors: [
      { name: "Volume vs 20DMA", value: 1.8, delta: 0.8, direction: "positive" },
      { name: "RSI(14)", value: 63, delta: 8, direction: "positive" },
    ],
    groupTags: ["MOMENTUM", "TREND"],
    factualDirection: "positive",
    factualStrength: 0.65,
    sources: [{ title: "Longbridge 行情 · 2026-04-17 Close", kind: "platform" }],
    generatedAt: T(14),
  },

  // ─── NVDA · 4 Catalysts ──────────────────────────────────────────────
  {
    id: "cat-nvda-parabolic",
    type: "TECHNICAL_SIGNAL",
    symbol: "NVDA.US",
    company: "NVIDIA",
    trigger: "parabolic_advance",
    significance: "HIGH",
    title: "NVDA 20 日涨幅 +35% · 成交量 3.2x · RSI 82(超买)",
    subtitle: "自我强化趋势特征齐全,反身性策略显著共振",
    summary:
      "NVDA 过去 20 个交易日累涨 35.1%,伴随成交量持续放大(20 日均量 3.2x 3 月水平)。RSI(14) 收于 82(通常 >80 视为超买),ATR(14) 扩张 +25% vs 上月。价格 / 成交量 / 波动率全部处于极值区间。",
    eli5:
      "NVDA 在过去一个月差不多涨了三分之一,每天成交量也比过去多三倍。RSI 超过 80(正常 30–70),说明短期已经非常『亢奋』。",
    highlights: [
      "20 日涨幅:+35.1%",
      "成交量:3.2x 3 月均量",
      "RSI(14):82",
      "ATR 扩张 +25%",
    ],
    factors: [
      { name: "20D Return", value: 35.1, delta: 35.1, direction: "positive" },
      { name: "RSI(14)", value: 82, delta: 26, direction: "positive" },
      { name: "Volume Ratio", value: 3.2, delta: 2.2, direction: "positive" },
    ],
    groupTags: ["MOMENTUM", "TREND"],
    factualDirection: "positive",
    factualStrength: 0.9,
    sources: [{ title: "Longbridge 行情 · 20D snapshot", kind: "platform" }],
    generatedAt: T(6),
  },
  {
    id: "cat-nvda-hyperscaler-capex",
    type: "NEWS_EVENT",
    symbol: "NVDA.US",
    company: "NVIDIA",
    trigger: "customer_capex_upgrade",
    significance: "HIGH",
    title: "四大超大规模云上调 AI capex 指引 · 合计 +$45B YoY",
    subtitle: "下游需求可见性延长到 2027,订单簿预计再厚化",
    summary:
      "Microsoft / Google / Amazon / Meta 在最近财报电话会中合计将 2026 capex 指引上调 $45B,其中 AI 基础设施占比 ≥ 60%。对 NVDA 而言意味着 Data Center 营收可见性再延长 4-6 个季度。",
    eli5:
      "几家最大的云公司都说今年要比原计划多花 450 亿美元,其中大部分买 AI 芯片。NVDA 是最大受益者。",
    highlights: [
      "Hyperscaler 合计 capex:+$45B YoY",
      "AI 占比:≥ 60%",
      "可见性延伸至 2027 H1",
    ],
    factors: [
      { name: "Industry TAM", value: 45, delta: 45, direction: "positive" },
    ],
    groupTags: ["NEWS", "GROWTH"],
    factualDirection: "positive",
    factualStrength: 0.85,
    sources: [
      { title: "Microsoft FY26 Q3 Earnings Call", kind: "filing" },
      { title: "Amazon Q1 Earnings Call", kind: "filing" },
    ],
    generatedAt: T(24),
  },
  {
    id: "cat-nvda-vix-complacency",
    type: "MACRO_EVENT",
    symbol: "NVDA.US",
    company: "NVIDIA",
    trigger: "extreme_sentiment",
    significance: "MEDIUM",
    title: "VIX 跌至 11.5 · 市场情绪进入极度贪婪区间",
    subtitle: "尾部风险被低估,反转窗口临近",
    summary:
      "VIX 收盘 11.5,为 2024 年 12 月以来最低水平,已连续 8 个交易日在 13 以下。历史上 VIX < 12 之后 60 天内,成长型板块平均再涨 3.2%,但之后 90 天的回撤均值 -8.5%。对高 beta 持仓(NVDA / TSLA)构成尾部风险。",
    eli5:
      "市场恐慌指数 VIX 创了几个月的新低,说明投资者现在非常乐观。历史上这种『极度贪婪』之后,短期还能涨一点,但再往后回撤概率显著上升。",
    highlights: [
      "VIX:11.5(<12 阈值触发)",
      "类似历史情境 60D 中位收益 +3.2%",
      "类似历史情境 90D 最大回撤 -8.5%",
    ],
    factors: [{ name: "VIX", value: 11.5, delta: -2.1, direction: "negative" }],
    groupTags: ["MACRO"],
    factualDirection: "negative",
    factualStrength: 0.65,
    sources: [{ title: "CBOE · VIX close 2026-04-17", kind: "platform" }],
    generatedAt: T(5),
  },

  // ─── TSLA · 4 Catalysts ──────────────────────────────────────────────
  {
    id: "cat-tsla-multifactor",
    type: "TECHNICAL_SIGNAL",
    symbol: "TSLA.US",
    company: "Tesla",
    trigger: "multi_factor_resonance",
    significance: "HIGH",
    title: "TSLA 多因子共振:MA20/50 突破 · 量比 3.2x · MACD 金叉",
    subtitle: "量化模型 10 项检查通过 10 项",
    summary:
      "TSLA 价格突破 MA20 / MA50,成交量 9060 万(3.2x 20 日均量),RSI 72(强势区间),MACD 在 0 轴上方金叉,布林带上轨区域,ATR 扩张 +25%。Simons Quant 策略 CheckList 10/10 全部通过。",
    eli5:
      "从技术指标上看,TSLA 现在『各项信号一起给了买入提示』——均线金叉、成交放量、动量指标发力,而且这些信号是同时出现的,不是单一孤立信号。",
    highlights: [
      "MA20 / MA50 双突破",
      "Volume 3.2x 20DMA",
      "RSI(14) 72 · MACD 0 轴上金叉",
      "Strategy Fit 100/100",
    ],
    factors: [
      { name: "MA Breakout", value: 1, delta: 1, direction: "positive" },
      { name: "Volume Ratio", value: 3.2, delta: 1.7, direction: "positive" },
      { name: "RSI(14)", value: 72, delta: 15, direction: "positive" },
      { name: "MACD Histogram", value: 0.82, delta: 1.25, direction: "positive" },
    ],
    groupTags: ["MOMENTUM", "TREND", "LOW_VOLATILITY"],
    factualDirection: "positive",
    factualStrength: 0.92,
    sources: [{ title: "Longbridge 行情 · Intraday 2026-04-17", kind: "platform" }],
    generatedAt: T(4),
  },
  {
    id: "cat-tsla-delivery",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "TSLA.US",
    company: "Tesla",
    trigger: "delivery_beat",
    significance: "MEDIUM",
    title: "TSLA Q1 交付 48.2 万台 · 预期 46.5 万 · 同比 +3%",
    subtitle: "低基数下首次同比转正,Model Y 改款贡献显著",
    summary:
      "Tesla 公布 2026 Q1 全球交付 48.2 万台,超 Consensus 46.5 万(+3.7% vs 预期)。其中 Model Y 新款贡献 28 万,同比 +8%;Model 3 16.5 万,同比 +1%;Cybertruck 1.5 万。这是自 2025 Q4 以来连续第 2 个同比增长季。",
    eli5:
      "上季交付的车比分析师预期多卖了几千台。去年年初因为换代、降价等原因交付量不好,现在从底部回升了。",
    highlights: [
      "全球交付 48.2 万(超预期 3.7%)",
      "Model Y 改款拉动",
      "同比首次由负转正(+3%)",
    ],
    factors: [
      { name: "Delivery beat %", value: 3.7, delta: 3.7, direction: "positive" },
      { name: "YoY Growth", value: 3.0, delta: 5.5, direction: "positive" },
    ],
    groupTags: ["GROWTH", "NEWS"],
    factualDirection: "positive",
    factualStrength: 0.75,
    sources: [{ title: "Tesla Q1 2026 Delivery Release", kind: "filing" }],
    generatedAt: T(72),
  },

  // ─── AAPL · 2 Catalysts (light coverage) ─────────────────────────────
  {
    id: "cat-aapl-itc-ruling",
    type: "NEWS_EVENT",
    symbol: "AAPL.US",
    company: "Apple",
    trigger: "regulatory_win",
    significance: "MEDIUM",
    title: "美国贸易法庭驳回 Apple Watch 进口禁令",
    subtitle: "专利诉讼风险缓解,iPhone 销售预期不受波及",
    summary:
      "美国国际贸易委员会(ITC)驳回了 Masimo 对 Apple Watch S9/S10 进口禁令的申请。Apple 无需再从设备中移除血氧监测功能,相关硬件销量在假日季不会受阻。",
    eli5:
      "有公司告 Apple 抄了它的技术,想让海关不让 Apple Watch 进美国卖。法庭昨天驳回了这个请求,Apple Watch 可以正常卖。",
    highlights: ["ITC 驳回进口禁令申请", "血氧功能保留"],
    factors: [],
    groupTags: ["NEWS"],
    factualDirection: "positive",
    factualStrength: 0.6,
    sources: [{ title: "ITC · Apple v. Masimo 2026-04-17", kind: "filing" }],
    generatedAt: T(16),
  },
  {
    id: "cat-aapl-china-share",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "AAPL.US",
    company: "Apple",
    trigger: "market_share_change",
    significance: "MEDIUM",
    title: "Apple 中国区 Q1 出货同比 +5.2% · 重回市占率 Top 3",
    subtitle: "iPhone 16 系列销售好于预期,华为竞争压力缓解",
    summary:
      "IDC 报告 Apple 在中国区 Q1 出货 1210 万台,同比 +5.2%,逆转了过去 5 季度的下滑。市场份额 16.5%,重回第 3(此前跌至第 5)。iPhone 16 Pro Max 在一线城市需求旺盛。",
    eli5:
      "之前大家担心中国消费者不再买 iPhone,Q1 数据显示销量反而上升了,份额也回来了。",
    highlights: ["中国区 Q1 出货 +5.2% YoY", "份额 16.5% · 重回 Top 3"],
    factors: [
      { name: "China Shipment YoY", value: 5.2, delta: 7.1, direction: "positive" },
    ],
    groupTags: ["GROWTH"],
    factualDirection: "positive",
    factualStrength: 0.65,
    sources: [{ title: "IDC · China Smartphone Tracker Q1 2026", kind: "platform" }],
    generatedAt: T(36),
  },

  // ─── GOOGL · 1 Catalyst ──────────────────────────────────────────────
  {
    id: "cat-googl-gemini",
    type: "NEWS_EVENT",
    symbol: "GOOGL.US",
    company: "Alphabet",
    trigger: "product_launch",
    significance: "MEDIUM",
    title: "Gemini 3 Pro 发布 · 代码 benchmark 首次超越 Claude Sonnet 4.5",
    subtitle: "Workspace 企业版开始 bundle Gemini 3,订阅 ARPU 预计提升 $8-12",
    summary:
      "Google 发布 Gemini 3 Pro,在 SWE-bench Verified 上达 69.2%(上一代 62%),首次在编码任务超越 Claude Sonnet 4.5。同时宣布 Workspace Enterprise 将默认打包 Gemini 3,预计提升订阅 ARPU $8-12/用户。",
    eli5:
      "Google 出了新一代 AI 模型,在写代码这件事上比竞品(Anthropic)更强了。并且开始把 AI 塞进企业版 Workspace 里,顺便涨价。",
    highlights: ["SWE-bench 69.2%(+7pp)", "Workspace ARPU 预期 +$8-12"],
    factors: [],
    groupTags: ["NEWS", "GROWTH"],
    factualDirection: "positive",
    factualStrength: 0.7,
    sources: [{ title: "Google Gemini 3 Launch Blog", kind: "news" }],
    generatedAt: T(28),
  },

  // ─── AMZN · 1 Catalyst ──────────────────────────────────────────────
  {
    id: "cat-amzn-aws-reaccel",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "AMZN.US",
    company: "Amazon",
    trigger: "segment_growth_accel",
    significance: "HIGH",
    title: "AWS 增速加速至 +22% · 重返 Azure 增长梯队",
    subtitle: "AWS 运营利润率 38%,同比 +2.3pp",
    summary:
      "AWS Q1 营收 $31.2B,同比 +22%(上季 +19%),自 2023 Q4 以来首次跨入 20% 增速梯队。运营利润率 38.4%。管理层电话会提及 AI inference workload 占比已达 25%,贡献了加速。",
    eli5:
      "亚马逊的云业务(AWS)原本一直落后于微软的 Azure,这一季突然把增速追上来了。主要靠客户跑 AI 的计算需求。",
    highlights: ["AWS 增速 +19% → +22%", "运营利润率 38.4%", "AI inference 占 25%"],
    factors: [
      { name: "AWS Growth YoY", value: 22, delta: 3, direction: "positive" },
    ],
    groupTags: ["GROWTH", "QUALITY"],
    factualDirection: "positive",
    factualStrength: 0.85,
    sources: [{ title: "Amazon Q1 2026 Press Release", kind: "filing" }],
    generatedAt: T(40),
  },

  // ─── META · 1 Catalyst ──────────────────────────────────────────────
  {
    id: "cat-meta-buyback",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "META.US",
    company: "Meta Platforms",
    trigger: "capital_return",
    significance: "MEDIUM",
    title: "Meta 宣布 $70B 新增回购 · 股息提升至 $0.70/季",
    subtitle: "资本返还强化 · Reality Labs 亏损可控",
    summary:
      "Meta 董事会批准 $70B 新增股票回购授权(是当前剩余额度的 2.3 倍),季度股息从 $0.55 提至 $0.70。回购退出速度预计 12-18 个月。Reality Labs Q1 运营亏损 $4.1B,同比下降 5%,低于市场预期 $4.5B。",
    eli5:
      "Meta 宣布要再花 700 亿美元回购自己的股票,分红也提了。这通常被视为『管理层认为股价便宜 + 现金充裕』的信号。",
    highlights: ["回购授权 +$70B", "股息 +27%", "Reality Labs 亏损好于预期"],
    factors: [],
    groupTags: ["VALUE", "QUALITY"],
    factualDirection: "positive",
    factualStrength: 0.75,
    sources: [{ title: "Meta Q1 2026 8-K", kind: "filing" }],
    generatedAt: T(52),
  },

  // ─── TSM · 1 Catalyst ───────────────────────────────────────────────
  {
    id: "cat-tsm-3nm",
    type: "NEWS_EVENT",
    symbol: "TSM.US",
    company: "Taiwan Semi",
    trigger: "capacity_plan",
    significance: "MEDIUM",
    title: "台积电计划美国亚利桑那增设 3nm 产线 · 2028 量产",
    subtitle: "与 NVDA / AAPL 订单锁定,地缘风险对冲",
    summary:
      "台积电董事会批准亚利桑那 Fab 3 升级为 3nm 产线,投资 $150 亿,预计 2028 Q1 量产。主要客户包括 NVIDIA 下一代 AI GPU 与 Apple 下一代 M 系列。缓解了市场对台海地缘风险的担忧。",
    eli5:
      "台积电决定在美国再建一个最先进的晶圆厂(3nm),给 NVDA 和 Apple 代工。好处是即使台海出事,客户在美国也有备选产能。",
    highlights: ["$15B 亚利桑那 3nm Fab", "2028 Q1 量产", "NVDA / AAPL 订单锁定"],
    factors: [],
    groupTags: ["NEWS", "GROWTH"],
    factualDirection: "positive",
    factualStrength: 0.65,
    sources: [{ title: "TSMC 2026-04-17 Board Announcement", kind: "filing" }],
    generatedAt: T(58),
  },

  // ─── JPM · 1 Catalyst ───────────────────────────────────────────────
  {
    id: "cat-jpm-nii-guide",
    type: "FUNDAMENTAL_CHANGE",
    symbol: "JPM.US",
    company: "JPMorgan Chase",
    trigger: "guidance_raise",
    significance: "MEDIUM",
    title: "JPM 全年 NII 指引上调至 $92B · 超 Street 预期 $90B",
    subtitle: "信用卡业务强劲,加息窗口末期 NIM 仍有扩张空间",
    summary:
      "JPMorgan Q1 财报超预期,并将 2026 全年净利息收入(NII)指引上调至 $92B(原 $90B,Street $90.2B)。信用卡余额同比 +14%,投行业务费用同比 +28%。不良贷款率 0.58%(环比稳定)。",
    eli5:
      "摩根大通赚得比预期多,且把今年剩下的指引又调高了。信用卡业务特别好,投行业务也在复苏。",
    highlights: ["NII 指引 $90B → $92B", "信用卡余额 +14% YoY", "投行 fee +28%"],
    factors: [
      { name: "NII Guide", value: 92, delta: 2, direction: "positive" },
    ],
    groupTags: ["QUALITY", "PROFITABILITY"],
    factualDirection: "positive",
    factualStrength: 0.8,
    sources: [{ title: "JPMorgan Q1 2026 Earnings", kind: "filing" }],
    generatedAt: T(44),
  },

  // ─── COIN · 1 Catalyst ──────────────────────────────────────────────
  {
    id: "cat-coin-volume",
    type: "TECHNICAL_SIGNAL",
    symbol: "COIN.US",
    company: "Coinbase",
    trigger: "volume_and_btc_breakout",
    significance: "MEDIUM",
    title: "COIN 周涨 +18% · BTC 突破 $110k 带动交易量 +65%",
    subtitle: "高 beta 双刃:动能强但回撤也会被放大",
    summary:
      "BTC 本周突破 $110k,Coinbase 交易量周环比 +65%,零售订单占比从 22% 升至 34%(8 个月高位)。COIN 本周 +18%,outperform SPX 13 个百分点。注意:COIN 的 60 日 beta 约 2.4,如果 BTC 回调 10%,COIN 历史平均 -24%。",
    eli5:
      "比特币涨得凶,Coinbase 也涨得凶。但 COIN 跟着 BTC 的波动是双向的 —— 涨得快、跌也会跌得快。现在动能强,风险也在放大。",
    highlights: ["COIN +18% WoW", "交易量 +65% WoW", "零售占比 34%(8M 高位)", "60D β ≈ 2.4 · 回撤放大"],
    factors: [
      { name: "Trading Volume WoW", value: 65, delta: 65, direction: "positive" },
      { name: "Beta (60D)", value: 2.4, delta: 0.3, direction: "negative" },
    ],
    groupTags: ["MOMENTUM", "GROWTH"],
    factualDirection: "mixed",
    factualStrength: 0.55,
    sources: [{ title: "Longbridge 行情 WoW · 2026-04-18", kind: "platform" }],
    generatedAt: T(10),
  },
];

export function getCatalystById(id: string): Catalyst | undefined {
  return MOCK_CATALYSTS.find((c) => c.id === id);
}

export function getCatalystsBySymbol(symbol: string): Catalyst[] {
  return MOCK_CATALYSTS.filter((c) => c.symbol === symbol).sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

export function getRecentCatalysts(limit = 10): Catalyst[] {
  return [...MOCK_CATALYSTS]
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, limit);
}
