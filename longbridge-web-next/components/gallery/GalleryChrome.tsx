"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X, LayoutGrid } from "lucide-react";
import { LAYOUT_VARIANTS, neighboringVariants, getVariant } from "@/lib/gallery";

export function GalleryChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = pathname.match(/^\/layouts\/([^/]+)/);
  const currentSlug = match?.[1];
  const current = currentSlug ? getVariant(currentSlug) : undefined;
  const { prev, next, index } = currentSlug
    ? neighboringVariants(currentSlug)
    : { prev: undefined, next: undefined, index: -1 };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-hairline-strong bg-bg-1 px-4 text-[12px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-fg-2 hover:bg-bg-2 hover:text-fg-1"
          title="回到主应用"
        >
          <X size={14} />
          <span>退出 gallery</span>
        </Link>
        <span className="text-fg-3">·</span>
        <Link
          href="/layouts"
          className="inline-flex items-center gap-1 font-semibold text-fg-1 hover:text-accent"
        >
          <LayoutGrid size={14} />
          <span>Layout Gallery</span>
        </Link>

        {current && (
          <>
            <span className="text-fg-3">/</span>
            <span className="text-fg-2">
              {index + 1}/{LAYOUT_VARIANTS.length}
            </span>
            <span className="font-semibold">
              {current.nameZh}{" "}
              <span className="text-[10px] text-fg-3">· {current.name}</span>
            </span>
          </>
        )}

        <div className="flex-1" />

        <select
          value={currentSlug ?? ""}
          onChange={(e) => {
            if (e.target.value) window.location.href = `/layouts/${e.target.value}`;
          }}
          className="rounded-sm border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px]"
        >
          <option value="">跳转到…</option>
          {LAYOUT_VARIANTS.map((v) => (
            <option key={v.slug} value={v.slug}>
              {v.nameZh} · {v.name}
            </option>
          ))}
        </select>

        {current && (
          <>
            <Link
              href={prev ? `/layouts/${prev.slug}` : "#"}
              aria-disabled={!prev}
              className={`flex h-7 w-7 items-center justify-center rounded-sm border border-hairline-strong ${
                prev ? "text-fg-1 hover:bg-bg-2" : "pointer-events-none text-fg-3"
              }`}
            >
              <ChevronLeft size={14} />
            </Link>
            <Link
              href={next ? `/layouts/${next.slug}` : "#"}
              aria-disabled={!next}
              className={`flex h-7 w-7 items-center justify-center rounded-sm border border-hairline-strong ${
                next ? "text-fg-1 hover:bg-bg-2" : "pointer-events-none text-fg-3"
              }`}
            >
              <ChevronRight size={14} />
            </Link>
          </>
        )}
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
