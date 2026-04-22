/* ============================================================
   dynamic.js — 5 类动态视图(风险审视/对比决策/策略构建/标的研究/归因诊断)
                + 进入/退出 + 风险仪表盘
   依赖: data.js (S, holdings, ddb)
   依赖: home.js、detail.js(inline onclick 会用到)
   ============================================================ */

/* 进入动态视图 */
function enterDynamic(viewId, intent) {
  dynamic = true;
  document.querySelectorAll('.vw').forEach(el => el.classList.remove('on'));
  document.getElementById('v-' + viewId).classList.add('on');
  document.getElementById('dynHeader').classList.remove('hide');
  document.getElementById('dynTitle').textContent = intent;
  document.getElementById('dynSub').textContent = '实时跟随输入重组 · 清空输入框可退出';
  renderDynamicView(viewId);
  document.getElementById('mc').scrollTop = 0;
}

/* 分发到具体渲染函数 */
function renderDynamicView(viewId) {
  if (viewId === 'dyn-risk') renderDynRisk();
  else if (viewId === 'dyn-compare') renderDynCompare();
  else if (viewId === 'dyn-tradeplan') renderDynTradePlan();
  else if (viewId === 'dyn-research') renderDynResearch();
  else if (viewId === 'dyn-attribution') renderDynAttribution();
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
  h += `<div class="dp-panel area-overview fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--pbg);color:var(--p)">💼</div><div class="dp-panel-t">持仓总览</div><span class="dp-panel-s">实时</span></div>
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
  h += `<div class="dp-panel area-allocation fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">📊</div><div class="dp-panel-t">行业分布</div></div><div class="bar-list">`;
  sectorArr.forEach(([k, v], i) => h += `<div class="bar-row"><span class="bar-tk" style="width:60px">${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v}%;background:${colors[i%colors.length]}"></div></div><span class="bar-pct">${v.toFixed(1)}%</span></div>`);
  h += `</div></div>`;
  h += `<div class="dp-panel area-concentration fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">⚡</div><div class="dp-panel-t">集中度 · Top 5</div><span class="dp-panel-s">点击查看详情</span></div><div class="bar-list">`;
  holdings.slice().sort((a, b) => b.pct - a.pct).slice(0, 5).forEach(h2 => {
    const color = h2.pct > 15 ? 'var(--r)' : h2.pct > 12 ? 'var(--o)' : 'var(--g)';
    h += `<div class="bar-row"><span class="bar-tk" onclick="openDetail('${h2.tk}','')">${h2.tk}</span><div class="bar-track"><div class="bar-fill" style="width:${h2.pct*4}%;background:${color}"></div></div><span class="bar-pct">${h2.pct.toFixed(1)}%</span></div>`;
  });
  h += `</div></div>`;
  h += `<div class="dp-panel area-holdings fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">📋</div><div class="dp-panel-t">持仓明细</div><span class="dp-panel-s">${holdings.length} 支 · 点击行查看详情</span></div>
    <table class="tbl-dense"><thead><tr><th>标的</th><th>行业</th><th>权重</th><th>Beta</th><th>持仓</th><th>成本</th><th>现价</th><th>盈亏</th><th>风险</th></tr></thead><tbody>`;
  holdings.slice().sort((a, b) => b.pct - a.pct).forEach(h2 => {
    const pnl = ((h2.price - h2.cost) * h2.shares).toFixed(0);
    const pnlP = pnl >= 0;
    const rMap = {r:'高',o:'中',g:'低'};
    h += `<tr onclick="openDetail('${h2.tk}','')"><td class="tk">${h2.tk}</td><td style="color:var(--ts)">${h2.sector}</td><td class="mn">${h2.pct.toFixed(1)}%</td><td class="mn">${h2.beta}</td><td class="mn">${h2.shares}</td><td class="mn">$${h2.cost.toFixed(2)}</td><td class="mn">$${h2.price.toFixed(2)}</td><td class="mn ${pnlP?'positive':'negative'}">${pnlP?'+':''}$${pnl}</td><td><span class="pill ${h2.risk}">${rMap[h2.risk]}</span></td></tr>`;
  });
  h += `</tbody></table></div>`;
  h += `<div class="dp-panel area-orders fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--cbg);color:var(--c)">📎</div><div class="dp-panel-t">相关订单</div></div>
    <div class="inline-list">
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">TSLA 限价买单 $235 · 20 股</div><div class="inline-item-s">未成交 · 如成交将 +4% 消费仓位</div></div></div>
      ${sc==='down'?`<div class="inline-item warn"><div class="inline-item-b"><div class="inline-item-t">AAPL 止损单未创建</div><div class="inline-item-s">预警线已触及</div></div></div>`:''}
    </div>
  </div>`;
  h += `<div class="dp-panel area-strategies fi fi-d4"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">🧠</div><div class="dp-panel-t">相关策略</div></div>
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
  h += `<div class="dp-panel area-ai fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 观点</div></div>
    <div class="ai-para">NVDA 在数据中心 AI 芯片占绝对领导地位。AMD MI400 追平 H200 后,差距在收窄。</div>
    <div class="ai-para">对你(已持 NVDA <strong>18%</strong>):增加 AMD 敞口可分散集中度。</div>
  </div>`;
  h += `<div class="area-actions fi fi-d2"><div class="action-bar"><button class="action-btn primary">加 AMD 到自选</button><button class="action-btn" onclick="tryIntent('帮我建一个 AMD Trade Plan')">建 AMD Trade Plan</button></div></div>`;
  h += `</div>`;
  document.getElementById('v-dyn-compare').innerHTML = h;
}

/* ============ 策略构建 ============ */
function renderDynTradePlan() {
  let h = `<div class="dyn-grid tradeplan">`;
  h += `<div class="dp-panel area-plan fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">📋</div><div class="dp-panel-t">NVDA 看涨期权 · 草案</div></div>
    <div class="kpi"><div><div class="kpi-l">策略</div><div class="kpi-v" style="font-size:13px">Long Call</div></div><div><div class="kpi-l">行权价</div><div class="kpi-v">$145</div></div><div><div class="kpi-l">到期</div><div class="kpi-v" style="font-size:13px">05.16</div></div></div>
  </div>`;
  h += `<div class="dp-panel area-summary fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-t">收益结构</div></div>
    <div class="cmp-row"><span class="cmp-l">期权金</span><span class="cmp-v">$850</span></div>
    <div class="cmp-row"><span class="cmp-l">盈亏平衡</span><span class="cmp-v">$147.50</span></div>
    <div class="cmp-row"><span class="cmp-l">最大亏损</span><span class="cmp-v negative">-$850</span></div>
    <div class="cmp-row"><span class="cmp-l">占组合</span><span class="cmp-v">1.8%</span></div>
    <div class="cmp-row"><span class="cmp-l">IRR</span><span class="cmp-v positive">42%</span></div>
  </div>`;
  h += `<div class="dp-panel area-reasoning fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 推理</div></div>
    <div class="ai-para">NVDA 突破 30 日高点,<strong>技术面确认向上</strong>。结合 TSM 扩产和美联储偏鸽,30 天内上探 $150-155 概率偏高。</div>
    <div class="ai-para">建议用<strong>期权而非加仓现货</strong>:你已持有 NVDA 18%,加仓会推高集中度到 22%+。</div>
  </div>`;
  h += `<div class="area-actions fi fi-d3"><div class="action-bar"><button class="action-btn primary">下单这个 Plan</button><button class="action-btn">调整参数</button></div></div>`;
  h += `</div>`;
  document.getElementById('v-dyn-tradeplan').innerHTML = h;
}

/* ============ 标的研究 ============ */
function renderDynResearch() {
  const tk = 'NVDA', d = ddb[tk];
  const held = holdings.find(h2 => h2.tk === tk);
  let h = `<div class="dyn-grid research">`;
  // Row 1: 标的头部 + AI 评级
  h += `<div class="dp-panel fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">📈</div><div class="dp-panel-t">${d.tk} · ${d.nm}</div><span class="dp-panel-s ${d.p?'positive':'negative'}">${d.pct}</span></div>
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px"><span style="font-family:var(--m);font-size:22px;font-weight:700">$${d.pr}</span><span class="${d.p?'positive':'negative'}" style="font-family:var(--m);font-size:11px">${d.ch}</span></div>
    <div class="dt-chart"><canvas id="rc1"></canvas></div>
  </div>`;
  h += `<div class="dp-panel fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 评级</div></div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span class="pill g" style="font-size:10px;padding:3px 10px">追涨</span><span style="font-size:10px;color:var(--ts)">Strong Bullish · 87/100</span></div>
    <div class="ai-para">技术面突破 30 日高点确认上升趋势。TSM 扩产催化 + 美联储偏鸽构成双重利好。建议操作位 <strong>$138-142</strong>。</div>
  </div>`;
  // Row 2: 基本面 + 技术面
  h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--bbg);color:var(--b)">📊</div><div class="dp-panel-t">基本面摘要</div></div>
    <div class="cmp-row"><span class="cmp-l">P/E</span><span class="cmp-v">${d.pe}</span></div>
    <div class="cmp-row"><span class="cmp-l">市值</span><span class="cmp-v">${d.cap}</span></div>
    <div class="cmp-row"><span class="cmp-l">营收增速</span><span class="cmp-v positive">+94% YoY</span></div>
    <div class="cmp-row"><span class="cmp-l">毛利率</span><span class="cmp-v">76.2%</span></div>
    <div class="cmp-row"><span class="cmp-l">自由现金流</span><span class="cmp-v">$18.5B</span></div>
  </div>`;
  h += `<div class="dp-panel fi fi-d2"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--pbg);color:var(--p)">📉</div><div class="dp-panel-t">技术面摘要</div></div>
    <div class="cmp-row"><span class="cmp-l">支撑位</span><span class="cmp-v">$134.50</span></div>
    <div class="cmp-row"><span class="cmp-l">阻力位</span><span class="cmp-v">$148.00</span></div>
    <div class="cmp-row"><span class="cmp-l">均线状态</span><span class="cmp-v positive">MA20↑ MA60↑</span></div>
    <div class="cmp-row"><span class="cmp-l">RSI (14)</span><span class="cmp-v" style="color:var(--o)">68.4</span></div>
    <div class="cmp-row"><span class="cmp-l">成交量</span><span class="cmp-v positive">放量突破</span></div>
  </div>`;
  // Row 3: 相关事件
  h += `<div class="dp-panel fi fi-d3" style="grid-column:1/-1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">⚡</div><div class="dp-panel-t">相关事件</div><span class="dp-panel-s">来自时间线</span></div>
    <div class="inline-list">
      <div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">NVDA 突破 30 日高点 $140</div><div class="inline-item-s">异动 · 12 分钟前 · 持有 18%</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">TSM 宣布 3nm 产能扩张</div><div class="inline-item-s">催化 · 48 分钟前 · NVDA 为核心客户</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">美联储偏鸽信号</div><div class="inline-item-s">宏观 · 1 小时前 · 科技股利好</div></div></div>
    </div>
  </div>`;
  // Row 4: 持仓情况 + 策略
  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--gbg);color:var(--g)">💼</div><div class="dp-panel-t">你的持仓</div></div>`;
  if (held) {
    const pnl = ((held.price - held.cost) * held.shares).toFixed(0);
    h += `<div class="cmp-row"><span class="cmp-l">持仓数</span><span class="cmp-v">${held.shares} 股</span></div>
    <div class="cmp-row"><span class="cmp-l">成本</span><span class="cmp-v">$${held.cost.toFixed(2)}</span></div>
    <div class="cmp-row"><span class="cmp-l">盈亏</span><span class="cmp-v positive">+$${pnl}</span></div>
    <div class="cmp-row"><span class="cmp-l">占比</span><span class="cmp-v">${held.pct}%</span></div>`;
  } else {
    h += `<div style="font-size:10px;color:var(--tm);padding:8px 0">未持有 · 已在自选中</div>`;
  }
  h += `</div>`;
  h += `<div class="dp-panel fi fi-d3"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">🧠</div><div class="dp-panel-t">相关策略</div></div>
    <div class="inline-list">
      <div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">NVDA 看涨期权策略</div><div class="inline-item-s">AI 评估中 · 进度 68%</div></div></div>
    </div>
  </div>`;
  h += `</div>`;
  // AI 深度 + 动作
  h += `<div style="padding:0 18px 14px"><div class="dp-panel fi fi-d4" style="margin-bottom:10px"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 深度分析</div></div>
    <div class="ai-para"><strong>综合评级:追涨(87/100)。</strong>数据中心 AI 芯片市占率 >85%,Blackwell 架构出货超预期。</div>
    <div class="ai-para">营收增速 94% YoY 远超行业均值。毛利率 76% 反映定价权。但 P/E 68x 意味着已充分定价短期增长,需要关注估值回调风险。</div>
    <div class="ai-para">你已持有 <strong>18%</strong>(组合最大持仓)。建议用期权替代现货加仓,控制集中度。</div>
  </div>
  <div class="action-bar">
    <button class="action-btn primary" onclick="tryIntent('帮我建一个 NVDA Trade Plan')">建 Trade Plan</button>
    <button class="action-btn" onclick="tryIntent('对比 NVDA 和 AMD')">和 AMD 对比</button>
    <button class="action-btn">设价格提醒</button>
    <button class="action-btn">查看回测</button>
  </div></div>`;
  document.getElementById('v-dyn-research').innerHTML = h;
  // 画走势图
  setTimeout(() => {
    const c = document.getElementById('rc1');
    if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, ht = c.height = c.parentElement.clientHeight;
    const pts = []; let y = ht * .5;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - .42) * 2.5;
      y = Math.max(ht * .1, Math.min(ht * .9, y));
      pts.push({x, y});
    }
    const g = ctx.createLinearGradient(0, 0, 0, ht);
    g.addColorStop(0, 'rgba(0,212,161,.12)'); g.addColorStop(1, 'rgba(0,212,161,0)');
    ctx.beginPath(); ctx.moveTo(0, ht);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, ht); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(0,212,161,.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  }, 350);
}

/* ============ 归因诊断 ============ */
function renderDynAttribution() {
  const s = S[sc];
  const losses = [
    {tk:'NVDA',chg:'-3.41%',loss:'-$614',pct:'47%',weight:'18%'},
    {tk:'AAPL',chg:'-2.10%',loss:'-$286',pct:'22%',weight:'14%'},
    {tk:'GOOG',chg:'-1.88%',loss:'-$94',pct:'7%',weight:'13%'},
    {tk:'META',chg:'-1.62%',loss:'-$83',pct:'6%',weight:'11%'},
    {tk:'TSM',chg:'-2.80%',loss:'-$75',pct:'6%',weight:'8%'},
    {tk:'AMD',chg:'-3.20%',loss:'-$64',pct:'5%',weight:'12%'},
    {tk:'MSFT',chg:'-0.70%',loss:'-$45',pct:'3%',weight:'14%'},
    {tk:'BRK.B',chg:'-0.30%',loss:'-$24',pct:'2%',weight:'10%'}
  ];
  let h = `<div class="dyn-grid attribution">`;
  // Row 1: 瀑布图 + 宏观事件
  h += `<div class="dp-panel fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--rbg);color:var(--r)">📉</div><div class="dp-panel-t">今日盈亏归因</div><span class="dp-panel-s negative">${s.pnlToday}</span></div>
    <div class="bar-list" style="margin-top:6px">`;
  losses.forEach(l => {
    const barW = parseInt(l.pct);
    h += `<div class="bar-row"><span class="bar-tk" onclick="openDetail('${l.tk}','')">${l.tk}</span><div class="bar-track"><div class="bar-fill" style="width:${barW*2.5}%;background:var(--r)"></div></div><span class="bar-pct negative">${l.loss}</span></div>`;
  });
  h += `</div></div>`;
  h += `<div class="dp-panel fi fi-d1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--obg);color:var(--o)">🌍</div><div class="dp-panel-t">宏观驱动因素</div></div>
    <div class="inline-list">
      <div class="inline-item warn"><div class="inline-item-b"><div class="inline-item-t">美债 10Y 收益率急升至 4.82%</div><div class="inline-item-s">创年内新高 · 科技股承压主因</div></div></div>
      <div class="inline-item run"><div class="inline-item-b"><div class="inline-item-t">美元指数 DXY 走强 +0.8%</div><div class="inline-item-s">新兴市场资金回流美债</div></div></div>
      <div class="inline-item ok"><div class="inline-item-b"><div class="inline-item-t">CPI 数据高于预期 3.5%</div><div class="inline-item-s">降息预期推迟至 Q4</div></div></div>
    </div>
  </div>`;
  // Row 2: 受影响持仓表
  h += `<div class="dp-panel fi fi-d2" style="grid-column:1/-1"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--rbg);color:var(--r)">📋</div><div class="dp-panel-t">受影响持仓</div><span class="dp-panel-s">按亏损金额排序 · 点击行查看详情</span></div>
    <table class="tbl-dense"><thead><tr><th>标的</th><th>今日跌幅</th><th>亏损金额</th><th>占总亏损</th><th>持仓权重</th></tr></thead><tbody>`;
  losses.forEach(l => {
    h += `<tr onclick="openDetail('${l.tk}','')"><td class="tk">${l.tk}</td><td class="mn negative">${l.chg}</td><td class="mn negative">${l.loss}</td><td class="mn">${l.pct}</td><td class="mn">${l.weight}</td></tr>`;
  });
  h += `</tbody></table></div>`;
  h += `</div>`;
  // AI 归因 + 动作
  h += `<div style="padding:0 18px 14px"><div class="dp-panel fi fi-d3" style="margin-bottom:10px"><div class="dp-panel-hd"><div class="dp-panel-icon" style="background:var(--aibg);color:var(--ai)">AI</div><div class="dp-panel-t">AI 归因分析</div></div>
    <div class="ai-para"><strong>系统性因素贡献约 62%。</strong>美债收益率急升 + CPI 超预期导致全市场科技股承压。你的组合 Beta 1.42,跌幅略大于大盘。</div>
    <div class="ai-para"><strong>个股因素贡献约 38%。</strong>NVDA 和 AMD 因为高 Beta(1.72 / 1.88)放大了跌幅。AAPL 跌破 $200 心理关口触发止损盘。</div>
    <div class="ai-para">历史类似场景(美债急升 >20bp):平均回撤 <strong>3-5%</strong>,恢复周期 <strong>5-8 个交易日</strong>。当前跌幅在正常范围内。</div>
  </div>
  <div class="action-bar">
    <button class="action-btn primary" onclick="tryIntent('分析我的持仓风险')">分析持仓风险</button>
    <button class="action-btn" onclick="tryIntent('AAPL 止损怎么设')">建 AAPL 止损 Plan</button>
    <button class="action-btn">哪些仓位应该减</button>
    <button class="action-btn">下跌是短期的吗</button>
  </div></div>`;
  document.getElementById('v-dyn-attribution').innerHTML = h;
}
