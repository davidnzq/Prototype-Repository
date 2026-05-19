"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X, CheckCircle2, FileText } from "lucide-react";
import type { Thesis, EntryApproach, SignalAction } from "@/types/domain";

// HITL 形态二 · 确认+弹窗 · Plan 草稿确认表单 ——
// Thesis 生成 Plan 草稿 → 用户审阅 → 可修改关键字段 → 提交 → Plan PendingHITL。
// 草稿字段参考 types/domain TradePlan.targetPlan + executionPlan 结构。

interface PlanDraftForm {
  action: SignalAction;
  targetWeightPct: number; // 目标仓位
  currentWeightPct: number; // 当前仓位
  entryApproach: EntryApproach;
  invalidation: string;
  window: string;
  note: string;
}

function buildDraft(thesis: Thesis): PlanDraftForm {
  // Mock · 基于 Thesis 自动生成的"Agent 建议"。
  // 真实系统里由 Agent 根据 Thesis + Portfolio + 画像算出。
  const isHedge = thesis.status === "Invalidated" || thesis.title.includes("风险");
  return {
    action: isHedge ? "HEDGE" : "BUY",
    targetWeightPct: isHedge ? 6 : 10,
    currentWeightPct: 6,
    entryApproach: "gradual_ladder",
    invalidation: thesis.invalidationConditions[0] ?? "无",
    window: "7D · 分 3 次",
    note: `基于 Thesis "${thesis.title}" · v${thesis.version} 生成。Agent 已校准置信度,可调整。`,
  };
}

export function ThesisResearchActions({
  thesis,
  hasPlan,
}: {
  thesis: Thesis;
  hasPlan: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanDraftForm>(() => buildDraft(thesis));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setSubmitted(false);
  }, [open]);

  return (
    <div className="rounded-lg border border-accent/30 bg-accent-soft/30 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-accent">
        <Sparkles size={12} />
        <span className="caps">AGENT 动作区 · ACTIONS</span>
      </div>
      <p className="mb-3 text-[12px] leading-[18px] text-fg-2">
        Agent 可以基于该 Thesis + 你的画像 + 当前持仓 · 生成一份 <b>Plan 草稿</b>。你审阅 · 可改关键字段 · 确认后进入 <b>PendingHITL</b> 状态。
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent/90"
        >
          <Sparkles size={12} /> 生成 Plan 草稿 · Agent 辅助
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] font-medium text-fg-1 hover:border-accent">
          <FileText size={12} /> 编辑 Thesis
        </button>
      </div>
      {hasPlan && (
        <div className="mt-2 text-[11px] text-fg-3">
          该 Thesis 已有关联 Plan · 再生成将作为新版本备选。
        </div>
      )}

      {open && (
        <PlanDraftModal
          thesis={thesis}
          form={form}
          setForm={setForm}
          submitted={submitted}
          onSubmit={() => setSubmitted(true)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function PlanDraftModal({
  thesis,
  form,
  setForm,
  submitted,
  onSubmit,
  onClose,
}: {
  thesis: Thesis;
  form: PlanDraftForm;
  setForm: (next: PlanDraftForm) => void;
  submitted: boolean;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const set = <K extends keyof PlanDraftForm>(k: K, v: PlanDraftForm[K]) =>
    setForm({ ...form, [k]: v });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-lg border border-hairline-strong bg-bg-1 shadow-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b border-hairline-strong px-5 py-4">
          <Sparkles size={16} className="mt-0.5 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="kicker text-accent">HITL · 确认 Plan 草稿</div>
            <h2 className="mt-0.5 text-[16px] font-semibold">
              基于 Thesis &ldquo;{thesis.title}&rdquo; 生成
            </h2>
            <p className="mt-1 text-[11.5px] leading-[17px] text-fg-3">
              关键字段可以改 · 确认后 Plan 进入 <b>PendingHITL</b> 状态,等待最终执行确认。
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-3 hover:bg-bg-2 hover:text-fg-1"
            aria-label="关闭"
          >
            <X size={14} />
          </button>
        </header>

        {submitted ? (
          <SuccessBody thesis={thesis} form={form} onClose={onClose} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="方向 · ACTION">
                  <select
                    value={form.action}
                    onChange={(e) => set("action", e.target.value as SignalAction)}
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  >
                    {(["BUY", "SELL", "HOLD", "HEDGE", "REBALANCE", "WATCH"] as SignalAction[]).map(
                      (a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      )
                    )}
                  </select>
                </Field>
                <Field label="入场方式 · ENTRY">
                  <select
                    value={form.entryApproach}
                    onChange={(e) =>
                      set("entryApproach", e.target.value as EntryApproach)
                    }
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  >
                    <option value="gradual_ladder">分批阶梯</option>
                    <option value="single_or_gradual">单次或分批</option>
                    <option value="wait">观望</option>
                  </select>
                </Field>
                <Field label="当前仓位 · %">
                  <input
                    type="number"
                    step={0.5}
                    value={form.currentWeightPct}
                    onChange={(e) =>
                      set("currentWeightPct", parseFloat(e.target.value))
                    }
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  />
                </Field>
                <Field label="目标仓位 · %">
                  <input
                    type="number"
                    step={0.5}
                    value={form.targetWeightPct}
                    onChange={(e) =>
                      set("targetWeightPct", parseFloat(e.target.value))
                    }
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  />
                </Field>
                <Field label="窗口 · WINDOW">
                  <input
                    type="text"
                    value={form.window}
                    onChange={(e) => set("window", e.target.value)}
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  />
                </Field>
                <Field label="证伪触发 · INVALIDATION">
                  <input
                    type="text"
                    value={form.invalidation}
                    onChange={(e) => set("invalidation", e.target.value)}
                    className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[13px]"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-3">
                  备注 · NOTE
                </div>
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[12.5px] leading-[18px]"
                />
              </div>

              <div className="mt-4 rounded-md bg-bg-2 px-3 py-2 text-[11px] leading-[17px] text-fg-2">
                <b className="text-fg-1">Agent 校验:</b>{" "}
                此调整会让 {thesis.symbol.split(".")[0]} 仓位从 {form.currentWeightPct}% → {form.targetWeightPct}%(Δ {(form.targetWeightPct - form.currentWeightPct).toFixed(1)}pp)。当前画像风险预算允许的单票上限为 15% ·{" "}
                {form.targetWeightPct > 15 ? (
                  <span className="font-semibold text-down-dark">超出 · 请调低</span>
                ) : (
                  <span className="font-semibold text-up-dark">通过</span>
                )}
                。
              </div>
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-hairline-strong px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-hairline-strong bg-bg-1 px-4 py-1.5 text-[12.5px] font-medium text-fg-1 hover:bg-bg-2"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={form.targetWeightPct > 15}
                className="rounded-md bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
              >
                确认并提交 · PendingHITL
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

function SuccessBody({
  thesis,
  form,
  onClose,
}: {
  thesis: Thesis;
  form: PlanDraftForm;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 px-7 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-up-soft">
        <CheckCircle2 size={22} className="text-up-dark" />
      </div>
      <div>
        <h3 className="text-[18px] font-semibold">Plan 已提交 · PendingHITL</h3>
        <p className="mt-1 text-[12.5px] leading-[19px] text-fg-2">
          基于 Thesis &ldquo;{thesis.title}&rdquo; · 仓位 {form.currentWeightPct}% → {form.targetWeightPct}%,方式 {form.entryApproach === "gradual_ladder" ? "分批阶梯" : form.entryApproach}。
          下一步 Agent 会在执行前再发一次 <b>最终确认 Ack</b> —— 你可以在&ldquo;Plan · 行动中心&rdquo;看到它。
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-hairline-strong bg-bg-1 px-4 py-1.5 text-[12.5px] font-medium text-fg-1 hover:bg-bg-2"
        >
          继续研究
        </button>
        <Link
          href="/plan"
          className="rounded-md bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-accent/90"
        >
          打开 Plan 行动中心 →
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-3">
        {label}
      </span>
      {children}
    </label>
  );
}
