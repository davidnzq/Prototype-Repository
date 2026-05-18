import { cn, formatPct } from "@/lib/utils";
import type { NewsItem } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface NewsPreviewProps {
  items: NewsItem[];
  variant?: "preview" | "feed";
}

/**
 * 资讯预览 — 长桥版
 * 不再有 cover 占位;每条下方附相关股票涨跌幅 chip
 */
export function NewsPreview({ items, variant = "preview" }: NewsPreviewProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="资讯" hint={variant === "feed" ? "全部资讯 (News Feed)" : "近 6 条 (Preview)"} />
      <ul className="divide-y divide-hairline">
        {items.map((n, i) => (
          <NewsRow key={i} item={n} />
        ))}
      </ul>
    </section>
  );
}

export function NewsRow({ item: n }: { item: NewsItem }) {
  return (
    <li className="cursor-pointer px-4 py-3 transition-colors hover:bg-soft">
      <div className="text-sm font-semibold leading-snug text-fg-1">{n.title}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-fg-3">
        <span>{n.source}</span>
        {n.tickers && n.tickers.length > 0 && (
          <>
            <span className="text-fg-4">·</span>
            {n.tickers.map((t, i) => (
              <TickerChip key={i} ticker={t} />
            ))}
          </>
        )}
      </div>
    </li>
  );
}

function TickerChip({
  ticker,
}: {
  ticker: NonNullable<NewsItem["tickers"]>[number];
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-soft px-1.5 py-0.5 text-xs">
      <span className="text-fg-3">{ticker.market}</span>
      <span className="text-fg-2">{ticker.name}</span>
      <span
        className={cn(
          "num font-semibold",
          ticker.pct >= 0 ? "text-up" : "text-down",
        )}
      >
        {ticker.pct >= 0 ? "+" : ""}
        {formatPct(ticker.pct * 100, 2)}
      </span>
    </span>
  );
}
