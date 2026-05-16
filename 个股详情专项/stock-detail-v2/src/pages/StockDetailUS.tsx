import { useState } from "react";
import { QuoteHero } from "@/components-us/QuoteHero";
import { IntradayChart } from "@/components-us/IntradayChart";
import { CompanyProfile } from "@/components-us/CompanyProfile";
import { AnalystConsensus } from "@/components-us/AnalystConsensus";
import { InstitutionalHolding } from "@/components-us/InstitutionalHolding";
import { FinancialTable } from "@/components-us/FinancialTable";
import { RevenueComposition } from "@/components-us/RevenueComposition";
import { Valuation } from "@/components-us/Valuation";
import { StockTabs, type StockTabKey } from "@/components-us/StockTabs";
import { NewsCardBig } from "@/components-us/NewsCardBig";
import { DiscussionFeed } from "@/components-us/DiscussionFeed";
import { QuoteKV } from "@/components-us/QuoteKV";
import { EarningsForecast } from "@/components-us/EarningsForecast";
import { EarningsSummary } from "@/components-us/EarningsSummary";
import { OrderBookL2 } from "@/components-us/OrderBookL2";
import { CapitalFlow } from "@/components-us/CapitalFlow";
import { Shorting } from "@/components-us/Shorting";
import { StickyTradeBar } from "@/components-us/StickyTradeBar";
import { BottomTabNav } from "@/components-us/BottomTabNav";

import {
  mockQuote,
  mockIntradayMeta,
  mockCompanyProfile,
  mockAnalystConsensus,
  mockInstitutionalHolding,
  mockIncomeStatement,
  mockBalanceSheet,
  mockCashFlow,
  mockRevenueComposition,
  mockValuation,
  mockQuoteKV,
  mockNewsItems,
  mockDiscussions,
  mockEarningsForecast,
  mockEarningsHighlight,
  mockOrderBookL2,
  mockCapitalFlow,
  mockShorting,
} from "@/mock/stockDetail-us";

/**
 * US 个股详情 — 桌面 Web 标准容器(--ctn-max = 1280px),跟 LB / Bloomberg 同宽。
 * 4 Tab:Quote / Overview / News / Community。
 *
 * Phase 0 脚手架:Tab 内容暂用 LB 组件占位,Phase 2 逐个替换为 US 专属形态。
 */
export function StockDetailUSPage() {
  const [tab, setTab] = useState<StockTabKey>("overview");

  return (
    <>
      <div className="mx-auto max-w-[var(--ctn-max)]">
        <QuoteHero quote={mockQuote} />
      </div>

      <div className="mx-auto max-w-[var(--ctn-max)]">
        <StockTabs active={tab} onChange={setTab} />
      </div>

      <main className="mx-auto max-w-[var(--ctn-max)]">
        {tab === "quote"     && <TabQuote />}
        {tab === "overview"  && <TabOverview />}
        {tab === "news"      && <TabNews />}
        {tab === "community" && <TabCommunity />}
      </main>

      {/* Bottom sticky CTAs(仅 Quote tab 显示)*/}
      {tab === "quote" && (
        <div className="mx-auto max-w-[var(--ctn-max)]">
          <StickyTradeBar />
          <BottomTabNav active="markets" />
        </div>
      )}
    </>
  );
}

function TabQuote() {
  return (
    <>
      <IntradayChart meta={mockIntradayMeta} />
      <QuoteKV groups={mockQuoteKV} />
      <OrderBookL2 data={mockOrderBookL2} />
      <CapitalFlow data={mockCapitalFlow} />
      <Shorting data={mockShorting} />
    </>
  );
}

function TabOverview() {
  return (
    <>
      <CompanyProfile profile={mockCompanyProfile} />
      <AnalystConsensus data={mockAnalystConsensus} />
      <InstitutionalHolding data={mockInstitutionalHolding} />
      <RevenueComposition data={mockRevenueComposition} />
      <EarningsForecast data={mockEarningsForecast} />
      <EarningsSummary data={mockEarningsHighlight} />
      <FinancialTable
        reports={[mockIncomeStatement, mockBalanceSheet, mockCashFlow]}
      />
      <Valuation metrics={mockValuation} />{/* US donut + industry rank */}
    </>
  );
}

function TabNews() {
  return <NewsCardBig items={mockNewsItems} />;
}

function TabCommunity() {
  return <DiscussionFeed posts={mockDiscussions} />;
}
