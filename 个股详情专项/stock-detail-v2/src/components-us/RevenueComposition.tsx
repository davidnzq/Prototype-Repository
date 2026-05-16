import { cn, formatPct } from "@/lib/utils";
import type { RevenueCompositionData, SankeyNode } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface RevenueCompositionProps {
  data: RevenueCompositionData;
}

/**
 * US 客户端 Revenue breakdown — Sankey 流向图。
 *   左侧 5 个 segment 节点 → 用 Bezier 曲线流向中心 Revenue 大节点。
 *   每个节点显示 value + signed pct (up / down 着色)。
 *   底部 X 轴显示季度时间标签(装饰,反映数据时间窗口)。
 *
 * 图例:Revenue / Profit / Cost — 视觉用 accent / up / down 区分流向粗细。
 */
export function RevenueComposition({ data: d }: RevenueCompositionProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader
        label="Revenue breakdown"
        hint={d.cycle}
      />
      <div className="px-4 pb-4">
        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-xs">
          <Legend dot="bg-accent" label="Revenue" />
          <Legend dot="bg-up"     label="Profit" />
          <Legend dot="bg-down"   label="Cost" />
        </div>

        <SankeyChart segments={d.segments} revenue={d.revenue} periods={d.periods} />
      </div>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-fg-2">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span>{label}</span>
    </span>
  );
}

function SankeyChart({
  segments,
  revenue,
  periods,
}: {
  segments: SankeyNode[];
  revenue: SankeyNode;
  periods: string[];
}) {
  const W = 640;
  const H = 320;
  const PAD_X = 16;
  const PAD_Y = 16;
  const NODE_W = 8;
  const innerH = H - PAD_Y * 2 - 24; // 24 reserved for x-axis labels
  const slotH = innerH / segments.length;
  const segNodeH = Math.min(slotH * 0.7, 48);

  // Left segment node x position
  const leftX = PAD_X + 92;        // leave space for left labels
  // Right revenue node x position
  const rightX = W - PAD_X - 100;  // leave space for right labels
  const revNodeH = innerH * 0.75;
  const revNodeY = PAD_Y + (innerH - revNodeH) / 2;

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-80 w-full"
    >
      {/* Flows (Bezier curves) drawn first so nodes overlay */}
      {segments.map((s, i) => {
        const segY = PAD_Y + slotH * i + (slotH - segNodeH) / 2;
        const segMidY = segY + segNodeH / 2;
        const revY =
          revNodeY + (revNodeH / segments.length) * i +
          (revNodeH / segments.length) / 2;
        const flowH = segNodeH * 0.9;
        const isDown = s.pct < 0;
        return (
          <path
            key={`flow-${i}`}
            d={flowPath(leftX + NODE_W, segMidY, rightX, revY, flowH)}
            fill={isDown ? "var(--color-down)" : "var(--color-accent)"}
            className="opacity-35"
          />
        );
      })}

      {/* Left segment nodes */}
      {segments.map((s, i) => {
        const segY = PAD_Y + slotH * i + (slotH - segNodeH) / 2;
        const midY = segY + segNodeH / 2;
        const isDown = s.pct < 0;
        return (
          <g key={`seg-${i}`}>
            <rect
              x={leftX}
              y={segY}
              width={NODE_W}
              height={segNodeH}
              rx={2}
              fill={isDown ? "var(--color-down)" : "var(--color-accent)"}
            />
            {/* Left labels (value + pct) */}
            <text
              x={leftX - 6}
              y={midY - 6}
              textAnchor="end"
              fontSize="13"
              fontWeight="700"
              fill="var(--fg-1)"
              className="num"
            >
              {s.value}
            </text>
            <text
              x={leftX - 6}
              y={midY + 9}
              textAnchor="end"
              fontSize="11"
              fontWeight="600"
              fill={isDown ? "var(--color-down)" : "var(--color-up)"}
              className="num"
            >
              {isDown ? "▼" : "▲"}
              {formatPct(Math.abs(s.pct) * 100, 2)}
            </text>
            <text
              x={leftX + NODE_W + 4}
              y={midY + 4}
              fontSize="11"
              fill="var(--fg-3)"
            >
              {s.label}
            </text>
          </g>
        );
      })}

      {/* Center Revenue node */}
      <rect
        x={rightX}
        y={revNodeY}
        width={NODE_W}
        height={revNodeH}
        rx={2}
        fill="var(--color-accent)"
      />
      <text
        x={rightX + NODE_W + 6}
        y={revNodeY + revNodeH / 2 - 6}
        fontSize="14"
        fontWeight="700"
        fill="var(--fg-1)"
        className="num"
      >
        {revenue.value}
      </text>
      <text
        x={rightX + NODE_W + 6}
        y={revNodeY + revNodeH / 2 + 9}
        fontSize="11"
        fontWeight="600"
        fill={revenue.pct < 0 ? "var(--color-down)" : "var(--color-up)"}
        className="num"
      >
        {revenue.pct < 0 ? "▼" : "▲"}
        {formatPct(Math.abs(revenue.pct) * 100, 2)}
      </text>
      <text
        x={rightX + NODE_W + 6}
        y={revNodeY + revNodeH / 2 + 24}
        fontSize="11"
        fill="var(--fg-3)"
      >
        {revenue.label}
      </text>

      {/* X-axis labels */}
      {periods.map((p, i) => {
        const slotW = (W - PAD_X * 2) / periods.length;
        const x = PAD_X + slotW * i + slotW / 2;
        return (
          <text
            key={p}
            x={x}
            y={H - 4}
            textAnchor="middle"
            fontSize="11"
            fill="var(--fg-3)"
          >
            {p}
          </text>
        );
      })}
    </svg>
  );
}

function flowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  h: number,
): string {
  const cx = (x1 + x2) / 2;
  // Top edge from (x1, y1 - h/2) to (x2, y2 - h/2) via bezier
  // Bottom edge back from (x2, y2 + h/2) to (x1, y1 + h/2)
  const topY1 = y1 - h / 2;
  const botY1 = y1 + h / 2;
  const topY2 = y2 - h / 2;
  const botY2 = y2 + h / 2;
  return [
    `M ${x1} ${topY1}`,
    `C ${cx} ${topY1}, ${cx} ${topY2}, ${x2} ${topY2}`,
    `L ${x2} ${botY2}`,
    `C ${cx} ${botY2}, ${cx} ${botY1}, ${x1} ${botY1}`,
    "Z",
  ].join(" ");
}
