/* sf-early.js — 첫 화면부터 꾸민 모습 (아임웹 원본이 한 번도 그려지지 않게)
   배치: 공통 코드 Header Code 맨 끝, 꾸밈 JS 묶음(sf-ui-js · sf-patch-js · sf-r2-js · sf-r3-js) 바로 뒤.
   ① 본문: MutationObserver 콜백은 화면을 그리기 전에 실행돼요. 본문·푸터를 다 읽은 순간 꾸밈을 한 번 돌려요.
      (모든 모듈은 두 번 돌아도 결과가 같아서 DOMContentLoaded 때 한 번 더 돌며 아임웹이 늦게 그린 부분을 맞춰요 — 10/19 확인)
   ② 상품 목록(아임웹이 나중에 그림자 DOM 안에 그리는 카드): 그림자 안이 바뀌면 곧바로 shop-list 꾸밈을 불러요.
      혹시 늦어도 원본 카드가 보이지 않게, 꾸밈이 끝날 때까지 목록 자리만 투명하게 두고(자리는 그대로), 4초 뒤엔 무조건 보여요. */
(function (d, w) {
  if (!w.SFUI || !w.MutationObserver) return;
  var html = d.documentElement;

  // ② 상품 목록 자리: 꾸밈 전엔 투명하게
  var st = d.createElement('style'); st.id = 'sf-early-css';
  st.textContent = 'html:not(.sf-shop-free) div.js-custom-widget-container:not([data-sf-shop]){visibility:hidden!important}';
  (d.head || html).appendChild(st);
  setTimeout(function () { html.classList.add('sf-shop-free'); }, 4000);
  var A = w.Element && Element.prototype.attachShadow;
  if (A && !A.__sf) {
    var kick = function () { var c = d.createComment('sf'); (d.body || html).appendChild(c); c.parentNode.removeChild(c); }; // shop-list 의 본문 감시를 깨워요
    Element.prototype.attachShadow = function (o) {
      var sr = A.call(this, o);
      try { if (this.classList && this.classList.contains('js-custom-widget-container')) new MutationObserver(kick).observe(sr, { childList: true, subtree: true }); } catch (e) {}
      return sr;
    };
    Element.prototype.attachShadow.__sf = 1;
  }

  // ① 본문
  var done = false, mo;
  function ready() { var f = d.getElementById('doz_footer_wrap'); return f && f.nextSibling; }
  function go() {
    if (done || !ready()) return;
    done = true; if (mo) mo.disconnect();
    w.SFUI.init(d);
    try { w.performance.mark('sf-early-init'); } catch (e) {}
  }
  mo = new MutationObserver(go);
  mo.observe(html, { childList: true, subtree: true });
  d.addEventListener('DOMContentLoaded', function () { if (mo) mo.disconnect(); });
})(document, window);
