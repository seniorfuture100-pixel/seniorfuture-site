// 원본: src/countdown.js
/* countdown.js — 신청 마감까지 남은 시간
   <div data-sf-countdown data-deadline="2026-10-24 17:00" data-ended-text="신청이 마감되었어요">
     <span data-sf-countdown-label>신청 마감까지 남은 시간</span>
     <b data-unit="d">0</b>일 <b data-unit="h">00</b>시간 <b data-unit="m">00</b>분 <b data-unit="s">00</b>초
   </div>
   <a class="sf-btn" data-sf-countdown-disable>무료로 신청하기</a>   ← 마감되면 비활성 */
SFUI.register('countdown', function (root) {
  root.querySelectorAll('[data-sf-countdown]').forEach(function (el) {
    if (!SFUI.once(el, 'Countdown')) return;
    var end = SFUI.parseDate(el.getAttribute('data-deadline'));
    if (!end) return;
    var units = {}; el.querySelectorAll('[data-unit]').forEach(function (u) { units[u.getAttribute('data-unit')] = u; });
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    el.setAttribute('role', 'timer');
    function finish() {
      el.classList.add('is-ended');
      var label = el.querySelector('[data-sf-countdown-label]');
      if (label) label.textContent = el.getAttribute('data-ended-text') || '신청이 마감되었어요';
      Object.keys(units).forEach(function (k) { units[k].textContent = k === 'd' ? '0' : '00'; });
      document.querySelectorAll('[data-sf-countdown-disable]').forEach(function (b) {
        b.classList.add('is-disabled'); b.setAttribute('aria-disabled', 'true'); b.removeAttribute('href'); b.textContent = '신청 마감';
      });
    }
    function tick() {
      var left = end - Date.now();
      if (left <= 0) { clearInterval(t); finish(); return; }
      var s = Math.floor(left / 1000);
      if (units.d) units.d.textContent = String(Math.floor(s / 86400));
      if (units.h) units.h.textContent = pad(Math.floor(s % 86400 / 3600));
      if (units.m) units.m.textContent = pad(Math.floor(s % 3600 / 60));
      if (units.s) units.s.textContent = pad(s % 60);
    }
    var t = setInterval(tick, 1000); tick();
  });
})
