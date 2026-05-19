"use client";

import { cn, formatNum } from "@/lib/utils";
import type { EarningsForecastQuarter } from "@/mock/stockDetail-lb";
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
      <SectionHeader
        label="业绩预测"
        hint={`未来 ${quarters.length} 季度业绩预测 (Forecast)`}
      />
      {/* spread bar 图例 */}
      <div className="flex justify-end px-4 pt-2 text-2xs text-fg-3">
        <span className="caps">上限 — 均值 — 下限</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="caps px-4 py-2 text-left">季度</th>
            <th className="caps px-4 py-2 text-right">营收下限</th>
            <th className="caps px-4 py-2 text-right">营收均值</th>
            <th className="caps px-4 py-2 text-right">营收上限</th>
            <th className="caps px-4 py-2 text-left pl-6">预测区间</th>
            <th className="caps px-4 py-2 text-right">EPS 均值</th>
            <th className="caps px-4 py-2 text-right">分析师数</th>
          </tr>
        </thead>
        <tbody>
          {quarters.map((q, idx) => {
            const pos = (v: number) => (v / maxRev) * 100;
            const prev = idx > 0 ? quarters[idx - 1] : undefined;
            const dir =
              prev === undefined
                ? null
                : q.revMean > prev.revMean
                  ? "up"
                  : q.revMean < prev.revMean
                    ? "down"
                    : null;
            return (
              <tr key={q.period} className="border-b border-hairline last:border-b-0">
                <td className="num px-4 py-2 font-semibold text-fg-1">{q.period}</td>
                <td className="num px-4 py-2 text-right font-normal text-fg-3">
                  ${formatNum(q.revLow / 1000, 1)}B
                </td>
                <td className="num px-4 py-2 text-right text-accent font-semibold">
                  <span className="inline-flex items-baseline gap-1">
                    {dir === "up" && <span className="text-up">↑</span>}
                    {dir === "down" && <span className="text-down">↓</span>}
                    <span>${formatNum(q.revMean / 1000, 1)}B</span>
                  </span>
                </td>
                <td className="num px-4 py-2 text-right font-normal text-fg-3">
                  ${formatNum(q.revHigh / 1000, 1)}B
                </td>
                <td className="px-4 py-2 pl-6">
                  <div className="relative h-3 w-full min-w-0">
                    <div className="absolute inset-x-0 top-1.5 h-px bg-stroke" />
                    <div
                      className="absolute top-1 h-1 bg-accent opacity-50"
                      style={{
                        left: `${pos(q.revLow)}%`,
                        width: `${pos(q.revHigh) - pos(q.revLow)}%`,
                      }}
                    />
                    <div
                      className={cn("absolute top-0 h-3 bg-accent")}
                      style={{ left: `${pos(q.revMean)}%`, width: "1px" }}
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
