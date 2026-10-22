// 원본: src/r3-payfree.js
/* r3-payfree.js (10/22) — 주문서에서 총 결제 금액이 0원(무료 라이브 등)이면 버튼을 '결제하기' 대신 '무료로 신청하기'로.
   아임웹 주문서는 React라 요소를 바꾸지 않고 글자 노드 값만 바꿔요. 금액이 바뀌면 다시 '결제하기'로 돌아가요. */
(function () {
  if (!/^\/shop_payment\/?$/.test(location.pathname)) return;
  function textNode(el) { return [].slice.call(el.childNodes).filter(function (c) { return c.nodeType === 3 && c.nodeValue.trim(); })[0]; }
  function run() {
    var root = document.getElementById('oms-shop-payment'); if (!root) return;
    var total = null;
    [].slice.call(root.querySelectorAll('span, p, div')).some(function (s) {
      if (s.childElementCount === 0 && /^총 (결제|주문)\s?금액$/.test((s.textContent || '').trim())) {
        var row = s.parentElement, t = row ? (row.textContent || '').replace(/\s+/g, '') : '', m = t.match(/([\d,]+)원/);
        if (m) { total = parseInt(m[1].replace(/,/g, ''), 10); return true; }
        if (/무료$/.test(t)) { total = 0; return true; }      // 아임웹은 0원을 '무료'로 보여줘요
      }
      return false;
    });
    if (total === null) return;
    [].slice.call(root.querySelectorAll('button')).forEach(function (b) {
      var walk = b.childElementCount ? [].slice.call(b.querySelectorAll('*')).concat([b]) : [b];
      walk.forEach(function (el) {
        var n = textNode(el); if (!n) return;
        var v = n.nodeValue.trim();
        if (total === 0 && v === '결제하기') n.nodeValue = n.nodeValue.replace('결제하기', '무료로 신청하기');
        else if (total > 0 && v === '무료로 신청하기') n.nodeValue = n.nodeValue.replace('무료로 신청하기', '결제하기');
      });
    });
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 60); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', run);
})()
