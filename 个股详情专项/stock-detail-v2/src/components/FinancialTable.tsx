import { cn, formatPct } from "@/lib/utils";
import type { FinancialStatement } from "@/mock/stockDetail";
import { SectionHeader } from "./QuoteKV";

interface FinancialTableProps {
  title: string;
  hint?: string;
  data: FinancialStatement;
}

/**
 * 财务报表通用表格 — Bloomberg FA 页风格
 * 4 期数据 + YoY 列
 * 大类合计行加粗,子项缩进
 */
export function FinancialTable({ title, hint, data }: FinancialTableProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader
        label={title}
        hint={`${hint ?? "FA"} · ${data.unit}`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline-strong">
              <th className="caps px-4 py-2 text-left font-medium">Item</th>
              {data.periods.map((p, i) => (
                <th
                  key={p}
                  className={cn(
                    "caps px-4 py-2 text-right font-medium",
                    i === 0 && "text-accent",
                  )}
                >
                  {p}
                </th>
              ))}
              <th className="caps px-4 py-2 text-right font-medium">YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-hairline",
                  row.bold && "bg-card-2",
                )}
              >
                <td
                  className={cn(
                    "px-4 py-1.5",
                    row.bold ? "font-bold text-fg-1" : "text-fg-2",
                    row.indent === 1 && "pl-7 text-fg-3",
                    row.indent === 2 && "pl-10 text-fg-3",
                  )}
                >
                  {row.label}
                </td>
                {row.values.map((v, j) => (
                  <td
                    key={j}
                    className={cn(
                      "num px-4 py-1.5 text-right",
                      row.bold ? "font-semibold text-fg-1" : "text-fg-1",
                      j === 0 && "text-accent",
                      v < 0 && "text-down",
                    )}
                  >
                    {formatFinancialValue(v)}
                  </td>
                ))}
                <td
                  className={cn(
                    "num px-4 py-1.5 text-right",
                    row.yoy === undefined
                      ? "text-fg-4"
                      : row.yoy >= 0
                        ? "text-up"
                        : "text-down",
                  )}
                >
                  {row.yoy !== undefined
                    ? formatPct(row.yoy * 100, 1)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatFinancialValue(v: number): string {
  if (Math.abs(v) >= 1000) {
    return v.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
