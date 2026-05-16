import { formatNum } from "@/lib/utils";
import type { EarningsForecastQuarter } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface EarningsForecastProps {
  quarters: EarningsForecastQuarter[];
}

/**
 * 业绩预测 — 季度 forecast 表
 * 每行:季度 + Rev 区间 + Mean + EPS 区间 + Mean + analyst count
 */
export function EarningsForecast({ quarters }: EarningsForecastProps) {
  const maxRev = Math.max(...quarters.map((q) => q.revHigh));

  return (
    <section className="border-b border-line">
      <SectionHeader label="Earnings Forecast" hint="EE · ANALYST EST" />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="caps px-4 py-1.5 text-left">Period</th>
            <th className="caps px-4 py-1.5 text-right">Rev Low</th>
            <th className="caps px-4 py-1.5 text-right">Rev Mean</th>
            <th className="caps px-4 py-1.5 text-right">Rev High</th>
            <th className="caps px-4 py-1.5 text-left pl-6">Spread</th>
            <th className="caps px-4 py-1.5 text-right">EPS Mean</th>
            <th className="caps px-4 py-1.5 text-right">#</th>
          </tr>
        </thead>
        <tbody>
          {quarters.map((q) => {
            const pos = (v: number) => (v / maxRev) * 100;
            return (
              <tr key={q.period} className="border-b border-hairline last:border-b-0">
                <td className="num px-4 py-2 font-semibold text-fg-1">{q.period}</td>
                <td className="num px-4 py-2 text-right text-fg-3">
                  ${formatNum(q.revLow / 1000, 1)}B
                </td>
                <td className="num px-4 py-2 text-right text-accent font-semibold">
                  ${formatNum(q.revMean / 1000, 1)}B
                </td>
                <td className="num px-4 py-2 text-right text-fg-3">
                  ${formatNum(q.revHigh / 1000, 1)}B
                </td>
                <td className="px-4 py-2 pl-6">
                  <div className="relative h-3 w-full min-w-[180px]">
                    <div className="absolute inset-x-0 top-[6px] h-px bg-stroke" />
                    <div
                      className="absolute top-1 h-1 bg-accent opacity-50"
                      style={{
                        left: `${pos(q.revLow)}%`,
                        width: `${pos(q.revHigh) - pos(q.revLow)}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 h-3 w-0.5 bg-accent"
                      style={{ left: `${pos(q.revMean)}%` }}
                    />
                  </div>
                </td>
                <td className="num px-4 py-2 text-right text-fg-1">
                  ${formatNum(q.epsMean, 2)}
                </td>
                <td className="num px-4 py-2 text-right text-fg-3">
                  {q.analystCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
