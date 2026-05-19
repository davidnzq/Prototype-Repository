import Link from "next/link";
import { Sparkles, Store, Check } from "lucide-react";
import { ALL_LISTINGS } from "@/mock/strategiesMarketplace";

// IA 1.3 · 生态区 · Sub-Agent 偏好
// 用户启用哪些 Sub-Agent · 优先级 · 是否允许主动调用。
// 不是 Marketplace(那边是"浏览 + 发现")· 这里是"我启用的 + 如何被调用"。

export default function SubAgentsPage() {
  const agents = ALL_LISTINGS.filter((l) => l.kind === "agent");
  // Mock · 前 2 个已启用 · 最后 1 个未启用
  const enabledIds = new Set(agents.slice(0, 2).map((a) => a.strategyId));

  return (
    <div className="mx-auto max-w-[880px] px-8 py-8">
      <header className="mb-6 border-b border-hairline-strong pb-4">
        <div className="mb-1 flex items-center gap-2 text-accent">
          <Sparkles size={14} />
          <span className="kicker">SUB-AGENT PREFERENCES · 偏好</span>
        </div>
        <h1 className="font-serif text-[30px] font-bold leading-[36px] tracking-[-0.02em]">
          我启用的 Sub-Agent
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          这些 Sub-Agent 启用后 · 会参与到 Bridge AI 的研究 / 分析中 · 主会话里可以 <code className="rounded bg-bg-2 px-1 text-[11px]">@agent-name</code> 直接召唤。想新增 Agent · 去{" "}
          <Link href="/marketplace?tab=agent" className="font-semibold text-accent">
            Marketplace → Sub-Agent
          </Link>
          。
        </p>
      </header>

      <div className="space-y-3">
        {agents.map((l) => {
          const a = l as typeof l & {
            agentName?: string;
            capability?: string;
            io?: { input: string; output: string };
          };
          const enabled = enabledIds.has(l.strategyId);
          return (
            <div
              key={l.strategyId}
              className={`rounded-lg border p-4 ${
                enabled ? "border-accent/30 bg-accent-soft/30" : "border-hairline-strong bg-bg-1"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-xs bg-bg-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-fg-2">
                      SUB-AGENT
                    </span>
                    <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-semibold text-fg-2">
                      {l.method}
                    </span>
                    <span className="text-[14px] font-semibold">{a.agentName}</span>
                    {enabled && (
                      <span className="inline-flex items-center gap-1 rounded-xs bg-up-soft px-1.5 py-0.5 text-[10px] font-bold text-up-dark">
                        <Check size={10} /> 启用中
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] leading-[17px] text-fg-2">{a.capability}</p>
                  {a.io && (
                    <div className="mt-1.5 text-[10px] text-fg-3">
                      <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                        in: {a.io.input}
                      </span>
                      <span className="mx-1">→</span>
                      <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                        out: {a.io.output}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className={`shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold ${
                    enabled
                      ? "border border-hairline-strong bg-bg-1 text-fg-1 hover:bg-bg-2"
                      : "bg-accent text-white hover:bg-accent/90"
                  }`}
                >
                  {enabled ? "停用" : "启用"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-dashed border-hairline-strong bg-bg-1 p-4 text-[11.5px] leading-[17px] text-fg-2">
        <div className="mb-1 flex items-center gap-1.5 text-fg-3">
          <Store size={11} />
          <span className="caps">MORE · 更多</span>
        </div>
        更多第三方专家在{" "}
        <Link href="/marketplace?tab=agent" className="font-semibold text-accent">
          Marketplace → Sub-Agent
        </Link>
        。Bridge AI 不做封闭 alpha · 欢迎多流派共存(信念四逻辑)。
      </div>
    </div>
  );
}
