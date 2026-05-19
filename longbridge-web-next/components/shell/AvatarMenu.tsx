"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UserCircle2,
  UserRound,
  Sparkles,
  SlidersHorizontal,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 头像 dropdown · 收纳低频 / 设置性入口。
// News / Calendar 合并进 Markets · 不在这里重复。

interface MenuItem {
  type?: "link" | "divider";
  href?: string;
  label?: string;
  icon?: LucideIcon;
  hint?: string;
}

const MENU: MenuItem[] = [
  { type: "link", href: "/portrait", label: "Portrait", icon: UserRound, hint: "KYC · 风险 · 偏好" },
  { type: "link", href: "/subagents", label: "Sub-Agents", icon: Sparkles, hint: "启用 · 偏好" },
  { type: "link", href: "/screener", label: "Screener", icon: SlidersHorizontal, hint: "我的筛子 + 监控" },
  { type: "link", href: "/watchlist", label: "Watchlist", icon: Star },
  { type: "divider" },
  { type: "link", href: "#", label: "Settings", icon: Settings },
  { type: "link", href: "#", label: "Sign out", icon: LogOut },
];

export function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="账户菜单"
        title="账户"
        className="flex h-8 w-8 items-center justify-center rounded-full text-fg-2 transition-colors hover:bg-bg-2 hover:text-fg-1"
      >
        <UserCircle2 size={20} strokeWidth={1.6} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[240px] overflow-hidden rounded-lg border border-hairline-strong bg-bg-1 shadow-popover">
          <div className="border-b border-hairline-strong px-4 py-2.5">
            <div className="text-[13px] font-semibold">David · Pioneer 画像</div>
            <div className="text-[10px] text-fg-3">
              稳健成长型 · 偏好美股科技 · 仓位 60%
            </div>
          </div>
          <div className="py-1">
            {MENU.map((m, i) => {
              if (m.type === "divider") {
                return (
                  <div
                    key={`d-${i}`}
                    className="my-1 border-t border-hairline-strong"
                  />
                );
              }
              const Icon = m.icon!;
              return (
                <Link
                  key={m.href! + i}
                  href={m.href!}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-[12.5px] text-fg-1 hover:bg-bg-2"
                >
                  <Icon size={14} className="shrink-0 text-fg-3" />
                  <span className="flex-1 font-medium">{m.label}</span>
                  {m.hint && (
                    <span className="text-[10px] text-fg-3">{m.hint}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
