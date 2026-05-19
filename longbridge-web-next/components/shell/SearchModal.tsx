"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  TrendingUp,
  FileText,
  Target,
  Brain,
  History,
  X,
} from "lucide-react";
import { DEMO_UNIVERSE } from "@/lib/universe";
import { MOCK_THESES } from "@/mock/theses";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";
import { MOCK_STRATEGIES } from "@/mock/strategies";
import { MOCK_REVIEWS } from "@/mock/reviews";

// 跨对象搜索 Modal · ⌘K 触发。
// IA Ch 3.5 的搜索入口 —— 现在作为 Top Bar ⌘K 快捷键 · 不占主 nav。

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ResultItem {
  key: string;
  href: string;
  title: string;
  sub?: string;
}

export function SearchModal({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const term = q.trim().toLowerCase();
  const match = (s: string) => term.length === 0 || s.toLowerCase().includes(term);

  const groups: {
    label: string;
    icon: typeof SearchIcon;
    items: ResultItem[];
  }[] = [
    {
      label: "Stocks",
      icon: TrendingUp,
      items: DEMO_UNIVERSE.filter(
        (s) => match(s.symbol) || match(s.nameZh) || match(s.sector)
      )
        .slice(0, 5)
        .map((s) => ({
          key: s.symbol,
          href: `?peek=${s.symbol}`,
          title: s.nameZh,
          sub: `${s.symbol.split(".")[0]} · ${s.sector}`,
        })),
    },
    {
      label: "Thesis",
      icon: FileText,
      items: MOCK_THESES.filter((t) => match(t.title) || match(t.company)).map(
        (t) => ({
          key: t.id,
          href: `/thesis/${t.id}?state=research`,
          title: t.title,
          sub: `${t.company} · v${t.version}`,
        })
      ),
    },
    {
      label: "Plan",
      icon: Target,
      items: MOCK_TRADE_PLANS.filter(
        (p) => match(p.symbol) || match(p.targetPlan.action)
      )
        .slice(0, 5)
        .map((p) => ({
          key: p.id,
          href: `/plan/${p.id}`,
          title: `${p.symbol.split(".")[0]} · ${p.targetPlan.action}`,
          sub: `${p.status} · ${p.targetPlan.window}`,
        })),
    },
    {
      label: "Strategy",
      icon: Brain,
      items: MOCK_STRATEGIES.filter(
        (s) => match(s.nameZh) || match(s.name) || match(s.slogan)
      ).map((s) => ({
        key: s.id,
        href: `/strategy/${s.id}`,
        title: s.nameZh,
        sub: s.slogan,
      })),
    },
    {
      label: "Review",
      icon: History,
      items: MOCK_REVIEWS.filter((r) => match(r.symbol) || match(r.summary.direction))
        .slice(0, 5)
        .map((r) => ({
          key: r.id,
          href: `/review/${r.id}?state=review`,
          title: `${r.symbol.split(".")[0]} · ${r.summary.direction}`,
          sub: `${r.performance.realizedPnlPct >= 0 ? "+" : ""}${r.performance.realizedPnlPct.toFixed(1)}% · ${new Date(r.closedAt).toLocaleDateString("zh-CN")}`,
        })),
    },
  ];

  const anyResult = groups.some((g) => g.items.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[75vh] w-full max-w-[620px] flex-col overflow-hidden rounded-lg border border-hairline-strong bg-bg-1 shadow-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-hairline-strong px-4 py-3">
          <SearchIcon size={16} className="shrink-0 text-fg-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索股票 · Thesis · Plan · Strategy · Review ..."
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-fg-3"
          />
          <span className="shrink-0 rounded border border-hairline-strong bg-bg-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-3">
            ESC
          </span>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-fg-3 hover:bg-bg-2 hover:text-fg-1"
            aria-label="关闭"
          >
            <X size={13} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {!anyResult && (
            <div className="px-3 py-8 text-center text-[12px] text-fg-3">
              没找到匹配的结果 —— 试试股票代码(NVDA / MSFT)或 Thesis 标题
            </div>
          )}
          {groups.map((g) => {
            if (g.items.length === 0) return null;
            const Icon = g.icon;
            return (
              <section key={g.label} className="mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-fg-3">
                  <Icon size={11} />
                  <span className="caps">{g.label}</span>
                  <span className="num text-[10px] text-fg-3">
                    · {g.items.length}
                  </span>
                </div>
                <ul>
                  {g.items.map((it) => (
                    <li key={it.key}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-[12.5px] hover:bg-bg-2"
                      >
                        <span className="flex-1 truncate font-medium">
                          {it.title}
                        </span>
                        {it.sub && (
                          <span className="truncate text-[11px] text-fg-3">
                            {it.sub}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <footer className="flex items-center gap-3 border-t border-hairline-strong px-4 py-2 text-[10px] text-fg-3">
          <span>
            <span className="rounded border border-hairline-strong bg-bg-2 px-1 py-0.5 font-mono">⌘K</span>{" "}
            随时召唤
          </span>
          <span className="ml-auto">跨对象搜索 · Stock / Thesis / Plan / Strategy / Review</span>
        </footer>
      </div>
    </div>
  );
}
