// 원본: src/bottom-tabbar.js
/* bottom-tabbar.js — 모바일 하단 탭바 (Body Code에 HTML과 함께 1번만)
   <nav class="sf-tabbar" data-sf-tabbar aria-label="주요 메뉴">
     <a href="/" data-match="^/$">홈</a>
     <a href="/edu" data-match="^/edu">교육</a>
     <a href="/live" data-match="^/live">무료 라이브</a>
     <a href="/community" data-match="^/community">커뮤니티</a>
     <a href="/mypage" data-match="^/(mypage|shop_mypage)">MY</a>
   </nav>
   - 현재 주소와 data-match(정규식)가 맞는 탭에 aria-current를 붙여요.
   - 상세·결제처럼 하단 신청 바가 있는 페이지는 body나 그 바에 data-sf-hide-tabbar를 붙이면 탭바를 숨겨요. */
SFUI.register('tabbar', function (root) {
  root.querySelectorAll('[data-sf-tabbar]').forEach(function (bar) {
    if (!SFUI.once(bar, 'Tabbar')) return;
    var path = window.location.pathname;
    bar.querySelectorAll('a[data-match]').forEach(function (a) {
      var on = false; try { on = new RegExp(a.getAttribute('data-match')).test(path); } catch (e) {}
      if (on) a.setAttribute('aria-current', 'page');
    });
    if (document.querySelector('[data-sf-hide-tabbar]')) { bar.classList.add('sf-hidden'); return; }
    document.documentElement.classList.add('sf-has-tabbar');
  });
})
