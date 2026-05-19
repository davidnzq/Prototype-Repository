"use client";

import { cn, formatPct } from "@/lib/utils";
import type { DiscussionPost } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface DiscussionFeedProps {
  posts: DiscussionPost[];
  variant?: "preview" | "feed";
}

/**
 * 讨论流 — 长桥版
 * - 用户头像(首字母圆形)+ 用户名 + 时间
 * - 长正文支持多段,保留换行
 * - 嵌入 mini chart(若 embeddedChart 存在)
 */
export function DiscussionFeed({ posts, variant = "feed" }: DiscussionFeedProps) {
  const data = variant === "preview" ? posts.slice(0, 3) : posts;
  return (
    <section className="border-b border-line">
      <SectionHeader
        label="讨论"
        hint={variant === "preview" ? "热门讨论 (Top 3)" : "全部"}
      />
      <ul className="divide-y divide-hairline">
        {data.map((p, i) => (
          <PostItem key={i} post={p} compact={variant === "preview"} />
        ))}
      </ul>
    </section>
  );
}

function PostItem({ post: p, compact }: { post: DiscussionPost; compact: boolean }) {
  return (
    <li className="px-4 py-4 transition-colors hover:bg-soft">
      {/* Header: 头像 + 用户 + 时间 */}
      <div className="flex items-start gap-3">
        <Avatar letter={p.avatar ?? p.user[0]} color={p.avatarColor} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-fg-1">{p.user}</span>
            <span className="num text-xs text-fg-4">{p.time}</span>
            {p.attached && (
              <span className="ml-auto inline-flex items-baseline gap-1.5 text-xs">
                <span className="font-semibold text-fg-2">
                  {p.attached.name ? `${p.attached.name} ` : ""}
                  <span className="num">${p.attached.ticker}</span>
                </span>
                <span
                  className={cn(
                    "num font-semibold",
                    p.attached.pct >= 0 ? "text-up" : "text-down",
                  )}
                >
                  {p.attached.pct >= 0 ? "+" : ""}
                  {formatPct(p.attached.pct * 100, 2)}
                </span>
              </span>
            )}
          </div>

          {/* 正文(支持换行) */}
          <p
            className={cn(
              "mt-1.5 whitespace-pre-line leading-relaxed text-fg-1",
              compact ? "line-clamp-3 text-sm" : "text-sm",
            )}
          >
            {p.content}
          </p>
          {compact && (
            <button
              type="button"
              className="mt-1 text-xs text-accent transition-colors hover:underline"
            >
              ... 展开
            </button>
          )}

          {/* 嵌入 mini chart */}
          {p.embeddedChart && !compact && <EmbeddedChart chart={p.embeddedChart} />}

          {/* 互动数据 */}
          <div className="num mt-2 flex items-center gap-4 text-xs text-fg-3">
            <span>👍 {p.likes}</span>
            <span>💬 {p.comments}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

function Avatar({ letter, color }: { letter: string; color?: string }) {
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-fg-inverse"
      style={{ background: color ?? "var(--color-accent)" }}
    >
      {letter}
    </span>
  );
}

function EmbeddedChart({
  chart,
}: {
  chart: NonNullable<DiscussionPost["embeddedChart"]>;
}) {
  const W = 320;
  const H = 60;
  const PAD = 4;
  const maxV = Math.max(...chart.values);
  const minV = Math.min(...chart.values);
  const range = maxV - minV || 1;
  const points = chart.values
    .map((v, i) => {
      const x = PAD + (i / (chart.values.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - (v - minV) / range) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const isUp = chart.pct >= 0;

  return (
    <div className="mt-3 inline-flex items-center gap-3 rounded-sm border border-hairline bg-card-2/30 px-3 py-2">
      <div>
        <div className="text-xs text-fg-3">${chart.ticker}</div>
        <div
          className={cn(
            "num text-sm font-semibold",
            isUp ? "text-up" : "text-down",
          )}
        >
          {isUp ? "+" : ""}
          {formatPct(chart.pct * 100, 2)}
        </div>
      </div>
      <svg aria-hidden="true" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? "var(--color-up)" : "var(--color-down)"}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export const DiscussionPreview = (props: DiscussionFeedProps) => (
  <DiscussionFeed {...props} variant="preview" />
);
