import { useState } from "react";
import { cn, formatNum, formatPct } from "@/lib/utils";
import type {
  FinancialBarReport,
  FinancialMetric,
  FinancialPeriodPoint,
} from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface FinancialTableProps {
  data: FinancialBarReport;
  /** 兼容旧 API 占位:title/hint 都从 data 来 */
  title?: string;
  hint?: string;
}

/**
 * 财务报表 — 长桥版(柱状图替代纯表格)
 * - 顶部 metric tab(每股收益 / ROE / 营业收入 / 净利润 / ...)
 * - 5 期柱状图(单季)
 * - 下方明细行:数值 / YoY / 股价
 */
export function FinancialTable({ data }: FinancialTableProps) {
  const [active, setActive] = useState(data.defaultMetric);
  const metric = data.metrics.find((m) => m.key === active) ?? data.metrics[0];

  return (
    <section className="border-b border-line">
      <SectionHeader label={data.title} hint={`${data.hint} · 单季`} />

      {/* Metric tab 横向 */}
      <div className="flex flex-wrap gap-1 border-b border-hairline px-4 py-2 text-sm">
        {data.metrics.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActive(m.key)}
            className={cn(
              "rounded-sm px-3 py-1 transition-colors",
              m.key === active
                ? "bg-accent/15 font-semibold text-accent"
                : "text-fg-3 hover:bg-soft hover:text-fg-1",
            )}
          >
            {m.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-fg-3">
          {metric.highlightLabel && (
            <span className="rounded-sm bg-soft px-2 py-0.5">
              {metric.highlightLabel}
            </span>
          )}
          <span className="cursor-pointer transition-colors hover:text-fg-1">单季 / 累计 ▾</span>
        </div>
      </div>

      <MetricBarChart metric={metric} />

      <MetricFooterTable metric={metric} />
    </section>
  );
}

function MetricBarChart({ metric }: { metric: FinancialMetric }) {
  const isDual = metric.points.some((p) => p.value2 !== undefined);
  const allValues = isDual
    ? metric.points.flatMap((p) => [p.value, p.value2 ?? 0])
    : metric.points.map((p) => p.value);
  const positive = allValues.filter((v) => v >= 0);
  const negative = allValues.filter((v) => v < 0);
  const maxV = positive.length ? Math.max(...positive) : 0;
  const minV = negative.length ? Math.min(...negative) : 0;
  const range = maxV - minV || maxV || 1;

  // viewBox 设定:VBW=1200 匹配 1280 主容器
  const VBW = 1200;
  const VBH = 240;
  const PAD_TOP = 36;
  const PAD_BOTTOM = 36;
  const PAD_X = 24;
  const CHART_H = VBH - PAD_TOP - PAD_BOTTOM;
  const N = metric.points.length;
  const SLOT_W = (VBW - PAD_X * 2) / N;
  // 双柱模式下 bar 更窄并并排;单柱模式保持原尺寸
  const BAR_W = isDual
    ? Math.min(SLOT_W * 0.32, 80)
    : Math.min(SLOT_W * 0.5, 120);
  const BAR_GAP = isDual ? Math.min(SLOT_W * 0.04, 8) : 0;

  // 0 线 y 坐标(若有负数,按比例)
  const zeroY =
    minV < 0
      ? PAD_TOP + CHART_H * (maxV / range)
      : PAD_TOP + CHART_H;

  // 双柱模式:股价线(从 stockChange 累计推算 — 视觉化用,不参与 y 轴)
  const hasStockLine = isDual && metric.points.some((p) => p.stockChange !== undefined);

  return (
    <div className="px-4 py-4">
      <svg
        aria-hidden="true"
        width="100%"
        viewBox={`0 0 ${VBW} ${VBH}`}
        className="block w-full"
      >
        {/* 0 线 */}
        <line
          x1={PAD_X}
          y1={zeroY}
          x2={VBW - PAD_X}
          y2={zeroY}
          stroke="var(--color-hairline)"
          strokeWidth="1"
        />

        {metric.points.map((p, i) => {
          const xCenter = PAD_X + i * SLOT_W + SLOT_W / 2;
          const h1 = (Math.abs(p.value) / range) * CHART_H;
          const y1 = p.value >= 0 ? zeroY - h1 : zeroY;

          if (isDual && p.value2 !== undefined) {
            // 双柱:value(总资产, accent) | value2(总负债, down)
            const xV1 = xCenter - BAR_W - BAR_GAP / 2;
            const xV2 = xCenter + BAR_GAP / 2;
            const h2 = (Math.abs(p.value2) / range) * CHART_H;
            const y2 = p.value2 >= 0 ? zeroY - h2 : zeroY;
            return (
              <g key={p.period}>
                <rect x={xV1} y={y1} width={BAR_W} height={Math.max(h1, 1)} fill="var(--color-accent)" />
                <text x={xV1 + BAR_W / 2} y={y1 - 8} textAnchor="middle" fontSize="13" fill="var(--color-accent)" style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}>
                  {formatValueShort(p.value, metric.format)}
                </text>
                <rect x={xV2} y={y2} width={BAR_W} height={Math.max(h2, 1)} fill="var(--color-down)" />
                <text x={xV2 + BAR_W / 2} y={y2 - 8} textAnchor="middle" fontSize="13" fill="var(--color-down)" style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}>
                  {formatValueShort(p.value2, metric.format)}
                </text>
              </g>
            );
          }

          // 单柱模式(原逻辑)
          const x = xCenter - BAR_W / 2;
          const isUp = p.value >= 0;
          return (
            <g key={p.period}>
              <rect
                x={x}
                y={y1}
                width={BAR_W}
                height={Math.max(h1, 1)}
                fill={isUp ? "var(--color-accent)" : "var(--color-down)"}
                className={i === N - 1 ? "opacity-100" : "opacity-85"}
              />
              <text
                x={xCenter}
                y={isUp ? y1 - 8 : y1 + h1 + 18}
                textAnchor="middle"
                fontSize="14"
                fill="var(--color-fg-1)"
                style={{ fontFamily: "var(--font-num)", fontWeight: 600 }}
              >
                {formatValueShort(p.value, metric.format)}
              </text>
            </g>
          );
        })}

        {/* 双柱模式下的股价 overlay 线(独立 y 轴,跨越整个柱区,zorder 在柱之上) */}
        {hasStockLine && (() => {
          const stockVals = metric.points.map((p) => p.stockChange ?? 0);
          const sMax = Math.max(...stockVals, 0);
          const sMin = Math.min(...stockVals, 0);
          const sRange = sMax - sMin || 1;
          // 用全 CHART_H 内边距 8%(避免贴顶/贴底),股价线从上到下漂浮在柱状区
          const STOCK_PAD = CHART_H * 0.08;
          const STOCK_TOP = PAD_TOP + STOCK_PAD;
          const STOCK_H = CHART_H - STOCK_PAD * 2;
          const stockY = (v: number) =>
            STOCK_TOP + STOCK_H - ((v - sMin) / sRange) * STOCK_H;
          return (
            <>
              <polyline
                points={metric.points
                  .map((p, i) => `${PAD_X + i * SLOT_W + SLOT_W / 2},${stockY(p.stockChange ?? 0)}`)
                  .join(" ")}
                fill="none"
                stroke="var(--color-chart-blue)"
                strokeWidth="2"
                opacity="0.9"
              />
              {/* 端点 dot */}
              {metric.points.map((p, i) => (
                <circle
                  key={`sp-${p.period}`}
                  cx={PAD_X + i * SLOT_W + SLOT_W / 2}
                  cy={stockY(p.stockChange ?? 0)}
                  r="3"
                  fill="var(--color-chart-blue)"
                  opacity="0.9"
                />
              ))}
            </>
          );
        })()}

        {/* trend line(可选) */}
        {metric.trendLine && (
          <polyline
            points={metric.trendLine
              .map((v, i) => {
                const x = PAD_X + i * SLOT_W + SLOT_W / 2;
                const y = zeroY - (v / range) * CHART_H;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--color-warn)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}

        {/* 双柱模式 — 顶部 inline legend */}
        {isDual && (
          <g>
            <rect x={PAD_X} y={8} width={10} height={10} fill="var(--color-accent)" />
            <text x={PAD_X + 14} y={17} fontSize="12" fill="var(--color-fg-2)">
              {metric.label}
            </text>
            <rect x={PAD_X + 90} y={8} width={10} height={10} fill="var(--color-down)" />
            <text x={PAD_X + 104} y={17} fontSize="12" fill="var(--color-fg-2)">
              {metric.value2Label}
            </text>
            {hasStockLine && (
              <>
                <line x1={PAD_X + 180} y1={13} x2={PAD_X + 196} y2={13} stroke="var(--color-chart-blue)" strokeWidth="1.5" opacity="0.7" />
                <text x={PAD_X + 200} y={17} fontSize="12" fill="var(--color-fg-2)">股价</text>
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

function MetricFooterTable({ metric }: { metric: FinancialMetric }) {
  return (
    <div className="px-4 pb-4 text-sm">
      <div
        className="grid items-center gap-2 border-b border-hairline py-1.5 text-xs text-fg-3"
        style={{ gridTemplateColumns: `120px repeat(${metric.points.length}, 1fr)` }}
      >
        <div />
        {metric.points.map((p) => (
          <div key={p.period} className="text-center">
            {p.period}
          </div>
        ))}
      </div>

      <FooterRow
        label={metric.label}
        points={metric.points}
        format={metric.format}
        valueFn={(p) => formatValueShort(p.value, metric.format)}
      />

      {/* 双柱模式:第二行显示 value2(如总负债);非双柱模式显示同比 */}
      {metric.points.some((p) => p.value2 !== undefined) ? (
        <FooterRow
          label={metric.value2Label ?? ""}
          points={metric.points}
          valueFn={(p) =>
            p.value2 !== undefined ? formatValueShort(p.value2, metric.format) : "—"
          }
          colorFn={() => "text-fg-1"}
        />
      ) : (
        metric.points.some((p) => p.yoy !== undefined) && (
          <FooterRow
            label="同比"
            points={metric.points}
            color="trend"
            valueFn={(p) =>
              p.yoy !== undefined
                ? `${p.yoy >= 0 ? "+" : ""}${formatPct(p.yoy * 100, 2)}`
                : "—"
            }
            colorFn={(p) =>
              p.yoy === undefined ? "text-fg-4" : p.yoy >= 0 ? "text-up" : "text-down"
            }
          />
        )
      )}

      {metric.points.some((p) => p.stockChange !== undefined) && (
        <FooterRow
          label="股价"
          points={metric.points}
          valueFn={(p) =>
            p.stockChange !== undefined
              ? `${p.stockChange >= 0 ? "+" : ""}${formatPct(p.stockChange * 100, 2)}`
              : "—"
          }
          colorFn={(p) =>
            p.stockChange === undefined
              ? "text-fg-4"
              : p.stockChange >= 0
                ? "text-up"
                : "text-down"
          }
        />
      )}
    </div>
  );
}

function FooterRow({
  label,
  points,
  valueFn,
  colorFn,
}: {
  label: string;
  points: FinancialPeriodPoint[];
  valueFn: (p: FinancialPeriodPoint) => string;
  color?: "trend";
  colorFn?: (p: FinancialPeriodPoint) => string;
  format?: string;
}) {
  return (
    <div
      className="grid items-center gap-2 border-b border-hairline py-1.5 last:border-b-0"
      style={{ gridTemplateColumns: `120px repeat(${points.length}, 1fr)` }}
    >
      <span className="text-fg-3">{label}</span>
      {points.map((p) => (
        <span
          key={p.period}
          className={cn(
            "num text-center",
            colorFn ? colorFn(p) : "text-fg-1",
          )}
        >
          {valueFn(p)}
        </span>
      ))}
    </div>
  );
}

function formatValueShort(v: number, format: string): string {
  if (format === "percent") return formatPct(v * 100, 2);
  if (format === "ratio") return v.toFixed(2);
  // currency / number
  const abs = Math.abs(v);
  const unit = format === "currency" ? "万元" : "万";
  if (abs >= 10_000) return `${(v / 10_000).toFixed(2)} ${unit}`;
  if (abs >= 100) return formatNum(v, 0);
  return formatNum(v, 2);
}
