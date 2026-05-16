import type { ReactNode } from "react";
import { QuoteHero } from "@/components-us/QuoteHero";
import { IntradayChart } from "@/components-us/IntradayChart";
import { TagStrip } from "@/components-us/TagStrip";
import { QuoteKV } from "@/components-us/QuoteKV";
import { CompanyProfile } from "@/components-us/CompanyProfile";
import { SectorPosition } from "@/components-us/SectorPosition";
import { KeyFactors } from "@/components-us/KeyFactors";
import { AnalystConsensus } from "@/components-us/AnalystConsensus";
import { InstitutionalHolding } from "@/components-us/InstitutionalHolding";
import { FinancialHealthScore } from "@/components-us/FinancialHealthScore";
import { FinancialTable } from "@/components-us/FinancialTable";
import { RevenueComposition } from "@/components-us/RevenueComposition";
import { Valuation } from "@/components-us/Valuation";
import { DividendPlan } from "@/components-us/DividendPlan";
import { AlertHot } from "@/components-us/AlertHot";
import { AlertCalendar } from "@/components-us/AlertCalendar";
import { StockTabs } from "@/components-us/StockTabs";
import { AIAnalysis } from "@/components-us/AIAnalysis";
import { EventTracker } from "@/components-us/EventTracker";
import { DolphinResearch } from "@/components-us/DolphinResearch";
import { NewsPreview } from "@/components-us/NewsPreview";
import { DiscussionFeed } from "@/components-us/DiscussionFeed";
import { EarningsSummary } from "@/components-us/EarningsSummary";
import { EarningsForecast } from "@/components-us/EarningsForecast";
import { NewsCardBig } from "@/components-us/NewsCardBig";
import { ValuationHistory } from "@/components-us/ValuationHistory";
import { OrderBookL2 } from "@/components-us/OrderBookL2";
import { CapitalFlow } from "@/components-us/CapitalFlow";
import { Shorting } from "@/components-us/Shorting";
import { StickyTradeBar } from "@/components-us/StickyTradeBar";
import { BottomTabNav } from "@/components-us/BottomTabNav";

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
  mockOrderBookL2,
  mockCapitalFlow,
  mockShorting,
} from "@/mock/stockDetail-us";

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
  { id: "quote-hero", num: "01", name: "QuoteHero", nameZh: "报价头 · Mobile", category: "报价头",
    desc: "US:Logo+Ticker+D 标+AI score chip+全名 / 大价+涨跌 / 双 pill(Earnings 03/24/Live)",
    node: <QuoteHero quote={mockQuote} /> },
  { id: "intraday-chart", num: "02", name: "IntradayChart", nameZh: "24hr 延长盘", category: "报价头",
    desc: "US:24hr 三段(pre/reg/post)+ sun/moon icon + 虚线参考 + 区域填充 + 高低位 callout + 时间范围 tabs",
    node: <IntradayChart meta={mockIntradayMeta} /> },
  { id: "tag-strip", num: "03", name: "TagStrip", nameZh: "标签区(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见,保留兼容",
    node: <TagStrip tags={mockTags} /> },
  { id: "quote-kv", num: "04", name: "QuoteKV", nameZh: "Key statistics", category: "报价头",
    desc: "US:Day's range slider + 52W slider + 6 KV grid + Expand 按钮",
    node: <QuoteKV groups={mockQuoteKV} /> },

  // ─── 公司与行业 ─────────────────────────
  { id: "company-profile", num: "05", name: "CompanyProfile", nameZh: "About", category: "Overview",
    desc: "US:About 卡 — Market cap big + 描述(line-clamp+展开)+ 3 chips(Attention Top3 / Growth Tech / Hot Deal)",
    node: <CompanyProfile profile={mockCompanyProfile} /> },
  { id: "sector-position", num: "06", name: "SectorPosition", nameZh: "行业定位(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见,保留兼容",
    node: <SectorPosition data={mockSectorPosition} /> },
  { id: "key-factors", num: "07", name: "KeyFactors", nameZh: "关键因子(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见,留 Plan5 补移动版",
    node: <KeyFactors root={mockKeyFactorsTree} /> },

  // ─── 分析与持仓 ─────────────────────────
  { id: "analyst-consensus", num: "08", name: "AnalystConsensus", nameZh: "Analyst forecast", category: "Overview",
    desc: "US:Donut 5 类买卖建议 + Price forecast/Analyst rating KV + 5 行 legend(Strong buy 64.47% 等)",
    node: <AnalystConsensus data={mockAnalystConsensus} /> },
  { id: "institutional-holding", num: "09", name: "InstitutionalHolding", nameZh: "Shareholder activity", category: "Overview",
    desc: "US:Net buy / Net sell 双向柱状(Q4 2022 → Q1 2025),零基线居中,正绿/负红",
    node: <InstitutionalHolding data={mockInstitutionalHolding} /> },
  { id: "financial-health-score", num: "10", name: "FinancialHealthScore", nameZh: "财务评分(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见,留 Plan5 补移动版",
    node: <FinancialHealthScore data={mockFinancialHealth} /> },

  // ─── Financials(P/L / Balance / Cash flow) ─────────────────────────
  { id: "financials-bars", num: "11", name: "FinancialTable · Bars+Line", nameZh: "Financials", category: "财务报表",
    desc: "US:P/L / Balance sheet / Cash flow tab + 双柱(Revenue/Net income)+ Net margin 折线 + hover tooltip",
    node: <FinancialTable reports={[mockIncomeStatement, mockBalanceSheet, mockCashFlow]} /> },

  // ─── Revenue / Valuation ─────────────────────────
  { id: "revenue-composition", num: "14", name: "RevenueComposition", nameZh: "Revenue Sankey", category: "Overview",
    desc: "US:5 左 segment 节点用 Bezier 曲线流向中心 Revenue,节点带 value + signed pct + 季度 X 轴",
    node: <RevenueComposition data={mockRevenueComposition} /> },
  { id: "valuation", num: "15", name: "Valuation", nameZh: "Stock valuation", category: "Overview",
    desc: "US:三层 donut(Stock price 蓝外环 / EPS 黄内环 / P/E 中心)+ 行业排名说明 banner",
    node: <Valuation metrics={mockValuation} /> },
  { id: "dividend-plan", num: "16", name: "DividendPlan", nameZh: "分配方案(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见,留 Plan5 补移动版",
    node: <DividendPlan history={mockDividendHistory} records={mockDividendRecords} /> },

  // ─── 顶部条(US 不用 Alert)─────────────────────────
  { id: "alert-hot", num: "17", name: "AlertHot", nameZh: "热点事件(LB 残留)", category: "未用于 US",
    desc: "⚪ US 不用 Alert 顶部条",
    node: <AlertHot events={mockHotEvents} /> },
  { id: "alert-calendar", num: "18", name: "AlertCalendar", nameZh: "公告日程(LB 残留)", category: "未用于 US",
    desc: "⚪ US 不用 Alert 顶部条",
    node: <AlertCalendar events={mockCalendarEvents} /> },
  { id: "stock-tabs", num: "19", name: "StockTabs", nameZh: "4 Tab Bar", category: "顶部条",
    desc: "US:4 Tab(Quote / Overview / News / Community)横向均分,激活下方 2px 实心条,英文",
    node: <StockTabs active="overview" onChange={() => {}} /> },

  // ─── LB-only 残留组件(US 未使用)─────────────────────────
  { id: "ai-analysis", num: "20", name: "AIAnalysis", nameZh: "AI 分析(LB 残留)", category: "未用于 US",
    desc: "⚪ Bloomberg / LB 特有,US PDF 未见",
    node: <AIAnalysis data={mockAIAnalysis} /> },
  { id: "event-tracker", num: "21", name: "EventTracker", nameZh: "事件跟踪(LB 残留)", category: "未用于 US",
    desc: "⚪ US PDF 未见",
    node: <EventTracker events={mockTrackedEvents} /> },
  { id: "dolphin-research", num: "22", name: "DolphinResearch", nameZh: "海豚投研(LB 残留)", category: "未用于 US",
    desc: "⚪ 长桥专属,US 客户端无此内容",
    node: <DolphinResearch reports={mockDolphinReports} /> },
  { id: "news-preview", num: "23", name: "NewsPreview", nameZh: "News preview", category: "Overview",
    desc: "US:英文 mock,标题 + 来源(Reuters/Bloomberg)+ 相关 ticker chip(US AAPL -0.22% 等)",
    node: <NewsPreview items={mockNewsItems.slice(0, 5)} /> },

  // ─── Earnings ─────────────────────────
  { id: "earnings-summary", num: "24", name: "EarningsSummary", nameZh: "Earnings cards × 3", category: "Overview",
    desc: "US:3 张紧凑卡 — Upcoming earnings report(日期+EPS+Rev)+ conference call + Quarterly summary thumbnail",
    node: <EarningsSummary data={mockEarningsHighlight} /> },
  { id: "earnings-forecast", num: "25", name: "EarningsForecast", nameZh: "Earnings 散点", category: "Overview",
    desc: "US:EPS/Revenue/EBIT 3 tab + Actual(实心 up/down)vs Estimate(空圈)散点",
    node: <EarningsForecast data={mockEarningsForecast} /> },

  // ─── LB-only Tab · 分析 ─────────────────────────
  { id: "valuation-history", num: "26", name: "ValuationHistory", nameZh: "估值历史(LB 残留)", category: "未用于 US",
    desc: "⚪ 已被 Valuation donut 替代",
    node: <ValuationHistory /> },

  // ─── News / Community(英文 mock 复用 LB UI)─────────────────────────
  { id: "news-card-big", num: "27", name: "NewsCardBig", nameZh: "News list", category: "News",
    desc: "US:英文化 mock(Reuters / Bloomberg / CNBC 来源),紧凑列表 + ticker chip",
    node: <NewsCardBig items={mockNewsItems} /> },
  { id: "discussion-feed", num: "28", name: "DiscussionFeed", nameZh: "Community feed", category: "Community",
    desc: "US:英文化 mock(@valuegrinder / @techvalue 等),头像 + 长正文 + 嵌入 mini chart",
    node: <DiscussionFeed posts={mockDiscussions} /> },

  // ─── M2 新增 US-only 组件 ─────────────────────────
  { id: "order-book-l2", num: "29", name: "OrderBookL2", nameZh: "Order book(L2)", category: "Quote",
    desc: "US:Bid/Ask 中价 strip + 10 levels dropdown + 价格区间 mini chart + 65/35 balance bar + 5 行 ×4 列明细",
    node: <OrderBookL2 data={mockOrderBookL2} /> },
  { id: "capital-flow", num: "30", name: "CapitalFlow", nameZh: "Capital flow", category: "Quote",
    desc: "US:Net Inflow donut + Inflow/Outflow KV + L/M/S 三档对比 + Real-time/Historical 区域图",
    node: <CapitalFlow data={mockCapitalFlow} /> },
  { id: "shorting", num: "31", name: "Shorting", nameZh: "Shorting", category: "Quote",
    desc: "US:Short sale / Short position 双 tab + 6 KV(NASDAQ 数据)+ 三线图(short% / NASDAQ / closing)+ 量柱",
    node: <Shorting data={mockShorting} /> },
  { id: "sticky-trade-bar", num: "32", name: "StickyTradeBar", nameZh: "底部 CTA Bar", category: "Quote",
    desc: "US:8x grid icon + Options / Trade 双按钮(主按钮 accent 色),sticky 在容器底部",
    node: <StickyTradeBar /> },
  { id: "bottom-tab-nav", num: "33", name: "BottomTabNav", nameZh: "底部 4 系统 Tab", category: "Quote",
    desc: "US:Watchlist / Markets / Portfolio / Profile 4 个 icon-text tab,激活态 accent 色",
    node: <BottomTabNav active="markets" /> },
];

const CATEGORIES = [
  "报价头",
  "顶部条",
  "Overview",
  "Quote",
  "News",
  "Community",
  "财务报表",
];

// 隐藏未用于 V3 (US) 的 LB 残留组件 — 仍保留代码以备后用
const VISIBLE_ENTRIES = ENTRIES.filter((e) => e.category !== "未用于 US");

/**
 * TOC 点击:在页面内 smooth scroll 到目标组件
 * 不改 URL hash,避免 hashchange 触发 App.tsx 把页面切回 StockDetail
 */
function scrollToEntry(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ComponentGalleryUSPage() {
  return (
    <div className="mx-auto grid max-w-[var(--ctn-max-wide)] grid-cols-[240px_1fr] gap-0">
      {/* 左侧 sticky TOC */}
      <aside className="sticky top-8 z-10 h-[calc(100vh-4rem)] overflow-y-auto border-r border-line bg-bg-2 px-3 py-4 text-sm">
        <div className="caps mb-3 text-accent">Component Index · {VISIBLE_ENTRIES.length} (V3)</div>
        <nav className="space-y-4">
          {CATEGORIES.map((cat) => {
            const items = VISIBLE_ENTRIES.filter((e) => e.category === cat);
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
        {VISIBLE_ENTRIES.map((e) => (
          <ComponentDemo key={e.id} entry={e} />
        ))}
        <div className="caps border-t border-hairline px-4 py-6 text-fg-4">
          End of gallery · {VISIBLE_ENTRIES.length} atoms (V3)
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
