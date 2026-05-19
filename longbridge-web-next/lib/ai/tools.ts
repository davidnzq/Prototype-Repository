import type Anthropic from "@anthropic-ai/sdk";

/**
 * Bridge AI's tools are **UI render / navigation actions**, not real compute.
 * The server echoes the call to the client as an SSE event, then immediately
 * returns a trivial "ok" tool_result so Claude can continue speaking.
 */

export const BRIDGE_AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "render_catalyst_card",
    description:
      "Embed a Catalyst (fact) card inline in the chat. Use this when you reference a specific Catalyst by id rather than describing it in prose.",
    input_schema: {
      type: "object",
      properties: {
        catalyst_id: {
          type: "string",
          description:
            "Catalyst id from the system prompt's catalyst list, e.g. 'cat-msft-earnings-q3'.",
        },
      },
      required: ["catalyst_id"],
    },
  },
  {
    name: "render_signal_card",
    description:
      "Embed a Signal (opportunity) card inline in the chat. Use this when showing AI's judgment (Conviction / Outlook / Upside) for a symbol under a specific strategy.",
    input_schema: {
      type: "object",
      properties: {
        signal_id: {
          type: "string",
          description:
            "Signal id from the system prompt's signal list, e.g. 'sig-nvda-soros'.",
        },
      },
      required: ["signal_id"],
    },
  },
  {
    name: "render_quote",
    description:
      "Embed a live quote card (price + change% + volume) for a symbol. Use when the user asks about price, daily move, or as quick reference.",
    input_schema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description:
            "Symbol in `TICKER.MARKET` form, e.g. 'MSFT.US'. Must be from the demo universe.",
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "open_stock_detail",
    description:
      "Open the stock detail page in the right-side GUI workspace. Use when the user wants to dig into a stock's full page (quote + fundamentals + news + catalysts + signals).",
    input_schema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description:
            "Symbol in `TICKER.MARKET` form, e.g. 'NVDA.US'. Must be from the demo universe.",
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "trigger_hitl_confirm",
    description:
      "Render a HITL (Human-In-The-Loop) confirmation button. Use at key action junctions — generating a Trade Plan, authorizing data access, proceeding to the order ticket. Do NOT use for casual 'do you want to continue' confirmations.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Short header, e.g. '生成 Trade Plan'",
        },
        description: {
          type: "string",
          description:
            "One-sentence summary of what will happen if the user confirms.",
        },
        cta_label: {
          type: "string",
          description: "Button text, e.g. '确认生成'",
        },
        next_action: {
          type: "string",
          description:
            "What the app should do on confirm. One of: 'generate_trade_plan' | 'open_order_ticket' | 'authorize_assets' | 'acknowledge'. Include the target plan_id / signal_id / symbol in the next_action_payload.",
          enum: [
            "generate_trade_plan",
            "open_order_ticket",
            "authorize_assets",
            "acknowledge",
          ],
        },
        next_action_payload: {
          type: "object",
          description:
            "Optional context for the next action, e.g. { signal_id, plan_id, symbol }.",
        },
      },
      required: ["title", "description", "cta_label", "next_action"],
    },
  },
  {
    name: "trigger_hitl_multiselect",
    description:
      "Render a HITL multi-select / single-select picker. Use for intent clarification — e.g. 'which account do you want to analyze?', 'which time range?', 'what dimensions should I focus on?'.",
    input_schema: {
      type: "object",
      properties: {
        question: { type: "string" },
        options: {
          type: "array",
          items: { type: "string" },
          description: "2-6 options. Avoid Yes/No — that's what trigger_hitl_confirm is for.",
        },
        multiple: {
          type: "boolean",
          description: "Whether the user can pick more than one. Default false.",
        },
      },
      required: ["question", "options"],
    },
  },
  // ─── 本地 v3.0 专属工具 ────────────────────────────────────────
  {
    name: "render_dyn_view_skeleton",
    description:
      "Open a specific dynamic view in the home main area. The host app switches the main browse zone and opens the corresponding Sub-Agent panel (color: research=purple, risk=rose, attribution=amber, screener=cyan, tradeplan=neutral, compare=neutral). Use right after intent classification when the user expresses a clear analysis intent.",
    input_schema: {
      type: "object",
      properties: {
        view_id: {
          type: "string",
          enum: [
            "dyn-research",
            "dyn-risk",
            "dyn-attribution",
            "dyn-screener",
            "dyn-tradeplan",
            "dyn-compare",
          ],
          description:
            "Which dyn view to open. Aligns with the classifyIntent() taxonomy from longbridge-web-demo.",
        },
        symbol: {
          type: "string",
          description:
            "Optional symbol focus (e.g. 'NVDA'). Required for dyn-research / dyn-tradeplan / per-stock dyn-attribution.",
        },
      },
      required: ["view_id"],
    },
  },
  {
    name: "trigger_signal_action",
    description:
      "Trigger one of the three Signal CTAs from the local v3.0 prototype: move_forward (generate Plan via HITL), increase (HITL multi-select to pick sizing), tell_more (deeper explanation, no HITL). Use when the user shows interest in a Signal card and wants the next step.",
    input_schema: {
      type: "object",
      properties: {
        signal_id: { type: "string", description: "Target Signal id (sig-*)" },
        action: {
          type: "string",
          enum: ["move_forward", "increase", "tell_more"],
          description:
            "move_forward = open Plan draft via HITL confirm; increase = HITL multi-select to pick a new position size; tell_more = explanation only.",
        },
      },
      required: ["signal_id", "action"],
    },
  },
];
