import { cn, formatPct } from "@/lib/utils";
import type { DiscussionPost } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface DiscussionFeedProps {
  posts: DiscussionPost[];
  variant?: "preview" | "feed";
}

/**
 * 讨论流(preview 3 条 / feed 全部)
 */
export function DiscussionFeed({ posts, variant = "feed" }: DiscussionFeedProps) {
  const data = variant === "preview" ? posts.slice(0, 3) : posts;
  return (
    <section className="border-b border-line">
      <SectionHeader
        label="Discussion"
        hint={variant === "preview" ? "PREVIEW · TOP 3" : "MSG"}
      />
      <div className="divide-y divide-hairline">
        {data.map((p, i) => (
          <article key={i} className="px-4 py-3 hover:bg-soft transition-colors">
            <div className="flex items-baseline gap-3 text-sm">
              <span className="font-semibold text-accent">{p.user}</span>
              <span className="num text-fg-4">{p.time}</span>
              {p.attached && (
                <span className="ml-auto inline-flex items-baseline gap-1.5 text-sm">
                  <span className="num font-semibold text-fg-1">${p.attached.ticker}</span>
                  <span
                    className={cn(
                      "num",
                      p.attached.pct >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {formatPct(p.attached.pct * 100, 2)}
                  </span>
                </span>
              )}
            </div>
            <p className="mt-1.5 text-base leading-relaxed-snug text-fg-1">{p.content}</p>
            <div className="num mt-2 flex items-center gap-4 text-sm text-fg-3">
              <span>♡ {p.likes}</span>
              <span>💬 {p.comments}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export const DiscussionPreview = (props: DiscussionFeedProps) => (
  <DiscussionFeed {...props} variant="preview" />
);
