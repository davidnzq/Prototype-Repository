import { cn } from "@/lib/utils";
import type { NewsItem } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface NewsCardBigProps {
  items: NewsItem[];
}

const SENT_COLOR: Record<NonNullable<NewsItem["sentiment"]>, string> = {
  bull:    "text-up",
  bear:    "text-down",
  neutral: "text-fg-3",
};

/**
 * 资讯大卡 — 资讯 tab 主组件
 * 带 cover 的大卡片 + 其他普通列表
 */
export function NewsCardBig({ items }: NewsCardBigProps) {
  const featured = items.filter((i) => i.cover && i.summary);
  const rest = items.filter((i) => !i.cover || !i.summary);

  return (
    <section className="border-b border-line">
      <SectionHeader label="News Feed" hint="ALL · SORT BY TIME" />

      {/* Featured big cards */}
      {featured.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline">
          {featured.slice(0, 2).map((n, i) => (
            <article key={i} className="px-4 py-4 hover:bg-soft transition-colors cursor-pointer">
              {/* Cover placeholder */}
              <div className="mb-3 flex h-[120px] items-center justify-center bg-card-2 text-3xl opacity-30">
                ▣
              </div>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="num text-fg-3">{n.time}</span>
                <span className="num text-fg-4">·</span>
                <span className="num text-fg-2">{n.source}</span>
                {n.sentiment && (
                  <span className={cn("ml-auto", SENT_COLOR[n.sentiment])}>
                    {n.sentiment === "bull" ? "▲" : n.sentiment === "bear" ? "▼" : "▬"}
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 text-lg font-semibold leading-snug text-fg-1">
                {n.title}
              </h3>
              {n.summary && (
                <p className="mt-1.5 text-base leading-relaxed-snug text-fg-2">
                  {n.summary}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Compact list */}
      <ul className="divide-y divide-hairline">
        {rest.map((n, i) => (
          <li key={i} className="px-4 py-2 hover:bg-soft transition-colors cursor-pointer">
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
          </li>
        ))}
      </ul>
    </section>
  );
}
