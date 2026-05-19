"use client";

/* Phase 4 · 个股详情实装 · v2 26 组件 + 5 tab 布局
 * mock-only:不接 longport quote/kline。所有 symbol 兜底到 AAPL mock。 */

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { QuoteHero } from "@/components/longbridge/QuoteHero";
import { IntradayChart } from "@/components/longbridge/IntradayChart";
import { TagStrip } from "@/components/longbridge/TagStrip";
import { QuoteKV } from "@/components/longbridge/QuoteKV";
import { StockTabs, type StockTabKey } from "@/components/longbridge/StockTabs";

import { AIAnalysis } from "@/components/longbridge/AIAnalysis";
import { EventTracker } from "@/components/longbridge/EventTracker";
import { DolphinResearch } from "@/components/longbridge/DolphinResearch";
import { CompanyProfile } from "@/components/longbridge/CompanyProfile";
import { SectorPosition } from "@/components/longbridge/SectorPosition";
import { KeyFactors } from "@/components/longbridge/KeyFactors";
import { AnalystConsensus } from "@/components/longbridge/AnalystConsensus";
import { InstitutionalHolding } from "@/components/longbridge/InstitutionalHolding";
import { FinancialHealthScore } from "@/components/longbridge/FinancialHealthScore";
import { EarningsSummary } from "@/components/longbridge/EarningsSummary";
import { EarningsForecast } from "@/components/longbridge/EarningsForecast";

import { FinancialTable } from "@/components/longbridge/FinancialTable";
import { RevenueComposition } from "@/components/longbridge/RevenueComposition";
import { Valuation } from "@/components/longbridge/Valuation";
import { DividendPlan } from "@/components/longbridge/DividendPlan";
import { ValuationHistory } from "@/components/longbridge/ValuationHistory";

import { AlertHot } from "@/components/longbridge/AlertHot";
import { NewsCardBig } from "@/components/longbridge/NewsCardBig";
import { NewsPreview } from "@/components/longbridge/NewsPreview";
import { DiscussionFeed } from "@/components/longbridge/DiscussionFeed";

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
  mockAIAnalysis,
  mockTrackedEvents,
  mockDolphinReports,
  mockNewsItems,
  mockDiscussions,
  mockEarningsHighlight,
  mockEarningsForecast,
} from "@/mock/stockDetail-lb";

export default function StockPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = decodeURIComponent(params?.symbol ?? "AAPL.US");
  const isAapl = symbol.toUpperCase().startsWith("AAPL");
  const [tab, setTab] = useState<StockTabKey>("overview");

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <Link
        href="/markets"
        className="inline-flex items-center gap-1 text-[12px] text-fg-3 transition-colors hover:text-accent"
      >
        <ChevronLeft size={14} />
        Markets
      </Link>

      {!isAapl && (
        <div className="mt-3 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-fg-1">
          ⚠️ symbol <code className="num">{symbol}</code> 暂无完整 mock 数据,以 AAPL.US 兜底显示
        </div>
      )}

      <section className="mt-4 space-y-3">
        <QuoteHero quote={mockQuote} />
        <IntradayChart meta={mockIntradayMeta} />
        <TagStrip tags={mockTags} />
        <QuoteKV groups={mockQuoteKV} />
      </section>

      <div className="mt-6">
        <StockTabs active={tab} onChange={setTab} />
      </div>

      <div className="mt-4 space-y-6">
        {tab === "overview" && (
          <>
            <AIAnalysis data={mockAIAnalysis} />
            <EventTracker events={mockTrackedEvents} />
            <DolphinResearch reports={mockDolphinReports} />
            <CompanyProfile profile={mockCompanyProfile} />
            <SectorPosition data={mockSectorPosition} />
            <KeyFactors root={mockKeyFactorsTree} />
            <AnalystConsensus data={mockAnalystConsensus} />
            <InstitutionalHolding data={mockInstitutionalHolding} />
            <FinancialHealthScore data={mockFinancialHealth} />
            <EarningsSummary data={mockEarningsHighlight} />
            <EarningsForecast quarters={mockEarningsForecast} />
          </>
        )}

        {tab === "financial" && (
          <>
            <FinancialTable data={mockIncomeStatement} />
            <FinancialTable data={mockBalanceSheet} />
            <FinancialTable data={mockCashFlow} />
            <RevenueComposition data={mockRevenueComposition} />
            <Valuation metrics={mockValuation} />
            <DividendPlan history={mockDividendHistory} records={mockDividendRecords} />
            <ValuationHistory />
          </>
        )}

        {tab === "news" && (
          <>
            <AlertHot events={mockHotEvents} />
            <NewsCardBig items={mockNewsItems} />
            <NewsPreview items={mockNewsItems} />
          </>
        )}

        {tab === "discussion" && <DiscussionFeed posts={mockDiscussions} />}

        {tab === "analysis" && (
          <div className="rounded-md border border-hairline-strong bg-card p-6 text-center text-[12px] text-fg-3">
            Analysis tab · Phase 4 暂留占位
          </div>
        )}
      </div>
    </div>
  );
}
