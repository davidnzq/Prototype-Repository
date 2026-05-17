import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  FinancialHealthScore as FHS,
  FinancialHealthCategory,
  RatingGrade,
  RatingTrend,
} from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface FinancialHealthScoreProps {
  data: FHS;
}

// grade → 0-100 雷达图分值
const GRADE_VAL: Record<RatingGrade, number> = {
  A: 92,
  B: 75,
  C: 55,
  D: 32,
  E: 12,
};

const GRADE_COLOR: Record<RatingGrade, string> = {
  A: "text-up",
  B: "text-fg-1",
  C: "text-warn",
  D: "text-down",
  E: "text-down",
};

/**
 * 财务评分 — 长桥版
 * - 头部 card:大 grade + 行业名 + 排名 + 行业中位数/平均
 * - 左侧 5 轴雷达图(盈利/成长/现金/运营/安全)
 * - 右侧 5 类评分明细,默认展开第一类查看指标行
 */
export function FinancialHealthScore({ data }: FinancialHealthScoreProps) {
  const [expandedIdx, setExpandedIdx] = useState(0);

  return (
    <section className="border-b border-line">
      <SectionHeader
        label="财务评分"
        hint={`Financial Health · ${data.updatedAt}`}
      />

      {/* 头部总体评价 — 单 row,紧凑布局(去重 5 类目,避免与雷达重复)*/}
      <div className="flex items-center gap-6 border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-1">
          <span className={cn("num text-4xl font-bold leading-none", GRADE_COLOR[data.overall])}>
            {data.overall}
          </span>
          <TrendArrow trend={data.overallTrend} size={16} />
        </div>
        <div className="text-sm font-semibold text-fg-1">{data.industry}</div>
        <div className="ml-auto flex gap-6 text-sm">
          <KvBlock label="同行业排名" value={`${data.industryRank.rank}/${data.industryRank.total}`} />
          <KvBlock label="行业中位数" value={data.industryMedian} grade={data.industryMedian} />
          <KvBlock label="行业平均值" value={data.industryAvg} grade={data.industryAvg} />
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr] items-start gap-8 px-4 py-4">
        {/* 雷达图 */}
        <RadarChart categories={data.categories} />

        {/* 评分明细 */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <button type="button" className="rounded-sm border border-accent bg-accent/15 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/25">
              评分分析
            </button>
            <button type="button" className="rounded-sm border border-hairline px-3 py-1 text-xs text-fg-3 transition-colors hover:text-fg-1">
              同行比较
            </button>
          </div>

          <div className="grid grid-cols-[1fr_140px_120px_80px] gap-2 border-b border-hairline pb-1.5 text-xs text-fg-3">
            <div>指标</div>
            <div className="text-right">数值</div>
            <div className="text-right">评分</div>
            <div className="text-right">趋势</div>
          </div>

          {data.categories.map((cat, idx) => (
            <CategoryRow
              key={cat.label}
              cat={cat}
              expanded={idx === expandedIdx}
              onToggle={() => setExpandedIdx(idx === expandedIdx ? -1 : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function KvBlock({
  label,
  value,
  grade,
}: {
  label: string;
  value: string;
  grade?: RatingGrade;
}) {
  return (
    <div>
      <div className="text-xs text-fg-3">{label}</div>
      <div
        className={cn(
          "num font-semibold",
          grade ? GRADE_COLOR[grade] : "text-fg-1",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function CategoryRow({
  cat,
  expanded,
  onToggle,
}: {
  cat: FinancialHealthCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "grid w-full grid-cols-[1fr_140px_120px_80px] items-center gap-2 border-b border-hairline py-1.5 text-left text-sm transition-colors",
          expanded ? "bg-soft" : "hover:bg-soft/50",
        )}
      >
        <div className="flex items-center gap-2 font-semibold text-fg-1">
          <span className="inline-block h-4 w-4 text-center text-fg-3">
            {expanded ? "−" : "+"}
          </span>
          {cat.label}
        </div>
        <div />
        <div className={cn("flex items-center justify-end gap-1 font-semibold", GRADE_COLOR[cat.grade])}>
          <span className="num text-base">{cat.grade}</span>
        </div>
        <div className="flex justify-end">
          <TrendArrow trend="flat" size={12} />
        </div>
      </button>
      {expanded &&
        cat.indicators.map((ind) => (
          <div
            key={ind.label}
            className="grid grid-cols-[1fr_140px_120px_80px] items-center gap-2 border-b border-hairline py-1.5 text-sm"
          >
            <span className="pl-6 text-fg-2">{ind.label}</span>
            <span className="num text-right text-fg-1">{ind.value}</span>
            <span className={cn("text-right font-semibold", GRADE_COLOR[ind.grade])}>
              <span className="num">{ind.grade}</span>
            </span>
            <span className="flex justify-end">
              <TrendArrow trend={ind.trend} size={11} />
            </span>
          </div>
        ))}
    </>
  );
}

function TrendArrow({ trend, size = 12 }: { trend: RatingTrend; size?: number }) {
  if (trend === "up") {
    return (
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 10 10">
        <polygon points="5,1 9,8 1,8" fill="var(--color-up)" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 10 10">
        <polygon points="5,9 9,2 1,2" fill="var(--color-down)" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 10 10">
      <rect x="1" y="4" width="8" height="2" fill="var(--color-fg-4)" />
    </svg>
  );
}

function RadarChart({ categories }: { categories: FinancialHealthCategory[] }) {
  // SIZE 360 → 320 以与右侧评分明细面板等高(默认展开 1 行约 5×row + 3 indicators ≈ 310px)
  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 105;
  const LEVELS = 4;
  const N = categories.length;

  // 每轴端点
  const axes = categories.map((c, i) => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    return {
      cat: c,
      angle,
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
      labelX: CX + (R + 22) * Math.cos(angle),
      labelY: CY + (R + 22) * Math.sin(angle),
    };
  });

  // 数据多边形
  const polyPoints = axes
    .map((a) => {
      const v = GRADE_VAL[a.cat.grade] / 100;
      const x = CX + R * v * Math.cos(a.angle);
      const y = CY + R * v * Math.sin(a.angle);
      return `${x},${y}`;
    })
    .join(" ");

  const grids = Array.from({ length: LEVELS }, (_, i) => ((i + 1) / LEVELS) * R);

  return (
    <svg aria-hidden="true" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
      {/* 同心圆 */}
      {grids.map((r, i) => (
        <circle key={i} cx={CX} cy={CY} r={r} fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
      ))}
      {/* 轴线 */}
      {axes.map((a, i) => (
        <line key={i} x1={CX} y1={CY} x2={a.x} y2={a.y} stroke="var(--color-hairline)" strokeWidth="1" />
      ))}
      {/* 数据多边形 */}
      <polygon
        points={polyPoints}
        fill="var(--color-accent)"
        fillOpacity="0.2"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />
      {/* 顶点 dot */}
      {axes.map((a, i) => {
        const v = GRADE_VAL[a.cat.grade] / 100;
        const x = CX + R * v * Math.cos(a.angle);
        const y = CY + R * v * Math.sin(a.angle);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-accent)" />;
      })}
      {/* 轴标签 + grade */}
      {axes.map((a, i) => (
        <g key={i}>
          <text
            x={a.labelX}
            y={a.labelY - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm"
            fill="var(--color-fg-2)"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {a.cat.axis}
          </text>
          <text
            x={a.labelX}
            y={a.labelY + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm"
            fill="var(--color-fg-1)"
            style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}
          >
            {a.cat.grade}
          </text>
        </g>
      ))}
    </svg>
  );
}
