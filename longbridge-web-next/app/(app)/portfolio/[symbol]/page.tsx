// Stage C placeholder · 单股持仓(mock-only)
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { MOCK_USER } from "@/mock/portfolio";
import { getSecurity } from "@/lib/universe";

export default async function HoldingPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const decoded = decodeURIComponent(symbol);
  const sec = getSecurity(decoded);
  const holding = MOCK_USER.holdings.find((h) => h.symbol === decoded);
  if (!sec || !holding) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1 text-[12px] text-fg-3 transition-colors hover:text-accent"
      >
        <ChevronLeft size={14} />
        Portfolio
      </Link>
      <div className="caps mt-3 text-fg-3">Stage C placeholder</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-fg-1">
        {sec.nameZh} · {decoded.split(".")[0]}
      </h1>
      <p className="mt-2 text-[12px] text-fg-2">
        {sec.market} · {sec.sector} · {holding.shares} 股 @ ${holding.avgCost}
      </p>
      <div className="mt-6 rounded-md border border-hairline-strong bg-bg-1 p-6 text-[12px] text-fg-2">
        Stage C 这里完整实现:均价 / PnL / 今日归因 + 持仓角色 + 相关
        Signal/Catalyst/Review 联动。当前是骨架占位。
      </div>
    </div>
  );
}
