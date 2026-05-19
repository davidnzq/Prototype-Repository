// Stage C placeholder · 资产/组合(mock-only,不依赖 longport)
import Link from "next/link";
import { MOCK_USER } from "@/mock/portfolio";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";

export default function PortfolioPage() {
  const pendingPlans = MOCK_TRADE_PLANS.filter(
    (p) => p.status === "PENDING" || p.status === "DRAFT",
  );
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="caps mb-2 text-fg-3">Stage C placeholder</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-fg-1">
        资产 · Portfolio
      </h1>
      <p className="mt-2 text-[12px] text-fg-2">
        Stage C 接入实时行情 + 集中度分析 + 相关性矩阵。当前展示 mock 持仓。
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="总资产" value={`$${MOCK_USER.totalAssets.toLocaleString()}`} />
        <Kpi label="现金" value={`$${MOCK_USER.cash.toLocaleString()}`} />
        <Kpi label="持仓数" value={`${MOCK_USER.holdings.length}`} />
        <Kpi label="待确认 Plan" value={`${pendingPlans.length}`} />
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold text-fg-1">持仓</h2>
        <ul className="divide-y divide-hairline-strong rounded-md border border-hairline-strong bg-bg-1">
          {MOCK_USER.holdings.map((h) => (
            <li
              key={h.symbol}
              className="flex items-center gap-3 px-4 py-3 text-[13px] hover:bg-bg-2"
            >
              <Link
                href={`/portfolio/${encodeURIComponent(h.symbol)}`}
                className="num w-20 font-semibold text-accent hover:underline"
              >
                {h.symbol.split(".")[0]}
              </Link>
              <span className="flex-1 text-fg-2">{h.nameZh}</span>
              <span className="num w-20 text-right text-fg-2">
                {h.shares} 股
              </span>
              <span className="num w-24 text-right text-fg-2">
                @ ${h.avgCost}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold text-fg-1">
          Plan({pendingPlans.length} 待确认)
        </h2>
        <ul className="space-y-2">
          {MOCK_TRADE_PLANS.slice(0, 3).map((p) => (
            <li
              key={p.id}
              className="rounded-md border border-hairline-strong bg-bg-1 p-3 text-[12px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fg-1">{p.symbol}</span>
                <span className="rounded-xs bg-bg-3 px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.05em] text-fg-2">
                  {p.status}
                </span>
                <Link
                  href={`/plan/${p.id}`}
                  className="ml-auto text-[11px] text-accent hover:underline"
                >
                  查看 →
                </Link>
              </div>
              <div className="mt-1 text-fg-2">
                {p.targetPlan.action} · 目标仓位 {(p.targetPlan.targetWeight * 100).toFixed(1)}%
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="text-[10.5px] text-fg-3">{label}</div>
      <div className="num mt-1 text-[16px] font-bold text-fg-1">{value}</div>
    </div>
  );
}
