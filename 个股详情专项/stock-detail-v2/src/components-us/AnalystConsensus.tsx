import { cn, formatPct, formatNum } from "@/lib/utils";
import type { AnalystConsensus as AC } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface AnalystConsensusProps {
  data: AC;
}

const SEGMENTS: {
  key: keyof AC["distribution"];
  label: string;
  /** Tailwind class for the colored dot — pulls from DS token */
  dot: string;
}[] = [
  { key: "strongBuy",  label: "Strong buy",  dot: "bg-up" },
  { key: "buy",        label: "Buy",         dot: "bg-up/60" },
  { key: "hold",       label: "Hold",        dot: "bg-warn" },
  { key: "sell",       label: "Sell",        dot: "bg-down/60" },
  { key: "strongSell", label: "Strong sell", dot: "bg-down" },
];

/**
 * US 客户端 Analyst Forecast — Donut + KV + 5-row legend。
 * 对应 PDF "Analyst forecast" section。
 */
export function AnalystConsensus({ data: d }: AnalystConsensusProps) {
  const isUp = d.priceForecast.pct >= 0;

  return (
    <section className="border-b border-line">
      <SectionHeader label="Analyst forecast" hint={d.date} />
      <div className="px-4 pb-4">
        <div className="grid grid-cols-[160px_1fr] gap-4">
          {/* Left: Donut */}
          <DonutChart distribution={d.distribution} total={d.totalAnalysts} />

          {/* Right: KV pair */}
          <div className="flex flex-col justify-center gap-4">
            <KV label="Price forecast">
              <div className="flex items-baseline gap-2">
                <span className="num text-xl font-bold text-fg-1">
                  ${formatNum(d.priceForecast.target, 2)}
                </span>
                <span
                  className={cn(
                    "num text-sm font-semibold",
                    isUp ? "text-up" : "text-down",
                  )}
                >
                  {isUp ? "▲" : "▼"}
                  {formatPct(d.priceForecast.pct * 100, 2)}
                </span>
              </div>
            </KV>
            <KV label="Analyst rating">
              <span className="text-xl font-bold text-up">{d.rating}</span>
            </KV>
          </div>
        </div>

        {/* Legend rows */}
        <ul className="mt-5 space-y-2 border-t border-hairline pt-4">
          {SEGMENTS.map((seg) => (
            <li key={seg.key} className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", seg.dot)} />
                <span className="text-fg-2">{seg.label}</span>
              </span>
              <span className="num font-semibold text-fg-1">
                {formatPct(d.distribution[seg.key] * 100, 2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-hairline bg-card px-3 py-2">
      <div className="mb-1 text-xs text-fg-3">{label}</div>
      {children}
    </div>
  );
}

function DonutChart({
  distribution,
  total,
}: {
  distribution: AC["distribution"];
  total: number;
}) {
  const W = 160;
  const R_OUT = 70;
  const R_IN = 50;
  const CX = W / 2;
  const CY = W / 2;

  // Map segments to SVG arcs
  const segs: { key: string; pct: number; color: string }[] = [
    { key: "strongBuy",  pct: distribution.strongBuy,  color: "var(--color-up)" },
    { key: "buy",        pct: distribution.buy,        color: "var(--color-up-soft)" },
    { key: "hold",       pct: distribution.hold,       color: "var(--color-warn)" },
    { key: "sell",       pct: distribution.sell,       color: "var(--color-down-soft)" },
    { key: "strongSell", pct: distribution.strongSell, color: "var(--color-down)" },
  ];

  let cursor = -Math.PI / 2; // start at 12 o'clock
  const arcs = segs.map((s) => {
    const angle = s.pct * Math.PI * 2;
    const start = cursor;
    const end = cursor + angle;
    cursor = end;
    return { ...s, start, end };
  });

  return (
    <svg aria-hidden="true" width={W} height={W} viewBox={`0 0 ${W} ${W}`} className="shrink-0">
      {arcs.map((a) => (
        <path
          key={a.key}
          d={arcPath(CX, CY, R_OUT, R_IN, a.start, a.end)}
          fill={a.color}
        />
      ))}
      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        className="num"
        fontSize="22"
        fontWeight="700"
        fill="var(--color-fg-1)"
      >
        {total}
      </text>
      <text
        x={CX}
        y={CY + 14}
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-fg-3)"
      >
        analysts
      </text>
    </svg>
  );
}

function arcPath(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  start: number,
  end: number,
): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  const x1 = cx + Math.cos(start) * rOut;
  const y1 = cy + Math.sin(start) * rOut;
  const x2 = cx + Math.cos(end) * rOut;
  const y2 = cy + Math.sin(end) * rOut;
  const x3 = cx + Math.cos(end) * rIn;
  const y3 = cy + Math.sin(end) * rIn;
  const x4 = cx + Math.cos(start) * rIn;
  const y4 = cy + Math.sin(start) * rIn;
  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}
