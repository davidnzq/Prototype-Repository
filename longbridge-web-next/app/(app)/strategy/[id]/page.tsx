import Link from "next/link";
import { ChevronLeft, Users, GitFork, Flame, Plus, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { MOCK_STRATEGIES } from "@/mock/strategies";
import { getListing, getSubAgent, getCommunityStrategy } from "@/mock/strategiesMarketplace";
import { getSignalsByStrategy } from "@/mock/signals";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader, SignalRow } from "@/components/gallery/shared";

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const official = MOCK_STRATEGIES.find((s) => s.id === id);
  const community = getCommunityStrategy(id);
  const agent = getSubAgent(id);

  const coreName =
    official?.nameZh ??
    community?.nameZh ??
    agent?.agentName ??
    id;

  const signals = getSignalsByStrategy(id);

  const kindLabel =
    listing.kind === "official"
      ? "官方"
      : listing.kind === "community"
      ? "社区"
      : listing.kind === "agent"
      ? "Sub-Agent"
      : "复合";

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
        <span className="text-fg-2">{coreName}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 border-b-2 border-fg-1 pb-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Kicker>STRATEGY</Kicker>
          <span
            className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${
              listing.kind === "official"
                ? "bg-accent/10 text-accent"
                : listing.kind === "community"
                ? "bg-bg-2 text-fg-2"
                : "bg-warn/15 text-warn"
            }`}
          >
            {kindLabel}
          </span>
          <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-semibold text-fg-2">
            {listing.method}
          </span>
          {listing.tags.map((t) => (
            <span
              key={t}
              className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] text-fg-2"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-[40px] leading-[46px] font-bold tracking-[-0.025em]">
          {coreName}
        </h1>
        {(official?.slogan ?? community?.slogan ?? agent?.capability) && (
          <p className="mt-2 text-[14px] leading-[21px] text-fg-2">
            {official?.slogan ?? community?.slogan ?? agent?.capability}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-fg-3">
          <span>by {listing.author}</span>
          <span>· 更新 {new Date(listing.updatedAt).toLocaleDateString("zh-CN")}</span>
        </div>

        {/* Action bar */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            title="Demo · 可在右侧 Chat 里「订阅 X 策略」触发"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90"
          >
            <Plus size={12} /> 订阅
          </button>
          <button
            type="button"
            title="Demo · Fork 后可在 /strategy/builder 编辑"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] font-semibold text-fg-1 hover:border-accent"
          >
            <GitFork size={12} /> Fork
          </button>
          <button
            type="button"
            title="Demo · 在右侧 Chat 里说「用这个策略跑 MSFT」"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] font-semibold text-fg-1 hover:border-accent"
          >
            跑一只股
          </button>
          <button
            type="button"
            title="Demo · 分享链接已复制(stub)"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] text-fg-2 hover:border-accent"
          >
            <Share2 size={12} /> 分享
          </button>
          <div className="ml-auto flex items-center gap-4 text-[11px] text-fg-3">
            <span className="inline-flex items-center gap-0.5">
              <Users size={12} /> {(listing.subscribers / 1000).toFixed(1)}k
            </span>
            {listing.fork > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <GitFork size={12} /> {listing.fork}
              </span>
            )}
            <span className="inline-flex items-center gap-0.5">
              <Flame size={12} /> {listing.heat}
            </span>
          </div>
        </div>
      </header>

      {/* Philosophy */}
      {(official?.philosophy ?? community?.philosophy) && (
        <>
          <SectionHeader kicker="PHILOSOPHY · 投资哲学" />
          <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
            <p className="text-[13px] leading-[21px] text-fg-1">
              {official?.philosophy ?? community?.philosophy}
            </p>
          </section>
        </>
      )}

      {/* OMR breakdown */}
      {official && (
        <>
          <SectionHeader kicker="OMR · Objective / Model / Rules" />
          <section className="mb-8 grid grid-cols-3 gap-3">
            {/* O */}
            <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
              <div className="kicker mb-2 text-accent">O · OBJECTIVE</div>
              <div className="space-y-2 text-[12px] leading-[18px]">
                <div>
                  <span className="text-fg-3">范围 </span>
                  <span className="font-semibold">{official.objective.universe.join(" · ")}</span>
                </div>
                <div>
                  <span className="text-fg-3">目标 </span>
                  <span>{official.objective.goal}</span>
                </div>
                <div>
                  <span className="text-fg-3">频率 </span>
                  <span>{official.objective.frequency}</span>
                </div>
                <div>
                  <span className="text-fg-3">风险预算 </span>
                  <span>{official.objective.riskBudget}</span>
                </div>
              </div>
            </div>

            {/* M */}
            <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
              <div className="kicker mb-2 text-accent">M · MODEL</div>
              <div className="mb-2 text-[10px] text-fg-3">
                Checklist {official.model.checklistSize} 项 · {official.model.factors.length} 个核心因子
              </div>
              <div className="space-y-1.5">
                {official.model.factors.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 shrink-0 rounded-xs bg-bg-2 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.05em] text-fg-2">
                      {f.group}
                    </span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="num font-bold text-accent">
                      {(f.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* R */}
            <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
              <div className="kicker mb-2 text-accent">R · RULES</div>
              <div className="space-y-2 text-[11px] leading-[16px]">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.08em] text-fg-3">
                    入场
                  </span>
                  <span className="text-fg-1">{official.rules.entry}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.08em] text-fg-3">
                    退出
                  </span>
                  <span className="text-fg-1">{official.rules.exit}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.08em] text-fg-3">
                    仓位
                  </span>
                  <span className="text-fg-1">{official.rules.sizing}</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Sub-Agent IO */}
      {agent && (
        <>
          <SectionHeader kicker="AGENT · I/O" />
          <section className="mb-8 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
              <div className="kicker mb-2 text-accent">INPUT</div>
              <p className="text-[13px] text-fg-1">{agent.io.input}</p>
            </div>
            <div className="rounded-lg border border-hairline-strong bg-bg-1 p-4">
              <div className="kicker mb-2 text-accent">OUTPUT</div>
              <p className="text-[13px] text-fg-1">{agent.io.output}</p>
            </div>
          </section>
          <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
            <div className="kicker mb-1 text-accent">CAPABILITY · 能力</div>
            <p className="text-[13px] leading-[20px] text-fg-1">{agent.capability}</p>
          </section>
        </>
      )}

      {/* Community strategy — simplified summary */}
      {community && !official && (
        <>
          <SectionHeader kicker="APPROACH · 方法大纲" />
          <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
            <p className="text-[13px] leading-[21px] text-fg-1">
              {community.philosophy}
            </p>
            <div className="mt-3 rounded-md bg-bg-2 px-3 py-2 text-[11px] text-fg-2">
              💡 社区策略没有完整的 OMR 定义,订阅后可以在 Builder 里查看作者分享的规则细节。
            </div>
          </section>
        </>
      )}

      {/* Live signals from this strategy */}
      <SectionHeader
        kicker={`LIVE SIGNALS · ${signals.length} 条近期判断`}
        linkHref="/insights"
        linkLabel="全部 →"
      />
      {signals.length > 0 ? (
        <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1">
          <div className="divide-y divide-hairline-strong">
            {signals.map((s) => (
              <SignalRow key={s.id} s={s} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-2 p-6 text-center">
          <div className="text-[13px] font-semibold text-fg-2">
            该策略尚未对 Demo 覆盖标的产出 Signal
          </div>
          <p className="mt-1 text-[11px] text-fg-3">
            {listing.kind === "community"
              ? "社区策略需要作者提供完整 OMR 后才能自动跑出 Signal。订阅后会在新 Signal 触发时通知。"
              : "订阅后,这套策略会在新触发时推送 Signal 到你的 /insights。"}
          </p>
        </section>
      )}

      {/* Stats */}
      <SectionHeader kicker="STATS · 指标" />
      <section className="mb-8 grid grid-cols-4 gap-3">
        <Stat
          label="订阅数"
          value={`${listing.subscribers.toLocaleString()}`}
        />
        <Stat
          label="Fork"
          value={listing.fork.toString()}
        />
        <Stat label="热度" value={listing.heat.toString()} />
        <Stat
          label="平均 Conviction"
          value={listing.avgConviction ? listing.avgConviction.toString() : "—"}
        />
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        发布:{new Date(listing.publishedAt).toLocaleDateString("zh-CN")} · 更新:{new Date(listing.updatedAt).toLocaleDateString("zh-CN")}
        <br />
        订阅后,这套策略会在 /insights 里用它的视角解读你关注的股票。
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-3">
      <div className="text-[10px] uppercase tracking-[0.08em] text-fg-3">
        {label}
      </div>
      <div className="num mt-1 text-[18px] font-bold">{value}</div>
    </div>
  );
}
