"use client";

// Stage A·5 · 极简 client-side Plan store
//
// 让 HitlConfirm 点确认时往 localStorage 推一条 PENDING_HITL Plan,
// AwWorkbench 通过 useDynamicPlans() 订阅并显示在"需关注"组。
//
// Stage C 会替换为完整 Artifact 体系(types/domain.ts 的 TradePlan + 5 状态机)。

import { useEffect, useState } from "react";

export interface DynamicPlan {
  id: string;
  title: string;
  desc: string;
  status: "PENDING_HITL";
  createdAt: number;
  symbol?: string;
}

const KEY = "lb_dynamic_plans_v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): DynamicPlan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(plans: DynamicPlan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(plans));
  listeners.forEach((l) => l());
}

export function addDynamicPlan(input: {
  title: string;
  desc: string;
  symbol?: string;
}): DynamicPlan {
  const plan: DynamicPlan = {
    id: `pending-${Date.now()}`,
    title: input.title,
    desc: input.desc,
    symbol: input.symbol,
    status: "PENDING_HITL",
    createdAt: Date.now(),
  };
  const all = read();
  write([plan, ...all]);
  return plan;
}

export function clearDynamicPlans() {
  write([]);
}

export function useDynamicPlans(): DynamicPlan[] {
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  useEffect(() => {
    const refresh = () => setPlans(read());
    listeners.add(refresh);
    refresh();
    // cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return plans;
}
