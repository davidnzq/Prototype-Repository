"use client";

import { useEffect, useState } from "react";
import { cn, formatNum, formatPct } from "@/lib/utils";
import type {
  RevenueCompositionData,
  RevenueYearBar,
  RevenueSeriesPoint,
} from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface RevenueCompositionProps {
  data: RevenueCompositionData;
}

/**
 * 营收构成 — 长桥版
 * - "行业 / 地区" Tab 切换(本 prototype 仅地区有数据,行业占位)
 * - 2013–2025 多年叠加柱状图
 * - 下方明细表:名称 / 营收(亿) / 占比
 */
/** 默认 segment fallback 色板(token 风格)*/
const FALLBACK_SEG_COLORS = [
  "var(--color-chart-blue)",
  "var(--color-chart-purple)",
  "var(--color-chart-yellow)",
  "var(--color-chart-green)",
  "var(--color-chart-pink)",
  "var(--color-chart-red)",
  "var(--color-chart-orange)",
  "var(--color-chart-grey)",
];

export function RevenueComposition({ data }: RevenueCompositionProps) {
  const [view, setView] = useState<"industry" | "region">("industry");

  // props.data.view 漂移时 sync 内部 state(默认覆写为 industry,见 #14)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView("industry");
  }, [data.view]);

  // 防 mock segmentColors 不足时退化
  const segmentColors = data.latestSegments.map(
    (s, i) => s.color || FALLBACK_SEG_COLORS[i % FALLBACK_SEG_COLORS.length],
  );

  return (
    <section className="border-b border-line">
      <SectionHeader label="营收构成" />

      {/* Tab switch */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <TabPill active={view === "industry"} onClick={() => setView("industry")}>
          行业
        </TabPill>
        <TabPill active={view === "region"} onClick={() => setView("region")}>
          地区
        </TabPill>
      </div>

      {/* 多年叠加柱状图 */}
      <YearStackedBars bars={data.yearBars} segmentColors={segmentColors} />

      {/* 明细表 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-[minmax(160px,1fr)_120px_80px] gap-2 border-b border-hairline pb-1.5 text-xs text-fg-3">
          <div>名称</div>
          <div className="text-right">营收 (亿)</div>
          <div className="text-right">占比</div>
        </div>
        {data.latestSegments.map((s, i) => (
          <SegmentRow key={s.label} seg={s} fallbackColor={segmentColors[i]} />
        ))}
      </div>
    </section>
  );
}

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border border-accent bg-accent/15 text-accent"
          : "border border-hairline text-fg-3 hover:text-fg-1",
      )}
    >
      {children}
    </button>
  );
}

function SegmentRow({ seg, fallbackColor }: { seg: RevenueSeriesPoint; fallbackColor?: string }) {
  return (
    <div className="grid grid-cols-[minmax(160px,1fr)_120px_80px] items-center gap-2 border-b border-hairline py-1.5 text-sm last:border-b-0">
      <span className="inline-flex items-center gap-2">
        <i
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: seg.color || fallbackColor }}
        />
        <span className="text-fg-1">{seg.label}</span>
      </span>
      <span className="num text-right text-fg-1">{formatNum(seg.revenue, 0)} 亿</span>
      <span className="num text-right text-fg-2">{formatPct(seg.pct * 100, 2)}</span>
    </div>
  );
}

function YearStackedBars({
  bars,
  segmentColors,
}: {
  bars: RevenueYearBar[];
  segmentColors: string[];
}) {
  const maxTotal = Math.max(...bars.map((b) => b.total));
  const yAxisMax = Math.ceil(maxTotal / 1000) * 1000;
  // viewBox 设定:VBW=1200 匹配 1280 主容器,SVG width=100% 等比缩放
  const VBW = 1200;
  const VBH = 260;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 32;
  const PAD_LEFT = 64;
  const PAD_RIGHT = 16;
  const BAR_AREA_H = VBH - PAD_TOP - PAD_BOTTOM;
  const N = bars.length;
  const SLOT_W = (VBW - PAD_LEFT - PAD_RIGHT) / N;
  const BAR_W = Math.min(SLOT_W * 0.55, 60);

  return (
    <div className="px-4 py-3">
      <svg
        aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${VBW} ${VBH}`}
        className="block w-full"
      >
        {/* Y 轴标签 + 网格 */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + BAR_AREA_H * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={VBW - PAD_RIGHT}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
              >
                {Math.round(yAxisMax * t)} 亿
              </text>
            </g>
          );
        })}

        {/* 柱体 + 年份 */}
        {bars.map((b, i) => {
          const xCenter = PAD_LEFT + i * SLOT_W + SLOT_W / 2;
          const x = xCenter - BAR_W / 2;
          let cursorBottom = PAD_TOP + BAR_AREA_H;
          return (
            <g key={b.year}>
              {b.segments.map((seg, j) => {
                const h = (seg.value / yAxisMax) * BAR_AREA_H;
                const y = cursorBottom - h;
                cursorBottom = y;
                return (
                  <rect
                    key={j}
                    x={x}
                    y={y}
                    width={BAR_W}
                    height={Math.max(h, 0.5)}
                    fill={segmentColors[j]}
                  />
                );
              })}
              {/* 年份标签 */}
              <text
                x={xCenter}
                y={VBH - 12}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
              >
                {b.year}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
