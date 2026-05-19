"use client";
import { useMemo, useState } from "react";
import type { Signal, Catalyst, Conviction } from "@/types/domain";
import { SignalRow, CatalystRow, FilterChip, methodOf } from "@/components/gallery/shared";

type Tab = "signals" | "catalysts";
type MethodFilter = "all" | "基本面" | "技术" | "宏观";
type ConvFilter = "all" | Conviction;
type SigFilter = "all" | "HIGH_ONLY";
type CatTypeFilter = "all" | "FUNDAMENTAL_CHANGE" | "NEWS_EVENT" | "TECHNICAL_SIGNAL" | "MACRO_EVENT";
type CatSigFilter = "all" | "HIGH" | "MEDIUM";

export function InsightsBoard({
  signals,
  catalysts,
}: {
  signals: Signal[];
  catalysts: Catalyst[];
}) {
  const [tab, setTab] = useState<Tab>("signals");

  // Signal filters
  const [method, setMethod] = useState<MethodFilter>("all");
  const [conv, setConv] = useState<ConvFilter>("all");
  const [sigBest, setSigBest] = useState<SigFilter>("all");

  // Catalyst filters
  const [catType, setCatType] = useState<CatTypeFilter>("all");
  const [catSig, setCatSig] = useState<CatSigFilter>("all");

  const filteredSignals = useMemo(() => {
    return signals
      .filter((s) => (method === "all" ? true : methodOf(s.strategyName) === method))
      .filter((s) => (conv === "all" ? true : s.conviction === conv))
      .filter((s) => (sigBest === "HIGH_ONLY" ? s.conviction === "HIGH" : true))
      .sort(
        (a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      );
  }, [signals, method, conv, sigBest]);

  const filteredCatalysts = useMemo(() => {
    return catalysts
      .filter((c) => (catType === "all" ? true : c.type === catType))
      .filter((c) => (catSig === "all" ? true : c.significance === catSig))
      .sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
  }, [catalysts, catType, catSig]);

  return (
    <>
      {/* Tab switch */}
      <div className="mb-4 flex items-center gap-6 border-b border-hairline-strong">
        <button
          type="button"
          onClick={() => setTab("signals")}
          className={`relative pb-2 text-[13px] font-semibold transition-colors ${
            tab === "signals" ? "text-accent" : "text-fg-3 hover:text-fg-1"
          }`}
        >
          Signals · {signals.length}
          {tab === "signals" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("catalysts")}
          className={`relative pb-2 text-[13px] font-semibold transition-colors ${
            tab === "catalysts" ? "text-accent" : "text-fg-3 hover:text-fg-1"
          }`}
        >
          Catalysts · {catalysts.length}
          {tab === "catalysts" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
          )}
        </button>
        <div className="ml-auto pb-2 text-[10px] text-fg-3">
          {tab === "signals"
            ? "机会判断 · 可直接生成 Plan"
            : "客观事实 · 不含买卖意见"}
        </div>
      </div>

      {/* Filter rows */}
      {tab === "signals" ? (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-14 text-[10px] uppercase tracking-[0.1em] text-fg-3">
              方法
            </span>
            <FilterChip
              label="全部"
              active={method === "all"}
              onClick={() => setMethod("all")}
            />
            <FilterChip
              label="基本面"
              active={method === "基本面"}
              onClick={() => setMethod("基本面")}
            />
            <FilterChip
              label="技术"
              active={method === "技术"}
              onClick={() => setMethod("技术")}
            />
            <FilterChip
              label="宏观"
              active={method === "宏观"}
              onClick={() => setMethod("宏观")}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 text-[10px] uppercase tracking-[0.1em] text-fg-3">
              信心
            </span>
            <FilterChip
              label="全部"
              active={conv === "all"}
              onClick={() => setConv("all")}
            />
            <FilterChip
              label="HIGH"
              active={conv === "HIGH"}
              onClick={() => setConv("HIGH")}
            />
            <FilterChip
              label="MEDIUM"
              active={conv === "MEDIUM"}
              onClick={() => setConv("MEDIUM")}
            />
            <FilterChip
              label="LOW"
              active={conv === "LOW"}
              onClick={() => setConv("LOW")}
            />
            <span className="ml-auto flex items-center gap-2">
              <FilterChip
                label={sigBest === "HIGH_ONLY" ? "★ 只看 HIGH" : "★ 只看 HIGH"}
                active={sigBest === "HIGH_ONLY"}
                onClick={() =>
                  setSigBest(sigBest === "HIGH_ONLY" ? "all" : "HIGH_ONLY")
                }
              />
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-14 text-[10px] uppercase tracking-[0.1em] text-fg-3">
              类型
            </span>
            <FilterChip
              label="全部"
              active={catType === "all"}
              onClick={() => setCatType("all")}
            />
            <FilterChip
              label="基本面"
              active={catType === "FUNDAMENTAL_CHANGE"}
              onClick={() => setCatType("FUNDAMENTAL_CHANGE")}
            />
            <FilterChip
              label="新闻"
              active={catType === "NEWS_EVENT"}
              onClick={() => setCatType("NEWS_EVENT")}
            />
            <FilterChip
              label="技术"
              active={catType === "TECHNICAL_SIGNAL"}
              onClick={() => setCatType("TECHNICAL_SIGNAL")}
            />
            <FilterChip
              label="宏观"
              active={catType === "MACRO_EVENT"}
              onClick={() => setCatType("MACRO_EVENT")}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 text-[10px] uppercase tracking-[0.1em] text-fg-3">
              重要性
            </span>
            <FilterChip
              label="全部"
              active={catSig === "all"}
              onClick={() => setCatSig("all")}
            />
            <FilterChip
              label="HIGH"
              active={catSig === "HIGH"}
              onClick={() => setCatSig("HIGH")}
            />
            <FilterChip
              label="MEDIUM"
              active={catSig === "MEDIUM"}
              onClick={() => setCatSig("MEDIUM")}
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-lg border border-hairline-strong bg-bg-1">
        {tab === "signals" ? (
          filteredSignals.length === 0 ? (
            <EmptyState label="当前条件下没有 Signal" />
          ) : (
            <div className="divide-y divide-hairline-strong">
              {filteredSignals.map((s) => (
                <SignalRow key={s.id} s={s} />
              ))}
            </div>
          )
        ) : filteredCatalysts.length === 0 ? (
          <EmptyState label="当前条件下没有 Catalyst" />
        ) : (
          <div className="divide-y divide-hairline-strong">
            {filteredCatalysts.map((c) => (
              <CatalystRow key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>

      {/* Counts footer */}
      <div className="mt-3 text-center text-[10px] text-fg-3">
        {tab === "signals"
          ? `${filteredSignals.length} / ${signals.length} 条 Signal`
          : `${filteredCatalysts.length} / ${catalysts.length} 条 Catalyst`}
        <span className="mx-2">·</span>
        <span>AI 产物 · 仅供参考</span>
      </div>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-[12px] text-fg-3">
      {label}
    </div>
  );
}
