// 원본: src/category-filter.js
/* category-filter.js — 카테고리 칩으로 카드 거르기 (+ 주소에 ?cat= 저장)
   <div class="sf-chips" data-sf-filter-group="edu" data-sf-url-param="cat">
     <button class="sf-chip" data-sf-filter="all">전체</button>
     <button class="sf-chip" data-sf-filter="care">요양 & 돌봄</button> …
   </div>
   <article data-sf-filter-item="edu" data-category="care intro">…</article>   ← 여러 개면 띄어쓰기
   <div data-sf-filter-empty="edu" class="sf-hidden">조건에 맞는 교육이 없어요</div> */
SFUI.register('categoryFilter', function (root) {
  root.querySelectorAll('[data-sf-filter-group]').forEach(function (group) {
    if (!SFUI.once(group, 'Filter')) return;
    var name = group.getAttribute('data-sf-filter-group');
    var param = group.getAttribute('data-sf-url-param');
    var chips = group.querySelectorAll('[data-sf-filter]');
    function apply(value, push) {
      chips.forEach(function (c) { var on = c.getAttribute('data-sf-filter') === value; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
      var shown = 0;
      document.querySelectorAll('[data-sf-filter-item="' + name + '"]').forEach(function (item) {
        var cats = (item.getAttribute('data-category') || '').split(/\s+/);
        var ok = value === 'all' || cats.indexOf(value) > -1;
        item.classList.toggle('sf-hidden', !ok); if (ok) shown++;
      });
      document.querySelectorAll('[data-sf-filter-empty="' + name + '"]').forEach(function (e) { e.classList.toggle('sf-hidden', shown > 0); });
      if (param && push && window.history && history.replaceState) {
        var u = new URL(window.location.href);
        if (value === 'all') u.searchParams.delete(param); else u.searchParams.set(param, value);
        history.replaceState(null, '', u.toString());
      }
    }
    chips.forEach(function (c) { c.setAttribute('type', 'button'); c.addEventListener('click', function () { apply(c.getAttribute('data-sf-filter'), true); }); });
    var start = 'all';
    if (param) { var v = new URL(window.location.href).searchParams.get(param); if (v && group.querySelector('[data-sf-filter="' + v + '"]')) start = v; }
    apply(start, false);
  });
})
