"use client";

import { useState } from "react";
import { cn, formatNum, formatPct } from "@/lib/utils";
import type { ValuationMetric } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface ValuationProps {
  metrics: ValuationMetric[];
}

const RANGES = ["1年", "3年", "5年", "10年"] as const;
type RangeKey = (typeof RANGES)[number];

/** mock label → 带英文括注的展示 label */
const LABEL_MAP: Record<string, string> = {
  "市盈率": "市盈率 (P/E)",
  "市净率": "市净率 (P/B)",
  "市销率": "市销率 (P/S)",
  "股息率": "股息率 (Dividend Yield)",
  "P/E": "市盈率 (P/E)",
  "P/B": "市净率 (P/B)",
  "P/S": "市销率 (P/S)",
  "Dividend": "股息率 (Dividend Yield)",
};
function displayLabel(label: string): string {
  return LABEL_MAP[label] ?? label;
}

/**
 * 估值分析 — 长桥版
 * 4 个 metric 卡片 2×2 grid,每张:
 *   - 顶部:metric label + current value + 同行业排名 + 时间区间 tab
 *   - 中部:股价折线 + 高/中/低分位 dashed reference 线
 *   - 图例 dot:股价 / 高分位 / 中位 / 低分位
 */
export function Valuation({ metrics }: ValuationProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="估值分析" />
      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
        {metrics.map((m) => (
          <ValuationCard key={m.key} metric={m} />
        ))}
      </div>
    </section>
  );
}

function ValuationCard({ metric: m }: { metric: ValuationMetric }) {
  const [range, setRange] = useState<RangeKey>("1年");

  return (
    <div className="border border-hairline px-4 py-3">
      {/* 顶部:label + 时间区间 tab */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-fg-1">{displayLabel(m.label)}</span>
        <div className="flex items-center gap-0.5 text-xs">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-sm px-2 py-0.5 transition-colors",
                r === range
                  ? "bg-accent/15 text-accent"
                  : "text-fg-3 hover:text-fg-1",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KV:current + 排名 */}
      <div className="mb-2 flex items-baseline gap-6">
        <div>
          <div className="text-xs text-fg-3">{displayLabel(m.label)}</div>
          <div className="num text-lg font-semibold text-fg-1">
            {formatValuationValue(m.current, m.format)}
          </div>
        </div>
        <div>
          <div className="text-xs text-fg-3">同行业排名</div>
          <div className="num text-lg font-semibold text-fg-1">
            {m.rank.rank}/{m.rank.total}
          </div>
        </div>
      </div>

      {/* 图例(5 项,第一项跟卡片标题动态对应) — 位于大字 label 下方 */}
      <div className="mb-1.5 flex flex-wrap items-center gap-3 text-xs text-fg-3">
        <LegendDot color="var(--color-accent)" label={m.label} />
        <LegendDot color="var(--color-chart-blue)" label="股价" />
        <LegendDot color="var(--color-warn)" label="高分位" />
        <LegendDot color="var(--color-fg-3)" label="中位数" />
        <LegendDot color="var(--color-chart-blue)" label="低分位" />
      </div>

      <ValuationMiniChart metric={m} />

      {/* Y 轴范围标签 */}
      <div className="num mt-1 flex justify-between text-xs text-fg-3">
        <span>{m.history[0]?.date}</span>
        <span>{m.history[m.history.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function ValuationMiniChart({ metric: m }: { metric: ValuationMetric }) {
  // viewBox 设计:VBW=600 匹配 Card 在 1280 容器内 2 列 grid 的实际宽度,SVG width=100%
  const W = 600;
  const H = 172;
  const PAD = 6;
  const PAD_TOP = 16; // 给 text label 让位,避免裁切

  const all = [
    ...m.history.map((p) => p.price),
    m.percentiles.high,
    m.percentiles.median,
    m.percentiles.low,
  ];
  const maxV = Math.max(...all);
  const minV = Math.min(...all);
  const range = maxV - minV || 1;

  const xAt = (i: number) =>
    PAD + (i / (m.history.length - 1)) * (W - PAD * 2);
  const yAt = (v: number) =>
    PAD_TOP + (1 - (v - minV) / range) * (H - PAD_TOP - PAD);

  const priceLine = m.history
    .map((p, i) => `${xAt(i)},${yAt(p.price)}`)
    .join(" ");

  // 区域填充(price line below to baseline)
  const baseY = H - PAD;
  const areaPath = `M ${xAt(0)},${baseY} L ${m.history
    .map((p, i) => `${xAt(i)},${yAt(p.price)}`)
    .join(" L ")} L ${xAt(m.history.length - 1)},${baseY} Z`;

  return (
    <svg
      aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
    >
      {/* 区域填充 */}
      <path d={areaPath} fill="var(--color-accent)" fillOpacity="0.14" />

      {/* 分位虚线 */}
      <ReferenceLine y={yAt(m.percentiles.high)} color="var(--color-warn)" width={W} />
      <ReferenceLine y={yAt(m.percentiles.median)} color="var(--color-warn)" width={W} />
      <ReferenceLine y={yAt(m.percentiles.low)} color="var(--color-chart-blue)" width={W} />

      {/* 股价线 */}
      <polyline
        points={priceLine}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />

      {/* 分位数值标签 */}
      <text
        x={W - PAD}
        y={yAt(m.percentiles.high) - 3}
        textAnchor="end"
        fontSize="12"
        fill="var(--color-fg-3)"
        style={{ fontFamily: "var(--font-num)" }}
      >
        {formatValuationValue(m.percentiles.high, m.format)}
      </text>
      <text
        x={W - PAD}
        y={yAt(m.percentiles.median) - 3}
        textAnchor="end"
        fontSize="12"
        fill="var(--color-fg-3)"
        style={{ fontFamily: "var(--font-num)" }}
      >
        {formatValuationValue(m.percentiles.median, m.format)}
      </text>
      <text
        x={W - PAD}
        y={yAt(m.percentiles.low) - 3}
        textAnchor="end"
        fontSize="12"
        fill="var(--color-fg-3)"
        style={{ fontFamily: "var(--font-num)" }}
      >
        {formatValuationValue(m.percentiles.low, m.format)}
      </text>
    </svg>
  );
}

function ReferenceLine({
  y,
  color,
  width,
}: {
  y: number;
  color: string;
  width: number;
}) {
  return (
    <line
      x1={4}
      y1={y}
      x2={width - 4}
      y2={y}
      stroke={color}
      strokeWidth="1"
      strokeDasharray="3 2"
      className="opacity-70"
    />
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <i
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function formatValuationValue(v: number, format: "ratio" | "percent"): string {
  if (format === "percent") return formatPct(v * 100, 2);
  return formatNum(v, 2);
}
