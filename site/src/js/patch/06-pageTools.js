// 원본: src/page-tools.js
/* page-tools.js — 아임웹 위젯 배치·게시판 필터 보조
   1) <div data-sf-move-before="board|shop|newest"> : 이 코드 위젯을 그 종류 첫 위젯 바로 위로 옮겨요
      (디자인 모드에서 새 위젯은 맨 끝에만 추가돼서, 머리 영역을 목록 위로 올릴 때 써요)
   2) <div data-sf-board-filter> <button data-cat="all">전체</button> <button data-cat="전문가 인사이트">…</button> </div>
      → 같은 페이지 게시판 카드를 카테고리 글자로 걸러요. 주소 ?tab=전문가 인사이트 로도 선택돼요. */
SFUI.register('pageTools', function () {
  var TYPES = { board: '[data-widget-type="board"]', shop: '[data-widget-type="custom_widget"], div.js-custom-widget-container', newest: '[data-widget-type="newest"]' };
  function wrapOf(el) { return el.closest('[data-widget-type]') || el; }
  [].forEach.call(document.querySelectorAll('[data-sf-move-before]:not([data-sf-moved])'), function (el) {
    var target = document.querySelector(TYPES[el.getAttribute('data-sf-move-before')] || '_none_');
    if (!target) return;
    var anchor = wrapOf(target), block = wrapOf(el);
    if (anchor !== block && (anchor.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING)) anchor.parentNode.insertBefore(block, anchor);
    el.setAttribute('data-sf-moved', '');
  });
  if (document.querySelector('.sf-page')) document.documentElement.classList.add('sf-has-page-head');

  var group = document.querySelector('[data-sf-board-filter]');
  if (!group || !SFUI.once(group, 'BoardFilter')) return;
  function cards() { return [].slice.call(document.querySelectorAll('[data-widget-type="board"] ._post_item_wrap')); }
  function catOf(card) { var e = card.querySelector('.title em:not(.notice-block)'); return e ? e.textContent.trim() : ''; }
  function apply(v) {
    [].forEach.call(group.querySelectorAll('[data-cat]'), function (b) { var on = b.getAttribute('data-cat') === v; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
    var shown = 0;
    cards().forEach(function (c) { var ok = v === 'all' || catOf(c) === v; c.classList.toggle('sf-hidden', !ok); if (ok) shown++; });
    var empty = document.getElementById('sf-board-empty');
    if (empty) empty.hidden = shown > 0;
  }
  group.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    var v = b.getAttribute('data-cat'); apply(v);
    var u = new URL(location.href); if (v === 'all') u.searchParams.delete('tab'); else u.searchParams.set('tab', v); history.replaceState(null, '', u);
  });
  apply(new URLSearchParams(location.search).get('tab') || 'all');
})
