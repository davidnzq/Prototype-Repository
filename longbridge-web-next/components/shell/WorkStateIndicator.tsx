"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  useWorkState,
  WORK_STATE_META,
  type WorkState,
} from "@/lib/workState";

// IA 1.6 · 状态指示器 · Top Bar 右上角 · 显示当前状态 + 可 override。
// 展开时看到推断原因 · Agent 可以判错 · 用户永远可以修正（信念五共建关系）。

const ALL_STATES: WorkState[] = ["reading", "research", "trade", "review"];

export function WorkStateIndicator() {
  const { state, setState } = useWorkState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = WORK_STATE_META[state];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:border-hairline-strong"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-fg-3">状态 ·</span>
        <span className="text-fg-1">{current.label}</span>
        <ChevronDown
          size={12}
          className={`text-fg-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[280px] overflow-hidden rounded-lg border border-hairline-strong bg-bg-1 shadow-popover">
          <div className="border-b border-hairline-strong px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-fg-3">
              当前工作状态
            </div>
          </div>
          <div className="py-1">
            {ALL_STATES.map((s) => {
              const meta = WORK_STATE_META[s];
              const active = s === state;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setState(s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-bg-2 ${
                    active ? "bg-accent-soft" : ""
                  }`}
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      active ? "bg-accent" : "bg-bg-3"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[13px] font-semibold ${active ? "text-accent" : "text-fg-1"}`}
                    >
                      {meta.label}
                      {active && (
                        <span className="ml-1.5 text-[11px] font-normal text-fg-3">
                          · 当前
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11.5px] leading-[16px] text-fg-2">
                      {meta.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-hairline-strong bg-bg-2 px-4 py-2.5">
            <div className="text-[11px] leading-[16px] text-fg-3">
              Agent 基于你的操作推断 · 你可以手动切换 · override 会反馈回 Agent
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
