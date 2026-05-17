import { useState } from "react";
import { cn, formatNum } from "@/lib/utils";
import type {
  EarningsForecastQuarter,
  EarningsScatterPoint,
  EarningsMetricKey,
} from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface EarningsForecastProps {
  data: EarningsForecastQuarter[];
}

/**
 * US 客户端 Earnings — Actual vs Estimate 散点。
 * EPS / Revenue / EBIT 3 metric tab 切换;每季度 1 个 actual(实心圆 up/down 色)
 * + 1 个 estimate(空圈)。Beat → up 色 / Miss → down 色。
 */
export function EarningsForecast({ data }: EarningsForecastProps) {
  const [metric, setMetric] = useState<EarningsMetricKey>(data[0]?.metric ?? "EPS");
  const current = data.find((d) => d.metric === metric) ?? data[0];

  return (
    <section className="border-b border-line">
      <SectionHeader label="Earnings" hint="Quarterly" />
      <div className="px-4 pb-4">
        {/* Metric tabs */}
        <div className="mb-3 flex items-center gap-1">
          {data.map((d) => (
            <button
              key={d.metric}
              type="button"
              onClick={() => setMetric(d.metric)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-semibold transition-colors",
                d.metric === metric
                  ? "bg-fg-1 text-fg-inverse"
                  : "bg-card text-fg-3 hover:bg-soft hover:text-fg-1",
              )}
            >
              {d.metric}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-xs text-fg-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-up" />
            <span>Actual</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-fg-3 bg-transparent" />
            <span>Estimate</span>
          </span>
        </div>

        <ScatterChart points={current.points} unit={current.unit} />
      </div>
    </section>
  );
}

function ScatterChart({
  points,
  unit,
}: {
  points: EarningsScatterPoint[];
  unit: string;
}) {
  const W = 540;
  const H = 220;
  const PAD_X = 36;
  const PAD_Y = 24;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2 - 18; // 18 for x-axis labels

  // Collect all values to compute scale
  const allVals = points.flatMap((p) => [p.actual, p.estimate]).filter(
    (v): v is number => typeof v === "number",
  );
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const slotW = innerW / Math.max(points.length - 1, 1);

  const xAt = (i: number) => PAD_X + slotW * i;
  const yAt = (v: number) =>
    PAD_Y + (1 - (v - min) / range) * innerH;

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      {/* Horizontal guides */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={PAD_Y + innerH * t}
          y2={PAD_Y + innerH * t}
          stroke="var(--color-hairline)"
          strokeDasharray="2 4"
        />
      ))}

      {/* Estimate (空圈, 灰色描边, 稍微向右下偏移 4px 避免与 Actual 完全重叠) */}
      {points.map((p, i) =>
        typeof p.estimate === "number" ? (
          <circle
            key={`est-${i}`}
            cx={xAt(i) + 4}
            cy={yAt(p.estimate) + 4}
            r={8}
            fill="var(--color-bg-2)"
            stroke="var(--color-fg-3)"
            strokeWidth={1.5}
          />
        ) : null,
      )}

      {/* Actual filled (实心圆, beat 绿 / miss 粉) */}
      {points.map((p, i) =>
        typeof p.actual === "number" ? (
          <circle
            key={`act-${i}`}
            cx={xAt(i)}
            cy={yAt(p.actual)}
            r={9}
            fill={p.beat ? "var(--color-up)" : "var(--color-down)"}
          />
        ) : null,
      )}

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={`x-${i}`}
          x={xAt(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-fg-3)"
        >
          {p.period}
        </text>
      ))}

      {/* Y-axis min/max labels */}
      <text x={PAD_X - 6} y={PAD_Y + 4} textAnchor="end" fontSize="10" fill="var(--color-fg-4)">
        {unit}
        {formatNum(max, 2)}
      </text>
      <text
        x={PAD_X - 6}
        y={PAD_Y + innerH + 2}
        textAnchor="end"
        fontSize="10"
        fill="var(--color-fg-4)"
      >
        {unit}
        {formatNum(min, 2)}
      </text>
    </svg>
  );
}
