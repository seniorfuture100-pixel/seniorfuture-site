// 원본: src/anchor-tabs.js
/* anchor-tabs.js — 상세페이지 탭(소개·커리큘럼·강사·문의), 기업 페이지 섹션 이동
   <nav data-sf-anchor-tabs data-offset="120">
     <a href="#intro" class="sf-tab">소개</a> <a href="#curriculum" class="sf-tab">커리큘럼</a> …
   </nav>
   <section id="intro">…</section>
   nav에 CSS position: sticky; top: var(--sf-header-h); 를 주면 스크롤 시 고정돼요. */
SFUI.register('anchorTabs', function (root) {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('[data-sf-anchor-tabs]').forEach(function (nav) {
    if (!SFUI.once(nav, 'Anchor')) return;
    var offset = Number(nav.getAttribute('data-offset') || 120);
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    function setActive(i) { links.forEach(function (a, j) { a.classList.toggle('is-active', i === j); if (i === j) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        var t = targets[i]; if (!t) return; e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset + 1, behavior: reduce ? 'auto' : 'smooth' });
        setActive(i);
      });
    });
    function onScroll() {
      var cur = 0;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top - offset <= 4) cur = i; });
      setActive(cur);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})
