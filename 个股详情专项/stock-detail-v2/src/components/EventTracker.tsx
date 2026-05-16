import { cn, formatPct } from "@/lib/utils";
import type { TrackedEvent } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

const TYPE_COLOR: Record<TrackedEvent["type"], string> = {
  Earnings:   "bg-warn-soft text-warn border-warn",
  "M&A":      "bg-accent-soft text-accent border-accent",
  Product:    "bg-up-soft text-up border-up",
  Regulatory: "bg-down-soft text-down border-down",
  Analyst:    "bg-soft text-chart-blue border-chart-blue",
  Insider:    "bg-soft text-chart-purple border-chart-purple",
};

const IMPACT_COLOR: Record<TrackedEvent["impact"], string> = {
  high:   "text-down",
  medium: "text-warn",
  low:    "text-fg-3",
};

interface EventTrackerProps {
  events: TrackedEvent[];
}

/**
 * 事件跟踪 — 时间线表格
 */
export function EventTracker({ events }: EventTrackerProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Event Tracker" hint="TIMELINE" />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="caps px-4 py-1.5 text-left">Date</th>
            <th className="caps px-4 py-1.5 text-left">Type</th>
            <th className="caps px-4 py-1.5 text-left">Event</th>
            <th className="caps px-4 py-1.5 text-right">Impact</th>
            <th className="caps px-4 py-1.5 text-right">Δ Price</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i} className="border-b border-hairline last:border-b-0">
              <td className="num px-4 py-1.5 text-fg-1">{e.date}</td>
              <td className="px-4 py-1.5">
                <span className={cn("border px-1.5 py-0.5 text-xs", TYPE_COLOR[e.type])}>
                  {e.type}
                </span>
              </td>
              <td className="px-4 py-1.5 text-fg-1">{e.title}</td>
              <td className={cn("px-4 py-1.5 text-right text-xs font-semibold uppercase", IMPACT_COLOR[e.impact])}>
                {e.impact}
              </td>
              <td
                className={cn(
                  "num px-4 py-1.5 text-right",
                  e.pctChange === undefined
                    ? "text-fg-4"
                    : e.pctChange >= 0
                      ? "text-up"
                      : "text-down",
                )}
              >
                {e.pctChange !== undefined ? formatPct(e.pctChange * 100, 2) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
