// 원본: src/hash-guard.js
// 목록 순서: 교육 = 최근 등록 순(10/30), 커뮤니티 = 모집 중인 모임 날짜순 → 마감된 모임
(function () {
  var tries = 0;
  (function run() {
    var host = document.querySelector('[data-sf-shop]'), sr = host && host.shadowRoot, box = sr && sr.querySelector('.sf-shop--list');
    if (!box) { if (++tries < 40) setTimeout(run, 250); return; }
    var grid = sr.querySelector('.iw-shop-grid'); if (!grid || grid.getAttribute('data-sf-sorted')) return;
    var items = SFUI.shopItems ? SFUI.shopItems() : {}, cards = [].slice.call(grid.children).filter(function (c) { return c.querySelector('a[href*="idx="]'); });
    var id = function (c) { return +(c.querySelector('a[href*="idx="]').getAttribute('href').match(/idx=(\d+)/) || [])[1]; };
    var t = function (c) { var it = items[id(c)]; return it && SFUI.parseDate ? SFUI.parseDate(it.start) || 0 : 0; };
    // (10/30 사장님) 교육은 최근 등록 순(번호 큰 상품이 먼저) — 아임웹 '등록순'과 같은 방향, 페이지가 나뉘어도 1쪽이 최신
    if (box.classList.contains('sf-shop--course')) cards.sort(function (a, b) { return id(b) - id(a); });
    else if (box.classList.contains('sf-shop--meet')) {
      var closed = function (c) { return c.querySelector('[data-status="ended"]') || (c.getAttribute('data-status') === 'ended') ? 1 : 0; }; // (10/30) 뒤로 보내는 건 끝난(종료) 모임만
      cards.sort(function (a, b) { return closed(a) - closed(b) || (closed(a) ? t(b) - t(a) : t(a) - t(b)); });
    } else return;
    cards.forEach(function (c) { grid.appendChild(c); });
    var tail = grid.querySelector('#sf-shop-empty'); if (tail) grid.appendChild(tail);
    grid.setAttribute('data-sf-sorted', '1');
  })();
})()
