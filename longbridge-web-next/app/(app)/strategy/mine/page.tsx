import Link from "next/link";
import { ChevronLeft, GitFork, Bell, Star, Plus } from "lucide-react";
import { ALL_LISTINGS } from "@/mock/strategiesMarketplace";
import { MOCK_STRATEGIES } from "@/mock/strategies";
import { getSignalsByStrategy } from "@/mock/signals";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";

// Demo 用户订阅了 3 套 + fork 了 1 套
const SUBSCRIBED = ["strat-wood-innovation", "strat-simons-quant", "agent-earnings-analyzer"];
const FORKED = ["strat-soros-reflexivity"];
const PRIVATE = [
  {
    id: "private-ai-infra-custom",
    nameZh: "我的 AI 基建(私有)",
    slogan: "Wood 分叉 + 加入了 Wright 曲线权重",
    updatedAt: "2026-04-17",
  },
];

export default function StrategyMinePage() {
  const subscribed = SUBSCRIBED.map((id) => ALL_LISTINGS.find((l) => l.strategyId === id)).filter(
    (x): x is NonNullable<typeof x> => !!x
  );
  const forked = FORKED.map((id) => ALL_LISTINGS.find((l) => l.strategyId === id)).filter(
    (x): x is NonNullable<typeof x> => !!x
  );

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <nav className="mb-4 flex items-center gap-2 text-[11px] text-fg-3">
        <Link
          href="/strategy"
          className="hover:text-fg-1 inline-flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Strategy 广场
        </Link>
        <span>/</span>
        <span className="text-fg-2">我的策略</span>
      </nav>

      <header className="mb-6 border-b-2 border-fg-1 pb-5">
        <Kicker>MY STRATEGIES · 我的策略集合</Kicker>
        <h1 className="mt-1 font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          订阅 {subscribed.length} · Fork {forked.length} · 私有 {PRIVATE.length}
        </h1>
        <p className="mt-1 text-[12px] text-fg-3">
          订阅的策略会在你的 /insights 里用它的视角解读持仓和关注池。
        </p>
      </header>

      {/* KPIs */}
      <section className="mb-8 grid grid-cols-4 gap-3">
        <KPI label="总订阅" value={subscribed.length.toString()} />
        <KPI label="Fork" value={forked.length.toString()} />
        <KPI label="我的私有" value={PRIVATE.length.toString()} />
        <Link
          href="/strategy/builder"
          className="rounded-md border-2 border-accent bg-bg-1 p-3 hover:bg-bg-2"
        >
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-accent">
            <Plus size={10} /> NEW
          </div>
          <div className="mt-1 text-[14px] font-semibold">建一个新策略</div>
        </Link>
      </section>

      {/* Subscribed */}
      <SectionHeader kicker={`SUBSCRIBED · ${subscribed.length}`} />
      <section className="mb-8 space-y-2">
        {subscribed.map((l) => {
          const name =
            (l as typeof l & { nameZh?: string; agentName?: string }).nameZh ??
            (l as typeof l & { agentName?: string }).agentName ??
            MOCK_STRATEGIES.find((s) => s.id === l.strategyId)?.nameZh ??
            l.strategyId;
          const signalCount = getSignalsByStrategy(l.strategyId).length;
          return (
            <div
              key={l.strategyId}
              className="grid grid-cols-[2fr_80px_60px_80px_40px] items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/strategy/${l.strategyId}`}
                    className="text-[13px] font-semibold hover:text-accent"
                  >
                    {name}
                  </Link>
                  <span className="rounded-xs bg-bg-2 px-1 py-0.5 text-[9px] text-fg-2">
                    {l.method}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-fg-3">
                  by {l.author} · 更新 {new Date(l.updatedAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="text-center text-[10px]">
                <div className="num text-[14px] font-bold text-accent">
                  {signalCount}
                </div>
                <div className="text-fg-3">条 Signal</div>
              </div>
              <button
                type="button"
                title="通知已开启 · 新 Signal 会推送到右栏"
                className="inline-flex cursor-pointer items-center gap-0.5 rounded-xs bg-up-soft px-2 py-1 text-[10px] font-semibold text-up-dark"
              >
                <Bell size={10} /> 通知
              </button>
              <button
                type="button"
                title="Demo · 点击取消订阅"
                className="cursor-pointer rounded-xs border border-hairline-strong bg-bg-2 px-2 py-1 text-[10px] text-fg-2 hover:border-accent"
              >
                取消订阅
              </button>
              <Link
                href={`/strategy/${l.strategyId}`}
                className="text-center text-[12px] text-fg-3 hover:text-accent"
              >
                ›
              </Link>
            </div>
          );
        })}
      </section>

      {/* Forked */}
      {forked.length > 0 && (
        <>
          <SectionHeader kicker={`FORKED · ${forked.length} 套你可以改`} />
          <section className="mb-8 space-y-2">
            {forked.map((l) => {
              const name =
                MOCK_STRATEGIES.find((s) => s.id === l.strategyId)?.nameZh ??
                l.strategyId;
              return (
                <div
                  key={l.strategyId}
                  className="grid grid-cols-[2fr_100px_80px_40px] items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <GitFork size={12} className="text-accent" />
                      <Link
                        href={`/strategy/${l.strategyId}`}
                        className="text-[13px] font-semibold hover:text-accent"
                      >
                        {name}
                      </Link>
                    </div>
                    <div className="mt-0.5 text-[10px] text-fg-3">
                      Fork 自 {l.author} · 你有完整编辑权
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Demo · 打开 OMR 编辑界面"
                    className="cursor-pointer rounded-xs border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px] font-semibold text-fg-1 hover:border-accent"
                  >
                    编辑 OMR
                  </button>
                  <button
                    type="button"
                    title="Demo · 发布到 Strategy 广场"
                    className="cursor-pointer rounded-xs border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px] text-fg-2 hover:border-accent"
                  >
                    发布
                  </button>
                  <Link
                    href={`/strategy/${l.strategyId}`}
                    className="text-center text-[12px] text-fg-3 hover:text-accent"
                  >
                    ›
                  </Link>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* Private */}
      <SectionHeader kicker={`PRIVATE · ${PRIVATE.length} 套我的`} />
      <section className="mb-8 space-y-2">
        {PRIVATE.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[2fr_100px_80px_40px] items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <Star size={12} className="text-accent" />
                <span className="text-[13px] font-semibold">{p.nameZh}</span>
                <span className="rounded-xs bg-bg-2 px-1 py-0.5 text-[9px] text-fg-2">
                  私有
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-fg-3">
                {p.slogan} · 更新 {p.updatedAt}
              </div>
            </div>
            <button
              type="button"
              title="Demo · 打开私有策略编辑器"
              className="cursor-pointer rounded-xs border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px] font-semibold text-fg-1 hover:border-accent"
            >
              编辑 OMR
            </button>
            <button
              type="button"
              title="Demo · 发布私有策略到 Strategy 广场"
              className="cursor-pointer rounded-xs border border-hairline-strong bg-bg-1 px-2 py-1 text-[11px] text-fg-2 hover:border-accent"
            >
              发布到广场
            </button>
            <span className="text-center text-[12px] text-fg-3">›</span>
          </div>
        ))}
      </section>

      {/* Activity */}
      <SectionHeader kicker="ACTIVITY · 最近活动" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <ul className="space-y-3 text-[12px] leading-[18px]">
          <ActivityItem
            time="2h"
            text="Wood 创新策略 在 MSFT 上给出新的 HIGH Signal"
            link="/insight/sig-msft-wood"
            linkLabel="查看"
          />
          <ActivityItem
            time="1d"
            text="你 Fork 了 Soros 反身性策略"
            link="/strategy/strat-soros-reflexivity"
            linkLabel="进入"
          />
          <ActivityItem
            time="2d"
            text="Earnings Analyzer 分析完 MSFT Q3 财报"
            link="/insight/cat-msft-earnings-q3"
            linkLabel="查看"
          />
          <ActivityItem
            time="3d"
            text="Simons 量化策略 在 TSLA 上给出共振信号"
            link="/insight/sig-tsla-simons"
            linkLabel="查看"
          />
        </ul>
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        {subscribed.length} 套订阅 + {forked.length} 套 Fork + {PRIVATE.length} 套私有 · 共 {subscribed.length + forked.length + PRIVATE.length} 个视角
      </footer>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
        {label}
      </div>
      <div className="num mt-1 text-[20px] font-bold">{value}</div>
    </div>
  );
}

function ActivityItem({
  time,
  text,
  link,
  linkLabel,
}: {
  time: string;
  text: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="num mt-0.5 w-8 shrink-0 text-right text-[10px] text-fg-3">
        {time}
      </span>
      <span className="flex-1 text-fg-1">{text}</span>
      <Link
        href={link}
        className="shrink-0 text-[11px] font-semibold text-accent hover:underline"
      >
        {linkLabel} →
      </Link>
    </li>
  );
}
