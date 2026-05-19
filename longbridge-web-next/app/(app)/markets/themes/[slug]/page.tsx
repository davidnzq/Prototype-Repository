// Stage C placeholder · 主题详情(mock-only)
import Link from "next/link";
import { ChevronLeft, Flame } from "lucide-react";
import { getTheme } from "@/mock/themes";
import { notFound } from "next/navigation";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const theme = getTheme(slug);
  if (!theme) notFound();
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/markets"
        className="inline-flex items-center gap-1 text-[12px] text-fg-3 hover:text-accent"
      >
        <ChevronLeft size={14} />
        Markets
      </Link>
      <div className="caps mt-3 text-fg-3">Stage C placeholder · 主题详情</div>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-fg-1">
        <Flame size={22} className="text-warn" />
        {theme.name}
      </h1>
      <p className="mt-1 text-[12px] text-fg-3">{theme.tagline}</p>
      <p className="mt-3 text-[12px] leading-[18px] text-fg-2">
        {theme.narrative}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-4">
          <div className="caps mb-2 text-accent">说明</div>
          <p className="text-[12px] text-fg-1">{theme.description}</p>
        </div>
        <div className="rounded-md border border-hairline-strong bg-bg-1 p-4">
          <div className="caps mb-2 text-accent">成分</div>
          <ul className="grid grid-cols-2 gap-2 text-[12px] text-fg-1">
            {theme.symbols.map((c: string) => (
              <li key={c} className="num font-semibold">
                {c.split(".")[0]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
