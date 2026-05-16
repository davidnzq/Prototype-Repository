import { cn, formatNum } from "@/lib/utils";
import type { DolphinReport } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface DolphinResearchProps {
  reports: DolphinReport[];
}

const CAT_COLOR: Record<DolphinReport["category"], string> = {
  Deep:     "text-accent",
  Quick:    "text-chart-blue",
  Earnings: "text-warn",
  Macro:    "text-chart-purple",
};

const RATING_COLOR: Record<NonNullable<DolphinReport["rating"]>, string> = {
  "Strong Buy": "bg-up text-fg-inverse",
  Buy:          "bg-up-soft text-up border border-up",
  Hold:         "bg-soft text-warn border border-warn",
  Sell:         "bg-down-soft text-down border border-down",
};

/**
 * 海豚投研 — 研究报告卡片列表
 */
export function DolphinResearch({ reports }: DolphinResearchProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Dolphin Research" hint="海豚投研 · 自有研究" />
      <div className="divide-y divide-hairline">
        {reports.map((r, i) => (
          <div key={i} className="px-4 py-3 hover:bg-soft transition-colors">
            <div className="flex items-baseline gap-3">
              <span className="num text-sm text-fg-3">{r.date}</span>
              <span className={cn("caps text-xs font-semibold", CAT_COLOR[r.category])}>
                {r.category}
              </span>
              {r.rating && (
                <span
                  className={cn(
                    "num text-xs font-bold tracking-wider px-1.5 py-0.5",
                    RATING_COLOR[r.rating],
                  )}
                >
                  {r.rating.toUpperCase()}
                </span>
              )}
              {r.targetPrice && (
                <span className="num text-sm text-fg-2">
                  PT <span className="text-accent">${formatNum(r.targetPrice, 0)}</span>
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-lg font-semibold leading-snug text-fg-1">{r.title}</h3>
            <p className="mt-1 text-sm leading-relaxed-snug text-fg-2">{r.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
