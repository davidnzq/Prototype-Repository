import { useState } from "react";
import { cn, formatNum } from "@/lib/utils";
import type { QuoteKVGroup, KeyStatRange, KeyStatKV } from "@/mock/stockDetail-us";

interface QuoteKVProps {
  groups: QuoteKVGroup;
}

/**
 * US 客户端 Key statistics — Day's range / 52W range slider + 6 KV + Expand。
 * 对应 PDF "Key statistics" section。
 *
 * 兼容 LB import:仍叫 QuoteKV(groups 参数现单对象,不再数组)。
 */
export function QuoteKV({ groups: d }: QuoteKVProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-b border-line">
      <SectionHeader label="Key statistics" hint="" />
      <div className="space-y-4 px-4 pb-4">
        {/* Day's range slider */}
        <RangeRow label="Day's range" range={d.dayRange} />

        {/* 52W range slider */}
        <RangeRow label="52W range" range={d.weekRange52} />

        {/* KV grid 3×N */}
        <div className="grid grid-cols-3 gap-y-3 gap-x-4 pt-2">
          {d.kvs.slice(0, expanded ? d.kvs.length : 6).map((kv, i) => (
            <KVItem key={i} kv={kv} />
          ))}
        </div>

        {/* Expand button */}
        {d.kvs.length > 6 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mx-auto flex items-center gap-1 text-sm text-accent hover:opacity-80"
          >
            <span>{expanded ? "Collapse" : "Expand"}</span>
            <span className={cn("transition-transform", expanded && "rotate-180")}>⌄</span>
          </button>
        )}
      </div>
    </section>
  );
}

function RangeRow({ label, range }: { label: string; range: KeyStatRange }) {
  const pct = (range.current - range.low) / (range.high - range.low);
  const pos = Math.max(0, Math.min(1, pct)) * 100;

  return (
    <div>
      <div className="mb-1.5 text-xs text-fg-3">{label}</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="num text-sm font-semibold text-fg-1">
          {formatNum(range.low, 3)}
        </span>
        <div className="relative h-5 w-40">
          <div className="absolute inset-y-2 left-0 right-0 h-0.5 rounded-full bg-line" />
          <span
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-down"
            style={{ left: `${pos}%` }}
          >
            ▼
          </span>
        </div>
        <span className="num text-right text-sm font-semibold text-fg-1">
          {formatNum(range.high, 3)}
        </span>
      </div>
    </div>
  );
}

function KVItem({ kv }: { kv: KeyStatKV }) {
  return (
    <div>
      <div className="text-xs text-fg-3">{kv.label}</div>
      <div
        className={cn(
          "num text-sm font-semibold",
          kv.tone === "up"   ? "text-up"
          : kv.tone === "down" ? "text-down"
          :                      "text-fg-1",
        )}
      >
        {kv.value}
      </div>
    </div>
  );
}

export function SectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline px-4 py-2">
      <h2 className="caps font-semibold text-fg-1">{label}</h2>
      {hint && <span className="caps num">{hint}</span>}
    </div>
  );
}
