// 원본: src/product-related.js
/* product-related.js — 교육 상세 맨 아래 '함께 보면 좋은 강의' (Figma 20:1309 Related)
   같은 분야 강의를 먼저, 모자라면 다른 강의로 4개를 채워요.
   (10/30) 예전엔 코드에 적어 둔 예시 강의(SFUI.courseCards)를 보여 줘서, 숨긴 상품이 나오고 누르면 홈으로 튕겼어요
     → 지금 교육 목록(/course)에 보이는 상품만 받아서 만들어요(품절·판매 종료·이 상품은 빼요) · 하나도 없으면 칸을 만들지 않아요 */
SFUI.register('productRelated', function () {
  var pv = document.querySelector('.sf-pv--course');
  if (!pv || !window.fetch || !SFUI.once(pv, 'Related')) return;
  var idx = +new URLSearchParams(location.search).get('idx');
  var pq = /preview_mode=1/.test(location.search) ? '?preview_mode=1' : '';
  var tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s == null ? '' : s; return tmp.innerHTML; }
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  fetch('/course' + pq, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
    var d = t && new DOMParser().parseFromString(t, 'text/html');
    if (!d) return;
    var list = [].concat.apply([], [].map.call(d.querySelectorAll('template'), function (x) { return [].slice.call(x.content.querySelectorAll('li.iw-shop-card')); })).map(function (c) {
      var sg = SFUI.sumTags ? SFUI.sumTags((c.querySelector('.iw-shop-product-summary') || {}).textContent) : { text: '', cats: [] };
      var img = c.querySelector('img.iw-shop-thumbnail, img');
      return {
        id: +c.getAttribute('data-system-product-id'), name: clean((c.querySelector('.iw-shop-product-name') || {}).textContent), sum: sg.text, cats: sg.cats || [],
        img: img ? img.getAttribute('src') || img.getAttribute('data-src') || '' : '',
        tags: SFUI.badgeTags ? SFUI.badgeTags(c.querySelector('.iw-shop-product-badges')) : null,
        off: SFUI.saleOver ? SFUI.saleOver(c) : c.getAttribute('data-sold-out') === 'true'
      };
    }).filter(function (x) { return x.id && x.id !== idx && !x.off; });
    if (!list.length) return;
    var me = (SFUI.shopItems && SFUI.shopItems() || {})[idx] || {}, mine = [].concat(me.cat || []);
    var meCard = (d.querySelector('template') && [].concat.apply([], [].map.call(d.querySelectorAll('template'), function (x) { return [].slice.call(x.content.querySelectorAll('li.iw-shop-card[data-system-product-id="' + idx + '"]')); }))[0]);
    meCard && SFUI.sumTags && (mine = mine.concat(SFUI.sumTags((meCard.querySelector('.iw-shop-product-summary') || {}).textContent).cats));
    var same = function (x) { return x.cats.some(function (c) { return mine.indexOf(c) > -1; }) ? 1 : 0; };
    list.sort(function (a, b) { return same(b) - same(a) || b.id - a.id; });
    var cat = (SFUI.cats || []).filter(function (c) { return c[0] === mine[0]; })[0];
    var sec = document.createElement('section');
    sec.className = 'sf-pv-related';
    sec.innerHTML = '<div class="sf-pv-related__in"><div class="sf-sec-head"><div class="sf-sec-head__t"><h2>함께 보면 좋은 강의</h2><p>' + esc(cat ? cat[1] + ' 분야 강의를 함께 들어 보세요' : '다른 분들이 함께 들은 강의예요') + '</p></div><a class="sf-sec-more" href="/course' + (cat ? '?cat=' + cat[0] : '') + '">전체보기<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a></div><ul class="sf-cards4">'
      + list.slice(0, 4).map(function (x) {
        return '<li><a class="sf-ccard" href="/course/?idx=' + x.id + '"><span class="sf-ccard__thumb">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" loading="lazy">' : '') + '</span><span class="sf-ccard__body"><strong>' + esc(x.name) + '</strong>' + (x.sum ? '<p>' + esc(x.sum) + '</p>' : '') + '<span class="sf-tags">' + (SFUI.tagHtml ? SFUI.tagHtml(x.tags) : '') + '</span></span></a></li>';
      }).join('') + '</ul></div>';
    pv.parentNode.insertBefore(sec, pv.nextSibling);
    if (SFUI.init) SFUI.init(sec);
  })['catch'](function () {});
})
