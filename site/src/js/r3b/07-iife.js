// 원본: src/r3-polish.js
/* r3-polish.js (10/22) — 디자이너·프론트엔드 점검에서 나온 다듬기
   ① 하단 탭바 항상 고정: 내리면 숨기던 것(site-motion)을 바로 되돌려요(그리기 전에 처리돼 깜빡임 없음). 모양은 r3-qa.css
   ② 1:1 문의 버튼: 모바일에서 푸터가 보이면 숨겨 푸터 링크를 가리지 않게(html.sf-at-foot)
   ③ 카드 나타나기: 화면에 들어오기 조금 전(아래 20%)부터 떠오르기 시작 → 빨리 스크롤해도 빈 칸이 안 보이게
   ④ 홈 '무료 라이브 강의': 다가오는 라이브를 날짜 순으로 먼저, 지난 라이브는 뒤로
   ⑤ 결제로 갔다가 뒤로 오면 브라우저가 '처리 중(빙글빙글)' 버튼까지 그대로 되살려요 → 빙글빙글이 남아 있으면 새로 불러오기(사장님 결정)
   ⑥ 768~1099px: 아임웹이 PC 화면 전체를 축소(body zoom)해서, '화면 끝까지 펴기'(--r2-vw)가 좁게 계산돼 배너·후기 카드 양옆이 잘렸음 → 축소 비율로 나눠 계산
   ⑦ 강의·라이브·모임 목록 카드(아임웹 상품 목록 칸 안): 처음 그려질 때 위 줄 → 아래 줄, 왼쪽 → 오른쪽 차례로 떠오르게
      (전에는 늦게 붙는 '스크롤 나타나기' 때문에 아래·오른쪽 카드가 먼저 뜨거나, 보였던 카드가 사라졌다 다시 떴음) */
(function () {
  var H = document.documentElement;
  // ⑦ 이 스크립트는 <head>에서 아임웹 상품 목록보다 먼저 실행돼요 — 목록 칸(그림자 DOM)이 만들어질 때 카드 순서 효과를 붙여요
  var CARD_CSS = '.iw-shop-card.sf-rv{opacity:1;transform:none;transition:none}' +
    '@keyframes sfCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}' +
    '.iw-shop-card.sf-cin{animation:sfCardIn .55s cubic-bezier(.2,.7,.2,1) both}' +
    // 순서는 목록의 몇 번째 칸인지로(목록이 그린 뒤 다시 정렬해도 늘 위 줄 → 아래 줄, 왼쪽 → 오른쪽)
    [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return '.iw-shop-card.sf-cin:nth-child(' + (k + 1) + '){animation-delay:' + k * 70 + 'ms}'; }).join('') +
    '.iw-shop-card.sf-cin:nth-child(n+10){animation-delay:560ms}' +
    '@media (prefers-reduced-motion:reduce){.iw-shop-card.sf-cin{animation:none}}';
  var AS = Element.prototype.attachShadow, sheet = null;
  try { sheet = new CSSStyleSheet(); sheet.replaceSync(CARD_CSS); } catch (e) { sheet = null; }
  function addSheet(r) { try { if (sheet && r.adoptedStyleSheets.indexOf(sheet) < 0) r.adoptedStyleSheets = r.adoptedStyleSheets.concat(sheet); } catch (e) {} }
  function cascade(r) {
    var fresh = [].filter.call(r.querySelectorAll('.iw-shop-card'), function (c) { return !c.classList.contains('sf-cin') && !c.classList.contains('sf-cin0'); });
    if (!fresh.length) return;
    addSheet(r);                                                     // 목록이 스타일 목록을 갈아 끼워도 다시 붙임
    fresh.forEach(function (c) { c.classList.add('sf-cin'); });
  }
  // fresh: 카드가 아직 화면에 그려지기 전이면 true(차례로 떠오르게), 이미 그려졌을 수 있으면 false(다시 숨기지 않게 — 깜빡임 방지)
  function prep(r, fresh) {
    if (!r || r.__sfp) return; r.__sfp = 1;
    addSheet(r);
    if (fresh) cascade(r); else [].forEach.call(r.querySelectorAll('.iw-shop-card'), function (c) { c.classList.add('sf-cin0'); });
    new MutationObserver(function () { cascade(r); }).observe(r, { childList: true, subtree: true });
  }
  if (AS && sheet) Element.prototype.attachShadow = function () { var r = AS.apply(this, arguments); try { prep(r, true); } catch (e) {} return r; };
  // 아임웹 상품 목록은 위 장치를 거치지 않고 칸을 만들어서, 매 화면(그리기 직전)마다 칸을 확인해요.
  // 직전 화면에 칸·카드가 없었다면 지금 카드는 아직 안 그려진 것 → 차례로 떠오르게
  var bare = new WeakSet();
  function watchHosts() {
    if (!sheet) return;
    var n = 0;
    (function tick() {
      var hs = document.querySelectorAll('.js-custom-widget-container'), left = 0;
      [].forEach.call(hs, function (h) {
        var r = h.shadowRoot;
        if (!r) { bare.add(h); left++; return; }
        if (r.__sfp) return;
        if (!r.querySelector('.iw-shop-card')) { bare.add(h); prep(r, true); return; }
        prep(r, bare.has(h));
      });
      if ((left || document.readyState === 'loading') && n++ < 900) requestAnimationFrame(tick);   // 목록 칸이 없는 페이지는 다 읽은 뒤 바로 끝
    })();
  }
  // 목록 칸은 빈 채로 먼저 생기고(약 1.2초) 카드는 나중에 들어와요 → 칸이 생기는 순간(호스트 안쪽이 바뀔 때) 바로 붙여요
  if (sheet && window.MutationObserver) {
    var hostMO = new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (t.classList && t.classList.contains('js-custom-widget-container') && t.shadowRoot) prep(t.shadowRoot, true); }   // 같은 작업 안이라 아직 안 그려짐
    });
    hostMO.observe(H, { childList: true, subtree: true });
    setTimeout(function () { hostMO.disconnect(); }, 20000);
  }
  watchHosts();
  document.addEventListener('sf:softnav', watchHosts);
  // ⑤
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (x) {}
    if (document.querySelector('.loading-spinner-container')) location.reload();
  });
  // ⑥
  var mine = '';
  function fixVw() {
    var b = document.body; if (!b) return;
    var z = parseFloat(getComputedStyle(b).zoom) || 1, cur = H.style.getPropertyValue('--r2-vw');
    if (Math.abs(z - 1) < 0.001) { if (mine && cur === mine) { mine = ''; H.style.setProperty('--r2-vw', H.clientWidth + 'px'); } return; }   // 축소가 풀리면 원래 값으로
    var v = (H.clientWidth / z).toFixed(2) + 'px';
    if (cur !== v) { mine = v; H.style.setProperty('--r2-vw', v); }
  }
  window.addEventListener('resize', function () { setTimeout(fixVw, 0); });
  document.addEventListener('sf:softnav', function () { setTimeout(fixVw, 0); });
  // ①
  function keepBar(bar) {
    new MutationObserver(function () { if (bar.classList.contains('is-hidden')) bar.classList.remove('is-hidden'); }).observe(bar, { attributes: true, attributeFilter: ['class'] });
  }
  new MutationObserver(function () { if (H.classList.contains('sf-tabbar-hidden')) H.classList.remove('sf-tabbar-hidden'); }).observe(H, { attributes: true, attributeFilter: ['class'] });
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var n = 0; (function find() { var b = document.querySelector('[data-sf-tabbar]'); if (b) keepBar(b); else if (n++ < 20) setTimeout(find, 300); })();
    // ②
    // ⑥ 다른 코드가 --r2-vw를 다시 넣거나 아임웹이 축소 비율을 바꾸면 바로 고쳐요
    fixVw(); window.addEventListener('load', fixVw);
    var mo6 = new MutationObserver(fixVw); mo6.observe(H, { attributes: true, attributeFilter: ['style'] }); mo6.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    var ft = document.getElementById('doz_footer_wrap');
    if (ft && window.IntersectionObserver) new IntersectionObserver(function (es) { H.classList.toggle('sf-at-foot', es[0].isIntersecting); }, { rootMargin: '0px 0px -40px 0px' }).observe(ft);
  });
  // ③
  if (window.IntersectionObserver) {
    var early = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); early.unobserve(en.target); } });
    }, { rootMargin: '0px 0px 20% 0px' });
    var seen = new WeakSet();
    var watch = function () { [].forEach.call(document.querySelectorAll('.sf-rv:not(.is-in)'), function (e) { if (!seen.has(e)) { seen.add(e); early.observe(e); } }); };
    window.addEventListener('load', function () { watch(); setTimeout(watch, 1500); });
    document.addEventListener('sf:softnav', function () { setTimeout(watch, 300); });
  }
  // ④
  function sortLive() {
    if (location.pathname !== '/' && location.pathname !== '/index') return;
    [].forEach.call(document.querySelectorAll('ul.sf-cards4'), function (ul) {
      var items = [].slice.call(ul.children), now = Date.now();
      var info = items.map(function (li) { var c = li.querySelector('[data-sf-live]') || (li.matches('[data-sf-live]') ? li : null); return c && { li: li, t: Date.parse(c.getAttribute('data-start')) || 0, past: c.getAttribute('data-status') === 'ended' || (Date.parse(c.getAttribute('data-end')) || 0) < now }; });
      if (info.some(function (x) { return !x; }) || info.length < 2) return;
      var next = info.filter(function (x) { return !x.past; }).sort(function (a, b) { return a.t - b.t; });
      var past = info.filter(function (x) { return x.past; }).sort(function (a, b) { return b.t - a.t; });
      next.concat(past).forEach(function (x) { ul.appendChild(x.li); });
    });
  }
  window.addEventListener('load', function () { sortLive(); setTimeout(sortLive, 1200); });
  document.addEventListener('sf:softnav', function () { setTimeout(sortLive, 300); });
})()
