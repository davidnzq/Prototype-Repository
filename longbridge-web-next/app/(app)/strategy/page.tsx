import Link from "next/link";
import { Users, GitFork, Flame, Sparkles } from "lucide-react";
import { ALL_LISTINGS } from "@/mock/strategiesMarketplace";
import { MOCK_STRATEGIES } from "@/mock/strategies";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";

export default function StrategyMarketplacePage() {
  const official = ALL_LISTINGS.filter((l) => l.kind === "official");
  const community = ALL_LISTINGS.filter((l) => l.kind === "community");
  const agents = ALL_LISTINGS.filter((l) => l.kind === "agent");

  // Trending Top 3:混排所有 kind,但避免跟 Official 列表视觉重叠 →
  // 优先露出非 official(社区 / agent)的高热度,官方只保留 1 个最热的代表。
  const sortedAll = [...ALL_LISTINGS].sort((a, b) => b.heat - a.heat);
  const hottest: typeof ALL_LISTINGS = [];
  let officialTaken = 0;
  for (const l of sortedAll) {
    if (hottest.length >= 3) break;
    if (l.kind === "official") {
      if (officialTaken >= 1) continue;
      officialTaken++;
    }
    hottest.push(l);
  }

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <header className="mb-6">
        <Kicker>STRATEGY 广场</Kicker>
        <h1 className="mt-1 font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          用什么方法去看市场
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          官方 + 社区 + Sub-Agent · 同一只股在不同策略下可能给出相反判断,
          这是 feature。Strategy 广场是开放平台,任何用户可以 fork / 发布自己的 OMR。
        </p>
      </header>

      {/* Quick nav */}
      <section className="mb-8 grid grid-cols-3 gap-3">
        <Link
          href="/strategy/mine"
          className="rounded-md border border-hairline-strong bg-bg-1 p-4 hover:border-accent"
        >
          <Users size={16} className="text-accent" />
          <div className="mt-2 text-[14px] font-semibold">我的策略</div>
          <div className="mt-0.5 text-[11px] text-fg-3">订阅 / Fork / 私有</div>
        </Link>
        <Link
          href="/strategy/builder"
          className="rounded-md border-2 border-accent bg-bg-1 p-4 hover:bg-bg-2"
        >
          <Sparkles size={16} className="text-accent" />
          <div className="mt-2 text-[14px] font-semibold">建一个新策略</div>
          <div className="mt-0.5 text-[11px] text-fg-3">
            输入投资信念 · AI 帮你拆 OMR
          </div>
        </Link>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-4">
          <Flame size={16} className="text-accent" />
          <div className="mt-2 text-[14px] font-semibold">
            {ALL_LISTINGS.length} 套可用
          </div>
          <div className="mt-0.5 text-[11px] text-fg-3">
            官方 {official.length} · 社区 {community.length} · Agent {agents.length}
          </div>
        </div>
      </section>

      {/* Hot */}
      <SectionHeader kicker="TRENDING · 近 7 日热度 Top 3" />
      <section className="mb-8 grid grid-cols-3 gap-3">
        {hottest.map((l) => (
          <StrategyCard key={l.strategyId} listing={l} />
        ))}
      </section>

      {/* Official */}
      <SectionHeader kicker={`OFFICIAL · ${official.length} 套`} />
      <section className="mb-8 grid grid-cols-2 gap-3">
        {official.map((l) => {
          const s = MOCK_STRATEGIES.find((x) => x.id === l.strategyId);
          return (
            <StrategyCard
              key={l.strategyId}
              listing={l}
              nameOverride={s?.nameZh}
              slogan={s?.slogan}
            />
          );
        })}
      </section>

      {/* Community */}
      <SectionHeader
        kicker={`COMMUNITY · ${community.length} 套社区策略`}
        linkHref="/strategy/builder"
        linkLabel="发布你的 →"
      />
      <section className="mb-8 space-y-2">
        {community.map((l) => (
          <StrategyRow key={l.strategyId} listing={l} />
        ))}
      </section>

      {/* Sub-Agents */}
      <SectionHeader kicker={`SUB-AGENTS · ${agents.length} 个专业 Agent`} />
      <section className="mb-8 grid grid-cols-3 gap-3">
        {agents.map((l) => (
          <StrategyCard key={l.strategyId} listing={l} />
        ))}
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        Strategy = OMR(Objective / Alpha Model / Rules)。订阅的策略会在你的 /insights 里用新视角解读持仓和关注池。
      </footer>
    </div>
  );
}

function StrategyCard({
  listing: l,
  slogan,
  nameOverride,
}: {
  listing: (typeof ALL_LISTINGS)[number];
  slogan?: string;
  nameOverride?: string;
}) {
  const kindLabel =
    l.kind === "official"
      ? "官方"
      : l.kind === "community"
      ? "社区"
      : l.kind === "agent"
      ? "Agent"
      : "复合";
  const kindCls =
    l.kind === "official"
      ? "bg-accent/10 text-accent"
      : l.kind === "community"
      ? "bg-bg-2 text-fg-2"
      : l.kind === "agent"
      ? "bg-warn/15 text-warn"
      : "bg-bg-3 text-fg-2";
  const asAny = l as typeof l & {
    nameZh?: string;
    agentName?: string;
    slogan?: string;
    capability?: string;
  };
  const name =
    nameOverride ??
    asAny.nameZh ??
    asAny.agentName ??
    MOCK_STRATEGIES.find((s) => s.id === l.strategyId)?.nameZh ??
    l.strategyId;
  const tagline = slogan ?? asAny.slogan ?? asAny.capability;
  return (
    <Link
      href={`/strategy/${l.strategyId}`}
      className="block rounded-lg border border-hairline-strong bg-bg-1 p-4 hover:border-accent"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold ${kindCls}`}
        >
          {kindLabel}
        </span>
        <span className="text-[9px] uppercase tracking-[0.08em] text-fg-3">
          {l.method}
        </span>
        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-fg-3">
          <Flame size={10} />
          {l.heat}
        </span>
      </div>
      <div className="font-serif text-[18px] leading-[22px] font-bold">{name}</div>
      {tagline && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-[16px] text-fg-2">
          {tagline}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3 border-t border-hairline-strong pt-2 text-[10px] text-fg-3">
        <span className="inline-flex items-center gap-0.5">
          <Users size={10} /> {(l.subscribers / 1000).toFixed(1)}k
        </span>
        {l.fork > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <GitFork size={10} /> {l.fork}
          </span>
        )}
        <span className="ml-auto">by {l.author}</span>
      </div>
    </Link>
  );
}

function StrategyRow({
  listing: l,
}: {
  listing: (typeof ALL_LISTINGS)[number];
}) {
  const asAny = l as typeof l & { nameZh?: string; agentName?: string };
  const name = asAny.nameZh ?? asAny.agentName ?? l.strategyId;
  return (
    <Link
      href={`/strategy/${l.strategyId}`}
      className="grid grid-cols-[2fr_80px_80px_80px_60px_40px] items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-4 py-3 hover:bg-bg-2"
    >
      <div>
        <div className="text-[13px] font-semibold">{name}</div>
        <div className="mt-0.5 text-[10px] text-fg-3">
          {l.author} · 更新 {new Date(l.updatedAt).toLocaleDateString("zh-CN")}
        </div>
      </div>
      <div className="text-[10px] text-fg-2">{l.method}</div>
      <div className="num text-right text-[11px] font-bold">
        <Users size={10} className="inline" /> {(l.subscribers / 1000).toFixed(1)}k
      </div>
      <div className="num text-right text-[11px]">
        <GitFork size={10} className="inline" /> {l.fork}
      </div>
      <div className="text-right text-[11px] font-bold text-accent">
        <Flame size={10} className="inline" /> {l.heat}
      </div>
      <div className="text-right text-[12px] text-fg-3">›</div>
    </Link>
  );
}
