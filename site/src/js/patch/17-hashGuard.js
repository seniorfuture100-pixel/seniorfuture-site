// 원본: src/hash-guard.js
/* hash-guard.js — 아임웹 기본 스크립트(body 의 a 클릭 처리)가 '#…' 링크를 막아서
   약관 탭(:target)·강사진 바로가기·상세 탭이 안 움직이던 문제를 막아요.
   우리 컴포넌트 안의 '#아이디' 링크는 클릭이 body 까지 올라가지 않게 해요(브라우저 기본 이동은 그대로).
   + 기업 페이지 사례 카드(상세 글 없음) → 문의 폼으로, 제목이 비어 있던 페이지 제목 채우기 */
SFUI.register('hashGuard', function (root) {
  root.querySelectorAll('.sf-scope, .sf-pv, [data-sf-anchor-tabs]').forEach(function (c) {
    if (!SFUI.once(c, 'Hash')) return;
    c.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2 || a.matches('[data-sf-open],[data-sf-search-open],[data-cat]')) return;
      e.stopPropagation();
    });
  });
  if (/^\/(classroom|class-ltc)/.test(location.pathname)) root.querySelectorAll('.sf-scope p, .sf-scope span').forEach(function (e) { if (!e.children.length && e.textContent.indexOf('강사 윤미래') > -1) e.textContent = e.textContent.replace('강사 윤미래', '강사 김지현'); });
  root.querySelectorAll('a._btn_buy').forEach(function (b) { if (b.textContent.trim() === '참가 신청하기') b.textContent = '참여 신청하기'; });
  root.querySelectorAll('a.sf-case[href^="/insight/case-"]').forEach(function (a) { a.setAttribute('href', '#contact'); });
  // 마이페이지 모바일 메뉴: '내 강의'를 가로 스크롤 줄(.cart-menu-slide) 안으로 (mypage-view.js 새 버전이면 이미 들어가 있음)
  root.querySelectorAll('.left-menu.hidden-lg .sf-my-menu').forEach(function (ul) {
    var s = ul.querySelector('.cart-menu-slide'), f = ul.firstElementChild;
    if (s && f && f.tagName === 'LI' && f.querySelector('a[href="/classroom"]')) s.insertBefore(f, s.firstChild);
  });
  // 홈 커뮤니티 카드: 4:3 예시 이미지로 교체 + 4번째 카드(데모데이) 이미지·링크 (홈 코드 위젯을 다시 넣으면 필요 없음)
  var M = { e036249b57bbf: '1842ce4e584a5', f0c868144d59a: '919707c55b39f', d15de4d3d20d4: 'c147c907d86da' };
  root.querySelectorAll('.sf-mcard').forEach(function (a) {
    var i = a.querySelector('img'), s = i && i.getAttribute('src'), k = s && (s.match(/([a-f0-9]{13})\.jpg/) || [])[1];
    if (k && M[k]) i.setAttribute('src', s.replace(k, M[k]));
    else if (!i && a.getAttribute('href') === '/community') {
      a.setAttribute('href', '/community'); // (10/26) 예시 모임(18) 숨김
      var t = a.querySelector('.sf-ccard__thumb');
      if (t) { t.removeAttribute('style'); t.innerHTML = '<img src="https://cdn.imweb.me/upload/S20261016dceb77aecc2e2/6bdf45fa20fba.jpg" alt="">'; }
    }
  });
})
