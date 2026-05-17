import { ChevronDown } from "lucide-react";
import { cn, formatPct } from "@/lib/utils";
import type {
  RevenueCompositionData,
  SankeyKind,
  SankeyLink,
  SankeyNode,
} from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface RevenueCompositionProps {
  data: RevenueCompositionData;
}

/**
 * US 客户端 Revenue breakdown — 5 阶段桑基图。
 *   Stage 0: 5 个营收来源 (Cloud / Computer / Graphics / Network / Others, 蓝)
 *   Stage 1: Revenue 汇总节点 (蓝)
 *   Stage 2: Gross profit (绿) + Cost of revenue (橙)
 *   Stage 3: Operating income (绿) + Operating expenses (橙)
 *   Stage 4: Net income / Tax expense / Others / SG&A / R&D
 *
 *   连线宽度 ∝ flow value, 颜色随 to 节点 kind。Bezier 平滑曲线。
 */
export function RevenueComposition({ data: d }: RevenueCompositionProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Revenue breakdown">
        <CycleSelector value={d.cycle} />
      </SectionHeader>

      <div className="px-4 pb-4 pt-3">
        {/* Legend */}
        <div className="mb-3 flex items-center gap-4 text-xs">
          <Legend kind="revenue" label="Revenue" />
          <Legend kind="profit"  label="Profit" />
          <Legend kind="cost"    label="Cost" />
        </div>

        {/* Sankey */}
        <SankeyChart nodes={d.nodes} links={d.links} />

        {/* X 轴 period 选择(Q3/Q4/Q1/Q2),active 加底色 */}
        <div className="mt-3 flex items-center gap-6 px-2 text-xs">
          {d.periods.map((p) => (
            <button
              key={p}
              type="button"
              className={cn(
                "rounded-sm px-2 py-0.5 num transition-colors",
                p === d.activePeriod
                  ? "bg-card-2 font-semibold text-fg-1"
                  : "text-fg-3 hover:text-fg-1",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Cycle 选择器 (Quarterly ▾)
 * ───────────────────────────────────────────────────────────── */
function CycleSelector({ value }: { value: "Quarterly" | "Annual" }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-bg-2 px-2 py-0.5 text-xs text-fg-1"
    >
      <span>{value}</span>
      <ChevronDown size={12} className="text-fg-3" />
    </button>
  );
}

function Legend({ kind, label }: { kind: SankeyKind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-fg-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: kindColor(kind) }}
      />
      <span>{label}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SankeyChart — 多阶段 Sankey 主渲染
 * ───────────────────────────────────────────────────────────── */
function SankeyChart({
  nodes,
  links,
}: {
  nodes: SankeyNode[];
  links: SankeyLink[];
}) {
  const W = 780;
  const H = 480;
  // 留出 label 空间 — 左/右 label, 中列 label 在节点上方
  //   "Cloud service" / "Operating expenses" ≈ 90px @11px font, 需 100 留余
  const LEFT_LABEL_W = 100;
  const RIGHT_LABEL_W = 100;
  const TOP_LABEL_H = 36;
  const BOT_PAD = 8;
  const NODE_W = 10;
  const NODE_GAP_Y = 14;
  const innerW = W - LEFT_LABEL_W - RIGHT_LABEL_W;
  const innerH = H - TOP_LABEL_H - BOT_PAD;

  // 按 stage 分组节点
  const stages: SankeyNode[][] = [];
  nodes.forEach((n) => {
    if (!stages[n.stage]) stages[n.stage] = [];
    stages[n.stage].push(n);
  });
  const stageCount = stages.length;

  // 每个 stage 的 X 中心位置
  const stageX = (s: number) =>
    LEFT_LABEL_W + (innerW / (stageCount - 1)) * s;

  // 每个 stage 的总高度(由节点 rawValue 之和决定)
  // 用最大 stage 总和作为 scale 基准 → 等比映射
  const stageSum = stages.map((stg) => stg.reduce((a, n) => a + n.rawValue, 0));
  const maxStageSum = Math.max(...stageSum);

  // Layout: 计算每个 node 的 y, h
  const layout = new Map<string, { x: number; y: number; w: number; h: number }>();
  stages.forEach((stg, sIdx) => {
    const totalGap = NODE_GAP_Y * (stg.length - 1);
    const usableH = innerH - totalGap;
    // 该 stage 节点总高度
    const scale = (usableH * (stageSum[sIdx] / maxStageSum)) / stageSum[sIdx];
    // 算各节点高度 + 起始 y(整体居中)
    const stageTotalH = stg.reduce((a, n) => a + n.rawValue * scale, 0) + totalGap;
    let cursorY = TOP_LABEL_H + (innerH - stageTotalH) / 2;
    stg.forEach((n) => {
      const h = Math.max(8, n.rawValue * scale);
      layout.set(n.id, {
        x: stageX(sIdx) - NODE_W / 2,
        y: cursorY,
        w: NODE_W,
        h,
      });
      cursorY += h + NODE_GAP_Y;
    });
  });

  // 计算 link 在 from / to 节点边界上的 y 偏移(按 link 出现顺序堆叠)
  const fromOffset = new Map<string, number>();
  const toOffset = new Map<string, number>();
  const linkLayouts = links.map((lk) => {
    const fromBox = layout.get(lk.from)!;
    const toBox = layout.get(lk.to)!;
    // flow 在 from 节点中占的高度
    const fromNode = nodes.find((n) => n.id === lk.from)!;
    const toNode = nodes.find((n) => n.id === lk.to)!;
    const fromFlowH = (lk.value / fromNode.rawValue) * fromBox.h;
    const toFlowH = (lk.value / toNode.rawValue) * toBox.h;
    const fOff = fromOffset.get(lk.from) ?? 0;
    const tOff = toOffset.get(lk.to) ?? 0;
    fromOffset.set(lk.from, fOff + fromFlowH);
    toOffset.set(lk.to, tOff + toFlowH);
    return {
      x1: fromBox.x + fromBox.w,
      y1: fromBox.y + fOff + fromFlowH / 2,
      x2: toBox.x,
      y2: toBox.y + tOff + toFlowH / 2,
      h1: fromFlowH,
      h2: toFlowH,
      color: kindColor(toNode.kind),
    };
  });

  return (
    <div className="relative w-full">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full"
      >
        {/* Flows (Bezier) 先画, 节点压顶 */}
        {linkLayouts.map((lk, i) => (
          <path
            key={`fl-${i}`}
            d={flowPath(lk.x1, lk.y1, lk.x2, lk.y2, lk.h1, lk.h2)}
            fill={lk.color}
            opacity="0.32"
          />
        ))}

        {/* Nodes */}
        {nodes.map((n) => {
          const box = layout.get(n.id)!;
          const isLeftCol = n.stage === 0;
          const isRightCol = n.stage === stageCount - 1;
          let labelX: number;
          let labelAnchor: "start" | "end" | "middle";
          let valueY: number, pctY: number, labelY: number;

          if (isLeftCol) {
            // 左对齐到节点左侧, 3 行垂直居中
            labelX = box.x - 6;
            labelAnchor = "end";
            const cy = box.y + box.h / 2;
            valueY = cy - 8;
            pctY   = cy + 5;
            labelY = cy + 17;
          } else if (isRightCol) {
            // 右对齐到节点右侧
            labelX = box.x + box.w + 6;
            labelAnchor = "start";
            const cy = box.y + box.h / 2;
            valueY = cy - 8;
            pctY   = cy + 5;
            labelY = cy + 17;
          } else {
            // 中间列: 标签位于节点上方, 3 行垂直堆叠 (value 最上, label 最下贴近节点)
            labelX = box.x + box.w / 2;
            labelAnchor = "middle";
            labelY = box.y - 2;
            pctY   = labelY - 12;
            valueY = pctY - 12;
          }

          return (
            <g key={n.id}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={2}
                fill={kindColor(n.kind)}
              />
              {/* value */}
              <text
                x={labelX}
                y={valueY}
                textAnchor={labelAnchor}
                fontSize="11"
                fontWeight="700"
                fill="var(--color-fg-1)"
                className="num"
              >
                {n.value}
              </text>
              {/* pct */}
              <text
                x={labelX}
                y={pctY}
                textAnchor={labelAnchor}
                fontSize="10"
                fontWeight="600"
                fill={n.pct < 0 ? "var(--color-down)" : "var(--color-up)"}
                className="num"
              >
                {n.pct < 0 ? "▼" : "▲"}
                {formatPct(Math.abs(n.pct) * 100, 2)}
              </text>
              {/* label */}
              <text
                x={labelX}
                y={labelY}
                textAnchor={labelAnchor}
                fontSize="10"
                fill="var(--color-fg-3)"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 颜色映射
 * ───────────────────────────────────────────────────────────── */
function kindColor(kind: SankeyKind): string {
  switch (kind) {
    case "revenue": return "var(--color-chart-blue)";
    case "profit":  return "var(--color-up)";
    case "cost":    return "var(--color-warn)";
  }
}

/* ─────────────────────────────────────────────────────────────
 * Flow path (Bezier) — 平滑过渡, h1 → h2 流宽
 * ───────────────────────────────────────────────────────────── */
function flowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  h1: number,
  h2: number,
): string {
  const cx = (x1 + x2) / 2;
  const t1 = y1 - h1 / 2;
  const b1 = y1 + h1 / 2;
  const t2 = y2 - h2 / 2;
  const b2 = y2 + h2 / 2;
  return [
    `M ${x1} ${t1}`,
    `C ${cx} ${t1}, ${cx} ${t2}, ${x2} ${t2}`,
    `L ${x2} ${b2}`,
    `C ${cx} ${b2}, ${cx} ${b1}, ${x1} ${b1}`,
    "Z",
  ].join(" ");
}
