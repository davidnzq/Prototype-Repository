import { cn, formatNum, formatPct } from "@/lib/utils";
import type { EarningsHighlight } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface EarningsSummaryProps {
  data: EarningsHighlight;
}

/**
 * 业绩摘要 — Bloomberg ERN 风格
 * 上半:Rev / EPS / Surprise 3 列对比(actual vs estimate)
 * 下半:Guidance
 */
export function EarningsSummary({ data }: EarningsSummaryProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Earnings Summary" hint={`ERN · ${data.fiscalPeriod}`} />

      <div className="grid grid-cols-3 divide-x divide-hairline">
        <Metric
          label="Revenue"
          actual={`$${formatNum(data.revenue.actual / 1000, 2)}B`}
          estimate={`$${formatNum(data.revenue.estimate / 1000, 2)}B`}
          yoy={data.revenue.yoy}
          surprise={(data.revenue.actual - data.revenue.estimate) / data.revenue.estimate}
        />
        <Metric
          label="EPS"
          actual={`$${formatNum(data.eps.actual, 2)}`}
          estimate={`$${formatNum(data.eps.estimate, 2)}`}
          yoy={data.eps.yoy}
          surprise={(data.eps.actual - data.eps.estimate) / data.eps.estimate}
        />
        <div className="px-4 py-4">
          <div className="caps mb-2">Surprise</div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "num text-3xl font-semibold leading-none",
                data.surprise >= 0 ? "text-up" : "text-down",
              )}
            >
              {data.surprise >= 0 ? "+" : "−"}
              {(Math.abs(data.surprise) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="caps mt-2">
            {data.surprise >= 0 ? "▲ BEAT" : "▼ MISS"}
          </div>
          <div className="num mt-3 text-xs text-fg-3">
            Reported: {data.reportedAt}
          </div>
        </div>
      </div>

      {data.guidance && (
        <div className="border-t border-hairline bg-card-2 px-4 py-3">
          <div className="caps mb-2 text-accent">Next Quarter Guidance</div>
          <div className="grid grid-cols-2 gap-x-8 text-base">
            <div className="flex items-baseline justify-between">
              <span className="caps">Revenue</span>
              <span className="num text-fg-1">
                ${formatNum(data.guidance.rev[0] / 1000, 1)}B – $
                {formatNum(data.guidance.rev[1] / 1000, 1)}B
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="caps">EPS</span>
              <span className="num text-fg-1">
                ${formatNum(data.guidance.eps[0], 2)} – $
                {formatNum(data.guidance.eps[1], 2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  actual,
  estimate,
  yoy,
  surprise,
}: {
  label: string;
  actual: string;
  estimate: string;
  yoy: number;
  surprise: number;
}) {
  return (
    <div className="px-4 py-4">
      <div className="caps mb-2">{label}</div>
      <div className="num text-2xl font-semibold text-fg-1">{actual}</div>
      <div className="num mt-2 space-y-1 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="caps">Estimate</span>
          <span className="text-fg-2">{estimate}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="caps">Surprise</span>
          <span className={cn(surprise >= 0 ? "text-up" : "text-down")}>
            {formatPct(surprise * 100, 2)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="caps">YoY</span>
          <span className={cn(yoy >= 0 ? "text-up" : "text-down")}>
            {formatPct(yoy * 100, 1)}
          </span>
        </div>
      </div>
    </div>
  );
}
