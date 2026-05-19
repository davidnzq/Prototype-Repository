import { Construction } from "lucide-react";

export function PlaceholderPage({
  kicker,
  title,
  coming,
}: {
  kicker: string;
  title: string;
  coming: string;
}) {
  return (
    <div className="mx-auto max-w-[980px] px-8 py-10 pb-24">
      <header className="mb-10 border-b-2 border-fg-1 pb-4">
        <div className="mb-2 kicker">{kicker}</div>
        <h1 className="font-serif text-[36px] leading-[42px] font-bold tracking-[-0.02em]">
          {title}
        </h1>
      </header>
      <div className="flex items-center gap-3 rounded-md border border-hairline-strong bg-bg-1 px-5 py-4 shadow-card">
        <Construction size={18} className="text-accent" strokeWidth={1.75} />
        <div className="text-[13px] text-fg-2">{coming}</div>
      </div>
    </div>
  );
}
