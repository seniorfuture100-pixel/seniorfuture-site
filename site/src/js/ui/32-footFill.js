// 원본: v1.0.34 (2026-10-26)
/* footFill — 내용이 짧은 화면(분류에 상품 1개 등)에서 푸터가 위로 올라오고 아래가 하얗게 비던 문제:
   푸터 바로 위 마지막 구역에 최소 높이를 줘서 푸터가 늘 화면 맨 아래에 붙게 해요. */
(function () {
  if (window.__sfFootFill) return;
  window.__sfFootFill = 1;
  var T = 0;
  function fill() {
    var ft = document.getElementById('doz_footer_wrap'); if (!ft) return;
    var last = ft.previousElementSibling;
    while (last && !/section_wrap/.test(last.className)) last = last.previousElementSibling;
    if (!last) return;
    last.style.minHeight = '';
    var gap = window.innerHeight - (ft.getBoundingClientRect().bottom + window.scrollY);
    if (gap > 1) last.style.minHeight = (last.offsetHeight + gap) + 'px';
  }
  function soon() { clearTimeout(T); T = setTimeout(fill, 60); setTimeout(fill, 500); setTimeout(fill, 1300); }
  window.addEventListener('load', soon);
  window.addEventListener('resize', soon, { passive: true });
  document.addEventListener('click', soon, true);
  window.addEventListener('popstate', soon);
  if (document.readyState !== 'loading') soon(); else document.addEventListener('DOMContentLoaded', soon);
  setTimeout(soon, 2500); setTimeout(soon, 4000);
})();
