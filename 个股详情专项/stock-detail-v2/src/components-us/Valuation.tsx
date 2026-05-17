import { cn, formatNum } from "@/lib/utils";
import type { ValuationMetric } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface ValuationProps {
  metrics: ValuationMetric;
}

/**
 * US 客户端 Stock valuation — 三层 donut + 行业排名说明 banner。
 *   Donut 外环 = stock price 比例 / 中环 = EPS 比例 / 中心写 P/E ratio。
 *   左右两侧 KV:Stock price / Earnings per share。
 *   底部 banner:P/E 相对 3 年范围 + 行业排名描述。
 */
export function Valuation({ metrics: m }: ValuationProps) {
  const near3yLow = m.peRatio <= m.peMedian3y;
  const belowMedian = m.peRatio < m.industryMedian;

  return (
    <section className="border-b border-line">
      <SectionHeader label="Stock valuation" hint={m.date} />
      <div className="px-4 pb-4">
        <div className="grid grid-cols-[80px_180px_1fr] items-center gap-4">
          {/* Left KV */}
          <div className="text-right">
            <div className="num text-xl font-bold text-fg-1">
              ${formatNum(m.stockPrice, 2)}
            </div>
            <div className="text-xs text-fg-3">Stock price</div>
          </div>

          {/* Donut */}
          <ValuationDonutChart metric={m} />

          {/* Right KV */}
          <div>
            <div className="num text-xl font-bold text-fg-1">
              ${formatNum(m.eps, 2)}
            </div>
            <div className="text-xs text-fg-3">Earnings per share</div>
          </div>
        </div>

        {/* Banner */}
        <div className="mt-4 flex gap-2 rounded-md border border-hairline bg-card-2 p-3 text-xs leading-relaxed text-fg-2">
          <BannerIcon />
          <span>
            The current P/E ratio of{" "}
            <strong className="num text-fg-1">{formatNum(m.peRatio, 1)}</strong>{" "}
            is {belowMedian ? "below" : "above"} the stock's typical valuation range.{" "}
            This stock's P/E is{" "}
            <span className="font-semibold text-fg-1">
              {near3yLow ? "near its 3-year low" : "near its 3-year high"}
            </span>
            . It ranks{" "}
            <strong className="num text-fg-1">
              {m.industryRank}/{m.industryTotal}
            </strong>{" "}
            in the industry, compared to the industry median of{" "}
            <strong className="num text-fg-1">{formatNum(m.industryMedian, 2)}</strong>.
          </span>
        </div>
      </div>
    </section>
  );
}

function ValuationDonutChart({ metric: m }: { metric: ValuationMetric }) {
  const W = 180;
  const CX = W / 2;
  const CY = W / 2;

  // Outer ring = stock price 占比 (相对于 stockPrice + 一些 reference scale)
  // We treat the donut as 2 stacked rings: outer represents stock price share, inner represents EPS share
  // PE ratio shown in center
  const total = m.stockPrice + m.eps;
  const stockShare = m.stockPrice / total;
  const epsShare = m.eps / total;

  return (
    <svg aria-hidden="true" width={W} height={W} viewBox={`0 0 ${W} ${W}`} className="mx-auto">
      {/* Outer ring (stock price) */}
      <RingArc cx={CX} cy={CY} rOut={78} rIn={62} pct={stockShare} color="var(--color-chart-blue)" />
      <RingArc cx={CX} cy={CY} rOut={78} rIn={62} pct={1 - stockShare} color="var(--color-card-2)" rotate={stockShare} />

      {/* Inner ring (EPS) */}
      <RingArc cx={CX} cy={CY} rOut={56} rIn={40} pct={epsShare} color="var(--color-warn)" />
      <RingArc cx={CX} cy={CY} rOut={56} rIn={40} pct={1 - epsShare} color="var(--color-card-2)" rotate={epsShare} />

      {/* Center label */}
      <text
        x={CX}
        y={CY - 2}
        textAnchor="middle"
        className="num"
        fontSize="22"
        fontWeight="700"
        fill="var(--color-fg-1)"
      >
        {formatNum(m.peRatio, 1)}x
      </text>
      <text
        x={CX}
        y={CY + 14}
        textAnchor="middle"
        fontSize="10"
        fill="var(--color-fg-3)"
      >
        P/E ratio
      </text>
    </svg>
  );
}

function RingArc({
  cx,
  cy,
  rOut,
  rIn,
  pct,
  color,
  rotate = 0,
}: {
  cx: number;
  cy: number;
  rOut: number;
  rIn: number;
  pct: number;
  color: string;
  rotate?: number;
}) {
  if (pct <= 0) return null;
  const start = -Math.PI / 2 + rotate * Math.PI * 2;
  const end = start + pct * Math.PI * 2;
  const largeArc = end - start > Math.PI ? 1 : 0;

  const x1 = cx + Math.cos(start) * rOut;
  const y1 = cy + Math.sin(start) * rOut;
  const x2 = cx + Math.cos(end) * rOut;
  const y2 = cy + Math.sin(end) * rOut;
  const x3 = cx + Math.cos(end) * rIn;
  const y3 = cy + Math.sin(end) * rIn;
  const x4 = cx + Math.cos(start) * rIn;
  const y4 = cy + Math.sin(start) * rIn;

  const d = [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");

  return <path d={d} fill={color} />;
}

function BannerIcon() {
  return (
    <span className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent")}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2 L9.5 6 L13.5 6.5 L10.5 9.5 L11.3 13.5 L8 11.5 L4.7 13.5 L5.5 9.5 L2.5 6.5 L6.5 6 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
