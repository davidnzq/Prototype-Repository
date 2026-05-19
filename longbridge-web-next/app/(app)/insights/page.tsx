import { MOCK_SIGNALS } from "@/mock/signals";
import { MOCK_CATALYSTS } from "@/mock/catalysts";
import { InsightsBoard } from "@/components/insights/InsightsBoard";

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-8 py-8 pb-16">
      <header className="mb-6">
        <div className="kicker text-accent">INSIGHTS · 事实与机会</div>
        <h1 className="mt-1 font-serif text-[32px] leading-[38px] font-bold tracking-[-0.02em]">
          情报流
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-[20px] text-fg-2">
          Signal 是 AI 在 Strategy 框架下对 Catalyst 的解读,是<strong>机会判断</strong>。
          Catalyst 是客观事实,不含买卖判断。两者同源异构,自由切换。
        </p>
      </header>
      <InsightsBoard
        signals={MOCK_SIGNALS}
        catalysts={MOCK_CATALYSTS}
      />
    </div>
  );
}
