// 원본: v1.0.34 (2026-10-26)
/* hiddenProducts — 아임웹에서 '숨김'으로 바꾼 예시 상품(교육 3~10·11기 28, 모임 15~22)으로 가는 코드 카드(홈 BEST·추천 강의 등)를 빼요.
   카드가 다 빠진 목록은 그 구역째 숨겨요. 실제 상품이 다시 생기면 번호를 여기서 지우면 돼요. */
SFUI.register('hiddenProducts', function (root) {
  var H = { 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 28: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1 };
  [].forEach.call((root || document).querySelectorAll('.sf-scope a[href*="idx="], .sf-pv a[href*="idx="]'), function (a) {
    var m = /\/(course|community)\/?\?idx=(\d+)/.exec(a.getAttribute('href') || '');
    if (!m || !H[m[2]]) return;
    var li = a.closest('li') || a, list = li.parentElement;
    li.remove();
    if (list && !list.querySelector('a[href]')) {
      var sec = list.closest('section') || list;
      sec.hidden = true;
    }
  });
})
