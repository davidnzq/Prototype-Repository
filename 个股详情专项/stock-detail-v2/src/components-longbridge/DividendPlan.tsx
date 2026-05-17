import { cn, formatNum, formatPct } from "@/lib/utils";
import type { DividendYear, DividendRecord } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface DividendPlanProps {
  history: DividendYear[];
  records: DividendRecord[];
}

/**
 * 分配方案 — 长桥版(横向柱状,高密度)
 *
 * 业务洞察:股息投资者关心两条趋势:
 *   - DPS(每股派息绝对值)增长? — 数据:0.85 → 1.03 USD(+21%)
 *   - 股息率(yield %)上升/下降? — 数据:0.58% → 0.46%(−21%)
 *   解读:股价涨得比派息快,投资者更多享受资本利得
 *
 * 图形:横向柱(DPS 强度),trailing 显示 DPS 数值 + yield% + payout%
 *   - 横向柱密度比纵向高 ~50%(无 X 轴空间,行高紧凑)
 *   - 顶部右上:当期股息率大字 + 派发率
 *   - 底部 4 列表:分红方案 / 登记日 / 除净日 / 派息日
 */
export function DividendPlan({ history, records }: DividendPlanProps) {
  const latest = history[history.length - 1];

  return (
    <section className="border-b border-line">
      <SectionHeader label="分红方案" hint="Dividend Plan" />

      <div className="px-4 py-3">
        {/* 顶栏:当期 yield 大字(右上)*/}
        <div className="mb-2 flex items-baseline justify-between">
          <span className="caps text-fg-3">近 5 年 每股股息(USD) · 股息率</span>
          <div className="flex items-baseline gap-2">
            <span className="caps text-fg-3">当期股息率</span>
            <span className="num text-2xl font-bold text-accent">
              {formatPct(latest.yieldPct * 100, 2)}
            </span>
            <span className="num text-xs text-fg-3">· 派发率 {formatPct(latest.payoutRatio * 100, 1)}</span>
          </div>
        </div>

        <HorizontalDpsChart history={history} />
      </div>

      {/* 分红方案 4 列表 */}
      <DividendTable records={records} />
    </section>
  );
}

// ─── Horizontal DPS bars(每行 = 一年,bar = DPS 强度,trailing = DPS + yield + payout)─

function HorizontalDpsChart({ history }: { history: DividendYear[] }) {
  const maxDps = Math.max(...history.map((h) => h.dps));
  const N = history.length;
  // 网格列模板:年份 | 柱区 | DPS | 股息率(去掉派发率列)
  const COLS = "48px 1fr 90px 80px";

  return (
    <ul className="flex flex-col gap-1.5">
      {history.map((h, i) => {
        const widthPct = (h.dps / maxDps) * 100;
        const isCurrent = i === N - 1;
        return (
          <li
            key={h.year}
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: COLS }}
          >
            <span className={cn("num text-sm", isCurrent ? "font-semibold text-fg-1" : "text-fg-2")}>
              {h.year}
            </span>

            {/* 横向柱 — 纯 DPS 柱(不代表百分比)*/}
            <div className="relative h-4 bg-hairline/60">
              <div
                className={cn(
                  "absolute inset-y-0 left-0",
                  isCurrent ? "bg-accent" : "bg-accent/70",
                )}
                style={{ width: `${widthPct}%` }}
              />
            </div>

            <span className={cn("num text-right text-sm", isCurrent ? "font-semibold text-fg-1" : "text-fg-1")}>
              ${formatNum(h.dps, 2)}
            </span>

            <span className="num text-right text-sm text-warn">
              {(h.yieldPct * 100).toFixed(2)}%
            </span>
          </li>
        );
      })}
      {/* 表头脚注 */}
      <li
        className="grid items-center gap-3 border-t border-hairline pt-1.5 text-2xs text-fg-3"
        style={{ gridTemplateColumns: COLS }}
      >
        <span className="caps">年份</span>
        <span className="caps">每股股息</span>
        <span className="caps text-right">DPS (USD)</span>
        <span className="caps text-right">股息率</span>
      </li>
    </ul>
  );
}

// ─── Dividend records table (4 columns) ──────────────────────────────

function DividendTable({ records }: { records: DividendRecord[] }) {
  return (
    <div className="border-t border-hairline px-4 pb-4">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-hairline py-2 text-xs text-fg-3">
        <div className="caps">分红方案</div>
        <div className="caps">登记日</div>
        <div className="caps">除净日</div>
        <div className="caps">派息日</div>
      </div>
      <ul className="divide-y divide-hairline">
        {records.map((r, i) => (
          <li
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 py-2 text-sm"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-fg-1">
                1 股派息 <span className="num font-semibold">${formatNum(r.amount, 2)}</span> USD
              </span>
              {r.type === "Special" && (
                <span className={cn(
                  "rounded-sm px-1.5 py-0.5 text-2xs font-semibold",
                  "bg-warn/15 text-warn",
                )}>
                  特别
                </span>
              )}
            </div>
            <div className="num text-fg-2">{r.recordDate}</div>
            <div className="num text-fg-2">{r.exDate}</div>
            <div className="num font-semibold text-fg-1">{r.payDate}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
