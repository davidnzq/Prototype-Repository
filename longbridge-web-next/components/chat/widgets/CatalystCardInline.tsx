"use client";

import { getCatalystById } from "@/mock/catalysts";
import { TriangleAlert } from "lucide-react";

export function CatalystCardInline({ catalystId }: { catalystId: string }) {
  const cat = getCatalystById(catalystId);
  if (!cat) return <MissingRef label={`Catalyst ${catalystId}`} />;

  const dirColor =
    cat.factualDirection === "positive"
      ? "text-up-dark"
      : cat.factualDirection === "negative"
      ? "text-down-dark"
      : "text-fg-2";
  const borderColor =
    cat.factualDirection === "positive"
      ? "border-l-up"
      : cat.factualDirection === "negative"
      ? "border-l-down"
      : "border-l-fg-3";

  return (
    <div
      className={`rounded-lg border border-hairline-strong border-l-4 ${borderColor} bg-bg-1 p-4 shadow-card`}
    >
      <div className="caps mb-1 text-accent">
        CATALYST · {cat.type.replace(/_/g, " ")} · {cat.symbol}
      </div>
      <div className="mb-1.5 font-serif text-[16px] leading-[22px] font-bold tracking-[-0.01em]">
        {cat.title}
      </div>
      <div className="mb-3 text-[12px] leading-[18px] text-fg-2">
        {cat.subtitle}
      </div>
      <ul className="mb-3 space-y-1">
        {cat.highlights.slice(0, 3).map((h) => (
          <li
            key={h}
            className="flex gap-2 text-[12px] leading-[18px] text-fg-1 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-fg-3"
          >
            {h}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-hairline-strong pt-2.5">
        <span className={`caps ${dirColor}`}>
          {cat.factualDirection}
          {cat.factualStrength ? ` · ${(cat.factualStrength * 100).toFixed(0)}%` : ""}
        </span>
        <span className="flex-1" />
        <span className="text-[10px] text-fg-3">
          {cat.sources.length} source{cat.sources.length > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function MissingRef({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-warn">
      <TriangleAlert size={14} />
      <span>引用未找到: {label}</span>
    </div>
  );
}
