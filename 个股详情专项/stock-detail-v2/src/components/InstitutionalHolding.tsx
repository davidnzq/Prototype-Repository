import { cn, formatPct, formatCompact } from "@/lib/utils";
import type { InstitutionalHolding as IH } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface InstitutionalHoldingProps {
  data: IH;
}

/**
 * 机构持仓 — Bloomberg HDS 页风格
 * 3 列布局:
 *   Col 1: ownership donut(机构/内部/散户)
 *   Col 2: top holders 列表(inline % bar)
 *   Col 3: 4 季度净流入 waterfall
 */
export function InstitutionalHolding({ data }: InstitutionalHoldingProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Institutional Holding" hint="HDS" />
      <div className="grid grid-cols-[240px_1fr_360px] divide-x divide-hairline">
        {/* Col 1: Ownership */}
        <div className="px-4 py-4">
          <div className="caps mb-3">Ownership</div>
          <OwnershipBars
            inst={data.institutionalPct}
            ins={data.insiderPct}
            ret={data.retailPct}
          />
        </div>

        {/* Col 2: Top Holders */}
        <div className="px-4 py-4">
          <div className="caps mb-3">Top Holders</div>
          <ul className="space-y-1.5">
            {data.topHolders.slice(0, 8).map((h, i) => (
              <li key={h.name} className="flex items-baseline gap-3 text-sm">
                <span className="num w-4 text-fg-3">{i + 1}.</span>
                <span className="flex-1 truncate text-fg-1">{h.name}</span>
                {/* inline % bar */}
                <div className="relative h-3 w-20 overflow-hidden bg-soft">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${(h.pctOut / 0.10) * 100}%` }}
                  />
                </div>
                <span className="num w-12 text-right text-fg-1">
                  {formatPct(h.pctOut * 100, 2)}
                </span>
                <span
                  className={cn(
                    "num w-14 text-right",
                    h.pctChange >= 0 ? "text-up" : "text-down",
                  )}
                >
                  {formatPct(h.pctChange * 100, 2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Net Flow Waterfall */}
        <div className="px-4 py-4">
          <div className="caps mb-4">Net Flow (4Q)</div>
          <NetFlowChart data={data.netFlow4q} />
          <div className="num mt-2 grid grid-cols-4 gap-1 text-xs text-fg-3">
            {data.netFlow4q.map((q) => (
              <div key={q.quarter} className="text-center">
                {q.quarter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OwnershipBars({
  inst,
  ins,
  ret,
}: {
  inst: number;
  ins: number;
  ret: number;
}) {
  return (
    <div className="space-y-2.5">
      <OwnRow label="Institutional" pct={inst} color="bg-accent" />
      <OwnRow label="Insiders" pct={ins} color="bg-warn" />
      <OwnRow label="Retail" pct={ret} color="bg-fg-3" />
    </div>
  );
}

function OwnRow({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-fg-2">{label}</span>
        <span className="num font-semibold text-fg-1">
          {formatPct(pct * 100, 2)}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden bg-soft">
        <div className={cn("h-full", color)} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

function NetFlowChart({ data }: { data: { quarter: string; netFlow: number }[] }) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.netFlow)));
  const MAX_BAR = 32; // bar 最大高度 px
  const LABEL_GAP = 14; // bar 顶 与 label 间距
  return (
    /* h-28 (112px),中线在 56px,bar 最高 32px + label 14px = 46px 不超出 */
    <div className="relative h-28 w-full">
      {/* zero line - 居中 */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-stroke" />
      <div className="flex h-full items-center justify-around">
        {data.map((q) => {
          const isUp = q.netFlow >= 0;
          const h = (Math.abs(q.netFlow) / maxAbs) * MAX_BAR;
          return (
            <div key={q.quarter} className="relative flex w-14 items-center justify-center" style={{ height: "100%" }}>
              {/* Bar - 从 zero line 起向上 / 向下 */}
              <div
                className={cn(
                  "absolute left-1/2 w-7 -translate-x-1/2",
                  isUp ? "bg-up" : "bg-down",
                )}
                style={{
                  height: `${h}px`,
                  top: isUp ? `calc(50% - ${h}px)` : "50%",
                }}
              />
              {/* Number label - 紧贴 bar 顶/底,不越界 */}
              <span
                className={cn(
                  "num absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold",
                  isUp ? "text-up" : "text-down",
                )}
                style={{
                  top: isUp
                    ? `calc(50% - ${h + LABEL_GAP}px)`
                    : `calc(50% + ${h + 2}px)`,
                }}
              >
                {q.netFlow >= 0 ? "+" : "−"}
                {formatCompact(Math.abs(q.netFlow), 1)}B
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
