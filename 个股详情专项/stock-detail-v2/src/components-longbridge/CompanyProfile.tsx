import { cn, formatPct } from "@/lib/utils";
import type { CompanyProfile as Profile } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface CompanyProfileProps {
  profile: Profile;
}

/**
 * 公司概况 — 长桥版
 * - 描述文字(精简,不再有 CEO / Employees / Website 等 KV)
 * - 行业胶囊条:行业名 · 行业总市值 · 行业涨跌 + 公司总市值 + 市值排名 + 行业 mini chart
 */
export function CompanyProfile({ profile }: CompanyProfileProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="公司概况" hint="Company Profile" />
      <div className="px-4 py-3">
        {/* 描述 */}
        <p className="text-sm leading-relaxed text-fg-2">
          {profile.description}
        </p>

        {/* 行业胶囊条 */}
        <div className="mt-3 grid grid-cols-[1fr_140px] items-center gap-4 border border-hairline px-4 py-2.5">
          <div className="space-y-1 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-fg-1">{profile.industry}</span>
              <span className="num text-fg-2">{profile.industryMarketCap}</span>
              <span
                className={cn(
                  "num font-semibold",
                  profile.industryChangePct >= 0 ? "text-up" : "text-down",
                )}
              >
                {profile.industryChangePct >= 0 ? "+" : ""}
                {formatPct(profile.industryChangePct * 100, 2)}
              </span>
            </div>
            <div className="text-xs text-fg-3">
              <span className="num">AAPL.US</span> 总市值{" "}
              <span className="num font-semibold text-fg-1">
                {profile.companyMarketCap}
              </span>{" "}
              市值排名{" "}
              <span className="num font-semibold text-fg-1">
                {profile.rank.rank}/{profile.rank.total}
              </span>
            </div>
            {/* 排名 bar */}
            <RankBar rank={profile.rank.rank} total={profile.rank.total} />
          </div>
          <Sparkline values={profile.industrySpark} />
        </div>
      </div>
    </section>
  );
}

function RankBar({ rank, total }: { rank: number; total: number }) {
  // rank 1 = leftmost; total = rightmost
  const pct = ((rank - 1) / (total - 1)) * 100;
  return (
    <div className="relative h-1 w-full max-w-[280px] bg-soft">
      <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: "100%" }} />
      <div
        className="absolute -top-0.5 h-2 w-1.5 -translate-x-1/2 bg-fg-1"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 120;
  const H = 50;
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - minV) / range) * H;
      return `${x},${y}`;
    })
    .join(" ");
  const isUp = values[values.length - 1] >= values[0];
  return (
    <svg aria-hidden="true" width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
