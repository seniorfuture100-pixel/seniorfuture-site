// 원본: src/live-status.js
/* live-status.js — 무료 라이브 카드 상태 자동 전환
   상태: 모집중 → 마감 임박(마감 24시간 전) → LIVE(시작~종료) → 다시보기
   <article data-sf-live
            data-start="2026-10-24 19:00" data-end="2026-10-24 20:00"
            data-deadline="2026-10-24 17:00"            (선택, 없으면 시작 시각)
            data-force=""                                (운영자 수동: live | ended)
            data-link-apply="/live/24" data-link-live="https://zoom.us/..." data-link-replay="/live/24#replay">
     <span data-sf-live-badge class="sf-badge"></span>
     <a data-sf-live-btn class="sf-btn"></a>
   </article>
   결과 상태는 data-status(open|closing|live|ended)로도 붙어서 category-filter와 함께 쓸 수 있어요. */
SFUI.register('liveStatus', function (root) {
  var DAY = 24 * 60 * 60 * 1000;
  var STATE = {
    open:    { label: '모집중',       badge: 'sf-badge--brand',   btn: '무료 신청',  cls: 'sf-btn--outline', link: 'data-link-apply' },
    closing: { label: '마감 임박',    badge: 'sf-badge--live',    btn: '무료 신청',  cls: 'sf-btn--outline', link: 'data-link-apply' },
    closed:  { label: '신청 마감',    badge: 'sf-badge--neutral', btn: '신청 마감',  cls: 'sf-btn--neutral', link: null },
    live:    { label: 'LIVE',         badge: 'sf-badge--live',    btn: '입장하기',   cls: 'sf-btn--primary', link: 'data-link-live' },
    ended:   { label: '다시보기',         badge: 'sf-badge--neutral', btn: '다시보기',   cls: 'sf-btn--neutral', link: 'data-link-replay' }
  };
  var BADGES = ['sf-badge--brand', 'sf-badge--live', 'sf-badge--neutral'];
  var BTNS = ['sf-btn--outline', 'sf-btn--primary', 'sf-btn--neutral'];
  function stateOf(el, now) {
    var force = el.getAttribute('data-force');
    if (force === 'live' || force === 'ended') return force;
    var start = SFUI.parseDate(el.getAttribute('data-start'));
    var end = SFUI.parseDate(el.getAttribute('data-end')) || (start && start + 60 * 60 * 1000);
    var deadline = SFUI.parseDate(el.getAttribute('data-deadline')) || start;
    if (!start) return 'open';
    if (now >= end) return 'ended';
    if (now >= start) return 'live';
    if (now >= deadline) return 'closed';
    if (deadline - now <= DAY) return 'closing';
    return 'open';
  }
  function paint(el) {
    var s = stateOf(el, Date.now()); if (el.getAttribute('data-status') === s) return;
    el.setAttribute('data-status', s);
    var conf = STATE[s];
    var badge = el.querySelector('[data-sf-live-badge]');
    if (badge) { BADGES.forEach(function (c) { badge.classList.remove(c); }); badge.classList.add('sf-badge', conf.badge); badge.textContent = conf.label; }
    var btn = el.querySelector('[data-sf-live-btn]');
    if (btn) {
      BTNS.forEach(function (c) { btn.classList.remove(c); }); btn.classList.add('sf-btn', conf.cls); btn.textContent = conf.btn;
      var href = conf.link ? el.getAttribute(conf.link) : null;
      if (href) { btn.setAttribute('href', href); btn.classList.remove('is-disabled'); btn.removeAttribute('aria-disabled'); }
      else { btn.removeAttribute('href'); btn.classList.add('is-disabled'); btn.setAttribute('aria-disabled', 'true'); }
      if (s === 'live') btn.setAttribute('target', '_blank'); else btn.removeAttribute('target');
    }
  }
  var items = root.querySelectorAll('[data-sf-live]');
  items.forEach(function (el) { if (SFUI.once(el, 'Live')) paint(el); });
  if (items.length && !window.__sfLiveTimer) {
    window.__sfLiveTimer = setInterval(function () { document.querySelectorAll('[data-sf-live]').forEach(paint); }, 30000);
  }
})
