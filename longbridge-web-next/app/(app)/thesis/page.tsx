import Link from "next/link";
import { FileText, ChevronRight, Sparkles } from "lucide-react";
import { MOCK_THESES } from "@/mock/theses";
import type { ThesisStatus } from "@/types/domain";

// Thesis 列表页 · IA 4.2 · 我的工作台 · Thesis。
// 研究状态下用户通常从"今日要点"点进 /thesis/[id],列表页是"我的 Thesis 档案馆"。

const STATUS_CLS: Record<ThesisStatus, string> = {
  Active: "bg-up-soft text-up-dark",
  Validated: "bg-accent-soft text-accent",
  Invalidated: "bg-down-soft text-down-dark",
  Archived: "bg-bg-3 text-fg-3",
};

const STATUS_LABEL: Record<ThesisStatus, string> = {
  Active: "生效",
  Validated: "已被验证",
  Invalidated: "已被证伪",
  Archived: "归档",
};

export default function ThesisListPage() {
  const active = MOCK_THESES.filter((t) => t.status === "Active");
  const others = MOCK_THESES.filter((t) => t.status !== "Active");

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      <header className="mb-6 border-b border-hairline-strong pb-4">
        <div className="kicker mb-1 text-accent">MY THESIS · 我的判断</div>
        <h1 className="font-serif text-[30px] font-bold leading-[36px] tracking-[-0.02em]">
          我的 Thesis 档案
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          每一条 Thesis 是你对某个标的的一次结构化判断 · 含核心假设 + 证伪条件 + 证据链 · 会被
          Catalyst 不断校验。研究状态下 · 你可以编辑任一条 Thesis · Agent 会基于最新事实
          帮你检查假设是否仍成立。
        </p>
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-center">
          <div className="kicker text-fg-3">生效中 · {active.length} 条</div>
          <button
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1 text-[12px] font-medium text-fg-1 hover:border-accent hover:text-accent"
            aria-label="新建 Thesis"
          >
            <Sparkles size={12} /> 新建 Thesis · Agent 辅助
          </button>
        </div>
        <div className="space-y-3">
          {active.map((t) => (
            <Link
              key={t.id}
              href={`/thesis/${t.id}?state=research`}
              className="block rounded-lg border border-hairline-strong bg-bg-1 p-4 transition-colors hover:border-accent"
            >
              <div className="flex items-start gap-3">
                <FileText
                  size={16}
                  strokeWidth={1.75}
                  className="mt-1 shrink-0 text-accent"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`shrink-0 rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${STATUS_CLS[t.status]}`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                    <span className="num shrink-0 text-[11px] font-bold text-fg-3">
                      v{t.version}
                    </span>
                    <span className="truncate text-[14px] font-semibold">
                      {t.title}
                    </span>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-accent">
                      打开研究 <ChevronRight size={11} />
                    </span>
                  </div>
                  <div className="mb-2 line-clamp-2 text-[12px] leading-[18px] text-fg-2">
                    {t.hypothesis}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-fg-3">
                    <span>
                      假设 · <b className="text-fg-1">{t.assumptions.length}</b>
                    </span>
                    <span>·</span>
                    <span>
                      证据 · <b className="text-fg-1">{t.supportingCatalystIds.length}</b>
                    </span>
                    <span>·</span>
                    <span>
                      证伪条件 ·{" "}
                      <b className="text-fg-1">{t.invalidationConditions.length}</b>
                    </span>
                    <span>·</span>
                    <span>
                      关联 Plan ·{" "}
                      <b className="text-fg-1">{t.linkedPlanIds.length}</b>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section>
          <div className="mb-3">
            <div className="kicker text-fg-3">历史 / 归档 · {others.length} 条</div>
          </div>
          <div className="space-y-2">
            {others.map((t) => (
              <Link
                key={t.id}
                href={`/thesis/${t.id}?state=research`}
                className="flex items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-4 py-2.5 text-[12px] hover:bg-bg-2"
              >
                <span
                  className={`shrink-0 rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${STATUS_CLS[t.status]}`}
                >
                  {STATUS_LABEL[t.status]}
                </span>
                <span className="truncate flex-1 font-medium">{t.title}</span>
                <span className="text-[10px] text-fg-3">v{t.version}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
