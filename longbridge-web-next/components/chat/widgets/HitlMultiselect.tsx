"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Props = {
  question: string;
  options: string[];
  multiple?: boolean;
};

export function HitlMultiselect({ question, options, multiple = false }: Props) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    const selected = [...picked].map((i) => options[i]).join(" · ");
    return (
      <div className="rounded-md border border-up/40 bg-up-soft px-3 py-2 text-[12px] text-up-dark">
        <span className="font-semibold">已选择:</span> {selected || "(无)"}
      </div>
    );
  }

  const toggle = (i: number) => {
    if (!multiple) {
      setPicked(new Set([i]));
      setSubmitted(true);
      return;
    }
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="rounded-lg border-2 border-accent bg-bg-1 p-4 shadow-card">
      <div className="mb-1 inline-flex items-center rounded-xs bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
        HITL · {multiple ? "多选" : "单选"}
      </div>
      <div className="mt-1 font-serif text-[15px] leading-[21px] font-semibold">
        {question}
      </div>
      <div className="mt-3 space-y-1.5">
        {options.map((opt, i) => {
          const on = picked.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[12px] transition-colors ${
                on
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-hairline-strong hover:border-fg-3"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-xs border ${
                  on ? "border-accent bg-accent text-white" : "border-fg-3"
                }`}
              >
                {on && <Check size={11} strokeWidth={3} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {multiple && (
        <div className="mt-3 flex items-center gap-2">
          <button
            disabled={picked.size === 0}
            onClick={() => setSubmitted(true)}
            className="inline-flex items-center rounded-sm bg-accent px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
          >
            提交
          </button>
          <span className="text-[10px] text-fg-3">
            已选 {picked.size}/{options.length}
          </span>
        </div>
      )}
      <div className="mt-3 border-t border-hairline-strong pt-2 text-[10px] text-fg-3">
        Longbridge AI will continue to work after your reply.
      </div>
    </div>
  );
}
