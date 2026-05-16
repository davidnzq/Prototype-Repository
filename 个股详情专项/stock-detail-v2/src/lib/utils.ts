import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNum(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPct(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value).toFixed(decimals);
  return `${sign}${abs}%`;
}

export function formatDelta(value: number, decimals = 3): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value).toFixed(decimals);
  return `${sign}${abs}`;
}

/**
 * Bloomberg 风格的大数字简写:
 *   48,237,412 → 48.24M
 *   4,270,000,000,000 → 4.27T
 *   14,850,000,000 → 14.85B
 */
export function formatCompact(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

/** 千分位整数 */
export function formatInt(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}
