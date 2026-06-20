/**
 * 套装管理 v2 — 内置数据 + 分类/状态双重筛选 + 详情页
 */
(function () {
  'use strict';
  var KEY = 'outfits_v2';
  var DATA_VER = 2;

  var CATEGORIES = ['限时六星','陪跑五星','限时五星','盲盒','潮流密码'];

  var STATUSES = [
    { key: '未抽齐', color: '#B08898', bg: '#F5F0F3' },
    { key: '抽裙',   color: '#5B9BD5', bg: '#EEF4FB' },
    { key: '全齐',   color: '#5BAF6B', bg: '#EDF7EF' },
    { key: '扩裙',   color: '#9B7FD4', bg: '#F4F0FB' },
    { key: '全扩',   color: '#E8A840', bg: '#FFF9EC' },
    { key: '特姿',   color: '#FF7BA6', bg: '#FFF0F5' }
  ];

  var BUILTIN = [
    { id:'s001', name:'海王',   fullName:'海谕遥音', icon:'🌊', category:'限时六星', release:'2023/5/4',  rerun1:'2024/6/14', rerun2:'2025/9/2'  },
    { id:'s002', name:'赋雪',   fullName:'翩鸿赋雪', icon:'❄️', category:'限时六星', release:'2023/6/15', rerun1:'2025/2/20', rerun2:'2025/11/25' },
    { id:'s003', name:'爱神',   fullName:'圣谛恋歌', icon:'💘', category:'限时六星', release:'2023/7/27', rerun1:'2024/10/18',rerun2:'2025/7/22' },
    { id:'s004', name:'嫦娥',   fullName:'瑶台月阑', icon:'🌕', category:'限时六星', release:'2023/9/6',  rerun1:'2024/11/29',rerun2:'2025/10/14' },
    { id:'s005', name:'鸢尾',   fullName:'鸢尾与权杖', icon:'⚜️', category:'限时六星', release:'2023/10/18',rerun1:'', rerun2:'' },
    { id:'s006', name:'发条',   fullName:'发条之心', icon:'🕰️', category:'限时六星', release:'2023/11/29',rerun1:'2025/1/10', rerun2:'2026/1/6'  },
    { id:'s007', name:'蜀绣',   fullName:'绣阙锦天', icon:'🧵', category:'限时六星', release:'2024/1/10', rerun1:'2025/9/17', rerun2:'' },
    { id:'s008', name:'龙母',   fullName:'夜渊领主', icon:'🐉', category:'限时六星', release:'2024/2/21', rerun1:'2025/4/2',  rerun2:'2026/3/31' },
    { id:'s009', name:'九尾',   fullName:'九尾熠世', icon:'🦊', category:'限时六星', release:'2024/4/3',  rerun1:'2025/5/14', rerun2:'2026/2/17' },
    { id:'s010', name:'玛丽苏', fullName:'绮梦星河', icon:'💫', category:'限时六星', release:'2024/5/15', rerun1:'2025/10/29',rerun2:'' },
    { id:'s011', name:'傀儡',   fullName:'瓷心傀儡', icon:'🪆', category:'限时六星', release:'2024/6/26', rerun1:'2025/6/25', rerun2:'2026/5/12' },
    { id:'s012', name:'人鱼',   fullName:'幻海星穹', icon:'🧜', category:'限时六星', release:'2024/8/7',  rerun1:'2025/8/6',  rerun2:'2026/6/23' },
    { id:'s013', name:'白泽',   fullName:'白泽华梦', icon:'🦄', category:'限时六星', release:'2024/9/17', rerun1:'', rerun2:'' },
    { id:'s014', name:'阁楼',   fullName:'无烬之誓', icon:'🏰', category:'限时六星', release:'2024/10/30',rerun1:'2026/1/21', rerun2:'' },
    { id:'s015', name:'女武神', fullName:'永曜圣辉', icon:'⚔️', category:'限时六星', release:'2024/12/11',rerun1:'2025/12/10',rerun2:'' },
    { id:'s016', name:'青鸾',   fullName:'醉引青鸾', icon:'🦜', category:'限时六星', release:'2025/1/22', rerun1:'2026/4/15', rerun2:'' },
    { id:'s017', name:'吸血鬼', fullName:'烬蔷祈焰', icon:'🧛', category:'限时六星', release:'2025/3/4',  rerun1:'2026/3/4',  rerun2:'' },
    { id:'s018', name:'竖琴',   fullName:'林祈弦歌', icon:'🎵', category:'限时六星', release:'2025/4/15', rerun1:'2026/5/27', rerun2:'' },
    { id:'s019', name:'圣域',   fullName:'圣权领域', icon:'🏛️', category:'限时六星', release:'2025/5/27', rerun1:'', rerun2:'' },
    { id:'s020', name:'傩戏',   fullName:'玄绛舞祓', icon:'🎭', category:'限时六星', release:'2025/7/8',  rerun1:'', rerun2:'' },
    { id:'s021', name:'狩月',   fullName:'朔月神临', icon:'🌑', category:'限时六星', release:'2025/8/19', rerun1:'', rerun2:'' },
    { id:'s022', name:'洋娃娃', fullName:'梦遐绮旅', icon:'🎎', category:'限时六星', release:'2025/9/30', rerun1:'', rerun2:'' },
    { id:'s023', name:'不死鸟', fullName:'涅槃咏叹', icon:'🔥', category:'限时六星', release:'2025/11/11',rerun1:'', rerun2:'' },
    { id:'s024', name:'玛丽',   fullName:'猩红噬梦', icon:'🌹', category:'限时六星', release:'2025/12/23',rerun1:'', rerun2:'' },
    { id:'s025', name:'白虎',   fullName:'寅雪渡尘', icon:'🐯', category:'限时六星', release:'2026/2/3',  rerun1:'', rerun2:'' },
    { id:'s026', name:'美杜莎', fullName:'湮世瞳华', icon:'🐍', category:'限时六星', release:'2026/3/17', rerun1:'', rerun2:'' },
    { id:'s027', name:'百合',   fullName:'岩塑花契', icon:'🪻', category:'限时六星', release:'2026/4/28', rerun1:'', rerun2:'' },
    { id:'s028', name:'小羊',   fullName:'蕃神春醺', icon:'🐑', category:'限时六星', release:'2026/6/9',  rerun1:'', rerun2:'' }
  ];

  BUILTIN.forEach(function(o){ if(!o.status) o.status = '未抽齐'; });

  function get() {
    var data = Storage.get(KEY, null);
    var ver = Storage.get('data_version', 0);
    if (data === null || ver !== DATA_VER) {
      Storage.set(KEY, BUILTIN); Storage.set('data_version', DATA_VER);
      return BUILTIN.slice();
    }
    return data;
  }
  function save(d) { Storage.set(KEY, d); }
  function esc(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  function getStatus(sk) { return STATUSES.find(function(s){return s.key===sk;})||STATUSES[0]; }
  function fmtDate(ds) { if(!ds)return''; var p=ds.split('/'); return p[0]+'年'+parseInt(p[1])+'月'+parseInt(p[2])+'日'; }

  function render(params, container) {
    var sid = params.outfitId;
    if (sid) { renderDetail(sid, container); }
    else { renderList(container); }
  }

  // ===== 列表 =====
  function renderList(container) {
    var outfits = get();
    var activeCat = container._activeCat || '全部';
    var activeStatuses = container._activeStatuses || STATUSES.map(function(s){return s.key;});
    container._activeCat = activeCat; container._activeStatuses = activeStatuses;

    var filtered = outfits.filter(function(o){
      if (activeCat !== '全部' && o.category !== activeCat) return false;
      if (activeStatuses.indexOf(o.status||'未抽齐') === -1) return false;
      return true;
    });
    var catCounts = {};
    outfits.forEach(function(o){ catCounts[o.category]=(catCounts[o.category]||0)+1; });
    var grouped = groupByCategory(filtered, activeCat==='全部');

    container.innerHTML = '<div class="page">'+
      '<div class="filter-bar" id="filter-bar">'+
        '<button class="filter-chip'+(activeCat==='全部'?' active':'')+'" data-cat="全部"><small>'+outfits.length+'</small></button>'+
        CATEGORIES.map(function(cat){ var n=catCounts[cat]||0; return '<button class="filter-chip'+(activeCat===cat?' active':'')+'" data-cat="'+cat+'">'+cat+(n>0?' <small>'+n+'</small>':'')+'</button>'; }).join('')+
      '</div>'+
      '<div class="filter-info" id="status-filter-toggle">'+
        '<span>🔍 '+(activeStatuses.length===STATUSES.length?'全部状态':activeStatuses.length+' 种状态')+'（共 '+filtered.length+' 件）</span>'+
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>'+
      '<div class="suit-list" id="suit-list">'+(filtered.length===0
        ? '<div class="empty-cute">✨<br>没有符合条件的套装<br><span>试试调整筛选条件</span></div>'
        : grouped.map(function(group){ return (activeCat==='全部'?'<div class="group-label">'+group.cat+' · '+(catCounts[group.cat]||0)+'件</div>':'')+group.items.map(function(o){ var st=getStatus(o.status); return '<div class="suit-card" data-id="'+o.id+'"><div class="suit-icon">'+(o.icon||'👑')+'</div><div class="suit-info"><div class="suit-name">'+esc(o.name)+'</div><div class="suit-sub">'+esc(o.fullName)+' · '+o.release+'</div></div><button class="suit-status" style="--st-color:'+st.color+';--st-bg:'+st.bg+'" data-id="'+o.id+'">'+st.key+'</button></div>'; }).join(''); }).join(''))+
      '</div>'+
      '<div class="modal hidden" id="status-filter-sheet"><div class="modal-mask"></div><div class="modal-sheet">'+
        '<div class="modal-head"><span class="modal-title">按状态筛选</span><button class="modal-save" id="sf-done">完成</button></div>'+
        '<div class="status-filter-list" id="status-filter-list"></div>'+
        '<div class="sf-actions"><button class="sf-btn" id="sf-select-all">全选</button><button class="sf-btn" id="sf-deselect-all">全不选</button></div></div></div>'+
    '</div>';

    bindListEvents(container, outfits);
  }

  function groupByCategory(outfits) {
    var map = {};
    outfits.forEach(function(o){ if(!map[o.category])map[o.category]=[]; map[o.category].push(o); });
    return CATEGORIES.filter(function(c){return map[c]&&map[c].length>0;}).map(function(c){return{cat:c,items:map[c]};});
  }

  function bindListEvents(c, outfits) {
    c.querySelector('#filter-bar').addEventListener('click', function(e){
      var chip=e.target.closest('.filter-chip'); if(!chip)return;
      c._activeCat=chip.getAttribute('data-cat'); renderList(c); document.querySelector('.app-content').scrollTop=0;
    });
    c.querySelector('#status-filter-toggle').addEventListener('click', function(){ showFilterSheet(c); });
    c.querySelector('#sf-done').addEventListener('click', function(){ c.querySelector('#status-filter-sheet').classList.add('hidden'); });
    c.querySelector('#status-filter-sheet .modal-mask').addEventListener('click', function(){ c.querySelector('#status-filter-sheet').classList.add('hidden'); });
    c.querySelector('#suit-list').addEventListener('click', function(e){
      var sb=e.target.closest('.suit-status'), card=e.target.closest('.suit-card');
      if(sb){ e.stopPropagation(); var o=outfits.find(function(x){return x.id===sb.getAttribute('data-id');}); if(o)showStatusPicker(c,o,outfits,false); }
      else if(card){ Router.go('outfits',{outfitId:card.getAttribute('data-id')}); }
    });
  }

  function showFilterSheet(c) {
    var sheet=c.querySelector('#status-filter-sheet'), active=c._activeStatuses||STATUSES.map(function(s){return s.key;}), list=sheet.querySelector('#status-filter-list');
    list.innerHTML=STATUSES.map(function(st){ return '<label class="sf-row"><span class="sf-dot" style="background:'+st.color+'"></span><span class="sf-label">'+st.key+'</span><input type="checkbox" class="sf-check" value="'+st.key+'"'+(active.indexOf(st.key)!==-1?' checked':'')+'><span class="sf-custom-check"></span></label>'; }).join('');
    sheet.querySelector('#sf-select-all').onclick=function(){ list.querySelectorAll('.sf-check').forEach(function(cb){cb.checked=true;}); };
    sheet.querySelector('#sf-deselect-all').onclick=function(){ list.querySelectorAll('.sf-check').forEach(function(cb){cb.checked=false;}); };
    sheet.querySelector('#sf-done').onclick=function(){ var v=[]; list.querySelectorAll('.sf-check:checked').forEach(function(cb){v.push(cb.value);}); c._activeStatuses=v; sheet.classList.add('hidden'); renderList(c); };
    sheet.classList.remove('hidden');
  }

  // ===== 详情视图（优化版） =====
  function renderDetail(sid, container) {
    var outfits = get();
    var o = outfits.find(function(x){return x.id===sid;});
    if (!o) { container.innerHTML='<div class="empty-cute">套装不存在</div>'; return; }
    var st = getStatus(o.status);
    var titleEl = document.getElementById('nav-title');
    if (titleEl) titleEl.textContent = o.name;

    // 复刻时间线
    var timelineHtml = '<div class="tl-item"><div class="tl-dot primary"></div><div class="tl-content"><div class="tl-label">首发上线</div><div class="tl-date">'+fmtDate(o.release)+'</div></div></div>';
    if (o.rerun1) timelineHtml += '<div class="tl-item"><div class="tl-dot"></div><div class="tl-content"><div class="tl-label">首次复刻</div><div class="tl-date">'+fmtDate(o.rerun1)+'</div></div></div>';
    if (o.rerun2) timelineHtml += '<div class="tl-item"><div class="tl-dot"></div><div class="tl-content"><div class="tl-label">二次复刻</div><div class="tl-date">'+fmtDate(o.rerun2)+'</div></div></div>';

    container.innerHTML = '<div class="page">'+
      '<button class="back-btn" id="detail-back">← 返回列表</button>'+
      '<div class="detail-hero-new">'+
        '<div class="d-icon-wrap"><div class="d-icon">'+o.icon+'</div></div>'+
        '<h2 class="d-name">'+esc(o.name)+'</h2>'+
        '<p class="d-fullname">'+esc(o.fullName)+'</p>'+
        '<div class="d-meta-row"><span class="d-meta-tag">'+o.category+'</span><span class="d-meta-sep">·</span><span class="d-meta-date">首发 '+o.release+'</span></div>'+
        '<button class="d-status" style="--st-color:'+st.color+';--st-bg:'+st.bg+'" id="detail-status">'+
          '<span class="ds-dot"></span>'+st.key+'<span class="ds-arrow">▾</span></button>'+
      '</div>'+
      '<div class="detail-section">'+
        '<div class="ds-title">⏳ 复刻历程</div>'+
        '<div class="timeline">'+timelineHtml+'</div>'+
      '</div>'+
      '<div class="detail-section">'+
        '<div class="ds-title">📝 收集状态</div>'+
        '<div class="status-chip-grid">'+
          STATUSES.map(function(s){ return '<button class="sc-chip'+(o.status===s.key?' active':'')+'" style="--st-color:'+s.color+';--st-bg:'+s.bg+'" data-status="'+s.key+'">'+s.key+'</button>'; }).join('')+
        '</div>'+
      '</div>'+
    '</div>';

    // 返回
    container.querySelector('#detail-back').addEventListener('click', function(){ window.history.back(); });
    // 状态按钮
    container.querySelector('#detail-status').addEventListener('click', function(){ showStatusPicker(container, o, outfits, true); });
    // 状态芯片
    container.querySelectorAll('.sc-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        o.status = chip.getAttribute('data-status'); save(outfits);
        renderDetail(sid, container);
      });
    });
  }

  function showStatusPicker(c, outfit, outfits, isDetail) {
    var sheet = c.querySelector('#status-sheet') || (function(){
      var s = document.createElement('div'); s.className='modal hidden'; s.id='status-sheet';
      s.innerHTML='<div class="modal-mask"></div><div class="modal-sheet"><div class="modal-head"><span class="modal-title">修改状态</span><button class="modal-cancel" id="st-close">完成</button></div><div class="status-pick-list" id="status-pick-list"></div></div>';
      c.appendChild(s); return s;
    })();
    var list = sheet.querySelector('#status-pick-list');
    list.innerHTML = STATUSES.map(function(st){
      var ok = outfit.status===st.key;
      return '<button class="status-pick-row'+(ok?' active':'')+'" data-status="'+st.key+'">'+
        '<span class="sp-dot" style="background:'+st.color+'"></span><span class="sp-label">'+st.key+'</span>'+(ok?'<span class="sp-check">✓</span>':'')+'</button>';
    }).join('');
    list.querySelectorAll('.status-pick-row').forEach(function(row){
      row.addEventListener('click', function(){
        outfit.status = row.getAttribute('data-status'); save(outfits);
        sheet.classList.add('hidden');
        if (isDetail) renderDetail(outfit.id, c);
        else renderList(c);
      });
    });
    sheet.classList.remove('hidden');
    var closeBtn = sheet.querySelector('#st-close');
    closeBtn.onclick = function(){ sheet.classList.add('hidden'); };
    sheet.querySelector('.modal-mask').onclick = function(){ sheet.classList.add('hidden'); };
  }

  ToolRegistry.register({
    id: 'outfits', title: '套装', icon: '👗', tab: true,
    tabIcon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7z"/></svg>',
    paramNames: ['outfitId'], render: render
  });
})();
