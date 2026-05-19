# Longbridge AI Web · v4

本地 v3.0 原型(`longbridge-web-demo/`)的 AI 原生进化版。把 concept 仓
(`longbridge-ai-concept-main`)的工程范式 —— Tool Use 渲染 InfoCard、HITL
四形态、四工作状态 Shell、page-aware chat、Catalyst → Signal → Thesis → Plan →
Review 全 Artifact 闭环 —— 落到本地 v3.0 的产品决策(4 类色系 Agent / 6 类
dyn 视图 / 7 段流式 chat / 快讯式时间线 / NVDA 13 行原生数据)上。

> **不取代** `longbridge-web-demo/`(vanilla 原型,继续保留作对照演示)。

---

## 快速启动

```bash
# 1 · 装依赖(Node 20+)
npm install

# 2 · 配 Anthropic API Key
cp .env.example .env.local
# 把 sk-ant-... 填到 ANTHROPIC_API_KEY

# 3 · 跑开发
npm run dev
# → http://localhost:3000

# 4 · 类型检查
npx tsc --noEmit
```

不填 key 也能跑 —— Shell / 6 dyn 视图 / 全部 IA 路由都能开,只是右栏 chat 报
"Cannot read API key" 的 SSE error。

---

## 跑一遍主要交互(8 分钟)

1. 进 `http://localhost:3000` → 看到本地版 home(指数条 + AI 工作台 + 快讯时间线
   + 6 widget)
2. 在底部输入框键入 **"NVDA"** → 主区切到 dyn-research(紫 Agent 面板) +
   chat 顶部 chip 变成"研究 · NVDA / 深度分析 · 紫色 Agent" + chat 宽度变 480px
3. 输入 **"持仓风险"** → 切 dyn-risk(玫瑰 Agent) + state=review
4. 输入 **"为什么跌"** → 切 dyn-attribution(琥珀 Agent)
5. 输入 **"中概股潜力股"** → 切 dyn-screener(青 Agent)
6. 输入 **"加仓 NVDA"** → 切 dyn-tradeplan + state=trade,chat 收起为浮按钮
7. 在 chat 里说"帮我起一个减仓方案" → AI 调 `trigger_hitl_confirm` →
   按"确认" → AI 工作台「需关注」组立刻多一条 `PENDING_HITL` Plan
8. 左导航点 **「论点」** → 进 thesis 列表 → 点
   `thesis-nvda-ai-infra` → 完整 Thesis 编辑器(假设置信度 + 证伪条件 + 版本)

---

## 页面 / 路由

```
LeftRail 7 项:
  / 首页(本地 home + 6 dyn 视图,URL ?view= 切换)
  /markets 行情(指数 + 主题)
  /portfolio 资产
  /plan 计划(5 状态 tab + 详情页 + HITL Ack)
  /thesis 论点(列表 + 编辑器)
  /review 复盘(列表 + 三段式编辑器)
  /strategy 策略广场(官方 4 + 社区 + Builder + 我的)
  + /marketplace · /portrait · /watchlist · /screener · /search ...
```

URL 参数:
- `?view=dyn-{research,risk,attribution,screener,tradeplan,compare}` · 在 home 内切换主区
- `?symbol=NVDA` · 配合 view 给 chat 角色提供 ticker 上下文
- `?state=reading|research|trade|review` · 工作状态(Shell chat 宽度跟随)
- `?peek=sig-* | cat-* | plan-* | NVDA.US` · 右侧抽屉 peek + chat 切上下文

---

## 工程亮点

| 范式 | 来自 | 落地 |
|---|---|---|
| 4 工作状态 Shell 滑移 | concept | `lib/workState.ts` + `Shell.tsx` 按 state 切 chat 宽度(360/520/0) |
| Anthropic SSE + Tool Use | concept | `app/api/chat/route.ts` agentic loop + 8 类工具 |
| Tool Use 渲染 InfoCard | concept | `components/chat/ToolBlock.tsx` 路由到 5 widgets(Catalyst/Signal/Quote/HITL Confirm/HITL Multiselect) |
| HITL 真写入 Artifact | 本地新增 | `lib/dynamicPlans.ts` + `HitlConfirm.tsx` → 工作台同步 |
| page-aware chat 角色 | concept + 本地扩展 | `lib/ai/pageContext.ts` `getContextForPath / getContextForView / getContextForPeek` 三优先级 |
| 4 类色系 Sub-Agent | 本地 v3.0 | `components/dynamic/AgentPanel.tsx` 紫/玫瑰/青/琥珀 |
| 6 类 dyn 视图 | 本地 v3.0 | `components/dynamic/DynView.tsx` + 顶部输入框 classifyIntent |
| 底部全局输入条 | 本地 v3.0 | `components/shell/InputBar.tsx` live morph + URL view/symbol/state 同步 |
| Catalyst→Signal→Plan→Review | concept | `mock/{catalysts,signals,theses,tradePlans,reviews,strategies}.ts` |
| Strategy / Sub-Agent / Skill 三层生态 | concept | `/strategy` 广场 + `/strategy/builder` + `/marketplace` + `/subagents` |
| 暗色 Fintech 设计令牌 | 本地 v3.0 | `docs/brand-kit/tokens.css` 4 Agent 色 + 紫主色 + Design-Review P0 修缮 |

---

## 目录结构

```
longbridge-web-next/
├── app/
│   ├── layout.tsx                   · DM Sans + JetBrains Mono + Source Serif 4
│   ├── globals.css                  · Tailwind 4 @theme 映射 lb-* 到 utility
│   ├── api/chat/route.ts            · Anthropic SSE + Tool Use agentic loop
│   └── (app)/
│       ├── layout.tsx               · 包 Shell
│       ├── page.tsx                 · home + 6 dyn 视图(URL ?view= 切换)
│       ├── plan/[id]/               · Plan 详情 + HITL Ack
│       ├── thesis/[id]/             · Thesis 编辑器 + 4 假设置信度
│       ├── review/[id]/             · 三段式 Reflection Editor
│       ├── strategy/                · 广场 + builder + mine + [id]
│       ├── marketplace/             · Strategy/Sub-Agent/Skill 三 tab
│       ├── portfolio/{[symbol],}    · 组合 + 单股
│       ├── markets/{themes/[slug],} · 行情 + 主题
│       └── stock/[symbol]/          · 个股(Stage C 接实时行情)
├── components/
│   ├── shell/                       · TopBar/LeftRail/RightChat/PeekDrawer/InputBar/WorkStateIndicator
│   ├── chat/{ToolBlock,widgets/}    · 5 类 InfoCard widget
│   ├── dynamic/{DynView,AgentPanel} · 6 dyn 视图骨架 + 4 色系 Agent
│   └── brand/Logo.tsx
├── lib/
│   ├── ai/{client,clientEvents,pageContext,systemPrompt,tools}.ts
│   ├── workState.ts                 · 4 状态 hook
│   ├── intent.ts                    · classifyIntent 词典
│   ├── dynamicPlans.ts              · client store · HITL 写入
│   └── universe.ts                  · 10 demo symbols
├── mock/
│   ├── localHome.ts                 · 本地 v3.0 home 数据(从 js/data.js 翻译)
│   ├── catalysts.ts / signals.ts / theses.ts / tradePlans.ts / reviews.ts
│   └── strategies.ts / portraits.ts / portfolio.ts / themes.ts
├── docs/brand-kit/tokens.css        · 暗色 Fintech 设计令牌
└── types/domain.ts
```

---

## 已实现 / 未实现

### ✅ 已实现(Stage 0 + A + B)

- 项目骨架 + Anthropic SSE + Tool Use 端点
- 本地 home(AI 工作台 + 快讯时间线 + 6 widget)
- 6 dyn 视图骨架 + 4 类色系 Sub-Agent 面板
- 底部全局 InputBar live morph + classifyIntent + URL ?view=&symbol=&state= 同步
- page-aware chat 角色字典(home / 6 dyn / 各路由)
- 4 工作状态 Shell 滑移(reading/research/trade/review)
- HITL Confirm 真写入 dynamicPlans store + AI 工作台同步显示
- LeftRail 7 项中文导航 · 全部路由可跳转
- Thesis / Review / Strategy / Marketplace 详情页 全部从 concept 拷过来,完整 UI

### ⚠️ 占位(Stage C/D 完整闭环待迭代)

- `/markets` `/portfolio` `/plan/[id]` `/stock/[symbol]` `/watchlist` 是 mock-only
  简版(Stage C 才真接实时行情 + 全维数据 + 单股诊断)
- Catalyst → Signal → Plan → Review 闭环还需要在首页时间线点击交互上做端到端
  联动(home 时间线点 Catalyst 派生 Signal → Signal 卡"起 Plan 草稿"→ 平仓自动 review)
- Sub-Agent IO 契约 / Skill 自建发布 还未具象

### 🚫 刻意不做

- 真实下单通路(Plan 走到 Ack 即停)
- 真实行情(Stage C 才接 Longbridge OpenAPI;当前全 mock)
- 用户谱系切换 / 跨设备记忆 / 商业化 UI

---

## 与 longbridge-web-demo 的关系

| 文件 / 概念 | 本地原型 | 新项目 |
|---|---|---|
| 4 类色系 Agent | `js/dynamic.js` 手写 | `components/dynamic/AgentPanel.tsx` |
| 7 段流式 chat | `js/detail.js` lbaiChat 家族 | `lib/ai/systemPrompt.ts` 教 Claude 输出 |
| classifyIntent | `js/sidebar.js` | `lib/intent.ts` |
| 输入框 .gi | index.html `.gi` | `components/shell/InputBar.tsx` |
| AI 工作台 | `js/home.js` renderHome | `app/(app)/page.tsx` `<AiWorkbench>` |
| 快讯时间线 | `js/home.js` evH | `app/(app)/page.tsx` `<Timeline>` |
| 6 widget | `js/home.js` 嵌入 | `app/(app)/page.tsx` `<Widgets>` |
| holdings/ddb/nvdaDetail | `js/data.js` | `mock/localHome.ts`(v1) + `mock/portfolio.ts` |
| 设计 tokens | `css/base.css` :root | `docs/brand-kit/tokens.css` |

---

## 下一步(Stage C/D 完整版)

1. **Catalyst→Plan 闭环交互** · 首页时间线 Catalyst 卡加"派生 Signal" CTA;Signal
   卡加"起 Plan 草稿"hitl_multiselect;Plan ack 后自动建 Review 草稿
2. **NVDA 13 行原生数据** · `dyn-research` 主区填上营收堆叠 + 财务雷达 + 估值四卡
   + 公司日程(对照 `nvdaDetail` mock)
3. **Plan 5-state 完整状态机** · `plan/[id]` 恢复 concept 原版(去 longport 依赖,改 mock)
4. **Sub-Agent IO 契约** · 把 4 类色系 Agent 的输入 / 输出 schema 写到 `mock/subAgents.ts`
5. **/markets 实时行情** · 接 Longbridge OpenAPI(需要单独的 LONGPORT_* env)

---

## 故障排查

- `Cannot find module 'tw-animate-css'` → 已移除 import,无需此包
- chat 没响应 → 检查 `.env.local` 是否填了 `ANTHROPIC_API_KEY`
- 路由 404 → 重启 dev server(`npm run dev`),Turbopack 不总能感知新增目录
- TS 报错 `lib/longport/client` → 已删,如有遗留引用请改为 mock-only

---

## 原始计划

完整路线图见 `/Users/david/.claude/plans/https-github-com-zxsky1-longbridge-ai-co-cosmic-ember.md`
