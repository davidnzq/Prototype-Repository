import { cn, formatNum, formatPct, formatDelta } from "@/lib/utils";
import type { Quote } from "@/mock/stockDetail-lb";

interface QuoteHeroProps {
  quote: Quote;
}

// 简中 → 繁体 名称映射(只覆盖港股长桥常见股票名简繁差异)
const TRAD_NAME_MAP: Record<string, string> = {
  苹果: "蘋果",
  英伟达: "輝達",
  谷歌: "Google",
  亚马逊: "亞馬遜",
  腾讯: "騰訊",
};

function toTraditional(name: string): string {
  return TRAD_NAME_MAP[name] ?? name;
}

// 从 quote.updatedAt(形如 "16:00:00 EDT 05/08")派生 "Last Updated HH:MM:SS ET"
function deriveLastUpdated(updatedAt: string): string {
  const timeMatch = updatedAt.match(/\b(\d{1,2}:\d{2}:\d{2})\b/);
  const time = timeMatch ? timeMatch[1] : updatedAt;
  return `Last Updated ${time} ET`;
}

// 长桥版 — session badge 文案
function sessionBadgeText(session: Quote["session"]): string {
  switch (session) {
    case "PRE":
      return "Pre-Market";
    case "REG":
      return "Open";
    case "POST":
    case "CLOSED":
      return "Closed";
    default:
      return "Closed";
  }
}

/**
 * 报价头部 — 长桥版 (Plan13 重排)
 *
 * Row 1 顶栏:  [← back] 名称(繁) TICKER [Closed badge] ······· [3 action icons] [❤️ watchers]
 * Row 2 价格:  big price + delta/pct      | afterHours (同色)     | Last Updated HH:MM:SS ET
 * Row 3 chips: 标签条
 * Row 4 KV:    Open / High / Low / Prev.Close / Volume / P/E TTM
 */
export function QuoteHero({ quote }: QuoteHeroProps) {
  const isUp = quote.trend === "up";
  const isDown = quote.trend === "down";
  const trendColor = isUp ? "text-up" : isDown ? "text-down" : "text-flat";
  const trendArrow = isUp ? "▲" : isDown ? "▼" : "▬";

  const signedDelta = isUp ? quote.delta : isDown ? -quote.delta : 0;
  const signedPct = (isUp ? quote.pct : isDown ? -quote.pct : 0) * 100;

  const displayName = toTraditional(quote.nameZh);
  const lastUpdatedText = deriveLastUpdated(quote.updatedAt);

  return (
    <section className="border-b border-line">
      {/* Row 1: 顶栏 — 返回 + 名称 + ticker + Closed badge ... action icons + 关注度 */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-2 text-sm">
        <BackIcon />
        <span className="text-lg font-semibold text-fg-1">{displayName}</span>
        <span className="ticker text-fg-2">{quote.ticker}.{quote.market}</span>
        <SessionBadge session={quote.session} />

        <span className="ml-auto flex items-center gap-3 text-fg-3">
          <ActionIcons />
          {quote.watchers !== undefined && <WatcherBadge count={quote.watchers} />}
        </span>
      </div>

      {/* Row 2: 价格主区 */}
      <div className="grid grid-cols-[auto_1fr_auto] items-end gap-8 px-4 py-4">
        {/* 价格 + 涨跌幅 底部对齐 */}
        <div className="flex items-end gap-3">
          <span
            className={cn(
              "num text-6xl font-semibold leading-none tracking-tightest",
              trendColor,
            )}
          >
            {formatNum(quote.price, 3)}
          </span>
          <div className={cn("num flex flex-col items-end gap-0.5 text-lg font-semibold leading-tight", trendColor)}>
            <span className="inline-flex items-center gap-1">
              <span className="text-2xs">{trendArrow}</span>
              {formatDelta(signedDelta, 3)}
            </span>
            <span>{formatPct(signedPct, 2)}</span>
          </div>
        </div>

        {quote.afterHours && (
          <AfterHoursBlock afterHours={quote.afterHours} />
        )}

        <div className="text-right text-xs text-fg-3">
          <span className="num">{lastUpdatedText}</span>
        </div>
      </div>

      {/* Row 3: 长桥版 chip 标签条 */}
      {quote.chips && quote.chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-2 text-xs">
          {quote.chips.map((chip, i) => (
            <Chip key={i} chip={chip} />
          ))}
        </div>
      )}

      {/* Row 4: 核心 KV (Plan13 — 6 列:Open / High / Low / Prev.Close / Volume / P/E TTM) */}
      <div className="grid grid-cols-6 gap-x-8 border-t border-hairline px-4 py-2">
        <KV label="Open" value={formatNum(quote.open, 2)} />
        <KV label="High" value={formatNum(quote.high, 2)} highlight="up" />
        <KV label="Low" value={formatNum(quote.low, 2)} highlight="down" />
        <KV label="Prev. Close" value={formatNum(quote.prev, 2)} />
        <KV label="Volume" value={`${(quote.volume / 1e6).toFixed(2)}M`} />
        <KV label="P/E TTM" value={formatNum(quote.pe, 2)} accent />
      </div>
    </section>
  );
}

function AfterHoursBlock({ afterHours }: { afterHours: NonNullable<Quote["afterHours"]> }) {
  // Plan13 — price / delta / pct 三段统一上色
  const trendColor =
    afterHours.trend === "up"
      ? "text-up"
      : afterHours.trend === "down"
        ? "text-down"
        : "text-flat";
  const signedDelta =
    afterHours.trend === "up"
      ? afterHours.delta
      : afterHours.trend === "down"
        ? -afterHours.delta
        : 0;
  const signedPct =
    (afterHours.trend === "up" ? afterHours.pct : afterHours.trend === "down" ? -afterHours.pct : 0) * 100;

  return (
    <div className="flex items-baseline gap-2 border-l border-hairline pl-6 text-sm">
      <span className={cn("caps", trendColor)}>{afterHours.label}</span>
      <span className={cn("num", trendColor)}>{formatNum(afterHours.price, 3)}</span>
      <span className={cn("num", trendColor)}>
        {formatDelta(signedDelta, 3)} {formatPct(signedPct, 2)}
      </span>
    </div>
  );
}

function BackIcon() {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center text-fg-2 hover:text-fg-1"
      aria-label="返回"
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4 L5 9 L11 14" />
      </svg>
    </button>
  );
}

function ActionIcons() {
  return (
    <span className="inline-flex items-center gap-2 text-fg-3">
      {/* Share */}
      <button type="button" aria-label="分享" className="inline-flex hover:text-fg-1">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="3.5" r="1.6" />
          <circle cx="4"  cy="8"   r="1.6" />
          <circle cx="12" cy="12.5" r="1.6" />
          <path d="M5.4 7.2 L10.6 4.3" />
          <path d="M5.4 8.8 L10.6 11.7" />
        </svg>
      </button>
      {/* Notification / Bell */}
      <button type="button" aria-label="通知" className="inline-flex hover:text-fg-1">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11 V7.5 A4 4 0 0 1 12 7.5 V11 L13 12.5 H3 Z" />
          <path d="M6.8 13.5 A1.5 1.5 0 0 0 9.2 13.5" />
        </svg>
      </button>
      {/* More dots */}
      <button type="button" aria-label="更多" className="inline-flex hover:text-fg-1">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3.5" cy="8" r="1.3" />
          <circle cx="8"   cy="8" r="1.3" />
          <circle cx="12.5" cy="8" r="1.3" />
        </svg>
      </button>
    </span>
  );
}

function WatcherBadge({ count }: { count: number }) {
  const display =
    count >= 10_000
      ? `${(count / 10_000).toFixed(2)} 万`
      : count.toLocaleString();
  return (
    <span className="inline-flex items-center gap-1 text-fg-3">
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-down">
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
  const text = sessionBadgeText(session);
  const isClosed = session === "POST" || session === "CLOSED";
  return (
    <span
      className={cn(
        "caps inline-flex items-center rounded-sm px-1.5 py-0.5 text-2xs font-semibold tracking-wider",
        isClosed
          ? "bg-soft text-fg-3"
          : session === "REG"
            ? "bg-up/15 text-up"
            : "bg-warn/15 text-warn",
      )}
    >
      {text}
    </span>
  );
}
