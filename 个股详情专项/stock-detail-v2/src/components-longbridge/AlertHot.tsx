import { cn } from "@/lib/utils";
import type { HotEvent } from "@/mock/stockDetail-lb";

interface AlertHotProps {
  events: HotEvent[];
}

/**
 * 全局事件条 · 热点 — 滚动跑马灯
 */
export function AlertHot({ events }: AlertHotProps) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline bg-card-2 px-3 py-1.5 text-sm">
      <span className="caps shrink-0 text-warn">▣ HOT</span>
      <div className="flex flex-1 items-center gap-6 overflow-hidden">
        {events.slice(0, 4).map((e, i) => {
          const c =
            e.sentiment === "bull"
              ? "text-up"
              : e.sentiment === "bear"
                ? "text-down"
                : "text-fg-2";
          return (
            <span key={i} className="inline-flex items-baseline gap-2 whitespace-nowrap">
              <span className="num text-fg-3">{e.time}</span>
              <span className={cn("truncate", c)}>{e.title}</span>
              <span className="num text-fg-4">{e.source}</span>
            </span>
          );
        })}
      </div>
      <button type="button" aria-label="Show more hot events" className="caps shrink-0 text-accent transition-colors hover:underline">MORE →</button>
    </div>
  );
}
