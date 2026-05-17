import { useState, useEffect } from "react";
import { StockDetailPage } from "@/pages/StockDetail";
import { ComponentGalleryPage } from "@/pages/ComponentGallery";
import { StockDetailLBPage } from "@/pages/StockDetailLB";
import { StockDetailLBv21Page } from "@/pages/StockDetailLBv21";
import { ComponentGalleryLBPage } from "@/pages/ComponentGalleryLB";
import { StockDetailUSPage } from "@/pages/StockDetailUS";
import { ComponentGalleryUSPage } from "@/pages/ComponentGalleryUS";
import { cn } from "@/lib/utils";

type PageKey =
  | "stock-detail"
  | "components"
  | "stock-detail-lb"
  | "stock-detail-lb-v21"
  | "components-lb"
  | "stock-detail-us"
  | "components-us";

const HASH_TO_PAGE: Record<string, PageKey> = {
  "":               "stock-detail-lb",   // 默认 = V2
  "#lb-stock":      "stock-detail-lb",   // 兼容旧 URL
  "#lb-stock-v21":  "stock-detail-lb-v21",
  "#lb-components": "components-lb",
  "#us-stock":      "stock-detail-us",
  "#us-components": "components-us",
  "#v1-stock":      "stock-detail",
  "#v1-components": "components",
};

const PAGE_TO_HASH: Record<PageKey, string> = {
  "stock-detail-lb":     "",                   // 默认页 → 无 hash
  "stock-detail-lb-v21": "#lb-stock-v21",
  "components-lb":       "#lb-components",
  "stock-detail-us":     "#us-stock",
  "components-us":       "#us-components",
  "stock-detail":        "#v1-stock",
  "components":          "#v1-components",
};

/**
 * App shell — 7 个可访问的视图(默认 = V2):
 *   1. /                → 长桥个股 V2(默认)
 *   2. #lb-stock-v21    → 长桥个股 V2.1(概览去掉资讯/社区预览)
 *   3. #lb-components   → 长桥组件目录
 *   4. #us-stock        → US 客户端个股(Web 响应式,4 Tab,英文)
 *   5. #us-components   → US 组件目录
 *   6. #v1-stock        → Bloomberg V1 个股详情(冻结)
 *   7. #v1-components   → Bloomberg V1 组件目录(冻结)
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
  const crumb =
      page === "stock-detail"        ? "DETAIL V1"
    : page === "components"          ? "COMPONENTS V1"
    : page === "stock-detail-lb"     ? "DETAIL V2"
    : page === "stock-detail-lb-v21" ? "DETAIL V2.1"
    : page === "components-lb"       ? "COMPONENTS V2"
    : page === "stock-detail-us"     ? "DETAIL V3"
    :                                  "COMPONENTS V3";

  return (
    <header className="sticky top-0 z-30 flex h-8 items-center justify-between border-b border-line bg-bg-2 px-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="ticker">LB DETAIL</span>
        <span className="text-fg-4">/</span>
        <span className="num text-fg-2">AAPL US Equity</span>
        <span className="text-fg-4">/</span>
        <span className="text-fg-3">{crumb}</span>
      </div>

      {/* Page Switcher — 7 tab(V2 · V2.1 · V2 Components · V3 · V3 Components · V1 · V1 Components)*/}
      <div className="flex items-center gap-0 border border-hairline-strong">
        <PageButton
          active={page === "stock-detail-lb"}
          onClick={() => onSwitch("stock-detail-lb")}
          label="Stock Detail V2"
          icon="📊"
        />
        <PageButton
          active={page === "stock-detail-lb-v21"}
          onClick={() => onSwitch("stock-detail-lb-v21")}
          label="Stock Detail V2.1"
          icon="📈"
        />
        <PageButton
          active={page === "components-lb"}
          onClick={() => onSwitch("components-lb")}
          label="Components V2"
          icon="🧩"
        />
        <PageButton
          active={page === "stock-detail-us"}
          onClick={() => onSwitch("stock-detail-us")}
          label="Stock Detail V3"
          icon="📱"
        />
        <PageButton
          active={page === "components-us"}
          onClick={() => onSwitch("components-us")}
          label="Components V3"
          icon="🇺🇸"
        />
        {/* V1 冻结,放最后 */}
        <PageButton
          active={page === "stock-detail"}
          onClick={() => onSwitch("stock-detail")}
          label="Stock Detail V1"
          icon="▤"
        />
        <PageButton
          active={page === "components"}
          onClick={() => onSwitch("components")}
          label="Components V1"
          icon="▦"
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
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-baseline gap-1.5 px-3 py-1 text-sm font-semibold transition-colors",
        active
          ? "bg-accent text-fg-inverse"
          : "text-fg-3 hover:bg-soft hover:text-fg-1",
      )}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
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
