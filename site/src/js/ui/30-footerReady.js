// 원본: v1.0.30 (2026-10-25) 런칭 점검
/* footerReady — 페이지 내용(아임웹 목록·상품)이 다 불러와질 때까지 푸터를 숨겨 두고, 높이가 멈추면 보여 줘요(css qa/07).
   load 뒤 문서 높이가 0.4초 동안 그대로면 보이고, 아무리 늦어도 3.5초 뒤에는 보여요. */
(function () {
  if (window.__sfFootReady) return;
  window.__sfFootReady = 1;
  var H = document.documentElement, t0 = Date.now(), last = -1, still = 0;
  function show() { H.classList.add('sf-ft-ready'); }
  function check() {
    if (H.classList.contains('sf-ft-ready')) return;
    var h = H.scrollHeight;
    if (h === last) still += 100; else { still = 0; last = h; }
    if (still >= 400 || Date.now() - t0 > 3500) return show();
    setTimeout(check, 100);
  }
  if (document.readyState === 'complete') check();
  else window.addEventListener('load', check);
  setTimeout(show, 3500);
})();
