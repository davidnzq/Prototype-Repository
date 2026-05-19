"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

// ── Work state types (IA Ch 2 · framework Part 6.2) ─────────────
// 四工作状态 · Agent 推断 · 用户可 override (IA 1.6)。
export type WorkState = "reading" | "research" | "trade" | "review";

const VALID_STATES: WorkState[] = ["reading", "research", "trade", "review"];

export const WORK_STATE_META: Record<
  WorkState,
  { label: string; short: string; desc: string }
> = {
  reading: {
    label: "阅读",
    short: "Reading",
    desc: "仪表盘式 · 扫视 Catalyst 和 Signal",
  },
  research: {
    label: "研究",
    short: "Research",
    desc: "分屏 · 一边 Thesis · 一边 Agent 讨论",
  },
  trade: {
    label: "交易",
    short: "Trade",
    desc: "聚焦执行窗 · 干扰最少",
  },
  review: {
    label: "复盘",
    short: "Review",
    desc: "结构化笔记 · Linked Fact / Lesson / Next Change",
  },
};

export function useWorkState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = searchParams.get("state");
  const state: WorkState = VALID_STATES.includes(raw as WorkState)
    ? (raw as WorkState)
    : "reading";

  const setState = useCallback(
    (next: WorkState) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("state", next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { state, setState };
}
