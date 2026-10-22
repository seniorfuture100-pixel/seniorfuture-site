// 원본: src/drawer.js
/* drawer.js — 모바일 전체 메뉴(오른쪽에서 열림)
   <button data-sf-drawer-open="sf-menu" aria-label="전체 메뉴">☰</button>
   <div id="sf-menu" data-sf-drawer class="sf-drawer" hidden>
     <div class="sf-drawer__dim" data-sf-drawer-close></div>
     <nav class="sf-drawer__panel" role="dialog" aria-modal="true" aria-label="전체 메뉴">
       <button data-sf-drawer-close aria-label="닫기">×</button> …(교육 하위 메뉴는 accordion.js로 펼침)
     </nav>
   </div> */
SFUI.register('drawer', function (root) {
  var lastFocus = null;
  function open(d) { lastFocus = document.activeElement; d.hidden = false; void d.offsetWidth; d.classList.add('is-open'); document.documentElement.style.overflow = 'hidden'; var f = d.querySelector('button, a'); if (f) f.focus(); }
  function close(d) { d.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(function () { d.hidden = true; }, 250); if (lastFocus) lastFocus.focus(); }
  root.querySelectorAll('[data-sf-drawer-open]').forEach(function (btn) {
    if (!SFUI.once(btn, 'DrawerOpen')) return;
    btn.addEventListener('click', function () { var d = document.getElementById(btn.getAttribute('data-sf-drawer-open')); if (d) open(d); });
  });
  root.querySelectorAll('[data-sf-drawer]').forEach(function (d) {
    if (!SFUI.once(d, 'Drawer')) return;
    d.querySelectorAll('[data-sf-drawer-close]').forEach(function (c) { c.addEventListener('click', function () { close(d); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close(d);
      if (e.key === 'Tab') { var f = d.querySelectorAll('a, button'); if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  });
})
