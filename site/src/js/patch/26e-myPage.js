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

  // 아임웹 주문 상세(영수증·취소)에서 결제 내역으로 돌아가는 길
  SFUI.register('orderBack', function (root) {
    if (root !== document || qs.get('m2') !== 'order' || !qs.get('order_no') || document.querySelector('.sf-od-back')) return;
    var n = 0, put = function () {
      var col = document.querySelector('.shop-content.mypage .col-md-10');
      if (!col) return void (n++ < 40 && setTimeout(put, 250));
      var a = document.createElement('a'); a.className = 'sf-od-back'; a.href = withPv('/shop_mypage/?sf=orders'); a.textContent = '← 결제 내역';
      col.insertBefore(a, col.firstChild);
    };
    put();
  });
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
  SFUI.omsOrder = function (no) {
    if (cache[no]) return cache[no];
    tok = tok || fetch('/ajax/oms/OMS_auth.cm', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { return j && j['tok' + 'en']; });
    return (cache[no] = tok.then(function (k) {
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
      // 처음부터 무료인 신청(상품 가격이 모두 0원)은 결제 내역에서 빼요 — 강의실에서 봐요
      var list = order.filter(function (no) { return !by[no].every(function (x) { return isZero(x.price); }); });
      if (!list.length) return void (box.innerHTML = '<div class="r2-my-load">아직 결제한 내역이 없어요. 무료 라이브·무료 모임 신청은 <a href="' + withPv('/shop_mypage/?sf=room') + '">나의 강의실</a>에서 볼 수 있어요.</div>');
      // (10/31) 상세(금액·상태)를 먼저 받고 그려요 — 목록 값으로 먼저 그리면 금액·상태가 바뀌며 깜빡였고,
      //   아임웹 목록은 '입금 전 취소'한 주문을 '입금대기'로 내려 줘서 계좌가 잘못 보였어요. 6초 안에 못 받으면 목록 값으로
      var D = {}, k = 0, done = false;
      var render = function () {
        if (done) return; done = true;
        box.innerHTML = '<p class="sf-oc-note">유료 주문만 보여요 · 무료 신청은 <a href="' + withPv('/shop_mypage/?sf=room') + '">나의 강의실</a>에서 확인해 주세요</p><ul class="sf-oc-list">' + list.map(function (no) { return card(no, by[no], D[no]); }).join('') + '</ul>';
        [].forEach.call(box.querySelectorAll('.sf-oc'), function (li) { var d = D[li.getAttribute('data-no')]; d && fill(li, d); });
      };
      var left = list.length, next = function () {
        if (k >= list.length) return;
        var no = list[k++];
        SFUI.omsOrder(no).then(function (d) { D[no] = d; --left || render(); next(); });
      };
      box.innerHTML = '<div class="r2-my-load">결제 내역을 불러오는 중…</div>';
      for (var i = 0; i < 4; i++) next();
      setTimeout(render, 6000);
      box.addEventListener('click', function (e) {
        var b = e.target.closest('.sf-oc__more');
        if (b) {
          var d = b.closest('.sf-oc').querySelector('.sf-oc__detail'), on = d.hidden;
          d.hidden = !on; b.setAttribute('aria-expanded', String(on)); b.classList.toggle('is-open', on);
        }
        var c = e.target.closest('.sf-oc__copy');
        if (c) {
          var v = c.getAttribute('data-v'), ok = function () { SFUI.toast ? SFUI.toast('계좌번호를 복사했어요') : (c.textContent = '복사됨'); };
          navigator.clipboard ? navigator.clipboard.writeText(v).then(ok, function () { c.textContent = v; }) : (c.textContent = v);
        }
      });
    })['catch'](function () {
      box.innerHTML = '<div class="r2-my-load">결제 내역을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</div>';
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
        '<div class="sf-oc__act"><button type="button" class="sf-oc__more" aria-expanded="false">결제 상세<i aria-hidden="true"></i></button>' +
        // 취소·영수증·현금영수증·거래명세서는 아임웹 주문 상세에 있어요 → 상태에 맞는 이름으로 바로 보내요
        (st[0] === 'wait' ? '<a class="sf-oc__btn" href="' + detail + '">주문 취소</a>' : st[0] === 'paid' ? '<a class="sf-oc__btn" href="' + detail + '">영수증 · 취소 요청</a>' : '<a class="sf-oc__btn" href="' + detail + '">주문 상세</a>') +
        (st[0] === 'paid' ? '<a class="sf-oc__btn is-main" href="' + withPv('/shop_mypage/?sf=room') + '">강의실로 가기 →</a>' : '') + '</div>' +
        '<div class="sf-oc__detail" hidden><dl>' + (oi.length ? oi.map(function (x) { return '<div><dt>' + esc(x.prodName) + '</dt><dd>' + won(x.itemPrice) + '</dd></div>'; }) : items.map(function (x) { return '<div><dt>' + esc(name(x.name)) + '</dt><dd>' + esc(x.price) + '</dd></div>'; })).join('') + '</dl><dl class="sf-oc__calc"></dl><ul class="sf-oc__notes"></ul></div></li>';
    }
    function fill(li, D) {
      var p = (D.payments || [])[0] || {}, how = METHOD[p.methodCd] || '', paid = +D.paymentPrice || 0;
      var cp = (+D.itemCouponDiscount || 0) + (+D.deliveryCouponDiscount || 0), pt = (+D.itemPointAmount || 0) + (+D.deliveryPointAmount || 0), etc = (+D.promotionDiscount || 0) + (+D.gradeDiscount || 0);
      var st = (li.className.match(/is-(wait|paid|cancel|ing)/) || [])[1], gp = +D.givePoint || 0, confirmed = li.hasAttribute('data-conf');
      !how && !paid && (pt || cp) && (how = pt ? '적립금 결제' : '쿠폰 결제');
      li.querySelector('.sf-oc__how').textContent = [how, gp && st === 'paid' ? '적립 ' + won(gp) + (confirmed ? '' : ' 예정') : ''].filter(Boolean).map(function (s) { return ' · ' + s; }).join('');
      var rows = [['상품 금액', won(D.baseItemPrice || D.itemPrice)]];
      cp && rows.push(['쿠폰 할인', '-' + won(cp)]);
      etc && rows.push(['기타 할인', '-' + won(etc)]);
      pt && rows.push(['적립금 사용', '-' + won(pt)]);
      // 입금 전에 취소한 주문(결제 상태 대기·취소, 카드 취소 금액 없음)은 낸 돈이 없어요
      var unpaid = st === 'cancel' && /^(OPS01|OPS08)$/.test(p.statusCd) && !(+D.pgCancelPrice > 0);
      unpaid ? (rows.push(['주문 금액', won(paid)]), rows.push(['결제된 금액', '0원 (입금 전 취소)', 1]), li.querySelector('.sf-oc__how').textContent = ' · 입금 전 취소') : rows.push(['결제 금액', won(paid), 1]);
      how && rows.push(['결제 수단', how]);
      gp && st === 'paid' && rows.push(['적립', won(gp) + (confirmed ? ' 지급 완료' : ' · 수강 확정 후 지급')]);
      li.querySelector('.sf-oc__calc').innerHTML = rows.map(function (r) { return '<div' + (r[2] ? ' class="is-total"' : '') + '><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
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
      // 안내(펼친 칸 아래): 현금영수증 · 적립 · 취소 규정
      var notes = [];
      p.methodCd === 'OPM01' && st !== 'cancel' && notes.push('현금영수증은 주문 상세에서 신청할 수 있어요(주문일로부터 5일 안).');
      st === 'paid' && notes.push('취소·환불은 <a href="/?mode=policy" target="_blank" rel="noopener">이용약관</a> 제18·19조(청약철회·환불)에 따라 처리돼요.');
      st === 'cancel' && pt && notes.push('사용한 적립금 ' + won(pt) + '은 돌려드렸어요.');
      st === 'cancel' && cp && notes.push('사용한 쿠폰은 다시 쓸 수 있어요.');
      var nu = li.querySelector('.sf-oc__notes');
      nu && (nu.innerHTML = notes.map(function (s) { return '<li>' + s + '</li>'; }).join(''), nu.hidden = !notes.length);
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
        li.innerHTML = '<div class="sf-hub-thumb" style="background:#f2f3f6 center/cover no-repeat url(\'' + esc(x.img).replace(/'/g, '') + '\')"></div><div><small>' + (ty === 'live' ? '무료 라이브' : ty === 'meet' ? '모임' : '강의') + '</small><h2>' + esc(x.name.replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, '')) + '</h2><p class="sf-room-when">입금이 확인되면 열려요</p></div>' +
          '<div class="sf-hub-side"><span class="sf-badge sf-badge--neutral">입금 대기</span><a class="sf-btn sf-btn--outline sf-btn--l r3-ord__go" href="' + withPv('/shop_mypage/?sf=orders') + '">입금 계좌 보기</a></div>';
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
          li.setAttribute('data-ty', ty2); li.querySelector('small').textContent = ty2 === 'live' ? '무료 라이브' : ty2 === 'meet' ? '모임' : '강의';
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
    // 다음 일정(가까운 라이브·모임 하나)
    var nx = [].filter.call(ul.children, function (li) { return !li.classList.contains('is-pending') && at(li) > now - 3 * 36e5 && li.getAttribute('data-ty') !== 'course'; })
      .sort(function (a, b) { return at(a) - at(b); })[0];
    var hero = t.querySelector('.sf-room-next');
    if (nx) {
      hero || (hero = document.createElement('div'), hero.className = 'sf-room-next', t.insertBefore(hero, t.firstChild));
      var a0 = at(nx), dd = Math.ceil((new Date(a0).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5), lv = nx.getAttribute('data-ty') === 'live';
      var go = nx.querySelector('a.r3-ord__go');
      hero.innerHTML = '<span class="sf-room-next__k">다음 일정</span><div class="sf-room-next__tx"><em>' + (dd <= 0 ? '오늘' : 'D-' + dd) + ' · ' + (lv ? '무료 라이브' : '모임') + '</em><strong>' + esc((nx.querySelector('h2') || {}).textContent) + '</strong><span>' + md(a0, 1) + '</span></div>' +
        (go ? '<a class="sf-btn sf-btn--primary sf-btn--l" href="' + esc(go.getAttribute('href')) + '"' + (go.target ? ' target="_blank" rel="noopener"' : '') + '>' + esc(go.textContent) + '</a>' : '');
    } else hero && hero.remove();
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
      var empty = t.querySelector('.sf-room-empty');
      var none = ![].some.call(ul.children, function (li) { return !li.hidden; });
      if (none && !empty) { empty = document.createElement('p'); empty.className = 'sf-room-empty'; ul.parentNode.insertBefore(empty, ul.nextSibling); }
      empty && (empty.hidden = !none, empty.innerHTML = '진행 중인 일정이 없어요. <a href="' + withPv(k === 'live' ? '/live' : k === 'meet' ? '/community' : '/course') + '">' + (k === 'live' ? '무료 라이브' : k === 'meet' ? '커뮤니티' : '교육') + ' 둘러보기</a>');
    }
  };
  function pendings(L) {
    var seen = {};
    return (L || []).filter(function (x) { return /입금\s*대기|입금대기/.test(x.status) && !isZero(x.price) && !seen[x.idx] && (seen[x.idx] = 1); });
  }
})()
