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
   결과 상태는 data-status(open|closing|live|ended)로도 붙어서 category-filter와 함께 쓸 수 있어요.
   (10/30 사장님) 라이브는 시작한 날 밤 12시까지 LIVE(입장하기)로 두고, 다음 날부터 끝남:
     상품 상세 [다시보기] 칸에 주소가 있으면 '다시보기' 버튼, 없으면 '종료' */
// 그날 끝(23:59:59) — 라이브가 '끝남'으로 바뀌는 시각
SFUI.dayEnd = function (t) { var d = new Date(t); d.setHours(23, 59, 59, 999); return d.getTime(); };
SFUI.liveOver = function (start, end, now) {
  if (!start) return !!end && (now || Date.now()) > end;
  return (now || Date.now()) > Math.max(end || 0, SFUI.dayEnd(start));
};
// (10/30 사장님) 모임·이벤트 상태 = 교육 수강 기간처럼 '시작 ~ 끝' 기준
//   모집중 → 마감 임박(마감 3일 전) → 모집 마감(마감 ~ 시작) → 진행 중(시작 ~ 끝) → 종료(끝난 뒤)
//   끝을 안 적었으면 시작한 날 밤 12시까지 · 마감을 안 적었으면 시작 시각이 마감
SFUI.meetState = function (t, now) {
  now = now || Date.now();
  var P = function (v) { return typeof v === 'number' ? v : SFUI.parseDate(v); };
  var S = P(t && t.start), E = P(t && t.end) || (S ? SFUI.dayEnd(S) : 0), D = P(t && t.deadline) || S;
  if (S && now > E) return ['ended', '종료'];
  if (S && now >= S) return ['ongoing', '진행 중'];
  if (D && now >= D) return ['closed', '모집 마감'];
  if (D && D - now <= 2592e5) return ['soon', '마감 임박'];
  return ['recruit', '모집중'];
};
SFUI.register('liveStatus', function (root) {
  var DAY = 24 * 60 * 60 * 1000;
  var STATE = {
    open:    { label: '모집중',       badge: 'sf-badge--brand',   btn: '무료 신청',  cls: 'sf-btn--outline', link: 'data-link-apply' },
    closing: { label: '마감 임박',    badge: 'sf-badge--live',    btn: '무료 신청',  cls: 'sf-btn--outline', link: 'data-link-apply' },
    closed:  { label: '신청 마감',    badge: 'sf-badge--neutral', btn: '신청 마감',  cls: 'sf-btn--neutral', link: null },
    live:    { label: 'LIVE',         badge: 'sf-badge--live',    btn: '입장하기',   cls: 'sf-btn--primary', link: 'data-link-live' },
    ended:   { label: '종료',         badge: 'sf-badge--neutral', btn: '종료',       cls: 'sf-btn--neutral', link: null },
    replay:  { label: '다시보기',     badge: 'sf-badge--neutral', btn: '다시보기',   cls: 'sf-btn--neutral', link: 'data-link-replay' }
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
    if (SFUI.liveOver(start, end, now)) return 'ended';
    if (now >= start) return 'live';
    if (now >= deadline) return 'closed';
    if (deadline - now <= DAY) return 'closing';
    return 'open';
  }
  function paint(el) {
    var s = stateOf(el, Date.now()), rp = s === 'ended' && el.getAttribute('data-link-replay'), k = rp ? 'replay' : s;
    if (s === 'ended' && !rp) findReplay(el);
    if (el.getAttribute('data-status') === s && el.getAttribute('data-sf-live-k') === k) return;
    el.setAttribute('data-status', s); el.setAttribute('data-sf-live-k', k);
    var conf = STATE[k];
    var badge = el.querySelector('[data-sf-live-badge]');
    if (badge) { BADGES.forEach(function (c) { badge.classList.remove(c); }); badge.classList.add('sf-badge', conf.badge); badge.textContent = conf.label; }
    var btn = el.querySelector('[data-sf-live-btn]');
    if (btn) {
      BTNS.forEach(function (c) { btn.classList.remove(c); }); btn.classList.add('sf-btn', conf.cls); btn.textContent = conf.btn;
      var href = conf.link ? el.getAttribute(conf.link) : null;
      if (href) { btn.setAttribute('href', href); btn.classList.remove('is-disabled'); btn.removeAttribute('aria-disabled'); }
      else { btn.removeAttribute('href'); btn.classList.add('is-disabled'); btn.setAttribute('aria-disabled', 'true'); }
      if (s === 'live' || k === 'replay') btn.setAttribute('target', '_blank'); else btn.removeAttribute('target');
    }
  }
  // 끝난 라이브: 상품 상세 [다시보기] 주소를 한 번 읽어 와서 버튼을 바꿔요(SFUI.roomInfo 가 5분 동안 기억)
  function findReplay(el) {
    if (el.__sfRp || !SFUI.roomInfo) return; el.__sfRp = 1;
    var m = /[?&]idx=(\d+)/.exec(el.getAttribute('data-link-apply') || '');
    m && SFUI.roomInfo(m[1], function (o) { if (o && o.replay) { el.setAttribute('data-link-replay', o.replay); paint(el); } });
  }
  var items = root.querySelectorAll('[data-sf-live]');
  items.forEach(function (el) { if (SFUI.once(el, 'Live')) paint(el); });
  if (items.length && !window.__sfLiveTimer) {
    window.__sfLiveTimer = setInterval(function () { document.querySelectorAll('[data-sf-live]').forEach(paint); }, 30000);
  }
})
