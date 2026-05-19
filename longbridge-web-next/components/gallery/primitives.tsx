// Small shared building blocks each layout variant can compose from.
// Server components (sync, no hooks) so they can be used directly in SSR pages.

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Sparkles, CheckCircle2 } from "lucide-react";
import type { Catalyst, Signal, Quote, TradePlan } from "@/types/domain";
import type { DemoSecurity } from "@/lib/universe";

// ─── Editorial kicker ──────────────────────────────────────────────────
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="kicker" style={{ color: "var(--accent)" }}>
      {children}
    </div>
  );
}

// ─── Serif display heading ────────────────────────────────────────────
export function DisplayHeading({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const cls =
    size === "xl"
      ? "text-[44px] leading-[50px]"
      : size === "lg"
      ? "text-[32px] leading-[38px]"
      : size === "sm"
      ? "text-[20px] leading-[26px]"
      : "text-[24px] leading-[30px]";
  return (
    <h1
      className={`font-serif font-bold tracking-[-0.02em] ${cls}`}
      style={{ color: "var(--fg-1)" }}
    >
      {children}
    </h1>
  );
}

// ─── Mini ticker row ───────────────────────────────────────────────────
export function MiniTicker({
  sec,
  quote,
  compact = false,
}: {
  sec: DemoSecurity;
  quote?: Quote;
  compact?: boolean;
}) {
  const chg = quote ? quote.changePct * 100 : 0;
  const up = chg >= 0;
  return (
    <Link
      href={`/stock/${encodeURIComponent(sec.symbol)}`}
      className={`grid items-center gap-2 rounded-md px-3 py-2 hover:bg-bg-2 ${
        compact ? "grid-cols-[1fr_auto]" : "grid-cols-[36px_1fr_auto_auto]"
      }`}
    >
      {!compact && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline-strong bg-bg-2 text-[10px] font-bold">
          {sec.symbol.split(".")[0].slice(0, 4)}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold">{sec.nameZh}</div>
        {!compact && (
          <div className="text-[10px] text-fg-3">
            {sec.symbol} · {sec.sector}
          </div>
        )}
      </div>
      <div className="num text-right text-[13px] font-bold">
        {quote ? quote.lastDone.toFixed(2) : "—"}
      </div>
      {!compact && (
        <span
          className={`num rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
            up ? "bg-up-soft text-up-dark" : "bg-down-soft text-down-dark"
          }`}
        >
          {quote ? (up ? "+" : "") + chg.toFixed(2) + "%" : "—"}
        </span>
      )}
    </Link>
  );
}

// ─── Mini Catalyst card ────────────────────────────────────────────────
// `href` overrides the default: e.g. "?peek=<id>" for home peek, or
// "/insight/<id>" for full-page nav. Defaults to Peek on current URL.
export function MiniCatalyst({
  c,
  href,
}: {
  c: Catalyst;
  href?: string;
}) {
  const border =
    c.factualDirection === "positive"
      ? "border-l-up"
      : c.factualDirection === "negative"
      ? "border-l-down"
      : c.factualDirection === "mixed"
      ? "border-l-warn"
      : "border-l-fg-3";
  const dirLabel =
    c.factualDirection === "positive"
      ? "+"
      : c.factualDirection === "negative"
      ? "−"
      : c.factualDirection === "mixed"
      ? "±"
      : "·";
  const dirCls =
    c.factualDirection === "positive"
      ? "text-up-dark"
      : c.factualDirection === "negative"
      ? "text-down-dark"
      : c.factualDirection === "mixed"
      ? "text-warn"
      : "text-fg-3";
  const inner = (
    <>
      <div className="mb-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-fg-3">
        <span className={`num font-bold ${dirCls}`}>{dirLabel}</span>
        <span>
          {c.type.replace(/_/g, " ")} · {c.symbol} · {c.significance}
        </span>
      </div>
      <div className="font-serif text-[14px] leading-[18px] font-semibold">
        {c.title}
      </div>
      <div className="mt-0.5 text-[11px] leading-[15px] text-fg-2">
        {c.subtitle}
      </div>
    </>
  );
  const finalHref = href ?? `/insight/${c.id}`;
  return (
    <Link
      href={finalHref}
      scroll={false}
      className={`block border-l-4 ${border} bg-bg-1 px-3 py-2 hover:bg-bg-2`}
    >
      {inner}
    </Link>
  );
}

// ─── Mini Signal card ──────────────────────────────────────────────────
export function MiniSignal({ s }: { s: Signal }) {
  const convCls =
    s.conviction === "HIGH"
      ? "bg-up-soft text-up-dark"
      : s.conviction === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";
  const upside =
    s.upsidePct >= 0
      ? `+${s.upsidePct.toFixed(1)}%`
      : `${s.upsidePct.toFixed(1)}%`;
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="caps text-accent">
          {s.symbol} × {s.strategyName}
        </span>
        <span
          className={`num rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${convCls}`}
        >
          {s.conviction}
        </span>
        <span className="flex-1" />
        <span
          className={`num text-[11px] font-bold ${
            s.upsidePct >= 0 ? "text-up-dark" : "text-down-dark"
          }`}
        >
          {upside}
        </span>
      </div>
      <div className="font-serif text-[14px] leading-[19px] font-semibold">
        {s.oneLineConclusion}
      </div>
    </div>
  );
}

// ─── Narrow-column Signal card ────────────────────────────────────────
// Two modes:
//   · default: standalone card with its own border/bg (for inline in chat)
//   · flat:  just the content, no border/bg (for use inside a list container
//            with divide-y, e.g. the tri-pane TOP SIGNALS column)
// `href` overrides the link target (e.g. "?peek=<id>" for home).
export function MiniSignalNarrow({
  s,
  flat = false,
  href,
}: {
  s: Signal;
  flat?: boolean;
  href?: string;
}) {
  const conv = s.conviction;
  const convCls =
    conv === "HIGH"
      ? "bg-up-soft text-up-dark"
      : conv === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";
  const short = shortStrategyLabel(s.strategyName);
  const sym = s.symbol.split(".")[0];
  const upsideCls = s.upsidePct >= 0 ? "text-up-dark" : "text-down-dark";
  const shell = flat
    ? "block rounded-sm px-1 py-2.5 -mx-1 hover:bg-bg-2"
    : "block rounded-md border border-hairline-strong bg-bg-1 px-3 py-2 hover:bg-bg-2";

  const inner = (
    <>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="num text-[12px] font-bold text-fg-1">{sym}</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-fg-3">
          {short}
        </span>
        <span className="flex-1" />
        <span
          className={`rounded-xs px-1 py-0.5 text-[9px] font-bold ${convCls}`}
        >
          {conv}
        </span>
        <span className={`num text-[11px] font-bold ${upsideCls}`}>
          {s.upsidePct >= 0 ? "+" : ""}
          {s.upsidePct.toFixed(1)}%
        </span>
      </div>
      <div className="line-clamp-2 text-[12px] leading-[17px] text-fg-1">
        {s.oneLineConclusion}
      </div>
    </>
  );
  const finalHref = href ?? `/insight/${s.id}`;
  return (
    <Link href={finalHref} scroll={false} className={shell}>
      {inner}
    </Link>
  );
}

function shortStrategyLabel(name: string): string {
  if (name.startsWith("Buffett")) return "Buffett";
  if (name.startsWith("Wood")) return "Wood";
  if (name.startsWith("Simons")) return "Simons";
  if (name.startsWith("Soros")) return "Soros";
  return name.split(" ")[0];
}

// ─── Static chat bubble (for showcase — no real AI) ────────────────────
export function MockChatBubble({
  role,
  children,
}: {
  role: "assistant" | "user";
  children: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-bg-2 px-3 py-2 text-[12px] leading-[18px]">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-[9px] font-bold text-fg-inverse">
        AI
      </div>
      <div className="flex-1 space-y-2 text-[12px] leading-[19px]">{children}</div>
    </div>
  );
}

// ─── Fake prompt bar ──────────────────────────────────────────────────
export function FakePromptBar({ hint = "问 Bridge AI 任何事…" }: { hint?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-hairline-strong bg-bg-1 px-3 py-2">
      <div className="flex-1 text-[12px] text-fg-3">{hint}</div>
      <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-mono text-fg-2">
        ⌘K
      </span>
    </div>
  );
}

// ─── Stat tile (big tabular number) ────────────────────────────────────
export function StatTile({
  label,
  value,
  delta,
  deltaKind,
  small,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaKind?: "up" | "down" | "flat" | "warn";
  small?: boolean;
}) {
  const deltaCls =
    deltaKind === "up"
      ? "text-up-dark"
      : deltaKind === "down"
      ? "text-down-dark"
      : deltaKind === "warn"
      ? "text-warn"
      : "text-fg-2";
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">{label}</div>
      <div
        className={`num mt-1 font-bold ${
          small ? "text-[16px] leading-[20px]" : "text-[22px] leading-[26px]"
        }`}
      >
        {value}
      </div>
      {delta && (
        <div className={`num mt-0.5 text-[11px] font-semibold ${deltaCls}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

// ─── Market-temperature chip ──────────────────────────────────────────
export function MarketTempChip({ vix, label }: { vix: number; label?: string }) {
  const mood =
    vix < 13 ? "极度贪婪" : vix < 18 ? "平稳" : vix < 25 ? "谨慎" : "恐慌";
  const color =
    vix < 13
      ? "bg-up-soft text-up-dark"
      : vix < 25
      ? "bg-warn/15 text-warn"
      : "bg-down-soft text-down-dark";
  return (
    <span
      className={`num inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 text-[10px] font-bold ${color}`}
    >
      VIX {vix.toFixed(1)}
      <span className="opacity-80">· {label ?? mood}</span>
    </span>
  );
}

// ─── News strip (dense list of headlines) ─────────────────────────────
// 带 sourceSymbol 的新闻项可以点 → 打开 peek 浮层
export function NewsStrip({
  items,
  compact = false,
}: {
  items: {
    id: string;
    title: string;
    publishedAt: string;
    sourceSymbol?: string;
  }[];
  compact?: boolean;
}) {
  const sinceNow = (iso: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600_000);
    if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m`;
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };
  return (
    <div className="divide-y divide-hairline-strong">
      {items.map((n) => {
        const row = (
          <>
            <span className="num shrink-0 text-[10px] text-fg-3">
              {sinceNow(n.publishedAt)}
            </span>
            <span className="line-clamp-2 flex-1 text-[12px] leading-[17px] text-fg-1">
              {n.title}
            </span>
          </>
        );
        const rowCls = `flex items-start gap-2 ${
          compact ? "py-1.5" : "py-2"
        }`;
        if (n.sourceSymbol) {
          return (
            <Link
              key={n.id}
              href={`?peek=news:${n.sourceSymbol}:${encodeURIComponent(n.id)}`}
              scroll={false}
              className={`${rowCls} -mx-2 rounded-sm px-2 hover:bg-bg-2`}
            >
              {row}
            </Link>
          );
        }
        return (
          <div key={n.id} className={rowCls}>
            {row}
          </div>
        );
      })}
    </div>
  );
}

// ─── Portfolio pulse (total + today PnL + sector bar) ─────────────────
export function PortfolioPulse({
  total,
  pnlPct,
  techConcentration,
  cashPct,
}: {
  total: number;
  pnlPct: number;
  techConcentration: number;
  cashPct: number;
}) {
  const up = pnlPct >= 0;
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">
            Portfolio · 今日
          </div>
          <div className="num text-[20px] font-bold">
            ${total.toLocaleString()}
          </div>
          <div
            className={`num text-[11px] font-semibold ${
              up ? "text-up-dark" : "text-down-dark"
            }`}
          >
            {up ? "▲ +" : "▼ "}
            {pnlPct.toFixed(2)}% 今日
          </div>
        </div>
        <div className="text-right text-[10px] text-fg-2">
          <div>
            Tech <span className="num font-bold text-fg-1">{(techConcentration * 100).toFixed(0)}%</span>
          </div>
          <div className="mt-1">
            Cash <span className="num font-bold text-fg-1">{(cashPct * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
      {/* Sector concentration bar */}
      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-accent"
          style={{ width: `${techConcentration * 100}%` }}
          title="Tech"
        />
        <div
          className="bg-chart-2"
          style={{ width: `${(1 - techConcentration - cashPct) * 100}%` }}
          title="其它"
        />
        <div className="bg-bg-3" style={{ width: `${cashPct * 100}%` }} title="现金" />
      </div>
      {techConcentration > 0.6 && (
        <div className="mt-2 flex items-start gap-1 text-[10px] leading-[14px] text-warn">
          <TrendingUp size={10} className="mt-0.5 shrink-0" />
          <span>科技敞口 {(techConcentration * 100).toFixed(0)}% 偏高,考虑分散。</span>
        </div>
      )}
    </div>
  );
}

// ─── Strategy Lens · 同股多策略对比 ───────────────────────────────────
export function StrategyLens({ signals }: { signals: Signal[] }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1">
      <div className="border-b border-hairline-strong px-3 py-2">
        <div className="caps text-accent">STRATEGY LENS · 同股多视角</div>
        <div className="mt-0.5 text-[11px] text-fg-2">
          {signals[0]?.symbol} · 在 {signals.length} 套 OMR 下给出不同结论
        </div>
      </div>
      <div className="grid divide-x divide-hairline-strong" style={{ gridTemplateColumns: `repeat(${signals.length}, 1fr)` }}>
        {signals.map((s) => {
          const conv = s.conviction;
          const convCls =
            conv === "HIGH"
              ? "bg-up-soft text-up-dark"
              : conv === "MEDIUM"
              ? "bg-warn/15 text-warn"
              : "bg-bg-3 text-fg-2";
          return (
            <div key={s.id} className="p-3">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-2">
                {s.strategyName.split(" ")[0]}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`num rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${convCls}`}
                >
                  {conv}
                </span>
                <span className="text-[11px] font-bold">{s.action}</span>
                <span
                  className={`num ml-auto text-[11px] font-bold ${
                    s.upsidePct >= 0 ? "text-up-dark" : "text-down-dark"
                  }`}
                >
                  {s.upsidePct >= 0 ? "+" : ""}
                  {s.upsidePct.toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-[16px] text-fg-1">
                {s.oneLineConclusion}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Trade Plan preview ──────────────────────────────────────────────
export function TradePlanPreview({ plan, symbol }: { plan: TradePlan; symbol: string }) {
  const phases = plan.targetPlan.phases ?? [];
  return (
    <div className="rounded-lg border-2 border-accent/30 bg-bg-1 p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <span className="caps text-accent">TRADE PLAN · {symbol}</span>
        <span className="rounded-xs bg-warn/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-warn">
          {plan.status}
        </span>
        <span className="flex-1" />
        <span className="text-[10px] text-fg-3">窗口 {plan.targetPlan.window}</span>
      </div>

      {/* Target Plan */}
      <div className="mb-3 grid grid-cols-3 gap-3 border-b border-hairline-strong pb-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">动作</div>
          <div className="mt-0.5 text-[13px] font-bold">{plan.targetPlan.action}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">目标仓位</div>
          <div className="num mt-0.5 text-[13px] font-bold">
            {(plan.targetPlan.targetWeight * 100).toFixed(0)}%
            <span className="ml-1 text-[10px] font-normal text-fg-2">
              (当前 {(plan.targetPlan.currentWeight * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">
            风险边界
          </div>
          <div className="mt-0.5 text-[11px] leading-[14px]">
            {plan.targetPlan.riskBoundary}
          </div>
        </div>
      </div>

      {/* Phases */}
      {phases.length > 0 && (
        <div className="mb-3">
          <div className="caps mb-1.5 text-fg-3">分阶段目标</div>
          <div className="space-y-1">
            {phases.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-sm bg-bg-2 px-2 py-1 text-[11px]"
              >
                <span className="font-mono text-fg-3">{i + 1}.</span>
                <span className="num font-bold">+{(p.weight * 100).toFixed(0)}%</span>
                <span className="text-fg-2">· {p.condition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders preview */}
      <div className="mb-3">
        <div className="caps mb-1.5 text-fg-3">
          订单草稿 · {plan.executionPlan.orders.length} 条 · 入场 {plan.executionPlan.entryApproach}
        </div>
        <div className="space-y-0.5">
          {plan.executionPlan.orders.slice(0, 3).map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className={`rounded-xs px-1 py-0.5 text-[9px] font-bold ${
                  o.side === "BUY"
                    ? "bg-up-soft text-up-dark"
                    : "bg-down-soft text-down-dark"
                }`}
              >
                {o.side}
              </span>
              <span className="num font-semibold">{o.qty} 股</span>
              <span className="text-fg-3">·</span>
              <span className="text-fg-2">{o.orderType}</span>
              {o.price && (
                <span className="num text-fg-2">@ {o.price.toFixed(2)}</span>
              )}
              <span className="flex-1 text-fg-3">{o.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HITL confirm */}
      <div className="flex items-center gap-2 border-t border-hairline-strong pt-3">
        <span className="inline-flex items-center gap-1.5 rounded-xs bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
          <Sparkles size={10} /> HITL
        </span>
        <button className="rounded-sm bg-accent px-3 py-1.5 text-[11px] font-semibold text-white">
          确认生成
        </button>
        <button className="rounded-sm border border-hairline-strong px-3 py-1.5 text-[11px] text-fg-1">
          修改参数
        </button>
        <span className="flex-1" />
        <span className="text-[9px] text-fg-3">AI · 仅供参考</span>
      </div>
    </div>
  );
}

// ─── Simple dashed delimiter between editorial sections ───────────────
export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="kicker shrink-0 text-fg-2">{label}</span>
      <span className="h-px flex-1 bg-hairline-strong" />
    </div>
  );
}

// ─── Market direction indicator (mini) ─────────────────────────────────
export function DirectionIcon({ kind }: { kind: "up" | "down" | "flat" }) {
  if (kind === "up") return <TrendingUp size={12} className="text-up-dark" />;
  if (kind === "down") return <TrendingDown size={12} className="text-down-dark" />;
  return <Minus size={12} className="text-fg-3" />;
}

// ─── Confirmation chip (used inline to denote agreed state) ────────────
export function AgreedChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xs bg-up-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-up-dark">
      <CheckCircle2 size={10} /> {label}
    </span>
  );
}
