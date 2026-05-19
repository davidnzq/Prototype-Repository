"use client";

/* Phase 5 · 新首页 · 主线:今天值得看什么
 * 5 区:今日热点 / 今日大盘 / 持仓异动 / 未来日历 / AI 工作台
 * 保留 ?view=dyn-* DynView 分支(input 实时重组用)
 * 旧 home(Stage A·3 翻译版)备份在 page.bak.tsx */

import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

import { DynView } from "@/components/dynamic/DynView";
import type { DynViewId } from "@/lib/intent";
import { useDynamicPlans, clearDynamicPlans } from "@/lib/dynamicPlans";

// v2 组件
import { AlertHot } from "@/components/longbridge/AlertHot";
import { AIAnalysis } from "@/components/longbridge/AIAnalysis";
import { EventTracker } from "@/components/longbridge/EventTracker";
import { AlertCalendar } from "@/components/longbridge/AlertCalendar";

// mocks
import { mockHotEvents, mockCalendarEvents } from "@/mock/stockDetail-lb";
import { mockMarketTodayAIAnalysis } from "@/mock/aiAnalysis-marketToday";
import { mockPortfolioTodayEvents } from "@/mock/portfolioEvents";
import {
  TOP_INDICES,
  AW_GROUPS,
  type AwCard as AwCardType,
} from "@/mock/localHome";

const DYN_VIEW_IDS: DynViewId[] = [
  "dyn-research",
  "dyn-risk",
  "dyn-attribution",
  "dyn-screener",
  "dyn-tradeplan",
  "dyn-compare",
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const symbol = searchParams.get("symbol");

  if (view && DYN_VIEW_IDS.includes(view as DynViewId)) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-bg-2">
        <DynView viewId={view as DynViewId} symbol={symbol ?? undefined} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-bg-2">
      <IndexBar />
      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-6">
        <section>
          <SectionLabel num="01" title="今日热点" hint="实时 · 4 source" />
          <AlertHot events={mockHotEvents} />
        </section>

        <section>
          <SectionLabel num="02" title="今日大盘" hint="AI 综合 · 长文" />
          <AIAnalysis data={mockMarketTodayAIAnalysis} />
        </section>

        <section>
          <SectionLabel
            num="03"
            title="持仓 / 自选今日异动"
            hint={`${mockPortfolioTodayEvents.length} 条事件 · 按时间倒序`}
          />
          <EventTracker events={mockPortfolioTodayEvents} />
        </section>

        <section>
          <SectionLabel num="04" title="未来 7 天日历" hint="财报 / 分红 / 会议" />
          <AlertCalendar events={mockCalendarEvents} />
        </section>

        <section>
          <SectionLabel num="05" title="AI 工作台" hint="长任务 · 等待确认" />
          <AiWorkbench />
        </section>
      </div>
    </div>
  );
}

function SectionLabel({
  num,
  title,
  hint,
}: {
  num: string;
  title: string;
  hint?: string;
}) {
  return (
    <header className="mb-3 flex items-baseline gap-3">
      <span className="num text-xs text-fg-3">{num}</span>
      <h2 className="text-base font-semibold text-fg-1">{title}</h2>
      {hint && <span className="text-[11px] text-fg-3">{hint}</span>}
    </header>
  );
}

function IndexBar() {
  return (
    <div className="flex h-9 shrink-0 items-center gap-6 border-b border-hairline-strong bg-bg-1 px-6 text-[11px]">
      {TOP_INDICES.map((idx) => {
        const up = idx.dir === "up";
        return (
          <div key={idx.name} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-1 rounded-sm ${up ? "bg-up" : "bg-down"}`} />
            <span className="font-medium text-fg-1">{idx.name}</span>
            <span className="num text-fg-1">{idx.val}</span>
            <span className={up ? "text-up" : "text-down"}>{up ? "▲" : "▼"}</span>
            <span className={`num ${up ? "text-up" : "text-down"}`}>
              {idx.chg} {idx.pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AiWorkbench() {
  const dynamic = useDynamicPlans();
  const groups = AW_GROUPS.map((g) => {
    if (g.id !== "alert") return g;
    const dynamicCards = dynamic.map((p) => ({
      status: "warn" as const,
      title: `${p.title}${p.symbol ? ` · ${p.symbol}` : ""}`,
      desc: `等你最终确认 · ${new Date(p.createdAt).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      kv: [["状态", "PENDING_HITL"]] as [string, string][],
      actions: ["Ack 下单", "改参数"],
    }));
    return { ...g, cards: [...dynamicCards, ...g.cards] };
  });
  const total = groups.reduce((acc, g) => acc + g.cards.length, 0);

  return (
    <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Sparkles size={13} strokeWidth={2.25} />
        </span>
        <span className="text-[13px] font-semibold text-fg-1">AI 工作台</span>
        <span className="caps">{total} 项</span>
        {dynamic.length > 0 && (
          <button
            onClick={clearDynamicPlans}
            className="ml-auto text-[10px] text-fg-3 transition-colors hover:text-accent"
          >
            清空 PENDING ({dynamic.length})
          </button>
        )}
      </div>
      {groups.map((g) => (
        <AwGroup key={g.id} group={g} />
      ))}
    </div>
  );
}

function AwGroup({
  group,
}: {
  group: { id: string; title: string; subtitle: string; cards: AwCardType[] };
}) {
  const dotColor =
    group.id === "alert"
      ? "bg-warn"
      : group.id === "active"
      ? "bg-up"
      : "bg-info";
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="text-[12px] font-semibold text-fg-1">{group.title}</span>
        <span className="text-[10px] text-fg-3">· {group.cards.length}</span>
        <span className="text-[10px] text-fg-3">· {group.subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {group.cards.map((card, i) => (
          <AwCard key={`${group.id}-${i}`} card={card} />
        ))}
      </div>
    </div>
  );
}

function AwCard({ card }: { card: AwCardType }) {
  const statusColor =
    card.status === "warn"
      ? "border-warn/40 bg-warn/5"
      : card.status === "run"
      ? "border-info/30 bg-info/5"
      : "border-hairline-strong bg-bg-2";
  const statusDot =
    card.status === "warn"
      ? "bg-warn"
      : card.status === "run"
      ? "bg-info animate-pulse"
      : card.status === "paused"
      ? "bg-fg-3"
      : "bg-up";

  return (
    <div className={`flex flex-col gap-2 rounded-md border p-3 transition-colors ${statusColor}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${statusDot}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-fg-1">{card.title}</div>
          <div className="text-[11px] text-fg-2">{card.desc}</div>
        </div>
      </div>
      {card.kv && card.kv.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px]">
          {card.kv.map(([k, v]) => (
            <span key={k} className="text-fg-3">
              {k}
              <span className="num ml-1 text-fg-1">{v}</span>
            </span>
          ))}
        </div>
      )}
      {typeof card.progress === "number" && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-bg-3">
          <div
            className="h-full rounded-full bg-info"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      )}
      {card.actions && card.actions.length > 0 && (
        <div className="flex gap-1.5 pt-1">
          {card.actions.map((a, i) => (
            <button
              key={i}
              className={`rounded-sm px-2 py-1 text-[10.5px] font-medium transition-colors ${
                i === 0
                  ? "border border-hairline-strong bg-bg-1 text-fg-1 hover:bg-bg-3"
                  : "text-fg-3 hover:text-fg-1"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
