// 원본: src/r3-payfree.js
/* r3-payfree.js (10/22) — 주문서에서 총 결제 금액이 0원(무료 라이브 등)이면 버튼을 '결제하기' 대신 '무료로 신청하기'로.
   아임웹 주문서는 React라 요소를 바꾸지 않고 글자 노드 값만 바꿔요. 금액이 바뀌면 다시 '결제하기'로 돌아가요. */
(function () {
  if (!/^\/shop_payment\/?$/.test(location.pathname)) return;
  function textNode(el) { return [].slice.call(el.childNodes).filter(function (c) { return c.nodeType === 3 && c.nodeValue.trim(); })[0]; }
  function run() {
    var root = document.getElementById('oms-shop-payment'); if (!root) return;
    var total = null, prod = null, totRow = null;
    // '이름' 칸 옆 금액 읽기(아임웹은 0원을 '무료'로 보여줘요)
    function amt(s) {
      var row = s.parentElement, t = row ? (row.textContent || '').replace(/\s+/g, '') : '', m = t.match(/([\d,]+)원/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : /무료$/.test(t) ? 0 : null;
    }
    [].slice.call(root.querySelectorAll('span, p, div')).forEach(function (s) {
      if (s.childElementCount) return;
      var v = (s.textContent || '').trim();
      if (total === null && /^총 (결제|주문)\s?금액$/.test(v)) { total = amt(s); totRow = s.parentElement; }
      else if (prod === null && /^상품\s?(금액|가격)$/.test(v)) prod = amt(s);
    });
    if (total === null) return;
    // (10/30 사장님) 무료 상품(상품 금액 0원)만 '무료'·'무료로 신청하기' — 쿠폰·적립금으로 0원이 된 유료 주문은 '0원'·'결제하기'
    if (total === 0 && prod > 0) {
      totRow && [].slice.call(totRow.querySelectorAll('*')).concat([totRow]).forEach(function (el) {
        var n = textNode(el); n && n.nodeValue.trim() === '무료' && (n.nodeValue = n.nodeValue.replace('무료', '0원'));
      });
      total = -1; // 아래 버튼은 '결제하기' 그대로(바뀌어 있으면 되돌림)
    }
    [].slice.call(root.querySelectorAll('button')).forEach(function (b) {
      var walk = b.childElementCount ? [].slice.call(b.querySelectorAll('*')).concat([b]) : [b];
      walk.forEach(function (el) {
        var n = textNode(el); if (!n) return;
        var v = n.nodeValue.trim();
        if (total === 0 && v === '결제하기') n.nodeValue = n.nodeValue.replace('결제하기', '무료로 신청하기');
        else if (total !== 0 && /^(무료로 )?신청하기$/.test(v)) n.nodeValue = n.nodeValue.replace(/(무료로 )?신청하기/, '결제하기');
      });
    });
  }
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 60); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', run);
})()
