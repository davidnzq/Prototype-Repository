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
          <span>单季 ▾</span>
        </div>
      </div>

      <MetricBarChart metric={metric} />

      <MetricFooterTable metric={metric} />
    </section>
  );
}

function MetricBarChart({ metric }: { metric: FinancialMetric }) {
  const values = metric.points.map((p) => p.value);
  const positive = values.filter((v) => v >= 0);
  const negative = values.filter((v) => v < 0);
  const maxV = positive.length ? Math.max(...positive) : 0;
  const minV = negative.length ? Math.min(...negative) : 0;
  const range = maxV - minV || maxV || 1;

  // viewBox 设定:VBW=1200 匹配 1280 主容器,SVG width=100% 等比缩放
  const VBW = 1200;
  const VBH = 220;
  const PAD_TOP = 36;
  const PAD_BOTTOM = 28;
  const PAD_X = 24;
  const CHART_H = VBH - PAD_TOP - PAD_BOTTOM;
  const N = metric.points.length;
  const SLOT_W = (VBW - PAD_X * 2) / N;
  const BAR_W = Math.min(SLOT_W * 0.5, 120);

  // 0 线 y 坐标(若有负数,按比例)
  const zeroY =
    minV < 0
      ? PAD_TOP + CHART_H * (maxV / range)
      : PAD_TOP + CHART_H;

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
          const x = xCenter - BAR_W / 2;
          const h = (Math.abs(p.value) / range) * CHART_H;
          const y = p.value >= 0 ? zeroY - h : zeroY;
          const isUp = p.value >= 0;
          return (
            <g key={p.period}>
              {/* 柱体 */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={Math.max(h, 1)}
                fill={isUp ? "var(--color-accent)" : "var(--color-down)"}
                className={i === N - 1 ? "opacity-100" : "opacity-85"}
              />
              {/* 顶部 value 标签 */}
              <text
                x={xCenter}
                y={isUp ? y - 8 : y + h + 18}
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

      {metric.points.some((p) => p.yoy !== undefined) && (
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
  if (abs >= 10_000) return `${(v / 10_000).toFixed(2)} 万`;
  if (abs >= 100) return formatNum(v, 0);
  return formatNum(v, 2);
}
