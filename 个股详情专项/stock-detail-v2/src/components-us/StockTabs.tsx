import { cn } from "@/lib/utils";

export type StockTabKey = "quote" | "overview" | "news" | "community";

interface StockTabsProps {
  active: StockTabKey;
  onChange: (k: StockTabKey) => void;
}

const TABS: { key: StockTabKey; label: string }[] = [
  { key: "quote",     label: "Quote" },
  { key: "overview",  label: "Overview" },
  { key: "news",      label: "News" },
  { key: "community", label: "Community" },
];

/**
 * US 客户端版 Tab Bar — 4 Tab 英文,横向均分。
 * 视觉:激活态下方 2px 实心条(用 fg-1),无 hint。
 */
export function StockTabs({ active, onChange }: StockTabsProps) {
  return (
    <nav
      role="tablist"
      className="sticky top-8 z-10 flex items-stretch border-b border-line bg-bg-2"
    >
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative flex flex-1 items-center justify-center px-3 py-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "text-fg-1"
                : "text-fg-3 hover:bg-soft hover:text-fg-1",
            )}
          >
            <span>{t.label}</span>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-px h-0.5 bg-fg-1"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
