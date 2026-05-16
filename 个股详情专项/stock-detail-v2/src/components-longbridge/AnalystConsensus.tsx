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
 * 长桥版分析师评级 — 对应 Figma "机构观点 & 持股股东 / 分析师评级":
 *   左:Donut 6 段(强力推荐 accent / 买入 / 持有 / 跑输大盘 / 卖出 / 无意见)
 *   中:评级 + 占比 表格 6 行(首项 consensus 高亮)
 *   右:3 条折线图 — 股价 / 预测最高 / 预测最低(过去 24 月)
 *   样式沿用 LB Design-System token,无 hardcode 颜色。
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
      <div className="grid grid-cols-[260px_220px_1fr] gap-6 px-4 py-4">
        {/* 左:Donut */}
        <div className="flex flex-col items-center justify-center">
          <DonutChart distribution={d.distribution} total={d.totalAnalysts} />
        </div>

        {/* 中:评级 + 占比 表格 */}
        <RatingTable distribution={d.distribution} consensus={d.consensus} />

        {/* 右:3 条折线 */}
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
    cursor = end;
    return { ...s, start, end, pct };
  });

  return (
    <svg
      aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${W}`}
      className="block max-w-[220px]"
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
        y={CY - 4}
        textAnchor="middle"
        className="num"
        fontSize="28"
        fontWeight="700"
        fill="var(--color-fg-1)"
      >
        {total}
      </text>
      <text
        x={CX}
        y={CY + 18}
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-fg-3)"
      >
        位分析师
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

// ─── 评级表 ──────────────────────────────────────────────────────────

function RatingTable({
  distribution,
  consensus,
}: {
  distribution: AC["distribution"];
  consensus: AnalystRatingLabel;
}) {
  return (
    <div className="flex flex-col justify-center">
      <div className="grid grid-cols-[1fr_auto] items-center border-b border-hairline pb-1.5 text-xs text-fg-3">
        <span>评级</span>
        <span>占比</span>
      </div>
      <ul>
        {SEGMENTS.map((s) => {
          const isActive = s.label === consensus;
          return (
            <li
              key={s.key}
              className="grid grid-cols-[1fr_auto] items-center border-b border-hairline py-2 text-sm last:border-b-0"
            >
              <span className="inline-flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                <span className={isActive ? "font-semibold text-accent" : "text-fg-2"}>
                  {s.label}
                </span>
              </span>
              <span
                className={cn(
                  "num",
                  isActive ? "font-semibold text-accent" : "text-fg-1",
                )}
              >
                {formatPct(distribution[s.key] * 100, 0)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── 折线图 ──────────────────────────────────────────────────────────

function PriceChart({ history }: { history: AC["priceHistory"] }) {
  const VBW = 720;
  const VBH = 240;
  const PAD_X = 8;
  const PAD_TOP = 32;
  const PAD_BOT = 24;
  const innerW = VBW - PAD_X * 2;
  const innerH = VBH - PAD_TOP - PAD_BOT;

  const allValues = history.flatMap((h) => [
    h.price,
    h.predictHigh,
    h.predictLow,
  ]);
  const min = Math.floor(Math.min(...allValues) / 100) * 100;
  const max = Math.ceil(Math.max(...allValues) / 100) * 100;
  const range = max - min || 1;

  const xAt = (i: number) =>
    PAD_X + (i / (history.length - 1)) * innerW;
  const yAt = (v: number) =>
    PAD_TOP + (1 - (v - min) / range) * innerH;

  const linePath = (key: "price" | "predictHigh" | "predictLow") =>
    history.map((h, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(h[key])}`).join(" ");

  const last = history[history.length - 1];

  // Y 轴 4 个 tick(min / 1/3 / 2/3 / max)
  const yTicks = [0, 1 / 3, 2 / 3, 1].map((t) => Math.round(min + range * t));

  return (
    <div className="min-w-0">
      {/* 图例 */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs">
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
              x1={PAD_X + 36}
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

        {/* 三条线 */}
        <path
          d={linePath("predictHigh")}
          fill="none"
          stroke="var(--color-up)"
          strokeWidth="1.5"
        />
        <path
          d={linePath("price")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.8"
        />
        <path
          d={linePath("predictLow")}
          fill="none"
          stroke="var(--color-warn)"
          strokeWidth="1.5"
        />

        {/* 末端 dot */}
        {last && (
          <>
            <circle cx={xAt(history.length - 1)} cy={yAt(last.price)} r="3.5" fill="var(--color-accent)" />
            <circle cx={xAt(history.length - 1)} cy={yAt(last.predictHigh)} r="3" fill="var(--color-bg-1)" stroke="var(--color-up)" strokeWidth="1.5" />
            <circle cx={xAt(history.length - 1)} cy={yAt(last.predictLow)} r="3" fill="var(--color-bg-1)" stroke="var(--color-warn)" strokeWidth="1.5" />
          </>
        )}
      </svg>
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
