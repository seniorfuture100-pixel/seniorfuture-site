// 원본: src/r3-pay.js
/* r3-pay.js — 주문서(/shop_payment) 월부식 정리 (10/20)
   아임웹 주문서는 화면을 스스로 다시 그려요 → 아임웹 요소는 옮기지 않고 class 만 붙여 CSS로 배치하고,
   우리 요소(상품 카드 · 결제 수단 타일)만 새로 넣어요. 실제 결제·입력은 아임웹 원래 요소가 그대로 처리해요.
   - 제목 '주문결제'(왼쪽 정렬) · 상품 카드(16:9 썸네일 · 태그 · 제목 · 고른 옵션 · 금액)
   - 주문자 정보: 값이 다 채워져 있으면(로그인 회원) 숨기고, 빈 칸이 있으면 그대로 보여요
   - 결제 수단: 타일 버튼(누르면 아임웹 라디오를 대신 눌러요) · 오른쪽 '결제 금액' + 결제하기
   - (10/27) 쿠폰 사용 · 적립금 사용(아임웹 기본 기능) — 결제 수단 아래, 입력칸 50px·8px·#DADDE2 통일 */
(function () {
  if (!/^\/shop_payment\/?$/.test(location.pathname)) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function txt(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'; }
  function num(t) { return parseInt(String(t || '').replace(/[^\d]/g, ''), 10) || 0; }

  // 아임웹(React)이 가진 글자 노드는 그대로 두고 값만 바꿔요
  function setText(el, v) { if (!el) return; var n = [].slice.call(el.childNodes).filter(function (c) { return c.nodeType === 3 && c.nodeValue.trim(); })[0]; if (n) { if (n.nodeValue !== v) n.nodeValue = v; } else if (!el.children.length) el.textContent = v; }
  function hd(root, t) { return $$('header', root).filter(function (h) { return clean(h.textContent).indexOf(t) === 0; })[0]; }
  function box(h) { return h && h.parentElement; }

  function tagHTML(idx) {
    try {
      var it = SFUI.shopItems && SFUI.shopItems()[idx], T = SFUI.shopTags;
      if (!it || !it.tags || !T) return '';
      return it.tags.map(function (t) { var d = T[t]; return d ? '<span class="sf-tag sf-tag--' + d[0] + '">' + d[1] + '</span>' : ''; }).join('');
    } catch (e) { return ''; }
  }

  // 가격 칸 안의 금액들(할인가 · 정가)을 글자 조각별로 따로 읽어요
  function textNums(el) {
    var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { (n.nodeValue.match(/\d[\d,]*/g) || []).forEach(function (t) { var v = num(t); if (v >= 100 || /^0$/.test(t)) out.push(v); }); }
    return out;
  }
  // 할인 있으면: '30% 213,000원'(취소선) 위에 작게 + 결제 금액 크게
  function priceHTML(g) {
    var off = g.orig > g.sum && g.orig > 0 ? Math.round((g.orig - g.sum) / g.orig * 100) : 0;
    return '<div class="r3pay-card__pr">' + (off ? '<span class="r3pay-card__off"><b>' + off + '%</b><s>' + won(g.orig) + '</s></span>' : '') +
      '<b class="r3pay-card__price">' + (g.sum ? won(g.sum) : '무료') + '</b></div>';
  }

  // 상품 카드: 아임웹 상품 줄(a[href*=shop_view])을 상품별로 묶어 한 장으로
  function productCard(sec) {
    var rows = $$('a[href*="shop_view"]', sec);
    if (!rows.length) return '';
    var groups = {}, order = [];
    rows.forEach(function (a) {
      a.classList.add('r3pay-src');
      var ul = a.closest('ul'); if (ul && sec.contains(ul)) ul.classList.add('r3pay-srclist');
      var m = (a.getAttribute('href') || '').match(/idx=(\d+)/), idx = m ? m[1] : a.getAttribute('href');
      var img = $('img', a), ps = $$('p', a);
      var title = clean(ps[0] && ps[0].textContent);
      var opt = clean(ps[1] && ps[1].textContent).replace(/^필수\s*/, '');
      var nums = ps[2] ? textNums(ps[2]) : [];
      var sale = nums.length ? Math.min.apply(null, nums) : 0, orig = nums.length ? Math.max.apply(null, nums) : 0;
      if (!groups[idx]) { groups[idx] = { idx: idx, title: title, img: img ? img.src.replace(/([?&])w=\d+/, '$1w=800') : '', opts: [], sum: 0, orig: 0 }; order.push(idx); }
      groups[idx].opts.push([opt, won(sale)]); groups[idx].sum += sale; groups[idx].orig += orig;
    });
    return order.map(function (k) {
      var g = groups[k];
      var named = g.opts.filter(function (o) { return !/^\d+\s*개$/.test(o[0]); });
      var list = named.length ? '<ul class="r3pay-opts">' + g.opts.map(function (o) {
        return '<li><span>' + txt(o[0].replace(/\s*-\s*(\d+)\s*개$/, ' · $1개')) + '</span><b>' + txt(o[1]) + '</b></li>';
      }).join('') + '</ul>' : '';
      var tags = /^\d+$/.test(g.idx) ? tagHTML(g.idx) : '';
      return '<article class="r3pay-card">' +
        (g.img ? '<span class="r3pay-card__thumb"><img src="' + g.img + '" alt=""></span>' : '') +
        '<div class="r3pay-card__body">' + (tags ? '<div class="sf-tags r3pay-card__tags">' + tags + '</div>' : '') +
        '<strong class="r3pay-card__title">' + txt(g.title) + '</strong>' + list +
        priceHTML(g) + '</div></article>';
    }).join('');
  }

  // 결제 수단 타일
  function methodTiles(methodBox) {
    var radios = $$('input[type=radio]', methodBox);
    if (!radios.length) return null;
    var wrap = document.createElement('section');
    wrap.className = 'r3pay-sec r3pay-methods';
    wrap.innerHTML = '<h3 class="r3pay-sec__h">결제 수단</h3><div class="r3pay-tiles" role="radiogroup" aria-label="결제 수단"></div>';
    var tiles = $('.r3pay-tiles', wrap);
    radios.forEach(function (r, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'r3pay-tile'; b.setAttribute('role', 'radio');
      b.textContent = clean((r.closest('label') || r.parentElement).textContent) || ('결제 수단 ' + (i + 1));
      b.addEventListener('click', function () { var l = r.closest('label'); (l || r).click(); setTimeout(sync, 30); });
      tiles.appendChild(b);
    });
    function sync() { $$('.r3pay-tile', tiles).forEach(function (b, i) { var on = !!(radios[i] && radios[i].checked); b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    sync(); wrap.__sync = sync; wrap.__n = radios.length;
    return wrap;
  }

  function dress() {
    var root = document.getElementById('oms-shop-payment'); if (!root) return;
    var hProd = hd(root, '주문 상품'), hSum = hd(root, '주문 요약') || hd(root, '결제 금액');
    if (!hProd || !hSum) return;
    document.documentElement.classList.add('r3pay-on');
    setTimeout(function () { document.documentElement.classList.add('r3pay-ready'); }, 0);
    var sw = root.closest('.section_wrap'); if (sw) sw.classList.add('r3pay-bg');
    var secProd = box(hProd), left = secProd.parentElement && secProd.parentElement.parentElement;
    var flex = left && left.parentElement;
    if (!flex) return;
    flex.classList.add('r3pay-grid'); left.classList.add('r3pay-left');
    if (flex.children[1]) flex.children[1].classList.add('r3pay-right');
    var title = $$('h2', root)[0];
    if (title) setText(title, '주문결제');
    if (title) { title.classList.add('r3pay-title'); if (title.parentElement && title.parentElement.children.length === 1) title.parentElement.classList.add('r3pay-titlewrap'); }
    $$('header', root).forEach(function (h) { var b = box(h); if (b) b.classList.add('r3pay-box'); });

    // 상품 카드
    secProd.classList.add('r3pay-box--prod');
    setText(hProd, '주문 상품');
    var sig = $$('a[href*="shop_view"]', secProd).map(function (a) { return clean(a.textContent); }).join('|');
    var cards = $('.r3pay-cards', secProd);
    if (!cards || cards.getAttribute('data-sig') !== sig) {
      if (!cards) { cards = document.createElement('div'); cards.className = 'r3pay-cards'; hProd.parentNode.insertBefore(cards, hProd.nextSibling); }
      cards.innerHTML = productCard(secProd); cards.setAttribute('data-sig', sig);
    }

    // 주문자 정보: 값이 다 있으면 숨기고, 안내 문구(환불 기준)는 상품 카드 아래로 복사
    var hBuy = hd(root, '주문자 정보'), secBuy = box(hBuy);
    if (secBuy) {
      var inputs = $$('input', secBuy).filter(function (i) { return i.type !== 'hidden' && i.type !== 'checkbox' && i.offsetParent !== null; });
      var empty = inputs.some(function (i) { return !clean(i.value); });
      secBuy.classList.toggle('r3pay-hide', !empty);
      $$('blockquote', secBuy).forEach(function (q) { q.classList.add('r3pay-hide'); });
    }

    // (10/29) 강의·라이브·모임은 받을 물건이 없어요 → 아임웹 '방문수령 위치'·'배송지' 칸 숨김
    //   (일반 상품이라 아임웹이 그려요. 입력 필수가 아님 — 0원 주문 6건으로 확인. 필수 칸이 비어 있으면 숨기지 않아요)
    ['방문수령', '배송지', '배송 정보', '배송 요청'].forEach(function (t) {
      var b = box(hd(root, t));
      if (!b || $$('input[required], textarea[required]', b).some(function (i) { return !clean(i.value); })) return;
      b.classList.add('r3pay-hide');
      if (b.parentElement && b.parentElement.parentElement === left) b.parentElement.classList.add('r3pay-hide');
    });

    // 결제 수단: 왼쪽에 타일, 아임웹 원래 칸은 숨김(라디오는 그대로 동작)
    var hMeth = hd(root, '결제 수단'), secMeth = box(hMeth);
    if (secMeth) {
      secMeth.classList.add('r3pay-hide');
      var tiles = $('.r3pay-methods', left), n = $$('input[type=radio]', secMeth).length;
      if (!tiles || tiles.__n !== n) {
        if (tiles) tiles.remove();
        tiles = methodTiles(secMeth);
        var extra = box(hd(root, '추가정보'));
        var anchor = extra ? extra.parentElement : null;
        if (tiles) { if (anchor && anchor.parentElement === left) left.insertBefore(tiles, anchor); else left.appendChild(tiles); }
      } else if (tiles.__sync) tiles.__sync();
    }

    // 오른쪽: '결제 금액'
    setText(hSum, '결제 금액');
    $$('span', box(hSum)).forEach(function (s) { var v = clean(s.textContent); if (v === '총 주문금액') setText(s, '총 결제 금액'); if (v === '상품가격') setText(s, '상품 금액'); });
    var hTerm = hd(root, '이용 및 정보 제공 약관'), tb = box(hTerm);
    if (tb) { tb.classList.add('r3pay-box--terms'); if (!$('input[type=checkbox]', tb)) tb.classList.add('r3pay-terms-quiet'); }
    var sub = $('button[type=submit]', root);
    if (sub && !(sub.nextElementSibling && sub.nextElementSibling.classList.contains('r3pay-agree'))) {
      var old = $('.r3pay-agree', root); if (old) old.remove();
      var ag = document.createElement('p'); ag.className = 'r3pay-agree';
      ag.innerHTML = '강의 및 결제 정보를 확인했으며, <a href="/terms#terms" target="_blank" rel="noopener">이용약관</a> 및 <a href="/terms#refund" target="_blank" rel="noopener">환불 규정</a>에 동의합니다.';
      sub.parentNode.insertBefore(ag, sub.nextSibling);
    }
    var extraBox = box(hd(root, '추가정보')); if (extraBox) extraBox.classList.add('r3pay-box--extra');
    benefits(root, left, secProd);
    // 모바일: 아임웹이 따로 그리는 아래 고정 '결제하기' 줄 — 버튼은 주황, 아래 문구는 우리 동의 문구(링크)로 (10/21)
    $$('button[type=button]').filter(function (b) { return clean(b.textContent) === '결제하기' && b.offsetParent; }).forEach(function (mb) {
      mb.classList.add('r3pay-mbtn');
      var bar = mb.parentElement; if (!bar) return;
      bar.classList.add('r3pay-mbar');
      [].slice.call(bar.children).forEach(function (c) { if (c !== mb && !c.classList.contains('r3pay-agree')) c.classList.add('r3pay-hide'); });
      if (!$('.r3pay-agree', bar)) { var ag2 = document.createElement('p'); ag2.className = 'r3pay-agree r3pay-agree--m'; ag2.innerHTML = '강의 및 결제 정보를 확인했으며, <a href="/terms#terms" target="_blank" rel="noopener">이용약관</a> 및 <a href="/terms#refund" target="_blank" rel="noopener">환불 규정</a>에 동의합니다.'; bar.appendChild(ag2); }
      document.documentElement.classList.add('r3pay-hasm');
    });
  }

  // (10/27) 쿠폰·적립금 — 아임웹 주문서 기본 기능(쿠폰 선택 창·포인트 입력)을 그대로 쓰고 모양·순서·문구만 정리해요.
  //   실제 할인·차감·PG 금액·환불 때 복원은 아임웹이 처리(우리 코드는 금액을 계산하지 않음).
  //   순서: 주문 상품 → 결제 수단 → 쿠폰 사용 → 적립금 사용 → 추가정보(추천인 코드) (CSS order, 아임웹 요소는 옮기지 않음)
  function info(h, html) {
    if (!h) return;
    var s = $('.r3pay-hinfo', h);
    if (!s) { s = document.createElement('span'); s.className = 'r3pay-hinfo'; h.appendChild(s); }
    if (s.innerHTML !== html) s.innerHTML = html;
  }
  function benefits(root, left, secProd) {
    function wrap(h) { var b = box(h); return b && b.parentElement && b.parentElement.parentElement === left ? b.parentElement : null; }
    var wp = secProd.parentElement; if (wp && wp.parentElement === left) wp.classList.add('r3pay-w--prod');
    // 쿠폰 창 제목 띄어쓰기 '쿠폰적용' → '쿠폰 적용' (창은 주문서 바깥에 그려져요)
    $$('.ReactModal__Content span').forEach(function (s) { if (clean(s.textContent) === '쿠폰적용') setText(s, '쿠폰 적용'); });
    var we = wrap(hd(root, '추가정보')); if (we) we.classList.add('r3pay-w--extra');
    if (we) $$('p', we).forEach(function (p) { if (/^추천인 코드/.test(clean(p.textContent))) p.classList.add('r3pay-xlabel'); else p.classList.add('r3pay-xhelp'); });
    // 쿠폰
    var hC = hd(root, '쿠폰'), wc = wrap(hC);
    if (wc) {
      wc.classList.add('r3pay-w--coupon');
      setText(hC, '쿠폰 사용');
      var cb = $('label button', wc), lb = cb && clean(cb.textContent), m = lb && lb.match(/^사용 가능\s*(\d+)\s*장$/);
      var cnt = m ? +m[1] : wc.hasAttribute('data-coupons') ? +wc.getAttribute('data-coupons') : null; // 문구를 바꾼 뒤엔 처음 읽은 장수를 써요
      if (cb) {
        cb.classList.add('r3pay-field', 'r3pay-field--select');
        var sp = $('span', cb) || cb;
        if (m) setText(sp, cnt ? '사용할 쿠폰을 선택해 주세요' : '사용 가능한 쿠폰이 없습니다');
        cb.classList.toggle('is-empty', cnt === 0);
        var row = cb.closest('label') && cb.closest('label').parentElement, sel = row && row.nextElementSibling;
        if (sel) sel.classList.add('r3pay-csel');
      }
      if (cnt !== null) wc.setAttribute('data-coupons', cnt);
      info(hC, cnt === null ? '' : cnt ? '사용 가능 쿠폰 <b>' + cnt + '장</b>' : '');
    }
    // 적립금(아임웹 이름 '포인트')
    var hP = hd(root, '포인트') || hd(root, '적립금 사용'), wpt = wrap(hP);
    if (wpt) {
      wpt.classList.add('r3pay-w--point');
      setText(hP, '적립금 사용');
      // '전액 사용'은 form 바로 아래 버튼. 입력칸 안 지우기(×) 버튼(전액 사용 누르면 생김)은 제외
      var form = $('form', wpt), inp = form && $('input', form), all = form && $$('button', form).filter(function (b) { return b.parentElement === form; })[0];
      if (form) $$('button', form).forEach(function (b) { if (b !== all) { b.classList.remove('r3pay-allbtn'); b.classList.add('r3pay-pclear'); } });
      if (form) form.classList.add('r3pay-pform');
      if (inp) { inp.classList.add('r3pay-pinput'); if (inp.parentElement !== form) inp.parentElement.classList.add('r3pay-field'); if (inp.placeholder !== '사용할 금액 입력') inp.placeholder = '사용할 금액 입력'; }
      if (all) { all.classList.add('r3pay-allbtn'); setText(all, '전액 사용'); }
      // '사용 가능 포인트 10,000 / 보유 포인트 10,000' → 제목 오른쪽 '사용 가능 10,000원', 원래 줄은 숨김
      var line = form && form.nextElementSibling, nums = line ? textNums(line) : [], avail = nums.length ? nums[0] : null;
      if (line) line.classList.add('r3pay-hide');
      info(hP, avail === null ? '' : avail ? '사용 가능 <b>' + won(avail) + '</b>' : '');
      wpt.classList.toggle('is-zero', avail === 0);
      var z = $('.r3pay-pzero', wpt);
      if (avail === 0 && !z) { z = document.createElement('p'); z.className = 'r3pay-pzero'; z.textContent = '사용 가능한 적립금이 없습니다.'; wpt.appendChild(z); }
      else if (avail !== 0 && z) z.remove();
    }
    // 오른쪽 결제 금액: '포인트 사용' → '적립금 사용', '0 포인트 적립 예정' 줄은 숨김, 총 결제 금액 줄 표시
    var sumBox = box(hd(root, '결제 금액'));
    if (sumBox) {
      $$('span', sumBox).forEach(function (s) {
        var v = clean(s.textContent);
        if (v === '포인트 사용') setText(s, '적립금 사용');
        if (v === '상품 할인금액') setText(s, '상품 할인');
        if (v === '총 결제 금액' && s.parentElement) s.parentElement.classList.add('r3pay-total');
      });
      // 적립 비율 0%(10/27 설정)라 '0 포인트 적립 예정' 줄은 숨겨요
      $$('div, p', $('.r3pay-right') || sumBox).forEach(function (d) { if (d.children.length > 3) return; if (/^0\s*포인트\s*적립\s*예정$/.test(clean(d.textContent))) d.classList.add('r3pay-hide'); });
    }
  }

  // (10/29) 주문 완료 화면: '방문수령 정보'·'배송지 정보' 줄(주소)을 숨겨요 — 온라인 강의라 받을 곳이 없어요
  function doneDress() {
    var host = document.getElementById('oms-shop-payment-complete'); if (!host) return;
    $$('*', host).filter(function (e) { return !e.children.length && /^(방문수령|배송지|배송 정보|받는 ?분)/.test(clean(e.textContent)); }).forEach(function (e) {
      // 그 글자가 든 줄(이름 + 값 묶음)까지 올라가서 숨겨요: 위로 올라가다 '결제' 줄을 함께 품기 직전까지
      var r = e;
      while (r.parentElement && r.parentElement !== host && !/결제/.test(clean(r.parentElement.textContent))) r = r.parentElement;
      r.classList.add('r3done-hide');
    });
  }
  var busy = false, t = 0;
  function run() { if (busy) return; busy = true; try { dress(); doneDress(); } catch (e) { } busy = false; }
  if (window.SFUI && SFUI.register) SFUI.register('r3Pay', function () { run(); });
  setTimeout(function () { document.documentElement.classList.add('r3pay-ready'); }, 3000);
  var n = 0;
  (function wait() { run(); if (!document.querySelector('.r3pay-cards') && n++ < 60) setTimeout(wait, 250); })();
  // (10/27) 아임웹이 주문서를 다시 그리면(전액 사용 등) 화면에 그려지기 전에 바로 다시 꾸며요(예전 모양이 잠깐 보이던 것). 우리 변경은 문구·class 뿐이라 다시 불리지 않아요
  new MutationObserver(function () { if (busy) return; clearTimeout(t); if (document.getElementById('oms-shop-payment')) run(); else t = setTimeout(run, 80); }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('change', function (e) { if (e.target && e.target.type === 'radio') setTimeout(run, 30); }, true);
})()
