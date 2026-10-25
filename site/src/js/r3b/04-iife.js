// 원본: src/r3-partner.js
/* r3-partner.js (10/21) — 파트너 지원 랜딩(.r3ap) 동작. 코드 위젯 안 <script>는 아임웹이 지워서 공통 코드(sf-r3b-js)로 넣어요.
   ① 섹션 배경을 화면 끝까지 펴는 데 쓰는 --r2-vw(스크롤바 뺀 실제 폭) ② 내려가며 차례로 나타나기(4초 뒤엔 무조건 보임) */
(function () {
  function init() {
    var m = document.querySelector('.r3ap'); if (!m || m.__r3ap) return; m.__r3ap = 1;
    var H = document.documentElement;
    function vw() { H.style.setProperty('--r2-vw', H.clientWidth + 'px'); }
    vw(); window.addEventListener('resize', vw);
    var els = [].slice.call(m.querySelectorAll('.r3ap-rv'));
    function show(e) { e.classList.add('is-in'); }
    if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { els.forEach(show); return; }
    m.classList.add('r3ap-js');
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px 8% 0px' });
    els.forEach(function (e, i) { e.style.setProperty('--d', (i % 4) * 0.08 + 's'); io.observe(e); });
    setTimeout(function () { els.forEach(show); }, 4000);
  }
  window.__r3apInit = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})()
