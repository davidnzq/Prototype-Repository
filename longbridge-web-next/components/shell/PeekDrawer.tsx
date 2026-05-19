"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { getSignalById, getSignalsBySymbol } from "@/mock/signals";
import { getCatalystById, getCatalystsBySymbol } from "@/mock/catalysts";
import { getSecurity, type DemoSecurity } from "@/lib/universe";
import { MOCK_USER } from "@/mock/portfolio";
import { getTradePlansBySymbol, getTradePlanById } from "@/mock/tradePlans";
import { getFundamentals } from "@/mock/fundamentals";
import { getStrategy } from "@/mock/strategies";
import {
  methodOf,
  shortStrat,
  timeAgo,
} from "@/components/gallery/helpers";

/**
 * PeekDrawer — right-side drawer within the MIDDLE column when
 * URL has `?peek=<signalId|catalystId>`. Never covers the right AI chat.
 *
 * 从中栏右缘滑入的抽屉 · 占中栏宽度 ~72%,左边 home 部分可见(dim)·
 * 关闭时完整回到 home,滚动/状态不丢。右栏 AI chat 是 <main> 外的 sibling,
 * 永远露出,"边看边聊"零摩擦。
 */
export function PeekDrawer() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const peekId = params.get("peek");

  const closePeek = useCallback(() => {
    const p = new URLSearchParams(params.toString());
    p.delete("peek");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  // ESC to close
  useEffect(() => {
    if (!peekId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePeek();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [peekId, closePeek]);

  const payload = useMemo<PeekPayload | null>(() => {
    if (!peekId) return null;
    if (peekId.startsWith("sig-")) {
      const signal = getSignalById(peekId);
      if (signal) return { kind: "signal", signal };
    }
    if (peekId.startsWith("cat-")) {
      const catalyst = getCatalystById(peekId);
      if (catalyst) return { kind: "catalyst", catalyst };
    }
    if (peekId.startsWith("plan-")) {
      const plan = getTradePlanById(peekId);
      if (plan) return { kind: "plan", plan };
    }
    if (peekId.startsWith("news:")) {
      // format: news:<symbol>:<encoded-id>
      const rest = peekId.slice("news:".length);
      const firstColon = rest.indexOf(":");
      if (firstColon > 0) {
        const symbol = rest.slice(0, firstColon);
        const newsId = decodeURIComponent(rest.slice(firstColon + 1));
        return { kind: "news", symbol, newsId };
      }
    }
    // Stock peek:symbol with `.` suffix(NVDA.US / 700.HK / ...)
    if (peekId.includes(".")) {
      const security = getSecurity(peekId);
      if (security) return { kind: "stock", security };
    }
    return null;
  }, [peekId]);

  if (!peekId || !payload) return null;

  return (
    // 右侧抽屉:absolute 在 <main> 内部,右边对齐。右栏 AI 是 <main>
    // 外的 sibling,永远露出。
    <div
      className="absolute inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Peek 详情"
    >
      {/* Backdrop — 点击关闭,只覆盖中栏 */}
      <button
        type="button"
        onClick={closePeek}
        aria-label="关闭 peek"
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      {/* Drawer — 中栏右缘滑入 72% 宽 */}
      <aside className="peek-drawer-slide relative z-10 flex h-full w-[72%] min-w-[520px] flex-col border-l border-hairline-strong bg-bg-1 shadow-[-12px_0_32px_rgba(0,0,0,0.12)]">
        <PeekHeader payload={payload} onClose={closePeek} />

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {payload.kind === "signal" ? (
            <SignalPeekBody signal={payload.signal} />
          ) : payload.kind === "catalyst" ? (
            <CatalystPeekBody catalyst={payload.catalyst} />
          ) : payload.kind === "stock" ? (
            <StockPeekBody security={payload.security} />
          ) : payload.kind === "plan" ? (
            <PlanPeekBody plan={payload.plan} />
          ) : (
            <NewsPeekBody symbol={payload.symbol} newsId={payload.newsId} />
          )}
        </div>

        <PeekFooter peekId={peekId} payload={payload} onClose={closePeek} />
      </aside>
    </div>
  );
}

interface NewsLike {
  id: string;
  title: string;
  description?: string;
  url?: string;
  publishedAt: string;
}

type PeekPayload =
  | { kind: "signal"; signal: NonNullable<ReturnType<typeof getSignalById>> }
  | { kind: "catalyst"; catalyst: NonNullable<ReturnType<typeof getCatalystById>> }
  | { kind: "stock"; security: DemoSecurity }
  | { kind: "plan"; plan: NonNullable<ReturnType<typeof getTradePlanById>> }
  | { kind: "news"; symbol: string; newsId: string };

// ─── Header ─────────────────────────────────────────────────────────────
function PeekHeader({
  payload,
  onClose,
}: {
  payload: PeekPayload;
  onClose: () => void;
}) {
  const kicker =
    payload.kind === "signal"
      ? "SIGNAL PEEK"
      : payload.kind === "catalyst"
      ? "CATALYST PEEK"
      : payload.kind === "stock"
      ? "STOCK PEEK"
      : payload.kind === "plan"
      ? "PLAN PEEK"
      : payload.kind === "news"
      ? "NEWS PEEK"
      : "PEEK";
  const symbol =
    payload.kind === "signal"
      ? payload.signal.symbol
      : payload.kind === "catalyst"
      ? payload.catalyst.symbol
      : payload.kind === "stock"
      ? payload.security.symbol
      : payload.kind === "plan"
      ? payload.plan.symbol
      : payload.kind === "news"
      ? payload.symbol
      : "";
  const sec = getSecurity(symbol);
  return (
    <header className="flex items-center gap-2 border-b border-hairline-strong px-5 py-3">
      <span className="kicker text-accent">{kicker}</span>
      <span className="text-[11px] text-fg-3">
        {symbol} · {sec?.nameZh ?? ""}
      </span>
      <span className="ml-auto flex items-center gap-1 text-[10px] text-fg-3">
        <kbd className="rounded border border-hairline-strong bg-bg-2 px-1 py-0.5 font-mono text-[9px]">
          ESC
        </kbd>
        <span>关闭</span>
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="rounded p-1 text-fg-3 hover:bg-bg-2 hover:text-fg-1"
      >
        <X size={16} />
      </button>
    </header>
  );
}

// ─── Signal body ───────────────────────────────────────────────────────
function SignalPeekBody({
  signal: s,
}: {
  signal: NonNullable<ReturnType<typeof getSignalById>>;
}) {
  const isLong = s.upsidePct >= 0;
  const upCls = isLong ? "text-up-dark" : "text-down-dark";
  const convCls =
    s.conviction === "HIGH"
      ? "bg-up-soft text-up-dark"
      : s.conviction === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="border-b border-hairline-strong pb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${convCls}`}
          >
            {s.conviction} · {s.convictionScore}
          </span>
          <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[10px] font-semibold text-fg-2">
            {shortStrat(s.strategyName)} · {methodOf(s.strategyName)}
          </span>
          <span className="text-[10px] text-fg-3">· {timeAgo(s.issuedAt)}</span>
        </div>
        <h2 className="font-serif text-[22px] leading-[28px] font-bold tracking-[-0.015em]">
          {s.oneLineConclusion}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-fg-2">
          <span>
            当前 <span className="num font-bold">${s.currentPrice.toFixed(2)}</span>
          </span>
          <span>
            目标 <span className="num font-bold">${s.targetPrice.toFixed(2)}</span>
          </span>
          <span className={`num font-bold ${upCls}`}>
            {s.upsidePct >= 0 ? "+" : ""}
            {s.upsidePct.toFixed(1)}%
          </span>
          <span className="text-fg-3">窗口 {s.horizon}</span>
          <span className="ml-auto">
            Action <span className="font-bold text-accent">{s.action}</span>
          </span>
        </div>
      </div>

      {/* Thesis */}
      <section>
        <div className="kicker mb-2 text-accent">THESIS · {s.thesis.length} 条主论点</div>
        <ol className="space-y-2 rounded-md border-l-4 border-accent bg-bg-1 p-3">
          {s.thesis.map((t, i) => (
            <li key={i} className="flex gap-2.5 text-[12.5px] leading-[19px]">
              <span className="num shrink-0 pt-0.5 text-[12px] font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-fg-1">{t}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Factors compressed */}
      <section>
        <div className="kicker mb-2 text-accent">
          FACTORS · {s.factors.filter((f) => f.passed).length}/{s.factors.length} 通过
        </div>
        <div className="divide-y divide-hairline-strong rounded-md border border-hairline-strong bg-bg-1">
          {s.factors.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-[18px_1fr_auto] items-center gap-3 px-3 py-2 text-[11.5px]"
            >
              {f.passed ? (
                <CheckCircle2 size={14} className="text-up-dark" />
              ) : (
                <XCircle size={14} className="text-down-dark" />
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{f.name}</div>
                <div className="text-[9px] text-fg-3">
                  {f.category} · 阈值 {f.threshold}
                </div>
              </div>
              <div className="num text-right text-[11px] font-bold">
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risks */}
      <section>
        <div className="kicker mb-2 text-accent">RISKS · 风险</div>
        <ul className="space-y-1.5">
          {s.risks.map((r, i) => (
            <li
              key={i}
              className="flex gap-2 border-l-2 border-warn bg-warn/5 pl-3 pr-2 py-1.5 text-[12px] leading-[18px] text-fg-1"
            >
              <span className="shrink-0 text-warn">⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Personalization */}
      {s.personalization && (
        <section className="rounded-md bg-bg-2 p-3">
          <div className="caps mb-1 text-accent">画像适配</div>
          <p className="text-[12px] leading-[18px] text-fg-1">
            {s.personalization}
          </p>
        </section>
      )}
    </div>
  );
}

// ─── Catalyst body ─────────────────────────────────────────────────────
function CatalystPeekBody({
  catalyst: c,
}: {
  catalyst: NonNullable<ReturnType<typeof getCatalystById>>;
}) {
  const dirLabel =
    c.factualDirection === "positive"
      ? { sym: "+", cls: "text-up-dark" }
      : c.factualDirection === "negative"
      ? { sym: "−", cls: "text-down-dark" }
      : c.factualDirection === "mixed"
      ? { sym: "±", cls: "text-warn" }
      : { sym: "·", cls: "text-fg-3" };
  const sigCls =
    c.significance === "HIGH"
      ? "bg-down-soft text-down-dark"
      : c.significance === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="border-b border-hairline-strong pb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[10px] font-semibold text-fg-2">
            {c.type.replace(/_/g, " ")}
          </span>
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${sigCls}`}
          >
            {c.significance}
          </span>
          <span className={`num text-[13px] font-bold ${dirLabel.cls}`}>
            {dirLabel.sym}
          </span>
          <span className="text-[10px] text-fg-3">· {timeAgo(c.generatedAt)}</span>
        </div>
        <h2 className="font-serif text-[22px] leading-[28px] font-bold tracking-[-0.015em]">
          {c.title}
        </h2>
        <p className="mt-2 text-[13px] leading-[19px] text-fg-2">{c.subtitle}</p>
      </div>

      {/* Summary */}
      <section>
        <div className="kicker mb-2 text-accent">SUMMARY · 事实摘要</div>
        <p className="rounded-md border-l-4 border-accent bg-bg-1 p-3 text-[12.5px] leading-[20px] text-fg-1">
          {c.summary}
        </p>
      </section>

      {/* ELI5 */}
      <section>
        <div className="kicker mb-2 text-accent">ELI5 · 换句话说</div>
        <p className="rounded-md bg-bg-2 p-3 text-[12.5px] leading-[20px] text-fg-1">
          {c.eli5}
        </p>
      </section>

      {/* Highlights */}
      <section>
        <div className="kicker mb-2 text-accent">HIGHLIGHTS · 关键点</div>
        <div className="grid grid-cols-2 gap-2">
          {c.highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2"
            >
              <span className="num mt-0.5 text-[11px] font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[11.5px] leading-[17px]">{h}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Footer — actions ───────────────────────────────────────────────────
function PeekFooter({
  peekId,
  payload,
  onClose,
}: {
  peekId: string;
  payload: PeekPayload;
  onClose: () => void;
}) {
  // news 的"打开完整页"是外链(longport 资讯本身无详情页)
  const fullHref =
    payload.kind === "stock"
      ? `/stock/${encodeURIComponent(peekId)}`
      : payload.kind === "plan"
      ? `/plan/${peekId}`
      : payload.kind === "news"
      ? null
      : `/insight/${peekId}`;
  const kindLabel =
    payload.kind === "signal"
      ? "Signal"
      : payload.kind === "catalyst"
      ? "Catalyst"
      : payload.kind === "stock"
      ? "Stock"
      : payload.kind === "plan"
      ? "Plan"
      : "News";
  return (
    <footer className="flex items-center gap-2 border-t border-hairline-strong px-5 py-3">
      {fullHref && (
        <Link
          href={fullHref}
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] font-semibold text-fg-1 hover:border-accent"
        >
          <ExternalLink size={12} /> 打开完整页
        </Link>
      )}
      <div className="ml-auto flex items-center gap-2 rounded-md bg-bg-2 px-3 py-1.5 text-[11px] text-fg-2">
        <MessageCircle size={12} className="text-accent" />
        <span>右栏 AI 已经就位({kindLabel}),直接打字追问。</span>
      </div>
    </footer>
  );
}

// ─── Plan peek body · Target / Progress / Invalidation / Orders 简版 ──
function PlanPeekBody({
  plan,
}: {
  plan: NonNullable<ReturnType<typeof getTradePlanById>>;
}) {
  const sec = getSecurity(plan.symbol);
  const strat = getStrategy(plan.strategyId);
  const signal = getSignalById(plan.signalId);
  const progress =
    plan.targetPlan.targetWeight > 0
      ? (plan.targetPlan.currentWeight / plan.targetPlan.targetWeight) * 100
      : 0;
  const statusCls =
    plan.status === "ACTIVE"
      ? "bg-up-soft text-up-dark"
      : plan.status === "DRAFT" || plan.status === "PENDING"
      ? "bg-warn/15 text-warn"
      : "bg-bg-2 text-fg-2";

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="border-b border-hairline-strong pb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${statusCls}`}
          >
            {plan.status}
          </span>
          <span className="text-[11px] text-fg-3">
            {plan.symbol} · {sec?.nameZh ?? ""}
          </span>
          {strat && (
            <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[10px] font-semibold text-fg-2">
              {strat.nameZh}
            </span>
          )}
          <span className="text-[10px] text-fg-3">
            · 创建 {new Date(plan.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <h2 className="font-serif text-[24px] leading-[30px] font-bold tracking-[-0.015em]">
          {plan.targetPlan.action} · 目标仓位 {(plan.targetPlan.targetWeight * 100).toFixed(0)}%
        </h2>
        {signal && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-[18px] text-fg-2">
            依据:{signal.oneLineConclusion}
          </p>
        )}
      </div>

      {/* Target · Progress · Window */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
            目标 / 当前
          </div>
          <div className="num mt-1 text-[18px] font-bold">
            {(plan.targetPlan.targetWeight * 100).toFixed(0)}%
            <span className="ml-1 text-[12px] text-fg-3">
              / {(plan.targetPlan.currentWeight * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-bg-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
            窗口
          </div>
          <div className="num mt-1 text-[18px] font-bold">
            {plan.targetPlan.window}
          </div>
          <div className="mt-1 text-[9px] text-fg-3">从创建起算</div>
        </div>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
            订单
          </div>
          <div className="num mt-1 text-[18px] font-bold">
            {plan.executionPlan.orders.length} 条
          </div>
          <div className="mt-1 text-[9px] text-fg-3">草稿</div>
        </div>
      </section>

      {/* Invalidation */}
      <section className="rounded-md border-l-4 border-warn bg-warn/10 p-3">
        <div className="text-[9px] uppercase tracking-[0.08em] text-warn">
          INVALIDATION · 证伪条件
        </div>
        <p className="mt-1 text-[12.5px] leading-[19px] text-fg-1">
          {plan.targetPlan.invalidation}
        </p>
      </section>

      {/* Risk boundary */}
      <section>
        <div className="kicker mb-2 text-accent">RISK · 风险边界</div>
        <p className="rounded-md border border-hairline-strong bg-bg-1 p-3 text-[12.5px] leading-[19px] text-fg-1">
          {plan.targetPlan.riskBoundary}
        </p>
      </section>

      {/* Orders compact */}
      {plan.executionPlan.orders.length > 0 && (
        <section>
          <div className="kicker mb-2 text-accent">
            ORDERS · {plan.executionPlan.orders.length} 条
          </div>
          <div className="divide-y divide-hairline-strong rounded-md border border-hairline-strong bg-bg-1">
            {plan.executionPlan.orders.map((o) => {
              const isStop = o.orderType === "STOP";
              return (
                <div
                  key={o.id}
                  className={`flex items-center gap-2 px-3 py-2 text-[11.5px] ${
                    isStop ? "bg-down-soft/20" : ""
                  }`}
                >
                  <span
                    className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${
                      isStop
                        ? "bg-down-soft text-down-dark"
                        : o.side === "BUY"
                        ? "bg-up-soft text-up-dark"
                        : "bg-down-soft text-down-dark"
                    }`}
                  >
                    {isStop ? "STOP" : o.side}
                  </span>
                  <span className="num font-semibold">{o.qty} 股</span>
                  <span className="text-fg-3">·</span>
                  <span className="text-fg-2">{o.orderType}</span>
                  {o.price != null && (
                    <span className="num text-fg-2">
                      @ ${o.price.toFixed(2)}
                    </span>
                  )}
                  <span className="line-clamp-1 flex-1 text-[10px] text-fg-3">
                    {o.triggerCondition ?? o.note ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* HITL hint */}
      <div className="rounded-md bg-bg-2 px-3 py-2 text-[11px] leading-[17px] text-fg-2">
        涉及资金的关键节点走 HITL · AI 不自动下单 · 完整 timeline / phases / checkpoints 在&ldquo;打开完整页&rdquo;。
      </div>
    </div>
  );
}

// ─── News peek body · async fetch from /api/news ───────────────────────
function NewsPeekBody({ symbol, newsId }: { symbol: string; newsId: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ok"; item: NewsLike }
    | { status: "not-found" }
    | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    fetch(`/api/news?symbol=${encodeURIComponent(symbol)}&limit=20`)
      .then((r) => r.json())
      .then((data: { items?: NewsLike[] }) => {
        if (cancelled) return;
        const items = data.items ?? [];
        const found = items.find((it) => it.id === newsId);
        if (found) setState({ status: "ok", item: found });
        else setState({ status: "not-found" });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, newsId]);

  if (state.status === "loading") {
    return (
      <div className="flex h-40 items-center justify-center text-[12px] text-fg-3">
        加载中…
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="rounded-md border-l-4 border-down bg-down-soft/20 p-3 text-[12px] text-fg-1">
        加载失败:{state.message}
      </div>
    );
  }
  if (state.status === "not-found") {
    return (
      <div className="rounded-md bg-bg-2 p-4 text-[12px] leading-[18px] text-fg-2">
        这条新闻已不在 {symbol} 的最新 20 条列表里。它可能已经被更新的内容顶下去了。
      </div>
    );
  }
  const item = state.item;
  const when = new Date(item.publishedAt);
  // eslint-disable-next-line react-hooks/purity
  const age = Date.now() - when.getTime();
  const ageLabel =
    age < 3600_000
      ? `${Math.max(1, Math.floor(age / 60_000))} 分钟前`
      : age < 86400_000
      ? `${Math.floor(age / 3600_000)} 小时前`
      : `${Math.floor(age / 86400_000)} 天前`;
  return (
    <div className="space-y-4">
      <div className="border-b border-hairline-strong pb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-fg-3">
          <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 font-semibold uppercase tracking-[0.08em] text-fg-2">
            NEWS
          </span>
          <span>{symbol}</span>
          <span>·</span>
          <span>{ageLabel}</span>
          <span>·</span>
          <span>{when.toLocaleString("zh-CN")}</span>
        </div>
        <h2 className="font-serif text-[22px] leading-[30px] font-bold tracking-[-0.015em]">
          {item.title}
        </h2>
      </div>
      {item.description && (
        <section>
          <div className="kicker mb-2 text-accent">SUMMARY · 摘要</div>
          <p className="rounded-md border-l-4 border-accent bg-bg-1 p-4 text-[13px] leading-[21px] text-fg-1">
            {item.description}
          </p>
        </section>
      )}
      {item.url && (
        <section>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2 text-[12px] font-semibold text-accent hover:border-accent"
          >
            <ExternalLink size={12} /> 查看原文 ↗
          </a>
        </section>
      )}
      <div className="rounded-md bg-bg-2 px-3 py-2 text-[11px] leading-[17px] text-fg-2">
        右栏 AI 可以帮你把这条消息放到 {symbol} 的上下文里 —— 是不是已有 Catalyst 覆盖?
        对当前 Signal / Plan 有没有实质影响?
      </div>
    </div>
  );
}

// ─── Stock peek body ───────────────────────────────────────────────────
function StockPeekBody({ security: s }: { security: DemoSecurity }) {
  const f = getFundamentals(s.symbol);
  const sigs = getSignalsBySymbol(s.symbol);
  const cats = getCatalystsBySymbol(s.symbol).slice(0, 3);
  const plans = getTradePlansBySymbol(s.symbol);
  const holding = MOCK_USER.holdings.find((h) => h.symbol === s.symbol);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="border-b border-hairline-strong pb-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
              s.coverage === "deep"
                ? "bg-accent/10 text-accent"
                : "bg-bg-2 text-fg-3"
            }`}
          >
            {s.coverage === "deep" ? "DEEP COVERAGE" : "LIGHT COVERAGE"}
          </span>
          <span className="text-[10px] text-fg-3">
            {s.market} · {s.sector}
          </span>
          {s.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] text-fg-2"
            >
              {t}
            </span>
          ))}
        </div>
        <h2 className="font-serif text-[28px] leading-[34px] font-bold tracking-[-0.02em]">
          {s.nameZh}
          <span className="ml-3 text-[14px] font-sans font-normal text-fg-2">
            {s.name} · {s.symbol}
          </span>
        </h2>
      </div>

      {/* KEY STATS */}
      {f && (
        <section>
          <div className="kicker mb-2 text-accent">KEY STATS · 关键指标</div>
          <div className="grid grid-cols-4 gap-3">
            <MiniStat
              label="市值"
              value={
                f.marketCap >= 1000
                  ? `$${(f.marketCap / 1000).toFixed(2)}T`
                  : `$${f.marketCap.toFixed(0)}B`
              }
            />
            <MiniStat label="P/E" value={f.peRatio.toFixed(1)} />
            <MiniStat
              label="股息率"
              value={f.dividendYield > 0 ? `${f.dividendYield.toFixed(2)}%` : "—"}
            />
            <MiniStat
              label="52W 区间"
              value={`$${f.week52Low.toFixed(0)}–$${f.week52High.toFixed(0)}`}
            />
          </div>
        </section>
      )}

      {/* MY POSITION */}
      {holding && (
        <section className="rounded-lg border-2 border-accent bg-bg-1 p-3">
          <div className="kicker mb-2 text-accent">MY POSITION · 我持有</div>
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
                持仓
              </div>
              <div className="num mt-0.5 font-bold">
                {holding.shares} 股 @ ${holding.avgCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
                占比
              </div>
              <div className="num mt-0.5 font-bold">
                {/* 我们没有实时 weight,但能粗略根据 MOCK_USER.totalAssets 算 */}
                {((holding.shares * holding.avgCost) / MOCK_USER.totalAssets * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
                角色
              </div>
              <div className="mt-0.5 text-[11px] leading-[15px] text-fg-1">
                {s.tags.includes("mega-cap") ? "核心仓位" : "卫星仓位"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SIGNALS */}
      {sigs.length > 0 && (
        <section>
          <div className="kicker mb-2 text-accent">
            SIGNALS · {sigs.length} 个视角
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sigs.map((sig) => {
              const convCls =
                sig.conviction === "HIGH"
                  ? "bg-up-soft text-up-dark"
                  : sig.conviction === "MEDIUM"
                  ? "bg-warn/15 text-warn"
                  : "bg-bg-3 text-fg-2";
              const borderCls =
                sig.conviction === "HIGH"
                  ? "border-up"
                  : sig.conviction === "MEDIUM"
                  ? "border-warn"
                  : "border-hairline-strong";
              return (
                <Link
                  key={sig.id}
                  href={`?peek=${sig.id}`}
                  scroll={false}
                  className={`block rounded-md border-l-4 ${borderCls} bg-bg-1 p-3 hover:bg-bg-2`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.08em]">
                    <span className="font-semibold text-accent">
                      {shortStrat(sig.strategyName)}
                    </span>
                    <span className="text-fg-3">{methodOf(sig.strategyName)}</span>
                    <span
                      className={`ml-auto rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${convCls}`}
                    >
                      {sig.conviction}
                    </span>
                    <span
                      className={`num text-[11px] font-bold ${
                        sig.upsidePct >= 0 ? "text-up-dark" : "text-down-dark"
                      }`}
                    >
                      {sig.upsidePct >= 0 ? "+" : ""}
                      {sig.upsidePct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="line-clamp-2 text-[12.5px] leading-[18px] font-semibold text-fg-1">
                    {sig.oneLineConclusion}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PLANS */}
      {plans.length > 0 && (
        <section>
          <div className="kicker mb-2 text-accent">
            PLANS · {plans.length} 个计划
          </div>
          <div className="space-y-1.5">
            {plans.map((p) => (
              <Link
                key={p.id}
                href={`?peek=${p.id}`}
                className="flex items-center gap-2 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2 text-[11.5px] hover:bg-bg-2"
              >
                <span
                  className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${
                    p.status === "ACTIVE"
                      ? "bg-up-soft text-up-dark"
                      : "bg-warn/15 text-warn"
                  }`}
                >
                  {p.status}
                </span>
                <span className="font-semibold">
                  {p.targetPlan.action} · 目标 {(p.targetPlan.targetWeight * 100).toFixed(0)}% / 当前 {(p.targetPlan.currentWeight * 100).toFixed(0)}%
                </span>
                <span className="ml-auto text-[10px] text-fg-3">
                  {p.targetPlan.window}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Catalysts */}
      {cats.length > 0 && (
        <section>
          <div className="kicker mb-2 text-accent">
            RECENT CATALYSTS · 近 {cats.length} 条事实
          </div>
          <div className="space-y-1.5">
            {cats.map((c) => {
              const dirCls =
                c.factualDirection === "positive"
                  ? "border-l-up"
                  : c.factualDirection === "negative"
                  ? "border-l-down"
                  : c.factualDirection === "mixed"
                  ? "border-l-warn"
                  : "border-l-fg-3";
              return (
                <Link
                  key={c.id}
                  href={`?peek=${c.id}`}
                  scroll={false}
                  className={`block border-l-4 ${dirCls} bg-bg-1 px-3 py-2 hover:bg-bg-2`}
                >
                  <div className="text-[9px] uppercase tracking-[0.1em] text-fg-3">
                    {c.type.replace(/_/g, " ")} · {c.significance} · {timeAgo(c.generatedAt)}
                  </div>
                  <div className="mt-0.5 font-serif text-[13px] leading-[17px] font-semibold">
                    {c.title}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Hint */}
      <div className="rounded-md bg-bg-2 px-3 py-2 text-[10px] text-fg-3">
        <TrendingUp size={10} className="mr-1 inline text-accent" />
        完整行情 / 90 日走势 / 同行业对比 / 新闻,在「打开完整页」里。
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
        {label}
      </div>
      <div className="num mt-0.5 text-[13px] font-bold">{value}</div>
    </div>
  );
}
