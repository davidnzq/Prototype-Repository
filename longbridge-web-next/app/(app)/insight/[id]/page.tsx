import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getSignalById,
  getSignalsByCatalyst,
  getSignalsBySymbol,
} from "@/mock/signals";
import { getCatalystById, getCatalystsBySymbol } from "@/mock/catalysts";
import { getStrategy } from "@/mock/strategies";
import { getSecurity } from "@/lib/universe";
import { Kicker } from "@/components/gallery/primitives";
import { CatalystRow, SignalRow, SectionHeader } from "@/components/gallery/shared";
import { methodOf, shortStrat, timeAgo } from "@/components/gallery/helpers";

export default async function InsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signal = getSignalById(id);
  const catalyst = getCatalystById(id);
  if (!signal && !catalyst) notFound();

  if (signal) return <SignalDetail signal={signal} />;
  if (catalyst) return <CatalystDetail catalyst={catalyst} />;
  return null;
}

// ─── Signal detail ─────────────────────────────────────────────────────
function SignalDetail({
  signal: s,
}: {
  signal: NonNullable<ReturnType<typeof getSignalById>>;
}) {
  const sec = getSecurity(s.symbol);
  const strat = getStrategy(s.strategyId);
  const relatedCatalysts = s.catalystIds
    .map(getCatalystById)
    .filter((c): c is NonNullable<typeof c> => !!c);
  const otherSignals = getSignalsBySymbol(s.symbol).filter(
    (x) => x.id !== s.id
  );

  const convCls =
    s.conviction === "HIGH"
      ? "bg-up-soft text-up-dark"
      : s.conviction === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";
  const upside = s.upsidePct;
  const upCls = upside >= 0 ? "text-up-dark" : "text-down-dark";

  // Valuation band 三锚点:stop / current / target
  // 当 upside >= 0 (BUY-like):stop 在 current 下方 ~8%(相对 currentPrice)
  // 当 upside < 0 (SELL/WATCH-like):stop 在 current 上方 ~8%
  const isLong = upside >= 0;
  const stopPrice = isLong ? s.currentPrice * 0.92 : s.currentPrice * 1.08;
  const downsideRaw = ((stopPrice - s.currentPrice) / s.currentPrice) * 100;
  const rewardRisk =
    Math.abs(downsideRaw) > 0.0001
      ? Math.abs(upside / downsideRaw)
      : null;
  const prices = [stopPrice, s.currentPrice, s.targetPrice];
  const lo = Math.min(...prices) * 0.96;
  const hi = Math.max(...prices) * 1.04;
  const span = hi - lo;
  const pctStop = ((stopPrice - lo) / span) * 100;
  const pctCur = ((s.currentPrice - lo) / span) * 100;
  const pctTgt = ((s.targetPrice - lo) / span) * 100;

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-[11px] text-fg-3">
        <Link
          href="/insights"
          className="hover:text-fg-1 inline-flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Insights
        </Link>
        <span>/</span>
        <span>Signal</span>
        <span>/</span>
        <span className="text-fg-2">{s.symbol}</span>
      </nav>

      {/* Header */}
      <header className="mb-6 border-b-2 border-fg-1 pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Kicker>SIGNAL</Kicker>
          <span className="text-[10px] text-fg-3">
            {s.symbol} · {sec?.nameZh ?? s.company}
          </span>
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
        <h1 className="font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          {s.oneLineConclusion}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-fg-2">
          <span>
            当前 <span className="num font-bold">${s.currentPrice.toFixed(2)}</span>
          </span>
          <span>
            目标 <span className="num font-bold">${s.targetPrice.toFixed(2)}</span>
          </span>
          <span className={`num font-bold ${upCls}`}>
            {upside >= 0 ? "+" : ""}
            {upside.toFixed(1)}%
          </span>
          <span>窗口 {s.horizon}</span>
          <span className="ml-auto">
            Action <span className="font-bold text-accent">{s.action}</span>
          </span>
        </div>
      </header>

      {/* Valuation band · 三锚点 stop/current/target */}
      <SectionHeader kicker="VALUATION · 估值带 · 止损 / 当前 / 目标" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <div className="relative h-10">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-hairline-strong" />
          {/* 风险带(current → stop)*/}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2"
            style={{
              left: `${Math.min(pctStop, pctCur)}%`,
              width: `${Math.abs(pctCur - pctStop)}%`,
              background: "var(--down-soft)",
            }}
          />
          {/* 上行带(current → target)*/}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2"
            style={{
              left: `${Math.min(pctCur, pctTgt)}%`,
              width: `${Math.abs(pctTgt - pctCur)}%`,
              background: isLong ? "var(--up-soft)" : "var(--down-soft)",
            }}
          />
          {/* Stop marker */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pctStop}%` }}
          >
            <div className="h-5 w-[3px] bg-down-dark" />
            <div className="num absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-down-dark">
              止损
            </div>
          </div>
          {/* Current marker */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pctCur}%` }}
          >
            <div className="h-5 w-[3px] bg-fg-1" />
            <div className="num absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-fg-1">
              当前
            </div>
          </div>
          {/* Target marker */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pctTgt}%` }}
          >
            <div
              className={`h-5 w-[3px] ${upside >= 0 ? "bg-up-dark" : "bg-down-dark"}`}
            />
            <div
              className={`num absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold ${upCls}`}
            >
              目标
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-hairline-strong pt-3 text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
              止损参考
            </div>
            <div className="num mt-0.5 font-bold text-down-dark">
              ${stopPrice.toFixed(2)}
            </div>
            <div className="text-[9px] text-fg-3">
              {downsideRaw >= 0 ? "+" : ""}
              {downsideRaw.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
              当前
            </div>
            <div className="num mt-0.5 font-bold text-fg-1">
              ${s.currentPrice.toFixed(2)}
            </div>
            <div className="text-[9px] text-fg-3">entry</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
              目标
            </div>
            <div className={`num mt-0.5 font-bold ${upCls}`}>
              ${s.targetPrice.toFixed(2)}
            </div>
            <div className={`text-[9px] font-semibold ${upCls}`}>
              {upside >= 0 ? "+" : ""}
              {upside.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
              风险回报比
            </div>
            <div className="num mt-0.5 font-bold">
              {rewardRisk ? `1 : ${rewardRisk.toFixed(1)}` : "—"}
            </div>
            <div className="text-[9px] text-fg-3">
              {rewardRisk && rewardRisk >= 2
                ? "优"
                : rewardRisk && rewardRisk >= 1.5
                ? "可接受"
                : "偏弱"}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-bg-2 px-3 py-2 text-[10px] leading-[15px] text-fg-3">
          止损位按 {isLong ? "当前价 -8%" : "当前价 +8%"} 估计,具体参数应按 Strategy rules 调整。风险回报比 ≥ 2 是常见入场门槛。
        </div>
      </section>

      {/* Thesis */}
      <SectionHeader kicker="THESIS · 3 条主论点" />
      <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
        <ol className="space-y-3">
          {s.thesis.map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="num shrink-0 pt-0.5 text-[14px] font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13px] leading-[20px] text-fg-1">{t}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Factor checklist */}
      <SectionHeader
        kicker={`FACTORS · ${s.factors.filter((f) => f.passed).length}/${s.factors.length} 通过`}
      />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <div className="space-y-2">
          {s.factors.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-[20px_1fr_120px_80px_60px] items-center gap-3 rounded-sm px-2 py-2 hover:bg-bg-2"
            >
              {f.passed ? (
                <CheckCircle2 size={16} className="text-up-dark" />
              ) : (
                <XCircle size={16} className="text-down-dark" />
              )}
              <div>
                <div className="text-[12px] font-semibold">{f.name}</div>
                <div className="text-[10px] text-fg-3">{f.category}</div>
              </div>
              <div className="text-[11px] text-fg-2">
                <span className="text-fg-3">阈值 </span>
                {f.threshold}
              </div>
              <div className="num text-right text-[11px] font-bold">
                {f.value}
              </div>
              <div className="text-right text-[10px] text-fg-3">
                w {(f.weight * 100).toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risks */}
      <SectionHeader kicker="RISKS · 风险" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <ul className="space-y-2">
          {s.risks.map((r, i) => (
            <li
              key={i}
              className="flex gap-2 border-l-2 border-warn pl-3 text-[12px] leading-[18px] text-fg-1"
            >
              <span className="text-warn">⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Personalization */}
      {s.personalization && (
        <section className="mb-8 rounded-md bg-bg-2 p-4">
          <div className="caps mb-1 text-accent">画像适配</div>
          <p className="text-[12px] leading-[18px] text-fg-1">
            {s.personalization}
          </p>
        </section>
      )}

      {/* Related Catalysts */}
      {relatedCatalysts.length > 0 && (
        <>
          <SectionHeader kicker="UNDERLYING CATALYSTS · 依据事实" />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
            <div className="divide-y divide-hairline-strong">
              {relatedCatalysts.map((c) => (
                <CatalystRow key={c.id} c={c} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Alt Strategy views */}
      {otherSignals.length > 0 && (
        <>
          <SectionHeader
            kicker="ALT STRATEGY · 同股他视角"
            linkHref={`/stock/${encodeURIComponent(s.symbol)}`}
            linkLabel={`查看 ${s.symbol} →`}
          />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
            <div className="divide-y divide-hairline-strong">
              {otherSignals.map((x) => (
                <SignalRow key={x.id} s={x} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* CTA: generate Trade Plan */}
      <section className="mb-6 rounded-lg border-2 border-accent bg-bg-1 p-5">
        <div className="kicker mb-1 text-accent">NEXT · 下一步</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-serif text-[20px] font-bold leading-[26px]">
              把 Signal 变成 Trade Plan
            </div>
            <p className="mt-1 text-[12px] text-fg-2">
              由当前 Signal 生成 Target Plan + Execution Plan 草稿,关键节点 HITL 确认。
            </p>
          </div>
          <div className="shrink-0 text-[10px] text-fg-3">
            右侧 AI 里说「生成 Plan」即可
          </div>
        </div>
      </section>

      {/* Meta footer */}
      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        Strategy: {strat?.nameZh} · {strat?.name} · StrategyFit {s.strategyFitScore}/100
        <br />
        AI 产物 · 仅供参考 · 最终决策由你自己做
      </footer>
    </div>
  );
}

// Heuristic unit inference for Catalyst factors — name-based.
// Most mock factors are percentages (YoY, growth, margin, beat rate).
function formatCatalystFactor(
  name: string,
  value: number,
  delta: number
): { value: string; delta: string } {
  const n = name.toLowerCase();
  const isPercent =
    /yoy|growth|margin|beat|ratio|%|pct|回报|增速|率|分位/i.test(name) ||
    n.includes("rate");
  const isBps = /bp|bps|基点/i.test(name);
  const unit = isBps ? "bp" : isPercent ? "%" : "";
  const fmt = (v: number) =>
    `${v >= 0 && delta !== v ? "" : ""}${v.toFixed(Math.abs(v) < 10 ? 1 : 0)}${unit}`;
  return {
    value: `${value.toFixed(Math.abs(value) < 10 ? 1 : 0)}${unit}`,
    delta: `${delta >= 0 ? "+" : ""}${fmt(delta)}`,
  };
}

// ─── Catalyst detail ───────────────────────────────────────────────────
function CatalystDetail({
  catalyst: c,
}: {
  catalyst: NonNullable<ReturnType<typeof getCatalystById>>;
}) {
  const sec = getSecurity(c.symbol);
  const relatedSignals = getSignalsByCatalyst(c.id);
  const otherCatalysts = getCatalystsBySymbol(c.symbol).filter(
    (x) => x.id !== c.id
  );

  const dirSym =
    c.factualDirection === "positive"
      ? "+"
      : c.factualDirection === "negative"
      ? "−"
      : c.factualDirection === "mixed"
      ? "±"
      : "·";
  const dirLabel =
    c.factualDirection === "positive"
      ? "方向 · 正向"
      : c.factualDirection === "negative"
      ? "方向 · 负向"
      : c.factualDirection === "mixed"
      ? "方向 · 混合"
      : "方向 · 中性";

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-[11px] text-fg-3">
        <Link
          href="/insights"
          className="hover:text-fg-1 inline-flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Insights
        </Link>
        <span>/</span>
        <span>Catalyst</span>
        <span>/</span>
        <span className="text-fg-2">{c.symbol}</span>
      </nav>

      {/* Header */}
      <header className="mb-6 border-b-2 border-fg-1 pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Kicker>CATALYST</Kicker>
          <span className="text-[10px] text-fg-3">
            {c.symbol} · {sec?.nameZh ?? c.company}
          </span>
          <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[10px] font-semibold text-fg-2">
            {c.type.replace(/_/g, " ")}
          </span>
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${
              c.significance === "HIGH"
                ? "bg-down-soft text-down-dark"
                : c.significance === "MEDIUM"
                ? "bg-warn/15 text-warn"
                : "bg-bg-3 text-fg-2"
            }`}
          >
            {c.significance}
          </span>
          <span className="num text-[11px] font-bold text-fg-1">
            {dirSym}
          </span>
          <span className="text-[10px] text-fg-3">{dirLabel}</span>
          <span className="text-[10px] text-fg-3">· {timeAgo(c.generatedAt)}</span>
        </div>
        <h1 className="font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          {c.title}
        </h1>
        <p className="mt-2 text-[14px] leading-[20px] text-fg-2">{c.subtitle}</p>
      </header>

      {/* Summary */}
      <SectionHeader kicker="SUMMARY · 事实摘要" />
      <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
        <p className="text-[13px] leading-[21px] text-fg-1">{c.summary}</p>
      </section>

      {/* ELI5 */}
      <SectionHeader kicker="ELI5 · 换句话说" />
      <section className="mb-8 rounded-lg bg-bg-2 p-4">
        <p className="text-[13px] leading-[21px] text-fg-1">{c.eli5}</p>
      </section>

      {/* Highlights */}
      <SectionHeader kicker="HIGHLIGHTS · 关键点" />
      <section className="mb-8 grid grid-cols-2 gap-2">
        {c.highlights.map((h, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2.5"
          >
            <span className="num mt-0.5 text-[11px] font-bold text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[12px] leading-[17px]">{h}</span>
          </div>
        ))}
      </section>

      {/* Factors */}
      {c.factors.length > 0 && (
        <>
          <SectionHeader kicker="FACTORS · 量化维度" />
          <section className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-hairline-strong bg-bg-1 p-4 md:grid-cols-4">
            {c.factors.map((f, i) => {
              const { value, delta } = formatCatalystFactor(f.name, f.value, f.delta);
              return (
                <div key={i}>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
                    {f.name}
                  </div>
                  <div
                    className={`num mt-0.5 text-[18px] font-bold ${
                      f.direction === "positive"
                        ? "text-up-dark"
                        : f.direction === "negative"
                        ? "text-down-dark"
                        : "text-fg-1"
                    }`}
                  >
                    {value}
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      f.direction === "positive"
                        ? "text-up-dark"
                        : f.direction === "negative"
                        ? "text-down-dark"
                        : "text-fg-3"
                    }`}
                  >
                    Δ {delta}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* Related Signals */}
      {relatedSignals.length > 0 && (
        <>
          <SectionHeader kicker={`DERIVED SIGNALS · ${relatedSignals.length} 条机会解读`} />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
            <div className="divide-y divide-hairline-strong">
              {relatedSignals.map((s) => (
                <SignalRow key={s.id} s={s} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Other catalysts on same symbol */}
      {otherCatalysts.length > 0 && (
        <>
          <SectionHeader
            kicker={`MORE ON ${c.symbol}`}
            linkHref={`/stock/${encodeURIComponent(c.symbol)}`}
            linkLabel={`${c.symbol} →`}
          />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
            <div className="divide-y divide-hairline-strong">
              {otherCatalysts.slice(0, 3).map((x) => (
                <CatalystRow key={x.id} c={x} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Sources */}
      <SectionHeader kicker="SOURCES · 来源" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <ul className="space-y-2">
          {c.sources.map((src, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-[12px] text-fg-1"
            >
              <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-fg-2">
                {src.kind}
              </span>
              <span className="flex-1">{src.title}</span>
              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        Catalyst ID: {c.id} · 事实强度 {(c.factualStrength * 100).toFixed(0)}/100
        <br />
        客观事实 · 不含买卖判断 · Signal 是在事实之上的策略解读
      </footer>
    </div>
  );
}

