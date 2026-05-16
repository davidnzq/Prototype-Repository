/**
 * AAPL.US K 线数据 — Longbridge OpenAPI · 9 Tab(长桥/中国券商风)
 *
 * Tab 列表(粒度切换风,跟长桥 App 一致):
 *   分时 / 5日   → line chart + VWAP(折线模式)
 *   日K / 周K / 月K / 年K / 1分 / 5分 / 15分 → candlestick(蜡烛模式)
 *
 * 月K / 年K / 15分 通过重采样获得(原始数据没有)
 */

import day1y from "./data/aapl-day-1y.json";
import day5y from "./data/aapl-day-5y.json";
import week5y from "./data/aapl-week-5y.json";
import min5d from "./data/aapl-min5-5d.json";
import min1d from "./data/aapl-min1-1d.json";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

const DAY_1Y = day1y as Candle[];
const DAY_5Y = day5y as Candle[];
const WEEK_5Y = week5y as Candle[];
const MIN_5_5D = min5d as Candle[];
const MIN_1_1D = min1d as Candle[];

export type KlineTab =
  | "分时"
  | "5日"
  | "日K"
  | "周K"
  | "月K"
  | "年K"
  | "1分"
  | "5分"
  | "15分";

export type ChartMode = "LINE" | "CANDLE";

/** Tab → 渲染模式 */
export function getChartMode(tab: KlineTab): ChartMode {
  return tab === "分时" || tab === "5日" ? "LINE" : "CANDLE";
}

// ────────────────────────────────────────────────────────────────────────────
// 重采样函数
// ────────────────────────────────────────────────────────────────────────────

/** 把多根 Candle 聚合为一根 */
function aggregate(candles: Candle[]): Candle {
  return {
    time: candles[0].time,
    open: candles[0].open,
    close: candles[candles.length - 1].close,
    high: Math.max(...candles.map((c) => c.high)),
    low: Math.min(...candles.map((c) => c.low)),
    volume: candles.reduce((s, c) => s + c.volume, 0),
    turnover: candles.reduce((s, c) => s + c.turnover, 0),
  };
}

/** 日 K → 月 K(按月分组) */
function resampleMonth(daily: Candle[]): Candle[] {
  const byMonth = new Map<string, Candle[]>();
  for (const c of daily) {
    const d = new Date(c.time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(c);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, candles]) => aggregate(candles));
}

/** 日 K → 年 K(按年分组) */
function resampleYear(daily: Candle[]): Candle[] {
  const byYear = new Map<string, Candle[]>();
  for (const c of daily) {
    const y = String(new Date(c.time).getFullYear());
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(c);
  }
  return Array.from(byYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, candles]) => aggregate(candles));
}

/** 等周期 K 线聚合(例如 5min × 3 = 15min) */
function resampleInterval(candles: Candle[], factor: number): Candle[] {
  const result: Candle[] = [];
  for (let i = 0; i < candles.length; i += factor) {
    const slice = candles.slice(i, i + factor);
    if (slice.length > 0) result.push(aggregate(slice));
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// 按 tab 取数据
// ────────────────────────────────────────────────────────────────────────────

const MONTH_K = resampleMonth(DAY_5Y);
const YEAR_K = resampleYear(DAY_5Y);
const MIN_15 = resampleInterval(MIN_5_5D, 3);

export function getCandlesForTab(tab: KlineTab): Candle[] {
  switch (tab) {
    case "分时": return MIN_1_1D;        // line mode,~390 根分钟数据(画 close 折线)
    case "5日":  return MIN_5_5D;        // line mode,~390 根 5min 数据
    case "日K":  return DAY_1Y;          // 252 根
    case "周K":  return WEEK_5Y;         // 260 根
    case "月K":  return MONTH_K;         // ~48 根
    case "年K":  return YEAR_K;          // ~5 根
    case "1分":  return MIN_1_1D;        // 390 根 1 分钟 K(蜡烛)
    case "5分":  return MIN_5_5D;        // 390 根 5 分钟 K(蜡烛)
    case "15分": return MIN_15;          // ~130 根 15 分钟 K(蜡烛)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// VWAP 累计成交均价(只在 LINE mode 用)
// ────────────────────────────────────────────────────────────────────────────

export function calcVWAP(candles: Candle[]): number[] {
  let cumTurn = 0;
  let cumVol = 0;
  return candles.map((c) => {
    cumTurn += c.turnover;
    cumVol += c.volume;
    return cumVol > 0 ? cumTurn / cumVol : c.close;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 价格刻度 / 52W / 最新报价
// ────────────────────────────────────────────────────────────────────────────

export function calcPriceTicks(candles: Candle[], count = 9): number[] {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const padding = (max - min) * 0.05;
  const top = max + padding;
  const bot = min - padding;
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(top - ((top - bot) / (count - 1)) * i);
  }
  return ticks;
}

export function calc52W(candles: Candle[]): { high: number; low: number } {
  const last252 = candles.slice(-252);
  return {
    high: Math.max(...last252.map((c) => c.high)),
    low: Math.min(...last252.map((c) => c.low)),
  };
}

export function getLatestPrice(candles: Candle[]): {
  price: number;
  change: number;
  pctChange: number;
} {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? last;
  const change = last.close - prev.close;
  const pctChange = change / prev.close;
  return { price: last.close, change, pctChange };
}

// ────────────────────────────────────────────────────────────────────────────
// 日期 / 时间 tick 智能化
// ────────────────────────────────────────────────────────────────────────────

export function getDateTicks(candles: Candle[], count = 5, tab?: KlineTab): string[] {
  if (candles.length === 0) return [];
  const ticks: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / (count - 1)) * (candles.length - 1));
    const date = new Date(candles[idx].time);
    let label = "";
    if (tab === "分时" || tab === "1分") {
      // HH:MM 当日时间
      label = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } else if (tab === "5日" || tab === "5分" || tab === "15分") {
      // MM/DD 日期(跨多天)
      label = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    } else if (tab === "月K") {
      // YYYY/MM
      label = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else if (tab === "年K") {
      label = String(date.getFullYear());
    } else {
      // 日K / 周K
      label = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
    }
    ticks.push(label);
  }
  return ticks;
}

// ────────────────────────────────────────────────────────────────────────────
// LINE mode 用:分时图的"前收盘价"baseline
// 取数据第一根 K 的 open(分时图行业惯例:用前一日收盘 / 当日开盘作为 baseline)
// ────────────────────────────────────────────────────────────────────────────

export function getBaselinePrice(candles: Candle[]): number {
  return candles[0]?.open ?? 0;
}

// ────────────────────────────────────────────────────────────────────────────

export const defaultMeta = {
  symbol: "AAPL.US",
  high52w: calc52W(DAY_1Y).high,
  low52w: calc52W(DAY_1Y).low,
  latest: getLatestPrice(DAY_1Y),
};
