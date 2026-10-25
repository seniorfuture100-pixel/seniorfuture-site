// 원본: v1.0.31 (2026-10-26)
/* pastProduct — 지난 행사·지난 기수(상품 표의 past) 상세: 가격 칸에 '지난 행사', 추천 수익 상자는 숨김(css qa/07) */
SFUI.register('pastProduct', function () {
  var idx = new URLSearchParams(location.search).get('idx');
  var it = idx && SFUI.shopItems ? SFUI.shopItems()[idx] : null;
  if (!it || !it.past) return;
  document.documentElement.classList.add('sf-pv-past');
  [].forEach.call(document.querySelectorAll('.sf-pv *'), function (e) {
    if (!e.children.length && /^가격문의/.test(e.textContent.trim())) e.textContent = it.type === 'meet' ? '지난 행사' : '모집 마감';
  });
})
