"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  TrendingUp,
  FileText,
  Target,
  Brain,
} from "lucide-react";
import { DEMO_UNIVERSE } from "@/lib/universe";
import { MOCK_THESES } from "@/mock/theses";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";
import { MOCK_STRATEGIES } from "@/mock/strategies";

// IA 3 · 市场 · 搜索
// 统一入口 · 跨对象搜索(股票 · Thesis · Plan · Strategy)。

export default function SearchPage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const match = (s: string) => term.length === 0 || s.toLowerCase().includes(term);

  const stocks = DEMO_UNIVERSE.filter(
    (s) => match(s.symbol) || match(s.nameZh) || match(s.sector)
  );
  const theses = MOCK_THESES.filter((t) => match(t.title) || match(t.company));
  const plans = MOCK_TRADE_PLANS.filter((p) => match(p.symbol));
  const strategies = MOCK_STRATEGIES.filter(
    (s) => match(s.nameZh) || match(s.name) || match(s.slogan)
  );

  const groups: {
    label: string;
    icon: typeof SearchIcon;
    items: { key: string; href: string; title: string; sub?: string }[];
  }[] = [
    {
      label: `股票 · ${stocks.length}`,
      icon: TrendingUp,
      items: stocks.slice(0, 6).map((s) => ({
        key: s.symbol,
        href: `?peek=${s.symbol}`,
        title: s.nameZh,
        sub: `${s.symbol.split(".")[0]} · ${s.sector}`,
      })),
    },
    {
      label: `Thesis · ${theses.length}`,
      icon: FileText,
      items: theses.map((t) => ({
        key: t.id,
        href: `/thesis/${t.id}?state=research`,
        title: t.title,
        sub: `${t.company} · v${t.version}`,
      })),
    },
    {
      label: `Plan · ${plans.length}`,
      icon: Target,
      items: plans.map((p) => ({
        key: p.id,
        href: `/plan/${p.id}`,
        title: `${p.symbol.split(".")[0]} · ${p.targetPlan.action}`,
        sub: `${p.status} · ${p.targetPlan.window}`,
      })),
    },
    {
      label: `Strategy · ${strategies.length}`,
      icon: Brain,
      items: strategies.map((s) => ({
        key: s.id,
        href: `/strategy/${s.id}`,
        title: s.nameZh,
        sub: s.slogan,
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[840px] px-8 py-8">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-accent">
          <SearchIcon size={14} />
          <span className="kicker">SEARCH · 搜索</span>
        </div>
        <h1 className="font-serif text-[28px] font-bold leading-[34px] tracking-[-0.02em]">
          跨对象搜索
        </h1>
        <p className="mt-1 text-[12px] text-fg-3">
          股票 · Thesis · Plan · Strategy —— 一个框搜全部。
        </p>
      </header>

      <div className="mb-6">
        <label className="flex items-center gap-2 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2.5 focus-within:border-accent">
          <SearchIcon size={14} className="text-fg-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入股票代码 / 名称 / Thesis / Strategy ..."
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-fg-3"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="rounded-md px-1.5 py-0.5 text-[11px] text-fg-3 hover:text-fg-1"
            >
              清除
            </button>
          )}
        </label>
      </div>

      <div className="space-y-6">
        {groups.map((g) => {
          if (g.items.length === 0) return null;
          const Icon = g.icon;
          return (
            <section key={g.label}>
              <div className="mb-2 flex items-center gap-1.5 text-fg-3">
                <Icon size={12} />
                <span className="caps">{g.label}</span>
              </div>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <Link
                    key={it.key}
                    href={it.href}
                    className="flex items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-3 py-2 text-[12.5px] hover:border-accent hover:bg-bg-2"
                  >
                    <span className="flex-1 truncate font-medium">{it.title}</span>
                    {it.sub && (
                      <span className="truncate text-[11px] text-fg-3">{it.sub}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
