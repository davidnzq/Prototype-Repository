import { cn } from "@/lib/utils";
import type { TrackedEvent } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface EventTrackerProps {
  events: TrackedEvent[];
}

/**
 * 事件追踪 — 长桥版垂直时间线
 *   左侧:日期标签(月 + 日,仅在该日第一条事件显示)
 *   中间:虚线连接 + 圆环 dot 标记
 *   右侧:事件标题 + 时间
 *
 * 视觉沿用 Design-System token,无 hardcode。
 */
export function EventTracker({ events }: EventTrackerProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="事件追踪" hint="" />
      <ul className="px-4 py-3">
        {events.map((e, i) => {
          const prev = events[i - 1];
          const next = events[i + 1];
          const isFirstOfDay = !prev || prev.day !== e.day || prev.month !== e.month;
          const isLastOfDay = !next || next.day !== e.day || next.month !== e.month;
          const isLast = i === events.length - 1;
          return (
            <EventRow
              key={i}
              event={e}
              showDate={isFirstOfDay}
              showLineAbove={!isFirstOfDay}
              showLineBelow={!isLast}
              isDayBoundary={isLastOfDay && !isLast}
            />
          );
        })}
      </ul>
    </section>
  );
}

function EventRow({
  event: e,
  showDate,
  showLineAbove,
  showLineBelow,
  isDayBoundary,
}: {
  event: TrackedEvent;
  showDate: boolean;
  showLineAbove: boolean;
  showLineBelow: boolean;
  isDayBoundary: boolean;
}) {
  return (
    <li className="grid grid-cols-[44px_24px_1fr] gap-3">
      {/* 日期列 */}
      <div className="pt-1 text-right">
        {showDate && (
          <>
            <div className="text-xs text-fg-3">{e.month}</div>
            <div className="num text-3xl font-semibold leading-none text-fg-1">
              {e.day}
            </div>
          </>
        )}
      </div>

      {/* 时间轴列 */}
      <div className="relative">
        {/* 上半段虚线(同日非首条事件)*/}
        {showLineAbove && (
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-3 -translate-x-1/2 border-l border-dashed border-hairline-strong"
          />
        )}
        {/* 圆环 */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-bg-1",
            "border-fg-3",
          )}
        />
        {/* 下半段虚线 */}
        {showLineBelow && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 top-3 bottom-0 -translate-x-1/2 border-l border-dashed",
              isDayBoundary ? "border-hairline" : "border-hairline-strong",
            )}
          />
        )}
      </div>

      {/* 内容列 */}
      <div className="pb-5">
        <div className="text-sm leading-relaxed text-fg-1">{e.title}</div>
        <div className="num mt-1 text-xs text-fg-3">{e.time}</div>
      </div>
    </li>
  );
}
