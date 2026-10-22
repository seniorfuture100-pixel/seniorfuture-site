// 원본: src/hash-guard.js
// 접근성·SEO 보정: 확대 허용, 로고 이름을 보이는 글자와 맞춤, 홈 h1(화면에는 숨김), 이미지 서버 미리 연결
(function () {
  var vp = document.querySelector('meta[name=viewport]');
  if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
  ['https://cdn.imweb.me', 'https://vendor-cdn.imweb.me', 'https://static.imweb.me'].forEach(function (u) {
    if (document.querySelector('link[rel=preconnect][href="' + u + '"]')) return;
    var l = document.createElement('link'); l.rel = 'preconnect'; l.href = u; l.crossOrigin = ''; document.head.appendChild(l);
  });
  var fix = function () {
    document.querySelectorAll('a.sf-mh__logo, a[aria-label="시니어퓨처 홈"]').forEach(function (a) { a.setAttribute('aria-label', 'SENIOR FUTURE 시니어퓨처 홈'); });
    if (location.pathname === '/' && !document.querySelector('h1')) {
      var m = document.querySelector('main') || document.querySelector('#doz_body .section_wrap'); if (!m) return false;
      var h = document.createElement('h1'); h.className = 'sf-sr-h1'; h.textContent = '시니어퓨처 · 시니어 산업 실무 교육과 커뮤니티';
      m.insertBefore(h, m.firstChild);
    }
    return true;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix); else fix();
})()
