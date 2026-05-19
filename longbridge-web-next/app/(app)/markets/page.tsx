// Stage C placeholder · 行情(mock-only,不依赖 longport 实时)
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MARKET_INDICES } from "@/mock/localHome";
import { MOCK_THEMES } from "@/mock/themes";

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="caps mb-2 text-fg-3">Stage C placeholder</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-fg-1">
        行情 · Markets
      </h1>
      <p className="mt-2 text-[12px] text-fg-2">
        Stage C 接入实时指数 + 板块热力 + Movers + Themes + Screener。当前展示静态
        mock。
      </p>

      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold text-fg-1">指数</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {MARKET_INDICES.map((idx) => (
            <div
              key={idx.name}
              className="rounded-md border border-hairline-strong bg-bg-1 p-3"
            >
              <div className="text-[11px] text-fg-3">{idx.name}</div>
              <div className="num mt-1 text-[15px] font-bold text-fg-1">
                {idx.val}
              </div>
              <div
                className={`num mt-0.5 text-[11px] font-semibold ${
                  idx.dir === "up" ? "text-up" : "text-down"
                }`}
              >
                {idx.chg}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold text-fg-1">主题 / Themes</h2>
        <ul className="divide-y divide-hairline-strong rounded-md border border-hairline-strong bg-bg-1">
          {MOCK_THEMES.slice(0, 5).map((t) => (
            <li key={t.slug}>
              <Link
                href={`/markets/themes/${t.slug}`}
                className="flex items-center gap-3 px-4 py-3 text-[13px] hover:bg-bg-2"
              >
                <span className="font-semibold text-fg-1 flex-1">{t.name}</span>
                <span className="text-fg-2 text-[11px]">
                  {t.symbols.length} 只成分
                </span>
                <ChevronRight size={14} className="text-fg-3" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
