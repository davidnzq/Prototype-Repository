import { cn } from "@/lib/utils";
import type { QuoteKVGroup } from "@/mock/stockDetail-lb";

interface QuoteKVProps {
  groups: QuoteKVGroup[];
}

/**
 * 行情数据 KV — Bloomberg 风格的多分组数据矩阵
 * 5 个 group × 6 个 KV = 30 个数据点
 */
export function QuoteKV({ groups }: QuoteKVProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="关键指标 (Key Metrics)" hint="实时 · 滚动 12 月 (Rolling 12M)" />
      <div className="grid grid-cols-5 divide-x divide-hairline">
        {groups.map((g) => (
          <KVGroup key={g.label} group={g} />
        ))}
      </div>
    </section>
  );
}

function KVGroup({ group }: { group: QuoteKVGroup }) {
  return (
    <div className="px-4 py-3">
      <div className="caps mb-3 text-accent">{group.label}</div>
      <dl className="space-y-1">
        {group.items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-2">
            <dt className="caps">{item.label}</dt>
            <dd
              className={cn(
                "num text-base font-semibold",
                item.trend === "up" && "text-up",
                item.trend === "down" && "text-down",
                item.accent && "text-accent",
                !item.trend && !item.accent && "text-fg-1",
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline px-4 pt-3 pb-2">
      <h2 className="caps font-semibold text-fg-1">{label}</h2>
      {hint && <span className="caps num">{hint}</span>}
    </div>
  );
}
