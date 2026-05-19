import Link from "next/link";
import { MOCK_REVIEWS } from "@/mock/reviews";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";

export default function ReviewHubPage() {
  const reviews = [...MOCK_REVIEWS].sort(
    (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
  );

  // Aggregate stats
  const totalTrades = reviews.length;
  const winCount = reviews.filter((r) => r.performance.realizedPnlPct > 0).length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const avgPnl =
    reviews.reduce((s, r) => s + r.performance.realizedPnlPct, 0) / Math.max(1, totalTrades);
  const avgDrawdown =
    reviews.reduce((s, r) => s + r.performance.maxDrawdown, 0) / Math.max(1, totalTrades);
  const vsBench =
    reviews.reduce(
      (s, r) => s + (r.performance.realizedPnlPct - r.performance.benchmarkReturn),
      0
    ) / Math.max(1, totalTrades);

  // 四维归因分布
  const strategyDist = countBy(reviews, (r) => r.attribution.strategyChoice);
  const takeProfitDist = countBy(reviews, (r) => r.attribution.takeProfit);
  const stopLossDist = countBy(reviews, (r) => r.attribution.stopLoss);

  // Aggregate behavior patterns (deduplicated, count by exact match)
  const patternCount = new Map<string, number>();
  for (const r of reviews) {
    for (const p of r.behaviorPatterns) {
      patternCount.set(p, (patternCount.get(p) ?? 0) + 1);
    }
  }
  const topPatterns = Array.from(patternCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <header className="mb-6 border-b-2 border-fg-1 pb-4">
        <Kicker>REVIEW · 复盘</Kicker>
        <h1 className="mt-1 font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          我做对 / 做错了什么
        </h1>
        <p className="mt-1 text-[12px] text-fg-3">
          归因四维(策略 / 止盈 / 止损 / 市场)+ 行为模式识别
        </p>
      </header>

      {/* KPIs */}
      <section className="mb-8 grid grid-cols-5 gap-3">
        <KPI label="交易数" value={totalTrades.toString()} />
        <KPI
          label="胜率"
          value={`${winRate.toFixed(0)}%`}
          sub={`${winCount} / ${totalTrades}`}
        />
        <KPI
          label="平均收益"
          value={`${avgPnl >= 0 ? "+" : ""}${avgPnl.toFixed(1)}%`}
          valueClass={avgPnl >= 0 ? "text-up-dark" : "text-down-dark"}
        />
        <KPI
          label="平均回撤"
          value={`${avgDrawdown.toFixed(1)}%`}
          valueClass="text-down-dark"
        />
        <KPI
          label="跑赢基准"
          value={`${vsBench >= 0 ? "+" : ""}${vsBench.toFixed(1)}pp`}
          valueClass={vsBench >= 0 ? "text-up-dark" : "text-down-dark"}
        />
      </section>

      {/* 四维归因 · 每个维度一行 */}
      <SectionHeader kicker="ATTRIBUTION · 归因四维分布" />
      <section className="mb-8 space-y-3 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <AttributionRow
          label="策略选择"
          cells={[
            { label: "正确", count: strategyDist.correct ?? 0, kind: "up" },
            { label: "部分", count: strategyDist.partial ?? 0, kind: "warn" },
            { label: "错误", count: strategyDist.wrong ?? 0, kind: "down" },
          ]}
          total={totalTrades}
        />
        <AttributionRow
          label="止盈执行"
          cells={[
            { label: "命中目标", count: takeProfitDist.on_target ?? 0, kind: "up" },
            { label: "过早离场", count: takeProfitDist.early ?? 0, kind: "warn" },
            { label: "偏晚", count: takeProfitDist.late ?? 0, kind: "warn" },
            { label: "未触发", count: takeProfitDist["n/a"] ?? 0, kind: "neutral" },
          ]}
          total={totalTrades}
        />
        <AttributionRow
          label="止损执行"
          cells={[
            { label: "按计划触发", count: stopLossDist.triggered ?? 0, kind: "up" },
            { label: "未触发", count: stopLossDist.not_triggered ?? 0, kind: "neutral" },
            { label: "未能触发", count: stopLossDist.missed ?? 0, kind: "down" },
          ]}
          total={totalTrades}
        />
        <div className="rounded-md bg-bg-2 px-3 py-2 text-[11px] text-fg-2">
          💡 策略方向对但止盈偏早/止损失效,说明问题在执行端,不在判断端。
          右侧 AI 可以就单一维度深入。
        </div>
      </section>

      {/* Behavior patterns */}
      {topPatterns.length > 0 && (
        <>
          <SectionHeader kicker="BEHAVIOR PATTERNS · 行为模式" />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
            <ul className="space-y-2">
              {topPatterns.map(([pattern, count]) => (
                <li
                  key={pattern}
                  className="flex items-start gap-3 border-l-2 border-warn pl-3"
                >
                  <span className="num mt-0.5 w-6 shrink-0 text-[14px] font-bold text-warn">
                    {count}x
                  </span>
                  <span className="text-[12px] leading-[18px] text-fg-1">{pattern}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[11px] text-fg-2">
              识别 {topPatterns.length} 种反复出现的模式 ·
              右侧 AI 可以帮你逐条设计「克服方案」。
            </div>
          </section>
        </>
      )}

      {/* Reviews list */}
      <SectionHeader kicker={`TRADES · ${reviews.length} 笔已平仓`} />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
        <div className="divide-y divide-hairline-strong">
          {reviews.map((r) => (
            <Link
              key={r.id}
              href={`/review/${r.id}`}
              className="grid grid-cols-[80px_1fr_80px_80px_80px_40px] items-center gap-3 px-4 py-3 hover:bg-bg-2"
            >
              <div>
                <div className="num text-[13px] font-bold">
                  {r.symbol.split(".")[0]}
                </div>
                <div className="text-[10px] text-fg-3">
                  {new Date(r.closedAt).toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold">{r.summary.direction}</div>
                <div className="mt-0.5 line-clamp-1 text-[10px] text-fg-3">
                  {r.attribution.marketEnvironment}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`num text-[14px] font-bold ${
                    r.performance.realizedPnlPct >= 0 ? "text-up-dark" : "text-down-dark"
                  }`}
                >
                  {r.performance.realizedPnlPct >= 0 ? "+" : ""}
                  {r.performance.realizedPnlPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-fg-3">收益</div>
              </div>
              <div className="text-right">
                <div className="num text-[13px] font-bold text-fg-2">
                  {r.performance.benchmarkReturn >= 0 ? "+" : ""}
                  {r.performance.benchmarkReturn.toFixed(1)}%
                </div>
                <div className="text-[10px] text-fg-3">基准</div>
              </div>
              <div
                className={`text-right text-[11px] font-semibold ${
                  r.attribution.strategyChoice === "correct"
                    ? "text-up-dark"
                    : r.attribution.strategyChoice === "partial"
                    ? "text-warn"
                    : "text-down-dark"
                }`}
              >
                {r.attribution.strategyChoice === "correct"
                  ? "✓ 正确"
                  : r.attribution.strategyChoice === "partial"
                  ? "~ 部分"
                  : "✗ 错误"}
              </div>
              <div className="text-right text-[12px] text-fg-3">›</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        所有数据来自 Demo Mock · 真实产品里 Review 会用你的实际交易记录生成
      </footer>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
        {label}
      </div>
      <div className={`num mt-1 text-[18px] font-bold ${valueClass}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-fg-3">{sub}</div>}
    </div>
  );
}

function countBy<T>(arr: T[], key: (x: T) => string): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const x of arr) acc[key(x)] = (acc[key(x)] ?? 0) + 1;
  return acc;
}

type AttrKind = "up" | "warn" | "down" | "neutral";

function AttributionRow({
  label,
  cells,
  total,
}: {
  label: string;
  cells: { label: string; count: number; kind: AttrKind }[];
  total: number;
}) {
  const sum = cells.reduce((s, c) => s + c.count, 0);
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-3">
      <div className="text-[11px] font-semibold text-fg-1">{label}</div>
      <div>
        <div className="flex h-3 overflow-hidden rounded-full bg-bg-2">
          {cells.map((c, i) => {
            if (c.count === 0) return null;
            const pct = sum > 0 ? (c.count / sum) * 100 : 0;
            const barCls =
              c.kind === "up"
                ? "bg-up"
                : c.kind === "warn"
                ? "bg-warn"
                : c.kind === "down"
                ? "bg-down"
                : "bg-fg-3";
            return (
              <div
                key={i}
                className={`h-full ${barCls}`}
                style={{ width: `${pct}%` }}
                title={`${c.label}:${c.count}/${total}`}
              />
            );
          })}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-fg-3">
          {cells.map((c, i) => {
            const dotCls =
              c.kind === "up"
                ? "bg-up"
                : c.kind === "warn"
                ? "bg-warn"
                : c.kind === "down"
                ? "bg-down"
                : "bg-fg-3";
            return (
              <span key={i} className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                <span>
                  {c.label} {c.count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
