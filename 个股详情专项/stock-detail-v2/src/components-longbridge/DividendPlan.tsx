import { cn, formatNum, formatPct } from "@/lib/utils";
import type { DividendYear, DividendRecord } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface DividendPlanProps {
  history: DividendYear[];
  records: DividendRecord[];
}

/**
 * 分配方案 — 长桥版(基于业务理解的最佳图形表达)
 *
 * 业务洞察:股息投资者最该关心的是 **两条趋势同时演化**:
 *   - DPS(每股派息绝对值)是否稳定/增长?
 *   - 股息率(yield %)是否随股价变化在上升/下降?
 *
 * 数据现状:DPS 在涨(0.85 → 1.03 USD),股息率在跌(0.58% → 0.46%)
 *   → 说明股价涨得比派息快;投资者持有时股票升值多于股息回报
 *
 * 图形表达:
 *   - 左轴 DPS 柱状(青绿 accent)— 5 年序列
 *   - 右轴 股息率折线(warn 橙)— 同 5 年
 *   - 顶部右上:当期股息率 + 5Y 趋势
 *   - 底部 4 列表:分红方案 / 登记日 / 除净日 / 派息日(对齐 LB 真实页)
 */
export function DividendPlan({ history, records }: DividendPlanProps) {
  const latest = history[history.length - 1];

  return (
    <section className="border-b border-line">
      <SectionHeader label="分红方案" hint="Dividend Plan" />

      {/* 顶部摘要 + 双轴图 */}
      <div className="px-4 py-4">
        {/* 顶栏:legend + 当期 yield 大字(右上)*/}
        <div className="mb-3 flex items-baseline justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-baseline gap-1.5 text-fg-2">
              <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
              <span>股息 (USD)</span>
            </span>
            <span className="inline-flex items-baseline gap-1.5 text-fg-2">
              <span aria-hidden="true" className="inline-block h-0.5 w-3 bg-warn" />
              <span>股息率</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="caps text-fg-3">当期股息率</span>
            <span className="num text-2xl font-bold text-accent">
              {formatPct(latest.yieldPct * 100, 2)}
            </span>
            <span className="num text-xs text-fg-3">· 派发率 {formatPct(latest.payoutRatio * 100, 1)}</span>
          </div>
        </div>

        {/* 双轴图:DPS 柱 + 股息率折线 */}
        <DualAxisChart history={history} />
      </div>

      {/* 分红方案 4 列表 */}
      <DividendTable records={records} />
    </section>
  );
}

// ─── Dual-axis chart: DPS bars + yield line ───────────────────────────

function DualAxisChart({ history }: { history: DividendYear[] }) {
  const VBW = 1200;
  const VBH = 240;
  const PAD_TOP = 24;
  const PAD_BOTTOM = 36;
  const PAD_LEFT = 56;
  const PAD_RIGHT = 56;
  const CHART_H = VBH - PAD_TOP - PAD_BOTTOM;
  const N = history.length;
  const SLOT_W = (VBW - PAD_LEFT - PAD_RIGHT) / N;
  const BAR_W = Math.min(SLOT_W * 0.45, 90);

  const maxDps = Math.max(...history.map((h) => h.dps));
  const maxYield = Math.max(...history.map((h) => h.yieldPct));
  const minYield = Math.min(...history.map((h) => h.yieldPct));
  const yieldRange = maxYield - minYield || 1;
  // Y 轴 4 个 tick(左:DPS / 右:yield)
  const dpsTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => +(maxDps * t).toFixed(2));
  const yieldTicks = [0, 0.25, 0.5, 0.75, 1].map((t) =>
    +(minYield + yieldRange * t).toFixed(4),
  );

  const dpsBarY = (v: number) => PAD_TOP + CHART_H - (v / maxDps) * CHART_H;
  const yieldLineY = (v: number) =>
    PAD_TOP + CHART_H - ((v - minYield) / yieldRange) * CHART_H;

  return (
    <svg
      aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${VBW} ${VBH}`}
      className="block w-full"
    >
      {/* 水平栅格 5 档 */}
      {dpsTicks.map((v, i) => {
        const y = dpsBarY(v);
        return (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={VBW - PAD_RIGHT}
              y2={y}
              stroke="var(--color-hairline)"
              strokeWidth="1"
            />
            {/* 左 Y 轴 DPS label */}
            <text
              x={PAD_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--color-fg-3)"
              style={{ fontFamily: "var(--font-num)" }}
            >
              ${v.toFixed(2)}
            </text>
            {/* 右 Y 轴 yield label */}
            <text
              x={VBW - PAD_RIGHT + 8}
              y={y + 4}
              fontSize="11"
              fill="var(--color-fg-3)"
              style={{ fontFamily: "var(--font-num)" }}
            >
              {(yieldTicks[i] * 100).toFixed(2)}%
            </text>
          </g>
        );
      })}

      {/* DPS 柱体 + 顶部 label */}
      {history.map((h, i) => {
        const xCenter = PAD_LEFT + i * SLOT_W + SLOT_W / 2;
        const x = xCenter - BAR_W / 2;
        const y = dpsBarY(h.dps);
        const barH = PAD_TOP + CHART_H - y;
        return (
          <g key={h.year}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              fill="var(--color-accent)"
              opacity={i === N - 1 ? 1 : 0.85}
            />
            <text
              x={xCenter}
              y={y - 8}
              textAnchor="middle"
              fontSize="13"
              fill="var(--color-fg-1)"
              style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}
            >
              ${h.dps.toFixed(2)}
            </text>
            <text
              x={xCenter}
              y={VBH - 12}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-fg-3)"
              style={{ fontFamily: "var(--font-num)" }}
            >
              {h.year}
            </text>
          </g>
        );
      })}

      {/* 股息率折线 + 端点 */}
      <polyline
        points={history
          .map((h, i) => {
            const xCenter = PAD_LEFT + i * SLOT_W + SLOT_W / 2;
            return `${xCenter},${yieldLineY(h.yieldPct)}`;
          })
          .join(" ")}
        fill="none"
        stroke="var(--color-warn)"
        strokeWidth="2"
      />
      {history.map((h, i) => {
        const xCenter = PAD_LEFT + i * SLOT_W + SLOT_W / 2;
        const y = yieldLineY(h.yieldPct);
        return (
          <g key={`yp-${h.year}`}>
            <circle cx={xCenter} cy={y} r="4" fill="var(--color-warn)" />
            <text
              x={xCenter + 8}
              y={y - 6}
              fontSize="11"
              fill="var(--color-warn)"
              style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}
            >
              {(h.yieldPct * 100).toFixed(2)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Dividend records table (4 columns) ──────────────────────────────

function DividendTable({ records }: { records: DividendRecord[] }) {
  return (
    <div className="border-t border-hairline px-4 pb-4">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-hairline py-2 text-xs text-fg-3">
        <div className="caps">分红方案</div>
        <div className="caps">登记日</div>
        <div className="caps">除净日</div>
        <div className="caps">派息日</div>
      </div>
      <ul className="divide-y divide-hairline">
        {records.map((r, i) => (
          <li
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 py-2 text-sm"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-fg-1">
                1 股派息 <span className="num font-semibold">${formatNum(r.amount, 2)}</span> USD
              </span>
              {r.type === "Special" && (
                <span className={cn(
                  "rounded-sm px-1.5 py-0.5 text-2xs font-semibold",
                  "bg-warn/15 text-warn",
                )}>
                  特别
                </span>
              )}
            </div>
            <div className="num text-fg-2">{r.recordDate}</div>
            <div className="num text-fg-2">{r.exDate}</div>
            <div className="num font-semibold text-fg-1">{r.payDate}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
