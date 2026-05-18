import { cn } from "@/lib/utils";

export type StockTabKey = "overview" | "financial" | "analysis" | "news" | "discussion";

interface StockTabsProps {
  active: StockTabKey;
  onChange: (k: StockTabKey) => void;
}

const TABS: { key: StockTabKey; label: string; hint: string }[] = [
  { key: "overview",   label: "概览", hint: "Overview" },
  { key: "financial",  label: "财务", hint: "财务" },
  { key: "analysis",   label: "分析", hint: "分析" },
  { key: "news",       label: "资讯", hint: "资讯" },
  { key: "discussion", label: "讨论", hint: "讨论" },
];

export function StockTabs({ active, onChange }: StockTabsProps) {
  return (
    <nav
      role="tablist"
      className="sticky top-8 z-10 flex items-stretch divide-x divide-hairline border-b border-line bg-bg-2"
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
              "relative flex items-baseline gap-2 px-5 py-2.5 text-base font-medium transition-colors",
              isActive
                ? "bg-card text-fg-1"
                : "text-fg-3 hover:bg-soft hover:text-fg-1",
            )}
          >
            <span>{t.label}</span>
            <span
              className={cn(
                "num text-xs",
                isActive ? "text-accent" : "text-fg-4",
              )}
            >
              {t.hint}
            </span>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-none bg-accent"
              />
            )}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-3 border-l-0 px-3 text-sm text-fg-3">
        <span className="num">Ctrl/⌘ 1-5</span>
      </div>
    </nav>
  );
}
