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
import { EarningsSummary } from "@/components-longbridge/EarningsSummary";

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
  mockEarningsHighlight,
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

/** P1 概览:IntradayChart / CompanyProfile / EventTracker+DolphinResearch / NewsPreview / DiscussionPreview
 *   去掉 #04 QuoteKV
 */
function TabOverview() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
      <CompanyProfile profile={mockCompanyProfile} />
      {/* 左右并排:事件追踪 + 海豚投研 */}
      <div className="grid grid-cols-2 border-b border-line">
        <div className="border-r border-line">
          <EventTracker events={mockTrackedEvents} />
        </div>
        <DolphinResearch reports={mockDolphinReports} />
      </div>
      <NewsPreview items={mockNewsItems.slice(0, 5)} />
      <DiscussionPreview posts={mockDiscussions} />
    </>
  );
}

/** P1 财务:EarningsSummary / Income / Balance / CashFlow / RevenueComposition / DividendPlan
 *   去掉 #10 FinancialHealthScore(迁至 分析 Tab)
 */
function TabFinancial() {
  return (
    <>
      <EarningsSummary data={mockEarningsHighlight} />
      <FinancialTable data={mockIncomeStatement} />
      <FinancialTable data={mockBalanceSheet} />
      <FinancialTable data={mockCashFlow} />
      <RevenueComposition data={mockRevenueComposition} />
      <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
    </>
  );
}

/** P1 分析:AnalystConsensus / InstitutionalHolding / KeyFactors / FinancialHealthScore / Valuation
 *   在 #07 KeyFactors 之后插入 #10 FinancialHealthScore
 */
function TabAnalysis() {
  return (
    <>
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
      <KeyFactors root={mockKeyFactorsTree} />
      <FinancialHealthScore data={mockFinancialHealth} />
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
