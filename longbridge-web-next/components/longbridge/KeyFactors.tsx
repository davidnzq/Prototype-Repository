"use client";

import { useMemo, useState } from "react";
import type { KeyFactorNode, KeyFactorImportance } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface KeyFactorsProps {
  root: KeyFactorNode;
}

// 节点垂直行高(每个叶子节点占一行)
const ROW_H = 28;
// 每层水平距离
const COL_W = 168;
// 上下边距
const PAD_Y = 20;
const PAD_X = 24;

interface Positioned {
  node: KeyFactorNode;
  depth: number;
  y: number;             // 像素 Y(中心)
  leafCount: number;     // 子树叶子数
  childPositions: Positioned[];
}

// 递归布局:每个节点的 y = 子节点 y 的中点;叶子按 ROW_H 顺次排
function layout(node: KeyFactorNode, depth: number, cursor: { y: number }): Positioned {
  if (!node.children || node.children.length === 0) {
    const y = cursor.y;
    cursor.y += ROW_H;
    return { node, depth, y, leafCount: 1, childPositions: [] };
  }
  const childPositions = node.children.map((c) => layout(c, depth + 1, cursor));
  const first = childPositions[0].y;
  const last = childPositions[childPositions.length - 1].y;
  const y = (first + last) / 2;
  const leafCount = childPositions.reduce((s, p) => s + p.leafCount, 0);
  return { node, depth, y, leafCount, childPositions };
}

// 扁平化(渲染用)
function flatten(p: Positioned, acc: Positioned[] = []): Positioned[] {
  acc.push(p);
  p.childPositions.forEach((c) => flatten(c, acc));
  return acc;
}

// 取所有 (parent, child) 边
function edges(p: Positioned, acc: Array<[Positioned, Positioned]> = []): Array<[Positioned, Positioned]> {
  p.childPositions.forEach((c) => {
    acc.push([p, c]);
    edges(c, acc);
  });
  return acc;
}

// 构建 child.id -> parent.id 映射,用于回溯 ancestor path
function buildParentMap(p: Positioned, parentId: string | null, acc: Map<string, string | null>): void {
  acc.set(p.node.id, parentId);
  p.childPositions.forEach((c) => buildParentMap(c, p.node.id, acc));
}

// 从 nodeId 回溯到 root,返回沿途所有节点 id(含自身和 root)
function ancestorChain(nodeId: string, parentMap: Map<string, string | null>): Set<string> {
  const out = new Set<string>();
  let cur: string | null = nodeId;
  while (cur) {
    out.add(cur);
    cur = parentMap.get(cur) ?? null;
  }
  return out;
}

/**
 * 关键因子 — 长桥版思维导图
 * 中心节点(苹果)在左,子节点按层级向右展开
 * importance 3 色:high 实心绿 / medium 绿圆环 / low 灰
 * Plan13:hover 节点时,从根到该节点的连线 + 节点链高亮
 */
export function KeyFactors({ root }: KeyFactorsProps) {
  const { tree, allNodes, allEdges, parentMap, totalCount, importanceCount, width, height } = useMemo(() => {
    const cursor = { y: PAD_Y };
    const t = layout(root, 0, cursor);
    const nodes = flatten(t);
    const eds = edges(t);
    const pm = new Map<string, string | null>();
    buildParentMap(t, null, pm);
    const maxDepth = Math.max(...nodes.map((n) => n.depth));
    const h = cursor.y + PAD_Y;
    const w = PAD_X * 2 + (maxDepth + 1) * COL_W;
    const total = nodes.length;
    const ic = nodes
      .filter((p) => p.depth > 0)
      .reduce(
        (acc, p) => {
          acc[p.node.importance] = (acc[p.node.importance] ?? 0) + 1;
          return acc;
        },
        { high: 0, medium: 0, low: 0 } as Record<KeyFactorImportance, number>,
      );
    return { tree: t, allNodes: nodes, allEdges: eds, parentMap: pm, totalCount: total, importanceCount: ic, width: w, height: h };
  }, [root]);

  void tree;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const highlightedIds = useMemo(
    () => (hoveredId ? ancestorChain(hoveredId, parentMap) : null),
    [hoveredId, parentMap],
  );

  return (
    <section className="border-b border-line">
      <SectionHeader label="关键因子" hint={`共 ${totalCount} 个节点, 拖拽查看`} />

      {/* 图例 */}
      <div className="flex items-center gap-5 border-b border-hairline px-4 py-2 text-xs text-fg-3">
        <LegendDot importance="high" label={`重要 (${importanceCount.high})`} />
        <LegendDot importance="medium" label={`次要 (${importanceCount.medium})`} />
        <LegendDot importance="low" label={`一般 (${importanceCount.low})`} />
      </div>

      <div className="overflow-x-auto">
        <svg aria-hidden="true"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          style={{ minWidth: width }}
        >
          {/* 连接线 */}
          {allEdges.map(([from, to], i) => {
            const x1 = PAD_X + from.depth * COL_W + 6;
            const x2 = PAD_X + to.depth * COL_W - 6;
            const midX = (x1 + x2) / 2;
            const d = `M ${x1} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${x2} ${to.y}`;
            const isOn =
              highlightedIds !== null &&
              highlightedIds.has(from.node.id) &&
              highlightedIds.has(to.node.id);
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={isOn ? "var(--color-accent)" : "var(--color-hairline)"}
                strokeWidth={isOn ? 1.75 : 1}
              />
            );
          })}

          {/* 节点 */}
          {allNodes.map((p) => (
            <TreeNode
              key={p.node.id}
              positioned={p}
              highlighted={highlightedIds?.has(p.node.id) ?? false}
              onHover={setHoveredId}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

function TreeNode({
  positioned,
  highlighted,
  onHover,
}: {
  positioned: Positioned;
  highlighted: boolean;
  onHover: (id: string | null) => void;
}) {
  const { node, depth, y } = positioned;
  const cx = PAD_X + depth * COL_W;
  const labelX = cx + 10;

  const labelFill = highlighted
    ? "var(--color-accent)"
    : node.importance === "high"
      ? "var(--color-fg-1)"
      : node.importance === "medium"
        ? "var(--color-fg-2)"
        : "var(--color-fg-3)";

  return (
    <g
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* 透明 hit-rect,扩大命中区 */}
      <rect
        x={cx - 8}
        y={y - 12}
        width={COL_W}
        height={24}
        fill="transparent"
      />
      <ImportanceCircle
        cx={cx}
        cy={y}
        importance={node.importance}
        highlighted={highlighted}
      />
      <text
        x={labelX}
        y={y}
        dominantBaseline="middle"
        className="text-base"
        fill={labelFill}
        style={{
          fontWeight: highlighted ? 700 : depth === 0 ? 800 : node.importance === "high" ? 600 : 500,
          fontFamily: "var(--font-sans)",
        }}
      >
        {node.label}
      </text>
      {/* Plan9 — 叶子节点可选数值 */}
      {node.value && (
        <text
          x={labelX}
          y={y + 12}
          dominantBaseline="middle"
          fill="var(--color-fg-3)"
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-num)",
            fontWeight: 500,
          }}
        >
          {node.value}
        </text>
      )}
    </g>
  );
}

function ImportanceCircle({
  cx,
  cy,
  importance,
  highlighted = false,
}: {
  cx: number;
  cy: number;
  importance: KeyFactorImportance;
  highlighted?: boolean;
}) {
  if (importance === "high") {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={highlighted ? 6 : 5}
        fill="var(--color-accent)"
        stroke={highlighted ? "var(--color-accent)" : "none"}
        strokeWidth={highlighted ? 2 : 0}
        strokeOpacity={highlighted ? 0.35 : 0}
      />
    );
  }
  if (importance === "medium") {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={highlighted ? 6 : 5}
        fill="var(--color-bg-1)"
        stroke="var(--color-accent)"
        strokeWidth={highlighted ? 2.5 : 1.5}
      />
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={highlighted ? 5 : 4}
      fill={highlighted ? "var(--color-accent)" : "var(--color-fg-4)"}
    />
  );
}

function LegendDot({
  importance,
  label,
}: {
  importance: KeyFactorImportance;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
        <ImportanceCircle cx={6} cy={6} importance={importance} />
      </svg>
      <span>{label}</span>
    </span>
  );
}
