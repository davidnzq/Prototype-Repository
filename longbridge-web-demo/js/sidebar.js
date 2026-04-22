/* ============================================================
   sidebar.js — AI 工作台 + 聊天列 + 底部全局输入框(含意图识别)
   依赖: data.js (awState, S)
   依赖: dynamic.js (enterDynamic, exitDynamic, renderDynamicView)
   ============================================================ */

/* AI 工作台 */
function renderAW() {
  const p = awState[sc];
  const total = p.tasks.length + p.strategies.length + p.orders.length;
  document.getElementById('awCount').textContent = total + ' 项';
  let h = '';
  if (p.tasks.length) {
    h += `<div class="aw-sec">AI 长期任务 <span class="aw-sec-count">${p.tasks.length}</span></div>`;
    p.tasks.forEach(t => h += awCardH(t));
  }
  if (p.strategies.length) {
    h += `<div class="aw-sec">活跃策略 <span class="aw-sec-count">${p.strategies.length}</span></div>`;
    p.strategies.forEach(s => h += awCardH(s));
  }
  if (p.orders.length) {
    h += `<div class="aw-sec">长期订单 <span class="aw-sec-count">${p.orders.length}</span></div>`;
    p.orders.forEach(o => h += awCardH(o));
  }
  document.getElementById('awBody').innerHTML = h;
}

function awCardH(item) {
  const statusMap = {run:'运行中',ok:'正常',warn:'预警',paused:'已暂停'};
  let h = `<div class="aw-card ${item.status}"><div class="aw-card-h"><span class="aw-card-status ${item.status}">${statusMap[item.status]}</span></div>`;
  h += `<div class="aw-card-title">${item.title}</div>`;
  h += `<div class="aw-card-desc">${item.desc}</div>`;
  h += `<div class="aw-card-meta">`;
  item.kv.forEach(([k, v]) => h += `<div class="aw-card-kv"><span class="aw-card-k">${k}</span><span class="aw-card-v">${v}</span></div>`);
  h += `</div>`;
  if (item.progress !== undefined) h += `<div class="aw-card-progress"><div class="aw-card-progress-bar" style="width:${item.progress}%"></div></div>`;
  if (item.actions) {
    h += `<div class="aw-card-actions">`;
    item.actions.forEach((a, i) => h += `<button class="aw-act-btn ${i===0?'primary':''}">${a}</button>`);
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

/* 聊天列 */
function renderChat() {
  const s = S[sc], el = document.getElementById('chm');
  let h = '';
  if (s.ai.msg) h += `<div class="ch-m bot"><div class="ch-ctx"><span class="ch-ctx-d"></span>基于持仓和事件</div><div class="ch-bub">${s.ai.msg}</div></div>`;
  if (s.ai.sugs) {
    h += `<div class="ch-sugs">`;
    s.ai.sugs.forEach(t => h += `<button class="ch-sug" onclick="clickSug(this)">${t}</button>`);
    h += `</div>`;
  }
  el.innerHTML = h;
  el.scrollTop = el.scrollHeight;
}
function clickSug(b) { tryIntent(b.textContent); }

/* ============ 底部全局输入框 ============ */
function showTries() { document.getElementById('giTries').classList.add('show'); }
function hideTries() { setTimeout(() => document.getElementById('giTries').classList.remove('show'), 150); }
function tryIntent(text) {
  const inp = document.getElementById('gin');
  inp.value = text;
  handleLiveInput(text);
  inp.focus();
}

/* 意图分类:P0 用正则,后续接 AI */
function classifyIntent(text) {
  const t = text.toLowerCase();
  if (/(对比|比较|\bvs\b|哪个好|应该选)/.test(t)) return 'dyn-compare';
  if (/(trade\s*plan|建单|交易计划|建.*计划|止损|期权|加仓方案|建仓)/.test(t)) return 'dyn-tradeplan';
  if (/(为什么跌|为什么亏|亏损来自|归因|影响多大|怎么回事)/.test(t)) return 'dyn-attribution';
  if (/(能追|能买|怎么样|什么情况|基本面|技术面|财报)/.test(t) && /(nvda|aapl|goog|tsm|amd|meta|msft|amzn|tsla|baba)/i.test(t)) return 'dyn-research';
  if (/(风险|持仓|我的资产|我的仓位|组合)/.test(t)) return 'dyn-risk';
  return null;
}

/* 实时跟随输入:每次键入都可能重组主视图 */
function handleLiveInput(text) {
  const box = document.getElementById('giBox');
  const tip = document.getElementById('hintTip');
  if (!text.trim()) {
    box.classList.remove('live-morph');
    tip.classList.remove('show');
    if (dynamic) exitDynamic();
    return;
  }
  const viewId = classifyIntent(text);
  if (!viewId) {
    box.classList.remove('live-morph');
    tip.classList.remove('show');
    return;
  }
  box.classList.add('live-morph');
  tip.classList.add('show');
  document.getElementById('chtag').classList.add('live');
  document.getElementById('chtag').textContent = '意图识别中';
  if (!dynamic) {
    previousView = cv;
    enterDynamic(viewId, text);
    currentDynViewId = viewId;
  } else if (viewId !== currentDynViewId) {
    document.querySelectorAll('.vw').forEach(el => el.classList.remove('on'));
    document.getElementById('v-' + viewId).classList.add('on');
    renderDynamicView(viewId);
    currentDynViewId = viewId;
    document.getElementById('dynTitle').textContent = text;
    document.getElementById('mc').scrollTop = 0;
  } else {
    document.getElementById('dynTitle').textContent = text;
  }
}

/* Enter 发送 */
function sendG() {
  const inp = document.getElementById('gin'), t = inp.value.trim();
  if (!t) return;
  inp.value = '';
  document.getElementById('giBox').classList.remove('live-morph');
  document.getElementById('hintTip').classList.remove('show');
  const el = document.getElementById('chm');
  el.innerHTML += `<div class="ch-m user fi"><div class="ch-bub">${t}</div></div>`;
  const viewId = currentDynViewId || classifyIntent(t) || 'dyn-risk';
  const responses = {
    'dyn-risk':'持仓风险布局已展示。科技股集中度 64% 是主要风险点。',
    'dyn-compare':'NVDA 和 AMD 对比已展示。综合来看 NVDA 增速更强但估值更高。',
    'dyn-tradeplan':'Trade Plan 草案已生成,参数可编辑。',
    'dyn-research':'标的深度研究已展示。结合基本面和技术面给出了综合评级。',
    'dyn-attribution':'今日归因分析已展示。系统性因素贡献 62%,个股因素 38%。'
  };
  setTimeout(() => {
    el.innerHTML += `<div class="ch-m bot fi"><div class="ch-ctx"><span class="ch-ctx-d"></span>已生成完整分析</div><div class="ch-bub">${responses[viewId]||'已响应。'}</div></div>`;
    el.scrollTop = el.scrollHeight;
    document.getElementById('chtag').classList.remove('live');
    document.getElementById('chtag').textContent = '分析完成';
  }, 400);
  el.scrollTop = el.scrollHeight;
}
