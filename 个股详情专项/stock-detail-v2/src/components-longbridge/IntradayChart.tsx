import { useState, useMemo } from "react";
import { cn, formatNum, formatCompact, formatPct } from "@/lib/utils";
import type { IntradayMeta } from "@/mock/stockDetail-lb";
import {
  getCandlesForTab,
  getChartMode,
  calcPriceTicks,
  calc52W,
  calcVWAP,
  getDateTicks,
  getBaselinePrice,
  type KlineTab,
} from "@/mock/aaplKline";

interface IntradayChartProps {
  meta: IntradayMeta;
}

const TABS: KlineTab[] = [
  "分时",
  "5日",
  "日K",
  "周K",
  "月K",
  "年K",
  "1分",
  "5分",
  "15分",
];

// SVG 坐标系
const SVG_W = 1080;
const CHART_H = 280;
const CHART_X_START = 48;
const CHART_X_END = SVG_W - 48;
const CHART_W = CHART_X_END - CHART_X_START;
const VOL_H = 48;

/**
 * 实时分时图 / K 线 — 长桥/中国券商风(基于真实 Longbridge OpenAPI 数据)
 *
 * 9 个 Tab(粒度切换):
 *   分时 / 5日   → LINE mode(折线 + VWAP + 前收 baseline)
 *   日K / 周K / 月K / 年K / 1分 / 5分 / 15分 → CANDLE mode(蜡烛)
 *
 * 月K / 年K / 15分 通过重采样获得。
 *
 * Bloomberg 视觉规范:
 * - 无垂直网格(避免遮挡)
 * - 52W H/L 水平虚线
 * - 价格刻度顶/底加粗
 * - Volume 平均成交量横线
 * - 日期 tick 智能化(随 tab 周期变格式)
 */
export function IntradayChart({ meta }: IntradayChartProps) {
  const [activeTab, setActiveTab] = useState<KlineTab>(
    (meta.activeTab as KlineTab) ?? "分时",
  );

  const mode = getChartMode(activeTab);

  // 派生数据
  const view = useMemo(() => {
    const c = getCandlesForTab(activeTab);
    const priceTicks = calcPriceTicks(c, 9);
    const dateTicks = getDateTicks(c, 5, activeTab);
    const priceMax = priceTicks[0];
    const priceMin = priceTicks[priceTicks.length - 1];
    const range = priceMax - priceMin;
    const scaleY = (v: number) => 10 + ((priceMax - v) / range) * (CHART_H - 20);
    const last = c[c.length - 1];
    const prev = c[c.length - 2] ?? last;
    const latest = {
      price: last.close,
      open: last.open,
      high: last.high,
      low: last.low,
      change: last.close - prev.close,
      pctChange: (last.close - prev.close) / prev.close,
      volume: last.volume,
    };
    const avgVol = c.reduce((s, x) => s + x.volume, 0) / c.length;
    const w52 = calc52W(getCandlesForTab("日K"));
    const baseline = getBaselinePrice(c);
    const vwap = mode === "LINE" ? calcVWAP(c) : null;
    return {
      candles: c,
      priceTicks,
      dateTicks,
      scaleY,
      latest,
      range,
      priceMax,
      priceMin,
      avgVol,
      h52: w52.high,
      l52: w52.low,
      baseline,
      vwap,
    };
  }, [activeTab, mode]);

  const {
    candles,
    priceTicks,
    dateTicks,
    scaleY,
    latest,
    range,
    priceMax,
    priceMin,
    avgVol,
    h52,
    l52,
    baseline,
    vwap,
  } = view;

  // 蜡烛 / 折线点 x 坐标
  const xs = useMemo(() => {
    const step = CHART_W / candles.length;
    return candles.map((_, i) => CHART_X_START + i * step + step / 2);
  }, [candles]);

  const bodyW = useMemo(() => {
    const step = CHART_W / candles.length;
    return Math.max(1.5, Math.min(16, step * 0.75));
  }, [candles]);

  const maxVol = useMemo(() => Math.max(...candles.map((c) => c.volume)), [candles]);
  const latestY = scaleY(latest.price);
  const baselineY = scaleY(baseline);
  const isUp = latest.change >= 0;

  const showH52 = h52 <= priceMax && h52 >= priceMin;
  const showL52 = l52 <= priceMax && l52 >= priceMin;

  return (
    <section className="border-b border-hairline px-4 py-4">
      {/* Row 1: tab bar + inline KV */}
      <div className="mb-3 flex items-end justify-between border-b border-hairline pb-3">
        <div role="tablist" className="flex items-center overflow-hidden rounded-sm border border-hairline">
          {TABS.map((tab, i) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 text-sm font-semibold transition-colors",
                  i !== TABS.length - 1 && "border-r border-hairline",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-fg-3 hover:bg-soft hover:text-fg-1",
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 行情字段 5 项(主价/涨跌已在 QuoteHero 渲染,本处只放盘面 KV)*/}
        <div className="flex items-baseline gap-5 text-sm">
          <InlineKV label="今开"     value={formatNum(meta.open, 3)} />
          <InlineKV label="最高"     value={formatNum(meta.high, 3)} up />
          <InlineKV label="最低"     value={formatNum(meta.low, 3)}  down />
          <InlineKV label="昨收"     value={formatNum(meta.prevClose, 3)} />
          <InlineKV label="市盈率TTM" value={formatNum(meta.peTtm, 2)} />
        </div>
      </div>

      {/* Row 2: 主图 — LINE 或 CANDLE */}
      <div className="relative">
        {/* 左侧价格刻度 */}
        <div className="num pointer-events-none absolute left-0 top-0 flex h-[280px] w-12 flex-col justify-between py-1 text-left text-2xs font-medium text-fg-3">
          {priceTicks.map((p, i) => {
            const isExtreme = i === 0 || i === priceTicks.length - 1;
            return (
              <span key={i} className={isExtreme ? "font-semibold text-fg-2" : ""}>
                {p.toFixed(2)}
              </span>
            );
          })}
        </div>

        <svg
          className="block h-[280px] w-full"
          viewBox={`0 0 ${SVG_W} ${CHART_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${activeTab} ${candles.length} 根`}
        >
          {/* 水平栅格 — 9 档 */}
          <g stroke="var(--color-hairline)" strokeWidth="1">
            {priceTicks.map((p, i) => {
              const y = scaleY(p);
              return <line key={i} x1={CHART_X_START} y1={y} x2={CHART_X_END} y2={y} />;
            })}
          </g>

          {/* 前收 / 开盘 baseline(只在 LINE mode 显示) */}
          {mode === "LINE" && (
            <line
              x1={CHART_X_START}
              y1={baselineY}
              x2={CHART_X_END}
              y2={baselineY}
              stroke="var(--color-fg-3)"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              className="opacity-50"
            />
          )}

          {/* 52W High */}
          {showH52 && (
            <g>
              <line
                x1={CHART_X_START}
                y1={scaleY(h52)}
                x2={CHART_X_END}
                y2={scaleY(h52)}
                stroke="var(--color-fg-3)"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                className="opacity-55"
              />
              <text
                x={CHART_X_START + 4}
                y={scaleY(h52) - 3}
                fontSize="8.5"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
              >
                52周高 (52W H) {formatNum(h52, 2)}
              </text>
            </g>
          )}

          {/* 52W Low */}
          {showL52 && (
            <g>
              <line
                x1={CHART_X_START}
                y1={scaleY(l52)}
                x2={CHART_X_END}
                y2={scaleY(l52)}
                stroke="var(--color-fg-3)"
                strokeWidth="0.8"
                strokeDasharray="4 4"
                className="opacity-55"
              />
              <text
                x={CHART_X_START + 4}
                y={scaleY(l52) + 10}
                fontSize="8.5"
                fill="var(--color-fg-3)"
                style={{ fontFamily: "var(--font-num)" }}
              >
                52周低 (52W L) {formatNum(l52, 2)}
              </text>
            </g>
          )}

          {/* ─── LINE mode: 价格折线 + 涨跌色区域填充 + VWAP ─── */}
          {mode === "LINE" && (
            <>
              {/* 价格折线下方填充(基于 baseline 分色) */}
              <defs>
                <linearGradient id="line-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "var(--color-up)" : "var(--color-down)"} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={isUp ? "var(--color-up)" : "var(--color-down)"} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={
                  candles
                    .map((c, i) => `${i === 0 ? "M" : "L"} ${xs[i]},${scaleY(c.close)}`)
                    .join(" ") +
                  ` L ${xs[xs.length - 1]},${CHART_H} L ${xs[0]},${CHART_H} Z`
                }
                fill="url(#line-area)"
              />
              {/* 价格折线 */}
              <polyline
                points={candles.map((c, i) => `${xs[i]},${scaleY(c.close)}`).join(" ")}
                stroke={isUp ? "var(--color-up)" : "var(--color-down)"}
                strokeWidth="1.4"
                fill="none"
              />
              {/* VWAP 均价线 */}
              {vwap && (
                <polyline
                  points={vwap.map((v, i) => `${xs[i]},${scaleY(v)}`).join(" ")}
                  stroke="var(--color-chart-yellow)"
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="3 2"
                  className="opacity-85"
                />
              )}
            </>
          )}

          {/* ─── CANDLE mode: 蜡烛 ─── */}
          {mode === "CANDLE" && (
            <g>
              {candles.map((c, i) => {
                const up = c.close >= c.open;
                const yHigh = scaleY(c.high);
                const yLow = scaleY(c.low);
                const bodyTop = scaleY(Math.max(c.open, c.close));
                const bodyBot = scaleY(Math.min(c.open, c.close));
                const bodyH = Math.max(1, bodyBot - bodyTop);
                const wickW = Math.max(0.7, bodyW * 0.12);
                return (
                  <g key={i}>
                    <line
                      x1={xs[i]}
                      y1={yHigh}
                      x2={xs[i]}
                      y2={yLow}
                      stroke={up ? "var(--color-up)" : "var(--color-down)"}
                      strokeWidth={wickW}
                    />
                    {up ? (
                      <rect
                        x={xs[i] - bodyW / 2}
                        y={bodyTop}
                        width={bodyW}
                        height={bodyH}
                        fill="none"
                        stroke="var(--color-up)"
                        strokeWidth="1"
                      />
                    ) : (
                      <rect
                        x={xs[i] - bodyW / 2}
                        y={bodyTop}
                        width={bodyW}
                        height={bodyH}
                        fill="var(--color-down)"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* 最新价水平虚线 */}
          <line
            x1={CHART_X_START}
            y1={latestY}
            x2={CHART_X_END}
            y2={latestY}
            stroke={isUp ? "var(--color-up)" : "var(--color-down)"}
            strokeWidth="0.8"
            strokeDasharray="2 3"
            className="opacity-60"
          />
        </svg>

        {/* 右侧价格刻度 */}
        <div className="num pointer-events-none absolute right-0 top-0 flex h-[280px] w-12 flex-col justify-between py-1 text-right text-2xs font-medium text-fg-3">
          {priceTicks.map((p, i) => {
            const isExtreme = i === 0 || i === priceTicks.length - 1;
            return (
              <span key={i} className={isExtreme ? "font-semibold text-fg-2" : ""}>
                {p.toFixed(2)}
              </span>
            );
          })}
        </div>

        {/* 最新价浮动 tag */}
        <div
          className={cn(
            "num pointer-events-none absolute right-0 z-10 flex h-4 items-center px-1 text-xs font-bold text-bg-1",
            isUp ? "bg-up" : "bg-down",
          )}
          style={{ top: `${(latestY / CHART_H) * 100}%`, transform: "translateY(-50%)" }}
        >
          {formatNum(latest.price, 2)}
        </div>

        {/* LINE mode 涨跌幅 inline 标(浮在右上) */}
        {mode === "LINE" && (
          <div className="absolute right-14 top-1 z-10 flex items-baseline gap-2 text-xs">
            <span className="caps">较开盘</span>
            <span className={cn("num font-semibold", isUp ? "text-up" : "text-down")}>
              {isUp ? "+" : "−"}
              {formatNum(Math.abs(latest.price - baseline), 2)}{" "}
              {formatPct(((latest.price - baseline) / baseline) * 100, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Row 3: Volume 副图 + avg line */}
      <div className="mt-2 border-t border-hairline pt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="caps">Volume</span>
          <span className="num text-xs text-fg-3">
            {formatCompact(latest.volume, 2)} · avg {formatCompact(avgVol, 2)}
          </span>
        </div>
        <svg
          className="block h-[48px] w-full"
          viewBox={`0 0 ${SVG_W} ${VOL_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="成交量"
        >
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const h = Math.min(VOL_H - 2, (c.volume / maxVol) * (VOL_H - 2));
            return (
              <rect
                key={i}
                x={xs[i] - bodyW / 2}
                y={VOL_H - h}
                width={bodyW}
                height={h}
                fill={up ? "var(--color-up)" : "var(--color-down)"}
                className={up ? "opacity-55" : "opacity-60"}
              />
            );
          })}
          <line
            x1={CHART_X_START}
            y1={VOL_H - (avgVol / maxVol) * (VOL_H - 2)}
            x2={CHART_X_END}
            y2={VOL_H - (avgVol / maxVol) * (VOL_H - 2)}
            stroke="var(--color-fg-3)"
            strokeWidth="0.7"
            strokeDasharray="3 3"
            className="opacity-50"
          />
        </svg>
      </div>

      {/* Row 4: 底部 axis + LINE mode VWAP 图例 */}
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2">
        <div className="num flex flex-1 justify-between px-12 text-2xs font-medium text-fg-3">
          {dateTicks.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {mode === "LINE" && vwap && (
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <i
                className="inline-block h-0.5 w-3"
                style={{ background: "var(--color-chart-yellow)" }}
              />
              <span className="caps">VWAP</span>
              <span className="num text-fg-2">
                {formatNum(vwap[vwap.length - 1], 2)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-3 bg-fg-3" />
              <span className="caps">前收</span>
              <span className="num text-fg-2">{formatNum(baseline, 2)}</span>
            </span>
          </div>
        )}
      </div>

      {/* 数据范围标注 */}
      <div className="num mt-2 text-2xs text-fg-4">
        Source: Longbridge OpenAPI · {activeTab} · {candles.length} bars · Range{" "}
        {formatNum(priceMin, 2)}–{formatNum(priceMax, 2)} ({formatNum(range, 2)})
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function InlineKV({
  label,
  value,
  up,
  down,
  accent,
  arrow,
}: {
  label: string;
  value: string;
  up?: boolean;
  down?: boolean;
  accent?: boolean;
  arrow?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="caps">{label}</span>
      <span
        className={cn(
          "num font-medium",
          accent && "text-accent",
          up && "text-up",
          down && "text-down",
          !accent && !up && !down && "text-fg-1",
        )}
      >
        {arrow && (
          <span className={cn("mr-0.5 text-2xs", up ? "text-up" : down ? "text-down" : "")}>
            {arrow}
          </span>
        )}
        {value}
      </span>
    </span>
  );
}
