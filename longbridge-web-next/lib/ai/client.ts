import "server-only";
import Anthropic from "@anthropic-ai/sdk";

declare global {
   
  var __anthropic: Anthropic | undefined;
}

export function getAnthropic(): Anthropic {
  if (!globalThis.__anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set in .env.local. " +
          "Works with direct Anthropic or any Anthropic-compatible proxy — " +
          "set ANTHROPIC_BASE_URL to override the endpoint."
      );
    }
    // baseURL is optional; if unset the SDK uses https://api.anthropic.com.
    // For third-party Anthropic-compatible proxies (OpenRouter, self-hosted),
    // set ANTHROPIC_BASE_URL in .env.local.
    //
    // The SDK appends `/v1/messages` itself. Many third-party docs list the
    // endpoint as `.../v1` (that's how OpenAI-style docs look), so strip a
    // trailing `/v1` or `/v1/` to avoid `/v1/v1/messages`.
    const rawBaseURL = process.env.ANTHROPIC_BASE_URL?.trim();
    const baseURL = rawBaseURL
      ? rawBaseURL.replace(/\/v1\/?$/, "").replace(/\/$/, "")
      : undefined;
    globalThis.__anthropic = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return globalThis.__anthropic;
}

/**
 * Model identifier. Override in .env.local if your proxy renames Claude's
 * canonical ids (e.g. OpenRouter uses "anthropic/claude-opus-4-7").
 */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-7";
