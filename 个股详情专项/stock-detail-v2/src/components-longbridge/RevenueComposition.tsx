import { useState } from "react";
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
export function RevenueComposition({ data }: RevenueCompositionProps) {
  const [view, setView] = useState<"industry" | "region">(data.view);

  return (
    <section className="border-b border-line">
      <SectionHeader label="营收构成" hint="Revenue Composition" />

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
      <YearStackedBars bars={data.yearBars} segmentColors={data.latestSegments.map((s) => s.color)} segmentLabels={data.latestSegments.map((s) => s.label)} />

      {/* 明细表 */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-[1fr_120px_80px] gap-3 border-b border-hairline pb-1.5 text-xs text-fg-3">
          <div>名称</div>
          <div className="text-right">营收收入</div>
          <div className="text-right">占比</div>
        </div>
        {data.latestSegments.map((s) => (
          <SegmentRow key={s.label} seg={s} />
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

function SegmentRow({ seg }: { seg: RevenueSeriesPoint }) {
  return (
    <div className="grid grid-cols-[1fr_120px_80px] gap-3 border-b border-hairline py-2 text-sm last:border-b-0">
      <span className="inline-flex items-center gap-2">
        <i
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: seg.color }}
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
  segmentLabels,
}: {
  bars: RevenueYearBar[];
  segmentColors: string[];
  segmentLabels: string[];
}) {
  const maxTotal = Math.max(...bars.map((b) => b.total));
  const yAxisMax = Math.ceil(maxTotal / 1000) * 1000;
  const H = 220;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 28;
  const BAR_AREA_H = H - PAD_TOP - PAD_BOTTOM;
  const W_PER_BAR = 44;
  const BAR_W = 22;
  const chartW = bars.length * W_PER_BAR + 60;

  return (
    <div className="px-4 py-3">
      <div className="overflow-x-auto">
        <svg aria-hidden="true"
          width={chartW}
          height={H}
          viewBox={`0 0 ${chartW} ${H}`}
          className="block"
          style={{ minWidth: chartW }}
        >
          {/* Y 轴标签 + 网格 */}
          {[0, 0.5, 1].map((t) => {
            const y = PAD_TOP + BAR_AREA_H * (1 - t);
            return (
              <g key={t}>
                <line
                  x1={50}
                  y1={y}
                  x2={chartW - 10}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeWidth="1"
                />
                <text
                  x={44}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs"
                  fill="var(--color-fg-3)"
                  style={{ fontFamily: "var(--font-num)" }}
                >
                  {Math.round((yAxisMax * t) / (yAxisMax >= 1000 ? 1 : 1))} 亿
                </text>
              </g>
            );
          })}

          {/* 柱体 + 年份 */}
          {bars.map((b, i) => {
            const xCenter = 50 + i * W_PER_BAR + W_PER_BAR / 2;
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
                  y={H - 10}
                  textAnchor="middle"
                  className="text-xs"
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

      {/* 顶部图例 */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-fg-2">
        {segmentLabels.map((label, i) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: segmentColors[i] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
