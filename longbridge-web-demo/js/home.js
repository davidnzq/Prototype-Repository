/* ============================================================
   home.js — 顶部指数条 + 首页内容
            (AI 工作台 inline / Hero 双栏 / chips / 时间线 / Signal 富卡 / Widget)
   v18: Hero 改为双栏(左 总资产 / 右 收益率趋势) + drawPnlTrendChart
        tl-grid 混合布局(signal 富卡占 3 行)
   依赖: data.js (S / awState / knownTickers / watchlistData / portfolioData / signalDB)
   依赖: detail.js (openDetail, openSignalDetail, dynamicAWCards)
   依赖: sidebar.js (awCardH)
   ============================================================ */

/* 已读事件 localStorage 读写 */
function getReadSet() {
  try { return new Set(JSON.parse(localStorage.getItem('lb_read_events') || '[]')); }
  catch (e) { return new Set(); }
}
function persistReadId(id) {
  if (!id) return;
  const set = getReadSet(); set.add(id);
  localStorage.setItem('lb_read_events', JSON.stringify([...set]));
}

/* 通用 sparkline */
function spark(dir, w = 26, h = 14) {
  const pts = dir === 'down'
    ? [[0,3],[6,6],[12,4],[18,8],[24,11]]
    : [[0,11],[6,8],[12,10],[18,5],[24,2]];
  const color = dir === 'down' ? '#EF4444' : '#00ADA2';
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 26 14"><path d="${d}" stroke="${color}" stroke-width="1.2" fill="none"/></svg>`;
}

/* 顶部指数条 */
function renderIndices() {
  const s = S[sc], el = document.getElementById('tnIndices');
  let h = '';
  s.indices.forEach(idx => {
    h += `<div class="tn-index ${idx.dir === 'up' ? 'up' : ''}"><div class="tn-index-icon"></div><span class="tn-index-name">${idx.name}</span><span class="tn-index-value">${idx.val}</span><span class="tn-index-arrow">${idx.dir === 'up' ? '▲' : '▼'}</span>${spark(idx.dir)}<span class="tn-index-change">${idx.chg} ${idx.pct}</span></div>`;
  });
  el.innerHTML = h;
}

/* 首页渲染 */
function renderHome() {
  const s = S[sc];
  let h = '';
  // AI Workbench inline (ABOVE hero)
  // 视觉分组三类:① 已激活(绿) ② AI 在做(进行中)③ 需关注(警告)
  const awP = awState[sc];
  const groupActive = [];   // 已激活策略(activating + run)
  const groupWorking = [];  // AI 在做的事 / 长期任务 / 长期订单
  const groupAlert = [];    // chips:需要用户决策的预警

  // 已激活(Move forward 触发的策略,最左)
  if (typeof activeTradePlanCards !== 'undefined') activeTradePlanCards.forEach(c => groupActive.push(c));

  // 静态 chips(预警类,需用户处理)
  if (s.chips && s.chips.length) {
    s.chips.forEach(c => {
      const id = 'static-' + (c.t + '-' + c.n).replace(/\s+/g,'');
      const tkMatch = c.n.match(/[A-Z]{2,5}/);
      const tk = tkMatch ? tkMatch[0] : '';
      const isTp = c.t.includes('Trade Plan');
      const kind = isTp ? 'static-tp' : 'static-signal';
      groupAlert.push({
        status:'warn',
        title:c.t+' · '+c.n,
        desc:'需要您关注',
        dismissId: id,
        cardClick: `clickChip('${kind}','${tk}')`,
        actions:[
          {label:'查看', onclick:`clickChip('${kind}','${tk}')`},
          {label:'稍后', onclick:`dismissChip('${id}')`}
        ]
      });
    });
  }
  // 动态 chips(buildTradePlan / Signal 30s 等运行时推送)
  if (typeof dynamicChips !== 'undefined' && dynamicChips.length) {
    dynamicChips.forEach(c => {
      groupAlert.push({
        status: c.status || 'warn',
        title: c.t + (c.n ? ' · ' + c.n : ''),
        desc: c.desc || '需要您关注',
        dismissId: c.id,
        cardClick: `clickChip('${c.kind}','${c.tk||''}')`,
        actions:[
          {label:'查看', onclick:`clickChip('${c.kind}','${c.tk||''}')`},
          {label:'忽略', onclick:`dismissChip('${c.id}')`}
        ]
      });
    });
  }
  // AI 在做的事:dynamicAWCards(进度型) + tasks(长期任务) + 后台运行的策略 + orders
  if (typeof dynamicAWCards !== 'undefined') dynamicAWCards.forEach(c => groupWorking.push(c));
  awP.tasks.forEach(c => groupWorking.push(c));
  awP.strategies.forEach(c => groupWorking.push(c));
  awP.orders.forEach(c => groupWorking.push(c));

  const totalAW = groupActive.length + groupWorking.length + groupAlert.length;
  if (totalAW) {
    h += `<div class="aw-inline"><div class="aw-inline-hd"><span class="aw-inline-t">AI 工作台</span><span class="aw-inline-count">${totalAW} 项</span></div>`;
    // ① 需关注(用户必须看的,放最上)
    if (groupAlert.length) {
      h += `<div class="aw-grp aw-grp-alert"><div class="aw-grp-hd"><span class="aw-grp-dot"></span><span class="aw-grp-t">需关注</span><span class="aw-grp-c">${groupAlert.length}</span><span class="aw-grp-s">需要您决策</span></div><div class="aw-inline-grid">`;
      groupAlert.forEach(item => h += awCardH(item));
      h += `</div></div>`;
    }
    // ② 已激活的策略
    if (groupActive.length) {
      h += `<div class="aw-grp aw-grp-active"><div class="aw-grp-hd"><span class="aw-grp-dot"></span><span class="aw-grp-t">已激活</span><span class="aw-grp-c">${groupActive.length}</span><span class="aw-grp-s">监控中,自动执行</span></div><div class="aw-inline-grid">`;
      groupActive.forEach(item => h += awCardH(item));
      h += `</div></div>`;
    }
    // ③ AI 在做的事
    if (groupWorking.length) {
      h += `<div class="aw-grp aw-grp-working"><div class="aw-grp-hd"><span class="aw-grp-dot"></span><span class="aw-grp-t">AI 在做</span><span class="aw-grp-c">${groupWorking.length}</span><span class="aw-grp-s">长期任务 · 后台策略 · 挂单</span></div><div class="aw-inline-grid">`;
      groupWorking.forEach(item => h += awCardH(item));
      h += `</div></div>`;
    }
    h += `</div>`;
  }

  // Timeline
  const readSet = getReadSet();
  const isRead = e => e.id && readSet.has(e.id);
  const freshUr = s.ur.filter(e => !isRead(e));
  const demotedUr = s.ur.filter(e => isRead(e));
  const freshCount = freshUr.length;
  h += `<div class="tl-hd"><span class="tl-t">变化事件</span>${freshCount?`<span class="tl-c">${freshCount} 条新变化 · 点击蓝色 ticker 查看详情</span>`:''}</div>`;
  document.getElementById('badge').textContent = freshCount || '';
  document.getElementById('badge').style.display = freshCount ? 'flex' : 'none';
  // Sort: signals first (big cards), then normal events
  const sigEvents = freshUr.filter(e => e.sig);
  const normalUr = freshUr.filter(e => !e.sig);
  h += `<div class="tl-grid">`;
  // sig 富卡片仍独立铺开
  sigEvents.forEach(e => h += evH(e, 'ur'));
  // 普通事件卡按组合并到 .sc-group 容器(统一边框 + 行级分隔)
  if (normalUr.length) {
    h += `<div class="sc-group">`;
    normalUr.forEach(e => h += evH(e, 'ur'));
    h += `</div>`;
  }
  if (s.calm && freshCount <= 1) h += `<div style="padding:10px 12px;margin:4px 0;border-radius:8px;background:rgba(6,182,212,.08);border:1px solid rgba(6,182,212,.12);font-size:11px;color:#06B6D4;grid-column:1/-1">过去 ${s.lv} 内无重大变化</div>`;
  if (s.lv) h += `<div class="tl-div"><div class="tl-div-l"></div><span class="tl-div-t">上次访问 · ${s.lv}</span></div>`;
  if (demotedUr.length || s.rd.length) {
    h += `<div class="sc-group sc-group-rd">`;
    demotedUr.forEach(e => h += evH(e, 'rd'));
    s.rd.forEach(e => h += evH(e, 'rd'));
    h += `</div>`;
  }
  h += `</div>`;

  // Widget 卡片
  h += `<div class="wg-hd-row"><span class="wg-hd">快速入口</span><span class="wg-hd-s">点击卡片行查看详情</span></div>`;
  h += `<div class="wg-grid">`;

  // 总资产
  if (s.pf) {
    h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--gbg);color:var(--g)">${icon('wallet',14)}</div><div class="wg-title">总资产</div><span class="wg-summary">CNH ▾</span></div>`;
    h += `<div class="wg-asset-body">
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px"><span class="wg-asset-total">183,440.88</span><span class="wg-asset-eye" title="切换可见">${icon('eye',12)}</span></div>
      <div class="wg-asset-stats">
        <div><div class="wg-asset-stat-l">当日盈亏</div><div class="wg-asset-stat-v positive">+562.83</div></div>
        <div><div class="wg-asset-stat-l">持仓市值</div><div class="wg-asset-stat-v">180,950.48</div></div>
        <div><div class="wg-asset-stat-l">持仓总盈亏</div><div class="wg-asset-stat-v positive">+43,396.96</div></div>
      </div>
      <div class="wg-asset-safety"><span class="wg-asset-safety-icon">${icon('shield-check',10)}</span><span>安全</span><span class="wg-asset-safety-link">融资状态 ›</span></div>
    </div></div>`;
  }

  // 盈亏分析 (收益率趋势)
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:${s.pf&&s.pf.p?'var(--gbg)':'var(--rbg)'};color:${s.pf&&s.pf.p?'var(--g)':'var(--r)'}">${icon(s.pf&&s.pf.p?'trending-up':'trending-down',14)}</div><div class="wg-title">盈亏分析</div><span class="wg-summary">本年</span></div>`;
  h += `<div class="wg-pnl-body">
    <div class="wg-pnl-num">
      <div class="hm-pnl-val positive">+257.95</div>
      <div class="hm-pnl-rate positive">0.14%</div>
      <div class="hm-pnl-bench"><span class="hm-pnl-bench-dot"></span><span>跑输 · 道琼斯</span><span class="negative">-2.83%</span></div>
    </div>
    <div class="wg-pnl-chart-wrap"><canvas id="pnlTrendChart"></canvas></div>
  </div>
  <div class="wg-pnl-stats">
    <div><div class="wg-pnl-stat-l">今日</div><div class="wg-pnl-stat-v ${s.pf&&s.pf.p?'positive':'negative'}">${s.pnlToday}</div></div>
    <div><div class="wg-pnl-stat-l">本周</div><div class="wg-pnl-stat-v ${s.pnlWeek.startsWith('+')?'positive':'negative'}">${s.pnlWeek}</div></div>
    <div><div class="wg-pnl-stat-l">本月</div><div class="wg-pnl-stat-v ${s.pnlMonth.startsWith('+')?'positive':'negative'}">${s.pnlMonth}</div></div>
  </div></div>`;

  // Watchlist
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--gbg);color:var(--g)">${icon('star',14)}</div><div class="wg-title">Watchlist</div><button class="wg-more-btn" onclick="go('watchlist')">查看全部 →</button></div><div class="wg-list">`;
  watchlistData.slice(0, 5).forEach(item => {
    const chgCls = item.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-row" onclick="openDetail('${item.tk}','')"><span class="wg-row-tk">${item.tk}</span><span class="wg-row-nm">${item.nm}</span><span class="wg-row-pr">$${item.pr}</span><span class="wg-row-chg ${chgCls}">${item.chg}</span></div>`;
  });
  h += `</div></div>`;

  // Portfolio
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--pbg);color:var(--p)">${icon('briefcase',14)}</div><div class="wg-title">Portfolio</div><button class="wg-more-btn" onclick="go('portfolio')">查看全部 →</button></div><div class="wg-list">`;
  portfolioData.slice(0, 5).forEach(item => {
    const chgCls = item.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-row" onclick="openDetail('${item.tk}','')"><span class="wg-row-tk">${item.tk}</span><span class="wg-row-nm">${item.nm}</span><span class="wg-row-pr">${item.pr}</span><span class="wg-row-chg ${chgCls}">${item.pnl}</span></div>`;
  });
  h += `</div></div>`;

  // Market
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--bbg);color:var(--b)">${icon('chart-bar',14)}</div><div class="wg-title">Market</div><button class="wg-more-btn" onclick="go('market')">进入市场 →</button></div><div class="wg-list">`;
  s.mktIdx.forEach(idx => {
    const chgCls = idx.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-index-row"><span class="wg-index-icon-bar" style="background:${idx.color}"></span><span class="wg-index-nm">${idx.name}</span><span class="wg-index-val">${idx.val}</span>${spark(idx.dir, 20, 10)}<span class="wg-index-chg ${chgCls}">${idx.chg}</span></div>`;
  });
  h += `</div></div>`;

  // Rankings (Top gainers / losers)
  const rankAll = [...watchlistData, ...portfolioData.map(p => ({tk:p.tk,nm:p.nm,pr:p.pr.replace('$',''),chg:p.pnl,dir:p.dir}))];
  const rankMap = {};
  rankAll.forEach(r => { if (!rankMap[r.tk]) rankMap[r.tk] = r; });
  const ranked = Object.values(rankMap).filter(r => r.chg && r.chg.includes('%'));
  const gainers = ranked.filter(r => r.dir === 'up').sort((a, b) => parseFloat(b.chg) - parseFloat(a.chg)).slice(0, 3);
  const losers = ranked.filter(r => r.dir === 'down').sort((a, b) => parseFloat(a.chg) - parseFloat(b.chg)).slice(0, 3);
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--obg);color:var(--o)">${icon('trophy',14)}</div><div class="wg-title">Rankings</div><button class="wg-more-btn" onclick="go('market')">市场排行 →</button></div><div class="wg-list">`;
  h += `<div class="wg-rank-sec">Top gainers</div>`;
  gainers.forEach(r => h += `<div class="wg-row" onclick="openDetail('${r.tk}','')"><span class="wg-row-tk">${r.tk}</span><span class="wg-row-nm">$${r.pr}</span><span class="wg-row-chg positive">${r.chg}</span></div>`);
  h += `<div class="wg-rank-sec">Top losers</div>`;
  losers.forEach(r => h += `<div class="wg-row" onclick="openDetail('${r.tk}','')"><span class="wg-row-tk">${r.tk}</span><span class="wg-row-nm">$${r.pr}</span><span class="wg-row-chg negative">${r.chg}</span></div>`);
  h += `</div></div>`;

  // Calendar (upcoming earnings / events)
  const calEvents = [
    {d:'04-24',tk:'AAPL',tag:'财报',nm:'Q2 earnings'},
    {d:'04-25',tk:'GOOG',tag:'财报',nm:'Q1 earnings'},
    {d:'04-29',tk:'AMZN',tag:'财报',nm:'Q1 earnings'},
    {d:'05-01',tk:'MSFT',tag:'财报',nm:'Q3 earnings'},
    {d:'05-07',tk:'宏观',tag:'会议',nm:'FOMC 利率决议'}
  ];
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--bbg);color:var(--b)">${icon('calendar',14)}</div><div class="wg-title">Calendar</div><button class="wg-more-btn" onclick="go('market')">全部日程 →</button></div><div class="wg-list">`;
  calEvents.forEach(ev => {
    const clickable = knownTickers.includes(ev.tk);
    const attr = clickable ? `onclick="openDetail('${ev.tk}','')"` : '';
    h += `<div class="wg-cal-row" ${attr}><span class="wg-cal-d">${ev.d}</span><span class="wg-cal-tag">${ev.tag}</span><span class="wg-cal-tk">${ev.tk}</span><span class="wg-cal-nm">${ev.nm}</span></div>`;
  });
  h += `</div></div>`;

  h += `</div>`;

  document.getElementById('v-home').innerHTML = h;

  setTimeout(drawSignalCharts, 150);
  setTimeout(drawPnlTrendChart, 200);
}

/* Hero 右侧 P&L 趋势图 */
function drawPnlTrendChart() {
  const c = document.getElementById('pnlTrendChart');
  if (!c) return;
  const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, h = c.height = c.parentElement.clientHeight || 60;
  // User line (gold)
  const pts1 = []; let y1 = h * .5;
  for (let x = 0; x < w; x += 2) {
    y1 += (Math.random() - .48) * 3;
    y1 = Math.max(h * .05, Math.min(h * .95, y1));
    pts1.push({x, y: y1});
  }
  // Benchmark line (teal)
  const pts2 = []; let y2 = h * .45;
  for (let x = 0; x < w; x += 2) {
    y2 += (Math.random() - .47) * 2.5;
    y2 = Math.max(h * .05, Math.min(h * .95, y2));
    pts2.push({x, y: y2});
  }
  // Zero line
  const zeroY = h * .5;
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke(); ctx.setLineDash([]);
  // Teal fill
  const g2 = ctx.createLinearGradient(0, 0, 0, h);
  g2.addColorStop(0, 'rgba(6,182,212,.12)'); g2.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.beginPath(); ctx.moveTo(0, h); pts2.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(w, h); ctx.fillStyle = g2; ctx.fill();
  // Teal line
  ctx.beginPath(); pts2.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = 'rgba(6,182,212,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  // Gold line
  ctx.beginPath(); pts1.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = 'rgba(255,180,50,.9)'; ctx.lineWidth = 1.5; ctx.stroke();
}

/* 事件卡片 HTML 生成 */
function evH(e, st) {
  const cls = st === 'ur' ? 'ur' : 'rd';
  // Signal 富卡片
  if (e.sig && signalDB[e.tk]) {
    const s = signalDB[e.tk];
    return `<div class="sig ${cls}" onclick="markEventRead(this,'${e.id||''}');openSignalDetail('${e.tk}')">
      <div class="sig-top">
        <div class="sig-logo">${s.logo || s.tk.charAt(0)}</div>
        <div class="sig-info"><div class="sig-tk">${s.tk}</div><div class="sig-nm">${s.nm}</div></div>
        <div class="sig-fav" title="加入自选" role="button" aria-label="加入自选">${icon('heart',14)}</div>
      </div>
      <div class="sig-chart"><canvas id="sigc-${e.tk}"></canvas></div>
      <div class="sig-verdict ${s.verdict}">${s.verdict === 'bullish' ? 'Bullish' : s.verdict === 'bearish' ? 'Bearish' : 'Neutral'} · ${s.range}</div>
      <div class="sig-title">${s.headline}</div>
      <div class="sig-desc">${s.desc}</div>
      <div class="sig-footer"><span class="sig-strategy">${s.strategy}</span><span>${s.time}</span></div>
    </div>`;
  }
  // 普通事件卡(快讯式:左 dot 时间线 + 时间置顶 + 标题 + 底部 tag/ticker chips)
  const isKnown = knownTickers.includes(e.tk);
  const tkClass = isKnown ? 'sc-tk tk-link' : 'sc-tk';
  const eid = e.id || '';
  const tkAttr = isKnown ? `onclick="clickTickerPill(event,'${e.tk}','${e.tx.replace(/'/g, "\\'")}','${eid}')"` : '';
  const relTag = e.rlTag ? `<span class="sc-rel-tag sc-rel-tag-${e.rlTagLevel||'good'}">${e.rlTag}</span>` : '';
  const relRow = e.rl ? `<div class="sc-rel"><span class="sc-rel-ic">${icon('compass',11)}</span><span class="sc-rel-t">与你相关</span><span class="sc-rel-v">${e.rl}</span>${relTag}</div>` : '';
  return `<div class="sc ${cls}" onclick="markEventRead(this,'${eid}')">
    <div class="sc-gutter"><span class="sc-dot sc-dot-${e.c}"></span></div>
    <div class="sc-body">
      <div class="sc-time">${e.tm||''}</div>
      <div class="sc-tx">${e.tx}</div>
      ${relRow}
      <div class="sc-tags">
        <span class="sc-tag ${e.c}">${e.tag}</span>
        <span class="${tkClass}" ${tkAttr}>${e.tk}${isKnown?' →':''}</span>
      </div>
    </div>
  </div>`;
}

/* Signal 富卡片内的迷你走势图 */
function drawSignalCharts() {
  Object.keys(signalDB).forEach(tk => {
    const c = document.getElementById('sigc-' + tk);
    if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, ht = c.height = c.parentElement.clientHeight;
    const s = signalDB[tk], bullish = s.verdict === 'bullish';
    const pts = []; let y = ht * .5;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - (bullish ? .42 : .58)) * 2;
      y = Math.max(ht * .15, Math.min(ht * .85, y));
      pts.push({x, y});
    }
    const rgb = bullish ? '0,173,162' : '239,68,68';
    const g = ctx.createLinearGradient(0, 0, 0, ht);
    g.addColorStop(0, `rgba(${rgb},.1)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath(); ctx.moveTo(0, ht);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, ht); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = `rgba(${rgb},.7)`; ctx.lineWidth = 1.5; ctx.stroke();
    // 末端圆点
    const last = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},1)`; ctx.fill();
    ctx.beginPath(); ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},.2)`; ctx.fill();
  });
}

/* 事件卡片交互 */
function markEventRead(el, id) {
  if (id) persistReadId(id);
  if (el) { el.classList.remove('ur'); el.classList.add('rd'); }
}
function clickTickerPill(ev, tk, evTx, id) {
  ev.stopPropagation();
  if (id) {
    persistReadId(id);
    const card = ev.currentTarget.closest('.sc,.sig');
    if (card) { card.classList.remove('ur'); card.classList.add('rd'); }
  }
  openDetail(tk, evTx);
}
