// (10/31 사장님) 마이페이지 › 혜택 — 아임웹 쿠폰함(?m2=coupon_list) · 포인트(?m2=point_list) 화면을 시니어퓨처 모양으로
//   쿠폰: 금액 크게 · 쿠폰 이름 · 조건 · 기한 · 상태 · 아래 '사용 안내 ›' (월부 쿠폰함 모양)
//   적립금: 위 잔액 카드 · 아래 내역(사유 · 날짜 · +적립 / -사용) — 아임웹 '더보기'로 내역이 늘면 다시 그려요
(function () {
  var qs = new URLSearchParams(location.search), m2 = qs.get('m2');
  if (!/^\/shop_mypage/.test(location.pathname) || !/^(coupon_list|point_list)$/.test(m2 || '')) return;
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; };
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  var n = 0;
  (function wait() {
    var col = document.querySelector('.shop-content.mypage .col-md-10');
    var ok = col && (m2 === 'coupon_list' ? coupons(col) : points(col));
    ok || n++ > 60 || setTimeout(wait, 200);
  })();

  function coupons(col) {
    var box = document.getElementById('couopn_list');
    if (!box) return false;
    if (box.__sf) return true; box.__sf = 1;
    document.documentElement.classList.add('sf-cp-on');
    var h = document.createElement('div');
    h.className = 'sf-bn-head';
    h.innerHTML = '<h2 class="r2-my-h">쿠폰함</h2><p>사용할 수 있는 쿠폰 <b>0장</b> · 결제할 때 주문서에서 골라 쓸 수 있어요</p>';
    box.parentNode.insertBefore(h, box);
    // 아임웹이 쿠폰 카드를 늦게 그려요 → 바뀔 때마다 다시 꾸며요(이미 꾸민 카드는 건너뜀)
    var deco = function () {
      var cards = [].slice.call(box.querySelectorAll('.mypage-coupon-wrap'));
      h.querySelector('b').textContent = cards.length + '장';
      cards.forEach(dress);
      var em = box.querySelector('.sf-bn-empty');
      if (!cards.length && !em) { em = document.createElement('p'); em.className = 'sf-bn-empty'; em.innerHTML = '지금 쓸 수 있는 쿠폰이 없어요.<br>새 쿠폰이 생기면 여기에 보여요.'; box.appendChild(em); }
      em && (em.hidden = !!cards.length);
    };
    var q = 0;
    new MutationObserver(function () { q || (q = requestAnimationFrame(function () { q = 0; deco(); })); }).observe(box, { childList: true, subtree: true });
    deco();
    return true;
    function dress(c) {
      if (c.classList.contains('sf-cp')) return;
      c.classList.add('sf-cp');
      var t = c.querySelector('.discount-title'), d = c.querySelector('.coupon-date'), btn = c.querySelector('.coupon_use_btn');
      t && (t.textContent = clean(t.textContent).replace(/\s*할인$/, '') + ' 할인');
      if (!c.querySelector('.sf-cp__st')) {
        var st = document.createElement('span'); st.className = 'sf-cp__st'; st.textContent = '사용 가능';
        var head = c.querySelector('.coupon-head'); head && head.appendChild(st);
      }
      d && (d.textContent = clean(d.textContent).replace(/-/g, '.').replace(/\s*까지$/, '까지'));
      btn && (btn.textContent = '사용 안내 ›');
    }
  }

  function points(col) {
    var tb = document.getElementById('shop_mypage_pointlist'), wrap = tb && tb.closest('.table-wrap');
    if (!wrap) return false;
    if (wrap.__sf) return true; wrap.__sf = 1;
    document.documentElement.classList.add('sf-pt-on');
    var sm = ((document.getElementById('mypage-summary') || {}).textContent || '').replace(/\s+/g, ' ').match(/포인트\s*([\d,]+)/);
    var amt = clean((wrap.querySelector('.point_amount') || {}).textContent) || (sm && sm[1]) || '0';
    var top = document.createElement('div');
    top.className = 'sf-pt-top';
    top.innerHTML = '<h2 class="r2-my-h">적립금</h2><div class="sf-pt-bal"><span>쓸 수 있는 적립금</span><b>' + esc(amt.replace(/[^\d,]/g, '')) + '원</b><p>결제할 때 주문서의 \'적립금 사용\'에서 쓸 수 있어요. 결제 금액의 10%가 수강 확정 후 적립돼요.</p></div>';
    wrap.parentNode.insertBefore(top, wrap);
    var list = document.createElement('ul');
    list.className = 'sf-pt-list';
    wrap.parentNode.insertBefore(list, wrap.nextSibling);
    var draw = function () {
      var rows = [].slice.call(tb.querySelectorAll('tr.content'));
      list.innerHTML = rows.length ? rows.map(function (tr) {
        var td = tr.children, date = clean(td[0] && td[0].textContent), why = td[1], ch = clean(td[2] && td[2].textContent);
        var plus = /^\+/.test(ch), a = why && why.querySelector('a'), wt = clean(why && why.textContent);
        var label = a ? (plus ? '수강 적립' : '결제 시 사용') : (wt || (plus ? '적립' : '사용'));
        return '<li class="' + (plus ? 'is-plus' : 'is-minus') + '"><div><b>' + esc(label) + '</b><small>' + esc(date.replace(/-/g, '.')) +
          (a ? ' · 주문 <a href="' + esc(a.getAttribute('href') || '#') + '">' + esc(clean(a.textContent)) + '</a>' : '') + '</small></div><strong>' + esc(ch.replace(/\s*포인트$/, '원')) + '</strong></li>';
      }).join('') : '<li class="sf-bn-empty">아직 적립·사용 내역이 없어요.</li>';
    };
    draw();
    new MutationObserver(function () { requestAnimationFrame(draw); }).observe(tb, { childList: true });
    var more = document.getElementById('shop_mypage_pointlist_more') || wrap.querySelector('[id*=more]');
    more && list.parentNode.insertBefore(more.closest('div') || more, list.nextSibling);
    return true;
  }
})()
