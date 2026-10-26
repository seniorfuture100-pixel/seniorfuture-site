// 원본: v1.0.31 (2026-10-26)
/* pastProduct — 지난 행사·지난 기수(상품 표의 past) 상세: 가격 칸에 '지난 행사', 추천 수익 상자는 숨김(css qa/07)
   (10/26) 지난 기수는 아임웹 '품절된 상품입니다'·하단 '수강 신청하기' 버튼이 남아 있어 '모집 마감'으로 바꾸고 누를 수 없게 */
SFUI.register('pastProduct', function () {
  var idx = new URLSearchParams(location.search).get('idx');
  var it = idx && SFUI.shopItems ? SFUI.shopItems()[idx] : null;
  if (!it || !it.past) return;
  var label = '모집 마감'; // (10/26 2차) 모임·교육 모두 같은 회색 '모집 마감'
  document.documentElement.classList.add('sf-pv-past');
  [].forEach.call(document.querySelectorAll('.sf-pv *'), function (e) {
    if (!e.children.length && /^가격문의/.test(e.textContent.trim())) e.textContent = label;
    else if (!e.children.length && /^0\s*원$/.test(e.textContent.trim())) e.textContent = '무료'; // (10/26 2차) 무료였던 행사
  });
  function lock() {
    [].forEach.call(document.querySelectorAll('.buy_btns a.buy, .buy_btns ._btn_buy'), function (b) {
      if (b.textContent.trim() !== label) b.textContent = label;
      b.classList.add('is-disabled', 'sf-past-btn', 'r3-closed-btn');
      b.removeAttribute('onclick'); b.removeAttribute('href');
    });
  }
  lock(); setTimeout(lock, 800); setTimeout(lock, 2500);
})
