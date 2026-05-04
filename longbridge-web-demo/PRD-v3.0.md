# PRD v3.0 · Longbridge Web AI 首页

| 字段 | 内容 |
|---|---|
| 版本 | v3.0(全量替代 v2.1 增补稿) |
| 适用原型 | `longbridge-web-demo/index.html`(本目录) |
| 更新日期 | 2026-04-30 |
| 关联文档 | [User-Journey.md](User-Journey.md) · [操作线索.md](操作线索.md) · [Design-Review.md](Design-Review.md) · [SPC-v1.0.md](SPC-v1.0.md) |
| 设计基线 | LUI + GUI 共生 · Real-Time Operations Dashboard · Fintech 严肃风 |

> v3.0 相对 v2.1 的关键差异:补齐 4 类差异化 Agent 体系、富 chat 富分析流(选股 / 类同标的 / 持仓风险 / 建议策略)、首页变化事件快讯式时间线、动态布局加载动效、个股动态视图 13 行模块化、营收构成 / 财务评分 / 估值分析等长桥原生数据模块。

---

## 一、产品定位与设计哲学

### 1.1 一句话定位

**长桥的 AI 首页**:在保留长桥原有数据深度的前提下,把 AI 能力以「主浏览区(GUI)+ chat 列(LUI)+ Agent 提示侧栏」三层结构暴露给用户,让用户在不离开当前页面的前提下完成扫场 → 研究 → 决策 → 监控 → 复盘的完整闭环。

### 1.2 设计哲学三条铁律

| 铁律 | 含义 | 落地体现 |
|---|---|---|
| **输入框是唯一入口** | 用户的所有意图都从底部输入框发起,不通过菜单 / Tab 跳转 | live input → 实时主区重组;Enter → chat 流式回复 + Agent 面板 |
| **GUI + LUI 双反馈区** | 主区给"看"(高密度数据 / 结构化),chat 给"读"(叙述性推理 / 分析过程) | 输入 NVDA → 主区 13 行 + chat 评级摘要 + 同类型/上下游 chip |
| **Agent 拟人化** | 不同分析场景配独立 Agent(色系 / 动效 / 名字独立),让用户感知"不同 Agent 在工作" | 4 类 Agent:股票选择 / 深度分析 / 大盘分析 / 复盘分析 |

### 1.3 用户分层

| Persona | 特征 | 主路径 |
|---|---|---|
| 早晨扫场用户 | 30 秒看完,不下单 | 首页变化事件 + AI 工作台快速一览 |
| Signal 跟单用户 | 看到时间线 Signal 后决定下单 | Signal 详情 → Trade Plan → 工作台监控 |
| 持仓诊断用户 | 不安想做一次复盘 | 输入"持仓风险" → 复盘分析 Agent + 富 chat + 建议策略 |
| 研究型用户 | 输入 ticker 看深度数据 | 输入 NVDA → 主区 13 行 + 同类型/上下游 chip |
| 选股需求用户 | 没目标想筛选 | 输入"中概股潜力股" → 选股 Agent + 推荐条件 + 在选股器中查看 |

---

## 二、全局框架(L1)

页面分 7 个固定区域,从外到内、从左到右:

```
┌── 顶栏(60px,深色)── 指数条 + 全局菜单 ────────────┐
├── 左 nav(52px) ── 8 个 icon: 首页/自选/资产/资讯/市场/社区/交易 ─┤
│   ┌── 主浏览区 #mc(剩余宽度) ── 视图容器,装载 home/动态视图 ┐  │
│   │                                                        │  │
│   │   ┌── 详情面板 #dp(420px,可滑入) ──── 4 种用途   ┐    │  │
│   │   │   • 普通标的详情(.dt-*)                     │    │  │
│   │   │   • Signal 详情(.sd-*)                       │    │  │
│   │   │   • 4 类 Agent 等待面板(.sc/.ra/.ma/.rp)    │    │  │
│   │   │   仅有 ✕ 关闭按钮,无返回                    │    │  │
│   │   └─────────────────────────────────────────────┘    │  │
│   │                                                        │  │
│   │   ┌── chat 列 #ch(360px,可拖拉宽度,localStorage 持久化)┐  │
│   │   │   流式回复 + 富气泡 + 思考折叠节 + ✦ 后续追问 / CTA  │  │
│   │   └────────────────────────────────────────────────────┘  │
│   │                                                        │  │
│   └── AI 工作台 #aw(渲染在主区上方,任务卡 + 变化事件)────┘  │
│                                                              │
├── 全局输入框 #gi(54px,贴底,start with `.live-morph` 紫色态)─┤
└──────────────────────────────────────────────────────────────┘
```

主区切换不影响 #dp / #ch / #aw 任何状态(PRD §固定框架 + 动态内容)。

---

## 三、核心交互

### 3.1 输入生命周期

```
[空] ──输入字符──▶ [live] ──Enter──▶ [发送]
                       │                  │
                       ├ live morph(紫色 dot 脉动) ├ 主区维持视图
                       ├ classifyIntent 识别意图    ├ chat 追加用户气泡 + 流式 bot 回复
                       ├ 主区切换到对应动态视图     ├ Agent 面板 #dp 已在 live 阶段打开
                       └ Agent 面板 #dp 同步打开    └ chtag 同步("分析中"→"标的研究 · NVDA")
```

**关键差异(v3.0 新行为)**:Agent 面板和主区动态视图在 **live input 阶段**就立刻打开(与选股器一致),不等回车;chat 内容仅在 Enter 后才流式输出。这样用户能在打字时就看到 GUI 反馈,Enter 后获得叙述性 LUI。

### 3.2 意图识别(classifyIntent)

| 输入特征 | 命中 viewId | 触发的 Agent |
|---|---|---|
| `选股 / 筛选 / 潜力股 / 中概股 / 高股息 / 找股 / 选出` | `dyn-screener` | 股票选择 Agent(cyan + 旋转 ✦) |
| `\b(NVDA \| AAPL \| GOOG \| TSM \| AMD \| META \| MSFT \| AMZN \| TSLA \| BABA)\b` | `dyn-research` | 深度分析 agent(purple + 同心环) |
| `为什么跌 / 亏损来自 / 归因 / 影响多大 / 怎么回事` | `dyn-attribution` | 大盘分析 agent(amber + 扫描线) |
| `持仓风险 / 持仓分析 / 风险审视` | `dyn-risk` | 复盘分析 Agent(rose + CCW 弧) |
| `对比 X 和 Y` | `dyn-compare` | (暂无独立 Agent) |
| `Trade Plan / 策略 / 建仓` | `dyn-tradeplan` | (暂无独立 Agent) |

未识别意图 → 提示用户可选意图(分析持仓风险 / NVDA 能追吗 / 对比 NVDA 和 AMD / 今天为什么跌了)。

### 3.3 4 类差异化 Agent 体系

每个 Agent 都在 #dp 面板独立展示,有相同的结构(头部 icon stage + 名字 + 副标题 + 描述 + 3 步骤 + hint),但色系 / 动效 / 名字不同,让用户感知"4 个不同 Agent 在不同场景被调用"。

| Agent | 触发场景 | 主色 | 动效特征 | 步骤含义 |
|---|---|---|---|---|
| **股票选择 Agent** | 选股 / 筛选 / 中概股 | cyan `#06B6D4` | ✦ 顺时针旋转 + 涟漪同心圆 | 理解意图 → 推荐筛选条件 → 应用并展示 |
| **深度分析 agent** | NVDA / AAPL 等 ticker | purple `#8B5CF6 / #A78BFA` | 同心环 3 圈外扩 + 图标呼吸 | 理解输入 → 采集深度数据 → 整合呈现 |
| **大盘分析 agent** | 今天为什么跌了 / 归因 | amber `#F59E0B / #FBBF24` | 网格底 + 横向扫描线上下 + 脉冲 | 扫描大盘异动 → 归因宏观驱动 → 分解个股贡献 |
| **复盘分析 Agent** | 持仓风险 / 持仓分析 | rose `#EC4899 / #F472B6` | 3 道弧线 CCW 反向旋转 + 心跳节奏 | 提取历史决策 → 量化风险敞口 → 推演改进建议 |

**Agent 面板生命周期**:`dpMode = '{xxx}-agent'`,`exitDynamic` / `closeDetail` 通过 `dpMode.endsWith('-agent')` 统一识别并清理。

### 3.4 chat 流式富回复(7 段结构)

所有 AI 回答按以下结构流式输出,每段独立 `.ch-m bot` 气泡,带级联浮现动效(`chCascadeIn .55s`)。富气泡内部的卡片 / bullet / accordion 再做 80ms 步长 stagger。

| 段位 | 内容 | 何时出现 |
|---|---|---|
| ① topic chip | 顶角彩色识别 chip(如「分析持仓风险」rose) | 200ms |
| ② 思考折叠节 | 任务列表 + 关键数据检索(tool chips) | 400ms |
| ③ § 一 | 整体引子(选股分析 / 持仓分布) | 800ms |
| ④ § 二 | 核心数据卡(前 N 名股 / 风险卡) | 1000ms |
| ⑤ § 三 | 维度拆解(条件 / 组合风险) | 800ms |
| ⑥ § 四(可选) | 摘要表 + 免责 + 关注点 bullet | 800ms |
| ⑦ CTA + 反馈 | 复制 / 赞 / 踩 / 重生成 + 主 CTA + ✦ 后续追问 | 500ms |

不同视图的差异主要在 ③④⑤⑥ 内容,框架(①②⑦)统一。

---

## 四、6 类动态视图详细

### 4.1 dyn-risk · 持仓风险

**主区(.dyn-grid.risk)**:CSS Grid 4 行 8 模块
- 持仓总览 + 风险评分(双列) · 行业分布 + 集中度 Top 5 · 持仓明细全宽 · 相关订单 + 相关策略 · AI 总结 + 动作按钮

**Agent 面板(#dp)**:复盘分析 Agent

**chat 流(`lbaiRiskChat`,7 段)**:
1. topic chip「分析持仓风险」rose 底
2. 任务列表(4 行勾选) + 关键数据检索(5 个 tool chip)
3. § 一、持仓分布概览 ── 14px 高 stacked bar(8 段) + 双列 legend
4. § 二、风险维度逐一拆解 ── 3 张 risk-card(NVDA 高 / AAPL 中 / BRK.B 低),每张 4 行(走势 / 技术面 / 基本面 / 风险结论)
5. § 三、组合层面风险评估 ── 4 类 bullet(集中度 / Beta / 币种 / 流动性,各自彩色 dot)
6. § 四、风险摘要与关注点 ── 5 行 risk 表 + 免责 + 3 条结论 bullet
7. **「✦ 建议策略 →」rose-pink CTA**

**点击 CTA → `suggestRiskStrategy()`**:追加 3 张策略卡(A NVDA 部分止盈 + 期权 / B 板块再平衡 / C AAPL 条件单),每张含执行成本 / 影响仓位 / 预期效果三项。最后给 2 个 ✦ 后续追问按钮(建 A 方案 Trade Plan / 看 B 方案再平衡明细)。

### 4.2 dyn-research · 标的研究

**主区(.dyn-grid.research)**:CSS Grid 13 行模块
1. 行情头(全宽,股价 + KPI 6 + 走势图 160px + 时间 tabs)
2. 公司百科(含 ★ 热点 chips) | ★ 事件追踪 timeline
3. ★ 营收构成(7 年堆叠柱图 + 行业/地区 + 父子 legend) | ★ 财务评分(A 大字 + 雷达 + 5 评分组)
4. ★ 估值分析 4 卡 2×2(市盈率/市净率/市销率/股息率,各带 1Y/3Y/5Y/10Y pill 折线)
5. 基本面摘要 | 技术面摘要
6. 季度营收 / EPS | 分析师评级
7. 同行业对比表(全宽)
8. 估值因子分解 | Quant Ratings 5 因子
9. 估值历史 | 业绩预期
10. ★ 日程&公告 | 相关事件
11. 你的持仓 | 相关策略
12. 行动按钮 4 chip(建 Trade Plan / 和 AMD 对比 / 设价格提醒 / 查看回测)

★ = 长桥原生数据模块,直接复用 `.dt-co-card / .dt-rev-* / .dt-fs-card / .dt-fs-tbl` 等 detail.css 样式。

**Agent 面板(#dp)**:深度分析 agent

**chat 流(走通用 `chatRespondToView` 4 段)**:summary + 主区导览 + detail + 4 chip + **2 个 ✦ 跳转按钮**(基于 X 查找同类型的股票 / 查找 X 的上下游股票)

**财务评分布局细节**:tabs(评分分析 / 同行比较)在 grade 卡下方,tab content 内置雷达(160×160 居中)+ 5 个可展开评分组(默认全部收起,减少首屏高度)。

**估值分析 4 卡折线**:每卡 80px 高 canvas,内部画紫色当前指标折线 + 青色股价填充 area + 3 条横分位线(高/中/低)。

### 4.3 dyn-screener · 智能选股

**主区(.dyn-grid.screener)**:两段式
- 空态:筛选条件可手动选择 + 全市场 134,453 表格(用户必须等 chat 推荐或自行点 CTA 触发筛选)
- 应用态:已应用 5 条件 + 14 行筛选结果(`screenerMode` 控制 default / similar-X / chain-X 三种)

**Agent 面板(#dp)**:股票选择 Agent

**chat 流(`lbaiScreenerChat` 或 `findSimilarStocks` 6 段)**:topic chip + 检索折叠节 + § 1 整体分析 + § 2 前三股(stock-card)+ § 3 推荐筛选条件 + **「✦ 在选股器中查看」CTA**

点 CTA → `applyScreenerFromChat(mode)` → 主区从空态切换到填充态。

### 4.4 dyn-attribution · 归因诊断

**主区(.dyn-grid.attribution)**:今日盈亏归因瀑布图 + 宏观驱动因素 + 受影响持仓表 + AI 归因分析 + 动作按钮

**Agent 面板(#dp)**:大盘分析 agent

**chat 流**:走通用 `chatRespondToView`(4 段),后续可扩展为类似 lbaiRiskChat 的富分析。

### 4.5 dyn-tradeplan · 策略构建 & dyn-compare · 对比决策

保持 v2.1 既有结构,本次未做模块级改动。后续若有专属 Agent 需求再补。

---

## 五、首页内容模块(L0)

### 5.1 AI 工作台(#aw)

进行中的任务横向卡片列表,5 种状态色:
- **激活中**(亮绿 `#34D399` + 脉动):刚被 Move forward 创建、订单未提交。瞬时态,在订单提交时切「运行中」
- **运行中**(深绿 `var(--g)`):订单已提交、AI 监控中
- **正常**(浅青 `#00B8B8`):后台静默
- **预警**(红闪烁):需用户立即关注
- **已暂停**(灰):用户主动暂停

「橙色」不再使用(避免与状态混淆)。

### 5.2 变化事件时间线(#tl)— 快讯式

**v3.0 关键改造**:从原"行内卡片"改为快讯式 2 列布局——
- 左 `.sc-gutter`:小 dot(类别色) + 跨行连续竖线(时间线视觉)
- 右 `.sc-body`:**时间置顶**(13px / mono)→ 标题(13px) → 与你相关行(可选) → **底部 chip 行**(类别 tag + ticker 链接)

视觉效果:
- sig 富卡片(AMZN Bullish / AAPL Bearish 等)保持独立,带迷你走势图
- 普通事件卡分组到 `.sc-group` 容器,统一外框 + 行级分隔
- ur(未读)左侧 cyan 蓝条 + body 字色加深;rd(已读)整体降透明

### 5.3 Widgets 6 卡(快速入口)

总资产 / 盈亏分析 / Watchlist / Portfolio / Market / Rankings + Calendar,wg-grid 6 列网格。

### 5.4 chat 列(#ch)— 360px,可拖拉

`localStorage.lb_ch_width`(min 220 / max 560)。支持级联浮现 + 思考折叠节 + 反馈 icon 行 + 主 CTA + 后续追问 chip。

---

## 六、视觉规范摘要(L0)

### 6.1 配色

| Token | 值 | 用途 |
|---|---|---|
| `--success-strong` | `#00ADA2` | 涨 / 运行中 |
| `--success-glow` | `#34D399` | 激活中(仅 pulse 动效) |
| `--ai` | `#00F0C4` | AI 主题色(已收敛使用) |
| `--info` | `#2A99FE` | 中性蓝 / 链接 / Signal 标签 |
| `--warning` | `#F59E0B` | 橙 / 大盘 Agent / Calendar |
| `--danger` | `#EF4444` | 红 / 跌 / 高风险 |
| Agent purple | `#8B5CF6 / A78BFA` | 深度分析 agent |
| Agent rose | `#EC4899 / F472B6` | 复盘分析 Agent |
| Agent cyan | `#06B6D4` | 股票选择 Agent |

### 6.2 动效系统

| 动效 | 用途 | 关键参数 |
|---|---|---|
| `dynLoadingSweep 1.4s` | 动态布局顶部扫光条 | 紫→青→绿渐变 + forwards |
| `dynPanelRise .55s` | 卡片级联浮现 | translateY(10px) scale(.985) blur(2px) → identity,nth-child 70ms 步长 |
| `chCascadeIn .55s` | chat 气泡浮现 | 同 dynPanelRise 但只用于 .ch-m |
| `chCascadeChild .45s` | chat 富气泡内子节级联 | nth-child 80ms 步长 |
| 4 类 Agent 各自动效 | 见 §3.3 表 | 每个 Agent 有独立 keyframes |
| `prefers-reduced-motion` | 关掉所有 stagger,退回基础 fadeInUp | media query 自动 |

### 6.3 字号系统

`--fs-xs 11px / --fs-sm 12px / --fs-md 13px / --fs-lg 14px / --fs-xl 16px / --fs-2xl 22px / --fs-3xl 28px`

### 6.4 间距 / 圆角

间距 `4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24`;圆角 `--r-sm 3px / --r-md 5px / --r-lg 8px / --r-xl 10px / --r-pill 14px`

---

## 七、内容数据来源(原型 mock)

| 数据 | 文件 | 内容 |
|---|---|---|
| 全局场景 S | `js/data.js` | active / calm / down 三档,持仓总览 + 时间线事件 |
| 持仓 holdings | `js/data.js` | 8 支股票详细(权重 / Beta / 风险等级) |
| ddb 简表 | `js/data.js` | 10+ ticker 行情(NVDA/AAPL/TSM/...) |
| **nvdaDetail** | `js/data.js` | NVDA 全维度(热点 / 公司百科 / 营收构成 含子项 / 财务评分含雷达 / 估值 4 项 / 事件 / 日程) |
| signalDB | `js/data.js` | AMZN / AAPL Signal 详情(verdict / 论据 / 论证流程) |
| awState | `js/data.js`(via home.js) | AI 工作台任务 / 策略 / 订单 |

外部 API 真接入时,以上 mock 各自对应一个数据源(行情 / 持仓 / 标的详情 / Signal / 工作台)。

---

## 八、与 v2.1 的差异清单

| 模块 | v2.1 | v3.0 |
|---|---|---|
| Agent 体系 | 仅选股 1 个 | 4 个差异化 Agent(配色/动效/名字独立) |
| dyn-research 模块数 | 13 | 13 但顶部 AI hero / 底部 AI 深度段已删除,改为 Agent 面板承载 |
| dyn-research 长桥原生模块 | 无 | 4 个新增(公司百科 / 营收构成含子项 / 财务评分含雷达 / 估值 4 卡)+ 3 侧栏小卡(热点 / 事件追踪 / 日程&公告) |
| 财务评分布局 | 雷达 + 表平铺 | tabs 上移 + 雷达进 tab content + 5 评分组默认收起 |
| 营收构成 legend | 2 行扁平 | 父子 7 行(2 父 + 5 子) + YoY 列 |
| dyn-risk chat | 通用 4 段 | 富 7 段 `lbaiRiskChat` + 「建议策略」CTA + `suggestRiskStrategy` 3 张策略卡 |
| 首页变化事件 | 行内卡片散落 | 快讯式时间线(左 dot + 时间置顶 + chip 行) |
| 动态布局加载动效 | 仅基础 fadeInUp | 顶部扫光条 + nth-child 级联 + reduced-motion 兜底 |
| chat 加载动效 | 基础 .fi | chCascadeIn 增强 + 富气泡内子级 stagger |
| 详情面板 dpBack | 「← 返回」按钮在顶 | 已删除,只留 ✕ |
| 个股详情 营收构成 | 在 openDetail 渲染 | 已移除(空白多),仅保留公司百科 + 财务评分 |

---

## 九、未做的事(明确排除)

- 不引入 longbridge.com 详情页的「业绩构成 关键因子思维导图」(29 节点可拖拽,交互复杂)
- 不引入「股票排行榜」(AI 首页无右侧栏位)
- 不修改普通标的详情(.dt-*)和 Signal 详情(.sd-*)的核心结构,只删 dpBack 与 营收构成
- 不为 dyn-tradeplan / dyn-compare 单独配 Agent,沿用 v2.1 既有结构
- 不为非 NVDA 的 ticker 提供与 NVDA 等深的数据(`nvdaDetail` 仅一支,其他走 `ddb` 简表)

后续若需扩展,见 [SPC-v1.0.md](SPC-v1.0.md) §11 待办清单。

---

## 十、v3.1 Patch · 2026-04-30 增量更新

| 编号 | 内容 | 影响章节 |
|---|---|---|
| P1 | **语音输入入口**:输入框 send 按钮前嵌入 mic button(`.gi-mic`),点击切 recording 态(红色双层涟漪环 + .gi-box 红边 + placeholder 改「聆听中... 说出你想问的问题」+ input disabled)。原型只做视觉反馈,真接入 Web Speech API 时在 `toggleVoiceInput()` 内补 `webkitSpeechRecognition.onresult → sendG()` | §二、§三 |
| P2 | **NVDA + Enter chat 与「AI 深度研究」按钮统一**:`chatRespondToView('dyn-research', t, tk)` 早路返回到 `lbaiChat(t, tk)`(原通用 4 段 summary/pointTo/detail/chips 已弃用)。两个入口产出完全一致:7 段(检索折叠 + 引言 + 技术面 + 估值 + 产业 + 情景推演 + 来源/反馈),末尾 `.ch-fups` 包含 **6 个 ✦** = 4 深度追问(超买/PE/算力/CapEx)+ 2 nav 跳转(同类型/上下游) | §四 4.2 |
| P3 | **dyn-attribution 改造为市场频道视角**(原「我的持仓今日下跌」已弃用)。新主区 7 行:① 市场切换 4 pill(美股 default / 港股 / 新加坡 / 沪深通,**已删全球指数**)② 三大指数卡(Dow / NASDAQ / S&P 500,带红色 sparkline + driver chip)③ 板块表现 11 行 SPDR ETF 双向 bar ④ **今日关键事件 9 条 timeline**(每条带利空/利多/中性 lvl chip)⑤ 美股跌幅榜 Top 10 ⑥ 主力资金流向 + VIX ⑦ 超级财报周日历 + 4 巨头 6000 亿 CapEx | §四 4.4 |
| P4 | **新增 `lbaiAttributionChat(query)` 4 段宏观分析流**(替换原通用 chatRespondToView 输出)。结构:topic chip(amber)+ 6 工具 chip 折叠节 + 引言 + 一、科技板块承压(OpenAI / AI CapEx)+ 二、通胀风险重燃(美伊 / 油价)+ 三、宏观流动性收紧(FOMC / 10Y 美债)+ 四、观望情绪浓厚(超级财报周)+ **10 来源 chip + 11 个 inline `.ch-cite` 来源**(新浪财经 / k.sina.com.cn / 163.com / Access)+ 4 ✦ 跟进 | §三 3.4 / §四 4.4 |
| P5 | **三大指数卡宽度对齐**:`.rs-idx-grid` 改 `repeat(3, minmax(0,1fr)) + width:100%`,`.rs-idx-card` 加 `min-width:0 + overflow:hidden`,确保 3 卡总宽 = 下方 2-panel 行总宽(像素级对齐) | §四 4.4 |

### 与 v3.0 章节差异

- **§3.4 chat 流式富回复 7 段结构** 已分流到不同视图的专属函数:
  - `dyn-research` → `lbaiChat`(7 段标的研究)
  - `dyn-screener` → `lbaiScreenerChat`(选股 6 段)
  - `dyn-risk` → `lbaiRiskChat`(7 段持仓复盘 + 建议策略 CTA)
  - `dyn-attribution` → `lbaiAttributionChat`(9 段宏观分析,含 11 来源 chip)
  - 其余视图(dyn-compare / dyn-tradeplan)仍走通用 4 段
- **§4.4 dyn-attribution** 内容完全替换:从「持仓今日下跌瀑布图 + 受影响持仓表」→「市场频道 7 行布局」
- **§6 视觉规范** 新增 `.gi-mic` 红色家族(`#EF4444` + 双层涟漪)、`giMicRipple / giMicWobble` keyframes
- **§9 未做的事** 新增:语音输入未接 Web Speech API(仅视觉态);全球指数 tab 不在范围内

### 改动文件

| 文件 | 改动行数 |
|---|---|
| `index.html` | +1(mic button HTML) |
| `js/sidebar.js` | +25(`toggleVoiceInput` + chatRespondToView 双路由) |
| `js/dynamic.js` | -50 / +180(renderDynAttribution 重写) |
| `js/detail.js` | +110(lbaiAttributionChat) + 2(lbaiChat fup buttons) |
| `css/base.css` | +20(`.gi-mic` 系) |
| `css/dynamic.css` | +60(`.rs-mkt-* / .rs-idx-* / .rs-sec-* / .rs-evt-* / .ch-cite`) |
