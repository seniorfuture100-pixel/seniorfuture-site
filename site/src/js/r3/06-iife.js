// 원본: src/r3-sheet.js
/* r3-sheet.js — 모바일(≤767px) 교육 상세 '수강 옵션' 시트 (10/20)
   아임웹 옵션 시트(.opt-group)를 그대로 쓰고(결제 로직은 아임웹 그대로) 모양만 다듬어요.
   - 위에 '수강 옵션' 제목 + 닫기(X)
   - 옵션 없는 강의: 시트가 금액만 보여서, 강의 카드(이름·가격)를 한 장 넣어요
   - 시트 안 버튼 문구는 '결제 이동하기' */
(function () {
  // 10/21: 무료 라이브·모임 상세도 같은 모양 (제목·버튼 문구만 종류별로)
  var M = location.pathname.match(/^\/(course|live|community)\/?$/); if (!M) return;
  var KIND = M[1];
  var TITLE = { course: '수강 옵션', live: '신청 정보', community: '참여 옵션' }[KIND];
  var GO = KIND === 'live' ? '신청 이동하기' : '결제 이동하기';
  var BAR = { course: '수강 신청하기', live: '무료로 신청하기', community: '참여 신청하기' }[KIND];
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function txt(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }

  function dress() {
    var p = $('.sf-pv'); if (!p) return;
    $$('.buy_btns.mobile ._btn_buy').forEach(function (b) { if (b.textContent !== GO) b.textContent = GO; });
    $$('.buy_btns.mobile a.buy:not(._btn_buy), .buy_btns.mobile .defualt.buy:not(._btn_buy)').forEach(function (b) { if (!b.classList.contains('is-disabled') && clean(b.textContent) !== BAR && !/마감/.test(b.textContent)) b.textContent = BAR; });
    var g = $('.opt-group', p); if (!g) return;
    if (!$('.r3-sheet-h', g)) {
      var w = document.createElement('div');
      w.innerHTML = '<div class="r3-sheet-h"><b>' + TITLE + '</b><button type="button" class="r3-sheet-x" aria-label="닫기"></button></div>';
      var h = w.firstChild;
      g.insertBefore(h, $('.goods_wrap', g) || g.firstChild);
      $('.r3-sheet-x', h).addEventListener('click', function () {
        var c = $('.btn_clse', g); if (c) c.click();
        else if (window.SITE_SHOP_DETAIL && SITE_SHOP_DETAIL.hideMobileOptions) SITE_SHOP_DETAIL.hideMobileOptions();
      });
    }
    // 옵션 있는지: 아임웹 옵션 칸(.goods_select)에 글자가 있으면 옵션 강의
    var opt = $$('.goods_select', p).some(function (el) { return clean(el.textContent); });
    var pay = $('.goods_wrap .goods_payment', g), card = $('.r3-sheet__item', g);
    if (opt) { if (card) card.remove(); return; }
    if (pay && !card) {
      var t = $('.view_tit', p), tc = t ? t.cloneNode(true) : null;
      if (tc) $$('.ns-icon, img, i', tc).forEach(function (x) { x.remove(); });
      var name = clean(tc && tc.textContent).replace(/\s*SALE$/, '') || '선택한 상품';
      var price = clean(($('.pay_detail .real_price', p) || {}).textContent);
      if (/^0\s*원$/.test(price)) price = '무료';
      card = document.createElement('div'); card.className = 'r3-sheet__item';
      card.innerHTML = '<span>' + txt(name) + '</span><b>' + txt(price) + '</b>';
      pay.parentNode.insertBefore(card, pay);
    }
  }

  if (window.SFUI && SFUI.register) SFUI.register('r3Sheet', function () { dress(); setTimeout(dress, 800); setTimeout(dress, 2000); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.buy_btns.mobile')) { setTimeout(dress, 30); setTimeout(dress, 400); } }, true);
})()
