// 本地 v3.0 home 数据 · 从 longbridge-web-demo/js/data.js 的 active 场景翻译
// Stage A 用一个固定场景演示;Stage B 再补 calm/down 场景切换。

export interface Index {
  name: string;
  val: string;
  chg: string;
  pct: string;
  dir: "up" | "down" | "flat";
}

export interface AwCard {
  status: "run" | "ok" | "warn" | "paused";
  title: string;
  desc: string;
  kv?: [string, string][];
  progress?: number;
  actions?: string[];
}

export interface AwGroup {
  id: "alert" | "active" | "working";
  title: string;
  subtitle: string;
  cards: AwCard[];
}

export interface TimelineEvent {
  id: string;
  tag: "Signal" | "异动" | "催化" | "资讯" | "系统";
  c: "signal" | "anomaly" | "catalyst" | "news" | "system";
  tk: string;
  tx: string;
  rl?: string;
  rlTag?: string;
  rlTagLevel?: "good" | "warn";
  tm: string;
  sig?: boolean;
}

export interface WatchRow {
  tk: string;
  nm: string;
  pr: string;
  chg: string;
  dir: "up" | "down";
}

export interface PortfolioRow {
  tk: string;
  nm: string;
  pr: string;
  pnl: string;
  dir: "up" | "down";
}

export interface MarketIdx {
  name: string;
  val: string;
  chg: string;
  dir: "up" | "down";
}

export interface CalendarEvent {
  d: string;
  tk: string;
  tag: string;
  nm: string;
}

// ── 顶部指数条 ─────────────────────────────────────────────
export const TOP_INDICES: Index[] = [
  { name: "恒生指数", val: "26020.75", chg: "-373.51", pct: "-1.42%", dir: "down" },
  { name: "国企指数", val: "8782.74", chg: "-122.37", pct: "-1.37%", dir: "down" },
  { name: "纳斯达克", val: "17,428", chg: "+1.20%", pct: "", dir: "up" },
  { name: "标普 500", val: "5,291", chg: "+0.85%", pct: "", dir: "up" },
];

// ── AI 工作台(三视觉分组,本地 v3.0) ────────────────────────
export const AW_GROUPS: AwGroup[] = [
  {
    id: "alert",
    title: "需关注",
    subtitle: "需要您决策",
    cards: [
      {
        status: "warn",
        title: "Trade Plan · NVDA 期权",
        desc: "限价 $145 · 已等 2 天",
        kv: [["状态", "等你确认"]],
        actions: ["查看", "稍后"],
      },
      {
        status: "warn",
        title: "Signal 研究 · TSM 扩产",
        desc: "新 Signal · 你持仓 8%",
        actions: ["查看", "稍后"],
      },
    ],
  },
  {
    id: "active",
    title: "已激活",
    subtitle: "监控中,自动执行",
    cards: [
      {
        status: "run",
        title: "NVDA 看涨期权策略",
        desc: "AI 评估最优行权价",
        kv: [["评估", "68%"]],
        progress: 68,
        actions: ["查看", "暂停"],
      },
      {
        status: "ok",
        title: "AAPL 止损监控",
        desc: "已运行 42 天",
        kv: [
          ["预警", "$195"],
          ["当前", "$198.32"],
        ],
        actions: ["查看", "调整"],
      },
    ],
  },
  {
    id: "working",
    title: "AI 在做",
    subtitle: "长期任务 · 后台策略 · 挂单",
    cards: [
      {
        status: "run",
        title: "组合风险周报生成中",
        desc: "每周一 9:00 · 自动汇总",
        kv: [["进度", "72%"]],
        progress: 72,
        actions: ["查看", "中断"],
      },
      {
        status: "ok",
        title: "科技股异动扫描",
        desc: "每日 8:00 / 14:00",
        kv: [
          ["最近", "09:03"],
          ["命中", "2 条"],
        ],
        actions: ["日志", "暂停"],
      },
      {
        status: "ok",
        title: "组合 Beta 监控",
        desc: "实时 · 阈值 >1.5",
        kv: [["Beta", "1.42"]],
        actions: ["查看", "调参"],
      },
      {
        status: "ok",
        title: "TSLA 限价买单",
        desc: "委托中 · 3 天 · GTC",
        kv: [
          ["限价", "$235"],
          ["数量", "20 股"],
        ],
        actions: ["查看", "撤单"],
      },
    ],
  },
];

// ── 变化事件时间线(unread + dismissed) ────────────────────
export const TIMELINE_UR: TimelineEvent[] = [
  {
    id: "active-sig-AMZN",
    tag: "Signal",
    c: "signal",
    tk: "AMZN",
    tx: "AI Revolution Core Beneficiary, Growth Story Just Beginning",
    rl: "Lynch-like Growth Strategy · 32 mins ago",
    tm: "32 分钟前",
    sig: true,
  },
  {
    id: "active-anom-NVDA",
    tag: "异动",
    c: "anomaly",
    tk: "NVDA",
    tx: "NVDA 突破 30 日高点 $140",
    rl: "持有 18%",
    rlTag: "集中度偏高",
    rlTagLevel: "warn",
    tm: "48 分钟前",
  },
  {
    id: "active-cat-TSM",
    tag: "催化",
    c: "catalyst",
    tk: "TSM",
    tx: "TSM 宣布 3nm 产能扩张",
    rl: "NVDA/AMD 均为客户",
    rlTag: "间接利好",
    rlTagLevel: "good",
    tm: "1 小时前",
  },
  {
    id: "active-news-macro",
    tag: "资讯",
    c: "news",
    tk: "宏观",
    tx: "美联储偏鸽信号",
    rl: "科技持仓 64%",
    rlTag: "板块利好",
    rlTagLevel: "good",
    tm: "1.5 小时前",
  },
];

export const TIMELINE_RD: TimelineEvent[] = [
  {
    id: "active-sys-BABA",
    tag: "系统",
    c: "system",
    tk: "BABA",
    tx: "BABA Q1 财报 · 下周五",
    rl: "自选 BABA",
    tm: "09:15",
  },
];

// ── Watchlist / Portfolio / Market ───────────────────────
export const WATCHLIST: WatchRow[] = [
  { tk: "NVDA", nm: "NVIDIA", pr: "142.68", chg: "+3.08%", dir: "up" },
  { tk: "AAPL", nm: "Apple", pr: "198.32", chg: "-0.82%", dir: "down" },
  { tk: "GOOG", nm: "Alphabet", pr: "172.00", chg: "+1.24%", dir: "up" },
  { tk: "TSM", nm: "TSMC", pr: "178.90", chg: "+3.11%", dir: "up" },
  { tk: "AMD", nm: "AMD", pr: "167.44", chg: "+2.91%", dir: "up" },
];

export const PORTFOLIO: PortfolioRow[] = [
  { tk: "NVDA", nm: "60 股", pr: "$142.68", pnl: "+$850", dir: "up" },
  { tk: "AAPL", nm: "35 股", pr: "$198.32", pnl: "+$459", dir: "up" },
  { tk: "META", nm: "10 股", pr: "$512.40", pnl: "+$324", dir: "up" },
  { tk: "MSFT", nm: "15 股", pr: "$425.00", pnl: "+$225", dir: "up" },
  { tk: "GOOG", nm: "25 股", pr: "$172.00", pnl: "+$100", dir: "up" },
];

export const MARKET_INDICES: MarketIdx[] = [
  { name: "恒生指数", val: "26020.75", chg: "-1.42%", dir: "down" },
  { name: "国企指数", val: "8782.74", chg: "-1.37%", dir: "down" },
  { name: "纳斯达克", val: "17,428", chg: "+1.20%", dir: "up" },
  { name: "标普 500", val: "5,291", chg: "+0.85%", dir: "up" },
];

export const CALENDAR: CalendarEvent[] = [
  { d: "04-24", tk: "AAPL", tag: "财报", nm: "Q2 earnings" },
  { d: "04-25", tk: "GOOG", tag: "财报", nm: "Q1 earnings" },
  { d: "04-29", tk: "AMZN", tag: "财报", nm: "Q1 earnings" },
  { d: "05-01", tk: "MSFT", tag: "财报", nm: "Q3 earnings" },
  { d: "05-07", tk: "宏观", tag: "会议", nm: "FOMC 利率决议" },
];

// ── KPI 数据 ──────────────────────────────────────────────
export const KPI_TOTAL_ASSETS = "183,440.88";
export const KPI_DAY_PNL = "+562.83";
export const KPI_HOLDING_VALUE = "180,950.48";
export const KPI_TOTAL_PNL = "+43,396.96";
export const KPI_PNL_YTD = "+257.95";
export const KPI_PNL_RATE = "0.14%";
export const KPI_BENCH_GAP = "-2.83%";
export const KPI_TODAY = "+$1,247";
export const KPI_WEEK = "+$2,100";
export const KPI_MONTH = "+$5,400";

// ── AI 提示行 ─────────────────────────────────────────────
export const AI_TIP = {
  msg: "2 小时内 4 件新变化。NVDA 突破 30 日高点。",
  sugs: ["分析我的持仓风险", "对比 NVDA 和 AMD"],
};
