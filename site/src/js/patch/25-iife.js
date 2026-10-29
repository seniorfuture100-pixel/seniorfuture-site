// 원본: src/hash-guard.js
// 신청·결제 완료 화면(Figma 13 시스템 화면): 상품 상세에서 신청 버튼을 누를 때 종류(강의·라이브·모임)를 표시해 두고, 결제 완료 화면에서 카드로 바꿔 보여 줌
//   (10/29) 무료 라이브만 있던 카드를 강의·모임·결제까지 하나로 — 아임웹 기본 완료 화면(검은 버튼·주소 칸)은 숨기고, 주문번호·결제 금액은 카드 안에 옮겨 보여요
//   무통장·가상계좌처럼 입금 안내(계좌번호)가 있는 주문은 아임웹 화면을 그대로 둬요(입금 정보를 놓치지 않게)
(function () {
  var KEY = 'sf-live-order', p = location.pathname.replace(/\/$/, '');
  var kindNow = function () {
    if (p === '/live' || /무료 ?LIVE/i.test(document.title)) return 'live';
    if (p === '/community') return 'meet';
    return 'course';
  };
  if (p !== '/shop_payment_complete') {
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('a._btn_buy, ._btn_buy')) return;
      try { sessionStorage.setItem(KEY, kindNow() + '|' + Date.now()); } catch (x) {}
    }, true);
    return;
  }
  var v = ''; try { v = sessionStorage.getItem(KEY) || ''; } catch (x) {}
  var m = /^(live|meet|course)\|(\d+)$/.exec(v) || /^()(\d+)$/.exec(v); // 예전 표시(시각만)는 라이브
  var kind = m && Date.now() - +m[2] < 7200000 ? (m[1] || 'live') : 'order';
  var room = '/shop_mypage/?sf=room';
  // (10/29) 버튼은 모든 종류 같게: 나의 강의실(주황) / 홈으로 · 결제 내역
  var BT = { main: ['나의 강의실', room], sub: [['홈으로', '/'], ['결제 내역', '/shop_mypage/?m2=order']] };
  var C = {
    live: { h: '신청이 완료됐어요!', p: '강의 안내와 입장 링크는 나의 강의실과 오픈채팅방에서 드려요.<br>시작 전에 꼭 확인해 주세요!' },
    course: { h: '수강 신청이 완료됐어요!', p: '나의 강의실에서 수강 기간과 강의실을 확인할 수 있어요.<br>자료와 소식은 강의 톡방에서 안내드려요.' },
    meet: { h: '참여 신청이 완료됐어요!', p: '모임 일시와 장소는 나의 강의실과 모임 정보에서 확인할 수 있어요.' },
    order: { h: '주문이 완료됐어요!', p: '주문 내역은 마이페이지 › 결제 내역에서 확인할 수 있어요.' }
  }[kind];
  C.main = BT.main; C.sub = BT.sub;
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  // 아임웹 완료 화면의 '이름 · 값' 줄 읽기(주문번호 · 결제정보 · 결제금액)
  var val = function (host, re) {
    var lab = [].filter.call(host.querySelectorAll('*'), function (e) { return !e.children.length && re.test(clean(e.textContent)); })[0];
    var row = lab && lab.parentElement;
    return row ? clean(row.textContent).replace(clean(lab.textContent), '').trim() : '';
  };
  var draw = function () {
    var host = document.getElementById('oms-shop-payment-complete');
    if (!host || document.querySelector('.sf-done')) return !!host;
    if (!/주문번호/.test(host.textContent)) return false; // 아임웹이 아직 그리는 중
    if (/입금\s*(계좌|기한|은행)|가상\s*계좌|계좌\s*번호/.test(host.textContent)) return true; // 입금 안내는 아임웹 화면 그대로
    var no = val(host, /^주문번호$/), how = val(host, /^결제\s*정보$/), amt = val(host, /^결제\s*금액$/);
    var rows = [['주문번호', no], ['결제 금액', amt + (how && !/^무료/.test(how) ? ' · ' + how : '')]].filter(function (r) { return r[1]; });
    var c = document.createElement('section');
    c.className = 'sf-done sf-done--' + kind; c.setAttribute('aria-labelledby', 'sf-done-h');
    c.innerHTML = '<span class="sf-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h1 id="sf-done-h">' + C.h + '</h1><p>' + C.p + '</p>' +
      (rows.length ? '<dl class="sf-done-info">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      '<a class="sf-done-main" href="' + C.main[1] + '">' + C.main[0] + ' <span aria-hidden="true">→</span></a>' +
      '<div class="sf-done-sub">' + C.sub.map(function (s) { return '<a href="' + s[1] + '">' + s[0] + '</a>'; }).join('') + '</div>';
    host.parentNode.insertBefore(c, host);
    document.documentElement.classList.add('sf-done-on');
    return true;
  };
  if (!draw()) { var n = 0, iv = setInterval(function () { if (draw() || ++n > 40) clearInterval(iv); }, 150); }
})()
