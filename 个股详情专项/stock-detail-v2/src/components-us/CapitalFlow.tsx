import { useState } from "react";
import { cn, formatNum, formatCompact } from "@/lib/utils";
import type { CapitalFlowData } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface CapitalFlowProps {
  data: CapitalFlowData;
}

/**
 * US 客户端 Capital flow — 对应 PDF "Capital flow"。
 *   Donut:Net Inflow(绿) vs Outflow(红)
 *   3 buckets:Large / Medium / Small 各自 inflow vs outflow
 *   Real-time / Historical tab + 区域图
 */
export function CapitalFlow({ data: d }: CapitalFlowProps) {
  const [tab, setTab] = useState<"realtime" | "historical">("realtime");

  return (
    <section className="border-b border-line">
      <SectionHeader label="Capital flow" hint={`Unit: ${d.unit}`} />
      <div className="px-4 pb-4">
        {/* Donut + center label */}
        <div className="flex flex-col items-center">
          <FlowDonut
            inflow={d.totalInflow}
            outflow={d.totalOutflow}
            netInflow={d.netInflow}
          />
        </div>

        {/* Inflow vs Outflow column headers */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-fg-3">Inflow</div>
            <div className="num text-base font-bold text-up">
              {formatNum(d.totalInflow, 2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-fg-3">Outflow</div>
            <div className="num text-base font-bold text-down">
              {formatNum(d.totalOutflow, 2)}
            </div>
          </div>
        </div>

        {/* Bucket rows */}
        <div className="mt-3 space-y-2">
          {d.buckets.map((b) => (
            <BucketRow key={b.size} bucket={b} />
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-1">
          {(["realtime", "historical"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                tab === k
                  ? "bg-card-2 text-fg-1"
                  : "text-fg-3 hover:text-fg-1",
              )}
            >
              {k === "realtime" ? "Real-time" : "Historical"}
            </button>
          ))}
        </div>

        {/* Area chart */}
        <RealtimeChart points={d.realtime} ticks={d.ticks} />
      </div>
    </section>
  );
}

function FlowDonut({
  inflow,
  outflow,
  netInflow,
}: {
  inflow: number;
  outflow: number;
  netInflow: number;
}) {
  const W = 160;
  const CX = W / 2;
  const CY = W / 2;
  const total = inflow + outflow;
  const inflowPct = inflow / total;

  return (
    <svg aria-hidden="true" width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
      {/* Outflow segment (red) — start at 12 o'clock */}
      <RingArc cx={CX} cy={CY} rOut={70} rIn={50} start={-Math.PI / 2} pct={1 - inflowPct} color="var(--color-down)" />
      {/* Inflow segment (green) */}
      <RingArc cx={CX} cy={CY} rOut={70} rIn={50} start={-Math.PI / 2 + (1 - inflowPct) * Math.PI * 2} pct={inflowPct} color="var(--color-up)" />

      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        fontSize="10"
        fill="var(--color-fg-3)"
      >
        Net Inflow
      </text>
      <text
        x={CX}
        y={CY + 14}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="var(--color-up)"
        className="num"
      >
        {formatNum(netInflow, 3)}
      </text>
    </svg>
  );
}

function RingArc({
  cx,
  cy,
  rOut,
  rIn,
  start,
  pct,
  color,
}: {
  cx: number;
  cy: number;
  rOut: number;
  rIn: number;
  start: number;
  pct: number;
  color: string;
}) {
  if (pct <= 0) return null;
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

function BucketRow({ bucket: b }: { bucket: CapitalFlowData["buckets"][number] }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs">
      <span className="num font-semibold text-up">
        {formatNum(b.inflow, 2)}
      </span>
      <span className="inline-flex items-center gap-1.5 px-2">
        <span className="h-2 w-2 rounded-sm bg-up" />
        <span className="text-fg-2">{b.size}</span>
        <span className="h-2 w-2 rounded-sm bg-down" />
      </span>
      <span className="num text-right font-semibold text-down">
        {formatNum(b.outflow, 2)}
      </span>
    </div>
  );
}

function RealtimeChart({
  points,
  ticks,
}: {
  points: CapitalFlowData["realtime"];
  ticks: string[];
}) {
  const W = 540;
  const H = 140;
  const PAD_X = 16;
  const PAD_Y = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2 - 18;

  const values = points.map((p) => p.v);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const zeroY = PAD_Y + ((max - 0) / range) * innerH;

  const linePts = points.map((p, i) => {
    const x = PAD_X + (i / (points.length - 1)) * innerW;
    const y = PAD_Y + (1 - (p.v - min) / range) * innerH;
    return `${x},${y}`;
  });
  const linePath = `M ${linePts.join(" L ")}`;
  const areaPath = `${linePath} L ${PAD_X + innerW},${zeroY} L ${PAD_X},${zeroY} Z`;
  const last = points[points.length - 1].v;
  const stroke = last >= 0 ? "var(--color-up)" : "var(--color-down)";

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-2 block h-32 w-full"
    >
      <defs>
        <linearGradient id="us-cf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--color-hairline)"
        strokeDasharray="2 3"
      />
      <path d={areaPath} fill="url(#us-cf-area)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" />

      {/* X labels */}
      {ticks.map((t, i) => {
        const x = PAD_X + (i / (ticks.length - 1)) * innerW;
        return (
          <text
            key={t}
            x={x}
            y={H - 4}
            textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="var(--color-fg-3)"
            className="num"
          >
            {t}
          </text>
        );
      })}

      {/* Right-side scale labels */}
      <text x={W - PAD_X} y={PAD_Y + 8} textAnchor="end" fontSize="10" fill="var(--color-fg-4)" className="num">
        {formatCompact(max)}
      </text>
    </svg>
  );
}
