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
      box.innerHTML = '<p class="sf-oc-note">유료 주문만 보여요 · 무료 신청은 <a href="' + withPv('/shop_mypage/?sf=room') + '">나의 강의실</a>에서 확인해 주세요</p><ul class="sf-oc-list">' + list.map(function (no) {
        var items = by[no], st = stateOf(items), first = items[0], more = items.length - 1;
        var sum = items.reduce(function (a, x) { return a + (+String(x.price).replace(/[^\d]/g, '') || 0); }, 0);
        var title = first.name.replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, '');
        var detail = withPv('/shop_mypage/?m2=order&idx=' + no + '&order_no=' + no);
        var conf = items.every(function (x) { return /구매\s*확정/.test(x.status); });
        return '<li class="sf-oc is-' + st[0] + '" data-no="' + esc(no) + '"' + (conf ? ' data-conf="1"' : '') + '>' +
          '<div class="sf-oc__top"><span class="sf-oc__st">' + st[1] + '</span><span class="sf-oc__date">' + esc((first.date || '').replace(/-/g, '.')) + '</span><span class="sf-oc__no">주문번호 ' + esc(no) + '</span></div>' +
          '<div class="sf-oc__body"><span class="sf-oc__th"' + (first.img ? ' style="background-image:url(\'' + esc(first.img).replace(/'/g, '') + '\')"' : '') + '></span>' +
          '<div class="sf-oc__tx"><strong>' + esc(title) + (more > 0 ? ' <em>외 ' + more + '건</em>' : '') + '</strong><p class="sf-oc__sum"><b>' + won(sum) + '</b><span class="sf-oc__how"></span></p></div></div>' +
          '<div class="sf-oc__bank" hidden></div>' +
          '<div class="sf-oc__act"><button type="button" class="sf-oc__more" aria-expanded="false">결제 상세<i aria-hidden="true"></i></button>' +
          (st[0] === 'wait' ? '<a class="sf-oc__btn" href="' + detail + '">주문 취소</a>' : '') +
          (st[0] === 'paid' ? '<a class="sf-oc__btn is-main" href="' + withPv('/shop_mypage/?sf=room') + '">강의실로 가기 →</a>' : '') + '</div>' +
          '<div class="sf-oc__detail" hidden><dl>' + items.map(function (x) { return '<div><dt>' + esc(x.name.replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, '')) + '</dt><dd>' + esc(x.price) + '</dd></div>'; }).join('') + '</dl><dl class="sf-oc__calc"></dl>' +
          '<a class="sf-oc__imweb" href="' + detail + '">영수증 · 취소·환불 요청은 주문 상세에서 ›</a></div></li>';
      }).join('') + '</ul>';
      // 금액·할인·결제수단·입금 계좌 채우기 (한 번에 4건씩)
      var lis = [].slice.call(box.querySelectorAll('.sf-oc')), k = 0;
      var next = function () {
        var li = lis[k++]; if (!li) return;
        SFUI.omsOrder(li.getAttribute('data-no')).then(function (D) { D && fill(li, D); next(); });
      };
      for (var i = 0; i < 4; i++) next();
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
    function fill(li, D) {
      var p = (D.payments || [])[0] || {}, how = METHOD[p.methodCd] || '', paid = +D.paymentPrice || 0;
      var cp = (+D.itemCouponDiscount || 0) + (+D.deliveryCouponDiscount || 0), pt = (+D.itemPointAmount || 0) + (+D.deliveryPointAmount || 0), etc = (+D.promotionDiscount || 0) + (+D.gradeDiscount || 0);
      var st = (li.className.match(/is-(wait|paid|cancel|ing)/) || [])[1], gp = +D.givePoint || 0, confirmed = li.hasAttribute('data-conf');
      li.querySelector('.sf-oc__sum b').textContent = won(paid);
      li.querySelector('.sf-oc__how').textContent = [how, gp && st === 'paid' ? '적립 ' + won(gp) + (confirmed ? '' : ' 예정') : ''].filter(Boolean).map(function (s) { return ' · ' + s; }).join('');
      var rows = [['상품 금액', won(D.baseItemPrice || D.itemPrice)]];
      cp && rows.push(['쿠폰 할인', '-' + won(cp)]);
      etc && rows.push(['기타 할인', '-' + won(etc)]);
      pt && rows.push(['적립금 사용', '-' + won(pt)]);
      rows.push(['결제 금액', won(paid), 1]);
      how && rows.push(['결제 수단', how]);
      gp && st === 'paid' && rows.push(['적립', won(gp) + (confirmed ? ' 지급 완료' : ' · 수강 확정 후 지급')]);
      li.querySelector('.sf-oc__calc').innerHTML = rows.map(function (r) { return '<div' + (r[2] ? ' class="is-total"' : '') + '><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
      // 입금 대기: 계좌·금액·마감
      var bt = p.paymentBankTransfer;
      if (st === 'wait' && bt && bt.bankAccount) {
        var bx = li.querySelector('.sf-oc__bank');
        bx.innerHTML = '<p><b>' + esc(bt.bankName) + ' ' + esc(bt.bankAccount) + '</b> <span>' + esc(bt.accountHolderName || '') + '</span>' +
          '<button type="button" class="sf-oc__copy" data-v="' + esc(bt.bankAccount) + '">계좌 복사</button></p>' +
          '<p>' + won(paid) + (bt.expireTime ? ' · <em>' + md(Date.parse(bt.expireTime), 1) + '까지</em> 입금해 주세요' : '') + (bt.depositor ? ' · 입금자 ' + esc(bt.depositor) : '') + '</p>';
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
    if (!t.__sfPend) {
      t.__sfPend = 1;
      pendings(L).forEach(function (x) {
        var ty = typeOf(x), li = document.createElement('li');
        li.className = 'sf-hub-card r3-ord sf-room-card is-pending'; li.setAttribute('data-ty', ty);
        li.innerHTML = '<div class="sf-hub-thumb" style="background:#f2f3f6 center/cover no-repeat url(\'' + esc(x.img).replace(/'/g, '') + '\')"></div><div><small>' + (ty === 'live' ? '무료 라이브' : ty === 'meet' ? '모임' : '강의') + '</small><h2>' + esc(x.name.replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, '')) + '</h2><p class="sf-room-when">입금이 확인되면 열려요</p></div>' +
          '<div class="sf-hub-side"><span class="sf-badge sf-badge--neutral">입금 대기</span><a class="sf-btn sf-btn--outline sf-btn--l r3-ord__go" href="' + withPv('/shop_mypage/?sf=orders') + '">입금 계좌 보기</a></div>';
        ul.appendChild(li);
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
