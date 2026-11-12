// 원본: src/r3-pay.js
/* r3-pay.js — 주문서(/shop_payment) 월부식 정리 (10/20)
   아임웹 주문서는 화면을 스스로 다시 그려요 → 아임웹 요소는 옮기지 않고 class 만 붙여 CSS로 배치하고,
   우리 요소(상품 카드 · 결제 수단 타일)만 새로 넣어요. 실제 결제·입력은 아임웹 원래 요소가 그대로 처리해요.
   - 제목 '주문결제'(왼쪽 정렬) · 상품 카드(16:9 썸네일 · 태그 · 제목 · 고른 옵션 · 금액)
   - 주문자 정보: 값이 다 채워져 있으면(로그인 회원) 숨기고, 빈 칸이 있으면 그대로 보여요
   - 결제 수단: 타일 버튼(누르면 아임웹 라디오를 대신 눌러요) · 오른쪽 '결제 금액' + 결제하기
   - (10/27) 쿠폰 사용 · 적립금 사용(아임웹 기본 기능) — 결제 수단 아래, 입력칸 50px·8px·#DADDE2 통일 */
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function txt(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  // (10/29) 주문 완료 화면: '방문수령 정보'·'배송지 정보' 줄(주소)을 숨겨요 — 온라인 강의라 받을 곳이 없어요
  if (/^\/shop_payment_complete/.test(location.pathname)) {
    var doneDress = function () {
      var host = document.getElementById('oms-shop-payment-complete'); if (!host) return;
      if (/배송비\s*\+?\s*[1-9][\d,]*\s*원/.test(clean(host.textContent))) return; // (11/11) 실물 배송 주문은 배송지 줄을 보여줘요
      $$('*', host).filter(function (e) { return !e.children.length && /^(방문수령|배송지|배송 정보|받는 ?분)/.test(clean(e.textContent)); }).forEach(function (e) {
        // 그 글자가 든 줄(이름 + 값 묶음)까지 올라가서 숨겨요: 위로 올라가다 '결제' 줄을 함께 품기 직전까지
        //   (10/30) 무통장 주문은 '입금 계좌·입금 기한·주문번호'가 같은 상자에 있어서 계좌까지 숨겨졌어요 → 그 글자를 품기 직전에서도 멈춰요
        var r = e;
        while (r.parentElement && r.parentElement !== host && !/결제|입금|계좌|주문번호/.test(clean(r.parentElement.textContent))) r = r.parentElement;
        r.classList.add('r3done-hide');
      });
    };
    doneDress();
    new MutationObserver(doneDress).observe(document.documentElement, { childList: true, subtree: true });
    return;
  }
  if (!/^\/shop_payment\/?$/.test(location.pathname)) return;
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'; }
  function num(t) { return parseInt(String(t || '').replace(/[^\d]/g, ''), 10) || 0; }

  // 아임웹(React)이 가진 글자 노드는 그대로 두고 값만 바꿔요
  function setText(el, v) { if (!el) return; var n = [].slice.call(el.childNodes).filter(function (c) { return c.nodeType === 3 && c.nodeValue.trim(); })[0]; if (n) { if (n.nodeValue !== v) n.nodeValue = v; } else if (!el.children.length) el.textContent = v; }
  function hd(root, t) { return $$('header', root).filter(function (h) { return clean(h.textContent).indexOf(t) === 0; })[0]; }
  function box(h) { return h && h.parentElement; }

  // (11/10 사장님) 회원 주문자 정보: '빠진 정보 입력하고 계속' 안내 없이 '수정'만 — 누르면 칸 아래 '저장'이 나와요.
  //   저장은 칸을 확인(이름·연락처·이메일)한 뒤 요약으로 접어요. 값은 아임웹 입력칸에 그대로 남아 이번 주문에 쓰여요(회원정보는 바꾸지 않음)
  var buyerSaved = false;
  function buyerSave(sec) {
    var form = $('form', sec), inputs = form ? $$('input', form).filter(function (i) { return BUYER[i.name]; }) : [];
    // 이번 주문 입력과 회원 저장은 별개. 회원 저장은 기존 인증 폼을 통해서만 진행해요.
    if (!$('.r3pay-profile-link', sec) && window.SFUI && SFUI.checkoutProfile) {
      var help = document.createElement('p'); help.className = 'r3pay-profile-link';
      help.appendChild(document.createTextNode('다음 신청에도 사용할 정보는 '));
      var edit = document.createElement('a'); edit.href = SFUI.checkoutProfile.profileUrl(true); edit.textContent = '회원정보에서 수정';
      help.appendChild(edit); sec.appendChild(help);
    }
    sec.classList.toggle('r3pay-bsaved', buyerSaved && inputs.length > 0);
    var mine = $('.r3pay-bsum--mine', sec);
    if (!buyerSaved || !inputs.length) { if (mine) mine.remove(); }
    if (!inputs.length) return;
    if (buyerSaved) {
      var sig = inputs.map(function (i) { return i.name + '=' + clean(i.value); }).join('|');
      if (!mine) { mine = document.createElement('div'); mine.className = 'r3pay-bsum r3pay-bsum--mine'; sec.appendChild(mine); }
      if (mine.getAttribute('data-sig') !== sig) {
        mine.setAttribute('data-sig', sig);
        mine.innerHTML = inputs.map(function (i) { return '<p data-label="' + BUYER[i.name] + '">' + txt(clean(i.value)) + '</p>'; }).join('') + '<button type="button" class="r3pay-bsum__edit">수정</button>';
        $('button', mine).addEventListener('click', function () { buyerSaved = false; run(); var f = buyerFields(sec)[0]; if (f) f.focus(); });
      }
      return;
    }
    if ($('.r3pay-bsave', form)) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'r3pay-bsave'; b.textContent = '이번 주문에 적용';
    b.addEventListener('click', function () {
      var first = null;
      buyerFields(sec).forEach(function (i) {
        var w = i.parentElement, msg = buyerBad(i);
        w.classList.toggle('is-err', !!msg); w.setAttribute('data-err', msg);
        i.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) i.setAttribute('aria-description', msg); else i.removeAttribute('aria-description');
        if (msg && !first) first = i;
      });
      if (first) { first.focus(); return; }
      buyerSaved = true; run();
    });
    form.appendChild(b);
  }

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
  function methodLabel(r, i) {
    var label = clean((r.closest('label') || r.parentElement).textContent);
    if (/^신용\s*카드$/.test(label)) return '신용/체크카드';
    if (/^실시간\s*계좌\s*이체$/.test(label)) return '퀵계좌이체';
    return label || ('결제 수단 ' + (i + 1));
  }
  function methodIcon(label) {
    // Toss Brand Resource Center, Toss_Symbol_Primary.
    if (/토스\s*페이|퀵계좌이체/.test(label)) {
      return '<span class="r3pay-toss-icon"></span>';
    }
    if (/카드/.test(label)) {
      return '<span class="r3pay-card-icon"></span>';
    }
    if (/입금|가상계좌/.test(label)) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="#6184bb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13l2-7h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5h5l2 3h4l2-3h5" fill="#e4ecfa"/><path d="M12 5v7m-3-3 3 3 3-3"/></svg>';
    }
    return '';
  }
  function methodTiles(radios) {
    if (!radios.length) return null;
    var wrap = document.createElement('section');
    wrap.className = 'r3pay-sec r3pay-methods';
    wrap.innerHTML = '<h3 class="r3pay-sec__h">결제 수단</h3><div class="r3pay-tiles" role="radiogroup" aria-label="결제 수단"></div>';
    var tiles = $('.r3pay-tiles', wrap);
    radios.forEach(function (r, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'r3pay-tile'; b.setAttribute('role', 'radio');
      var label = methodLabel(r, i), icon = methodIcon(label);
      b.innerHTML = '<span class="r3pay-tile__icon" aria-hidden="true">' + icon + '</span>' +
        '<span class="r3pay-tile__label">' + txt(label) + '</span><span class="r3pay-tile__check" aria-hidden="true"></span>';
      b.addEventListener('click', function () {
        var input = radios[i];
        if (!input || !document.documentElement.contains(input) || input.disabled || input.checked) return;
        input.click();
        sync(radios);
      });
      tiles.appendChild(b);
    });
    function sync(current) {
      radios = current;
      var tabStop = radios.filter(function (r) { return r.checked && !r.disabled; })[0] ||
        radios.filter(function (r) { return !r.disabled; })[0];
      $$('.r3pay-tile', tiles).forEach(function (b, i) {
        var input = radios[i], on = input.checked ? 'true' : 'false';
        b.classList.toggle('is-on', input.checked);
        if (b.getAttribute('aria-checked') !== on) b.setAttribute('aria-checked', on);
        if (b.disabled !== input.disabled) b.disabled = input.disabled;
        b.tabIndex = input === tabStop ? 0 : -1;
      });
    }
    tiles.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!step) return;
      var enabled = $$('.r3pay-tile:not(:disabled)', tiles), index = enabled.indexOf(e.target);
      if (index < 0) return;
      e.preventDefault();
      var next = enabled[(index + step + enabled.length) % enabled.length];
      next.focus();
      next.click();
    });
    sync(radios); wrap.__sync = sync;
    return wrap;
  }

  function isPayAction(button) {
    return /^(?:[\d,]+\s*원\s*)?결제하기$|^(?:무료로 )?신청하기$/.test(clean(button.textContent));
  }
  // 금액은 쿠폰·적립금·배송비가 이미 반영된 아임웹 주문 요약에서 읽어요.
  function orderAmount(summary, label) {
    var name = $$('span, p, div', summary).filter(function (el) {
      return !el.children.length && label.test(clean(el.textContent));
    })[0];
    var amount = name && name.nextElementSibling, value = clean(amount && amount.textContent);
    if (/^[\d,]+\s*원$/.test(value)) return { node: amount, value: num(value) };
    if (value === '무료') return { node: amount, value: 0 };
    return null;
  }
  function setPayAction(button, label) {
    if (!button || clean(button.textContent) === label) return;
    var node = [button].concat($$('*', button)).filter(function (el) {
      return !el.children.length && isPayAction(el);
    })[0];
    if (node) setText(node, label);
  }

  function dress() {
    var root = document.getElementById('oms-shop-payment'); if (!root) return;
    var hProd = hd(root, '주문 상품'), hSum = hd(root, '주문 요약') || hd(root, '결제 금액');
    if (!hProd || !hSum) return;
    document.documentElement.classList.add('r3pay-on');
    if (!document.documentElement.classList.contains('r3pay-ready')) {
      setTimeout(function () { document.documentElement.classList.add('r3pay-ready'); }, 0);
    }
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

    // 주문자 정보: (11/6 사장님) 늘 보여요 — 예전엔 값이 다 채워지면 숨겨서, 회원이 '수정'을 누르면 칸이 사라졌어요
    //   입력칸마다 위에 이름표(이름·연락처·이메일 · 필수 *)를 달아요(아임웹 칸 감싸개에 data-label + CSS ::before)
    var hBuy = hd(root, '주문자 정보'), secBuy = box(hBuy);
    if (secBuy) {
      secBuy.classList.remove('r3pay-hide'); secBuy.classList.add('r3pay-box--buyer');
      $$('blockquote', secBuy).forEach(function (q) { q.classList.add('r3pay-hide'); });
      buyerFields(secBuy).forEach(function (i) {
        var w = i.parentElement, lb = BUYER[i.name];
        if (w && w.getAttribute('data-label') !== lb) { w.setAttribute('data-label', lb); w.classList.add('r3pay-bfield'); }
      });
      // (11/6 사장님) 로그인 회원은 아임웹 요약(이름·연락처·이메일 + '수정')을 그대로 쓰고 모양만 — 줄마다 이름표
      //   연락처·이메일이 비어 있으면(예전 간편 로그인 가입자 등) 아임웹 '수정'을 한 번 눌러 입력칸을 열어요 → 위 필수 확인이 채우게 해요
      var sum = $$('button', secBuy).filter(function (b) { return clean(b.textContent) === '수정'; })[0], sb = sum && sum.parentElement;
      if (sb && !$('input', sb)) {
        sb.classList.add('r3pay-bsum'); sum.classList.add('r3pay-bsum__edit');
        var has = { n: 0, c: 0, e: 0 };
        $$('p', sb).forEach(function (p) {
          var v = clean(p.textContent), k = /@/.test(v) ? 'e' : /^[\d\s()+-]{8,}$/.test(v) ? 'c' : 'n';
          if (v) has[k] = 1;
          var lb = { n: '이름', c: '연락처', e: '이메일' }[k]; p.getAttribute('data-label') !== lb && p.setAttribute('data-label', lb);
        });
        if ((!has.c || !has.e || !has.n) && !secBuy.__sfOpened) { secBuy.__sfOpened = 1; sum.click(); }
      }
      if (window.MEMBER_HASH) buyerSave(secBuy);
    }

    // (10/29) 강의·라이브·모임은 받을 물건이 없어요 → 아임웹 '방문수령 위치'·'배송지' 칸 숨김
    //   (일반 상품이라 아임웹이 그려요. 입력 필수가 아님 — 0원 주문 6건으로 확인. 필수 칸이 비어 있으면 숨기지 않아요)
    // (11/11) 실물 배송 상품(배송비가 붙은 주문: 교안·워크북)은 주소를 받아야 해서 그대로 둬요
    var SHIP = /배송비\s*\+?\s*[1-9][\d,]*\s*원/.test(clean(root.textContent));
    ['방문수령', '배송지', '배송 정보', '배송 요청'].forEach(function (t) {
      var b = box(hd(root, t));
      if (!b) return;
      var show = SHIP || $$('input[required], textarea[required]', b).some(function (i) { return !clean(i.value); });
      b.classList.toggle('r3pay-box--shipping', show);
      b.classList.toggle('r3pay-hide', !show);
      if (b.parentElement && b.parentElement.parentElement === left) b.parentElement.classList.toggle('r3pay-hide', !show);
    });

    // 결제 수단: 왼쪽에 타일, 아임웹 원래 칸은 숨김(라디오는 그대로 동작)
    var hMeth = hd(root, '결제 수단'), secMeth = box(hMeth);
    var tiles = $('.r3pay-methods', left), radios = secMeth ? $$('input[type=radio]', secMeth) : [];
    if (secMeth) {
      // Subscription checkout has a native billing-registration button, not radios.
      // Hide native methods only when replacement tiles can actually be drawn.
      secMeth.classList.toggle('r3pay-hide', radios.length > 0);
      secMeth.classList.toggle('r3pay-native-method', !radios.length);
      // (11/6 사장님) 0원 신청(무료 라이브·모임)은 고를 결제 수단이 없어요 → 아임웹 '결제금액이 0원 입니다 · 포인트 사용금액 변경' 칸 숨김
      !radios.length && /결제\s*금액이\s*0\s*원/.test(clean(secMeth.textContent)) && secMeth.classList.add('r3pay-hide');
    }
    if (!radios.length) {
      if (tiles) tiles.remove();
    } else {
      var buttons = tiles ? $$('.r3pay-tile', tiles) : [];
      if (buttons.length !== radios.length || radios.some(function (r, i) { return $('.r3pay-tile__label', buttons[i]).textContent !== methodLabel(r, i); })) {
        if (tiles) tiles.remove();
        tiles = methodTiles(radios);
        var extra = box(hd(root, '추가정보'));
        var anchor = extra ? extra.parentElement : null;
        if (anchor && anchor.parentElement === left) left.insertBefore(tiles, anchor); else left.appendChild(tiles);
      } else tiles.__sync(radios);
    }

    // 오른쪽: '결제 금액'
    var summary = box(hSum);
    summary.classList.add('r3pay-summary');
    setText(hSum, '결제 금액');
    $$('span', summary).forEach(function (s) { var v = clean(s.textContent); if (v === '총 주문금액') setText(s, '총 결제 금액'); if (v === '상품가격') setText(s, '상품 금액'); });
    var AGREE = '상품 및 결제 정보를 확인했으며,<br><a href="/terms#terms" target="_blank" rel="noopener">운영정책</a> 및 <a href="/terms#refund" target="_blank" rel="noopener">환불규정</a>에 동의합니다.';
    var hTerm = hd(root, '이용 및 정보 제공 약관'), tb = box(hTerm);
    if (tb) {
      tb.classList.add('r3pay-box--terms');
        tb.classList.toggle('r3pay-terms-quiet', !$('input:not([type=hidden]), [role=checkbox], button, select, textarea', tb));
    }
    var sub = $$('button[type=submit]', root).filter(isPayAction)[0];
    if (sub) sub.classList.add('r3pay-submit');
    if (sub && !(sub.nextElementSibling && sub.nextElementSibling.classList.contains('r3pay-agree'))) {
      var old = $('.r3pay-agree:not(.r3pay-agree--m)', root); if (old) old.remove();
      var ag = document.createElement('p'); ag.className = 'r3pay-agree';
      ag.innerHTML = AGREE;
      sub.parentNode.insertBefore(ag, sub.nextSibling);
    }
    var extraBox = box(hd(root, '추가정보')); if (extraBox) extraBox.classList.add('r3pay-box--extra');
    // (11/6 사장님) 라이브 신청은 추천인 코드(추가정보 · 선택 입력)를 받지 않아요 → 칸과 감싸는 줄을 숨겨요
    if (extraBox && /LIVE|라이브/i.test(clean(secProd.textContent))) {
      extraBox.classList.add('r3pay-hide');
      extraBox.parentElement && extraBox.parentElement.parentElement === left && extraBox.parentElement.classList.add('r3pay-hide');
    }
    benefits(root, left, secProd);
    // 모바일: 아임웹이 따로 그리는 아래 고정 '결제하기' 줄 — 버튼은 주황, 아래 문구는 우리 동의 문구(링크)로 (10/21)
    var mobile = $$('button[type=button]').filter(function (b) {
      return b.classList.contains('r3pay-mbtn') ||
        b.offsetParent && !b.closest('header, footer, [role=dialog]') && /^결제하기$/.test(clean(b.textContent));
    });
    mobile.forEach(function (mb) {
      mb.classList.add('r3pay-mbtn');
      var bar = mb.parentElement; if (!bar) return;
      bar.classList.add('r3pay-mbar');
      [].slice.call(bar.children).forEach(function (c) { if (c !== mb && !c.classList.contains('r3pay-agree')) c.classList.add('r3pay-hide'); });
      if (!$('.r3pay-agree', bar)) { var ag2 = document.createElement('p'); ag2.className = 'r3pay-agree r3pay-agree--m'; ag2.innerHTML = AGREE; bar.appendChild(ag2); }
    });
    document.documentElement.classList.toggle('r3pay-hasm', mobile.some(function (b) { return !!b.offsetParent; }));
    var total = orderAmount(summary, /^총\s*(결제|주문)\s*금액$/);
    var product = orderAmount(summary, /^상품\s*(금액|가격)$/);
    var prod0 = !!product && product.value === 0;
    var label = '결제하기';
    if (total) {
      label = total.value === 0 && prod0 ? '무료로 신청하기' : won(total.value) + ' 결제하기';
      if (total.value === 0 && product && !prod0 && clean(total.node.textContent) === '무료') setText(total.node, '0원');
    }
    [sub].concat(mobile).forEach(function (button) { setPayAction(button, label); });
    // 완료 화면(patch/25)이 '무료'를 쓸지 정하도록 적어 둬요
    try { sessionStorage.setItem('sf-pay-free', prod0 ? '1' : '0'); } catch (x) {}
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
    if (we) $$('blockquote, p', we).forEach(function (p) {
      var copy = clean(p.textContent);
      if (/^추천인 코드/.test(copy)) p.classList.add('r3pay-xlabel');
      else if (/^(추천해 준 분이 있다면 알려 주세요|공유 링크로 들어오면 자동으로 입력돼요\..*추천해 준 분)/.test(copy)) p.classList.add('r3pay-hide');
      else if (p.tagName === 'P') p.classList.add('r3pay-xhelp');
    });
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
    // (11/6 사장님) 라이브 신청은 적립금 칸도 숨겨요(추천인 코드와 같이)
    if (wpt && /LIVE|라이브/i.test(clean(secProd.textContent))) { wpt.classList.add('r3pay-hide'); wpt = null; }
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

  // (11/6 사장님) 주문자 이름·연락처·이메일은 필수 — 칸이 보일 때(비회원·회원 수정 중) 비어 있거나 형식이 틀리면 신청·결제를 막고 그 칸을 알려요
  //   아임웹보다 먼저(문서 capture 단계) 확인해요. 칸이 안 보이면(회원 요약 화면) 아임웹 저장값을 쓰니 막지 않아요
  var BUYER = { ordererName: '이름', ordererCall: '연락처', ordererEmail: '이메일' };
  function buyerFields(sec) { return $$('input', sec).filter(function (i) { return BUYER[i.name] && i.getBoundingClientRect().height > 0; }); }
  function buyerBad(i) {
    var v = clean(i.value);
    if (!v) return { ordererName: '이름을', ordererCall: '연락처를', ordererEmail: '이메일을' }[i.name] + ' 입력해 주세요';
    if (i.name === 'ordererCall' && v.replace(/\D/g, '').length < 9) return '연락처를 확인해 주세요';
    if (i.name === 'ordererEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '이메일 형식을 확인해 주세요';
    return '';
  }
  function buyerCheck(e) {
    var b = e.target.closest && e.target.closest('button');
    if (!b || !isPayAction(b)) return;
    var root = document.getElementById('oms-shop-payment'), sec = root && box(hd(root, '주문자 정보'));
    if (!sec) return;
    var first = null;
    buyerFields(sec).forEach(function (i) {
      var w = i.parentElement, msg = buyerBad(i);
      w.classList.toggle('is-err', !!msg); w.setAttribute('data-err', msg);
      i.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) i.setAttribute('aria-description', msg);
      else i.removeAttribute('aria-description');
      if (msg && !first) first = i;
    });
    if (!first) return;
    e.preventDefault(); e.stopImmediatePropagation();
    first.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { first.focus(); }, 300);
  }
  document.addEventListener('click', buyerCheck, true);
  document.addEventListener('input', function (e) { var w = e.target && e.target.parentElement; if (w && w.classList.contains('is-err') && !buyerBad(e.target)) { w.classList.remove('is-err'); w.setAttribute('data-err', ''); e.target.setAttribute('aria-invalid', 'false'); e.target.removeAttribute('aria-description'); } }, true);

  var busy = false, t = 0;
  function run() { if (busy) return; busy = true; try { dress(); } catch (e) { } busy = false; }
  if (window.SFUI && SFUI.register) SFUI.register('r3Pay', function () { run(); });
  setTimeout(function () { document.documentElement.classList.add('r3pay-ready'); }, 3000);
  var n = 0;
  (function wait() { run(); if (!document.querySelector('.r3pay-cards') && n++ < 60) setTimeout(wait, 250); })();
  // (10/27) 아임웹이 주문서를 다시 그리면(전액 사용 등) 화면에 그려지기 전에 바로 다시 꾸며요(예전 모양이 잠깐 보이던 것). 우리 변경은 문구·class 뿐이라 다시 불리지 않아요
  var checkoutHost = '#oms-shop-payment, .ReactModal__Content, .r3pay-mbar';
  new MutationObserver(function (records) {
    if (records.some(function (record) {
      if (record.type === 'characterData') {
        return record.target.parentElement && record.target.parentElement.closest('.r3pay-summary, .r3pay-submit, .r3pay-mbtn');
      }
      return record.target.closest && record.target.closest(checkoutHost) ||
        [].some.call(record.addedNodes, function (node) {
          return node.nodeType === 1 && (node.matches(checkoutHost) || node.querySelector(checkoutHost) ||
            [node].concat($$('button[type=button]', node)).some(function (el) {
              return el.matches('button[type=button]') && clean(el.textContent) === '결제하기';
            }));
        });
    })) run();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', run);
  document.addEventListener('change', function (e) {
    if (e.target && e.target.type === 'radio' && e.target.closest('#oms-shop-payment')) {
      clearTimeout(t);
      t = setTimeout(run, 0);
    }
  }, true);
})()
