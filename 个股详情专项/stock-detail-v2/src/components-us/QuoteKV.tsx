import { Settings2 } from "lucide-react";
import { cn, formatNum } from "@/lib/utils";
import type { QuoteKVGroup, KeyStatRange, KeyStatKV } from "@/mock/stockDetail-us";

interface QuoteKVProps {
  groups: QuoteKVGroup;
}

/**
 * US 客户端 Key statistics —
 *   Day's range / 52W range 双 slider + 23 KV(8 行 × 3 列)
 *   col1 / col2 左对齐, col3 右对齐(对齐 Figma 1:205)
 *   每个 KV value 已由 mock 层用 formatNum / formatPct / formatCompact 格式化
 *
 * 兼容 LB import:仍叫 QuoteKV(groups 参数单对象,不再数组)。
 */
export function QuoteKV({ groups: d }: QuoteKVProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Key statistics">
        <button
          type="button"
          aria-label="Customize fields"
          className="inline-flex h-5 w-5 items-center justify-center text-fg-3 hover:text-fg-1"
        >
          <Settings2 size={14} />
        </button>
      </SectionHeader>

      <div className="space-y-3 px-4 pb-4 pt-3">
        {/* Day's range slider */}
        <RangeRow label="Day's range" range={d.dayRange} />
        {/* 52W range slider */}
        <RangeRow label="52W range" range={d.weekRange52} />

        {/* KV grid — 3 列 × N 行, col3 右对齐 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-3 pt-2">
          {d.kvs.map((kv, i) => (
            <KVItem key={i} kv={kv} colIndex={i % 3} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Day's range / 52W range slider (low ──◆── high)
 * ───────────────────────────────────────────────────────────── */
function RangeRow({ label, range }: { label: string; range: KeyStatRange }) {
  const span = range.high - range.low || 1;
  const pct = (range.current - range.low) / span;
  const pos = Math.max(0, Math.min(1, pct)) * 100;

  return (
    <div>
      <div className="mb-1.5 text-xs text-fg-3">{label}</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="num text-sm font-semibold text-fg-1">
          {formatNum(range.low, 2)}
        </span>
        <div className="relative h-5 w-44">
          {/* 已走过部分(low → current)用 accent, 剩余部分用 line */}
          <div className="absolute inset-y-2 left-0 right-0 h-0.5 rounded-full bg-line" />
          <div
            className="absolute inset-y-2 left-0 h-0.5 rounded-full bg-accent"
            style={{ width: `${pos}%` }}
          />
          {/* 三角形 marker(SVG, accent 描边) */}
          <svg
            aria-hidden
            width="10"
            height="8"
            viewBox="0 0 10 8"
            className="absolute -translate-x-1/2"
            style={{ left: `${pos}%`, top: "calc(50% + 4px)" }}
          >
            <path d="M5 0 L10 8 L0 8 Z" fill="var(--color-accent)" />
          </svg>
        </div>
        <span className="num text-right text-sm font-semibold text-fg-1">
          {formatNum(range.high, 2)}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 单个 KV 单元 — col3 (colIndex === 2) 右对齐
 * ───────────────────────────────────────────────────────────── */
function KVItem({ kv, colIndex }: { kv: KeyStatKV; colIndex: number }) {
  const isRight = colIndex === 2;
  return (
    <div className={cn("flex flex-col", isRight && "items-end")}>
      <div className="text-xs text-fg-3">{kv.label}</div>
      <div
        className={cn(
          "num text-sm font-semibold",
          kv.tone === "up" ? "text-up"
          : kv.tone === "down" ? "text-down"
          : "text-fg-1",
        )}
      >
        {kv.value}
      </div>
    </div>
  );
}

export function SectionHeader({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline px-4 py-2">
      <h2 className="caps font-semibold text-fg-1">{label}</h2>
      {hint && <span className="caps num">{hint}</span>}
      {children}
    </div>
  );
}
