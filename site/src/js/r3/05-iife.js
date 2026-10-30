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
      var all = $$('.dropdown-item', menu).map(function (di) { return di.querySelector(':scope > a, :scope > button') || di.querySelector('[onclick]') || di.querySelector('a'); })
        .concat($$('li > a, li > button', menu))
        // (10/30) 안내 항목('선택'·'옵션 선택')만 빼요 — 예전엔 '선택'으로 시작하면 다 빼서 '선택사항' 같은 진짜 옵션이 사라졌어요
        .filter(function (a) { return a && clean(a.textContent) && !/^(선택|옵션\s*선택)\s*$/.test(clean(a.textContent)); });
      // (10/29) 필수 옵션이 2단계 이상(예: 수강 형태 × 기수)이면 아임웹이 뒤 단계에 '○○ 옵션을 선택해주세요.' 안내만 넣어 둬요 → 카드로 만들지 않고 안내 글로
      var items = all.filter(function (a) { return !/선택해\s*주세요/.test(clean(a.textContent)); });
      // 그룹 이름은 옵션 제목(.option_title)에서 — 앞 단계를 고르면 아임웹이 드롭다운 글자를 고른 값으로 바꿔서, 그걸 쓰면 제목이 '온라인 라이브'처럼 바뀌어요
      var ot = tg.parentElement.previousElementSibling;
      while (ot && ot.classList.contains('r3-opt')) ot = ot.previousElementSibling;
      var title = ot && ot.classList.contains('option_title') ? clean(ot.textContent).replace(/\s*\*\s*$/, '') : '';
      // 필수 여부: 옵션 제목 끝 '*' 또는 필수 항목 표시. 안내만 들어 있는 뒤 단계도 필수예요
      var req = !!menu.querySelector('._requireOption') || /\*\s*$/.test(ot ? clean(ot.textContent) : '') || (!items.length && !!all.length);
      if (items.length || all.length) groups.push({ label: title ? title + (req ? '' : ' (선택)') : clean(tg.textContent) || '옵션 선택', req: req, wait: !items.length && all.length ? clean(all[0].textContent) : '', box: tg.parentElement, items: items.map(function (a) {
        var nm = a.querySelector('span'), pr = a.querySelector('strong');
        return { el: a, t: a.textContent, name: nm ? clean(nm.textContent) : '', price: pr ? clean(pr.textContent) : '', zero: !!pr && !clean(pr.textContent) };
      }), pick: function (it) { it.el.click(); } });
    });
    // ② select 형 옵션
    $$('.goods_select select, .opt-group select', form).forEach(function (sel) {
      if (sel.closest('.r3-opt-src') || /countryList/.test(sel.className)) return;
      var opts = [].slice.call(sel.options).filter(function (o) { return o.value && !/^(선택|옵션\s*선택|-+)\s*$/.test(clean(o.text)); });
      if (opts.length) groups.push({ label: clean(sel.options[0] && sel.options[0].text) || '옵션 선택', box: sel, items: opts.map(function (o) { return { el: o, t: o.text }; }), pick: function (it) { sel.value = it.el.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } });
    });
    if (!groups.length) return false;
    // (10/29) 필수 옵션 단계: 마지막 필수 그룹 앞의 필수 그룹들은 '먼저 하나 고르는' 단계예요(골라도 선택 줄이 생기지 않음)
    var reqs = groups.filter(function (g) { return g.req; });
    reqs.slice(0, -1).forEach(function (g) { g.step = true; });
    groups.forEach(function (g, gi) {
      if (g.box.previousElementSibling && g.box.previousElementSibling.classList.contains('r3-opt')) return;
      var wrap = document.createElement('div');
      wrap.className = 'r3-opt'; wrap.setAttribute('role', 'group');
      var lb = g.label.replace(/\s*[(（]\s*(필수|선택)\s*[)）]\s*$/, '');
      wrap.setAttribute('data-lb', clean(lb)); // (10/29) 선택 줄 '그룹명: 옵션명'과 맞춰 볼 때 써요
      g.step && wrap.setAttribute('data-step', '');
      g.req && wrap.setAttribute('data-req', ''); // (10/30) 필수 그룹이 없는 상품(선택 옵션만)은 기본 상품 줄을 보여 줘요(mark)
      var opt = /\(\s*선택\s*\)\s*$/.test(g.label);
      var head = /^(옵션\s*)?선택$/.test(lb) || !lb ? '수강 옵션 선택' : lb;
      wrap.innerHTML = '<p class="r3-opt__h">' + txt(head) + '<small>' + (g.step ? '하나 골라요' : opt ? '필요하면 추가로 골라요' : '여러 개 고를 수 있어요') + '</small></p>' +
        (g.wait ? '<p class="r3-opt__wait">' + txt(g.wait.replace(/선택해\s*주세요\.?/, '먼저 골라 주세요')) + '</p>' : '') +
        g.items.map(function (it, i) {
          var p = parse(it.t), so = soldOut(it.t) || it.el.disabled || /disabled|soldout/.test((it.el.parentElement && it.el.parentElement.className) || '');
          if (it.name) p.name = clean(it.name.replace(/\s*[\[［(（]\s*(품절|마감|sold\s*out)\s*[\]］)）]\s*/ig, ' '));
          // (10/30) 가격 칸이 비어 있는 항목(0원 옵션)도 '0원'으로 보여요(앞 단계 카드는 값이 다음 단계에서 정해져서 빼요)
          var price = it.price ? '<span class="r3-opt__add">' + txt(it.price.replace(/^\+?\s*/, '')) + '</span>' : it.zero && !g.step ? '<span class="r3-opt__add">0원</span>'
            : (p.add && !/^[+]?0$/.test(p.add) ? '<span class="r3-opt__add">' + txt(p.add.charAt(0) === '-' ? p.add : '+' + p.add.replace(/^\+/, '')) + '원</span>' : '');
          it.nm = p.name;
          return '<button type="button" class="r3-opt__card' + (so ? ' is-off' : '') + '" data-i="' + i + '"' + (so ? ' disabled' : '') + ' aria-pressed="false">' +
            '<span class="r3-opt__chk" aria-hidden="true"></span><span class="r3-opt__name">' + txt(p.name) + '</span>' + price +
            (so ? '<span class="r3-opt__off">마감</span>' : '') + '</button>';
        }).join('');
      // (10/30) 단계 옵션: 줄을 만든 직후 아임웹이 앞 단계를 비우면 뒤 단계 목록이 '먼저 골라 주세요'로 줄었다가(약 1초) 다시 늘어나요 → 화면이 위아래로 튀어요
      //   다시 고르는 동안(keepUntil)엔 직전 카드 모양을 그대로 보여 줘요(누르기는 진짜 목록이 오면). 진짜 목록이 오면 새로 그려요
      var lk = clean(lb);
      if (g.items.length) keep[lk] = wrap.innerHTML;
      else if (g.wait && Date.now() < keepUntil && keep[lk]) { wrap.innerHTML = keep[lk]; wrap.setAttribute('data-keep', ''); }
      g.box.parentNode.insertBefore(wrap, g.box);
      g.box.classList.add('r3-opt-src');
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('.r3-opt__card'); if (!b || b.disabled) return;
        var it = g.items[+b.getAttribute('data-i')];
        if (!it) return; // 잠깐 보여 주는 직전 카드(data-keep)는 진짜 목록이 오면 눌려요
        var name = it.nm || parse(it.t).name;
        // 앞 단계 카드: 고르기만 해요(이미 고른 값이면 그대로). 아임웹이 다음 단계 목록을 채워 다시 그려요
        if (g.step) {
          e.isTrusted && (restoreTok++, keepUntil = 0); // 손님이 직접 고르면 '다시 고르기'는 멈춰요
          // 이미 아임웹에도 골라져 있으면 그대로(화면 체크만 보고 판단하면, 다시 고르는 동안 직전 체크를 유지해 둔 카드를 못 눌러요)
          if ((stepsNow(form)[wrap.getAttribute('data-lb')] || '').indexOf(name) === 0) return;
          $$('.r3-opt__card', wrap).forEach(function (c) { c.classList.toggle('is-on', c === b); c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
          if (it.el.closest('[data-sf-pre]')) { pending = { lb: wrap.getAttribute('data-lb'), name: name }; return; }
          later(function () { g.pick(it); }); return;
        }
        var row = findRow(form, name, wrap.getAttribute('data-lb'));
        // 이미 고른 카드를 다시 누르면 체크 해제 = 그 줄의 삭제(×) 버튼을 대신 눌러요
        // (10/29) 아임웹은 누르는 즉시 선택 줄·합계를 바꿔요 → 카드 체크도 바로(0초) 고치고, 늦게 다시 그려질 때를 대비해 한 번 더 확인
        if (row) {
          var x = row.querySelector('a[class*="absolute"], button[class*="absolute"], [class*="delete"], [class*="remove"]');
          if (x) { var st1 = stepsNow(form); x.click(); mark(form); setTimeout(function () { mark(form); }, 150); restoreSteps(form, st1, 0); return; }
          row.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); row.classList.add('is-flash'); setTimeout(function () { row.classList.remove('is-flash'); }, 700); return;
        }
        // (10/29) 미리 그린 옵션(아래 pre)일 때는 아임웹 진짜 옵션이 올 때까지 기다렸다가 대신 눌러요
        if (it.el.closest('[data-sf-pre]')) { b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); pending = { lb: wrap.getAttribute('data-lb'), name: name }; return; }
        var st0 = stepsNow(form);
        if (b.classList.contains('is-wait')) return; // 방금 누른 카드: 아임웹 줄이 올 때까지 두 번 더하지 않아요
        ghost(form, wrap, b, it, g.req);
        later(function () {
          g.pick(it);
          mark(form, groups);
          setTimeout(function () { mark(form, groups); }, 120);
          // 조합 줄이 하나 생기면 아임웹이 앞 단계 선택을 비워요 → 같은 수강 형태로 다른 기수를 바로 고를 수 있게 앞 단계를 다시 골라 둬요
          if (Object.keys(st0).some(function (k) { return st0[k]; })) restoreSteps(form, st0, 0);
        });
      });
    });
    mark(form, groups);
    return true;
  }

  // (10/30) 옵션 줄 바로 보이기 — 아임웹은 옵션을 더할 때 서버에 금액을 물어봐서(/shop/select_option.cm) 줄·합계가 약 0.25초 늦게 나와요
  //   → 누르는 순간 같은 모양의 '미리 줄'(sf-ghost)과 합계를 그려 두고, 아임웹 진짜 줄이 오면 그 칸을 통째로 바꿔 끼워요(같은 모양이라 화면이 안 움직여요)
  //   금액을 카드에서 확실히 알 때만(카드 가격 = 아임웹 항목의 최종 금액 · 단계 옵션은 앞 단계 금액 + 마지막 금액) 그려요. 결제·계산은 언제나 아임웹 것
  // (10/30) 아임웹 옵션 고르기는 서버 답을 기다리는 동안 화면을 멈춰요(약 0.2초) → 카드 체크·미리 줄을 먼저 화면에 그린 다음(다음 그림 뒤) 아임웹에 넘겨요
  function later(fn) {
    var done = false, go = function () { if (!done) { done = true; setTimeout(fn, 0); } };
    requestAnimationFrame(go); setTimeout(go, 40); // 뒤에 숨은 탭처럼 그림이 늦으면 0.04초 뒤
  }
  function won(t) { var m = /([\d,]+)\s*원/.exec(t || ''); return m ? +m[1].replace(/,/g, '') : null; }
  function ghost(form, wrap, b, it, req) {
    var gp = form.querySelector('#prod_selected_options');
    if (!gp || !(it.price || it.zero) || /^[+\-]/.test(clean(it.price))) return;
    var p = it.zero ? 0 : won(it.price), parts = [];
    if (p == null) return;
    // 마지막 필수 그룹(단계 옵션): 마지막 금액 + 앞 단계에서 고른 카드 금액, 줄 글은 '그룹: 값 / 그룹: 값' · 선택 옵션은 따로 한 줄
    var steps = req ? $$('.r3-opt[data-step]', form) : [];
    for (var i = 0; i < steps.length; i++) {
      var on = steps[i].querySelector('.r3-opt__card.is-on');
      if (!on) return; // 앞 단계를 다 안 골랐으면 아임웹도 줄을 안 만들어요
      var sp = on.querySelector('.r3-opt__add'), sv = sp ? won(sp.textContent) : 0;
      if (sp && /^[+\-]/.test(clean(sp.textContent))) return;
      p += sv || 0;
      parts.push(steps[i].getAttribute('data-lb') + ': ' + clean(on.querySelector('.r3-opt__name').textContent));
    }
    parts.push(wrap.getAttribute('data-lb') + ': ' + clean(b.querySelector('.r3-opt__name').textContent));
    var fmt = function (n) { return n.toLocaleString('ko-KR') + '원'; };
    var tb = gp.querySelector('.opt_block.total'), tp = tb && tb.querySelector('.total_price'), cnt = tb && /\((\d+)개\)/.exec(tb.textContent);
    var total = (tp ? won(tp.textContent) || 0 : 0) + p, n = (cnt ? +cnt[1] : 0) + 1;
    var row = document.createElement('div');
    // 아임웹 줄 모양(높이)이 상황마다 달라요: 필수 줄 '_selected_require_option' · 선택 옵션 첫 줄 그냥 · 둘째 줄부터 'middle' → 똑같이 맞춰야 바뀔 때 안 움직여요
    //   (옵션 없는 기본 수량 칸 order_quantity_area 는 줄로 치지 않아요 — 선택 옵션만 있는 상품에서 튀던 것)
    row.className = (req ? '_selected_require_option ' : gp.querySelector('.opt_block:not(.total):not(.order_quantity_area)') ? 'middle ' : '') + 'opt_block sf-ghost';
    row.innerHTML = '<div class="full-width opt_product_area r3-optrow"><div class="area_tit holder"><span class="body_font_color_80">' + txt(parts.join(' / ')) +
      '</span><a class="text-18 absolute absolute_right absolute_middle" href="javascript:;"><i class="btl bt-times-circle"></i></a></div><div class="area_count holder"><div class="option_btn_wrap"><div class="option_btn_tools"><a href="javascript:;"><i class="btl bt-minus" aria-hidden="true"></i></a><input type="text" value="1" class="form-control count _count" readonly><a href="javascript:;"><i class="btl bt-plus"></i></a></div></div><div class="area_price absolute absolute_right absolute_middle"><span>' + fmt(p) + '</span></div></div></div>';
    busy = true;
    try {
      if (tb) { gp.insertBefore(row, tb); tp && (tp.textContent = fmt(total)); var lb0 = tb.querySelector('.body_font_color_70'); lb0 && (lb0.textContent = '총 상품금액(' + n + '개)'); }
      else {
        gp.appendChild(row);
        var tt = document.createElement('div');
        tt.className = 'opt_block total bottom sf-ghost';
        tt.innerHTML = '<p class="no-margin text-right"><span class="body_font_color_70 text-left" style="padding: 16px 0">총 상품금액(1개)</span><span class="total_price " style="padding: 16px 0">' + fmt(total) + '</span></p>'; // 아임웹이 넣는 여백 그대로
        gp.appendChild(tt);
      }
      gp.style.display === 'none' && (gp.style.display = '');
      b.classList.add('is-on', 'is-wait'); b.setAttribute('aria-pressed', 'true');
      form.classList.add('r3-has-rows');
    } finally { busy = false; }
    // 아임웹 진짜 줄이 오면(칸을 새로 그림) 미리 줄은 저절로 사라져요. 오지 않으면 2.5초 뒤 지워요
    setTimeout(function () { $$('.sf-ghost', form).forEach(function (x) { x.remove(); }); b.classList.remove('is-wait'); mark(form); }, 2500);
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
  //   (10/29) 조합 옵션 줄은 '수강 형태: 오프라인 / 기수: 11월반 30,000원' → ' / '로 나눠 그룹마다 맞춰 보고, 앞 단계에서 지금 고른 값과 같은 줄만 봐요
  var lbEq = function (a, b) { return a === b || a.indexOf(b) === 0 || b.indexOf(a) === 0; };
  function same(t, name, lb, steps) {
    var i = t.indexOf(': ');
    if (i < 0) return t.indexOf(name) >= 0;
    var map = {}, keys = [];
    t.split(' / ').forEach(function (p) { var j = p.indexOf(': '); if (j > 0) { var k = clean(p.slice(0, j)); map[k] = clean(p.slice(j + 2)); keys.push(k); } });
    var key = lb ? keys.filter(function (k) { return lbEq(k, lb); })[0] : keys[0];
    if (!key || map[key].indexOf(name) !== 0) return false;
    for (var s in steps || {}) {
      var sk = keys.filter(function (k) { return lbEq(k, s); })[0];
      if (sk && sk !== key && steps[s] && map[sk].indexOf(steps[s]) !== 0) return false;
    }
    return true;
  }
  // 앞 단계 그룹마다 지금 고른 값: 아임웹 드롭다운 글자가 그룹 이름이 아니라 값으로 바뀌어 있어요
  function stepsNow(form) {
    var o = {};
    $$('.r3-opt[data-step]', form).forEach(function (w) {
      var src = w.nextElementSibling, tg = src && src.querySelector('.dropdown-toggle'), v = tg ? clean(tg.textContent) : '';
      var lb = w.getAttribute('data-lb');
      // (10/30) 앞 단계 옵션에 금액이 있으면 아임웹이 '톡방 (10,000원)'처럼 금액까지 붙여 보여줘요 → 금액은 떼고 이름만
      v = v.replace(/\s*[(（]\s*[+\-]?[\d,]+\s*원\s*[)）]\s*$/, '');
      // (10/30) 안 고른 상태 = '그룹명 (필수)' 또는 그룹명 그대로. 예전엔 앞부분만 같아도 안 고른 걸로 봐서 그룹 '톡방 포함'의 값 '톡방'을 놓쳤어요
      o[lb] = v && !/[(（]\s*(필수|선택)\s*[)）]\s*$/.test(v) && v !== lb ? v : '';
    });
    return o;
  }
  // (10/30) 아임웹은 줄을 만든 뒤 약 0.35초 있다가 앞 단계를 비워요 → 2초 동안 지켜보며 비워진 단계를 앞에서부터 하나씩 다시 골라요
  //   (앞 단계를 고르면 아임웹이 뒤 단계를 다시 그려 비우기도 해서, 한 번에 하나씩 · 다음 확인 때 또)
  //   손님이 그 사이 앞 단계 카드를 직접 누르면 바로 멈춰요(restoreTok)
  var restoreTok = 0, keep = {}, keepUntil = 0, keepSt = null;
  function restoreSteps(form, st0, n, tok) {
    if (tok == null) { tok = ++restoreTok; keepUntil = Date.now() + 2600; keepSt = st0; }
    setTimeout(function () {
      if (tok !== restoreTok) return;
      var f = document.querySelector('.goods_form_wrap, [data-r3-goods]') || form, now = stepsNow(f), todo = null;
      Object.keys(st0).forEach(function (lb) { if (!todo && st0[lb] && !now[lb]) todo = lb; });
      var w = todo && $$('.r3-opt[data-step]', f).filter(function (x) { return x.getAttribute('data-lb') === todo; })[0];
      var c = w && $$('.r3-opt__card', w).filter(function (b) { return st0[todo].indexOf(clean(b.querySelector('.r3-opt__name').textContent)) === 0; })[0];
      c && c.click();
      n < 14 && restoreSteps(f, st0, n + 1, tok);
    }, 150);
  }
  function findRow(form, name, lb) { var st = stepsNow(form); return rows(form).filter(function (r) { return !r.closest('.sf-ghost') && same(clean(r.textContent), name, lb, st); })[0]; }
  function mark(form, groups) {
    var rs = rows(form);
    // 진짜 줄이 들어오면(미리 줄이 사라지면) '기다리는 중' 표시를 풀어요
    form.querySelector('.sf-ghost') || $$('.r3-opt__card.is-wait', form).forEach(function (c) { c.classList.remove('is-wait'); });
    rs.forEach(function (r) { r.classList.add('r3-optrow'); });
    var names = rs.map(function (r) { return clean(r.textContent); });
    var cards = $$('.r3-opt__card', form), st = stepsNow(form);
    cards.forEach(function (b) {
      var nm = clean(b.querySelector('.r3-opt__name').textContent), w = b.closest('.r3-opt'), lb = w && w.getAttribute('data-lb');
      // 다시 고르는 동안엔 앞 단계 체크도 직전 값 그대로(깜빡이지 않게)
      var sv = st[lb] || (Date.now() < keepUntil && keepSt && keepSt[lb]) || '';
      var on = w && w.hasAttribute('data-step') ? !!sv && sv.indexOf(nm) === 0
        : names.some(function (t) { return same(t, nm, lb, st); });
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    form.classList.toggle('r3-has-rows', rs.length > 0);
    // (10/30) 총 상품금액이 0원이면 '무료'(상세 가격·완료 카드·결제 내역과 같게)
    var tp0 = form.querySelector('#prod_selected_options .total_price');
    tp0 && /^\s*0\s*원\s*$/.test(tp0.textContent) && (tp0.textContent = '무료');
    // (10/30) 선택 옵션만 있는 상품: 아임웹은 기본 상품(수량 1)을 늘 합계에 넣는데, 그 칸(order_quantity_area)이 숨겨져 있어
    //   '뒷풀이 30,000원'만 보이고 합계는 30,100원처럼 안 맞아 보였어요 → 기본 상품 줄을 옵션 줄처럼 보여 줘요(이름 = 상품명)
    var oq = form.querySelector('.order_quantity_area');
    if (oq) {
      var only = !!form.querySelector('.r3-opt') && !form.querySelector('.r3-opt[data-req]');
      oq.classList.toggle('r3-base', only);
      var ot = only && oq.querySelector('.area_tit .option_title'), vt = document.querySelector('.view_tit'), vc = vt && vt.cloneNode(true);
      vc && $$('.ns-icon, img, i, [class*="badge"]', vc).forEach(function (x) { x.remove(); }); // 상품 배지('오늘출발' 등) 글자는 빼고 이름만
      var vn = vc ? clean(vc.textContent) : '';
      ot && vn && ot.textContent !== vn && (ot.textContent = vn);
    }
    // (10/29) 옵션 칸이 늦게 그려지면 r3NoOpt 가 '옵션 없는 상품'으로 잘못 보고 합계 칸을 숨겨요 → 옵션 카드나 선택 줄이 있으면 풀어요
    //   (10/30) 강의 본품 줄(order_quantity_area)은 옵션 줄로 세지 않아요 — 옵션 없는 상품도 이 줄이 생겨서, 불러오는 시점에 따라
    //   합계 '상품 금액'이 가격과 겹쳐 보였다 안 보였다 했어요 → 옵션 카드·옵션 줄이 있으면 풀고, 둘 다 없으면 다시 '옵션 없음'
    var ors = rs.filter(function (r) { return !r.closest('.order_quantity_area'); });
    document.querySelector('.sf-pv') && document.documentElement.classList.toggle('r3-noopt', !cards.length && !ors.length);
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
  function isProd(href) { return !!idxOf(href) && !/[?&](bmode|board|q)=|^\/?(class|shop_mypage|admin)\b|\/\/(?!seniorfuture)/.test(href || ''); }
  function isMob() { var c = window.SHOP_CONST; return window.innerWidth < (c && c.WIDTH_MOBILE || 768); }
  (function () {
    // 상품 화면은 /shop_view 말고도 메뉴 주소(/course/?idx=71 등)로 열려요 → 주소에 idx 가 있으면(게시글·강의실 제외) 상품으로 보고 시작해요
    if (!isProd(location.pathname + location.search)) return;
    var idx = idxOf(location.search);
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
      // 옵션이 없는 상품: (10/30) 예전엔 아임웹 '총 상품금액' 칸이 들어올 때까지 신청 버튼을 가렸는데, 그 칸은 우리 화면에서 접혀 있어
      //   (PC r3-noopt · 휴대폰은 아래 고정 바) 버튼이 밀리지 않아요. 아임웹이 늦으면 2.5초씩 버튼이 안 보였음 → 바로 보여요
      release('opt');
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
      // 옵션 칸과, 그 뒤 칸(추가 상품 칸 — 없는 상품은 합계 칸)까지 그려졌을 때 시작
      if (started || !el('prod_options') || !(el('prod_additional') || document.querySelector('.goods_form_wrap .goods_payment'))) return false;
      started = true;
      if (c) { fillAdd(c); fillOpt(c); } else p.then(function (v) { fillAdd(v); fillOpt(v); });
      return true;
    }
    // 받아 둔 게 없을 때, 그리고 옵션 없는 상품(합계 칸을 아임웹이 늦게 넣음)일 때만 기다려요
    if (!c) { hold('opt'); hold('add'); }
    // (10/30) 받아 둔 옵션이 있어도 뒤에서 한 번 새로 받아 둬요 — 관리자가 옵션을 고친 뒤 예전 모양이 계속 미리 그려지지 않게
    c && setTimeout(function () { optFetch(idx); }, 3000);
    if (start()) return;
    var mo = new MutationObserver(function () { if (start()) mo.disconnect(); });
    mo.observe(root, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 8000);
  })();
  // 목록에서 상품에 마우스를 올리거나 손가락을 대면 그 상품 옵션을 미리 받아 둬요(상품마다 한 번)
  ['pointerover', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      // 목록 카드는 위젯 안(shadow DOM)에 있어서 e.target 으로는 안 보여요 → 이벤트 경로에서 링크를 찾아요
      var path = e.composedPath ? e.composedPath() : [e.target], a = null;
      for (var i = 0; i < path.length && !a; i++) if (path[i].tagName === 'A' && /idx=/.test(path[i].getAttribute('href') || '')) a = path[i];
      var h = a && a.getAttribute('href');
      var idx = h && isProd(h.replace(/^https?:\/\/[^/]+/, '')) && idxOf(h);
      idx && !optGet(idx) && optFetch(idx);
    }, { passive: true, capture: true });
  });
  if (window.SFUI && SFUI.register) SFUI.register('r3Options', function () { run(); setTimeout(run, 800); setTimeout(run, 2000); });
  else if (document.readyState !== 'loading') run(); else document.addEventListener('DOMContentLoaded', run);
})()
