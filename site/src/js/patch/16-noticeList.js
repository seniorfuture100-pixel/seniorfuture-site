// 원본: src/notice-list.js
/* notice-list.js — 고객센터 공지사항 목록(아임웹 목록형 게시판)을 Figma 'PC/공지사항 목록'(58:5604)처럼
   - 분류 칩(공지 = 검정 칩, 나머지 = 테두리 칩) · 제목 · 날짜만 보여요. '공지' 분류 글은 맨 위에 회색 바탕으로 고정.
   - 위에 '전체 · 서비스 · 교육 · 이벤트' 칩으로 바로 거를 수 있어요(공지는 항상 보여요).
   (10/28) 자주 묻는 질문도 같은 모양: /faq 게시판(목록형) 글을 고객센터 #faq 칸([data-sf-faq-board])에 불러와요.
   손님이 /faq 목록 주소로 오면 고객센터 #faq 로 보내요(관리자 미리보기·글쓰기 주소는 그대로). */
SFUI.nlDecorate = function (box, o) {
  o = o || {};
  var rows = [].slice.call(box.querySelectorAll('ul.li_body'));
  var cats = [];
  rows.forEach(function (ul) {
    ul.style.display = '';
    var em = ul.querySelector('li.tit a._fade_link em'), cat = em ? em.textContent.trim() : '';
    ul.setAttribute('data-cat', cat);
    if (cat && cat !== '공지' && cats.indexOf(cat) < 0) cats.push(cat);
    var t = ul.querySelector('.list_text_title');
    if (t && cat && !ul.querySelector('.sf-nl-chip')) t.insertAdjacentHTML('beforebegin', '<span class="sf-nl-chip' + (cat === '공지' ? ' is-pin' : '') + '">' + cat + '</span>');
    if (cat === '공지') ul.classList.add('is-pin');
  });
  var head = box.querySelector('.li_header');
  rows.filter(function (u) { return u.classList.contains('is-pin'); }).reverse().forEach(function (u) { box.insertBefore(u, head ? head.nextSibling : box.firstChild); });
  if (o.order) cats.sort(function (a, b) { var i = o.order.indexOf(a), j = o.order.indexOf(b); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); });
  if (!cats.length) return;
  var bar = document.createElement('div');
  bar.className = 'sf-chips sf-nl-chips';
  bar.setAttribute('role', 'tablist');
  bar.innerHTML = ['전체'].concat(cats).map(function (c, i) { return '<button type="button" class="sf-chip' + (i ? '' : ' is-active') + '" data-nl="' + c + '">' + c + '</button>'; }).join('');
  box.parentNode.insertBefore(bar, box);
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-nl]'); if (!b) return;
    var v = b.getAttribute('data-nl');
    [].forEach.call(bar.children, function (x) { x.classList.toggle('is-active', x === b); });
    rows.forEach(function (u) { var c = u.getAttribute('data-cat'); u.hidden = !(v === '전체' || c === v || c === '공지'); });
  });
};
SFUI.faqOrder = ['프로그램', '멤버십', '강연·행사', '결제·환불', '기업 협업', '계정'];
SFUI.register('noticeList', function () {
  var path = location.pathname, isFaq = /^\/faq/.test(path), pv = /preview_mode=1/.test(location.search);
  if (!/^\/(help|faq)/.test(path) || /bmode=/.test(location.search)) return;
  if (isFaq && !pv && !/^\/admin/.test(path)) { location.replace('/help#faq'); return; }
  // 고객센터: 자주 묻는 질문 게시판 글 불러오기
  var slot = !isFaq && document.querySelector('[data-sf-faq-board]');
  if (slot && SFUI.once(slot, 'Faq')) {
    document.documentElement.classList.add('sf-nl-on');
    fetch('/faq/' + (pv ? '?preview_mode=1' : ''), { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) {
      var src = new DOMParser().parseFromString(t, 'text/html').querySelector('[data-widget-type="board"] .li_board');
      if (!src || !src.querySelector('ul.li_body')) return;
      var fb = document.importNode(src, true);
      fb.classList.add('sf-faq-list');
      [].forEach.call(fb.querySelectorAll('a[href]'), function (a) {
        var h = a.getAttribute('href');
        if (!/^(\/|https?:|#|javascript:)/.test(h)) a.setAttribute('href', '/faq/' + h);
      });
      // 고객센터 공지사항 표(r2/01 r2Help 의 r2-ntable)와 같은 모양: 머리 줄 + 질문 + 오른쪽 칸(날짜 대신 분류), 5개 넘으면 접기
      fb.classList.add('r2-ntable');
      var hd = fb.querySelector('.li_header');
      if (hd) hd.innerHTML = '<li class="tit">자주 묻는 질문</li><li class="date">분류</li>';
      var rows = [].slice.call(fb.querySelectorAll('ul.li_body'));
      rows.forEach(function (u) {
        u.style.display = '';
        var em = u.querySelector('li.tit a._fade_link em'), tm = u.querySelector('li.time');
        if (!tm) { tm = document.createElement('li'); tm.className = 'time'; u.appendChild(tm); }
        tm.removeAttribute('title');
        tm.textContent = em ? em.textContent.trim() : '';
      });
      slot.innerHTML = '';
      slot.appendChild(fb);
      if (rows.length > 5) {
        rows.slice(5).forEach(function (u) { u.classList.add('sf-faq-fold'); });
        var mb = document.createElement('button');
        mb.type = 'button'; mb.className = 'r2-nmore'; mb.setAttribute('aria-expanded', 'false');
        var lab = '자주 묻는 질문 전체 보기 <span>(' + rows.length + ')</span>';
        mb.innerHTML = lab;
        mb.addEventListener('click', function () {
          var open = fb.classList.toggle('is-open');
          mb.setAttribute('aria-expanded', String(open)); mb.innerHTML = open ? '접기' : lab;
        });
        slot.appendChild(mb);
      }
    }).catch(function () {});
  }
  var box = document.querySelector('[data-widget-type="board"] .li_board');
  if (!box || !SFUI.once(box, 'Notice')) return;
  document.documentElement.classList.add('sf-nl-on');
  if (isFaq) box.classList.add('sf-faq-list');
  SFUI.nlDecorate(box, isFaq ? { order: SFUI.faqOrder } : null);
})
