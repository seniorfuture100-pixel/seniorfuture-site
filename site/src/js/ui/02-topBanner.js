// 원본: src/top-banner.js
/* top-banner.js — 띠배너 닫기(24시간 동안 다시 안 보기)
   <div data-sf-topbanner="2026-10-event"> ... <button data-sf-close aria-label="띠배너 닫기">×</button></div>
   값(2026-10-event)을 바꾸면 새 배너로 인식해 다시 보여요. */
SFUI.register('topBanner', function (root) {
  var DAY = 24 * 60 * 60 * 1000;
  root.querySelectorAll('[data-sf-topbanner]').forEach(function (el) {
    if (!SFUI.once(el, 'TopBanner')) return;
    var key = 'sf_topbanner_' + (el.getAttribute('data-sf-topbanner') || 'default');
    var until = Number(SFUI.store.get(key) || 0);
    if (until > Date.now()) { el.classList.add('sf-hidden'); return; }
    var btn = el.querySelector('[data-sf-close]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      SFUI.store.set(key, String(Date.now() + DAY));
      el.classList.add('sf-hidden');
    });
  });
})
