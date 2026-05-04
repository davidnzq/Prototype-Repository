/* ============================================================
   main.js — 启动 + 路由(视图切换/场景切换) + 全量渲染
   v18: HTML 已移除 .demo-b 按钮组,setS 保留供 console 调试/程序化切换
   依赖: 所有其他 js
   ============================================================ */

/* 主视图标签映射 */
const VIEW_TAGS = {home:'首页',watchlist:'自选',portfolio:'资产',news:'资讯',market:'市场',community:'社区',trade:'交易'};

/* 恢复 Chat 顶部 tag 为当前主视图 */
function restoreChatTag() {
  document.getElementById('chtag').textContent = VIEW_TAGS[cv] || '';
}

/* 切换主视图 */
function go(v) {
  exitDynamic();
  cv = v;
  document.querySelectorAll('.ni').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  document.querySelectorAll('.vw').forEach(el => el.classList.toggle('on', el.id === 'v-' + v));
  // 静态视图按需懒渲染(home 由 renderAll 渲染)
  const renderers = {
    watchlist: typeof renderWatchlist === 'function' ? renderWatchlist : null,
    portfolio: typeof renderPortfolio === 'function' ? renderPortfolio : null,
    news:      typeof renderNews      === 'function' ? renderNews      : null,
    market:    typeof renderMarket    === 'function' ? renderMarket    : null,
    community: typeof renderCommunity === 'function' ? renderCommunity : null,
    trade:     typeof renderTrade     === 'function' ? renderTrade     : null
  };
  if (renderers[v]) renderers[v]();
  restoreChatTag();
}

/* 切换场景(v18: HTML 已无 .demo-b;支持 console 调用 setS('active'|'calm'|'down')) */
function setS(s) {
  sc = s;
  document.querySelectorAll('.demo-b').forEach(b => b.classList.remove('on'));
  if (typeof event !== 'undefined' && event && event.target) event.target.classList.add('on');
  closeDetail();
  exitDynamic();
  go('home');
  renderAll();
}

/* 全量渲染 */
function renderAll() {
  renderIndices();
  renderAW();
  renderHome();
  renderChat();
}

/* 启动 */
document.getElementById('gin').addEventListener('input', e => handleLiveInput(e.target.value));
document.getElementById('gin').addEventListener('keydown', e => { if (e.key === 'Enter') sendG(); });

/* Chat 列宽度拖拽 */
(function initChatResize() {
  const ch = document.getElementById('ch');
  const handle = document.getElementById('chResize');
  if (!ch || !handle) return;
  const MIN = 220, MAX = 560;
  const saved = parseInt(localStorage.getItem('lb_ch_width') || '0', 10);
  if (saved >= MIN && saved <= MAX) ch.style.width = saved + 'px';
  let startX = 0, startW = 0, dragging = false;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startW = ch.getBoundingClientRect().width;
    handle.classList.add('active');
    document.body.classList.add('ch-resizing');
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = startX - e.clientX;
    const w = Math.max(MIN, Math.min(MAX, startW + dx));
    ch.style.width = w + 'px';
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('active');
    document.body.classList.remove('ch-resizing');
    localStorage.setItem('lb_ch_width', parseInt(ch.style.width, 10));
  });
})();

renderAll();

/* URL 参数注入:父页面把 demo 嵌进 iframe 时,通过 ?seed=xxx&mode=live|enter 预设典型状态。
   - seed: 输入框初始文本(等同于用户输入的意图)
   - mode: 'live'  仅触发 live morph(主区 + Agent 面板打开,不发 chat)
           'enter' 触发 live morph 后自动 Enter,完整 chat 流程
   不带参数 → 正常 home 启动(向后兼容) */
(function applyUrlSeed() {
  try {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    if (!seed) return;
    const mode = params.get('mode') === 'live' ? 'live' : 'enter';
    setTimeout(() => {
      const inp = document.getElementById('gin');
      if (!inp) return;
      inp.value = seed;
      if (typeof handleLiveInput === 'function') handleLiveInput(seed);
      if (mode === 'enter') {
        setTimeout(() => { if (typeof sendG === 'function') sendG(); }, 380);
      }
    }, 220);
  } catch (e) { console.warn('[seed]', e); }
})();

/* ============ 全局二次确认 modal ============
   confirmModal({title, body, kv, level, okText, cancelText})
   level: 'warn' | 'danger' | 'success' (default 'warn')
   返回 Promise<boolean>(true = 确认 / false = 取消) */
function confirmModal(opts) {
  return new Promise((resolve) => {
    const mask = document.getElementById('confirmModal');
    const ic = document.getElementById('confirmModalIc');
    const t = document.getElementById('confirmModalT');
    const bd = document.getElementById('confirmModalBd');
    const ok = document.getElementById('confirmModalOk');
    const cancel = document.getElementById('confirmModalCancel');
    const x = document.getElementById('confirmModalX');
    if (!mask) { resolve(true); return; }

    const level = opts.level || 'warn';
    ic.className = 'modal-ic' + (level === 'danger' ? ' danger' : level === 'success' ? ' success' : '');
    ic.innerHTML = icon(level === 'danger' ? 'alert-triangle' : level === 'success' ? 'check-circle' : 'alert-triangle', 16);
    t.textContent = opts.title || '请确认';

    let bodyHtml = '';
    if (opts.body) bodyHtml += `<div>${opts.body}</div>`;
    if (opts.kv && opts.kv.length) {
      bodyHtml += `<div class="modal-kv">`;
      opts.kv.forEach(([k, v, cls]) => {
        bodyHtml += `<span class="modal-kv-k">${k}</span><span class="modal-kv-v ${cls||''}">${v}</span>`;
      });
      bodyHtml += `</div>`;
    }
    bd.innerHTML = bodyHtml;

    ok.textContent = opts.okText || '确认';
    cancel.textContent = opts.cancelText || '取消';
    ok.className = 'modal-btn ' + (level === 'danger' ? 'danger' : 'primary');

    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
    setTimeout(() => ok.focus(), 50);

    const close = (result) => {
      mask.classList.remove('show');
      mask.setAttribute('aria-hidden', 'true');
      ok.removeEventListener('click', okFn);
      cancel.removeEventListener('click', cancelFn);
      x.removeEventListener('click', cancelFn);
      mask.removeEventListener('click', maskFn);
      document.removeEventListener('keydown', keyFn);
      resolve(result);
    };
    const okFn = () => close(true);
    const cancelFn = () => close(false);
    const maskFn = (e) => { if (e.target === mask) close(false); };
    const keyFn = (e) => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName !== 'INPUT') close(true);
    };
    ok.addEventListener('click', okFn);
    cancel.addEventListener('click', cancelFn);
    x.addEventListener('click', cancelFn);
    mask.addEventListener('click', maskFn);
    document.addEventListener('keydown', keyFn);
  });
}
