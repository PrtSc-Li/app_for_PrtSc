/**
 * 道具管理 — 紫钻折线图 + 氪背自定义
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
      // 初始化：今天的 0 点
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
  function fmtDate(ds) { if(!ds)return''; var p=ds.split('-'); return parseInt(p[1])+'/'+parseInt(p[2]); }

  function render(params, container) {
    renderPage(container);
  }

  function renderPage(container) {
    var log = getLog();
    var bgs = getBGs();
    var curAmount = log.length > 0 ? log[log.length-1].amount : 0;

    // 紫钻卡片 + 图表
    var chartSvg = buildChart(log);

    // 氪背列表
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
      '<div class="page-head"><h2>💎 我的道具</h2></div>'+

      // 紫钻
      '<div class="item-card-lg">'+
        '<div class="icl-top">'+
          '<span class="icl-icon">💜</span>'+
          '<div><div class="icl-title">紫钻</div><div class="icl-sub">当前数量</div></div>'+
        '</div>'+
        '<div class="icl-amount" id="pd-amount">'+curAmount+'</div>'+
        '<div class="icl-actions">'+
          '<button class="ic-btn" id="pd-minus">−</button>'+
          '<button class="ic-btn" id="pd-plus">+</button>'+
        '</div>'+
        '<div class="icl-chart" id="pd-chart">'+chartSvg+'</div>'+
        '<div class="icl-chart-label">近 7 次记录</div>'+
      '</div>'+

      // 氪背
      '<div class="page-head"><h2>🖼️ 氪背</h2><span class="page-sub">'+bgs.length+' 个</span></div>'+
      '<div class="kb-list">'+bgListHtml+'</div>'+
      '<button class="fab pulse" id="kb-add">+</button>'+

      // 添加氪背弹窗
      '<div class="modal hidden" id="kb-modal"><div class="modal-mask"></div><div class="modal-sheet">'+
        '<div class="modal-head"><button class="modal-cancel" id="kb-cancel">取消</button><span class="modal-title">添加氪背</span><button class="modal-save" id="kb-save">添加</button></div>'+
        '<div class="form-pad">'+
          '<input type="text" id="kb-name" placeholder="氪背名称，例如：樱花庭院">'+
        '</div>'+
      '</div></div>'+
    '</div>';

    bindEvents(container, log, bgs);
  }

  function buildChart(log) {
    // 取最近 10 条记录
    var points = log.slice(-10);
    if (points.length < 2) return '<div class="chart-empty">数据不足，添加记录后显示折线图</div>';

    var vals = points.map(function(p){return p.amount;});
    var max = Math.max.apply(null, vals);
    var min = Math.min.apply(null, vals);
    if (max === min) max = min + 10; // 避免除零

    var W = 300, H = 120, padL = 32, padR = 12, padT = 10, padB = 22;
    var plotW = W - padL - padR, plotH = H - padT - padB;

    function x(i) { return padL + (i/(points.length-1)) * plotW; }
    function y(v) { return padT + plotH - ((v-min)/(max-min)) * plotH; }

    // 折线 + 面积路径
    var linePath = points.map(function(p,i){ return (i===0?'M':'L')+' '+x(i).toFixed(1)+' '+y(p.amount).toFixed(1); }).join(' ');
    var areaPath = linePath + ' L ' + x(points.length-1).toFixed(1) + ' ' + (padT+plotH) + ' L ' + x(0).toFixed(1) + ' ' + (padT+plotH) + ' Z';

    // 圆点
    var dots = points.map(function(p,i){
      return '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(p.amount).toFixed(1)+'" r="3" fill="var(--pink)" stroke="#fff" stroke-width="1.5"/>';
    }).join('');

    // Y 轴标签
    var yTop = '<text x="'+(padL-4)+'" y="'+(padT+4).toFixed(1)+'" class="chart-label">'+max+'</text>';
    var yBot = '<text x="'+(padL-4)+'" y="'+(H-padB+6)+'" class="chart-label">'+min+'</text>';

    // X 轴标签 (首尾)
    var xFirst = '<text x="'+x(0).toFixed(0)+'" y="'+(H-2)+'" class="chart-label">'+fmtDate(points[0].date)+'</text>';
    var xLast = '<text x="'+x(points.length-1).toFixed(0)+'" y="'+(H-2)+'" class="chart-label" text-anchor="end">'+fmtDate(points[points.length-1].date)+'</text>';

    return '<svg viewBox="0 0 '+W+' '+H+'" class="chart-svg">'+
      '<defs><linearGradient id="pd-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--pink)" stop-opacity="0.15"/><stop offset="100%" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>'+
      '<path d="'+areaPath+'" fill="url(#pd-grad)"/>'+
      '<path d="'+linePath+'" fill="none" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
      dots + yTop + yBot + xFirst + xLast +
    '</svg>';
  }

  function bindEvents(c, log, bgs) {
    var curAmount = log.length>0 ? log[log.length-1].amount : 0;

    // 紫钻 +/-
    function adjustPd(delta) {
      var newVal = curAmount + delta;
      if (newVal < 0) newVal = 0;
      var today = todayStr();
      // 如果今天已有记录则更新，否则新增
      if (log.length>0 && log[log.length-1].date === today) {
        log[log.length-1].amount = newVal;
      } else {
        log.push({ date: today, amount: newVal });
      }
      saveLog(log);
      renderPage(c);
    }
    c.querySelector('#pd-minus').addEventListener('click', function(){ adjustPd(-1); });
    c.querySelector('#pd-plus').addEventListener('click', function(){ adjustPd(1); });
    c.querySelector('#pd-amount').addEventListener('click', function(){
      var input = prompt('输入紫钻数量:', String(curAmount));
      if (input !== null) {
        var v = parseInt(input);
        if (!isNaN(v) && v >= 0) {
          var today = todayStr();
          if (log.length>0 && log[log.length-1].date === today) { log[log.length-1].amount = v; }
          else { log.push({ date: today, amount: v }); }
          saveLog(log); renderPage(c);
        }
      }
    });

    // 删除氪背
    c.querySelectorAll('.kb-del').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-kbid');
        var bg = bgs.find(function(x){return x.id===id;});
        if (confirm('删除「'+(bg?bg.name:'')+'」？')) {
          saveBGs(bgs.filter(function(x){return x.id!==id;})); renderPage(c);
        }
      });
    });

    // 添加氪背
    var modal = c.querySelector('#kb-modal');
    c.querySelector('#kb-add').addEventListener('click', function(){
      modal.classList.remove('hidden'); c.querySelector('#kb-name').value=''; c.querySelector('#kb-name').focus();
    });
    c.querySelector('#kb-cancel').addEventListener('click', function(){ modal.classList.add('hidden'); });
    c.querySelector('.modal-mask').addEventListener('click', function(){ modal.classList.add('hidden'); });
    c.querySelector('#kb-save').addEventListener('click', function(){
      var nm = c.querySelector('#kb-name').value.trim();
      if (!nm) { c.querySelector('#kb-name').focus(); return; }
      bgs.push({ id:gid(), name:nm });
      saveBGs(bgs); modal.classList.add('hidden'); renderPage(c);
    });
  }

  ToolRegistry.register({
    id: 'items', title: '道具', icon: '💎', tab: true,
    tabIcon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 1 15 8 22 9 16 14 18 22 12 18 6 22 8 14 2 9 9 8"/></svg>',
    render: render
  });
})();
