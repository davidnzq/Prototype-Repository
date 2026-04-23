/* ============================================================
   detail.js — 右侧详情列:普通标的详情 + Signal 详情 + Trade Plan 触发
   v18: 详情面板采用 sticky header + sticky footer
        新增 dpHistory 栈(供 dpGoBack 返回上一页)
        新增 buildTradePlan → 向 AI 工作台推送动态卡片
   依赖: data.js (ddb, signalDB)
   依赖: home.js (renderAW via sidebar)
   ============================================================ */

/* Detail 面板历史栈(供返回按钮使用) */
let dpHistory = [];

/* Build Trade Plan 触发后向 AI 工作台推入的动态卡片列表 */
let dynamicAWCards = [];

/* 普通标的详情 */
function openDetail(tk, evTx) {
  const d = ddb[tk];
  if (!d) return;
  const dp = document.getElementById('dp');
  document.getElementById('dpInner').innerHTML = `
    <div class="dt-tk">${d.tk}</div><div class="dt-nm">${d.nm}</div>
    <div class="dt-pr">$${d.pr}</div><div class="dt-ch ${d.p?'positive':'negative'}">${d.ch} (${d.pct})</div>
    ${evTx?`<div class="dt-ctx"><div class="dt-ctx-l">触发事件</div><div class="dt-ctx-t">${evTx}</div></div>`:''}
    <div class="dt-chart"><canvas id="dc"></canvas></div>
    <div class="dt-sec">关键数据</div>
    <div class="dt-stats">
      <div class="dt-stat"><div class="dt-stat-l">开盘</div><div class="dt-stat-v">$${d.op}</div></div>
      <div class="dt-stat"><div class="dt-stat-l">最高</div><div class="dt-stat-v">$${d.hi}</div></div>
      <div class="dt-stat"><div class="dt-stat-l">最低</div><div class="dt-stat-v">$${d.lo}</div></div>
      <div class="dt-stat"><div class="dt-stat-l">成交量</div><div class="dt-stat-v">${d.vol}</div></div>
      <div class="dt-stat"><div class="dt-stat-l">P/E</div><div class="dt-stat-v">${d.pe}</div></div>
      <div class="dt-stat"><div class="dt-stat-l">市值</div><div class="dt-stat-v">${d.cap}</div></div>
    </div>
    <div class="dt-actions" style="display:none"></div>
  `;
  document.getElementById('dpFooter').innerHTML = `<div class="dt-actions"><button class="dt-act primary" onclick="buildTradePlan('${d.tk}')">交易</button></div>`;
  document.getElementById('dpBack').classList.remove('show');
  dp.classList.add('open');
  document.getElementById('aw').classList.add('compact');
  setTimeout(() => {
    const c = document.getElementById('dc');
    if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, h = c.height = c.parentElement.clientHeight;
    const pts = []; let y = h * .5;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - (d.p ? .42 : .58)) * 3;
      y = Math.max(h * .1, Math.min(h * .9, y));
      pts.push({x, y});
    }
    const rgb = d.p ? '0,212,161' : '255,77,106';
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(${rgb},.12)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath(); ctx.moveTo(0, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, h); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = `rgba(${rgb},.7)`; ctx.lineWidth = 1.5; ctx.stroke();
  }, 350);
}

/* 关闭详情面板 */
function closeDetail() {
  document.getElementById('dp').classList.remove('open');
  document.getElementById('aw').classList.remove('compact');
  dpHistory = [];
  document.getElementById('dpBack').classList.remove('show');
  document.getElementById('dpFooter').innerHTML = '';
}

/* 返回上一个 Detail 视图(历史栈) */
function dpGoBack() {
  if (dpHistory.length > 0) {
    const prev = dpHistory.pop();
    prev();
    if (dpHistory.length === 0) document.getElementById('dpBack').classList.remove('show');
  }
}

/* Build Trade Plan → 向 AI 工作台追加动态卡片并模拟进度 */
function buildTradePlan(tk) {
  const d = ddb[tk];
  if (!d) return;
  dynamicAWCards.push({status:'run',title:tk+' Trade Plan 生成中',desc:'AI 正在评估最优策略...',kv:[['标的',tk],['现价','$'+d.pr]],progress:35,actions:['查看','中断']});
  renderAW();
  // 动画推进
  let prog = 35;
  const iv = setInterval(() => {
    prog += Math.random() * 8;
    if (prog >= 100) {
      clearInterval(iv);
      const card = dynamicAWCards.find(c => c.title === tk + ' Trade Plan 生成中');
      if (card) {
        card.status = 'ok';
        card.title = tk + ' Trade Plan 就绪';
        card.desc = 'Long Call · 草案已生成';
        card.progress = undefined;
        card.actions = ['查看','下单'];
      }
      renderAW();
      const el = document.getElementById('chm');
      el.innerHTML += `<div class="ch-m bot fi"><div class="ch-ctx"><span class="ch-ctx-d"></span>Trade Plan 完成</div><div class="ch-bub"><b>${tk}</b> Trade Plan 已生成并放入 AI 工作台。点击查看详情。</div></div>`;
      el.scrollTop = el.scrollHeight;
    } else {
      const card = dynamicAWCards.find(c => c.title === tk + ' Trade Plan 生成中');
      if (card) card.progress = Math.min(95, Math.round(prog));
      renderAW();
    }
  }, 600);
  // 关闭详情
  closeDetail();
  // Chat 反馈
  const el = document.getElementById('chm');
  el.innerHTML += `<div class="ch-m bot fi"><div class="ch-ctx"><span class="ch-ctx-d"></span>AI 执行中</div><div class="ch-bub">正在为 <b>${tk}</b> 生成 Trade Plan,已放入 AI 工作台...</div></div>`;
  el.scrollTop = el.scrollHeight;
}

/* Signal 详情 */
function openSignalDetail(tk) {
  const s = signalDB[tk];
  if (!s) return;
  const d = s.detail;
  const dp = document.getElementById('dp');
  const vb = s.verdict === 'bullish', vc = vb ? 'var(--g)' : 'var(--r)', vbg = vb ? 'var(--gbg)' : 'var(--rbg)';
  // 估值条百分比
  const lo = parseInt(d.valLow.replace('$','')), hi = parseInt(d.valHigh.replace('$','')), bs = parseInt(d.valBase.replace('$','')), cu = parseInt(d.valCurrent.replace('$',''));
  const range = hi - lo, conW = Math.round((bs - lo) / range * 100), baseW = Math.round((hi - bs) / range * 100);
  const markerPct = Math.round((cu - lo) / range * 100);

  let h = `<div class="sd-back" onclick="closeDetail()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back</div>`;
  h += `<div class="sd-head"><div class="sd-head-tk"><div class="sd-head-logo">${s.logo || s.tk.charAt(0)}</div><span class="sd-head-code">${s.tk} ${s.nm}</span></div>`;
  h += `<div class="sd-headline">${s.headline}</div>`;
  h += `<div class="sd-meta">${s.strategy} · ${s.time}</div></div>`;

  // Final verdict
  h += `<div class="sd-section"><div class="sd-section-t">Final verdict</div><div class="sd-verdict-grid">`;
  h += `<div class="sd-verdict-item"><div class="sd-verdict-l">Target valuation</div><div class="sd-verdict-v">${d.targetVal}</div></div>`;
  h += `<div class="sd-verdict-item"><div class="sd-verdict-l">Price vs. target</div><div class="sd-verdict-v sm">${d.priceVsTarget}</div></div>`;
  h += `<div class="sd-verdict-item"><div class="sd-verdict-l">Strategy fit</div><div class="sd-verdict-v" style="color:${vc}">${d.fit}/100</div></div>`;
  h += `<div class="sd-verdict-item"><div class="sd-verdict-l">Key catalyst</div><div class="sd-verdict-v sm" style="color:var(--ts)">${d.catalyst.split(':')[0]}</div></div>`;
  h += `</div></div>`;

  // Related catalysts
  h += `<div class="sd-section"><div class="sd-section-t">Related catalysts</div>`;
  h += `<div class="sd-catalyst"><div class="sd-catalyst-t">${d.catalyst}</div><div class="sd-catalyst-desc">${d.catalystDesc}</div><div class="sd-catalyst-src">${d.catalystSrc}</div></div></div>`;

  // Strategy fit score
  h += `<div class="sd-section"><div class="sd-section-t">Strategy fit score</div><div class="sd-score">`;
  h += `<div class="sd-score-gauge"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke="var(--sf3)" stroke-width="4"/><circle cx="28" cy="28" r="24" fill="none" stroke="${vc}" stroke-width="4" stroke-dasharray="${d.fit*1.508} 200" stroke-linecap="round" transform="rotate(-90 28 28)"/></svg><div class="sd-score-val"><div class="sd-score-num">${d.fit}</div><div class="sd-score-unit">/100</div></div></div>`;
  h += `<div class="sd-score-factors">`;
  d.factors.forEach(f => {
    const fc = f.c === 'g' ? 'var(--g)' : f.c === 'r' ? 'var(--r)' : f.c === 'o' ? 'var(--o)' : 'var(--tm)';
    h += `<div class="sd-score-factor"><div class="sd-score-dot" style="background:${fc}"></div><span class="sd-score-fl">${f.n}</span><span class="sd-score-fv" style="color:${fc}">${f.v}</span></div>`;
  });
  h += `</div></div></div>`;

  // Analysis
  h += `<div class="sd-section"><div class="sd-section-t">Analysis process</div>`;
  h += `<div class="sd-analysis"><strong>Objective</strong><div class="sd-analysis-obj">${d.objective}</div></div>`;
  h += `<div class="sd-analysis" style="margin-top:4px"><strong>Process</strong><div class="sd-analysis-obj">${d.process}</div></div></div>`;

  // Valuation range
  h += `<div class="sd-section"><div class="sd-section-t">Valuation range</div><div class="sd-valuation">`;
  h += `<div class="sd-val-bar"><div class="sd-val-seg" style="width:${conW}%;background:var(--rbg);color:var(--r)">Conservative</div><div class="sd-val-seg" style="width:${baseW}%;background:var(--gbg);color:var(--g)">Optimistic</div><div class="sd-val-marker" style="left:${markerPct}%"></div></div>`;
  h += `<div class="sd-val-labels"><span>${d.valLow}</span><span>Base ${d.valBase}</span><span>${d.valHigh}</span></div>`;
  h += `</div></div>`;

  // Risk
  h += `<div class="sd-section"><div class="sd-section-t">Risk warning</div>`;
  h += `<div class="sd-risk"><strong>Risk</strong>  ${d.risk}</div></div>`;

  // Execution rules
  h += `<div class="sd-section"><div class="sd-section-t">Execution rules</div><div class="sd-exec">`;
  d.exec.forEach(([k, v]) => h += `<div class="sd-exec-row"><span class="sd-exec-k">${k}</span><span class="sd-exec-v">${v}</span></div>`);
  h += `</div></div>`;

  // CTA 挪到 footer
  h += ``;

  document.getElementById('dpInner').innerHTML = h;
  document.getElementById('dpFooter').innerHTML = `<button style="width:100%;padding:10px;border-radius:8px;border:none;background:#00B8B8;color:#000;font-size:12px;font-weight:600;font-family:var(--f);cursor:pointer" onclick="buildTradePlan('${tk}')">新建策略</button>`;
  dp.classList.add('open');
  document.getElementById('aw').classList.add('compact');
}
