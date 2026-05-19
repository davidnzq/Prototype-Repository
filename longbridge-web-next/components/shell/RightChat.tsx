"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles, ArrowUp, Square, Paperclip, AtSign, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type Anthropic from "@anthropic-ai/sdk";
import { parseSSE, type ChatMessage, type ChatBlock } from "@/lib/ai/clientEvents";
import { ToolBlock } from "@/components/chat/ToolBlock";
import {
  getContextForPath,
  getContextForPeek,
  getContextForView,
} from "@/lib/ai/pageContext";

export function RightChat() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peek");
  const view = searchParams.get("view");
  const symbol = searchParams.get("symbol");
  const ctx = useMemo(() => {
    // 优先级:peek > view(本地 home 内 dyn 切换) > path
    if (peekId) {
      const peek = getContextForPeek(peekId);
      if (peek) return peek;
    }
    if (view) {
      const v = getContextForView(view, symbol ?? undefined);
      if (v) return v;
    }
    return getContextForPath(pathname);
  }, [pathname, peekId, view, symbol]);
  const seedGreeting: ChatMessage = useMemo(
    () => ({
      id: `seed-${ctx.slug}`,
      role: "assistant",
      blocks: [{ type: "text", text: ctx.greeting }],
    }),
    [ctx]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([seedGreeting]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ctx 变化时:
  //   · 如果对话是空的(只有 seed),替换 seed 为新 greeting
  //   · 如果已经有对话历史,插入一条 divider 提示"切换到 X",保留历史
  // 避免切换 peek 时用户看不到"现在讨论的对象变了"。
  const lastCtxSlugRef = useRef<string>(ctx.slug);
  useEffect(() => {
    setMessages((prev) => {
      // 初始 mount 或只有 seed → 直接替换 seed
      if (prev.length === 1 && prev[0].id.startsWith("seed-")) {
        lastCtxSlugRef.current = ctx.slug;
        return [seedGreeting];
      }
      // 已经有真实对话 → 如果 slug 真的变了,插入 divider
      if (lastCtxSlugRef.current !== ctx.slug) {
        lastCtxSlugRef.current = ctx.slug;
        const divider: ChatMessage = {
          id: `divider-${ctx.slug}-${Date.now()}`,
          role: "assistant",
          blocks: [
            {
              type: "text",
              text: `─── 切换到 **${ctx.chip}** · ${ctx.role} ───\n\n${ctx.greeting}`,
            },
          ],
        };
        return [...prev, divider];
      }
      return prev;
    });
  }, [seedGreeting, ctx.slug, ctx.chip, ctx.role, ctx.greeting]);

  // Auto-scroll to bottom when messages or streaming tokens change.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        blocks: [{ type: "text", text }],
      };
      const assistantId = `a-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        blocks: [],
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        // Convert ChatMessage[] → Anthropic message param history (text only,
        // skip the seed greeting since it's client-side only).
        const history: Anthropic.MessageParam[] = [...messages, userMsg]
          .filter((m) => !m.id.startsWith("seed-"))
          .map((m) => {
            const asText = m.blocks
              .filter((b): b is Extract<ChatBlock, { type: "text" }> => b.type === "text")
              .map((b) => b.text)
              .join("");
            return { role: m.role, content: asText };
          });

        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });
        if (!resp.ok || !resp.body) {
          const errText = await resp.text().catch(() => "stream unavailable");
          appendToAssistant(assistantId, { type: "text", text: `\n\n⚠️ ${errText}` });
          return;
        }

        for await (const event of parseSSE(resp.body)) {
          if (event.type === "text") {
            appendToAssistant(assistantId, (prev) => {
              const last = prev.blocks[prev.blocks.length - 1];
              if (last && last.type === "text") {
                // 不能 mutate:React Strict Mode 下 setState updater 会被调用两次,
                // 任何 mutation 都会被执行两倍(token 叠两遍 bug 的根因)。
                // 必须返回完全新的 blocks 数组 + 新的 last block。
                return {
                  ...prev,
                  blocks: [
                    ...prev.blocks.slice(0, -1),
                    { ...last, text: last.text + event.delta },
                  ],
                };
              }
              return {
                ...prev,
                blocks: [...prev.blocks, { type: "text", text: event.delta }],
              };
            });
          } else if (event.type === "tool") {
            appendToAssistant(assistantId, (prev) => ({
              ...prev,
              blocks: [
                ...prev.blocks,
                {
                  type: "tool",
                  id: event.id,
                  name: event.name,
                  input: event.input,
                },
              ],
            }));
          } else if (event.type === "error") {
            appendToAssistant(assistantId, (prev) => ({
              ...prev,
              blocks: [
                ...prev.blocks,
                { type: "text", text: `\n\n⚠️ ${event.message}` },
              ],
            }));
          } else if (event.type === "done") {
            break;
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          appendToAssistant(assistantId, {
            type: "text",
            text: `\n\n⚠️ ${(e as Error).message}`,
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }

      function appendToAssistant(
        id: string,
        update: ChatBlock | ((prev: ChatMessage) => ChatMessage)
      ) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== id) return m;
            if (typeof update === "function") return update({ ...m });
            return { ...m, blocks: [...m.blocks, update] };
          })
        );
      }
    },
    [messages, streaming]
  );

  const stop = () => abortRef.current?.abort();

  return (
    <section className="flex h-screen min-h-0 flex-col overflow-hidden border-l-2 border-hairline-strong bg-bg-1">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-hairline-strong pl-10 pr-4 py-3">
        <Sparkles size={14} className="text-accent" strokeWidth={2.25} />
        <span className="text-[13px] font-semibold">Bridge AI</span>
        <span className="rounded-xs bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent">
          Agent
        </span>
        <span className="ml-auto text-[10px] text-fg-3">opus-4-7</span>
      </header>

      {/* Context chip — 观察中 (peek active → 不同视觉) */}
      <div
        className={`border-b px-4 py-2 transition-colors ${
          peekId
            ? "border-accent/30 bg-accent-soft/40"
            : "border-hairline-strong bg-bg-2"
        }`}
      >
        <div className="mb-1 flex items-center gap-1.5 text-[10px] text-fg-2">
          {peekId ? (
            <Eye size={11} className="text-accent" />
          ) : (
            <span className="flex h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
          )}
          <span>{peekId ? "讨论中" : "观察中"}</span>
          <span
            className={`rounded-xs px-1.5 py-0.5 font-semibold ${
              peekId ? "bg-accent text-white" : "bg-bg-1 text-fg-1"
            }`}
          >
            {ctx.chip}
          </span>
          <span className="text-fg-3">·</span>
          <span className="rounded-xs bg-accent-soft px-1.5 py-0.5 font-semibold text-accent">
            Pioneer
          </span>
          <span className="ml-auto text-[9px] text-fg-3">{ctx.role}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
        </div>
      </div>

      {/* Suggestions · 永远显示当前 ctx 的快捷 prompts(挂在 prompt bar 之上) */}
      {ctx.suggestions.length > 0 && (
        <div className="border-t border-hairline-strong bg-bg-1 px-3 pb-2 pt-2.5">
          <div className="mb-1.5 text-[9px] uppercase tracking-[0.08em] text-fg-3">
            快捷追问 · {ctx.role}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ctx.suggestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={streaming}
                className="rounded-pill border border-hairline-strong bg-bg-1 px-2.5 py-1 text-[11px] text-fg-1 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt bar */}
      <footer className="border-t border-hairline-strong px-3 py-3">
        <div className="flex items-end gap-1.5 rounded-lg border border-hairline-strong bg-bg-1 px-2.5 py-2 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/10">
          <button className="flex h-5 w-5 shrink-0 items-center justify-center text-fg-3 hover:text-fg-1" title="附件">
            <Paperclip size={12} />
          </button>
          <button className="flex items-center gap-0.5 rounded-sm px-1 py-0.5 text-[10px] text-fg-2 hover:bg-bg-2" title="引用对象">
            <AtSign size={11} />
            <span>引用</span>
          </button>
          <div className="h-3 w-px bg-hairline-strong" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="问任何事…"
            className="max-h-24 min-h-[18px] flex-1 resize-none bg-transparent text-[12px] leading-[18px] outline-none placeholder:text-fg-3"
            rows={1}
            disabled={streaming}
          />
          {streaming ? (
            <button
              onClick={stop}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-fg-1 text-white"
              aria-label="Stop"
            >
              <Square size={10} strokeWidth={2.25} fill="white" />
            </button>
          ) : (
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-white disabled:bg-fg-1/10 disabled:text-fg-3"
              aria-label="Send"
            >
              <ArrowUp size={12} strokeWidth={2.25} />
            </button>
          )}
        </div>
        <div className="mt-1.5 text-[9px] text-fg-3">
          Enter 发送 · Shift+Enter 换行 · AI 建议 · 仅供参考
        </div>
      </footer>
    </section>
  );
}

function Message({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-br-sm bg-bg-2 px-3 py-2 text-[13px] leading-[20px]">
          {message.blocks.map((b, i) =>
            b.type === "text" ? <span key={i}>{b.text}</span> : null
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-fg-inverse">
        <Sparkles size={14} strokeWidth={2.25} />
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        {message.blocks.map((b, i) => {
          if (b.type === "text") {
            return (
              <div
                key={i}
                className="prose-chat text-[13px] leading-[20px] text-fg-1"
              >
                <ReactMarkdown
                  components={{
                    // 右栏窄,禁用 h1/h2/h3 的大字号,降级为 strong
                    h1: ({ children }) => (
                      <p className="mt-3 mb-1 font-serif text-[14px] font-bold">
                        {children}
                      </p>
                    ),
                    h2: ({ children }) => (
                      <p className="mt-3 mb-1 font-serif text-[14px] font-bold">
                        {children}
                      </p>
                    ),
                    h3: ({ children }) => (
                      <p className="mt-2 mb-1 text-[13px] font-bold text-accent">
                        {children}
                      </p>
                    ),
                    h4: ({ children }) => (
                      <p className="mt-2 mb-0.5 text-[12px] font-bold">
                        {children}
                      </p>
                    ),
                    p: ({ children }) => (
                      <p className="mb-1.5 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-1.5 space-y-0.5 pl-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-1.5 list-inside list-decimal space-y-0.5">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="flex gap-2 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-accent">
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-fg-1">{children}</strong>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-bg-2 px-1 py-0.5 font-mono text-[11px]">
                        {children}
                      </code>
                    ),
                    hr: () => <hr className="my-2 border-hairline-strong" />,
                    table: ({ children }) => (
                      <div className="my-2 overflow-x-auto">
                        <table className="text-[11px]">{children}</table>
                      </div>
                    ),
                  }}
                >
                  {b.text}
                </ReactMarkdown>
                {i === message.blocks.length - 1 && b.text.length === 0 && (
                  <span className="inline-block h-3 w-1.5 animate-pulse bg-accent" />
                )}
              </div>
            );
          }
          return <ToolBlock key={b.id} name={b.name} input={b.input} />;
        })}
      </div>
    </div>
  );
}
