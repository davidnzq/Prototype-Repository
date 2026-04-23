/* ============================================================
   main.js — 启动 + 路由(视图切换/场景切换) + 全量渲染
   v18: HTML 已移除 .demo-b 按钮组,setS 保留供 console 调试/程序化切换
   依赖: 所有其他 js
   ============================================================ */

/* 切换主视图 */
function go(v) {
  exitDynamic();
  cv = v;
  document.querySelectorAll('.ni').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  document.querySelectorAll('.vw').forEach(el => el.classList.toggle('on', el.id === 'v-' + v));
  document.getElementById('chtag').textContent = {home:'首页',watchlist:'自选',portfolio:'资产',news:'资讯',market:'市场',community:'社区',trade:'交易'}[v] || '';
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

renderAll();
