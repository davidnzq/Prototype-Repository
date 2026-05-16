import type { ReactNode } from "react";
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
import { StockTabs } from "@/components/StockTabs";
import { AIAnalysis } from "@/components/AIAnalysis";
import { EventTracker } from "@/components/EventTracker";
import { DolphinResearch } from "@/components/DolphinResearch";
import { NewsPreview } from "@/components/NewsPreview";
import { DiscussionFeed } from "@/components/DiscussionFeed";
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
 * 组件目录页 — Storybook 风格
 * - 左侧 sticky TOC,**点击在页面内 smooth scroll**(不改 URL hash,避免被 App.tsx 切回 StockDetail)
 * - 右侧每个组件 isolated 展示,中英文对照名 + 分类 + 一句说明
 */

interface ComponentEntry {
  id: string;
  num: string;
  name: string;     // 英文
  nameZh: string;   // 中文
  category: string;
  desc: string;
  node: ReactNode;
}

const ENTRIES: ComponentEntry[] = [
  // ─── 报价头与基础信息 ─────────────────────────
  { id: "quote-hero", num: "01", name: "QuoteHero", nameZh: "报价头部", category: "报价头",
    desc: "ticker bar / 大字价 60px / 涨跌 / 盘前 / 6 KV",
    node: <QuoteHero quote={mockQuote} /> },
  { id: "intraday-chart", num: "02", name: "IntradayChart", nameZh: "分时 / K 线", category: "报价头",
    desc: "9 Tab(分时/5日/日K/周K/月K/年K/1分/5分/15分)+ LINE/CANDLE 双模式 + VWAP",
    node: <IntradayChart meta={mockIntradayMeta} /> },
  { id: "tag-strip", num: "03", name: "TagStrip", nameZh: "标签区", category: "报价头",
    desc: "3 类目(行业/概念/资金)× text link + 涨跌 inline pct",
    node: <TagStrip tags={mockTags} /> },
  { id: "quote-kv", num: "04", name: "QuoteKV", nameZh: "行情数据", category: "报价头",
    desc: "5 group × 6 KV = 30 个数据点(Trading/Val/Prof/Growth/Returns)",
    node: <QuoteKV groups={mockQuoteKV} /> },

  // ─── 公司与行业 ─────────────────────────
  { id: "company-profile", num: "05", name: "CompanyProfile", nameZh: "公司概况", category: "公司与行业",
    desc: "描述 + 7 个 metadata KV(CEO/Founded/HQ/Employees/IPO/FY/Website)",
    node: <CompanyProfile profile={mockCompanyProfile} /> },
  { id: "sector-position", num: "06", name: "SectorPosition", nameZh: "行业定位", category: "公司与行业",
    desc: "Sector 概览 + peer 表格(Mkt Cap/PE/1D/YTD)",
    node: <SectorPosition data={mockSectorPosition} /> },
  { id: "key-factors", num: "07", name: "KeyFactors", nameZh: "关键因子", category: "公司与行业",
    desc: "4 group × 3 节点,每个带 score bar + benchmark",
    node: <KeyFactors groups={mockKeyFactors} /> },

  // ─── 分析与持仓 ─────────────────────────
  { id: "analyst-consensus", num: "08", name: "AnalystConsensus", nameZh: "分析师评级", category: "分析与持仓",
    desc: "Mean rating + stacked bar + target price bullet + revisions",
    node: <AnalystConsensus data={mockAnalystConsensus} /> },
  { id: "institutional-holding", num: "09", name: "InstitutionalHolding", nameZh: "机构持仓", category: "分析与持仓",
    desc: "Ownership 3 段 + Top 8 holders + 4Q net flow waterfall",
    node: <InstitutionalHolding data={mockInstitutionalHolding} /> },
  { id: "financial-health-score", num: "10", name: "FinancialHealthScore", nameZh: "财务评分", category: "分析与持仓",
    desc: "Overall + Rating badge + 4 维度 bullet vs peer",
    node: <FinancialHealthScore data={mockFinancialHealth} /> },

  // ─── 三大财务报表 ─────────────────────────
  { id: "income-statement", num: "11", name: "FinancialTable · Income", nameZh: "利润表", category: "财务报表",
    desc: "利润表 12 行,Revenue/COGS/Gross/Op Income/Net Income 4 期 + YoY",
    node: <FinancialTable title="Income Statement" hint="IS" data={mockIncomeStatement} /> },
  { id: "balance-sheet", num: "12", name: "FinancialTable · Balance", nameZh: "资产负债表", category: "财务报表",
    desc: "资产负债表 12 行,流动资产/总资产/负债/股东权益",
    node: <FinancialTable title="Balance Sheet" hint="BS" data={mockBalanceSheet} /> },
  { id: "cash-flow", num: "13", name: "FinancialTable · CashFlow", nameZh: "现金流表", category: "财务报表",
    desc: "现金流表 11 行,经营/投资/筹资 + FCF",
    node: <FinancialTable title="Cash Flow Statement" hint="CF" data={mockCashFlow} /> },

  // ─── 估值与分红 ─────────────────────────
  { id: "revenue-composition", num: "14", name: "RevenueComposition", nameZh: "营收构成", category: "估值与分红",
    desc: "6 segments stacked bar + segment table(Rev / % / YoY δpp)",
    node: <RevenueComposition segments={mockRevenueComposition} /> },
  { id: "valuation", num: "15", name: "Valuation", nameZh: "估值分析", category: "估值与分红",
    desc: "Morningstar bullet × 6 metrics(P/E,EV/EBITDA,P/S,P/B,P/FCF)",
    node: <Valuation metrics={mockValuation} /> },
  { id: "dividend-plan", num: "16", name: "DividendPlan", nameZh: "分红方案", category: "估值与分红",
    desc: "5 年 DPS 柱 + Yield 折线 + 最近 4 次分红记录表",
    node: <DividendPlan history={mockDividendHistory} records={mockDividendRecords} /> },

  // ─── 顶部条 ─────────────────────────
  { id: "alert-hot", num: "17", name: "AlertHot", nameZh: "热点事件", category: "顶部条",
    desc: "热点跑马灯 - 5 条 inline 事件(time/title/source/sentiment)",
    node: <AlertHot events={mockHotEvents} /> },
  { id: "alert-calendar", num: "18", name: "AlertCalendar", nameZh: "公告与日程", category: "顶部条",
    desc: "公告日程跑马灯 - 即将发生的事件 inline",
    node: <AlertCalendar events={mockCalendarEvents} /> },
  { id: "stock-tabs", num: "19", name: "StockTabs", nameZh: "Tab 切换栏", category: "顶部条",
    desc: "5 Tab Bar(概览/财务/分析/资讯/讨论)+ 受控切换 + sticky 在顶栏下",
    node: <StockTabs active="overview" onChange={() => {}} /> },

  // ─── Tab · 概览 ─────────────────────────
  { id: "ai-analysis", num: "20", name: "AIAnalysis", nameZh: "AI 分析", category: "Tab · 概览",
    desc: "Signal pills × 4 + Bull/Bear 双栏 + AI 摘要(brand-soft 强调)",
    node: <AIAnalysis data={mockAIAnalysis} /> },
  { id: "event-tracker", num: "21", name: "EventTracker", nameZh: "事件跟踪", category: "Tab · 概览",
    desc: "事件时间线表格(Earnings/M&A/Product/Regulatory/Analyst/Insider)",
    node: <EventTracker events={mockTrackedEvents} /> },
  { id: "dolphin-research", num: "22", name: "DolphinResearch", nameZh: "海豚投研", category: "Tab · 概览",
    desc: "海豚投研报告卡(分类标签 + 评级 + 目标价 + 摘要)",
    node: <DolphinResearch reports={mockDolphinReports} /> },
  { id: "news-preview", num: "23", name: "NewsPreview", nameZh: "资讯预览", category: "Tab · 概览",
    desc: "资讯紧凑列表(time/source/sentiment/title)",
    node: <NewsPreview items={mockNewsItems.slice(0, 5)} /> },

  // ─── Tab · 财务 ─────────────────────────
  { id: "earnings-summary", num: "24", name: "EarningsSummary", nameZh: "业绩摘要", category: "Tab · 财务",
    desc: "Rev / EPS / Surprise 3 列对比(actual vs estimate)+ Guidance",
    node: <EarningsSummary data={mockEarningsHighlight} /> },
  { id: "earnings-forecast", num: "25", name: "EarningsForecast", nameZh: "业绩预测", category: "Tab · 财务",
    desc: "季度 forecast 表(Rev Low/Mean/High + spread bar + EPS + #)",
    node: <EarningsForecast quarters={mockEarningsForecast} /> },

  // ─── Tab · 分析 ─────────────────────────
  { id: "valuation-history", num: "26", name: "ValuationHistory", nameZh: "估值历史", category: "Tab · 分析",
    desc: "5Y P/E 折线 + peer avg 虚线 + 5Y/Peer/Premium 对比",
    node: <ValuationHistory /> },

  // ─── 资讯 / 讨论 ─────────────────────────
  { id: "news-card-big", num: "27", name: "NewsCardBig", nameZh: "资讯大卡", category: "Tab · 资讯",
    desc: "Featured 大卡(cover + summary)+ 紧凑列表",
    node: <NewsCardBig items={mockNewsItems} /> },
  { id: "discussion-feed", num: "28", name: "DiscussionFeed", nameZh: "讨论流", category: "Tab · 讨论",
    desc: "讨论流(user/time/content/likes/comments/attached ticker)",
    node: <DiscussionFeed posts={mockDiscussions} /> },
];

const CATEGORIES = [
  "报价头",
  "公司与行业",
  "分析与持仓",
  "财务报表",
  "估值与分红",
  "顶部条",
  "Tab · 概览",
  "Tab · 财务",
  "Tab · 分析",
  "Tab · 资讯",
  "Tab · 讨论",
];

/**
 * TOC 点击:在页面内 smooth scroll 到目标组件
 * 不改 URL hash,避免 hashchange 触发 App.tsx 把页面切回 StockDetail
 */
function scrollToEntry(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ComponentGalleryPage() {
  return (
    <div className="mx-auto grid max-w-[var(--ctn-max-wide)] grid-cols-[240px_1fr] gap-0">
      {/* 左侧 sticky TOC */}
      <aside className="sticky top-8 z-10 h-[calc(100vh-4rem)] overflow-y-auto border-r border-line bg-bg-2 px-3 py-4 text-sm">
        <div className="caps mb-3 text-accent">Component Index · 28</div>
        <nav className="space-y-4">
          {CATEGORIES.map((cat) => {
            const items = ENTRIES.filter((e) => e.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <div className="caps mb-1.5 text-fg-3">{cat}</div>
                <ul className="space-y-0.5">
                  {items.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => scrollToEntry(e.id)}
                        className="flex w-full items-baseline gap-2 px-1 py-1 text-left text-fg-2 transition-colors hover:bg-soft hover:text-accent"
                      >
                        <span className="num shrink-0 text-fg-4">{e.num}</span>
                        <span className="flex flex-col items-start gap-0">
                          <span className="num text-fg-1">{e.name}</span>
                          <span className="text-2xs text-fg-3">{e.nameZh}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* 右侧组件展示 */}
      <main className="space-y-0">
        {ENTRIES.map((e) => (
          <ComponentDemo key={e.id} entry={e} />
        ))}
        <div className="caps border-t border-hairline px-4 py-6 text-fg-4">
          End of gallery · 28 atoms total
        </div>
      </main>
    </div>
  );
}

function ComponentDemo({ entry }: { entry: ComponentEntry }) {
  return (
    <section id={entry.id} className="border-b-4 border-line scroll-mt-8">
      {/* Demo header — sticky 在每个组件顶部,英文为主中文跟后 */}
      <div className="sticky top-8 z-[5] flex items-baseline justify-between gap-3 border-b border-hairline-strong bg-bg-2 px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="num text-lg font-bold text-accent">#{entry.num}</span>
          <h2 className="num text-lg font-semibold text-fg-1">{entry.name}</h2>
          <span className="text-sm text-fg-3">{entry.nameZh}</span>
        </div>
        <p className="text-sm text-fg-3">{entry.desc}</p>
      </div>

      <div className="bg-bg-1">{entry.node}</div>
    </section>
  );
}
