import { cn } from "@/lib/utils";
import type { NewsItem } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface NewsPreviewProps {
  items: NewsItem[];
  /** preview = 紧凑列表;feed = 大卡片(带 cover) */
  variant?: "preview" | "feed";
}

const SENT_COLOR: Record<NonNullable<NewsItem["sentiment"]>, string> = {
  bull:    "text-up",
  bear:    "text-down",
  neutral: "text-fg-3",
};

/**
 * 资讯预览(紧凑列表)
 */
export function NewsPreview({ items, variant = "preview" }: NewsPreviewProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="News" hint={variant === "feed" ? "ALL NEWS" : "RECENT 6"} />
      <div className="divide-y divide-hairline">
        {items.map((n, i) => (
          <div key={i} className="px-4 py-2 hover:bg-soft transition-colors cursor-pointer">
            <div className="flex items-baseline gap-3 text-sm">
              <span className="num text-fg-3 shrink-0">{n.time}</span>
              <span className="num text-fg-4 shrink-0">{n.source}</span>
              {n.sentiment && (
                <span className={cn("text-xs", SENT_COLOR[n.sentiment])}>
                  {n.sentiment === "bull" ? "▲" : n.sentiment === "bear" ? "▼" : "▬"}
                </span>
              )}
              <span className="text-fg-1">{n.title}</span>
            </div>
            {variant === "feed" && n.summary && (
              <p className="mt-1 pl-[60px] text-sm leading-relaxed-snug text-fg-2">
                {n.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
