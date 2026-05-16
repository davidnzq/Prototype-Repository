import { cn, formatNum, formatPct, formatDelta } from "@/lib/utils";
import type { Quote } from "@/mock/stockDetail-us";

interface QuoteHeroProps {
  quote: Quote;
}

/**
 * US 客户端 QuoteHero — 移动 portrait 横向单列,Web 桌面容器内左对齐。
 * 结构:
 *   Row 1 — Top nav(← / Search / AI sparkle)
 *   Row 2 — Pills(Earnings 03/24/2025 + Live 03/24/2025)
 *   Row 3 — Logo + Ticker + Delayed badge + AI score chip + 全名
 *   Row 4 — 大价 + 涨跌(-$delta + pct)
 *
 * 视觉严格沿用 Design-System token,无 hardcode 颜色 / 字号。
 */
export function QuoteHero({ quote: q }: QuoteHeroProps) {
  const isUp = q.trend === "up";

  return (
    <section className="border-b border-line bg-bg-2 px-4 pb-4 pt-3">
      {/* Row 1 — Top nav */}
      <div className="mb-3 flex items-center justify-between">
        <IconBtn label="Back">‹</IconBtn>
        <div className="flex items-center gap-2">
          <IconBtn label="Watchlist">♡</IconBtn>
          <IconBtn label="Search">⌕</IconBtn>
          <IconBtn label="AI" accent>✦</IconBtn>
        </div>
      </div>

      {/* Row 2 — Pills (Earnings / Live)*/}
      {q.pills && q.pills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {q.pills.map((p, i) => (
            <Pill key={i} pill={p} />
          ))}
        </div>
      )}

      {/* Row 3 — Logo + Ticker + Delayed / AI score / Full name */}
      <div className="mb-2 flex items-center gap-3">
        <Logo letter={q.ticker[0]} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="num text-lg font-bold text-fg-1">{q.ticker}</span>
            {q.delayed && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-card-2 text-xs font-bold text-fg-3">
                D
              </span>
            )}
            {typeof q.aiScore === "number" && (
              <span className="num inline-flex h-4 items-center rounded-sm bg-accent/15 px-1 text-xs font-bold text-accent">
                {q.aiScore}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-fg-3">{q.nameEn}</div>
        </div>
      </div>

      {/* Row 4 — Big price + delta */}
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "num text-4xl font-bold tabular-nums",
            isUp ? "text-up" : "text-down",
          )}
        >
          ${formatNum(q.price, 3)}
        </span>
        <span
          className={cn(
            "num inline-flex items-center gap-1 text-base font-semibold",
            isUp ? "text-up" : "text-down",
          )}
        >
          <span>{isUp ? "▲" : "▼"}</span>
          <span>{formatPct(q.pct * 100, 2)}</span>
          <span className="text-fg-3">·</span>
          <span>(${formatDelta(q.delta, 3)})</span>
        </span>
      </div>
    </section>
  );
}

function IconBtn({
  children,
  label,
  accent,
}: {
  children: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-base transition-colors",
        accent
          ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          : "text-fg-2 hover:bg-soft hover:text-fg-1",
      )}
    >
      {children}
    </button>
  );
}

function Pill({ pill }: { pill: NonNullable<Quote["pills"]>[number] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 py-1 text-xs">
      {pill.kind === "earnings" && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      )}
      {pill.kind === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
        </span>
      )}
      <span className="font-semibold text-fg-1">{pill.label}</span>
      {pill.date && <span className="num text-fg-3">{pill.date}</span>}
    </span>
  );
}

function Logo({ letter }: { letter: string }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card-2 text-sm font-bold text-fg-1">
      {letter}
    </span>
  );
}
