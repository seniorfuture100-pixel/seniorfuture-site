// 원본: src/r3-homelogo.js
/* r3-homelogo.js (10/21) — 홈에서 로고를 누르면 페이지를 다시 불러오지 않고 맨 위로만 올라가요.
   다시 불러오면 헤더·탭 메뉴가 잠깐 사라졌다 다시 그려져서, 홈에서는 헤더가 그대로 떠 있게 해요.
   다른 페이지에서 누르면 원래대로 홈으로 이동해요. 공통 코드 <script id="sf-r3b-js"> 로 따로 넣어요(sf-r3-js 와 별개). */
(function () {
  function isHome(href) {
    try { var u = new URL(href, location.href); return u.origin === location.origin && (u.pathname === '/' || u.pathname === '') && !u.search && !u.hash; } catch (e) { return false; }
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !a.closest('#doz_header_wrap, #doz_footer, .sf-mh, .sf-tabbar')) return;
    if (!isHome(a.getAttribute('href')) || location.pathname !== '/' || location.search) return;
    e.preventDefault(); e.stopPropagation();
    // 모바일 전체 메뉴가 열려 있었다면 닫아요
    [].slice.call(document.querySelectorAll('.sf-drawer')).forEach(function (m) {
      var cs = getComputedStyle(m); if (m.hidden || cs.display === 'none' || cs.visibility === 'hidden') return;
      var x = m.querySelector('button[data-sf-drawer-close]'); if (x) x.click();
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, true);
})()
