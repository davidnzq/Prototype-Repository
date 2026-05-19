"use client";

// 6 类 dyn 视图骨架 · Stage A·3
// 每个 view 显示左侧主区(精简占位) + 右侧 Agent 面板(色系区分)。
// Stage C 才把主区填上完整内容(NVDA 13 行 / 风险 8 模块 / 选股器 / 归因 7 行 等)。

import { AgentPanel, type AgentKind } from "./AgentPanel";
import type { DynViewId } from "@/lib/intent";

const VIEW_META: Record<
  DynViewId,
  { title: (sym?: string) => string; subtitle: string; agent: AgentKind | null; mainHint: string }
> = {
  "dyn-research": {
    title: (sym) => `深度研究 · ${sym ?? ""}`.trim(),
    subtitle: "营收 / 财务评分 / 估值带 / 日程 · 13 行模块",
    agent: "research",
    mainHint:
      "Stage C 在这里铺 NVDA 全维(营收堆叠 + 财务雷达 + 估值四卡 + 公司日程)。其它 ticker 走简表。",
  },
  "dyn-risk": {
    title: () => "持仓风险审视",
    subtitle: "8 只持仓 · 集中度 / 相关性 / 单票回撤敞口",
    agent: "risk",
    mainHint:
      "Stage C 在这里铺 4×8 风险模块矩阵 + Chat 末尾「建议策略」hitl_confirm 卡。",
  },
  "dyn-attribution": {
    title: () => "今日归因",
    subtitle: "宏观 + 行业 + 资金流 · 7 行市场频道",
    agent: "attribution",
    mainHint:
      "Stage C 在这里铺指数卡 + 板块热力 + 事件流 + 资金流向 + 个股贡献。",
  },
  "dyn-screener": {
    title: () => "选股器",
    subtitle: "意图 → 筛选条件 → 候选标的",
    agent: "screener",
    mainHint:
      "Stage C 在这里铺空态(参数推荐) + 应用态(命中标的 + 排序条件)两段。",
  },
  "dyn-tradeplan": {
    title: (sym) => `Trade Plan${sym ? ` · ${sym}` : ""}`,
    subtitle: "目标仓位 / 限价 / 分批 / 证伪条件 · 5 状态机",
    agent: null,
    mainHint:
      "Stage C 在这里铺 Plan 状态机 timeline + 参数表单 + Phases + Orders 表 + Ack 按钮。",
  },
  "dyn-compare": {
    title: () => "对标决策",
    subtitle: "估值 / 增速 / 风险 / Signal 一行对比",
    agent: null,
    mainHint:
      "Stage C 在这里铺 2-3 列对比表 + 雷达图覆盖 + 推荐结论。",
  },
};

export function DynView({
  viewId,
  symbol,
}: {
  viewId: DynViewId;
  symbol?: string;
}) {
  const meta = VIEW_META[viewId];
  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-hairline-strong bg-bg-1 px-6 py-3">
          <span className="caps text-accent">实时布局</span>
          <span className="h-3 w-px bg-hairline-strong" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold tracking-tight text-fg-1">
              {meta.title(symbol)}
            </div>
            <div className="text-[11.5px] text-fg-3">{meta.subtitle}</div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-up/30 bg-up/10 px-2.5 py-1 text-[10.5px] text-up">
            <span className="h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
            实时布局
          </span>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-dashed border-hairline-strong bg-bg-1 p-8 text-center">
            <div className="caps mb-2 text-fg-3">Stage A·3 占位</div>
            <p className="mx-auto max-w-md text-[12px] leading-[20px] text-fg-2">
              {meta.mainHint}
            </p>
          </div>
        </section>
      </div>
      {meta.agent && <AgentPanel kind={meta.agent} />}
    </div>
  );
}
