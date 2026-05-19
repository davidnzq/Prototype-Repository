// Client-side protocol types for the /api/chat SSE stream.
// Keep in sync with app/api/chat/route.ts.

export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; id: string; name: string; input: Record<string, unknown> }
  | { type: "done" }
  | { type: "error"; message: string };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** Interleaved content — text spans + tool invocations rendered as widgets. */
  blocks: ChatBlock[];
}

export type ChatBlock =
  | { type: "text"; text: string }
  | { type: "tool"; id: string; name: string; input: Record<string, unknown> };

/**
 * Parses an SSE stream into ChatStreamEvent objects. Yields one event per
 * `data:` line (skipping heartbeats / comments).
 */
export async function* parseSSE(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6).trim();
          if (!payload) continue;
          try {
            yield JSON.parse(payload) as ChatStreamEvent;
          } catch {
            // malformed line — skip
          }
        }
      }
    }
  }
}
