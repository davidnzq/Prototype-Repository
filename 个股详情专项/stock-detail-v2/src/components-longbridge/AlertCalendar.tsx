import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/mock/stockDetail-lb";

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

const TYPE_LABEL: Record<CalendarEvent["type"], string> = {
  Earnings: "业绩",
  Dividend: "分红",
  Conference: "会议",
  Filing: "公告",
  Other: "其他",
};

/**
 * 全局事件条 · 公告与日程
 */
export function AlertCalendar({ events }: AlertCalendarProps) {
  const upcoming = events.filter((e) => !e.isPast);
  const visible = upcoming.slice(0, 4);
  const moreCount = Math.max(0, upcoming.length - visible.length);

  return (
    <div className="flex items-center gap-3 border-b border-hairline bg-card-2 px-3 py-2 text-sm">
      <span className="caps shrink-0 text-chart-blue">📅 事件</span>
      <div className="flex flex-1 items-center gap-5 overflow-hidden">
        {visible.map((e, i) => (
          <span key={i} className="inline-flex items-baseline gap-2 whitespace-nowrap">
            <span className="num font-semibold text-fg-1">{e.date}</span>
            {e.time && (
              <span className="num text-fg-3">
                {e.time}
                {e.tz ? ` ${e.tz}` : ""}
              </span>
            )}
            <span className={cn("font-semibold", TYPE_COLOR[e.type])}>
              · {TYPE_LABEL[e.type]}
            </span>
            <span className="text-fg-2">{e.title}</span>
          </span>
        ))}
        {moreCount > 0 && (
          <span className="num shrink-0 text-fg-3">+{moreCount} 更多</span>
        )}
      </div>
      <button
        type="button"
        aria-label="打开全部日程"
        className="caps shrink-0 text-accent transition-colors hover:underline"
      >
        更多 →
      </button>
    </div>
  );
}
