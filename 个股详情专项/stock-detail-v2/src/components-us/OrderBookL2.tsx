import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, formatInt, formatNum } from "@/lib/utils";
import type { OrderBookL2Data } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface OrderBookL2Props {
  data: OrderBookL2Data;
}

type LevelMode = 5 | 10;

/**
 * US 客户端 Order book(L2) — 对齐 Figma 1:322:
 *   1. BBO 双卡(左 Bid:数量+价 / 右 Ask:价+数量,顶部 4px 量比色条)
 *   2. 量价迷你图(价格折线 + 成交量柱) + 右上 5/10 levels 切换
 *   3. Bid 65.27% / 32.65% Ask 比例条(实算)
 *   4. 5/10 档表身(切换控制行数), 行内带 depth bar 背景
 */
export function OrderBookL2({ data: d }: OrderBookL2Props) {
  const [mode, setMode] = useState<LevelMode>(d.levelCount === 5 ? 5 : 10);

  // 实算 Bid/Ask 比例
  const { bidPct, askPct, bidWidth, askWidth } = useMemo(() => {
    const total = d.bidTotal + d.askTotal || 1;
    const bp = d.bidTotal / total;
    const ap = d.askTotal / total;
    return {
      bidPct: bp,
      askPct: ap,
      // 卡顶色条相对宽度(以最大值为基准)
      bidWidth: bp >= ap ? 100 : (bp / Math.max(bp, ap)) * 100,
      askWidth: ap >= bp ? 100 : (ap / Math.max(bp, ap)) * 100,
    };
  }, [d.bidTotal, d.askTotal]);

  const visibleRows = d.rows.slice(0, mode);

  // 行内 depth bar: 宽度 = qty / 表内最大 qty × 50%
  const maxRowQty = useMemo(() => {
    return Math.max(
      ...visibleRows.flatMap((r) => [r.bidQty, r.askQty]),
      1,
    );
  }, [visibleRows]);

  return (
    <section className="border-b border-line">
      <SectionHeader label="Order book" />
      <div className="space-y-3 px-4 py-3">
        {/* 1. BBO 双卡 */}
        <BBOCards
          bidQty={d.bidTotal}
          bidPx={d.midBid}
          askPx={d.midAsk}
          askQty={d.askTotal}
          bidWidth={bidWidth}
          askWidth={askWidth}
        />

        {/* 2. 量价迷你图 + 5/10 切换 */}
        <div>
          <div className="mb-1 flex items-center justify-end">
            <LevelToggle mode={mode} onChange={setMode} />
          </div>
          <MiniChart data={d.miniChart} />
        </div>

        {/* 3. Bid % vs Ask % 比例条 */}
        <div>
          <div className="flex h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-up"
              style={{ width: `${bidPct * 100}%` }}
            />
            <div
              className="h-full bg-down"
              style={{ width: `${askPct * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="num font-semibold text-up">
              Bid {(bidPct * 100).toFixed(2)}%
            </span>
            <span className="num font-semibold text-down">
              {(askPct * 100).toFixed(2)}% Ask
            </span>
          </div>
        </div>

        {/* 4. 5/10 档表身,每行带 depth bar */}
        <table className="w-full table-fixed border-collapse text-xs">
          <tbody>
            {visibleRows.map((r) => {
              const bidBarW = (r.bidQty / maxRowQty) * 50; // 左 50% 内
              const askBarW = (r.askQty / maxRowQty) * 50; // 右 50% 内
              return (
                <tr key={r.level} className="relative border-t border-hairline">
                  {/* 左侧 depth bar(从中线向左,alpha 0.32 提升可见度) */}
                  <td
                    className="absolute inset-y-0"
                    style={{
                      right: "50%",
                      width: `${bidBarW}%`,
                      background: "color-mix(in srgb, var(--color-up) 28%, transparent)",
                    }}
                    aria-hidden
                  />
                  {/* 右侧 depth bar(从中线向右) */}
                  <td
                    className="absolute inset-y-0"
                    style={{
                      left: "50%",
                      width: `${askBarW}%`,
                      background: "color-mix(in srgb, var(--color-down) 28%, transparent)",
                    }}
                    aria-hidden
                  />
                  <td className="relative num w-7 py-1.5 pl-1 text-center">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-up-soft font-semibold text-up">
                      {r.level}
                    </span>
                  </td>
                  <td className="relative num py-1.5 text-right text-fg-1">
                    {formatInt(r.bidQty)}
                  </td>
                  <td className="relative num py-1.5 text-right text-up">
                    {formatNum(r.bidPx, 3)}
                  </td>
                  <td className="relative num py-1.5 text-right text-down">
                    {formatNum(r.askPx, 3)}
                  </td>
                  <td className="relative num py-1.5 text-right text-fg-1">
                    {formatInt(r.askQty)}
                  </td>
                  <td className="relative num w-7 py-1.5 pr-1 text-center">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-down-soft font-semibold text-down">
                      {r.level}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * BBO 双卡 — 顶部 4px 色条 + Bid|Ask 标签 + 数量 / 价格
 * ───────────────────────────────────────────────────────────── */
function BBOCards({
  bidQty,
  bidPx,
  askPx,
  askQty,
  bidWidth,
  askWidth,
}: {
  bidQty: number;
  bidPx: number;
  askPx: number;
  askQty: number;
  bidWidth: number;
  askWidth: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Bid 卡 */}
      <div className="relative overflow-hidden rounded-md bg-up-soft pt-1.5">
        <div
          className="absolute left-0 top-0 h-1 bg-up"
          style={{ width: `${bidWidth}%` }}
          aria-hidden
        />
        <div className="flex items-baseline justify-between px-3 py-2">
          <div className="flex flex-col">
            <span className="caps text-up">Bid</span>
            <span className="num text-xs text-fg-2">{formatInt(bidQty)}</span>
          </div>
          <span className="num text-lg font-semibold text-up">
            {formatNum(bidPx, 3)}
          </span>
        </div>
      </div>

      {/* Ask 卡 */}
      <div className="relative overflow-hidden rounded-md bg-down-soft pt-1.5">
        <div
          className="absolute right-0 top-0 h-1 bg-down"
          style={{ width: `${askWidth}%` }}
          aria-hidden
        />
        <div className="flex items-baseline justify-between px-3 py-2">
          <span className="num text-lg font-semibold text-down">
            {formatNum(askPx, 3)}
          </span>
          <div className="flex flex-col items-end">
            <span className="caps text-down">Ask</span>
            <span className="num text-xs text-fg-2">{formatInt(askQty)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 5/10 levels 切换 (右上下拉)
 * ───────────────────────────────────────────────────────────── */
function LevelToggle({
  mode,
  onChange,
}: {
  mode: LevelMode;
  onChange: (m: LevelMode) => void;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={mode}
        onChange={(e) => onChange(Number(e.target.value) as LevelMode)}
        className={cn(
          "appearance-none rounded-sm border border-hairline bg-bg-2 py-0.5 pl-2 pr-6",
          "text-xs text-fg-1 hover:border-line-button focus:border-accent",
        )}
        aria-label="Levels"
      >
        <option value={5}>5 levels</option>
        <option value={10}>10 levels</option>
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-fg-3"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 量价迷你图 — 上半价格折线(左粉右绿) + 下半量柱
 * ───────────────────────────────────────────────────────────── */
function MiniChart({ data }: { data: OrderBookL2Data["miniChart"] }) {
  const W = 540;
  const H = 100;
  const PAD = 4;
  const PRICE_H = 64;
  const VOL_H = 28;
  const GAP = 4;
  const innerW = W - PAD * 2;
  const priceInnerH = PRICE_H - PAD;

  const { priceLine, volumeBars } = data;
  const min = Math.min(...priceLine);
  const max = Math.max(...priceLine);
  const range = max - min || 1;

  const half = Math.floor(priceLine.length / 2);

  // 全段折线点
  const ptAt = (i: number) => {
    const x = PAD + (i / (priceLine.length - 1)) * innerW;
    const y = PAD + (1 - (priceLine[i] - min) / range) * priceInnerH;
    return { x, y };
  };

  // 左段(0..half) 跌色, 右段(half..end) 涨色, 在 half 处共享端点
  const leftPts = Array.from({ length: half + 1 }, (_, i) => ptAt(i));
  const rightPts = Array.from(
    { length: priceLine.length - half },
    (_, i) => ptAt(half + i),
  );
  const leftPath = leftPts.map((p) => `${p.x},${p.y}`).join(" ");
  const rightPath = rightPts.map((p) => `${p.x},${p.y}`).join(" ");

  // 量柱
  const volMax = Math.max(...volumeBars) || 1;
  const barW = innerW / volumeBars.length;

  return (
    <div className="relative">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <defs>
          <linearGradient id="us-ob-down-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-down)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-down)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="us-ob-up-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-up)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-up)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 上下边界线 */}
        <line
          x1={PAD} x2={W - PAD} y1={PAD} y2={PAD}
          stroke="var(--color-hairline)" strokeWidth="0.5"
        />
        <line
          x1={PAD} x2={W - PAD} y1={PAD + priceInnerH} y2={PAD + priceInnerH}
          stroke="var(--color-hairline)" strokeWidth="0.5"
        />

        {/* 左段(跌色) area */}
        <path
          d={`M ${leftPts[0].x},${PAD + priceInnerH} L ${leftPath.replace(/ /g, " L ")} L ${leftPts[leftPts.length - 1].x},${PAD + priceInnerH} Z`}
          fill="url(#us-ob-down-area)"
        />
        {/* 右段(涨色) area */}
        <path
          d={`M ${rightPts[0].x},${PAD + priceInnerH} L ${rightPath.replace(/ /g, " L ")} L ${rightPts[rightPts.length - 1].x},${PAD + priceInnerH} Z`}
          fill="url(#us-ob-up-area)"
        />

        {/* 价格折线: 左跌 / 右涨 */}
        <polyline
          points={leftPath}
          fill="none"
          stroke="var(--color-down)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polyline
          points={rightPath}
          fill="none"
          stroke="var(--color-up)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 量柱(底部) */}
        <g transform={`translate(0, ${PRICE_H + GAP})`}>
          {volumeBars.map((v, i) => {
            const h = (v / volMax) * VOL_H;
            const x = PAD + i * barW;
            const isLeft = i < half;
            return (
              <rect
                key={i}
                x={x + barW * 0.15}
                y={VOL_H - h}
                width={barW * 0.7}
                height={h}
                fill={isLeft ? "var(--color-down)" : "var(--color-up)"}
                opacity="0.55"
              />
            );
          })}
        </g>

        {/* Y 轴量峰 / 谷标签 */}
        <text
          x={PAD + 2} y={PAD + 9}
          fontSize="9" fill="var(--color-fg-3)" className="num"
        >
          {data.volumePeakLabel}
        </text>
        <text
          x={PAD + 2} y={PAD + priceInnerH - 2}
          fontSize="9" fill="var(--color-fg-3)" className="num"
        >
          {data.volumeFloorLabel}
        </text>
      </svg>

      {/* X 轴价格刻度 */}
      <div className="flex items-center justify-between px-1 pt-0.5 text-[10px] text-fg-3">
        {data.xLabels.map((l, i) => (
          <span key={i} className="num">{l}</span>
        ))}
      </div>
    </div>
  );
}
