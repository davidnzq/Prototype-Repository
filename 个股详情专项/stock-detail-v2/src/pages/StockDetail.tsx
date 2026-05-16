import { useState } from "react";
import { QuoteHero } from "@/components/QuoteHero";
import { IntradayChart } from "@/components/IntradayChart";
import { TagStrip } from "@/components/TagStrip";
import { QuoteKV } from "@/components/QuoteKV";
import { CompanyProfile } from "@/components/CompanyProfile";
import { SectorPosition } from "@/components/SectorPosition";
import { KeyFactors } from "@/components/KeyFactors";
import { AnalystConsensus } from "@/components/AnalystConsensus";
import { InstitutionalHolding } from "@/components/InstitutionalHolding";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { FinancialTable } from "@/components/FinancialTable";
import { RevenueComposition } from "@/components/RevenueComposition";
import { Valuation } from "@/components/Valuation";
import { DividendPlan } from "@/components/DividendPlan";
import { AlertHot } from "@/components/AlertHot";
import { AlertCalendar } from "@/components/AlertCalendar";
import { StockTabs, type StockTabKey } from "@/components/StockTabs";
import { AIAnalysis } from "@/components/AIAnalysis";
import { EventTracker } from "@/components/EventTracker";
import { DolphinResearch } from "@/components/DolphinResearch";
import { NewsPreview } from "@/components/NewsPreview";
import { DiscussionFeed, DiscussionPreview } from "@/components/DiscussionFeed";
import { EarningsSummary } from "@/components/EarningsSummary";
import { EarningsForecast } from "@/components/EarningsForecast";
import { NewsCardBig } from "@/components/NewsCardBig";
import { ValuationHistory } from "@/components/ValuationHistory";

import {
  mockQuote,
  mockIntradayMeta,
  mockTags,
  mockQuoteKV,
  mockCompanyProfile,
  mockSectorPosition,
  mockKeyFactors,
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
} from "@/mock/stockDetail";

/**
 * 个股详情页 — 5 Tab 集成版
 * QuoteHero + Alert × 2 + Tab Bar(sticky) + 5 个 Tab 内容
 */
export function StockDetailPage() {
  const [tab, setTab] = useState<StockTabKey>("overview");

  return (
    <>
      <div className="mx-auto max-w-[var(--ctn-max)]">
        <QuoteHero quote={mockQuote} />
      </div>

      <div className="mx-auto max-w-[var(--ctn-max)]">
        <AlertHot events={mockHotEvents} />
        <AlertCalendar events={mockCalendarEvents} />
      </div>

      <div className="mx-auto max-w-[var(--ctn-max)]">
        <StockTabs active={tab} onChange={setTab} />
      </div>

      <main className="mx-auto max-w-[var(--ctn-max)]">
        {tab === "overview" && <TabOverview />}
        {tab === "financial" && <TabFinancial />}
        {tab === "analysis" && <TabAnalysis />}
        {tab === "news" && <TabNews />}
        {tab === "discussion" && <TabDiscussion />}
      </main>
    </>
  );
}

function TabOverview() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
      <TagStrip tags={mockTags} />
      <QuoteKV groups={mockQuoteKV} />
      <AIAnalysis data={mockAIAnalysis} />
      <CompanyProfile profile={mockCompanyProfile} />
      <SectorPosition data={mockSectorPosition} />
      <EventTracker events={mockTrackedEvents} />
      <DolphinResearch reports={mockDolphinReports} />
      <NewsPreview items={mockNewsItems.slice(0, 5)} />
      <DiscussionPreview posts={mockDiscussions} />
    </>
  );
}

function TabFinancial() {
  return (
    <>
      <EarningsSummary data={mockEarningsHighlight} />
      <EarningsForecast quarters={mockEarningsForecast} />
      <FinancialHealthScore data={mockFinancialHealth} />
      <FinancialTable title="Income Statement" hint="IS" data={mockIncomeStatement} />
      <FinancialTable title="Balance Sheet" hint="BS" data={mockBalanceSheet} />
      <FinancialTable title="Cash Flow Statement" hint="CF" data={mockCashFlow} />
      <RevenueComposition segments={mockRevenueComposition} />
      <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
    </>
  );
}

function TabAnalysis() {
  return (
    <>
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
      <KeyFactors groups={mockKeyFactors} />
      <Valuation metrics={mockValuation} />
      <ValuationHistory />
    </>
  );
}

function TabNews() {
  return <NewsCardBig items={mockNewsItems} />;
}

function TabDiscussion() {
  return <DiscussionFeed posts={mockDiscussions} />;
}
