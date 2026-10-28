// (10/27) 전문가 네트워크 = /experts 안 아임웹 게시판(b202610278eed02abba21d '전문가 네트워크')
//   글 제목 = '이름 소속'(예: 김난도 서울대학교 교수), 본문 = 사진 + [함께한 활동] [한 줄 소개] [핵심 이력] [자기소개] (내용 있는 칸만 보여요)
//   목록: 예전 코드 위젯(.sf-ex) 모양 그대로 두고, 카드만 게시판 글로 다시 채워요(사진 · 이름 소속 진하게 · 함께한 활동 연하게).
//         분야 버튼·예전 프로필 칸은 숨기고, 게시판 원래 목록은 안 보여요(관리자 '글쓰기' 줄만 남김). 게시판이 없는 페이지면 아무것도 안 바꿔요.
//   홈·상품 상세의 '/experts#eN' 바로가기 → 그 사람 글로
SFUI.experts = {
  board: 'b202610278eed02abba21d',
  // 예전 위젯 순서(e1~e33)의 글 번호. 여기 없는 글(새로 추가한 분)은 이 뒤에 게시판 순서대로
  order: [175296891, 175296887, 175296882, 175296877, 175296875, 175296872, 175296869, 175296866, 175296864, 175296862, 175296857,
    175296852, 175296850, 175296846, 175296842, 175296841, 175296836, 175296831, 175296828, 175296824, 175296823, 175296819,
    175296813, 175296812, 175296811, 175296806, 175296802, 175296799, 175296797, 175296794, 175296792, 175296790, 175296783],
  url: function (idx) { return '/experts/?bmode=view' + String.fromCharCode(38) + 'idx=' + idx; },
  // 본문 글자 → { 함께한활동, 한줄소개, 핵심이력, 자기소개 } (빈 칸은 '')
  secs: function (t) {
    var o = {}, re = /\[\s*(함께한\s*활동|한\s*줄\s*소개|핵심\s*이력|자기\s*소개)\s*\]/g, m, last = null, pos = 0;
    t = String(t || '');
    while ((m = re.exec(t))) {
      if (last) o[last] = t.slice(pos, m.index).replace(/^[\s\-–]+$/, '').trim();
      last = m[1].replace(/\s+/g, ''); pos = re.lastIndex;
    }
    if (last) o[last] = t.slice(pos).replace(/^[\s\-–]+$/, '').trim();
    return o;
  },
  // 게시판 목록 카드(._post_item_wrap) → { idx, title, name, org, img, act }
  card: function (it) {
    var a = it.querySelector('a[href*="idx="]'), tt = it.querySelector('.title'), tx = it.querySelector('.text');
    var idx = a && ((a.getAttribute('href') || '').match(/idx=(\d+)/) || [])[1];
    if (!idx || !tt) return null;
    var tc = tt.cloneNode(true);
    [].forEach.call(tc.querySelectorAll('em, .icons, .addon-badge'), function (x) { x.parentNode.removeChild(x); });
    var title = tc.textContent.replace(/\s+/g, ' ').trim(), sp = title.indexOf(' ');
    var cw = it.querySelector('.card_wrapper'), m = cw && /url\(\s*["']?([^"')]+)/.exec(cw.getAttribute('style') || '');
    var img = m && !/no-image/.test(m[1]) ? m[1] : '';
    return { idx: +idx, title: title, name: sp > 0 ? title.slice(0, sp) : title, org: sp > 0 ? title.slice(sp + 1) : '', img: img, act: SFUI.experts.secs(tx ? tx.textContent : '')['함께한활동'] || '' };
  },
  sort: function (list) {
    var O = SFUI.experts.order;
    return list.map(function (c, i) { var k = O.indexOf(c.idx); return [k < 0 ? 1000 + i : k, c]; })
      .sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
  },
  // 사진 없는 분: 예전 위젯처럼 이름 첫 글자 색 타일
  tile: function (name, i) {
    var G = ['#ffd2b3,#ff9652', '#d6efe2,#7cc4a0', '#d9e4f7,#8fa8d6', '#f3dcf0,#c99bd0'];
    return 'background:linear-gradient(135deg,' + G[i % G.length] + ')';
  }
};
SFUI.register('expertsBoard', function (root) {
  var X = SFUI.experts, AMP = String.fromCharCode(38), tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s == null ? '' : String(s); return tmp.innerHTML.replace(/"/g, AMP + '#34;'); }
  // 예전 바로가기(/experts#e1 …) → 글 주소
  [].forEach.call(root.querySelectorAll('a[href*="/experts#e"]'), function (a) {
    var m = /\/experts\/?#e(\d+)$/.exec(a.getAttribute('href') || ''), idx = m && X.order[+m[1] - 1];
    if (idx) a.setAttribute('href', X.url(idx));
  });
  if (!/^\/experts\/?$/.test(location.pathname)) return;
  var list = document.getElementById('post_card_' + X.board), old = document.querySelector('.sf-ex');
  var html = document.documentElement, oldRow = old && (old.closest('.doz_row') || old);
  if (oldRow && /bmode=view/.test(location.search) && document.querySelector('.board_view')) { html.classList.add('sf-exb-on'); oldRow.classList.add('sf-exb-hide'); oldRow.style.setProperty('display', 'none', 'important'); return; } // 휴대폰에선 아임웹 줄 규칙이 class 숨김을 이겨서 직접 // 글 보기: 예전 위젯은 안 보여요
  if (!list || !old) return;
  html.classList.add('sf-exb-on');
  if (/bmode=/.test(location.search) || !SFUI.once(old, 'ExB')) return;
  var cards = X.sort([].map.call(list.querySelectorAll('._post_item_wrap'), X.card).filter(Boolean));
  var ul = old.querySelector('.sf-ex-grid');
  if (!cards.length || !ul) return;
  var sub = old.querySelector('.sf-ex__sub');
  if (sub) sub.textContent = '학계·산업·기관·기업 전문가 50+가 시니어퓨처와 함께한 네트워크';
  var ti = 0;
  ul.innerHTML = cards.map(function (c) {
    var ph = c.img ? '<span class="sf-ex-ph" role="img" aria-label="' + esc(c.name) + ' 사진" style="background:#eef0f3 url(' + esc(c.img) + ') 50% 30%/cover no-repeat"></span>'
      : '<span class="sf-ex-ph sf-ex-ini" role="img" aria-label="' + esc(c.name) + '" style="' + X.tile(c.name, ti++) + '">' + esc(c.name.charAt(0)) + '</span>';
    return '<li><a class="sf-ex-card sf-exb-card" href="' + esc(X.url(c.idx)) + '">' + ph + '<strong>' + esc(c.title) + '</strong>' + (c.act ? '<em>' + esc(c.act) + '</em>' : '') + '</a></li>';
  }).join('');
  // 게시판 원래 목록은 숨기고(관리자 글쓰기 줄은 남김), 분야 버튼·빈 안내는 없애요
  var bw = list.closest('._list_wrap');
  if (bw) bw.classList.add('sf-exb-board');
  [].forEach.call(old.querySelectorAll('.sf-chips, .sf-filter-empty'), function (e) { e.classList.add('sf-exb-hide'); });
})

// (10/28) 기업 협업 프로젝트(/projects) · 언론보도(/news) — 전문가 네트워크와 같은 목록(사진 · 제목 진하게 · 연한 한 줄)과 글 모양
//   글 본문 = 사진 + [칸 제목] 들(내용 있는 칸만 보여요). 목록 연한 줄: 프로젝트 = 협업 기관, 언론보도 = 매체 · 날짜. 순서는 게시판 순서 그대로
SFUI.gals = [
  { re: /^\/projects/, board: 'b202610285c90f80f8a1fd', title: '기업 협업 프로젝트', more: '다른 프로젝트',
    sub: '대기업·공공기관·언론 등 20건+ 협업으로 장수경제 비즈니스 생태계를 함께 만들어 가요',
    heads: ['협업 기관', '과제', '수행 내용', '주요 결과', '관련 링크'],
    line: function (o) { return o['협업기관'] || ''; } },
  { re: /^\/news/, board: 'b2026102875a68be683cab', title: '언론보도', more: '다른 언론보도',
    sub: '매일경제·서울경제·브라보마이라이프 등 주요 매체가 시니어퓨처의 활동을 보도했어요',
    heads: ['매체', '날짜', '내용', '기사 링크'],
    line: function (o) { return [o['매체'], o['날짜']].filter(Boolean).join(' · '); } }
];
SFUI.gal = function (path) {
  for (var i = 0; i < SFUI.gals.length; i++) if (SFUI.gals[i].re.test(path || '')) return SFUI.gals[i];
  return null;
};
// 본문 글자 → { 칸제목(띄어쓰기 없이): 내용 }
SFUI.galSecs = function (t, heads) {
  var o = {}, re = new RegExp('\\[\\s*(' + heads.map(function (h) { return h.replace(/\s+/g, '\\s*'); }).join('|') + ')\\s*\\]', 'g'), m, last = null, pos = 0;
  t = String(t || '');
  while ((m = re.exec(t))) {
    if (last) o[last] = t.slice(pos, m.index).trim();
    last = m[1].replace(/\s+/g, ''); pos = re.lastIndex;
  }
  if (last) o[last] = t.slice(pos).trim();
  return o;
};
SFUI.galCards = function (G, root) {
  return [].map.call(root.querySelectorAll('._post_item_wrap'), function (it) {
    var c = SFUI.experts.card(it), tx = it.querySelector('.text');
    if (!c) return null;
    c.line = G.line(SFUI.galSecs(tx ? tx.textContent : '', G.heads));
    return c;
  }).filter(Boolean);
};
SFUI.register('galleryBoard', function () {
  var G = SFUI.gal(location.pathname);
  if (!G || /bmode=/.test(location.search)) return;
  var list = document.getElementById('post_card_' + G.board);
  if (!list || !SFUI.once(list, 'Gal')) return;
  var X = SFUI.experts, AMP = String.fromCharCode(38), tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s == null ? '' : String(s); return tmp.innerHTML.replace(/"/g, AMP + '#34;'); }
  var cards = SFUI.galCards(G, list), base = location.pathname.replace(/\/?$/, '/');
  var html = document.documentElement, ti = 0;
  var sec = document.createElement('section');
  sec.className = 'sf-ex sf-gal';
  sec.innerHTML = '<h1>' + esc(G.title) + '</h1><p class="sf-ex__sub">' + esc(G.sub) + '</p><ul class="sf-ex-grid">' + cards.map(function (c) {
    var ph = c.img ? '<span class="sf-ex-ph" role="img" aria-label="' + esc(c.title) + '" style="background:#eef0f3 url(' + esc(c.img) + ') 50% 40%/cover no-repeat"></span>'
      : '<span class="sf-ex-ph sf-ex-ini" role="img" aria-label="' + esc(c.title) + '" style="' + X.tile(c.title, ti++) + '">' + esc(c.title.charAt(0)) + '</span>';
    return '<li><a class="sf-ex-card sf-exb-card" href="' + esc(base + '?bmode=view' + AMP + 'idx=' + c.idx) + '">' + ph + '<strong>' + esc(c.title) + '</strong>' + (c.line ? '<em>' + esc(c.line) + '</em>' : '') + '</a></li>';
  }).join('') + '</ul>';
  var host = list.closest('[id^="w20"]') || list.closest('._list_wrap') || list;
  host.parentNode.insertBefore(sec, host);
  var bw = list.closest('._list_wrap');
  if (bw) bw.classList.add('sf-exb-board');
  html.classList.add('sf-exb-on', 'sf-gal-on');
})