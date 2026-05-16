import { cn, formatNum } from "@/lib/utils";
import type { FinancialHealthScore as FHS } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface FinancialHealthScoreProps {
  data: FHS;
}

/**
 * 财务评分 — Morningstar 风格
 * 左:Overall Score 大字 + Rating(A+ ~ D)
 * 右:4 个维度 bullet chart(当前 vs peer)
 */
export function FinancialHealthScore({ data }: FinancialHealthScoreProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Financial Health Score" hint="MORNINGSTAR LIKE" />
      <div className="grid grid-cols-[200px_1fr] divide-x divide-hairline">
        {/* Overall */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Overall</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-4xl font-semibold leading-none text-accent">
              {formatNum(data.overall, 1)}
            </span>
            <span className="caps">/ 10</span>
          </div>
          <RatingBadge rating={data.rating} />
          <div className="num mt-3 text-xs text-fg-3">
            评分综合 4 维度,加权计算
          </div>
        </div>

        {/* Dimensions bullet chart */}
        <div className="px-4 py-4">
          <div className="caps mb-3">Dimensions vs Peer Median</div>
          <div className="space-y-3">
            {data.dimensions.map((d) => (
              <DimensionRow key={d.label} dim={d} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RatingBadge({ rating }: { rating: FHS["rating"] }) {
  const color =
    rating.startsWith("A")
      ? "text-up bg-up-soft border-up"
      : rating.startsWith("B")
        ? "text-accent bg-accent-soft border-accent"
        : rating.startsWith("C")
          ? "text-warn bg-soft border-warn"
          : "text-down bg-down-soft border-down";
  return (
    <div
      className={cn(
        "num mt-2 inline-flex items-center justify-center border px-2 py-0.5 text-lg font-bold",
        color,
      )}
    >
      {rating}
    </div>
  );
}

function DimensionRow({
  dim,
}: {
  dim: FHS["dimensions"][number];
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-sm text-fg-1">{dim.label}</span>
        <span className="flex items-baseline gap-3 text-sm">
          <span className="num font-semibold text-accent">
            {formatNum(dim.score, 1)}
          </span>
          <span className="num text-fg-3">
            peer {formatNum(dim.peer, 1)}
          </span>
        </span>
      </div>
      {/* Bullet chart */}
      <div className="relative h-2 w-full overflow-hidden bg-soft">
        {/* Peer marker (vertical line) */}
        <div
          className="absolute top-0 h-full w-[2px] bg-fg-3"
          style={{ left: `${(dim.peer / 10) * 100}%` }}
        />
        {/* Current score bar */}
        <div
          className={cn(
            "absolute top-0 h-full",
            dim.score >= dim.peer ? "bg-accent" : "bg-warn",
          )}
          style={{ width: `${(dim.score / 10) * 100}%` }}
        />
      </div>
      <div className="num mt-1 text-xs text-fg-3">{dim.description}</div>
    </div>
  );
}
