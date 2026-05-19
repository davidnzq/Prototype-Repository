"use client";

import Link from "next/link";
import { getSignalById } from "@/mock/signals";
import { getStrategy } from "@/mock/strategies";
import { TriangleAlert } from "lucide-react";

export function SignalCardInline({ signalId }: { signalId: string }) {
  const sig = getSignalById(signalId);
  if (!sig) return <MissingRef label={`Signal ${signalId}`} />;
  const strat = getStrategy(sig.strategyId);

  const convColor =
    sig.conviction === "HIGH"
      ? "bg-up-soft text-up-dark"
      : sig.conviction === "MEDIUM"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";

  const upsideColor = sig.upsidePct >= 0 ? "text-up-dark" : "text-down-dark";

  return (
    <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4 shadow-card">
      <div className="caps mb-1 border-l-2 border-accent pl-2 text-accent">
        SIGNAL · {sig.symbol} × {strat?.nameZh ?? sig.strategyName}
      </div>
      <div className="mb-3 font-serif text-[17px] leading-[23px] font-bold tracking-[-0.01em]">
        {sig.oneLineConclusion}
      </div>

      {/* Key metrics row */}
      <div className="mb-3 grid grid-cols-3 gap-3 border-y border-hairline-strong py-2.5">
        <Metric label="Conviction">
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${convColor}`}
          >
            {sig.conviction}
          </span>
          <span className="num ml-1.5 text-[11px] text-fg-2">
            {sig.convictionScore}
          </span>
        </Metric>
        <Metric label="Action">
          <span className="text-[12px] font-bold">{sig.action}</span>
          <span className="ml-1.5 text-[10px] text-fg-2">· {sig.outlook}</span>
        </Metric>
        <Metric label="Upside">
          <span className={`num text-[13px] font-bold ${upsideColor}`}>
            {sig.upsidePct >= 0 ? "+" : ""}
            {sig.upsidePct.toFixed(1)}%
          </span>
          <span className="ml-1.5 text-[10px] text-fg-3">
            → ${sig.targetPrice}
          </span>
        </Metric>
      </div>

      {/* Thesis */}
      {sig.thesis.length > 0 && (
        <ul className="mb-3 space-y-1">
          {sig.thesis.slice(0, 3).map((t, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12px] leading-[18px] text-fg-1 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-accent"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 border-t border-hairline-strong pt-2.5">
        <Link
          href={`/stock/${encodeURIComponent(sig.symbol)}`}
          className="inline-flex items-center rounded-sm bg-accent px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          看个股
        </Link>
        <span className="text-[10px] text-fg-3">
          {sig.analystTerm} · 窗口 {sig.horizon}
        </span>
        <span className="flex-1" />
        <span className="text-[9px] text-fg-3">AI · 仅供参考</span>
      </div>
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[9px] uppercase tracking-[0.1em] text-fg-3">
        {label}
      </div>
      <div className="flex items-baseline">{children}</div>
    </div>
  );
}

function MissingRef({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-warn">
      <TriangleAlert size={14} />
      <span>引用未找到: {label}</span>
    </div>
  );
}
