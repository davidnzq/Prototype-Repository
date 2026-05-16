import { cn, formatCompact } from "@/lib/utils";
import type { InstitutionalHolding as IH } from "@/mock/stockDetail-us";
import { SectionHeader } from "./QuoteKV";

interface InstitutionalHoldingProps {
  data: IH;
}

/**
 * US 客户端 Shareholder activity — Net buy / Net sell 双向柱状。
 * 对应 PDF "Shareholder activity" section。
 *
 * 横轴:季度(Q4 2022 → Q1 2025);纵轴 0 基线居中,正=Net buy(up 色),负=Net sell(down 色)。
 * 显示首末季度标签;单位标右上角。
 */
export function InstitutionalHolding({ data: d }: InstitutionalHoldingProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Shareholder activity" hint={d.date} />
      <div className="px-4 pb-4">
        {/* Legend + unit */}
        <div className="mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Legend dot="bg-up"   label="Net buy" />
            <Legend dot="bg-down" label="Net sell" />
          </div>
          <span className="text-fg-3">Unit: {d.unit}</span>
        </div>

        <BarChart bars={d.bars} />
      </div>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-fg-2">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span>{label}</span>
    </span>
  );
}

function BarChart({ bars }: { bars: IH["bars"] }) {
  const W = 540;
  const H = 180;
  const PAD_X = 8;
  const PAD_Y = 24;

  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.netShares))) || 1;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const zeroY = PAD_Y + innerH / 2;
  const slot = innerW / bars.length;
  const barW = Math.min(slot * 0.55, 32);

  return (
    <svg aria-hidden="true"
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-44 w-full"
    >
      {/* Zero line */}
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--line)"
        strokeWidth={1}
      />

      {bars.map((b, i) => {
        const isUp = b.netShares >= 0;
        const x = PAD_X + slot * i + (slot - barW) / 2;
        const h = (Math.abs(b.netShares) / maxAbs) * (innerH / 2);
        const y = isUp ? zeroY - h : zeroY;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={2}
            fill={isUp ? "var(--color-up)" : "var(--color-down)"}
          />
        );
      })}

      {/* X-axis labels — first and last only */}
      <text
        x={PAD_X + slot * 0 + slot / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize="11"
        fill="var(--fg-3)"
      >
        {bars[0]?.period}
      </text>
      <text
        x={PAD_X + slot * (bars.length - 1) + slot / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize="11"
        fill="var(--fg-3)"
      >
        {bars[bars.length - 1]?.period}
      </text>

      {/* Top scale label */}
      <text
        x={W - PAD_X}
        y={PAD_Y - 4}
        textAnchor="end"
        fontSize="10"
        fill="var(--fg-4)"
      >
        {formatCompact(maxAbs)}
      </text>
    </svg>
  );
}
