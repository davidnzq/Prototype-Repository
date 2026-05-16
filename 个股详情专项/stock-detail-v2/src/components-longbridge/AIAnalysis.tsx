import { cn } from "@/lib/utils";
import type { AIAnalysisData } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface AIAnalysisProps {
  data: AIAnalysisData;
}

/**
 * AI 分析 — 长桥 AI 模块色系(brand accent 强化)
 * Layout:
 *   Row 1: 4 个 signal pills(Tech/Fund/Sent/Val)
 *   Row 2: Bull / Bear 双栏 bullet 列表
 *   Row 3: AI 综合摘要
 */
export function AIAnalysis({ data }: AIAnalysisProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader
        label="AI Analysis"
        hint={`GEN ${data.generatedAt}`}
      />

      {/* Signal pills */}
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        {data.signals.map((s) => {
          const c =
            s.trend === "up"
              ? "border-up text-up"
              : s.trend === "down"
                ? "border-down text-down"
                : "border-fg-3 text-fg-2";
          return (
            <span
              key={s.label}
              className={cn(
                "inline-flex items-baseline gap-1.5 border px-2 py-1 text-sm",
                c,
              )}
            >
              <span className="caps">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </span>
          );
        })}
        <span className="caps ml-auto text-accent">▲ POWERED BY DOLPHIN AI</span>
      </div>

      {/* Bull/Bear lists */}
      <div className="grid grid-cols-2 divide-x divide-hairline">
        <BulletList
          icon="▲"
          color="text-up"
          label="Bullish Points"
          items={data.bullishPoints}
        />
        <BulletList
          icon="▼"
          color="text-down"
          label="Bearish Points"
          items={data.bearishPoints}
        />
      </div>

      {/* Summary */}
      <div className="border-t border-hairline bg-brand-soft px-4 py-3">
        <div className="mb-1.5 flex items-center gap-2 text-sm">
          <span className="caps text-accent font-semibold">AI Summary</span>
          <span className="num text-fg-3">{data.generatedAt}</span>
        </div>
        <p className="text-base leading-relaxed text-fg-1">{data.summary}</p>
      </div>
    </section>
  );
}

function BulletList({
  icon,
  color,
  label,
  items,
}: {
  icon: string;
  color: string;
  label: string;
  items: string[];
}) {
  return (
    <div className="px-4 py-3">
      <div className={cn("caps mb-2", color)}>
        <span className="mr-1">{icon}</span>
        {label}
      </div>
      <ul className="space-y-2 text-base leading-relaxed-tight text-fg-1">
        {items.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className={cn("shrink-0 text-xs", color)}>›</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
