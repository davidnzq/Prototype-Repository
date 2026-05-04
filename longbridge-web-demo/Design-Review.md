# Longbridge Web 原型 · 设计评审报告

评审工具:`ui-ux-pro-max v2.5.0`(99 条 UX 指南 + 161 产品类型 + 161 色板 + 57 字体配对)
评审视角:Real-Time Operations Dashboard / Fintech Trading 类产品标准
评审日期:2026-04-28
评审范围:5 个核心页面(home / 普通标的详情 / Signal 详情 / dyn-research / dyn-screener)

---

## 评审参照基线(skill 给出的 fintech trading 标准)

**Pattern**:Real-Time / Operations Landing
**Color Strategy**:Dark or neutral. **Status colors (green/amber/red)**. Data-dense but scannable.
**Anti-patterns 明确避免**:
- ❌ Playful design
- ❌ AI purple/pink gradients(我们用了 #00F0C4 mint,这不是 AI 紫,但浓度过高也违反"data-dense but scannable")
- ❌ Unclear fees

**Fintech 标准色板**:
- Primary `#F59E0B`(金色,信任感)
- Accent `#8B5CF6`(紫,科技感)
- Background `#0F172A`(我们用 `#0A0E19` ✓ 接近)
- Card `#222735`(我们用 `#1C2029` ✓ 接近)
- Border `#334155`(我们用 `rgba(255,255,255,.06)` ❌ 偏淡)
- Destructive `#EF4444`(我们用 `#FF3A75` ❌ 偏粉)

**Typography 推荐**:Heading Fira Code · Body Fira Sans
**当前实际**:DM Sans + JetBrains Mono · ✓ 都是 dashboard 类合规字体,可保留

---

## 全局问题(跨所有页面)

### G1【P0 · CRITICAL】Emoji 当作结构性 icon · 违反 `no-emoji-icons` 严重违规

**违规清单**(grep 全代码扫到的):
- 首页 Widgets:`💰 总资产` / `⭐ 自选` / `📈 行情` / `🔥 热门` / `📅 财报` / `🏆 排行` 等 6 张卡 hd
- 风险审视(dyn-risk):`💼 ⚠ 📊 ⚡ 📋 🧠`
- 标的研究(dyn-research):`📈 📊 📉 ⚡ 💼 🧠 📐 ⚖ 🔮 ⭐ 💲`
- 选股器(dyn-screener):`📋` 空态图标 / `🇺🇸 🇭🇰 🇨🇳` 国旗 emoji
- Trade 视图:`⚡ 📋 🎯 💼 💰 🔄 📊 🛡`
- Move forward 流程:`✓ ✦ ⚠ ⚙ 📍`
- Café / AI 浮动按钮:`☕ 🤖`

**为什么是 P0**:
1. emoji 在不同 OS / 浏览器下渲染差异巨大(macOS 立体彩色 / Windows 平面 / Android 各家不同)
2. 不能用设计系统 token 控制(颜色 / 大小 / 描边粗细都受字体控制)
3. **fintech 类产品要严肃感**,emoji 违反"avoid playful design"

**修复**:替换为 Lucide / Heroicons SVG 图标,统一 stroke-width:2,size:14-16-20-24 四档

---

### G2【P0 · HIGH】配色系统失控 · 5 个相近青绿色违反 `color-not-only` 和 `state-clarity`

**当前色相清单**:
| 变量 / 值 | 用途 | 问题 |
|-----------|------|------|
| `--g #00ADA2` | 运行中 / 上涨 | 与 `--c` 仅差 11 色相 |
| `--c #00B8B8` | 正常 / Signal 标签 | 与 `--g` / `#34D399` 难分辨 |
| `#34D399` | 激活中 | 与 `#00F0C4` 仅差 25 |
| `--ai #00F0C4` | AI 主题色 | 极易混淆 `#34D399` |
| `#22C55E` | Quant Rating A | 与上面所有都偏向青绿 |

**违反规则**:
- `state-clarity`:状态视觉无法明显区分
- `color-semantic`:color tokens 没有语义对应,而是色相滑动
- `color-not-only`:多处状态只靠色彩区分,无 icon / 文字辅助

**修复方案**(收敛到 3 色 + 中性):
```
--success-strong   #00ADA2  (运行中 / 上涨 — 主绿)
--success-glow     #34D399  (激活中 — 仅用于 pulse 动效)
--ai-accent        #8B5CF6  (AI 主题色 — 改紫色,fintech 标准)
--info             #2A99FE  (中性蓝 — Signal 标签 / 链接)
--warning          #F59E0B  (橙 — 替代当前 --o)
--danger           #EF4444  (红 — 替代当前 --r 偏粉)
```

---

### G3【P0 · HIGH】字号系统散乱 · 8 档无规律,违反 `font-scale`

**当前实际散布**:`8 / 9 / 10 / 11 / 12 / 13 / 14 / 16 / 18 / 22` 共 10 档
**Material Design 推荐**:5-7 档 type scale

**修复**:收敛到 6 档 + tabular numerals:
```
--fs-xs    10px   (label / 副信息)
--fs-sm    12px   (次级标题 / 表格内容)
--fs-base  13px   (正文)
--fs-md    14px   (节标题)
--fs-lg    16px   (一级标题 / KPI 标签)
--fs-xl    22px   (KPI 大数字)
```

---

### G4【P1 · MEDIUM】Touch target 普遍偏小 · 违反 `touch-target-size`

| 元素 | 当前尺寸 | 标准 | 风险 |
|------|---------|------|------|
| AI 工作台卡片 hover 动作 chip | ~22px 高 | ≥44px | 误点 |
| 时间线事件卡 ticker pill | ~16px 高 | ≥24px(可接受 24 因 web 鼠标) | 难点 |
| chat 反馈 icon ⧉ 👍 👎 ↻ | ~14px | ≥24px | 难点 |
| 选股器表格单选 checkbox | ~14px | ≥18px | 难点 |
| 详情列右上 X 关闭 | 24px | ≥28px(web) | 边缘 |

---

### G5【P1 · MEDIUM】缺失键盘可达性 + ARIA 标签 · 违反 `aria-labels` `keyboard-nav`

- 所有 icon-only 按钮没有 `aria-label`(X 关闭 / 反馈图标 / 提醒铃铛 / 关注 ♥ 等)
- 主区焦点环移除(没有 `:focus-visible` 样式)
- `tabindex` 完全没有规划,Tab 键导航顺序混乱
- 表格无 `scope="col"` / `aria-sort`

---

## 页面 1 · 首页(home)

| 优先 | 问题 | 规则 | 修复方向 |
|------|------|------|---------|
| **P0** | "进行中的任务"区 6 类来源混在一个 grid,无视觉分组 | `whitespace-balance` | 拆 3 行(需关注 / 进行中 / 已激活),用 `.aw-sec` 分隔 |
| **P0** | 与你相关字段是裸数据"持有 18%",没有判断 | `progressive-disclosure` | 加结论性 chip("集中度偏高 ⚠") |
| **P1** | 快速入口 6 张 widget 等大 | `visual-hierarchy` | 总资产 / P&L 1.5x,其他 1x |
| **P1** | Widget 卡片标题前 emoji 图标(💰 ⭐ 📊) | `no-emoji-icons` | 换 SVG |
| **P1** | 时间线事件卡:Signal 富卡片 vs 普通事件卡 视觉权重不平衡 | `elevation-consistent` | Signal 卡 elevation 1,普通事件 elevation 0(无背景) |
| **P2** | 标题 16px Semibold 已统一 ✓,但区块间距不一致(margin-bottom 6/8/10/14/16/18 散乱) | `spacing-scale` | 统一 8pt 系统:8/16/24/32 |
| **P2** | 持仓总览(顶栏指数条)信息密度高但无 hover 详情 | `tooltip-on-interact` | 加 tooltip 显示历史变化 |

---

## 页面 2 · 普通标的详情(openDetail)

| 优先 | 问题 | 规则 | 修复方向 |
|------|------|------|---------|
| **P0** | 走势图 canvas **绝对位置**(not aspect-ratio),触发 CLS | `image-dimension` `content-jumping` | 用 `aspect-ratio:16/9` 占位 |
| **P0** | 5 档盘口梯子用纯文字 / 数字,小字 9-10px,违反 `readable-font-size` | `readable-font-size` | 升到 11-12px,加 column header |
| **P1** | "交易"按钮在 sticky footer,但**没有二次确认**就触发 buildTradePlan | `confirmation-dialogs` | 加 confirm modal |
| **P1** | 资金流向 SVG donut 没有 legend / tooltip | `legend-visible` `tooltip-on-interact` | 加内嵌 legend + hover tooltip |
| **P1** | 涨跌色用 #FF3A75(粉)而非标准 #EF4444(红),fintech 类用户期望红色 = 跌 | `color-palette-from-product` | 替换 --r |
| **P2** | 时间窗口 chip(1D 5D 1M ...)只有 on/off 视觉,没有 hover / focus 状态 | `state-clarity` `focus-states` | 加完整 4 态 |
| **P2** | 做空数据 7 行表格无 `<th>` `scope`,屏幕阅读器读出错 | `data-table` | 加语义化结构 |

---

## 页面 3 · Signal 详情(openSignalDetail)

| 优先 | 问题 | 规则 | 修复方向 |
|------|------|------|---------|
| **P0** | Hero 图引用 `assets/signal-hero-{verdict}.jpg` 但**资源不存在**,demo 时空白 | `image-optimization` | 加 3 张占位图 OR 改用 SVG 渐变图 |
| **P0** | 底部 3 CTA(Analyze/Draft/...)虽然是 sticky,但**字色对比 < 4.5:1**(青绿底白字测试 ~3.8:1) | `color-accessible-pairs` | 加深底色或加描边 |
| **P0** | "Strategy fit 87/100" 大字 42px,但**周围 KV 文字才 9-10px**,层级落差过大 | `font-scale` `weight-hierarchy` | KV 提到 12px |
| **P1** | Quick takeaways / Analysis process 是折叠节,**展开/收起没有 0.25s 动效**(瞬间切换) | `state-transition` `duration-timing` | 加 max-height transition |
| **P1** | Hero 区 verdict chip(Bullish/Bearish/Neutral)三种用渐变背景,但**视觉上太"营销"**,违反 fintech 严肃感 | `style-match` | 改成扁平色块 + icon |
| **P2** | Related catalysts 横向卡片 overflow-x scroll,但**没有滚动指示器** | `swipe-clarity` | 加渐变 mask 提示可滚 |
| **P2** | dpHistory 返回栈在视觉上只有 ← 小箭头,没有路径感 | `back-behavior` | 加 breadcrumb |

---

## 页面 4 · 标的研究(dyn-research,12 模块)

| 优先 | 问题 | 规则 | 修复方向 |
|------|------|------|---------|
| **P0** | Quant Ratings 5 因子卡片字母评级 **A+/A/B+/C-/D 同等大小+饱和**,无视觉重点 | `visual-hierarchy` | A 强调(28px+ 高饱和),C-D 弱化(18px 灰底) |
| **P0** | 12 模块**全部一次渲染**,无懒加载 / 折叠,首屏滚动负担重 | `progressive-disclosure` `lazy-loading` | 5+模块默认折叠,展开看 |
| **P0** | 同行业对比表中 "NVDA SELF" 行高亮**只用浅青背景**,色彩对比 < 3:1,色盲用户看不出 | `color-not-only` | 加左侧 ▶ 三角 + 加粗 |
| **P1** | 季度营收 bars **没有 Y 轴**,值靠右侧文字标签 | `axis-labels` | 加 Y 轴 mini ticks(0/25/50B) |
| **P1** | 分析师评级分布(Strong Buy 42 / Buy 14 / ...)用横向 stacked,但**没有总数标注**(42+14+5+1=62) | `direct-labeling` | 标在右侧 "62 家覆盖" |
| **P1** | "AI 综合分析 hero" 用径向光晕 + 渐变文字,**违反 fintech severity**;且 `--ai #00F0C4` 与 `--g` 只差 8 色相 | `style-match` `color-semantic` | hero 改实色 + 实线边框,色用 `#8B5CF6` 紫(标准 fintech AI 色) |
| **P2** | 估值历史 5Y 区间(P/E 高/低/中位/当前/分位)只有数字,**没有可视化** | `chart-type` | 加水平条形图带"当前"指针 |
| **P2** | 业绩预期模块和估值历史模块**视觉极相似**(都是 cmp-row 6 行),用户难以区分 | `visual-hierarchy` | 业绩预期加 calendar icon + 副标题 |

---

## 页面 5 · 智能选股器(dyn-screener)

| 优先 | 问题 | 规则 | 修复方向 |
|------|------|------|---------|
| **P0** | 默认状态 351 / 134,453 都用同样格式化,**用户分不清是"全量样本"还是"已筛选"** | `state-clarity` | 全量 134,453 时副标:"全市场",已筛 351 时副标:"应用 4 个条件" |
| **P0** | "保存"按钮在主区右上 + chat 内 ✦ 双入口,但**点其中一个另一个不更新视觉**(已修但需复查) | `state-preservation` | ✓ 已修(saveScreenerFromChat 联动) |
| **P0** | 表格 20 行**没有斑马纹 / 行 hover 突出**,密集表中用户难以追踪行 | `data-density` | 加 `tr:nth-child(even){bg}` |
| **P1** | 4 个筛选条件下拉 placeholder 用虚线边框,但 ▾ 箭头不动效 | `gesture-feedback` | 加 hover 时 ▾ 旋转 / 上升 |
| **P1** | 8 个分类 cats 横向排,**768px 以下会换行,但换行后 baseline 错位** | `horizontal-scroll` `breakpoint-consistency` | 改 flex-wrap + gap |
| **P1** | Agent 动效卡 ✦ 旋转 + 双层 ripple + pulse**同时 4 个动效**,违反 `excessive-motion` | `excessive-motion` | 砍到最多 2 个(保留 pulse + ripple,删旋转) |
| **P2** | 分页 "1 2 3 4 5 ··· 18" 中间 dots 不可点,但**鼠标移上去也是 cursor:pointer** | `cursor-pointer` | dots 改 cursor:default |
| **P2** | 表格 sortable 头部有 ↕ ↑ ↓ 箭头但**点击无反应**(假交互) | `sortable-table` | 至少加 toggle 状态 |

---

## 跨页面共性问题汇总(优先级排序)

### P0(不修等于不能上线,共 14 项)

| # | 问题 | 影响范围 |
|---|------|---------|
| 1 | Emoji 当 icon 系统性使用 | 全部 |
| 2 | 配色 5 青绿无法分辨语义 | 全部 |
| 3 | 字号 8 档无系统 | 全部 |
| 4 | "进行中任务"6 类源无视觉分组 | 首页 |
| 5 | 与你相关字段无判断 | 首页 |
| 6 | 走势图 canvas CLS | 标的详情 |
| 7 | 5 档盘口字号 9-10px | 标的详情 |
| 8 | 交易按钮无二次确认(包含 Move forward 路径) | 标的详情 / Signal / Trade Plan |
| 9 | Hero 图资源缺失 | Signal 详情 |
| 10 | CTA 字色对比不达标 | Signal 详情 |
| 11 | Quant Ratings A+/D 同尺寸 | dyn-research |
| 12 | 12 模块全量渲染无懒加载 | dyn-research |
| 13 | 默认 vs 已筛选状态语义不清 | dyn-screener |
| 14 | 选股器表格无斑马纹 | dyn-screener |

### P1(影响演示完整度,共 17 项)

略,见各页表格

### P2(锦上添花,共 14 项)

略,见各页表格

---

## 一份"打包修复"建议(0.5–2 天工作量)

### 阶段 A:配色 + 字号系统收敛(0.5 天)
- 一次性改 `:root` 变量,定义 `--success-strong / --success-glow / --ai-accent / --info / --warning / --danger`
- 6 档 type scale `--fs-xs/sm/base/md/lg/xl`
- 全局 grep 替换硬编码的 `#00B8B8 / #00F0C4 / #34D399` 等
- 替换 `--ai` 从青绿到紫(`#8B5CF6`)
- 替换 `--r` 从粉红到红(`#EF4444`)

### 阶段 B:icon 系统化(1 天,含设计师选 icon)
- 引入 Lucide CSS / SVG Sprite
- 全代码 emoji → SVG 替换,**约 50+ 处**
- 国旗用 SVG flag 库

### 阶段 C:首页 + Signal 详情 P0 修复(0.3 天)
- 首页"进行中任务"分 3 行(需关注 / 进行中 / 已激活)
- 与你相关行加结论性 chip
- Signal 三 CTA 字色对比修
- Hero 占位图

### 阶段 D:dyn-research 大修(0.4 天)
- Quant Ratings 字母评级层级化(A 大字 / D 小字弱化)
- 12 模块拆 3 折叠组(核心 / 财务 / 估值)
- 同行表 SELF 行加左 ▶ 三角

### 阶段 E:dyn-screener 修复(0.2 天)
- 默认 vs 已筛选副标差异化
- 表格斑马纹

### 阶段 F:无障碍 + Touch target(0.5 天)
- 所有 icon-only 按钮加 aria-label
- 焦点环 :focus-visible 全局
- Touch target 扩大(至少 32×32 web)
- 表格加语义化结构

**累计约 2.9 个工作日**,做完后**预期上线就绪度从 65% → 88%**(基于之前批判性评估的基线)。

---

## 一句话结论

**当前原型在 Pattern(Real-Time Operations Dashboard)层面对了,但在 Style 层面不够 fintech-serious(过多 emoji + 过多青绿 + AI 主题色用错了色相),在 Accessibility 层面还差一截**。修完上述 P0 14 项,产品观感会从"prototype 能讲故事"升到"MVP 能交付"。

---

## 下一步建议(三选一)

1. **直接动手改阶段 A(配色 + 字号)** —— 影响最大、范围最广、约 0.5 天,可在本会话完成
2. **先动 icon 系统(阶段 B)** —— 视觉提升最直接,但需要设计师配合选 icon 库
3. **按页面顺序逐个改(C → D → E)** —— 每改一页就有看得见的进步

我推荐先做 **阶段 A**,因为配色 + 字号是基础,后面所有修复都基于它。
