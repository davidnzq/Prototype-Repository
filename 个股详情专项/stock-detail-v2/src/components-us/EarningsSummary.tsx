import { cn } from "@/lib/utils";
import type { EarningsHighlight, EarningsCard } from "@/mock/stockDetail-us";

interface EarningsSummaryProps {
  data: EarningsHighlight;
}

/**
 * US 客户端 Earnings cards — 一组 3 张紧凑卡:
 *   - Upcoming earnings report(report variant,日期 + 估算 EPS / Rev)
 *   - Upcoming earnings conference call(call variant,日期单行)
 *   - 季度 Earnings Report 摘要(summary variant,缩略图块 + 一句话)
 */
export function EarningsSummary({ data }: EarningsSummaryProps) {
  return (
    <section className="border-b border-line">
      <div className="space-y-3 p-4">
        {data.cards.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </div>
    </section>
  );
}

function Card({ card }: { card: EarningsCard }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-3">
      {card.variant === "summary" ? (
        <div className="flex items-center gap-3">
          {card.thumbnail && <Thumb letter={card.thumbnail} />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-fg-1">{card.title}</div>
            {card.body && (
              <div className="mt-1 text-xs text-fg-3">{card.body}</div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header: 日历图标 + 标题 + 添加按钮 */}
          <div className="mb-2 flex items-center gap-2">
            <CalendarIcon />
            <span className="flex-1 text-sm font-semibold text-fg-1">
              {card.title}
            </span>
            <button
              type="button"
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-sm",
                "border border-hairline bg-bg-2 text-fg-3 hover:text-fg-1",
              )}
              aria-label="Add to calendar"
            >
              +
            </button>
          </div>
          {/* KV rows */}
          {card.rows && (
            <ul className="space-y-1.5">
              {card.rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-fg-3">{r.label}</span>
                  <span className="num font-semibold text-fg-1">{r.value}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center text-fg-3">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" />
        <line x1="1.5" y1="5.5" x2="12.5" y2="5.5" stroke="currentColor" />
        <line x1="4" y1="1" x2="4" y2="3.5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="10" y1="1" x2="10" y2="3.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

function Thumb({ letter }: { letter: string }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-bg-3 text-xs font-bold text-fg-3">
      {letter}
    </span>
  );
}
