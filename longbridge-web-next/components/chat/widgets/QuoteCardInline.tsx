"use client";

import { useEffect, useState } from "react";
import { getSecurity } from "@/lib/universe";
import type { Quote } from "@/types/domain";
import { TriangleAlert } from "lucide-react";

export function QuoteCardInline({ symbol }: { symbol: string }) {
  const sec = getSecurity(symbol);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/quote?symbols=${encodeURIComponent(symbol)}`);
        const d = await r.json();
        if (!active) return;
        if (!r.ok || !d.quotes?.[0]) {
          setErr(d.error ?? "行情不可用");
        } else {
          setQuote(d.quotes[0]);
        }
      } catch (e) {
        if (active) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      active = false;
    };
  }, [symbol]);

  if (!sec) {
    return <MissingRef label={`${symbol} 不在 Demo 覆盖内`} />;
  }

  const chg = quote ? quote.changePct * 100 : 0;
  const up = chg >= 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-hairline-strong bg-bg-1 p-3 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-hairline-strong bg-bg-2 text-[11px] font-bold">
        {sec.symbol.split(".")[0].slice(0, 4)}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{sec.nameZh}</div>
        <div className="text-[10px] text-fg-2">
          {sec.symbol} · {sec.market} · {sec.sector}
        </div>
      </div>
      {err ? (
        <span className="text-[11px] text-error">{err.slice(0, 30)}</span>
      ) : quote ? (
        <div className="text-right">
          <div className="num text-[15px] font-bold">
            {quote.lastDone.toFixed(2)}
          </div>
          <div
            className={`num text-[11px] font-semibold ${
              up ? "text-up-dark" : "text-down-dark"
            }`}
          >
            {up ? "▲ " : "▼ "}
            {Math.abs(chg).toFixed(2)}%
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-fg-3">loading…</div>
      )}
    </div>
  );
}

function MissingRef({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-warn">
      <TriangleAlert size={14} />
      <span>{label}</span>
    </div>
  );
}
