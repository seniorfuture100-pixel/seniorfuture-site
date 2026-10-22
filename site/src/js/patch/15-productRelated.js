// 원본: src/product-related.js
/* product-related.js — 교육 상세 맨 아래 '함께 보면 좋은 강의' (Figma 20:1309 Related)
   같은 분야 강의를 먼저, 모자라면 다른 강의로 4개를 채워요. 카드 정보는 SFUI.courseCards(board-view.js). */
SFUI.register('productRelated', function () {
  var pv = document.querySelector('.sf-pv--course');
  if (!pv || !SFUI.courseCards || !SFUI.once(pv, 'Related')) return;
  var idx = new URLSearchParams(location.search).get('idx');
  var items = SFUI.shopItems ? SFUI.shopItems() : {}, me = items[idx] || {};
  var ids = Object.keys(SFUI.courseCards).filter(function (k) { return k !== String(idx); });
  ids.sort(function (a, b) { return ((items[b] || {}).cat === me.cat) - ((items[a] || {}).cat === me.cat); });
  var cat = (SFUI.cats || []).filter(function (c) { return c[0] === me.cat; })[0];
  var tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s; return tmp.innerHTML; }
  var sec = document.createElement('section');
  sec.className = 'sf-pv-related';
  sec.innerHTML = '<div class="sf-pv-related__in"><div class="sf-sec-head"><div class="sf-sec-head__t"><h2>함께 보면 좋은 강의</h2><p>' + esc(cat ? cat[1] + ' 분야 강의를 함께 들어 보세요' : '다른 분들이 함께 들은 강의예요') + '</p></div><a class="sf-sec-more" href="/course' + (cat ? '?cat=' + cat[0] : '') + '">전체보기<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a></div><ul class="sf-cards4">'
    + ids.slice(0, 4).map(function (k) {
      var c = SFUI.courseCards[k], it = items[k] || {};
      var tags = (it.tags || []).map(function (t) { var d = SFUI.shopTags && SFUI.shopTags[t]; return d ? '<span class="sf-tag sf-tag--' + d[0] + '">' + d[1] + '</span>' : ''; }).join('');
      return '<li><a class="sf-ccard" href="/course/?idx=' + k + '"><span class="sf-ccard__thumb"><img src="' + SFUI.courseImg + c[2] + '" alt="" loading="lazy"></span><span class="sf-ccard__body"><strong>' + esc(c[0]) + '</strong><p>' + esc(c[1]) + '</p><span class="sf-tags">' + tags + '</span></span></a></li>';
    }).join('') + '</ul></div>';
  pv.parentNode.insertBefore(sec, pv.nextSibling);
  if (SFUI.init) SFUI.init(sec);
})
