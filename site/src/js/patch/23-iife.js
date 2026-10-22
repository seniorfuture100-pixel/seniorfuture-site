// 원본: src/hash-guard.js
// 목록 순서(Figma): 교육 = 등록 순서(3번 강의부터), 커뮤니티 = 모집 중인 모임 날짜순 → 마감된 모임
(function () {
  var tries = 0;
  (function run() {
    var host = document.querySelector('[data-sf-shop]'), sr = host && host.shadowRoot, box = sr && sr.querySelector('.sf-shop--list');
    if (!box) { if (++tries < 40) setTimeout(run, 250); return; }
    var grid = sr.querySelector('.iw-shop-grid'); if (!grid || grid.getAttribute('data-sf-sorted')) return;
    var items = SFUI.shopItems ? SFUI.shopItems() : {}, cards = [].slice.call(grid.children).filter(function (c) { return c.querySelector('a[href*="idx="]'); });
    var id = function (c) { return +(c.querySelector('a[href*="idx="]').getAttribute('href').match(/idx=(\d+)/) || [])[1]; };
    var t = function (c) { var it = items[id(c)]; return it && SFUI.parseDate ? SFUI.parseDate(it.start) || 0 : 0; };
    if (box.classList.contains('sf-shop--course')) cards.sort(function (a, b) { return id(a) - id(b); });
    else if (box.classList.contains('sf-shop--meet')) {
      var closed = function (c) { return c.querySelector('[data-status="closed"]') || (c.getAttribute('data-status') === 'closed') ? 1 : 0; };
      cards.sort(function (a, b) { return closed(a) - closed(b) || (closed(a) ? t(b) - t(a) : t(a) - t(b)); });
    } else return;
    cards.forEach(function (c) { grid.appendChild(c); });
    var tail = grid.querySelector('#sf-shop-empty'); if (tail) grid.appendChild(tail);
    grid.setAttribute('data-sf-sorted', '1');
  })();
})()
