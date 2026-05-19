import Link from "next/link";
import { SlidersHorizontal, Play, ChevronRight } from "lucide-react";

// IA 4.6 · 我的工作台 · 选股工具(Screener 配置 / AI 选股 / 监控)
// 工具配置 · 用户主动创建 · 心智上属于"我的"。

const SAVED_SCREENERS = [
  {
    id: "sc-tech-growth",
    name: "科技成长股 · 我的筛子",
    desc: "美股科技 · FCF Margin > 20% · 3 年 revenue CAGR > 25%",
    lastRun: "今天 9:05",
    hits: 14,
    method: "基本面",
  },
  {
    id: "sc-breakout",
    name: "半导体横盘突破",
    desc: "半导体 · 20 日横盘 · 成交量 > 1.5x · RSI 50-70",
    lastRun: "昨天 23:30",
    hits: 3,
    method: "技术",
  },
  {
    id: "sc-dividend-defensive",
    name: "防御性高股息",
    desc: "Yield > 3% · 连续 5 年派息 · Payout < 70%",
    lastRun: "本周一",
    hits: 22,
    method: "基本面",
  },
];

const AI_MONITORS = [
  {
    id: "mn-vix-spike",
    name: "VIX 跳升监控",
    desc: "VIX 单日 ≥ +3 时通知 · 提示高 beta 持仓仓位调整",
    enabled: true,
  },
  {
    id: "mn-earnings-prebeat",
    name: "财报前预期收敛",
    desc: "我关注的标的财报前 7 天 · 卖方预期变化 · 推送",
    enabled: true,
  },
  {
    id: "mn-crowded-trade",
    name: "拥挤交易预警",
    desc: "自选中的标的成交/开仓分位突破 90 时推送",
    enabled: false,
  },
];

export default function ScreenerPage() {
  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <header className="mb-6 border-b border-hairline-strong pb-4">
        <div className="mb-1 flex items-center gap-2 text-accent">
          <SlidersHorizontal size={14} />
          <span className="kicker">SCREENER & MONITOR · 选股工具</span>
        </div>
        <h1 className="font-serif text-[30px] font-bold leading-[36px] tracking-[-0.02em]">
          选股工具 · 我的筛子 + AI 监控
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          保存的筛选条件 · 订阅的 AI 选股 · 或事件触发监控 —— 都属于&ldquo;<b>我的</b>&rdquo;工具配置。
        </p>
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-center">
          <div className="kicker text-fg-3">保存的筛子 · SAVED SCREENERS</div>
          <button className="ml-auto inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1 text-[12px] font-medium text-fg-1 hover:border-accent hover:text-accent">
            新建筛子
          </button>
        </div>
        <div className="space-y-2">
          {SAVED_SCREENERS.map((s) => (
            <Link
              key={s.id}
              href="#"
              className="flex items-center gap-3 rounded-lg border border-hairline-strong bg-bg-1 p-3 hover:border-accent"
            >
              <SlidersHorizontal size={14} className="shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold">{s.name}</span>
                  <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-semibold text-fg-2">
                    {s.method}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-fg-3">{s.desc}</div>
              </div>
              <div className="shrink-0 text-right text-[11px]">
                <div className="num font-bold text-fg-1">{s.hits} 只</div>
                <div className="text-[10px] text-fg-3">上次运行 {s.lastRun}</div>
              </div>
              <button className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent/20">
                <Play size={10} /> 运行
              </button>
              <ChevronRight size={12} className="text-fg-3" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <div className="kicker text-fg-3">AI 监控 · MONITORS</div>
        </div>
        <div className="space-y-2">
          {AI_MONITORS.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-lg border border-hairline-strong bg-bg-1 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold">{m.name}</div>
                <div className="mt-0.5 text-[11px] text-fg-3">{m.desc}</div>
              </div>
              <span
                className={`shrink-0 rounded-xs px-2 py-0.5 text-[10px] font-semibold ${
                  m.enabled
                    ? "bg-up-soft text-up-dark"
                    : "bg-bg-3 text-fg-3"
                }`}
              >
                {m.enabled ? "启用中" : "已停用"}
              </span>
              <button className="inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px] font-medium text-fg-1 hover:border-accent hover:text-accent">
                {m.enabled ? "暂停" : "启用"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
