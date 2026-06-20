/**
 * 道具管理 — 紫钻追踪 + 氪背自定义
 * 存储: purple_diamond_log → [{ date, amount }]
 *       krypton_bgs → [{ id, name }]
 */
(function () {
  'use strict';
  var LOG_KEY = 'purple_diamond_log';
  var BG_KEY = 'krypton_bgs';

  function getLog() {
    var log = Storage.get(LOG_KEY, []);
    if (log.length === 0) {
      log = [{ date: todayStr(), amount: 0 }];
      Storage.set(LOG_KEY, log);
    }
    return log;
  }
  function saveLog(l) { Storage.set(LOG_KEY, l); }
  function getBGs() { return Storage.get(BG_KEY, []); }
  function saveBGs(b) { Storage.set(BG_KEY, b); }
  function todayStr() { var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function gid() { return 'kb_'+Date.now()+'_'+Math.random().toString(36).slice(2,6); }
  function esc(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  function fmtDate(ds) { if(!ds)return ''; var p=ds.split('-'); return parseInt(p[1])+'/'+parseInt(p[2]); }
  function fmtDateFull(ds) { if(!ds)return ''; var p=ds.split('-'); return p[0]+'年'+parseInt(p[1])+'月'+parseInt(p[2])+'日'; }

  function render(params, container) { renderPage(container); }

  function renderPage(container) {
    var log = getLog();
    var bgs = getBGs();
    // 按日期排序
    log.sort(function(a,b){ return a.date.localeCompare(b.date); });
    var cur = log.length>0 ? log[log.length-1].amount : 0;

    // 图表
    var chartHtml = log.length < 2
      ? '<div class="chart-empty">数据不足，添加记录后显示折线图</div>'
      : buildChartFull(log);

    // 记录列表（最新在前）
    var logReversed = log.slice().reverse();
    var logListHtml = logReversed.map(function(entry, i){
      return '<div class="pd-log-row">'+
        '<div class="pdl-date">'+fmtDateFull(entry.date)+'</div>'+
        '<div class="pdl-amt">💜 '+entry.amount+'</div>'+
        (logReversed.length>1 ? '<button class="pdl-del" data-date="'+entry.date+'">×</button>' : '')+
      '</div>';
    }).join('');

    // 氪背
    var bgListHtml = bgs.length === 0
      ? '<div class="empty-cute">还没有氪背<br><span>点击下方 + 添加</span></div>'
      : bgs.map(function(bg){
          return '<div class="kb-row">'+
            '<span class="kb-dot-icon"></span>'+
            '<div class="kb-info"><div class="kb-name">'+esc(bg.name)+'</div></div>'+
            '<button class="kb-del" data-kbid="'+bg.id+'">×</button>'+
          '</div>';
        }).join('');

    container.innerHTML = '<div class="page">'+

      // 紫钻
      '<div class="pd-card">'+
        '<div class="pd-header">'+
          '<div><div class="pd-title">💜 紫钻</div><div class="pd-sub">当前持有</div></div>'+
          '<div class="pd-current">'+cur+'</div>'+
        '</div>'+
        '<div class="pd-chart-wrap">'+chartHtml+'</div>'+
        '<button class="pd-add-btn" id="pd-add">+ 添加记录</button>'+
        '<div class="pd-log-title">📋 记录历史</div>'+
        '<div class="pd-log-list">'+logListHtml+'</div>'+
      '</div>'+

      // 氪背
      '<div class="page-head"><h2>🖼️ 氪背</h2><span class="page-sub">'+bgs.length+' 个</span></div>'+
      '<div class="kb-list">'+bgListHtml+'</div>'+
      '<button class="fab pulse" id="kb-add">+</button>'+

      // 添加紫钻记录弹窗
      '<div class="modal hidden" id="pd-modal"><div class="modal-mask"></div><div class="modal-sheet">'+
        '<div class="modal-head"><button class="modal-cancel" id="pd-cancel">取消</button><span class="modal-title">添加记录</span><button class="modal-save" id="pd-save">保存</button></div>'+
        '<div class="form-pad">'+
          '<label class="flabel">日期</label><input type="date" id="pd-date" value="'+todayStr()+'">'+
          '<label class="flabel">数量</label><input type="number" id="pd-amount" placeholder="紫钻数量" inputmode="numeric" min="0">'+
        '</div>'+
      '</div></div>'+

      // 添加氪背弹窗
      '<div class="modal hidden" id="kb-modal"><div class="modal-mask"></div><div class="modal-sheet">'+
        '<div class="modal-head"><button class="modal-cancel" id="kb-cancel">取消</button><span class="modal-title">添加氪背</span><button class="modal-save" id="kb-save">添加</button></div>'+
        '<div class="form-pad"><input type="text" id="kb-name" placeholder="氪背名称，例如：樱花庭院"></div>'+
      '</div></div>'+
    '</div>';

    bindEvents(container, log, bgs);
  }

  function buildChartFull(log) {
    var vals = log.map(function(p){return p.amount;});
    var max = Math.max.apply(null, vals);
    var min = Math.min.apply(null, vals);
    if (max === min) max = min + 10;

    var W = 320, H = 150, padL = 36, padR = 16, padT = 12, padB = 24;
    var pw = W - padL - padR, ph = H - padT - padB;

    function x(i) { return padL + (i/(log.length-1)) * pw; }
    function y(v) { return padT + ph - ((v-min)/(max-min)) * ph; }

    var line = log.map(function(p,i){ return (i===0?'M':'L')+' '+x(i).toFixed(1)+' '+y(p.amount).toFixed(1); }).join(' ');
    var area = line + ' L '+x(log.length-1).toFixed(1)+' '+(padT+ph)+' L '+x(0).toFixed(1)+' '+(padT+ph)+' Z';

    var dots = log.map(function(p,i){
      return '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(p.amount).toFixed(1)+'" r="3.5" fill="var(--pink)" stroke="#fff" stroke-width="2"/>';
    }).join('');

    // Y 轴标签
    var yMax = '<text x="'+(padL-6)+'" y="'+(padT+5)+'" class="chart-label" text-anchor="end">'+max+'</text>';
    var yMin = '<text x="'+(padL-6)+'" y="'+(H-padB+8)+'" class="chart-label" text-anchor="end">'+min+'</text>';

    // X 轴标签 — 首尾
    var x0 = '<text x="'+x(0).toFixed(0)+'" y="'+(H-2)+'" class="chart-label">'+fmtDate(log[0].date)+'</text>';
    var xN = '<text x="'+x(log.length-1).toFixed(0)+'" y="'+(H-2)+'" class="chart-label" text-anchor="end">'+fmtDate(log[log.length-1].date)+'</text>';

    return '<svg viewBox="0 0 '+W+' '+H+'" class="chart-svg">'+
      '<defs><linearGradient id="pd-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--pink)" stop-opacity="0.15"/><stop offset="100%" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+area+'" fill="url(#pd-grad)"/>'+
      '<path d="'+line+'" fill="none" stroke="var(--pink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
      dots + yMax + yMin + x0 + xN +
    '</svg>';
  }

  function bindEvents(c, log, bgs) {
    // 添加紫钻记录
    var pdModal = c.querySelector('#pd-modal');
    c.querySelector('#pd-add').addEventListener('click', function(){
      pdModal.classList.remove('hidden');
      c.querySelector('#pd-date').value = todayStr();
      c.querySelector('#pd-amount').value = '';
      c.querySelector('#pd-amount').focus();
    });
    c.querySelector('#pd-cancel').addEventListener('click', function(){ pdModal.classList.add('hidden'); });
    c.querySelector('#pd-save').addEventListener('click', function(){
      var date = c.querySelector('#pd-date').value;
      var amt = parseInt(c.querySelector('#pd-amount').value);
      if (!date || isNaN(amt) || amt < 0) { c.querySelector('#pd-amount').focus(); return; }
      // 同一天已有记录则更新
      var exist = log.find(function(e){ return e.date === date; });
      if (exist) { exist.amount = amt; }
      else { log.push({ date: date, amount: amt }); }
      saveLog(log); pdModal.classList.add('hidden'); renderPage(c);
    });
    pdModal.querySelector('.modal-mask').addEventListener('click', function(){ pdModal.classList.add('hidden'); });

    // 删除紫钻记录
    c.querySelectorAll('.pdl-del').forEach(function(btn){
      btn.addEventListener('click', function(){
        var date = btn.getAttribute('data-date');
        var filtered = log.filter(function(e){ return e.date !== date; });
        if (filtered.length === 0) filtered = [{ date: todayStr(), amount: 0 }];
        saveLog(filtered); renderPage(c);
      });
    });

    // 删除氪背
    c.querySelectorAll('.kb-del').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-kbid');
        if (confirm('删除「'+(bgs.find(function(x){return x.id===id;})||{}).name+'」？')) {
          saveBGs(bgs.filter(function(x){return x.id!==id;})); renderPage(c);
        }
      });
    });

    // 添加氪背
    var kbModal = c.querySelector('#kb-modal');
    c.querySelector('#kb-add').addEventListener('click', function(){
      kbModal.classList.remove('hidden'); c.querySelector('#kb-name').value=''; c.querySelector('#kb-name').focus();
    });
    c.querySelector('#kb-cancel').addEventListener('click', function(){ kbModal.classList.add('hidden'); });
    kbModal.querySelector('.modal-mask').addEventListener('click', function(){ kbModal.classList.add('hidden'); });
    c.querySelector('#kb-save').addEventListener('click', function(){
      var nm = c.querySelector('#kb-name').value.trim();
      if (!nm) { c.querySelector('#kb-name').focus(); return; }
      bgs.push({ id:gid(), name:nm }); saveBGs(bgs); kbModal.classList.add('hidden'); renderPage(c);
    });
  }

  ToolRegistry.register({
    id: 'items', title: '道具', icon: '💎', tab: true,
    tabIcon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 1 15 8 22 9 16 14 18 22 12 18 6 22 8 14 2 9 9 8"/></svg>',
    render: render
  });
})();
