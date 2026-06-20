/**
 * 我的 — 衣橱统计 + 设置
 */
(function () {
  'use strict';

  var DARK_KEY = 'dark_mode';

  function isDark() { var s=Storage.get(DARK_KEY,null); return s!==null?s:window.matchMedia('(prefers-color-scheme:dark)').matches; }
  function applyTheme(dark) { var h=document.documentElement; h.classList.remove('dark','light'); h.classList.add(dark?'dark':'light'); }

  var STATUS_ORDER = ['全扩','扩裙','全齐','抽裙','特姿','未抽齐'];
  var STATUS_COLORS = { '全扩':'#E8A840', '扩裙':'#9B7FD4', '全齐':'#5BAF6B', '抽裙':'#5B9BD5', '特姿':'#FF7BA6', '未抽齐':'#B08898' };

  function getStats() {
    var outfits = Storage.get('outfits_v2', []);
    var pdLog = Storage.get('purple_diamond_log', []);
    var bgs = Storage.get('krypton_bgs', []);
    var byStatus = {};
    outfits.forEach(function(o){ var s=o.status||'未抽齐'; byStatus[s]=(byStatus[s]||0)+1; });
    var pdAmount = pdLog.length>0 ? pdLog[pdLog.length-1].amount : 0;
    return { setCount: outfits.length, byStatus: byStatus, pdAmount: pdAmount, bgCount: bgs.length };
  }

  function render(params, container) {
    var stats = getStats();
    var dark = isDark();
    var haveAll = (stats.byStatus['全齐']||0)+(stats.byStatus['扩裙']||0)+(stats.byStatus['全扩']||0);

    container.innerHTML =
      '<div class="page">'+
        '<div class="page-head"><h2>✨ 衣橱统计</h2></div>'+
        '<div class="stats-grid">'+
          '<div class="stat-card"><div class="sc-num">'+stats.setCount+'</div><div class="sc-label">总套装</div></div>'+
          '<div class="stat-card"><div class="sc-num">'+haveAll+'</div><div class="sc-label">已拥有</div></div>'+
          '<div class="stat-card"><div class="sc-num">'+(stats.byStatus['全扩']||0)+'</div><div class="sc-label">全扩</div></div>'+
          '<div class="stat-card"><div class="sc-num">'+(stats.byStatus['特姿']||0)+'</div><div class="sc-label">特姿</div></div>'+
        '</div>'+
        '<div class="section-title">📊 状态分布</div>'+
        '<div class="status-bars">'+
          STATUS_ORDER.map(function(sk){
            var n = stats.byStatus[sk]||0;
            var pct = stats.setCount>0?Math.round(n/stats.setCount*100):0;
            return '<div class="sb-row"><span class="sb-label">'+sk+'</span>'+
              '<div class="sb-bar"><div class="sb-fill" style="width:'+pct+'%;background:'+(STATUS_COLORS[sk]||'#888')+'"></div></div>'+
              '<span class="sb-num">'+n+'</span></div>';
          }).join('')+
        '</div>'+
        '<div class="section-title">💎 道具一览</div>'+
        '<div class="item-quick">'+
          '<div class="iq-item" style="--accent:#C77DFF"><span>💜</span><span>紫钻 '+stats.pdAmount+'</span></div>'+
          '<div class="iq-item" style="--accent:#FFB347"><span>🖼️</span><span>氪背 '+stats.bgCount+' 个</span></div>'+
        '</div>'+
        '<div class="section-title">⚙️ 设置</div>'+
        '<div class="settings-group">'+
          '<div class="settings-row">'+
            '<span>深色模式</span>'+
            '<label class="toggle"><input type="checkbox" id="dark-toggle"'+(dark?' checked':'')+'><span class="toggle-slider"></span></label>'+
          '</div>'+
          '<button class="settings-row settings-btn" id="export-data">导出数据 <span style="color:var(--text2)">JSON</span></button>'+
          '<button class="settings-row settings-btn danger" id="clear-data">清除所有数据</button>'+
        '</div>'+
        '<div class="about-line">以闪亮之名 · 衣橱助手 v1.0</div>'+
      '</div>';

    container.querySelector('#dark-toggle').addEventListener('change', function(){ var v=this.checked; Storage.set(DARK_KEY,v); applyTheme(v); });
    container.querySelector('#export-data').addEventListener('click', function(){
      var all = { outfits_v2: Storage.get('outfits_v2',[]), purple_diamond_log: Storage.get('purple_diamond_log',[]), krypton_bgs: Storage.get('krypton_bgs',[]), exported: new Date().toISOString() };
      var blob = new Blob([JSON.stringify(all,null,2)], {type:'application/json'});
      var a = document.createElement('a'); a.href=URL.createObjectURL(blob);
      a.download = 'yishan_closet_'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    container.querySelector('#clear-data').addEventListener('click', function(){
      if (confirm('确定删除所有数据吗？此操作不可恢复。')) { Storage.remove('outfits_v2'); Storage.remove('purple_diamond_log'); Storage.remove('krypton_bgs'); Router.refresh(); }
    });
  }

  applyTheme(isDark());
  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function(e){
    if (Storage.get(DARK_KEY,null)===null) applyTheme(e.matches);
  });

  ToolRegistry.register({
    id: 'profile', title: '我的', icon: '✨',
    tab: true,
    tabIcon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 00-16 0"/></svg>',
    render: render
  });
})();
