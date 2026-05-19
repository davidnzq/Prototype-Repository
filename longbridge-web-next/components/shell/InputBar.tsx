"use client";

// 全局底部输入条 · 移植自 longbridge-web-demo 的 .gi 元素
// 设计哲学(本地 v3.0 PRD §3.1):输入框是唯一入口,GUI(主区)+ LUI(chat)都是反馈区。
//
// 行为分两层 ——
//   live(键入中):classifyIntent 命中 → 紫色 morph + URL ?view=&symbol= 同步,
//                                       让 RightChat 切角色,主区切 dyn 视图(Stage A·3)
//   Enter(发送):占位 console.log,Stage A·4 真接 RightChat send()

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mic, ArrowUp, Sparkles } from "lucide-react";
import { classifyIntent, extractSymbol, TRY_INTENTS } from "@/lib/intent";

export function InputBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [showTries, setShowTries] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // live morph state · 输入命中意图时的紫脉动
  const [liveView, setLiveView] = useState<string | null>(null);

  // 仅在 home(/) 路径生效 view 切换 · 其它路由(stock/plan/...)走 path 驱动 chat
  const isHome = pathname === "/";

  // view → workState 映射(Stage B · 4 工作态滑移)
  // dyn-research/screener/compare → research(chat 480px)
  // dyn-tradeplan                 → trade(chat 收起)
  // dyn-risk/attribution          → review(chat 360px)
  function workStateFor(view: string | null): string {
    if (!view) return "reading";
    if (view === "dyn-tradeplan") return "trade";
    if (view === "dyn-risk" || view === "dyn-attribution") return "review";
    return "research";
  }

  // 输入变化:实时识别意图 + 同步 URL ?view=&symbol=&state=
  useEffect(() => {
    if (!isHome) return;
    const trimmed = text.trim();
    const next = new URLSearchParams(searchParams.toString());
    if (!trimmed) {
      if (searchParams.get("view")) {
        next.delete("view");
        next.delete("symbol");
        next.set("state", "reading");
        startTransition(() => {
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        });
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveView(null);
      return;
    }
    const view = classifyIntent(trimmed);
    if (!view) {
      setLiveView(null);
      return;
    }
    const sym = extractSymbol(trimmed);
    setLiveView(view);
    next.set("view", view);
    if (sym) next.set("symbol", sym);
    else next.delete("symbol");
    next.set("state", workStateFor(view));
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isHome, pathname]);

  function send(submitted?: string) {
    const t = (submitted ?? text).trim();
    if (!t) return;
    // Stage A·5 会接 RightChat 的 send() · 当前先 log + 清空
    console.log("[InputBar] send →", t, { view: liveView });
    setText("");
    setShowTries(false);
  }

  function applyTry(value: string) {
    setText(value);
    setShowTries(false);
    inputRef.current?.focus();
    // 立即触发(useEffect 会 morph),Enter 由用户手动发
  }

  return (
    <div className="border-t border-hairline-strong bg-bg-1 px-6 py-3 transition-colors">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-2">
        {liveView && (
          <div className="flex items-center gap-1.5 text-[10.5px] text-accent">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>布局已按意图实时重组 · 继续输入可细化 · Enter 发送给 AI</span>
          </div>
        )}
        {showTries && (
          <div className="flex flex-wrap gap-1.5">
            {TRY_INTENTS.map((t) => (
              <button
                key={t.text}
                onMouseDown={(e) => {
                  // mousedown 比 click 早 · blur 之前触发
                  e.preventDefault();
                  applyTry(t.text);
                }}
                className="rounded-pill border border-hairline-strong bg-bg-2 px-2.5 py-1 text-[10.5px] text-fg-1 transition-colors hover:border-accent hover:text-accent"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 transition-all ${
            liveView
              ? "border-accent bg-accent-soft/50 ring-2 ring-accent/20"
              : "border-hairline-strong bg-bg-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
          }`}
        >
          {liveView ? (
            <Sparkles size={13} className="text-accent" strokeWidth={2.25} />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
          )}
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowTries(true)}
            onBlur={() => setTimeout(() => setShowTries(false), 100)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              isHome
                ? "试试:分析持仓风险 / NVDA 能追吗 / 我想筛选中概股中的潜力股 / 建策略 / 今天为什么跌了"
                : "问任何关于这个页面的事…"
            }
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-fg-3"
          />
          <span className="hidden text-[10px] text-fg-3 lg:inline">
            已接入持仓 · 自选 · 行情 · 策略
          </span>
          <button
            type="button"
            aria-label="语音输入"
            title="语音输入"
            className="flex h-7 w-7 items-center justify-center rounded-md text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-1"
          >
            <Mic size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="发送给 AI"
            onClick={() => send()}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-fg-inverse disabled:bg-fg-1/10 disabled:text-fg-3"
            disabled={!text.trim()}
          >
            <ArrowUp size={14} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
