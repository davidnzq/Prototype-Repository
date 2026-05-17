import { useState } from "react";
import { cn, formatNum, formatPct } from "@/lib/utils";
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

        {/* KV list (6 rows,数值单位:量为 M shares, 价为 USD) */}
        <ul className="mb-4 space-y-1.5 border-t border-hairline pt-3 text-sm">
          <KVRow dot="bg-warn"   label="Short sale ratio" value={`${(d.metrics.shortSalePct * 100).toFixed(2)}%`} />
          <KVRow dot="bg-chart-blue" label={`${d.source} short vol.`} value={`${formatNum(d.metrics.nasdaq, 2)}M`} />
          <KVRow dot="bg-down"   label="Closing price"    value={`$${formatNum(d.metrics.closingPrice, 2)}`} />
          <KVRow                  label="Vol."             value={`${formatNum(d.metrics.volume, 2)}M`} />
          <KVRow                  label="Short vol."       value={`${formatNum(d.metrics.shortVolume, 2)}M`} />
          <KVRow                  label="%Chg"             value={formatPct(d.metrics.pctChg * 100, 2)} tone={d.metrics.pctChg < 0 ? "down" : "up"} />
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

/** 按 label 推断格式: % 用 formatPct(), 价格用 $formatNum() */
function formatLineValue(label: string, v: number): string {
  if (label.includes("%")) return `${v.toFixed(1)}%`;
  if (label.toLowerCase().includes("price")) return `$${formatNum(v, 2)}`;
  return formatNum(v, 2);
}

function LinesChart({ lines }: { lines: ShortingData["lines"] }) {
  const W = 540;
  const H = 150;
  const PAD_X_LEFT = 50;
  const PAD_X_RIGHT = 50;
  const PAD_Y_TOP = 22;
  const PAD_Y_BOT = 14;
  const innerW = W - PAD_X_LEFT - PAD_X_RIGHT;
  const innerH = H - PAD_Y_TOP - PAD_Y_BOT;

  // 每条线独立 normalize 到 innerH 高度(双 Y 轴)
  const paths = lines.map((line) => {
    const min = Math.min(...line.points);
    const max = Math.max(...line.points);
    const range = max - min || 1;
    const pts = line.points.map((v, i) => {
      const x = PAD_X_LEFT + (i / (line.points.length - 1)) * innerW;
      const y = PAD_Y_TOP + (1 - (v - min) / range) * innerH;
      return `${x},${y}`;
    });
    return { color: line.color, label: line.label, d: `M ${pts.join(" L ")}`, min, max };
  });

  return (
    <div>
      {/* Legend (位于图上方) */}
      <div className="mb-1 flex items-center gap-4 text-[11px] text-fg-3">
        {lines.map((l, i) => (
          <span key={i} className="num inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-0.5 w-3"
              style={{ background: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* 顶/底栅格 */}
        <line
          x1={PAD_X_LEFT} x2={W - PAD_X_RIGHT}
          y1={PAD_Y_TOP} y2={PAD_Y_TOP}
          stroke="var(--color-hairline)" strokeWidth="0.5"
        />
        <line
          x1={PAD_X_LEFT} x2={W - PAD_X_RIGHT}
          y1={PAD_Y_TOP + innerH} y2={PAD_Y_TOP + innerH}
          stroke="var(--color-hairline)" strokeWidth="0.5"
        />

        {paths.map((p, i) => {
          const onLeft = i === 0;
          const labelX = onLeft ? PAD_X_LEFT - 4 : W - PAD_X_RIGHT + 4;
          const anchor = onLeft ? "end" : "start";
          return (
            <g key={i}>
              {/* Y 轴 max / min 标签(按线对应位置) */}
              <text
                x={labelX} y={PAD_Y_TOP + 4}
                textAnchor={anchor} fontSize="10"
                fill={p.color} className="num"
              >
                {formatLineValue(p.label, p.max)}
              </text>
              <text
                x={labelX} y={PAD_Y_TOP + innerH + 2}
                textAnchor={anchor} fontSize="10"
                fill={p.color} className="num"
              >
                {formatLineValue(p.label, p.min)}
              </text>
              <path d={p.d} fill="none" stroke={p.color} strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>
    </div>
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
  const H = 90;
  const PAD_X_LEFT = 50;
  const PAD_X_RIGHT = 50;
  const PAD_Y_TOP = 16;
  const PAD_Y_BOT = 14;
  const innerW = W - PAD_X_LEFT - PAD_X_RIGHT;
  const innerH = H - PAD_Y_TOP - PAD_Y_BOT;

  const max = Math.max(...bars) || 1;
  const slotW = innerW / bars.length;
  const barW = slotW * 0.55;

  return (
    <div className="mt-2">
      <div className="mb-1 text-[11px] text-fg-3">
        Short volume (M shares)
      </div>
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Y 轴 max 标签 */}
        <text
          x={PAD_X_LEFT - 4} y={PAD_Y_TOP + 4}
          textAnchor="end" fontSize="10"
          fill="var(--color-fg-3)" className="num"
        >
          {max.toFixed(1)}M
        </text>
        <text
          x={PAD_X_LEFT - 4} y={PAD_Y_TOP + innerH + 2}
          textAnchor="end" fontSize="10"
          fill="var(--color-fg-3)" className="num"
        >
          0
        </text>

        {/* Y 轴底线 */}
        <line
          x1={PAD_X_LEFT} x2={W - PAD_X_RIGHT}
          y1={PAD_Y_TOP + innerH} y2={PAD_Y_TOP + innerH}
          stroke="var(--color-hairline)" strokeWidth="0.5"
        />

        {bars.map((v, i) => {
          const x = PAD_X_LEFT + slotW * i + (slotW - barW) / 2;
          const h = (v / max) * innerH;
          const y = PAD_Y_TOP + innerH - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={Math.max(1, h)}
              fill="var(--color-chart-blue)"
              opacity="0.7"
              rx={1}
            />
          );
        })}
        {labels.map((l, i) => {
          const x = PAD_X_LEFT + (i / (labels.length - 1)) * innerW;
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
    </div>
  );
}
