import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/mock/stockDetail";

interface AlertCalendarProps {
  events: CalendarEvent[];
}

const TYPE_COLOR: Record<CalendarEvent["type"], string> = {
  Earnings: "text-warn",
  Dividend: "text-accent",
  Conference: "text-chart-blue",
  Filing: "text-fg-2",
  Other: "text-fg-3",
};

/**
 * 全局事件条 · 公告与日程
 */
export function AlertCalendar({ events }: AlertCalendarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline bg-card-2 px-3 py-1.5 text-sm">
      <span className="caps shrink-0 text-chart-blue">▤ EV</span>
      <div className="flex flex-1 items-center gap-5 overflow-hidden">
        {events
          .filter((e) => !e.isPast)
          .slice(0, 4)
          .map((e, i) => (
            <span key={i} className="inline-flex items-baseline gap-2 whitespace-nowrap">
              <span className="num font-semibold text-fg-1">{e.date}</span>
              {e.time && <span className="num text-fg-3">{e.time}</span>}
              <span className={cn("font-medium", TYPE_COLOR[e.type])}>
                [{e.type}]
              </span>
              <span className="text-fg-2">{e.title}</span>
            </span>
          ))}
      </div>
      <button className="caps shrink-0 text-accent hover:underline">CAL →</button>
    </div>
  );
}
