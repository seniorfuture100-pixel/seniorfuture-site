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
    var base = Number(nav.getAttribute('data-offset') || 120), lockUntil = 0;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    // (10/26) 고정 탭 아래 실제 높이로 위치 계산(헤더 높이가 PC·휴대폰·띠배너마다 달라 고정값이면 앞 탭에 머물렀어요)
    function offset() {
      var cs = getComputedStyle(nav);
      if (cs.position === 'sticky' || cs.position === 'fixed') return (parseFloat(cs.top) || 0) + nav.offsetHeight + 12;
      return base;
    }
    function setActive(i) { links.forEach(function (a, j) { a.classList.toggle('is-active', i === j); if (i === j) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        var t = targets[i] || document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); if (!t) return; e.preventDefault(); targets[i] = t;
        setActive(i); lockUntil = Date.now() + 1200;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset() + 2, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    function onScroll() {
      if (Date.now() < lockUntil) return;
      var cur = 0, off = offset();
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top - off <= 16) cur = i; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) { for (var k = targets.length - 1; k >= 0; k--) if (targets[k] && targets[k].getBoundingClientRect().top < window.innerHeight) { cur = Math.max(cur, k); break; } }
      setActive(cur);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})
