// 원본: src/hash-guard.js
(function () {
  var t = { '/experts': '강사진', '/terms': '약관 및 정책', '/shop_mypage': '마이페이지', '/search': '검색' }[location.pathname.replace(/\/$/, '')];
  if (t && !/\|/.test(document.title)) document.title = t + ' | 시니어퓨처';
})()
