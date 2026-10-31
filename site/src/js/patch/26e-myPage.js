// (10/31 사장님) 마이페이지 정리 — 나의 강의실 = "갈 곳·볼 것", 결제 내역 = "낸 돈"
//   ① 같은 이름 화면이 둘씩 있던 것 → 하나로: /classroom → 나의 강의실(?sf=room) · 아임웹 결제 내역(?m2=order, 상세 제외) → 결제 내역(?sf=orders)
//   ② 결제 내역: 주문 1건 = 카드 1장 · 처음부터 0원인 신청(무료 라이브·무료 모임)은 빼고, 쿠폰·적립금으로 0원이 된 유료 주문은 보여요
//      금액·할인·결제수단·입금 계좌는 아임웹 주문 상세와 같은 곳(api.oms.imweb.me, 고객 본인 로그인)에서 받아요
//   ③ 나의 강의실: 다음 일정 · 탭(전체/교육/무료 라이브/커뮤니티) · 지난 일정 접기 · 입금 대기 카드 (목록은 r3/04 r3Rooms 가 그리고 여기서 정리)
(function () {
  var pv = /preview_mode=1/.test(location.search) ? 'preview_mode=1' : '';
  var withPv = function (u) { return pv ? u + (u.indexOf('?') < 0 ? '?' : '&') + pv : u; };
  var path = location.pathname.replace(/\/$/, ''), qs = new URLSearchParams(location.search);
  // ① 화면 하나로
  if (path === '/classroom') return void location.replace(withPv('/shop_mypage/?sf=room'));
  if (path === '/shop_mypage' && qs.get('m2') === 'order' && !qs.get('order_no')) return void location.replace(withPv('/shop_mypage/?sf=orders'));
  SFUI.register('myLinks', function (root) {
    [].forEach.call(root.querySelectorAll('a[href]'), function (a) {
      var h = a.getAttribute('href');
      if (/^\/classroom\/?(\?|$)/.test(h)) a.setAttribute('href', withPv('/shop_mypage/?sf=room'));
      else if (/^\/shop_mypage\/?\?m2=order(&preview_mode=1)?$/.test(h)) a.setAttribute('href', withPv('/shop_mypage/?sf=orders'));
    });
  });

  // (10/31 사장님) 주문 상세 위 '← 결제 내역' 링크는 뺐어요 — 아임웹 ← 화살표가 결제 내역(?m2=order → ?sf=orders)으로 가요

  // (10/31) 카카오 말풍선(소통방 입장 버튼) · 남은 시간 글자(D-12 / 3시간 20분 남음 / 진행 중)
  SFUI.KAKAO = '<svg class="sf-kakao-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6l-.9 3.5c-.1.4.3.7.7.5l4.1-2.7c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8s-4.5-8-10-8z"/></svg>';
  SFUI.roomLeft = function (at) {
    at = +at || 0;
    if (!at) return '';
    var ms = at - Date.now();
    if (ms <= 0) return ms > -2 * 36e5 ? '진행 중' : '';
    var dd = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
    if (dd > 0) return 'D-' + dd;
    var h = Math.floor(ms / 36e5), mi = Math.floor(ms % 36e5 / 6e4);
    return (h ? h + '시간 ' : '') + (mi || !h ? Math.max(mi, 1) + '분 ' : '') + '남음';
  };
  // (10/31) 같은 상품 글을 동시에 여러 번 받지 않게(나의 강의실이 두 번 그릴 때 등) — 받는 중이면 기다렸다 같은 결과를 줘요
  if (SFUI.roomInfo && !SFUI.roomInfo.__q) {
    var rawInfo = SFUI.roomInfo, Q = {};
    SFUI.roomInfo = function (idx, done) {
      if (Q[idx]) return void Q[idx].push(done);
      Q[idx] = [done];
      rawInfo(idx, function (o) { var l = Q[idx] || []; delete Q[idx]; l.forEach(function (f) { try { f(o); } catch (e) {} }); });
    };
    SFUI.roomInfo.__q = 1;
  }
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var won = function (n) { return (Math.round(+n || 0)).toLocaleString('ko-KR') + '원'; };
  var W = '일월화수목금토';
  var md = function (t, hm) { var d = new Date(t); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + W.charAt(d.getDay()) + ')' + (hm ? ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') : ''); };
  var METHOD = { OPM01: '무통장입금', OPM02: '신용카드', OPM03: '가상계좌', OPM04: '실시간계좌이체', OPM05: '휴대폰결제', OPM06: '', OPM07: '카카오페이', OPM08: '네이버페이' };

  // 주문 상세(고객 본인) — 아임웹 주문 상세 화면이 쓰는 것과 같은 주소
  var tok = null, cache = {};
  // (10/31) 주문 상세도 이 탭에 10분 저장(입금 대기는 바뀔 수 있어 저장 안 함) · 주문 상세 화면에 다녀오면 그 주문은 다시 받아요
  var OK = 'sf_oms1_', ordNo = qs.get('order_no');
  ordNo && function () { try { sessionStorage.removeItem(OK + ordNo); } catch (x) {} }();
  SFUI.omsOrder = function (no) {
    if (cache[no]) return cache[no];
    var S = null;
    try { S = JSON.parse(sessionStorage.getItem(OK + no) || 'null'); } catch (x) {}
    if (S && Date.now() - S.at < 6e5) return (cache[no] = Promise.resolve(S.d));
    return (cache[no] = omsFetch(no).then(function (d) {
      var p = d && (d.payments || [])[0] || {};
      // 저장은 화면에 쓰는 금액·상태·상품만(주문자·연락처·계좌 같은 개인정보는 저장 안 함)
      d && p.statusCd !== 'OPS01' && function () { try { sessionStorage.setItem(OK + no, JSON.stringify({ at: Date.now(), d: slim(d) })); } catch (x) {} }();
      return d;
    }));
  };
  function slim(d) {
    var o = {};
    ['paymentPrice', 'baseItemPrice', 'itemPrice', 'itemCouponDiscount', 'deliveryCouponDiscount', 'itemPointAmount', 'deliveryPointAmount', 'givePoint', 'pgCancelPrice'].forEach(function (k) { o[k] = d[k]; });
    o.orderSections = (d.orderSections || []).map(function (s) { return { statusCd: s.statusCd }; });
    o.payments = (d.payments || []).slice(0, 1).map(function (p) { return { methodCd: p.methodCd, statusCd: p.statusCd }; });
    o.orderItems = (d.orderItems || []).map(function (x) { return { prodName: x.prodName, prodNo: x.prodNo, itemPrice: x.itemPrice, imageUrls: (x.imageUrls || []).slice(0, 1) }; });
    return o;
  }
  function omsFetch(no) {
    tok = tok || fetch('/ajax/oms/OMS_auth.cm', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { return j && j['tok' + 'en']; });
    return (tok.then(function (k) {
      if (!k) return null;
      return fetch('https://api.oms.imweb.me/customer/v1/orders/' + encodeURIComponent(no), { headers: { Authorization: 'Bearer ' + k } }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { return j && j.data || null; });
    })['catch'](function () { return null; }));
  };

  // 목록 줄의 아임웹 상태 글 → 고객이 알아듣는 5가지
  function stateOf(items) {
    var s = items.map(function (x) { return x.status || ''; }).join(' ');
    if (/입금\s*대기|입금대기/.test(s)) return ['wait', '입금 대기'];
    if (items.every(function (x) { return /취소|반품|환불/.test(x.status); })) {
      if (/요청|접수|진행/.test(s)) return ['ing', '취소 진행 중'];
      return /환불/.test(s) ? ['cancel', '환불 완료'] : ['cancel', '취소 완료'];
    }
    if (/취소\s*요청|반품\s*요청|취소\s*접수|반품\s*접수/.test(s)) return ['ing', '취소 진행 중'];
    return ['paid', '결제 완료'];
  }
  var isZero = function (p) { return /^0\s*원$/.test(String(p || '').trim()); };
  var typeOf = function (x) {
    var it = (SFUI.shopItems && SFUI.shopItems() || {})[x.idx] || {};
    return it.type || (/LIVE|라이브/i.test(x.name) ? 'live' : /\[\d{4}\/\d{1,2}\/\d{1,2}/.test(x.name) ? 'meet' : 'course');
  };

  // ② 결제 내역
  SFUI.register('sfOrders', function (root) {
    var box = root.querySelector('[data-sf-orders]');
    if (!box || !SFUI.once(box, 'SfOrders') || !SFUI.myOrders) return;
    SFUI.myOrders().then(function (L) {
      var by = {}, order = [];
      L.forEach(function (x) { by[x.no] || (by[x.no] = [], order.push(x.no)); by[x.no].push(x); });
      // (10/31 사장님) 무료 신청(0원)도 모두 보여요
      var list = order;
      if (!list.length) return void (box.innerHTML = '<div class="r2-my-load">아직 결제·신청한 내역이 없어요.</div>');
      // (10/31) 상세(금액·상태)를 먼저 받고 그려요 — 목록 값으로 먼저 그리면 금액·상태가 바뀌며 깜빡였고,
      //   아임웹 목록은 '입금 전 취소'한 주문을 '입금대기'로 내려 줘서 계좌가 잘못 보였어요. 6초 안에 못 받으면 목록 값으로
      var D = {}, k = 0, done = false;
      var render = function () {
        if (done) return; done = true;
        box.innerHTML = '<ul class="sf-oc-list">' + list.map(function (no) { return card(no, by[no], D[no]); }).join('') + '</ul>';
        [].forEach.call(box.querySelectorAll('.sf-oc'), function (li) { var d = D[li.getAttribute('data-no')]; d && fill(li, d); });
      };
      var left = list.length, next = function () {
        if (k >= list.length) return;
        var no = list[k++];
        SFUI.omsOrder(no).then(function (d) { D[no] = d; --left || render(); next(); });
      };
      box.innerHTML = '<div class="r2-my-load">결제 내역을 불러오는 중…</div>';
      for (var i = 0; i < 4; i++) next();
      setTimeout(render, 3500); // (10/31) 6초 → 3.5초: 늦은 상세는 목록 값으로
      box.addEventListener('click', function (e) {
        var c = e.target.closest('.sf-oc__copy');
        if (c) {
          var v = c.getAttribute('data-v'), ok = function () { SFUI.toast ? SFUI.toast('계좌번호를 복사했어요') : (c.textContent = '복사됨'); };
          navigator.clipboard ? navigator.clipboard.writeText(v).then(ok, function () { c.textContent = v; }) : (c.textContent = v);
        }
      });
    })['catch'](function () {
      box.innerHTML = '<div class="r2-my-load">결제 내역을 불러오지 못했어요. <a href="">다시 불러오기</a></div>';
    });
    // 상태: 상세가 있으면 상세 기준(상품 상태 OSS07=취소 완료 · 결제 상태 OPS01=입금 대기), 없으면 목록 글
    function stateApi(items, d) {
      if (!d) return stateOf(items);
      var sec = (d.orderSections || []).map(function (s) { return s.statusCd; }), p = (d.payments || [])[0] || {};
      var s = items.map(function (x) { return x.status || ''; }).join(' ');
      if (sec.length && sec.every(function (c) { return c === 'OSS07'; })) return /환불/.test(s) || +d.pgCancelPrice > 0 ? ['cancel', '환불 완료'] : ['cancel', '취소 완료'];
      if (p.statusCd === 'OPS01') return ['wait', '입금 대기']; // 입금대기 줄의 '부분 취소는 입금 완료 후 진행…' 안내를 취소로 읽지 않게 먼저
      if (/(취소|반품|환불)\s*(요청|접수)/.test(s)) return ['ing', '취소 진행 중'];
      return ['paid', '결제 완료'];
    }
    function card(no, items, d) {
      var st = stateApi(items, d), first = items[0], oi = d && d.orderItems || [];
      var name = function (s) { return String(s || '').replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, ''); };
      var title = name(first.name) || (oi[0] && oi[0].prodName) || '', more = Math.max(items.length, oi.length) - 1;
      var img = first.img || (oi[0] && (oi[0].imageUrls || [])[0]) || '';
      var sum = d ? +d.paymentPrice || 0 : items.reduce(function (a, x) { return a + (+String(x.price).replace(/[^\d]/g, '') || 0); }, 0);
      var detail = withPv('/shop_mypage/?m2=order&idx=' + no + '&order_no=' + no);
      var conf = items.every(function (x) { return /구매\s*확정/.test(x.status); });
      return '<li class="sf-oc is-' + st[0] + '" data-no="' + esc(no) + '"' + (conf ? ' data-conf="1"' : '') + '>' +
        '<div class="sf-oc__top"><span class="sf-oc__st">' + st[1] + '</span><span class="sf-oc__date">' + esc((first.date || '').replace(/-/g, '.')) + '</span><span class="sf-oc__no">주문번호 ' + esc(no) + '</span></div>' +
        '<div class="sf-oc__body"><span class="sf-oc__th"' + (img ? ' style="background-image:url(\'' + esc(img).replace(/'/g, '') + '\')"' : '') + '></span>' +
        '<div class="sf-oc__tx"><strong>' + esc(title) + (more > 0 ? ' <em>외 ' + more + '건</em>' : '') + '</strong><p class="sf-oc__sum"><b>' + won(sum) + '</b><span class="sf-oc__how"></span></p></div></div>' +
        '<div class="sf-oc__bank" hidden></div>' +
        '<div class="sf-oc__act">' + // (10/31 사장님) '결제 상세' 펼치기는 뺐어요 — 금액·할인은 주문 상세에서
        // (10/31 사장님) 버튼은 '주문 상세' 하나 — 취소·영수증·현금영수증은 아임웹 주문 상세 안에 있어요
        '<a class="sf-oc__btn" href="' + detail + '">주문 상세</a></div></li>';
    }
    function fill(li, D) {
      var p = (D.payments || [])[0] || {}, how = METHOD[p.methodCd] || '', paid = +D.paymentPrice || 0;
      var cp = (+D.itemCouponDiscount || 0) + (+D.deliveryCouponDiscount || 0), pt = (+D.itemPointAmount || 0) + (+D.deliveryPointAmount || 0);
      var st = (li.className.match(/is-(wait|paid|cancel|ing)/) || [])[1], gp = +D.givePoint || 0, confirmed = li.hasAttribute('data-conf');
      !how && !paid && (pt || cp) && (how = pt ? '적립금 결제' : '쿠폰 결제');
      !how && !paid && !pt && !cp && (how = '무료 신청');
      li.querySelector('.sf-oc__how').textContent = [how, gp && st === 'paid' ? '적립 ' + won(gp) + (confirmed ? '' : ' 예정') : ''].filter(Boolean).map(function (s) { return ' · ' + s; }).join('');
      // 입금 전에 취소한 주문(결제 상태 대기·취소, 카드 취소 금액 없음)은 낸 돈이 없어요 · (10/31) 금액 내역 칸은 뺐어요(주문 상세에서)
      var unpaid = st === 'cancel' && /^(OPS01|OPS08)$/.test(p.statusCd) && !(+D.pgCancelPrice > 0);
      unpaid && (li.querySelector('.sf-oc__how').textContent = ' · 입금 전 취소');
      // 입금 대기: 계좌·금액·마감 (마감이 지났으면 곧 자동 취소된다고 알려요 — 쇼핑 설정 '24시간 미입금 자동 취소')
      var bt = p.paymentBankTransfer, exp = bt && Date.parse(bt.expireTime), over = exp && Date.now() > exp;
      if (st === 'wait' && bt && bt.bankAccount) {
        var bx = li.querySelector('.sf-oc__bank');
        bx.innerHTML = over ? '<p><em>입금 기한(' + md(exp, 1) + ')이 지났어요.</em> 이 주문은 곧 자동으로 취소돼요. 다시 신청해 주세요.</p>' :
          '<p><b>' + esc(bt.bankName) + ' ' + esc(bt.bankAccount) + '</b> <span>' + esc(bt.accountHolderName || '') + '</span>' +
          '<button type="button" class="sf-oc__copy" data-v="' + esc(bt.bankAccount) + '">계좌 복사</button></p>' +
          '<p>' + won(paid) + (exp ? ' · <em>' + md(exp, 1) + '까지</em> 입금해 주세요' : '') + (bt.depositor ? ' · 입금자명 ' + esc(bt.depositor) : '') + '</p>';
        bx.classList.toggle('is-over', !!over);
        bx.hidden = false;
      }
    }
  });

  // ③ 나의 강의실 정리 (r3Rooms 가 카드를 그리고 정보가 채워질 때마다 불러요)
  var TABS = [['all', '전체'], ['course', '교육'], ['live', '무료 라이브'], ['meet', '커뮤니티']];
  SFUI.roomTidy = function (t, rows, L) {
    var ul = t.querySelector('ul.sf-rooms');
    if (!ul) { // 신청한 것이 없을 때도 입금 대기 카드는 보여요
      if (!pendings(L).length) return;
      t.innerHTML = '<ul class="sf-hub-list r3-ord-list sf-rooms"></ul>'; ul = t.firstChild;
    }
    // 입금 대기 카드(한 번만)
    if (!ul.__sfPend) { // 목록을 다시 그리면 ul 이 새로 생겨요 → 입금 대기 카드도 다시
      ul.__sfPend = 1;
      pendings(L).forEach(function (x) {
        var ty = typeOf(x), li = document.createElement('li');
        li.className = 'sf-hub-card r3-ord sf-room-card is-pending'; li.setAttribute('data-ty', ty);
        li.innerHTML = '<div class="sf-hub-thumb" style="background:#f2f3f6 center/cover no-repeat url(\'' + esc(x.img).replace(/'/g, '') + '\')"></div><div><div class="sf-room-meta"><small>' + (ty === 'live' ? '무료 라이브' : ty === 'meet' ? '모임' : '교육') + '</small><span class="sf-badge sf-badge--neutral">입금 대기</span></div><h2>' + esc(x.name.replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, '')) + '</h2><p class="sf-room-when">입금이 확인되면 열려요</p></div>' +
          '<div class="sf-hub-side"><a class="sf-btn sf-btn--outline sf-btn--l r3-ord__go" href="' + withPv('/shop_mypage/?sf=orders') + '">입금 계좌 보기</a></div>';
        ul.appendChild(li);
        // 입금 대기 주문은 목록에 이름·사진이 비어 와요 → 주문 상세에서
        // (10/31) 아임웹 목록은 '입금 전 취소'한 주문도 '입금대기'로 줘요 → 상세로 확인해서 아니면 빼요
        SFUI.omsOrder(x.no).then(function (D) {
          if (!D) return;
          var sec = (D.orderSections || []).map(function (s) { return s.statusCd; }), p = (D.payments || [])[0] || {};
          if ((sec.length && sec.every(function (c) { return c === 'OSS07'; })) || p.statusCd !== 'OPS01') { li.remove(); SFUI.roomTidy(t, rows, L); return; }
          var oi = (D.orderItems || [])[0]; if (!oi || x.name.trim()) return;
          li.querySelector('h2').textContent = oi.prodName;
          var u = (oi.imageUrls || [])[0]; u && (li.querySelector('.sf-hub-thumb').style.backgroundImage = 'url(\'' + String(u).replace(/'/g, '') + '\')');
          var it = (SFUI.shopItems && SFUI.shopItems() || {})[oi.prodNo] || {}, ty2 = it.type || typeOf({ idx: oi.prodNo, name: oi.prodName });
          li.setAttribute('data-ty', ty2); li.querySelector('small').textContent = ty2 === 'live' ? '무료 라이브' : ty2 === 'meet' ? '모임' : '교육';
        });
      });
    }
    // 판매가 끝난 강의(상세를 못 읽음)는 지난 일정으로
    [].forEach.call(ul.parentNode.querySelectorAll('.sf-room-card'), function (li) {
      var w = li.querySelector('.sf-room-when');
      if (w && /불러오지 못했어요/.test(w.textContent)) {
        w.textContent = '판매가 끝난 강의예요. 궁금한 점은 고객센터로 문의해 주세요.';
        var g = li.querySelector('.r3-ord__go'); g && g.remove();
        li.classList.add('is-end');
      }
    });
    // (10/31 사장님) 상태 칸 색을 상황마다(디자인 가이드 색): 수강 중·진행 중 초록 · 예정(신청 완료·참여 예정·개강 전) 주황 · 입금 대기 진회색 · 종료 회색
    [].forEach.call(t.querySelectorAll('.sf-room-meta .sf-badge'), function (b) {
      var s = b.textContent;
      b.setAttribute('data-tone', /수강 중|진행 중/.test(s) ? 'on' : /입금/.test(s) ? 'wait' : /종료/.test(s) ? 'end' : 'plan');
    });
    // 지난 일정 접기
    var past = t.querySelector('.sf-room-past');
    if (!past) {
      past = document.createElement('details'); past.className = 'sf-room-past';
      past.innerHTML = '<summary>지난 일정 <b>0</b></summary><ul class="sf-hub-list r3-ord-list"></ul>';
      ul.parentNode.insertBefore(past, ul.nextSibling);
    }
    var pul = past.querySelector('ul');
    [].slice.call(ul.querySelectorAll('.sf-room-card.is-end')).forEach(function (li) { pul.appendChild(li); });
    [].slice.call(pul.querySelectorAll('.sf-room-card:not(.is-end)')).forEach(function (li) { ul.appendChild(li); });
    // 진행 중: 날짜가 있는 것(라이브·모임) 가까운 순 → 교육 → 입금 대기
    var now = Date.now(), at = function (li) { return +li.getAttribute('data-at') || 0; };
    [].slice.call(ul.children).sort(function (a, b) {
      var pa = a.classList.contains('is-pending'), pb = b.classList.contains('is-pending');
      if (pa !== pb) return pa ? 1 : -1;
      var x = at(a) > now ? at(a) : 9e15, y = at(b) > now ? at(b) : 9e15;
      return x - y;
    }).forEach(function (li) { ul.appendChild(li); });
    past.querySelector('summary b').textContent = pul.children.length;
    past.hidden = !pul.children.length;
    // 다음 일정(가까운 라이브·모임 하나) — (10/31) 고른 탭에 맞춰요: 무료 라이브 탭은 라이브만 · 커뮤니티 탭은 모임만 · 교육 탭은 숨김
    function setHero(k) {
      var nx = [].filter.call(ul.children, function (li) { var ty = li.getAttribute('data-ty'); return !li.classList.contains('is-pending') && at(li) > now - 3 * 36e5 && ty !== 'course' && (k === 'all' || ty === k); })
        .sort(function (a, b) { return at(a) - at(b); })[0];
      var hero = t.querySelector('.sf-room-next');
      if (!nx) return void (hero && hero.remove());
      hero || (hero = document.createElement('div'), hero.className = 'sf-room-next', t.insertBefore(hero, t.firstChild));
      var a0 = at(nx), lv = nx.getAttribute('data-ty') === 'live';
      // (10/31) 카드와 같은 버튼(소통방 입장 노랑 · 라이브 입장 · 준비 중)을 그대로 복사 — 팝업(data-enter)도 같이 동작
      var go = nx.querySelector('.r3-ord__go:not(.sf-btn--primary[href*="/class"])'), cp = go && go.cloneNode(true);
      cp && cp.classList.remove('r3-ord__go');
      hero.innerHTML = '<span class="sf-room-next__k">다음 일정</span><div class="sf-room-next__tx"><em>' + (SFUI.roomLeft(a0) || '오늘') + ' · ' + (lv ? '무료 라이브' : '모임') + '</em><strong>' + esc((nx.querySelector('h2') || {}).textContent) + '</strong><span>' + md(a0, 1) + '</span></div>' + (cp ? cp.outerHTML : '');
    }
    // 탭(전체 · 교육 · 무료 라이브 · 커뮤니티) — 개수는 진행 중만
    var nav = t.querySelector('.sf-room-tabs'), cur = nav ? nav.getAttribute('data-on') : 'all';
    if (!nav) {
      nav = document.createElement('div'); nav.className = 'sf-room-tabs'; nav.setAttribute('role', 'tablist');
      ul.parentNode.insertBefore(nav, ul);
      nav.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return;
        nav.setAttribute('data-on', b.getAttribute('data-k')); apply();
      });
    }
    var cnt = function (k) { return [].filter.call(ul.children, function (li) { return k === 'all' || li.getAttribute('data-ty') === k; }).length; };
    nav.innerHTML = TABS.map(function (x) { var n = cnt(x[0]); return '<button type="button" role="tab" data-k="' + x[0] + '"' + (x[0] !== 'all' && !n && !pul.querySelector('[data-ty="' + x[0] + '"]') ? ' hidden' : '') + '>' + x[1] + ' <b>' + n + '</b></button>'; }).join('');
    nav.setAttribute('data-on', cur);
    apply();
    function apply() {
      var k = nav.getAttribute('data-on') || 'all';
      [].forEach.call(nav.querySelectorAll('button'), function (b) { var on = b.getAttribute('data-k') === k; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
      [].forEach.call(t.querySelectorAll('.sf-room-card'), function (li) { li.hidden = k !== 'all' && li.getAttribute('data-ty') !== k; });
      setHero(k);
      // 지난 일정도 고른 탭 것만 세요(없으면 접는 칸째 숨김)
      var pn = [].filter.call(pul.children, function (li) { return !li.hidden; }).length;
      past.querySelector('summary b').textContent = pn;
      past.hidden = !pn;
      var empty = t.querySelector('.sf-room-empty');
      var none = ![].some.call(ul.children, function (li) { return !li.hidden; });
      if (none && !empty) { empty = document.createElement('p'); empty.className = 'sf-room-empty'; ul.parentNode.insertBefore(empty, ul.nextSibling); }
      empty && (empty.hidden = !none, empty.innerHTML = '진행 중인 일정이 없어요. <a href="' + withPv(k === 'live' ? '/live' : k === 'meet' ? '/community' : '/course') + '">' + (k === 'live' ? '무료 라이브' : k === 'meet' ? '커뮤니티' : '교육') + ' 둘러보기</a>');
    }
  };
  // (10/31 사장님) 아임웹 React 창(현금영수증 신청 등)의 검정 단추(고른 칸 · 신청하기)를 주황으로 — 아임웹 이름표가 매번 바뀌어 색으로 찾아요(CSS patch/84)
  if (path === '/shop_mypage' && window.MutationObserver) {
    var rmScan = function () {
      [].forEach.call(document.querySelectorAll('.ReactModal__Content button'), function (b) {
        b.classList.remove('sf-rm-dark');
        getComputedStyle(b).backgroundColor === 'rgb(54, 54, 54)' && b.classList.add('sf-rm-dark');
      });
    };
    // 창은 body 아래 ReactModalPortal 안에 생겨요 → 아래까지 보되 한 프레임에 한 번만
    var rmQ = 0;
    new MutationObserver(function () {
      rmQ || (rmQ = requestAnimationFrame(function () { rmQ = 0; document.querySelector('.ReactModal__Content') && rmScan(); }));
    }).observe(document.documentElement, { childList: true, subtree: true }); // 이 코드는 body 가 생기기 전에 돌아요
    document.addEventListener('click', function (e) { e.target.closest && e.target.closest('.ReactModal__Content') && setTimeout(rmScan, 0); });
  }
  // (10/31 사장님) 입장 안내 팝업 — 라이브 입장 · 비밀번호가 있는 소통방 입장을 누르면 바로 카카오로 가지 않고 여기서 먼저
  //   ① 소통방 입장(카카오 노랑) + 비밀번호(복사) ② 라이브 링크 입장하기(상품 글 [라이브 링크], 시작 20분 전부터) ③ 신청한 일정 요약
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('a[data-enter]');
    if (!b || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    // 다음 일정 상자의 버튼은 카드 버튼을 복사한 것 → 같은 번호의 카드에서 일시·사진을 읽어요
    var idx = b.getAttribute('data-enter'), cb = document.querySelector('.sf-room-card a[data-enter="' + idx + '"]');
    var li = b.closest('.sf-room-card') || (cb && cb.closest('.sf-room-card'));
    SFUI.roomInfo(idx, function (o) { o ? enterPop(o, li) : window.open(b.href, '_blank', 'noopener'); });
  });
  function enterPop(o, li) {
    var ty = li && li.getAttribute('data-ty') || 'meet', lv = ty === 'live', at = li && +li.getAttribute('data-at') || 0;
    var who = ((document.querySelector('.r2-my-who b') || {}).textContent || '').trim();
    var title = li && (li.querySelector('h2') || {}).textContent || o.title || '';
    var img = li && li.querySelector('.sf-hub-thumb') ? li.querySelector('.sf-hub-thumb').style.backgroundImage : '';
    var now = Date.now(), open = o.live && at && now >= at - 12e5, over = at && now > at + 3 * 36e5;
    var left = SFUI.roomLeft(at), chip = over ? '종료' : left === '진행 중' ? '진행 중' : lv ? '시작 예정' : '참여 예정';
    var hm = function (t) { var d = new Date(t), h = d.getHours(); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일(' + W.charAt(d.getDay()) + ') ' + (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
    var h = '<div class="sf-enter__head"><b>' + (who ? esc(who) + '님, ' : '') + '환영해요!</b><p>' + (lv ? '소통방에서 먼저 안내를 받고, 라이브에서 만나요.' : ty === 'course' ? '소통방에서 공지를 받고 질문도 나눠요.' : '소통방에서 모임 안내를 받아 보세요.') + '</p>' +
      '<button type="button" class="sf-enter__x" aria-label="닫기">×</button></div>';
    h += '<section><h3>소통방 입장</h3>' + (o.chat ?
      '<a class="sf-enter__kakao" href="' + esc(o.chat) + '" target="_blank" rel="noopener">' + SFUI.KAKAO + '소통방 입장</a>' +
      (o.chatPw ? '<div class="sf-enter__pw"><span>입장 비밀번호</span><b>' + esc(o.chatPw) + '</b><button type="button" class="sf-enter__copy" data-v="' + esc(o.chatPw) + '">복사</button></div>' : '') +
      '<ol class="sf-enter__how"><li>위 버튼을 누르면 카카오톡 오픈채팅이 열려요.</li>' + (o.chatPw ? '<li>참여하기를 누르고 비밀번호 <b>' + esc(o.chatPw) + '</b>를 넣으면 입장돼요.</li>' : '<li>참여하기를 누르면 바로 입장돼요.</li>') + '</ol>'
      : '<p class="sf-enter__wait">소통방은 준비 중이에요. 열리면 여기에 입장 버튼이 생겨요.</p>') + '</section>';
    lv && (h += '<section><h3>라이브 링크</h3>' +
      (o.live && open && !over ? '<a class="sf-enter__live" href="' + esc(o.live) + '" target="_blank" rel="noopener">라이브 링크 입장하기</a>' : '<span class="sf-enter__live is-off">라이브 링크 입장하기</span>') +
      '<div class="sf-enter__when">' + (at ? '<b>🕒 ' + hm(at) + '에 시작돼요.</b>' : '') + '<p>' + (over ? '라이브가 끝났어요. 다시보기는 나의 강의실에서 안내드려요.' : o.live ? '시작 20분 전부터 입장할 수 있어요. 조금만 기다려 주세요!' : '입장 링크는 시작 전에 이곳과 소통방에 안내드려요.') + '</p></div></section>');
    h += '<section class="sf-enter__item"><div><span class="sf-enter__chip' + (over ? ' is-end' : '') + '">' + chip + '</span><span class="sf-enter__type">' + (lv ? '무료 라이브' : ty === 'course' ? '교육' : '모임') + '</span></div>' +
      '<div class="sf-enter__row"><span class="sf-enter__th" style="background-image:' + esc(img).replace(/"/g, "'") + '"></span><div><strong>' + esc(title) + '</strong>' + (at ? '<small>일시 : ' + hm(at) + (left && !over ? ' · ' + left : '') + '</small>' : '') + '</div></div></section>';
    h += '<p class="sf-enter__help">문제가 생겼나요? <a href="' + withPv('/help') + '">고객센터 연락하기</a></p>';
    var bg = document.createElement('div');
    bg.className = 'sf-enter'; bg.setAttribute('role', 'dialog'); bg.setAttribute('aria-modal', 'true'); bg.setAttribute('aria-label', '입장 안내');
    bg.innerHTML = '<div class="sf-enter__box">' + h + '</div>';
    var prevFocus = document.activeElement, close = function () { bg.remove(); document.removeEventListener('keydown', key); prevFocus && prevFocus.focus && prevFocus.focus(); };
    var key = function (ev) { ev.key === 'Escape' && close(); };
    bg.addEventListener('click', function (ev) {
      if (ev.target === bg || ev.target.closest('.sf-enter__x')) return close();
      var c = ev.target.closest('.sf-enter__copy');
      if (c) {
        var v = c.getAttribute('data-v'), ok = function () { SFUI.toast ? SFUI.toast('비밀번호를 복사했어요') : (c.textContent = '복사됨'); };
        navigator.clipboard ? navigator.clipboard.writeText(v).then(ok, function () {}) : ok();
      }
    });
    document.addEventListener('keydown', key);
    document.body.appendChild(bg);
    (bg.querySelector('.sf-enter__kakao, .sf-enter__x') || bg).focus();
  }
  function pendings(L) {
    var seen = {};
    return (L || []).filter(function (x) { return /입금\s*대기|입금대기/.test(x.status) && !isZero(x.price) && !seen[x.idx] && (seen[x.idx] = 1); });
  }
})()
