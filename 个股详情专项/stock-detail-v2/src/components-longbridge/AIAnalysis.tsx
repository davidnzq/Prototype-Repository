import { cn, formatNum, formatPct } from "@/lib/utils";
import type { AIAnalysisData } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";

interface AIAnalysisProps {
  data: AIAnalysisData;
}

/**
 * AI 分析 — 长桥 V2(Perplexity 时间线风格)
 *
 * 布局:
 *   Row 1: Signal pills(Tech / Fund / Sent / Val)— 结构化指标速览
 *   Row 2: 单条 narrative entry(参考 Perplexity 时间线)
 *           ├ 左:日期 + 地区时间 + 时间线 dot
 *           └ 右:行情快照(收盘 + 盘后)+ 长正文 + 来源 chip + 更多入口
 *
 * 设计意图:
 *   - 去掉旧版 BULL / BEAR 双栏 bullet,因为结构化数据由顶部 signal pills 已表达
 *   - 把要点融入连贯叙事(成因 → 业绩 → 利好 → 风险 → 结论),信息密度更高
 *   - "查看完整原始分析" 入口提供深读路径
 */
export function AIAnalysis({ data }: AIAnalysisProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="AI 分析" hint={`生成于 ${data.generatedAt}`} />

      {/* Row 1 — Signal pills + brand stamp */}
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        {data.signals.map((s) => {
          const c =
            s.trend === "up"
              ? "border-up text-up"
              : s.trend === "down"
                ? "border-down text-down"
                : "border-fg-3 text-fg-2";
          return (
            <span
              key={s.label}
              className={cn(
                "inline-flex items-baseline gap-1.5 border px-2 py-1 text-sm",
                c,
              )}
            >
              <span className="caps">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </span>
          );
        })}
      </div>

      {/* Row 2 — 单条叙事 entry(参考 Perplexity)*/}
      <NarrativeEntry data={data} />
    </section>
  );
}

function NarrativeEntry({ data }: { data: AIAnalysisData }) {
  const { priceSnapshot: ps } = data;
  const mainUp = ps.changePct >= 0;
  const ahUp = (ps.afterHours?.changePct ?? 0) >= 0;

  return (
    <div>
      <div className="grid grid-cols-[120px_1fr] gap-4 px-4 py-4">
        {/* 左:日期 + 地区时间(单条 entry,不再渲染 timeline dot/line)*/}
        <div className="pr-3">
          <div className="num text-sm font-semibold text-fg-1">{data.entryDate}</div>
          <div className="num mt-1 text-xs leading-tight text-fg-3">
            {data.entryLocale.replace(/^New York 时间\s*/, "")}
          </div>
        </div>

        {/* 右:行情快照 → 正文 → 来源 → 更多 */}
        <div className="border-l border-hairline pl-4">
          {/* 行情快照行 */}
          <div className="flex items-baseline gap-2 text-sm">
            <span className="num font-semibold text-fg-1">
              US${formatNum(ps.price, 2)}
            </span>
            <span className={cn("num", mainUp ? "text-up" : "text-down")}>
              {mainUp ? "↗" : "↘"} {formatPct(Math.abs(ps.changePct) * 100, 2)}
            </span>
            <span className="text-fg-3">{ps.sessionLabel}</span>
            {ps.afterHours && (
              <>
                <span className="text-fg-4">·</span>
                <span className="num font-semibold text-fg-1">
                  US${formatNum(ps.afterHours.price, 2)}
                </span>
                <span className={cn("num", ahUp ? "text-up" : "text-down")}>
                  {ahUp ? "↗" : "↘"} {formatPct(Math.abs(ps.afterHours.changePct) * 100, 2)}
                </span>
                <span className="text-fg-3">{ps.afterHours.label}</span>
              </>
            )}
          </div>

          {/* 长正文 */}
          <p className="mt-3 text-base leading-relaxed text-fg-1">
            {data.narrative}
          </p>

          {/* 来源 chip + 更多入口 */}
          <div className="mt-3 flex items-center gap-3">
            <SourcesChip sources={data.sources} />
            {data.fullAnalysisHint && (
              <button
                type="button"
                className="ml-auto inline-flex items-baseline gap-1 text-xs text-accent transition-colors hover:text-fg-1 hover:underline"
              >
                <span>更多</span>
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesChip({
  sources,
}: {
  sources: { label: string; color: string }[];
}) {
  const visible = sources.slice(0, 3);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-bg-1 px-2 py-1 text-xs text-fg-2">
      {/* 叠加的源 icon — 字母圆 */}
      <span className="inline-flex">
        {visible.map((s, i) => (
          <span
            key={i}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-2xs font-bold text-fg-inverse"
            style={{
              background: s.color,
              marginLeft: i === 0 ? 0 : -6,
              zIndex: visible.length - i,
              border: "1px solid var(--color-bg-1)",
            }}
          >
            {s.label}
          </span>
        ))}
      </span>
      <span className="num">{sources.length} 个来源</span>
    </span>
  );
}
