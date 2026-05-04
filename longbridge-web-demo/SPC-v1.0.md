# SPC v1.0 · Longbridge Web AI 首页技术规格

| 字段 | 内容 |
|---|---|
| 版本 | v1.0(对应 [PRD-v3.0.md](PRD-v3.0.md)) |
| 适用代码 | `longbridge-web-demo/`(本目录) |
| 更新日期 | 2026-04-30 |
| 关联文档 | [PRD-v3.0.md](PRD-v3.0.md) · [User-Journey.md](User-Journey.md) · [操作线索.md](操作线索.md) · [Design-Review.md](Design-Review.md) |
| 形态 | 纯静态原型(HTML + 7 个 JS 文件 + 5 个 CSS 文件,无构建工具) |

> 本文档描述当前原型的工程实现细节:文件结构、数据模型、函数 API、状态机、CSS 设计系统、持久化、限制与待办。供后端 / 真接入参考字段映射,以及后续维护者快速建立心智模型。

---

## 一、项目结构

```
longbridge-web-demo/
├── index.html                 117 行,定义 7 大固定区域
├── PRD-v3.0.md                产品需求文档(本文档配套)
├── SPC-v1.0.md                技术规格(当前文档)
├── User-Journey.md            7 类典型用户场景验证
├── 操作线索.md                全量操作行为索引
├── Design-Review.md           UX/视觉评审报告
├── PRD-v2.1-增补稿.md         历史版本(保留参考)
├── Demo-脚本-5分钟.md         5 分钟演示脚本
├── js/
│   ├── icons.js               138 行,Lucide 风格 SVG icon 库(stroke 1.75)
│   ├── data.js                261 行,所有 mock 数据(S/holdings/ddb/nvdaDetail/signalDB)
│   ├── home.js                369 行,首页渲染(变化事件 + Widgets + AI 工作台)
│   ├── detail.js             1736 行,详情面板 + Signal 富回复 + 选股 + 风险分析
│   ├── sidebar.js             316 行,AI 工作台 + chat 渲染 + 输入框生命周期
│   ├── dynamic.js            1479 行,6 类动态视图 + 4 类 Agent 面板
│   ├── static-views.js        556 行,5 个静态视图(自选/资产/资讯/市场/社区/交易)
│   └── main.js                153 行,入口(go / setS / renderAll / confirmModal)
└── css/
    ├── base.css               454 行,设计 token + 全局样式 + chat 通用
    ├── home.css               253 行,首页变化事件 / sig 卡 / Widgets
    ├── detail.css             437 行,普通标的(.dt-*)+ Signal 详情(.sd-*)
    ├── dynamic.css            847 行,6 类动态视图 + 4 类 Agent + 加载动效
    └── static.css             275 行,5 个静态视图样式
```

### 1.1 加载顺序(`index.html` 末尾)

```html
<script src="js/icons.js"></script>      <!-- 1) icon 库,被所有渲染函数依赖 -->
<script src="js/data.js"></script>       <!-- 2) 全局数据常量 -->
<script src="js/home.js"></script>       <!-- 3) 首页渲染 -->
<script src="js/detail.js"></script>     <!-- 4) 详情面板 + Signal + chat 富回复 -->
<script src="js/sidebar.js"></script>    <!-- 5) AI 工作台 + chat 渲染 + 输入 -->
<script src="js/dynamic.js"></script>    <!-- 6) 动态视图 + Agent 面板 -->
<script src="js/static-views.js"></script><!-- 7) 静态视图 -->
<script src="js/main.js"></script>       <!-- 8) 入口 + 初始化 -->
```

### 1.2 启动方式

```bash
cd longbridge-web-demo
python3 -m http.server 8000   # 或 VS Code Live Server
# 浏览器打开 http://localhost:8000
```

---

## 二、DOM 结构(index.html)

### 2.1 主体框架

```html
<body>
  <header class="hd"> <!-- 顶栏:logo + 指数条 + 全局菜单 --> </header>
  <div class="ly">
    <nav class="nv"> <!-- 左侧 8 个 icon --> </nav>
    <main class="mc" id="mc">  <!-- 主浏览区,可滚动 -->
      <div class="dyn-header hide" id="dynHeader">
        <button class="dyn-back" onclick="exitDynamic()">← 返回</button>
        <div><div id="dynTitle"></div><div id="dynSub" class="dyn-sub"></div></div>
        <span class="dyn-badge"><span class="dyn-badge-dot"></span>实时布局</span>
      </div>
      <!-- 8 个视图容器(.vw),只有一个带 .on 类显示 -->
      <div class="vw on" id="v-home"></div>
      <div class="vw" id="v-watchlist"></div>
      <div class="vw" id="v-asset"></div>
      <div class="vw" id="v-news"></div>
      <div class="vw" id="v-market"></div>
      <div class="vw" id="v-community"></div>
      <div class="vw" id="v-trade"></div>
      <div class="vw" id="v-dyn-risk"></div>
      <div class="vw" id="v-dyn-compare"></div>
      <div class="vw" id="v-dyn-tradeplan"></div>
      <div class="vw" id="v-dyn-research"></div>
      <div class="vw" id="v-dyn-attribution"></div>
      <div class="vw" id="v-dyn-screener"></div>
    </main>
    <aside class="dp" id="dp">  <!-- 详情面板,默认 transform: translateX(100%) -->
      <div class="dp-close" id="dpHeader">
        <button class="dp-close-btn" onclick="closeDetail()">✕</button>
      </div>
      <div class="dp-inner" id="dpInner"></div>
      <div class="dp-footer" id="dpFooter"></div>
    </aside>
    <aside class="aw" id="aw"> <!-- AI 工作台(home 渲染时填充) --> </aside>
    <aside class="ch" id="ch"> <!-- chat 列 -->
      <header class="ch-hd"><span id="chtag">首页</span></header>
      <div id="chm" class="chm"></div>  <!-- 消息容器 -->
    </aside>
  </div>
  <footer class="gi"> <!-- 全局输入框 -->
    <div id="giBox" class="gi-box">
      <span class="gi-live-dot"></span>
      <input id="gin" placeholder="..." />
      <button onclick="sendG()" class="gi-send">▶</button>
    </div>
  </footer>
</body>
```

### 2.2 关键 ID

| ID | 用途 |
|---|---|
| `mc` | 主浏览区(可滚动容器) |
| `gin` | 输入框 input |
| `giBox` | 输入框包裹(`.live-morph` 紫色态) |
| `dp` | 详情面板根(`.open` 类滑入) |
| `dpInner` | 详情面板内容容器(渲染目标) |
| `dpFooter` | 详情面板底部 CTA 行 |
| `dpHeader` | 详情面板顶部(只剩 ✕ 按钮) |
| `chm` | chat 消息容器(`.ch-m` 子元素) |
| `chtag` | chat 顶部 tag(动态视图标签) |
| `aw` | AI 工作台容器 |
| `dynHeader` | 动态视图顶部面包屑(含 ← 返回) |

---

## 三、数据模型(`js/data.js`)

### 3.1 全局场景 S(行 8–115)

```js
const S = {
  active: { pf:{...}, ur:[...], rd:[...], lv:'2 小时前', mktIdx:[...], pnlToday, pnlWeek, pnlMonth, calm:false },
  calm:   { pf:{...}, ur:[...], rd:[...], lv:'1 天', ..., calm:true },
  down:   { pf:{...}, ur:[...], rd:[...], ..., calm:false }
};
let sc = 'active';   // 当前场景
```

切换场景:`setS('active' | 'calm' | 'down')` → 触发 `renderAll()` 重渲染首页 + AI 工作台。

### 3.2 holdings(行 134–143)

```js
const holdings = [
  { tk:'NVDA', nm:'NVIDIA', shares:60, cost:128.50, price:142.68, pct:18.0, sector:'AI 芯片', beta:1.72, risk:'o' },
  // ... 共 8 支(NVDA/AAPL/GOOG/META/TSM/AMD/MSFT/BRK.B)
];
```

字段:`tk`(ticker)/ `nm`(中文名)/ `shares` / `cost` / `price`(现价)/ `pct`(权重%)/ `sector` / `beta` / `risk`(o/r/g 高中低)

### 3.3 ddb(行 145–157)

ticker 简表(10 支),用于 openDetail / dyn-research / 同行对比等场景的统一行情数据来源。

```js
const ddb = {
  NVDA: { tk, nm, pr, ch, pct, p (is positive), op, hi, lo, vol, pe, cap },
  // ...
};
```

### 3.4 nvdaDetail(行 159–225)

NVDA 全维度数据,**仅 NVDA 一支有详细数据**,其他 ticker 走 `ddb` 简表。结构:

```js
const nvdaDetail = {
  hot: [{ ic:'flame', t:'#英伟达再创新高,市值飙破 5.2 万亿', meta:'43.42 万' }, ...],
  bio: { sector, desc, industryMc, mcChange, mc, rank, industryRankPct },
  revenue: {
    years: ['2020',...,'2026'],
    industry: [{
      label:'计算和网络',
      values:[60,...,1935],          // 7 年值,用于堆叠柱图
      total, pct, yoy, color,
      subs: [{ label, total, pct, yoy }, ...]    // 子项(在 legend 渲染)
    }, ...]
  },
  fscore: {
    letter, trend, updated, sectorName, peerRank, industryMedian, industryAvg,
    radar: [{ k:'盈利', g:'A', v:.95 }, ...],    // 5 顶点
    groups: [{
      name, grade, up, open, items: [{ k, v, g, up }, ...]    // 默认全部 open=false
    }, ...]
  },
  valuation: {
    pe: { name, cur, rank, high, mid, low, axisHi, axisLo, seed },
    pb: {...}, ps: {...}, div: {...isPct:true}
  },
  events: [{ date:'4 月 30 日', items:[{ time:'08:00', t:'...' }, ...] }, ...],
  schedule: [{ mo:'5 月', day:'20', type:'预计财报发布', sub, tz }, ...]
};
```

### 3.5 signalDB(行 159–187 之后)

AMZN / AAPL Signal 详情数据(verdict / catalyst / factors / valLow/Base/High / risk / exec)。供 `openSignalDetail` 渲染。

### 3.6 awState(在 home.js / data.js 共用)

AI 工作台分场景的 tasks / strategies / orders。

---

## 四、函数 API(按文件)

### 4.1 main.js

| 函数 | 用途 | 行号 |
|---|---|---|
| `go(viewId)` | 静态视图切换(home/watchlist/asset/news/market/community/trade) | 16 |
| `setS(scenario)` | 切换全局场景(active/calm/down)+ 重渲染 | 35 |
| `renderAll()` | 全量重渲染(顶栏 + 首页 + AI 工作台) | 46 |
| `restoreChatTag()` | 恢复 chat 顶部 tag(主区切换时用) | 11 |
| `confirmModal(opts)` | 通用确认对话框 | 95 |

### 4.2 home.js

| 函数 | 用途 | 行号 |
|---|---|---|
| `renderHome()` | 首页渲染(变化事件 + Widgets) | 43 |
| `evH(e, st)` | 单条事件卡 HTML(快讯式时间线布局) | 286 |
| `markEventRead(el, id)` | 标记事件已读 + localStorage | 357 |
| `clickTickerPill(ev, tk, evTx, id)` | 点击事件卡里的 ticker pill → openDetail | 361 |
| `drawSignalCharts()` | 渲染 sig 富卡片的迷你 K 线 | 326 |
| `drawPnlTrendChart()` | 渲染 Widget 盈亏分析 canvas | 251 |
| `getReadSet() / persistReadId()` | localStorage 已读状态读写 | 12 / 16 |

### 4.3 sidebar.js

| 函数 | 用途 | 行号 |
|---|---|---|
| `renderAW()` | 渲染 AI 工作台横向卡片 | 11 |
| `renderChat()` | 渲染 chat 列骨架 | 120 |
| `tryIntent(text)` | 输入框填值 + sendG | 137 |
| **`classifyIntent(text)`** | 意图识别 → viewId | 146 |
| **`handleLiveInput(text)`** | live input 处理(实时切换主区 + 打开 Agent 面板) | 158 |
| **`sendG()`** | Enter 发送(添加用户气泡 + 触发 chatRespondToView) | 195 |
| **`chatRespondToView(viewId, userInput, tk)`** | 路由到对应富回复(screener / risk / 通用) | 239 |

### 4.4 detail.js

| 函数 | 用途 | 行号 |
|---|---|---|
| `openDetail(tk, evTx)` | 打开普通标的详情(.dt-* 渲染) | 88 |
| `closeDetail()` | 关闭详情面板(识别 *-agent 模式特殊处理) | 391 |
| `openSignalDetail(tk)` | 打开 Signal 详情(.sd-* 渲染) | 474 |
| `buildTradePlan(tk)` | 触发 dyn-tradeplan 视图 | 425 |
| `analyzeStockInChat(tk)` | 触发 lbaiChat 深度研究 | 1296 |
| **`chatStream(steps)`** | 流式追加 chat 段(每步 [delay, html\|fn]) | 628 |
| `toggleChAcc(id)` | chat 折叠节展开/收起 | 648 |
| **`lbaiChat(query, tk)`** | 标的深度研究富回复(7 段) | 655 |
| **`lbaiScreenerChat(query)`** | 选股器富回复(中概股 6 段) | 768 |
| **`findSimilarStocks(tk)`** | 「基于 X 查找同类型股票」流程 | 1391 |
| **`findStockChain(tk)`** | 「查找 X 上下游股票」(暂复用 findSimilar) | 1527 |
| **`lbaiRiskChat(query)`** | 持仓风险富分析(7 段 + 建议策略 CTA) | 1541 |
| **`suggestRiskStrategy()`** | 「建议策略」CTA 点击后追加 3 张策略卡 | 1694 |
| `applyScreenerFromChat(mode)` | 「在选股器中查看」CTA 点击 → 主区填充 | 903 |
| `analyzeSignalInChat(tk)` | Signal 详情底部 CTA 触发的 chat 输出 | 1017 |

### 4.5 dynamic.js

| 函数 | 用途 | 行号 |
|---|---|---|
| **`enterDynamic(viewId, intent)`** | 进入动态视图(切 .vw + 显示 dynHeader) | 20 |
| **`renderDynamicView(viewId)`** | 路由到 6 个 renderXxx | 38 |
| **`exitDynamic()`** | 退出动态视图(关 *-agent 面板 + 恢复 previousView) | 48 |
| `renderDynRisk()` | 持仓风险主区 + 调用 openReplayAgentPanel | 83 |
| **`openReplayAgentPanel()`** | 复盘分析 Agent 面板 | 156 |
| `renderDynCompare()` | 对比决策主区 | 198 |
| `renderDynTradePlan()` | 策略构建主区 | 259 |
| `renderDynResearch()` | 标的研究主区(13 行) + 调用 openResearchAgentPanel | 444 |
| **`openResearchAgentPanel(ticker)`** | 深度分析 agent 面板 | 841 |
| `rsRadarSvg(radar)` | 财务评分雷达 SVG 生成器 | 884 |
| `drawRsQuoteChart() / drawRsRevenueChart() / drawRsValuationCharts()` | dyn-research 内 4 种 canvas 绘制 | 927 / 950 / 992 |
| `renderDynAttribution()` | 归因诊断主区 + 调用 openMarketAgentPanel | 1070 |
| **`openMarketAgentPanel()`** | 大盘分析 agent 面板 | 1125 |
| `renderDynScreener() / Empty / Filled` | 智能选股两段式 | 1170 / 1180 / 1328 |
| **`openScreenerAgentPanel()`** | 股票选择 Agent 面板 | 1289 |

### 4.6 全局可见的关键变量

```js
let dynamic = false;            // 是否在动态视图中
let cv = 'home';                // 当前视图 id(静态)
let previousView = 'home';      // 上一个静态视图(exit dyn 后回到这里)
let currentDynViewId = null;    // 当前动态视图 id
let screenerMode = 'default';   // default | similar-{tk} | chain-{tk}
let screenerApplied = false;    // 选股器是否已应用筛选
let screenerSaved = false;      // 选股器是否已保存
let sc = 'active';              // 全局场景
let dpHistory = [];             // 详情面板返回栈(已不显示返回按钮但栈仍维护)
```

---

## 五、状态机

### 5.1 dpMode(详情面板模式)

`document.getElementById('dp').dataset.mode` 取值:

| 值 | 含义 | 设置点 | 清理点 |
|---|---|---|---|
| `(空)` | 普通标的 / Signal 详情或关闭态 | openDetail / openSignalDetail / 默认 | closeDetail |
| `screener-agent` | 股票选择 Agent | openScreenerAgentPanel(dynamic.js:1308) | closeDetail / exitDynamic 通过 `endsWith('-agent')` |
| `research-agent` | 深度分析 agent | openResearchAgentPanel(dynamic.js:864) | 同上 |
| `market-agent` | 大盘分析 agent | openMarketAgentPanel(dynamic.js:1146) | 同上 |
| `replay-agent` | 复盘分析 Agent | openReplayAgentPanel(dynamic.js:194) | 同上 |

**统一识别规则**(detail.js:393, 921;dynamic.js:62):
```js
const dpMode = dp && dp.dataset.mode;
if (dpMode && dpMode.endsWith('-agent')) { /* 关闭面板 + delete dataset.mode */ }
```

### 5.2 输入框生命周期

```
[空] ─输入字符─▶ [live(.live-morph)] ─Enter─▶ [发送]
                       │                        │
                       │ classifyIntent          │ 添加 .ch-m user 气泡
                       ├ enterDynamic(viewId)    │ chatRespondToView(viewId,t,tk)
                       │  ├ 切 .vw.on            │  ├ dyn-screener → lbaiScreenerChat
                       │  ├ renderDynamicView    │  ├ dyn-risk → lbaiRiskChat
                       │  │  ├ renderXxx 主区     │  └ 通用:summary+pointTo+detail+chips+fups
                       │  │  └ openXxxAgentPanel │
                       │  │     ├ #dp 滑入        │
                       │  │     └ dpMode 设置     │
                       │  └ dynHeader 显示       │
                       │                         │
                       └ chtag = '分析中'         └ chtag = '<场景> · <ticker>'
```

### 5.3 退出动态视图

输入框清空 → `handleLiveInput('')` → `exitDynamic()`:

1. `dynamic = false; currentDynViewId = null`
2. `dynHeader` 隐藏
3. 切回 `previousView`(.vw.on)
4. 恢复 `chtag` 文案
5. 关闭 *-agent 模式的 #dp 面板(若存在)

---

## 六、4 类 Agent 详细规格

每个 Agent 都遵循统一结构(顶部 icon stage → 名字 → 副标题 → 描述 → 3 步骤 → hint),但色 / 动效 / 类名前缀全独立。

### 6.1 共性结构

```html
<div class="{prefix}-agent-wrap">
  <div class="{prefix}-agent-bg"></div>            <!-- 径向渐变背景 -->
  <div class="{prefix}-agent-icon-stage">          <!-- 图标舞台,各自独立动效 -->
    [独立动效元素]
    <div class="{prefix}-agent-icon">{icon}</div>
  </div>
  <div class="{prefix}-agent-h">{name}</div>       <!-- 主标题 -->
  <div class="{prefix}-agent-st">{subtitle}</div>  <!-- 副标题 + dots 动画 -->
  <div class="{prefix}-agent-d">{description}</div>
  <div class="{prefix}-agent-steps">
    <div class="{prefix}-agent-step done">①...</div>
    <div class="{prefix}-agent-step done">②...</div>
    <div class="{prefix}-agent-step active">③...</div>
  </div>
  <div class="{prefix}-agent-hint">→ ...</div>
</div>
```

### 6.2 各 Agent 配置表

| 项 | 股票选择 | 深度分析 | 大盘分析 | 复盘分析 |
|---|---|---|---|---|
| 类前缀 | `.sc-agent` | `.ra-agent` | `.ma-agent` | `.rp-agent` |
| 触发函数 | `openScreenerAgentPanel()` | `openResearchAgentPanel(tk)` | `openMarketAgentPanel()` | `openReplayAgentPanel()` |
| dpMode | `screener-agent` | `research-agent` | `market-agent` | `replay-agent` |
| 主色 | `#06B6D4` cyan | `#8B5CF6 / A78BFA` purple | `#F59E0B / FBBF24` amber | `#EC4899 / F472B6` rose |
| 图标 | ✦(font 28px) | sparkles SVG(28) | activity SVG(28) | rotate-cw SVG(28) |
| 动效核心 | scAgentSpin 4s 顺时针旋转 + 涟漪同心圆 ripple | raAgentRingPulse 2.2s 同心环 3 圈外扩 + raAgentIconBreathe 2.8s 呼吸 | maAgentScan 2.4s 横向扫描线上下移动 + 网格底 + maAgentIconPulse 1.8s 脉冲 | rpAgentSpinCcw 1.2/1.8/2.4s 三道弧线反向旋转 + rpAgentIconBeat 1.6s 心跳 |
| 副标 dots | scAgentDots(`.`/`..`/`...`) | raAgentDots(`·`/`··`/`···`) | maAgentDots(`.`/`..`/`...`) | rpAgentDots(`·`/`··`/`···`) |
| 步骤主题 | 理解意图 → 推荐筛选条件 → 应用并展示 | 理解输入 → 采集深度数据 → 整合呈现 | 扫描大盘异动 → 归因宏观驱动 → 分解个股贡献 | 提取历史决策 → 量化风险敞口 → 推演改进建议 |
| hint 颜色 | cyan | purple | amber | rose |

### 6.3 排版对齐

`v3.0` 起,4 个 agent 都用统一排版:`padding: 32px 22px 24px; height: 100%; flex column; align-items: center;`,顶部对齐(不再垂直居中)。

---

## 七、CSS 设计系统(`css/base.css`)

### 7.1 颜色 Tokens

```css
:root {
  --bg: #0A0E19;            /* 页面底色(深) */
  --sf: #1C2029;            /* 卡片表面 */
  --sf2: #242936;           /* 卡片表面 2(hover / 内嵌) */
  --sf3: #2D3344;           /* 表面 3(更亮) */
  --bd: rgba(255,255,255,.06);    /* 边线 */
  --bda: rgba(255,255,255,.12);   /* 边线 active */

  --tp: #F4F4F5;            /* 文本 primary */
  --ts: #C9CED9;            /* 文本 secondary */
  --tm: #7E8088;            /* 文本 muted */
  --td: #5A5D66;            /* 文本 disabled */

  --g: #00ADA2;             /* 涨 / 运行中 */
  --r: #FF5A8A;             /* 跌(略偏粉,Design Review G2 提议改 #EF4444) */
  --o: #F59E0B;             /* 警告(已替代橙色状态) */
  --b: #2A99FE;             /* 链接 / Signal 标签 */
  --p: #8B5CF6;             /* AI 主题 */
  --c: #00B8B8;             /* 系统 / 平静 */
  --ai: #00F0C4;            /* AI mint(已收敛) */

  --gbg: rgba(0,173,162,.10);
  --rbg: rgba(255,90,138,.10);
  --obg: rgba(245,158,11,.10);
  --bbg: rgba(42,153,254,.10);
  --pbg: rgba(139,92,246,.10);
  --cbg: rgba(0,184,184,.10);
  --aibg: rgba(0,240,196,.10);

  --m: 'JetBrains Mono', monospace;     /* mono 字体(数字 / ticker) */
  --f: 'DM Sans', system-ui;            /* sans 字体(正文) */
}
```

### 7.2 字号 / 间距 / 圆角

| 字号 | 值 | 间距 | 圆角 |
|---|---|---|---|
| `--fs-xs` | 11px | `4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24` | `--r-sm 3px` |
| `--fs-sm` | 12px | | `--r-md 5px` |
| `--fs-md` | 13px | | `--r-lg 8px` |
| `--fs-lg` | 14px | | `--r-xl 10px` |
| `--fs-xl` | 16px | | `--r-pill 14px` |
| `--fs-2xl` | 22px | | |
| `--fs-3xl` | 28px | | |

### 7.3 关键动效

| Keyframes | 文件 | 用途 |
|---|---|---|
| `fadeInUp` | base.css:449 | `.fi` 通用淡入,所有动态卡基线 |
| `chCascadeIn` | dynamic.css(chat 区段) | `.ch-m.fi` 升级浮现(translateY+scale+blur) |
| `chCascadeChild` | 同上 | 富气泡内 .ch-stock-card / .ch-risk-card / .ch-strat-card / .ch-bul / .ch-acc 子级级联 |
| `dynLoadingSweep` | dynamic.css | `.dyn-grid::before` 顶部扫光条 1.4s |
| `dynPanelRise` | 同上 | `.dyn-grid > *` 卡片级联浮现,nth-child(1..14) 70ms 步长 |
| `scAgentSpin / scAgentPulse / scAgentRipple / scAgentDots` | dynamic.css §sc-agent | 选股器 Agent 旋转 + 涟漪 |
| `raAgentRingPulse / raAgentIconBreathe / raAgentDots` | dynamic.css §ra-agent | 研究 Agent 同心环 + 呼吸 |
| `maAgentScan / maAgentIconPulse / maAgentDots` | dynamic.css §ma-agent | 大盘 Agent 扫描线 + 脉冲 |
| `rpAgentSpinCcw / rpAgentIconBeat / rpAgentDots` | dynamic.css §rp-agent | 复盘 Agent CCW 弧 + 心跳 |
| `pulse` | base.css | dot / badge 通用脉动 |

### 7.4 reduced-motion 兜底

```css
@media (prefers-reduced-motion: reduce) {
  .dyn-grid::before { animation: none; opacity: 0 }
  .dyn-grid > * { animation: fadeInUp .25s ease both }
  .ch-m.fi { animation: fadeInUp .25s ease both }
  .ch-m .ch-ai > * { animation: none; opacity: 1 }
}
```

---

## 八、持久化(localStorage)

| 键 | 类型 | 用途 |
|---|---|---|
| `lb_read_ids` | JSON 数组 | 已读事件 id 集合(home.js getReadSet/persistReadId) |
| `lb_ch_width` | 数字 | chat 列宽(220–560 区间) |

无其他持久化(场景 sc / 视图 cv / 输入历史 都不持久化,刷新即重置)。

---

## 九、级联 / 触发链路示例

### 9.1 输入 NVDA 完整链路

```
用户键入 N
└─ handleLiveInput('N')
   └─ classifyIntent → null(未命中 ticker 完整匹配)

用户键入 NV → NVD → NVDA
└─ handleLiveInput('NVDA')
   └─ classifyIntent → 'dyn-research'
   └─ enterDynamic('dyn-research', 'NVDA')
      ├─ dynamic = true; currentDynViewId = 'dyn-research'
      ├─ .vw.on 切到 v-dyn-research
      ├─ dynHeader.classList.remove('hide')
      └─ renderDynamicView('dyn-research')
         └─ renderDynResearch()
            ├─ innerHTML = 13 行布局
            ├─ openResearchAgentPanel('NVDA')   ← 立即开 Agent 面板
            │  ├─ dp.classList.add('open')
            │  ├─ dp.dataset.mode = 'research-agent'
            │  └─ #dp 显示紫色 agent 卡
            └─ setTimeout(350, 绘制 4 类 canvas + radar SVG)

用户回车 sendG()
├─ 添加 .ch-m user 气泡
├─ tk = 'NVDA'(从 input 解析)
└─ chatRespondToView('dyn-research', 'NVDA', 'NVDA')
   └─ chatStream([
       summary, pointTo, detail, 4 chips,
       2 个 ✦ 跳转按钮(findSimilarStocks/findStockChain)
     ])
```

### 9.2 输入「持仓分析」链路

```
handleLiveInput('持仓分析')
└─ classifyIntent → 'dyn-risk'
└─ enterDynamic('dyn-risk', '持仓分析')
   └─ renderDynamicView('dyn-risk')
      └─ renderDynRisk()
         ├─ 主区 8 模块布局
         └─ openReplayAgentPanel()  ← rose Agent

sendG()
└─ chatRespondToView('dyn-risk', '持仓分析', null)
   └─ lbaiRiskChat('持仓分析')
      └─ chatStream([
          topic chip rose,
          procHTML(任务 + 检索),
          sec1HTML(持仓分布 stacked bar),
          sec2HTML(3 张 risk-card),
          sec3HTML(组合层面 4 bullet),
          sec4HTML(摘要表 + 免责 + 关注点),
          ctaHTML(✦ 建议策略 rose CTA)
        ])

用户点「建议策略」
└─ suggestRiskStrategy()
   ├─ 添加用户气泡「建议策略」
   └─ chatStream([
       intro,
       3 张 ch-strat-card(A/B/C),
       2 个 ✦ 后续追问按钮
     ])
```

---

## 十、已知约束与限制

| # | 约束 | 备注 |
|---|---|---|
| 1 | `nvdaDetail` 仅 NVDA 一支有详细数据 | 其他 ticker 输入虽然进入 dyn-research,但 4 个长桥原生模块(公司百科/营收/财务/估值)走 `det = null` 分支,只渲染基础部分 |
| 2 | `findStockChain` 暂复用 `findSimilarStocks` | 实际产业链上下游 API 接入后再分流 |
| 3 | dyn-tradeplan / dyn-compare 暂无独立 Agent | 沿用 v2.1 既有结构 |
| 4 | 详情面板返回栈 `dpHistory` 维护但 UI 已隐藏 | 用户视角无返回按钮,只有 ✕ 关闭 |
| 5 | chat 滚动到底由 chatStream 自管 | innerHTML 追加后立即 `el.scrollTop = el.scrollHeight` |
| 6 | 输入框防抖未实现 | 每个 keystroke 触发 handleLiveInput,但 enterDynamic 内部判断 currentDynViewId 不变则跳过重渲染 |
| 7 | Agent 面板 live 阶段开启,Enter 阶段不重复打开 | sidebar.js:246 sendG 路径不再调 openResearchAgentPanel,避免抖动 |
| 8 | localStorage 数据无版本控制 | 改了 read_ids 结构需手动清缓存 |

---

## 十一、待办清单(Roadmap)

| 优先级 | 项 | 涉及文件 |
|---|---|---|
| P1 | 把 `nvdaDetail` 抽象为通用 `detailDB[tk]`,支持 AAPL / TSM / AMD 等 | js/data.js + js/dynamic.js renderDynResearch |
| P1 | dyn-attribution chat 富分析(类似 lbaiRiskChat 的 5 段) | js/detail.js 新增 lbaiAttributionChat |
| P2 | dyn-tradeplan 配独立 Agent(色 deep-blue?动效:量化进度条) | js/dynamic.js + css/dynamic.css |
| P2 | findStockChain 单独实现(产业链上下游数据) | js/detail.js |
| P2 | 详情面板返回栈 UI 重新启用(可能放 #dp 内浮动按钮) | index.html + base.css + detail.js |
| P3 | 输入历史 + 上下箭头召回 | js/sidebar.js sendG |
| P3 | 场景 sc 持久化到 localStorage | js/main.js setS |
| P3 | 顶部扫光条改进:多色循环渐变 + 与 chat tag 同步色 | css/dynamic.css dynLoadingSweep |
| P4 | 视图切换 < 200ms 时跳过 chCascadeIn(避免疲劳) | css/dynamic.css |

---

## 附录 A · 文件交叉引用快查

| 触发 | 调用链 |
|---|---|
| 用户输入 NVDA(live) | sidebar.js handleLiveInput → dynamic.js enterDynamic → renderDynResearch → openResearchAgentPanel(purple) |
| 用户回车 NVDA | sidebar.js sendG → chatRespondToView('dyn-research') → **lbaiChat(t, tk)** → 7 段 + 6 ✦ 跟进(4 深度 + 2 nav) |
| 用户输入「持仓风险」回车 | chatRespondToView('dyn-risk') → **lbaiRiskChat()** → 7 段 + 「建议策略」CTA |
| 用户输入「今天为什么跌了」回车 | chatRespondToView('dyn-attribution') → **lbaiAttributionChat()** → 9 段宏观 + 10 来源 + 4 ✦ |
| 用户输入「中概股潜力股」回车 | chatRespondToView('dyn-screener') → **lbaiScreenerChat()** → 6 段 + 「在选股器中查看」CTA |
| 用户点击 mic 按钮 | sidebar.js toggleVoiceInput → 切 `.recording` 态(红涟漪 + 输入框红边) |
| 点击 sig 富卡片 | home.js evH onclick → detail.js openSignalDetail |
| 点击普通事件 ticker pill | home.js clickTickerPill → openDetail |
| 点击 ✕ 关闭面板 | detail.js closeDetail → 识别 *-agent 模式特殊清理 |
| 点击 chat 「在选股器中查看」 | detail.js applyScreenerFromChat → renderDynScreenerFilled |
| 点击 chat 「建议策略」(rose) | detail.js suggestRiskStrategy → 追加 3 张策略卡 + fup |
| 点击 chat 「基于 X 查找同类型」 | detail.js findSimilarStocks → 切 dyn-screener + screenerMode='similar-X' |
| 切换全局场景 | DevTools `setS('down')` → main.js setS → renderAll |

## 附录 B · 验证 checklist

参考 [User-Journey.md](User-Journey.md) §1-§7 用户场景,逐条走一遍即可:

- ✓ J1 早晨扫场:首页变化事件快讯式 + AI 工作台
- ✓ J2 Signal 跟单:openSignalDetail → buildTradePlan → Move forward
- ✓ J3 持仓诊断:输入"持仓风险"→ 复盘 Agent + lbaiRiskChat 7 段 + 建议策略 CTA + 3 策略卡
- ✓ J4 标的研究:输入 NVDA → 深度 Agent + 13 行主区 + **lbaiChat 7 段 + 6 ✦**(与「AI 深度研究」按钮等价)
- ✓ J5 选股需求:输入"中概股潜力股"→ 选股 Agent + 推荐条件 + 在选股器中查看
- ✓ J6 归因复盘:输入"今天为什么跌了"→ 大盘 Agent + **市场频道主区 7 行 + lbaiAttributionChat 9 段 + 10 来源 chip**
- ◐ J7 对比决策:dyn-compare 视图就位,Agent 待补
- ✓ J8(新)语音输入:点 mic → recording 态视觉反馈,真接入 Web Speech 时补 onresult

---

## 十二、v1.1 Patch · 2026-04-30 增量更新

### 新增函数

| 函数 | 位置 | 用途 |
|---|---|---|
| `toggleVoiceInput()` | sidebar.js:138 | 语音输入按钮切 recording 态(视觉反馈,未接 Web Speech API) |
| `lbaiAttributionChat(query)` | detail.js:1697 | 大盘归因 9 段富分析(topic + 折叠节 + 引言 + 4 段宏观 + 10 来源 + 4 ✦) |

### 修改函数

| 函数 | 改动 |
|---|---|
| `chatRespondToView(viewId, t, tk)` | 加 `dyn-attribution → lbaiAttributionChat` 早路返回;`dyn-research → lbaiChat`(原通用 4 段流弃用) |
| `lbaiChat(query, tk)` | sourceHTML 末尾 `.ch-fups` 从 4 个深度问题扩到 6 个(追加 `findSimilarStocks(tk)` / `findStockChain(tk)` 2 nav 跳转) |
| `renderDynAttribution()` | 完全重写:从「持仓今日下跌」改为市场频道视角(市场 tab + 三大指数 + 板块表现 + 9 条事件 + 跌幅榜 + 资金流向 + 财报周) |

### 新增 CSS 模块

| 类前缀 | 文件 | 用途 |
|---|---|---|
| `.gi-mic / .gi-box.recording` | base.css:441-460 | 语音按钮 + recording 态(红色双层 ripple + 输入框红边 + placeholder 切换) |
| `.rs-mkt-tabs / .rs-mkt-tab` | dynamic.css:744-748 | 市场切换 4 pill(美股 default / 港股 / 新加坡 / 沪深通) |
| `.rs-idx-grid / .rs-idx-card / .rs-idx-spark` | dynamic.css:752-765 | 三大指数卡(`minmax(0,1fr) + width:100%` 确保对齐) |
| `.rs-sec-list / .rs-sec-row / .rs-sec-bar` | dynamic.css:767-775 | 板块表现 11 行双向 bar(中线为零) |
| `.rs-evt-list / .rs-evt-item / .rs-evt-lvl-{r,g,o}` | dynamic.css:779-790 | 今日关键事件 timeline + 利空/利多/中性 chip |
| `.ch-cite` | dynamic.css:794 | chat 行内来源 chip(浅底标签,hover 切边色) |

### 新增 keyframes

| Keyframes | 用途 |
|---|---|
| `giMicRipple 1.4s` | mic recording 双层涟漪外扩 |
| `giMicWobble .9s` | mic 图标缩放节奏 |

### dpMode 状态机(无变化)

仍 4 模式:`screener-agent / research-agent / market-agent / replay-agent`。统一识别规则 `dpMode.endsWith('-agent')`。

### 待办清单更新

| 状态 | 项 |
|---|---|
| ✓ 完成 | ~~P1 dyn-attribution chat 富分析~~(已实现 lbaiAttributionChat) |
| ✓ 完成 | ~~P3 顶部扫光条 / chat 加载动效~~(已实现) |
| 新增 | **P2 语音输入接入 Web Speech API**:`toggleVoiceInput()` 内补 `webkitSpeechRecognition` 实例 + `onresult → inp.value = transcript; sendG()` |
| 新增 | **P3 三大指数卡数据真接入**:当前是 mock 5 连跌 / 高位下挫,真接入需替换 `indices` 数组 + sparkline 真历史数据 |
| 保留 | P1 抽象 `nvdaDetail` 为通用 `detailDB[tk]` |
| 保留 | P2 dyn-tradeplan / dyn-compare 配独立 Agent |

### 改动文件统计(v1.1 patch)

| 文件 | 改动 |
|---|---|
| `index.html` | +1 行(mic button) |
| `js/sidebar.js` | +30 行(toggleVoiceInput + chatRespondToView 路由扩展) |
| `js/dynamic.js` | -50 / +200 行(renderDynAttribution 重写) |
| `js/detail.js` | +110 行(lbaiAttributionChat) + 2 行(lbaiChat fup 扩展) |
| `css/base.css` | +20 行(`.gi-mic` 系) |
| `css/dynamic.css` | +60 行(市场频道 + `.ch-cite`) |
| **合计** | **+422 / -50 行** |
