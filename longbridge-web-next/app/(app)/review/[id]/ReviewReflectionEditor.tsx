"use client";

import { useState } from "react";
import { Link2, Lightbulb, ArrowRightLeft, CheckCircle2, Sparkles } from "lucide-react";
import type { Review } from "@/types/domain";

// IA 2.4 · 复盘 Surface · 结构化笔记 —— Framework Part 4 · Review artifact 三段式 ——
//   1) LINKED FACT · 这次交易的真实结果/结构性事实
//   2) LESSON · 得到的经验 · 可泛化的认知更新
//   3) NEXT CHANGE · 下一次具体做什么不同
// 三段互相独立但必须都填 · 让复盘从"随手记"变成"结构化资产"。
// 写完提交 → 关联到 Portfolio · 你的画像 · 未来 Plan 自动提示规避(框架 Part 5 闭环反馈)。

interface ReflectionState {
  linkedFact: string;
  lesson: string;
  nextChange: string;
}

function initial(r: Review): ReflectionState {
  // Seed from existing review data · 用户可编辑
  return {
    linkedFact:
      r.execution.filledPct < 100
        ? `目标仓位 ${(r.summary.targetWeight * 100).toFixed(1)}% · 实际达成 ${r.execution.filledPct}%。${
            r.execution.unexecutedReason ?? ""
          }`
        : `目标仓位 ${(r.summary.targetWeight * 100).toFixed(1)}% · 完整执行 · 实际收益 ${r.performance.realizedPnlPct >= 0 ? "+" : ""}${r.performance.realizedPnlPct.toFixed(1)}%。`,
    lesson: r.behaviorPatterns[0] ?? "待填写 · 这次交易教了我什么?",
    nextChange: r.improvements[0] ?? "待填写 · 下一次我具体怎么做不同?",
  };
}

export function ReviewReflectionEditor({ review }: { review: Review }) {
  const [state, setState] = useState<ReflectionState>(() => initial(review));
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ReflectionState>(k: K, v: ReflectionState[K]) => {
    setSaved(false);
    setState({ ...state, [k]: v });
  };

  const handleSave = () => {
    // Mock save · 真实产品里会写入 /api/review/[id]/reflection
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const allFilled =
    state.linkedFact.trim().length > 10 &&
    state.lesson.trim().length > 10 &&
    state.nextChange.trim().length > 10;

  return (
    <section className="mb-8 rounded-lg border-2 border-accent bg-bg-1 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-accent" />
        <div className="kicker text-accent">
          复盘三段式 · STRUCTURED REFLECTION
        </div>
        <span className="ml-auto text-[10px] text-fg-3">
          Linked Fact + Lesson + Next Change · 三段都填才算完整
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ReflectionBlock
          kicker="LINKED FACT"
          label="关联事实"
          icon={Link2}
          hint="这次交易的结构性事实(执行/收益/偏差),不是情绪"
          value={state.linkedFact}
          onChange={(v) => set("linkedFact", v)}
        />
        <ReflectionBlock
          kicker="LESSON"
          label="得到的经验"
          icon={Lightbulb}
          hint="可泛化的认知更新 · 不是单次事件复述"
          value={state.lesson}
          onChange={(v) => set("lesson", v)}
        />
        <ReflectionBlock
          kicker="NEXT CHANGE"
          label="下一次具体做什么"
          icon={ArrowRightLeft}
          hint="可执行的改变 · 会反馈到画像 + 未来 Plan 提示"
          value={state.nextChange}
          onChange={(v) => set("nextChange", v)}
        />
      </div>

      <footer className="mt-4 flex items-center gap-3">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-up-dark">
            <CheckCircle2 size={14} /> 已保存 · 会纳入你的画像 + 未来 Plan 提示
          </span>
        ) : (
          <span className="text-[11px] text-fg-3">
            保存后会影响未来 Plan 的 Agent 提示(framework Part 5 闭环反馈)
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={!allFilled}
          className="ml-auto rounded-md bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          保存复盘
        </button>
      </footer>
    </section>
  );
}

function ReflectionBlock({
  kicker,
  label,
  icon: Icon,
  hint,
  value,
  onChange,
}: {
  kicker: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col rounded-md border border-hairline-strong bg-bg-2 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-accent">
        <Icon size={12} className="text-accent" />
        <span className="caps">{kicker}</span>
      </div>
      <div className="mb-1 text-[12px] font-semibold text-fg-1">{label}</div>
      <div className="mb-2 text-[10px] leading-[14px] text-fg-3">{hint}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="flex-1 rounded-md border border-hairline-strong bg-bg-1 px-2 py-1.5 text-[12px] leading-[17px] outline-none focus:border-accent"
      />
    </div>
  );
}
