import { formatNum } from "@/lib/utils";
import { SectionHeader } from "./QuoteKV";

/**
 * 估值历史 — 5 年 P/E 时间序列折线
 * 占位数据(写死在组件内,可后续拆到 mock)
 */
const PE_SERIES = [
  { date: "2021", value: 28.2 },
  { date: "2022", value: 24.6 },
  { date: "2023", value: 31.4 },
  { date: "2024", value: 36.8 },
  { date: "2025", value: 33.2 },
  { date: "2026", value: 34.8 },
];

const PEER_AVG = 28.4;

export function ValuationHistory() {
  const max = Math.max(...PE_SERIES.map((d) => d.value)) * 1.1;
  const min = Math.min(...PE_SERIES.map((d) => d.value)) * 0.85;
  const range = max - min;
  const w = 600;
  const h = 140;
  const points = PE_SERIES.map((d, i) => {
    const x = (i / (PE_SERIES.length - 1)) * (w - 40) + 20;
    const y = h - ((d.value - min) / range) * (h - 30) - 15;
    return { x, y, ...d };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const peerY = h - ((PEER_AVG - min) / range) * (h - 30) - 15;

  return (
    <section className="border-b border-line">
      <SectionHeader label="Valuation History (P/E 5Y)" hint="VAL · HIST" />
      <div className="px-4 py-4">
        <div className="flex items-baseline gap-6 text-sm">
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">Current</span>
            <span className="num text-lg font-semibold text-accent">34.8x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">5Y Avg</span>
            <span className="num text-fg-1">31.5x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">Peer Avg</span>
            <span className="num text-fg-1">28.4x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">Premium</span>
            <span className="num text-warn">+22.5%</span>
          </span>
        </div>

        <svg aria-hidden="true"
          className="mt-3 block w-full"
          viewBox={`0 0 ${w} ${h}`}
          style={{ aspectRatio: `${w} / ${h}` }}
        >
          {/* peer avg horizontal */}
          <line
            x1="20"
            y1={peerY}
            x2={w - 20}
            y2={peerY}
            stroke="var(--color-fg-3)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          <text
            x={w - 25}
            y={peerY - 3}
            fontSize="9"
            fill="var(--color-fg-3)"
            style={{ fontFamily: "var(--font-num)" }}
            textAnchor="end"
          >
            Peer Avg {PEER_AVG}
          </text>

          {/* Area */}
          <path
            d={`${pathD} L ${points[points.length - 1].x},${h - 15} L ${points[0].x},${h - 15} Z`}
            fill="var(--color-accent)"
            className="opacity-10"
          />
          {/* Line */}
          <path d={pathD} stroke="var(--color-accent)" strokeWidth="1.5" fill="none" />

          {/* Points */}
          {points.map((p) => (
            <g key={p.date}>
              <circle cx={p.x} cy={p.y} r="3" fill="var(--color-accent)" />
              <text
                x={p.x}
                y={p.y - 8}
                fontSize="9"
                fill="var(--color-fg-1)"
                style={{ fontFamily: "var(--font-num)" }}
                textAnchor="middle"
                fontWeight="600"
              >
                {formatNum(p.value, 1)}
              </text>
              <text
                x={p.x}
                y={h - 2}
                fontSize="9"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
                textAnchor="middle"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
