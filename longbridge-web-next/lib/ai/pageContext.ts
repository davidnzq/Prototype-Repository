// Maps the current route to the AI pane's context-specific role, chip,
// greeting, and default suggestion chips. Used by RightChat to morph per page.

import { getSignalById } from "@/mock/signals";
import { getCatalystById } from "@/mock/catalysts";
import { getTradePlanById } from "@/mock/tradePlans";
import { getSecurity } from "@/lib/universe";

export interface PageAIContext {
  slug: string; // stable per page shape — used to re-seed greeting when changed
  chip: string; // what appears in the top context chip
  role: string; // short role label shown at right of chip row
  greeting: string; // opening assistant message when chat is empty on this page
  suggestions: string[]; // initial quick-action chips
}

/**
 * Peek overlay context — when user opens a Signal/Catalyst peek via `?peek=<id>`,
 * the right chat morphs to focus on that object, regardless of the underlying page.
 */
export function getContextForPeek(peekId: string): PageAIContext | null {
  if (peekId.startsWith("sig-")) {
    const s = getSignalById(peekId);
    if (!s) return null;
    const symShort = s.symbol.split(".")[0];
    const strat = s.strategyName.split(" ")[0];
    return {
      slug: `peek:signal:${peekId}`,
      chip: `Signal · ${symShort} × ${strat}`,
      role: "解释员",
      greeting: `正在讲这条 ${strat} 视角下的 ${symShort} Signal。要我展开依据链、反方观点、还是 Alt Strategy?`,
      suggestions: [
        "讲清楚依据链",
        "反方观点",
        `${symShort} 其它策略怎么看`,
        "生成 Trade Plan",
      ],
    };
  }
  // Plan peek
  if (peekId.startsWith("plan-")) {
    const p = getTradePlanById(peekId);
    if (p) {
      const symShort = p.symbol.split(".")[0];
      return {
        slug: `peek:plan:${peekId}`,
        chip: `Plan · ${symShort}`,
        role: "执行助理",
        greeting: `Plan 已在浮层。要确认生成订单、修改参数,还是先回看 Signal 依据?`,
        suggestions: [
          "确认生成订单",
          "调整目标仓位",
          "回看 Signal 依据",
          "什么情况下证伪",
        ],
      };
    }
  }
  // News peek:format `news:<symbol>:<id>`
  if (peekId.startsWith("news:")) {
    const rest = peekId.slice("news:".length);
    const firstColon = rest.indexOf(":");
    const symbol = firstColon > 0 ? rest.slice(0, firstColon) : rest;
    const symShort = symbol.startsWith(".")
      ? symbol.slice(1).split(".")[0]
      : symbol.split(".")[0];
    return {
      slug: `peek:news:${peekId}`,
      chip: `News · ${symShort}`,
      role: "资讯解读员",
      greeting: `在看 ${symShort} 的一条新闻。要我放到上下文里吗 —— 是不是已有 Catalyst 覆盖?影响哪条 Signal / Plan?`,
      suggestions: [
        "已有 Catalyst 覆盖吗",
        "对我组合有没有影响",
        "值不值得建 Catalyst",
        "类似历史事件",
      ],
    };
  }
  // Stock peek:symbol 带 `.` 后缀(NVDA.US / 700.HK / ...)
  if (peekId.includes(".")) {
    const sec = getSecurity(peekId);
    if (sec) {
      const symShort = peekId.split(".")[0];
      return {
        slug: `peek:stock:${peekId}`,
        chip: `Stock · ${symShort}`,
        role: "个股分析师",
        greeting: `在看 ${symShort} · ${sec.nameZh}。要多策略视角、持仓联动、还是近 3 天 Catalyst?`,
        suggestions: [
          `用 Buffett 视角看 ${symShort}`,
          `${symShort} 近 3 天 Catalyst`,
          `${symShort} 在我组合里的角色`,
          `同板块对比`,
        ],
      };
    }
  }
  if (peekId.startsWith("cat-")) {
    const c = getCatalystById(peekId);
    if (!c) return null;
    const symShort = c.symbol.split(".")[0];
    return {
      slug: `peek:catalyst:${peekId}`,
      chip: `Catalyst · ${symShort}`,
      role: "事件解释员",
      greeting: `在讲 ${symShort} 这条事件(${c.type
        .replace(/_/g, " ")
        .toLowerCase()})。要我讲影响、对照历史、还是它推导出什么 Signal?`,
      suggestions: [
        "为什么重要",
        "对照历史同类事件",
        "它能推出什么 Signal",
        "对我组合有影响吗",
      ],
    };
  }
  return null;
}

export function getContextForPath(pathname: string): PageAIContext {
  // Sub-routes first (most specific → least specific)
  if (pathname.startsWith("/stock/")) {
    const sym = decodeURIComponent(pathname.split("/")[2] ?? "");
    return {
      slug: `stock:${sym}`,
      chip: `Stock · ${sym}`,
      role: "个股分析师",
      greeting: `正在看 ${sym}。需要我从什么角度切 —— 多策略视角、持仓联动、还是近 N 天 Catalyst?`,
      suggestions: [
        `用 Buffett 视角看 ${sym}`,
        `${sym} 近 3 天的 Catalyst`,
        `${sym} 在我组合里的角色`,
      ],
    };
  }
  if (pathname.startsWith("/markets/themes/")) {
    const slug = pathname.split("/")[3] ?? "";
    return {
      slug: `theme:${slug}`,
      chip: "Theme · 主题",
      role: "主题研究员",
      greeting: "要我讲清楚这个主题的 narrative、关键驱动,还是哪只最值得先看?",
      suggestions: ["讲清楚 narrative", "关键驱动 1 条", "主题里最值得看的股", "对我组合的影响"],
    };
  }
  if (pathname.startsWith("/insight/")) {
    return {
      slug: "insight:detail",
      chip: "Insight · 详情",
      role: "解释员",
      greeting: "要我讲清楚这条的依据、反方观点,还是 Alt Strategy 视角?",
      suggestions: ["讲清楚依据链", "反方观点", "Alt Strategy"],
    };
  }
  if (pathname.startsWith("/strategy/builder")) {
    return {
      slug: "strategy:builder",
      chip: "Strategy · Builder",
      role: "策略构建师",
      greeting:
        "要建一个新策略 / Agent?告诉我你的**投资信念**(一句话),我来帮你拆解成 OMR。",
      suggestions: ["成长股 AI 赛道", "高分红防御", "回测我的选股", "克隆官方策略"],
    };
  }
  if (pathname.startsWith("/strategy/mine")) {
    return {
      slug: "strategy:mine",
      chip: "Strategy · 我的",
      role: "订阅管家",
      greeting: "这是你的策略集合。订阅状态 / 跑过的股 / fork 历史都在这里。",
      suggestions: ["跑一只新股", "对比我的 2 个策略", "分享到广场"],
    };
  }
  if (pathname.startsWith("/strategy/")) {
    return {
      slug: "strategy:detail",
      chip: "Strategy · 详情",
      role: "策略老师",
      greeting: "要我讲清楚这套 OMR,还是直接用它跑一只你关注的股?",
      suggestions: ["讲 Objective / Model / Rules", "用它跑 MSFT", "对比其它策略"],
    };
  }
  if (pathname.startsWith("/portfolio/")) {
    const sym = decodeURIComponent(pathname.split("/")[2] ?? "");
    return {
      slug: `portfolio:${sym}`,
      chip: `Holding · ${sym}`,
      role: "持仓顾问",
      greeting: `你在 ${sym} 上的持仓:要看今日表现、活跃 Plan,还是该不该行动?`,
      suggestions: [`${sym} 今日归因`, `${sym} 活跃 Plan`, "需不需要减仓"],
    };
  }
  if (pathname.startsWith("/review/")) {
    return {
      slug: "review:detail",
      chip: "Review · 详情",
      role: "复盘教练",
      greeting: "这次你哪里做对、哪里偏差?要我逐维展开还是直接给改进建议?",
      suggestions: ["逐维归因", "识别我的行为模式", "给 3 条改进"],
    };
  }
  if (pathname.startsWith("/plan/")) {
    return {
      slug: "plan:detail",
      chip: "Trade Plan",
      role: "执行助理",
      greeting: "Plan 已在中栏。要确认生成订单、修改参数,还是先看 Signal 依据?",
      suggestions: ["确认生成订单", "修改仓位", "回看 Signal 依据"],
    };
  }

  // Top-level routes
  switch (pathname) {
    case "/markets":
      return {
        slug: "markets",
        chip: "Markets · 发现",
        role: "市场导游",
        greeting: "今天板块动向有点意思。要看主题、Movers,还是跑个 Screener?",
        suggestions: ["3 个值得看的主题", "今日 Top Gainers", "高 ROE 低 PE 筛选", "半导体热力"],
      };
    case "/insights":
      return {
        slug: "insights",
        chip: "Insights",
        role: "情报编辑",
        greeting: "默认给你看 Signal 流(AI 判断过的)。要切到全量 Catalyst 吗?",
        suggestions: ["对我最相关的 3 条", "技术面 Signals", "宏观 Catalyst"],
      };
    case "/strategy":
      return {
        slug: "strategy",
        chip: "Strategy 广场",
        role: "方法导览",
        greeting:
          "按你画像(Pioneer),Wood / Soros 应该最对味。要看广场还是建一个自己的?",
        suggestions: ["按画像推荐", "按分析方法筛", "建一个 Agent"],
      };
    case "/portfolio":
      return {
        slug: "portfolio",
        chip: "Portfolio",
        role: "组合分析师",
        greeting: "科技敞口 63% 偏高。要看集中度、相关性,还是今日最大变动?",
        suggestions: ["集中度分析", "相关性矩阵", "今日最大变动", "再平衡建议"],
      };
    case "/review":
      return {
        slug: "review",
        chip: "Review",
        role: "教练",
        greeting: "最近 N 笔交易有一些模式。要我先告诉你最常犯的一个?",
        suggestions: ["最常犯的行为模式", "最佳交易 · 最差交易", "跨策略对比"],
      };
    case "/portrait":
      return {
        slug: "portrait",
        chip: "Portrait",
        role: "画像校准师",
        greeting: "你现在的画像是 Pioneer(先驱者)。要看细节、重做测评,还是对比其它画像?",
        suggestions: ["看细节", "重做测评", "对比其它画像"],
      };
    default:
      // Home /
      return {
        slug: "home",
        chip: "Home",
        role: "晨报主笔",
        greeting:
          "早,先驱者。今天一件事对你最关键 —— 你的 NVDA 敞口要被 CPI 考验。要先讲清楚这条吗?",
        suggestions: [
          "讲清楚 CPI 情境",
          "MSFT 财报先说",
          "我该怎么 hedge",
          "还好,等会儿再聊",
        ],
      };
  }
}

/**
 * View-driven context · 用于本地 home 路由内 6 类 dyn 视图切换。
 * 与 concept 仓的多路由 IA 不同,本地 v3.0 在单一 home 页内通过 currentView state
 * 切换 dyn-research / dyn-risk / dyn-attribution / dyn-screener / dyn-tradeplan / dyn-compare,
 * 每种 view 对应一个 Sub-Agent(色系 + 角色 + greeting + 4 条快捷追问)。
 *
 * 调用约定:RightChat 优先级 peek > view > path。view 来自 URL `?view=` 参数。
 */
export function getContextForView(
  viewId: string,
  symbol?: string,
): PageAIContext | null {
  const sym = symbol ? symbol.toUpperCase().split(".")[0] : "";
  switch (viewId) {
    case "dyn-research":
      return {
        slug: `view:dyn-research:${sym || "any"}`,
        chip: sym ? `研究 · ${sym}` : "深度研究",
        role: "深度分析 · 紫色 Agent",
        greeting: sym
          ? `正在拆 ${sym}。要先看营收构成、财务评分、估值带,还是 catalyst 时间线?`
          : `选一只你想拆的标的。我会调出营收 / 财务 / 估值 / 日程四条线,讲清"为什么现在"。`,
        suggestions: sym
          ? [
              `${sym} 用 Buffett 视角`,
              `${sym} 近 3 天 Catalyst`,
              `${sym} 同行业对比`,
              `${sym} 在我组合里的角色`,
            ]
          : ["NVDA", "AAPL 财报怎么准备", "对比 NVDA 和 AMD", "TSM 扩产含义"],
      };
    case "dyn-risk":
      return {
        slug: "view:dyn-risk",
        chip: "持仓风险",
        role: "复盘风险 · 玫瑰 Agent",
        greeting:
          "在扫你的 8 只持仓。先讲集中度、相关性、还是单票最大回撤敞口?",
        suggestions: [
          "建议策略",
          "集中度热力",
          "相关性矩阵",
          "今日最大单票拖累",
        ],
      };
    case "dyn-attribution":
      return {
        slug: `view:dyn-attribution:${sym || "today"}`,
        chip: sym ? `归因 · ${sym}` : "今日归因",
        role: "大盘分析 · 琥珀 Agent",
        greeting:
          "我在扫宏观 + 行业 + 资金流。先告诉你它们各自贡献了多少 bps,还是直接看持仓拆解?",
        suggestions: [
          "宏观贡献多少 bps",
          "板块是什么在拖",
          "我的持仓贡献",
          "10 条主要 Catalyst",
        ],
      };
    case "dyn-screener":
      return {
        slug: "view:dyn-screener",
        chip: "选股",
        role: "股票选择 · 青色 Agent",
        greeting: "想找什么样的票?给我一句「我要…」开头的描述,我帮你转成筛子参数。",
        suggestions: [
          "中概股潜力股",
          "美股高股息",
          "AI 算力上游",
          "高 ROE 低 PE",
        ],
      };
    case "dyn-tradeplan":
      return {
        slug: `view:dyn-tradeplan:${sym || "any"}`,
        chip: sym ? `计划 · ${sym}` : "Trade Plan",
        role: "执行助理",
        greeting:
          "Plan 在中栏。我可以建草稿、调参数,关键节点会让你按按钮确认 —— 不会替你下单。",
        suggestions: ["生成草稿", "改限价分批", "证伪条件", "确认生成订单"],
      };
    case "dyn-compare":
      return {
        slug: "view:dyn-compare",
        chip: "对标决策",
        role: "对比分析师",
        greeting: "选两个或三个标的,我把它们的估值 / 增速 / 风险 / Signal 拉到一行对比。",
        suggestions: [
          "对比 NVDA 和 AMD",
          "对比 AAPL 和 MSFT",
          "对比 TSM 和台积电同行",
          "我持仓里两两相关性",
        ],
      };
    default:
      return null;
  }
}

