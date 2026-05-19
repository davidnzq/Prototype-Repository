"use client";

// 本地 v3.0 home 翻译版 · 从 longbridge-web-demo/js/home.js 翻译
// 仅在原结构上应用 v2 设计 token(青绿)。v2 个股组件 (AlertHot/AIAnalysis/
// EventTracker/AlertCalendar) 不在此处使用 — 那些是个股页的素材。
//
// 视图分两态:
//   默认 home(AI 工作台 + Timeline + 6 Widget)
//   ?view=dyn-* 切到对应动态视图 (Stage A·3)

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Star,
  BarChart3,
  Calendar,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  Eye,
} from "lucide-react";
import { DynView } from "@/components/dynamic/DynView";
import type { DynViewId } from "@/lib/intent";
import { useDynamicPlans, clearDynamicPlans } from "@/lib/dynamicPlans";
import {
  TOP_INDICES,
  AW_GROUPS,
  TIMELINE_UR,
  TIMELINE_RD,
  WATCHLIST,
  PORTFOLIO,
  MARKET_INDICES,
  CALENDAR,
  KPI_TOTAL_ASSETS,
  KPI_DAY_PNL,
  KPI_HOLDING_VALUE,
  KPI_TOTAL_PNL,
  KPI_PNL_YTD,
  KPI_PNL_RATE,
  KPI_BENCH_GAP,
  KPI_TODAY,
  KPI_WEEK,
  KPI_MONTH,
  AI_TIP,
  type AwCard as AwCardType,
  type TimelineEvent as TimelineEventT,
} from "@/mock/localHome";

const KNOWN_TICKERS = new Set([
  "NVDA",
  "AAPL",
  "GOOG",
  "META",
  "TSM",
  "AMD",
  "MSFT",
  "BRK.B",
  "BABA",
  "TSLA",
  "AMZN",
]);

const DYN_VIEW_IDS: DynViewId[] = [
  "dyn-research",
  "dyn-risk",
  "dyn-attribution",
  "dyn-screener",
  "dyn-tradeplan",
  "dyn-compare",
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const symbol = searchParams.get("symbol");

  if (view && DYN_VIEW_IDS.includes(view as DynViewId)) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-bg-2">
        <DynView viewId={view as DynViewId} symbol={symbol ?? undefined} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-bg-2">
      <IndexBar />
      <AiTipInline />
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-8 pt-4">
        <AiWorkbench />
        <Timeline />
        <Widgets />
      </div>
    </div>
  );
}

/* ── 顶部指数条 ──────────────────────────────────────────── */
function IndexBar() {
  return (
    <div className="flex h-9 shrink-0 items-center gap-6 border-b border-hairline-strong bg-bg-1 px-6 text-[11px]">
      {TOP_INDICES.map((idx) => {
        const up = idx.dir === "up";
        return (
          <div key={idx.name} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-1 rounded-sm ${up ? "bg-up" : "bg-down"}`} />
            <span className="font-medium text-fg-1">{idx.name}</span>
            <span className="num text-fg-1">{idx.val}</span>
            <span className={up ? "text-up" : "text-down"}>{up ? "▲" : "▼"}</span>
            <span className={`num ${up ? "text-up" : "text-down"}`}>
              {idx.chg} {idx.pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 顶部 AI 提示行 ───────────────────────────────────────── */
function AiTipInline() {
  return (
    <div className="border-b border-hairline-strong bg-accent-soft/30 px-6 py-2">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <AlertTriangle size={11} strokeWidth={2.25} />
        </span>
        <span className="text-[12px] text-fg-1">{AI_TIP.msg}</span>
        <span className="ml-auto flex gap-1.5">
          {AI_TIP.sugs.map((s) => (
            <button
              key={s}
              className="rounded-pill border border-hairline-strong bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

/* ── AI 工作台 ────────────────────────────────────────────── */
function AiWorkbench() {
  const dynamic = useDynamicPlans();
  // 动态 PENDING_HITL plans prepend 到"需关注"组
  const groups = AW_GROUPS.map((g) => {
    if (g.id !== "alert") return g;
    const dynamicCards: AwCardType[] = dynamic.map((p) => ({
      status: "warn",
      title: `${p.title}${p.symbol ? ` · ${p.symbol}` : ""}`,
      desc: `等你最终确认 · ${new Date(p.createdAt).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      kv: [["状态", "PENDING_HITL"]],
      actions: ["Ack 下单", "改参数"],
    }));
    return { ...g, cards: [...dynamicCards, ...g.cards] };
  });
  const total = groups.reduce((acc, g) => acc + g.cards.length, 0);

  return (
    <section className="mb-5 rounded-lg border border-hairline-strong bg-bg-1 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Sparkles size={13} strokeWidth={2.25} />
        </span>
        <span className="text-[13px] font-semibold text-fg-1">AI 工作台</span>
        <span className="caps">{total} 项</span>
        {dynamic.length > 0 && (
          <button
            onClick={clearDynamicPlans}
            className="ml-auto text-[10px] text-fg-3 transition-colors hover:text-accent"
            title="清空 chat 内通过 HITL 加入的待确认 Plan"
          >
            清空 PENDING ({dynamic.length})
          </button>
        )}
      </div>
      {groups.map((g) => (
        <AwGroup key={g.id} group={g} />
      ))}
    </section>
  );
}

function AwGroup({
  group,
}: {
  group: { id: string; title: string; subtitle: string; cards: AwCardType[] };
}) {
  const dotColor =
    group.id === "alert" ? "bg-warn" : group.id === "active" ? "bg-up" : "bg-info";
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="text-[12px] font-semibold text-fg-1">{group.title}</span>
        <span className="text-[10px] text-fg-3">· {group.cards.length}</span>
        <span className="text-[10px] text-fg-3">· {group.subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {group.cards.map((card, i) => (
          <AwCard key={`${group.id}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function AwCard({ card }: { card: AwCardType }) {
  const statusColor =
    card.status === "warn"
      ? "border-warn/40 bg-warn/5"
      : card.status === "run"
      ? "border-info/30 bg-info/5"
      : "border-hairline-strong bg-bg-2";
  const statusDot =
    card.status === "warn"
      ? "bg-warn"
      : card.status === "run"
      ? "bg-info animate-pulse"
      : card.status === "paused"
      ? "bg-fg-3"
      : "bg-up";

  return (
    <div className={`flex flex-col gap-2 rounded-md border p-3 transition-colors ${statusColor}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${statusDot}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-fg-1">{card.title}</div>
          <div className="text-[11px] text-fg-2">{card.desc}</div>
        </div>
      </div>
      {card.kv && card.kv.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px]">
          {card.kv.map(([k, v]) => (
            <span key={k} className="text-fg-3">
              {k}
              <span className="num ml-1 text-fg-1">{v}</span>
            </span>
          ))}
        </div>
      )}
      {typeof card.progress === "number" && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-3">
          <div
            className="h-full rounded-full bg-info"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      )}
      {card.actions && card.actions.length > 0 && (
        <div className="flex gap-1.5 pt-1">
          {card.actions.map((a, i) => (
            <button
              key={i}
              className={`rounded-sm px-2 py-1 text-[10.5px] font-medium transition-colors ${
                i === 0
                  ? "border border-hairline-strong bg-bg-1 text-fg-1 hover:bg-bg-3"
                  : "text-fg-3 hover:text-fg-1"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 变化事件时间线 ──────────────────────────────────────── */
function Timeline() {
  const freshCount = TIMELINE_UR.length;
  const sigEvents = TIMELINE_UR.filter((e) => e.sig);
  const normalUr = TIMELINE_UR.filter((e) => !e.sig);

  return (
    <section className="mb-5">
      <header className="mb-3 flex items-baseline gap-3">
        <span className="text-[13px] font-semibold text-fg-1">变化事件</span>
        {freshCount > 0 && (
          <span className="text-[11px] text-fg-3">
            {freshCount} 条新变化 · 点击蓝色 ticker 查看详情
          </span>
        )}
      </header>

      {/* Signal 富卡片(独立铺开) */}
      {sigEvents.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {sigEvents.map((e) => (
            <SignalCard key={e.id} ev={e} />
          ))}
        </div>
      )}

      {/* 普通事件卡 — 同组合并到 sc-group(统一边框) */}
      {normalUr.length > 0 && (
        <div className="overflow-hidden rounded-md border border-hairline-strong bg-bg-1">
          {normalUr.map((e, i) => (
            <div
              key={e.id}
              className={i > 0 ? "border-t border-hairline-strong" : ""}
            >
              <EventRow ev={e} />
            </div>
          ))}
        </div>
      )}

      {/* 已读分隔线 + Dismissed 事件 */}
      {TIMELINE_RD.length > 0 && (
        <>
          <div className="my-3 flex items-center gap-2 text-[10px] text-fg-3">
            <span className="h-px flex-1 bg-hairline-strong" />
            <span>已查看</span>
            <span className="h-px flex-1 bg-hairline-strong" />
          </div>
          <div className="overflow-hidden rounded-md border border-hairline-strong bg-bg-1 opacity-60">
            {TIMELINE_RD.map((e, i) => (
              <div
                key={e.id}
                className={i > 0 ? "border-t border-hairline-strong" : ""}
              >
                <EventRow ev={e} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function tagColor(c: TimelineEventT["c"]) {
  switch (c) {
    case "signal":
      return "bg-accent-soft text-accent";
    case "anomaly":
      return "bg-warn/15 text-warn";
    case "catalyst":
      return "bg-info/15 text-info";
    case "news":
      return "bg-up/15 text-up";
    case "system":
      return "bg-fg-3/15 text-fg-2";
  }
}

function EventRow({ ev }: { ev: TimelineEventT }) {
  const isKnown = KNOWN_TICKERS.has(ev.tk);
  const rlTagColor =
    ev.rlTagLevel === "warn" ? "text-warn" : ev.rlTagLevel === "good" ? "text-up" : "text-fg-3";
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 text-[12px]">
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tagColor(ev.c)}`}>
        {ev.tag}
      </span>
      {isKnown ? (
        <Link
          href={`/stock/${ev.tk}.US`}
          className="ticker rounded-sm bg-info/10 px-1.5 py-0.5 text-[11px] font-semibold text-info hover:bg-info/20"
        >
          {ev.tk}
        </Link>
      ) : (
        <span className="ticker px-1.5 py-0.5 text-[11px] font-medium text-fg-2">
          {ev.tk}
        </span>
      )}
      <span className="flex-1 text-fg-1">{ev.tx}</span>
      {ev.rl && (
        <span className="text-[11px] text-fg-3">
          {ev.rl}
          {ev.rlTag && <span className={`ml-1 ${rlTagColor}`}>· {ev.rlTag}</span>}
        </span>
      )}
      <span className="shrink-0 text-[10px] text-fg-3">{ev.tm}</span>
    </div>
  );
}

function SignalCard({ ev }: { ev: TimelineEventT }) {
  return (
    <div className="rounded-md border border-accent/30 bg-accent-soft/10 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="caps text-accent">{ev.tag} · 富卡片</span>
        <Link
          href={`/stock/${ev.tk}.US`}
          className="ticker rounded-sm bg-info/10 px-1.5 py-0.5 text-[11px] font-semibold text-info hover:bg-info/20"
        >
          {ev.tk}
        </Link>
        <span className="ml-auto text-[10px] text-fg-3">{ev.tm}</span>
      </div>
      <div className="mb-1.5 text-[13px] font-semibold text-fg-1">{ev.tx}</div>
      {ev.rl && <div className="text-[11px] text-fg-3">{ev.rl}</div>}
    </div>
  );
}

/* ── Widgets(6 卡片) ────────────────────────────────────── */
function Widgets() {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <TotalAssetsCard />
      <PnlAnalysisCard />
      <WatchlistCard />
      <PortfolioCard />
      <MarketRankingsCard />
      <CalendarCard />
    </section>
  );
}

function WidgetShell({
  icon,
  title,
  iconBg = "bg-up/15",
  iconColor = "text-up",
  more,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  iconBg?: string;
  iconColor?: string;
  more?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>
          {icon}
        </span>
        <span className="text-[12.5px] font-semibold text-fg-1">{title}</span>
        {more && (
          <Link
            href={more.href}
            className="ml-auto text-[10.5px] text-fg-3 transition-colors hover:text-accent"
          >
            {more.label}
          </Link>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TotalAssetsCard() {
  return (
    <WidgetShell
      icon={<Wallet size={13} strokeWidth={2} />}
      iconBg="bg-up/15"
      iconColor="text-up"
      title="总资产"
    >
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="num text-2xl font-semibold text-fg-1">{KPI_TOTAL_ASSETS}</span>
        <Eye size={12} className="text-fg-3" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-fg-3">当日盈亏</div>
          <div className="num text-up">{KPI_DAY_PNL}</div>
        </div>
        <div>
          <div className="text-fg-3">持仓市值</div>
          <div className="num text-fg-1">{KPI_HOLDING_VALUE}</div>
        </div>
        <div>
          <div className="text-fg-3">总盈亏</div>
          <div className="num text-up">{KPI_TOTAL_PNL}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-fg-3">
        <ShieldCheck size={10} className="text-up" />
        <span>安全</span>
        <span className="ml-auto text-accent">融资状态 ›</span>
      </div>
    </WidgetShell>
  );
}

function PnlAnalysisCard() {
  return (
    <WidgetShell
      icon={<TrendingUp size={13} strokeWidth={2} />}
      iconBg="bg-up/15"
      iconColor="text-up"
      title="盈亏分析"
    >
      <div className="mb-2 flex items-baseline gap-2">
        <span className="num text-xl font-semibold text-up">{KPI_PNL_YTD}</span>
        <span className="num text-[12px] text-up">{KPI_PNL_RATE}</span>
      </div>
      <div className="mb-2 flex items-center gap-1.5 text-[10.5px]">
        <span className="h-1.5 w-1.5 rounded-full bg-down" />
        <span className="text-fg-3">跑输 · 道琼斯</span>
        <span className="num ml-auto text-down">{KPI_BENCH_GAP}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-hairline-strong pt-2 text-[11px]">
        <div>
          <div className="text-fg-3">今日</div>
          <div className="num text-up">{KPI_TODAY}</div>
        </div>
        <div>
          <div className="text-fg-3">本周</div>
          <div className="num text-up">{KPI_WEEK}</div>
        </div>
        <div>
          <div className="text-fg-3">本月</div>
          <div className="num text-up">{KPI_MONTH}</div>
        </div>
      </div>
    </WidgetShell>
  );
}

function WatchlistCard() {
  return (
    <WidgetShell
      icon={<Star size={13} strokeWidth={2} />}
      iconBg="bg-up/15"
      iconColor="text-up"
      title="Watchlist"
      more={{ label: "查看全部 →", href: "/watchlist" }}
    >
      <div className="flex flex-col gap-1">
        {WATCHLIST.map((w) => (
          <Link
            key={w.tk}
            href={`/stock/${w.tk}.US`}
            className="grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-2 rounded px-1 py-1 text-[11.5px] transition-colors hover:bg-bg-2"
          >
            <span className="ticker font-semibold text-fg-1">{w.tk}</span>
            <span className="truncate text-fg-3">{w.nm}</span>
            <span className="num text-fg-1">${w.pr}</span>
            <span className={`num ${w.dir === "up" ? "text-up" : "text-down"}`}>{w.chg}</span>
          </Link>
        ))}
      </div>
    </WidgetShell>
  );
}

function PortfolioCard() {
  return (
    <WidgetShell
      icon={<Briefcase size={13} strokeWidth={2} />}
      iconBg="bg-accent-soft"
      iconColor="text-accent"
      title="Portfolio"
      more={{ label: "查看全部 →", href: "/portfolio" }}
    >
      <div className="flex flex-col gap-1">
        {PORTFOLIO.map((p) => (
          <Link
            key={p.tk}
            href={`/stock/${p.tk}.US`}
            className="grid grid-cols-[auto_1fr_auto_auto] items-baseline gap-2 rounded px-1 py-1 text-[11.5px] transition-colors hover:bg-bg-2"
          >
            <span className="ticker font-semibold text-fg-1">{p.tk}</span>
            <span className="truncate text-fg-3">{p.nm}</span>
            <span className="num text-fg-1">{p.pr}</span>
            <span className={`num ${p.dir === "up" ? "text-up" : "text-down"}`}>{p.pnl}</span>
          </Link>
        ))}
      </div>
    </WidgetShell>
  );
}

function MarketRankingsCard() {
  // Top gainers / losers 由 WATCHLIST + PORTFOLIO 合并去重排序得到
  const rankMap = new Map<string, { tk: string; nm: string; pr: string; chg: string; dir: "up" | "down" }>();
  [
    ...WATCHLIST,
    ...PORTFOLIO.map((p) => ({
      tk: p.tk,
      nm: p.nm,
      pr: p.pr.replace("$", ""),
      chg: p.pnl,
      dir: p.dir,
    })),
  ].forEach((r) => {
    if (!rankMap.has(r.tk)) rankMap.set(r.tk, r);
  });
  const ranked = Array.from(rankMap.values()).filter((r) => r.chg.includes("%"));
  const gainers = ranked
    .filter((r) => r.dir === "up")
    .sort((a, b) => parseFloat(b.chg) - parseFloat(a.chg))
    .slice(0, 3);
  const losers = ranked
    .filter((r) => r.dir === "down")
    .sort((a, b) => parseFloat(a.chg) - parseFloat(b.chg))
    .slice(0, 3);

  return (
    <WidgetShell
      icon={<BarChart3 size={13} strokeWidth={2} />}
      iconBg="bg-info/15"
      iconColor="text-info"
      title="Market"
      more={{ label: "进入市场 →", href: "/markets" }}
    >
      <div className="mb-2 flex flex-col gap-1">
        {MARKET_INDICES.map((idx) => (
          <div
            key={idx.name}
            className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2 text-[11.5px]"
          >
            <span className={`h-2.5 w-1 rounded-sm ${idx.dir === "up" ? "bg-up" : "bg-down"}`} />
            <span className="text-fg-2">{idx.name}</span>
            <span className="num text-fg-1">{idx.val}</span>
            <span></span>
            <span></span>
            <span className={`num ${idx.dir === "up" ? "text-up" : "text-down"}`}>{idx.chg}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-hairline-strong pt-2">
        <div>
          <div className="caps mb-1 flex items-center gap-1 text-up">
            <Trophy size={9} /> Top gainers
          </div>
          {gainers.map((r) => (
            <Link
              key={r.tk}
              href={`/stock/${r.tk}.US`}
              className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2 rounded px-1 py-0.5 text-[11px] hover:bg-bg-2"
            >
              <span className="ticker font-semibold text-fg-1">{r.tk}</span>
              <span className="num text-fg-3">${r.pr}</span>
              <span className="num text-up">{r.chg}</span>
            </Link>
          ))}
        </div>
        <div>
          <div className="caps mb-1 flex items-center gap-1 text-down">
            <TrendingDown size={9} /> Top losers
          </div>
          {losers.length === 0 && (
            <div className="px-1 text-[10.5px] text-fg-3">无下跌持仓 / 自选</div>
          )}
          {losers.map((r) => (
            <Link
              key={r.tk}
              href={`/stock/${r.tk}.US`}
              className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2 rounded px-1 py-0.5 text-[11px] hover:bg-bg-2"
            >
              <span className="ticker font-semibold text-fg-1">{r.tk}</span>
              <span className="num text-fg-3">${r.pr}</span>
              <span className="num text-down">{r.chg}</span>
            </Link>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}

function CalendarCard() {
  return (
    <WidgetShell
      icon={<Calendar size={13} strokeWidth={2} />}
      iconBg="bg-info/15"
      iconColor="text-info"
      title="Calendar"
      more={{ label: "全部日程 →", href: "/calendar" }}
    >
      <div className="flex flex-col gap-1">
        {CALENDAR.map((ev) => {
          const clickable = KNOWN_TICKERS.has(ev.tk);
          const inner = (
            <div className="grid grid-cols-[auto_auto_auto_1fr] items-baseline gap-2 rounded px-1 py-1 text-[11px]">
              <span className="num text-fg-3">{ev.d}</span>
              <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] text-info">
                {ev.tag}
              </span>
              <span className="ticker font-semibold text-fg-1">{ev.tk}</span>
              <span className="truncate text-fg-2">{ev.nm}</span>
            </div>
          );
          return clickable ? (
            <Link key={ev.d + ev.tk} href={`/stock/${ev.tk}.US`} className="hover:bg-bg-2">
              {inner}
            </Link>
          ) : (
            <div key={ev.d + ev.tk}>{inner}</div>
          );
        })}
      </div>
    </WidgetShell>
  );
}
