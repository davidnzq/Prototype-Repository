import Link from "next/link";
import { ChevronRight, Target, AlertTriangle } from "lucide-react";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";
import { getSecurity } from "@/lib/universe";
import { getStrategy } from "@/mock/strategies";
import { Kicker } from "@/components/gallery/primitives";
import type { TradePlanStatus } from "@/types/domain";

// IA 4.3 · 我的工作台 · Plan · 行动中心
// 5 状态 tab 对应 framework Part 4 的 Plan 状态机 ——
//   Draft (DRAFT) → PendingHITL (PENDING) → Submitted (ACTIVE)
//   → Executed (COMPLETED) → Archived (CANCELLED)
// Plan 是"意图容器" · execution_mode 一次性 / recurring(定投即 recurring Plan)。

// IA 状态标签 · 映射到 TradePlanStatus 枚举
const TABS: {
  id: "all" | "draft" | "pending" | "submitted" | "executed" | "archived";
  label: string;
  hint: string;
  match: TradePlanStatus[] | "all";
}[] = [
  { id: "all", label: "全部", hint: "跨状态", match: "all" },
  {
    id: "draft",
    label: "Draft · 草稿",
    hint: "Agent 建议或研究中",
    match: ["DRAFT"],
  },
  {
    id: "pending",
    label: "PendingHITL · 待确认",
    hint: "等你 Ack 执行",
    match: ["PENDING"],
  },
  {
    id: "submitted",
    label: "Submitted · 执行中",
    hint: "订单已下达 · 监控中",
    match: ["ACTIVE"],
  },
  {
    id: "executed",
    label: "Executed · 已完成",
    hint: "可进入复盘",
    match: ["COMPLETED"],
  },
  {
    id: "archived",
    label: "Archived · 归档",
    hint: "已取消 / 超时 / 被替代",
    match: ["CANCELLED"],
  },
];

const STATUS_CLS: Record<TradePlanStatus, string> = {
  DRAFT: "bg-bg-3 text-fg-2",
  PENDING: "bg-warn/15 text-warn",
  ACTIVE: "bg-up-soft text-up-dark",
  COMPLETED: "bg-accent-soft text-accent",
  CANCELLED: "bg-bg-3 text-fg-3",
};

const STATUS_LABEL: Record<TradePlanStatus, string> = {
  DRAFT: "Draft",
  PENDING: "PendingHITL",
  ACTIVE: "Submitted",
  COMPLETED: "Executed",
  CANCELLED: "Archived",
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function PlanHubPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const active = TABS.find((t) => t.id === sp.status) ?? TABS[0];

  const filtered =
    active.match === "all"
      ? MOCK_TRADE_PLANS
      : MOCK_TRADE_PLANS.filter((p) => active.match.includes(p.status));

  const counts = Object.fromEntries(
    TABS.map((t) => [
      t.id,
      t.match === "all"
        ? MOCK_TRADE_PLANS.length
        : MOCK_TRADE_PLANS.filter((p) =>
            (t.match as TradePlanStatus[]).includes(p.status)
          ).length,
    ])
  ) as Record<string, number>;

  const pendingCount = counts.pending;

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8">
      <header className="mb-5 border-b border-hairline-strong pb-4">
        <div className="kicker mb-1 text-accent">
          PLAN · 行动中心 · ACTION HUB
        </div>
        <h1 className="font-serif text-[30px] font-bold leading-[36px] tracking-[-0.02em]">
          Plan · 行动中心
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          Plan 是<b>意图容器</b> · 从 Draft 到 Executed 走一条明确状态机。涉及资金的关键节点 · 一定走 HITL。
          {pendingCount > 0 && (
            <>
              <br />
              <span className="mt-1 inline-block rounded-xs bg-warn/15 px-1.5 py-0.5 text-[11px] font-semibold text-warn">
                ⚠ 有 {pendingCount} 个 Plan 等你最终确认(PendingHITL)
              </span>
            </>
          )}
        </p>
      </header>

      {/* Tabs */}
      <nav className="mb-5 flex items-end gap-1 overflow-x-auto border-b border-hairline-strong pb-0">
        {TABS.map((t) => {
          const isActive = t.id === active.id;
          return (
            <Link
              key={t.id}
              href={t.id === "all" ? "/plan" : `/plan?status=${t.id}`}
              className={`group relative flex shrink-0 flex-col items-start gap-0.5 rounded-t-md px-3.5 py-2 transition-colors ${
                isActive
                  ? "bg-bg-1 text-fg-1 ring-1 ring-hairline-strong"
                  : "text-fg-3 hover:text-fg-1"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold">{t.label}</span>
                <span
                  className={`num rounded-xs px-1 py-0.5 text-[9px] font-bold ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "bg-bg-2 text-fg-3"
                  }`}
                >
                  {counts[t.id]}
                </span>
              </div>
              <span className="text-[10px] text-fg-3">{t.hint}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Plans list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline-strong bg-bg-1 px-8 py-12 text-center text-[12px] text-fg-3">
          当前状态下暂无 Plan
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const sec = getSecurity(p.symbol);
            const strat = getStrategy(p.strategyId);
            const sym = p.symbol.split(".")[0];
            const cur = p.targetPlan.currentWeight * 100;
            const tgt = p.targetPlan.targetWeight * 100;
            return (
              <Link
                key={p.id}
                href={`/plan/${p.id}`}
                className="block rounded-lg border border-hairline-strong bg-bg-1 p-4 hover:border-accent"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${STATUS_CLS[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                  <Target size={13} className="shrink-0 text-accent" />
                  <span className="text-[14px] font-semibold">{sym}</span>
                  <span className="text-[12px] font-medium text-fg-2">
                    {p.targetPlan.action}
                  </span>
                  {sec && (
                    <span className="truncate text-[11px] text-fg-3">
                      · {sec.nameZh}
                    </span>
                  )}
                  <span className="num ml-auto text-[12px] font-semibold text-fg-1">
                    {cur.toFixed(0)}% → {tgt.toFixed(0)}%
                  </span>
                  <ChevronRight size={13} className="text-fg-3" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-fg-2">
                  {strat && <span>策略 · {strat.nameZh}</span>}
                  <span>·</span>
                  <span>窗口 {p.targetPlan.window}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle
                      size={10}
                      className="text-warn"
                    />
                    证伪:
                    <span className="max-w-[380px] truncate text-fg-3">
                      {p.targetPlan.invalidation}
                    </span>
                  </span>
                </div>
                {p.status === "PENDING" && (
                  <div className="mt-2 rounded-md bg-warn/10 px-3 py-1.5 text-[11px] text-[#8C5A00]">
                    等最终 Ack · 打开后一键确认即开始执行(HITL 形态一 · 按钮确认)
                  </div>
                )}
                {p.status === "COMPLETED" && (
                  <div className="mt-2 text-[11px] text-fg-3">
                    已完成 · 可进入 <span className="text-accent">Review</span> 归因
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <section className="mt-6 rounded-md bg-bg-2 px-4 py-3 text-[11px] leading-[17px] text-fg-2">
        <Kicker>关于 Plan 状态机</Kicker>
        <p className="mt-1">
          <b>Draft</b> → <b>PendingHITL</b> → <b>Submitted</b> → <b>Executed</b> → <b>Archived</b>。
          Plan 同时承载 <code className="rounded bg-bg-3 px-1 text-[10px]">execution_mode</code> · 一次性 Plan(单次买入)和循环 Plan(如定投)共用一套状态机 —— 定投就是 <b>recurring Plan</b>,不是独立对象。
        </p>
      </section>
    </div>
  );
}
