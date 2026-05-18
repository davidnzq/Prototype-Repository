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
      <span className="caps shrink-0 text-warn">🔥 热点</span>
      <div className="flex flex-1 items-center gap-5 overflow-hidden">
        {events.slice(0, 4).map((e, i) => {
          const c =
            e.sentiment === "bull"
              ? "text-up"
              : e.sentiment === "bear"
                ? "text-down"
                : "text-fg-2";
          const icon =
            e.sentiment === "bull" ? "↑" : e.sentiment === "bear" ? "↓" : "–";
          return (
            <span key={i} className="inline-flex items-baseline gap-2 whitespace-nowrap">
              <span className="num text-fg-3">{e.time}</span>
              <span className={cn("inline-flex items-baseline gap-1 truncate", c)}>
                <span className="num">{icon}</span>
                <span>{e.title}</span>
              </span>
              <span className="num text-fg-4">{e.source}</span>
            </span>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="查看更多热点"
        className="caps shrink-0 text-accent transition-colors hover:underline"
      >
        更多 →
      </button>
    </div>
  );
}
