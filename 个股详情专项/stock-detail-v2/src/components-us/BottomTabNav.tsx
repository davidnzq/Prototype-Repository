import { cn } from "@/lib/utils";

/**
 * US 客户端 — 底部 4 系统 tab nav(对应 PDF 底部 4 icon)。
 *   Watchlist / Markets / Portfolio / Profile。
 */
const TABS = [
  { key: "watchlist", label: "Watchlist", icon: "◔" },
  { key: "markets",   label: "Markets",   icon: "❤" },
  { key: "portfolio", label: "Portfolio", icon: "▦" },
  { key: "profile",   label: "Profile",   icon: "◉" },
] as const;

export function BottomTabNav({
  active = "markets",
}: {
  active?: typeof TABS[number]["key"];
}) {
  return (
    <nav className="flex items-stretch justify-around border-t border-line bg-bg-2 px-3 py-2">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
              isActive ? "text-accent" : "text-fg-3 hover:text-fg-1",
            )}
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
