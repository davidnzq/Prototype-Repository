import { useState } from "react";
import { cn, formatNum } from "@/lib/utils";
import type { IntradayMeta, IntradayRange } from "@/mock/stockDetail-us";

interface IntradayChartProps {
  meta: IntradayMeta;
}

/**
 * US 客户端 IntradayChart — 24hr 延长盘三段(pre / reg / post)。
 *   带 sun/moon 时段图标 + 区域填充 + 虚线参考线 + 高低位标签 + 时间范围 tabs。
 *
 * 视觉沿用 Design-System token,无 hardcode 颜色。
 */
export function IntradayChart({ meta }: IntradayChartProps) {
  const [range, setRange] = useState<IntradayRange>(meta.activeRange);

  return (
    <section className="border-b border-line bg-bg-2">
      {/* Chart */}
      <ExtendedChart meta={meta} />

      {/* Time tick labels with sun/moon icons */}
      <TimeAxis ticks={meta.ticks} />

      {/* Range tabs */}
      <RangeTabs
        ranges={meta.ranges}
        active={range}
        onChange={setRange}
      />
    </section>
  );
}

function ExtendedChart({ meta }: { meta: IntradayMeta }) {
  const W = 600;
  const H = 220;
  const PAD_X = 12;
  const PAD_TOP = 32;
  const PAD_BOT = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;

  const allValues = meta.segments.flatMap((s) => s.values);
  const min = Math.min(...allValues, meta.low);
  const max = Math.max(...allValues, meta.high);
  const range = max - min || 1;

  const totalPoints = allValues.length;
  const xStep = innerW / (totalPoints - 1);
  const yAt = (v: number) => PAD_TOP + (1 - (v - min) / range) * innerH;

  // Build polyline points for each segment with global index offset
  let idx = 0;
  const segmentPaths: { kind: string; line: string; area: string }[] = [];
  meta.segments.forEach((seg) => {
    const pts: string[] = [];
    seg.values.forEach((v, i) => {
      const x = PAD_X + (idx + i) * xStep;
      const y = yAt(v);
      pts.push(`${x},${y}`);
    });
    const line = pts.join(" ");
    const firstX = PAD_X + idx * xStep;
    const lastX = PAD_X + (idx + seg.values.length - 1) * xStep;
    const area = `M ${firstX},${PAD_TOP + innerH} L ${pts.join(" L ")} L ${lastX},${PAD_TOP + innerH} Z`;
    segmentPaths.push({ kind: seg.kind, line, area });
    idx += seg.values.length;
  });

  const isUp = allValues[allValues.length - 1] >= meta.reference;
  const stroke = isUp ? "var(--color-up)" : "var(--color-down)";

  // Find high/low positions
  const highIdx = allValues.indexOf(Math.max(...allValues));
  const lowIdx = allValues.indexOf(Math.min(...allValues));
  const highX = PAD_X + highIdx * xStep;
  const highY = yAt(allValues[highIdx]);
  const lowX = PAD_X + lowIdx * xStep;
  const lowY = yAt(allValues[lowIdx]);

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-56 w-full"
    >
      {/* Area gradient */}
      <defs>
        <linearGradient id="us-intraday-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Reference dashed line */}
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={yAt(meta.reference)}
        y2={yAt(meta.reference)}
        stroke="var(--color-hairline-strong)"
        strokeDasharray="3 3"
      />

      {/* Segments */}
      {segmentPaths.map((sp, i) => (
        <g key={i}>
          <path d={sp.area} fill="url(#us-intraday-area)" />
          <polyline
            points={sp.line}
            fill="none"
            stroke={stroke}
            strokeWidth={sp.kind === "reg" ? 1.6 : 1}
            className={sp.kind === "reg" ? "opacity-100" : "opacity-65"}
          />
        </g>
      ))}

      {/* High / Low callouts */}
      <g>
        <circle cx={highX} cy={highY} r={3} fill={stroke} />
        <text
          x={highX}
          y={highY - 8}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="var(--color-fg-1)"
          className="num"
        >
          {formatNum(meta.high, 2)}
        </text>
      </g>
      <g>
        <circle cx={lowX} cy={lowY} r={3} fill={stroke} />
        <text
          x={lowX}
          y={lowY + 14}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="var(--color-fg-1)"
          className="num"
        >
          {formatNum(meta.low, 2)}
        </text>
      </g>
    </svg>
  );
}

function TimeAxis({ ticks }: { ticks: string[] }) {
  // Insert sun icon at index 2 (09:30), moon icon at index 3 (16:00)
  return (
    <div className="flex items-center justify-between px-4 pb-2 text-xs text-fg-3">
      {ticks.map((t, i) => (
        <span key={i} className="num inline-flex items-center gap-1">
          {i === 2 && <SunIcon />}
          {i === 3 && <MoonIcon />}
          {t}
        </span>
      ))}
    </div>
  );
}

function RangeTabs({
  ranges,
  active,
  onChange,
}: {
  ranges: IntradayRange[];
  active: IntradayRange;
  onChange: (r: IntradayRange) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-hairline px-4 py-2.5 text-sm">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "num inline-flex items-center px-1 transition-colors",
            r === active
              ? "font-bold text-fg-1"
              : "text-fg-3 hover:text-fg-1",
          )}
        >
          {r}
          {r === active && (
            <span
              aria-hidden
              className="absolute mt-6 h-0.5 w-4 -translate-x-1/2 translate-x-2 bg-fg-1"
            />
          )}
        </button>
      ))}
      <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-sm border border-hairline text-fg-3 hover:text-fg-1">
        ▦
      </span>
    </div>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="2" fill="var(--color-warn)" />
      <g stroke="var(--color-warn)" strokeWidth="1" strokeLinecap="round">
        <line x1="6" y1="1" x2="6" y2="2.5" />
        <line x1="6" y1="9.5" x2="6" y2="11" />
        <line x1="1" y1="6" x2="2.5" y2="6" />
        <line x1="9.5" y1="6" x2="11" y2="6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M9.5 7.5 a4.5 4.5 0 1 1 -5 -5 a3.5 3.5 0 0 0 5 5z"
        fill="var(--color-fg-3)"
      />
    </svg>
  );
}
