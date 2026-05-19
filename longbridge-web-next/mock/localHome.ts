// 本地 v3.0 home 数据 · Phase 5 后保留的活跃 mock
// 删除项(Phase 6 债务 4):TimelineEvent / PortfolioRow / TIMELINE_UR / TIMELINE_RD /
//                         PORTFOLIO / CALENDAR / KPI_* × 10 / AI_TIP

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

export interface WatchRow {
  tk: string;
  nm: string;
  pr: string;
  chg: string;
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

// ── Watchlist / Market ─────────────────────────────────────
export const WATCHLIST: WatchRow[] = [
  { tk: "NVDA", nm: "NVIDIA", pr: "142.68", chg: "+3.08%", dir: "up" },
  { tk: "AAPL", nm: "Apple", pr: "198.32", chg: "-0.82%", dir: "down" },
  { tk: "GOOG", nm: "Alphabet", pr: "172.00", chg: "+1.24%", dir: "up" },
  { tk: "TSM", nm: "TSMC", pr: "178.90", chg: "+3.11%", dir: "up" },
  { tk: "AMD", nm: "AMD", pr: "167.44", chg: "+2.91%", dir: "up" },
];

export const MARKET_INDICES: MarketIdx[] = [
  { name: "恒生指数", val: "26020.75", chg: "-1.42%", dir: "down" },
  { name: "国企指数", val: "8782.74", chg: "-1.37%", dir: "down" },
  { name: "纳斯达克", val: "17,428", chg: "+1.20%", dir: "up" },
  { name: "标普 500", val: "5,291", chg: "+0.85%", dir: "up" },
];
