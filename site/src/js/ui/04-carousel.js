// 원본: src/carousel.js
/* carousel.js — 메인 배너·무료 라이브·커뮤니티·후기 캐러셀 (스와이프 지원)
   <div data-sf-carousel data-autoplay="5000">
     <div data-sf-track class="sf-track"> <div class="sf-slide">…</div> … </div>
     <button data-sf-prev aria-label="이전">‹</button> <button data-sf-next aria-label="다음">›</button>
     <span data-sf-pager></span>   ← "1 / 3" 표시(선택)
   </div>
   track은 CSS scroll-snap으로 움직여서 모바일에서는 손가락으로 밀 수 있어요.
   메인 배너(월부형): <div data-sf-carousel data-peek data-autoplay="5000" class="sf-carousel--peek"> …
     양옆 슬라이드가 살짝 보이고, 가운데 슬라이드에 is-current가 붙어요.
     <button data-sf-pause aria-label="자동 넘김 멈춤"></button> 를 넣으면 멈춤/재생 버튼이 돼요. */
SFUI.register('carousel', function (root) {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('[data-sf-carousel]').forEach(function (el) {
    if (!SFUI.once(el, 'Carousel')) return;
    var track = el.querySelector('[data-sf-track]');
    if (!track) return;
    var prev = el.querySelector('[data-sf-prev]'), next = el.querySelector('[data-sf-next]'), pager = el.querySelector('[data-sf-pager]');
    var slides = function () { return Array.prototype.slice.call(track.children); };
    function step() { var s = slides(); if (s.length < 2) return track.clientWidth; return s[1].offsetLeft - s[0].offsetLeft; }
    function perView() { return Math.max(1, Math.round(track.clientWidth / step())); }
    function index() { return Math.round(track.scrollLeft / step()); }
    // 화면이 움직이지 않게 순간 이동 (CSS scroll-behavior: smooth 를 잠깐 끔)
    // (10/23) 붙는 위치(scroll-snap)를 껐다 켜면 페이지 전체를 다시 계산해서 PC 휠이 버벅였어요 → 이동 목표가 원래 붙는 위치라 끄지 않아요
    function jump(x) { if (Math.abs(track.scrollLeft - x) < 1) return; track.scrollTo({ left: x, behavior: 'instant' }); }
    var peek = el.hasAttribute('data-peek') && slides().length > 1;
    var realCount = slides().length;
    // (10/23 v1.0.13) 끝없이 돌기: 양쪽 끝에 복제를 2장씩 둬요. 1장만 두면 6→1로 넘어가는 순간 옆에 살짝 보이던 다음 배너 자리가
    // 비었다가 순간 이동 뒤에 채워져서 '끊겨' 보였어요. 이제 넘어가는 동안에도 양옆이 늘 차 있어 한 흐름으로 이어져요
    // 아주 넓은 화면에서 양옆에 2장 넘게 보이면 그만큼 더 복제해요
    var CL = peek ? Math.max(2, Math.ceil(perView() / 2) + 1) : 0;
    if (peek) {
      slides().forEach(function (s, i) { s.setAttribute('data-sf-n', i); });
      var real = slides(), mk = function (s) {
        var c = s.cloneNode(true); c.setAttribute('data-sf-clone', ''); c.setAttribute('aria-hidden', 'true'); c.setAttribute('tabindex', '-1');
        c.querySelectorAll('a, button').forEach(function (x) { x.setAttribute('tabindex', '-1'); }); return c;
      };
      var k = Math.min(CL, real.length), head = real[0];
      for (var a = real.length - k; a < real.length; a++) track.insertBefore(mk(real[a]), head);
      for (var b = 0; b < k; b++) track.appendChild(mk(real[b]));
      CL = k; jump(step() * CL);
    }
    function recenter() {
      if (!peek) return;
      var i = index(), s = slides()[i];
      if (!s || !s.hasAttribute('data-sf-clone')) return;
      jump(step() * (i < CL ? i + realCount : i - realCount));
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (!peek) {
        if (prev) { prev.disabled = track.scrollLeft <= 2; prev.setAttribute('aria-disabled', String(prev.disabled)); }
        if (next) { next.disabled = track.scrollLeft >= max; next.setAttribute('aria-disabled', String(next.disabled)); }
      }
      var cur = slides()[index()];
      if (pager) {
        var total = peek ? realCount : Math.max(1, slides().length - perView() + 1);
        var no = peek && cur ? Number(cur.getAttribute('data-sf-n')) + 1 : Math.min(index() + 1, total);
        pager.textContent = no + ' / ' + total;
      }
      // (10/23) 끝없이 돌기: 진짜 배너와 그 복제에 '지금' 표시를 같이 붙여요. 복제→진짜로 순간 이동해도 장면 움직임이 처음부터 다시 시작되지 않아요
      var curN = cur && cur.getAttribute('data-sf-n');
      if (peek) slides().forEach(function (s) {
        var on = curN != null && s.getAttribute('data-sf-n') === curN; s.classList.toggle('is-current', on);
        if (s.hasAttribute('data-sf-clone')) return;
        s.setAttribute('aria-hidden', on ? 'false' : 'true'); if (on) s.removeAttribute('tabindex'); else s.setAttribute('tabindex', '-1');
      });
    }
    function go(dir) {
      var max = track.scrollWidth - track.clientWidth;
      if (peek) { track.scrollTo({ left: track.scrollLeft + dir * step(), behavior: reduce ? 'auto' : 'smooth' }); return; }
      var target = track.scrollLeft + dir * step() * (el.hasAttribute('data-page') ? perView() : 1);
      if (dir > 0 && track.scrollLeft >= max - 2) target = 0; // 끝에서 처음으로(자동재생용)
      track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    var settle = null;
    track.addEventListener('scroll', function () { update(); clearTimeout(settle); settle = setTimeout(function () { recenter(); update(); }, 150); }, { passive: true });
    window.addEventListener('resize', update);
    var ms = Number(el.getAttribute('data-autoplay') || 0), timer = null, paused = false, stopped = false;
    var pause = el.querySelector('[data-sf-pause]');
    if (pause) {
      if (!ms || reduce) pause.hidden = true;
      pause.addEventListener('click', function () {
        stopped = !stopped; pause.classList.toggle('is-paused', stopped);
        pause.setAttribute('aria-label', stopped ? '자동 넘김 다시 시작' : '자동 넘김 멈춤');
      });
    }
    if (ms && !reduce) {
      timer = setInterval(function () { if (!paused && !stopped && !document.hidden) go(1); }, ms);
      ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { el.addEventListener(ev, function () { paused = true; }, { passive: true }); });
      ['mouseleave', 'focusout', 'touchend'].forEach(function (ev) { el.addEventListener(ev, function () { paused = false; }, { passive: true }); });
    }
    update();
  });
})
