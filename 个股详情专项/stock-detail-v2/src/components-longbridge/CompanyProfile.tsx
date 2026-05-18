import { cn, formatPct } from "@/lib/utils";
import type { CompanyProfile as Profile } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface CompanyProfileProps {
  profile: Profile;
}

/**
 * 公司概况 — 长桥版(1280 宽适配 — 左右布局)
 *   左列(60%):公司描述 + 3 KV(Industry / Market cap / Industry rank)
 *   右列(40%):行业胶囊条(行业名 + 市值 + 涨跌 + 公司市值 + 排名 + RankBar)+ 加宽 Sparkline
 */
export function CompanyProfile({ profile }: CompanyProfileProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="公司概况" hint="Company Profile" />
      <div className="grid grid-cols-[3fr_2fr] items-start gap-6 px-4 py-3">
        {/* 左列 — 描述 + 基本面 + KV */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-fg-2">
            {profile.description}
          </p>
          {/* 基本面信息 — 普通投资者必看 */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-hairline pt-3 text-xs">
            <FactRow label="CEO" value={profile.ceo} />
            <FactRow label="成立" value={`${profile.founded} 年 · IPO ${profile.ipoDate.slice(0, 4)}`} num />
            <FactRow label="总部" value={profile.hq} />
            <FactRow label="员工" value={`${(profile.employees / 1000).toFixed(0)}k`} num />
            <FactRow label="官网" value={profile.website} link />
            <FactRow label="行业" value={profile.industry} />
          </div>
          {/* 市值 + 排名 */}
          <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-3">
            <KvItem
              label="公司总市值"
              value={profile.companyMarketCap}
              num
              accent
            />
            <KvItem
              label="行业市值排名"
              value={`排名 ${profile.rank.rank} / 共 ${profile.rank.total} 家`}
              num
            />
          </div>
        </div>

        {/* 右列 — 行业胶囊 + Sparkline */}
        <div className="space-y-2 border-t border-hairline pt-3">
          {/* 行业名 + 行业市值 + 涨跌 — 涨跌色统一,数值与百分比都带 trend 色 */}
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-fg-1">{profile.industry}</span>
            <span
              className={cn(
                "num",
                profile.industryChangePct >= 0 ? "text-up" : "text-down",
              )}
            >
              {profile.industryMarketCap}
            </span>
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

          {/* 排名 bar 全宽 */}
          <RankBar rank={profile.rank.rank} total={profile.rank.total} />

          {/* 行业 Sparkline 加宽 */}
          <Sparkline values={profile.industrySpark} />
        </div>
      </div>
    </section>
  );
}

function KvItem({
  label,
  value,
  num,
  accent,
}: {
  label: string;
  value: string;
  num?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-fg-3">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold",
          num && "num",
          accent ? "text-accent" : "text-fg-1",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FactRow({
  label,
  value,
  num,
  link,
}: {
  label: string;
  value: string;
  num?: boolean;
  link?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-fg-3">{label}</span>
      <span
        className={cn(
          "min-w-0 text-right",
          !link && "truncate",
          num && "num",
          link ? "text-accent" : "text-fg-1",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function RankBar({ rank, total }: { rank: number; total: number }) {
  // rank 1 = leftmost; total = rightmost
  const pct = ((rank - 1) / (total - 1)) * 100;
  const ratio = rank / total;
  const barColor =
    ratio <= 0.2 ? "bg-up" : ratio >= 0.8 ? "bg-down" : "bg-accent";
  return (
    <div className="relative h-1 w-full bg-soft">
      <div className={cn("absolute inset-y-0 left-0 w-full", barColor)} />
      <div
        className="absolute -top-0.5 h-2 w-1.5 -translate-x-1/2 bg-fg-1"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  // viewBox 600x80 — SVG width=100% 等比缩放,在右列(2fr)约 480-520px 宽
  const W = 600;
  const H = 80;
  const PAD_Y = 4; // 留点上下边距,让终端 dot 不被裁切
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: PAD_Y + (1 - (v - minV) / range) * (H - PAD_Y * 2),
  }));

  // Catmull-Rom 平滑曲线 → Cubic Bezier(柔和、单调过渡)
  const smoothPath = (() => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  })();

  const isUp = values[values.length - 1] >= values[0];
  const color = isUp ? "var(--color-up)" : "var(--color-down)";
  const last = pts[pts.length - 1];

  return (
    <svg
      aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
    >
      <path
        d={smoothPath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 终端原点(强调当前值) */}
      {last && (
        <circle
          cx={last.x}
          cy={last.y}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}
