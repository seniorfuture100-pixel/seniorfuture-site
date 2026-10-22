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
    function jump(x) { var b = track.style.scrollBehavior, s = track.style.scrollSnapType; track.style.scrollBehavior = 'auto'; track.style.scrollSnapType = 'none'; track.scrollLeft = x; track.style.scrollSnapType = s; track.style.scrollBehavior = b; }
    var peek = el.hasAttribute('data-peek') && slides().length > 1;
    var realCount = slides().length;
    if (peek) {
      // 끝없이 돌기: 맨 앞에 '마지막 배너 복제', 맨 뒤에 '첫 배너 복제'를 두고 복제에 닿으면 진짜 배너로 순간 이동해요
      slides().forEach(function (s, i) { s.setAttribute('data-sf-n', i); });
      var first = track.firstElementChild, last = track.lastElementChild;
      [[last.cloneNode(true), first], [first.cloneNode(true), null]].forEach(function (p) {
        var c = p[0]; c.setAttribute('data-sf-clone', ''); c.setAttribute('aria-hidden', 'true'); c.setAttribute('tabindex', '-1');
        c.querySelectorAll('a, button').forEach(function (x) { x.setAttribute('tabindex', '-1'); });
        track.insertBefore(c, p[1]);
      });
      jump(step());
    }
    function recenter() {
      if (!peek) return;
      var i = index(), s = slides()[i];
      if (!s || !s.hasAttribute('data-sf-clone')) return;
      jump(i === 0 ? step() * realCount : step());
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
      if (peek) slides().forEach(function (s) {
        var on = s === cur; s.classList.toggle('is-current', on);
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
