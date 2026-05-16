import { useState } from "react";
import { QuoteHero } from "@/components-longbridge/QuoteHero";
import { IntradayChart } from "@/components-longbridge/IntradayChart";
import { CompanyProfile } from "@/components-longbridge/CompanyProfile";
import { KeyFactors } from "@/components-longbridge/KeyFactors";
import { AnalystConsensus } from "@/components-longbridge/AnalystConsensus";
import { InstitutionalHolding } from "@/components-longbridge/InstitutionalHolding";
import { FinancialHealthScore } from "@/components-longbridge/FinancialHealthScore";
import { FinancialTable } from "@/components-longbridge/FinancialTable";
import { RevenueComposition } from "@/components-longbridge/RevenueComposition";
import { Valuation } from "@/components-longbridge/Valuation";
import { DividendPlan } from "@/components-longbridge/DividendPlan";
import { AlertHot } from "@/components-longbridge/AlertHot";
import { AlertCalendar } from "@/components-longbridge/AlertCalendar";
import { StockTabs, type StockTabKey } from "@/components-longbridge/StockTabs";
import { DolphinResearch } from "@/components-longbridge/DolphinResearch";
import { NewsPreview } from "@/components-longbridge/NewsPreview";
import { DiscussionFeed, DiscussionPreview } from "@/components-longbridge/DiscussionFeed";
import { NewsCardBig } from "@/components-longbridge/NewsCardBig";
import { EventTracker } from "@/components-longbridge/EventTracker";

import {
  mockQuote,
  mockIntradayMeta,
  mockCompanyProfile,
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
  mockDolphinReports,
  mockNewsItems,
  mockDiscussions,
  mockTrackedEvents,
} from "@/mock/stockDetail-lb";

/**
 * 个股详情页 — 5 Tab 集成版
 * QuoteHero + Alert × 2 + Tab Bar(sticky) + 5 个 Tab 内容
 */
export function StockDetailLBPage() {
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
      <CompanyProfile profile={mockCompanyProfile} />
      <DolphinResearch reports={mockDolphinReports} />
      <EventTracker events={mockTrackedEvents} />
      <NewsPreview items={mockNewsItems.slice(0, 5)} />
      <DiscussionPreview posts={mockDiscussions} />
    </>
  );
}

function TabFinancial() {
  return (
    <>
      <FinancialHealthScore data={mockFinancialHealth} />
      <FinancialTable data={mockIncomeStatement} />
      <FinancialTable data={mockBalanceSheet} />
      <FinancialTable data={mockCashFlow} />
      <RevenueComposition data={mockRevenueComposition} />
      <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
    </>
  );
}

function TabAnalysis() {
  return (
    <>
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
      <KeyFactors root={mockKeyFactorsTree} />
      <Valuation metrics={mockValuation} />
    </>
  );
}

function TabNews() {
  return <NewsCardBig items={mockNewsItems} />;
}

function TabDiscussion() {
  return <DiscussionFeed posts={mockDiscussions} />;
}
