import { cn, formatNum, formatPct, formatCompact } from "@/lib/utils";
import type { SectorPosition as SP } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface SectorPositionProps {
  data: SP;
}

/**
 * 行业定位 — Bloomberg PEER 页风格
 * 顶部:Sector 名 + Rank + 涨跌
 * 下方:peer 列表表格,当前股票高亮
 */
export function SectorPosition({ data }: SectorPositionProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="行业地位 (Sector Position)" hint="PEER" />

      {/* 概览栏 */}
      <div className="flex items-baseline gap-6 border-b border-hairline px-4 py-2.5 text-sm">
        <span className="text-fg-1">{data.sectorName}</span>
        <span className="caps">Rank</span>
        <span className="num text-accent">
          {data.industryRank} / {data.industryTotal}
        </span>
        <span className="caps">1D</span>
        <span className={cn("num", data.sectorPct1d >= 0 ? "text-up" : "text-down")}>
          {formatPct(data.sectorPct1d * 100, 2)}
        </span>
        <span className="caps">YTD</span>
        <span className={cn("num", data.sectorPctYtd >= 0 ? "text-up" : "text-down")}>
          {formatPct(data.sectorPctYtd * 100, 2)}
        </span>
      </div>

      {/* Peer table */}
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <Th>Ticker</Th>
            <Th>Name</Th>
            <Th right>Mkt Cap</Th>
            <Th right>P/E</Th>
            <Th right>1D</Th>
            <Th right>YTD</Th>
          </tr>
        </thead>
        <tbody>
          {data.peers.map((p) => (
            <tr
              key={p.ticker}
              className={cn(
                "border-b border-hairline last:border-b-0",
                p.highlighted && "bg-accent-soft",
              )}
            >
              <Td>
                <span
                  className={cn(
                    "num font-semibold",
                    p.highlighted ? "text-accent" : "text-fg-1",
                  )}
                >
                  {p.ticker}
                </span>
              </Td>
              <Td>
                <span className={p.highlighted ? "font-semibold text-accent" : "text-fg-2"}>{p.name}</span>
              </Td>
              <Td right>
                <span className="num text-fg-1">{formatCompact(p.marketCap, 2)}</span>
              </Td>
              <Td right>
                <span className="num text-fg-1">{formatNum(p.pe, 2)}</span>
              </Td>
              <Td right>
                <span className={cn("num", p.pct1d >= 0 ? "text-up" : "text-down")}>
                  {formatPct(p.pct1d * 100, 2)}
                </span>
              </Td>
              <Td right>
                <span className={cn("num", p.pctYtd >= 0 ? "text-up" : "text-down")}>
                  {formatPct(p.pctYtd * 100, 1)}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={cn(
        "caps px-4 py-1.5 font-medium",
        right ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <td className={cn("px-4 py-1.5", right ? "text-right" : "text-left")}>
      {children}
    </td>
  );
}
