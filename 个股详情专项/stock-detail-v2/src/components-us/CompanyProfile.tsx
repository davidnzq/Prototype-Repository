import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CompanyProfile as Profile } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface CompanyProfileProps {
  profile: Profile;
}

/**
 * US 客户端 About 卡 — 对应 PDF "About" section。
 *   Header  : "About" + → 跳转箭头
 *   Row 1   : Market cap label + big number
 *   Row 2   : Description(line-clamp,可点击展开)
 *   Row 3   : Badge chip 横排(Attention Top3 / Growth Tech -1.0B / Hot Deal Top2)
 */
export function CompanyProfile({ profile: p }: CompanyProfileProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-b border-line">
      <SectionHeader label="About" hint="" />
      <div className="px-4 pb-4">
        {/* Market cap KV */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-sm text-fg-3">Market cap</span>
          <span className="num text-xl font-bold text-accent">{p.marketCap}</span>
        </div>

        {/* Description */}
        <p
          className={cn(
            "cursor-pointer text-sm leading-relaxed text-fg-2 transition-colors hover:text-fg-1",
            !expanded && "line-clamp-2",
          )}
          onClick={() => setExpanded((v) => !v)}
        >
          {p.description}
        </p>

        {/* Badges */}
        {p.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.badges.map((b, i) => (
              <Badge key={i} badge={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Badge({ badge: b }: { badge: Profile["badges"][number] }) {
  const tone = b.tone ?? "default";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        tone === "accent" && "border-accent/30 bg-accent/10 text-accent",
        tone === "up" && "border-up/30 bg-up/10 text-up",
        tone === "down" && "border-down/30 bg-down/10 text-down",
        tone === "default" && "border-hairline bg-card text-fg-2",
      )}
    >
      <span>{b.label}</span>
      {b.delta && <span className="num font-semibold">{b.delta}</span>}
    </span>
  );
}
