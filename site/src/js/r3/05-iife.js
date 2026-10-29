// 원본: src/r3-options.js
/* r3-options.js — 교육 상세 '수강 옵션 여러 개 고르기' (클래스101식)
   아임웹 옵션(드롭다운 또는 select)을 그대로 쓰되, 화면에는 고르기 쉬운 '옵션 카드'를 보여 줘요.
   - 카드를 누르면 아임웹 원래 옵션 항목을 대신 눌러요 → 아임웹이 '선택한 옵션' 줄을 추가하고 합계를 계산해요(결제 로직은 아임웹 그대로)
   - 이미 고른 옵션은 카드에 '선택됨' 표시, 다시 누르면 그 줄로 이동
   - 선택한 줄(수량 −/+, 삭제, 금액)은 r3-optrow 로 표시해 CSS로 다듬어요
   아임웹 화면 구조가 바뀌어도 깨지지 않게, 찾지 못하면 아무것도 하지 않아요. */
(function () {
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function txt(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  // "다시보기 추가 (+50,000원)" → { name, add }
  function parse(t) {
    t = clean(t).replace(/\s*[\[［(（]\s*(품절|마감|sold\s*out)\s*[\]］)）]\s*/ig, ' ').trim();
    var m = t.match(/^(.*?)\s*[\(（]\s*([+\-]?\s*[\d,]+)\s*원\s*[\)）]\s*(.*)$/);
    if (m) return { name: clean(m[1] + ' ' + m[3]), add: m[2].replace(/\s/g, '') };
    var m2 = t.match(/^(.*?)\s*[-·]\s*([\d,]+)\s*원$/);
    if (m2) return { name: clean(m2[1]), add: m2[2] };
    return { name: t, add: '' };
  }
  function soldOut(t) { return /품절|마감|sold\s*out/i.test(t); }

  function enhance(form) {
    var groups = [];
    // ① 아임웹 드롭다운형 옵션
    // 실제 구조(2026-10): .goods_select ._form_select_wrap > a.dropdown-toggle + .dropdown-menu > .dropdown-item > a._requireOption
    //   항목 안: span(이름) + strong(그 옵션의 최종 가격 "300,000원")
    $$('.goods_select .dropdown-toggle, ._form_select_wrap > .dropdown-toggle', form).forEach(function (tg) {
      var menu = tg.parentElement && tg.parentElement.querySelector('.dropdown-menu');
      if (!menu || tg.closest('.r3-opt-src')) return;
      // 필수 옵션: .dropdown-item > a._requireOption / 선택(추가) 옵션: .dropdown-item > div.tabled[onclick] > … > a
      var items = $$('.dropdown-item', menu).map(function (di) { return di.querySelector(':scope > a, :scope > button') || di.querySelector('[onclick]') || di.querySelector('a'); })
        .concat($$('li > a, li > button', menu))
        .filter(function (a) { return a && clean(a.textContent) && !/^(선택|옵션 선택)/.test(clean(a.textContent)); });
      if (items.length) groups.push({ label: clean(tg.textContent) || '옵션 선택', box: tg.parentElement, items: items.map(function (a) {
        var nm = a.querySelector('span'), pr = a.querySelector('strong');
        return { el: a, t: a.textContent, name: nm ? clean(nm.textContent) : '', price: pr ? clean(pr.textContent) : '' };
      }), pick: function (it) { it.el.click(); } });
    });
    // ② select 형 옵션
    $$('.goods_select select, .opt-group select', form).forEach(function (sel) {
      if (sel.closest('.r3-opt-src') || /countryList/.test(sel.className)) return;
      var opts = [].slice.call(sel.options).filter(function (o) { return o.value && !/^(선택|옵션 선택|-)/.test(clean(o.text)); });
      if (opts.length) groups.push({ label: clean(sel.options[0] && sel.options[0].text) || '옵션 선택', box: sel, items: opts.map(function (o) { return { el: o, t: o.text }; }), pick: function (it) { sel.value = it.el.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } });
    });
    if (!groups.length) return false;
    groups.forEach(function (g, gi) {
      if (g.box.previousElementSibling && g.box.previousElementSibling.classList.contains('r3-opt')) return;
      var wrap = document.createElement('div');
      wrap.className = 'r3-opt'; wrap.setAttribute('role', 'group');
      var lb = g.label.replace(/\s*[(（]\s*(필수|선택)\s*[)）]\s*$/, '');
      wrap.setAttribute('data-lb', clean(lb)); // (10/29) 선택 줄 '그룹명: 옵션명'과 맞춰 볼 때 써요
      var opt = /\(\s*선택\s*\)\s*$/.test(g.label);
      var head = /^(옵션\s*)?선택$/.test(lb) || !lb ? '수강 옵션 선택' : lb;
      wrap.innerHTML = '<p class="r3-opt__h">' + txt(head) + '<small>' + (opt ? '필요하면 추가로 골라요' : '여러 개 고를 수 있어요') + '</small></p>' +
        g.items.map(function (it, i) {
          var p = parse(it.t), so = soldOut(it.t) || it.el.disabled || /disabled|soldout/.test((it.el.parentElement && it.el.parentElement.className) || '');
          if (it.name) p.name = clean(it.name.replace(/\s*[\[［(（]\s*(품절|마감|sold\s*out)\s*[\]］)）]\s*/ig, ' '));
          var price = it.price ? '<span class="r3-opt__add">' + txt(it.price.replace(/^\+?\s*/, '')) + '</span>'
            : (p.add && !/^[+]?0$/.test(p.add) ? '<span class="r3-opt__add">' + txt(p.add.charAt(0) === '-' ? p.add : '+' + p.add.replace(/^\+/, '')) + '원</span>' : '');
          it.nm = p.name;
          return '<button type="button" class="r3-opt__card' + (so ? ' is-off' : '') + '" data-i="' + i + '"' + (so ? ' disabled' : '') + ' aria-pressed="false">' +
            '<span class="r3-opt__chk" aria-hidden="true"></span><span class="r3-opt__name">' + txt(p.name) + '</span>' + price +
            (so ? '<span class="r3-opt__off">마감</span>' : '') + '</button>';
        }).join('');
      g.box.parentNode.insertBefore(wrap, g.box);
      g.box.classList.add('r3-opt-src');
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('.r3-opt__card'); if (!b || b.disabled) return;
        var it = g.items[+b.getAttribute('data-i')], name = it.nm || parse(it.t).name;
        var row = findRow(form, name, wrap.getAttribute('data-lb'));
        // 이미 고른 카드를 다시 누르면 체크 해제 = 그 줄의 삭제(×) 버튼을 대신 눌러요
        // (10/29) 아임웹은 누르는 즉시 선택 줄·합계를 바꿔요 → 카드 체크도 바로(0초) 고치고, 늦게 다시 그려질 때를 대비해 한 번 더 확인
        if (row) {
          var x = row.querySelector('a[class*="absolute"], button[class*="absolute"], [class*="delete"], [class*="remove"]');
          if (x) { x.click(); mark(form); setTimeout(function () { mark(form); }, 150); return; }
          row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); row.classList.add('is-flash'); setTimeout(function () { row.classList.remove('is-flash'); }, 700); return;
        }
        // (10/29) 미리 그린 옵션(아래 pre)일 때는 아임웹 진짜 옵션이 올 때까지 기다렸다가 대신 눌러요
        if (it.el.closest('[data-sf-pre]')) { b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); pending = { lb: wrap.getAttribute('data-lb'), name: name }; return; }
        g.pick(it);
        mark(form, groups);
        setTimeout(function () { mark(form, groups); }, 120);
      });
    });
    mark(form, groups);
    return true;
  }

  // 선택된 옵션 줄 찾기: 수량 입력칸 + 금액이 있는 블록
  function rows(form) {
    return $$('input', form).filter(function (i) { return /^(text|number|tel)$/i.test(i.type) && !i.closest('.r3-opt') && /^\d+$/.test(i.value || '1'); })
      .map(function (inp) {
        var r = inp; for (var k = 0; k < 6 && r && r !== form; k++) { r = r.parentElement; if (/원/.test(r.textContent) && r.textContent.length < 260 && clean(r.textContent).replace(/[\d,원+\-−×xX\s]/g, '').length > 1) break; }
        return r && r !== form ? r : null;
      }).filter(Boolean);
  }
  // (10/29) 선택 줄 글 = '그룹명: 옵션명 9,900원' → 그룹명까지 맞춰 봐요
  //   (예전엔 이름이 들어 있기만 하면 같다고 봐서, 그룹명 '1:1컨설팅'과 다른 그룹의 옵션 '1:1컨설팅'이 섞였어요)
  function same(t, name, lb) {
    var i = t.indexOf(': ');
    if (i < 0) return t.indexOf(name) >= 0;
    var L = clean(t.slice(0, i)), R = clean(t.slice(i + 2));
    return (!lb || L === lb || L.indexOf(lb) === 0 || lb.indexOf(L) === 0) && R.indexOf(name) === 0;
  }
  function findRow(form, name, lb) { return rows(form).filter(function (r) { return same(clean(r.textContent), name, lb); })[0]; }
  function mark(form, groups) {
    var rs = rows(form);
    rs.forEach(function (r) { r.classList.add('r3-optrow'); });
    var names = rs.map(function (r) { return clean(r.textContent); });
    var cards = $$('.r3-opt__card', form);
    cards.forEach(function (b) {
      var nm = clean(b.querySelector('.r3-opt__name').textContent), w = b.closest('.r3-opt');
      var on = names.some(function (t) { return same(t, nm, w && w.getAttribute('data-lb')); });
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    form.classList.toggle('r3-has-rows', rs.length > 0);
    // (10/29) 옵션 칸이 늦게 그려지면 r3NoOpt 가 '옵션 없는 상품'으로 잘못 보고 합계 칸을 숨겨요 → 옵션 카드나 선택 줄이 있으면 풀어요
    (cards.length || rs.length) && document.documentElement.classList.remove('r3-noopt');
  }

  // 아임웹은 옵션을 고를 때마다 옵션 영역을 새로 그려요 → 카드가 사라지면 다시 만들고, 남아 있으면 표시만 고쳐요
  var busy = false, timer = 0, pending = null;
  function run() {
    var form = document.querySelector('.goods_form_wrap, [data-r3-goods]');
    if (!form || busy) return;
    busy = true;
    try {
      enhance(form);
      mark(form);
      // 미리 그린 옵션에서 누른 카드가 있으면, 진짜 옵션이 들어온 뒤 그 카드를 대신 눌러요
      if (pending && !form.querySelector('[data-sf-pre]')) {
        var p = pending; pending = null;
        var card = $$('.r3-opt', form).filter(function (w) { return w.getAttribute('data-lb') === p.lb; }).map(function (w) {
          return $$('.r3-opt__card', w).filter(function (c) { return clean(c.querySelector('.r3-opt__name').textContent) === p.name; })[0];
        })[0];
        card && setTimeout(function () { card.click(); }, 0);
      }
    } finally { busy = false; }
    if (!form.getAttribute('data-r3-opt')) {
      form.setAttribute('data-r3-opt', '1');
      // (10/29) 수량 −/+ 를 누르면 아임웹이 선택 줄을 지웠다 새로 그려요. 기다렸다 고치면 디자인 없는 줄이 한 번 그려져 합계 칸이 위아래로 튀어요
      //   → 바뀐 즉시(화면에 그리기 전) 바로 고치고, 늦게 끝나는 다시 그리기를 대비해 한 번 더
      new MutationObserver(function () { if (busy) return; run(); clearTimeout(timer); timer = setTimeout(run, 60); }).observe(form, { childList: true, subtree: true });
    }
  }
  // (10/29) 옵션 미리 그리기 — 아임웹은 상품 화면이 그려진 뒤에야 옵션을 따로 받아 와서(약 0.4초) 옵션 칸이 비었다가 카드가 생기며 아래가 밀려요
  //   → 같은 옵션 정보(/shop/load_option.cm, 읽기 전용)를 우리가 먼저(또는 목록에서 상품에 손가락·마우스를 올릴 때) 받아 두고,
  //     옵션 칸이 생기는 즉시 그 내용으로 카드를 그려요. 아임웹 진짜 옵션이 오면 같은 모양으로 바꿔 끼워서 화면이 움직이지 않아요.
  //   결제·선택은 언제나 아임웹 진짜 옵션으로만 해요(미리 그린 동안 누른 카드는 진짜가 오면 대신 눌러요).
  var OPT_TTL = 10 * 60 * 1000, optReq = {}, root = document.documentElement;
  function optKey(idx) { return 'sf_opt_' + idx; }
  function optGet(idx) { try { var o = JSON.parse(sessionStorage.getItem(optKey(idx)) || 'null'); return o && Date.now() - o.at < OPT_TTL ? o : null; } catch (e) { return null; } }
  function optSet(idx, o) { try { sessionStorage.setItem(optKey(idx), JSON.stringify(o)); } catch (e) {} }
  function post(url, data) {
    return fetch(url, { method: 'POST', body: new URLSearchParams(data), credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); }).catch(function () { return null; });
  }
  // 옵션(load_option) + '함께 구매' 추가 상품(load_prod_additional) — 둘 다 아임웹이 상품 화면에서 부르는 읽기 전용 요청이에요
  function optFetch(idx) {
    if (!idx || optReq[idx]) return optReq[idx];
    optReq[idx] = Promise.all([post('/shop/load_option.cm', { type: 'prod', prod_idx: idx }), post('/shop/load_prod_additional.cm', { prod_idx: idx })])
      .then(function (a) {
        var o = a[0], p = a[1];
        if (!o || o.msg !== 'SUCCESS') return null;
        var pa = p && p.msg === 'SUCCESS' && p.prod_additional, has = !!(pa && pa.prod_list && pa.prod_list.length);
        var v = { at: Date.now(), html: o.option_html || '', ad: has ? (pa.html || '') : '', am: has ? (p.prod_additional_sheet_contents || '') : '' };
        optSet(idx, v);
        return v;
      });
    return optReq[idx];
  }
  function idxOf(href) { var m = /[?&]idx=(\d+)/.exec(href || ''); return m && m[1]; }
  function isMob() { var c = window.SHOP_CONST; return window.innerWidth < (c && c.WIDTH_MOBILE || 768); }
  (function () {
    if (!/\/shop_view/.test(location.pathname)) return;
    var idx = idxOf(location.search); if (!idx) return;
    var c = optGet(idx), p = c ? null : optFetch(idx), waits = {};
    // 기다릴 것(옵션 칸 · 추가 상품 칸)이 다 채워질 때까지 아래 합계·신청 버튼을 잠깐 가려요(최대 2.5초) → 버튼이 먼저 보였다가 밀려 내려가지 않게
    function hold(k) { waits[k] = 1; root.classList.add('sf-optwait'); }
    function release(k) { delete waits[k]; Object.keys(waits).length || root.classList.remove('sf-optwait'); }
    setTimeout(function () { waits = {}; root.classList.remove('sf-optwait'); }, 2500);
    function el(id) { return document.getElementById(id); }
    // ① 옵션 칸: 받아 둔 내용으로 바로 그려요(아임웹 진짜 옵션이 오면 같은 모양으로 바꿔 끼움)
    function fillOpt(v) {
      var s = el('prod_options');
      if (s && v && v.html && !s.children.length) {
        s.innerHTML = v.html;
        $$(':scope > *', s).forEach(function (n) { n.setAttribute('data-sf-pre', '1'); });
        run();
        return release('opt');
      }
      // 옵션이 없는 상품: 아임웹이 '총 상품금액' 칸을 늦게 넣어요 → 그 칸이 들어올 때까지 기다렸다 보여 줘요
      var pay = document.querySelector('.goods_form_wrap .goods_payment');
      if (!pay || pay.offsetHeight) return release('opt');
      var mo = new MutationObserver(function () { if (pay.offsetHeight) { mo.disconnect(); release('opt'); } });
      mo.observe(pay, { childList: true, subtree: true });
    }
    // ② '함께 구매' 추가 상품 칸도 같은 방법으로 미리 그려요(아임웹이 PC·휴대폰에서 넣는 내용을 그대로)
    function fillAdd(v) {
      var s = el('prod_additional'), h = v && (isMob() ? v.am : v.ad);
      if (s && h && !s.children.length) {
        s.innerHTML = h;
        $$(':scope > *', s).forEach(function (n) { n.setAttribute('data-sf-pre', '1'); });
      }
      release('add');
    }
    var started = false;
    function start() {
      if (started || !el('prod_options') || !el('prod_additional')) return false;
      started = true;
      if (c) { fillAdd(c); fillOpt(c); } else p.then(function (v) { fillAdd(v); fillOpt(v); });
      return true;
    }
    // 받아 둔 게 없을 때, 그리고 옵션 없는 상품(합계 칸을 아임웹이 늦게 넣음)일 때만 기다려요
    if (!c) { hold('opt'); hold('add'); } else if (!c.html) hold('opt');
    if (start()) return;
    var mo = new MutationObserver(function () { if (start()) mo.disconnect(); });
    mo.observe(root, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 8000);
  })();
  // 목록에서 상품에 마우스를 올리거나 손가락을 대면 그 상품 옵션을 미리 받아 둬요(상품마다 한 번)
  ['pointerover', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href*="shop_view"]');
      var idx = a && idxOf(a.getAttribute('href'));
      idx && !optGet(idx) && optFetch(idx);
    }, { passive: true, capture: true });
  });
  if (window.SFUI && SFUI.register) SFUI.register('r3Options', function () { run(); setTimeout(run, 800); setTimeout(run, 2000); });
  else if (document.readyState !== 'loading') run(); else document.addEventListener('DOMContentLoaded', run);
})()
