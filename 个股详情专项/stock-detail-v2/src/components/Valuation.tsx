import { cn, formatNum } from "@/lib/utils";
import type { ValuationMetric } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface ValuationProps {
  metrics: ValuationMetric[];
}

/**
 * 估值分析 — Morningstar bullet chart 风格
 * 每个 metric 一行,横向 bullet:
 *   peer min .. 25% .. (industry avg marker) .. 75% .. peer max
 *   当前股票 marker
 */
export function Valuation({ metrics }: ValuationProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Valuation vs Peers" hint="VAL · BULLET" />
      <div className="px-4 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline">
              <th className="caps py-1.5 text-left">Metric</th>
              <th className="caps py-1.5 text-right">Current</th>
              <th className="caps py-1.5 text-right">Industry Avg</th>
              <th className="caps py-1.5 text-left pl-4">Peer Range (25–75%)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <ValuationRow key={m.label} metric={m} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ValuationRow({ metric: m }: { metric: ValuationMetric }) {
  const range = m.peerMax - m.peerMin;
  const pos = (v: number) => ((v - m.peerMin) / range) * 100;

  // 当前值相对 peer 的位置
  const currentVsAvg = m.current > m.industryAvg ? "expensive" : "cheap";
  const currentColor =
    currentVsAvg === "expensive" ? "text-down" : "text-up";

  return (
    <tr className="border-b border-hairline last:border-b-0">
      <td className="py-2">
        <span className="text-fg-1">{m.label}</span>
      </td>
      <td className={cn("num py-2 text-right text-base font-semibold", currentColor)}>
        {formatNum(m.current, 2)}
      </td>
      <td className="num py-2 text-right text-fg-2">
        {formatNum(m.industryAvg, 2)}
      </td>
      <td className="py-2 pl-4">
        <div className="relative h-4 w-full min-w-[240px]">
          {/* Full range bar */}
          <div className="absolute inset-x-0 top-[7px] h-[2px] bg-stroke" />
          {/* 25-75% range */}
          <div
            className="absolute top-[5px] h-[6px] bg-soft"
            style={{
              left: `${pos(m.peerLow)}%`,
              width: `${pos(m.peerHigh) - pos(m.peerLow)}%`,
            }}
          />
          {/* Industry avg marker */}
          <div
            className="absolute top-[3px] h-[10px] w-[2px] bg-fg-3"
            style={{ left: `${pos(m.industryAvg)}%` }}
          />
          {/* Current marker — diamond */}
          <div
            className={cn(
              "absolute top-[2px] h-3 w-3 -translate-x-1/2 rotate-45 ring-2 ring-bg",
              currentVsAvg === "expensive" ? "bg-down" : "bg-up",
            )}
            style={{ left: `${pos(m.current)}%` }}
          />
          {/* Min/Max labels */}
          <div className="num absolute -bottom-3 left-0 text-2xs text-fg-4">
            {formatNum(m.peerMin, 1)}
          </div>
          <div className="num absolute -bottom-3 right-0 text-2xs text-fg-4">
            {formatNum(m.peerMax, 1)}
          </div>
        </div>
      </td>
    </tr>
  );
}
