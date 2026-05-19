import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Kicker } from "@/components/gallery/primitives";
import { SectionHeader } from "@/components/gallery/shared";
import { MOCK_STRATEGIES } from "@/mock/strategies";

export default function StrategyBuilderPage() {
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
        <span className="text-fg-2">Builder</span>
      </nav>

      <header className="mb-8 border-b-2 border-fg-1 pb-5">
        <Kicker>STRATEGY · BUILDER</Kicker>
        <h1 className="mt-1 font-serif text-[36px] leading-[42px] font-bold tracking-[-0.025em]">
          把投资信念变成一套 Strategy
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-[21px] text-fg-2">
          给 AI 说清楚你的<strong>投资信念</strong>,AI 会帮你拆成 OMR(Objective / Alpha Model / Rules)。
          你可以随时微调,最终得到一套可回测、可订阅、可分享的策略。
        </p>
      </header>

      {/* 4-step flow */}
      <SectionHeader kicker="FLOW · 4 步骤" />
      <section className="mb-8 grid grid-cols-4 gap-3">
        <FlowCard
          num="01"
          title="投资信念"
          desc="用一句话说清楚你要做什么(e.g. 『AI 基建赛道 + Wright 成本曲线 + 5 年期』)。"
          active
        />
        <FlowCard
          num="02"
          title="拆 OMR"
          desc="AI 帮你拆成 Objective(范围 / 目标) · Model(因子 + 权重) · Rules(入场 / 退出 / 仓位)。"
        />
        <FlowCard num="03" title="回测 & 校准" desc="AI 跑历史数据 + 你微调权重。看夏普 · 回撤 · 命中率。" />
        <FlowCard num="04" title="发布 / 私有" desc="发布到 Strategy 广场(默认)或保留为私有 Agent。" />
      </section>

      {/* Belief input */}
      <SectionHeader kicker="STEP 1 · 投资信念" />
      <section className="mb-8 rounded-lg border-2 border-accent bg-bg-1 p-5">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-2">
          你的一句话信念
        </label>
        <textarea
          placeholder="例:AI 基建赛道 + Wright 成本曲线 + 5 年期 · 容忍高波动 · 组合集中度 5-7 只"
          className="w-full resize-none rounded-md border border-hairline-strong bg-bg-2 p-3 text-[13px] leading-[20px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:ring-1 focus:ring-accent"
          rows={3}
          disabled
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled
            title="Demo · 请在右侧 Chat 里向 AI 说出你的信念,走完整 Builder 流程"
            className="inline-flex cursor-not-allowed items-center gap-1 rounded-md bg-accent/60 px-4 py-2 text-[13px] font-semibold text-white"
          >
            <Sparkles size={14} /> 让 AI 拆 OMR
          </button>
          <span className="text-[10px] text-fg-3">
            Demo 预览 · 请在右侧 Chat 里说你的信念,AI 会走完整流程
          </span>
        </div>
      </section>

      {/* Templates */}
      <SectionHeader kicker="OR · 从模板开始" />
      <section className="mb-8 grid grid-cols-2 gap-3">
        {MOCK_STRATEGIES.map((s) => (
          <Link
            key={s.id}
            href={`/strategy/${s.id}`}
            className="block rounded-md border border-hairline-strong bg-bg-1 p-3 hover:border-accent"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="caps text-accent">{s.nameZh}</span>
              <span className="text-[9px] text-fg-3">· {s.name}</span>
              <ArrowRight size={12} className="ml-auto text-fg-3" />
            </div>
            <p className="line-clamp-2 text-[11px] leading-[16px] text-fg-2">
              {s.slogan}
            </p>
            <div className="mt-2 text-[10px] text-fg-3">
              Fork 后再改 → 得到你的版本
            </div>
          </Link>
        ))}
      </section>

      {/* Example preview */}
      <SectionHeader kicker="EXAMPLE · AI 拆 OMR 预览" />
      <section className="mb-8 rounded-lg border border-hairline-strong bg-bg-1 p-4">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-fg-3">
          <Sparkles size={10} className="text-accent" />
          <span>AI 从「AI 基建 + Wright 曲线 + 5 年期」拆出</span>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-hairline-strong pt-3 text-[12px] leading-[17px]">
          <div>
            <div className="kicker mb-1 text-accent">O · OBJECTIVE</div>
            <ul className="space-y-1 text-fg-1">
              <li>• 范围:US 半导体 + 云 + 基建 10-15 只</li>
              <li>• 目标:5 年 CAGR ≥ 20%,容忍单年 -30%</li>
              <li>• 频率:季度再评估</li>
            </ul>
          </div>
          <div>
            <div className="kicker mb-1 text-accent">M · MODEL</div>
            <ul className="space-y-1 text-fg-1">
              <li>• TAM 扩张(30%)</li>
              <li>• Wright 成本曲线(25%)</li>
              <li>• 营收 CAGR(25%)</li>
              <li>• 渠道锁定度(20%)</li>
            </ul>
          </div>
          <div>
            <div className="kicker mb-1 text-accent">R · RULES</div>
            <ul className="space-y-1 text-fg-1">
              <li>• 入场:3 批建仓,每次 33%</li>
              <li>• 退出:TAM 收缩或被 Wright 曲线破坏</li>
              <li>• 仓位:HIGH=18% · MEDIUM=10%</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-bg-2 px-3 py-2 text-[11px] text-fg-2">
          <CheckCircle2 size={12} className="text-up-dark" />
          拆好后会跳到回测 / 校准页;每一项你都能调。
        </div>
      </section>

      <footer className="border-t border-hairline-strong pt-4 text-[10px] leading-[16px] text-fg-3">
        这是一个 Demo 预览 · 实际产品里 Builder 是完整的三步向导流
      </footer>
    </div>
  );
}

function FlowCard({
  num,
  title,
  desc,
  active = false,
}: {
  num: string;
  title: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        active ? "border-accent bg-bg-1" : "border-hairline-strong bg-bg-1"
      }`}
    >
      <div className="mb-1 flex items-center gap-1">
        {active ? (
          <Circle size={12} className="fill-accent text-accent" />
        ) : (
          <Circle size={12} className="text-fg-3" />
        )}
        <span className="num text-[10px] font-bold text-accent">{num}</span>
      </div>
      <div className="text-[13px] font-semibold">{title}</div>
      <p className="mt-1 text-[10px] leading-[14px] text-fg-3">{desc}</p>
    </div>
  );
}
