// 원본: v1.0.17 (2026-10-25) 언론 기사 카드 계속 흐르기
/* pressFlow — 회사 소개 '언론에 소개된 시니어퓨처'(r2Press 가 만든 .r2-press__track)
   - 카드를 한 벌 더 붙여 왼쪽으로 천천히 끊김 없이 흐르게(초당 약 40px)
   - 마우스를 올리거나 손가락을 대면 멈춤, 끌어서 앞뒤로 넘기기 가능(끈 뒤에는 카드 링크가 열리지 않게)
   - 화면 밖이거나 '움직임 줄이기' 설정이면 멈춤. 화면 바꾸기(sf:softnav) 뒤에도 다시 붙음 */
(function () {
  if (window.__sfPressFlow) return;
  window.__sfPressFlow = 1;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setup() {
    var tr = document.querySelector('.r2-press__track');
    if (!tr || tr.__flow) return !!tr;
    var items = [].slice.call(tr.children);
    if (items.length < 2) return true;
    tr.__flow = 1;
    tr.closest('.r2-press').classList.add('r2-press--flow');
    tr.scrollLeft = 0;
    items.forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1; tr.appendChild(k); });
    var first = tr.children[items.length];
    var off = 0, last = 0, hover = false, seen = true, drag = null, moved = 0, SPEED = 0.04;
    function span() { return first.offsetLeft - items[0].offsetLeft; }
    function draw() { var h = span(); if (h > 0) off = ((off % h) + h) % h; tr.style.transform = 'translate3d(' + (-off) + 'px,0,0)'; }
    function step(t) {
      if (!tr.isConnected) return;
      var dt = last ? Math.min(t - last, 50) : 0; last = t;
      if (!hover && !drag && seen && !reduce && !document.hidden) off += SPEED * dt;
      draw(); requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; }).observe(tr.parentNode);
    tr.addEventListener('mouseenter', function () { hover = true; });
    tr.addEventListener('mouseleave', function () { hover = false; });
    tr.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      drag = { x: e.clientX, o: off, t: e.pointerType }; moved = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) tr.classList.add('is-drag');
      off = drag.o - dx;
    }, { passive: true });
    function end() { if (!drag) return; drag = null; tr.classList.remove('is-drag'); }
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    tr.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    tr.addEventListener('dragstart', function (e) { e.preventDefault(); });
    requestAnimationFrame(step);
    return true;
  }
  function tryLater() { var n = 0; (function go() { if (setup() || ++n > 20) return; setTimeout(go, 250); })(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryLater); else tryLater();
  document.addEventListener('sf:softnav', function () { setTimeout(tryLater, 200); });
})();
