"use client";

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

const CAT_LABEL: Record<DolphinReport["category"], string> = {
  Deep:     "深度",
  Quick:    "快讯",
  Earnings: "业绩",
  Macro:    "宏观",
};

const RATING_COLOR: Record<NonNullable<DolphinReport["rating"]>, string> = {
  "Strong Buy": "bg-up text-fg-inverse",
  Buy:          "bg-up-soft text-up border border-up",
  Hold:         "bg-soft text-warn border border-warn",
  Sell:         "bg-down-soft text-down border border-down",
};

const RATING_LABEL: Record<NonNullable<DolphinReport["rating"]>, string> = {
  "Strong Buy": "强烈买入",
  Buy:          "买入",
  Hold:         "持有",
  Sell:         "卖出",
};

/**
 * 海豚投研 — 研究报告卡片列表
 */
export function DolphinResearch({ reports }: DolphinResearchProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="海豚研究" />
      <div className="divide-y divide-hairline">
        {reports.map((r, i) => (
          <div key={i} className="px-4 py-3 hover:bg-soft transition-colors duration-200">
            <div className="flex items-baseline gap-3">
              <span className="num text-sm text-fg-3">{r.date}</span>
              <span className={cn("caps text-xs font-semibold", CAT_COLOR[r.category])}>
                {CAT_LABEL[r.category]}
              </span>
              {r.rating && (
                <span
                  className={cn(
                    "text-xs font-bold tracking-wider px-1.5 py-0.5",
                    RATING_COLOR[r.rating],
                  )}
                >
                  {RATING_LABEL[r.rating]}
                </span>
              )}
              {/* 目标价 — 即使没值也占位避免布局偏移 */}
              <span
                className={cn(
                  "num text-sm text-fg-2",
                  !r.targetPrice && "invisible",
                )}
              >
                目标价 (PT){" "}
                <span className="text-accent">
                  ${formatNum(r.targetPrice ?? 0, 0)}
                </span>
              </span>
            </div>
            <h3 className="mt-1.5 text-lg font-semibold leading-snug text-fg-1">{r.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed-snug text-fg-2">
              {r.summary}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
