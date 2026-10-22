// 원본: src/r3-pay.js
/* r3-pay.js — 주문서(/shop_payment) 월부식 정리 (10/20)
   아임웹 주문서는 화면을 스스로 다시 그려요 → 아임웹 요소는 옮기지 않고 class 만 붙여 CSS로 배치하고,
   우리 요소(상품 카드 · 결제 수단 타일)만 새로 넣어요. 실제 결제·입력은 아임웹 원래 요소가 그대로 처리해요.
   - 제목 '주문결제'(왼쪽 정렬) · 상품 카드(16:9 썸네일 · 태그 · 제목 · 고른 옵션 · 금액)
   - 주문자 정보: 값이 다 채워져 있으면(로그인 회원) 숨기고, 빈 칸이 있으면 그대로 보여요
   - 결제 수단: 타일 버튼(누르면 아임웹 라디오를 대신 눌러요) · 오른쪽 '결제 금액' + 결제하기 */
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

  var busy = false, t = 0;
  function run() { if (busy) return; busy = true; try { dress(); } catch (e) { } busy = false; }
  if (window.SFUI && SFUI.register) SFUI.register('r3Pay', function () { run(); });
  setTimeout(function () { document.documentElement.classList.add('r3pay-ready'); }, 3000);
  var n = 0;
  (function wait() { run(); if (!document.querySelector('.r3pay-cards') && n++ < 60) setTimeout(wait, 250); })();
  new MutationObserver(function () { if (busy) return; clearTimeout(t); t = setTimeout(run, 80); }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('change', function (e) { if (e.target && e.target.type === 'radio') setTimeout(run, 30); }, true);
})()
