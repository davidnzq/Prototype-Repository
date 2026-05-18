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
  mockAIAnalysis,
} from "@/mock/stockDetail-lb";

/**
 * 个股详情 P3 — 基于 Figma "个股详情的信息结构" → Stock Detail P3
 *   复用全部 `components-longbridge/*` + `stockDetail-lb` mock(零新增组件/mock)
 *
 *   差异(相对 P2):
 *     - 概览:CompanyProfile 不在概览(下沉到分析)
 *     - 分析:CompanyProfile 置顶,新增 AnalystConsensus / InstitutionalHolding 在末尾
 */
export function StockDetailLBp3Page() {
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

/** P3 概览:IntradayChart / AIAnalysis / EventTracker+DolphinResearch
 *   - 无 #04 QuoteKV(同 P2)
 *   - 无 #05 CompanyProfile(下沉到 分析 Tab 首位)
 *   - 无 NewsPreview / DiscussionPreview(同 P2)
 */
function TabOverview() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
      <AIAnalysis data={mockAIAnalysis} />
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

/** P3 财务:EarningsSummary / Income / Balance / CashFlow / DividendPlan
 *   同 P2 — RevenueComposition + FinancialHealthScore 不在财务
 */
function TabFinancial() {
  return (
    <>
      <EarningsSummary data={mockEarningsHighlight} />
      <FinancialTable data={mockIncomeStatement} />
      <FinancialTable data={mockBalanceSheet} />
      <FinancialTable data={mockCashFlow} />
      <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
    </>
  );
}

/** P3 分析:CompanyProfile / KeyFactors / RevenueComposition / FinancialHealthScore /
 *           Valuation / AnalystConsensus / InstitutionalHolding(共 7 模块)
 *   相对 P2:
 *     - CompanyProfile 进入分析 Tab(置首)
 *     - AnalystConsensus + InstitutionalHolding 下沉到末尾(P2 在首)
 */
function TabAnalysis() {
  return (
    <>
      <CompanyProfile profile={mockCompanyProfile} />
      <KeyFactors root={mockKeyFactorsTree} />
      <RevenueComposition data={mockRevenueComposition} />
      <FinancialHealthScore data={mockFinancialHealth} />
      <Valuation metrics={mockValuation} />
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
    </>
  );
}

function TabNews() {
  return <NewsCardBig items={mockNewsItems} />;
}

function TabDiscussion() {
  return <DiscussionFeed posts={mockDiscussions} />;
}
