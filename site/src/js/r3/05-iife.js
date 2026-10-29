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
  var busy = false, timer = 0;
  function run() {
    var form = document.querySelector('.goods_form_wrap, [data-r3-goods]');
    if (!form || busy) return;
    busy = true;
    try {
      enhance(form);
      mark(form);
    } finally { busy = false; }
    if (!form.getAttribute('data-r3-opt')) {
      form.setAttribute('data-r3-opt', '1');
      // (10/29) 다시 그리기 대기 60ms → 다음 화면 그리기 직전(requestAnimationFrame)으로 당겨서 카드가 사라졌다 생기는 틈을 줄여요
      new MutationObserver(function () { if (busy) return; clearTimeout(timer); timer = setTimeout(run, 0); }).observe(form, { childList: true, subtree: true });
    }
  }
  if (window.SFUI && SFUI.register) SFUI.register('r3Options', function () { run(); setTimeout(run, 800); setTimeout(run, 2000); });
  else if (document.readyState !== 'loading') run(); else document.addEventListener('DOMContentLoaded', run);
})()
