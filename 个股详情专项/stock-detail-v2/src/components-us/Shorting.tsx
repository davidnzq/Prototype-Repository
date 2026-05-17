import { useState } from "react";
import { cn, formatNum, formatPct, formatCompact } from "@/lib/utils";
import type { ShortingData, ShortingTab } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface ShortingProps {
  data: ShortingData;
}

/**
 * US 客户端 Shorting — 对应 PDF "Shorting"。
 *   Short sale ratio / Short position ratio 双 tab + 数据源 hint。
 *   日期 + 6 KV(Short sale % / NASDAQ / Closing price / Vol. / Short vol. / %Chg)。
 *   三线图 + 底部量柱。
 */
export function Shorting({ data: d }: ShortingProps) {
  const [tab, setTab] = useState<ShortingTab>(d.activeTab);

  return (
    <section className="border-b border-line">
      <SectionHeader label="Shorting" hint="" />
      <div className="px-4 pb-4">
        {/* Source disclaimer */}
        <p className="mb-3 text-xs text-fg-3">
          Data source is from {d.source}, for reference only.
        </p>

        {/* Tabs */}
        <div className="mb-3 flex items-center gap-1">
          {(["sale", "position"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                tab === k
                  ? "bg-card-2 text-fg-1"
                  : "border border-hairline text-fg-3 hover:text-fg-1",
              )}
            >
              {k === "sale" ? "Short sale ratio" : "Short position ratio"}
            </button>
          ))}
        </div>

        {/* Date strip */}
        <div className="mb-3 flex items-center gap-2 text-xs">
          <CalendarDot />
          <span className="text-fg-3">Date</span>
          <span className="num ml-auto font-semibold text-fg-1">
            {d.metrics.date}
          </span>
        </div>

        {/* KV list (6 rows) */}
        <ul className="mb-4 space-y-1.5 border-t border-hairline pt-3 text-sm">
          <KVRow dot="bg-warn"   label="Short sale (%)" value={formatPct(d.metrics.shortSalePct * 100, 2)} />
          <KVRow dot="bg-accent" label={d.source}        value={formatNum(d.metrics.nasdaq, 2)} />
          <KVRow dot="bg-down"   label="Closing price"   value={formatNum(d.metrics.closingPrice, 2)} />
          <KVRow                  label="Vol."            value={formatNum(d.metrics.volume, 2)} />
          <KVRow                  label="Short vol."      value={formatNum(d.metrics.shortVolume, 2)} />
          <KVRow                  label="%Chg"            value={formatPct(d.metrics.pctChg * 100, 2)} tone={d.metrics.pctChg < 0 ? "down" : "up"} />
        </ul>

        {/* 3-line chart */}
        <LinesChart lines={d.lines} />

        {/* Volume bars */}
        <VolumeBars bars={d.volumeBars} labels={d.xLabels} />
      </div>
    </section>
  );
}

function CalendarDot() {
  return (
    <span className="inline-flex h-3 w-3 items-center justify-center text-fg-3">
      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 11 11" fill="none">
        <rect x="1" y="2" width="9" height="8" rx="1" stroke="currentColor" />
        <line x1="1" y1="4" x2="10" y2="4" stroke="currentColor" />
      </svg>
    </span>
  );
}

function KVRow({
  dot,
  label,
  value,
  tone,
}: {
  dot?: string;
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <li className="flex items-center text-fg-2">
      {dot && <span className={cn("mr-2 h-2 w-2 rounded-full", dot)} />}
      <span className="flex-1">{label}</span>
      <span
        className={cn(
          "num font-semibold",
          tone === "up"   ? "text-up"
          : tone === "down" ? "text-down"
          :                   "text-fg-1",
        )}
      >
        {value}
      </span>
    </li>
  );
}

function LinesChart({ lines }: { lines: ShortingData["lines"] }) {
  const W = 540;
  const H = 130;
  const PAD_X = 36;
  const PAD_Y = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  // Each line is normalized independently to fit innerH
  const paths = lines.map((line) => {
    const min = Math.min(...line.points);
    const max = Math.max(...line.points);
    const range = max - min || 1;
    const pts = line.points.map((v, i) => {
      const x = PAD_X + (i / (line.points.length - 1)) * innerW;
      const y = PAD_Y + (1 - (v - min) / range) * innerH;
      return `${x},${y}`;
    });
    return { color: line.color, d: `M ${pts.join(" L ")}`, min, max };
  });

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-32 w-full"
    >
      {paths.map((p, i) => (
        <g key={i}>
          {/* L axis: min/max label on left, top/bottom for this line */}
          <text
            x={6}
            y={PAD_Y + 10 + i * 14}
            fontSize="9"
            fill={p.color}
            className="num"
          >
            {formatPct(p.max, 2)}
          </text>
          <path d={p.d} fill="none" stroke={p.color} strokeWidth="1.4" />
        </g>
      ))}
    </svg>
  );
}

function VolumeBars({
  bars,
  labels,
}: {
  bars: number[];
  labels: string[];
}) {
  const W = 540;
  const H = 80;
  const PAD_X = 16;
  const PAD_Y = 6;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2 - 14;

  const max = Math.max(...bars) || 1;
  const slotW = innerW / bars.length;
  const barW = slotW * 0.55;

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-1 block h-20 w-full"
    >
      <text x={6} y={PAD_Y + 10} fontSize="10" fill="var(--color-fg-4)" className="num">
        {formatCompact(max)}
      </text>
      {bars.map((v, i) => {
        const x = PAD_X + slotW * i + (slotW - barW) / 2;
        const h = (v / max) * innerH;
        const y = PAD_Y + innerH - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            fill="var(--color-accent)"
            className="opacity-70"
            rx={1}
          />
        );
      })}
      {labels.map((l, i) => {
        const x = PAD_X + (i / (labels.length - 1)) * innerW;
        return (
          <text
            key={l}
            x={x}
            y={H - 2}
            textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="var(--color-fg-3)"
            className="num"
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}
