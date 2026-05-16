import { cn, formatNum, formatPct } from "@/lib/utils";
import type { DividendYear, DividendRecord } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface DividendPlanProps {
  history: DividendYear[];
  records: DividendRecord[];
}

/**
 * 分红方案 — Bloomberg DVD 页风格
 * 左:年度股息柱 + yield 折线点
 * 右:最近 4 次分红记录表
 */
export function DividendPlan({ history, records }: DividendPlanProps) {
  const maxDps = Math.max(...history.map((h) => h.dps));
  const maxYield = Math.max(...history.map((h) => h.yieldPct));
  const latestDps = history[history.length - 1].dps;
  const latestYield = history[history.length - 1].yieldPct;
  const dpsGrowth =
    (history[history.length - 1].dps - history[0].dps) / history[0].dps;

  return (
    <section className="border-b border-line">
      <SectionHeader label="Dividend" hint="DVD" />
      <div className="grid grid-cols-[1fr_360px] divide-x divide-hairline">
        {/* History chart */}
        <div className="px-4 py-4">
          {/* Summary */}
          <div className="flex items-baseline gap-6 text-sm">
            <span className="inline-flex items-baseline gap-1.5">
              <span className="caps">Latest DPS</span>
              <span className="num text-lg font-semibold text-fg-1">
                ${formatNum(latestDps, 2)}
              </span>
            </span>
            <span className="inline-flex items-baseline gap-1.5">
              <span className="caps">Yield</span>
              <span className="num text-lg font-semibold text-accent">
                {formatPct(latestYield * 100, 2)}
              </span>
            </span>
            <span className="inline-flex items-baseline gap-1.5">
              <span className="caps">5Y Growth</span>
              <span
                className={cn(
                  "num text-lg font-semibold",
                  dpsGrowth >= 0 ? "text-up" : "text-down",
                )}
              >
                {formatPct(dpsGrowth * 100, 1)}
              </span>
            </span>
          </div>

          {/* Chart — div 主体(避免 SVG stretch 导致字体变形),yield overlay 用 SVG with vectorEffect */}
          <div className="relative mt-4 h-32 pt-5 pb-5">
            {/* DPS bars(div 实现,字体不会被拉伸) */}
            <div className="absolute inset-0 flex items-end justify-around px-2 pb-5">
              {history.map((h) => {
                const barHpct = (h.dps / maxDps) * 75;
                return (
                  <div
                    key={h.year}
                    className="relative flex flex-col items-center"
                    style={{ flex: 1, height: "100%" }}
                  >
                    {/* $ label - 浮在 bar 顶上 */}
                    <div
                      className="num absolute text-2xs font-semibold text-fg-1"
                      style={{ bottom: `${barHpct}%`, marginBottom: 2 }}
                    >
                      ${h.dps.toFixed(2)}
                    </div>
                    {/* Bar */}
                    <div
                      className="w-7 bg-accent"
                      style={{ height: `${barHpct}%`, opacity: 0.4 }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Year labels - 底部 */}
            <div className="absolute inset-x-0 bottom-0 flex justify-around px-2">
              {history.map((h) => (
                <div
                  key={h.year}
                  className="num text-2xs text-fg-3"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  {h.year}
                </div>
              ))}
            </div>

            {/* Yield line overlay(SVG with non-scaling-stroke,避免线宽变形) */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="var(--warn)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                points={history
                  .map((h, i) => {
                    const x = ((i + 0.5) / history.length) * 100;
                    const y = 95 - (h.yieldPct / maxYield) * 70;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>

            {/* Yield dots - div + rounded-full,保证圆形 */}
            {history.map((h, i) => {
              const xPct = ((i + 0.5) / history.length) * 100;
              const yPct = 95 - (h.yieldPct / maxYield) * 70;
              return (
                <div
                  key={h.year}
                  className="pointer-events-none absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warn"
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                />
              );
            })}
          </div>
          {/* Legend - DPS bar 用矩形,Yield 用圆点(代表线上的数据点) */}
          <div className="num mt-1 flex items-center gap-3 text-xs text-fg-3">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2 w-2 rounded-sm bg-accent opacity-40" />
              DPS
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2 w-2 rounded-full bg-warn" />
              Yield %
            </span>
          </div>
        </div>

        {/* Records table */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Recent Records</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="caps py-1 text-left">Ex Date</th>
                <th className="caps py-1 text-left">Pay Date</th>
                <th className="caps py-1 text-right">Amount</th>
                <th className="caps py-1 text-right">Type</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-hairline last:border-b-0">
                  <td className="num py-1.5 text-fg-1">{r.exDate}</td>
                  <td className="num py-1.5 text-fg-2">{r.payDate}</td>
                  <td className="num py-1.5 text-right font-semibold text-accent">
                    ${formatNum(r.amount, 2)}
                  </td>
                  <td className="py-1.5 text-right">
                    <span
                      className={cn(
                        "text-xs",
                        r.type === "Special" ? "text-warn" : "text-fg-3",
                      )}
                    >
                      {r.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
