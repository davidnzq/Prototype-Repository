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

/** P2 概览:IntradayChart / AIAnalysis / CompanyProfile / EventTracker+DolphinResearch
 *   去掉 #04 QuoteKV
 *   相对 P1:新增 AIAnalysis,且无 NewsPreview / DiscussionPreview
 */
function TabOverview() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
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

/** V2.1 财务(Figma 方案 V2.1):
 *   #24 业绩摘要 → #11 利润表 → #12 资产负债 → #13 现金流 → #16 分配方案
 *   (相对 V2 移除 FinancialHealthScore + RevenueComposition,二者迁至 分析 Tab)
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

/** V2.1 分析(Figma 方案 V2.1):
 *   #08 分析师 → #09 持股股东 → #07 关键因子 → #14 营收构成 → #10 财务评分 → #15 估值分析
 *   (新增 RevenueComposition + FinancialHealthScore,从 财务 Tab 迁入)
 */
function TabAnalysis() {
  return (
    <>
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
      <KeyFactors root={mockKeyFactorsTree} />
      <RevenueComposition data={mockRevenueComposition} />
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
