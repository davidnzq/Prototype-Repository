/* ============================================================
   dynamic.js — 5 类动态视图(风险审视/对比决策/策略构建/标的研究/归因诊断)
                + 进入/退出 + 风险仪表盘
   v18: renderDynResearch 的画布渐变色与 v18 设计色(#00ADA2)对齐
   依赖: data.js (S, holdings, ddb)
   依赖: home.js、detail.js(inline onclick 会用到)
   ============================================================ */

/* 进入动态视图 */
/* 6 类动态视图的 chat 上下文标签映射 */
const DYN_VIEW_TAGS = {
  'dyn-risk':'风险审视',
  'dyn-compare':'对比决策',
  'dyn-tradeplan':'策略构建',
  'dyn-research':'标的研究',
  'dyn-attribution':'归因诊断',
  'dyn-screener':'智能选股'
};

function enterDynamic(viewId, intent) {
  dynamic = true;
  document.querySelectorAll('.vw').forEach(el => el.classList.remove('on'));
  document.getElementById('v-' + viewId).classList.add('on');
  document.getElementById('dynHeader').classList.remove('hide');
  document.getElementById('dynTitle').textContent = intent;
  document.getElementById('dynSub').textContent = '实时跟随输入重组 · 清空输入框可退出';
  renderDynamicView(viewId);
  document.getElementById('mc').scrollTop = 0;
  document.getElementById('in').classList.add('compact');
  // chat 上下文标签同步动态视图
  const tag = document.getElementById('chtag');
  if (tag && !tag.classList.contains('live')) {
    tag.textContent = DYN_VIEW_TAGS[viewId] || '动态视图';
  }
}

/* 分发到具体渲染函数 */
function renderDynamicView(viewId) {
  if (viewId === 'dyn-risk') renderDynRisk();
  else if (viewId === 'dyn-compare') renderDynCompare();
  else if (viewId === 'dyn-tradeplan') renderDynTradePlan();
  else if (viewId === 'dyn-research') renderDynResearch();
  else if (viewId === 'dyn-attribution') renderDynAttribution();
  else if (viewId === 'dyn-screener') renderDynScreener();
}

/* 退出动态视图 */
function exitDynamic() {
  if (!dynamic) return;
  dynamic = false;
  currentDynViewId = null;
  document.getElementById('dynHeader').classList.add('hide');
  document.querySelectorAll('.vw').forEach(el => el.classList.remove('on'));
  document.getElementById('v-' + previousView).classList.add('on');
  document.getElementById('chtag').classList.remove('live');
  document.getElementById('chtag').textContent = {home:'首页',watchlist:'自选',portfolio:'资产',news:'资讯'}[previousView] || '首页';
  cv = previousView;
  document.querySelectorAll('.ni').forEach(b => b.classList.toggle('on', b.dataset.v === cv));
  document.getElementById('giBox').classList.remove('live-morph');
  document.getElementById('hintTip').classList.remove('show');
  // 关闭 Agent 模式的 dp 面板(选股 / 标的研究)
  const dp = document.getElementById('dp');
  const dpMode = dp && dp.dataset.mode;
  if (dpMode && dpMode.endsWith('-agent')) {
    dp.classList.remove('open');
    document.body.classList.remove('dp-open');
    delete dp.dataset.mode;
    document.getElementById('dpInner').innerHTML = '';
  }
  const dpOpen = dp.classList.contains('open');
  if (!dpOpen) document.getElementById('in').classList.remove('compact');
}

/* 风险仪表盘 SVG */
function riskGauge(score) {
  const r = 32, cx = 40, cy = 40, angle = Math.PI * (score / 100);
  const ex = cx - r * Math.cos(angle), ey = cy - r * Math.sin(angle);
  const color = score > 70 ? 'var(--r)' : score > 50 ? 'var(--o)' : 'var(--g)';
  return `<div class="risk-gauge"><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" fill="none" stroke="var(--sf2)" stroke-width="6"/><path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/></svg><div class="risk-gauge-text"><div class="risk-gauge-val">${score}</div><div class="risk-gauge-lbl">偏高</div></div></div>`;
}

/* ============ 风险审视 ============ */
function renderDynRisk() {
  const s = S[sc];
  const sectors = {};
  holdings.forEach(h => { sectors[h.sector] = (sectors[h.sector] || 0) + h.pct; });
  const sectorArr = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
  const colors = ['var(--r)','var(--o)','var(--b)','var(--p)','var(--g)'];
  let h = `<div class="dyn-grid risk">`;
  h += `<div class="dp-panel area-overview fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--pbg);color:var(--p)">${icon("briefcase",12)}</div><div class="dp-panel-t">持仓总览</div><span class="dp-panel-s">实时</span></div>
    <div class="kpi">
      <div><div class="kpi-l">总资产</div><div class="kpi-v">${s.pf.v}</div><div class="kpi-s ${s.pf.p?'positive':'negative'}">${s.pf.ch}</div></div>
      <div><div class="kpi-l">持仓数</div><div class="kpi-v">${holdings.length}</div><div class="kpi-s" style="color:var(--tm)">5 行业</div></div>
      <div><div class="kpi-l">今日波动</div><div class="kpi-v ${s.pf.p?'positive':'negative'}">${s.pf.pct}</div><div class="kpi-s" style="color:var(--tm)">vs SPY</div></div>
    </div>
  </div>`;
  h += `<div class="dp-panel area-risk-score fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--rbg);color:var(--r)">⚠</div><div class="dp-panel-t">风险评分</div><span class="dp-panel-s">AI 综合</span></div>
    <div class="risk-score">${riskGauge(72)}<div class="risk-factors">
      <div class="risk-factor"><span class="risk-factor-dot" style="background:var(--r)"></span><span class="risk-factor-l">集中度</span><span class="risk-factor-v">高</span></div>
      <div class="risk-factor"><span class="risk-factor-dot" style="background:var(--o)"></span><span class="risk-factor-l">Beta</span><span class="risk-factor-v">1.42</span></div>
      <div class="risk-factor"><span class="risk-factor-dot" style="background:var(--o)"></span><span class="risk-factor-l">相关性</span><span class="risk-factor-v">0.72</span></div>
      <div class="risk-factor"><span class="risk-factor-dot" style="background:var(--g)"></span><span class="risk-factor-l">流动性</span><span class="risk-factor-v">充足</span></div>
    </div></div>
  </div>`;
  h += `<div class="dp-panel area-allocation fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">${icon("chart-bar",12)}</div><div class="dp-panel-t">行业分布</div></div><div class="bar-list">`;
  sectorArr.forEach(([k, v], i) => h += `<div class="bar-row"><span class="bar-tk" style="width:60px">${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v}%;background:${colors[i%colors.length]}"></div></div><span class="bar-pct">${v.toFixed(1)}%</span></div>`);
  h += `</div></div>`;
  h += `<div class="dp-panel area-concentration fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("zap",12)}</div><div class="dp-panel-t">集中度 · Top 5</div><span class="dp-panel-s">点击查看详情</span></div><div class="bar-list">`;
  holdings.slice().sort((a, b) => b.pct - a.pct).slice(0, 5).forEach(h2 => {
    const color = h2.pct > 15 ? 'var(--r)' : h2.pct > 12 ? 'var(--o)' : 'var(--g)';
    h += `<div class="bar-row"><span class="bar-tk" onclick="openDetail('${h2.tk}','')">${h2.tk}</span><div class="bar-track"><div class="bar-fill" style="width:${h2.pct*4}%;background:${color}"></div></div><span class="bar-pct">${h2.pct.toFixed(1)}%</span></div>`;
  });
  h += `</div></div>`;
  h += `<div class="dp-panel area-holdings fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("clipboard",12)}</div><div class="dp-panel-t">持仓明细</div><span class="dp-panel-s">${holdings.length} 支 · 点击行查看详情</span></div>
    <table class="tbl-dense"><thead><tr><th scope="col">标的</th><th scope="col">行业</th><th scope="col">权重</th><th scope="col">Beta</th><th scope="col">持仓</th><th scope="col">成本</th><th scope="col">现价</th><th scope="col">盈亏</th><th scope="col">风险</th></tr></thead><tbody>`;
  holdings.slice().sort((a, b) => b.pct - a.pct).forEach(h2 => {
    const pnl = ((h2.price - h2.cost) * h2.shares).toFixed(0);
    const pnlP = pnl >= 0;
    const rMap = {r:'高',o:'中',g:'低'};
    h += `<tr onclick="openDetail('${h2.tk}','')"><td class="tk">${h2.tk}</td><td style="color:var(--ts)">${h2.sector}</td><td class="mn">${h2.pct.toFixed(1)}%</td><td class="mn">${h2.beta}</td><td class="mn">${h2.shares}</td><td class="mn">$${h2.cost.toFixed(2)}</td><td class="mn">$${h2.price.toFixed(2)}</td><td class="mn ${pnlP?'positive':'negative'}">${pnlP?'+':''}$${pnl}</td><td><span class="pill ${h2.risk}">${rMap[h2.risk]}</span></td></tr>`;
  });
  h += `</tbody></table></div>`;
  h += `<div class="dp-panel area-orders fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--cbg);color:var(--c)">${icon("list",12)}</div><div class="dp-panel-t">相关订单</div></div>
    <div class="inline-list">
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">TSLA 限价买单 $235 · 20 股</div><div class="inline-item-s">未成交 · 如成交将 +4% 消费仓位</div></div></div>
      ${sc==='down'?`<div class="inline-item warn"><div class="inline-item-b"><div class="inline-item-t">AAPL 止损单未创建</div><div class="inline-item-s">预警线已触及</div></div></div>`:''}
    </div>
  </div>`;
  h += `<div class="dp-panel area-strategies fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">${icon("brain",12)}</div><div class="dp-panel-t">相关策略</div></div>
    <div class="inline-list">
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">AAPL 止损监控</div><div class="inline-item-s">预警线 $195,当前 $198.32</div></div></div>
      ${sc==='active'?`<div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">NVDA 看涨期权评估</div><div class="inline-item-s">AI 评估中 · 68%</div></div></div>`:''}
      ${sc==='down'?`<div class="inline-item" style="border-left-color:var(--tm);opacity:.7"><div class="inline-item-b"><div class="inline-item-t">NVDA 看涨期权(暂停)</div><div class="inline-item-s">系统性下跌触发</div></div></div>`:''}
    </div>
  </div>`;
  h += `</div>`;
  h += `<div style="padding:0 18px 14px"><div class="dp-panel fi fi-d4" style="margin-bottom:10px"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 总结</div></div>
    <div class="ai-para"><strong>核心风险:科技股集中度过高。</strong>AI 芯片链合计 <strong>38%</strong>。</div>
    <div class="ai-bul"><span class="ai-bul-d">●</span><span><strong>NVDA 18%</strong>· 最大单一持仓</span></div>
    <div class="ai-bul"><span class="ai-bul-d">●</span><span><strong>AAPL 14%</strong>${sc==='down'?'· 已跌破 $200 预警线':'· 下周四财报'}</span></div>
    <div class="ai-bul"><span class="ai-bul-d">●</span><span><strong>Beta 1.42</strong>· 高于 SPY 42%</span></div>
  </div>
  <div class="action-bar">
    <button class="action-btn primary" onclick="tryIntent('生成再平衡方案')">生成再平衡方案</button>
    <button class="action-btn" onclick="tryIntent('对比 NVDA 和 AMD')">对比 NVDA/AMD</button>
    ${sc==='down'?`<button class="action-btn primary">立即建 AAPL 止损单</button>`:''}
    <button class="action-btn">导出报告</button>
  </div></div>`;
  document.getElementById('v-dyn-risk').innerHTML = h;
  // 在右侧 #dp 面板打开「复盘分析 Agent」(live input 即触发)
  if (typeof openReplayAgentPanel === 'function') openReplayAgentPanel();
}

/* 在 .dp 详情列里展示「复盘分析 Agent」动效卡
   位置同其他 agent,色系 = rose/pink (第 4 个差异化 agent) */
function openReplayAgentPanel() {
  const dp = document.getElementById('dp');
  if (!dp) return;
  const inner = document.getElementById('dpInner');
  const footer = document.getElementById('dpFooter');
  inner.innerHTML = `
    <div class="rp-agent-wrap">
      <div class="rp-agent-bg"></div>
      <div class="rp-agent-icon-stage">
        <span class="rp-agent-arc rp-agent-arc-1"></span>
        <span class="rp-agent-arc rp-agent-arc-2"></span>
        <span class="rp-agent-arc rp-agent-arc-3"></span>
        <div class="rp-agent-icon">${icon('rotate-cw', 28)}</div>
      </div>
      <div class="rp-agent-h">复盘分析 Agent</div>
      <div class="rp-agent-st">正在复盘当前持仓的风险敞口与历史决策</div>
      <div class="rp-agent-d">行业分布、集中度、Beta、相关性已加载至左侧主区,完整复盘推理在右侧 chat 流式输出</div>
      <div class="rp-agent-steps">
        <div class="rp-agent-step done">
          <div class="rp-agent-step-n">①</div>
          <div class="rp-agent-step-body"><div class="rp-agent-step-t">提取历史决策</div><div class="rp-agent-step-s">已识别:近 30 日变更 / 加仓 / 止损</div></div>
        </div>
        <div class="rp-agent-step done">
          <div class="rp-agent-step-n">②</div>
          <div class="rp-agent-step-body"><div class="rp-agent-step-t">量化风险敞口</div><div class="rp-agent-step-s">集中度 / Beta / 相关性 / 流动性</div></div>
        </div>
        <div class="rp-agent-step active">
          <div class="rp-agent-step-n">③</div>
          <div class="rp-agent-step-body"><div class="rp-agent-step-t">推演改进建议</div><div class="rp-agent-step-s">减仓 / 对冲 / 再平衡方案推理中</div></div>
        </div>
      </div>
      <div class="rp-agent-hint">→ 完整复盘推理正在右侧 chat 输出</div>
    </div>
  `;
  if (footer) footer.innerHTML = '';
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  document.getElementById('dpBack')?.classList.remove('show');
  dp.dataset.mode = 'replay-agent';
}

/* ============ 对比决策 ============ */
function renderDynCompare() {
  let h = `<div class="dyn-grid compare">`;
  h += `<div class="dp-panel area-a fi fi-d1"><div class="cmp-title" onclick="openDetail('NVDA','')">NVDA<span class="cmp-chg positive">+3.08%</span></div>
    <div class="cmp-row"><span class="cmp-l">现价</span><span class="cmp-v">$142.68</span></div>
    <div class="cmp-row"><span class="cmp-l">市值</span><span class="cmp-v">$3.51T</span></div>
    <div class="cmp-row"><span class="cmp-l">P/E</span><span class="cmp-v">68.2</span></div>
    <div class="cmp-row"><span class="cmp-l">营收增速</span><span class="cmp-v positive">+94%</span></div>
    <div class="cmp-row"><span class="cmp-l">毛利率</span><span class="cmp-v">76%</span></div>
    <div class="cmp-row"><span class="cmp-l">你持有</span><span class="cmp-v positive">18%</span></div>
  </div>`;
  h += `<div class="dp-panel area-b fi fi-d1"><div class="cmp-title" onclick="openDetail('AMD','')">AMD<span class="cmp-chg positive">+2.91%</span></div>
    <div class="cmp-row"><span class="cmp-l">现价</span><span class="cmp-v">$167.44</span></div>
    <div class="cmp-row"><span class="cmp-l">市值</span><span class="cmp-v">$271B</span></div>
    <div class="cmp-row"><span class="cmp-l">P/E</span><span class="cmp-v">42.6</span></div>
    <div class="cmp-row"><span class="cmp-l">营收增速</span><span class="cmp-v positive">+18%</span></div>
    <div class="cmp-row"><span class="cmp-l">毛利率</span><span class="cmp-v">52%</span></div>
    <div class="cmp-row"><span class="cmp-l">你持有</span><span class="cmp-v" style="color:var(--tm)">自选</span></div>
  </div>`;
  // Factor Grades 对比(SeekingAlpha 五因子 + 关键基础数据)
  const fgRows = [
    {k:'估值 (Value)',           a:{g:'C-',cls:'c'}, b:{g:'B', cls:'b'}, win:'r', diff:true, note:'AMD 估值更便宜'},
    {k:'成长 (Growth)',          a:{g:'A+',cls:'a'}, b:{g:'B+',cls:'b'}, win:'l', diff:true, note:'NVDA 营收增速领先 5 倍'},
    {k:'盈利 (Profitability)',   a:{g:'A+',cls:'a'}, b:{g:'B', cls:'b'}, win:'l', diff:true, note:'NVDA 毛利率 76% vs 52%'},
    {k:'动量 (Momentum)',        a:{g:'A', cls:'a'}, b:{g:'A-',cls:'a'}, win:'tie',           note:'两者都在强势区间'},
    {k:'EPS 修正',               a:{g:'B+',cls:'b'}, b:{g:'C+',cls:'c'}, win:'l', diff:true, note:'NVDA 分析师上调更多'},
    {k:'持仓占比',               a:{txt:'18%',color:'var(--o)'}, b:{txt:'未持有',color:'var(--tm)'}, win:'tie', note:'NVDA 集中度偏高'},
    {k:'Signal 评级',            a:{txt:'Bullish',color:'var(--g)'}, b:{txt:'Bullish',color:'var(--g)'}, win:'tie', note:'两者均看多'}
  ];
  let fgTbl = `<div class="dp-panel area-diff fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:rgba(139,92,246,.12);color:#8B5CF6">${icon("scale",12)}</div><div class="dp-panel-t">关键差异 · Factor Grades 对比</div><span class="dp-panel-s">参考 SeekingAlpha 五因子</span></div>
    <table class="fg-tbl"><thead><tr><th scope="col">维度</th><th scope="col">NVDA</th><th scope="col">AMD</th><th scope="col">优势方</th></tr></thead><tbody>`;
  fgRows.forEach(r => {
    const cellA = r.a.g ? `<span class="qr-grade ${r.a.cls}">${r.a.g}</span>` : `<span style="font-family:var(--m);font-size:11px;color:${r.a.color||'var(--tp)'}">${r.a.txt}</span>`;
    const cellB = r.b.g ? `<span class="qr-grade ${r.b.cls}">${r.b.g}</span>` : `<span style="font-family:var(--m);font-size:11px;color:${r.b.color||'var(--tp)'}">${r.b.txt}</span>`;
    const winChip = r.win === 'l' ? `<span class="fg-win l"><span class="fg-arrow">◀</span>NVDA</span>` :
                    r.win === 'r' ? `<span class="fg-win r">AMD<span class="fg-arrow">▶</span></span>` :
                                    `<span class="fg-win tie">平</span>`;
    fgTbl += `<tr class="${r.diff?'diff':''}"><td>${r.k}</td><td>${cellA}</td><td>${cellB}</td><td>${winChip}</td></tr>`;
  });
  fgTbl += `</tbody></table>
    <div class="fg-summary">
      <span class="fg-summary-chip win-l"><strong>NVDA 领先</strong>成长 / 盈利 / EPS 修正</span>
      <span class="fg-summary-chip win-r"><strong>AMD 占优</strong>估值更便宜</span>
      <span class="fg-summary-chip"><strong>差距收窄</strong>动量两者持平</span>
    </div>
  </div>`;
  h += fgTbl;

  h += `<div class="dp-panel area-ai fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 观点 · 针对你的持仓</div></div>
    <div class="ai-para">NVDA 在数据中心 AI 芯片占绝对领导地位,五因子中 <strong>3 项 A 级</strong>(成长 / 盈利 / 动量)。AMD MI400 追平 H200 后,差距在收窄,但<strong>估值显著更便宜</strong>(P/E 42 vs 68)。</div>
    <div class="ai-para">对你(已持 NVDA <strong>18%</strong>,集中度偏高):增加 AMD 敞口可<strong>分散集中度</strong>,同时享受估值修复空间。建议配比 NVDA 12% / AMD 6%,组合 Beta 略降。</div>
  </div>`;
  h += `<div class="area-actions fi fi-d3"><div class="action-bar"><button class="action-btn primary">加 AMD 到自选</button><button class="action-btn" onclick="tryIntent('帮我建一个 AMD Trade Plan')">建 AMD Trade Plan</button><button class="action-btn" onclick="tryIntent('NVDA 和 AMD 的供应链有重叠吗')">查看供应链重叠</button><button class="action-btn" onclick="tryIntent('NVDA 和 AMD 各分配多少合适')">两个都买怎么分配</button></div></div>`;
  h += `</div>`;
  document.getElementById('v-dyn-compare').innerHTML = h;
}

/* ============ 策略构建(参数实时编辑) ============ */
const TP_SPOT = 142.68;        // NVDA 现价
const TP_PORTFOLIO = 48000;    // 组合规模(mock)
const TP_SIGMA = 0.45;         // 隐含波动率(mock)

function renderDynTradePlan() {
  let h = `<div class="dyn-grid tradeplan">`;
  // ─── 左列:策略参数(可编辑) ───
  h += `<div class="dp-panel area-plan fi fi-d1">
    <div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("clipboard",12)}</div><div class="dp-panel-t">NVDA 策略草案</div><span class="dp-panel-s">现价 $${TP_SPOT}</span></div>

    <div class="tp-field">
      <label class="tp-label">策略类型</label>
      <div class="tp-radio-group">
        <label class="tp-radio"><input type="radio" name="tp-strategy" value="Long Call" checked onchange="tpRecalc()"><span>Long Call</span></label>
        <label class="tp-radio"><input type="radio" name="tp-strategy" value="Long Put" onchange="tpRecalc()"><span>Long Put</span></label>
        <label class="tp-radio"><input type="radio" name="tp-strategy" value="Bull Call Spread" onchange="tpRecalc()"><span>Bull Call Spread</span></label>
        <label class="tp-radio"><input type="radio" name="tp-strategy" value="Covered Call" onchange="tpRecalc()"><span>Covered Call</span></label>
      </div>
    </div>

    <div class="tp-row">
      <div class="tp-field">
        <label class="tp-label">行权价</label>
        <div class="tp-num-wrap"><span class="tp-num-pre">$</span><input type="number" id="tp-strike" value="145" step="1" min="100" max="200" oninput="tpRecalc()"></div>
      </div>
      <div class="tp-field">
        <label class="tp-label">到期</label>
        <select id="tp-exp" onchange="tpRecalc()">
          <option value="05.16" data-days="14">05.16(14 天)</option>
          <option value="05.30" data-days="28" selected>05.30(28 天)</option>
          <option value="06.13" data-days="42">06.13(42 天)</option>
          <option value="06.27" data-days="56">06.27(56 天)</option>
          <option value="07.18" data-days="77">07.18(77 天)</option>
        </select>
      </div>
    </div>

    <div class="tp-field">
      <label class="tp-label">合约数</label>
      <div class="tp-stepper">
        <button onclick="tpStep(-1)">−</button>
        <input type="number" id="tp-qty" value="1" min="1" max="20" oninput="tpRecalc()">
        <button onclick="tpStep(1)">+</button>
        <span class="tp-stepper-hint">每张 = 100 股</span>
      </div>
    </div>

    <div class="tp-hint">${icon("sliders",11)} 修改任一参数 → 右侧收益结构实时重算</div>
  </div>`;

  // ─── 右列:收益结构(只读,实时更新) ───
  h += `<div class="dp-panel area-summary fi fi-d1">
    <div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("chart-bar",12)}</div><div class="dp-panel-t">收益结构</div><span class="dp-panel-s" id="tp-strategy-tag">Long Call</span></div>
    <div class="cmp-row"><span class="cmp-l">期权金 / 净支出</span><span class="cmp-v" id="tp-prem">$850</span></div>
    <div class="cmp-row"><span class="cmp-l">盈亏平衡</span><span class="cmp-v" id="tp-be">$153.50</span></div>
    <div class="cmp-row"><span class="cmp-l">最大亏损</span><span class="cmp-v negative" id="tp-ml">-$850</span></div>
    <div class="cmp-row"><span class="cmp-l">占组合</span><span class="cmp-v" id="tp-pct">1.8%</span></div>
    <div class="cmp-row"><span class="cmp-l">+10% 涨预期收益</span><span class="cmp-v positive" id="tp-pl10">+$725</span></div>
    <div class="cmp-row"><span class="cmp-l">IRR(到期假设)</span><span class="cmp-v positive" id="tp-irr">85%</span></div>
    <div class="tp-bar-wrap">
      <div class="tp-bar-l">价格区间盈亏倾向</div>
      <div class="tp-bar-track"><div class="tp-bar-fill" style="width:65%"></div><div class="tp-bar-marker" style="left:50%"></div></div>
      <div class="tp-bar-axis"><span>NVDA -10%</span><span>当前 $${TP_SPOT}</span><span>+10%</span></div>
    </div>
  </div>`;

  // ─── 通栏:PortAI 推理 + Strategy fit / Execution rules / Risk warning ───
  h += `<div class="dp-panel area-reasoning fi fi-d2">
    <div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">PortAI 推理 + 执行规则</div></div>
    <div class="ai-para">NVDA 突破 30 日高点,<strong>技术面确认向上</strong>。结合 TSM 扩产和美联储偏鸽,30 天内上探 $150-155 概率偏高。建议用<strong>期权而非加仓现货</strong>——你已持有 NVDA 18%,加仓会推高集中度到 22%+。</div>
    <div class="tp-rules">
      <div class="tp-rules-col">
        <div class="tp-rules-h">✓ Strategy fit · 87/100</div>
        <div class="tp-rules-d">符合<strong>趋势跟随</strong>策略,五因子综合评级 87 分。技术面 RSI 68 偏热,但 MACD 仍向上,适合短期方向性押注。</div>
      </div>
      <div class="tp-rules-col">
        <div class="tp-rules-h">⚙ Execution rules</div>
        <div class="tp-rules-d">建议<strong>限价单</strong>挂在 mid - $0.10。盘中 09:45 后流动性最佳,避免开盘前 15 分钟下单。Delta ≈ 0.45,Gamma 加速点 $148。</div>
      </div>
      <div class="tp-rules-col">
        <div class="tp-rules-h">⚠ Risk warning</div>
        <div class="tp-rules-d">期权<strong>时间价值衰减</strong>较快,临近到期前 7 天 Theta 会加速。若 NVDA 下次财报 8/27 隐含波动 ±8.4%,需关注 Vega 风险。</div>
      </div>
    </div>
  </div>`;

  // ─── 底部按钮 ───
  h += `<div class="area-actions fi fi-d3">
    <div class="action-bar">
      <button class="action-btn primary" onclick="moveForwardTradePlan('NVDA')">下单这个 Plan</button>
      <button class="action-btn" onclick="document.getElementById('tp-strike').focus()">调整参数</button>
      <button class="action-btn" onclick="tryIntent('把当前 Trade Plan 另存为策略')">另存为策略</button>
      <button class="action-btn" onclick="tryIntent('查看 NVDA Long Call 历史回测')">查看历史回测</button>
    </div>
  </div>`;

  h += `</div>`;
  document.getElementById('v-dyn-tradeplan').innerHTML = h;
  setTimeout(tpRecalc, 50);
}

/* +/- 按钮调整合约数 */
function tpStep(delta) {
  const inp = document.getElementById('tp-qty');
  if (!inp) return;
  let v = (parseInt(inp.value) || 1) + delta;
  if (v < 1) v = 1;
  if (v > 20) v = 20;
  inp.value = v;
  tpRecalc();
}

/* 实时重算右列收益结构(简化期权定价模型,mock) */
function tpRecalc() {
  const strategyEl = document.querySelector('input[name="tp-strategy"]:checked');
  if (!strategyEl) return;
  const strategy = strategyEl.value;
  const strikeEl = document.getElementById('tp-strike');
  const expEl = document.getElementById('tp-exp');
  const qtyEl = document.getElementById('tp-qty');
  if (!strikeEl || !expEl || !qtyEl) return;

  const strike = parseFloat(strikeEl.value) || 145;
  const days = parseInt(expEl.options[expEl.selectedIndex].dataset.days) || 28;
  const qty = parseInt(qtyEl.value) || 1;
  const T = days / 365;
  const timeValue = TP_SPOT * TP_SIGMA * Math.sqrt(T) * 0.4;

  let premPerShare, breakeven, expReturn10pct, maxLossPerShare, irrLabel;

  if (strategy === 'Long Call') {
    const intrinsic = Math.max(TP_SPOT - strike, 0);
    premPerShare = intrinsic + timeValue;
    breakeven = strike + premPerShare;
    expReturn10pct = Math.max(TP_SPOT * 1.1 - strike, 0) - premPerShare;
    maxLossPerShare = -premPerShare;
  } else if (strategy === 'Long Put') {
    const intrinsic = Math.max(strike - TP_SPOT, 0);
    premPerShare = intrinsic + timeValue;
    breakeven = strike - premPerShare;
    expReturn10pct = Math.max(strike - TP_SPOT * 0.9, 0) - premPerShare;
    maxLossPerShare = -premPerShare;
  } else if (strategy === 'Bull Call Spread') {
    premPerShare = timeValue * 0.55;
    breakeven = strike + premPerShare;
    const cap = 5;
    expReturn10pct = Math.min(Math.max(TP_SPOT * 1.1 - strike, 0), cap) - premPerShare;
    maxLossPerShare = -premPerShare;
  } else { // Covered Call
    premPerShare = -timeValue * 0.7;
    breakeven = TP_SPOT + premPerShare;
    expReturn10pct = Math.min(TP_SPOT * 1.1 - TP_SPOT, Math.max(strike - TP_SPOT, 0)) + (-premPerShare);
    maxLossPerShare = -TP_SPOT * 0.5;
  }

  const premTotal = premPerShare * 100 * qty;
  const maxLoss = maxLossPerShare * 100 * qty;
  const pctPortfolio = (Math.abs(premTotal) / TP_PORTFOLIO) * 100;
  const pl10 = expReturn10pct * 100 * qty;
  const irr = Math.abs(premTotal) > 1 ? (pl10 / Math.abs(premTotal)) * 100 : 0;

  // 写入 + 闪烁
  const flash = (id, txt, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== txt) {
      el.textContent = txt;
      if (cls !== undefined) el.className = cls;
      el.classList.add('tp-flash');
      setTimeout(() => el.classList.remove('tp-flash'), 400);
    }
  };

  flash('tp-strategy-tag', strategy);
  const premSign = premTotal >= 0 ? '$' : '+$'; // Covered Call 收 premium → 显示 +$
  flash('tp-prem', premSign + Math.abs(premTotal).toFixed(0));
  flash('tp-be', '$' + breakeven.toFixed(2));
  flash('tp-ml', '-$' + Math.abs(maxLoss).toFixed(0), 'cmp-v negative');
  flash('tp-pct', pctPortfolio.toFixed(1) + '%');
  flash('tp-pl10', (pl10 >= 0 ? '+$' : '-$') + Math.abs(pl10).toFixed(0), 'cmp-v ' + (pl10 >= 0 ? 'positive' : 'negative'));
  flash('tp-irr', (irr >= 0 ? '+' : '') + irr.toFixed(0) + '%', 'cmp-v ' + (irr >= 0 ? 'positive' : 'negative'));

  // 更新 bar(IRR 越高,绿色填充越满)
  const fillPct = Math.max(5, Math.min(95, 50 + irr * 0.25));
  const barFill = document.querySelector('.tp-bar-fill');
  if (barFill) barFill.style.width = fillPct + '%';
}

/* ============ 标的研究 ============ */
function renderDynResearch() {
  const tk = 'NVDA', d = ddb[tk];
  const det = (typeof nvdaDetail !== 'undefined') ? nvdaDetail : null;
  const held = holdings.find(h2 => h2.tk === tk);

  // Quant 5 因子(下移到 §8)
  const quant = [
    {k:'估值',  g:'C-', cls:'c', score:32, vs:'高于行业',  meta:'P/E 68x · 行业 24x'},
    {k:'成长',  g:'A+', cls:'a', score:96, vs:'顶尖',     meta:'营收 +94% YoY'},
    {k:'盈利',  g:'A+', cls:'a', score:94, vs:'顶尖',     meta:'毛利率 76% · ROE 91%'},
    {k:'动量',  g:'A',  cls:'a', score:88, vs:'优于行业', meta:'1M +12% · 3M +28%'},
    {k:'EPS 修正',g:'B+',cls:'b', score:74, vs:'轻度上调', meta:'近 90 天 28 上 6 下'}
  ];
  const fbVal = [
    {k:'P/E (TTM)',  v:'68.4x',  vs:'行业 24.1x', g:'C-', cls:'c'},
    {k:'P/S (TTM)',  v:'21.8x',  vs:'行业 6.2x',  g:'D+', cls:'d'},
    {k:'PEG',        v:'1.8',    vs:'行业 1.4',   g:'C',  cls:'c'},
    {k:'EV/EBITDA',  v:'42.6x',  vs:'行业 18.3x', g:'C-', cls:'c'},
    {k:'P/B',        v:'52.4x',  vs:'行业 5.7x',  g:'D',  cls:'d'}
  ];
  const earnings = [
    {q:'Q1 24', rev:22.1, eps:0.61, yoy:'+265%'},
    {q:'Q2 24', rev:26.0, eps:0.68, yoy:'+262%'},
    {q:'Q3 24', rev:30.0, eps:0.81, yoy:'+206%'},
    {q:'Q4 24', rev:35.1, eps:0.89, yoy:'+126%'},
    {q:'Q1 25', rev:39.3, eps:0.96, yoy:'+78%'},
    {q:'Q2 25E',rev:43.5, eps:1.05, yoy:'+67%', est:true}
  ];
  const maxRev = 50;
  const analyst = [
    {l:'Strong Buy', c:42, color:'#00ADA2'},
    {l:'Buy',        c:14, color:'#34D399'},
    {l:'Hold',       c:5,  color:'#FBBF24'},
    {l:'Sell',       c:1,  color:'#FB7185'},
    {l:'Strong Sell',c:0,  color:'#EF4444'}
  ];
  const totalAn = analyst.reduce((a,b)=>a+b.c,0);
  const peers = [
    {tk:'NVDA', pe:68.4, ps:21.8, gm:'76.2%', rev:'+94%', mc:'$3.2T', self:true},
    {tk:'AMD',  pe:42.1, ps:8.6,  gm:'53.1%', rev:'+24%', mc:'$268B'},
    {tk:'AVGO', pe:35.7, ps:18.2, gm:'74.8%', rev:'+47%', mc:'$735B'},
    {tk:'MRVL', pe:58.2, ps:12.4, gm:'62.0%', rev:'+19%', mc:'$72B'},
    {tk:'INTC', pe:'—',  ps:1.8,  gm:'40.1%', rev:'-6%',  mc:'$98B'}
  ];

  let h = `<div class="dyn-grid research">`;

  // 注:Agent 卡已迁移到右侧 #dp 面板(参考选股器,位置一致;通过 openResearchAgentPanel() 在主区渲染完成后打开)

  // ──────── 1. 行情头(全宽,KPI 6 + 走势图 160px) ────────
  const prevClose = (parseFloat(d.pr) - parseFloat(d.ch)).toFixed(2);
  h += `<div class="dp-panel rs-quote-hd fi fi-d1">
    <div class="dp-panel-hd">
      <div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("trending-up",12)}</div>
      <div class="dp-panel-t">${d.tk} · ${d.nm}</div>
      <span class="dp-panel-s ${d.p?'positive':'negative'}">${d.pct}</span>
    </div>
    <div class="rs-quote-pr-row">
      <span class="rs-quote-pr">$${d.pr}</span>
      <span class="${d.p?'positive':'negative'}" style="font-family:var(--m);font-size:13px;font-weight:600">${d.ch} (${d.pct})</span>
      <span class="rs-quote-meta">最近更新 22:55:21 美东 · 已收盘</span>
    </div>
    <div class="rs-quote-kpi">
      <div><span class="rs-quote-kpi-l">今开</span><span class="rs-quote-kpi-v">$${d.op}</span></div>
      <div><span class="rs-quote-kpi-l">最高</span><span class="rs-quote-kpi-v">$${d.hi}</span></div>
      <div><span class="rs-quote-kpi-l">最低</span><span class="rs-quote-kpi-v">$${d.lo}</span></div>
      <div><span class="rs-quote-kpi-l">昨收</span><span class="rs-quote-kpi-v">$${prevClose}</span></div>
      <div><span class="rs-quote-kpi-l">市值</span><span class="rs-quote-kpi-v">${d.cap}</span></div>
      <div><span class="rs-quote-kpi-l">P/E</span><span class="rs-quote-kpi-v">${d.pe}</span></div>
    </div>
    <div class="rs-quote-chart"><canvas id="rc1"></canvas></div>
    <div class="rs-quote-tf">
      ${['夜盘','5日','日K','周K','月K','年K','1分'].map((t,i)=>`<span class="rs-quote-tf-i ${i===0?'on':''}">${t}</span>`).join('')}
    </div>
  </div>`;

  // ──────── 2. 公司百科(含热点 chips) | 事件追踪 timeline ────────
  if (det) {
    h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd">
        <div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">${icon("building",12)}</div>
        <div class="dp-panel-t">公司百科</div>
        <span class="dp-panel-s">查看更多 ›</span>
      </div>
      <div class="rs-hot-row">
        ${det.hot.map(ht => `<div class="rs-hot-chip">${icon(ht.ic, 12)}<span class="rs-hot-t">${ht.t}</span>${ht.meta?`<span class="rs-hot-meta">${ht.meta}</span>`:''}</div>`).join('')}
      </div>
      <div class="rs-bio">
        <div class="rs-bio-hd">
          <div class="rs-bio-logo">N</div>
          <div class="rs-bio-info">
            <div class="rs-bio-name">英伟达</div>
            <div class="rs-bio-tk">${d.tk}.US</div>
          </div>
        </div>
        <div class="rs-bio-desc">${det.bio.desc}</div>
        <div class="rs-bio-meta">
          <div class="rs-bio-meta-row">
            <span class="rs-bio-meta-l">${det.bio.sector}</span>
            <span class="rs-bio-meta-mc">${det.bio.industryMc} <span class="positive">${det.bio.mcChange}</span></span>
          </div>
          <div class="rs-bio-meta-row">
            <span class="rs-bio-meta-tk">${d.tk}.US</span>
            <span class="rs-bio-meta-mcs">总市值 ${det.bio.mc} · 市值排名 ${det.bio.rank}</span>
          </div>
        </div>
      </div>
    </div>`;

    h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd">
        <div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("clock",12)}</div>
        <div class="dp-panel-t">事件追踪</div>
        <span class="dp-panel-s">查看更多 ›</span>
      </div>
      <div class="rs-tl">
        ${det.events.map(day => {
          const m = day.date.match(/(\d+)\s*月\s*(\d+)/);
          return `<div class="rs-tl-day">
            <div class="rs-tl-date">${m?m[1]+' 月':''}<strong>${m?m[2]:day.date}</strong></div>
            <div class="rs-tl-list">
              ${day.items.map(it => `<div class="rs-tl-item">
                <div class="rs-tl-item-t">${it.t}</div>
                <div class="rs-tl-item-time">${it.time}</div>
              </div>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

    // ──────── 3. 营收构成 | 财务评分 ────────
    h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd">
        <div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("chart-bar",12)}</div>
        <div class="dp-panel-t">营收构成</div>
        <span class="dp-panel-s">查看更多 ›</span>
      </div>
      <div class="rs-pill-tabs"><span class="rs-pill on">行业</span><span class="rs-pill">地区</span></div>
      <div class="rs-rev-chart-wrap"><canvas id="rs-rev-canvas"></canvas></div>
      <div class="rs-rev-axis">
        ${det.revenue.years.map(y => `<span>${y}</span>`).join('')}
      </div>
      <div class="rs-rev-legend">
        <div class="rs-rev-leg-hd"><span>名称</span><span>营收收入</span><span>占比</span><span>YoY</span></div>
        ${det.revenue.industry.map(seg => `
          <div class="rs-rev-leg-row rs-rev-leg-parent">
            <span class="rs-rev-leg-l"><span class="rs-rev-dot" style="background:${seg.color}"></span>${seg.label}</span>
            <span class="rs-rev-leg-v">${seg.total}</span>
            <span class="rs-rev-leg-p">${seg.pct}</span>
            <span class="rs-rev-leg-y positive">${seg.yoy}</span>
          </div>
          ${(seg.subs||[]).map(sub => `<div class="rs-rev-leg-row rs-rev-leg-sub">
            <span class="rs-rev-leg-l"><span class="rs-rev-leg-tree"></span>${sub.label}</span>
            <span class="rs-rev-leg-v">${sub.total}</span>
            <span class="rs-rev-leg-p">${sub.pct}</span>
            <span class="rs-rev-leg-y positive">${sub.yoy}</span>
          </div>`).join('')}
        `).join('')}
      </div>
    </div>`;

    const fs = det.fscore;
    h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd">
        <div class="dp-panel-icon" style="background:var(--cbg);color:var(--c)">${icon("shield",12)}</div>
        <div class="dp-panel-t">财务评分</div>
        <span class="dp-panel-s">${fs.updated} 更新</span>
      </div>
      <div class="rs-fs-card">
        <div class="rs-fs-grade">
          <div class="rs-fs-letter">${fs.letter}</div>
          <div class="rs-fs-trend up">▼</div>
        </div>
        <div class="rs-fs-meta">
          <div class="rs-fs-sec">${fs.sectorName}</div>
          <div class="rs-fs-row3">
            <div><div class="rs-fs-row3-l">同行业排名</div><div class="rs-fs-row3-v">${fs.peerRank}</div></div>
            <div><div class="rs-fs-row3-l">行业中位数</div><div class="rs-fs-row3-v">${fs.industryMedian}</div></div>
            <div><div class="rs-fs-row3-l">行业平均值</div><div class="rs-fs-row3-v">${fs.industryAvg}</div></div>
          </div>
        </div>
      </div>
      <div class="rs-fs-tabs"><span class="rs-pill on">评分分析</span><span class="rs-pill">同行比较</span></div>
      <div class="rs-fs-tab-content">
        <svg class="rs-fs-radar" viewBox="0 0 140 140">${rsRadarSvg(fs.radar)}</svg>
        <div class="rs-fs-tbl">
          <div class="rs-fs-tbl-hd"><span>指标</span><span>数值</span><span>评分</span></div>
          ${fs.groups.map(grp => `
            <div class="rs-fs-grp${grp.open?' open':''}">
              <div class="rs-fs-grp-hd">
                <span class="rs-fs-grp-fold">${grp.open?'−':'+'}</span>
                <span class="rs-fs-grp-t">${grp.name}</span>
                <span class="rs-fs-grp-grade${grp.up?' up':''}">${grp.grade} ▼</span>
              </div>
              ${grp.items ? `<div class="rs-fs-grp-bd">
                ${grp.items.map(it => `<div class="rs-fs-tbl-row">
                  <span class="rs-fs-tbl-k">${it.k}</span>
                  <span class="rs-fs-tbl-v mn">${it.v}</span>
                  <span class="rs-fs-cell${it.up?' up':''}">${it.g} ▼</span>
                </div>`).join('')}
              </div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;

    // ──────── 4. 估值分析 4 卡 2×2 ────────
    h += `<div class="dp-panel fi fi-d3" style="grid-column:1/-1"><div class="dp-panel-hd">
        <div class="dp-panel-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">${icon("brain",12)}</div>
        <div class="dp-panel-t">估值分析</div>
        <span class="dp-panel-s">vs 5 年区间 / 同行业排名</span>
      </div>
      <div class="rs-va-grid">
        ${['pe','pb','ps','div'].map(k => {
          const v = det.valuation[k];
          return `<div class="rs-va-card">
            <div class="rs-va-hd">
              <div class="rs-va-l">${v.name}</div>
              <div class="rs-va-tabs">
                <span class="rs-va-tab on">1年</span><span class="rs-va-tab">3年</span><span class="rs-va-tab">5年</span><span class="rs-va-tab">10年</span>
              </div>
            </div>
            <div class="rs-va-meta">
              <div><div class="rs-va-meta-l">${v.name}</div><div class="rs-va-meta-v">${v.cur}</div></div>
              <div><div class="rs-va-meta-l">同行业排名</div><div class="rs-va-meta-v">${v.rank}</div></div>
            </div>
            <div class="rs-va-chart"><canvas id="rs-va-${k}"></canvas></div>
            <div class="rs-va-legend">
              <span><span class="rs-va-legend-d" style="background:#8B5CF6"></span>${v.name}</span>
              <span><span class="rs-va-legend-d" style="background:#06B6D4"></span>股价</span>
              <span><span class="rs-va-legend-line" style="border-top:1px dashed #00ADA2"></span>高分位</span>
              <span><span class="rs-va-legend-line" style="border-top:1px dashed #FBBF24"></span>中位数</span>
              <span><span class="rs-va-legend-line" style="border-top:1px dashed #FB7185"></span>低分位</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // ──────── 5. 基本面 + 技术面 ────────
  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">${icon("chart-bar",12)}</div><div class="dp-panel-t">基本面摘要</div></div>
    <div class="cmp-row"><span class="cmp-l">P/E</span><span class="cmp-v">${d.pe}</span></div>
    <div class="cmp-row"><span class="cmp-l">市值</span><span class="cmp-v">${d.cap}</span></div>
    <div class="cmp-row"><span class="cmp-l">营收增速</span><span class="cmp-v positive">+94% YoY</span></div>
    <div class="cmp-row"><span class="cmp-l">毛利率</span><span class="cmp-v">76.2%</span></div>
    <div class="cmp-row"><span class="cmp-l">ROE</span><span class="cmp-v positive">91.1%</span></div>
    <div class="cmp-row"><span class="cmp-l">自由现金流</span><span class="cmp-v">$18.5B</span></div>
  </div>`;
  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--pbg);color:var(--p)">${icon("trending-down",12)}</div><div class="dp-panel-t">技术面摘要</div></div>
    <div class="cmp-row"><span class="cmp-l">支撑位</span><span class="cmp-v">$134.50</span></div>
    <div class="cmp-row"><span class="cmp-l">阻力位</span><span class="cmp-v">$148.00</span></div>
    <div class="cmp-row"><span class="cmp-l">均线状态</span><span class="cmp-v positive">MA20↑ MA60↑</span></div>
    <div class="cmp-row"><span class="cmp-l">RSI (14)</span><span class="cmp-v" style="color:var(--o)">68.4</span></div>
    <div class="cmp-row"><span class="cmp-l">布林带</span><span class="cmp-v">上轨突破</span></div>
    <div class="cmp-row"><span class="cmp-l">成交量</span><span class="cmp-v positive">放量突破</span></div>
  </div>`;

  // ──────── 6. 季度业绩 + 分析师评级 ────────
  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("trending-up",12)}</div><div class="dp-panel-t">季度营收 / EPS</div><span class="dp-panel-s">单位 $B · E=预期</span></div>`;
  earnings.forEach(e => {
    const pct = (e.rev / maxRev) * 100;
    h += `<div class="qb-row"><span class="qb-q">${e.q}</span><div class="qb-track"><div class="qb-fill" style="width:${pct}%${e.est?';opacity:.55':''}"></div></div><span class="qb-v">${e.rev}<span class="qb-yoy positive" style="color:${e.est?'var(--ts)':'var(--g)'}">${e.yoy}</span></span></div>`;
  });
  h += `<div style="margin-top:6px;font-size:9px;color:var(--tm);line-height:1.5">EPS Q1 25:<strong style="color:var(--tp)">$0.96</strong>(预期 $0.93)· 超预期 <span class="positive">+3.2%</span></div>`;
  h += `</div>`;

  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:rgba(139,92,246,.1);color:var(--p)">${icon("star",12)}</div><div class="dp-panel-t">分析师评级</div><span class="dp-panel-s">${totalAn} 家覆盖</span></div>
    <div class="an-summary">
      <div><div class="an-target-l">目标价中位</div><div class="an-target">$172</div></div>
      <span class="an-upside">↑ 23% 上行空间</span>
    </div>`;
  analyst.forEach(a => {
    const pct = (a.c / totalAn) * 100;
    h += `<div class="an-row"><span class="an-l">${a.l}</span><div class="an-track"><div class="an-fill" style="width:${pct}%;background:${a.color}"></div></div><span class="an-c">${a.c}</span></div>`;
  });
  h += `</div>`;

  // ──────── 7. 同行对比 ────────
  h += `<div class="dp-panel fi fi-d3" style="grid-column:1/-1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">${icon("scale",12)}</div><div class="dp-panel-t">同行业对比 · 半导体</div><span class="dp-panel-s">数据 TTM</span></div>
    <table class="peer-tbl"><thead><tr><th scope="col">标的</th><th scope="col">P/E</th><th scope="col">P/S</th><th scope="col">毛利率</th><th scope="col">营收增速</th><th scope="col">市值</th></tr></thead><tbody>`;
  peers.forEach(p => {
    const selfMarker = p.self ? '<span class="peer-self-mark" aria-label="当前标的">▶</span>' : '';
    const selfBadge = p.self ? '<span class="peer-self-badge">本仓</span>' : '';
    h += `<tr class="${p.self?'self':''}"><td>${selfMarker}<strong>${p.tk}</strong>${selfBadge}</td><td>${p.pe}</td><td>${p.ps}x</td><td>${p.gm}</td><td style="color:${p.rev.startsWith('-')?'var(--r)':'var(--g)'}">${p.rev}</td><td>${p.mc}</td></tr>`;
  });
  h += `</tbody></table></div>`;

  // ──────── 8. 估值因子分解 + Quant Ratings(下移到这里) ────────
  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:rgba(251,191,36,.12);color:#FBBF24">${icon("dollar",12)}</div><div class="dp-panel-t">估值因子分解</div><span class="dp-panel-s">vs 半导体行业</span></div>`;
  fbVal.forEach(f => {
    h += `<div class="fb-row"><span class="fb-l">${f.k}</span><span class="fb-v">${f.v}</span><span class="fb-vs">${f.vs}</span><span class="fb-grade qr-grade ${f.cls}" style="font-size:11px">${f.g}</span></div>`;
  });
  h += `</div>`;

  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:rgba(139,92,246,.1);color:#8B5CF6">${icon("sparkles",12)}</div><div class="dp-panel-t">Quant Ratings</div><span class="dp-panel-s">5 因子打分</span></div>
    <div class="qr-stack">`;
  quant.forEach(q => {
    const lv = q.cls;
    const barColor = lv === 'a' ? '#10B981' : lv === 'b' ? '#84CC16' : lv === 'c' ? '#F59E0B' : '#F87171';
    h += `<div class="qr-stack-row lv-${lv}">
      <span class="qr-cell-l">${q.k}</span>
      <span class="qr-grade ${lv}">${q.g}</span>
      <div class="qr-bar"><div class="qr-bar-f" style="width:${q.score}%;background:${barColor}"></div></div>
      <span class="qr-meta-s">${q.meta}</span>
    </div>`;
  });
  h += `</div></div>`;

  // ──────── 9. 估值历史 + 业绩预期 ────────
  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:rgba(251,191,36,.12);color:#FBBF24">${icon("chart-bar",12)}</div><div class="dp-panel-t">估值历史</div><span class="dp-panel-s">5 年区间</span></div>
    <div class="vh-row"><span class="vh-l">P/E 当前</span><span><span class="vh-v">68.4x</span><span class="vh-vs">5Y 中位 56x</span></span></div>
    <div class="vh-row"><span class="vh-l">P/E 5Y 高</span><span><span class="vh-v">112.3x</span><span class="vh-vs">2021/11</span></span></div>
    <div class="vh-row"><span class="vh-l">P/E 5Y 低</span><span><span class="vh-v">26.4x</span><span class="vh-vs">2022/10</span></span></div>
    <div class="vh-row"><span class="vh-l">P/S 当前</span><span><span class="vh-v">21.8x</span><span class="vh-vs">5Y 中位 14.2x</span></span></div>
    <div class="vh-row"><span class="vh-l">分位</span><span class="vh-v" style="color:var(--o)">85th</span></div>
  </div>`;

  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--cbg);color:var(--c)">${icon("crystal",12)}</div><div class="dp-panel-t">业绩预期</div><span class="dp-panel-s">FY25 共识</span></div>
    <div class="cmp-row"><span class="cmp-l">营收预期</span><span class="cmp-v">$182B</span></div>
    <div class="cmp-row"><span class="cmp-l">YoY 增速</span><span class="cmp-v positive">+58%</span></div>
    <div class="cmp-row"><span class="cmp-l">EPS 预期</span><span class="cmp-v">$4.12</span></div>
    <div class="cmp-row"><span class="cmp-l">EPS YoY</span><span class="cmp-v positive">+47%</span></div>
    <div class="cmp-row"><span class="cmp-l">下次财报</span><span class="cmp-v">2025-08-27</span></div>
    <div class="cmp-row"><span class="cmp-l">隐含波动</span><span class="cmp-v" style="color:var(--o)">±8.4%</span></div>
  </div>`;

  // ──────── 10. 日程&公告 + 相关事件 ────────
  if (det) {
    h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("calendar",12)}</div><div class="dp-panel-t">日程 &amp; 公告</div><span class="dp-panel-s">查看更多 ›</span></div>
      <div class="rs-pill-tabs"><span class="rs-pill on">日程</span><span class="rs-pill">公告</span></div>
      <div class="rs-sch">
        ${det.schedule.map(s => `<div class="rs-sch-item">
          <div class="rs-sch-date"><div class="mo">${s.mo}</div><div class="day">${s.day}</div></div>
          <div class="rs-sch-bd">
            <div class="rs-sch-t">${s.type} <span class="tz">${s.tz}</span></div>
            <div class="rs-sch-s">${s.sub}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("zap",12)}</div><div class="dp-panel-t">相关事件</div><span class="dp-panel-s">来自时间线</span></div>
    <div class="inline-list">
      <div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">NVDA 突破 30 日高点 $140</div><div class="inline-item-s">异动 · 12 分钟前 · 持有 18%</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">TSM 宣布 3nm 产能扩张</div><div class="inline-item-s">催化 · 48 分钟前 · NVDA 为核心客户</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">美联储偏鸽信号</div><div class="inline-item-s">宏观 · 1 小时前 · 科技股利好</div></div></div>
    </div>
  </div>`;

  // ──────── 11. 持仓 + 策略 ────────
  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">${icon("briefcase",12)}</div><div class="dp-panel-t">你的持仓</div></div>`;
  if (held) {
    const pnl = ((held.price - held.cost) * held.shares).toFixed(0);
    h += `<div class="cmp-row"><span class="cmp-l">持仓数</span><span class="cmp-v">${held.shares} 股</span></div>
    <div class="cmp-row"><span class="cmp-l">成本</span><span class="cmp-v">$${held.cost.toFixed(2)}</span></div>
    <div class="cmp-row"><span class="cmp-l">盈亏</span><span class="cmp-v positive">+$${pnl}</span></div>
    <div class="cmp-row"><span class="cmp-l">占比</span><span class="cmp-v" style="color:var(--o)">${held.pct}% (集中度高)</span></div>`;
  } else {
    h += `<div style="font-size:10px;color:var(--tm);padding:8px 0">未持有 · 已在自选中</div>`;
  }
  h += `</div>`;
  h += `<div class="dp-panel fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">${icon("brain",12)}</div><div class="dp-panel-t">相关策略</div></div>
    <div class="inline-list">
      <div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">NVDA 看涨期权策略</div><div class="inline-item-s">AI 评估中 · 进度 68%</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">半导体板块轮动</div><div class="inline-item-s">运行中 · 8 月 1 日激活</div></div></div>
    </div>
  </div>`;

  h += `</div>`;

  // ──────── 12. 行动按钮(无 AI 段落,深度分析归 chat) ────────
  h += `<div style="padding:0 18px 14px">
    <div class="action-bar">
      <button class="action-btn primary" onclick="tryIntent('帮我建一个 NVDA Trade Plan')">建 Trade Plan</button>
      <button class="action-btn" onclick="tryIntent('对比 NVDA 和 AMD')">和 AMD 对比</button>
      <button class="action-btn">设价格提醒</button>
      <button class="action-btn">查看回测</button>
    </div>
  </div>`;

  document.getElementById('v-dyn-research').innerHTML = h;

  // 在右侧 #dp 面板打开「深度分析 agent」(live input 即触发,与选股器一致)
  if (typeof openResearchAgentPanel === 'function') openResearchAgentPanel(d.tk);

  // ──────── 异步绘制各 canvas ────────
  setTimeout(() => {
    drawRsQuoteChart();
    if (det) {
      drawRsRevenueChart(det);
      drawRsValuationCharts(det);
    }
  }, 350);
}

/* 在 .dp 详情列里展示「深度分析 agent」Agent 动效卡
   位置与选股器 openScreenerAgentPanel 一致,但配色 / 动效 / 名称都不同 */
function openResearchAgentPanel(ticker) {
  const dp = document.getElementById('dp');
  if (!dp) return;
  const inner = document.getElementById('dpInner');
  const footer = document.getElementById('dpFooter');
  inner.innerHTML = `
    <div class="ra-agent-wrap">
      <div class="ra-agent-bg"></div>
      <div class="ra-agent-icon-stage">
        <span class="ra-agent-ring"></span>
        <span class="ra-agent-ring"></span>
        <span class="ra-agent-ring"></span>
        <div class="ra-agent-icon">${icon('sparkles', 28)}</div>
      </div>
      <div class="ra-agent-h">深度分析 agent</div>
      <div class="ra-agent-st">正在为你深度获取与整合 ${ticker} 全维度数据</div>
      <div class="ra-agent-d">公司百科 · 营收构成 · 财务评分 · 估值分析 · 事件追踪 已加载至左侧主区,完整推理过程在右侧 chat 流式输出</div>
      <div class="ra-agent-steps">
        <div class="ra-agent-step done">
          <div class="ra-agent-step-n">①</div>
          <div class="ra-agent-step-body"><div class="ra-agent-step-t">理解输入</div><div class="ra-agent-step-s">已识别:${ticker} · 标的研究意图</div></div>
        </div>
        <div class="ra-agent-step done">
          <div class="ra-agent-step-n">②</div>
          <div class="ra-agent-step-body"><div class="ra-agent-step-t">采集深度数据</div><div class="ra-agent-step-s">行情 / 公司 / 财务 / 估值 / 事件 7 路并发</div></div>
        </div>
        <div class="ra-agent-step active">
          <div class="ra-agent-step-n">③</div>
          <div class="ra-agent-step-body"><div class="ra-agent-step-t">整合呈现</div><div class="ra-agent-step-s">主区动态布局已就位 · chat 持续推理</div></div>
        </div>
      </div>
      <div class="ra-agent-hint">→ 完整深度分析正在右侧 chat 输出</div>
    </div>
  `;
  if (footer) footer.innerHTML = '';
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  document.getElementById('dpBack')?.classList.remove('show');
  // 标记当前是 Research Agent 模式,closeDetail/exitDynamic 时不要影响主区
  dp.dataset.mode = 'research-agent';
}

/* ─── 雷达 SVG(5 顶点:盈利/成长/运营/安全/现金) ─── */
function rsRadarSvg(radar) {
  const cx = 70, cy = 70, R = 50;
  let svg = '';
  // 同心五边形 4 圈
  for (let r = 1; r <= 4; r++) {
    const pts = radar.map((_, i) => {
      const a = (Math.PI * 2 * i / radar.length) - Math.PI / 2;
      const rr = (R / 4) * r;
      return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    });
    svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width=".7"/>`;
  }
  // 5 轴
  for (let i = 0; i < radar.length; i++) {
    const a = (Math.PI * 2 * i / radar.length) - Math.PI / 2;
    svg += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="rgba(255,255,255,.06)" stroke-width=".7"/>`;
  }
  // 数据多边形
  const dataPts = radar.map((it, i) => {
    const a = (Math.PI * 2 * i / radar.length) - Math.PI / 2;
    const rr = it.v * R;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  });
  svg += `<polygon points="${dataPts.join(' ')}" fill="rgba(0,173,162,.20)" stroke="#00ADA2" stroke-width="1.5"/>`;
  // 顶点
  radar.forEach((it, i) => {
    const a = (Math.PI * 2 * i / radar.length) - Math.PI / 2;
    const rr = it.v * R;
    svg += `<circle cx="${(cx + Math.cos(a) * rr).toFixed(1)}" cy="${(cy + Math.sin(a) * rr).toFixed(1)}" r="2.4" fill="#00ADA2"/>`;
  });
  // 标签(在外侧)
  radar.forEach((it, i) => {
    const a = (Math.PI * 2 * i / radar.length) - Math.PI / 2;
    const lx = cx + Math.cos(a) * (R + 12);
    const ly = cy + Math.sin(a) * (R + 12) + 3;
    const gColor = it.g === 'A' ? '#00ADA2' : (it.g === 'B' ? '#FBBF24' : '#FB7185');
    svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.55)" style="font-family:DM Sans">${it.k}</text>`;
    svg += `<text x="${lx.toFixed(1)}" y="${(ly + 9).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="${gColor}" style="font-family:DM Sans">${it.g}</text>`;
  });
  return svg;
}

/* ─── 行情头走势图 ─── */
function drawRsQuoteChart() {
  const c = document.getElementById('rc1');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width = c.parentElement.clientWidth;
  const ht = c.height = c.parentElement.clientHeight;
  const pts = []; let y = ht * .5;
  for (let x = 0; x < w; x += 2) {
    y += (Math.random() - .42) * 2.5;
    y = Math.max(ht * .1, Math.min(ht * .9, y));
    pts.push({x, y});
  }
  const g = ctx.createLinearGradient(0, 0, 0, ht);
  g.addColorStop(0, 'rgba(0,173,162,.12)'); g.addColorStop(1, 'rgba(0,173,162,0)');
  ctx.beginPath(); ctx.moveTo(0, ht);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(w, ht); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = 'rgba(0,173,162,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
}

/* ─── 营收堆叠柱图(7 年 × 2 段) ─── */
function drawRsRevenueChart(det) {
  const c = document.getElementById('rs-rev-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = c.parentElement.clientWidth;
  const H = 130;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + 'px'; c.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const years = det.revenue.years;
  const segs = det.revenue.industry;
  const totals = years.map((_, i) => segs.reduce((s, seg) => s + seg.values[i], 0));
  const maxTotal = Math.max(...totals);
  const padX = 36, padTop = 12, padBot = 6;
  const innerW = W - padX - 8;
  const slotW = innerW / years.length;
  const barW = Math.max(10, slotW * .55);

  // y 轴 2 个刻度
  ctx.font = '9px DM Sans';
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.textAlign = 'right';
  ctx.fillText(maxTotal + ' 亿', padX - 4, padTop + 3);
  ctx.fillText(Math.round(maxTotal/2) + ' 亿', padX - 4, padTop + (H - padTop - padBot) / 2 + 3);

  // 柱
  years.forEach((_, i) => {
    const x = padX + slotW * i + (slotW - barW) / 2;
    let yCursor = H - padBot;
    segs.forEach(seg => {
      const v = seg.values[i];
      const barH = (v / maxTotal) * (H - padTop - padBot);
      ctx.fillStyle = seg.color;
      ctx.fillRect(x, yCursor - barH, barW, barH);
      yCursor -= barH;
    });
  });
}

/* ─── 估值 4 卡折线(PE/PB/PS/股息率) ─── */
function drawRsValuationCharts(det) {
  ['pe','pb','ps','div'].forEach(k => {
    const c = document.getElementById('rs-va-' + k);
    if (!c) return;
    const v = det.valuation[k];
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = c.parentElement.clientWidth;
    const H = 80;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const padTop = 6, padBot = 4, padX = 4;
    const innerH = H - padTop - padBot;
    const innerW = W - padX * 2;
    const N = 24;
    const parseN = s => parseFloat(String(s).replace('%',''));
    const cur = parseN(v.cur), high = parseN(v.high), low = parseN(v.low), mid = parseN(v.mid);
    const axisHi = v.axisHi, axisLo = v.axisLo;
    const yMap = vv => padTop + (1 - (vv - axisLo) / (axisHi - axisLo)) * innerH;

    // 紫色折线点(指标历史)
    let seed = v.seed;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = low + (high - low) * (.4 + .45 * Math.sin(t * Math.PI * 2 + (v.seed % 7)));
      const noise = (rand() - .5) * (high - low) * .18;
      pts.push(i === N - 1 ? cur : Math.max(low * .9, Math.min(high * 1.05, base + noise)));
    }

    // 青色股价填充(背景 area)
    const stockPts = pts.map((p, i) => p * (1 + Math.sin(i * .5 + (v.seed % 5)) * .14));
    const stockGrad = ctx.createLinearGradient(0, padTop, 0, H);
    stockGrad.addColorStop(0, 'rgba(0,173,162,.30)');
    stockGrad.addColorStop(1, 'rgba(0,173,162,0)');
    ctx.fillStyle = stockGrad;
    ctx.beginPath();
    ctx.moveTo(padX, H - padBot);
    stockPts.forEach((p, i) => {
      const x = padX + (i / (N - 1)) * innerW;
      ctx.lineTo(x, yMap(Math.max(axisLo, Math.min(axisHi, p))));
    });
    ctx.lineTo(W - padX, H - padBot);
    ctx.closePath();
    ctx.fill();

    // 3 条分位横线
    const drawHLine = (vv, color) => {
      ctx.strokeStyle = color;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, yMap(vv));
      ctx.lineTo(W - padX, yMap(vv));
      ctx.stroke();
    };
    drawHLine(high, 'rgba(0,173,162,.55)');
    drawHLine(mid,  'rgba(251,191,36,.55)');
    drawHLine(low,  'rgba(251,113,133,.55)');
    ctx.setLineDash([]);

    // 紫色折线
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = padX + (i / (N - 1)) * innerW;
      const y = yMap(p);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
}

/* ============ 归因诊断(市场频道视角)============
   v3.1: 从「我的持仓今日下跌」改为「市场大盘维度」,默认美股 */
function renderDynAttribution() {
  const indices = [
    { name:'道琼斯', tk:'DJI', val:'42,387.20', chg:'-389.50', pct:'-0.91%', streak:'5 连跌', drv:'AI 担忧 + 财报观望' },
    { name:'纳斯达克', tk:'IXIC', val:'18,142.55', chg:'-280.18', pct:'-1.52%', streak:'高位下挫', drv:'AI 巨头估值杀' },
    { name:'标普 500', tk:'GSPC', val:'5,802.31', chg:'-65.42', pct:'-1.11%', streak:'高位下挫', drv:'板块普跌' }
  ];
  // 11 个 SPDR 板块 ETF + 涨跌
  const sectors = [
    { tk:'XLK', name:'科技', pct:-3.20, drv:'NVDA / AMD / AVGO 集体抛售' },
    { tk:'XLC', name:'通信', pct:-2.45, drv:'META / GOOG 财报观望' },
    { tk:'XLY', name:'消费可选', pct:-1.85, drv:'TSLA -4.2% 拖累' },
    { tk:'XLF', name:'金融', pct:-0.92, drv:'国债收益率走高' },
    { tk:'XLI', name:'工业', pct:-0.68, drv:'油价飙升压制' },
    { tk:'XLRE',name:'房地产', pct:-0.42, drv:'高息环境' },
    { tk:'XLB', name:'材料', pct:-0.25, drv:'美元走强' },
    { tk:'XLV', name:'医疗', pct:+0.15, drv:'防御板块吸金' },
    { tk:'XLP', name:'消费必需', pct:+0.42, drv:'防御板块吸金' },
    { tk:'XLU', name:'公用事业', pct:+0.78, drv:'避险情绪 + 高股息' },
    { tk:'XLE', name:'能源', pct:+1.82, drv:'布伦特原油破 $110' }
  ];
  // 今日关键事件(时间倒序,9 条 + 影响标签)
  const events = [
    { tm:'15:48', src:'WSJ',       lvl:'r', lvlT:'利空', t:'特斯拉 4 月中国销量同比 -32%,Model Y 改款延期' },
    { tm:'14:32', src:'路透社',     lvl:'r', lvlT:'利空', t:'特朗普拒绝伊朗霍尔木兹海峡提议,和平谈判陷入僵局' },
    { tm:'13:08', src:'CNBC',       lvl:'r', lvlT:'利空', t:'OpenAI 内部备忘录泄露:未达 2025 年底 10 亿周活目标' },
    { tm:'12:45', src:'Reuters',    lvl:'r', lvlT:'利空', t:'OPEC+ 暗示 6 月或不再增产,油市持续紧平衡' },
    { tm:'11:22', src:'Bloomberg',  lvl:'o', lvlT:'中性', t:'微软将于 5/1 盘后发布 Q3 财报,市场预期 EPS $3.18' },
    { tm:'10:15', src:'Bloomberg',  lvl:'r', lvlT:'利空', t:'布伦特原油盘中突破 $110/桶,WTI 一度冲破 $100' },
    { tm:'09:30', src:'路透社',     lvl:'g', lvlT:'利多', t:'礼来减肥药 III 期数据超预期,医疗板块逆势走强' },
    { tm:'09:00', src:'美联储',     lvl:'r', lvlT:'利空', t:'FOMC 维持利率 3.50%-3.75% 不变,纪要措辞偏鹰' },
    { tm:'08:30', src:'BLS',        lvl:'r', lvlT:'利空', t:'PPI 同比 +3.5% 高于预期 +3.1%,年内降息空间收窄' }
  ];
  // 跌幅榜 Top 10(美股)
  const losers = [
    { tk:'NVDA', name:'英伟达',   pr:'209.25', pct:-4.18, vol:'78.3B', drv:'AI 资本支出担忧' },
    { tk:'AMD',  name:'AMD',     pr:'167.44', pct:-3.92, vol:'12.1B', drv:'与 NVDA 联动' },
    { tk:'AVGO', name:'博通',     pr:'1782.50',pct:-3.45, vol:'8.7B',  drv:'AI ASIC 概念退潮' },
    { tk:'ORCL', name:'甲骨文',   pr:'138.20', pct:-3.10, vol:'4.2B',  drv:'AI 算力需求疑虑' },
    { tk:'TSLA', name:'特斯拉',   pr:'241.15', pct:-4.21, vol:'18.5B', drv:'消费可选板块普跌' },
    { tk:'META', name:'Meta',    pr:'512.40', pct:-2.78, vol:'9.2B',  drv:'财报周前减仓' },
    { tk:'MSFT', name:'微软',     pr:'425.00', pct:-1.45, vol:'7.5B',  drv:'AI CapEx 担忧波及' },
    { tk:'GOOG', name:'谷歌',     pr:'172.00', pct:-1.88, vol:'6.8B',  drv:'广告业务季节性' },
    { tk:'AAPL', name:'苹果',     pr:'198.32', pct:-2.31, vol:'11.4B', drv:'财报周前观望' },
    { tk:'NFLX', name:'网飞',     pr:'682.50', pct:-1.92, vol:'2.8B',  drv:'估值偏高减仓' }
  ];

  let h = `<div class="dyn-grid attribution">`;

  // Row 0: 市场选择 tabs(全宽)
  h += `<div class="rs-mkt-tabs" style="grid-column:1/-1">
    <span class="rs-mkt-tab on">美股</span>
    <span class="rs-mkt-tab">港股</span>
    <span class="rs-mkt-tab">新加坡</span>
    <span class="rs-mkt-tab">沪深通</span>
    <span class="rs-mkt-meta">最近更新 22:55:21 美东 · 已收盘</span>
  </div>`;

  // Row 1: 三大指数(全宽 3 列网格)
  h += `<div class="rs-idx-grid" style="grid-column:1/-1">`;
  indices.forEach((idx, i) => {
    h += `<div class="rs-idx-card">
      <div class="rs-idx-hd">
        <div class="rs-idx-name">${idx.name}</div>
        <span class="rs-idx-streak">${idx.streak}</span>
      </div>
      <div class="rs-idx-val">${idx.val}</div>
      <div class="rs-idx-chg-row">
        <span class="rs-idx-chg negative">${idx.chg}</span>
        <span class="rs-idx-pct negative">${idx.pct}</span>
      </div>
      <div class="rs-idx-spark"><canvas id="idx-sp-${i}"></canvas></div>
      <div class="rs-idx-drv">${icon('zap',10)} ${idx.drv}</div>
    </div>`;
  });
  h += `</div>`;

  // Row 2: 板块表现 | 今日关键事件
  h += `<div class="dp-panel"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">${icon("chart-bar",12)}</div><div class="dp-panel-t">板块表现 · S&amp;P 11 大行业</div><span class="dp-panel-s">按涨跌幅排序</span></div>
    <div class="rs-sec-list">`;
  sectors.forEach(s => {
    const isUp = s.pct >= 0;
    const w = Math.min(48, Math.abs(s.pct) * 12);
    h += `<div class="rs-sec-row ${isUp?'up':'dn'}">
      <span class="rs-sec-tk">${s.tk}</span>
      <span class="rs-sec-name">${s.name}</span>
      <div class="rs-sec-bar-wrap">
        <div class="rs-sec-bar-axis"></div>
        <div class="rs-sec-bar ${isUp?'up':'dn'}" style="width:${w}%;${isUp?'left:50%':'right:50%'}"></div>
      </div>
      <span class="rs-sec-pct ${isUp?'positive':'negative'}">${isUp?'+':''}${s.pct.toFixed(2)}%</span>
    </div>`;
  });
  h += `</div></div>`;

  h += `<div class="dp-panel"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("clock",12)}</div><div class="dp-panel-t">今日关键事件</div><span class="dp-panel-s">${events.length} 条 · 来自 10 信源</span></div>
    <div class="rs-evt-list">`;
  events.forEach(ev => {
    h += `<div class="rs-evt-item">
      <span class="rs-evt-tm">${ev.tm}</span>
      <div class="rs-evt-bd">
        <div class="rs-evt-t">${ev.t}</div>
        <div class="rs-evt-meta">
          <span class="rs-evt-src">${ev.src}</span>
          <span class="rs-evt-lvl rs-evt-lvl-${ev.lvl}">${ev.lvlT}</span>
        </div>
      </div>
    </div>`;
  });
  h += `</div></div>`;

  // Row 3: 跌幅榜(全宽 table)
  h += `<div class="dp-panel" style="grid-column:1/-1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--rbg);color:var(--r)">${icon("trending-down",12)}</div><div class="dp-panel-t">美股跌幅榜 Top 10</div><span class="dp-panel-s">点击行查看详情</span></div>
    <table class="peer-tbl"><thead><tr><th scope="col">标的</th><th scope="col">名称</th><th scope="col">现价</th><th scope="col">涨跌幅</th><th scope="col">成交额</th><th scope="col">下跌主因</th></tr></thead><tbody>`;
  losers.forEach(l => {
    h += `<tr onclick="openDetail('${l.tk}','')"><td><strong>${l.tk}</strong></td><td style="color:var(--ts)">${l.name}</td><td class="mn">$${l.pr}</td><td class="mn negative">${l.pct.toFixed(2)}%</td><td class="mn" style="color:var(--ts)">$${l.vol}</td><td style="color:var(--tm);font-size:10px">${l.drv}</td></tr>`;
  });
  h += `</tbody></table></div>`;

  // Row 4: 资金流向 | 财报周日历
  h += `<div class="dp-panel"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--cbg);color:var(--c)">${icon("activity",12)}</div><div class="dp-panel-t">主力资金流向</div><span class="dp-panel-s">前 5 大行业</span></div>
    <div class="cmp-row"><span class="cmp-l">能源 XLE</span><span class="cmp-v positive">+$2.8B</span></div>
    <div class="cmp-row"><span class="cmp-l">公用 XLU</span><span class="cmp-v positive">+$1.5B</span></div>
    <div class="cmp-row"><span class="cmp-l">医疗 XLV</span><span class="cmp-v positive">+$0.9B</span></div>
    <div class="cmp-row"><span class="cmp-l">科技 XLK</span><span class="cmp-v negative">-$5.2B</span></div>
    <div class="cmp-row"><span class="cmp-l">通信 XLC</span><span class="cmp-v negative">-$2.4B</span></div>
    <div class="cmp-row"><span class="cmp-l">VIX 恐慌指数</span><span class="cmp-v" style="color:var(--o)">23.8 (+18%)</span></div>
  </div>`;

  h += `<div class="dp-panel"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">${icon("calendar",12)}</div><div class="dp-panel-t">超级财报周</div><span class="dp-panel-s">本周 4 巨头披露</span></div>
    <div class="cmp-row"><span class="cmp-l">字母表 GOOG</span><span class="cmp-v">5/1 美东盘后</span></div>
    <div class="cmp-row"><span class="cmp-l">微软 MSFT</span><span class="cmp-v">5/1 美东盘后</span></div>
    <div class="cmp-row"><span class="cmp-l">亚马逊 AMZN</span><span class="cmp-v">5/2 美东盘后</span></div>
    <div class="cmp-row"><span class="cmp-l">苹果 AAPL</span><span class="cmp-v">5/2 美东盘后</span></div>
    <div class="cmp-row"><span class="cmp-l">2026 合计 CapEx</span><span class="cmp-v" style="color:var(--o)">超 $6,000 亿</span></div>
    <div class="cmp-row"><span class="cmp-l">市场情绪</span><span class="cmp-v" style="color:var(--r)">FOMO → 谨慎</span></div>
  </div>`;

  h += `</div>`;

  // 底部动作
  h += `<div style="padding:0 18px 14px">
    <div class="action-bar">
      <button class="action-btn primary" onclick="tryIntent('分析我的持仓风险')">看下跌对我影响</button>
      <button class="action-btn">设置大盘预警</button>
      <button class="action-btn">导出今日复盘</button>
      <button class="action-btn">回测类似行情</button>
    </div>
  </div>`;

  document.getElementById('v-dyn-attribution').innerHTML = h;

  // 在右侧 #dp 面板打开「大盘分析 agent」(live input 即触发)
  if (typeof openMarketAgentPanel === 'function') openMarketAgentPanel();

  // 异步绘制 3 个指数 sparkline(下跌曲线)
  setTimeout(() => {
    indices.forEach((_, i) => {
      const c = document.getElementById('idx-sp-' + i);
      if (!c) return;
      const ctx = c.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = c.parentElement.clientWidth, H = 36;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.scale(dpr, dpr);
      const N = 30;
      const pts = []; let y = H * .25;
      for (let k = 0; k < N; k++) {
        y += (Math.random() - .35) * 2.4;
        y = Math.max(2, Math.min(H - 2, y));
        pts.push({ x: (k / (N - 1)) * W, y });
      }
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(239,68,68,.18)');
      grad.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.beginPath(); ctx.moveTo(0, H);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(W, H); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath();
      pts.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.4; ctx.stroke();
    });
  }, 360);
}

/* 在 .dp 详情列里展示「大盘分析 agent」动效卡
   位置同选股器/研究 agent,色系/动效再次差异化(amber + 横向扫描线) */
function openMarketAgentPanel() {
  const dp = document.getElementById('dp');
  if (!dp) return;
  const inner = document.getElementById('dpInner');
  const footer = document.getElementById('dpFooter');
  inner.innerHTML = `
    <div class="ma-agent-wrap">
      <div class="ma-agent-bg"></div>
      <div class="ma-agent-icon-stage">
        <span class="ma-agent-scanline"></span>
        <div class="ma-agent-icon">${icon('activity', 28)}</div>
        <div class="ma-agent-grid"></div>
      </div>
      <div class="ma-agent-h">大盘分析 agent</div>
      <div class="ma-agent-st">正在归因今日下跌:宏观驱动 + 个股贡献</div>
      <div class="ma-agent-d">瀑布图、宏观因素、受影响持仓已加载至左侧主区,完整归因推理在右侧 chat 流式输出</div>
      <div class="ma-agent-steps">
        <div class="ma-agent-step done">
          <div class="ma-agent-step-n">①</div>
          <div class="ma-agent-step-body"><div class="ma-agent-step-t">扫描大盘异动</div><div class="ma-agent-step-s">已识别:科技板块普跌 -3.4%</div></div>
        </div>
        <div class="ma-agent-step done">
          <div class="ma-agent-step-n">②</div>
          <div class="ma-agent-step-body"><div class="ma-agent-step-t">归因宏观驱动</div><div class="ma-agent-step-s">美债收益率 / 美元 / CPI 三因子并发</div></div>
        </div>
        <div class="ma-agent-step active">
          <div class="ma-agent-step-n">③</div>
          <div class="ma-agent-step-body"><div class="ma-agent-step-t">分解个股贡献</div><div class="ma-agent-step-s">高 Beta 持仓放大跌幅 · 实时计算中</div></div>
        </div>
      </div>
      <div class="ma-agent-hint">→ 完整归因推理正在右侧 chat 输出</div>
    </div>
  `;
  if (footer) footer.innerHTML = '';
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  document.getElementById('dpBack')?.classList.remove('show');
  dp.dataset.mode = 'market-agent';
}

/* ============ AI 智能选股器 ============
   两段式:1) 触发时是「等待 chat 推荐」空态  2) 用户在 chat 点 CTA 后才填筛选 + 表格 */
let screenerApplied = false;
let screenerSaved = false;

function renderDynScreener() {
  if (!screenerApplied) {
    renderDynScreenerEmpty();
  } else {
    renderDynScreenerFilled();
  }
}

/* 默认状态:主区是完全可操作的选股器(全量 134,453 只,无筛选),
   Agent 动效卡放在 detail 列(.dp 侧栏)引导用户也可以等 AI 推荐 */
function renderDynScreenerEmpty() {
  const cats = ['已应用的筛选器','范围','公司规模与财务','公司经营效率','公司增长','股东回报','公司估值','价格与成交','综合技术指标'];
  const subTabs = ['概览','公司规模与财务','公司经营效率','公司增长','股东回报','公司估值','价格与成交'];
  const filterSlots = [
    {l:'市场',         placeholder:'选择市场'},
    {l:'市值',         placeholder:'设置范围'},
    {l:'营业净利率',    placeholder:'设置范围'},
    {l:'股息率(TTM)', placeholder:'设置范围'}
  ];
  // 默认 20 行(展示市场全量样本,以市值/热度排序的代表性公司)
  const rows = [
    {tk:'AAPL',  nm:'苹果',                  pr:'198.32', ch:'-2.31%', dir:'dn', mc:'30,400 亿', npm:'+25.30%', dy:'+0.55%', sec:'消费电子'},
    {tk:'MSFT',  nm:'微软',                  pr:'425.00', ch:'+1.12%', dir:'up', mc:'31,500 亿', npm:'+34.70%', dy:'+0.74%', sec:'软件'},
    {tk:'NVDA',  nm:'英伟达',                 pr:'142.68', ch:'+3.08%', dir:'up', mc:'35,100 亿', npm:'+48.20%', dy:'+0.03%', sec:'AI 芯片'},
    {tk:'GOOG',  nm:'谷歌',                  pr:'172.00', ch:'+0.48%', dir:'up', mc:'21,300 亿', npm:'+27.50%', dy:'+0.22%', sec:'互联网服务'},
    {tk:'AMZN',  nm:'亚马逊',                 pr:'182.50', ch:'+0.85%', dir:'up', mc:'19,200 亿', npm:'+8.10%',  dy:'—',      sec:'电商零售'},
    {tk:'META',  nm:'Meta',                 pr:'512.40', ch:'+2.75%', dir:'up', mc:'13,000 亿', npm:'+33.40%', dy:'+0.39%', sec:'社交媒体'},
    {tk:'BRK.B', nm:'伯克希尔',                pr:'398.00', ch:'+0.32%', dir:'up', mc:'8,720 亿',  npm:'+15.40%', dy:'—',      sec:'综合金融'},
    {tk:'TSLA',  nm:'特斯拉',                 pr:'238.40', ch:'+2.45%', dir:'up', mc:'7,610 亿',  npm:'+9.20%',  dy:'—',      sec:'汽车制造商'},
    {tk:'TSM',   nm:'台积电',                 pr:'178.90', ch:'+3.11%', dir:'up', mc:'9,280 亿',  npm:'+38.90%', dy:'+1.12%', sec:'半导体'},
    {tk:'AVGO',  nm:'博通',                  pr:'1782.50',ch:'+1.87%', dir:'up', mc:'8,210 亿',  npm:'+22.10%', dy:'+1.20%', sec:'AI 芯片'},
    {tk:'JPM',   nm:'摩根大通',                pr:'248.30', ch:'-0.18%', dir:'dn', mc:'7,020 亿',  npm:'+34.50%', dy:'+1.81%', sec:'多元化银行'},
    {tk:'V',     nm:'Visa',                  pr:'315.00', ch:'+0.92%', dir:'up', mc:'6,310 亿',  npm:'+54.20%', dy:'+0.74%', sec:'支付服务'},
    {tk:'WMT',   nm:'沃尔玛',                 pr:'97.40',  ch:'+0.45%', dir:'up', mc:'7,810 亿',  npm:'+3.40%',  dy:'+0.93%', sec:'零售'},
    {tk:'JNJ',   nm:'强生',                  pr:'162.00', ch:'-0.28%', dir:'dn', mc:'3,920 亿',  npm:'+24.10%', dy:'+3.05%', sec:'制药'},
    {tk:'XOM',   nm:'埃克森美孚',               pr:'118.20', ch:'+0.64%', dir:'up', mc:'5,200 亿',  npm:'+14.20%', dy:'+3.32%', sec:'能源'},
    {tk:'PG',    nm:'宝洁',                  pr:'168.50', ch:'+0.15%', dir:'up', mc:'3,980 亿',  npm:'+18.50%', dy:'+2.40%', sec:'日用消费品'},
    {tk:'KO',    nm:'可口可乐',                pr:'66.20',  ch:'+0.30%', dir:'up', mc:'2,860 亿',  npm:'+22.40%', dy:'+2.95%', sec:'饮料'},
    {tk:'BAC',   nm:'美国银行',                pr:'42.10',  ch:'-0.42%', dir:'dn', mc:'3,260 亿',  npm:'+27.80%', dy:'+2.28%', sec:'多元化银行'},
    {tk:'PFE',   nm:'辉瑞',                  pr:'29.40',  ch:'+0.85%', dir:'up', mc:'1,660 亿',  npm:'+12.50%', dy:'+5.75%', sec:'制药'},
    {tk:'CVX',   nm:'雪佛龙',                 pr:'162.40', ch:'+0.52%', dir:'up', mc:'2,890 亿',  npm:'+10.40%', dy:'+4.02%', sec:'能源'}
  ];

  let h = `<div class="sc-wrap">`;
  h += `<div class="sc-top">
    <div class="sc-top-l"><span class="sc-back-pill">‹ 筛选器</span></div>
    <div class="sc-top-r">
      <button class="sc-reset-btn">⟲ 重置</button>
      <button class="sc-save-btn">保存</button>
    </div>
  </div>`;

  h += `<div class="sc-cats">`;
  cats.forEach((c, i) => {
    if (i === 0) h += `<span class="sc-cat ${i===0?'':'dim'}">${c} <span class="sc-cat-n sc-cat-n-zero">0</span></span>`;
    else h += `<span class="sc-cat">${c}</span>`;
  });
  h += `</div>`;

  h += `<div class="sc-filters">`;
  filterSlots.forEach(f => {
    h += `<div class="sc-filter">
      <div class="sc-filter-l">${f.l}</div>
      <div class="sc-filter-v sc-filter-v-empty">${f.placeholder} <span class="sc-filter-chev">▾</span></div>
    </div>`;
  });
  h += `</div>`;

  h += `<div class="sc-resbar">
    <div class="sc-rescnt">
      <span class="sc-rescnt-l">符合条件的证券</span>
      <strong>134,453</strong>
      <span class="sc-rescnt-l">只</span>
      <span class="sc-state-tag sc-state-tag-default">全市场样本</span>
    </div>
    <div class="sc-pnl-link">${icon('chart-bar',12)} 盈亏计算</div>
  </div>`;

  h += `<div class="sc-subtabs">`;
  subTabs.forEach((t, i) => h += `<span class="sc-subtab ${i===0?'on':''}">${t}</span>`);
  h += `</div>`;

  h += `<table class="sc-tbl"><thead><tr><th scope="col" class="sc-th-chk"><input type="checkbox" /></th><th scope="col">股票代码</th><th scope="col">股票名称</th><th scope="col" class="sc-th-r">价格 ↕</th><th scope="col" class="sc-th-r">最新涨跌幅 ↕</th><th scope="col" class="sc-th-r">市值 ↓</th><th scope="col" class="sc-th-r">营业净利率 ↕</th><th scope="col" class="sc-th-r">股息率(TTM) ↕</th><th scope="col">行业</th></tr></thead><tbody>`;
  rows.forEach(r => {
    h += `<tr class="sc-tr">
      <td><input type="checkbox" /></td>
      <td class="sc-td-tk">${r.tk}</td>
      <td class="sc-td-nm">${r.nm}</td>
      <td class="sc-td-pr">${r.pr}</td>
      <td class="sc-td-${r.dir}">${r.ch}</td>
      <td class="sc-td-mn">${r.mc}</td>
      <td class="sc-td-up">${r.npm}</td>
      <td class="sc-td-up">${r.dy}</td>
      <td class="sc-td-sec">${r.sec}</td>
    </tr>`;
  });
  h += `</tbody></table>`;

  // 分页(默认全量,7000+ 页示意)
  h += `<div class="sc-pagi">
    <span class="sc-pagi-arrow">‹</span>
    <span class="sc-pagi-n on">1</span>
    <span class="sc-pagi-n">2</span>
    <span class="sc-pagi-n">3</span>
    <span class="sc-pagi-n">4</span>
    <span class="sc-pagi-n">5</span>
    <span class="sc-pagi-dots">···</span>
    <span class="sc-pagi-n">7,223</span>
    <span class="sc-pagi-arrow">›</span>
  </div>`;

  h += `</div>`;
  document.getElementById('v-dyn-screener').innerHTML = h;

  // 同时打开 detail 列(.dp)展示 Agent 动效卡(用户也可以等 AI 推荐)
  openScreenerAgentPanel();
}

/* 在 .dp 详情列里显示「股票选择 Agent 正在分析」侧栏卡 */
function openScreenerAgentPanel() {
  const dp = document.getElementById('dp');
  if (!dp) return;
  const inner = document.getElementById('dpInner');
  const footer = document.getElementById('dpFooter');
  inner.innerHTML = `
    <div class="sc-agent-wrap">
      <div class="sc-agent-bg"></div>
      <div class="sc-agent-icon-wrap"><div class="sc-agent-icon">✦</div></div>
      <div class="sc-agent-h">股票选择 Agent</div>
      <div class="sc-agent-st">正在为你分析筛选需求</div>
      <div class="sc-agent-d">完整的筛选条件 + 推荐股票列表将在 chat 中确认后,点击「在选股器中查看」加载到主区</div>
      <div class="sc-agent-steps">
        <div class="sc-agent-step done">
          <div class="sc-agent-step-n">①</div>
          <div class="sc-agent-step-body"><div class="sc-agent-step-t">理解意图</div><div class="sc-agent-step-s">已识别:中概股 / 潜力股</div></div>
        </div>
        <div class="sc-agent-step active">
          <div class="sc-agent-step-n">②</div>
          <div class="sc-agent-step-body"><div class="sc-agent-step-t">推荐筛选条件</div><div class="sc-agent-step-s">在 chat 中流式输出</div></div>
        </div>
        <div class="sc-agent-step">
          <div class="sc-agent-step-n">③</div>
          <div class="sc-agent-step-body"><div class="sc-agent-step-t">应用并展示</div><div class="sc-agent-step-s">点击 chat 中 CTA 触发</div></div>
        </div>
      </div>
      <div class="sc-agent-hint">→ 请关注右侧 chat,查看 AI 的选股推荐</div>
    </div>
  `;
  if (footer) footer.innerHTML = '';
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  // 不挤压主区(让主区保持原宽,detail 列附加在右侧)
  document.getElementById('dpBack')?.classList.remove('show');
  // 标记当前是 Agent 模式,closeDetail 时不要影响主区
  dp.dataset.mode = 'screener-agent';
}

/* 填充态:完整筛选器 + 表格(原 renderDynScreener 逻辑) */
function renderDynScreenerFilled() {
  const mode = (typeof screenerMode !== 'undefined') ? screenerMode : 'default';
  const isSimilar = /^similar-/.test(mode);
  const tkBase = isSimilar ? mode.replace('similar-','') : '';

  // 筛选条件:default(中概股潜力股 4 条件) vs similar(类同标的 4 条件:市场/行业/主题/市值)
  const filters = isSimilar ? [
    {l:'市场',         match:null,  value:'🇺🇸 美国'},
    {l:'行业',         match:null,  value:'半导体厂商'},
    {l:'主题和概念',    match:null,  value:'AI / AI 算力核心 / +2 ...'},
    {l:'市值',         match:'204', value:'1000 亿 ~ -- 亿'}
  ] : [
    {l:'市场',         match:null,  value:'🇺🇸 美国'},
    {l:'市值',         match:'2974',value:'10 亿 ~ -- 亿'},
    {l:'营业净利率',    match:'1781',value:'10 % ~ -- %'},
    {l:'股息率(TTM)', match:'924', value:'3 % ~ -- %'}
  ];
  // 分类标签:similar 模式 = 已应用 5 + 范围 3 + 公司规模与财务 1 + 公司增长 1
  const cats = isSimilar ? [
    {l:'已应用的筛选器', n:5, on:true},
    {l:'范围', n:3},
    {l:'公司规模与财务', n:1},
    {l:'公司经营效率'},
    {l:'公司增长', n:1},
    {l:'股东回报'},
    {l:'公司估值'},
    {l:'价格与成交'},
    {l:'综合技术指标'}
  ] : [
    {l:'已应用的筛选器', n:4, on:true},
    {l:'范围', n:1},
    {l:'公司规模与财务', n:1},
    {l:'公司经营效率', n:1, dim:true},
    {l:'公司增长'},
    {l:'股东回报', n:1},
    {l:'公司估值'},
    {l:'价格与成交'},
    {l:'综合技术指标'}
  ];
  const subTabs = ['概览','公司规模与财务','公司经营效率','公司增长','股东回报','公司估值','价格与成交'];
  // 行数据:similar 模式 = 14 只半导体大厂(对齐图二)
  const rows = isSimilar ? [
    {tk:'NVDA',  nm:'英伟达',                 pr:'209.25', ch:'-1.84%', dir:'dn', mc:'5.08 万亿', npm:'+55.60%', dy:'+0.03%', sec:'半导体厂商'},
    {tk:'TSM',   nm:'台积电',                 pr:'178.90', ch:'+3.11%', dir:'up', mc:'9280 亿',  npm:'+38.90%', dy:'+1.12%', sec:'半导体厂商'},
    {tk:'AVGO',  nm:'博通',                  pr:'1782.50',ch:'+1.87%', dir:'up', mc:'8210 亿',  npm:'+22.10%', dy:'+1.20%', sec:'半导体厂商'},
    {tk:'ASML',  nm:'阿斯麦',                 pr:'982.40', ch:'+0.65%', dir:'up', mc:'3850 亿',  npm:'+28.20%', dy:'+1.05%', sec:'半导体厂商'},
    {tk:'AMD',   nm:'超微半导体',               pr:'167.44', ch:'+2.91%', dir:'up', mc:'2680 亿',  npm:'+9.80%',  dy:'—',     sec:'半导体厂商'},
    {tk:'QCOM',  nm:'高通',                  pr:'168.20', ch:'+0.42%', dir:'up', mc:'1880 亿',  npm:'+26.40%', dy:'+1.85%', sec:'半导体厂商'},
    {tk:'TXN',   nm:'德州仪器',                pr:'212.60', ch:'-0.18%', dir:'dn', mc:'1940 亿',  npm:'+34.50%', dy:'+2.55%', sec:'半导体厂商'},
    {tk:'AMAT',  nm:'应用材料',                pr:'192.40', ch:'+1.22%', dir:'up', mc:'1620 亿',  npm:'+27.80%', dy:'+0.92%', sec:'半导体厂商'},
    {tk:'ARM',   nm:'安谋',                  pr:'138.50', ch:'+2.18%', dir:'up', mc:'1450 亿',  npm:'+22.00%', dy:'—',     sec:'半导体厂商'},
    {tk:'LRCX',  nm:'科林研发',                pr:'94.20',  ch:'+0.85%', dir:'up', mc:'1190 亿',  npm:'+25.60%', dy:'+1.10%', sec:'半导体厂商'},
    {tk:'KLAC',  nm:'KLA',                  pr:'784.60', ch:'-0.42%', dir:'dn', mc:'1050 亿',  npm:'+33.20%', dy:'+0.78%', sec:'半导体厂商'},
    {tk:'MU',    nm:'美光科技',                pr:'112.80', ch:'+3.45%', dir:'up', mc:'1240 亿',  npm:'+12.50%', dy:'+0.42%', sec:'半导体厂商'},
    {tk:'MRVL',  nm:'美满电子',                pr:'78.30',  ch:'+1.55%', dir:'up', mc:'670 亿',   npm:'+18.40%', dy:'+0.32%', sec:'半导体厂商'},
    {tk:'INTC',  nm:'英特尔',                 pr:'24.80',  ch:'-2.10%', dir:'dn', mc:'1060 亿',  npm:'-6.20%',  dy:'+2.02%', sec:'半导体厂商'}
  ] : [
    {tk:'RHHBY', nm:'罗氏(ADR)',          pr:'51.04',   ch:'-0.35%', dir:'dn', mc:'3249 亿', npm:'+20.33%', dy:'+3.02%', sec:'制药'},
    {tk:'TOWN',  nm:'Towne 银行',          pr:'35.94',   ch:'+0.50%', dir:'up', mc:'33.15 亿', npm:'+19.02%', dy:'+3.02%', sec:'区域性银行'},
    {tk:'EGP',   nm:'Eastgroup Prope...', pr:'202.22',  ch:'+1.03%', dir:'up', mc:'109 亿',  npm:'+39.79%', dy:'+3.02%', sec:'房地产投资信托(REITs)'},
    {tk:'PNC',   nm:'PNC 金融服务',         pr:'220.89',  ch:'-0.20%', dir:'dn', mc:'888 亿',  npm:'+31.31%', dy:'+3.03%', sec:'多元化银行'},
    {tk:'TMP',   nm:'Tompkins 金融',       pr:'85.57',   ch:'+1.64%', dir:'up', mc:'12.26 亿', npm:'+37.99%', dy:'+3.04%', sec:'区域性银行'},
    {tk:'WAFD',  nm:'华盛顿联邦储蓄',         pr:'35.58',   ch:'+0.23%', dir:'up', mc:'26.28 亿', npm:'+33.60%', dy:'+3.04%', sec:'区域性银行'},
    {tk:'ADT',   nm:'ADT',                pr:'7.19',    ch:'-0.42%', dir:'dn', mc:'57.59 亿', npm:'+11.62%', dy:'+3.05%', sec:'专业消费者服务'},
    {tk:'FBP',   nm:'First Bancorp',      pr:'24.18',   ch:'-0.25%', dir:'dn', mc:'38.19 亿', npm:'+38.22%', dy:'+3.05%', sec:'区域性银行'},
    {tk:'OGS',   nm:'One Gas',            pr:'88.08',   ch:'+0.43%', dir:'up', mc:'55.28 亿', npm:'+10.88%', dy:'+3.06%', sec:'燃气公司'},
    {tk:'HOMB',  nm:'Home Bancshare',     pr:'27.05',   ch:'+1.01%', dir:'up', mc:'53.11 亿', npm:'+44.52%', dy:'+3.06%', sec:'区域性银行'},
    {tk:'AVAL',  nm:'Grupo Aval Accio...',pr:'4.51',    ch:'-1.96%', dir:'dn', mc:'53.54 亿', npm:'+12.86%', dy:'+3.06%', sec:'多元化银行'},
    {tk:'TRNO',  nm:'Terreno Realty',     pr:'66.07',   ch:'+0.18%', dir:'up', mc:'70.20 亿', npm:'+84.59%', dy:'+3.06%', sec:'房地产投资信托(REITs)'},
    {tk:'IX',    nm:'欧力士',              pr:'32.51',   ch:'+3.04%', dir:'up', mc:'361 亿',  npm:'+15.00%', dy:'+3.07%', sec:'多元金融服务'},
    {tk:'HKXCY', nm:'香港交易所(ADR)',      pr:'51.98',   ch:'-0.73%', dir:'dn', mc:'657 亿',  npm:'+61.53%', dy:'+3.07%', sec:'金融交易所和数据'},
    {tk:'INDB',  nm:'美国独立银行',           pr:'78.77',   ch:'+0.86%', dir:'up', mc:'38.26 亿', npm:'+27.46%', dy:'+3.09%', sec:'区域性银行'},
    {tk:'AMADY', nm:'Amadeus IT Gro...', pr:'57.44',   ch:'-1.63%', dir:'dn', mc:'248 亿',  npm:'+20.50%', dy:'+3.10%', sec:'酒店、度假村和游轮'},
    {tk:'WEC',   nm:'WEC 能源',            pr:'115.78',  ch:'+0.57%', dir:'up', mc:'377 亿',  npm:'+15.89%', dy:'+3.10%', sec:'多种公用事业'},
    {tk:'FITB',  nm:'五三银行',             pr:'50.31',   ch:'-0.04%', dir:'dn', mc:'456 亿',  npm:'+24.13%', dy:'+3.12%', sec:'多元化银行'},
    {tk:'ED',    nm:'爱迪生联合电气',          pr:'109.62',  ch:'+0.73%', dir:'up', mc:'404 亿',  npm:'+11.96%', dy:'+3.12%', sec:'多种公用事业'},
    {tk:'TNRSF', nm:'泰纳瑞斯',             pr:'28.45',   ch:'-0.00%', dir:'dn', mc:'296 亿',  npm:'+16.13%', dy:'+3.13%', sec:'能源设备与服务'}
  ];

  let h = `<div class="sc-wrap">`;

  // 顶部:返回 + 重置/保存
  h += `<div class="sc-top">
    <div class="sc-top-l"><span class="sc-back-pill">‹ 筛选器</span></div>
    <div class="sc-top-r">
      <button class="sc-reset-btn">⟲ 重置</button>
      <button class="sc-save-btn ${screenerSaved?'saved':''}" id="scSaveBtn" onclick="saveScreenerFromMainArea()">${screenerSaved?'✓ 已保存':'保存'}</button>
    </div>
  </div>`;

  // 分类标签
  h += `<div class="sc-cats">`;
  cats.forEach(c => {
    h += `<span class="sc-cat ${c.on?'on':''} ${c.dim?'dim':''}">${c.l}${c.n?` <span class="sc-cat-n">${c.n}</span>`:''}</span>`;
  });
  h += `</div>`;

  // 4 个筛选条件
  h += `<div class="sc-filters">`;
  filters.forEach(f => {
    h += `<div class="sc-filter">
      <div class="sc-filter-l">${f.l}${f.match?` <span class="sc-filter-match">(匹配 <span class="sc-filter-match-n">${f.match}</span>)</span>`:''}</div>
      <div class="sc-filter-v">${f.value} <span class="sc-filter-chev">▾</span></div>
    </div>`;
  });
  h += `</div>`;

  // 结果数 + 盈亏计算
  const resCount = isSimilar ? 14 : 351;
  const resTagText = isSimilar ? `${icon('check',10)} 已应用 5 个筛选条件 · 类同 ${tkBase}` : `${icon('check',10)} 已应用 4 个筛选条件`;
  h += `<div class="sc-resbar">
    <div class="sc-rescnt">
      <span class="sc-rescnt-l">符合条件的证券</span>
      <strong>${resCount}</strong>
      <span class="sc-rescnt-l">只</span>
      <span class="sc-state-tag sc-state-tag-applied">${resTagText}</span>
    </div>
    <div class="sc-pnl-link">${icon('chart-bar',12)} 盈亏计算</div>
  </div>`;

  // 二级 tabs
  h += `<div class="sc-subtabs">`;
  subTabs.forEach((t, i) => h += `<span class="sc-subtab ${i===0?'on':''}">${t}</span>`);
  h += `</div>`;

  // 表格
  h += `<table class="sc-tbl"><thead><tr><th scope="col" class="sc-th-chk"><input type="checkbox" /></th><th scope="col">股票代码</th><th scope="col">股票名称</th><th scope="col" class="sc-th-r">价格 ↕</th><th scope="col" class="sc-th-r">最新涨跌幅 ↕</th><th scope="col" class="sc-th-r">市值 ↕</th><th scope="col" class="sc-th-r">营业净利率 ↕</th><th scope="col" class="sc-th-r">股息率(TTM) ↑</th><th scope="col">行业</th></tr></thead><tbody>`;
  rows.forEach(r => {
    h += `<tr class="sc-tr">
      <td><input type="checkbox" /></td>
      <td class="sc-td-tk">${r.tk}</td>
      <td class="sc-td-nm">${r.nm}</td>
      <td class="sc-td-pr">${r.pr}</td>
      <td class="sc-td-${r.dir}">${r.ch}</td>
      <td class="sc-td-mn">${r.mc}</td>
      <td class="sc-td-up">${r.npm}</td>
      <td class="sc-td-up">${r.dy}</td>
      <td class="sc-td-sec">${r.sec}</td>
    </tr>`;
  });
  h += `</tbody></table>`;

  // 分页(基于结果总数)
  if (isSimilar) {
    h += `<div class="sc-pagi"><span class="sc-pagi-arrow">‹</span><span class="sc-pagi-n on">1</span><span class="sc-pagi-arrow">›</span></div>`;
  } else {
    h += `<div class="sc-pagi"><span class="sc-pagi-arrow">‹</span><span class="sc-pagi-n on">1</span><span class="sc-pagi-n">2</span><span class="sc-pagi-n">3</span><span class="sc-pagi-n">4</span><span class="sc-pagi-n">5</span><span class="sc-pagi-dots">···</span><span class="sc-pagi-n">18</span><span class="sc-pagi-arrow">›</span></div>`;
  }

  h += `</div>`;
  document.getElementById('v-dyn-screener').innerHTML = h;
}
