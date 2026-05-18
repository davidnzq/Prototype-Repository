import { cn, formatNum, formatPct } from "@/lib/utils";
import type { EarningsHighlight, EarningsHighlightForecastMetric } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface EarningsSummaryProps {
  data: EarningsHighlight;
}

/**
 * 业绩摘要 / 财报预测 — 长桥版
 *
 * 检测 data 是否含 Plan13 新字段(forecastMetrics / fiscalPeriodLabel ...):
 *   - 若有 → 渲染"财报预测"新版布局(参考 Plan13-images/24-1.jpg)
 *   - 否则 → 渲染旧版 ERN(actual vs estimate)布局,保持向后兼容
 */
export function EarningsSummary({ data }: EarningsSummaryProps) {
  if (data.forecastMetrics && data.forecastMetrics.length > 0) {
    return <ForecastLayout data={data} />;
  }
  return <LegacyLayout data={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan13 新版 —— 财报预测
// ─────────────────────────────────────────────────────────────────────────────
function ForecastLayout({ data }: { data: EarningsHighlight }) {
  return (
    <section className="border-b border-line">
      {/* 顶栏 — 币种 + 单季报 dropdown */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-fg-3">
          币种:<span className="text-fg-1 ml-1">{data.currency ?? "USD"}</span>
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-hairline bg-card-2 px-3 py-1 text-fg-2 hover:bg-soft"
        >
          <span>{data.reportType ?? "单季报"}</span>
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4 L5 7 L8 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 大标题 + info + 外链 + 更多 */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-fg-1">
            {data.fiscalPeriodLabel ?? data.fiscalPeriod}
          </h3>
          <InfoIcon />
          <ExternalIcon />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-0.5 text-sm text-fg-3 hover:text-fg-1"
        >
          更多
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2 L8 6 L4 10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 副标题 — 财报区间 */}
      {data.reportDateRange && (
        <div className="num px-4 pt-1 text-sm text-fg-3">
          财报区间:{data.reportDateRange}
        </div>
      )}

      {/* 前瞻段落 */}
      {data.forewordText && (
        <p className="px-4 pt-3 pb-4 text-sm leading-relaxed text-fg-2">
          {data.forewordText}
        </p>
      )}

      {/* 双栏表格 — 公布值 / 预测值 */}
      <div className="border-t border-hairline">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 bg-card-2 px-4 py-2 text-xs text-fg-3">
          <span></span>
          <div className="text-right">公布值 / 同比</div>
          <div className="text-right">预测值 / 同比</div>
        </div>
        <ul className="divide-y divide-hairline">
          {data.forecastMetrics!.map((m) => (
            <MetricRow key={m.name} metric={m} />
          ))}
        </ul>
      </div>

      {/* 底栏 — 业绩披露日 + 日历 icon */}
      {data.disclosureDate && (
        <div className="flex items-center justify-between border-t border-hairline bg-card-2 px-4 py-3 text-sm text-fg-3">
          <span>{data.disclosureDate}</span>
          <CalendarIcon />
        </div>
      )}
    </section>
  );
}

function MetricRow({ metric }: { metric: EarningsHighlightForecastMetric }) {
  const yoyPositive = metric.forecastYoY >= 0;
  return (
    <li className="grid grid-cols-[1.2fr_1fr_1fr] items-baseline gap-2 px-4 py-2 text-sm">
      <span className="font-medium text-fg-1">{metric.name}</span>
      <span className="text-right text-fg-3">{metric.actualLabel}</span>
      <div className="flex items-baseline justify-end gap-2">
        <span className="num font-semibold text-fg-1">{metric.forecastDisplay}</span>
        <span className={cn("num text-xs", yoyPositive ? "text-up" : "text-down")}>
          {yoyPositive ? "+" : ""}
          {formatPct(metric.forecastYoY * 100, 2)}
        </span>
      </div>
    </li>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-fg-4">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
      <circle cx="7" cy="4" r="0.7" fill="currentColor" />
      <path d="M7 6 V10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-fg-4">
      <path d="M5 2 H2 V12 H12 V9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2 H12 V6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7 L12 2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-fg-3">
      <rect x="2" y="3.5" width="12" height="10" rx="1.5" />
      <path d="M2 6.5 H14" />
      <path d="M5 2 V5" strokeLinecap="round" />
      <path d="M11 2 V5" strokeLinecap="round" />
      <path d="M11 9.5 H13 V11.5 H11 Z" fill="currentColor" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy —— Bloomberg ERN 风格(向后兼容,无 forecast 字段时使用)
// ─────────────────────────────────────────────────────────────────────────────
function LegacyLayout({ data }: { data: EarningsHighlight }) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="业绩摘要 (Earnings Summary)" hint={`ERN · ${data.fiscalPeriod}`} />

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
          <div className="caps mb-2">超预期</div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "num text-2xl font-semibold leading-none",
                data.surprise >= 0 ? "text-up" : "text-down",
              )}
            >
              {data.surprise >= 0 ? "+" : "−"}
              {(Math.abs(data.surprise) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="caps mt-2">
            {data.surprise >= 0 ? "▲ 超预期" : "▼ 未达预期"}
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
          <span className="caps">超预期</span>
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
