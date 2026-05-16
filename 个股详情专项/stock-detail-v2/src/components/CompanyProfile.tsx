import type { CompanyProfile as Profile } from "@/mock/stockDetail";
import { formatInt } from "@/lib/utils";
import { SectionHeader } from "./QuoteKV";

interface CompanyProfileProps {
  profile: Profile;
}

/**
 * 公司概况 — Bloomberg DES 页风格
 * 上半:描述文字(可展开,这里直接全展示)
 * 下半:6 列 KV 矩阵(CEO/Founded/HQ/Employees/IPO/Fiscal Year)
 */
export function CompanyProfile({ profile }: CompanyProfileProps) {
  return (
    <section className="border-b border-line">
      <SectionHeader label="Company Description" hint="DES" />
      <div className="grid grid-cols-[1fr_280px] divide-x divide-hairline">
        {/* 描述文字 */}
        <div className="px-4 py-3">
          <p className="text-base leading-relaxed text-fg-2">{profile.description}</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-3 text-sm">
            <span className="caps">Sector</span>
            <span className="text-fg-1">{profile.sector}</span>
            <span className="text-fg-4">·</span>
            <span className="caps">Industry</span>
            <span className="text-fg-1">{profile.industry}</span>
            <span className="text-fg-4">·</span>
            <span className="caps">Sub-Industry</span>
            <span className="text-fg-1">{profile.subIndustry}</span>
          </div>
        </div>

        {/* 右侧 KV */}
        <dl className="divide-y divide-hairline px-4 text-base">
          <Row label="CEO" value={profile.ceo} />
          <Row label="Founded" value={String(profile.founded)} mono />
          <Row label="HQ" value={profile.hq} />
          <Row label="Employees" value={formatInt(profile.employees)} mono />
          <Row label="IPO Date" value={profile.ipoDate} mono />
          <Row label="Fiscal YE" value={profile.fiscalYearEnd} mono />
          <Row label="Website" value={profile.website} link />
        </dl>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  link,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="caps">{label}</dt>
      <dd
        className={
          link
            ? "text-base text-accent hover:underline"
            : mono
              ? "num text-base text-fg-1"
              : "text-base text-fg-1"
        }
      >
        {value}
      </dd>
    </div>
  );
}
