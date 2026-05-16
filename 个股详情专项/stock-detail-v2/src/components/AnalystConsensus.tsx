import { cn, formatNum, formatPct } from "@/lib/utils";
import type { AnalystConsensus as AC } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface AnalystConsensusProps {
  data: AC;
}

/**
 * 分析师一致预期 — Bloomberg ANR 页风格
 * 4 列布局:
 *   Col 1: 推荐分布 donut + mean rating
 *   Col 2: 推荐 stacked bar(buy/outperform/hold/underperform/sell)
 *   Col 3: 目标价范围 bar(low - median - high vs current)
 *   Col 4: 最近评级修订列表
 */
export function AnalystConsensus({ data }: AnalystConsensusProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader
        label="Analyst Consensus"
        hint={`ANR · ${data.totalAnalysts} ANALYSTS`}
      />
      <div className="grid grid-cols-[200px_1fr_1fr_320px] divide-x divide-hairline">
        {/* Col 1: Mean rating */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Mean Rating</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-3xl font-semibold text-accent">
              {formatNum(data.meanRating, 2)}
            </span>
            <span className="caps">/ 5</span>
          </div>
          <div className="mt-1 text-sm text-up">STRONG BUY</div>
          <div className="num mt-3 space-y-0.5 text-sm text-fg-3">
            <div>1 = Strong Buy</div>
            <div>5 = Sell</div>
          </div>
        </div>

        {/* Col 2: Stacked bar */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Recommendation</div>
          {/* stacked bar */}
          <div className="mb-3 flex h-3 w-full overflow-hidden">
            <Seg pct={(data.buy / data.totalAnalysts) * 100} color="bg-up" />
            <Seg pct={(data.outperform / data.totalAnalysts) * 100} color="bg-chart-green" />
            <Seg pct={(data.hold / data.totalAnalysts) * 100} color="bg-warn" />
            <Seg pct={(data.underperform / data.totalAnalysts) * 100} color="bg-chart-orange" />
            <Seg pct={(data.sell / data.totalAnalysts) * 100} color="bg-down" />
          </div>
          {/* legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            <Legend dot="bg-up" label="Buy" count={data.buy} total={data.totalAnalysts} />
            <Legend dot="bg-chart-green" label="Outperform" count={data.outperform} total={data.totalAnalysts} />
            <Legend dot="bg-warn" label="Hold" count={data.hold} total={data.totalAnalysts} />
            <Legend dot="bg-chart-orange" label="Underperform" count={data.underperform} total={data.totalAnalysts} />
            <Legend dot="bg-down" label="Sell" count={data.sell} total={data.totalAnalysts} />
          </div>
        </div>

        {/* Col 3: Target price */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Target Price (12M)</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-2xl font-semibold text-fg-1">
              {formatNum(data.targetPrice.mean, 2)}
            </span>
            <span
              className={cn(
                "num text-sm font-semibold",
                data.targetPrice.mean > data.currentPrice ? "text-up" : "text-down",
              )}
            >
              {formatPct(
                ((data.targetPrice.mean - data.currentPrice) / data.currentPrice) *
                  100,
                1,
              )}
            </span>
          </div>
          {/* range bar */}
          <TargetRangeBar
            low={data.targetPrice.low}
            high={data.targetPrice.high}
            median={data.targetPrice.median}
            current={data.currentPrice}
            mean={data.targetPrice.mean}
          />
          <div className="num mt-2 flex justify-between text-xs text-fg-3">
            <span>Low {formatNum(data.targetPrice.low, 0)}</span>
            <span>Med {formatNum(data.targetPrice.median, 0)}</span>
            <span>High {formatNum(data.targetPrice.high, 0)}</span>
          </div>
        </div>

        {/* Col 4: Revisions */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Recent Revisions</div>
          <ul className="space-y-1.5 text-sm">
            {data.revisions.slice(0, 5).map((r, i) => (
              <li key={i} className="flex items-baseline justify-between gap-2">
                <span className="num text-fg-3">{r.date}</span>
                <span className="flex-1 truncate text-fg-1">{r.analyst}</span>
                <span
                  className={cn(
                    "num inline-flex items-center gap-1",
                    r.to === "BUY"
                      ? "text-up"
                      : r.to === "SELL"
                        ? "text-down"
                        : "text-warn",
                  )}
                >
                  {r.from !== r.to && (
                    <span className="text-fg-4">{r.from} →</span>
                  )}
                  <span className="font-semibold">{r.to}</span>
                </span>
                <span className="num text-fg-2">{formatNum(r.tp, 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Seg({ pct, color }: { pct: number; color: string }) {
  return <div className={color} style={{ width: `${pct}%` }} />;
}

function Legend({
  dot,
  label,
  count,
  total,
}: {
  dot: string;
  label: string;
  count: number;
  total: number;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <i className={cn("inline-block h-[6px] w-[6px] shrink-0", dot)} />
      <span className="text-fg-2">{label}</span>
      <span className="num ml-auto text-fg-1">{count}</span>
      <span className="num text-fg-3">{Math.round((count / total) * 100)}%</span>
    </div>
  );
}

function TargetRangeBar({
  low,
  high,
  median,
  current,
  mean,
}: {
  low: number;
  high: number;
  median: number;
  current: number;
  mean: number;
}) {
  const range = high - low;
  const pctOf = (v: number) => ((v - low) / range) * 100;

  return (
    <div className="relative mt-3 h-6 w-full">
      {/* range bar */}
      <div className="absolute inset-x-0 top-3 h-[2px] bg-stroke" />
      <div
        className="absolute top-3 h-[2px] bg-accent"
        style={{ left: `${pctOf(low)}%`, width: `${pctOf(high) - pctOf(low)}%` }}
      />
      {/* current price marker */}
      <Marker pos={pctOf(current)} color="bg-fg-1" label="C" />
      {/* mean target marker */}
      <Marker pos={pctOf(mean)} color="bg-accent" label="M" />
      {/* median marker */}
      <Marker pos={pctOf(median)} color="bg-warn" label="·" small />
    </div>
  );
}

function Marker({
  pos,
  color,
  label,
  small,
}: {
  pos: number;
  color: string;
  label: string;
  small?: boolean;
}) {
  return (
    <div
      className="absolute top-0 -translate-x-1/2"
      style={{ left: `${pos}%` }}
    >
      <div
        className={cn(
          "rounded-full",
          color,
          small ? "h-1 w-1" : "h-2 w-2",
          !small && "ring-2 ring-bg",
        )}
        style={{ marginTop: small ? "10px" : "8px" }}
      />
      {!small && (
        <div className="num mt-0.5 text-center text-3xs font-bold text-fg-3">
          {label}
        </div>
      )}
    </div>
  );
}
