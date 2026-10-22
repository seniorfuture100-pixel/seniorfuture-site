// 원본: src/hash-guard.js
// 홈 강의 카드 찜(♡) — 아임웹 찜 목록에 실제로 담겨요(/shop/add_prod_wish.cm, 누를 때마다 담기·빼기). 비회원은 로그인으로.
SFUI.register('homeWish', function (root) {
  var cards = [].filter.call(root.querySelectorAll('a.sf-ccard[href*="/course/?idx="]'), function (a) { return !a.closest('.sf-pv-related') && !a.querySelector('.sf-wish'); });
  if (!cards.length) return;
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>';
  cards.forEach(function (a) {
    var th = a.querySelector('.sf-ccard__thumb'); if (!th) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sf-wish'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', '찜하기'); b.innerHTML = HEART;
    b.setAttribute('data-idx', (a.getAttribute('href').match(/idx=(\d+)/) || [])[1] || '');
    th.appendChild(b);
  });
  var codes = {};
  function code(idx) {
    if (codes[idx]) return Promise.resolve(codes[idx]);
    return fetch('/course/?idx=' + idx, { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) { var m = t.match(/addProdWish\('(s[0-9a-f]+)'/); return (codes[idx] = m && m[1]); });
  }
  function toLogin() { var p = location.pathname + location.search; location.href = '/login?back_url=' + encodeURIComponent(btoa(unescape(encodeURIComponent(p)))); }
  if (SFUI.once(document.documentElement, 'HomeWish')) document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.sf-wish'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.disabled) return; b.disabled = true;
    code(b.getAttribute('data-idx')).then(function (c) {
      if (!c) throw 0;
      return fetch('/shop/add_prod_wish.cm', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }, body: 'prod_code=' + c }).then(function (r) { return r.json(); });
    }).then(function (j) {
      if (j.msg === 'NON_MEMBERS') return toLogin();
      var on = j.res === 'add';
      document.querySelectorAll('.sf-wish[data-idx="' + b.getAttribute('data-idx') + '"]').forEach(function (x) { x.setAttribute('aria-pressed', on ? 'true' : 'false'); x.setAttribute('aria-label', on ? '찜 취소' : '찜하기'); });
      if (SFUI.toast) SFUI.toast(on ? '찜 목록에 담았어요' : '찜을 취소했어요');
    }).catch(function () {}).then(function () { b.disabled = false; }, function () { b.disabled = false; });
  }, true);
  // 이미 찜한 강의는 채워서 보여 줘요(로그인한 경우)
  fetch('/shop_mypage/?m2=wish_list', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
    if (!t || !/wish/i.test(t)) return;
    var d = new DOMParser().parseFromString(t, 'text/html'), ids = {};
    [].forEach.call(d.querySelectorAll('.shop-content a[href*="idx="]'), function (x) { var m = x.getAttribute('href').match(/idx=(\d+)/); if (m) ids[m[1]] = 1; });
    document.querySelectorAll('.sf-wish').forEach(function (x) { if (ids[x.getAttribute('data-idx')]) { x.setAttribute('aria-pressed', 'true'); x.setAttribute('aria-label', '찜 취소'); } });
  }).catch(function () {});
})
