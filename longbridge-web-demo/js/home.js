/* ============================================================
   home.js — 顶部指数条 + 首页内容(总览条/chips/时间线/Signal 卡/Widget)
   依赖: data.js (S / awState / knownTickers / watchlistData / portfolioData / signalDB)
   依赖: detail.js (openDetail, openSignalDetail)
   ============================================================ */

/* 通用 sparkline */
function spark(dir, w = 26, h = 14) {
  const pts = dir === 'down'
    ? [[0,3],[6,6],[12,4],[18,8],[24,11]]
    : [[0,11],[6,8],[12,10],[18,5],[24,2]];
  const color = dir === 'down' ? '#ff4d6a' : '#00d4a1';
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 26 14"><path d="${d}" stroke="${color}" stroke-width="1.2" fill="none"/></svg>`;
}

/* 顶部指数条 */
function renderIndices() {
  const s = S[sc], el = document.getElementById('tnIndices');
  let h = '';
  s.indices.forEach(idx => {
    h += `<div class="tn-index ${idx.dir === 'up' ? 'up' : ''}">
      <div class="tn-index-icon"></div>
      <span class="tn-index-name">${idx.name}</span>
      <span class="tn-index-value">${idx.val}</span>
      <span class="tn-index-arrow">${idx.dir === 'up' ? '▲' : '▼'}</span>
      ${spark(idx.dir)}
      <span class="tn-index-change">${idx.chg} ${idx.pct}</span>
    </div>`;
  });
  el.innerHTML = h;
}

/* 首页渲染 */
function renderHome() {
  const s = S[sc];
  let h = '';
  // Hero 总览条
  if (s.pf) {
    h += `<div class="hm-hero"><div class="hm-pf-main"><div class="hm-pf-l">总持仓</div><div class="hm-pf-v">${s.pf.v}</div><div class="hm-pf-c ${s.pf.p?'positive':'negative'}">${s.pf.ch} (${s.pf.pct})</div></div>`;
    s.top.forEach(t => h += `<div class="hm-pf-sep"></div><div class="hm-pf-mini" onclick="openDetail('${t.t}','')"><div class="hm-pf-ml">${t.t}</div><div class="hm-pf-mv ${t.p?'positive':'negative'}">${t.v}</div></div>`);
    h += `</div>`;
  }
  // Chips
  if (s.chips.length) {
    h += `<div class="chips">`;
    s.chips.forEach(c => h += `<div class="chip ${c.c}"><span class="chip-d"></span><span class="chip-l">${c.t}</span><span class="chip-t">${c.n}</span></div>`);
    h += `</div>`;
  }
  // 时间线头部
  h += `<div class="tl-hd"><span class="tl-t">变化事件</span>${s.nc?`<span class="tl-c">${s.nc} 条新变化 · 点击蓝色 ticker 查看详情</span>`:''}</div>`;
  document.getElementById('badge').textContent = s.nc || '';
  document.getElementById('badge').style.display = s.nc ? 'flex' : 'none';
  s.ur.forEach(e => h += evH(e, 'ur'));
  if (s.calm) h += `<div style="padding:10px 12px;margin:4px 0;border-radius:8px;background:var(--gbg);border:1px solid rgba(0,212,161,.1);font-size:11px;color:var(--g)">过去 ${s.lv} 内无重大变化</div>`;
  if (s.lv) h += `<div class="tl-div"><div class="tl-div-l"></div><span class="tl-div-t">上次访问 · ${s.lv}</span></div>`;
  s.rd.forEach(e => h += evH(e, 'rd'));

  // Widget 卡片区
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
  h += `<div class="wg"><div class="wg-top"><div class="wg-icon" style="background:var(--pbg);color:var(--p)">💼</div><div class="wg-title">Portfolio</div><span class="wg-summary ${s.pf&&s.pf.p?'positive':'negative'}">${s.pf?s.pf.pct:'--'}</span><button class="wg-more-btn" onclick="go('portfolio')">查看全部 →</button></div><div class="wg-list">`;
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
    const rgb = pos ? '0,212,161' : '255,77,106';
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

/* 画所有 Signal 富卡片内的迷你走势图 */
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
    const rgb = bullish ? '0,212,161' : '255,77,106';
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
