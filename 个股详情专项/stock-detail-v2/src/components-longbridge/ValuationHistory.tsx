import { formatNum } from "@/lib/utils";
import { mockValuationHistoryRolling } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

/**
 * 估值历史 — 5 年 P/E 时间序列折线
 * 数据来源:mockValuationHistoryRolling
 */
export function ValuationHistory() {
  const { series, peerAvg, current, fiveYAvg, premiumVsPeer } = mockValuationHistoryRolling;

  // ── 布局常量 ────────────────────────────────────────────────
  const w = 640;
  const h = 180;
  const padL = 40; // 左侧留 Y 轴刻度
  const padR = 20;
  const padTop = 18;
  const padBottom = 22;

  // ── 数据范围 ────────────────────────────────────────────────
  const seriesMin = Math.min(...series.map((d) => d.value));
  const seriesMax = Math.max(...series.map((d) => d.value));
  const min = Math.min(seriesMin, peerAvg) * 0.9;
  const max = Math.max(seriesMax, peerAvg) * 1.08;
  const range = max - min || 1;

  const innerW = w - padL - padR;
  const innerH = h - padTop - padBottom;

  const xAt = (i: number) =>
    padL + (i / (series.length - 1)) * innerW;
  const yAt = (v: number) =>
    padTop + (1 - (v - min) / range) * innerH;

  const points = series.map((d, i) => ({ x: xAt(i), y: yAt(d.value), ...d }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");
  const peerY = yAt(peerAvg);
  const bottomY = padTop + innerH;

  // ── Y 轴刻度(3 档:min / mid / max) ──────────────────────
  const ticks = [
    { value: max, y: yAt(max) },
    { value: (max + min) / 2, y: yAt((max + min) / 2) },
    { value: min, y: yAt(min) },
  ];

  return (
    <section className="border-b border-line">
      <SectionHeader label="估值历史 — 近 5 年市盈率 (P/E)" hint="估值历史 (5Y)" />
      <div className="px-4 py-4">
        <div className="flex items-baseline gap-6 text-sm">
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">当前</span>
            <span className="num text-lg font-semibold text-accent">{formatNum(current, 1)}x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">5 年均值</span>
            <span className="num text-fg-1">{formatNum(fiveYAvg, 1)}x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">同行均值</span>
            <span className="num text-fg-1">{formatNum(peerAvg, 1)}x</span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="caps">相对溢价</span>
            <span className="num text-fg-1">
              {premiumVsPeer > 0 ? "+" : ""}
              {formatNum(premiumVsPeer, 1)}%
            </span>
            <span className="text-fg-3 text-xs">vs 同行</span>
          </span>
        </div>

        <svg
          aria-hidden="true"
          className="mt-3 block w-full"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y 轴刻度 */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={t.y}
                x2={w - padR}
                y2={t.y}
                stroke="var(--color-hairline)"
                strokeWidth="0.6"
              />
              <text
                x={padL - 6}
                y={t.y}
                fontSize="10"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {formatNum(t.value, 1)}x
              </text>
            </g>
          ))}

          {/* peer avg horizontal */}
          <line
            x1={padL}
            y1={peerY}
            x2={w - padR}
            y2={peerY}
            stroke="var(--color-fg-3)"
            strokeWidth="1.0"
            strokeDasharray="3 3"
          />
          <text
            x={w - padR - 4}
            y={peerY - 3}
            fontSize="9"
            fill="var(--color-fg-3)"
            style={{ fontFamily: "var(--font-num)" }}
            textAnchor="end"
          >
            同行均值 {formatNum(peerAvg, 1)}
          </text>

          {/* Area */}
          <path
            d={`${pathD} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`}
            fill="var(--color-accent)"
            className="opacity-10"
          />
          {/* Line */}
          <path d={pathD} stroke="var(--color-accent)" strokeWidth="1.5" fill="none" />

          {/* Points + 年份 */}
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
                y={h - 4}
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
