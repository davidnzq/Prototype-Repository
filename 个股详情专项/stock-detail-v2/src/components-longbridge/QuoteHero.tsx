import { cn, formatNum, formatPct, formatDelta } from "@/lib/utils";
import type { Quote } from "@/mock/stockDetail-lb";

interface QuoteHeroProps {
  quote: Quote;
}

/**
 * 报价头部 — Bloomberg + 长桥
 * 只负责:ticker bar / 大字价 + 涨跌 / 盘前 / session status
 * KV 矩阵由独立的 QuoteKV 组件负责
 */
export function QuoteHero({ quote }: QuoteHeroProps) {
  const isUp = quote.trend === "up";
  const isDown = quote.trend === "down";
  const trendColor = isUp ? "text-up" : isDown ? "text-down" : "text-flat";
  const trendArrow = isUp ? "▲" : isDown ? "▼" : "▬";

  const signedDelta = isUp ? quote.delta : isDown ? -quote.delta : 0;
  const signedPct = (isUp ? quote.pct : isDown ? -quote.pct : 0) * 100;

  return (
    <section className="border-b border-line">
      {/* Row 1: ticker bar */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-2 text-sm">
        <span className="ticker">{quote.ticker}</span>
        <span className="text-fg-3">{quote.bbgType}</span>
        <span className="text-fg-4">·</span>
        <span className="text-fg-2">{quote.nameEn}</span>
        <span className="text-fg-3">/ {quote.nameZh}</span>

        {/* 长桥版 — 关注 ❤️ */}
        {quote.watchers !== undefined && <WatcherBadge count={quote.watchers} />}

        <span className="ml-auto flex items-center gap-3 text-fg-3">
          <span>{quote.exchange}</span>
          <span className="text-fg-4">·</span>
          <span>{quote.currency}</span>
          <span className="text-fg-4">·</span>
          <span className="num">{quote.updatedAt}</span>
          <SessionBadge session={quote.session} />
        </span>
      </div>

      {/* Row 2: 价格主区 */}
      <div className="grid grid-cols-[auto_1fr_auto] items-end gap-8 px-4 py-4">
        {/* 价格 + 涨跌幅 底部对齐 — items-end 让两块的 bottom edge 一致 */}
        <div className="flex items-end gap-3">
          <span
            className={cn(
              "num text-6xl font-semibold leading-none tracking-tightest",
              trendColor,
            )}
          >
            {formatNum(quote.price, 3)}
          </span>
          <div className={cn("num flex flex-col items-end gap-0.5 text-base font-semibold leading-tight", trendColor)}>
            <span className="inline-flex items-center gap-1">
              <span className="text-2xs">{trendArrow}</span>
              {formatDelta(signedDelta, 3)}
            </span>
            <span>{formatPct(signedPct, 2)}</span>
          </div>
        </div>

        {quote.afterHours && (
          <div className="flex items-baseline gap-2 border-l border-hairline pl-6 text-sm">
            <span className="caps">{quote.afterHours.label}</span>
            <span className="num text-fg-1">
              {formatNum(quote.afterHours.price, 3)}
            </span>
            <span
              className={cn(
                "num",
                quote.afterHours.trend === "up" ? "text-up" : "text-down",
              )}
            >
              {formatDelta(
                quote.afterHours.trend === "up"
                  ? quote.afterHours.delta
                  : -quote.afterHours.delta,
                3,
              )}{" "}
              {formatPct(quote.afterHours.pct * 100, 2)}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 text-sm">
          <span className="caps">VS PREV</span>
          <span className="num text-fg-2">{formatNum(quote.prev, 3)}</span>
        </div>
      </div>

      {/* Row 3: 长桥版 chip 标签条(关注度排名 / 热点 / 概念股) */}
      {quote.chips && quote.chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-2 text-xs">
          {quote.chips.map((chip, i) => (
            <Chip key={i} chip={chip} />
          ))}
        </div>
      )}

      {/* Row 4: 核心 KV(6 个) */}
      <div className="grid grid-cols-6 gap-x-8 border-t border-hairline px-4 py-2">
        <KV label="Open" value={formatNum(quote.open, 2)} />
        <KV label="High" value={formatNum(quote.high, 2)} highlight="up" />
        <KV label="Low" value={formatNum(quote.low, 2)} highlight="down" />
        <KV label="Volume" value="48.24M" />
        <KV label="Mkt Cap" value="4.27T" accent />
        <KV label="P/E" value={formatNum(quote.pe, 2)} />
      </div>
    </section>
  );
}

function WatcherBadge({ count }: { count: number }) {
  const display =
    count >= 10_000
      ? `${(count / 10_000).toFixed(2)} 万`
      : count.toLocaleString();
  return (
    <span className="inline-flex items-center gap-1 text-fg-3">
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-down">
        <path d="M12 21s-7-4.5-9.5-9.5C0.5 6 4 2 8 2c2 0 3.5 1 4 2 0.5-1 2-2 4-2 4 0 7.5 4 5.5 9.5C19 16.5 12 21 12 21z" />
      </svg>
      <span className="num">{display}</span>
    </span>
  );
}

function Chip({ chip }: { chip: NonNullable<Quote["chips"]>[number] }) {
  const pctColor =
    chip.pct === undefined
      ? "text-fg-3"
      : chip.pct >= 0
        ? "text-up"
        : "text-down";
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-soft px-2 py-0.5 text-fg-2">
      <span>{chip.label}</span>
      {chip.pct !== undefined && (
        <span className={cn("num font-semibold", pctColor)}>
          {chip.pct >= 0 ? "+" : ""}
          {formatPct(chip.pct * 100, 2)}
        </span>
      )}
    </span>
  );
}

function KV({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: "up" | "down";
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="caps">{label}</span>
      <span
        className={cn(
          "num text-base font-semibold",
          highlight === "up" && "text-up",
          highlight === "down" && "text-down",
          accent && "text-accent",
          !highlight && !accent && "text-fg-1",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SessionBadge({ session }: { session: Quote["session"] }) {
  const config = {
    PRE: { label: "PRE-MKT", color: "text-warn", dot: "bg-warn" },
    REG: { label: "REG", color: "text-up", dot: "bg-up" },
    POST: { label: "POST", color: "text-warn", dot: "bg-warn" },
    CLOSED: { label: "CLOSED", color: "text-fg-3", dot: "bg-fg-3" },
  }[session];

  return (
    <span className={cn("inline-flex items-center gap-1.5", config.color)}>
      <span className={cn("h-1 w-1 rounded-full", config.dot)} />
      <span className="text-xs font-bold tracking-wider">{config.label}</span>
    </span>
  );
}
