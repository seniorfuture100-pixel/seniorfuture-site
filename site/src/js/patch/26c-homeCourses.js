// (10/30 사장님) 홈 '가장 주목받는 강의'(8칸) · '이달의 BEST 강의 TOP 5'를 교육 상품 요약 설명 꼬리표로
//   요약 설명 예) '현장 운영자의 6주 실무 과정 #요양돌봄 #주목1 #BEST2' (꼬리표 읽기 = SFUI.sumTags, patch/04)
//   - 아임웹은 홈에 상품 목록 위젯을 둘 수 없어서(한 페이지 하나 · 페이지 카테고리에 묶임) 교육 목록(/course)을 페이지가 열리자마자 받아 읽어요
//   - 두 칸은 처음부터 가려져 있다가(css patch/13 · sf-hc-on 없을 때) 순서를 다 맞춘 뒤에 보여요 → 예전 카드가 먼저 보였다 바뀌는 일이 없어요
//   - 기억해 두지 않아요: 관리자가 저장하면 다음에 홈을 열 때 바로 반영
//   - 자리 규칙: 번호 자리에 그 상품 · 같은 번호가 여럿이면 최근 등록(번호 큰 상품)이 그 자리, 나머지는 다음 빈자리
//               · 빈 자리는 지금 홈에 있는 강의 순서로 채움 · 품절·판매 종료 상품은 빼요
(function () {
  var p = location.pathname.replace(/\/$/, '');
  if (p && p !== '/index') return;
  var pv = /preview_mode=1/.test(location.search) ? '?preview_mode=1' : '';
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };
  var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
  var show = function () { [].forEach.call(document.querySelectorAll('ul.sf-cards4--grid, ol.sf-top5'), function (e) { e.classList.add('sf-hc-on'); }); };
  // 교육 목록 받기(페이지가 열리자마자 · 페이지가 여럿이면 모두)
  var got = fetch('/course' + pv, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
    var d = t && new DOMParser().parseFromString(t, 'text/html');
    if (!d) return [];
    var cards = function (doc) { return [].concat.apply([], [].map.call(doc.querySelectorAll('template'), function (x) { return [].slice.call(x.content.querySelectorAll('li.iw-shop-card')); })); };
    var all = cards(d), n = 1;
    [].forEach.call(d.querySelectorAll('template'), function (x) {
      [].forEach.call(x.content.querySelectorAll('.iw-shop-pagination a'), function (a) { var k = parseInt(a.textContent, 10); k > n && (n = k); });
    });
    if (n < 2) return all;
    var more = [];
    for (var i = 2; i <= n; i++) more.push(fetch('/course?page=' + i + (pv ? '&preview_mode=1' : ''), { credentials: 'same-origin' }).then(function (r) { return r.text(); }).catch(function () { return ''; }));
    return Promise.all(more).then(function (ts) {
      ts.forEach(function (x) { x && (all = all.concat(cards(new DOMParser().parseFromString(x, 'text/html')))); });
      return all;
    });
  }).then(function (all) {
    return all.map(function (c) {
      var id = +c.getAttribute('data-system-product-id'), sg = SFUI.sumTags((c.querySelector('.iw-shop-product-summary') || {}).textContent);
      var img = c.querySelector('img.iw-shop-thumbnail, img'), amt = c.querySelector('.iw-shop-amount');
      return {
        id: id, name: clean((c.querySelector('.iw-shop-product-name') || {}).textContent), sum: sg.text, cats: sg.cats, focus: sg.focus, best: sg.best,
        img: img ? img.getAttribute('src') || img.getAttribute('data-src') || '' : '', price: amt ? clean(amt.textContent) + '원' : '무료',
        tags: SFUI.badgeTags ? SFUI.badgeTags(c.querySelector('.iw-shop-product-badges')) : null,
        off: c.getAttribute('data-sold-out') === 'true' || c.getAttribute('data-sale-wait') === 'true'
      };
    }).filter(function (x) { return x.id; });
  }).catch(function () { return null; });

  // 자리 채우기: key = 'focus'|'best', size = 칸 수, base = 지금 칸에 있는 상품 번호 순서
  function slots(list, key, size, base) {
    var out = new Array(size + 1), used = {};
    list.filter(function (x) { return x[key] && !x.off; }).sort(function (a, b) { return a[key] - b[key] || b.id - a.id; }).forEach(function (x) {
      for (var k = x[key]; k <= size; k++) if (!out[k]) { out[k] = x.id; used[x.id] = 1; return; }
    });
    var bi = 0;
    for (var k = 1; k <= size; k++) {
      if (out[k]) continue;
      while (bi < base.length && used[base[bi]]) bi++;
      bi < base.length && (out[k] = base[bi], used[base[bi]] = 1, bi++);
    }
    return out.slice(1).filter(Boolean);
  }
  var idOf = function (li) { var a = li.querySelector('a[href*="idx="]'), m = a && /idx=(\d+)/.exec(a.getAttribute('href')); return m ? +m[1] : 0; };
  var wish = '<button type="button" class="sf-wish" aria-pressed="false" aria-label="찜하기" data-idx="§"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"></path></svg></button>';
  function card(x, items) {
    var it = items[x.id] || {};
    return '<a class="sf-ccard" href="/course/?idx=' + x.id + '"><span class="sf-ccard__thumb">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" class="sf-fade is-loaded" loading="lazy">' : '') + wish.replace('§', x.id) +
      '</span><span class="sf-ccard__body"><strong>' + esc(x.name) + '</strong>' + (x.sum ? '<p>' + esc(x.sum) + '</p>' : '') +
      '<span class="sf-tags">' + (SFUI.tagHtml ? SFUI.tagHtml(x.tags || it.tags) : '') + '</span><span class="sf-ccard__price">' + esc(x.price) + '</span></span></a>';
  }
  function paint(list) {
    var by = {}, items = SFUI.shopItems ? SFUI.shopItems() : {};
    list.forEach(function (x) { by[x.id] = x; });
    // ① 가장 주목받는 강의
    var ul = document.querySelector('ul.sf-cards4--grid');
    if (ul && ul.querySelector('li[data-sf-filter-item]')) {
      var old = [].slice.call(ul.children), keep = {}, base = old.map(function (li) { var i = idOf(li); keep[i] = li; return i; });
      var ids = list.some(function (x) { return x.focus; }) ? slots(list, 'focus', 8, base) : base, grp = (old[0] && old[0].getAttribute('data-sf-filter-item')) || 'home-edu';
      var frag = document.createDocumentFragment();
      ids.forEach(function (i) {
        var x = by[i], li = keep[i];
        if (!li) { li = document.createElement('li'); li.setAttribute('data-sf-filter-item', grp); li.innerHTML = card(x, items); }
        // 분야: 꼬리표가 있으면 꼬리표, 없으면 원래 칸 값(코드 표)
        x && x.cats.length && li.setAttribute('data-category', x.cats.join(' '));
        !li.getAttribute('data-category') && li.setAttribute('data-category', (items[i] || {}).cat || '');
        x && li.querySelector('p') && (li.querySelector('p').textContent = x.sum || li.querySelector('p').textContent);
        frag.appendChild(li);
      });
      old.forEach(function (li) { li.parentNode === ul && ul.removeChild(li); });
      ul.appendChild(frag);
      // 홈 분야 칩이 이미 눌려 있으면 다시 걸러요
      var on = document.querySelector('[data-sf-filter-group="' + grp + '"] .is-active');
      on && on.getAttribute('data-sf-filter') !== 'all' && on.click();
    }
    // ② 이달의 BEST 강의 TOP 5
    var ol = document.querySelector('ol.sf-top5');
    if (ol && list.some(function (x) { return x.best; })) {
      var o2 = [].slice.call(ol.children), k2 = {}, b2 = o2.map(function (li) { var i = idOf(li); k2[i] = li; return i; });
      var f2 = document.createDocumentFragment();
      slots(list, 'best', 5, b2).forEach(function (i) {
        var li = k2[i];
        if (!li) { li = document.createElement('li'); li.innerHTML = card(by[i], items); }
        f2.appendChild(li);
      });
      o2.forEach(function (li) { li.parentNode === ol && ol.removeChild(li); });
      ol.appendChild(f2);
    }
  }
  var done = false, t0 = Date.now();
  function go() {
    if (done) return;
    var ready = document.querySelector('ol.sf-top5') && document.querySelector('ul.sf-cards4--grid li[data-sf-filter-item]');
    if (!ready && document.readyState === 'complete' || Date.now() - t0 > 6000) { done = true; return show(); }
    if (!ready) return void setTimeout(go, 40);
    done = true;
    got.then(function (list) { try { list && list.length && paint(list); } catch (x) {} show(); });
  }
  go();
  // 늦어도 3초 뒤엔 보여요(받기가 늦거나 실패하면 지금 카드 그대로)
  setTimeout(show, 3000);
})()
