// 扩展共享 primitives:列表行 · 热图 · 迷你图表
"use client";
import Link from "next/link";
import type { Catalyst, Signal } from "@/types/domain";
import type { Sector } from "@/mock/sectors";
import { shortStrat, methodOf, timeAgo } from "./helpers";
export { shortStrat, methodOf, timeAgo };

// ─── Sector Heatmap ────────────────────────────────────────────────────
export function SectorHeatmap({ sectors }: { sectors: Sector[] }) {
  // 按市值加权排列, 颜色按涨跌幅深浅
  const total = sectors.reduce((s, x) => s + x.marketCap, 0);
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
    >
      {sectors.map((s) => {
        const span = Math.max(2, Math.round((s.marketCap / total) * 24));
        const cls = heatCls(s.pct);
        return (
          <div
            key={s.key}
            title={`${s.nameZh} · ${s.pct >= 0 ? "+" : ""}${s.pct.toFixed(1)}%`}
            className={`flex flex-col justify-between rounded px-2 py-1.5 text-[10px] ${cls}`}
            style={{ gridColumn: `span ${span}`, minHeight: 48 }}
          >
            <div className="truncate font-semibold">{s.nameZh}</div>
            <div className="num font-bold">
              {s.pct >= 0 ? "+" : ""}
              {s.pct.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function heatCls(pct: number): string {
  if (pct >= 1.5) return "bg-up-soft text-up-dark";
  if (pct >= 0.5) return "bg-up-soft/50 text-up-dark";
  if (pct >= 0) return "bg-bg-2 text-fg-1";
  if (pct > -0.5) return "bg-bg-3 text-fg-2";
  if (pct > -1.5) return "bg-down-soft/50 text-down-dark";
  return "bg-down-soft text-down-dark";
}

// ─── Signal Row(列表用 · 适合 /insights, /stock [signal tab] 等) ────
export function SignalRow({ s }: { s: Signal }) {
  const convCls =
    s.conviction === "HIGH"
      ? "bg-up-soft text-up-dark"
      : s.conviction === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";
  return (
    <Link
      href={`/insight/${s.id}`}
      className="grid grid-cols-[64px_100px_1fr_80px_70px] items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-bg-2"
    >
      <div>
        <div className="num text-[13px] font-bold">
          {s.symbol.split(".")[0]}
        </div>
        <div className="text-[9px] text-fg-3">{s.analystTerm}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-2">
          {shortStrat(s.strategyName)}
        </div>
        <div className="text-[9px] text-fg-3">{methodOf(s.strategyName)}</div>
      </div>
      <div className="min-w-0">
        <div className="line-clamp-1 text-[12px] font-semibold text-fg-1">
          {s.oneLineConclusion}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-fg-3">
          <span>窗口 {s.horizon}</span>
          <span>·</span>
          <span>Fit {s.strategyFitScore}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`rounded-xs px-1 py-0.5 text-[9px] font-bold ${convCls}`}>
          {s.conviction}
        </span>
        <div className="mt-0.5 text-[9px] text-fg-3">{s.action}</div>
      </div>
      <div
        className={`num text-right text-[13px] font-bold ${
          s.upsidePct >= 0 ? "text-up-dark" : "text-down-dark"
        }`}
      >
        {s.upsidePct >= 0 ? "+" : ""}
        {s.upsidePct.toFixed(1)}%
      </div>
    </Link>
  );
}

// ─── Catalyst Row ──────────────────────────────────────────────────────
export function CatalystRow({ c }: { c: Catalyst }) {
  const dirCls =
    c.factualDirection === "positive"
      ? "border-l-up"
      : c.factualDirection === "negative"
      ? "border-l-down"
      : c.factualDirection === "mixed"
      ? "border-l-warn"
      : "border-l-fg-3";
  const dirSym =
    c.factualDirection === "positive"
      ? "+"
      : c.factualDirection === "negative"
      ? "−"
      : c.factualDirection === "mixed"
      ? "±"
      : "·";
  const sigCls =
    c.significance === "HIGH"
      ? "text-down-dark"
      : c.significance === "MEDIUM"
      ? "text-warn"
      : "text-fg-3";
  return (
    <Link
      href={`/insight/${c.id}`}
      className={`block border-l-4 ${dirCls} bg-bg-1 px-3 py-2 hover:bg-bg-2`}
    >
      <div className="mb-0.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-fg-3">
        <span className="num font-bold">{dirSym}</span>
        <span>{c.type.replace(/_/g, " ")}</span>
        <span>·</span>
        <span className="font-semibold text-fg-2">{c.symbol}</span>
        <span>·</span>
        <span className={`font-semibold ${sigCls}`}>{c.significance}</span>
        <span className="ml-auto text-fg-3">{timeAgo(c.generatedAt)}</span>
      </div>
      <div className="font-serif text-[14px] leading-[18px] font-semibold">
        {c.title}
      </div>
      <div className="mt-0.5 line-clamp-1 text-[11px] leading-[15px] text-fg-2">
        {c.subtitle}
      </div>
    </Link>
  );
}

// ─── Filter Chip (选中 + 可关闭) ──────────────────────────────────────
export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill px-3 py-1 text-[11px] transition-colors ${
        active
          ? "bg-accent text-white"
          : "border border-hairline-strong bg-bg-1 text-fg-1 hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Section Header 带 "查看全部" 链接 ─────────────────────────────
export function SectionHeader({
  kicker,
  heading,
  linkHref,
  linkLabel = "查看全部",
  right,
}: {
  kicker?: string;
  heading?: string;
  linkHref?: string;
  linkLabel?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-hairline-strong pb-2">
      <div>
        {kicker && <div className="kicker text-accent">{kicker}</div>}
        {heading && (
          <h2 className="mt-0.5 font-serif text-[20px] leading-[26px] font-bold tracking-[-0.01em]">
            {heading}
          </h2>
        )}
      </div>
      {right}
      {linkHref && (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

// Helpers exported at top via ./helpers to remain server-safe.
