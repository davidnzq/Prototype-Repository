import Link from "next/link";
import { Store, Flame, Star, GitFork, Sparkles } from "lucide-react";
import { MOCK_STRATEGIES } from "@/mock/strategies";
import { ALL_LISTINGS } from "@/mock/strategiesMarketplace";
import { MOCK_SKILLS } from "@/mock/skills";

// IA Ch 5 · Marketplace · 生态入口
// 三个对象完全对称:Strategy / Sub-Agent / Skill
// 全部支持同一组动作:浏览 / 采纳(Strategy 订阅 · Sub-Agent/Skill 启用) / Fork / Rebase / Publish / 评分。
// 方法论多流派共存(信念四逻辑) · 基本面/技术/宏观/量化/数据源/复合 都是一等公民。

interface PageProps {
  searchParams: Promise<{ tab?: string; method?: string }>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tab = (sp.tab ?? "strategy") as "strategy" | "agent" | "skill";

  const strategyListings = ALL_LISTINGS.filter(
    (l) => l.kind === "official" || l.kind === "community" || l.kind === "composite"
  );
  const agentListings = ALL_LISTINGS.filter((l) => l.kind === "agent");

  return (
    <div className="mx-auto max-w-[1040px] px-8 py-8">
      <header className="mb-6 border-b border-hairline-strong pb-5">
        <div className="mb-2 flex items-center gap-2 text-accent">
          <Store size={14} />
          <span className="kicker">MARKETPLACE · 生态</span>
        </div>
        <h1 className="font-serif text-[32px] font-bold leading-[38px] tracking-[-0.02em]">
          方法论 · 专家 · 能力 的市场
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-[20px] text-fg-2">
          Bridge AI 不做封闭 alpha · 让<b>多流派共存</b>(信念四 · 方法论多元)。
          这里可以浏览和采纳三类对象 ——
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11.5px]">
          <span className="rounded-md border border-hairline-strong bg-bg-1 px-2.5 py-1">
            <b className="text-accent">Strategy</b> · 方法论(OMRs)· 订阅后参与决策
          </span>
          <span className="rounded-md border border-hairline-strong bg-bg-1 px-2.5 py-1">
            <b className="text-accent">Sub-Agent</b> · 第三方专家 · 启用后可在研究中 @ 调用
          </span>
          <span className="rounded-md border border-hairline-strong bg-bg-1 px-2.5 py-1">
            <b className="text-accent">Skill</b> · 最小能力单元 · 启用后 Agent 自动调度
          </span>
        </div>
      </header>

      {/* 三对象 tab · 完全对称 */}
      <nav className="mb-5 flex items-end gap-1 border-b border-hairline-strong">
        <TabLink
          href="/marketplace?tab=strategy"
          active={tab === "strategy"}
          label="Strategy · 方法论"
          count={strategyListings.length}
        />
        <TabLink
          href="/marketplace?tab=agent"
          active={tab === "agent"}
          label="Sub-Agent · 专家"
          count={agentListings.length}
        />
        <TabLink
          href="/marketplace?tab=skill"
          active={tab === "skill"}
          label="Skill · 能力"
          count={MOCK_SKILLS.length}
        />
      </nav>

      {tab === "strategy" && <StrategyBoard />}
      {tab === "agent" && <AgentBoard />}
      {tab === "skill" && <SkillBoard />}

      <section className="mt-8 rounded-md border border-dashed border-hairline-strong bg-bg-1 p-4">
        <div className="mb-1 flex items-center gap-1.5 text-accent">
          <Sparkles size={12} />
          <span className="caps">我也可以发布 · YOU CAN PUBLISH</span>
        </div>
        <p className="text-[12px] leading-[18px] text-fg-2">
          你 Fork 的 Strategy / Sub-Agent / Skill 可以沉淀 · 调优 · 发布到 Marketplace。社区采纳度反过来影响你的贡献者等级。方法论的市场机制 = 让最好的答案被社区验证。
        </p>
      </section>
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-4 py-2 text-[13px] font-semibold transition-colors ${
        active ? "text-fg-1" : "text-fg-3 hover:text-fg-1"
      }`}
    >
      <span>{label}</span>
      <span className="num rounded-xs bg-bg-2 px-1 py-0.5 text-[9px] font-bold text-fg-3">
        {count}
      </span>
      {active && (
        <span className="absolute inset-x-2 -bottom-[1px] h-0.5 bg-accent" />
      )}
    </Link>
  );
}

function StrategyBoard() {
  const strategyListings = ALL_LISTINGS.filter(
    (l) => l.kind === "official" || l.kind === "community" || l.kind === "composite"
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      {strategyListings.map((l) => {
        const strat = MOCK_STRATEGIES.find((s) => s.id === l.strategyId);
        return (
          <Link
            key={l.strategyId}
            href={`/strategy/${l.strategyId}`}
            className="block rounded-lg border border-hairline-strong bg-bg-1 p-4 hover:border-accent"
          >
            <div className="mb-2 flex items-center gap-2">
              <KindBadge kind={l.kind} />
              <MethodBadge method={l.method} />
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-fg-3">
                <Flame size={10} className="text-warn" /> {l.heat}
              </span>
            </div>
            <div className="mb-1 text-[15px] font-semibold">
              {strat?.nameZh ?? l.strategyId}
            </div>
            {strat && (
              <p className="line-clamp-2 text-[12px] leading-[17px] text-fg-2">
                {strat.slogan}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-[10px] text-fg-3">
              <span className="inline-flex items-center gap-1">
                <Star size={10} /> {l.subscribers.toLocaleString()} 订阅
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork size={10} /> {l.fork} Fork
              </span>
              <span className="ml-auto">{l.author}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function AgentBoard() {
  const agentListings = ALL_LISTINGS.filter((l) => l.kind === "agent");
  return (
    <div className="grid grid-cols-2 gap-3">
      {agentListings.map((l) => {
        const a = l as typeof l & { agentName?: string; capability?: string; io?: { input: string; output: string } };
        return (
          <div
            key={l.strategyId}
            className="flex flex-col rounded-lg border border-hairline-strong bg-bg-1 p-4 hover:border-accent"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-xs bg-bg-3 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-fg-2">
                SUB-AGENT
              </span>
              <MethodBadge method={l.method} />
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-fg-3">
                <Flame size={10} className="text-warn" /> {l.heat}
              </span>
            </div>
            <div className="mb-1 text-[15px] font-semibold">{a.agentName}</div>
            <p className="text-[12px] leading-[17px] text-fg-2">{a.capability}</p>
            {a.io && (
              <div className="mt-2 text-[10px] text-fg-3">
                <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                  in: {a.io.input}
                </span>
                <span className="mx-1">→</span>
                <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                  out: {a.io.output}
                </span>
              </div>
            )}
            <div className="mt-auto pt-3 flex items-center gap-3 text-[10px] text-fg-3">
              <span className="inline-flex items-center gap-1">
                <Star size={10} /> {l.subscribers.toLocaleString()} 启用
              </span>
              <span className="ml-auto">{l.author}</span>
              <button className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent/20">
                启用
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillBoard() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MOCK_SKILLS.map((sk) => {
        const selfBuilt = sk.category === "用户自建";
        return (
          <div
            key={sk.id}
            className={`flex flex-col rounded-lg border p-4 hover:border-accent ${
              selfBuilt
                ? "border-accent/40 bg-accent-soft/40"
                : "border-hairline-strong bg-bg-1"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
                  sk.category === "官方"
                    ? "bg-accent-soft text-accent"
                    : sk.category === "社区"
                    ? "bg-bg-3 text-fg-2"
                    : "bg-up-soft text-up-dark"
                }`}
              >
                {sk.category}
              </span>
              <MethodBadge method={sk.method} />
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-fg-3">
                <Flame size={10} className="text-warn" /> {sk.heat}
              </span>
            </div>
            <div className="mb-1 text-[15px] font-semibold">{sk.nameZh}</div>
            <p className="text-[12px] leading-[17px] text-fg-2">{sk.capability}</p>
            <div className="mt-2 text-[10px] text-fg-3">
              <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                in: {sk.io.input}
              </span>
              <span className="mx-1">→</span>
              <span className="rounded bg-bg-2 px-1.5 py-0.5 font-mono">
                out: {sk.io.output}
              </span>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-3 text-[10px] text-fg-3">
              <span className="inline-flex items-center gap-1">
                <Star size={10} /> {sk.enabled.toLocaleString()} 启用
              </span>
              {sk.fork > 0 && (
                <span className="inline-flex items-center gap-1">
                  <GitFork size={10} /> {sk.fork} Fork
                </span>
              )}
              <span className="ml-auto">{sk.author}</span>
              {!selfBuilt ? (
                <button className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent hover:bg-accent/20">
                  启用
                </button>
              ) : (
                <span className="rounded-md bg-up-soft px-2 py-0.5 text-[10px] font-semibold text-up-dark">
                  我的
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KindBadge({ kind }: { kind: string }) {
  const cls: Record<string, string> = {
    official: "bg-accent-soft text-accent",
    community: "bg-bg-3 text-fg-2",
    composite: "bg-warn/15 text-warn",
  };
  const label: Record<string, string> = {
    official: "官方",
    community: "社区",
    composite: "复合",
  };
  return (
    <span
      className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${cls[kind] ?? "bg-bg-2 text-fg-3"}`}
    >
      {label[kind] ?? kind}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className="rounded-xs bg-bg-2 px-1.5 py-0.5 text-[9px] font-semibold text-fg-2">
      {method}
    </span>
  );
}

