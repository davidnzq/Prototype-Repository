import Link from "next/link";
import { Sparkles, RefreshCw } from "lucide-react";
import { MOCK_PORTRAITS } from "@/mock/portraits";
import { MOCK_USER } from "@/mock/portfolio";
import type { Portrait } from "@/types/domain";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";

const DIMENSIONS: { key: keyof Portrait; label: string }[] = [
  { key: "riskTolerance", label: "风险承受" },
  { key: "expectedReturn", label: "预期收益" },
  { key: "decisionMethod", label: "决策方式" },
  { key: "decisionBasis", label: "决策依据" },
  { key: "timeHorizon", label: "时间维度" },
  { key: "learningWillingness", label: "学习意愿" },
];

export default function PortraitPage() {
  const current =
    MOCK_PORTRAITS.find((p) => p.role === MOCK_USER.portraitRole) ??
    MOCK_PORTRAITS[0];

  const others = MOCK_PORTRAITS.filter((p) => p.role !== current.role);

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <header className="mb-6 border-b-2 border-fg-1 pb-5">
        <Kicker>KNOW YOURSELF · 我的画像</Kicker>
        <h1 className="mt-1 font-serif text-[36px] leading-[42px] font-bold tracking-[-0.025em]">
          {current.roleZh} · {current.role}
        </h1>
        <p className="mt-2 text-[14px] leading-[20px] text-fg-2">
          {current.tagline}
        </p>
        <div className="mt-2 text-[12px] text-fg-3">
          代表人物 · {current.representative}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            title="Demo · 右侧 Chat 里说「重做画像测评」走 5 题引导"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border-2 border-accent bg-bg-1 px-3 py-1.5 text-[12px] font-semibold text-accent hover:bg-bg-2"
          >
            <RefreshCw size={12} /> 重做测评
          </button>
          <button
            type="button"
            title="Demo · AI 会基于近 N 笔交易重新校准画像"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-hairline-strong bg-bg-1 px-3 py-1.5 text-[12px] text-fg-1 hover:border-accent"
          >
            <Sparkles size={12} /> 校准画像
          </button>
          <span className="ml-auto text-[10px] text-fg-3">
            画像会影响 Signal 解读 / 策略推荐 / 仓位建议
          </span>
        </div>
      </header>

      {/* Six dimensions radar */}
      <SectionHeader kicker="SIX DIMENSIONS · 六维评分" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <div className="space-y-3">
          {DIMENSIONS.map((d) => {
            const value = current[d.key] as number;
            return (
              <div key={d.key} className="grid grid-cols-[110px_1fr_30px] items-center gap-3">
                <span className="text-[12px] text-fg-1">{d.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-2.5 flex-1 rounded-sm ${
                        i <= value ? "bg-accent" : "bg-bg-2"
                      }`}
                    />
                  ))}
                </div>
                <span className="num text-right text-[12px] font-bold">
                  {value}/5
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How this affects AI */}
      <SectionHeader kicker="IMPACT · 画像如何影响 AI 行为" />
      <section className="mb-8 grid grid-cols-2 gap-3">
        {impactForRole(current.role, current.roleZh).map((c, i) => (
          <ImpactCard key={i} title={c.title} body={c.body} />
        ))}
      </section>

      {/* Compare with others */}
      <SectionHeader kicker="COMPARE · 其它 7 个画像" />
      <section className="mb-8 grid grid-cols-2 gap-3">
        {others.map((p) => (
          <div
            key={p.role}
            className="rounded-md border border-hairline-strong bg-bg-1 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="caps text-accent">{p.roleZh}</span>
              <span className="text-[10px] text-fg-3">· {p.role}</span>
              <span className="ml-auto text-[10px] text-fg-3">{p.representative}</span>
            </div>
            <p className="mb-2 line-clamp-2 text-[11px] leading-[16px] text-fg-2">
              {p.tagline}
            </p>
            <div className="grid grid-cols-6 gap-1">
              {DIMENSIONS.map((d) => {
                const v = p[d.key] as number;
                return (
                  <div key={d.key} className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-fg-3">{d.label.slice(0, 2)}</span>
                    <span className="num text-[10px] font-bold">
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Methodology */}
      <SectionHeader kicker="METHODOLOGY · 这些画像怎么来的" />
      <section className="mb-8 rounded-md border-l-4 border-accent bg-bg-1 p-4">
        <p className="text-[13px] leading-[20px] text-fg-1">
          <strong>8 个画像</strong>来自 KnowYourself 五题引导 + 历史持仓 + 交易行为聚类。
          每个画像对应一位真实投资家的风格(如 Buffett / Wood / Soros),
          而不是工业界常用的「激进/稳健/保守」三分法 —— 后者过于粗糙,
          不能匹配到「Wood 式颠覆创新 vs Buffett 式价值投资」这种在实操中截然不同的路径。
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-bg-2 px-3 py-2 text-[11px] text-fg-2">
          💡 画像会随你的行为漂移而更新(每季度重评一次),或你可以主动 <Link href="#" className="text-accent hover:underline">重做测评</Link>。
        </div>
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        Demo 用户画像 · {MOCK_USER.displayName} · 更新于 Mock
      </footer>
    </div>
  );
}

function ImpactCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-hairline-strong bg-bg-1 p-4">
      <div className="kicker mb-2 text-accent">{title}</div>
      <p className="text-[12px] leading-[18px] text-fg-1">{body}</p>
    </div>
  );
}

// Per-role copy for how画像 shapes AI behavior.
function impactForRole(
  role: string,
  roleZh: string
): { title: string; body: string }[] {
  const matchedStrategies =
    role === "Pioneer"
      ? "Wood 创新 · Soros 反身性"
      : role === "Appraiser"
      ? "Buffett 价值 · Lynch 成长价值"
      : role === "Navigator" || role === "Maverick"
      ? "Soros 反身性 · Jones 趋势"
      : role === "Arbitrageur" || role === "Architect"
      ? "Simons 量化 · Dalio 全天候"
      : role === "Keeper" || role === "Protector"
      ? "Bogle 指数 · Dreman 逆向"
      : "与你画像高匹配的策略";

  const sizingCap =
    role === "Pioneer" || role === "Maverick"
      ? "单票上限 15-18%"
      : role === "Navigator" || role === "Arbitrageur"
      ? "单票上限 10-12%"
      : role === "Appraiser" || role === "Architect"
      ? "单票上限 8-10%"
      : "单票上限 5-7%";

  const reviewBias =
    role === "Pioneer"
      ? "先驱者提前止盈会被识别为「偏离画像」—— 你的历史数据显示,持有到目标位的收益比提前止盈平均高 +4%"
      : role === "Appraiser"
      ? "鉴宝师若在折价不足时入场,AI 会在 Review 中标红:违背安全边际是你画像里最关键的纪律"
      : role === "Navigator" || role === "Maverick"
      ? "领航者 / 独行侠 若在趋势反转信号触发后仍加仓,AI 会标「逆势操作」"
      : role === "Arbitrageur" || role === "Architect"
      ? "价差猎手 / 架构师 偏离仓位边界会被额外高亮 —— 纪律性是你画像的核心"
      : "守卫者 / 稳本者 过度承担风险会被识别为「偏离画像」";

  return [
    {
      title: "Signal 解读",
      body: `同一条 Signal,AI 会按「${roleZh}」的偏好解读。低 conviction 或风险不对称的判断会被降级或过滤,避免与你的风险偏好冲突。`,
    },
    {
      title: "策略推荐",
      body: `Strategy 广场默认按你的画像排序。与「${roleZh}」匹配度高的(如 ${matchedStrategies})会优先露出。`,
    },
    {
      title: "仓位建议",
      body: `Plan 的 HIGH/MEDIUM/LOW 仓位映射按你的风险承受调整 —— 作为「${roleZh}」,${sizingCap}。`,
    },
    {
      title: "Review 归因",
      body: `复盘时 AI 会对照你的画像识别「偏离模式」。${reviewBias}。`,
    },
  ];
}
