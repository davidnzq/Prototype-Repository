"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { WorkStateIndicator } from "./WorkStateIndicator";
import { SearchModal } from "./SearchModal";
import { AvatarMenu } from "./AvatarMenu";

// IA 1.2 · Top Bar · Logo · ⌘K 搜索 · 状态指示器 · 通知 · 账户。
// 搜索不再是占位输入 · 是跨对象搜索 Modal 的触发器(⌘K)。

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-14 shrink-0 items-center border-b border-hairline-strong bg-bg-1 px-5">
      <Link
        href="/"
        className="flex items-center gap-2.5"
        aria-label="Bridge AI Home"
      >
        <Logo variant="mark" height={26} />
        <span className="text-[14px] font-semibold tracking-[-0.005em]">
          Bridge AI
        </span>
      </Link>

      {/* 搜索触发器 · ⌘K · 打开 SearchModal */}
      <div className="mx-6 max-w-[480px] flex-1">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="搜索 · ⌘K"
          className="group flex w-full items-center gap-2 rounded-md border border-hairline-strong bg-bg-2 px-3 py-1.5 text-left text-[12.5px] text-fg-3 transition-colors hover:border-hairline-strong hover:bg-bg-1"
        >
          <Search size={14} strokeWidth={1.75} />
          <span className="flex-1 truncate">
            搜索 · Stock / Thesis / Plan / Strategy / Review
          </span>
          <span className="rounded border border-hairline-strong bg-bg-1 px-1.5 py-0.5 font-mono text-[10px] text-fg-3">
            ⌘K
          </span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <WorkStateIndicator />
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-fg-2 transition-colors hover:bg-bg-2 hover:text-fg-1"
          aria-label="通知"
          title="通知"
        >
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-down ring-2 ring-bg-1" />
        </button>
        <AvatarMenu />
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
