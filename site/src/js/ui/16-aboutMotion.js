// 원본: src/about-motion.js
/* about-motion.js — 시니어퓨처 소개 페이지 움직임 4종
   ① 스크롤 등장      <div data-sf-reveal>…</div>  (data-delay="200" 으로 늦게 시작)
   ② 비전 문장 하나씩  <div data-sf-lines data-step="350"><p>문장1</p><p>문장2</p>…</div>
   ③ 숫자 올라가기     <strong data-sf-count="1200" data-suffix="명+">0</strong>  (data-duration="1600")
   ④ 연혁 진행선       <ol data-sf-timeline><li data-sf-timeline-item>…</li>…</ol>
                        안에 <span data-sf-timeline-bar></span> 를 하나 두면 스크롤에 따라 선이 채워져요
   ⑤ 히어로 천천히 확대 + 시차 스크롤
                        <section data-sf-hero data-speed="0.25"><img data-sf-hero-media src="…"></section>
   기기에서 '동작 줄이기'를 켠 방문자에게는 움직임 없이 바로 최종 모습을 보여 줘요. */
SFUI.register('aboutMotion', function (root) {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function whenVisible(el, fn, threshold) {
    if (reduce || !hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.2, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
  }

  // ① 스크롤 등장
  root.querySelectorAll('[data-sf-reveal]').forEach(function (el) {
    if (!SFUI.once(el, 'Reveal')) return;
    var delay = Number(el.getAttribute('data-delay') || 0);
    if (delay) el.style.transitionDelay = delay + 'ms';
    whenVisible(el, function () { el.classList.add('is-in'); });
  });

  // ② 비전 문장 하나씩
  root.querySelectorAll('[data-sf-lines]').forEach(function (box) {
    if (!SFUI.once(box, 'Lines')) return;
    var step = Number(box.getAttribute('data-step') || 350);
    var lines = Array.prototype.slice.call(box.children);
    lines.forEach(function (ln, i) { ln.classList.add('sf-line'); ln.style.transitionDelay = (reduce ? 0 : i * step) + 'ms'; });
    whenVisible(box, function () { box.classList.add('is-in'); }, 0.3);
  });

  // ③ 숫자 올라가기
  root.querySelectorAll('[data-sf-count]').forEach(function (el) {
    if (!SFUI.once(el, 'Count')) return;
    var target = Number(el.getAttribute('data-sf-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = Number(el.getAttribute('data-duration') || 1600);
    var decimals = (String(el.getAttribute('data-sf-count')).split('.')[1] || '').length;
    function show(v) { el.textContent = v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; }
    el.setAttribute('aria-label', target.toLocaleString('ko-KR') + suffix); // 화면 낭독기는 최종 값만 읽어요
    show(0);
    whenVisible(el, function () {
      if (reduce) { show(target); return; }
      var t0 = null;
      function tick(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        show(decimals ? target * eased : Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick); else show(target);
      }
      requestAnimationFrame(tick);
      setTimeout(function () { show(target); }, dur + 400); // 탭이 뒤에 있어 rAF가 멈춰도 최종 값은 보이게
    }, 0.5);
  });

  // ④ 연혁 진행선
  root.querySelectorAll('[data-sf-timeline]').forEach(function (tl) {
    if (!SFUI.once(tl, 'Timeline')) return;
    var bar = tl.querySelector('[data-sf-timeline-bar]');
    var items = Array.prototype.slice.call(tl.querySelectorAll('[data-sf-timeline-item]'));
    function update() {
      var r = tl.getBoundingClientRect(), mid = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
      if (bar) bar.style.transform = 'scaleY(' + (reduce ? 1 : p) + ')';
      items.forEach(function (it) { it.classList.toggle('is-active', reduce || it.getBoundingClientRect().top < mid); });
    }
    onScroll(update);
  });

  // ⑤ 히어로 천천히 확대 + 시차 스크롤
  root.querySelectorAll('[data-sf-hero]').forEach(function (hero) {
    if (!SFUI.once(hero, 'Hero')) return;
    var media = hero.querySelector('[data-sf-hero-media]');
    if (!media || reduce) return;
    var speed = Number(hero.getAttribute('data-speed') || 0.25);
    hero.classList.add('is-zooming');
    onScroll(function () {
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      media.style.setProperty('--sf-parallax', (-r.top * speed).toFixed(1) + 'px');
    });
  });

  function onScroll(fn) {
    var queued = false;
    function run() { queued = false; fn(); }
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener('resize', fn);
    fn();
  }
})
