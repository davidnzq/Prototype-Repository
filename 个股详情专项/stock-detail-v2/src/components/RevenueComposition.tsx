import { cn, formatNum, formatPct } from "@/lib/utils";
import type { RevenueSegment } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface RevenueCompositionProps {
  segments: RevenueSegment[];
}

/**
 * 营收构成 — Bloomberg 风格
 * 左:横向 stacked bar(每个 segment 一个 chart 色)
 * 右:列表(label / revenue / pct / YoY indicator)
 */
export function RevenueComposition({ segments }: RevenueCompositionProps) {
  const totalRevenue = segments.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <section className="border-b border-line">
      <SectionHeader label="Revenue Composition" hint="SEGMENT · LATEST Q" />
      <div className="grid grid-cols-[1fr_400px] divide-x divide-hairline">
        {/* Stacked bar */}
        <div className="px-4 py-4">
          <div className="caps mb-2 flex items-baseline justify-between">
            <span>Total Revenue</span>
            <span className="num text-xl font-semibold text-fg-1">
              ${formatNum(totalRevenue, 2)}B
            </span>
          </div>
          {/* Bar */}
          <div className="mt-3 flex h-7 w-full overflow-hidden">
            {segments.map((s) => (
              <div
                key={s.label}
                className="relative flex items-center justify-center"
                style={{ width: `${s.pct * 100}%`, background: s.color }}
                title={`${s.label}: ${formatPct(s.pct * 100, 1)}`}
              >
                {s.pct > 0.05 && (
                  <span className="num text-xs font-bold text-fg-inverse">
                    {formatPct(s.pct * 100, 0)}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Legend below bar */}
          <div className="num mt-3 grid grid-cols-3 gap-2 text-sm">
            {segments.map((s) => (
              <div key={s.label} className="inline-flex items-baseline gap-1.5">
                <i
                  className="inline-block h-2 w-2 shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-fg-2">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-4 py-4">
          <div className="caps mb-2">Segment Breakdown</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline">
                <th className="caps py-1 text-left">Segment</th>
                <th className="caps py-1 text-right">Rev ($B)</th>
                <th className="caps py-1 text-right">%</th>
                <th className="caps py-1 text-right">YoY δpp</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => {
                const yoyPp = s.yoy * 100;
                return (
                  <tr key={s.label} className="border-b border-hairline last:border-b-0">
                    <td className="py-1.5">
                      <span className="inline-flex items-center gap-1.5">
                        <i
                          className="inline-block h-2 w-2 shrink-0"
                          style={{ background: s.color }}
                        />
                        <span className="text-fg-1">{s.label}</span>
                      </span>
                    </td>
                    <td className="num py-1.5 text-right text-fg-1">
                      {formatNum(s.revenue, 2)}
                    </td>
                    <td className="num py-1.5 text-right text-fg-2">
                      {formatPct(s.pct * 100, 1)}
                    </td>
                    <td
                      className={cn(
                        "num py-1.5 text-right",
                        yoyPp >= 0 ? "text-up" : "text-down",
                      )}
                    >
                      {yoyPp >= 0 ? "▲" : "▼"} {Math.abs(yoyPp).toFixed(1)}pp
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
