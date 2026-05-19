"use client";

/* Phase 2 视觉验收 sandbox · 26 v2 组件全量渲染。
 * Phase 6 决定:保留作 dev 参考,加 noindex 防搜索引擎收录。 */

import { useState } from "react";

import { AIAnalysis } from "@/components/longbridge/AIAnalysis";
import { AlertCalendar } from "@/components/longbridge/AlertCalendar";
import { AlertHot } from "@/components/longbridge/AlertHot";
import { AnalystConsensus } from "@/components/longbridge/AnalystConsensus";
import { CompanyProfile } from "@/components/longbridge/CompanyProfile";
import { DiscussionFeed } from "@/components/longbridge/DiscussionFeed";
import { DividendPlan } from "@/components/longbridge/DividendPlan";
import { DolphinResearch } from "@/components/longbridge/DolphinResearch";
import { EarningsForecast } from "@/components/longbridge/EarningsForecast";
import { EarningsSummary } from "@/components/longbridge/EarningsSummary";
import { EventTracker } from "@/components/longbridge/EventTracker";
import { FinancialHealthScore } from "@/components/longbridge/FinancialHealthScore";
import { FinancialTable } from "@/components/longbridge/FinancialTable";
import { InstitutionalHolding } from "@/components/longbridge/InstitutionalHolding";
import { IntradayChart } from "@/components/longbridge/IntradayChart";
import { KeyFactors } from "@/components/longbridge/KeyFactors";
import { NewsCardBig } from "@/components/longbridge/NewsCardBig";
import { NewsPreview } from "@/components/longbridge/NewsPreview";
import { QuoteHero } from "@/components/longbridge/QuoteHero";
import { QuoteKV } from "@/components/longbridge/QuoteKV";
import { RevenueComposition } from "@/components/longbridge/RevenueComposition";
import { SectorPosition } from "@/components/longbridge/SectorPosition";
import { StockTabs, type StockTabKey } from "@/components/longbridge/StockTabs";
import { TagStrip } from "@/components/longbridge/TagStrip";
import { Valuation } from "@/components/longbridge/Valuation";
import { ValuationHistory } from "@/components/longbridge/ValuationHistory";

import {
  mockQuote,
  mockIntradayMeta,
  mockTags,
  mockQuoteKV,
  mockCompanyProfile,
  mockSectorPosition,
  mockKeyFactorsTree,
  mockAnalystConsensus,
  mockInstitutionalHolding,
  mockFinancialHealth,
  mockIncomeStatement,
  mockBalanceSheet,
  mockCashFlow,
  mockRevenueComposition,
  mockValuation,
  mockDividendHistory,
  mockDividendRecords,
  mockHotEvents,
  mockCalendarEvents,
  mockAIAnalysis,
  mockTrackedEvents,
  mockDolphinReports,
  mockNewsItems,
  mockDiscussions,
  mockEarningsHighlight,
  mockEarningsForecast,
} from "@/mock/stockDetail-lb";

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-8">
      <header className="mb-4 flex items-baseline gap-3 border-b border-hairline pb-2">
        <span className="num text-xs text-fg-3">{num}</span>
        <h2 className="text-lg font-semibold text-fg-1">{title}</h2>
        <code className="text-xs text-fg-3">#{id}</code>
      </header>
      <div>{children}</div>
    </section>
  );
}

export default function V2GalleryPage() {
  const [tab, setTab] = useState<StockTabKey>("overview");

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-fg-1">V2 Components Gallery</h1>
        <p className="mt-1 text-sm text-fg-3">
          Phase 2 视觉验收 · 26 个 longbridge v2 组件全量渲染
        </p>
      </header>

      <Section id="quote-hero" num="01" title="QuoteHero">
        <QuoteHero quote={mockQuote} />
      </Section>

      <Section id="intraday-chart" num="02" title="IntradayChart">
        <IntradayChart meta={mockIntradayMeta} />
      </Section>

      <Section id="tag-strip" num="03" title="TagStrip">
        <TagStrip tags={mockTags} />
      </Section>

      <Section id="quote-kv" num="04" title="QuoteKV">
        <QuoteKV groups={mockQuoteKV} />
      </Section>

      <Section id="company-profile" num="05" title="CompanyProfile">
        <CompanyProfile profile={mockCompanyProfile} />
      </Section>

      <Section id="sector-position" num="06" title="SectorPosition">
        <SectorPosition data={mockSectorPosition} />
      </Section>

      <Section id="key-factors" num="07" title="KeyFactors">
        <KeyFactors root={mockKeyFactorsTree} />
      </Section>

      <Section id="analyst-consensus" num="08" title="AnalystConsensus">
        <AnalystConsensus data={mockAnalystConsensus} />
      </Section>

      <Section id="institutional-holding" num="09" title="InstitutionalHolding">
        <InstitutionalHolding data={mockInstitutionalHolding} />
      </Section>

      <Section id="financial-health-score" num="10" title="FinancialHealthScore">
        <FinancialHealthScore data={mockFinancialHealth} />
      </Section>

      <Section id="financial-table-income" num="11" title="FinancialTable · Income">
        <FinancialTable data={mockIncomeStatement} />
      </Section>

      <Section id="financial-table-balance" num="12" title="FinancialTable · Balance">
        <FinancialTable data={mockBalanceSheet} />
      </Section>

      <Section id="financial-table-cashflow" num="13" title="FinancialTable · CashFlow">
        <FinancialTable data={mockCashFlow} />
      </Section>

      <Section id="revenue-composition" num="14" title="RevenueComposition">
        <RevenueComposition data={mockRevenueComposition} />
      </Section>

      <Section id="valuation" num="15" title="Valuation">
        <Valuation metrics={mockValuation} />
      </Section>

      <Section id="dividend-plan" num="16" title="DividendPlan">
        <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
      </Section>

      <Section id="alert-hot" num="17" title="AlertHot">
        <AlertHot events={mockHotEvents} />
      </Section>

      <Section id="alert-calendar" num="18" title="AlertCalendar">
        <AlertCalendar events={mockCalendarEvents} />
      </Section>

      <Section id="stock-tabs" num="19" title="StockTabs">
        <StockTabs active={tab} onChange={setTab} />
        <div className="mt-3 text-xs text-fg-3">active: {tab}</div>
      </Section>

      <Section id="ai-analysis" num="20" title="AIAnalysis">
        <AIAnalysis data={mockAIAnalysis} />
      </Section>

      <Section id="event-tracker" num="21" title="EventTracker">
        <EventTracker events={mockTrackedEvents} />
      </Section>

      <Section id="dolphin-research" num="22" title="DolphinResearch">
        <DolphinResearch reports={mockDolphinReports} />
      </Section>

      <Section id="news-preview" num="23" title="NewsPreview">
        <NewsPreview items={mockNewsItems} />
      </Section>

      <Section id="earnings-summary" num="24" title="EarningsSummary">
        <EarningsSummary data={mockEarningsHighlight} />
      </Section>

      <Section id="earnings-forecast" num="25" title="EarningsForecast">
        <EarningsForecast quarters={mockEarningsForecast} />
      </Section>

      <Section id="valuation-history" num="26" title="ValuationHistory">
        <ValuationHistory />
      </Section>

      <Section id="news-card-big" num="27" title="NewsCardBig">
        <NewsCardBig items={mockNewsItems} />
      </Section>

      <Section id="discussion-feed" num="28" title="DiscussionFeed">
        <DiscussionFeed posts={mockDiscussions} />
      </Section>
    </div>
  );
}
