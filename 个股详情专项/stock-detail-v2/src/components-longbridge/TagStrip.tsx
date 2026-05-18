import { cn, formatPct } from "@/lib/utils";
import type { StockTag, TagCategory } from "@/mock/stockDetail-lb";

interface TagStripProps {
  tags: StockTag[];
}

/**
 * 标签区 — Bloomberg 风格
 *
 * 设计:
 * - 不用 pill,改成 inline text link list
 * - 按类目分组,每组左侧 caps 标签
 * - 涨跌 % 紧跟着 tag 名,用涨跌色染数字
 * - 横排,| 分隔
 */
export function TagStrip({ tags }: TagStripProps) {
  const grouped = tags.reduce<Record<TagCategory, StockTag[]>>(
    (acc, t) => {
      acc[t.category].push(t);
      return acc;
    },
    { industry: [], concept: [], holding: [] },
  );

  return (
    <section className="border-b border-hairline px-4 py-3">
      <CategoryRow label="主题 (Themes)" tags={grouped.industry} />
      <CategoryRow label="概念 (Concept)" tags={grouped.concept} />
      <CategoryRow label="持仓 (Holders)" tags={grouped.holding} />
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function CategoryRow({ label, tags }: { label: string; tags: StockTag[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex items-baseline gap-3 border-b border-hairline py-2 last:border-b-0">
      <span className="caps min-w-[88px] shrink-0">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1.5 text-base">
        {tags.map((tag, i) => (
          <span key={tag.label} className="inline-flex items-baseline gap-0.5">
            {i > 0 && <span className="mr-1 text-fg-3">|</span>}
            <Tag tag={tag} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Tag({ tag }: { tag: StockTag }) {
  const isUp = tag.pct !== undefined && tag.pct > 0;
  const isDown = tag.pct !== undefined && tag.pct < 0;
  return (
    <button
      type="button"
      aria-pressed={tag.selected}
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-sm px-2 py-1",
        "transition-colors duration-75",
        tag.selected
          ? "bg-accent-soft text-accent"
          : "text-fg-1 hover:bg-soft hover:text-accent",
      )}
    >
      <span className="font-medium">{tag.label}</span>
      {tag.pct !== undefined && (
        <span
          className={cn(
            "num text-sm",
            tag.selected
              ? "text-fg-1"
              : isUp
                ? "text-up"
                : isDown
                  ? "text-down"
                  : "text-fg-3",
          )}
        >
          {formatPct(tag.pct * 100, 2)}
        </span>
      )}
    </button>
  );
}
