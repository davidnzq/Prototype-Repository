import { useMemo, useState } from "react";
import { ChevronDown, Maximize2, MoreHorizontal } from "lucide-react";
import { cn, formatNum } from "@/lib/utils";
import type {
  Candle,
  CandleSeries,
  IntradayMeta,
  IntradayRange,
} from "@/mock/stockDetail-us";

interface IntradayChartProps {
  meta: IntradayMeta;
}

/**
 * US 客户端 IntradayChart —
 *   1D : 24hr 延长盘三段 run-chart(pre / reg / post),三段独立 polyline 避免视觉断点
 *   5D+: 蜡烛 K 线 + MA5 + MA20 + 成交量副图(Y 轴价格刻度)
 *
 * 视觉沿用 Design-System token,无 hardcode 颜色。
 */
export function IntradayChart({ meta }: IntradayChartProps) {
  const [range, setRange] = useState<IntradayRange>(meta.activeRange);

  return (
    <section className="border-b border-line bg-bg-2">
      {/* Range tabs(顶部) */}
      <RangeTabs
        ranges={meta.ranges}
        active={range}
        onChange={setRange}
      />

      {range === "1D" ? (
        <>
          <ExtendedChart meta={meta} />
          <TimeAxis ticks={meta.ticks} />
        </>
      ) : (
        <CandleChart meta={meta} period={range} />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 1D run-chart: pre / reg / post 三段时间映射 polyline (无视觉断档)
 *   X 坐标按真实时长权重分配:
 *     - pre  04:00 → 09:30  (5.5h)  X ∈ [0,    0.344]
 *     - reg  09:30 → 16:00  (6.5h)  X ∈ [0.344, 0.750]
 *     - post 16:00 → 20:00  (4.0h)  X ∈ [0.750, 1.000]
 *   段交界处端点共享 (pre.last = reg.first, reg.last = post.first), 完全连续
 * ───────────────────────────────────────────────────────────── */
const SESSION_HOURS = { pre: 5.5, reg: 6.5, post: 4.0 } as const;
const SESSION_TOTAL = SESSION_HOURS.pre + SESSION_HOURS.reg + SESSION_HOURS.post; // 16
// 各段在 [0,1] 区间的起止 ratio
const SESSION_RATIOS = {
  pre:  [0,                                    SESSION_HOURS.pre / SESSION_TOTAL],
  reg:  [SESSION_HOURS.pre / SESSION_TOTAL,    (SESSION_HOURS.pre + SESSION_HOURS.reg) / SESSION_TOTAL],
  post: [(SESSION_HOURS.pre + SESSION_HOURS.reg) / SESSION_TOTAL, 1],
} as const;
// 时间标签在 [0,1] 区间的位置 (对应 04:00 / 09:30 / 12:45 / 16:00 / 20:00)
const TICK_RATIOS = [
  0,
  SESSION_HOURS.pre / SESSION_TOTAL,             // 09:30 = 0.344
  (SESSION_HOURS.pre + SESSION_HOURS.reg / 2) / SESSION_TOTAL, // 12:45 = 0.547
  (SESSION_HOURS.pre + SESSION_HOURS.reg) / SESSION_TOTAL,     // 16:00 = 0.750
  1,
];

function ExtendedChart({ meta }: { meta: IntradayMeta }) {
  const W = 600;
  const H = 220;
  const PAD_X = 12;
  const PAD_TOP = 32;
  const PAD_BOT = 8;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;

  const allValues = meta.segments.flatMap((s) => s.values);
  const min = Math.min(...allValues, meta.low);
  const max = Math.max(...allValues, meta.high);
  const range = max - min || 1;

  const yAt = (v: number) => PAD_TOP + (1 - (v - min) / range) * innerH;
  // 时间 ratio → 屏幕 X
  const xAt = (ratio: number) => PAD_X + ratio * innerW;

  // 三段独立路径,X 按 SESSION_RATIOS 分配,端点共享 → 完全连续
  const segmentPaths: {
    kind: string;
    line: string;
    area: string;
    opacity: number;
    pts: { x: number; y: number }[];
  }[] = [];
  const sessionDividers: number[] = [];
  meta.segments.forEach((seg, segIdx) => {
    const [r0, r1] = SESSION_RATIOS[seg.kind as keyof typeof SESSION_RATIOS];
    const n = seg.values.length;
    const pts: { x: number; y: number }[] = seg.values.map((v, i) => {
      const ratio = r0 + ((r1 - r0) * i) / (n - 1);
      return { x: xAt(ratio), y: yAt(v) };
    });

    const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const area = `M ${firstX},${PAD_TOP + innerH} L ${line.replace(/ /g, " L ")} L ${lastX},${PAD_TOP + innerH} Z`;

    segmentPaths.push({
      kind: seg.kind,
      line,
      area,
      opacity: seg.kind === "reg" ? 1 : 0.78,
      pts,
    });

    if (segIdx < meta.segments.length - 1) {
      sessionDividers.push(lastX);
    }
  });

  const isUp = allValues[allValues.length - 1] >= meta.reference;
  const stroke = isUp ? "var(--color-up)" : "var(--color-down)";

  // 把所有点(含时间映射后的 X) flatten 到一个数组, 找全局 max / min 对应索引
  const flatPts: { x: number; y: number; v: number }[] = [];
  segmentPaths.forEach((sp, segIdx) => {
    sp.pts.forEach((p, i) => {
      flatPts.push({ x: p.x, y: p.y, v: meta.segments[segIdx].values[i] });
    });
  });

  const { highI, lowI } = useMemo(() => {
    let hi = 0;
    let lo = 0;
    for (let i = 1; i < flatPts.length; i++) {
      if (flatPts[i].v > flatPts[hi].v) hi = i;
      if (flatPts[i].v < flatPts[lo].v) lo = i;
    }
    return { highI: hi, lowI: lo };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatPts.length, flatPts[0]?.v]);

  const highX = flatPts[highI].x;
  const highY = flatPts[highI].y;
  const lowX  = flatPts[lowI].x;
  const lowY  = flatPts[lowI].y;
  const highV = flatPts[highI].v;
  const lowV  = flatPts[lowI].v;

  // 高低标注左右偏置
  const highOnLeftHalf = highX < W / 2;
  const lowOnLeftHalf  = lowX  < W / 2;
  const PTR_LEN = 8;

  return (
    <div className="relative">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Area gradient */}
        <defs>
          <linearGradient id="us-intraday-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Reference dashed line(前收虚线,横贯) */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={yAt(meta.reference)}
          y2={yAt(meta.reference)}
          stroke="var(--color-hairline-strong)"
          strokeDasharray="4 4"
        />

        {/* Session dividers — 在 pre/reg 与 reg/post 边界画竖向虚线 */}
        {sessionDividers.map((x, i) => (
          <line
            key={`div-${i}`}
            x1={x} x2={x}
            y1={PAD_TOP} y2={PAD_TOP + innerH}
            stroke="var(--color-hairline)"
            strokeWidth="0.6"
            strokeDasharray="2 3"
          />
        ))}

        {/* Segments(独立 polyline) */}
        {segmentPaths.map((sp, i) => (
          <g key={i} opacity={sp.opacity}>
            <path d={sp.area} fill="url(#us-intraday-area)" />
            <polyline
              points={sp.line}
              fill="none"
              stroke={stroke}
              strokeWidth={sp.kind === "reg" ? 1.6 : 1.1}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* 高点标注(带 8px 横线指针) */}
        <g>
          <circle cx={highX} cy={highY} r={2.5} fill={stroke} />
          {highOnLeftHalf ? (
            <line
              x1={highX} y1={highY}
              x2={highX + PTR_LEN} y2={highY}
              stroke="var(--color-fg-2)" strokeWidth="1"
            />
          ) : (
            <line
              x1={highX - PTR_LEN} y1={highY}
              x2={highX} y2={highY}
              stroke="var(--color-fg-2)" strokeWidth="1"
            />
          )}
          <text
            x={highOnLeftHalf ? highX + PTR_LEN + 2 : highX - PTR_LEN - 2}
            y={highY + 4}
            textAnchor={highOnLeftHalf ? "start" : "end"}
            fontSize="11"
            fontWeight="600"
            fill="var(--color-fg-1)"
            className="num"
          >
            {formatNum(highV, 2)}
          </text>
        </g>

        {/* 低点标注(带 8px 横线指针) */}
        <g>
          <circle cx={lowX} cy={lowY} r={2.5} fill={stroke} />
          {lowOnLeftHalf ? (
            <line
              x1={lowX} y1={lowY}
              x2={lowX + PTR_LEN} y2={lowY}
              stroke="var(--color-fg-2)" strokeWidth="1"
            />
          ) : (
            <line
              x1={lowX - PTR_LEN} y1={lowY}
              x2={lowX} y2={lowY}
              stroke="var(--color-fg-2)" strokeWidth="1"
            />
          )}
          <text
            x={lowOnLeftHalf ? lowX + PTR_LEN + 2 : lowX - PTR_LEN - 2}
            y={lowY + 4}
            textAnchor={lowOnLeftHalf ? "start" : "end"}
            fontSize="11"
            fontWeight="600"
            fill="var(--color-fg-1)"
            className="num"
          >
            {formatNum(lowV, 2)}
          </text>
        </g>
      </svg>

      {/* 右下角 maximize 按钮 */}
      <button
        type="button"
        aria-label="Expand chart"
        className="absolute bottom-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-sm border border-hairline bg-bg-1/70 text-fg-3 hover:text-fg-1"
      >
        <Maximize2 size={12} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 5D+ 蜡烛 K 线 + MA5 + MA20 + 成交量副图
 * ───────────────────────────────────────────────────────────── */
function CandleChart({
  meta,
  period,
}: {
  meta: IntradayMeta;
  period: Exclude<IntradayRange, "1D">;
}) {
  const series: CandleSeries | undefined = meta.candleSeries.find(
    (s) => s.period === period,
  );

  // 没有该周期数据时 placeholder
  if (!series) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-fg-3">
        No data for {period}
      </div>
    );
  }

  const { candles, xLabels } = series;
  const W = 600;
  const PRICE_H = 160;
  const VOL_H = 60;
  const GAP = 8;
  const H = PRICE_H + VOL_H + GAP;
  const PAD_X = 12;
  const PAD_TOP = 8;
  const PAD_BOT = 4;
  const innerW = W - PAD_X * 2;
  const priceInnerH = PRICE_H - PAD_TOP - PAD_BOT;
  const volInnerH = VOL_H - PAD_BOT;

  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;

  const vols = candles.map((c) => c.v);
  const volMax = Math.max(...vols) || 1;

  const xStep = innerW / candles.length;
  const bodyW = xStep * 0.6;

  const yAt = (v: number) => PAD_TOP + (1 - (v - min) / range) * priceInnerH;

  // 算 MA 序列
  const ma = (period: number) => {
    return candles.map((_, i) => {
      if (i + 1 < period) return null;
      let sum = 0;
      for (let j = i + 1 - period; j <= i; j++) sum += candles[j].c;
      return sum / period;
    });
  };
  const ma5 = ma(5);
  const ma20 = ma(20);

  const maLine = (vals: (number | null)[], color: string) => {
    const pts: string[] = [];
    vals.forEach((v, i) => {
      if (v == null) return;
      const x = PAD_X + i * xStep + xStep / 2;
      const y = yAt(v);
      pts.push(`${x},${y}`);
    });
    if (pts.length < 2) return null;
    return (
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  };

  // Y 轴 4 档价格刻度文字
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    max - (range * i) / yTicks,
  );

  return (
    <div className="relative">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* Y 轴水平栅格 */}
        {tickValues.map((tv, i) => (
          <line
            key={`grid-${i}`}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={yAt(tv)}
            y2={yAt(tv)}
            stroke="var(--color-hairline)"
            strokeWidth="0.5"
            strokeDasharray={i === 0 || i === yTicks ? "0" : "2 3"}
          />
        ))}

        {/* 蜡烛 */}
        {candles.map((c: Candle, i) => {
          const cx = PAD_X + i * xStep + xStep / 2;
          const isUp = c.c >= c.o;
          const color = isUp ? "var(--color-up)" : "var(--color-down)";
          const yH = yAt(c.h);
          const yL = yAt(c.l);
          const yO = yAt(c.o);
          const yC = yAt(c.c);
          const bodyTop = Math.min(yO, yC);
          const bodyHeight = Math.max(1, Math.abs(yO - yC));
          return (
            <g key={i}>
              {/* wick */}
              <line
                x1={cx} y1={yH} x2={cx} y2={yL}
                stroke={color} strokeWidth="1"
              />
              {/* body */}
              <rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyHeight}
                fill={color}
              />
            </g>
          );
        })}

        {/* MA 线 */}
        {maLine(ma5, "var(--color-chart-yellow)")}
        {maLine(ma20, "var(--color-chart-purple)")}

        {/* 成交量副图 */}
        <g transform={`translate(0, ${PRICE_H + GAP})`}>
          {candles.map((c, i) => {
            const cx = PAD_X + i * xStep + xStep / 2;
            const isUp = c.c >= c.o;
            const color = isUp ? "var(--color-up)" : "var(--color-down)";
            const h = (c.v / volMax) * volInnerH;
            return (
              <rect
                key={`vol-${i}`}
                x={cx - bodyW / 2}
                y={volInnerH - h}
                width={bodyW}
                height={h}
                fill={color}
                opacity="0.6"
              />
            );
          })}
        </g>

        {/* Y 轴左侧价格刻度文字 */}
        {tickValues.map((tv, i) => (
          <text
            key={`txt-${i}`}
            x={PAD_X + 2}
            y={yAt(tv) - 2}
            fontSize="9"
            fill="var(--color-fg-3)"
            className="num"
          >
            {formatNum(tv, 2)}
          </text>
        ))}
      </svg>

      {/* X 轴稀疏标签 */}
      <div className="flex items-center justify-between px-4 pb-2 text-xs text-fg-3">
        {xLabels.map((l, i) => (
          <span key={i} className="num">{l}</span>
        ))}
      </div>

      {/* MA legend */}
      <div className="absolute left-4 top-2 flex items-center gap-3 text-[10px] text-fg-3">
        <span className="num inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3" style={{ background: "var(--color-chart-yellow)" }} />
          MA5
        </span>
        <span className="num inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3" style={{ background: "var(--color-chart-purple)" }} />
          MA20
        </span>
      </div>

      {/* 右下角 maximize */}
      <button
        type="button"
        aria-label="Expand chart"
        className="absolute bottom-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-sm border border-hairline bg-bg-1/70 text-fg-3 hover:text-fg-1"
      >
        <Maximize2 size={12} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 1D 视图 X 轴时间标签 — 按 TICK_RATIOS 绝对定位,与数据 X 严格对齐
 *   04:00 (0%) | 09:30 (34.4%) ☀ | 12:45 (54.7%) | 16:00 (75%) ☾ | 20:00 (100%)
 * ───────────────────────────────────────────────────────────── */
function TimeAxis({ ticks }: { ticks: string[] }) {
  return (
    <div className="relative h-5 px-3 pb-2 text-xs text-fg-3">
      {ticks.map((t, i) => {
        const ratio = TICK_RATIOS[i] ?? i / (ticks.length - 1);
        const anchor = i === 0
          ? "left-0 translate-x-0"
          : i === ticks.length - 1
            ? "right-0 translate-x-0"
            : "-translate-x-1/2";
        const leftStyle = i === ticks.length - 1
          ? { right: "0%" }
          : { left: `${ratio * 100}%` };
        return (
          <span
            key={i}
            className={cn(
              "absolute top-0 num inline-flex items-center gap-1",
              anchor,
            )}
            style={leftStyle}
          >
            {i === 1 && <SunIcon />}
            {i === 3 && <MoonIcon />}
            {t}
          </span>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 顶部时间维度 tab
 *   1D | 5D | 1M | 3M | YTD | 1Y | 5Y | Max
 *   active 带 chevron-down,右侧分隔线 + more icon
 * ───────────────────────────────────────────────────────────── */
function RangeTabs({
  ranges,
  active,
  onChange,
}: {
  ranges: IntradayRange[];
  active: IntradayRange;
  onChange: (r: IntradayRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 px-3 pb-2 pt-3 text-sm">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "num inline-flex items-center gap-0.5 rounded-sm px-2 py-1 transition-colors",
            r === active
              ? "bg-bg-1 font-medium text-fg-1"
              : "text-fg-3 hover:text-fg-1",
          )}
        >
          {r}
          {r === active && <ChevronDown size={10} className="text-fg-2" />}
        </button>
      ))}
      <span className="mx-1 h-4 w-px bg-hairline" aria-hidden />
      <button
        type="button"
        aria-label="Chart options"
        className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-fg-3 hover:text-fg-1"
      >
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="2" fill="var(--color-warn)" />
      <g stroke="var(--color-warn)" strokeWidth="1" strokeLinecap="round">
        <line x1="6" y1="1" x2="6" y2="2.5" />
        <line x1="6" y1="9.5" x2="6" y2="11" />
        <line x1="1" y1="6" x2="2.5" y2="6" />
        <line x1="9.5" y1="6" x2="11" y2="6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M9.5 7.5 a4.5 4.5 0 1 1 -5 -5 a3.5 3.5 0 0 0 5 5z"
        fill="var(--color-fg-3)"
      />
    </svg>
  );
}
