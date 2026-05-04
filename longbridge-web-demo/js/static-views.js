/* ============================================================
   static-views.js — 6 个静态视图(参照 longbridge.com 真实形态)
   watchlist / portfolio / news / market / community / trade
   依赖: data.js (watchlistData / portfolioData / holdings / ddb)
   ============================================================ */

/* ============ 工具:迷你 sparkline canvas ============ */
function drawSpark(canvas, dir, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth || 80;
  const h = canvas.height = canvas.clientHeight || 22;
  const pts = [];
  let y = h * .5;
  const drift = dir === 'up' ? -.42 : dir === 'down' ? .58 : .5;
  for (let x = 0; x < w; x += 2) {
    y += (Math.random() - drift) * 1.6;
    y = Math.max(h * .15, Math.min(h * .85, y));
    pts.push({x, y});
  }
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = color || (dir === 'up' ? 'rgba(0,173,162,.85)' : dir === 'down' ? 'rgba(239,68,68,.85)' : 'rgba(157,159,163,.6)');
  ctx.lineWidth = 1.3;
  ctx.stroke();
}

/* ============ Market(发现频道) ============ */
function renderMarket() {
  // 全球指数
  const indices = [
    {flag:'🇺🇸', n:'标普 500', v:'7138.800', c:'-35.11', pct:'-0.49%', dir:'dn'},
    {flag:'🇭🇰', n:'恒生指数', v:'26039.840', c:'+360.06', pct:'+1.40%', dir:'up'},
    {flag:'🇭🇰', n:'国企指数', v:'8777.320', c:'+132.51', pct:'+1.53%', dir:'up'},
    {flag:'🇭🇰', n:'恒生科技', v:'4901.080', c:'+73.89', pct:'+1.53%', dir:'up'},
    {flag:'🇭🇰', n:'红筹指数', v:'4390.940', c:'+54.24', pct:'+1.25%', dir:'up'},
    {flag:'🇨🇳', n:'上证指数', v:'4091.02', c:'+12.38', pct:'+0.30%', dir:'up'},
    {flag:'🇨🇳', n:'深证成指', v:'15047.92', c:'+217.46', pct:'+1.47%', dir:'up'},
    {flag:'🇨🇳', n:'创业板指', v:'3671.07', c:'+74.36', pct:'+2.07%', dir:'up'}
  ];
  // 财报预告
  const earnings = [
    {tk:'香港交易所', logo:'X', mkt:'HK', date:'2026 财年第 1 季度业绩披露', revE:'75.22 亿', epsE:'+3.6013', revA:'待公布', epsA:'待公布', note:'香港交易所将在 4 月 29 日盘前(北京时间)发布财报,市场预测营收 75.56 亿港币,EPS 3.615…'},
    {tk:'吉利汽车', logo:'吉', mkt:'HK', date:'2026 财年第 1 季度业绩披露', revE:'—', epsE:'—', revA:'待公布', epsA:'待公布', note:'吉利汽车将在 4 月 29 日盘前(北京时间)发布 2026 财年第 1 季度财报'},
    {tk:'招商证券', logo:'招', mkt:'HK', date:'2026 财年第 1 季度业绩披露', revE:'—', epsE:'—', revA:'待公布', epsA:'待公布', note:'招商证券将在 4 月 29 日盘前(北京时间)发布 2026 财年第 1 季度财报'}
  ];
  // 新股
  const ipos = [
    {tk:'某某科技', logo:'M', d:'港股 · 4.30 上市', priceR:'$12.5–14.8', mc:'估值 $480M', subscribed:'认购'},
    {tk:'New Energy Co', logo:'N', d:'美股 · 5.02 上市', priceR:'$18.0–22.0', mc:'估值 $1.2B', subscribed:'认购'},
    {tk:'AI Robotics', logo:'A', d:'港股 · 5.05 上市', priceR:'$8.6–10.4', mc:'估值 $620M', subscribed:'认购'}
  ];
  // 地图标记位置
  const mapMarks = [
    {top:'42%', left:'18%', l:'US', v:'-0.49%', dir:'dn'},
    {top:'52%', left:'72%', l:'HK', v:'+1.40%', dir:'up'},
    {top:'46%', left:'78%', l:'CN', v:'+0.30%', dir:'up'},
    {top:'68%', left:'80%', l:'SG', v:'-0.61%', dir:'dn'}
  ];

  let h = `<div class="sv-hd"><span class="sv-hd-t">发现</span>
    <div class="sv-tabs"><span class="sv-tab on">全球市场</span><span class="sv-tab">选股器</span><span class="sv-tab">财经日历</span></div>
  </div>`;

  h += `<div class="sv-tabs-sub"><span class="on">发现</span><span>美股</span><span>港股</span><span>沪深</span><span>新加坡</span></div>`;

  // 世界地图 + 全球指数
  h += `<div class="mk-map-wrap">
    <div class="mk-map" id="mkMap"></div>
    <div class="mk-idx-list">`;
  indices.forEach(i => {
    h += `<div class="mk-idx-row"><span class="mk-idx-flag">${i.flag}</span><span class="mk-idx-n">${i.n}</span><span class="mk-idx-v">${i.v}</span><span class="mk-idx-c ${i.dir}">${i.c}</span><span class="mk-idx-pct ${i.dir}">${i.pct}</span></div>`;
  });
  h += `</div></div>`;

  // 财报预告
  h += `<div class="sv-section-t">财报预告<span class="sv-more">查看更多 ›</span></div><div class="mk-er-grid">`;
  earnings.forEach(e => {
    h += `<div class="mk-er-card">
      <div class="mk-er-hd"><div class="mk-er-logo">${e.logo}</div><div class="mk-er-tk">${e.tk}</div><span class="mk-er-mkt">${e.mkt}</span></div>
      <div class="mk-er-d">${e.date}</div>
      <div class="mk-er-kv"><span class="mk-er-k">预估营业收入</span><span class="mk-er-v">${e.revE}</span><span class="mk-er-k">实际营业收入</span><span class="mk-er-v">${e.revA}</span><span class="mk-er-k">预估每股收益</span><span class="mk-er-v ${e.epsE!=='—'?'up':''}">${e.epsE}</span><span class="mk-er-k">实际每股收益</span><span class="mk-er-v">${e.epsA}</span></div>
      <div class="mk-er-foot"><span class="mk-er-foot-ic">●</span><span>${e.note}</span></div>
    </div>`;
  });
  h += `</div>`;

  // 新股
  h += `<div class="sv-section-t">新股<span class="sv-more">查看更多 ›</span></div>`;
  ipos.forEach(p => {
    h += `<div class="mk-ipo-row">
      <div class="mk-ipo-logo">${p.logo}</div>
      <div><div class="mk-ipo-n">${p.tk}</div><div class="mk-ipo-d">${p.d}</div></div>
      <div><div class="mk-ipo-v">${p.priceR}</div><div class="mk-ipo-vl">招股价区间</div></div>
      <div><div class="mk-ipo-v">${p.mc}</div><div class="mk-ipo-vl">市值估算</div></div>
      <button class="mk-ipo-btn">${p.subscribed}</button>
    </div>`;
  });

  document.getElementById('v-market').innerHTML = h;

  // 渲染地图背景点阵 + 主要市场标记
  setTimeout(() => {
    const map = document.getElementById('mkMap');
    if (!map) return;
    let dots = '';
    for (let i = 0; i < 60; i++) {
      const t = Math.random() * 90 + 5;
      const l = Math.random() * 95 + 2;
      dots += `<div class="mk-map-dot" style="top:${t}%;left:${l}%"></div>`;
    }
    let marks = '';
    mapMarks.forEach(m => {
      marks += `<div class="mk-map-mk" style="top:${m.top};left:${m.left}"><div class="mk-map-mk-d"></div><div class="mk-map-mk-l">${m.l}</div><div class="mk-map-mk-v ${m.dir}">${m.v}</div></div>`;
    });
    map.innerHTML = dots + marks;
  }, 50);
}

/* ============ News(资讯频道) ============ */
function renderNews() {
  const heroNews = {pin:'PINNED', src:'Wallstreetcn', tm:'2 小时前', t:'"硬盘巨头" 希捷科技季度业绩远超预期;2027 年产能预期上调,数据中心需求强劲'};
  const newsList = [
    {pin:true, src:'Market Pulse', tm:'37 分钟前', t:'港股市场快讯 | 恒生指数涨超 1%,内险股、新能源汽车板块领涨', tags:[['HK','01347','-6.88%','dn'],['SH','601318','+1.60%','up'],['HK','02318','+5.00%','up']], img:'building'},
    {pin:true, src:'海豚投研', tm:'2 小时前', t:'分众传媒:早春先回暖,后又遇冷;高股息再次证明韧性', tags:[], img:'chart-bar'},
    {pin:false, src:'BYD 海外', tm:'3 小时前', t:'BYD 海外扩张稳步推进,海外业务利润占比持续提升', tags:[['HK','01211','+2.10%','up']], img:'fuel'},
    {pin:false, src:'Bloomberg', tm:'3.5 小时前', t:'美联储官员暗示降息周期可能在 7 月开启,科技股领涨纳指', tags:[['US','SPY','+0.22%','up'],['US','QQQ','+0.85%','up']], img:'building'},
    {pin:false, src:'Reuters', tm:'4 小时前', t:'NVIDIA Blackwell 架构出货量 Q1 同比 +320%,数据中心营收创新高', tags:[['US','NVDA','+3.08%','up']], img:'cpu'},
    {pin:false, src:'21 世纪经济报道', tm:'5 小时前', t:'港交所 IPO 节奏加快,Q2 已有 18 家公司递表,科技占六成', tags:[['HK','00388','+0.92%','up']], img:'trending-up'}
  ];
  const calendar = [
    {logo:'金', tk:'GANFENGLITHIUM', mkt:'HK', st:'Pre', d:'FY2026 Q1 Earning Release · 5/2 盘前', extra:'GANFENGLITHIUM to Release FY2026 Q1...'},
    {logo:'吉', tk:'GEELY AUTO', mkt:'HK', st:'Pre', d:'FY2026 Q1 Earning Release · 4/29 盘前', extra:'Geely Auto to Release FY2026 Q1 Earnings...'},
    {logo:'R', tk:'Robinhood', mkt:'us', st:'Post', d:'FY2026 Q1 Earning Release · 5/3 盘后', extra:'Robinhood to Release FY2026 Q1 Earnings...'}
  ];

  let h = `<div class="sv-hd"><span class="sv-hd-t">资讯</span>
    <div class="sv-tabs"><span class="sv-tab on">News</span><span class="sv-tab">Insights</span><span class="sv-tab">Live</span><span class="sv-tab">Academy</span></div>
  </div>`;
  h += `<div class="sv-tabs-sub"><span class="on">Headline</span><span>Newsflash</span><span>Event</span></div>`;

  h += `<div class="sv-grid-2"><div>
    <div class="nw-hero"><div class="nw-hero-body"><div class="nw-hero-meta"><strong>${heroNews.src}</strong> · ${heroNews.tm}</div><div class="nw-hero-t">${heroNews.t}</div></div></div>
    <div class="nw-list">`;
  newsList.forEach(n => {
    h += `<div class="nw-row"><div>
      <div class="nw-row-meta">${n.pin?`<span class="nw-row-pin">PINNED</span>`:''}<strong style="color:var(--tp)">${n.src}</strong> · ${n.tm}</div>
      <div class="nw-row-t">${n.t}</div>`;
    if (n.tags.length) {
      h += `<div class="nw-row-tags">`;
      n.tags.forEach(t => h += `<span class="nw-row-tag ${t[3]}">${t[0]} ${t[1]} ${t[2]}</span>`);
      h += `</div>`;
    }
    h += `</div><div class="nw-row-img">${icon(n.img, 28)}</div></div>`;
  });
  h += `</div></div>`;

  // Earnings Calendar 右侧栏
  h += `<div class="nw-side"><div class="nw-side-t">Earnings Calendar</div>`;
  calendar.forEach(c => {
    h += `<div class="nw-cal-row"><div class="nw-cal-logo">${c.logo}</div><div class="nw-cal-body">
      <div class="nw-cal-tk">${c.tk}<span class="nw-cal-mkt ${c.mkt==='us'?'us':''}">${c.mkt}</span><span class="nw-cal-st">${c.st}</span></div>
      <div class="nw-cal-d">${c.d}</div>
      <div class="nw-cal-d" style="color:var(--tm);margin-top:4px">${c.extra}</div>
    </div></div>`;
  });
  h += `<div style="margin-top:10px;font-size:11px;color:#06B6D4;cursor:pointer">View More ›</div></div>`;
  h += `</div>`;

  document.getElementById('v-news').innerHTML = h;
}

/* ============ Community(社区频道) ============ */
function renderCommunity() {
  const posts = [
    {av:'海', avBg:'linear-gradient(135deg,#06B6D4,#00ADA2)', name:'海豚研究', verified:true, posts:'3000', likes:'10k', tm:'2 小时前',
     t:'分众传媒:早春先回暖,后又遇冷;高股息再次证明韧性',
     tx:'Hello everyone, this is Dolphin Research. On Apr 28 (Beijing time), <span class="cm-post-tx-tk">$Focus Media(002027.SZ)</span> released its 2025 annual report and 1Q26 results.<br>Overall, it was another stress test. The company again lean……',
     imgs:['chart-bar','trending-up','trending-down'], imgsMore:6,
     stk:{tk:'Focus Media', id:'SZ 002027', pr:'6.40', ch:'+4.92%', dir:'up', tag:'Posted at 6.40 CNY'}},
    {av:'M', avBg:'linear-gradient(135deg,#F59E0B,#FBBF24)', name:'MacroEdge', verified:false, posts:'628', likes:'4.2k', tm:'4 小时前',
     t:'AI 基础设施长期需求依然旺盛,但要警惕短期超买风险',
     tx:'最近 NVDA 突破 30 日高点,市场情绪极度乐观。但从 RSI 和 CCI 指标看,<span class="cm-post-tx-tk">$NVDA</span> 已经进入超买区间。我建议关注 $145–148 区间的回调,作为更安全的入场点。',
     imgs:[], imgsMore:0,
     stk:{tk:'NVIDIA', id:'NVDA', pr:'142.68', ch:'+3.08%', dir:'up', tag:'Posted at 142.68 USD'}},
    {av:'V', avBg:'linear-gradient(135deg,#8B5CF6,#7C3AED)', name:'ValueHunter', verified:true, posts:'1.5k', likes:'8.9k', tm:'昨天',
     t:'同行业对比:NVDA 估值溢价是否合理?',
     tx:'整理了半导体板块 Top 5 的 P/E、P/S、毛利率、营收增速对比表。<span class="cm-post-tx-tk">$NVDA</span> P/E 68x,远高于行业中位 24x,但其营收增速 +94% YoY 也是行业最高。是否合理见仁见智……',
     imgs:['chart-bar','trending-up'], imgsMore:0,
     stk:null}
  ];
  const trending = [
    {rank:1, logo:'X', tk:'XIZHI TECH-P', id:'HK 01879', pr:'897.000', ch:'+1.24%', dir:'up', favCount:'18.5K', faved:false},
    {rank:2, logo:'M', tk:'MINIMAX-W', id:'HK 00100', pr:'734.500', ch:'+1.52%', dir:'up', favCount:'44.6K', faved:false},
    {rank:3, logo:'米', tk:'XIAOMI-W', id:'HK 01810', pr:'30.100', ch:'+0.60%', dir:'up', favCount:'255.4K', faved:true},
    {rank:4, logo:'S', tk:'SMIC', id:'HK 00981', pr:'64.900', ch:'-1.74%', dir:'dn', favCount:'101.7K', faved:true},
    {rank:5, logo:'M', tk:'MANYCORE TECH', id:'HK', pr:'24.380', ch:'-0.50%', dir:'dn', favCount:'—', faved:false}
  ];

  let h = `<div class="sv-hd"><span class="sv-hd-t">社区</span></div>`;
  h += `<div class="cm-tabs2"><span class="cm-tab2 on">For You</span><span class="cm-tab2">Following</span></div>`;

  h += `<div class="sv-grid-2"><div>`;

  // composer
  h += `<div class="cm-composer">
    <div class="cm-composer-hd"><div class="cm-composer-av">德</div><input class="cm-composer-i" placeholder="Share your thoughts" /></div>
    <div class="cm-composer-foot">
      <span class="cm-composer-tool"><span class="cm-composer-tool-ic">${icon("image",13)}</span>Picture</span>
      <span class="cm-composer-tool"><span class="cm-composer-tool-ic">${icon("chart-bar",13)}</span>Stock</span>
      <span class="cm-composer-tool"><span class="cm-composer-tool-ic">${icon("hash",13)}</span>Topic</span>
      <span class="cm-composer-tool"><span class="cm-composer-tool-ic">${icon("at-sign",13)}</span>Mention</span>
      <button class="cm-composer-publish">Publish</button>
    </div>
  </div>`;

  // posts
  posts.forEach((p, i) => {
    h += `<div class="cm-post">
      <div class="cm-post-hd">
        <div class="cm-post-av" style="background:${p.avBg}">${p.av}</div>
        <div class="cm-post-info">
          <div class="cm-post-name">${p.name}${p.verified?` <span style="color:#06B6D4;font-size:11px">✓</span>`:''} <span class="cm-post-badge">${p.posts} Posts</span> <span class="cm-post-badge likes">${p.likes} Likes Received</span></div>
          <div class="cm-post-meta">${p.tm}</div>
        </div>
      </div>
      <div class="cm-post-t">${p.t}</div>
      <div class="cm-post-tx">${p.tx}</div>`;
    if (p.imgs.length) {
      h += `<div class="cm-post-imgs">`;
      p.imgs.forEach((im, idx) => {
        const ic = icon(im, 28);
        if (idx === 2 && p.imgsMore > 0) {
          h += `<div class="cm-post-img">${ic}<div class="cm-post-img-more">+${p.imgsMore}</div></div>`;
        } else {
          h += `<div class="cm-post-img">${ic}</div>`;
        }
      });
      h += `</div>`;
    }
    if (p.stk) {
      h += `<div class="cm-post-stk">
        <div class="cm-post-stk-l"><div class="cm-post-stk-tk">${p.stk.tk}</div><div class="cm-post-stk-id">${p.stk.id}</div></div>
        <div><div class="cm-post-stk-pr">${p.stk.pr}</div><div class="cm-post-stk-ch ${p.stk.dir}">${p.stk.ch}</div></div>
        <canvas class="cm-post-stk-spark" id="cmspk-${i}"></canvas>
      </div>
      <div class="cm-post-stk-tag" style="text-align:left">${p.stk.tag}</div>`;
    }
    h += `</div>`;
  });

  h += `</div>`;

  // 右侧 sidebar
  h += `<div class="cm-side">
    <div class="cm-prof">
      <div class="cm-prof-hd">
        <div class="cm-prof-av">德</div>
        <div><div class="cm-prof-name">德玛西亚</div><div class="cm-prof-bio">产品经理 | 个人表达,非官方立场 关注…</div></div>
      </div>
      <div class="cm-prof-stats">
        <div><div class="cm-prof-st-v">126</div><div class="cm-prof-st-l">Following</div></div>
        <div><div class="cm-prof-st-v">2360</div><div class="cm-prof-st-l">Followers</div></div>
        <div><div class="cm-prof-st-v">72</div><div class="cm-prof-st-l">Posts</div></div>
      </div>
    </div>
    <div class="cm-creator">
      <div class="cm-creator-hd"><div class="cm-creator-t">Creator Center / Hub</div><span style="color:var(--tm)">›</span></div>
      <div class="cm-creator-d">What's on your mind? Share with us. Or write an article to start your creation.</div>
      <div class="cm-creator-actions"><div class="cm-creator-btn">${icon("edit",16)}<br/>Create a Post</div><div class="cm-creator-btn">${icon("file-text",16)}<br/>Write an Article</div></div>
    </div>
    <div class="cm-prof" style="padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><div><div style="font-size:13px;font-weight:600;color:var(--tp)">Top Trending Stocks</div><div style="font-size:9px;color:var(--tm);margin-top:2px;text-transform:uppercase;letter-spacing:.3px">Most Traded</div></div><div style="display:flex;gap:6px;color:var(--tm);font-size:13px"><span style="cursor:pointer">‹</span><span style="cursor:pointer">›</span></div></div>`;
  trending.forEach(t => {
    h += `<div class="cm-trend-row">
      <span class="cm-trend-rank ${t.rank>=4?'r'+t.rank:t.rank===2?'r2':t.rank===3?'r3':''}">${t.rank}</span>
      <div class="cm-trend-logo">${t.logo}</div>
      <div><div class="cm-trend-info-tk">${t.tk}</div><div class="cm-trend-info-id">${t.id}</div></div>
      <div class="cm-trend-pr"><div class="cm-trend-pr-v">${t.pr}</div><div class="cm-trend-pr-c ${t.dir}">${t.ch}</div></div>
      <button class="cm-trend-fav ${t.faved?'on':''}" aria-label="${t.faved?'取消关注':'加入自选'}">${t.faved?icon("heart-filled",14):icon("heart",14)}</button>
    </div>`;
  });
  h += `</div></div></div>`;

  document.getElementById('v-community').innerHTML = h;
  setTimeout(() => {
    posts.forEach((p, i) => {
      if (p.stk) drawSpark(document.getElementById('cmspk-' + i), p.stk.dir);
    });
  }, 60);
}

/* ============ Trade(交易频道) ============ */
function renderTrade() {
  const orders = [
    {tk:'TSLA', side:'买入', type:'限价', qty:20, price:'$235.00', ts:'09:42', st:'pending', stTx:'委托中'},
    {tk:'NVDA', side:'买入', type:'限价', qty:5, price:'$140.50', ts:'09:38', st:'filled', stTx:'已成交'},
    {tk:'AAPL', side:'卖出', type:'限价', qty:10, price:'$202.00', ts:'昨日 15:48', st:'cancelled', stTx:'已撤'}
  ];
  const conditions = [
    {tk:'AAPL', type:'止损', cond:'触发价 $195.00 → 市价卖出', ts:'生效中'},
    {tk:'NVDA', type:'跟踪止盈', cond:'下跌 5% 触发市价卖出', ts:'生效中'},
    {tk:'AMD', type:'OCO', cond:'$180 卖出 / $150 止损,二选一', ts:'生效中'}
  ];

  let h = `<div class="sv-hd"><span class="sv-hd-t">交易</span>
    <div class="sv-tabs"><span class="sv-tab on">下单</span><span class="sv-tab">委托查询</span><span class="sv-tab">条件单</span><span class="sv-tab">成交记录</span></div>
  </div>`;

  h += `<div class="td-grid"><div>`;

  // 快速下单
  h += `<div class="td-card">
    <div class="td-card-t">${icon("zap",14)} 快速下单<span class="td-card-t-s">实时行情 · 0 延迟</span></div>
    <div class="td-order">
      <div class="td-order-side">
        <button type="button" class="td-order-side-b buy on" onclick="tradeSetSide(this,'buy')">买入 BUY</button>
        <button type="button" class="td-order-side-b sell" onclick="tradeSetSide(this,'sell')">卖出 SELL</button>
      </div>
      <div class="td-fld"><label class="td-fld-l" for="td-tk">标的</label><input id="td-tk" class="td-fld-i" value="NVDA · NVIDIA Corporation"></div>
      <div class="td-fld"><label class="td-fld-l" for="td-type">订单类型</label><select id="td-type" class="td-fld-i" onchange="tradeRecalc()"><option>限价单</option><option>市价单</option><option>止损单</option><option>跟踪止盈</option></select></div>
      <div class="td-fld"><label class="td-fld-l" for="td-price">价格</label><input id="td-price" class="td-fld-i" value="142.50" oninput="tradeRecalc()"></div>
      <div class="td-fld"><label class="td-fld-l" for="td-qty">数量</label><input id="td-qty" type="number" class="td-fld-i" value="10" min="1" oninput="tradeRecalc()"></div>
      <div class="td-summary">
        <div class="td-sum-row"><span class="td-sum-l">预估金额</span><span class="td-sum-v" id="td-amount">$1,425.00</span></div>
        <div class="td-sum-row"><span class="td-sum-l">交易费用</span><span class="td-sum-v" id="td-fee">$0.99</span></div>
        <div class="td-sum-row"><span class="td-sum-l">合计</span><span class="td-sum-v" id="td-total">$1,425.99</span></div>
        <div class="td-sum-row"><span class="td-sum-l">购买力</span><span class="td-sum-v" style="color:var(--g)">$12,450.00</span></div>
      </div>
      <button class="td-submit" onclick="tradeSubmit()">提交订单</button>
    </div>
  </div>`;

  // 今日委托
  h += `<div class="td-card">
    <div class="td-card-t">${icon("clipboard",14)} 今日委托<span class="td-card-t-s">3 笔</span></div>
    <table class="td-tbl"><thead><tr><th scope="col">标的</th><th scope="col">方向</th><th scope="col">价格 × 数量</th><th scope="col">时间</th><th scope="col">状态</th></tr></thead><tbody>`;
  orders.forEach(o => {
    h += `<tr class="${o.st==='cancelled'?'cancel':''}"><td class="tk">${o.tk}</td><td>${o.side}/${o.type}</td><td>${o.price} × ${o.qty}</td><td>${o.ts}</td><td><span class="td-st ${o.st}">${o.stTx}</span></td></tr>`;
  });
  h += `</tbody></table></div>`;

  // 条件单
  h += `<div class="td-card">
    <div class="td-card-t">${icon("target",14)} 条件单<span class="td-card-t-s">3 笔生效中</span></div>
    <table class="td-tbl"><thead><tr><th scope="col">标的</th><th scope="col">类型</th><th scope="col">条件</th><th scope="col">状态</th></tr></thead><tbody>`;
  conditions.forEach(c => {
    h += `<tr><td class="tk">${c.tk}</td><td>${c.type}</td><td style="text-align:left;font-family:var(--f)">${c.cond}</td><td><span class="td-st filled">${c.ts}</span></td></tr>`;
  });
  h += `</tbody></table></div>`;

  h += `</div>`; // end left

  // 右侧账户信息
  h += `<div>
    <div class="td-card">
      <div class="td-card-t">${icon("briefcase",14)} 账户信息<span class="td-card-t-s">USD</span></div>
      <div class="td-acc-row"><span class="td-acc-l">总资产</span><span class="td-acc-v lg">$48,327.45</span></div>
      <div class="td-acc-row"><span class="td-acc-l">今日盈亏</span><span class="td-acc-v up">+$702.18 (+1.47%)</span></div>
      <div class="td-acc-row"><span class="td-acc-l">可用资金</span><span class="td-acc-v">$12,450.00</span></div>
      <div class="td-acc-row"><span class="td-acc-l">融资可用</span><span class="td-acc-v">$24,900.00</span></div>
      <div class="td-acc-row"><span class="td-acc-l">已用保证金</span><span class="td-acc-v">$8,420.00</span></div>
      <div class="td-acc-row"><span class="td-acc-l">维持保证金率</span><span class="td-acc-v">237%</span></div>
    </div>
    <div class="td-card">
      <div class="td-card-t">${icon("zap",14)} 快捷操作</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="action-btn" style="text-align:left;padding:10px 12px">${icon("wallet",13)} 入金 / 出金</button>
        <button class="action-btn" style="text-align:left;padding:10px 12px">${icon("refresh",13)} 货币兑换</button>
        <button class="action-btn" style="text-align:left;padding:10px 12px">${icon("chart-bar",13)} 查看资金流水</button>
        <button class="action-btn" style="text-align:left;padding:10px 12px">${icon("shield-check",13)} 风控偏好设置</button>
      </div>
    </div>
  </div></div>`;

  document.getElementById('v-trade').innerHTML = h;
}

/* ============ Watchlist(自选) ============ */
function renderWatchlist() {
  // 扩展自选数据(用现有 watchlistData + 几个补充)
  const wl = watchlistData.concat([
    {tk:'MSFT', nm:'Microsoft', pr:'425.00', chg:'+1.50%', dir:'up'},
    {tk:'AMZN', nm:'Amazon', pr:'182.50', chg:'+0.85%', dir:'up'},
    {tk:'BABA', nm:'Alibaba', pr:'92.30', chg:'-1.20%', dir:'down'},
    {tk:'TSLA', nm:'Tesla', pr:'238.40', chg:'+2.45%', dir:'up'}
  ]);

  let h = `<div class="sv-hd"><span class="sv-hd-t">自选</span>
    <div class="sv-tabs"><span class="sv-tab on">默认分组</span><span class="sv-tab">美股 AI</span><span class="sv-tab">港股核心</span><span class="sv-tab">+ 新建</span></div>
  </div>`;

  h += `<div class="wl-tabs-bar">
    <button class="wl-pill on">全部 ${wl.length}</button>
    <button class="wl-pill">上涨 ${wl.filter(x=>x.dir==='up').length}</button>
    <button class="wl-pill">下跌 ${wl.filter(x=>x.dir==='down').length}</button>
    <button class="wl-pill">已持有</button>
    <span style="margin-left:auto;font-size:11px;color:var(--tm);cursor:pointer">⚙ 自定义列</span>
  </div>`;

  h += `<table class="wl-tbl"><thead><tr><th scope="col">标的</th><th scope="col">价格</th><th scope="col">涨跌</th><th scope="col">涨跌幅</th><th scope="col">趋势(7D)</th><th scope="col">成交量</th><th scope="col">P/E</th><th scope="col"></th></tr></thead><tbody>`;
  wl.forEach((w, i) => {
    const d = ddb[w.tk];
    const ch = d ? d.ch : (w.dir === 'up' ? '+1.20' : '-0.85');
    const pe = d ? d.pe : '—';
    const vol = d ? d.vol : '—';
    h += `<tr onclick="openDetail('${w.tk}')">
      <td><div class="wl-tk"><div class="wl-logo">${w.tk.charAt(0)}</div><div><div class="wl-info-tk">${w.tk}</div><div class="wl-info-nm">${w.nm}</div></div></div></td>
      <td class="wl-pr">$${w.pr}</td>
      <td class="wl-c ${w.dir}">${ch}</td>
      <td class="wl-c ${w.dir}">${w.chg}</td>
      <td><canvas class="wl-spk" id="wlspk-${i}"></canvas></td>
      <td>${vol}</td>
      <td>${pe}</td>
      <td><button class="wl-act" title="设置提醒" aria-label="设置提醒">${icon("bell",14)}</button></td>
    </tr>`;
  });
  h += `</tbody></table>`;

  document.getElementById('v-watchlist').innerHTML = h;
  setTimeout(() => {
    wl.forEach((w, i) => drawSpark(document.getElementById('wlspk-' + i), w.dir));
  }, 60);
}

/* ============ Portfolio(资产) ============ */
function renderPortfolio() {
  const totalValue = holdings.reduce((s, h) => s + h.shares * h.price, 0);
  const totalCost = holdings.reduce((s, h) => s + h.shares * h.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPct = (totalPnl / totalCost * 100).toFixed(2);
  const todayPnl = totalValue * 0.0145; // mock
  const cash = 12450;

  // 行业聚合
  const sectorMap = {};
  holdings.forEach(h => {
    const v = h.shares * h.price;
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + v;
  });
  const sectors = Object.entries(sectorMap).map(([k, v]) => ({k, v, pct: (v / totalValue * 100).toFixed(1)})).sort((a, b) => b.v - a.v);
  const sectorColors = ['var(--g)', '#06B6D4', '#34D399', 'var(--p)', 'var(--o)', 'var(--b)'];

  let h = `<div class="sv-hd"><span class="sv-hd-t">资产</span>
    <div class="sv-tabs"><span class="sv-tab on">概览</span><span class="sv-tab">持仓</span><span class="sv-tab">收益分析</span><span class="sv-tab">资金流水</span></div>
  </div>`;

  // 4 个 KPI
  h += `<div class="pf-summary">
    <div class="pf-stat"><div class="pf-stat-l">总资产</div><div class="pf-stat-v">$${(totalValue+cash).toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="pf-stat-c up">+$${todayPnl.toFixed(0)} (+1.47%) 今日</div></div>
    <div class="pf-stat"><div class="pf-stat-l">持仓市值</div><div class="pf-stat-v">$${totalValue.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="pf-stat-c">${holdings.length} 个标的</div></div>
    <div class="pf-stat"><div class="pf-stat-l">累计盈亏</div><div class="pf-stat-v" style="color:var(--g)">+$${totalPnl.toLocaleString(undefined,{maximumFractionDigits:0})}</div><div class="pf-stat-c up">+${totalPct}%</div></div>
    <div class="pf-stat"><div class="pf-stat-l">现金 / 可用</div><div class="pf-stat-v">$${cash.toLocaleString()}</div><div class="pf-stat-c">融资可用 $24,900</div></div>
  </div>`;

  // 收益曲线 + 行业分布
  h += `<div class="pf-grid">
    <div class="pf-chart-card">
      <div class="pf-chart-hd"><div class="pf-chart-t">收益曲线</div><div class="pf-chart-tabs"><span class="pf-chart-tab">1D</span><span class="pf-chart-tab on">1M</span><span class="pf-chart-tab">3M</span><span class="pf-chart-tab">YTD</span><span class="pf-chart-tab">1Y</span></div></div>
      <div class="pf-chart"><canvas id="pfChart"></canvas></div>
    </div>
    <div class="pf-chart-card">
      <div class="pf-chart-hd"><div class="pf-chart-t">行业分布</div></div>`;
  sectors.forEach((s, i) => {
    h += `<div class="pf-sec"><div class="pf-sec-row"><span class="pf-sec-l">${s.k}</span><span class="pf-sec-pct">${s.pct}%</span></div><div class="pf-sec-track"><div class="pf-sec-fill" style="width:${s.pct}%;background:${sectorColors[i % sectorColors.length]}"></div></div></div>`;
  });
  h += `</div></div>`;

  // 持仓明细
  h += `<div class="pf-chart-card" style="margin-top:14px"><div class="pf-chart-hd"><div class="pf-chart-t">持仓明细</div><span style="font-size:11px;color:#06B6D4;cursor:pointer">导出 CSV ›</span></div>
    <table class="pf-tbl"><thead><tr><th scope="col">标的</th><th scope="col">持仓</th><th scope="col">成本</th><th scope="col">现价</th><th scope="col">市值</th><th scope="col">盈亏</th><th scope="col">盈亏%</th><th scope="col">占比</th></tr></thead><tbody>`;
  holdings.forEach(hd => {
    const mv = hd.shares * hd.price;
    const pnl = (hd.price - hd.cost) * hd.shares;
    const pct = (pnl / (hd.cost * hd.shares) * 100).toFixed(1);
    const dir = pnl >= 0 ? 'up' : 'dn';
    h += `<tr onclick="openDetail('${hd.tk}')"><td>${hd.tk} <span style="color:var(--tm);font-size:10px;margin-left:3px">${hd.nm}</span></td><td>${hd.shares}</td><td>$${hd.cost.toFixed(2)}</td><td>$${hd.price.toFixed(2)}</td><td>$${mv.toFixed(0)}</td><td class="pf-pnl ${dir}">${pnl>=0?'+':''}$${pnl.toFixed(0)}</td><td class="pf-pnl ${dir}">${pnl>=0?'+':''}${pct}%</td><td>${hd.pct}%</td></tr>`;
  });
  h += `</tbody></table></div>`;

  document.getElementById('v-portfolio').innerHTML = h;

  // 收益曲线
  setTimeout(() => {
    const c = document.getElementById('pfChart');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width = c.parentElement.clientWidth;
    const ht = c.height = c.parentElement.clientHeight;
    const pts = []; let y = ht * .65;
    for (let x = 0; x < w; x += 2) {
      y += (Math.random() - .55) * 1.5;
      y = Math.max(ht * .15, Math.min(ht * .9, y));
      pts.push({x, y});
    }
    const g = ctx.createLinearGradient(0, 0, 0, ht);
    g.addColorStop(0, 'rgba(0,173,162,.18)');
    g.addColorStop(1, 'rgba(0,173,162,0)');
    ctx.beginPath(); ctx.moveTo(0, ht);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, ht); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(0,173,162,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  }, 80);
}

/* ============ 交易页交互 ============ */
let tradeSide = 'buy';
function tradeSetSide(btn, side) {
  tradeSide = side;
  document.querySelectorAll('.td-order-side-b').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  tradeRecalc();
}
function tradeRecalc() {
  const priceEl = document.getElementById('td-price');
  const qtyEl = document.getElementById('td-qty');
  if (!priceEl || !qtyEl) return;
  const price = parseFloat((priceEl.value || '').replace(/[$,]/g, '')) || 0;
  const qty = parseInt(qtyEl.value) || 0;
  const amount = price * qty;
  const fee = amount > 0 ? Math.max(0.99, amount * 0.0007) : 0;
  const total = tradeSide === 'buy' ? (amount + fee) : (amount - fee);
  const fmt = v => '$' + v.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setEl('td-amount', fmt(amount));
  setEl('td-fee', fmt(fee));
  setEl('td-total', fmt(total));
}
async function tradeSubmit() {
  const tk = (document.getElementById('td-tk').value || '').split('·')[0].trim();
  const typ = document.getElementById('td-type').value;
  const price = document.getElementById('td-price').value;
  const qty = document.getElementById('td-qty').value;
  const total = document.getElementById('td-total').textContent;
  if (typeof confirmModal !== 'function') return;
  const ok = await confirmModal({
    title: tradeSide === 'buy' ? '确认买入下单?' : '确认卖出下单?',
    body: `订单将立即提交到券商系统,${tradeSide === 'buy' ? '买入' : '卖出'}成交后会进入持仓。`,
    kv: [
      ['标的', tk, ''],
      ['方向', tradeSide === 'buy' ? '买入 (BUY)' : '卖出 (SELL)', tradeSide === 'buy' ? 'up' : 'dn'],
      ['订单类型', typ, ''],
      ['限价', '$' + price, ''],
      ['数量', qty + ' 股', ''],
      ['合计', total, '']
    ],
    level: tradeSide === 'sell' ? 'danger' : 'warn',
    okText: tradeSide === 'buy' ? '确认买入' : '确认卖出',
    cancelText: '再想想'
  });
  if (!ok) return;
  // 本地反馈:加一行到今日委托(仅 demo)
  alert('订单已提交(demo):' + tk + ' ' + (tradeSide === 'buy' ? '买入' : '卖出') + ' ' + qty + ' 股 @ $' + price);
}
