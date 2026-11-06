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
      // (11/6) 상품 번호도 적어 둬요 → 완료 화면이 그 상품 글의 [톡방] 주소로 '소통방 입장' 버튼을 만들어요
      try { sessionStorage.setItem(KEY, kindNow() + '|' + Date.now() + '|' + (new URLSearchParams(location.search).get('idx') || '')); } catch (x) {}
    }, true);
    return;
  }
  var v = ''; try { v = sessionStorage.getItem(KEY) || ''; } catch (x) {}
  var m = /^(live|meet|course)\|(\d+)(?:\|(\d*))?$/.exec(v) || /^()(\d+)$/.exec(v); // 예전 표시(시각만)는 라이브
  var kind = m && Date.now() - +m[2] < 7200000 ? (m[1] || 'live') : 'order', pidx = kind !== 'order' && m[3] || '';
  var room = '/shop_mypage/?sf=room';
  // (10/29) 버튼은 모든 종류 같게 두 개: 홈으로 | 마이페이지(주황 → 나의 강의실 탭: 강의·라이브·모임이 모두 카드로 나와요)
  //   톡방은 상품에 [톡방]이 있을 때만 생겨서 문구에 약속하지 않아요
  var C = {
    live: { h: '신청이 완료됐어요!', p: '마이페이지에서 일시와 라이브 정보를 확인할 수 있어요.' },
    // (11/5 런런) 강의는 '나의 강의실 › 강의실 입장'으로 바로 들어요 → 버튼 이름도 그 일로
    course: { h: '수강 신청이 완료됐어요!', p: '나의 강의실에서 수강 기간을 확인하고 바로 들을 수 있어요.', b: '강의실 바로 가기' },
    meet: { h: '참여 신청이 완료됐어요!', p: '마이페이지에서 일시와 모임 정보를 확인할 수 있어요.' },
    order: { h: '주문이 완료됐어요!', p: '마이페이지에서 주문 내역을 확인할 수 있어요.' }
  }[kind];
  // (11/4) 비회원 주문은 마이페이지가 없어요 → 주문번호·연락처로 찾는 '비회원 주문배송 조회'(로그인 화면 아래 버튼)로 안내
  var guest = !/(^|;\s*)_imweb_login_state=Y/.test(document.cookie);
  if (guest) C = { h: C.h, p: '주문번호와 주문할 때 적은 연락처로 비회원 주문 조회에서 확인할 수 있어요. 주문번호를 꼭 적어 두세요.' };
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  // 아임웹 완료 화면의 '이름 · 값' 줄 읽기(주문번호 · 결제정보 · 결제금액)
  var val = function (host, re) {
    var lab = [].filter.call(host.querySelectorAll('*'), function (e) { return !e.children.length && re.test(clean(e.textContent)); })[0];
    var row = lab && lab.parentElement;
    return row ? clean(row.textContent).replace(clean(lab.textContent), '').trim() : '';
  };
  var paid0 = ''; try { paid0 = sessionStorage.getItem('sf-pay-free') || ''; } catch (x) {}
  // (11/2 사장님) 무료 신청(상품 0원 — 무료 라이브·모임)은 입금 안내가 있을 수 없어서, 아임웹이 주문을 그릴 때까지 기다리지 않고 완료 카드를 바로 보여요
  //   주문번호·금액 줄은 아임웹이 그리면 채워요
  var early = paid0 === '1' && kind !== 'order', c = null, filled = false;
  var make = function (host) {
    c = document.createElement('section');
    c.className = 'sf-done sf-done--' + kind; c.setAttribute('aria-labelledby', 'sf-done-h');
    c.innerHTML = '<span class="sf-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h1 id="sf-done-h">' + C.h + '</h1><p>' + C.p + '</p><dl class="sf-done-info" hidden></dl>' +
      '<div class="sf-done-btns"><a class="sf-done-home" href="/">홈으로</a><a class="sf-done-main" href="' + (guest ? '/login' : room) + '">' + (guest ? '주문 조회' : C.b || '마이페이지') + '</a></div>';
    host.parentNode.insertBefore(c, host);
    document.documentElement.classList.add('sf-done-on');
    // (11/6 사장님) 주문번호·결제 금액이 늦게 뜨던 것 → 무료 신청은 주소의 order_no 와 '무료'로 바로 채워요(아임웹이 그리면 같은 값으로 다시 채움)
    var on0 = (/^\d{12,20}$/.exec(new URLSearchParams(location.search).get('order_no') || '') || [])[0];
    early && on0 && rowsTo([['주문번호', on0], ['결제 금액', paid0 === '0' ? '0원' : '무료']]);
    // (11/6 사장님) 푸터는 페이지 전체 로드 뒤에 보이는데(ui/30) 완료 화면은 아임웹 결제 스크립트로 로드가 늦어요 → 카드가 자리를 잡으면 바로 보여요
    document.documentElement.classList.add('sf-ft-ready');
    chat();
  };
  var rowsTo = function (rows) {
    var dl = c.querySelector('.sf-done-info');
    dl.innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    dl.hidden = !rows.length;
  };
  // (11/6 사장님) 상품 글에 [톡방]이 있으면: 안내 문구를 톡방 입장 안내로 바꾸고, 홈으로·마이페이지 위에 노란 '소통방 입장' 한 줄
  var KK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6l-.9 3.5c-.1.4.3.7.7.5l4.1-2.7c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/></svg>';
  var chat = function () {
    if (!pidx || !SFUI.roomInfo) return;
    SFUI.roomInfo(pidx, function (o) {
      // (11/6 사장님) 라이브는 [톡방]이 아직 없어도 버튼을 보여요 — 그동안은 예시로 시니어퓨처 카카오톡 채널. 상품에 [톡방]을 넣으면 그 주소로 바뀌어요
      if (!/^https?:\/\//.test(o && o.chat || '')) o = kind === 'live' ? { chat: 'https://pf.kakao.com/_ZYaLG' } : null;
      if (!o || !c || c.querySelector('.sf-done-chat')) return;
      var btns = c.querySelector('.sf-done-btns'), a = document.createElement('a');
      a.className = 'sf-done-chat'; a.href = o.chat; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = KK + '소통방 입장';
      btns.parentNode.insertBefore(a, btns);
      o.chatPw && a.insertAdjacentHTML('beforebegin', '<p class="sf-done-pw">입장 비밀번호 <b>' + esc(o.chatPw) + '</b></p>');
      if (!guest) {
        c.querySelector('#sf-done-h').textContent = '신청이 완료되었습니다!';
        c.querySelector('#sf-done-h + p').innerHTML = '강의 안내는 톡방에서 제공드릴 예정이니<br>마감 전 꼭 바로 입장해주세요!';
      }
    });
  };
  var draw = function () {
    var host = document.getElementById('oms-shop-payment-complete');
    if (!host) return false;
    if (filled) return true;
    early && !c && make(host);
    if (!/주문번호/.test(host.textContent)) return false; // 아임웹이 아직 그리는 중
    filled = true;
    // (10/30) 방금 주문번호를 적어 둬요 → 나의 강의실이 아임웹 목록에 실릴 때까지 기다렸다 그려요(r3/04 r3Rooms)
    var on = (/(\d{12,20})/.exec(new URLSearchParams(location.search).get('order_no') || host.textContent) || [])[1];
    try { on && sessionStorage.setItem('sf-last-order', on + '|' + Date.now()); } catch (x) {}
    // 입금 안내는 아임웹 화면 그대로 — (10/30) 아임웹 화면은 처음부터 가려져 있어서(css patch/69) 이때만 보이게 풀어요
    if (/입금\s*(계좌|기한|은행)|가상\s*계좌|계좌\s*번호/.test(host.textContent)) {
      c && c.remove();
      document.documentElement.classList.remove('sf-done-on');
      return document.documentElement.classList.add('sf-done-off'), true;
    }
    var no = val(host, /^주문번호$/), how = val(host, /^결제\s*정보$/), amt = val(host, /^결제\s*금액$/);
    // (10/30) 0원은 '무료' — 단, 쿠폰·적립금으로 0원이 된 유료 주문은 '0원'(주문서 r3/07 이 적어 둔 값)
    /^(0\s*원|무료)$/.test(amt) && (amt = paid0 === '0' ? '0원' : '무료');
    var rows = [['주문번호', no], ['결제 금액', amt + (how && !/^무료/.test(how) ? ' · ' + how : '')]].filter(function (r) { return r[1]; });
    c || make(host);
    rows.length && rowsTo(rows);
    return true;
  };
  // 못 그리면(6초) 아임웹 화면을 보여 줘요 — 무료 신청 카드를 이미 띄웠으면 카드는 그대로 둬요
  if (!draw()) { var n = 0, iv = setInterval(function () { if (draw()) clearInterval(iv); else if (++n > 60) { clearInterval(iv); c || document.documentElement.classList.add('sf-done-off'); } }, 100); }
})()
