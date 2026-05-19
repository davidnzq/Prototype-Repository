"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { addDynamicPlan } from "@/lib/dynamicPlans";

type HitlConfirmProps = {
  title: string;
  description: string;
  ctaLabel: string;
  nextAction: string;
  payload?: Record<string, unknown>;
};

export function HitlConfirm(props: HitlConfirmProps) {
  const [state, setState] = useState<"pending" | "confirmed" | "dismissed">("pending");

  if (state === "confirmed") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-up/40 bg-up-soft px-3 py-2 text-[12px] text-up-dark">
        <CheckCircle2 size={14} />
        <span>已确认 · {props.title}</span>
      </div>
    );
  }
  if (state === "dismissed") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-hairline-strong bg-bg-2 px-3 py-2 text-[12px] text-fg-2">
        <X size={14} />
        <span>已取消</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-accent bg-bg-1 p-4 shadow-card">
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-xs bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
        HITL · 按钮确认
      </div>
      <div className="mt-1 font-serif text-[16px] leading-[22px] font-bold">
        {props.title}
      </div>
      <div className="mt-1 text-[12px] leading-[18px] text-fg-2">
        {props.description}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => {
            const sym =
              typeof props.payload?.symbol === "string"
                ? (props.payload.symbol as string)
                : undefined;
            // Stage A·5 · 真写入 client store · AwWorkbench 立刻同步
            addDynamicPlan({
              title: props.title,
              desc: `${props.description} · next: ${props.nextAction}`,
              symbol: sym,
            });
            setState("confirmed");
          }}
          className="inline-flex items-center rounded-sm bg-accent px-3 py-1.5 text-[12px] font-semibold text-white"
        >
          {props.ctaLabel}
        </button>
        <button
          onClick={() => setState("dismissed")}
          className="rounded-sm border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] text-fg-1 hover:bg-bg-2"
        >
          取消
        </button>
        <span className="flex-1" />
        <span className="text-[9px] text-fg-3">AI 建议 · 仅供参考</span>
      </div>
      <div className="mt-3 border-t border-hairline-strong pt-2 text-[10px] text-fg-3">
        确认后会写入 AI 工作台「需关注」组,Stage C 接入 Plan 5 状态机。
      </div>
    </div>
  );
}
