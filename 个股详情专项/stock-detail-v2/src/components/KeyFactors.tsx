import { cn } from "@/lib/utils";
import type { KeyFactorGroup, KeyFactorNode } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface KeyFactorsProps {
  groups: KeyFactorGroup[];
}

/**
 * 关键因子 — TradingView/FactSet 风格
 * 4 个 group(Profitability/Growth/Valuation/Financial Strength)
 * 每个 group 3 个因子节点,带 score bar + benchmark 对比
 */
export function KeyFactors({ groups }: KeyFactorsProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Key Factors" hint="FACTOR · PEER COMPARE" />
      <div className="grid grid-cols-4 divide-x divide-hairline">
        {groups.map((g) => (
          <div key={g.groupLabel} className="px-4 py-3">
            <div className="caps mb-3 text-accent">{g.groupLabel}</div>
            <div className="space-y-3">
              {g.nodes.map((n) => (
                <FactorNode key={n.label} node={n} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FactorNode({ node }: { node: KeyFactorNode }) {
  const score = node.score ?? 50;
  const trendColor =
    node.trend === "up"
      ? "text-up"
      : node.trend === "down"
        ? "text-down"
        : "text-flat";
  const barColor =
    score >= 70 ? "bg-up" : score >= 40 ? "bg-warn" : "bg-down";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="caps">{node.label}</span>
        <span className={cn("num text-base font-semibold", trendColor)}>
          {node.value}
        </span>
      </div>
      {/* Score bar */}
      <div className="relative h-[3px] w-full overflow-hidden bg-soft">
        <div
          className={cn("h-full transition-all", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      {node.benchmark && (
        <div className="mt-1 text-xs text-fg-3">{node.benchmark}</div>
      )}
    </div>
  );
}
