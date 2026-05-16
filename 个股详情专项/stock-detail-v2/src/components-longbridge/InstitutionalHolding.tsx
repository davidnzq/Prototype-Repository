import { cn, formatPct } from "@/lib/utils";
import type { InstitutionalHolding as IH } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface InstitutionalHoldingProps {
  data: IH;
}

/**
 * 持股股东 — 长桥版
 * 4 列简表:股东名称 / 持股比例 / 较内份额增减(万股) / 披露时间
 * 不再有 ownership donut / netFlow waterfall(长桥真实页无此元素)
 */
export function InstitutionalHolding({ data }: InstitutionalHoldingProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="持股股东" hint="Institutional Holding" />
      <div className="px-4 py-3">
        {/* 表头 */}
        <div className="grid grid-cols-[1fr_120px_140px_120px] gap-2 border-b border-hairline pb-2 text-xs text-fg-3">
          <div>股东名称</div>
          <div className="text-right">持股比例</div>
          <div className="text-right">较内份额增减</div>
          <div className="text-right">披露时间</div>
        </div>

        {/* 数据行 */}
        <ul className="divide-y divide-hairline">
          {data.holders.map((h) => (
            <li
              key={h.name}
              className="grid grid-cols-[1fr_120px_140px_120px] items-center gap-2 py-1.5 text-sm"
            >
              <span className="truncate text-fg-1">{h.name}</span>
              <span className="num text-right font-semibold text-fg-1">
                {formatPct(h.pctOut * 100, 2)}
              </span>
              <span
                className={cn(
                  "num text-right font-semibold",
                  h.sharesChange >= 0 ? "text-up" : "text-down",
                )}
              >
                {h.sharesChange >= 0 ? "+" : "−"}
                {Math.abs(h.sharesChange).toFixed(2)} 万股
              </span>
              <span className="num text-right text-fg-3">{h.disclosureDate}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
