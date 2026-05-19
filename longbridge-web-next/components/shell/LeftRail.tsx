"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Briefcase,
  FileText,
  Target,
  History,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOCK_TRADE_PLANS } from "@/mock/tradePlans";

// 全局主导航 · 左侧窄 rail · 7 项 · 三视觉分组(扫场 / 我的 / 方法论)。
// IA = 本地 v3.0 + concept Artifact 闭环:首页/行情(扫场)→ 资产/计划/论点/复盘(我的)→ 策略广场(方法论)。

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | "dot" | null;
}

interface NavGroup {
  id: string;
  items: NavItem[];
}

function buildGroups(): NavGroup[] {
  const pendingPlans = MOCK_TRADE_PLANS.filter(
    (p) => p.status === "PENDING" || p.status === "DRAFT"
  ).length;
  return [
    {
      id: "scan",
      items: [
        { href: "/", label: "首页", icon: Home },
        { href: "/markets", label: "行情", icon: BarChart3 },
      ],
    },
    {
      id: "mine",
      items: [
        { href: "/portfolio", label: "资产", icon: Briefcase },
        {
          href: "/plan",
          label: "计划",
          icon: Target,
          badge: pendingPlans > 0 ? pendingPlans : null,
        },
        { href: "/thesis", label: "论点", icon: FileText },
        { href: "/review", label: "复盘", icon: History },
      ],
    },
    {
      id: "method",
      items: [{ href: "/strategy", label: "策略", icon: Compass }],
    },
  ];
}

export function LeftRail() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groups = buildGroups();

  return (
    <nav
      aria-label="主导航"
      className="flex h-full w-[88px] shrink-0 flex-col items-stretch border-r border-hairline-strong bg-bg-1 py-3"
    >
      <div className="flex flex-col gap-3">
        {groups.map((g, gi) => (
          <div key={g.id} className="flex flex-col">
            {gi > 0 && (
              <div className="mx-4 mb-3 h-px bg-hairline-strong" aria-hidden />
            )}
            <ul className="flex flex-col items-stretch gap-0.5 px-2">
              {g.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-label={label}
                      title={label}
                      className={`group relative flex flex-col items-center justify-center gap-1 rounded-md py-2.5 transition-colors ${
                        active
                          ? "bg-accent-soft text-accent"
                          : "text-fg-2 hover:bg-bg-2 hover:text-fg-1"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
                      )}
                      <div className="relative">
                        <Icon
                          size={19}
                          strokeWidth={active ? 2.25 : 1.75}
                          className="shrink-0"
                        />
                        {typeof badge === "number" && (
                          <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-down px-0.5 text-[9px] font-bold text-white ring-2 ring-bg-1">
                            {badge}
                          </span>
                        )}
                        {badge === "dot" && (
                          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-down ring-2 ring-bg-1" />
                        )}
                      </div>
                      <span className="text-[10.5px] font-medium leading-none tracking-[0.01em]">
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
