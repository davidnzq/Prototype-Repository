import { NextRequest } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, CLAUDE_MODEL } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { BRIDGE_AI_TOOLS } from "@/lib/ai/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequest {
  messages: Anthropic.MessageParam[];
}

/**
 * Bridge AI chat endpoint.
 *
 * Protocol: SSE with a lightweight wire format that's easier to consume on the
 * client than Anthropic's raw stream event format.
 *
 *   data: {"type":"text","delta":"..."}
 *   data: {"type":"tool","name":"render_signal_card","input":{...}}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 *
 * Tool calls are treated as UI render/navigation actions — we immediately
 * return a trivial "ok" tool_result so Claude can keep talking in the same turn.
 */
export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "`messages` required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (payload: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        const client = getAnthropic();
        const messages: Anthropic.MessageParam[] = [...body.messages];

        // Agentic loop. Each iteration: stream Claude's turn, collect tool_use
        // blocks, push trivial tool_results (render tools are no-ops), repeat
        // until stop_reason === 'end_turn'. Cap at 4 iterations.
        for (let iter = 0; iter < 4; iter++) {
          const messageStream = client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            system: [
              {
                type: "text",
                text: buildSystemPrompt(),
                cache_control: { type: "ephemeral" },
              },
            ],
            tools: BRIDGE_AI_TOOLS,
            messages,
          });

          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              push({ type: "text", delta: event.delta.text });
            }
          }

          const finalMessage = await messageStream.finalMessage();

          // Push tool_use blocks to the client as UI events + record them to messages
          const toolUses = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );
          for (const t of toolUses) {
            push({
              type: "tool",
              id: t.id,
              name: t.name,
              input: t.input,
            });
          }

          messages.push({ role: "assistant", content: finalMessage.content });

          if (finalMessage.stop_reason === "end_turn" || toolUses.length === 0) {
            break;
          }

          if (finalMessage.stop_reason === "tool_use") {
            // HITL 工具是"等待用户"的阻断点 —— 不 agentic-loop 继续,
            // 直接结束这一 turn,等用户通过表单回应。
            const hasHitl = toolUses.some((t) =>
              t.name.startsWith("trigger_hitl")
            );
            if (hasHitl) {
              break;
            }
            // 其它 render-only 工具:立即返回 "ok" 让 AI 继续说话。
            messages.push({
              role: "user",
              content: toolUses.map((t) => ({
                type: "tool_result" as const,
                tool_use_id: t.id,
                content: "ok",
              })),
            });
            continue;
          }

          // Unexpected stop reason — break to avoid infinite loop.
          break;
        }

        push({ type: "done" });
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        push({ type: "error", message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
