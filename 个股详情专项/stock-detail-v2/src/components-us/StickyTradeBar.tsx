import { cn } from "@/lib/utils";

/**
 * US 客户端 — 底部 sticky CTA(对应 PDF 行情页底部)。
 *   左侧:8x grid icon(打开多功能面板)
 *   右侧:Options / Trade 双按钮
 *
 * 用于 Quote tab 末尾;sticky 在容器底部。
 */
export function StickyTradeBar() {
  return (
    <div className="sticky bottom-14 z-20 flex items-stretch gap-2 border-t border-line bg-bg-2 px-3 py-2">
      <button
        type="button"
        aria-label="More"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline",
          "text-fg-2 hover:bg-soft hover:text-fg-1",
        )}
      >
        <GridIcon />
      </button>
      <button
        type="button"
        className="flex-1 rounded-md bg-card-2 px-4 py-2 text-sm font-semibold text-fg-1 hover:bg-soft"
      >
        Options
      </button>
      <button
        type="button"
        className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-fg-inverse hover:opacity-90"
      >
        Trade
      </button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={2 + col * 5}
            y={2 + row * 5}
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}
