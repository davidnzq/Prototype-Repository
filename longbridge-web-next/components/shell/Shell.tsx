"use client";

import { Suspense } from "react";
import { PanelRightOpen } from "lucide-react";
import { TopBar } from "./TopBar";
import { LeftRail } from "./LeftRail";
import { RightChat } from "./RightChat";
import { PeekDrawer } from "./PeekDrawer";
import { InputBar } from "./InputBar";
import { useWorkState, type WorkState } from "@/lib/workState";

// 动态 Shell
// 结构:TopBar(h-14) + 横向 grid(LeftRail + Main + Chat)
// LeftRail  · 88px 固定
// Main      · 1fr · 按工作状态切换 Surface,底部 sticky InputBar
// ChatPanel · 360 / 520 / 0 px · 由工作状态驱动
//   阅读 / 复盘 → 常驻窄态(~360)
//   研究        → 展开态(~520) · 分屏对话
//   交易        → 收起态(浮动按钮) · 干扰最少

const CHAT_WIDTH: Record<WorkState, string> = {
  reading: "360px",
  research: "520px",
  review: "360px",
  trade: "0px",
};

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-bg-1" />}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { state } = useWorkState();
  const chatWidth = CHAT_WIDTH[state];
  const chatOpen = state !== "trade";

  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div
        className="grid min-h-0 flex-1"
        style={{
          gridTemplateColumns: chatOpen ? `88px 1fr ${chatWidth}` : "88px 1fr",
        }}
      >
        <LeftRail />
        <main className="relative flex min-h-0 flex-col overflow-hidden bg-bg-2">
          {state === "trade" && <FloatingChatSummon />}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <Suspense fallback={null}>
            <PeekDrawer />
          </Suspense>
          <InputBar />
        </main>
        {chatOpen && (
          <div className="relative border-l border-hairline-strong">
            <RightChat />
          </div>
        )}
      </div>
    </div>
  );
}

function FloatingChatSummon() {
  return (
    <button
      aria-label="召唤 AI"
      title="召唤 AI · 交易状态下 chat 已折叠"
      className="fixed right-5 top-20 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-hairline-strong bg-bg-1 text-fg-2 shadow-popover transition-colors hover:text-fg-1"
    >
      <PanelRightOpen size={16} strokeWidth={1.75} />
    </button>
  );
}
