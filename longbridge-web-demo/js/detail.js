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

/* "Move forward with this trade plan" 之后激活的策略卡(显示在最左) */
let activeTradePlanCards = [];

/* Signal 详情 30 秒研究 chip 定时器 */
let signalResearchTimer = null;

/* ===== chip 动态生命周期 =====
   静态 chip 来源:S[sc].chips(写在 data.js)→ 转 warn 卡渲染
   动态 chip 来源:dynamicChips(buildTradePlan / Signal 30s 等运行时推送)
   每张 chip 都可关闭 + 点击导航 */
let dynamicChips = [];
let chipDismissedIds = new Set(); // 用户主动忽略过的 chip,刷新前不再推送

function chipExists(id) {
  return dynamicChips.some(c => c.id === id);
}

function pushChip(chip, opts) {
  // chip = { id, t, n, kind, tk, desc, status }
  // opts.force = true 时绕过 dismissed 黑名单(用于新一轮触发)
  if (!chip.id) chip.id = 'c-' + Math.random().toString(36).substr(2,6);
  if (opts && opts.force) chipDismissedIds.delete(chip.id);
  if (chipDismissedIds.has(chip.id)) return;
  if (chipExists(chip.id)) return;
  dynamicChips.push(chip);
  rerenderChipHosts();
}

function removeChipById(id) {
  const before = dynamicChips.length;
  dynamicChips = dynamicChips.filter(c => c.id !== id);
  if (before !== dynamicChips.length) rerenderChipHosts();
}

function rerenderChipHosts() {
  if (typeof renderHome === 'function' && cv === 'home') renderHome();
  if (typeof renderAW === 'function') renderAW();
}

/* 用户点 × 关闭 chip:静态 / 动态 都支持 */
function dismissChip(id) {
  // 先尝试动态
  if (chipExists(id)) {
    chipDismissedIds.add(id);
    removeChipById(id);
    return;
  }
  // 静态:从 S[sc].chips 移除(只本会话生效)
  const s = S[sc];
  if (s.chips) {
    const before = s.chips.length;
    s.chips = s.chips.filter(c => 'static-' + (c.t + '-' + c.n).replace(/\s+/g,'') !== id);
    if (before !== s.chips.length) rerenderChipHosts();
  }
}

/* chip 点击(非 × 区域)→ 按 kind 路由 */
function clickChip(kind, payload) {
  // payload 可能是 ticker 或 JSON
  if (kind === 'tp-progress' || kind === 'tp-ready') {
    // 跳转到 dyn-tradeplan
    if (typeof tryIntent === 'function') tryIntent('帮我建一个 ' + payload + ' Trade Plan');
  } else if (kind === 'signal-30s') {
    if (typeof openSignalDetail === 'function') openSignalDetail(payload);
  } else if (kind === 'static-tp') {
    if (typeof tryIntent === 'function') tryIntent('帮我建一个 ' + payload + ' Trade Plan');
  } else if (kind === 'static-signal') {
    if (typeof openSignalDetail === 'function') openSignalDetail(payload);
  }
}

/* 普通标的详情 */
function openDetail(tk, evTx) {
  const d = ddb[tk];
  if (!d) return;
  const dp = document.getElementById('dp');
  const arrow = d.p ? '▲' : '▼';
  const prevClose = (parseFloat(d.pr) - parseFloat(d.ch)).toFixed(2);
  // Day's range slider (low ── current ── high)
  const lo = parseFloat(d.lo), hi = parseFloat(d.hi), cur = parseFloat(d.pr);
  const dayPct = Math.max(0, Math.min(100, ((cur - lo) / (hi - lo)) * 100));
  // 52W placeholder: ±25% around current
  const wkLo = (cur * 0.75).toFixed(2), wkHi = (cur * 1.25).toFixed(2);
  const wkPct = ((cur - wkLo) / (wkHi - wkLo)) * 100;
  // Order book mock (5 levels)
  const bidRows = [
    [80, 145.320, 148.892, 43],
    [400, 145.121, 141.220, 214],
    [125, 145.315, 141.238, 459],
    [434, 145.315, 144.876, 803],
    [676, 148.001, 144.876, 238]
  ];
  const obRows = bidRows.map((r,i) => `<div class="dt-ob-row"><span class="dt-ob-bq">${r[0]}</span><span class="dt-ob-bp">${r[1].toFixed(3)}</span><span class="dt-ob-lv">${i+1}</span><span class="dt-ob-lv">${i+1}</span><span class="dt-ob-ap">${r[2].toFixed(3)}</span><span class="dt-ob-aq">${r[3]}</span></div>`).join('');
  // Capital flow mock
  const cfIn = {total:'681,276.47', large:'63,986.31', med:'285,917.06', small:'127,819.29'};
  const cfOut = {total:'649,459.28', large:'52,524.24', med:'308,628.52', small:'108,653.81'};

  // 公司介绍 mock(可来源 ddb,先用通用文案)
  const COMPANY_DESC = {
    NVDA: { sector:'半导体厂商', desc:'英伟达公司作为一家数据中心规模的人工智能基础设施公司运营。该公司通过两个部门运营,分别是计算与网络部门和图形部门。计算与网络部门提供数据中心加速计算和网络平台,以及人工智能解决方案和软件,汽车平台以及自动驾驶和电动汽车解决方案,包括软件。图…', mc:'5.08 万亿', mcChange:'+0.72%', industryMc:'12.44 万亿', rank:'1/87', segs:[['计算和网络','1935 亿','89.6%'],['图形','225 亿','10.4%']]},
    AAPL: { sector:'消费电子', desc:'苹果公司设计、生产并销售智能手机、个人电脑、平板电脑、可穿戴设备及配件,提供包括 iCloud / Apple Music 在内的各种相关服务。', mc:'3.04 万亿', mcChange:'+0.55%', industryMc:'4.20 万亿', rank:'1/12', segs:[['服务','968 亿','26%'],['iPhone','2018 亿','55%']]}
  };
  const co = COMPANY_DESC[tk] || { sector:d.cap?'综合':'—', desc:`${d.nm} 公司基本信息(mock)。在所属行业占据一定地位,业务结构相对稳定。`, mc:d.cap||'—', mcChange:'+0.10%', industryMc:'—', rank:'—', segs:[]};

  document.getElementById('dpInner').innerHTML = `
    <div class="dt-head">
      <div class="dt-logo">${d.tk.charAt(0)}</div>
      <div class="dt-head-info">
        <div class="dt-head-tk">${d.tk}<span class="dt-head-mkt">美</span></div>
        <div class="dt-nm">${d.nm}</div>
      </div>
      <div class="dt-head-act"><button title="设置提醒" aria-label="设置提醒">${icon("bell",14)}</button><button title="加入自选" aria-label="加入自选">${icon("star",14)}</button></div>
    </div>
    <div class="dt-price-row">
      <span class="dt-pr">$${d.pr}</span>
      <span class="dt-ch ${d.p?'positive':'negative'}">${arrow} ${d.pct} (${d.ch})</span>
    </div>
    <div class="dt-meta">最近更新 22:41:56 美东 · 夜盘 <span class="dt-meta-up">+0.38%</span></div>
    ${evTx?`<div class="dt-ctx"><div class="dt-ctx-l">触发事件</div><div class="dt-ctx-t">${evTx}</div></div>`:''}
    <div class="dt-meta-chips">
      <span class="dt-mchip">${icon('flame',11)} 关注度 Top 5</span>
      <span class="dt-mchip">更多标签 ›</span>
    </div>
    <div class="dt-kpi">
      <div><div class="dt-kpi-l">今开</div><div class="dt-kpi-v">$${d.op}</div></div>
      <div><div class="dt-kpi-l">最高</div><div class="dt-kpi-v">$${d.hi}</div></div>
      <div><div class="dt-kpi-l">最低</div><div class="dt-kpi-v">$${d.lo}</div></div>
      <div><div class="dt-kpi-l">昨收</div><div class="dt-kpi-v">$${prevClose}</div></div>
      <div><div class="dt-kpi-l">市值</div><div class="dt-kpi-v">${d.cap}</div></div>
      <div><div class="dt-kpi-l">P/E (TTM)</div><div class="dt-kpi-v">${d.pe}</div></div>
    </div>
    <div class="dt-chart-open">
      <div class="dt-chart"><canvas id="dc"></canvas></div>
      <span class="dt-chart-hi">${d.hi}</span>
      <span class="dt-chart-lo">${d.lo}</span>
    </div>
    <div class="dt-tf">
      ${['夜盘 ▾','5日','日K','周K','月K','年K'].map((t,i)=>`<span class="dt-tf-i ${i===0?'on':''}">${t}</span>`).join('')}
    </div>
    <div class="dt-tabs">
      <span class="dt-tab" data-tab="discuss">讨论</span>
      <span class="dt-tab" data-tab="news">资讯</span>
      <span class="dt-tab" data-tab="finance">财务</span>
      <span class="dt-tab on" data-tab="overview">概览</span>
    </div>

    <!-- 默认 概览 内容 -->
    <div class="dt-tabpane on" data-pane="overview">
      <!-- 公司百科 -->
      <div class="dt-sec-row">
        <span class="dt-sec">公司百科</span>
        <span class="dt-sec-link">查看更多 ›</span>
      </div>
      <div class="dt-co-card">
        <div class="dt-co-hd">
          <div class="dt-co-logo">${d.tk.charAt(0)}</div>
          <div class="dt-co-info">
            <div class="dt-co-name">${d.nm.replace(/(Corporation|Inc\.)$/,'').trim()}</div>
            <div class="dt-co-tk">${d.tk}.US</div>
          </div>
        </div>
        <div class="dt-co-desc">${co.desc}</div>
        <div class="dt-co-meta">
          <div class="dt-co-meta-row">
            <span class="dt-co-meta-l">${co.sector}</span>
            <span class="dt-co-meta-mc">${co.industryMc} <span class="positive">${co.mcChange}</span></span>
          </div>
          <div class="dt-co-meta-row">
            <span class="dt-co-meta-tk">${d.tk}.US</span>
            <span class="dt-co-meta-mcs">总市值 ${co.mc} · 市值排名 ${co.rank}</span>
          </div>
        </div>
      </div>

      <!-- 财务评分 -->
      <div class="dt-sec-row">
        <span class="dt-sec">财务评分</span>
        <span class="dt-sec-unit">29/04/2026 更新</span>
      </div>
      <div class="dt-fs-card">
        <div class="dt-fs-grade">
          <div class="dt-fs-letter">A</div>
          <div class="dt-fs-trend up">▲</div>
        </div>
        <div class="dt-fs-sec">${co.sector}产品行业</div>
        <div class="dt-fs-row3">
          <div><div class="dt-fs-row3-l">同行业排名</div><div class="dt-fs-row3-v">${co.rank.replace('/','/')}</div></div>
          <div><div class="dt-fs-row3-l">行业中位数</div><div class="dt-fs-row3-v">C</div></div>
          <div><div class="dt-fs-row3-l">行业平均值</div><div class="dt-fs-row3-v">C</div></div>
        </div>
      </div>
      <div class="dt-pill-tabs"><span class="dt-pill on">评分分析</span><span class="dt-pill">同行比较</span></div>
      <div class="dt-fs-tbl">
        <div class="dt-fs-tbl-hd"><span>指标</span><span>数值</span><span>评分</span></div>
        <div class="dt-fs-grp">
          <div class="dt-fs-grp-hd" data-fs-grp="prof">
            <span class="dt-fs-grp-fold">−</span>
            <span class="dt-fs-grp-t">盈利评分</span>
            <span class="dt-fs-grp-grade up">A ▼</span>
          </div>
          <div class="dt-fs-grp-bd open">
            <div class="dt-fs-tbl-row"><span>净资产收益率(ROE)</span><span class="mn">101.49%</span><span class="dt-fs-cell up">A ▼</span></div>
            <div class="dt-fs-tbl-row"><span>净利率</span><span class="mn">55.60%</span><span class="dt-fs-cell up">A ▼</span></div>
            <div class="dt-fs-tbl-row"><span>毛利率</span><span class="mn">71.07%</span><span class="dt-fs-cell up">A ▼</span></div>
          </div>
        </div>
        <div class="dt-fs-grp"><div class="dt-fs-grp-hd"><span class="dt-fs-grp-fold">+</span><span class="dt-fs-grp-t">成长评分</span><span class="dt-fs-grp-grade up">A ▼</span></div></div>
        <div class="dt-fs-grp"><div class="dt-fs-grp-hd"><span class="dt-fs-grp-fold">+</span><span class="dt-fs-grp-t">现金评分</span><span class="dt-fs-grp-grade">B ▼</span></div></div>
        <div class="dt-fs-grp"><div class="dt-fs-grp-hd"><span class="dt-fs-grp-fold">+</span><span class="dt-fs-grp-t">运营评分</span><span class="dt-fs-grp-grade up">A ▼</span></div></div>
        <div class="dt-fs-grp"><div class="dt-fs-grp-hd"><span class="dt-fs-grp-fold">+</span><span class="dt-fs-grp-t">负债评分</span><span class="dt-fs-grp-grade up">B ▲</span></div></div>
      </div>

      <!-- 机构观点 & 持股股东 -->
      <div class="dt-sec-row"><span class="dt-sec">机构观点 &amp; 持股股东</span></div>
      <div class="dt-an-hd">分析师评级 <span class="dt-sec-unit" style="margin-left:6px">28/04/2026</span></div>
      <div class="dt-an-row">
        <div class="dt-an-donut">
          <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="#005d54" stroke-width="12" stroke-dasharray="139 176" transform="rotate(-90 40 40)"/>
          <circle cx="40" cy="40" r="28" fill="none" stroke="#00ADA2" stroke-width="12" stroke-dasharray="22 176" stroke-dashoffset="-139" transform="rotate(-90 40 40)"/>
          <circle cx="40" cy="40" r="28" fill="none" stroke="#34D399" stroke-width="12" stroke-dasharray="9 176" stroke-dashoffset="-161" transform="rotate(-90 40 40)"/>
          <circle cx="40" cy="40" r="28" fill="none" stroke="#F59E0B" stroke-width="12" stroke-dasharray="3 176" stroke-dashoffset="-170" transform="rotate(-90 40 40)"/>
          <circle cx="40" cy="40" r="28" fill="none" stroke="#EF4444" stroke-width="12" stroke-dasharray="3 176" stroke-dashoffset="-173" transform="rotate(-90 40 40)"/></svg>
        </div>
        <div class="dt-an-list">
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#00ADA2"></span><span class="dt-an-l">强力推荐</span><span class="dt-an-v" style="color:#00ADA2">79%</span></div>
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#34D399"></span><span class="dt-an-l">买入</span><span class="dt-an-v">13%</span></div>
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#A7F3D0"></span><span class="dt-an-l">持有</span><span class="dt-an-v">5%</span></div>
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#FCA5A5"></span><span class="dt-an-l">跑输大盘</span><span class="dt-an-v">0%</span></div>
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#EF4444"></span><span class="dt-an-l">卖出</span><span class="dt-an-v">2%</span></div>
          <div class="dt-an-item"><span class="dt-an-dot" style="background:#7E8088"></span><span class="dt-an-l">无意见</span><span class="dt-an-v">2%</span></div>
        </div>
      </div>
      <div class="dt-an-legend">
        <span class="dt-an-leg"><span class="dt-an-leg-dot" style="background:#06B6D4"></span>股价 ${d.pr}</span>
        <span class="dt-an-leg"><span class="dt-an-leg-dot" style="background:#00ADA2"></span>预测最高价 380.000</span>
        <span class="dt-an-leg"><span class="dt-an-leg-dot" style="background:#EF4444"></span>预测最低价 140.000</span>
      </div>
      <div class="dt-an-chart"><canvas id="dt-an-chart"></canvas></div>
    </div>

    <!-- 讨论 / 资讯 / 财务 占位 tab -->
    <div class="dt-tabpane" data-pane="discuss"><div class="dt-empty">${icon('users',24)}<div>社区讨论</div><div class="dt-empty-d">暂无 mock 数据</div></div></div>
    <div class="dt-tabpane" data-pane="news"><div class="dt-empty">${icon('newspaper',24)}<div>资讯</div><div class="dt-empty-d">暂无 mock 数据</div></div></div>
    <div class="dt-tabpane" data-pane="finance"><div class="dt-empty">${icon('file-text',24)}<div>财务报表</div><div class="dt-empty-d">详细财报数据接入中</div></div></div>
  `;
  setTimeout(() => initDtOverviewCharts(d, co), 60);
  // tab 切换
  const tabs = document.querySelectorAll('#dpInner .dt-tab');
  const panes = document.querySelectorAll('#dpInner .dt-tabpane');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('on'));
    panes.forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    const target = document.querySelector(`#dpInner .dt-tabpane[data-pane="${t.dataset.tab}"]`);
    if (target) target.classList.add('on');
  }));
  // 评分组折叠
  document.querySelectorAll('#dpInner .dt-fs-grp-hd').forEach(hd => {
    hd.addEventListener('click', () => {
      const fold = hd.querySelector('.dt-fs-grp-fold');
      const bd = hd.nextElementSibling;
      if (!bd || !bd.classList.contains('dt-fs-grp-bd')) return;
      bd.classList.toggle('open');
      if (fold) fold.textContent = bd.classList.contains('open') ? '−' : '+';
    });
  });
  document.getElementById('dpFooter').innerHTML = `<div class="dt-actions">
    <button class="dt-act" onclick="analyzeStockInChat('${d.tk}')">${icon('chart-bar',14)} AI 深度研究</button>
    <button class="dt-act primary" onclick="buildTradePlan('${d.tk}')">${icon('zap',14)} 交易 ${d.tk}</button>
  </div>`;
  document.getElementById('dpBack')?.classList.remove('show');
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  document.getElementById('aw').classList.add('compact');
  document.getElementById('in').classList.add('compact');
  document.getElementById('chtag').textContent = '行情 · ' + d.tk;
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
/* 概览 tab 内三张 canvas 渲染:营收柱状图 + 分析师评级 donut(SVG 已直出)+ 股价预测折线图 */
function initDtOverviewCharts(d, co) {
  // 营收构成 — 多年柱状图
  const rev = document.getElementById('dt-rev-chart');
  if (rev) {
    const ctx = rev.getContext('2d');
    const w = rev.width = rev.parentElement.clientWidth;
    const h = rev.height = rev.parentElement.clientHeight = 180;
    const years = ['2013','2015','2017','2019','2021','2023','2025'];
    const seg1 = [3,4,5,8,12,55,178];   // 计算和网络(主)
    const seg2 = [12,16,20,28,32,40,55]; // 图形
    const max = Math.max(...seg1.map((v,i)=>v+seg2[i]));
    const padL = 36, padR = 8, padT = 16, padB = 26;
    const cw = w - padL - padR;
    const ch = h - padT - padB;
    const barW = cw / years.length * .55;
    const gap = cw / years.length;
    // Y 轴标签
    ctx.fillStyle = 'rgba(126,128,136,.6)'; ctx.font = '9px JetBrains Mono';
    ctx.fillText('2591 亿', 0, padT + 4);
    ctx.fillText('1296 亿', 0, padT + ch / 2 + 3);
    ctx.fillText('0', 24, padT + ch + 4);
    // bars
    years.forEach((y, i) => {
      const x = padL + i * gap + gap / 2 - barW / 2;
      const v1 = (seg1[i] / max) * ch;
      const v2 = (seg2[i] / max) * ch;
      // 图形(底部)
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x, padT + ch - v2, barW, v2);
      // 计算和网络(顶部叠加)
      ctx.fillStyle = '#00ADA2';
      ctx.fillRect(x, padT + ch - v2 - v1, barW, v1);
      // 年份
      ctx.fillStyle = 'rgba(126,128,136,.85)';
      ctx.font = '9px JetBrains Mono';
      ctx.fillText(y, x - 2, padT + ch + 16);
    });
  }
  // 股价 vs 预测最高/最低折线
  const an = document.getElementById('dt-an-chart');
  if (an) {
    const ctx = an.getContext('2d');
    const w = an.width = an.parentElement.clientWidth;
    const h = an.height = an.parentElement.clientHeight = 200;
    const padL = 28, padR = 8, padT = 12, padB = 20;
    const cw = w - padL - padR, ch = h - padT - padB;
    const max = 400;
    // y axis labels
    ctx.fillStyle = 'rgba(126,128,136,.6)';
    ctx.font = '9px JetBrains Mono';
    [0, 100, 200, 300, 400].forEach(v => {
      const y = padT + ch - (v / max) * ch;
      ctx.fillText(String(v), 0, y + 3);
      ctx.strokeStyle = 'rgba(255,255,255,.04)';
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cw, y); ctx.stroke();
    });
    const N = 60;
    const drawLine = (gen, color, width) => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = padL + (i / (N - 1)) * cw;
        const y = padT + ch - (gen(i) / max) * ch;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    };
    // 预测最高:从 50 涨到 380(上涨曲线)
    drawLine(i => 50 + (i / (N - 1)) * 330 + Math.sin(i * .4) * 6, '#00ADA2', 1.6);
    // 股价:中等增长
    drawLine(i => 30 + (i / (N - 1)) * 180 + Math.sin(i * .3) * 4, '#06B6D4', 1.6);
    // 预测最低:平缓增长
    drawLine(i => 20 + (i / (N - 1)) * 110 + Math.sin(i * .25) * 3, '#EF4444', 1.6);
  }
}

function closeDetail() {
  const dp = document.getElementById('dp');
  const dpMode = dp && dp.dataset.mode;
  const isAgentMode = dpMode && dpMode.endsWith('-agent');
  dp.classList.remove('open');
  document.body.classList.remove('dp-open');
  document.getElementById('aw').classList.remove('compact');
  if (!dynamic) document.getElementById('in').classList.remove('compact');
  dpHistory = [];
  document.getElementById('dpBack')?.classList.remove('show');
  document.getElementById('dpFooter').innerHTML = '';
  if (typeof signalResearchTimer !== 'undefined' && signalResearchTimer) {
    clearTimeout(signalResearchTimer);
    signalResearchTimer = null;
  }
  // Agent 模式关闭时,不重置 chat tag(用户仍在动态视图中)
  if (isAgentMode) {
    delete dp.dataset.mode;
    document.getElementById('dpInner').innerHTML = '';
  } else {
    restoreChatTag();
  }
}

/* 返回上一个 Detail 视图(历史栈) */
function dpGoBack() {
  if (dpHistory.length > 0) {
    const prev = dpHistory.pop();
    prev();
    if (dpHistory.length === 0) document.getElementById('dpBack')?.classList.remove('show');
  }
}

/* Build Trade Plan → 向 AI 工作台追加动态卡片并模拟进度 */
function buildTradePlan(tk) {
  const d = ddb[tk];
  if (!d) return;
  if (signalResearchTimer) { clearTimeout(signalResearchTimer); signalResearchTimer = null; }
  // 移除可能存在的 Signal 研究 chip(因为已经升级到 build trade plan 阶段)
  removeChipById('signal-30s-' + tk);
  // 推送 chip:Trade Plan 生成中(每次新触发都强制重置忽略状态)
  pushChip({id:'tp-progress-'+tk,t:'Trade Plan 生成中',n:tk,kind:'tp-progress',tk:tk,desc:'AI 正在评估最优策略',status:'warn'}, {force:true});
  // 如果已经存在同标的的"Signal 研究中" chip,转为"Trade Plan 生成中"而不是重复推送
  const idx = dynamicAWCards.findIndex(c => c.title === tk + ' Signal 研究中');
  if (idx >= 0) dynamicAWCards.splice(idx, 1);
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
      // chip 升级:tp-progress → tp-ready
      removeChipById('tp-progress-' + tk);
      pushChip({id:'tp-ready-'+tk,t:'Trade Plan 就绪',n:tk,kind:'tp-ready',tk:tk,desc:'草案已生成,待您确认',status:'warn'}, {force:true});
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

  const verdictLabel = d.fitLabel || (s.verdict === 'bullish' ? 'Strong bullish' : s.verdict === 'bearish' ? 'Strong bearish' : 'Neutral');
  const verdictArrow = s.verdict === 'bullish' ? '▲' : s.verdict === 'bearish' ? '▼' : '●';

  // Hero:SVG 渐变 banner + 玻璃箭头 + verdict 标签(无外部图片依赖)
  const heroIcon = s.verdict === 'bullish' ? 'trending-up' : s.verdict === 'bearish' ? 'trending-down' : 'activity';
  const heroLabel = s.verdict === 'bullish' ? 'Bullish' : s.verdict === 'bearish' ? 'Bearish' : 'Neutral';
  let h = `<div class="sd-hero-img ${s.verdict}">
    <span class="sd-hero-tag">${heroLabel}</span>
    <div class="sd-hero-arrow">${icon(heroIcon, 42)}</div>
  </div>
  <div class="sd-hero-text">
    <div class="sd-hero-chip">
      <span class="sd-hero-logo">${s.logo || s.tk.charAt(0)}</span>
      <span class="sd-hero-tk">${s.tk}</span>
      <span class="sd-hero-nm">${s.nm}${s.nm.endsWith('.')?'':' Inc.'}</span>
    </div>
    <div class="sd-hero-headline">${s.headline}</div>
    <div class="sd-hero-meta">${s.strategy} · ${s.time}</div>
  </div>`;

  h += `<div class="sd-body">`;

  // 迷你图(带事件圆点)
  h += `<div class="sd-chart2"><canvas id="sd-chart-${tk}"></canvas></div>`;

  // Final verdict
  h += `<div class="sd-sec">
    <h3 class="sd-h">Final verdict</h3>
    <div class="sd-verdict-big ${s.verdict}">
      <span class="sd-verdict-ic">${verdictArrow}</span>
      <span class="sd-verdict-txt">${verdictLabel}</span>
    </div>
    <div class="sd-kv">
      <div class="sd-kv-row"><span class="sd-kv-l">Target valuation</span><span class="sd-kv-v">${d.targetVal}</span></div>
      <div class="sd-kv-row"><span class="sd-kv-l">Price vs. target</span><span class="sd-kv-v ${s.verdict}">${d.priceVsTarget}</span></div>
      <div class="sd-kv-row"><span class="sd-kv-l">Strategy fit</span><span class="sd-kv-v">${d.fit}/100</span></div>
      <div class="sd-kv-row"><span class="sd-kv-l">Key catalyst</span><span class="sd-kv-v">${d.catalyst.split(':')[0]}</span></div>
    </div>
  </div>`;

  // 叙述段
  h += `<div class="sd-prose">
    <p>${s.desc}</p>
    <p>${d.process}</p>
  </div>`;

  // Quick takeaways 折叠
  const takeItems = d.factors.map(f => {
    const tone = f.c === 'g' ? 'ok' : f.c === 'r' ? 'bad' : f.c === 'o' ? 'warn' : 'muted';
    const label = f.c === 'g' ? 'Excellent' : f.c === 'r' ? 'Weak' : f.c === 'o' ? 'Watch' : 'N/A';
    const ic = f.c === 'g' ? '✓' : f.c === 'r' ? '✕' : f.c === 'o' ? '!' : '✕';
    return `<div class="sd-kt-row"><span class="sd-kt-l">• ${f.n}</span><span class="sd-kt-v ${tone}">${label} ${ic}</span></div>`;
  }).join('');
  h += `<div class="sd-acc" onclick="this.classList.toggle('open')">
    <div class="sd-acc-hd"><span>Quick takeaways</span><span class="sd-acc-ch">⌄</span></div>
    <div class="sd-acc-bd"><div class="sd-kt">${takeItems}</div></div>
  </div>`;

  h += `<div class="sd-div"></div>`;

  // Related catalysts
  h += `<div class="sd-sec">
    <h3 class="sd-h">Related catalysts</h3>
    <div class="sd-cat">
      <div class="sd-cat-t">${d.catalyst}</div>
      <div class="sd-cat-d">${d.catalystDesc}</div>
      <div class="sd-cat-meta">
        <span class="sd-cat-avatars"><span class="sd-cat-av ${s.verdict}">${verdictArrow}</span><span class="sd-cat-av-group">${icon("newspaper",12)}</span></span>
        <span class="sd-cat-src">${d.catalystSrc}</span>
      </div>
      <div class="sd-cat-time">26 mins ago</div>
    </div>
  </div>`;

  h += `<div class="sd-div"></div>`;

  // Strategy fit score:大数字 + 描述 + Key takeaways 列表
  h += `<div class="sd-sec">
    <h3 class="sd-h">Strategy fit score</h3>
    <div class="sd-fit-big" style="color:${vc}">${d.fit}<span class="sd-fit-unit">/100</span></div>
    <p class="sd-fit-desc">Strategy fit score measures how well ${s.tk.split('.')[0]} aligns with ${s.strategy} standards.</p>
    <div class="sd-kt-title">Key takeaways</div>
    <div class="sd-kt">${takeItems}</div>
  </div>`;

  // Analysis process 折叠
  h += `<div class="sd-acc" onclick="this.classList.toggle('open')">
    <div class="sd-acc-hd"><span class="sd-acc-ic">${icon("clipboard",12)}</span><span>Analysis process</span><span class="sd-acc-ch">⌄</span></div>
    <div class="sd-acc-bd">
      <div class="sd-prose" style="padding:0"><p><strong>Objective</strong><br>${d.objective}</p><p><strong>Risk</strong><br>${d.risk}</p></div>
    </div>
  </div>`;

  h += `</div>`;

  document.getElementById('dpInner').innerHTML = h;
  document.getElementById('dpFooter').innerHTML = `<div class="sd-cta"><button class="sd-cta-b" onclick="analyzeSignalInChat('${tk}')">Analyze with AI</button><button class="sd-cta-b primary" onclick="draftTradePlanInChat('${tk}')">Draft trade plan</button></div>`;
  dp.classList.add('open');
  document.body.classList.add('dp-open');
  document.getElementById('aw').classList.add('compact');
  document.getElementById('in').classList.add('compact');
  document.getElementById('chtag').textContent = 'Signal · ' + s.tk;
  // 画迷你图
  setTimeout(() => {
    const c = document.getElementById('sd-chart-' + tk);
    if (!c) return;
    const ctx = c.getContext('2d'), w = c.width = c.parentElement.clientWidth, ht = c.height = c.parentElement.clientHeight;
    const pts = []; let y = ht * .5;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - (vb ? .42 : .58)) * 2.5;
      y = Math.max(ht * .15, Math.min(ht * .85, y));
      pts.push({x, y});
    }
    const rgb = vb ? '0,173,162' : '239,68,68';
    const g = ctx.createLinearGradient(0, 0, 0, ht);
    g.addColorStop(0, `rgba(${rgb},.12)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath(); ctx.moveTo(0, ht);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, ht); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = `rgba(${rgb},.7)`; ctx.lineWidth = 1.5; ctx.stroke();
    const last = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},1)`; ctx.fill();
  }, 300);
  // 30 秒未生成 Trade Plan 时,推送 chip + Signal 研究任务
  if (signalResearchTimer) clearTimeout(signalResearchTimer);
  signalResearchTimer = setTimeout(() => {
    // 推 chip(每次重新打开 Signal 都重置忽略状态)
    pushChip({id:'signal-30s-'+s.tk,t:'Signal 研究',n:s.tk,kind:'signal-30s',tk:s.tk,desc:'已查看 >30s,建议生成 Trade Plan',status:'warn'}, {force:true});
    // 同步推 dynamicAWCard 任务(原有行为保留)
    const exists = dynamicAWCards.some(c => c.title === s.tk + ' Signal 研究中');
    if (!exists) {
      dynamicAWCards.push({status:'run',title:s.tk+' Signal 研究中',desc:'已查看 Signal 详情 >30 秒,AI 追加研究...',kv:[['标的',s.tk],['策略',s.strategy]],progress:20,actions:['查看','中断']});
      renderAW();
    }
  }, 30000);
}

/* ========== Signal 详情 CTA → 驱动 Chat 面板 ========== */

/* 分步向 Chat 追加内容(模拟流式生成);每步可以是 HTML 字符串或函数 */
function chatStream(steps) {
  const el = document.getElementById('chm');
  let delay = 0;
  steps.forEach(([wait, action]) => {
    delay += wait;
    setTimeout(() => {
      if (typeof action === 'function') {
        action(el);
      } else {
        const tmp = document.createElement('div');
        tmp.innerHTML = action;
        while (tmp.firstChild) el.appendChild(tmp.firstChild);
      }
      el.scrollTop = el.scrollHeight;
    }, delay);
  });
  return delay;
}

/* 折叠/展开 LongbridgeAI 检索过程节 */
function toggleChAcc(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
  document.getElementById('chm').scrollTop = document.getElementById('chm').scrollHeight;
}

/* ============ LongbridgeAI 「能追吗?」 富对话流 ============ */
function lbaiChat(query, tk) {
  tk = tk || 'NVDA';
  const cnName = {NVDA:'英伟达',AAPL:'苹果',TSLA:'特斯拉',AMD:'AMD',GOOG:'谷歌',MSFT:'微软',AMZN:'亚马逊',META:'Meta',TSM:'台积电',BABA:'阿里巴巴'}[tk] || tk;
  const today = new Date(), prev = new Date(today.getTime() - 5*86400000);
  const dStr = prev.toISOString().slice(0,10);
  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const accId2 = 'ai-acc-' + Math.random().toString(36).substr(2,5);

  // Step 1: 检索您的相关记忆(默认折叠) + 关键数据检索
  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">检索您的相关记忆</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-acc-l">检索您的对应日期记忆摘要</div>
        <span class="ch-mem-chip">${dStr}</span>
      </div>
    </div>
    <div class="ch-acc" id="${accId2}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId2}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">根据关键词获取匹配的股票</span>
          <span class="ch-tool-chip">获取技术指标信号</span>
          <span class="ch-tool-chip">获取股票相关新闻</span>
          <span class="ch-tool-chip">获取估值指标</span>
        </div>
      </div>
    </div>
  </div></div>`;

  // Step 2: 免责 + 引言
  const introHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-disc">LongbridgeAI 不是持牌投资顾问,以下内容旨在提供信息和情景汇编,不构成任何投资建议或买卖推荐。</div>
    <div class="ch-prose">关于是否在此时「追高」${cnName}(${tk}),我们需要从<strong>技术面</strong>、<strong>估值水平</strong>以及<strong>基本面催化剂</strong>等多个维度进行客观的情景拆解。</div>
  </div></div>`;

  // Step 3: 章节 1 — 技术面
  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">1. 技术面与资金情绪:强势但伴随超买信号</div>
    <div class="ch-prose">从最新的技术指标来看,${cnName}目前展现出较强的多头排列,但短线累积了较高的情绪热度:</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>趋势强劲</strong>:移动平均线(MA)呈现典型的多头排列(Bullish Alignment),MACD 的 DEA 和 DIFF 均处于零轴上方,显示整体上升趋势仍在延续。期权市场也显示出极高的热度,近期看涨期权占比高达 72%<span class="ch-cite">longbridge.com</span>。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>超买风险显现</strong>:CCI(顺势指标)突破 100 进入超买区间,同时 RSI(相对强弱指标)在超买水平出现了死叉信号,乖离率(BIAS)也提示了极度超买状态。这意味著短期内价格可能面临技术性回调或震荡的压力。</span></div>
  </div></div>`;

  // Step 4: 章节 2 — 估值
  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">2. 估值水平:处于历史中枢地带</div>
    <div class="ch-prose">目前的估值水平反映了市场对其未来增长的高预期:</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>市盈率(P/E)</strong>:当前动态 PE 约为 42.15 倍。对比过去 10 年的数据,其市盈率区间大致在 38 倍至 77 倍之间。目前的估值处于历史中位数(约 52 倍)下方,相较于前几年的极值并不算极端昂贵,但绝对值依然反映了较高的成长溢价。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>市销率(P/S)</strong>:当前 P/S 约为 23.4 倍,高于行业中位数,但也处于其自身过去三年(24 倍至 35 倍)的合理波动区间内。</span></div>
  </div></div>`;

  // Step 5: 章节 3 — 产业基本面
  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">3. 产业基本面:算力需求与成本博弈</div>
    <div class="ch-prose">从近期的行业动态来看,AI 基础设施的底层逻辑依然坚挺,但也出现了新的变量:</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>算力依旧是核心支出</strong>:最新数据显示,头部 AI 企业(如 Anthropic 等)的算力支出占总成本高达 57% 至 70%,且支出规模往往是营收的 2 到 3 倍<span class="ch-cite">longbridge.com</span>。这保证了${cnName}作为「卖铲人」的短期业绩能见度。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>模型迭代带来持续需求</strong>:近期市场上出现了 GPT-5.5 和 DeepSeek-V4 等新一代模型。${cnName}也宣布支持这些新模型的发布,显示其在全球 AI 算力底座中不可替代的地位<span class="ch-cite">longbridge.com +1</span>。</span></div>
  </div></div>`;

  // Step 6: 情景推演
  const sec4HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">情景推演与应对思路</div>
    <div class="ch-prose">投资者在面对强势股时,通常可以参考以下几种情景:</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>情景 A(右侧顺势)</strong>:如果相信 AI 产业的资本开支(CapEx)在未来几个季度将持续超出华尔街预期,且宏观环境(如纳斯达克整体复苏<span class="ch-cite">longbridge.com</span>)继续配合,部分市场参与者可能会选择在趋势中跟随。但这种情景下,通常需要具备较强的风险承受能力以应对短期波动。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>情景 B(耐心等待技术修复)</strong>:鉴于当前多个技术指标(RSI、CCI)已经发出超买预警,另一部分市场参与者可能会选择等待股价出现技术性回调、均线乖离率修复后,再寻求更具安全边际的切入点,从而降低短期被套的风险。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>情景 C(分批建仓)</strong>:面对长期基本面优质但短期价格较高的标的,许多机构投资者会采用分批买入的策略,以平滑整体的持仓成本,避免单一时间点下注的择时风险。</span></div>
  </div></div>`;

  // Step 7: 来源 + 反馈 + 后续追问(深度问题 4 条 + 跳转 nav 2 条)
  const sourceHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <span class="ch-srcs">4 来源 <span class="ch-srcs-cv">›</span></span>
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button></div>
    <div class="ch-fups">
      <button class="ch-fup" onclick="tryIntent('技术指标显示超买风险,应否短线减仓?')"><span class="ch-fup-ic">✦</span>技术指标显示超买风险,应否短线减仓?</button>
      <button class="ch-fup" onclick="tryIntent('当前 42 倍 PE 有何增长假设支撑?')"><span class="ch-fup-ic">✦</span>当前 42 倍 PE 有何增长假设支撑?</button>
      <button class="ch-fup" onclick="tryIntent('算力成本占比变化如何影响盈利?')"><span class="ch-fup-ic">✦</span>算力成本占比变化如何影响盈利?</button>
      <button class="ch-fup" onclick="tryIntent('AI 资本开支增速对行业影响如何?')"><span class="ch-fup-ic">✦</span>AI 资本开支增速对行业影响如何?</button>
      <button class="ch-fup" onclick="findSimilarStocks('${tk}')"><span class="ch-fup-ic">✦</span>基于 ${tk} 查找同类型的股票</button>
      <button class="ch-fup" onclick="findStockChain('${tk}')"><span class="ch-fup-ic">✦</span>查找 ${tk} 的上下游股票</button>
    </div>
  </div></div>`;

  chatStream([
    [200, procHTML],
    [600, introHTML],
    [800, sec1HTML],
    [900, sec2HTML],
    [900, sec3HTML],
    [900, sec4HTML],
    [600, sourceHTML],
    [0, () => {
      const tag = document.getElementById('chtag');
      tag.classList.remove('live');
      // 回到当前主视图的 tag(动态视图 / 详情列 / 静态视图)
      if (typeof dynamic !== 'undefined' && dynamic && typeof currentDynViewId !== 'undefined' && typeof DYN_VIEW_TAGS !== 'undefined') {
        const t = DYN_VIEW_TAGS[currentDynViewId];
        tag.textContent = t ? (t + (tk ? ' · ' + tk : '')) : '分析完成';
      } else {
        tag.textContent = '分析完成';
      }
    }]
  ]);
}

/* AI 智能选股器:对话里输出选股分析(参照 chat 截图 3-6 的结构) */
function lbaiScreenerChat(query) {
  // 每次新一轮选股请求,重置主区到空态(用户必须再点 CTA 才能填充)
  if (typeof screenerApplied !== 'undefined') {
    screenerApplied = false;
    screenerSaved = false;
    screenerMode = 'default';
    if (typeof renderDynScreener === 'function') renderDynScreener();
  }
  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const accId2 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const today = new Date(), prev = new Date(today.getTime() - 7*86400000);
  const dStr = prev.toISOString().slice(0,10);

  // 顶部:用户右对齐气泡(用户输入"中概股中的潜力股")— 已经由 sendG 显示,这里给一个角落 chip 标识
  const topicHTML = `<div class="ch-m bot fi"><div class="ch-ai" style="display:flex;justify-content:flex-end"><span class="ch-screener-chip">中概股中的潜力股</span></div></div>`;

  // 折叠节 1:检索您的相关记忆
  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">检索您的相关记忆</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-acc-l">检索您的对应日期记忆摘要</div>
        <span class="ch-mem-chip">${dStr}</span>
      </div>
    </div>
    <div class="ch-acc" id="${accId2}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId2}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">获取选股器配置</span>
          <span class="ch-tool-chip">查阅完整数据</span>
          <span class="ch-tool-chip">获取筛选股票列表</span>
          <span class="ch-tool-chip">全部 (4) ›</span>
        </div>
      </div>
    </div>
  </div></div>`;

  // §1 整体选股分析
  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">1. 整体选股分析</div>
    <div class="ch-prose">中概股作为在美上市的中国企业代表,具有独特的投资价值和成长潜力。在当前市场环境下,中概股面临着政策环境、市场预期和全球宏观经济的多重考验,但同时也孕育着结构性机会。从投资逻辑来看,筛选中概股潜力股需要重点关注以下几个方面:</div>
    <div class="ch-prose">首先,<strong>市值规模</strong>是衡量企业市场地位的重要指标。市值超过 5 亿美元的公司通常具备一定的市场认可度和流动性,能够更好地抵御市场波动风险。其次,<strong>营收增长</strong>是判断企业成长性的核心指标,特别是在当前经济环境下,能够保持正增长的公司往往具备更强的业务韧性和市场竞争力。</div>
    <div class="ch-prose">从<strong>行业分布</strong>来看,中概股主要集中在互联网科技、消费服务、新能源等新兴领域。这些行业不仅受益于中国庞大的内需市场,也顺应了全球数字化转型和绿色发展的趋势。在筛选过程中,需要特别关注企业的盈利能力、运营效率和财务健康状况。</div>
  </div></div>`;

  // §2 前三名股票分析
  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">2. 前三名股票分析</div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">1</span><span class="ch-stock-name">富途控股</span><span class="ch-stock-tk">(FUTU.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">投资银行和经纪</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">155.11 美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">217.5 亿美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营收增幅</span><span class="ch-stock-v positive">76.05%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">净利润增幅</span><span class="ch-stock-v positive">108.18%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">ROE</span><span class="ch-stock-v positive">33.34%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营业净利率</span><span class="ch-stock-v positive">53.76%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市盈率</span><span class="ch-stock-v">15.55</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>作为领先的互联网券商,富途控股在数字化金融服务领域具有显著优势,营收和利润双双高速增长,盈利能力突出。</div>
    </div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">2</span><span class="ch-stock-name">小鹏汽车</span><span class="ch-stock-tk">(XPEV.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">汽车制造商</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">16.15 美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">154.4 亿美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营收增幅</span><span class="ch-stock-v positive">89.45%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">净利润增幅</span><span class="ch-stock-v positive">80.14%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">ROE</span><span class="ch-stock-v negative">-3.70%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营业净利率</span><span class="ch-stock-v negative">-1.49%</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>作为新能源汽车领域的代表企业,小鹏汽车在智能化技术和产品创新方面具备竞争力,营收增长强劲,但盈利能力仍需改善。</div>
    </div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">3</span><span class="ch-stock-name">网易</span><span class="ch-stock-tk">(NTES.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">电子游戏与多媒体</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">111.76 美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">707.7 亿美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营收增幅</span><span class="ch-stock-v positive">7.94%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">净利润增幅</span><span class="ch-stock-v positive">14.72%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">ROE</span><span class="ch-stock-v positive">22.58%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营业净利率</span><span class="ch-stock-v positive">29.98%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市盈率</span><span class="ch-stock-v">15.16</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>作为老牌互联网企业,网易在游戏、音乐、教育等多个领域布局完善,盈利能力稳定,估值相对合理。</div>
    </div>
  </div></div>`;

  // §3 推荐选股条件
  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">3. 推荐选股条件</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>市场:</strong>美国</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>主题标签:</strong>中概股</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>筛选指标:</strong>市值 ≥ 5 亿美元,营收增幅 ≥ 0%</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>排序:</strong>按营收增幅由高到低</span></div>
  </div></div>`;

  // 反馈 icon 行 + Signal-style CTA(在 icon 行下方)
  const ctaHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button></div>
    <button class="ch-cta-primary" onclick="applyScreenerFromChat()">
      <span class="ch-cta-ic">✦</span><span class="ch-cta-l">在选股器中查看</span><span class="ch-cta-arrow">→</span>
    </button>
  </div></div>`;

  chatStream([
    [200, topicHTML],
    [400, procHTML],
    [800, sec1HTML],
    [1000, sec2HTML],
    [900, sec3HTML],
    [500, ctaHTML],
    [0, () => {
      const tag = document.getElementById('chtag');
      tag.classList.remove('live');
      tag.textContent = '智能选股 · 中概股';
    }]
  ]);
}

/* CTA「在选股器中查看」点击:
   1) 主区从空态切到填充态(4 个筛选条件 + 351 只表格)
   2) 关闭 dp 详情列里的 Agent 动效卡(任务完成)
   3) chat 推送 Signal-style 成功气泡 + 「保存选股」主按钮
   4) chat tag 同步 */
/* 选股器模式:default (中概股潜力股 4 条件) / similar-{tk} (类同标的 5 条件) / chain-{tk} (上下游)*/
let screenerMode = 'default';

function applyScreenerFromChat(mode) {
  if (mode) screenerMode = mode;
  // 1) 切主区填充态
  screenerApplied = true;
  if (typeof dynamic !== 'undefined' && !dynamic) {
    if (typeof previousView !== 'undefined') previousView = cv;
    if (typeof enterDynamic === 'function') enterDynamic('dyn-screener', '中概股中的潜力股');
    if (typeof currentDynViewId !== 'undefined') currentDynViewId = 'dyn-screener';
  } else {
    document.querySelectorAll('.vw').forEach(el => el.classList.remove('on'));
    document.getElementById('v-dyn-screener').classList.add('on');
    if (typeof renderDynamicView === 'function') renderDynamicView('dyn-screener');
    currentDynViewId = 'dyn-screener';
  }
  const mc = document.getElementById('mc');
  if (mc) mc.scrollTop = 0;

  // 2) 关闭 detail 列(Agent 动效卡)
  const dp = document.getElementById('dp');
  const dpMode = dp && dp.dataset.mode;
  if (dpMode && dpMode.endsWith('-agent')) {
    dp.classList.remove('open');
    document.body.classList.remove('dp-open');
    delete dp.dataset.mode;
    document.getElementById('dpInner').innerHTML = '';
  }

  // 2) chat 推送成功气泡 + 保存按钮(按 mode 选不同 KV 与数量)
  const isDefault = !screenerMode || screenerMode === 'default';
  const successKvs = isDefault ? [
    ['市场', '🇺🇸 美国'],
    ['市值', '≥ 10 亿美元'],
    ['营业净利率', '≥ 10%'],
    ['股息率(TTM)', '≥ 3%']
  ] : [
    ['市场', '🇺🇸 美国'],
    ['行业', '半导体厂商'],
    ['主题和概念', 'AI / AI 算力核心 / +2 ...'],
    ['市值', '≥ 1000 亿美元']
  ];
  const successCount = isDefault ? 351 : 14;
  const successFootRest = isDefault ? '按营收增幅由高到低' : '按市值从高到低';
  const successHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-success-bub">
      <div class="ch-success-hd">
        <div class="ch-success-ic">✓</div>
        <div class="ch-success-t">筛选条件已应用</div>
        <span class="ch-success-st">主区已展示</span>
      </div>
      <div class="ch-success-kvs">
        ${successKvs.map(([k,v]) => `<div class="ch-success-kv"><span class="ch-success-k">${k}</span><span class="ch-success-v">${v}</span></div>`).join('')}
      </div>
      <div class="ch-success-foot">符合条件的证券 <strong>${successCount}</strong> 只 · ${successFootRest}</div>
    </div>
    <button class="ch-cta-primary" id="chSaveScreenerBtn" onclick="saveScreenerFromChat()">
      <span class="ch-cta-ic">⊟</span><span class="ch-cta-l">保存选股</span><span class="ch-cta-arrow">→</span>
    </button>
  </div></div>`;
  if (typeof chatStream === 'function') {
    chatStream([
      [200, successHTML],
      [0, () => {
        const tag = document.getElementById('chtag');
        if (tag) { tag.classList.remove('live'); tag.textContent = '智能选股 · 已应用'; }
      }]
    ]);
  }
}

/* chat 内点击「保存选股」:等同于左侧主区「保存」按钮 */
function saveScreenerFromChat() {
  if (screenerSaved) return;
  screenerSaved = true;
  // 同步左侧主区按钮
  const mainBtn = document.getElementById('scSaveBtn');
  if (mainBtn) {
    mainBtn.textContent = '✓ 已保存';
    mainBtn.classList.add('saved');
  }
  // chat 内本按钮变态
  const chatBtn = document.getElementById('chSaveScreenerBtn');
  if (chatBtn) {
    chatBtn.classList.add('saved');
    chatBtn.disabled = true;
    chatBtn.innerHTML = `<span class="ch-cta-ic">✓</span><span class="ch-cta-l">已保存到「我的选股」</span>`;
  }
  // 根据 screenerMode 计算结果数量(给 toast 用)
  const isSimilar = typeof screenerMode === 'string' && screenerMode.startsWith('similar-');
  const resCount = isSimilar ? 14 : 351;
  // chat 追加确认 toast 气泡
  const el = document.getElementById('chm');
  if (el) {
    el.insertAdjacentHTML('beforeend', `<div class="ch-m bot fi"><div class="ch-bub" style="background:rgba(6,182,212,.08);border:1px solid rgba(6,182,212,.25);color:#06B6D4;font-size:11px"><strong>✓ 选股已保存</strong> · 你可以在「自选 → 智能选股」分组查看,后续 ${resCount} 只证券变化会有动态提醒。</div></div>`);
    el.scrollTop = el.scrollHeight;
  }

  // 如果是 similar-{tk} 模式(从个股详情研究路径过来),保存后恢复原个股详情面板
  if (isSimilar) {
    const originTk = screenerMode.replace('similar-','');
    setTimeout(() => {
      if (typeof openDetail === 'function' && ddb[originTk]) {
        openDetail(originTk);
      }
    }, 700); // 等 toast 显出再切回详情
  }
}

/* 主区「保存」按钮点击:复用 chat 路径(等价) */
function saveScreenerFromMainArea() {
  if (screenerSaved) return;
  saveScreenerFromChat();
}

/* Analyze with AI:对话里追问当前标的分析(分步加载) */
function analyzeSignalInChat(tk) {
  const s = signalDB[tk];
  if (!s) return;
  const code = s.tk.split('.')[0];
  const d = s.detail;
  const vcls = s.verdict;
  const tone = s.verdict === 'bullish' ? '看多' : s.verdict === 'bearish' ? '看空' : '中性';
  const factorList = d.factors.map(f => {
    const ic = f.c === 'g' ? '✓' : f.c === 'r' ? '✕' : f.c === 'o' ? '!' : '—';
    const cls = f.c === 'g' ? 'ok' : f.c === 'r' ? 'bad' : f.c === 'o' ? 'warn' : 'muted';
    return `<li class="${cls}"><span>${f.n}</span><span class="chc-ic">${ic} ${f.v}</span></li>`;
  }).join('');
  const mid = 'chm-' + Date.now();

  // 1. 用户气泡 → 2. Thinking... → 3. Thinking completed + 概要 → 4. 分析卡头 → 5. 逐段 → 6. 反馈 + 动作
  chatStream([
    [0,   `<div class="ch-m user fi"><div class="ch-bub">Analyze ${s.tk} — ${s.headline}</div></div>`],
    [250, `<div class="ch-m bot fi" id="${mid}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [1100, () => {
      const m = document.getElementById(mid);
      if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub">Based on <strong>${s.strategy}</strong>, ${code} currently rates <strong class="${vcls}">${d.fit}/100 · ${tone}</strong>. Key points below.</div></div>`],
    [400, `<div class="ch-m bot fi"><div class="chc chc-analyze">
      <div class="chc-hd">
        <div class="chc-logo">${s.logo || code.charAt(0)}</div>
        <div class="chc-hd-info"><div class="chc-hd-t">${s.tk} Analysis</div><div class="chc-hd-s">${s.strategy}</div></div>
        <span class="chc-chip ${vcls}">${d.fitLabel || tone}</span>
      </div>
      <div class="chc-sec-t">Final verdict</div>
      <div class="chc-kv"><span>Target valuation</span><span>${d.targetVal}</span></div>
      <div class="chc-kv"><span>Price vs. target</span><span class="${vcls}">${d.priceVsTarget}</span></div>
      <div class="chc-kv"><span>Strategy fit</span><span>${d.fit}/100</span></div>
      <div class="chc-kv"><span>Key catalyst</span><span>${d.catalyst.split(':')[0]}</span></div>
      <div class="chc-sec-t">Key takeaways</div>
      <ul class="chc-list">${factorList}</ul>
      <div class="chc-note">${d.objective}</div>
    </div></div>`],
    [500, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    [200, `<div class="ch-m bot fi"><div class="ch-actions">
      <button class="ch-act-b" onclick="draftTradePlanInChat('${tk}')">✦ Draft trade plan</button>
      <button class="ch-act-b" onclick="tryIntent('深入分析 ${code} 估值')">✦ Explore valuation</button>
    </div></div>`]
  ]);
  document.getElementById('chtag').textContent = 'Signal · ' + s.tk;
}

/* Draft trade plan:生成交易计划卡(分步加载) */
function draftTradePlanInChat(tk) {
  const s = signalDB[tk];
  if (!s) return;
  // 已进入 Trade Plan 阶段,移除 Signal 研究 chip
  removeChipById('signal-30s-' + tk);
  const code = s.tk.split('.')[0];
  const pr = parseFloat(s.pr);
  const tp = (pr * 1.10).toFixed(2);
  const sl = (pr * 0.95).toFixed(2);
  const costLo = (pr * 0.96).toFixed(0), costHi = (pr * 0.98).toFixed(0);
  const mid = 'chm-' + Date.now();
  const cardId = 'chc-' + Date.now();

  chatStream([
    [0,   `<div class="ch-m user fi"><div class="ch-bub">Build a trade plan based on {${code} signal strategy + ${s.strategy}}</div></div>`],
    [300, `<div class="ch-m bot fi" id="${mid}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [1400, () => {
      const m = document.getElementById(mid);
      if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub">Following up on the signal of the strategy you choose, combined with your investment preference, risk tolerance, here we've made a trade plan of <strong>increasing ${code} position</strong> with appropriate TP/SL based on your holdings and buying power.</div></div>`],
    // 卡头骨架
    [500, `<div class="ch-m bot fi"><div class="chc chc-plan" id="${cardId}">
      <div class="chc-hd">
        <div class="chc-logo apple">${s.logo || code.charAt(0)}</div>
        <div class="chc-hd-info"><div class="chc-hd-t">${code} Trade plan</div><div class="chc-hd-s">${s.nm}${s.nm.endsWith('.')?'':'.Inc'}</div></div>
        <span class="chc-chip generated">Generated</span>
      </div>
    </div></div>`],
    // Overview 标题
    [400, () => {
      const c = document.getElementById(cardId);
      if (c) c.insertAdjacentHTML('beforeend', `<div class="chc-sec-t plan fi-up">Overview</div>`);
    }],
    // Step 1
    [300, () => {
      const c = document.getElementById(cardId);
      if (c) c.insertAdjacentHTML('beforeend', `<div class="chc-step fi-up"><span class="chc-num">1</span><div class="chc-step-body"><div class="chc-step-t">Target position</div><div class="chc-step-d">Allocation: 10% of total portfolio</div><div class="chc-step-d">Cost range: $${costLo}-$${costHi}</div><div class="chc-step-d">Plan expiry: March 5th, 2026</div></div></div>`);
    }],
    // Step 2
    [300, () => {
      const c = document.getElementById(cardId);
      if (c) c.insertAdjacentHTML('beforeend', `<div class="chc-step fi-up"><span class="chc-num">2</span><div class="chc-step-body"><div class="chc-step-t">Rebalancing &amp; risk control</div><div class="chc-step-d">Style: Conservative</div><div class="chc-step-d">Rule: If a callback triggers the EMA 20-day moving average, generate a rebalancing order for 30% of the planned position.</div></div></div>`);
    }],
    // Step 3
    [300, () => {
      const c = document.getElementById(cardId);
      if (c) c.insertAdjacentHTML('beforeend', `<div class="chc-step fi-up"><span class="chc-num">3</span><div class="chc-step-body"><div class="chc-step-t">Exit strategy</div><div class="chc-step-d">Take profit: $${tp} (+10%)</div><div class="chc-step-d">Stop loss: $${sl} (-5%)</div></div></div>`);
    }],
    // Execution details
    [400, () => {
      const c = document.getElementById(cardId);
      if (c) c.insertAdjacentHTML('beforeend', `<div class="chc-divline"></div><div class="chc-sec-t plan fi-up">Execution details</div><div class="chc-exec fi-up">
        <div class="chc-exec-row"><div class="chc-exec-date"><div class="chc-exec-d">4</div><div class="chc-exec-m">Mar</div></div><div class="chc-exec-txt"><div>Buy 100 shares with market order</div><div class="chc-exec-sub">TP $${tp}, SL $${sl}</div></div></div>
        <div class="chc-exec-row"><div class="chc-exec-date"><div class="chc-exec-d">5</div><div class="chc-exec-m">Mar</div></div><div class="chc-exec-txt"><div>Buy 100 shares with market order</div><div class="chc-exec-sub">TP $${tp}, SL $${sl}</div></div></div>
        <div class="chc-exec-row"><div class="chc-exec-date"><div class="chc-exec-d">6</div><div class="chc-exec-m">Mar</div></div><div class="chc-exec-txt"><div>Buy 100 shares with market order</div><div class="chc-exec-sub">TP $${tp}, SL $${sl}</div></div></div>
      </div><div class="chc-note fi-up">Note: If the market price exceeds $${costHi}, execution will be postponed to the next day, through March 5.</div><div class="chc-disclaimer fi-up">*Trade plan is subject to market conditions and may require adjustments. Always consult with a financial advisor before making investment decisions.</div>`);
    }],
    // 后续冲突提示
    [600, `<div class="ch-m bot fi"><div class="ch-bub">There is already a trade plan <strong class="bullish">Active</strong> for ${code}. To move forward with the new signal you send, we will need to <strong class="bearish">terminate the former trade plan</strong>, and <strong class="bearish">cancel all corresponding pending orders</strong>.</div></div>`],
    [300, `<div class="ch-m bot fi"><div class="ch-bub">How does this plan look to you? Let me know if you're happy with it, or if we should keep refining things to better fit your goals.</div></div>`],
    [300, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    [200, `<div class="ch-m bot fi"><div class="ch-actions">
      <button class="ch-act-b" onclick="moveForwardTradePlan('${tk}')">✦ Move forward with this trade plan</button>
      <button class="ch-act-b" onclick="increaseTargetPosition('${tk}')">✦ Increase target position</button>
      <button class="ch-act-b" onclick="tellMeMoreAboutTradePlan('${tk}')">✦ Tell me more about trade plan</button>
    </div></div>`]
  ]);
  document.getElementById('chtag').textContent = 'Trade plan · ' + code;
}

/* ========== 三个跟进按钮的处理 ========== */

/* 1. Move forward with this trade plan:激活策略 + 推送两段 bot 消息 */
async function moveForwardTradePlan(tk) {
  const s = signalDB[tk];
  if (!s) return;
  const code = s.tk.split('.')[0];
  const pr = parseFloat(s.pr);
  const tp = (pr * 1.10).toFixed(2);
  const sl = (pr * 0.95).toFixed(2);

  // 二次确认 modal — 防误触下单
  if (typeof confirmModal === 'function') {
    const ok = await confirmModal({
      title: '确认激活 Trade Plan?',
      body: `<strong>${code}</strong> 策略将立即提交订单到券商系统,激活后 AI 工作台会持续监控止盈 / 止损线。`,
      kv: [
        ['标的', code, ''],
        ['方向 / 类型', '买入 · Long Call', ''],
        ['仓位', '100 股', ''],
        ['当前价', '$' + pr.toFixed(2), ''],
        ['止盈', '$' + tp, 'up'],
        ['止损', '$' + sl, 'dn']
      ],
      level: 'warn',
      okText: '确认下单',
      cancelText: '再想想'
    });
    if (!ok) return;
  }

  // 用户已下单,清掉 tp-ready / signal-30s / tp-progress 等所有相关 chip
  removeChipById('tp-ready-' + tk);
  removeChipById('tp-progress-' + tk);
  removeChipById('signal-30s-' + tk);

  // 1) 在 AI 工作台最左侧插入"激活中"的 trade plan 卡
  const cardKey = code + ' Trade Plan';
  const newCard = {
    status: 'activating',
    title: cardKey,
    desc: '订单提交中 · AI 准备执行',
    kv: [['止盈','$'+tp],['止损','$'+sl],['仓位','100 股']],
    actions: ['查看','取消']
  };
  // 防重复
  const idx = activeTradePlanCards.findIndex(c => c.title === cardKey);
  if (idx >= 0) activeTradePlanCards.splice(idx, 1);
  activeTradePlanCards.unshift(newCard);
  if (typeof renderHome === 'function' && cv === 'home') renderHome();
  if (typeof renderAW === 'function') renderAW();
  // 触发"挤开右侧"动效
  requestAnimationFrame(() => {
    const firstCard = document.querySelector('.aw-inline-grid .aw-card');
    if (firstCard) {
      firstCard.classList.add('aw-just-added');
      setTimeout(() => firstCard.classList.remove('aw-just-added'), 600);
    }
  });

  // 2) 用户气泡 + 两段 bot 反馈(各自 thinking → completed → 内容)
  const m1 = 'chm-' + Date.now();
  const m2 = 'chm-' + (Date.now() + 1);
  chatStream([
    [0,   `<div class="ch-m user fi"><div class="ch-bub">Move forward with this trade plan</div></div>`],
    // 第一段:确认已激活
    [300, `<div class="ch-m bot fi" id="${m1}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [900, () => {
      const m = document.getElementById(m1); if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub">Sure! Your trade plan is now active. I'll notify you once the orders have been submitted.</div></div>`],
    [300, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    // 第二段:订单已提交
    [800, `<div class="ch-m bot fi" id="${m2}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [1100, () => {
      const m = document.getElementById(m2); if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub"><div class="ch-bub-hd"><span class="ch-bub-ic-ok">${icon("check-circle",16)}</span><span class="ch-bub-ttl">Order submitted</span></div>1 order submitted! I've placed an order for 100 shares of ${code} at market price.<div class="ch-bub-kv">Take profit price: <strong>$${tp}</strong><br>Stop loss price: <strong>$${sl}</strong></div>I'll keep monitoring market trends and continue executing your trade plan.<br><br>If you'd like to learn more about the order details or adjust the trade plan, just let me know.</div></div>`],
    // 与"Order submitted"同步:策略卡 激活中 → 运行中
    [0, () => {
      const c = activeTradePlanCards.find(x => x.title === cardKey);
      if (c) {
        c.status = 'run';
        c.desc = '订单已提交 · AI 实时监控';
        c.progress = 12;
        if (typeof renderHome === 'function' && cv === 'home') renderHome();
        if (typeof renderAW === 'function') renderAW();
      }
    }],
    [300, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    [200, `<div class="ch-m bot fi"><div class="ch-actions">
      <button class="ch-act-b" onclick="tryIntent('查看 ${code} 订单详情')">✦ View order details</button>
      <button class="ch-act-b" onclick="tryIntent('${code} trade plan 进展如何')">✦ How is my trade plan progressing?</button>
    </div></div>`]
  ]);
}

/* 2. Tell me more about trade plan:介绍 Trade Plan 概念 */
function tellMeMoreAboutTradePlan(tk) {
  const mid = 'chm-' + Date.now();
  chatStream([
    [0,   `<div class="ch-m user fi"><div class="ch-bub">Tell me more about trade plan</div></div>`],
    [300, `<div class="ch-m bot fi" id="${mid}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [1000, () => {
      const m = document.getElementById(mid); if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub">Sure! the Trade Plan is an AI-powered investment strategy built by Longbridge AI based on your investment goals, risk tolerance, trading permissions, and historical trading patterns.</div></div>`],
    [400, `<div class="ch-m bot fi"><div class="ch-bub">It generates personalized trading plans and automatically produces actionable order instructions.</div></div>`],
    [400, `<div class="ch-m bot fi"><div class="ch-bub">The system also continuously tracks your trades and analyzes performance and P&amp;L, helping you invest with greater simplicity and professionalism.</div></div>`],
    [300, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    [200, `<div class="ch-m bot fi"><div class="ch-actions">
      <button class="ch-act-b" onclick="moveForwardTradePlan('${tk}')">✦ Move forward with this trade plan</button>
      <button class="ch-act-b" onclick="increaseTargetPosition('${tk}')">✦ Increase target position</button>
    </div></div>`]
  ]);
}

/* 3. Increase target position:增加目标仓位流程 */
function increaseTargetPosition(tk) {
  const s = signalDB[tk]; if (!s) return;
  const code = s.tk.split('.')[0];
  const mid = 'chm-' + Date.now();
  chatStream([
    [0,   `<div class="ch-m user fi"><div class="ch-bub">Increase target position</div></div>`],
    [300, `<div class="ch-m bot fi" id="${mid}"><div class="ch-ctx ch-ctx-thinking"><span class="ch-ctx-d pulse"></span><span class="ch-ctx-txt">Thinking</span><span class="dots"><i></i><i></i><i></i></span></div></div>`],
    [1000, () => {
      const m = document.getElementById(mid); if (!m) return;
      m.querySelector('.ch-ctx-txt').textContent = 'Thinking completed';
      m.querySelector('.ch-ctx-d').classList.remove('pulse');
      const dots = m.querySelector('.dots'); if (dots) dots.remove();
    }],
    [100, `<div class="ch-m bot fi"><div class="ch-bub">I can increase the target allocation for ${code} from <strong>10%</strong> to <strong>15%</strong> of your portfolio. This will require an additional buy of approximately <strong>50 shares</strong> at market price, with the same TP/SL applied.</div></div>`],
    [400, `<div class="ch-m bot fi"><div class="ch-bub">Would you like me to update the trade plan accordingly?</div></div>`],
    [300, `<div class="ch-m bot fi"><div class="ch-feedback"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="点赞" title="点赞">${icon("thumbs-up",13)}</button><button aria-label="点踩" title="点踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button><button aria-label="分享" title="分享">${icon("send",13)}</button></div></div>`],
    [200, `<div class="ch-m bot fi"><div class="ch-actions">
      <button class="ch-act-b primary" onclick="moveForwardTradePlan('${tk}')">✦ Confirm and move forward</button>
      <button class="ch-act-b" onclick="tellMeMoreAboutTradePlan('${tk}')">✦ Tell me more about trade plan</button>
    </div></div>`]
  ]);
}

/* ============================================================
   AI 深度研究 chat 流(从个股详情底部"AI 深度研究"按钮触发)
   流程:用户气泡 → 检索过程折叠节 → 3 段研究 → 总结 → 来源/反馈 + 2 ✦ 后续追问
   ============================================================ */
function analyzeStockInChat(tk) {
  const d = ddb[tk];
  if (!d) return;
  const cnName = (d.nm || '').replace(/(Corporation|Inc\.|Inc)$/,'').trim() || tk;
  const tag = document.getElementById('chtag');
  if (tag) { tag.classList.add('live'); tag.textContent = '深度研究中'; }

  const el = document.getElementById('chm');
  el.innerHTML += `<div class="ch-m user fi"><div class="ch-bub">看看 ${cnName}（${tk}）的完整研究</div></div>`;
  el.scrollTop = el.scrollHeight;

  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);

  // 工具调用
  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">获取实时行情</span>
          <span class="ch-tool-chip">获取财务指标</span>
          <span class="ch-tool-chip">获取产业新闻</span>
          <span class="ch-tool-chip">获取分析师评级</span>
        </div>
      </div>
    </div>
  </div></div>`;

  const introHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose">以下是对${cnName}(${tk})最新市场数据、基本面及近期动态的综合分析:</div>
  </div></div>`;

  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">1. 市场表现与股价走势</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>最新报价:</strong>截至最近一个交易日收盘,${cnName}股价报 <strong>${d.pr} 美元</strong>,今年以来(YTD)累计上涨 <strong>12.20%</strong>。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>近期趋势:</strong>从 K 线数据来看,${cnName}在 3 月底曾短暂回调至 165 美元附近,随后在 4 月份展开了强劲的反弹,并在近期创下了 <strong>216.82 美元</strong>的 52 周新高。近几个交易日股价在冲高后出现了小幅回落(最近单日跌幅约 1.8%),属于高位震荡整理<span class="ch-cite">longbridge.com +1</span>。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>市值规模:</strong>目前总市值已达到约 <strong>5.08 兆美元</strong>,持续稳居全球超大市值科技股前列。</span></div>
  </div></div>`;

  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">2. 估值与基本面健康度</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>本益比(P/E):</strong>目前滚动本益比(PE TTM)约为 <strong>42.35 倍</strong>。值得注意的是,其远期本益比(Forward PE)显著下降至 <strong>29.59 倍</strong>,这表明市场对${cnName}未来的盈利增长依然抱有极高的预期。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>每股盈余(EPS):</strong>过去十二个月的 EPS 为 <strong>4.94 美元</strong>,而市场预期的远期 EPS 将增长至约 <strong>7.07 美元</strong>,反映出其 AI 晶片业务的强劲利润转化能力。</span></div>
  </div></div>`;

  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">3. 产业动态与近期催化剂</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>下一代架构推进(利多):</strong>供应链端传出最新进展,三星电子已宣布面向${cnName}下一代的 <strong>Vera Rubin</strong> 平台,率先启动行业 HBM4 记忆体的大规模生产及销售<span class="ch-cite">longbridge.com</span>。这意味著${cnName}新一代晶片的量产节奏正在顺利推进,有望继续保持硬体规格上的领先优势。</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>科技巨头算力多元化(潜在竞争):</strong>Meta 执行长近期表示,公司正在大规模部署 AMD 晶片,以作为对全新${cnName}算力系统的配套补充<span class="ch-cite">longbridge.com</span>。这反映出虽然${cnName}依然是 AI 算力的绝对核心,但下游的大型科技公司(CSP)出于成本和供应链安全的考量,正在积极引入「二供」(如 AMD)或自研晶片,这可能会在长期对市场份额产生微妙影响。</span></div>
  </div></div>`;

  const conclusionHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose"><strong>总结来说:</strong>${cnName}目前基本面依然十分强劲,下一代架构的供应链进展顺利,支撑了市场对其未来利润高增长的预期(远期 PE 不到 30 倍)。短期内股价在创下历史新高后有小幅获利了结的迹象,投资者后续可重点关注大型科技公司的资本支出(CapEx)指引以及 Vera Rubin 平台的具体交付时间表。</div>
  </div></div>`;

  const sourceHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <span class="ch-srcs">4 来源 <span class="ch-srcs-cv">›</span></span>
    <div class="ch-act-icons">
      <button aria-label="复制" title="复制">${icon("copy",13)}</button>
      <button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button>
      <button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button>
      <button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button>
    </div>
    <div class="ch-fups">
      <button class="ch-fup" onclick="findSimilarStocks('${tk}')"><span class="ch-fup-ic">✦</span>基于 ${tk} 查找同类型的股票</button>
      <button class="ch-fup" onclick="findStockChain('${tk}')"><span class="ch-fup-ic">✦</span>查找 ${tk} 的上下游股票</button>
    </div>
  </div></div>`;

  if (typeof chatStream === 'function') chatStream([
    [200, procHTML],
    [600, introHTML],
    [800, sec1HTML],
    [800, sec2HTML],
    [800, sec3HTML],
    [600, conclusionHTML],
    [400, sourceHTML],
    [0, () => {
      if (tag) { tag.classList.remove('live'); tag.textContent = '深度研究 · ' + tk; }
    }]
  ]);
}

/* ============================================================
   "基于 NVDA 查找同类型股票" 流程触发
   - 用户气泡:基于 NVDA 查找同类型的股票
   - detail 列从个股详情切到 Agent 等待面板
   - 主区从个股 → dyn-screener 空态
   - chat 输出选股分析(为类同标的定制)+ 在选股器中查看 CTA
   ============================================================ */
function findSimilarStocks(tk) {
  const el = document.getElementById('chm');
  el.innerHTML += `<div class="ch-m user fi"><div class="ch-bub">基于 ${tk} 查找同类型的股票</div></div>`;
  el.scrollTop = el.scrollHeight;

  // 关闭当前个股详情(保留 dp 面板,改用 Agent 模式)
  const dp = document.getElementById('dp');
  if (dp) {
    document.getElementById('dpFooter').innerHTML = '';
  }

  // 切到 dyn-screener 空态
  if (typeof dynamic !== 'undefined' && !dynamic) {
    if (typeof previousView !== 'undefined') previousView = cv;
    if (typeof enterDynamic === 'function') enterDynamic('dyn-screener', '基于 ' + tk + ' 查找同类型的股票');
    if (typeof currentDynViewId !== 'undefined') currentDynViewId = 'dyn-screener';
  } else {
    document.querySelectorAll('.vw').forEach(el2 => el2.classList.remove('on'));
    document.getElementById('v-dyn-screener').classList.add('on');
    if (typeof renderDynamicView === 'function') renderDynamicView('dyn-screener');
    currentDynViewId = 'dyn-screener';
  }

  // 重置 screener 状态到空态(强制 Agent 面板出来)
  if (typeof screenerApplied !== 'undefined') {
    screenerApplied = false;
    screenerSaved = false;
    screenerMode = 'similar-' + tk;
    if (typeof renderDynScreener === 'function') renderDynScreener();
  }

  // chat 流式输出"类同标的"分析
  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const accId2 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const today = new Date(), prev = new Date(today.getTime() - 7*86400000);
  const dStr = prev.toISOString().slice(0,10);

  const topicHTML = `<div class="ch-m bot fi"><div class="ch-ai" style="display:flex;justify-content:flex-end"><span class="ch-screener-chip">基于 ${tk} 查找同类型股票</span></div></div>`;

  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">检索您的相关记忆</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-acc-l">检索您的对应日期记忆摘要</div>
        <span class="ch-mem-chip">${dStr}</span>
      </div>
    </div>
    <div class="ch-acc" id="${accId2}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId2}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">获取选股器配置</span>
          <span class="ch-tool-chip">查阅完整数据</span>
          <span class="ch-tool-chip">获取行业可比公司</span>
          <span class="ch-tool-chip">全部 (4) ›</span>
        </div>
      </div>
    </div>
  </div></div>`;

  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">1. 整体选股分析</div>
    <div class="ch-prose">基于 ${tk}(${(ddb[tk]||{}).nm||tk})寻找同类型股票,需要重点关注其在半导体行业的核心地位、AI 技术的领先优势以及高成长性特征。${tk} 作为全球 AI 芯片的领导者,在 GPU 计算、自动驾驶、数据中心等领域具有显著的技术优势。同类型股票应具备相似的行业属性、技术壁垒和成长潜力。</div>
    <div class="ch-prose">半导体行业作为科技创新的基础设施,涵盖了从芯片设计、制造到应用的完整产业链。<strong>AI 芯片公司</strong>尤其值得关注,因为人工智能技术的快速发展为相关企业带来了巨大的市场机遇。在选择同类型股票时,需要综合考虑<strong>市值规模、营收增长、技术实力和行业地位</strong>等因素。</div>
  </div></div>`;

  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">2. 前三名股票分析</div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">1</span><span class="ch-stock-name">英伟达</span><span class="ch-stock-tk">(${tk}.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">半导体厂商</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">$${(ddb[tk]||{}).pr||'—'}</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">${(ddb[tk]||{}).cap||'5.08 万亿美元'}</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市盈率</span><span class="ch-stock-v">${(ddb[tk]||{}).pe||'42.35'}</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">ROE</span><span class="ch-stock-v positive">101.49%</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营业净利率</span><span class="ch-stock-v positive">55.60%</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>全球 AI 芯片领导者,在 GPU 计算、数据中心和自动驾驶领域具有绝对优势,技术护城河深厚。</div>
    </div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">2</span><span class="ch-stock-name">博通</span><span class="ch-stock-tk">(AVGO.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">半导体厂商</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">$1782.50</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">8210 亿美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营收增幅</span><span class="ch-stock-v positive">+47%</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>定制化 AI 加速器(ASIC)的核心供应商,与 Google TPU、Meta MTIA 深度绑定,享受 CSP 算力多元化趋势的红利。</div>
    </div>
    <div class="ch-stock-card">
      <div class="ch-stock-hd"><span class="ch-stock-num">3</span><span class="ch-stock-name">超微半导体</span><span class="ch-stock-tk">(AMD.US)</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">行业</span><span class="ch-stock-v">半导体厂商</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">最新价</span><span class="ch-stock-v">$167.44</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">市值</span><span class="ch-stock-v">2680 亿美元</span></div>
      <div class="ch-stock-kv"><span class="ch-stock-k">营收增幅</span><span class="ch-stock-v positive">+24%</span></div>
      <div class="ch-stock-hl"><strong>亮点:</strong>AI 算力的"二供"代表,MI300 / MI325X 加速器获得 Meta 等头部 CSP 大规模采购,估值相对 NVDA 更具吸引力。</div>
    </div>
  </div></div>`;

  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">3. 推荐选股条件</div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>市场:</strong>美国</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>行业:</strong>半导体厂商</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>主题标签:</strong>半导体、AI、AI 算力核心、英伟达持仓股</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>筛选指标:</strong>市值 ≥ 1000 亿美元,营收增幅 ≥ 10%</span></div>
    <div class="ch-bul"><span class="ch-bul-d"></span><span class="ch-bul-b"><strong>排序:</strong>按市值从高到低</span></div>
  </div></div>`;

  const ctaHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button></div>
    <button class="ch-cta-primary" onclick="applyScreenerFromChat('similar-${tk}')">
      <span class="ch-cta-ic">✦</span><span class="ch-cta-l">在选股器中查看</span><span class="ch-cta-arrow">→</span>
    </button>
  </div></div>`;

  if (typeof chatStream === 'function') chatStream([
    [200, topicHTML],
    [400, procHTML],
    [800, sec1HTML],
    [1000, sec2HTML],
    [800, sec3HTML],
    [500, ctaHTML],
    [0, () => {
      const tag = document.getElementById('chtag');
      if (tag) { tag.classList.remove('live'); tag.textContent = '智能选股 · 类同 ' + tk; }
    }]
  ]);
}

/* "查找上下游股票" — 暂复用 findSimilar 的流程,文案稍变(产业链上下游) */
function findStockChain(tk) {
  // 简化版:直接复用 findSimilar(实际数据来源不同,后续可接入产业链 API)
  if (typeof findSimilarStocks === 'function') findSimilarStocks(tk);
}

/* ============================================================
   持仓风险富分析流(dyn-risk 触发后,chat 端深度复盘 + 建议策略 CTA)
   - 任务/数据检索 折叠节
   - §1 持仓分布(stacked bar)
   - §2 风险维度逐一拆解(逐股 高/中/低 风险卡)
   - §3 组合层面风险评估(集中/币种/地域/Beta)
   - §4 风险摘要表 + 免责
   - CTA「建议策略」
   ============================================================ */
function lbaiRiskChat(query) {
  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const accId2 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const today = new Date(), prev = new Date(today.getTime() - 7*86400000);
  const dStr = prev.toISOString().slice(0,10);

  // 持仓数据(取自 holdings 数组 + 风险定级)
  const sorted = holdings.slice().sort((a,b) => b.pct - a.pct);
  const total = sorted.reduce((s,h) => s + h.pct, 0);
  const colors = ['#00ADA2','#06B6D4','#8B5CF6','#FBBF24','#F472B6','#34D399','#A78BFA','#F87171'];
  const lvlMap = { o:{l:'高',c:'#EF4444'}, r:{l:'中',c:'#FBBF24'}, g:{l:'低',c:'#10B981'} };

  // 顶部:topic chip
  const topicHTML = `<div class="ch-m bot fi"><div class="ch-ai" style="display:flex;justify-content:flex-end"><span class="ch-screener-chip" style="background:#F472B6;color:#000">分析持仓风险</span></div></div>`;

  // 折叠:任务列表 + 关键数据检索
  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">任务列表</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-task"><span class="ch-task-ck done">✓</span><span class="ch-task-l">获取当前时间与市场背景</span></div>
        <div class="ch-task"><span class="ch-task-ck done">✓</span><span class="ch-task-l">查询用户持仓资讯</span></div>
        <div class="ch-task"><span class="ch-task-ck done">✓</span><span class="ch-task-l">获取持仓股票的实时行情与市场指标</span></div>
        <div class="ch-task"><span class="ch-task-ck active"></span><span class="ch-task-l">查询持仓股票的技术指标与最新资讯</span></div>
      </div>
    </div>
    <div class="ch-acc" id="${accId2}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId2}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">获取详细账户信息</span>
          <span class="ch-tool-chip">获取证券实时行情</span>
          <span class="ch-tool-chip">获取实时行情指标</span>
          <span class="ch-tool-chip">查阅 Beta / VaR</span>
          <span class="ch-tool-chip">全部 (5) ›</span>
        </div>
      </div>
    </div>
  </div></div>`;

  // §1 持仓分布(stacked bar + legend)
  const stackedSegs = sorted.map((h, i) => `<span class="ch-stack-seg" style="width:${(h.pct/total*100).toFixed(1)}%;background:${colors[i%colors.length]}" title="${h.tk} ${h.pct}%"></span>`).join('');
  const stackedLegend = sorted.map((h, i) => `<div class="ch-stack-row">
    <span class="ch-stack-dot" style="background:${colors[i%colors.length]}"></span>
    <span class="ch-stack-l">${h.nm} (${h.tk}.US)</span>
    <span class="ch-stack-pct">${h.pct.toFixed(1)}%</span>
  </div>`).join('');
  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">一、持仓分布概览</div>
    <div class="ch-prose">当前账户共 <strong>${sorted.length}</strong> 个持仓标的,涵盖 AI 芯片、消费电子、互联网、软件、金融 5 个行业。前三大持仓合计占比 <strong>${(sorted.slice(0,3).reduce((s,h)=>s+h.pct,0)).toFixed(0)}%</strong>,集中度偏高。</div>
    <div class="ch-stack-bar">${stackedSegs}</div>
    <div class="ch-stack-legend">${stackedLegend}</div>
  </div></div>`;

  // §2 风险维度逐一拆解(选 3 个代表:NVDA 高 / AAPL 中 / BRK.B 低)
  const riskCards = [
    { tk:'NVDA', nm:'英伟达', lvl:'o', sub:'AI 芯片 · 18% 仓位',
      sections:[
        { l:'今日走势',  v:'$142.68 (+3.08%) · 突破 30 日新高 $143.51' },
        { l:'技术面',    v:'多头排列 (MA5 > MA10 > MA20),但 RSI 68.4 趋于超买;布林带上轨突破' },
        { l:'基本面',    v:'PE(TTM) 68.4x,远高于行业 24.1x;但成长 +94% YoY、ROE 91% 强支撑' },
        { l:'风险结论',  v:'短期估值偏高,集中度首位 (18%),可考虑期权替代加仓 / 止盈分批' }
      ]},
    { tk:'AAPL', nm:'苹果', lvl:'r', sub:'消费电子 · 14% 仓位',
      sections:[
        { l:'今日走势',  v:'$198.32 (-2.31%) · 跌破 $200 心理关口' },
        { l:'技术面',    v:'MA5 跌破 MA20,MACD 死叉初现;RSI 42 中性偏弱' },
        { l:'基本面',    v:'PE 31.4x,服务业务毛利 71% 提供安全垫;下周四财报' },
        { l:'风险结论',  v:'技术面短期承压,但财报有望催化;建议设 $195 止损线' }
      ]},
    { tk:'BRK.B', nm:'Berkshire', lvl:'g', sub:'金融 · 10% 仓位',
      sections:[
        { l:'今日走势',  v:'$398.00 (+0.30%) · 走势平稳' },
        { l:'技术面',    v:'多空均线粘合,Beta 仅 0.88,组合稳定器' },
        { l:'基本面',    v:'PE 10.8x,现金储备充足;一季报超预期' },
        { l:'风险结论',  v:'低风险底仓,建议持有不动作' }
      ]}
  ];
  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">二、风险维度逐一拆解</div>
    ${riskCards.map(rc => `<div class="ch-risk-card lv-${rc.lvl}">
      <div class="ch-risk-hd">
        <span class="ch-risk-dot" style="background:${lvlMap[rc.lvl].c}"></span>
        <span class="ch-risk-lvl">${lvlMap[rc.lvl].l}风险项</span>
        <span class="ch-risk-tk">${rc.nm} (${rc.tk}.US)</span>
        <span class="ch-risk-sub">${rc.sub}</span>
      </div>
      ${rc.sections.map(s => `<div class="ch-risk-row">
        <span class="ch-risk-row-l">${s.l}</span>
        <span class="ch-risk-row-v">${s.v}</span>
      </div>`).join('')}
    </div>`).join('')}
  </div></div>`;

  // §3 组合层面风险评估(4 类风险 bullet)
  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">三、组合层面风险评估</div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#EF4444"></span><span class="ch-bul-b"><strong>集中度风险:</strong>NVDA 占 <strong>18%</strong> 为最大持仓;NVDA + AMD + TSM 合计 <strong>38%</strong>,AI 芯片板块单一行业暴露明显。</span></div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#FBBF24"></span><span class="ch-bul-b"><strong>Beta 风险:</strong>组合加权 Beta 1.42,高于 SPY 42%;NVDA (1.72) / AMD (1.88) 拉高敏感度,下跌行情放大幅度。</span></div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#FBBF24"></span><span class="ch-bul-b"><strong>币种风险:</strong>美股持仓 100% USD 计价,无对冲安排;若 USD/CNH 走弱将吞噬部分浮盈。</span></div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#10B981"></span><span class="ch-bul-b"><strong>流动性风险:</strong>所有持仓均为 S&amp;P 500 大盘股,日均成交 >$5B,流动性充足。</span></div>
  </div></div>`;

  // §4 风险摘要表 + 免责
  const sec4HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">四、风险摘要与关注点</div>
    <div class="ch-risk-tbl">
      <div class="ch-risk-tbl-hd"><span>风险类型</span><span>等级</span><span>主要标的</span></div>
      <div class="ch-risk-tbl-row"><span>集中度风险</span><span class="ch-risk-tbl-l"><span class="ch-risk-dot" style="background:#EF4444"></span>高</span><span>NVDA 占 18%</span></div>
      <div class="ch-risk-tbl-row"><span>科技板块估值</span><span class="ch-risk-tbl-l"><span class="ch-risk-dot" style="background:#FBBF24"></span>中</span><span>NVDA / MSFT / META</span></div>
      <div class="ch-risk-tbl-row"><span>Beta 高敏感度</span><span class="ch-risk-tbl-l"><span class="ch-risk-dot" style="background:#FBBF24"></span>中</span><span>NVDA / AMD</span></div>
      <div class="ch-risk-tbl-row"><span>币种 / 汇率</span><span class="ch-risk-tbl-l"><span class="ch-risk-dot" style="background:#FBBF24"></span>中</span><span>全部美股持仓</span></div>
      <div class="ch-risk-tbl-row"><span>流动性</span><span class="ch-risk-tbl-l"><span class="ch-risk-dot" style="background:#10B981"></span>低</span><span>整体账户</span></div>
    </div>
    <div class="ch-disclaim">⚠ 以上为基于公开行情及账户数据的信息分析,不构成投资建议。市场存在风险,决策请结合个人风险承受能力独立判断。</div>
    <div class="ch-bul" style="margin-top:10px"><span class="ch-bul-d" style="background:#EF4444"></span><span class="ch-bul-b"><strong>最需关注 — NVDA:</strong>集中度首位 + 估值高位 + 高 Beta,短期回调风险大,建议止盈分批或期权替代。</span></div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#FBBF24"></span><span class="ch-bul-b"><strong>留意获利保护 — AAPL:</strong>跌破 $200 心理关口,财报临近,建议设 $195 止损单。</span></div>
    <div class="ch-bul"><span class="ch-bul-d" style="background:#10B981"></span><span class="ch-bul-b"><strong>稳健底仓 — BRK.B:</strong>低 Beta、估值合理,持有不动作。</span></div>
  </div></div>`;

  // CTA「建议策略」
  const ctaHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button></div>
    <button class="ch-cta-primary ch-cta-rose" onclick="suggestRiskStrategy()">
      <span class="ch-cta-ic">✦</span><span class="ch-cta-l">建议策略</span><span class="ch-cta-arrow">→</span>
    </button>
  </div></div>`;

  if (typeof chatStream === 'function') chatStream([
    [200, topicHTML],
    [400, procHTML],
    [800, sec1HTML],
    [1000, sec2HTML],
    [800, sec3HTML],
    [800, sec4HTML],
    [500, ctaHTML],
    [0, () => {
      const tag = document.getElementById('chtag');
      if (tag) { tag.classList.remove('live'); tag.textContent = '复盘分析 · 持仓风险'; }
    }]
  ]);
}

/* ============================================================
   大盘归因分析富 chat 流(dyn-attribution 触发后,市场维度 4 段分析)
   - topic chip + 思考折叠节
   - summary(3 大共振因素)
   - § 一、科技板块承压(OpenAI / AI CapEx 担忧)
   - § 二、通胀风险重燃(美伊 + 油价飙升)
   - § 三、宏观流动性收紧(FOMC + 10Y 美债)
   - § 四、观望情绪浓厚(超级财报周 + 6000 亿 CapEx)
   - 10 来源 chip + 反馈 + ✦ 跟进
   ============================================================ */
function lbaiAttributionChat(query) {
  const accId1 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const accId2 = 'ai-acc-' + Math.random().toString(36).substr(2,5);
  const today = new Date(), prev = new Date(today.getTime() - 5*86400000);
  const dStr = prev.toISOString().slice(0,10);

  // topic chip(amber 底,与大盘 agent 同色)
  const topicHTML = `<div class="ch-m bot fi"><div class="ch-ai" style="display:flex;justify-content:flex-end"><span class="ch-screener-chip" style="background:#FBBF24;color:#000">今天为什么跌了</span></div></div>`;

  // 思考折叠节
  const procHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-acc" id="${accId1}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId1}')">
        <span class="ch-acc-t">检索您的相关记忆</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-acc-l">检索您的对应日期记忆摘要</div>
        <span class="ch-mem-chip">${dStr}</span>
      </div>
    </div>
    <div class="ch-acc" id="${accId2}">
      <div class="ch-acc-hd" onclick="toggleChAcc('${accId2}')">
        <span class="ch-acc-t">关键数据检索</span>
        <span class="ch-acc-ck">✓</span>
        <span class="ch-acc-cv">▾</span>
      </div>
      <div class="ch-acc-bd">
        <div class="ch-tool-hd"><span class="ch-tool-hd-ic">⌬</span>工具调用</div>
        <div class="ch-tool-chips">
          <span class="ch-tool-chip">获取美股大盘指数</span>
          <span class="ch-tool-chip">获取行业板块涨跌</span>
          <span class="ch-tool-chip">获取宏观新闻</span>
          <span class="ch-tool-chip">获取大宗商品价格</span>
          <span class="ch-tool-chip">获取美债收益率曲线</span>
          <span class="ch-tool-chip">全部 (6) ›</span>
        </div>
      </div>
    </div>
  </div></div>`;

  // 引言
  const introHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-disc">LongbridgeAI 不是持牌投资顾问,以下内容旨在汇编公开市场信息与行情数据,不构成任何投资建议。</div>
    <div class="ch-prose">美股大盘近期出现显著回调(<strong>道琼斯指数录得五连跌,纳斯达克与标普 500 指数自历史高位下挫</strong>),主要受 AI 巨头增长不及预期、中东地缘局势推升油价,以及美联储放鹰导致降息预期降温这三大核心因素的共振打击。</div>
  </div></div>`;

  // §1 科技板块承压
  const sec1HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">一、科技板块承压:OpenAI 增长不及预期引爆 AI 担忧</div>
    <div class="ch-prose">近日市场传出 OpenAI 未能达成其内部设定的营收与用户增长目标(例如未能在 2025 年底前实现每周 <strong>10 亿活跃用户</strong>),引发市场剧烈反应。<span class="ch-cite">新浪财经 +1</span> 这一消息在科技股财报季前夕,重新点燃了投资者对庞大 AI 资本支出(CAPEX)能否实现可持续回报的强烈疑虑。<span class="ch-cite">新浪财经</span> 恐慌情绪蔓延导致与 AI 基础设施深度绑定的核心科技股集体遭抛售,<strong>英伟达、AMD、甲骨文 及 博通</strong> 等多只晶片与算力概念股均出现显著下跌,拖累纳指走低。<span class="ch-cite">新浪财经 +2</span></div>
  </div></div>`;

  // §2 通胀风险重燃
  const sec2HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">二、通胀风险重燃:美伊谈判僵局致油价飙升</div>
    <div class="ch-prose">中东地缘局势再度紧张,据悉美国总统特朗普对伊朗提出的开放霍尔木兹海峡提议感到不满,和平谈判陷入僵局。<span class="ch-cite">新浪财经</span> 市场担忧原油运输将面临长期受阻,推动全球能源价格直线飙升,<strong>布伦特原油(Brent)盘中突破每桶 110 美元,西德克萨斯中质原油(WTI)也一度冲破 100 美元大关</strong>。<span class="ch-cite">k.sina.com.cn +1</span> 能源成本的剧增大幅削弱了经济前景预期,并在资本市场引发了对「滞胀」(Stagflation)的强烈担忧,进一步打击了股市做多情绪。<span class="ch-cite">163.com +1</span></div>
  </div></div>`;

  // §3 宏观流动性收紧
  const sec3HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">三、宏观流动性收紧:美联储 FOMC 维持高息</div>
    <div class="ch-prose">在最新的 FOMC 会议上,美联储宣布将基准利率维持在 <strong>3.50% 至 3.75%</strong> 区间不变。<span class="ch-cite">Access +1</span> 由于近期美国生产者物价指数(PPI)异常高企,加上能源价格推升输入性通胀风险,多数美联储官员对通胀反弹表示担忧,暗示年内已无降息空间。<span class="ch-cite">Access +1</span> 降息预期的彻底搁浅推高了借贷成本,<strong>10 年期美债收益率一度触及 4.37%</strong>,对美股等风险资产的估值形成了直接压制。<span class="ch-cite">k.sina.com.cn</span></div>
  </div></div>`;

  // §4 观望情绪浓厚
  const sec4HTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose-h">四、观望情绪浓厚:超级财报周前资金避险</div>
    <div class="ch-prose">本周正值美股「超级财报周」,<strong>字母表、微软、亚马逊、Meta 以及 苹果</strong> 等巨头将密集披露最新业绩。<span class="ch-cite">新浪财经</span> 预计四家巨头 2026 年合计资本支出将超过 <strong>6,000 亿美元</strong>,在当前市场心态从「害怕错过(FOMO)」转向高度谨慎的背景下,许多资金选择在财报揭晓及业绩指引公布前提前离场避险,从而放大了大盘的短期跌幅。<span class="ch-cite">新浪财经 +1</span></div>
  </div></div>`;

  // 来源 + 反馈 + 跟进追问
  const sourceHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <span class="ch-srcs">10 来源 <span class="ch-srcs-cv">›</span></span>
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button><button aria-label="重新生成" title="重新生成">${icon("refresh",13)}</button></div>
    <div class="ch-fups">
      <button class="ch-fup" onclick="tryIntent('AI 资本开支增速对行业影响如何?')"><span class="ch-fup-ic">✦</span>AI 资本开支增速对行业影响如何?</button>
      <button class="ch-fup" onclick="tryIntent('能源价格何时见顶?')"><span class="ch-fup-ic">✦</span>能源价格何时见顶?</button>
      <button class="ch-fup" onclick="tryIntent('FOMC 何时转向?')"><span class="ch-fup-ic">✦</span>FOMC 何时转向?</button>
      <button class="ch-fup" onclick="tryIntent('分析我的持仓风险')"><span class="ch-fup-ic">✦</span>看下跌对我持仓的影响</button>
    </div>
  </div></div>`;

  if (typeof chatStream === 'function') chatStream([
    [200, topicHTML],
    [400, procHTML],
    [600, introHTML],
    [900, sec1HTML],
    [900, sec2HTML],
    [900, sec3HTML],
    [900, sec4HTML],
    [600, sourceHTML],
    [0, () => {
      const tag = document.getElementById('chtag');
      if (tag) { tag.classList.remove('live'); tag.textContent = '大盘分析 · 美股回调'; }
    }]
  ]);
}

/* CTA「建议策略」点击:在 chat 内追加 3 个候选策略卡 */
function suggestRiskStrategy() {
  const userHTML = `<div class="ch-m user fi"><div class="ch-bub">建议策略</div></div>`;
  const introHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-prose">基于上面 4 维风险拆解,优先级从高到低推荐 3 套应对策略,每套都附「执行成本 / 影响仓位 / 预期效果」三项参数。</div>
  </div></div>`;
  const stratHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-strat-card">
      <div class="ch-strat-hd"><span class="ch-strat-num">A</span><span class="ch-strat-name">NVDA 部分止盈 + 期权对冲</span><span class="ch-strat-pri">优先级 高</span></div>
      <div class="ch-strat-desc">卖出 NVDA 6 股(约 9% 减仓),用所得资金买入 1 张 $135 Put 28 天保护现有持仓。</div>
      <div class="ch-strat-kv"><span>执行成本</span><span>~ $850 期权金</span></div>
      <div class="ch-strat-kv"><span>影响仓位</span><span>NVDA 18% → 16%</span></div>
      <div class="ch-strat-kv"><span>预期效果</span><span class="positive">下跌 -10% 时减少损失 ~$1,200</span></div>
    </div>
    <div class="ch-strat-card">
      <div class="ch-strat-hd"><span class="ch-strat-num">B</span><span class="ch-strat-name">板块再平衡 — AI 芯片三股减仓</span><span class="ch-strat-pri">优先级 中</span></div>
      <div class="ch-strat-desc">NVDA / AMD / TSM 合计减仓 5%,资金转入 BRK.B / GOOG 等低 Beta 标的。</div>
      <div class="ch-strat-kv"><span>执行成本</span><span>佣金 + 税 ~ $30</span></div>
      <div class="ch-strat-kv"><span>影响仓位</span><span>AI 芯片 38% → 33%</span></div>
      <div class="ch-strat-kv"><span>预期效果</span><span class="positive">组合 Beta 1.42 → 1.31</span></div>
    </div>
    <div class="ch-strat-card">
      <div class="ch-strat-hd"><span class="ch-strat-num">C</span><span class="ch-strat-name">AAPL 设条件单止损</span><span class="ch-strat-pri">优先级 中</span></div>
      <div class="ch-strat-desc">AAPL 当前 $198.32,设 $195 触发条件单,触发后市价单出场。</div>
      <div class="ch-strat-kv"><span>执行成本</span><span>0(条件单免费)</span></div>
      <div class="ch-strat-kv"><span>影响仓位</span><span>AAPL 14% → 0(若触发)</span></div>
      <div class="ch-strat-kv"><span>预期效果</span><span class="positive">最大损失锁定 -1.7%</span></div>
    </div>
  </div></div>`;
  const followCTAHTML = `<div class="ch-m bot fi"><div class="ch-ai">
    <div class="ch-act-icons"><button aria-label="复制" title="复制">${icon("copy",13)}</button><button aria-label="赞" title="赞">${icon("thumbs-up",13)}</button><button aria-label="踩" title="踩">${icon("thumbs-down",13)}</button></div>
    <div class="ch-fups">
      <button class="ch-fup" onclick="tryIntent('帮我建一个 NVDA Trade Plan')"><span class="ch-fup-ic">✦</span>建 A 方案的 Trade Plan</button>
      <button class="ch-fup" onclick="tryIntent('生成再平衡方案')"><span class="ch-fup-ic">✦</span>看 B 方案的再平衡明细</button>
    </div>
  </div></div>`;
  const el = document.getElementById('chm');
  if (el) { el.innerHTML += userHTML; el.scrollTop = el.scrollHeight; }
  if (typeof chatStream === 'function') chatStream([
    [400, introHTML],
    [900, stratHTML],
    [400, followCTAHTML]
  ]);
}
