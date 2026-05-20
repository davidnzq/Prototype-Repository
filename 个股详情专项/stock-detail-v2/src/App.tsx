import { useState, useEffect } from "react";
import { StockDetailPage } from "@/pages/StockDetail";
import { ComponentGalleryPage } from "@/pages/ComponentGallery";
import { StockDetailLBPage } from "@/pages/StockDetailLB";
import { StockDetailLBv21Page } from "@/pages/StockDetailLBv21";
import { StockDetailLBp3Page } from "@/pages/StockDetailLBp3";
import { ComponentGalleryLBPage } from "@/pages/ComponentGalleryLB";
import { StockDetailUSPage } from "@/pages/StockDetailUS";
import { ComponentGalleryUSPage } from "@/pages/ComponentGalleryUS";
import { cn } from "@/lib/utils";

type PageKey =
  | "stock-detail"
  | "components"
  | "stock-detail-lb"
  | "stock-detail-lb-v21"
  | "stock-detail-lb-p3"
  | "components-lb"
  | "stock-detail-us"
  | "components-us";

const HASH_TO_PAGE: Record<string, PageKey> = {
  "":               "stock-detail-lb",   // 默认 = P1
  "#lb-stock":      "stock-detail-lb",   // 兼容旧 URL
  "#lb-stock-v21":  "stock-detail-lb-v21",
  "#lb-stock-p3":   "stock-detail-lb-p3",
  "#lb-components": "components-lb",
  "#us-stock":      "stock-detail-us",
  "#us-components": "components-us",
  "#v1-stock":      "stock-detail",
  "#v1-components": "components",
};

const PAGE_TO_HASH: Record<PageKey, string> = {
  "stock-detail-lb":     "",                   // 默认页 → 无 hash
  "stock-detail-lb-v21": "#lb-stock-v21",
  "stock-detail-lb-p3":  "#lb-stock-p3",
  "components-lb":       "#lb-components",
  "stock-detail-us":     "#us-stock",
  "components-us":       "#us-components",
  "stock-detail":        "#v1-stock",
  "components":          "#v1-components",
};

/**
 * App shell —
 *   显示口径(switcher 仅 4 个 button):
 *     Stock Detail P1 = stock-detail-lb     (默认页 = "/")
 *     Stock Detail P2 = stock-detail-lb-v21 ("#lb-stock-v21")
 *     Stock Detail P3 = stock-detail-lb-p3  ("#lb-stock-p3")
 *     Components       = components-lb       ("#lb-components")
 *
 *   隐藏入口(hash 直链仍可访问,后续冻结不动):
 *     #us-stock        → V3 US 个股(隐藏)
 *     #us-components   → V3 US 组件(隐藏)
 *     #v1-stock        → Bloomberg 原版个股(隐藏)
 *     #v1-components   → Bloomberg 原版组件(隐藏)
 */
export default function App() {
  const [page, setPage] = useState<PageKey>(() => {
    if (typeof window === "undefined") return "stock-detail-lb";
    return HASH_TO_PAGE[window.location.hash] ?? "stock-detail-lb";
  });

  useEffect(() => {
    const onHash = () => {
      setPage(HASH_TO_PAGE[window.location.hash] ?? "stock-detail-lb");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const switchTo = (p: PageKey) => {
    window.location.hash = PAGE_TO_HASH[p];
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-bg-1 text-fg-1">
      <CommandBar page={page} onSwitch={switchTo} />

      {page === "stock-detail"        && <StockDetailPage />}
      {page === "components"          && <ComponentGalleryPage />}
      {page === "stock-detail-lb"     && <StockDetailLBPage />}
      {page === "stock-detail-lb-v21" && <StockDetailLBv21Page />}
      {page === "stock-detail-lb-p3"  && <StockDetailLBp3Page />}
      {page === "components-lb"       && <ComponentGalleryLBPage />}
      {page === "stock-detail-us"     && <StockDetailUSPage />}
      {page === "components-us"       && <ComponentGalleryUSPage />}

      <FooterBar />
      <div className="h-14" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function CommandBar({
  page,
  onSwitch,
}: {
  page: PageKey;
  onSwitch: (p: PageKey) => void;
}) {
  // 显示口径(rename):LB → P1 / LB-v21 → P2 / LB Components → Components
  // 其它四个为隐藏入口(hash 路由保留以兼容直链)
  const crumb =
      page === "stock-detail-lb"     ? "DETAIL P1"
    : page === "stock-detail-lb-v21" ? "DETAIL P2"
    : page === "stock-detail-lb-p3"  ? "DETAIL P3"
    : page === "components-lb"       ? "COMPONENTS"
    : page === "stock-detail"        ? "DETAIL · LEGACY BB"
    : page === "components"          ? "COMPONENTS · LEGACY BB"
    : page === "stock-detail-us"     ? "DETAIL · V3 US (hidden)"
    :                                  "COMPONENTS · V3 US (hidden)";

  return (
    <header className="sticky top-0 z-30 flex h-8 items-center justify-between border-b border-line bg-bg-2 px-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="ticker">LB DETAIL</span>
        <span className="text-fg-4">/</span>
        <span className="num text-fg-2">AAPL US Equity</span>
        <span className="text-fg-4">/</span>
        <span className="text-fg-3">{crumb}</span>
      </div>

      {/* Page Switcher — 仅显示 4 个有效入口
       *   Stock Detail P1  → stock-detail-lb
       *   Stock Detail P2  → stock-detail-lb-v21
       *   Stock Detail P3  → stock-detail-lb-p3
       *   Components       → components-lb
       * 其它 4 个入口隐藏(hash 仍可直链访问,后续冻结)。
       */}
      <div className="flex items-center gap-0 border border-hairline-strong">
        <PageButton
          active={page === "stock-detail-lb"}
          onClick={() => onSwitch("stock-detail-lb")}
          label="Stock Detail P1"
        />
        <PageButton
          active={page === "stock-detail-lb-v21"}
          onClick={() => onSwitch("stock-detail-lb-v21")}
          label="Stock Detail P2(确定方向)"
        />
        <PageButton
          active={page === "stock-detail-lb-p3"}
          onClick={() => onSwitch("stock-detail-lb-p3")}
          label="Stock Detail P3"
        />
        <PageButton
          active={page === "components-lb"}
          onClick={() => onSwitch("components-lb")}
          label="Components"
        />
      </div>

      <div className="flex items-center gap-3 text-fg-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
          </span>
          <span className="font-semibold">LIVE</span>
        </span>
        <span className="num text-fg-2">15:42:18 EDT</span>
      </div>
    </header>
  );
}

function PageButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-baseline px-3 py-1 text-sm font-semibold transition-colors",
        active
          ? "bg-accent text-fg-inverse"
          : "text-fg-3 hover:bg-soft hover:text-fg-1",
      )}
    >
      {label}
    </button>
  );
}

function FooterBar() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-20 flex h-8 items-center justify-between border-t border-line bg-bg-2 px-3 text-sm">
      <div className="flex items-center gap-3 text-fg-3">
        <FnKey k="F1" label="HELP" />
        <FnKey k="F2" label="QUOTE" />
        <FnKey k="F3" label="CHART" />
        <FnKey k="F4" label="NEWS" />
        <FnKey k="F5" label="HOLD" />
        <FnKey k="F6" label="ANR" />
        <FnKey k="F7" label="EARN" />
        <FnKey k="F8" label="EV" />
      </div>

      <div className="flex items-center gap-3">
        <span className="num text-fg-3">NASDAQ</span>
        <span className="num font-semibold text-fg-1">16,742.39</span>
        <span className="num text-up">+0.42%</span>
        <span className="text-fg-4">·</span>
        <span className="num text-fg-3">S&P</span>
        <span className="num font-semibold text-fg-1">5,184.21</span>
        <span className="num text-up">+0.28%</span>
        <span className="text-fg-4">·</span>
        <span className="num text-fg-3">VIX</span>
        <span className="num font-semibold text-fg-1">13.42</span>
        <span className="num text-down">−1.18%</span>
      </div>
    </footer>
  );
}

function FnKey({ k, label }: { k: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="rounded-sm border border-line bg-soft px-1.5 py-px text-xs font-bold text-accent">
        {k}
      </span>
      <span className="text-sm text-fg-3">{label}</span>
    </span>
  );
}
