import Link from "next/link";
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { getReviewById } from "@/mock/reviews";
import { getSignalById } from "@/mock/signals";
import { getTradePlanById } from "@/mock/tradePlans";
import { getSecurity } from "@/lib/universe";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";
import { ReviewReflectionEditor } from "./ReviewReflectionEditor";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = getReviewById(id);
  if (!r) notFound();

  const signal = getSignalById(r.signalId);
  const plan = getTradePlanById(r.planId);
  const sec = getSecurity(r.symbol);
  const vsBench = r.performance.realizedPnlPct - r.performance.benchmarkReturn;

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <nav className="mb-4 flex items-center gap-2 text-[11px] text-fg-3">
        <Link
          href="/review"
          className="hover:text-fg-1 inline-flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Review
        </Link>
        <span>/</span>
        <span className="text-fg-2">{r.symbol}</span>
      </nav>

      <header className="mb-8 border-b-2 border-fg-1 pb-5">
        <div className="mb-2 flex items-center gap-2">
          <Kicker>TRADE REVIEW</Kicker>
          <span className="text-[10px] text-fg-3">
            {r.symbol} · {sec?.nameZh ?? ""}
          </span>
          <span className="text-[10px] text-fg-3">
            · 平仓于 {new Date(r.closedAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <h1 className="font-serif text-[32px] leading-[38px] font-bold tracking-[-0.025em]">
          {r.summary.direction}
        </h1>
        <div className="mt-3 grid grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
              实际收益
            </div>
            <div
              className={`num mt-0.5 text-[22px] font-bold ${
                r.performance.realizedPnlPct >= 0 ? "text-up-dark" : "text-down-dark"
              }`}
            >
              {r.performance.realizedPnlPct >= 0 ? "+" : ""}
              {r.performance.realizedPnlPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-fg-3">
              {r.performance.realizedPnl >= 0 ? "+" : ""}${Math.abs(r.performance.realizedPnl).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
              基准
            </div>
            <div className="num mt-0.5 text-[22px] font-bold text-fg-2">
              {r.performance.benchmarkReturn >= 0 ? "+" : ""}
              {r.performance.benchmarkReturn.toFixed(1)}%
            </div>
            <div className="text-[10px] text-fg-3">同期同标的</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
              跑赢基准
            </div>
            <div
              className={`num mt-0.5 text-[22px] font-bold ${
                vsBench >= 0 ? "text-up-dark" : "text-down-dark"
              }`}
            >
              {vsBench >= 0 ? "+" : ""}
              {vsBench.toFixed(1)}pp
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
              最大回撤
            </div>
            <div className="num mt-0.5 text-[22px] font-bold text-down-dark">
              {r.performance.maxDrawdown.toFixed(1)}%
            </div>
          </div>
        </div>
      </header>

      {/* 复盘三段式 · 结构化反思编辑器 · Framework Part 4 Review artifact */}
      <ReviewReflectionEditor review={r} />

      {/* Attribution 4-dimensions */}
      <SectionHeader kicker="ATTRIBUTION · 归因四维" />
      <section className="mb-8 grid grid-cols-2 gap-3">
        <AttrCard
          label="策略选择"
          verdict={
            r.attribution.strategyChoice === "correct"
              ? "正确"
              : r.attribution.strategyChoice === "partial"
              ? "部分正确"
              : "错误"
          }
          kind={
            r.attribution.strategyChoice === "correct"
              ? "up"
              : r.attribution.strategyChoice === "partial"
              ? "warn"
              : "down"
          }
        />
        <AttrCard
          label="止盈执行"
          verdict={
            r.attribution.takeProfit === "on_target"
              ? "命中目标"
              : r.attribution.takeProfit === "early"
              ? "过早离场"
              : r.attribution.takeProfit === "late"
              ? "偏晚"
              : "未触发"
          }
          kind={
            r.attribution.takeProfit === "on_target"
              ? "up"
              : r.attribution.takeProfit === "n/a"
              ? "neutral"
              : "warn"
          }
        />
        <AttrCard
          label="止损执行"
          verdict={
            r.attribution.stopLoss === "not_triggered"
              ? "未触发"
              : r.attribution.stopLoss === "triggered"
              ? "按计划触发"
              : "未能触发"
          }
          kind={
            r.attribution.stopLoss === "not_triggered"
              ? "neutral"
              : r.attribution.stopLoss === "triggered"
              ? "up"
              : "down"
          }
        />
        <AttrCard
          label="市场环境"
          verdict={r.attribution.marketEnvironment}
          kind="neutral"
          wide
        />
      </section>

      {/* Notes */}
      <SectionHeader kicker="NOTES · AI 归因解读" />
      <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
        <p className="text-[13px] leading-[21px] text-fg-1">{r.attribution.notes}</p>
      </section>

      {/* Execution */}
      <SectionHeader kicker="EXECUTION · 执行情况" />
      <section className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
            目标仓位达成率
          </div>
          <div className="num mt-1 text-[20px] font-bold">
            {r.execution.filledPct}%
          </div>
          <div className="mt-2 h-2 rounded-full bg-bg-2">
            <div
              className={`h-full rounded-full ${
                r.execution.filledPct >= 80
                  ? "bg-up"
                  : r.execution.filledPct >= 50
                  ? "bg-warn"
                  : "bg-down"
              }`}
              style={{ width: `${r.execution.filledPct}%` }}
            />
          </div>
        </div>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
            成交偏离
          </div>
          <div
            className={`num mt-1 text-[20px] font-bold ${
              r.execution.avgPriceDeviation > 0.5
                ? "text-down-dark"
                : r.execution.avgPriceDeviation < -0.2
                ? "text-up-dark"
                : "text-fg-1"
            }`}
          >
            {r.execution.avgPriceDeviation >= 0 ? "+" : ""}
            {r.execution.avgPriceDeviation.toFixed(2)}%
          </div>
          <div className="mt-1 text-[10px] text-fg-3">
            vs 限价 · 负值=优于限价
          </div>
        </div>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
            目标仓位
          </div>
          <div className="num mt-1 text-[20px] font-bold">
            {(r.summary.targetWeight * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-[10px] text-fg-3">
            窗口 {r.summary.window}
          </div>
        </div>
      </section>
      {r.execution.unexecutedReason && (
        <section className="mb-8 rounded-md border-l-4 border-warn bg-warn/10 p-4">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-warn">
            <AlertCircle size={12} /> 未执行原因
          </div>
          <p className="text-[12px] leading-[18px] text-fg-1">
            {r.execution.unexecutedReason}
          </p>
        </section>
      )}

      {/* Behavior patterns */}
      {r.behaviorPatterns.length > 0 && (
        <>
          <SectionHeader kicker="BEHAVIOR PATTERNS · 行为模式" />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
            <ul className="space-y-2">
              {r.behaviorPatterns.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-l-2 border-warn pl-3"
                >
                  <span className="num mt-0.5 w-6 shrink-0 text-[11px] font-bold text-warn">
                    P{i + 1}
                  </span>
                  <span className="text-[12px] leading-[18px] text-fg-1">{p}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* User overrides */}
      {r.userOverrides.length > 0 && (
        <>
          <SectionHeader kicker="OVERRIDES · 你的手动干预" />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
            <ul className="space-y-2">
              {r.userOverrides.map((o, i) => (
                <li key={i} className="flex items-center gap-3 text-[11px]">
                  <span className="num rounded-xs bg-bg-2 px-2 py-0.5 font-semibold text-fg-2">
                    {o.field}
                  </span>
                  <span className="text-fg-3">
                    {new Date(o.at).toLocaleString("zh-CN")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Improvements */}
      {r.improvements.length > 0 && (
        <>
          <SectionHeader kicker={`IMPROVEMENTS · 下次怎么做更好(${r.improvements.length} 条)`} />
          <section className="mb-8 rounded-lg border-2 border-accent bg-bg-1 p-4">
            <ol className="space-y-3">
              {r.improvements.map((imp, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span className="text-[13px] leading-[19px] text-fg-1">{imp}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      {/* Related links */}
      <SectionHeader kicker="CONTEXT · 关联对象" />
      <section className="mb-8 grid grid-cols-2 gap-3">
        {signal && (
          <Link
            href={`?peek=${signal.id}`}
            className="rounded-md border border-hairline-strong bg-bg-1 p-3 hover:border-accent"
          >
            <div className="caps mb-1 text-accent">原始 Signal</div>
            <div className="line-clamp-2 text-[13px] font-semibold">
              {signal.oneLineConclusion}
            </div>
            <div className="mt-1 text-[10px] text-fg-3">
              {signal.strategyName} · {signal.conviction}
            </div>
          </Link>
        )}
        {plan && (
          <Link
            href={`?peek=${plan.id}`}
            className="rounded-md border border-hairline-strong bg-bg-1 p-3 hover:border-accent"
          >
            <div className="caps mb-1 text-accent">Trade Plan</div>
            <div className="text-[13px] font-semibold">
              {plan.targetPlan.action} · 目标 {(plan.targetPlan.targetWeight * 100).toFixed(1)}%
            </div>
            <div className="mt-1 text-[10px] text-fg-3">
              状态 {plan.status} · 窗口 {plan.targetPlan.window}
            </div>
          </Link>
        )}
        <Link
          href={`/portfolio/${encodeURIComponent(r.symbol)}`}
          className="rounded-md border border-hairline-strong bg-bg-1 p-3 hover:border-accent"
        >
          <div className="caps mb-1 text-accent">当前持仓</div>
          <div className="text-[13px] font-semibold">{sec?.nameZh ?? r.symbol}</div>
          <div className="mt-1 text-[10px] text-fg-3">
            看近期行情 / 相关新事实
          </div>
        </Link>
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        Review ID: {r.id} · 平仓日期 {new Date(r.closedAt).toLocaleDateString("zh-CN")}
        <br />
        右侧 AI 可针对任意一维归因展开追问
      </footer>
    </div>
  );
}

function AttrCard({
  label,
  verdict,
  kind,
  wide = false,
}: {
  label: string;
  verdict: string;
  kind: "up" | "warn" | "down" | "neutral";
  wide?: boolean;
}) {
  const Icon =
    kind === "up" ? CheckCircle2 : kind === "down" ? XCircle : AlertCircle;
  const cls =
    kind === "up"
      ? "border-up text-up-dark"
      : kind === "warn"
      ? "border-warn text-warn"
      : kind === "down"
      ? "border-down text-down-dark"
      : "border-hairline-strong text-fg-2";
  return (
    <div
      className={`rounded-lg border-l-4 bg-bg-1 p-4 ${cls} ${wide ? "col-span-2" : ""}`}
    >
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-fg-3">
        <Icon size={14} className={cls.split(" ")[1]} />
        {label}
      </div>
      <div className={`text-[14px] font-semibold ${cls.split(" ")[1]}`}>
        {verdict}
      </div>
    </div>
  );
}
