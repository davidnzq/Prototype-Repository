/* ============================================================
   data.js — 运行时状态 + 所有 mock 数据
   v18: 与单文件原型 Longbridge Platform v18.html 数据保持同步
   ============================================================ */

/* 运行时状态 (let,可被其他 script 文件读写) */
let sc = 'active';           // 当前场景 active|calm|down
let cv = 'home';             // 当前主视图
let dynamic = false;         // 是否在动态视图中
let previousView = 'home';   // 进入动态视图前的视图(退出用)
let currentDynViewId = null; // 当前动态视图 id

/* AI 工作台 — 三个场景的任务/策略/订单 */
const awState = {
  active: {
    tasks: [
      {status:'run',title:'组合风险周报生成中',desc:'每周一 9:00 · 自动汇总',kv:[['进度','72%']],progress:72,actions:['查看','中断']},
      {status:'ok',title:'科技股异动扫描',desc:'每日 8:00 / 14:00',kv:[['最近','09:03'],['命中','2 条']],actions:['日志','暂停']},
      {status:'ok',title:'组合 Beta 监控',desc:'实时 · 阈值 >1.5',kv:[['Beta','1.42']],actions:['查看','调参']}
    ],
    strategies: [
      {status:'run',title:'NVDA 看涨期权策略',desc:'AI 评估最优行权价',kv:[['评估','68%']],progress:68,actions:['查看','暂停']},
      {status:'ok',title:'AAPL 止损监控',desc:'已运行 42 天',kv:[['预警','$195'],['当前','$198.32']],actions:['查看','调整']}
    ],
    orders: [{status:'ok',title:'TSLA 限价买单',desc:'委托中 · 3 天 · GTC',kv:[['限价','$235'],['数量','20 股']],actions:['查看','撤单']}]
  },
  calm: {
    tasks: [
      {status:'ok',title:'组合 Beta 监控',desc:'实时',kv:[['Beta','1.38']],actions:['查看','调参']},
      {status:'ok',title:'科技股异动扫描',desc:'每日',kv:[['今日','0 条']],actions:['日志','暂停']}
    ],
    strategies: [{status:'ok',title:'AAPL 止损监控',desc:'已运行 42 天',kv:[['预警','$195']],actions:['查看','调整']}],
    orders: [{status:'ok',title:'TSLA 限价买单',desc:'委托中',kv:[['限价','$235']],actions:['查看','撤单']}]
  },
  down: {
    tasks: [
      {status:'run',title:'AAPL 止损位计算',desc:'紧急分析',kv:[['进度','45%']],progress:45,actions:['查看','中断']},
      {status:'warn',title:'组合 Beta 越线告警',desc:'连续 2 次超阈值',kv:[['Beta','1.58'],['阈值','1.50']],actions:['查看','调参']},
      {status:'ok',title:'科技股异动扫描',desc:'高命中',kv:[['今日','3 条']],actions:['日志','暂停']}
    ],
    strategies: [
      {status:'warn',title:'AAPL 止损触发',desc:'已跌破预警线',kv:[['预警','$200'],['当前','$198']],actions:['执行','延后']},
      {status:'paused',title:'NVDA 看涨期权',desc:'系统性下跌暂停',kv:[['状态','已暂停']],actions:['查看','恢复']}
    ],
    orders: [{status:'ok',title:'TSLA 限价买单',desc:'委托中',kv:[['限价','$235']],actions:['查看','撤单']}]
  }
};

/* 三个场景的首页数据 */
const S = {
  active: {
    indices:[{name:'恒生...',val:'26020.750',chg:'-373.51',pct:'-1.42%',dir:'down'},{name:'国企...',val:'8782.740',chg:'-122.37',pct:'-1.37%',dir:'down'}],
    mktIdx:[
      {name:'恒生指数',val:'26020.75',chg:'-1.42%',dir:'down',color:'var(--r)'},
      {name:'国企指数',val:'8782.74',chg:'-1.37%',dir:'down',color:'var(--r)'},
      {name:'纳斯达克',val:'17,428',chg:'+1.20%',dir:'up',color:'var(--g)'},
      {name:'标普 500',val:'5,291',chg:'+0.85%',dir:'up',color:'var(--g)'}
    ],
    chips:[{t:'Trade Plan',n:'NVDA 期权',c:'urg'},{t:'Signal 研究',n:'TSM 扩产',c:'urg'}],
    pf:{v:'$48,327',ch:'+$1,247',pct:'+2.65%',p:true},
    top:[{t:'NVDA',v:'+3.08%',p:true},{t:'AAPL',v:'-0.82%',p:false},{t:'GOOG',v:'+1.24%',p:true}],
    nc:4,lv:'2 小时前',
    ur:[
      {id:'active-sig-AMZN',tag:'Signal',c:'signal',tk:'AMZN',tx:'AI Revolution Core Beneficiary, Growth Story Just Beginning',rl:'Lynch-like Growth Strategy · 32 mins ago',tm:'32 分钟前',sig:true},
      {id:'active-anom-NVDA',tag:'异动',c:'anomaly',tk:'NVDA',tx:'NVDA 突破 30 日高点 $140',rl:'持有 <strong>18%</strong>',rlTag:'集中度偏高',rlTagLevel:'warn',tm:'48 分钟前'},
      {id:'active-cat-TSM',tag:'催化',c:'catalyst',tk:'TSM',tx:'TSM 宣布 3nm 产能扩张',rl:'NVDA/AMD 均为客户',rlTag:'间接利好',rlTagLevel:'good',tm:'1 小时前'},
      {id:'active-news-macro',tag:'资讯',c:'news',tk:'宏观',tx:'美联储偏鸽信号',rl:'科技持仓 <strong>64%</strong>',rlTag:'板块利好',rlTagLevel:'good',tm:'1.5 小时前'}
    ],
    rd:[{id:'active-sys-BABA',tag:'系统',c:'system',tk:'BABA',tx:'BABA Q1 财报 · 下周五',rl:'自选 BABA',tm:'09:15'}],
    ai:{msg:'2 小时内 <b>4 件新变化</b>。NVDA 突破 30 日高点。',sugs:['分析我的持仓风险','对比 NVDA 和 AMD']},
    pnlToday:'+$1,247',pnlWeek:'+$2,100',pnlMonth:'+$5,400'
  },
  calm: {
    indices:[{name:'恒生...',val:'26394.260',chg:'+45.20',pct:'+0.17%',dir:'up'},{name:'国企...',val:'8905.110',chg:'+12.30',pct:'+0.14%',dir:'up'}],
    mktIdx:[
      {name:'恒生指数',val:'26394.26',chg:'+0.17%',dir:'up',color:'var(--g)'},
      {name:'国企指数',val:'8905.11',chg:'+0.14%',dir:'up',color:'var(--g)'},
      {name:'纳斯达克',val:'17,540',chg:'+0.20%',dir:'up',color:'var(--g)'},
      {name:'标普 500',val:'5,321',chg:'+0.12%',dir:'up',color:'var(--g)'}
    ],
    chips:[],
    pf:{v:'$47,892',ch:'+$82',pct:'+0.17%',p:true},
    top:[{t:'NVDA',v:'+0.32%',p:true},{t:'AAPL',v:'-0.11%',p:false},{t:'GOOG',v:'+0.08%',p:true}],
    nc:1,lv:'4 小时前',calm:true,
    ur:[{id:'calm-sys-AAPL',tag:'系统',c:'system',tk:'AAPL',tx:'AAPL 财报:下周四',rl:'持有 <strong>14%</strong>',rlTag:'适中仓位',rlTagLevel:'good',tm:'2 小时前'}],
    rd:[],
    ai:{msg:'4 小时无重大变化。',sugs:['AAPL 财报怎么准备?','分析我的持仓风险']},
    pnlToday:'+$82',pnlWeek:'+$350',pnlMonth:'+$4,200'
  },
  down: {
    indices:[{name:'恒生...',val:'25492.110',chg:'-901.93',pct:'-3.42%',dir:'down'},{name:'国企...',val:'8512.630',chg:'-392.45',pct:'-4.41%',dir:'down'}],
    mktIdx:[
      {name:'恒生指数',val:'25492.11',chg:'-3.42%',dir:'down',color:'var(--r)'},
      {name:'国企指数',val:'8512.63',chg:'-4.41%',dir:'down',color:'var(--r)'},
      {name:'纳斯达克',val:'16,820',chg:'-2.80%',dir:'down',color:'var(--r)'},
      {name:'标普 500',val:'5,180',chg:'-1.95%',dir:'down',color:'var(--r)'}
    ],
    chips:[{t:'Trade Plan',n:'AAPL 止损',c:'urg'}],
    pf:{v:'$46,510',ch:'-$1,300',pct:'-2.72%',p:false},
    top:[{t:'NVDA',v:'-3.41%',p:false},{t:'AAPL',v:'-2.10%',p:false},{t:'GOOG',v:'-1.88%',p:false}],
    nc:3,lv:'昨晚',
    ur:[
      {id:'down-sig-AAPL',tag:'Signal',c:'signal',tk:'AAPL',tx:'Quality Strong, Valuation Rich — Wait for a Better Entry',rl:'Buffett Value Strategy · 29 mins ago',tm:'29 分钟前',sig:true},
      {id:'down-anom-NVDA',tag:'异动',c:'anomaly',tk:'NVDA',tx:'NVDA 跳空低开 -3.4%',rl:'持有 <strong>18%</strong>',rlTag:'最大单一持仓',rlTagLevel:'warn',tm:'开盘'},
      {id:'down-news-macro',tag:'资讯',c:'news',tk:'宏观',tx:'美债收益率急升',rl:'科技 <strong>64%</strong>',rlTag:'板块承压',rlTagLevel:'warn',tm:'盘前'}
    ],
    rd:[{id:'down-cat-GOOG',tag:'催化',c:'catalyst',tk:'GOOG',tx:'GOOG 目标价下调 $165',rl:'距目标价 4%',tm:'昨天'}],
    ai:{msg:'今天 <b>-2.72%</b>。',sugs:['分析我的持仓风险','执行 AAPL 止损']},
    pnlToday:'-$1,300',pnlWeek:'-$450',pnlMonth:'+$2,100'
  }
};

/* 已知标的(用于事件卡片 ticker pill 是否可点击) */
const knownTickers = ['NVDA','AAPL','GOOG','META','TSM','AMD','MSFT','BRK.B','BABA','TSLA','AMZN'];

/* Watchlist / Portfolio 简表数据 */
const watchlistData = [
  {tk:'NVDA',nm:'NVIDIA',pr:'142.68',chg:'+3.08%',dir:'up'},
  {tk:'AAPL',nm:'Apple',pr:'198.32',chg:'-0.82%',dir:'down'},
  {tk:'GOOG',nm:'Alphabet',pr:'172.00',chg:'+1.24%',dir:'up'},
  {tk:'TSM',nm:'TSMC',pr:'178.90',chg:'+3.11%',dir:'up'},
  {tk:'AMD',nm:'AMD',pr:'167.44',chg:'+2.91%',dir:'up'},
  {tk:'META',nm:'Meta',pr:'512.40',chg:'+2.75%',dir:'up'}
];
const portfolioData = [
  {tk:'NVDA',nm:'60 股',pr:'$142.68',pnl:'+$850',dir:'up'},
  {tk:'AAPL',nm:'35 股',pr:'$198.32',pnl:'+$459',dir:'up'},
  {tk:'META',nm:'10 股',pr:'$512.40',pnl:'+$324',dir:'up'},
  {tk:'MSFT',nm:'15 股',pr:'$425.00',pnl:'+$225',dir:'up'},
  {tk:'GOOG',nm:'25 股',pr:'$172.00',pnl:'+$100',dir:'up'}
];

/* 详细持仓(用于动态视图的风险/归因/明细) */
const holdings = [
  {tk:'NVDA',nm:'NVIDIA',shares:60,cost:128.50,price:142.68,pct:18.0,sector:'AI 芯片',beta:1.72,risk:'o'},
  {tk:'AAPL',nm:'Apple',shares:35,cost:185.20,price:198.32,pct:14.0,sector:'消费电子',beta:1.22,risk:'r'},
  {tk:'GOOG',nm:'Alphabet',shares:25,cost:168.00,price:172.00,pct:13.0,sector:'互联网',beta:1.05,risk:'g'},
  {tk:'META',nm:'Meta',shares:10,cost:480.00,price:512.40,pct:11.0,sector:'互联网',beta:1.32,risk:'g'},
  {tk:'TSM',nm:'TSMC',shares:30,cost:175.00,price:178.90,pct:8.0,sector:'AI 芯片',beta:1.45,risk:'o'},
  {tk:'AMD',nm:'AMD',shares:8,cost:160.00,price:167.44,pct:12.0,sector:'AI 芯片',beta:1.88,risk:'o'},
  {tk:'MSFT',nm:'Microsoft',shares:15,cost:410.00,price:425.00,pct:14.0,sector:'软件',beta:0.92,risk:'g'},
  {tk:'BRK.B',nm:'Berkshire',shares:20,cost:380.00,price:398.00,pct:10.0,sector:'金融',beta:0.88,risk:'g'}
];

/* 标的详情数据库 */
const ddb = {
  NVDA:{tk:'NVDA',nm:'NVIDIA Corporation',pr:'142.68',ch:'+4.27',pct:'+3.08%',p:true,op:'139.20',hi:'143.51',lo:'138.90',vol:'82.3M',pe:'68.2',cap:'$3.51T'},
  AAPL:{tk:'AAPL',nm:'Apple Inc.',pr:'198.32',ch:'-4.68',pct:'-2.31%',p:false,op:'202.10',hi:'202.85',lo:'197.60',vol:'54.1M',pe:'31.4',cap:'$3.04T'},
  TSM:{tk:'TSM',nm:'Taiwan Semiconductor',pr:'178.90',ch:'+5.40',pct:'+3.11%',p:true,op:'174.20',hi:'179.80',lo:'173.50',vol:'18.2M',pe:'24.8',cap:'$927B'},
  GOOG:{tk:'GOOG',nm:'Alphabet',pr:'172.00',ch:'+2.10',pct:'+1.24%',p:true,op:'170.50',hi:'172.80',lo:'170.10',vol:'21.5M',pe:'25.2',cap:'$2.15T'},
  AMD:{tk:'AMD',nm:'AMD',pr:'167.44',ch:'+4.74',pct:'+2.91%',p:true,op:'163.80',hi:'168.20',lo:'163.10',vol:'32.1M',pe:'42.6',cap:'$271B'},
  META:{tk:'META',nm:'Meta Platforms',pr:'512.40',ch:'+13.70',pct:'+2.75%',p:true,op:'499.80',hi:'514.00',lo:'498.50',vol:'28.7M',pe:'28.4',cap:'$1.31T'},
  MSFT:{tk:'MSFT',nm:'Microsoft',pr:'425.00',ch:'+2.80',pct:'+0.66%',p:true,op:'422.50',hi:'426.10',lo:'421.80',vol:'24.5M',pe:'36.2',cap:'$3.16T'},
  'BRK.B':{tk:'BRK.B',nm:'Berkshire Hathaway',pr:'398.00',ch:'+1.20',pct:'+0.30%',p:true,op:'397.00',hi:'399.50',lo:'396.80',vol:'4.2M',pe:'10.8',cap:'$857B'},
  BABA:{tk:'BABA',nm:'Alibaba',pr:'88.91',ch:'+0.40',pct:'+0.45%',p:true,op:'88.50',hi:'89.20',lo:'88.30',vol:'15.8M',pe:'14.2',cap:'$218B'},
  TSLA:{tk:'TSLA',nm:'Tesla',pr:'241.15',ch:'+3.90',pct:'+1.63%',p:true,op:'238.00',hi:'242.50',lo:'237.20',vol:'67.4M',pe:'68.4',cap:'$768B'}
};

/* NVDA 全维度详情(供 dyn-research 渲染,不污染 ddb 简表) */
const nvdaDetail = {
  hot: [
    { ic:'flame',    t:'#英伟达再创新高,市值飙破 5.2 万亿', meta:'43.42 万' },
    { ic:'calendar', t:'2027 财年第 1 季度业绩披露 2026.05.20 (美东)' }
  ],
  bio: {
    sector:'半导体厂商',
    desc:'英伟达公司作为一家数据中心规模的人工智能基础设施公司运营。该公司通过两个部门运营,分别是计算与网络部门和图形部门。计算与网络部门提供数据中心加速计算和网络平台,以及人工智能解决方案和软件,汽车平台以及自动驾驶和电动汽车解决方案,包括软件。图形部门则提供用于游戏和个人电脑的 GeForce GPU;为企业工作站图形提供的 Quadro/NVIDIA RTX GPU',
    industryMc:'12.44 万亿', mcChange:'+0.72%',
    mc:'5.08 万亿', rank:'1/87',
    industryRankPct:99
  },
  revenue: {
    years: ['2020','2021','2022','2023','2024','2025','2026'],
    industry: [
      { label:'计算和网络', values:[60, 110, 160, 260, 400, 1700, 1935], total:'1935 亿', pct:'89.6%', yoy:'+13.8%', color:'#00ADA2', subs:[
        { label:'数据中心',     total:'1862 亿', pct:'86.2%', yoy:'+14.5%' },
        { label:'网络平台',     total:'73 亿',   pct:'3.4%',  yoy:'+5.8%'  }
      ]},
      { label:'图形',       values:[55, 90,  100, 110, 130, 200,  225],  total:'225 亿',  pct:'10.4%', yoy:'+11.2%', color:'#8B5CF6', subs:[
        { label:'GeForce 游戏',     total:'168 亿', pct:'7.8%', yoy:'+9.6%'  },
        { label:'专业可视化',       total:'32 亿',  pct:'1.5%', yoy:'+18.4%' },
        { label:'汽车 / 自动驾驶',  total:'25 亿',  pct:'1.1%', yoy:'+85.2%' }
      ]}
    ]
  },
  fscore: {
    letter:'A', trend:'up', updated:'29/04/2026', sectorName:'半导体厂商产品行业',
    peerRank:'1/88', industryMedian:'C', industryAvg:'C',
    radar: [
      { k:'盈利', g:'A', v:.95 },
      { k:'成长', g:'A', v:.92 },
      { k:'运营', g:'A', v:.88 },
      { k:'安全', g:'B', v:.62 },
      { k:'现金', g:'B', v:.65 }
    ],
    groups: [
      { name:'盈利评分', grade:'A', up:true, items:[
        { k:'净资产收益率(ROE)', v:'101.49%', g:'A', up:true },
        { k:'净利率',           v:'55.60%',  g:'A', up:true },
        { k:'毛利率',           v:'71.07%',  g:'A', up:true }
      ]},
      { name:'成长评分', grade:'A', up:true },
      { name:'现金评分', grade:'B' },
      { name:'运营评分', grade:'A', up:true },
      { name:'负债评分', grade:'B', up:true }
    ]
  },
  valuation: {
    pe:  { name:'市盈率', cur:'42.35',  rank:'17/87', high:'48.02', mid:'36.00', low:'32.02', axisHi:64.03, axisLo:0,    seed:71 },
    pb:  { name:'市净率', cur:'32.33',  rank:'78/87', high:'43.97', mid:'35.00', low:'29.32', axisHi:58.63, axisLo:0,    seed:43 },
    ps:  { name:'市销率', cur:'23.55',  rank:'68/87', high:'25.12', mid:'18.00', low:'8.37',  axisHi:33.50, axisLo:0,    seed:91 },
    div: { name:'股息率', cur:'0.02%',  rank:'24/87', high:'0.04%', mid:'0.02%', low:'0.00%', axisHi:0.04,  axisLo:0,    seed:17, isPct:true }
  },
  events: [
    { date:'4 月 30 日', items:[
      { time:'08:00', t:'英伟达在北京车展上展示与吉利、奇瑞等中国汽车制造商的合作成果' },
      { time:'07:52', t:'三星电子率先启动 HBM4 大规模生产及销售' },
      { time:'06:11', t:'知名投资人但斌旗下公司披露最新美股持仓,增持英伟达' },
      { time:'04:05', t:'哈萨克斯坦总统会见英伟达和 Firebird AI 代表' },
      { time:'03:10', t:'英伟达下一代 GPU 将采用金刚石散热方案以提升性能' }
    ]},
    { date:'4 月 29 日', items:[
      { time:'23:16', t:'Arrive AI 采用英伟达 Blackwell GPU 和 Isaac Sim 平台加速 AI 及机器人开发' }
    ]}
  ],
  schedule: [
    { mo:'5 月', day:'20', type:'预计财报发布', sub:'2027 财年第 1 季度业绩披露', tz:'(美东时间)' },
    { mo:'4 月', day:'1',  type:'分配方案',    sub:'每股派息 0.01 USD',         tz:'(美东时间)' },
    { mo:'3 月', day:'12', type:'分配方案',    sub:'每股派息 0.01 USD',         tz:'(美东时间)' }
  ]
};

/* Signal 详情数据 */
const signalDB = {
  AMZN:{tk:'AMZN.US',nm:'Amazon',logo:'A',pr:'188.42',verdict:'bullish',range:'$188→$220',
    headline:'AI Revolution Core Beneficiary, Growth Story Just Beginning',
    desc:'Amazon has released its Q4 2025 earnings results. AWS revenue grew 19% YoY, driven by AI workload migration.',
    strategy:'Lynch-like Growth Strategy',time:'32 mins ago',
    detail:{targetVal:'$188 - $220',priceVsTarget:'+$32 / +17.0%',fit:87,fitLabel:'Strong bullish',
      catalyst:'AWS Cloud AI Revenue Acceleration',catalystDesc:'AWS cloud AI services revenue grew 42% YoY, beating expectations of 30%.',catalystSrc:'SEC & 3 sources',
      factors:[{n:'Revenue growth >25%',v:'✓',c:'g'},{n:'PEG ratio <1.5',v:'1.2',c:'g'},{n:'Market leader',v:'✓',c:'g'},{n:'Institutional buy',v:'N/A',c:'tm'}],
      objective:'High-growth companies at reasonable prices with strong moats and expanding markets.',
      process:'Lynch Growth Strategy evaluates revenue acceleration, PEG ratio, competitive position, and market expansion.',
      valLow:'$170',valBase:'$195',valHigh:'$225',valCurrent:'$188',
      risk:'Growth deceleration risk if AI spending slows. AWS faces Azure/GCP competition. Antitrust regulatory risk.',
      exec:[['Entry','Current price near fair value low'],['Rules','Buy on pullback below $185'],['Horizon','6-12 months'],['Position','4-6% of portfolio']]}
  },
  AAPL:{tk:'AAPL.US',nm:'Apple Inc',logo:'',pr:'198.32',verdict:'bearish',range:'$170→$235',
    headline:'Quality Strong, Valuation Rich — Wait for a Better Entry',
    desc:'Apple has durable competitive advantages. Latest earnings show ROE improved from 17% to 19%, services margin hit 71%.',
    strategy:'Buffett Value Strategy',time:'29 mins ago',
    detail:{targetVal:'$170 - $235',priceVsTarget:'$206 +$200 / -24.8%',fit:83,fitLabel:'Strong bearish',
      catalyst:'AAPL Earnings: iPhone Sales & Services Revenue Grow Strongly',catalystDesc:'Services hit $30B, margin expanded to 71%. Services now 26% of total revenue.',catalystSrc:'SEC & 5 sources',
      factors:[{n:'Economic moat',v:'Wide',c:'g'},{n:'ROE >15%',v:'19%',c:'g'},{n:'D/E ratio <0.5',v:'1.8',c:'r'},{n:'FCF yield >4%',v:'3.2%',c:'o'}],
      objective:'High-quality companies at reasonable prices, held long-term.',
      process:'Current price $206 vs DCF fair value $170–$235. Stock 33% above base $205. Wait for pullback below $200.',
      valLow:'$170',valBase:'$205',valHigh:'$235',valCurrent:'$206',
      risk:'Premium valuation with D/E 1.8 above threshold. iPhone China slowdown. EU DMA antitrust risk.',
      exec:[['Entry','Wait for pullback below $200'],['Rules','Buy on 10-20% below fair value'],['Horizon','10+ years'],['Position','3-5% of portfolio']]}
  }
};
