// Stage C placeholder · Plan 详情(mock-only,不依赖 longport quote)
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTradePlanById } from "@/mock/tradePlans";
import { PlanHITLAck } from "./PlanHITLAck";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getTradePlanById(id);
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/plan"
        className="inline-flex items-center gap-1 text-[12px] text-fg-3 hover:text-accent"
      >
        <ChevronLeft size={14} />
        Plan
      </Link>
      <div className="caps mt-3 text-fg-3">Stage C placeholder · Plan 详情</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-fg-1">
        {plan.symbol} · {plan.targetPlan.action}
      </h1>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-warn/40 bg-warn/10 px-3 py-1 text-[11px] font-semibold text-warn">
        {plan.status}
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kv
          label="当前 / 目标仓位"
          value={`${(plan.targetPlan.currentWeight * 100).toFixed(1)}% → ${(plan.targetPlan.targetWeight * 100).toFixed(1)}%`}
        />
        <Kv label="窗口" value={plan.targetPlan.window} />
        <Kv label="入场" value={plan.executionPlan.entryApproach} />
      </section>

      <section className="mt-6 rounded-md border border-hairline-strong bg-bg-1 p-4">
        <div className="caps mb-2 text-warn">证伪条件</div>
        <p className="text-[12px] text-fg-1">{plan.targetPlan.invalidation}</p>
      </section>

      <section className="mt-6 rounded-md border border-hairline-strong bg-bg-1 p-4">
        <div className="caps mb-2 text-accent">关键决策(HITL)</div>
        <p className="mb-3 text-[12px] text-fg-2">
          按下后这条 Plan 进入 SUBMITTED · 模拟下单(demo 不真接 brokerage)。
        </p>
        <PlanHITLAck initialStatus={plan.status} symbol={plan.symbol} />
      </section>

      <section className="mt-6 rounded-md border border-dashed border-hairline-strong bg-bg-1 p-6 text-center text-[12px] text-fg-3">
        Stage C 在这里铺 5-state timeline + Phases + Orders 表 + Checkpoints。
      </section>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="text-[10.5px] text-fg-3">{label}</div>
      <div className="num mt-1 text-[14px] font-semibold text-fg-1">
        {value}
      </div>
    </div>
  );
}
