// 원본: src/notice-list.js
/* notice-list.js — 고객센터 공지사항 목록(아임웹 목록형 게시판)을 Figma 'PC/공지사항 목록'(58:5604)처럼
   - 분류 칩(공지 = 검정 칩, 나머지 = 테두리 칩) · 제목 · 날짜만 보여요. '공지' 분류 글은 맨 위에 회색 바탕으로 고정.
   - 위에 '전체 · 서비스 · 교육 · 이벤트' 칩으로 바로 거를 수 있어요(공지는 항상 보여요). */
SFUI.register('noticeList', function () {
  if (!/^\/help/.test(location.pathname) || /bmode=/.test(location.search)) return;
  var box = document.querySelector('[data-widget-type="board"] .li_board');
  if (!box || !SFUI.once(box, 'Notice')) return;
  document.documentElement.classList.add('sf-nl-on');
  var rows = [].slice.call(box.querySelectorAll('ul.li_body'));
  var cats = [];
  rows.forEach(function (ul) {
    var em = ul.querySelector('li.tit a._fade_link em'), cat = em ? em.textContent.trim() : '';
    ul.setAttribute('data-cat', cat);
    if (cat && cat !== '공지' && cats.indexOf(cat) < 0) cats.push(cat);
    var t = ul.querySelector('.list_text_title');
    if (t && cat && !ul.querySelector('.sf-nl-chip')) t.insertAdjacentHTML('beforebegin', '<span class="sf-nl-chip' + (cat === '공지' ? ' is-pin' : '') + '">' + cat + '</span>');
    if (cat === '공지') ul.classList.add('is-pin');
  });
  var head = box.querySelector('.li_header');
  rows.filter(function (u) { return u.classList.contains('is-pin'); }).reverse().forEach(function (u) { box.insertBefore(u, head ? head.nextSibling : box.firstChild); });
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
})
