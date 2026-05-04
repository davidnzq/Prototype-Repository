/* ============================================================
   sidebar.js — AI 工作台 + 聊天列 + 底部全局输入框(含意图识别)
   v18: renderAW 注入 chips 为预警卡、dynamicAWCards 动态任务、以及
        原有 tasks/strategies/orders;awCardH 支持展开详情(toggleAwDetail)
   依赖: data.js (awState, S)
   依赖: detail.js (dynamicAWCards)
   依赖: dynamic.js (enterDynamic, exitDynamic, renderDynamicView)
   ============================================================ */

/* AI 工作台 */
function renderAW() {
  const p = awState[sc];
  const s = S[sc];
  let h = '';
  // 注入首页 chips 为 warn 卡(静态 + 动态)
  const staticChips = s.chips || [];
  const dynChips = (typeof dynamicChips !== 'undefined') ? dynamicChips : [];
  const totalChips = staticChips.length + dynChips.length;
  if (totalChips) {
    h += `<div class="aw-sec">需关注 <span class="aw-sec-count">${totalChips}</span></div>`;
    staticChips.forEach(c => {
      const id = 'static-' + (c.t + '-' + c.n).replace(/\s+/g,'');
      const tkMatch = c.n.match(/[A-Z]{2,5}/);
      const tk = tkMatch ? tkMatch[0] : '';
      const kind = c.t.includes('Trade Plan') ? 'static-tp' : 'static-signal';
      h += awCardH({status:'warn',title:c.t+' · '+c.n,desc:'需要您关注',dismissId:id,cardClick:`clickChip('${kind}','${tk}')`,actions:[{label:'查看',onclick:`clickChip('${kind}','${tk}')`},{label:'稍后',onclick:`dismissChip('${id}')`}]});
    });
    dynChips.forEach(c => {
      h += awCardH({status:c.status||'warn',title:c.t+(c.n?' · '+c.n:''),desc:c.desc||'需要您关注',dismissId:c.id,cardClick:`clickChip('${c.kind}','${c.tk||''}')`,actions:[{label:'查看',onclick:`clickChip('${c.kind}','${c.tk||''}')`},{label:'忽略',onclick:`dismissChip('${c.id}')`}]});
    });
  }
  // 动态卡片(Build Trade Plan 等产生)
  if (typeof dynamicAWCards !== 'undefined' && dynamicAWCards.length) {
    h += `<div class="aw-sec">动态任务 <span class="aw-sec-count">${dynamicAWCards.length}</span></div>`;
    dynamicAWCards.forEach(t => h += awCardH(t));
  }
  if (p.tasks.length) {
    h += `<div class="aw-sec">AI 长期任务 <span class="aw-sec-count">${p.tasks.length}</span></div>`;
    p.tasks.forEach(t => h += awCardH(t));
  }
  if (p.strategies.length) {
    h += `<div class="aw-sec">活跃策略 <span class="aw-sec-count">${p.strategies.length}</span></div>`;
    p.strategies.forEach(st => h += awCardH(st));
  }
  if (p.orders.length) {
    h += `<div class="aw-sec">长期订单 <span class="aw-sec-count">${p.orders.length}</span></div>`;
    p.orders.forEach(o => h += awCardH(o));
  }
  const totalCount = p.tasks.length + p.strategies.length + p.orders.length + (s.chips ? s.chips.length : 0) + (typeof dynamicAWCards !== 'undefined' ? dynamicAWCards.length : 0) + (typeof dynamicChips !== 'undefined' ? dynamicChips.length : 0);
  document.getElementById('awCount').textContent = totalCount + ' 项';
  document.getElementById('awBody').innerHTML = h;
}

/* 单张任务/策略/订单卡(可展开详情)
   item.actions 支持两种格式:
     - 字符串数组: ['查看','稍后']
     - 对象数组: [{label:'查看',onclick:"openDetail('NVDA')"}, ...]
   item.dismissId 设了就显示 × 关闭按钮(对应 dismissChip(id)) */
function awCardH(item) {
  const statusMap = {run:'运行中',ok:'正常',warn:'预警',paused:'已暂停',activating:'激活中'};
  const uid = 'aw-' + Math.random().toString(36).substr(2,6);
  const hoverActions = item.actions && item.actions.length
    ? `<div class="aw-card-hover">${item.actions.map((a,i) => {
        const isObj = typeof a === 'object';
        const label = isObj ? a.label : a;
        const handler = isObj && a.onclick ? a.onclick.replace(/"/g,'&quot;') : '';
        return `<button class="aw-act-btn ${i===0?'primary':''}" onclick="event.stopPropagation();${handler}">${label}</button>`;
      }).join('')}</div>`
    : '';
  const dismissBtn = item.dismissId ? `<button class="aw-card-x" onclick="event.stopPropagation();dismissChip('${item.dismissId}')" title="忽略">×</button>` : '';
  let h = `<div class="aw-card ${item.status}" onclick="${item.cardClick||`toggleAwDetail('${uid}')`}">${hoverActions}${dismissBtn}<div class="aw-card-h"><span class="aw-card-status ${item.status}">${statusMap[item.status]}</span><span style="margin-left:auto;font-size:8px;color:var(--tm);transition:transform .2s" id="${uid}-arrow">▾</span></div>`;
  h += `<div class="aw-card-title">${item.title}</div>`;
  h += `<div class="aw-card-desc">${item.desc}</div>`;
  h += `<div class="aw-card-meta">`;
  if (item.kv) item.kv.forEach(([k,v]) => h += `<div class="aw-card-kv"><span class="aw-card-k">${k}</span><span class="aw-card-v">${v}</span></div>`);
  h += `</div>`;
  if (item.progress !== undefined) h += `<div class="aw-card-progress"><div class="aw-card-progress-bar" style="width:${item.progress}%"></div></div>`;
  // 展开详情
  h += `<div class="aw-card-detail" id="${uid}" style="max-height:0;overflow:hidden;transition:max-height .25s ease;margin-top:0">`;
  h += `<div style="padding-top:6px;border-top:1px solid var(--bd);margin-top:6px">`;
  if (item.status === 'run' && item.progress !== undefined) {
    h += `<div style="font-size:9px;color:var(--ts);line-height:1.5;margin-bottom:4px">任务正在执行中,预计完成进度 <strong style="color:var(--tp)">${item.progress}%</strong>。</div>`;
  }
  if (item.status === 'warn') {
    h += `<div style="font-size:9px;color:var(--r);line-height:1.5;margin-bottom:4px">⚠ 需要您关注并处理此项。</div>`;
  }
  if (item.status === 'ok') {
    h += `<div style="font-size:9px;color:var(--ts);line-height:1.5;margin-bottom:4px">运行正常,无需操作。</div>`;
  }
  if (item.kv && item.kv.length) {
    h += `<div style="display:flex;flex-direction:column;gap:2px;margin-bottom:4px">`;
    item.kv.forEach(([k,v]) => h += `<div style="display:flex;justify-content:space-between;font-size:9px"><span style="color:var(--tm)">${k}</span><span style="font-family:var(--m);color:var(--tp)">${v}</span></div>`);
    h += `</div>`;
  }
  if (item.actions) {
    h += `<div class="aw-card-actions" style="display:flex">`;
    item.actions.forEach((a,i) => h += `<button class="aw-act-btn ${i===0?'primary':''}" onclick="event.stopPropagation()">${a}</button>`);
    h += `</div>`;
  }
  h += `</div></div>`;
  h += `</div>`;
  return h;
}

/* 点击卡片 → 展开/收起详情 */
function toggleAwDetail(uid) {
  const el = document.getElementById(uid);
  const arrow = document.getElementById(uid + '-arrow');
  if (!el) return;
  if (el.style.maxHeight === '0px' || el.style.maxHeight === '') {
    el.style.maxHeight = el.scrollHeight + 40 + 'px';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    el.style.maxHeight = '0px';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
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

/* 语音输入入口 — 切换 recording 态(原型只做视觉反馈,真接入 Web Speech API 时再补 onresult) */
function toggleVoiceInput() {
  const box = document.getElementById('giBox');
  const mic = document.getElementById('giMic');
  const inp = document.getElementById('gin');
  if (!box || !mic || !inp) return;
  const recording = mic.classList.toggle('recording');
  box.classList.toggle('recording', recording);
  if (recording) {
    inp.dataset.savedPlaceholder = inp.placeholder;
    inp.placeholder = '聆听中... 说出你想问的问题(如「分析持仓风险」)';
    inp.disabled = true;
    mic.setAttribute('aria-label', '停止语音输入');
    mic.setAttribute('title', '停止语音输入');
  } else {
    inp.placeholder = inp.dataset.savedPlaceholder || inp.placeholder;
    inp.disabled = false;
    mic.setAttribute('aria-label', '语音输入');
    mic.setAttribute('title', '语音输入');
    inp.focus();
  }
}
function tryIntent(text) {
  const inp = document.getElementById('gin');
  inp.value = text;
  handleLiveInput(text);
  inp.focus();
}

/* 意图分类:P0 用正则,后续接 AI
   优先级:选股(关键词最具体) > 对比 > 建策略 > 归因 > 标的 > 风险 */
function classifyIntent(text) {
  const t = text.toLowerCase();
  if (/(选股|筛选|潜力股|中概股|高股息|高息|价值股|成长股|低估值|高成长|找股|挑股|选出)/.test(t)) return 'dyn-screener';
  if (/(对比|比较|\bvs\b|哪个好|应该选)/.test(t)) return 'dyn-compare';
  if (/(trade\s*plan|建单|建.*策略|策略草案|策略方案|加仓策略|止损策略|交易计划|建.*计划|止损|期权|加仓方案|建仓)/.test(t)) return 'dyn-tradeplan';
  if (/(为什么跌|为什么亏|亏损来自|归因|影响多大|怎么回事)/.test(t)) return 'dyn-attribution';
  if (/\b(nvda|aapl|goog|tsm|amd|meta|msft|amzn|tsla|baba)\b/i.test(t)) return 'dyn-research';
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

/* Enter 发送 —— 设计哲学:输入框是唯一入口,GUI(主区) + LUI(chat) 都是反馈区
   铁律:任何成功触发动态布局的输入,回车后必须 chat 也响应 */
function sendG() {
  const inp = document.getElementById('gin'), t = inp.value.trim();
  if (!t) return;
  inp.value = '';
  document.getElementById('giBox').classList.remove('live-morph');
  document.getElementById('hintTip').classList.remove('show');
  const el = document.getElementById('chm');
  el.innerHTML += `<div class="ch-m user fi"><div class="ch-bub">${t}</div></div>`;
  el.scrollTop = el.scrollHeight;

  const m = t.match(/\b(NVDA|AAPL|TSLA|AMD|GOOG|MSFT|AMZN|META|TSM|BABA)\b/i);
  const tk = m ? m[1].toUpperCase() : null;

  // 路径 1: ticker + 追问意图词 → 完整 LongbridgeAI 7 段富回复(深度场景)
  if (tk && /(能追|追高|能买|能上车|可以买|该买|要不要买|值得买|该追)/.test(t)) {
    document.getElementById('chtag').classList.add('live');
    document.getElementById('chtag').textContent = '分析中';
    if (typeof lbaiChat === 'function') lbaiChat(t, tk);
    return;
  }

  // 路径 2: 触发了动态视图 → 中等深度 chat 解读流(指向主区)
  const viewId = currentDynViewId || classifyIntent(t);
  if (viewId) {
    document.getElementById('chtag').classList.add('live');
    document.getElementById('chtag').textContent = '分析中';
    chatRespondToView(viewId, t, tk);
    return;
  }

  // 路径 3: 没识别意图 → 提示用户可选意图
  setTimeout(() => {
    el.innerHTML += `<div class="ch-m bot fi"><div class="ch-bub">收到。我没识别到明确意图,你可以试试:</div></div>
      <div class="ch-sugs fi">
        <button class="ch-sug" onclick="clickSug(this)">分析持仓风险</button>
        <button class="ch-sug" onclick="clickSug(this)">NVDA 能追吗</button>
        <button class="ch-sug" onclick="clickSug(this)">对比 NVDA 和 AMD</button>
        <button class="ch-sug" onclick="clickSug(this)">今天为什么跌了</button>
      </div>`;
    el.scrollTop = el.scrollHeight;
  }, 400);
}

/* 为每个动态视图给出"指向主区"的 chat 解读流(LUI ↔ GUI 有机整合) */
function chatRespondToView(viewId, userInput, tk) {
  // 选股器走专属富回复(类似 lbaiChat 但内容是选股分析)
  if (viewId === 'dyn-screener' && typeof lbaiScreenerChat === 'function') {
    lbaiScreenerChat(userInput);
    return;
  }
  // 持仓风险走专属深度复盘流(5 段 + 建议策略 CTA)
  if (viewId === 'dyn-risk' && typeof lbaiRiskChat === 'function') {
    lbaiRiskChat(userInput);
    return;
  }
  // 归因诊断走大盘 4 段宏观分析(含来源 chip)
  if (viewId === 'dyn-attribution' && typeof lbaiAttributionChat === 'function') {
    lbaiAttributionChat(userInput);
    return;
  }
  // 标的研究:复用「AI 深度研究」按钮的同款富回复(lbaiChat 7 段)
  // Agent 面板由 renderDynResearch 在 live input 阶段已打开,此处不重复
  if (viewId === 'dyn-research' && tk && typeof lbaiChat === 'function') {
    lbaiChat(userInput, tk);
    return;
  }
  const el = document.getElementById('chm');
  const thinkingId = 'th-' + Date.now();
  el.innerHTML += `<div class="ch-m bot fi" id="${thinkingId}"><div class="ch-bub" style="background:transparent;border:1px dashed var(--bd);color:var(--ts)"><span class="dots"><span></span><span></span><span></span></span> 正在分析,主区已先行展示...</div></div>`;
  el.scrollTop = el.scrollHeight;

  const responses = {
    'dyn-risk': {
      tag: '风险审视',
      summary: '风险评分 <strong>72/100</strong>,核心问题:<strong>科技板块集中度 64%</strong>,远超 30% 健康线。',
      pointTo: '主区中部行业分布柱图把 AI 芯片(48%)单独标橙——这是组合最大单一风险源。',
      detail: 'NVDA + AMD + TSM 三只股票合计占组合 38%,Beta 都在 1.45 以上,下跌时同涨同跌。建议把单一标的上限设为 15%。',
      chips: ['生成再平衡建议','对比 NVDA 和 AMD','执行 AAPL 止损','哪些仓位应该减']
    },
    'dyn-compare': {
      tag: '对比决策',
      summary: '5 因子对比:<strong>NVDA 领先 3 项</strong>(成长 / 盈利 / EPS 修正),<strong>AMD 占优 1 项</strong>(估值更便宜)。',
      pointTo: '主区中间的 Factor Grades 表把差异行高亮了——估值那行 AMD B 比 NVDA C- 高一档,但成长 / 盈利两行 NVDA 都是 A+。',
      detail: '基于你已持有 NVDA 18%(集中度偏高),建议增加 AMD 敞口分散单一风险。建议配比 NVDA 12% / AMD 6%,组合 Beta 略降。',
      chips: ['建 AMD 策略','两个都买怎么分配','看 AMD 详情','为什么 NVDA 估值这么高']
    },
    'dyn-tradeplan': {
      tag: '策略 · ' + (tk || 'NVDA'),
      summary: '默认参数:<strong>Long Call $145 / 28 天 / 1 张</strong>,期权金 $850,占组合 1.8%,IRR ≈ 85%(假设 +10% 上涨)。',
      pointTo: '主区左侧 4 组参数都可改,右侧收益结构会实时重算——改完看 IRR 和 +10% 预期收益就知道这个策略的潜在收益结构。',
      detail: 'PortAI 推理:NVDA 突破 30 日高点 + TSM 扩产,30 天上探 $150-155 概率偏高。用期权而非加仓现货,避免集中度推到 22%+。',
      chips: ['调整为 Bull Call Spread','下单这个 Plan','看历史回测','换成 AMD 策略']
    },
    'dyn-research': {
      tag: '研究 · ' + (tk || 'NVDA'),
      summary: '综合评级 <strong>87/100 追涨(Strong Bullish)</strong>,5 因子里 3 项 A+/A,1 项 B+,1 项 C-。',
      pointTo: '主区顶部 hero 给了一句话定调,下面 5 因子告诉你为什么——估值 C- 是因为 P/E 68x 远超行业 24x,但成长 A+(+94% YoY)弥补了一部分。',
      detail: '同行业对比表里 ' + (tk || 'NVDA') + ' 行被高亮——P/E 是同行 1.6x,但营收增速是同行 4x,估值溢价有支撑但不便宜。',
      chips: [(tk || 'NVDA') + ' 能追吗','对比 AMD','建 ' + (tk || 'NVDA') + ' 策略','下次财报什么时候']
    },
    'dyn-attribution': {
      tag: '归因诊断',
      summary: '组合今日 -2.7%,核心拖累:<strong>NVDA -$614(贡献 47%)+ AAPL -$286(贡献 22%)</strong>,合计占 70% 损失。',
      pointTo: '主区瀑布图按损失贡献从大到小排,前两条柱子明显比其他长——这就是当前组合最脆弱的两个仓位。',
      detail: '7 成损失来自系统性因素(美债收益率急升 + 半导体板块普跌 -3.4%),3 成来自 NVDA 自身估值回调。短期建议止损 AAPL,NVDA 长期看法不变。',
      chips: ['执行 AAPL 止损','对比 NVDA 和 AMD','下跌评估','要不要清仓 AAPL']
    }
  };
  const r = responses[viewId] || responses['dyn-research'];

  if (typeof chatStream !== 'function') return;
  const stream = [
    [800, () => { const th = document.getElementById(thinkingId); if (th) th.remove(); }],
    [50, `<div class="ch-m bot fi"><div class="ch-ctx"><span class="ch-ctx-d"></span>已生成完整分析</div><div class="ch-bub">${r.summary}</div></div>`],
    [600, `<div class="ch-m bot fi"><div class="ch-bub" style="border-left:2px solid #06B6D4;background:rgba(6,182,212,.05);display:flex;gap:8px;align-items:flex-start"><span style="color:#06B6D4;flex-shrink:0;margin-top:1px">${icon('compass',13)}</span><span><strong>主区导览 ·</strong> ${r.pointTo}</span></div></div>`],
    [600, `<div class="ch-m bot fi"><div class="ch-bub">${r.detail}</div></div>`],
    [400, `<div class="ch-sugs fi">${r.chips.map(c => `<button class="ch-sug" onclick="clickSug(this)">${c}</button>`).join('')}</div>`]
  ];
  // 标的研究:在尾部追加 2 个跳转按钮(同类型 / 上下游股),复用已有的 findSimilarStocks / findStockChain
  if (viewId === 'dyn-research' && tk) {
    stream.push([400, `<div class="ch-m bot fi"><div class="ch-ai"><div class="ch-fups">
      <button class="ch-fup" onclick="findSimilarStocks('${tk}')"><span class="ch-fup-ic">✦</span>基于 ${tk} 查找同类型的股票</button>
      <button class="ch-fup" onclick="findStockChain('${tk}')"><span class="ch-fup-ic">✦</span>查找 ${tk} 的上下游股票</button>
    </div></div></div>`]);
  }
  stream.push([50, () => {
    const tag = document.getElementById('chtag');
    tag.classList.remove('live');
    tag.textContent = r.tag;
  }]);
  chatStream(stream);
}
