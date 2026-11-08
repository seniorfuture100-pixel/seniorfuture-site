// 원본: src/site-motion.js
/* 카드·이미지는 지연 없이 표시하고, 600px 이상 내리면 맨 위로 버튼을 보여요.
   동작 줄이기 설정에서는 맨 위로 이동할 때 부드러운 스크롤도 생략해요. */
SFUI.register('siteMotion', function (root) {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 카드와 이미지는 준비되는 대로 표시해요. 등장 지연과 전체 카드 위치 측정을 생략해요.
  if (root !== document || document.getElementById('sf-top')) return;
  var top = document.createElement('button');
  top.type = 'button'; top.id = 'sf-top'; top.className = 'sf-top'; top.setAttribute('aria-label', '맨 위로');
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6"/></svg>';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(top);
  // 하단 탭바는 항상 보이게(10/21 결정) — 스크롤 때 숨겼다 되살리던 코드는 페이지 전체를 매번 다시 계산하게 해서 PC 휠이 버벅였어요(10/23 삭제)
  var ticking = false, on = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var want = window.scrollY > 600;
      if (want !== on) { on = want; top.classList.toggle('is-on', on); }
      ticking = false;
    });
  }, { passive: true });
})
