/* ============================================================
   home.js — 顶部指数条 + 首页内容
            (AI 工作台 inline / Hero 双栏 / chips / 时间线 / Signal 富卡 / Widget)
   v18: Hero 改为双栏(左 总资产 / 右 收益率趋势) + drawPnlTrendChart
        tl-grid 混合布局(signal 富卡占 3 行)
   依赖: data.js (S / awState / knownTickers / watchlistData / portfolioData / signalDB)
   依赖: detail.js (openDetail, openSignalDetail, dynamicAWCards)
   依赖: sidebar.js (awCardH)
   ============================================================ */

/* 通用 sparkline */
function spark(dir, w = 26, h = 14) {
  const pts = dir === 'down'
    ? [[0,3],[6,6],[12,4],[18,8],[24,11]]
    : [[0,11],[6,8],[12,10],[18,5],[24,2]];
  const color = dir === 'down' ? '#FF3A75' : '#00ADA2';
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
  const awP = awState[sc];
  const allAWCards = [];
  if (s.chips && s.chips.length) s.chips.forEach(c => allAWCards.push({status:'warn',title:c.t+' · '+c.n,desc:'需要您关注',actions:['查看','稍后']}));
  if (typeof dynamicAWCards !== 'undefined') dynamicAWCards.forEach(c => allAWCards.push(c));
  awP.tasks.forEach(c => allAWCards.push(c));
  awP.strategies.forEach(c => allAWCards.push(c));
  awP.orders.forEach(c => allAWCards.push(c));
  if (allAWCards.length) {
    h += `<div class="aw-inline"><div class="aw-inline-hd"><div class="aw-inline-icon">AI</div><span class="aw-inline-t">进行中的任务</span><span class="aw-inline-count">${allAWCards.length} 项</span></div><div class="aw-inline-grid">`;
    allAWCards.forEach(item => h += awCardH(item));
    h += `</div></div>`;
  }

  // Hero
  if (s.pf) {
    h += `<div class="hm-hero">
      <div class="hm-hero-left">
        <div class="hm-hero-top"><span class="hm-hero-curr">总资产 (CNH) ▾</span></div>
        <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px"><span class="hm-hero-total">183,440.88</span><span class="hm-hero-eye">👁️</span></div>
        <div class="hm-hero-stats" style="margin-bottom:4px">
          <div><div class="hm-hero-stat-l">当日盈亏</div><div class="hm-hero-stat-v positive">+562.83</div></div>
          <div><div class="hm-hero-stat-l">持仓市值</div><div class="hm-hero-stat-v">180,950.48</div></div>
          <div><div class="hm-hero-stat-l">持仓总盈亏</div><div class="hm-hero-stat-v positive">+43,396.96</div></div>
        </div>
        <div class="hm-hero-safety"><span class="hm-hero-safety-icon">🛡️</span><span>安全</span><span class="hm-hero-safety-link">融资状态 ›</span></div>
      </div>
      <div class="hm-hero-right" style="display:flex;flex-direction:column;justify-content:center">
        <div class="hm-pnl-label" style="margin-bottom:4px">收益率趋势 · 本年</div>
        <div style="display:flex;align-items:stretch;gap:12px;flex:1;min-height:0">
          <div style="flex-shrink:0;display:flex;flex-direction:column;justify-content:center">
            <div class="hm-pnl-val positive" style="font-size:16px;margin-bottom:2px">+257.95</div>
            <div class="hm-pnl-rate positive" style="font-size:11px">0.14%</div>
            <div class="hm-pnl-bench" style="margin-top:6px"><span class="hm-pnl-bench-dot"></span><span>跑输 · 道琼斯</span><span class="negative" style="font-family:var(--m);font-size:9px">-2.83%</span></div>
          </div>
          <div style="flex:1;min-width:0"><canvas id="pnlTrendChart" style="width:100%;height:100%"></canvas></div>
        </div>
      </div>
    </div>`;
  }

  // Timeline
  h += `<div class="tl-hd"><span class="tl-t">变化事件</span>${s.nc?`<span class="tl-c">${s.nc} 条新变化 · 点击蓝色 ticker 查看详情</span>`:''}</div>`;
  document.getElementById('badge').textContent = s.nc || '';
  document.getElementById('badge').style.display = s.nc ? 'flex' : 'none';
  // Sort: signals first (big cards), then normal events
  const sigEvents = s.ur.filter(e => e.sig);
  const normalUr = s.ur.filter(e => !e.sig);
  h += `<div class="tl-grid">`;
  sigEvents.forEach(e => h += evH(e, 'ur'));
  normalUr.forEach(e => h += evH(e, 'ur'));
  if (s.calm) h += `<div style="padding:10px 12px;margin:4px 0;border-radius:8px;background:rgba(0,184,184,.08);border:1px solid rgba(0,184,184,.12);font-size:11px;color:#00B8B8;grid-column:1/-1">过去 ${s.lv} 内无重大变化</div>`;
  if (s.lv) h += `<div class="tl-div"><div class="tl-div-l"></div><span class="tl-div-t">上次访问 · ${s.lv}</span></div>`;
  s.rd.forEach(e => h += evH(e, 'rd'));
  h += `</div>`;

  // Widget 卡片
  h += `<div class="wg-hd-row"><span class="wg-hd">快速入口</span><span class="wg-hd-s">点击卡片行查看详情</span></div>`;
  h += `<div class="wg-grid">`;

  // Watchlist
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--gbg);color:var(--g)">★</div><div class="wg-title">Watchlist</div><button class="wg-more-btn" onclick="go('watchlist')">查看全部 →</button></div><div class="wg-list">`;
  watchlistData.slice(0, 5).forEach(item => {
    const chgCls = item.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-row" onclick="openDetail('${item.tk}','')"><span class="wg-row-tk">${item.tk}</span><span class="wg-row-nm">${item.nm}</span><span class="wg-row-pr">$${item.pr}</span><span class="wg-row-chg ${chgCls}">${item.chg}</span></div>`;
  });
  h += `</div></div>`;

  // Portfolio
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--pbg);color:var(--p)">💼</div><div class="wg-title">Portfolio</div><button class="wg-more-btn" onclick="go('portfolio')">查看全部 →</button></div><div class="wg-list">`;
  portfolioData.slice(0, 5).forEach(item => {
    const chgCls = item.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-row" onclick="openDetail('${item.tk}','')"><span class="wg-row-tk">${item.tk}</span><span class="wg-row-nm">${item.nm}</span><span class="wg-row-pr">${item.pr}</span><span class="wg-row-chg ${chgCls}">${item.pnl}</span></div>`;
  });
  h += `</div></div>`;

  // Market
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--bbg);color:var(--b)">📊</div><div class="wg-title">Market</div><button class="wg-more-btn" onclick="go('market')">进入市场 →</button></div><div class="wg-list">`;
  s.mktIdx.forEach(idx => {
    const chgCls = idx.dir === 'up' ? 'positive' : 'negative';
    h += `<div class="wg-index-row"><span class="wg-index-icon-bar" style="background:${idx.color}"></span><span class="wg-index-nm">${idx.name}</span><span class="wg-index-val">${idx.val}</span>${spark(idx.dir, 20, 10)}<span class="wg-index-chg ${chgCls}">${idx.chg}</span></div>`;
  });
  h += `</div></div>`;

  // P&L
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:${s.pf&&s.pf.p?'var(--gbg)':'var(--rbg)'};color:${s.pf&&s.pf.p?'var(--g)':'var(--r)'}">📈</div><div class="wg-title">Profit & Loss</div><span class="wg-summary ${s.pf&&s.pf.p?'positive':'negative'}">今日 ${s.pf?s.pf.pct:'--'}</span></div>`;
  h += `<div class="wg-pnl-hero">
    <div><div class="kpi-l">今日盈亏</div><div class="wg-pnl-v ${s.pf&&s.pf.p?'positive':'negative'}">${s.pnlToday}</div></div>
    <canvas class="wg-pnl-chart" id="pnlChart"></canvas>
  </div>`;
  h += `<div class="wg-pnl-stats">
    <div><div class="wg-pnl-stat-l">本周</div><div class="wg-pnl-stat-v ${s.pnlWeek.startsWith('+')?'positive':'negative'}">${s.pnlWeek}</div></div>
    <div><div class="wg-pnl-stat-l">本月</div><div class="wg-pnl-stat-v ${s.pnlMonth.startsWith('+')?'positive':'negative'}">${s.pnlMonth}</div></div>
    <div><div class="wg-pnl-stat-l">总收益率</div><div class="wg-pnl-stat-v positive">+12.4%</div></div>
  </div>`;
  h += `</div>`;

  h += `</div>`;

  document.getElementById('v-home').innerHTML = h;

  // 画 P&L 小图
  setTimeout(() => {
    const c = document.getElementById('pnlChart');
    if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, hh = c.height = c.parentElement.clientHeight;
    const pos = s.pf.p;
    const pts = []; let y = hh * .5;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - (pos ? .42 : .58)) * 2.5;
      y = Math.max(hh * .1, Math.min(hh * .9, y));
      pts.push({x, y});
    }
    const rgb = pos ? '0,173,162' : '255,58,117';
    const g = ctx.createLinearGradient(0, 0, 0, hh);
    g.addColorStop(0, `rgba(${rgb},.15)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath(); ctx.moveTo(0, hh);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, hh); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = `rgba(${rgb},.8)`; ctx.lineWidth = 1.5; ctx.stroke();
  }, 100);
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
  g2.addColorStop(0, 'rgba(0,184,184,.12)'); g2.addColorStop(1, 'rgba(0,184,184,0)');
  ctx.beginPath(); ctx.moveTo(0, h); pts2.forEach(p => ctx.lineTo(p.x, p.y)); ctx.lineTo(w, h); ctx.fillStyle = g2; ctx.fill();
  // Teal line
  ctx.beginPath(); pts2.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = 'rgba(0,184,184,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
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
    return `<div class="sig ${cls}" onclick="openSignalDetail('${e.tk}')">
      <div class="sig-top">
        <div class="sig-logo">${s.logo || s.tk.charAt(0)}</div>
        <div class="sig-info"><div class="sig-tk">${s.tk}</div><div class="sig-nm">${s.nm}</div></div>
        <div class="sig-fav">♥</div>
      </div>
      <div class="sig-chart"><canvas id="sigc-${e.tk}"></canvas></div>
      <div class="sig-verdict ${s.verdict}">${s.verdict === 'bullish' ? 'Bullish' : s.verdict === 'bearish' ? 'Bearish' : 'Neutral'} · ${s.range}</div>
      <div class="sig-title">${s.headline}</div>
      <div class="sig-desc">${s.desc}</div>
      <div class="sig-footer"><span class="sig-strategy">${s.strategy}</span><span>${s.time}</span></div>
    </div>`;
  }
  // 普通事件卡
  const isKnown = knownTickers.includes(e.tk);
  const tkClass = isKnown ? 'sc-tk tk-link' : 'sc-tk';
  const tkAttr = isKnown ? `onclick="clickTickerPill(event,'${e.tk}','${e.tx.replace(/'/g, "\\'")}')"` : '';
  return `<div class="sc ${cls}" onclick="markEventRead(this)"><div class="sc-top"><span class="sc-tag ${e.c}">${e.tag}</span><span class="${tkClass}" ${tkAttr}>${e.tk}${isKnown?' →':''}</span><span class="sc-tm">${e.tm}</span></div><div class="sc-tx">${e.tx}</div><div class="sc-rl">${e.rl}</div></div>`;
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
    const rgb = bullish ? '0,173,162' : '255,58,117';
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
function markEventRead(el) { el.classList.remove('ur'); el.classList.add('rd'); }
function clickTickerPill(ev, tk, evTx) { ev.stopPropagation(); openDetail(tk, evTx); }
