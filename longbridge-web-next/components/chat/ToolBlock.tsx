"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CatalystCardInline } from "./widgets/CatalystCardInline";
import { SignalCardInline } from "./widgets/SignalCardInline";
import { QuoteCardInline } from "./widgets/QuoteCardInline";
import { HitlConfirm } from "./widgets/HitlConfirm";
import { HitlMultiselect } from "./widgets/HitlMultiselect";
import { TriangleAlert } from "lucide-react";

type ToolInput = Record<string, unknown>;

export function ToolBlock({ name, input }: { name: string; input: ToolInput }) {
  switch (name) {
    case "render_catalyst_card":
      return <CatalystCardInline catalystId={String(input.catalyst_id)} />;
    case "render_signal_card":
      return <SignalCardInline signalId={String(input.signal_id)} />;
    case "render_quote":
      return <QuoteCardInline symbol={String(input.symbol)} />;
    case "open_stock_detail":
      return <OpenStockDetailBridge symbol={String(input.symbol)} />;
    case "trigger_hitl_confirm":
      return (
        <HitlConfirm
          title={String(input.title ?? "")}
          description={String(input.description ?? "")}
          ctaLabel={String(input.cta_label ?? "确认")}
          nextAction={String(input.next_action ?? "acknowledge")}
          payload={input.next_action_payload as Record<string, unknown> | undefined}
        />
      );
    case "trigger_hitl_multiselect":
      return (
        <HitlMultiselect
          question={String(input.question ?? "")}
          options={Array.isArray(input.options) ? (input.options as string[]) : []}
          multiple={Boolean(input.multiple)}
        />
      );
    default:
      return (
        <div className="flex items-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-warn">
          <TriangleAlert size={14} />
          <span>未知工具: {name}</span>
        </div>
      );
  }
}

/**
 * Side-effect bridge: when the AI calls open_stock_detail, navigate the right
 * workspace to the stock detail route. Renders an inline acknowledgement chip.
 */
function OpenStockDetailBridge({ symbol }: { symbol: string }) {
  const router = useRouter();
  useEffect(() => {
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }, [router, symbol]);
  return (
    <div className="inline-flex items-center gap-1.5 rounded-xs bg-bg-3 px-2 py-0.5 text-[10px] text-fg-2">
      <span>已在右侧打开 {symbol}</span>
    </div>
  );
}
