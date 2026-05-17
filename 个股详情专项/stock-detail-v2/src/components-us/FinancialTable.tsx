import { useState } from "react";
import { cn, formatNum, formatPct } from "@/lib/utils";
import type { FinancialBarReport, FinancialQuarter } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface FinancialsBarsProps {
  reports: FinancialBarReport[];
}

/**
 * US 客户端 Financials — P/L / Balance sheet / Cash flow tab。
 * 每季度双柱(Revenue / Net income)+ Net margin 折线 overlay。
 * Hover 显示 tooltip(period / range / 3 KV)。
 */
export function FinancialTable({ reports }: FinancialsBarsProps) {
  const [tab, setTab] = useState<FinancialBarReport["title"]>(
    reports[0]?.title ?? "P/L",
  );
  const current = reports.find((r) => r.title === tab) ?? reports[0];

  return (
    <section className="border-b border-line">
      <SectionHeader label="Financials" hint="Quarterly" />
      <div className="px-4 pb-4">
        {/* Tab pills */}
        <div className="mb-3 flex items-center gap-1">
          {reports.map((r) => (
            <button
              key={r.title}
              type="button"
              onClick={() => setTab(r.title)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-semibold transition-colors",
                r.title === tab
                  ? "bg-fg-1 text-fg-inverse"
                  : "bg-card text-fg-3 hover:bg-soft hover:text-fg-1",
              )}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-xs">
          <Legend dot="bg-accent" label="Revenue" />
          <Legend dot="bg-accent/50" label="Net income" />
          <Legend dot="bg-warn" label="Net margin" line />
        </div>

        <BarLineChart quarters={current.quarters} />
      </div>
    </section>
  );
}

function Legend({
  dot,
  label,
  line,
}: {
  dot: string;
  label: string;
  line?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-fg-2">
      {line ? (
        <span className={cn("h-0.5 w-3", dot)} />
      ) : (
        <span className={cn("h-2 w-2 rounded-sm", dot)} />
      )}
      <span>{label}</span>
    </span>
  );
}

function BarLineChart({ quarters }: { quarters: FinancialQuarter[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 560;
  const H = 220;
  const PAD_X = 32;
  const PAD_TOP = 16;
  const PAD_BOT = 28;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;

  const maxBar = Math.max(...quarters.map((q) => q.revenue)) || 1;
  const slotW = innerW / quarters.length;
  const barW = Math.min(slotW * 0.18, 18);
  const gap = 4;

  const xAt = (i: number) => PAD_X + slotW * i + slotW / 2;
  const yBar = (v: number) => PAD_TOP + (1 - v / maxBar) * innerH;
  const yLine = (m: number) => PAD_TOP + (1 - m) * innerH;

  const linePath = quarters
    .map((q, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yLine(q.netMargin)}`)
    .join(" ");

  return (
    <div className="relative">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Horizontal grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_TOP + innerH * t}
            y2={PAD_TOP + innerH * t}
            stroke="var(--color-hairline)"
            strokeDasharray="2 4"
          />
        ))}

        {/* Bars per quarter */}
        {quarters.map((q, i) => {
          const cx = xAt(i);
          const x1 = cx - barW - gap / 2;
          const x2 = cx + gap / 2;
          const isHover = hoverIdx === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={cx - slotW / 2}
                y={PAD_TOP}
                width={slotW}
                height={innerH}
                fill="transparent"
              />
              <rect
                x={x1}
                y={yBar(q.revenue)}
                width={barW}
                height={PAD_TOP + innerH - yBar(q.revenue)}
                fill="var(--color-accent)"
                className={isHover ? "opacity-100" : "opacity-85"}
                rx={1.5}
              />
              <rect
                x={x2}
                y={yBar(q.netIncome)}
                width={barW}
                height={PAD_TOP + innerH - yBar(q.netIncome)}
                fill="var(--color-accent)"
                className={isHover ? "opacity-65" : "opacity-45"}
                rx={1.5}
              />
              <text
                x={cx}
                y={H - 10}
                textAnchor="middle"
                fontSize="11"
                fill={isHover ? "var(--color-fg-1)" : "var(--color-fg-3)"}
                fontWeight={isHover ? 700 : 400}
              >
                {q.period}
              </text>
            </g>
          );
        })}

        <path
          d={linePath}
          fill="none"
          stroke="var(--color-warn)"
          strokeWidth={1.8}
        />
        {quarters.map((q, i) => (
          <circle
            key={`m-${i}`}
            cx={xAt(i)}
            cy={yLine(q.netMargin)}
            r={3.5}
            fill="var(--color-warn)"
            stroke="var(--color-bg-2)"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {hoverIdx !== null && quarters[hoverIdx] && (
        <Tooltip q={quarters[hoverIdx]} idx={hoverIdx} total={quarters.length} />
      )}
    </div>
  );
}

function Tooltip({
  q,
  idx,
  total,
}: {
  q: FinancialQuarter;
  idx: number;
  total: number;
}) {
  const isLeft = idx < total / 2;
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-2 z-10 w-48 rounded-md border border-hairline-strong bg-card-2 p-3 text-xs shadow-lg",
        isLeft ? "left-1/2" : "right-1/2",
      )}
    >
      <div className="mb-1 font-semibold text-fg-1">{q.period}</div>
      <div className="num mb-2 text-fg-3">{q.rangeLabel}</div>
      <KVRow label="Revenue"    value={`$${formatNum(q.revenue, 2)}B`} />
      <KVRow label="Net income" value={`$${formatNum(q.netIncome, 2)}B`} />
      <KVRow label="Net margin" value={formatPct(q.netMargin * 100, 2)} />
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-fg-3">{label}</span>
      <span className="num font-semibold text-fg-1">{value}</span>
    </div>
  );
}
