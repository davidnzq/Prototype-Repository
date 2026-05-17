import { useState } from "react";
import { QuoteHero } from "@/components-longbridge/QuoteHero";
import { IntradayChart } from "@/components-longbridge/IntradayChart";
import { AIAnalysis } from "@/components-longbridge/AIAnalysis";
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
import { DiscussionFeed } from "@/components-longbridge/DiscussionFeed";
import { NewsCardBig } from "@/components-longbridge/NewsCardBig";
import { EventTracker } from "@/components-longbridge/EventTracker";
import { QuoteKV } from "@/components-longbridge/QuoteKV";
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
  mockQuoteKV,
  mockEarningsHighlight,
  mockAIAnalysis,
} from "@/mock/stockDetail-lb";

/**
 * 个股详情页 V2.1 — V2 的精简变体
 *   - 复用全部 `components-longbridge/*` 组件 + `stockDetail-lb` mock
 *   - 与 V2 唯一区别:概览 Tab **不含** NewsPreview + DiscussionPreview
 *   - 适用场景:需要纯个股基础信息(行情+公司+研报)而不夹带社区/新闻摘要的视图
 */
export function StockDetailLBv21Page() {
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

/** V2.1 概览:
 *   - 相对 V2 移除 NewsPreview + DiscussionPreview
 *   - 相对 V2 新增 AIAnalysis(置于 CompanyProfile 之前)
 */
function TabOverview() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
      <QuoteKV groups={mockQuoteKV} />
      <AIAnalysis data={mockAIAnalysis} />
      <CompanyProfile profile={mockCompanyProfile} />
      {/* 左右并排:事件追踪 + 海豚投研 */}
      <div className="grid grid-cols-2 border-b border-line">
        <div className="border-r border-line">
          <EventTracker events={mockTrackedEvents} />
        </div>
        <DolphinResearch reports={mockDolphinReports} />
      </div>
    </>
  );
}

function TabFinancial() {
  return (
    <>
      <EarningsSummary data={mockEarningsHighlight} />
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
