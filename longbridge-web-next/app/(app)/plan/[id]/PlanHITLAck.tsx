"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type { TradePlanStatus } from "@/types/domain";

// HITL 形态一 · 按钮确认 Ack · Plan 执行前的最后一关。
// Plan 状态流转:Draft → PendingHITL → Submitted → Executed → Archived。
// 这个按钮在 Draft/Pending 状态显示 · 按下即 Ack · 触发提交 · 变 Submitted。

interface Props {
  initialStatus: TradePlanStatus;
  symbol: string;
}

export function PlanHITLAck({ initialStatus, symbol }: Props) {
  const [status, setStatus] = useState<TradePlanStatus>(initialStatus);
  const [acking, setAcking] = useState(false);

  if (status === "COMPLETED" || status === "CANCELLED") {
    return (
      <span className="shrink-0 rounded-xs bg-up-soft px-3 py-1 text-[11px] font-semibold text-up-dark">
        已完成
      </span>
    );
  }

  if (status === "ACTIVE") {
    return (
      <span className="inline-flex shrink-0 items-center gap-2 rounded-xs bg-up-soft px-3 py-1.5 text-[12px] font-semibold text-up-dark">
        <CheckCircle2 size={13} /> 已提交 · 执行中
      </span>
    );
  }

  const label =
    status === "DRAFT"
      ? "Ack · 确认进入 PendingHITL"
      : "Ack · 确认下单(最终确认)";

  const handleAck = () => {
    setAcking(true);
    // Mock · 真实系统中请求 API,这里模拟网络延迟 + 状态机推进。
    setTimeout(() => {
      setStatus((prev) => (prev === "DRAFT" ? "PENDING" : "ACTIVE"));
      setAcking(false);
    }, 650);
  };

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleAck}
        disabled={acking}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {acking ? (
          <>
            <Loader2 size={14} className="animate-spin" /> 提交中…
          </>
        ) : (
          <>
            {label} <ArrowRight size={14} />
          </>
        )}
      </button>
      <span className="text-[10px] text-fg-3">
        {status === "DRAFT"
          ? `进入 PendingHITL 后会再发一次最终确认(${symbol.split(".")[0]})`
          : "此处 Ack 后 Plan 立刻下单 · 不再回放"}
      </span>
    </div>
  );
}
