import type { NewsItem } from "@/mock/stockDetail-lb";
import { SectionHeader } from "./QuoteKV";
import { NewsRow } from "./NewsPreview";

interface NewsCardBigProps {
  items: NewsItem[];
}

/**
 * 资讯大列表 — 长桥版
 * 不再有封面图;统一使用紧凑列表(标题加大 + 来源 + 涨跌幅 tag)
 */
export function NewsCardBig({ items }: NewsCardBigProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="资讯" hint="最新资讯 (Recent News)" />
      <ul className="divide-y divide-hairline">
        {items.map((n, i) => (
          <NewsRow key={i} item={n} />
        ))}
      </ul>
    </section>
  );
}
