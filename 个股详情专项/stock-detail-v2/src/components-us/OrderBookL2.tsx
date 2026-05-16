import { formatNum, formatPct, formatCompact } from "@/lib/utils";
import type { OrderBookL2Data } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface OrderBookL2Props {
  data: OrderBookL2Data;
}

/**
 * US 客户端 Order book(L2)— 对应 PDF "Order book"。
 *   Top strip:Bid qty | mid bid | mid ask | Ask qty
 *   Right:N levels ⌄ dropdown
 *   Mini chart:近 N tick 价格走势(volume + price)
 *   Balance bar:Bid % vs Ask %
 *   Table:5 行明细(level / bid qty / bid px / ask px / ask qty)
 */
export function OrderBookL2({ data: d }: OrderBookL2Props) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Order book" hint="" />
      <div className="px-4 pb-4">
        {/* Top strip */}
        <div className="mb-3 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 text-sm">
          <span className="num text-up">Bid {d.bidTotal}</span>
          <span className="num text-right font-semibold text-up">
            {formatNum(d.midBid, 3)}
          </span>
          <span className="num font-semibold text-down">
            {formatNum(d.midAsk, 3)}
          </span>
          <span className="num text-right text-down">{d.askTotal} Ask</span>
        </div>

        {/* Levels dropdown */}
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-sm border border-hairline px-2 py-0.5 text-xs text-fg-2 hover:text-fg-1"
          >
            <span>{d.levelCount} levels</span>
            <span className="text-fg-3">⌄</span>
          </button>
        </div>

        {/* Mini chart (last-tick price) */}
        <MiniChart data={d.miniChart} />

        {/* Balance bar */}
        <div className="mt-3">
          <div className="flex h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-up"
              style={{ width: `${d.bidBalancePct * 100}%` }}
            />
            <div
              className="h-full bg-down"
              style={{ width: `${d.askBalancePct * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="num font-semibold text-up">
              Bid {formatPct(d.bidBalancePct * 100, 2)}
            </span>
            <span className="num font-semibold text-down">
              {formatPct(d.askBalancePct * 100, 2)} Ask
            </span>
          </div>
        </div>

        {/* Levels table */}
        <table className="mt-3 w-full table-fixed border-collapse text-xs">
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.level} className="border-t border-hairline">
                <td className="num w-8 py-1.5 pl-1 text-center">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-up/15 font-semibold text-up">
                    {r.level}
                  </span>
                </td>
                <td className="num py-1.5 text-right text-up">{r.bidQty}</td>
                <td className="num py-1.5 text-right text-fg-1">
                  {formatNum(r.bidPx, 3)}
                </td>
                <td className="num py-1.5 text-right text-fg-1">
                  {formatNum(r.askPx, 3)}
                </td>
                <td className="num py-1.5 text-right text-down">{r.askQty}</td>
                <td className="num w-8 py-1.5 pr-1 text-center">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-down/15 font-semibold text-down">
                    {r.level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MiniChart({ data }: { data: OrderBookL2Data["miniChart"] }) {
  const W = 540;
  const H = 70;
  const PAD = 4;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const min = Math.min(...data.priceLine);
  const max = Math.max(...data.priceLine);
  const range = max - min || 1;

  const points = data.priceLine.map((v, i) => {
    const x = PAD + (i / (data.priceLine.length - 1)) * innerW;
    const y = PAD + (1 - (v - min) / range) * innerH;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${PAD + innerW},${PAD + innerH} L ${PAD},${PAD + innerH} Z`;

  return (
    <div className="relative">
      <svg aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-16 w-full"
      >
        <defs>
          <linearGradient id="us-ob-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-up)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-up)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#us-ob-area)" />
        <path d={linePath} fill="none" stroke="var(--color-up)" strokeWidth="1.5" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-fg-3">
        <span className="num">{formatCompact(data.priceLow * 100)}</span>
        <span className="num">{formatNum(data.priceHigh, 3)}</span>
      </div>
    </div>
  );
}
