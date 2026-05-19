// Stage C placeholder · 简化版自选清单(mock-only,不依赖 longport)
import { WATCHLIST } from "@/mock/localHome";

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="caps mb-2 text-fg-3">Stage C placeholder</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-fg-1">
        自选 · Watchlist
      </h1>
      <p className="mt-2 text-[12px] text-fg-2">
        Stage C 接入实时行情 + 自选分组 + AI 监控。当前展示静态 mock 数据。
      </p>

      <ul className="mt-6 divide-y divide-hairline-strong rounded-md border border-hairline-strong bg-bg-1">
        {WATCHLIST.map((w) => (
          <li
            key={w.tk}
            className="flex items-center gap-3 px-4 py-3 text-[13px] hover:bg-bg-2"
          >
            <span className="num w-16 font-semibold text-fg-1">{w.tk}</span>
            <span className="flex-1 text-fg-2">{w.nm}</span>
            <span className="num w-20 text-right text-fg-2">${w.pr}</span>
            <span
              className={`num w-20 text-right font-semibold ${
                w.dir === "up" ? "text-up" : "text-down"
              }`}
            >
              {w.chg}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
