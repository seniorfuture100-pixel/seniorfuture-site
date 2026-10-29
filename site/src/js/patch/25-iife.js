// 원본: src/hash-guard.js
// 무료 라이브 신청 완료 화면(Figma 13 시스템 화면): 상품 상세에서 신청 버튼을 누를 때 표시해 두고, 결제 완료 화면에서 카드로 바꿔 보여 줌
(function () {
  var KEY = 'sf-live-order', p = location.pathname.replace(/\/$/, '');
  var isLive = function () { return p === '/live' || /무료 ?LIVE/i.test(document.title); };
  if (p !== '/shop_payment_complete') {
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('a._btn_buy, ._btn_buy')) return;
      try { if (isLive()) sessionStorage.setItem(KEY, String(Date.now())); else sessionStorage.removeItem(KEY); } catch (x) {}
    }, true);
    return;
  }
  var t = 0; try { t = +sessionStorage.getItem(KEY) || 0; } catch (x) {}
  if (!t || Date.now() - t > 7200000) return;
  var site = window.SF_SITE || {}, chat = site.liveChat || '#';
  var draw = function () {
    var host = document.getElementById('oms-shop-payment-complete');
    if (!host || document.querySelector('.sf-done')) return !!host;
    var c = document.createElement('section');
    c.className = 'sf-done'; c.setAttribute('aria-labelledby', 'sf-done-h');
    c.innerHTML = '<span class="sf-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h1 id="sf-done-h">신청이 완료됐어요!</h1>' +
      '<p>강의 안내와 입장 링크는 오픈채팅방에서 드려요.<br>시작 전에 꼭 입장해 주세요!</p>' +
      '<a class="sf-done-main" href="' + chat + '"' + (chat === '#' ? ' data-sf-todo="오픈채팅 링크"' : ' target="_blank" rel="noopener"') + '>안내사항 확인하기 <span aria-hidden="true">→</span></a>' +
      '<div class="sf-done-sub"><a href="/shop_mypage/?sf=room">내 강의 보기</a><a href="/live">더 많은 강의 보기</a></div>';
    host.parentNode.insertBefore(c, host);
    document.documentElement.classList.add('sf-done-on');
    if (chat === '#') c.querySelector('.sf-done-main').addEventListener('click', function (e) { e.preventDefault(); if (SFUI.toast) SFUI.toast('오픈채팅 안내 링크는 곧 열려요'); });
    return true;
  };
  if (!draw()) { var n = 0, iv = setInterval(function () { if (draw() || ++n > 40) clearInterval(iv); }, 150); }
})()
