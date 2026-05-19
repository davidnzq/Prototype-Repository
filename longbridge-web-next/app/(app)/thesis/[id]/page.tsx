import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileText,
  Target,
  Sparkles,
} from "lucide-react";
import { MOCK_THESES } from "@/mock/theses";
import { MOCK_CATALYSTS } from "@/mock/catalysts";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";
import { getSecurity } from "@/lib/universe";
import type { ThesisStatus } from "@/types/domain";
import { ThesisResearchActions } from "./ThesisResearchActions";

// IA 2.2 · 研究 Surface · 分屏 ——
// 左 ~ 55%:Thesis 编辑器(核心判断 + 假设 + 证伪条件)
// 右 ~ 45%:支持证据(Catalyst)+ 关联 Plan + 生成 Plan 草稿(HITL)
// Chat Panel 在最右 · 由 Shell 驱动展开(state=research → ~520px)
// 整个页面默认通过 ?state=research 进入,用户的工作状态指示器会同步。

const STATUS_META: Record<
  ThesisStatus,
  { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }
> = {
  Active: { label: "生效", cls: "bg-up-soft text-up-dark", icon: CheckCircle2 },
  Validated: { label: "已被验证", cls: "bg-accent-soft text-accent", icon: CheckCircle2 },
  Invalidated: {
    label: "已被证伪",
    cls: "bg-down-soft text-down-dark",
    icon: AlertTriangle,
  },
  Archived: { label: "归档", cls: "bg-bg-3 text-fg-3", icon: Clock3 },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ThesisPage({ params }: PageProps) {
  const { id } = await params;
  const thesis = MOCK_THESES.find((t) => t.id === id);
  if (!thesis) notFound();
  const sec = getSecurity(thesis.symbol);
  const statusMeta = STATUS_META[thesis.status];
  const StatusIcon = statusMeta.icon;

  const supporting = thesis.supportingCatalystIds
    .map((cid) => MOCK_CATALYSTS.find((c) => c.id === cid))
    .filter(Boolean) as typeof MOCK_CATALYSTS;

  const linkedPlans = thesis.linkedPlanIds
    .map((pid) => MOCK_TRADE_PLANS.find((p) => p.id === pid))
    .filter(Boolean) as typeof MOCK_TRADE_PLANS;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 顶部面包屑 */}
      <div className="flex shrink-0 items-center gap-2 border-b border-hairline-strong bg-bg-1 px-6 py-2.5 text-[12px] text-fg-2">
        <Link
          href="/thesis"
          className="inline-flex items-center gap-0.5 text-fg-2 hover:text-accent"
        >
          <ChevronLeft size={12} /> Thesis 档案
        </Link>
        <span className="text-fg-3">·</span>
        <span className="text-fg-1">{thesis.company}</span>
        <span className="text-fg-3">·</span>
        <span className="text-fg-3">v{thesis.version}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-fg-3">
          <Sparkles size={11} className="text-accent" /> 研究状态 · Chat 已展开
        </span>
      </div>

      {/* 分屏主体 */}
      <div className="grid min-h-0 flex-1 overflow-hidden grid-cols-[1.15fr_1fr]">
        {/* 左:Thesis 编辑器 */}
        <section className="min-h-0 overflow-y-auto border-r border-hairline-strong bg-bg-2 px-7 py-6">
          <div className="mx-auto max-w-[620px]">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${statusMeta.cls}`}
              >
                <StatusIcon size={10} /> {statusMeta.label}
              </span>
              <span className="num text-[11px] font-semibold text-fg-3">
                v{thesis.version} · 上次更新{" "}
                {new Date(thesis.updatedAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
            <h1 className="font-serif text-[28px] font-bold leading-[34px] tracking-[-0.02em]">
              {thesis.title}
            </h1>
            {sec && (
              <div className="mt-1 text-[12px] text-fg-3">
                {sec.nameZh} · {thesis.symbol.split(".")[0]} · {sec.sector}
              </div>
            )}

            {/* 核心判断 */}
            <div className="mt-6 rounded-lg border border-hairline-strong bg-bg-1 p-5">
              <div className="kicker mb-2 text-accent">核心判断 · HYPOTHESIS</div>
              <p className="text-[14px] leading-[22px] text-fg-1">
                {thesis.hypothesis}
              </p>
            </div>

            {/* 关键假设 */}
            <div className="mt-5">
              <div className="mb-2 flex items-center">
                <div className="kicker text-fg-3">
                  关键假设 · ASSUMPTIONS · {thesis.assumptions.length}
                </div>
                <span className="ml-auto text-[10px] text-fg-3">
                  每一条都可以被证伪 · 置信度由 Agent 根据事实校准
                </span>
              </div>
              <ul className="space-y-2">
                {thesis.assumptions.map((a, i) => {
                  const conf = Math.round(a.confidence * 100);
                  const confCls =
                    conf >= 75
                      ? "bg-up-soft text-up-dark"
                      : conf >= 60
                      ? "bg-accent-soft text-accent"
                      : "bg-warn/15 text-warn";
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2.5"
                    >
                      <span className="num mt-0.5 shrink-0 text-[11px] font-bold text-fg-3">
                        A{i + 1}
                      </span>
                      <p className="flex-1 text-[12.5px] leading-[19px] text-fg-1">
                        {a.text}
                      </p>
                      <span
                        className={`num shrink-0 rounded-xs px-1.5 py-0.5 text-[10px] font-bold ${confCls}`}
                      >
                        {conf}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 证伪条件 */}
            <div className="mt-5">
              <div className="mb-2">
                <div className="kicker text-fg-3">
                  证伪条件 · INVALIDATION · 触发任一则 Thesis 失效
                </div>
              </div>
              <ul className="space-y-1.5">
                {thesis.invalidationConditions.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12.5px] leading-[18px] text-fg-1"
                  >
                    <AlertTriangle
                      size={12}
                      className="mt-0.5 shrink-0 text-warn"
                    />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 编辑器底部:Agent 互动提示 */}
            <div className="mt-7 rounded-md border border-dashed border-hairline-strong bg-bg-1 px-4 py-3 text-[11.5px] text-fg-3">
              <span className="font-semibold text-accent">Agent:</span>{" "}
              本 Thesis 上次更新于 {new Date(thesis.updatedAt).toLocaleDateString("zh-CN")}。
              我已基于今日 Catalyst 为你更新了置信度 · 右侧可以看证据流。如需生成 Plan 草稿 · 点击右侧&ldquo;生成 Plan 草稿&rdquo;。
            </div>
          </div>
        </section>

        {/* 右:证据 + Plan */}
        <section className="min-h-0 overflow-y-auto px-6 py-6">
          <ThesisResearchActions thesis={thesis} hasPlan={linkedPlans.length > 0} />

          <div className="mt-6">
            <div className="mb-2 flex items-center">
              <div className="kicker text-fg-3">
                支持证据 · EVIDENCE · Catalyst {supporting.length}
              </div>
            </div>
            <ul className="space-y-2">
              {supporting.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md border border-hairline-strong bg-bg-1 p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="caps shrink-0 text-[9px] font-bold text-accent">
                      {c.significance}
                    </span>
                    <span className="truncate text-[12px] font-semibold">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-[11px] leading-[17px] text-fg-2">{c.subtitle}</p>
                  <Link
                    href={`?peek=${c.id}`}
                    className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent"
                  >
                    展开看事实 →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="kicker text-fg-3">
                关联 Plan · {linkedPlans.length}
              </div>
              {linkedPlans.length === 0 && (
                <span className="text-[10px] text-fg-3">
                  暂无 · 可基于该 Thesis 生成草稿
                </span>
              )}
            </div>
            {linkedPlans.map((p) => (
              <Link
                key={p.id}
                href={`/plan/${p.id}`}
                className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent-soft/40 p-3 hover:border-accent"
              >
                <Target size={14} className="mt-0.5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="num shrink-0 rounded-xs bg-bg-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-fg-2">
                      {p.status}
                    </span>
                    <span className="truncate text-[12px] font-semibold">
                      {p.symbol.split(".")[0]} · {p.targetPlan.action}
                    </span>
                    <span className="num ml-auto text-[11px] font-semibold text-fg-2">
                      {(p.targetPlan.currentWeight * 100).toFixed(0)}% →{" "}
                      {(p.targetPlan.targetWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-fg-3">
                    窗口 {p.targetPlan.window}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="kicker mb-2 text-fg-3">版本历史</div>
            <ul className="space-y-1 text-[11px] text-fg-2">
              <li className="flex items-center gap-2">
                <FileText size={10} className="text-fg-3" />
                <span>v{thesis.version} · 当前</span>
                <span className="ml-auto text-fg-3">
                  {new Date(thesis.updatedAt).toLocaleDateString("zh-CN")}
                </span>
              </li>
              {thesis.version > 1 && (
                <li className="flex items-center gap-2">
                  <FileText size={10} className="text-fg-3" />
                  <span>v{thesis.version - 1}</span>
                  <span className="ml-auto text-fg-3">
                    {new Date(thesis.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
