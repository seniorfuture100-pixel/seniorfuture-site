// 원본: src/session-status.js
/* session-status.js — 유료 강의 '다음 라이브 수업' 상태 (홈 로그인 후 · 마이페이지)
   시작 전: "D-3 · 11월 11일 (화) 19:30"  /  당일: "오늘 19:30 시작"
   시작 20분 전 ~ 종료: 입장 버튼 활성 (data-open-before로 변경)  /  종료 후: "수업이 끝났어요"
   <div data-sf-session data-start="2026-11-11 19:30" data-end="2026-11-11 21:00" data-open-before="20" data-link-live="https://zoom.us/...">
     <span data-sf-session-label></span>
     <a class="sf-btn sf-btn--dark" data-sf-session-btn>라이브 입장</a>
   </div> */
SFUI.register('sessionStatus', function (root) {
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  function fmt(t) { var d = new Date(t); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WEEK[d.getDay()] + ') ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function hm(t) { var d = new Date(t); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function paint(el) {
    var start = SFUI.parseDate(el.getAttribute('data-start')); if (!start) return;
    var end = SFUI.parseDate(el.getAttribute('data-end')) || start + 90 * 60 * 1000;
    var before = Number(el.getAttribute('data-open-before') || 20) * 60 * 1000;
    var now = Date.now(), label = el.querySelector('[data-sf-session-label]'), btn = el.querySelector('[data-sf-session-btn]');
    var today = new Date(now).toDateString() === new Date(start).toDateString();
    var days = Math.ceil((new Date(start).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000);
    var open = now >= start - before && now < end;
    var text = now >= end ? '수업이 끝났어요' : now >= start ? '지금 진행 중이에요' : today ? '오늘 ' + hm(start) + ' 시작' : 'D-' + days + ' · ' + fmt(start);
    if (label) label.textContent = text;
    if (btn) {
      var href = el.getAttribute('data-link-live');
      if (open && href) { btn.classList.remove('is-disabled'); btn.removeAttribute('aria-disabled'); btn.setAttribute('href', href); btn.setAttribute('target', '_blank'); btn.textContent = '라이브 입장'; }
      else { btn.classList.add('is-disabled'); btn.setAttribute('aria-disabled', 'true'); btn.removeAttribute('href'); btn.textContent = now >= end ? '종료' : '시작 ' + (before / 60000) + '분 전부터 입장'; }
    }
  }
  var els = root.querySelectorAll('[data-sf-session]');
  els.forEach(function (el) { if (SFUI.once(el, 'Session')) paint(el); });
  if (els.length && !window.__sfSessionTimer) window.__sfSessionTimer = setInterval(function () { document.querySelectorAll('[data-sf-session]').forEach(paint); }, 30000);
})
