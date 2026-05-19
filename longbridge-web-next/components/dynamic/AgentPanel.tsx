"use client";

// 4 类 Agent 面板 · 沿用本地 v3.0 色系
//   research(紫) / risk(玫瑰) / screener(青) / attribution(琥珀)
// dyn-tradeplan / dyn-compare 暂不挂独立 Agent(plan §7 风险 2)。

import { Sparkles } from "lucide-react";

export type AgentKind = "research" | "risk" | "screener" | "attribution";

const META: Record<
  AgentKind,
  { name: string; subtitle: string; description: string; steps: string[]; color: string; soft: string }
> = {
  research: {
    name: "深度分析 Agent",
    subtitle: "Research · 紫",
    description: "拉取营收 / 财务评分 / 估值带 / 公司日程,把「为什么是现在」讲清楚。",
    steps: ["理解输入意图", "采集深度数据", "整合呈现"],
    color: "#8B5CF6",
    soft: "rgba(139,92,246,.12)",
  },
  risk: {
    name: "复盘风险 Agent",
    subtitle: "Risk · 玫瑰",
    description: "扫你的 8 只持仓 · 量化敞口 · 推演改进建议,可生成「建议策略」草稿。",
    steps: ["提取历史决策", "量化风险敞口", "推演改进建议"],
    color: "#EC4899",
    soft: "rgba(236,72,153,.12)",
  },
  screener: {
    name: "股票选择 Agent",
    subtitle: "Screener · 青",
    description: "把你「我要…」开头的描述转成筛子参数,在选股器里跑出候选。",
    steps: ["理解意图", "推荐筛选条件", "应用并展示"],
    color: "#06B6D4",
    soft: "rgba(6,182,212,.12)",
  },
  attribution: {
    name: "大盘归因 Agent",
    subtitle: "Attribution · 琥珀",
    description: "扫宏观 + 行业 + 资金流,把今日波动按贡献 bps 拆给你看。",
    steps: ["扫描大盘异动", "归因宏观驱动", "分解个股贡献"],
    color: "#F59E0B",
    soft: "rgba(245,158,11,.12)",
  },
};

export function AgentPanel({ kind }: { kind: AgentKind }) {
  const m = META[kind];
  return (
    <aside
      className="flex h-full w-[300px] shrink-0 flex-col gap-4 border-l border-hairline-strong bg-bg-1 p-5"
      role="complementary"
      aria-label={m.name}
    >
      {/* icon stage */}
      <div className="relative flex h-20 w-full items-center justify-center">
        <span
          className="absolute h-20 w-20 rounded-full opacity-30 animate-pulse"
          style={{ background: m.soft }}
        />
        <span
          className="relative flex h-12 w-12 items-center justify-center rounded-full text-white"
          style={{ background: m.color }}
        >
          <Sparkles size={20} strokeWidth={2.25} />
        </span>
      </div>

      <div>
        <div className="caps mb-1" style={{ color: m.color }}>
          {m.subtitle}
        </div>
        <div className="text-[14px] font-bold tracking-tight text-fg-1">
          {m.name}
        </div>
      </div>

      <p className="text-[12px] leading-[18px] text-fg-2">{m.description}</p>

      <ol className="space-y-2 border-t border-hairline-strong pt-3">
        {m.steps.map((s, i) => (
          <li key={s} className="flex items-start gap-2.5 text-[12px]">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: m.color }}
            >
              {i + 1}
            </span>
            <span className="text-fg-1">{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto rounded-md border border-hairline-strong bg-bg-2 p-3 text-[10.5px] leading-[16px] text-fg-3">
        Agent 在线分析中 · 在右侧 chat 输入或继续输入指令以细化。
      </div>
    </aside>
  );
}
