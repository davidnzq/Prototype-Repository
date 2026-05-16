import { cn, formatNum, formatPct } from "@/lib/utils";
import type { DividendYear, DividendRecord } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface DividendPlanProps {
  history: DividendYear[];
  records: DividendRecord[];
}

/**
 * 分配方案 — 长桥版
 * 长桥真实形态:日程&公告 sidebar 风格的记录列表
 * - 顶部:当期 DPS + 股息率 + 分红频次摘要
 * - 列表:每条 = 日期块 + 类型 + 派息金额
 * 不再有 DPS bar chart + Yield 折线(长桥真实页无此元素)
 */
export function DividendPlan({ history, records }: DividendPlanProps) {
  const latest = history[history.length - 1];

  return (
    <section className="border-b border-line">
      <SectionHeader label="分配方案" hint="Dividend Plan" />

      {/* 摘要条 */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] divide-x divide-hairline border-b border-hairline">
        <SummaryKV label="当期每股派息" value={`$${formatNum(latest.dps, 2)}`} />
        <SummaryKV
          label="股息率"
          value={formatPct(latest.yieldPct * 100, 2)}
          color="text-accent"
        />
        <SummaryKV
          label="派发率"
          value={formatPct(latest.payoutRatio * 100, 1)}
        />
        {/* Plan9 — 股息率历史 mini 折线 */}
        <YieldTrend history={history} />
      </div>

      {/* 分配方案列表 */}
      <ul className="divide-y divide-hairline">
        {records.map((r, i) => (
          <DividendItem key={i} record={r} />
        ))}
      </ul>
    </section>
  );
}

function SummaryKV({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs text-fg-3">{label}</div>
      <div className={cn("num text-xl font-semibold", color ?? "text-fg-1")}>
        {value}
      </div>
    </div>
  );
}

function YieldTrend({ history }: { history: DividendYear[] }) {
  const W = 200;
  const H = 56;
  const PAD = 4;
  const yields = history.map((y) => y.yieldPct);
  const max = Math.max(...yields);
  const min = Math.min(...yields);
  const range = max - min || 1;
  const points = history
    .map((y, i) => {
      const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
      const yPos = PAD + (1 - (y.yieldPct - min) / range) * (H - PAD * 2 - 12);
      return `${x},${yPos}`;
    })
    .join(" ");
  const first = history[0];
  const last = history[history.length - 1];

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-fg-3">股息率历史</div>
        <svg
          aria-hidden="true"
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="mt-1 block h-12 w-full"
        >
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
          <text
            x={PAD}
            y={H - 2}
            fontSize="9"
            fill="var(--color-fg-4)"
            style={{ fontFamily: "var(--font-num)" }}
          >
            {first.year}
          </text>
          <text
            x={W - PAD}
            y={H - 2}
            textAnchor="end"
            fontSize="9"
            fill="var(--color-fg-4)"
            style={{ fontFamily: "var(--font-num)" }}
          >
            {last.year}
          </text>
        </svg>
      </div>
    </div>
  );
}

function DividendItem({ record: r }: { record: DividendRecord }) {
  // 解析 exDate(支持 "MM/DD/YYYY" 或 "DD/MM/YYYY") — fallback 用月日
  const parts = r.exDate.split(/[/\-]/);
  const month = parts[0] ?? "";
  const day = parts[1] ?? "";

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      {/* 日期块 */}
      <div className="flex shrink-0 flex-col items-center">
        <div className="num text-xs text-fg-3">{month}月</div>
        <div className="num text-2xl font-bold leading-none text-fg-1">{day}</div>
      </div>

      {/* 类型 + 详情 */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-fg-1">
          {r.type === "Special" ? "特别股息" : "分配方案"}
        </div>
        <div className="num mt-0.5 text-sm text-fg-2">
          每股派息 <span className="font-semibold text-fg-1">${formatNum(r.amount, 2)}</span>{" "}
          USD
        </div>
        <div className="num mt-0.5 text-xs text-fg-3">
          支付日 {r.payDate}
        </div>
      </div>

      {/* 类型 badge */}
      {r.type === "Special" && (
        <span className="rounded-sm bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
          特别
        </span>
      )}
    </li>
  );
}
