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
    // 시트를 건너뛰는 중(r3-sheet-skip)엔 아래 바 글자를 바꾸지 않아요(잠깐 '신청 이동하기'로 바뀌어 보이지 않게)
    document.documentElement.classList.contains('r3-sheet-skip') || $$('.buy_btns.mobile ._btn_buy').forEach(function (b) { if (b.textContent !== GO) b.textContent = GO; });
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
  // (11/1 사장님) 옵션 없는 상품(무료 라이브 등, html.r3-noopt): 아래 바를 누르면 시트를 보여 주지 않고 바로 신청·결제 화면으로
  //   아임웹 시트가 0.6초 뒤에 올라와 한 번 더 눌러야 했어요. 시트는 아임웹이 그대로 열되(주문 준비) 안 보이게 두고, 열리면 안의 신청 버튼을 대신 눌러요.
  //   아임웹이 막거나(마감·로그인 등) 3초 안에 넘어가지 않으면 시트를 다시 보여 줘요
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.buy_btns.mobile .defualt.buy');
    var H = document.documentElement;
    if (!b || !H.classList.contains('r3-noopt') || b.classList.contains('is-disabled') || /마감/.test(b.textContent)) return;
    H.classList.add('r3-sheet-skip');
    var n = 0, back = function () { H.classList.remove('r3-sheet-skip'); };
    (function go() {
      var buy = $('.buy_btns.mobile ._btn_buy');
      if (buy && buy.offsetParent) return void (buy.click(), setTimeout(back, 3000));
      n++ < 30 ? setTimeout(go, 50) : back();
    })();
  });
})()
