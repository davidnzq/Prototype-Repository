"use client";

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
      <SectionHeader label="事件追踪" hint="近期事件 (Recent Events)" />
      <ul className="px-4 py-3">
        {events.map((e, i) => {
          const prev = events[i - 1];
          const isFirstOfDay = !prev || prev.day !== e.day || prev.month !== e.month;
          const isLast = i === events.length - 1;
          return (
            <EventRow
              key={i}
              event={e}
              showDate={isFirstOfDay}
              showLineAbove={!isFirstOfDay}
              showLineBelow={!isLast}
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
}: {
  event: TrackedEvent;
  showDate: boolean;
  showLineAbove: boolean;
  showLineBelow: boolean;
}) {
  return (
    <li className="grid grid-cols-[44px_24px_1fr] items-start gap-3">
      {/* 日期列 — 月份与日数字颜色一致 */}
      <div className="text-right">
        {showDate && (
          <>
            <div className="text-xs text-fg-3">{e.month}</div>
            <div className="num text-xl font-semibold leading-tight text-fg-3">
              {e.day}
            </div>
          </>
        )}
      </div>

      {/* 时间轴列 */}
      <div className="relative">
        {/* 上半段虚线(同日非首条事件)— 用 gradient 模拟,比 border-dashed 在 1px 宽时更可见 */}
        {showLineAbove && (
          <span
            aria-hidden="true"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--color-fg-3) 0 3px, transparent 3px 6px)",
              width: "1px",
            }}
            className="absolute left-1/2 top-0 h-3 -translate-x-1/2"
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
        {/* 下半段虚线 — 圆环下方接续 */}
        {showLineBelow && (
          <span
            aria-hidden="true"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--color-fg-3) 0 3px, transparent 3px 6px)",
              width: "1px",
            }}
            className="absolute left-1/2 top-3 bottom-0 -translate-x-1/2"
          />
        )}
      </div>

      {/* 内容列 */}
      <div className="pb-5">
        <div className="flex items-start gap-2">
          <div className="flex-1 text-sm leading-relaxed text-fg-1">{e.title}</div>
        </div>
        <div className="mt-1 flex items-baseline gap-2 text-xs">
          <span className="num text-fg-3">{e.time}</span>
          {e.priceChange !== undefined && (
            <>
              <span className="text-fg-4">·</span>
              <span className="num text-fg-3">事件后涨跌</span>
              <span
                className={cn(
                  "num font-semibold",
                  e.priceChange >= 0 ? "text-up" : "text-down",
                )}
              >
                {e.priceChange >= 0 ? "+" : ""}
                {(e.priceChange * 100).toFixed(2)}%
              </span>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
