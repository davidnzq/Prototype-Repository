"use client";

import { cn, formatNum, formatPct } from "@/lib/utils";
import type {
  AnalystConsensus as AC,
  AnalystRatingLabel,
} from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface AnalystConsensusProps {
  data: AC;
}

/**
 * 长桥版分析师评级
 *   左:Donut + 内嵌 6 段评级/占比图例(密度提升,无额外摘要)
 *   右:3 条折线图 — 股价 / 预测最高 / 预测最低(legend 即结尾值,贴图表)
 */
const SEGMENTS: {
  key: keyof AC["distribution"];
  label: AnalystRatingLabel;
  /** Tailwind dot class for legend swatch */
  dot: string;
  /** SVG fill color (CSS var) */
  color: string;
}[] = [
  { key: "strongBuy",    label: "强力推荐", dot: "bg-accent",     color: "var(--color-accent)" },
  { key: "buy",          label: "买入",     dot: "bg-up",         color: "var(--color-up)" },
  { key: "hold",         label: "持有",     dot: "bg-chart-grey", color: "var(--color-chart-grey)" },
  { key: "underperform", label: "跑输大盘", dot: "bg-warn",       color: "var(--color-warn)" },
  { key: "sell",         label: "卖出",     dot: "bg-down",       color: "var(--color-down)" },
  { key: "noOpinion",    label: "无意见",   dot: "bg-fg-4",       color: "var(--color-fg-4)" },
];

export function AnalystConsensus({ data: d }: AnalystConsensusProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="分析师评级" hint={d.updatedAt} />
      <div className="grid grid-cols-[minmax(420px,2fr)_3fr] items-start gap-6 px-4 py-3">
        {/* 左:Donut + 内嵌评级占比(评级与 % 紧贴一行,信息密度高)*/}
        <div className="grid grid-cols-[220px_1fr] items-center gap-4">
          <DonutChart distribution={d.distribution} total={d.totalAnalysts} />
          <RatingLegend distribution={d.distribution} consensus={d.consensus} />
        </div>

        {/* 右:3 条折线(顶部 legend 与左侧 donut 顶部对齐) */}
        <PriceChart history={d.priceHistory} />
      </div>
    </section>
  );
}

// ─── Donut ──────────────────────────────────────────────────────────

function DonutChart({
  distribution,
  total,
}: {
  distribution: AC["distribution"];
  total: number;
}) {
  const W = 220;
  const CX = W / 2;
  const CY = W / 2;
  const R_OUT = 92;
  const R_IN = 64;

  let cursor = -Math.PI / 2;
  const arcs = SEGMENTS.map((s) => {
    const pct = distribution[s.key];
    const start = cursor;
    const end = cursor + pct * Math.PI * 2;
    // eslint-disable-next-line react-hooks/immutability
    cursor = end;
    return { ...s, start, end, pct };
  });

  return (
    <svg
      aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${W}`}
      className="block max-w-[240px]"
    >
      {arcs.map(
        (a) =>
          a.pct > 0 && (
            <path
              key={a.key}
              d={arcPath(CX, CY, R_OUT, R_IN, a.start, a.end)}
              fill={a.color}
            />
          ),
      )}
      {/* 中心总数 */}
      <text
        x={CX}
        y={CY + 6}
        textAnchor="middle"
        fontSize="15"
        fill="var(--color-fg-2)"
      >
        <tspan
          className="num"
          fontSize="26"
          fontWeight="700"
          fill="var(--color-fg-1)"
        >
          {total}
        </tspan>
        <tspan dx="6" fontSize="12" fill="var(--color-fg-3)">
          位分析师
        </tspan>
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

// ─── 评级 inline legend(label + % 紧贴一行,高密度) ─────────────────

function RatingLegend({
  distribution,
  consensus,
}: {
  distribution: AC["distribution"];
  consensus: AnalystRatingLabel;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {SEGMENTS.map((s) => {
        const isActive = s.label === consensus;
        return (
          <li
            key={s.key}
            className="flex items-baseline gap-2 text-sm"
          >
            <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", s.dot)} />
            <span className={cn("truncate", isActive ? "font-semibold text-fg-1" : "text-fg-2")}>
              {s.label}
            </span>
            <span className={cn("num tabular-nums", isActive ? "font-semibold text-fg-1" : "text-fg-1")}>
              {formatPct(distribution[s.key] * 100, 0)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── 折线图 ──────────────────────────────────────────────────────────

function PriceChart({ history }: { history: AC["priceHistory"] }) {
  const VBW = 720;
  // VBH=220 → 与左侧 donut(220×220)高度对齐
  const VBH = 220;
  const PAD_X = 8;
  const Y_AXIS_W = 36; // Y 轴 label 区
  const PAD_TOP = 8;
  const PAD_BOT = 20;
  const innerW = VBW - PAD_X * 2 - Y_AXIS_W;
  const innerH = VBH - PAD_TOP - PAD_BOT;
  const X_START = PAD_X + Y_AXIS_W; // 3 条线起点都在横轴起点(0%)

  // 调整曲度差异:price 用原 close、predictHigh/Low 用 sin/cos 增强振幅以差异化
  // 不改 mock,仅在渲染时按比例增强
  const allValues = history.flatMap((h) => [
    h.price,
    h.predictHigh,
    h.predictLow,
  ]);
  const min = Math.floor(Math.min(...allValues) / 100) * 100;
  const max = Math.ceil(Math.max(...allValues) / 100) * 100;
  const range = max - min || 1;

  const xAt = (i: number) =>
    X_START + (i / (history.length - 1)) * innerW;
  const yAt = (v: number) =>
    PAD_TOP + (1 - (v - min) / range) * innerH;

  // Catmull-Rom 平滑(3 条线趋势/曲度有差异,平滑使其更柔和)
  const smoothLine = (vals: number[]) => {
    const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const last = history[history.length - 1];

  // Y 轴 4 个 tick(min / 1/3 / 2/3 / max)
  const yTicks = [0, 1 / 3, 2 / 3, 1].map((t) => Math.round(min + range * t));

  return (
    <div className="min-w-0">
      {/* 图例 — 顶部对齐 donut 顶部 */}
      <div className="mb-2 flex flex-wrap items-center justify-end gap-4 text-xs">
        <LegendDot color="var(--color-accent)" label="股价" value={last?.price} />
        <LegendDot color="var(--color-up)" label="预测最高价" value={last?.predictHigh} />
        <LegendDot color="var(--color-warn)" label="预测最低价" value={last?.predictLow} />
      </div>

      <svg
        aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${VBW} ${VBH}`}
        className="block w-full"
      >
        {/* Y 轴 grid + label */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={X_START}
              x2={VBW - PAD_X}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="var(--color-hairline)"
              strokeWidth="1"
            />
            <text
              x={PAD_X}
              y={yAt(v) + 4}
              fontSize="11"
              fill="var(--color-fg-3)"
              className="num"
            >
              {formatNum(v, 0)}
            </text>
          </g>
        ))}

        {/* 三条线(catmull-rom 平滑) */}
        <path
          d={smoothLine(history.map((h) => h.predictHigh))}
          fill="none"
          stroke="var(--color-up)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smoothLine(history.map((h) => h.price))}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smoothLine(history.map((h) => h.predictLow))}
          fill="none"
          stroke="var(--color-warn)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 末端 dot — 与对应主色对齐,fill 即 stroke 色 */}
        {last && (
          <>
            <circle cx={xAt(history.length - 1)} cy={yAt(last.price)} r="5" fill="var(--color-accent)" />
            <circle cx={xAt(history.length - 1)} cy={yAt(last.predictHigh)} r="5" fill="var(--color-up)" />
            <circle cx={xAt(history.length - 1)} cy={yAt(last.predictLow)} r="5" fill="var(--color-warn)" />
          </>
        )}
      </svg>
      <div className="mt-1 text-right text-2xs text-fg-3">最近 24 个月</div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value?: number;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 text-fg-2">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
      {typeof value === "number" && (
        <span className="num font-semibold text-fg-1">
          {formatNum(value, 3)}
        </span>
      )}
    </span>
  );
}
