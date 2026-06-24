/**
 * 套装管理 v2 — 内置数据 + 分类/状态双重筛选 + 详情页
 */
(function () {
  'use strict';
  var KEY = 'outfits_v2';

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
    { id:'s028', name:'小羊',   fullName:'蕃神春醺', icon:'🐑', category:'限时六星', release:'2026/6/9',  rerun1:'', rerun2:'' },
    { id:'s029', name:'敦煌', fullName:'卧月灼莲', icon:'👘', category:'限时五星', release:'2023/4/13', rerun1:'2024/8/15', rerun2:'2025/9/23' },
    { id:'s030', name:'华廷', fullName:'盛世华廷', icon:'🏯', category:'限时五星', release:'2023/4/13', rerun1:'2024/8/15', rerun2:'2025/9/23' },
    { id:'s031', name:'小魔女', fullName:'莫佳娜的礼物', icon:'🧙', category:'限时五星', release:'2023/5/25', rerun1:'2024/9/27', rerun2:'2025/8/12' },
    { id:'s032', name:'大魔女', fullName:'倪克斯夜蔷', icon:'🌹', category:'限时五星', release:'2023/5/25', rerun1:'2024/9/27', rerun2:'2025/8/12' },
    { id:'s033', name:'兔兔', fullName:'绒兔心语', icon:'🐰', category:'限时五星', release:'2023/7/6', rerun1:'2025/3/12', rerun2:'2026/3/10' },
    { id:'s034', name:'熊猫', fullName:'酣竹滚滚', icon:'🐼', category:'限时五星', release:'2023/7/6', rerun1:'2025/3/12', rerun2:'2026/3/10' },
    { id:'s035', name:'中婚', fullName:'鸾俦夙缘', icon:'💒', category:'限时五星', release:'2023/8/16', rerun1:'2025/4/23', rerun2:'2026/1/27' },
    { id:'s036', name:'冥婚', fullName:'痴梦无诉', icon:'🕯️', category:'限时五星', release:'2023/8/16', rerun1:'2025/4/23', rerun2:'2026/1/27' },
    { id:'s037', name:'精灵', fullName:'幻涟缀羽', icon:'🧝', category:'限时五星', release:'2023/9/27', rerun1:'2024/11/8', rerun2:'' },
    { id:'s038', name:'苗疆', fullName:'月银九歌', icon:'🪷', category:'限时五星', release:'2023/9/27', rerun1:'2024/11/8', rerun2:'' },
    { id:'s039', name:'美神', fullName:'阿芙洛之绪', icon:'🕊️', category:'限时五星', release:'2023/11/8', rerun1:'2024/12/20', rerun2:'2025/11/4' },
    { id:'s040', name:'芭蕾', fullName:'湖心旋舞', icon:'🩰', category:'限时五星', release:'2023/11/8', rerun1:'2024/12/20', rerun2:'2025/11/4' },
    { id:'s041', name:'小鹿', fullName:'驯鹿精灵', icon:'🦌', category:'限时五星', release:'2023/12/21', rerun1:'', rerun2:'' },
    { id:'s042', name:'和服', fullName:'樱雪春祈', icon:'👘', category:'限时五星', release:'2023/12/21', rerun1:'', rerun2:'' },
    { id:'s043', name:'魔兔', fullName:'沉梦魔咒', icon:'🐇', category:'限时五星', release:'2024/1/31', rerun1:'2025/1/28', rerun2:'2025/12/16' },
    { id:'s044', name:'孔雀', fullName:'金翎浮年', icon:'🦚', category:'限时五星', release:'2024/1/31', rerun1:'2025/1/28', rerun2:'2025/12/16' },
    { id:'s045', name:'库洛米', fullName:'酷巧流心', icon:'🐱', category:'限时五星', release:'2024/3/13', rerun1:'', rerun2:'' },
    { id:'s046', name:'玉桂狗', fullName:'告白奶芙', icon:'🐶', category:'限时五星', release:'2024/3/13', rerun1:'', rerun2:'' },
    { id:'s047', name:'Ⅰ号机', fullName:'Ⅰ号机', icon:'🤖', category:'限时五星', release:'2024/4/24', rerun1:'2025/11/19', rerun2:'' },
    { id:'s048', name:'吉普赛', fullName:'吟游沙语', icon:'🪶', category:'限时五星', release:'2024/4/24', rerun1:'2025/11/19', rerun2:'' },
    { id:'s049', name:'蝴蝶', fullName:'雪色蝶舞', icon:'🦋', category:'限时五星', release:'2024/6/5', rerun1:'2025/6/4', rerun2:'2026/4/21' },
    { id:'s050', name:'贵妇', fullName:'影幕华宴', icon:'💃', category:'限时五星', release:'2024/6/5', rerun1:'2025/6/4', rerun2:'2026/4/21' },
    { id:'s051', name:'国潮', fullName:'虚数戏梦', icon:'🏮', category:'限时五星', release:'2024/7/17', rerun1:'', rerun2:'' },
    { id:'s052', name:'军装', fullName:'恒星纪元', icon:'👔', category:'限时五星', release:'2024/7/17', rerun1:'', rerun2:'' },
    { id:'s053', name:'月神', fullName:'幻月神裁', icon:'🌙', category:'限时五星', release:'2024/8/28', rerun1:'2025/7/16', rerun2:'2026/6/2' },
    { id:'s054', name:'恶魔', fullName:'赦罪永寐', icon:'😈', category:'限时五星', release:'2024/8/28', rerun1:'2025/7/16', rerun2:'2026/6/2' },
    { id:'s055', name:'提灯', fullName:'噤声夜谭', icon:'🏮', category:'限时五星', release:'2024/10/9', rerun1:'2025/10/8', rerun2:'' },
    { id:'s056', name:'豹豹', fullName:'蜜色蚀心', icon:'🐆', category:'限时五星', release:'2024/10/9', rerun1:'2025/10/8', rerun2:'' },
    { id:'s057', name:'舞娘', fullName:'辰祈夜谭', icon:'💃', category:'限时五星', release:'2024/11/20', rerun1:'2025/8/27', rerun2:'' },
    { id:'s058', name:'钥匙', fullName:'星钥寻踪', icon:'🗝️', category:'限时五星', release:'2024/11/20', rerun1:'2025/8/27', rerun2:'' },
    { id:'s059', name:'格桑花', fullName:'绯雪萦心', icon:'🌸', category:'限时五星', release:'2025/1/1', rerun1:'2025/12/31', rerun2:'' },
    { id:'s060', name:'藏袍', fullName:'金羚曜日', icon:'🐏', category:'限时五星', release:'2025/1/1', rerun1:'2025/12/31', rerun2:'' },
    { id:'s061', name:'剪刀', fullName:'甘戮天使', icon:'✂️', category:'限时五星', release:'2025/2/12', rerun1:'2026/5/6', rerun2:'' },
    { id:'s062', name:'双枪', fullName:'魔猎执事', icon:'🔫', category:'限时五星', release:'2025/2/12', rerun1:'2026/5/6', rerun2:'' },
    { id:'s063', name:'水晶', fullName:'芯璃絮语', icon:'💎', category:'限时五星', release:'2025/3/25', rerun1:'2026/2/11', rerun2:'' },
    { id:'s064', name:'帝政', fullName:'枫露晨祷', icon:'👑', category:'限时五星', release:'2025/3/25', rerun1:'2026/2/11', rerun2:'' },
    { id:'s065', name:'船长', fullName:'绯海掠影', icon:'⚓', category:'限时五星', release:'2025/5/6', rerun1:'', rerun2:'' },
    { id:'s066', name:'女巫', fullName:'禁忌咒魇', icon:'🧙', category:'限时五星', release:'2025/5/6', rerun1:'', rerun2:'' },
    { id:'s067', name:'蜘蛛', fullName:'绯蕾魇丝', icon:'🕷️', category:'限时五星', release:'2025/6/17', rerun1:'2026/3/25', rerun2:'' },
    { id:'s068', name:'蚂蚁', fullName:'血誓荆棘', icon:'🐜', category:'限时五星', release:'2025/6/17', rerun1:'2026/3/25', rerun2:'' },
    { id:'s069', name:'甄嬛', fullName:'雪映梅妆', icon:'👘', category:'限时五星', release:'2025/7/29', rerun1:'', rerun2:'' },
    { id:'s070', name:'华妃', fullName:'凤仪万千', icon:'🔥', category:'限时五星', release:'2025/7/29', rerun1:'', rerun2:'' },
    { id:'s071', name:'岩浆', fullName:'冥焰熔骨', icon:'🕊️', category:'限时五星', release:'2025/9/9', rerun1:'', rerun2:'' },
    { id:'s072', name:'石膏', fullName:'羽陨圣卉', icon:'🌸', category:'限时五星', release:'2025/9/9', rerun1:'', rerun2:'' },
    { id:'s073', name:'小樱白套', fullName:'透明序曲', icon:'🔮', category:'限时五星', release:'2025/10/21', rerun1:'', rerun2:'' },
    { id:'s074', name:'小樱红套', fullName:'封印解除', icon:'🐍', category:'限时五星', release:'2025/10/21', rerun1:'', rerun2:'' },
    { id:'s075', name:'骨蛇', fullName:'幽骨蚀光', icon:'❄️', category:'限时五星', release:'2025/12/2', rerun1:'', rerun2:'' },
    { id:'s076', name:'雪花', fullName:'冰璃琉心', icon:'🦋', category:'限时五星', release:'2025/12/2', rerun1:'', rerun2:'' },
    { id:'s077', name:'飞蛾', fullName:'星蛾灼穹', icon:'🏮', category:'限时五星', release:'2026/1/13', rerun1:'', rerun2:'' },
    { id:'s078', name:'焚灯', fullName:'翎羽焚灯', icon:'🌿', category:'限时五星', release:'2026/1/13', rerun1:'', rerun2:'' },
    { id:'s079', name:'春神', fullName:'绮野仙踪', icon:'🎂', category:'限时五星', release:'2026/2/24', rerun1:'', rerun2:'' },
    { id:'s080', name:'兔偶', fullName:'兔铃谣梦', icon:'📖', category:'限时五星', release:'2026/2/24', rerun1:'', rerun2:'' },
    { id:'s081', name:'零号机', fullName:'零号塞壬', icon:'🦅', category:'限时五星', release:'2026/4/7', rerun1:'', rerun2:'' },
    { id:'s082', name:'蛋糕', fullName:'恋恋香颂', icon:'👘', category:'限时五星', release:'2026/4/7', rerun1:'', rerun2:'' },
    { id:'s083', name:'书灵', fullName:'籍梦载年', icon:'🏯', category:'限时五星', release:'2026/5/19', rerun1:'', rerun2:'' },
    { id:'s084', name:'凤凰', fullName:'玄凰引昼', icon:'🧙', category:'限时五星', release:'2026/5/19', rerun1:'', rerun2:'' },
    { id:'s085', name:'殷夜堇华', fullName:'殷夜堇华', icon:'🎁', category:'盲盒', release:'2023/12/29', rerun1:'', rerun2:'' },
    { id:'s086', name:'旋梦王国', fullName:'旋梦王国', icon:'🎪', category:'盲盒', release:'2024/4/8', rerun1:'', rerun2:'' },
    { id:'s087', name:'霁梦花吻', fullName:'霁梦花吻', icon:'🌸', category:'盲盒', release:'2024/7/24', rerun1:'', rerun2:'' },
    { id:'s088', name:'雪梦信使', fullName:'雪梦信使', icon:'❄️', category:'盲盒', release:'2024/12/5', rerun1:'', rerun2:'' },
    { id:'s089', name:'谜兔狂想', fullName:'谜兔狂想', icon:'🐰', category:'盲盒', release:'2025/3/4', rerun1:'', rerun2:'' },
    { id:'s090', name:'天谪星砂', fullName:'天谪星砂', icon:'⭐', category:'盲盒', release:'2025/6/7', rerun1:'', rerun2:'' },
    { id:'s091', name:'骑士终章', fullName:'骑士终章', icon:'⚔️', category:'盲盒', release:'2025/9/9', rerun1:'', rerun2:'' },
    { id:'s092', name:'瓷赋霓裳', fullName:'瓷赋霓裳', icon:'🏺', category:'盲盒', release:'2025/12/6', rerun1:'', rerun2:'' },
    { id:'s093', name:'华廷靡曼', fullName:'华廷靡曼', icon:'👑', category:'盲盒', release:'2026/3/17', rerun1:'', rerun2:'' },
    { id:'s094', name:'赤焰傲冕', fullName:'赤焰傲冕', icon:'🔥', category:'盲盒', release:'2026/6/20', rerun1:'', rerun2:'' },
    { id:'s095', name:'岁云暮', fullName:'岁云暮', icon:'🔑', category:'潮流密码', release:'2026/4/28', rerun1:'', rerun2:'' },
    { id:'s096', name:'暮金谕歌', fullName:'暮金谕歌', icon:'🌅', category:'潮流密码', release:'2026/4/28', rerun1:'', rerun2:'' },
    { id:'s097', name:'兔月眠歌', fullName:'兔月眠歌', icon:'🐰', category:'潮流密码', release:'2026/3/17', rerun1:'', rerun2:'' },
    { id:'s098', name:'荒原暮歌', fullName:'荒原暮歌', icon:'🌿', category:'潮流密码', release:'2026/2/3', rerun1:'', rerun2:'' },
    { id:'s099', name:'夜枭探员', fullName:'夜枭探员', icon:'🕵️', category:'潮流密码', release:'2025/12/23', rerun1:'', rerun2:'' },
    { id:'s100', name:'嬉游红尘', fullName:'嬉游红尘', icon:'🎭', category:'潮流密码', release:'2025/11/11', rerun1:'', rerun2:'' },
    { id:'s101', name:'星辰赋格', fullName:'星辰赋格', icon:'🎼', category:'潮流密码', release:'2025/9/30', rerun1:'', rerun2:'' },
    { id:'s102', name:'烬夜梦蝶', fullName:'烬夜梦蝶', icon:'🦋', category:'潮流密码', release:'2025/8/19', rerun1:'', rerun2:'' },
    { id:'s103', name:'青玉案', fullName:'青玉案', icon:'📜', category:'潮流密码', release:'2025/7/8', rerun1:'', rerun2:'' },
    { id:'s104', name:'音阶圆舞曲', fullName:'音阶圆舞曲', icon:'🎵', category:'潮流密码', release:'2025/5/27', rerun1:'', rerun2:'' },
    { id:'s105', name:'二律背反', fullName:'二律背反', icon:'⚖️', category:'潮流密码', release:'2025/4/15', rerun1:'', rerun2:'' },
    { id:'s106', name:'曦羽月颂', fullName:'曦羽月颂', icon:'🕊️', category:'潮流密码', release:'2025/3/4', rerun1:'', rerun2:'' },
    { id:'s107', name:'暖冬下午茶', fullName:'暖冬下午茶', icon:'☕', category:'潮流密码', release:'2025/1/21', rerun1:'', rerun2:'' },
    { id:'s108', name:'诡焰童谣', fullName:'诡焰童谣', icon:'🔥', category:'潮流密码', release:'2024/12/10', rerun1:'', rerun2:'' },
    { id:'s109', name:'惊奇南瓜夜', fullName:'惊奇南瓜夜', icon:'🎃', category:'潮流密码', release:'2024/10/30', rerun1:'', rerun2:'' },
    { id:'s110', name:'沙丘觅影', fullName:'沙丘觅影', icon:'🏜️', category:'潮流密码', release:'2024/9/17', rerun1:'', rerun2:'' },
    { id:'s111', name:'愈梦生花', fullName:'愈梦生花', icon:'💐', category:'潮流密码', release:'2024/8/7', rerun1:'', rerun2:'' },
    { id:'s112', name:'沁梦悠航', fullName:'沁梦悠航', icon:'🚢', category:'潮流密码', release:'2024/6/26', rerun1:'', rerun2:'' },
    { id:'s113', name:'幕夜圆舞', fullName:'幕夜圆舞', icon:'💃', category:'潮流密码', release:'2024/5/15', rerun1:'', rerun2:'' },
    { id:'s114', name:'甜酷冒险', fullName:'甜酷冒险', icon:'🎮', category:'潮流密码', release:'2024/4/3', rerun1:'', rerun2:'' },
    { id:'s115', name:'迷菇之森', fullName:'迷菇之森', icon:'🍄', category:'潮流密码', release:'2024/2/21', rerun1:'', rerun2:'' },
    { id:'s116', name:'馥玫茶话', fullName:'馥玫茶话', icon:'🌹', category:'潮流密码', release:'2024/1/10', rerun1:'', rerun2:'' },
    { id:'s117', name:'白纱花祈', fullName:'白纱花祈', icon:'👰', category:'潮流密码', release:'2023/11/29', rerun1:'', rerun2:'' },
    { id:'s118', name:'晨露糖霜', fullName:'晨露糖霜', icon:'🍬', category:'潮流密码', release:'2023/10/18', rerun1:'', rerun2:'' },
    { id:'s119', name:'银月传说', fullName:'银月传说', icon:'🌙', category:'潮流密码', release:'2023/9/6', rerun1:'', rerun2:'' },
    { id:'s120', name:'蒹葭白露', fullName:'蒹葭白露', icon:'🌾', category:'潮流密码', release:'2023/7/27', rerun1:'', rerun2:'' },
    { id:'s121', name:'淑姿娴雅', fullName:'淑姿娴雅', icon:'👘', category:'潮流密码', release:'2023/6/15', rerun1:'', rerun2:'' },
    { id:'s122', name:'暗汐星礁', fullName:'暗汐星礁', icon:'🌊', category:'潮流密码', release:'2023/5/4', rerun1:'', rerun2:'' },
    { id:'s123', name:'春熙凤鸣', fullName:'春熙凤鸣', icon:'🦜', category:'潮流密码', release:'2023/3/24', rerun1:'', rerun2:'' }
  ];

  BUILTIN.forEach(function(o){ if(!o.status) o.status = '未抽齐'; });

  // 迁移旧 photo → photos 数组
  function migratePhotos(o) {
    if (!o.photos) {
      o.photos = ['posters/'+encodeURIComponent(o.fullName)+'.jpg'];
      if (o.photo) { o.photos.push(o.photo); delete o.photo; }
      o.coverIndex = 0;
    }
    if (o.coverIndex === undefined) o.coverIndex = 0;
  }

  function get() {
    var existing = Storage.get(KEY, null) || [];
    var changed = false;

    // 1) 迁移旧数据
    existing.forEach(function(o){ if(!o.photos||o.photo){migratePhotos(o);changed=true;} });

    // 2) 智能合并：新套装自动加入，已有套装更新元数据但保留用户状态
    var idMap = {};
    existing.forEach(function(o){ idMap[o.id] = o; });

    var merged = BUILTIN.map(function(b){
      var old = idMap[b.id];
      if (old) {
        // 已有 → 更新名称/时间等元数据，保留用户的状态/照片
        b.status = old.status || '未抽齐';
        b.photos = old.photos || ['posters/'+encodeURIComponent(b.fullName)+'.jpg'];
        b.coverIndex = old.coverIndex || 0;
        return b;
      }
      // 新套装 → 默认状态
      b.status = '未抽齐';
      b.photos = ['posters/'+encodeURIComponent(b.fullName)+'.jpg'];
      b.coverIndex = 0;
      changed = true;
      return b;
    });

    // 3) 保留用户可能自行添加的套装（不在 BUILTIN 中）
    existing.forEach(function(o){
      if (!BUILTIN.find(function(b){ return b.id === o.id; })) {
        merged.push(o); changed = true;
      }
    });

    // 4) 检查是否有元数据变更需要更新
    if (!changed) {
      for (var i = 0; i < merged.length; i++) {
        var b = BUILTIN.find(function(x){ return x.id === merged[i].id; });
        if (b && (merged[i].name !== b.name || merged[i].fullName !== b.fullName || merged[i].category !== b.category)) {
          merged[i].name = b.name;
          merged[i].fullName = b.fullName;
          merged[i].category = b.category;
          merged[i].icon = b.icon;
          merged[i].release = b.release;
          merged[i].rerun1 = b.rerun1;
          merged[i].rerun2 = b.rerun2;
          changed = true;
        }
      }
    }

    if (changed) Storage.set(KEY, merged);
    return merged;
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
  // 获取"最近复刻时间"（有复刻取最新复刻，否则取首发）
  function latestRerun(o) { return o.rerun2 || o.rerun1 || o.release; }

  function renderList(container) {
    var outfits = get();
    var activeCat = container._activeCat || '全部';
    var activeStatuses = container._activeStatuses || STATUSES.map(function(s){return s.key;});
    var sortMode = container._sortMode || 'release-desc';
    container._activeCat = activeCat; container._activeStatuses = activeStatuses; container._sortMode = sortMode;

    // 排序
    var sorted = outfits.slice().sort(function(a,b){
      var va, vb;
      if (sortMode === 'rerun-desc')      { va = latestRerun(a); vb = latestRerun(b); return vb.localeCompare(va); }
      if (sortMode === 'rerun-asc')       { va = latestRerun(a); vb = latestRerun(b); return va.localeCompare(vb); }
      if (sortMode === 'release-asc')     { return a.release.localeCompare(b.release); }
      /* release-desc (default) */         { return b.release.localeCompare(a.release); }
    });

    var filtered = sorted.filter(function(o){
      if (activeCat !== '全部' && o.category !== activeCat) return false;
      if (activeStatuses.indexOf(o.status||'未抽齐') === -1) return false;
      return true;
    });
    var catCounts = {};
    outfits.forEach(function(o){ catCounts[o.category]=(catCounts[o.category]||0)+1; });
    var grouped = activeCat === '全部'
      ? (filtered.length > 0 ? [{ cat: null, items: filtered }] : [])
      : groupByCategory(filtered, false);

    // 排序标签
    var sortLabels = { 'release-desc':'首发 ↓', 'release-asc':'首发 ↑', 'rerun-desc':'复刻 ↓', 'rerun-asc':'复刻 ↑' };

    container.innerHTML = '<div class="page">'+
      '<div class="filter-row">'+
        '<div class="filter-bar" id="filter-bar">'+
          '<button class="filter-chip'+(activeCat==='全部'?' active':'')+'" data-cat="全部"><small>'+outfits.length+'</small></button>'+
        CATEGORIES.map(function(cat){ var n=catCounts[cat]||0; return '<button class="filter-chip'+(activeCat===cat?' active':'')+'" data-cat="'+cat+'">'+cat+(n>0?' <small>'+n+'</small>':'')+'</button>'; }).join('')+
        '</div>'+
        '<button class="sort-btn" id="sort-toggle">'+sortLabels[sortMode]+'</button>'+
      '</div>'+
      '<div class="filter-info" id="status-filter-toggle">'+
        '<span>🔍 '+(activeStatuses.length===STATUSES.length?'全部状态':activeStatuses.length+' 种状态')+'（共 '+filtered.length+' 件）</span>'+
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>'+
      '<div class="suit-list" id="suit-list">'+(filtered.length===0
        ? '<div class="empty-cute">✨<br>没有符合条件的套装<br><span>试试调整筛选条件</span></div>'
        : grouped.map(function(group){ return (group.cat?'<div class="group-label">'+group.cat+' · '+(catCounts[group.cat]||0)+'件</div>':'')+group.items.map(function(o){ var st=getStatus(o.status); var coverUrl = o.photos ? o.photos[o.coverIndex||0] : 'posters/'+encodeURIComponent(o.fullName)+'.jpg'; var imgHtml = '<div class="sc-photo" style="background-image:url('+coverUrl+')"></div>'; return '<div class="suit-card-v" data-id="'+o.id+'">'+imgHtml+'<div class="sc-body"><div class="suit-name">'+esc(o.name)+'</div><div class="suit-sub">'+esc(o.fullName)+' · '+o.release+'</div></div><button class="suit-status" style="--st-color:'+st.color+';--st-bg:'+st.bg+'" data-id="'+o.id+'">'+st.key+'</button></div>'; }).join(''); }).join(''))+
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
    c.querySelector('#sort-toggle').addEventListener('click', function(){
      var modes = ['release-desc','release-asc','rerun-desc','rerun-asc'];
      var idx = modes.indexOf(c._sortMode||'release-desc');
      c._sortMode = modes[(idx+1)%4];
      renderList(c);
    });
    c.querySelector('#status-filter-toggle').addEventListener('click', function(){ showFilterSheet(c); });
    c.querySelector('#sf-done').addEventListener('click', function(){ c.querySelector('#status-filter-sheet').classList.add('hidden'); });
    c.querySelector('#status-filter-sheet .modal-mask').addEventListener('click', function(){ c.querySelector('#status-filter-sheet').classList.add('hidden'); });
    c.querySelector('#suit-list').addEventListener('click', function(e){
      var sb=e.target.closest('.suit-status'), card=e.target.closest('.suit-card-v');
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
      // 照片轮播
      (function(){
        var photos = o.photos || ['posters/'+encodeURIComponent(o.fullName)+'.jpg'];
        var coverIdx = o.coverIndex || 0;
        var slides = photos.map(function(p,i){
          return '<div class="photo-slide"><div class="photo-img" style="background-image:url('+p+')"></div>'+
            (i===coverIdx?'<span class="photo-cover-badge">封面</span>':'')+
            (i>0?'<button class="photo-del-btn" data-pidx="'+i+'">×</button>':'')+
          '</div>';
        }).join('');
        var dots = photos.map(function(_,i){ return '<span class="photo-dot'+(i===0?' active':'')+'" data-pidx="'+i+'"></span>'; }).join('');
        return '<div class="detail-hero-new">'+
          '<div class="photo-carousel-wrap">'+
            '<div class="photo-carousel" id="photo-carousel">'+slides+'</div>'+
            '<div class="photo-dots" id="photo-dots">'+dots+'</div>'+
            '<div class="photo-toolbar">'+
              '<button class="pt-btn" id="photo-add">+ 添加照片</button>'+
              (photos.length>1?'<button class="pt-btn" id="photo-cover">设为封面</button>':'')+
            '</div>'+
          '</div>';
      })()+
      '<input type="file" accept="image/*" id="photo-input" style="display:none">'+
        '<h2 class="d-name">'+esc(o.name)+'</h2>'+
        '<p class="d-fullname">'+esc(o.fullName)+'</p>'+
        '<div class="d-meta-row"><span class="d-meta-tag">'+o.category+'</span><span class="d-meta-sep">·</span><span class="d-meta-date">首发 '+o.release+'</span></div>'+
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
    // 照片轮播事件
    var carousel = container.querySelector('#photo-carousel');
    var dots = container.querySelectorAll('.photo-dot');
    var photoInput = container.querySelector('#photo-input');
    var photos = o.photos || ['posters/'+encodeURIComponent(o.fullName)+'.jpg'];
    var coverIndex = o.coverIndex || 0;
    var currentIdx = 0;

    function updateDots(idx) {
      currentIdx = idx;
      dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
      var coverBtn = container.querySelector('#photo-cover');
      if (coverBtn) coverBtn.style.display = (idx===coverIndex) ? 'none' : '';
    }

    // 监听滚动更新圆点
    carousel.addEventListener('scroll', function(){
      var idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
      if (idx !== currentIdx) updateDots(idx);
    }, {passive:true});

    // 点击圆点跳转
    dots.forEach(function(dot){
      dot.addEventListener('click', function(){
        var idx = parseInt(dot.getAttribute('data-pidx'));
        carousel.scrollTo({left: idx * carousel.offsetWidth, behavior:'smooth'});
      });
    });

    // 添加照片
    container.querySelector('#photo-add').addEventListener('click', function(){ photoInput.click(); });
    photoInput.addEventListener('change', function(){
      var file = photoInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e){
        if (!o.photos) o.photos = ['posters/'+encodeURIComponent(o.fullName)+'.jpg'];
        o.photos.push(e.target.result);
        save(outfits); renderDetail(sid, container);
      };
      reader.readAsDataURL(file);
    });

    // 删除照片
    container.querySelectorAll('.photo-del-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-pidx'));
        if (idx<=0) return;
        if (!confirm('删除这张照片？')) return;
        o.photos.splice(idx,1);
        if (o.coverIndex >= o.photos.length) o.coverIndex = 0;
        save(outfits); renderDetail(sid, container);
      });
    });

    // 设为封面
    var coverBtn = container.querySelector('#photo-cover');
    if (coverBtn) coverBtn.addEventListener('click', function(){
      o.coverIndex = currentIdx;
      save(outfits); renderDetail(sid, container);
    });
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
