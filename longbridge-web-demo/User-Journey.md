# Longbridge Web 原型 · 典型 User Journey 验证文档

按 7 类典型用户场景组织。每条 journey 含:
- **场景**:用户当时的心理状态 / 触发起点
- **预期**:用户希望产品做到的事(用来对照原型是否满足)
- **路径**:具体操作 + 系统反馈
- **验证点**:✓ 已实现 / ✗ 缺失 / ◐ 部分

打开 `index.html`,逐条走一遍即可知道哪些没达标。

---

## Journey 1 · 5 分钟早晨扫场(浏览型)

### 场景
开盘前 5 分钟,边喝咖啡边看一眼市场。**只想知道:AI 帮我盯了什么?发生了什么?组合状况?** 不打算做任何交易决策。

### 用户预期
1. 打开就看到关键信息,不需要翻页
2. 跟我有关的 vs 不相关的 要分开
3. AI 在做的事要透明
4. 没事可以马上关掉

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 打开页面 | 持仓总览出现在顶栏(总资产/今日 +%)| ✓ 顶部指数条 + 左侧导航(资产入口)|
| 2 | 视线扫"进行中的任务" | 知道 AI 在做什么(N 个任务运行中)| ✓ 横向卡片 + 状态色彩 |
| 3 | 视线扫"变化事件" | 4 条新变化清晰可见 | ✓ 时间线 + 上次访问分割线 |
| 4 | 看见 NVDA 异动条目"持有 18%" | 立即知道这跟我有关 | ✓ 「与你相关」独立行 |
| 5 | 不做任何点击,关闭浏览器 | 已读状态保留 | ✓ localStorage 持久化 |

### 期望结果
**用 30 秒就能消化页面信息,不需要任何输入。** 信息密度足够高、视觉层次清楚。

### 满足度评估
**✓ 完全满足**。Persona 主要靠"感知层"的三个区块完成扫场,无需动态视图。

---

## Journey 2 · Signal 跟单 → 下单(交易型,核心主路径)

### 场景
看到时间线有 AMZN Bullish Signal,**决定深入研究并可能下单**。

### 用户预期
1. Signal 详情应该比 App 更密集(Web 屏幕大)
2. 看完 Signal 应该能"一键"建仓,不要让我手动算参数
3. 下单前后 AI 要能说清"我做了什么"
4. 下单后能持续看到订单状态,不用换页查

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 时间线点 AMZN Signal 富卡 | Signal 详情滑入,主区不挤压只居中 | ✓ `body.dp-open` margin auto 居中 |
| 2 | 滚动看 Final verdict / Strategy fit / Analysis process | 关键判断 + 评分 + 推理过程都在 | ✓ 4 KV + 87/100 + 折叠节 |
| 3 | 点底部 "Draft trade plan" | chat 流式逐段输出策略草案(不是一次性)| ✓ chatStream 7 步 |
| 4 | 看 chat 末尾 3 个 ✦ 按钮 | 可选:执行 / 调整 / 学习 | ✓ Move forward / Increase / Tell more |
| 5 | 30 秒过去都没点 Draft trade plan(假设)| 顶部出现 chip "Signal 研究 · AMZN" | ✓ signal-30s timer |
| 6 | 点 ✦ "Move forward with this trade plan" | 工作台最左挤入新卡(亮绿动)| ✓ squeeze-in + activating 状态 |
| 7 | chat 出现 ✓ Order submitted 富气泡 | 出现的瞬间卡片状态切运行中(深绿)| ✓ chatStream 回调驱动状态切换 |
| 8 | 富气泡里点"如何监控我的策略" | chat 接续输出监控说明 | ◐ 按钮存在但未实际接 |
| 9 | 关闭 Signal 详情 | 主区恢复全宽,工作台 chip 自动清掉 | ✓ closeDetail + removeChipById |

### 期望结果
**从看 Signal 到下单 → 工作台监控,全在一个页面完成,不需要跳页。** 视觉上能感受到"AI 正在做事"。

### 满足度评估
**✓ 95% 满足**。第 8 步监控按钮当前是占位,但核心下单链路完整无缺。

---

## Journey 3 · 持仓诊断 → 再平衡(决策型,跨视图)

### 场景
最近组合涨幅好但**心里不踏实**,担心集中度过高,想做个全面诊断,可能决定加分散。

### 用户预期
1. 输入"分析持仓风险"→ 主区给我看,而不是 AI 念一遍
2. 系统应该自动识别哪个仓位最危险
3. 给出可执行的对策(不是抽象建议)
4. 我决定调整后,后续操作要顺承,不重新输入

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 底部输入"分析持仓风险" | 还没回车,主区切 dyn-risk + 右侧 #dp 弹出**复盘分析 Agent**(rose 主题 + 3 道 CCW 弧线) | ✓ handleLiveInput + openReplayAgentPanel |
| 2 | 看到风险评分 72 分 + 集中度 Top5 | NVDA 18% 标橙色警示 | ✓ holdings 数据驱动 |
| 3 | 回车 | chat 流式输出**lbaiRiskChat 7 段**:topic + 任务/检索折叠 + § 一持仓分布(stacked bar)+ § 二风险拆解(3 张 risk-card)+ § 三组合层面 + § 四摘要表 + 「✦ 建议策略」rose CTA | ✓ chatRespondToView → lbaiRiskChat |
| 4 | 点 chat 末尾「建议策略」 | chat 追加 3 张策略卡(A NVDA 部分止盈 + 期权 / B 板块再平衡 / C AAPL 条件单)+ 2 个 ✦ 跟进 | ✓ suggestRiskStrategy |
| 5 | 持仓表 NVDA 行点开 | 详情列右侧滑入,显示 NVDA 详情 | ✓ openDetail |
| 6 | 输入"对比 NVDA 和 AMD" | 主区切到 dyn-compare | ✓ |
| 7 | 看 Factor Grades 高亮表 | 7 行 vs 对比 + 优势 chip | ✓ NVDA 领先 3 项 / AMD 估值占优 |
| 8 | 点底部"建 AMD Trade Plan" | 主区切到 dyn-tradeplan | ✓ tryIntent |
| 9 | 修改行权价 / 数量 | 右列 6 数字 0.4s 闪烁更新 | ✓ tpRecalc + tp-flash |
| 10 | 点"下单这个 Plan" | Move forward 流程触发(同 Journey 2 第 6-7 步)| ✓ moveForwardTradePlan |

### 期望结果
**从风险体检 → AI 复盘建议 → 选 A/B/C 策略 → 建仓执行,5 个动态视图无缝切换。**

### 满足度评估
**✓ 95% 满足**。第 6 步 dyn-risk 主区底部"对比"按钮当前是 placeholder 占位(需手动输入),修复需 5 行代码。富 chat 复盘 + 建议策略 CTA + 3 策略卡链路完整。

---

## Journey 4 · 标的研究 NVDA(学习型,长停留)

### 场景
听同事说 NVDA 涨疯了,想知道**到底有没有机会、估值贵不贵、技术面怎么样**,但自己不是专业分析师,要 AI 帮判断。

### 用户预期
1. 主区给我看结构化数据(像 SeekingAlpha + 长桥个股详情)
2. AI 对话给我读叙述性分析
3. 数据要带"vs 行业 / vs 历史"参考,不能只给绝对值
4. 看完一轮,我应该能问下一个具体问题

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 输入"NVDA"(live) | 主区即时切 dyn-research,右侧 #dp 弹出**深度分析 agent**(purple + 同心环) | ✓ classifyIntent + openResearchAgentPanel |
| 2 | 看行情头(全宽)+ KPI 6 + 走势图 | 股价 $209.250 + 跌幅 + 时间 tabs | ✓ rs-quote-hd |
| 3 | 看公司百科 + 事件追踪 timeline | 9 月 30 日 5 条 / 9 月 29 日 1 条 | ✓ rs-bio + rs-tl |
| 4 | 看营收构成(7 年堆叠柱图)+ 财务评分(雷达 + 5 评分组) | 计算和网络 89.6% / 图形 10.4% + 雷达 5 顶点 | ✓ drawRsRevenueChart + rsRadarSvg |
| 5 | 看估值分析 4 卡 2×2 | PE / PB / PS / 股息率,各带 1Y/3Y/5Y/10Y pill + 折线 | ✓ drawRsValuationCharts |
| 6 | 看同行业对比表 | NVDA 行高亮,vs AMD/AVGO/MRVL/INTC | ✓ peer-tbl self 行 |
| 7 | 回车发送"NVDA" | chat 流式输出**lbaiChat 7 段**(与「AI 深度研究」按钮同款):检索折叠 + 引言 + 技术面 + 估值 + 产业 + 情景推演 + 来源/反馈 + **6 ✦ 跟进**(4 深度问题 + 2 nav:同类型/上下游) | ✓ chatRespondToView → lbaiChat |
| 8 | 点 chat 末尾 ✦"基于 NVDA 查找同类型的股票" | 主区切 dyn-screener default + #dp 切 screener-agent + chat 输出选股分析 + CTA | ✓ findSimilarStocks |
| 9 | 点 chat 内"在选股器中查看" | 主区切到 dyn-screener filled(14 行半导体) | ✓ applyScreenerFromChat |
| 10 | 点 chat 任意 ✦ 深度问题 | 触发新一轮 | ✓ tryIntent |

### 期望结果
**主区 13 个模块密集到位,chat 复用 lbaiChat 与「AI 深度研究」按钮等价,继续追问形成连续对话。**

### 满足度评估
**✓ 100% 满足**。v3.1 patch 后 NVDA + Enter 直接路由 lbaiChat,完整 7 段富回复 + 6 ✦ 跟进按钮。同类型/上下游 nav 跳转链路通畅。

---

## Journey 5 · 跌市归因 → 紧急止损(应急型)

### 场景
开盘后**持仓全红**,组合 -2.7%。用户慌了,想立刻知道:**为什么、要不要止损**。

### 用户预期
1. 输入"为什么跌了"瞬间出诊断,**不能让我等**
2. 系统要自动识别**哪个仓位拖累最大**
3. 给出**具体可执行**的止损建议(数量/价位)
4. 我点了执行,要立刻进入下单流程

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | console: `setS('down')`(模拟下跌日,可选)| 整个页面切下跌场景 | ✓ |
| 2 | 输入"今天为什么跌了" | 主区切到 dyn-attribution + 右侧 #dp 弹出**大盘分析 agent**(amber + 横向扫描线) | ✓ classifyIntent + openMarketAgentPanel |
| 3 | 看市场切换 4 pill | 美股(默认 on)/ 港股 / 新加坡 / 沪深通 + 最近更新时间 | ✓ rs-mkt-tabs |
| 4 | 看三大指数卡(Dow / NASDAQ / S&P 500)| 大数字 + 涨跌点 + 红色 sparkline + 主要驱动 chip | ✓ rs-idx-grid |
| 5 | 看板块表现 11 行 | XLE 能源 +1.82% / XLK 科技 -3.20%,中线为零的双向 bar | ✓ rs-sec-list |
| 6 | 看今日关键事件 9 条 timeline | 时间 + 来源 chip + **利空(红)/ 利多(绿)/ 中性(amber) lvl chip** | ✓ rs-evt-list |
| 7 | 看美股跌幅榜 Top 10 | NVDA -4.18% / AMD -3.92% / 各带下跌主因 | ✓ peer-tbl |
| 8 | 看主力资金流向 + VIX + 超级财报周日历 | 5 行业进出 + 4 巨头 6000 亿 CapEx | ✓ |
| 9 | 回车发送"今天为什么跌了" | chat 流式输出**lbaiAttributionChat 9 段**:topic chip(amber)+ 折叠节(6 工具 chip)+ 引言(三大共振因素)+ § 一科技板块承压 + § 二通胀风险 + § 三宏观流动性 + § 四观望情绪 + **10 来源 + 11 个 inline `.ch-cite`** + 4 ✦ 跟进 | ✓ chatRespondToView → lbaiAttributionChat |
| 10 | 点 chat 末尾 ✦"看下跌对我持仓的影响" | 主区切 dyn-risk + #dp 切 replay-agent + chat 切 lbaiRiskChat 流 | ✓ tryIntent('分析我的持仓风险') |
| 11 | (在 dyn-risk)点「建议策略」CTA → 选 C AAPL 条件单 | 后续追问 + Trade Plan 链路 | ✓ suggestRiskStrategy |

### 期望结果
**从"为什么跌"(市场维度) → "对我影响多大"(持仓维度) → "怎么做"(策略),三层递进无缝衔接。**

### 满足度评估
**✓ 95% 满足**。v3.1 patch 后 dyn-attribution 完全改造为市场频道视角,chat 替换为 4 段宏观分析(含来源 chip),通过末尾 ✦ 跟进自然过渡到持仓维度复盘。dyn-tradeplan 期权 4 类无现货卖出选项的旧问题不再阻塞此流程(已绕开)。

---

## Journey 6 · 资讯 / 社区浏览(消费型)

### 场景
工作间隙,**没目的地刷一下市场资讯和社区帖子**。

### 用户预期
1. 资讯有 hero 大图,有热度排序
2. 社区帖子能跳标的详情
3. 内容深度可以无限滚,不会卡

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 左侧点📰资讯 | 主区切 v-news,Hero + 6 条列表 + 右侧 Earnings Calendar | ✓ renderNews |
| 2 | 看到 Pinned 标签 + 关联股票 chips | 知道哪条是热点 | ✓ nw-row-pin / nw-row-tag |
| 3 | 点新闻条目 | 应该跳详情 | ✗ 当前只是 hover 高亮,不跳转 |
| 4 | 左侧点👥社区 | 主区切 v-community,3 帖 + 侧栏 | ✓ renderCommunity |
| 5 | 看帖子里的 `$Focus Media(002027.SZ)` ticker | 应该可点击跳详情 | ✗ 当前是青色 cursor 但无 onclick |
| 6 | 看右侧 Top Trending Stocks 5 行 | 排名色 + logo + 价格 + ♥ 关注 | ✓ cm-trend-row |
| 7 | 点 ♥ 关注按钮 | 加入自选 | ✗ 当前是静态显示,无逻辑 |

### 期望结果
**资讯 / 社区是浏览型场景,不要求做交易,但跳详情、关注、点赞这些基础动作要能做。**

### 满足度评估
**◐ 70% 满足**。视觉模仿 longbridge.com 到位,但**点击行为大量缺失**:新闻不跳详情、社区 ticker pill 不跳详情、♥ 关注无效。这些都是 1-2 行代码可补的(添加 onclick 调 openDetail / 添加自选状态)。**当前对 demo 影响不大**——demo 时不点这些。

---

## Journey 7 · 直接下单(执行型,熟手)

### 场景
**已经决定要买 NVDA 10 股**,直接走交易页下单,不需要 AI 分析。

### 用户预期
1. 进交易页就有下单 panel,不需要先选标的
2. 输入价格数量后,**预估金额 / 手续费 / 购买力立刻显示**
3. 提交后立即看到委托记录

### 路径
| 步骤 | 用户动作 | 期望反馈 | 验证点 |
|------|---------|---------|--------|
| 1 | 左侧点💱交易 | 主区切 v-trade,4 tabs + 下单 panel + 委托表 + 条件单 + 账户信息 | ✓ renderTrade |
| 2 | 看到买入 BUY 已选中(绿色)| 默认买入 | ✓ td-order-side-b.buy.on |
| 3 | 切换为卖出 SELL | radio 切换 | ✗ 当前点击无效(无 onclick)|
| 4 | 输入价格 / 数量 | 摘要(预估金额 / 手续费 / 合计 / 购买力)实时更新 | ✗ 当前是写死数字,不重算 |
| 5 | 点提交订单 | 弹确认弹窗 | ✗ 当前点击无反应 |
| 6 | 看今日委托表 | 3 笔历史委托(NVDA 已成交 / TSLA 委托中 / AAPL 已撤)| ✓ 静态展示 |

### 期望结果
**真实下单流程能跑通,而不是 mockup 截图。**

### 满足度评估
**◐ 50% 满足**。**视觉完整,交互未接**。当前交易页是"演示截图",不是"可交互 prototype"。如果 demo 时需要演示交易,要补:radio onclick / 价格数量 oninput 重算 / 提交按钮二次确认弹窗。预估 0.5 天工作量。

---

## 综合满足度汇总(v3.1 patch 后)

| Journey | 满足度 | 核心断点 |
|---------|--------|---------|
| 1 早晨扫场 | ✓ 100% | 无 |
| 2 Signal 跟单 | ✓ 95% | 监控按钮占位 |
| 3 持仓诊断 → 再平衡 | ✓ 95% | risk 视图"对比"按钮没预填对比对象(富 chat + 建议策略 CTA 已就位) |
| 4 标的研究 | ✓ 100% | 已修复:NVDA + Enter 直接跑 lbaiChat 7 段 + 6 ✦ 跟进 |
| 5 跌市归因 → 持仓影响 → 策略 | ✓ 95% | 大幅升级:市场频道视角 + lbaiAttributionChat 4 段 + 跨视图链路 |
| 6 资讯 / 社区浏览 | ◐ 70% | 新闻不跳详情、ticker pill 不跳详情、♥ 关注无效 |
| 7 直接下单 | ◐ 50% | radio / 价格 / 提交按钮无 onclick |
| 8(新)语音输入 | ◐ 50% | 仅视觉态(红色双层涟漪 + 输入框红边),Web Speech API 未接入 |
| **加权平均** | **≈ 87%** | 4 大主路径(扫场/Signal/复盘/研究) ≥ 95%,跌市归因升级到市场频道,辅助场景仍偏弱 |

---

## 验证使用建议

1. **打开 `index.html`**,按 Journey 1 → 7 顺序走一遍
2. 每条 journey 走到"验证点"那一列,**实际操作 vs 表格标记**对照
3. 发现 ✓ 但实际不行的,贴图给我修
4. 发现 ✗ 或 ◐ 是预期内,**按当前优先级排序**:
   - **P0(影响主交易链路)**:Journey 4 第 9 步、Journey 5 第 8 步
   - **P1(影响演示完整度)**:Journey 7 全部、Journey 6 第 3/5/7 步
   - **P2(锦上添花)**:Journey 2 第 8 步、Journey 3 第 4 步

---

## 一句话总结

**4 大主路径(早晨扫场 / Signal 跟单 / 持仓复盘+建议策略 / 标的研究 lbaiChat)完成度 ≥ 95%,**外加 v3.1 patch 后**跌市归因升级到市场频道视角(三大指数+板块表现+9 条事件+lbaiAttributionChat 4 段宏观+跨视图链路至持仓复盘)**,可以做完整产品 demo;辅助场景(资讯阅读、直接下单、语音入口接入)完成度 60%,demo 时绕开即可。整体原型对核心叙事("LUI + GUI 共生 / 4 类差异化 Agent / 富 chat 流分场景")的支撑充分。

---

## v3.1 增量(2026-04-30)

| 项 | 影响 journeys |
|---|---|
| NVDA + Enter chat 复用 lbaiChat | J4 ◐ 85% → ✓ 100% |
| dyn-risk 富 chat + 建议策略 CTA + 3 策略卡 | J3 ✓ 90% → ✓ 95% |
| dyn-attribution 改造为市场频道 + lbaiAttributionChat | J5 ◐ 80% → ✓ 95% |
| 输入框语音 mic 按钮 | 新 J8 |
| 加权平均 | 82% → 87% |
