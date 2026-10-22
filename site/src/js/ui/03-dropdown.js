// 원본: src/dropdown-menu.js
/* dropdown-menu.js — PC 헤더 '교육' 드롭다운 + 스크롤 시 헤더 그림자
   <li data-sf-dropdown>
     <a href="/edu" data-sf-dropdown-trigger aria-expanded="false">교육</a>
     <div data-sf-dropdown-panel class="sf-hidden">…</div>
   </li>
   <header data-sf-sticky-header> … </header>  (선택) */
SFUI.register('dropdown', function (root) {
  root.querySelectorAll('[data-sf-dropdown]').forEach(function (el) {
    if (!SFUI.once(el, 'Dropdown')) return;
    var trigger = el.querySelector('[data-sf-dropdown-trigger]');
    var panel = el.querySelector('[data-sf-dropdown-panel]');
    if (!trigger || !panel) return;
    var timer = null;
    function open() { clearTimeout(timer); panel.classList.remove('sf-hidden'); trigger.setAttribute('aria-expanded', 'true'); }
    function close() { timer = setTimeout(function () { panel.classList.add('sf-hidden'); trigger.setAttribute('aria-expanded', 'false'); }, 200); }
    el.addEventListener('mouseenter', open);
    el.addEventListener('mouseleave', close);
    el.addEventListener('focusin', open);
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) close(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') { clearTimeout(timer); panel.classList.add('sf-hidden'); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); } });
  });
  root.querySelectorAll('[data-sf-sticky-header]').forEach(function (h) {
    if (!SFUI.once(h, 'StickyHeader')) return;
    function onScroll() { h.classList.toggle('is-stuck', window.scrollY > 4); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  });
})
