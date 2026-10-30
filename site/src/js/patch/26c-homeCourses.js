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
  // 라이브 칸 = 라이브 카드(.sf-lcard)가 든 ul.sf-cards4 (:has 를 못 쓰는 브라우저도 있어서 직접 골라요)
  var LV = function () { return [].filter.call(document.querySelectorAll('ul.sf-cards4'), function (u) { return u.querySelector('.sf-lcard'); }); };
  var MT = function () { return [].slice.call(document.querySelectorAll('ul.sf-cards4--meet')); };
  document.documentElement.classList.add('sf-hc-wait'); // 라이브·커뮤니티 칸도 정리 끝날 때까지 가려요(css patch/21)
  var show = function () { [].slice.call(document.querySelectorAll('ul.sf-cards4--grid, ol.sf-top5')).concat(LV(), MT()).forEach(function (e) { e.classList.add('sf-hc-on'); }); };
  // 교육 목록 받기(페이지가 열리자마자 · 페이지가 여럿이면 모두)
  // (10/30) 무료 라이브·커뮤니티도 같은 방식으로 받아서, 목록에 없는(숨김·삭제) 상품 카드는 홈에서 빼요
  var fetchList = function (path) { return fetch(path + pv, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
    var d = t && new DOMParser().parseFromString(t, 'text/html');
    // 목록 칸을 못 찾으면(받기 실패) null → 지금 카드 그대로 · 칸은 있는데 상품이 0개면 빈 목록 → 홈 칸도 비워요(숨긴 상품이 남지 않게)
    if (!d || ![].some.call(d.querySelectorAll('template'), function (x) { return x.content.querySelector('.iw-shop-grid'); })) return null;
    var cards = function (doc) { return [].concat.apply([], [].map.call(doc.querySelectorAll('template'), function (x) { return [].slice.call(x.content.querySelectorAll('li.iw-shop-card')); })); };
    var all = cards(d), n = 1;
    [].forEach.call(d.querySelectorAll('template'), function (x) {
      [].forEach.call(x.content.querySelectorAll('.iw-shop-pagination a'), function (a) { var k = parseInt(a.textContent, 10); k > n && (n = k); });
    });
    if (!all || n < 2) return all;
    var more = [];
    for (var i = 2; i <= n; i++) more.push(fetch(path + '?page=' + i + (pv ? '&preview_mode=1' : ''), { credentials: 'same-origin' }).then(function (r) { return r.text(); }).catch(function () { return ''; }));
    return Promise.all(more).then(function (ts) {
      ts.forEach(function (x) { x && (all = all.concat(cards(new DOMParser().parseFromString(x, 'text/html')))); });
      return all;
    });
  }).then(function (all) {
    return all && all.map(function (c) {
      var id = +c.getAttribute('data-system-product-id'), sg = SFUI.sumTags((c.querySelector('.iw-shop-product-summary') || {}).textContent);
      var img = c.querySelector('img.iw-shop-thumbnail, img'), amt = c.querySelector('.iw-shop-amount');
      return {
        id: id, name: clean((c.querySelector('.iw-shop-product-name') || {}).textContent), sum: sg.text, cats: sg.cats, focus: sg.focus, best: sg.best,
        img: img ? img.getAttribute('src') || img.getAttribute('data-src') || '' : '', price: amt ? clean(amt.textContent) + '원' : '무료',
        tags: (function (b) { return (sg.tags || []).length ? sg.tags.concat((b || []).filter(function (x) { return sg.tags.indexOf(x) < 0; })) : b; })(SFUI.badgeTags ? SFUI.badgeTags(c.querySelector('.iw-shop-product-badges')) : null), // (10/30) #NEW
        off: c.getAttribute('data-sold-out') === 'true' || c.getAttribute('data-sale-wait') === 'true',
        so: c.getAttribute('data-sold-out') === 'true', sw: c.getAttribute('data-sale-wait') === 'true', at: (c.querySelector('[data-at]') || { getAttribute: function () { return ''; } }).getAttribute('data-at') || ''
      };
    }).filter(function (x) { return x.id; });
  }).catch(function () { return null; }); };
  var got = fetchList('/course'), gotLive = fetchList('/live'), gotMeet = fetchList('/community');

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
  // (10/30) 홈 칸은 지금 교육 목록에 보이는 상품만 — 숨김·삭제한 상품은 홈 코드에 카드가 남아 있어도 빼고,
  //   빈 자리는 남은 홈 카드 순서 → 목록의 다른 상품(최근 등록 순)으로 채워요 · 하나도 없으면 '준비 중' 안내
  var none = function (w) { var li = document.createElement('li'); li.className = 'sf-hc-none'; li.textContent = '새로운 ' + w + '를 준비하고 있어요. 곧 업데이트될 예정이에요.'; return li; };
  function paint(list) {
    var by = {}, items = SFUI.shopItems ? SFUI.shopItems() : {};
    list.forEach(function (x) { by[x.id] = x; });
    var live = function (base) {
      base = base.filter(function (i) { return by[i] && !by[i].off; });
      list.filter(function (x) { return !x.off && base.indexOf(x.id) < 0; }).sort(function (a, b) { return b.id - a.id; }).forEach(function (x) { base.push(x.id); });
      return base;
    };
    // ① 가장 주목받는 강의
    var ul = document.querySelector('ul.sf-cards4--grid');
    if (ul && ul.querySelector('li[data-sf-filter-item]')) {
      var old = [].slice.call(ul.children), keep = {}, base = old.map(function (li) { var i = idOf(li); keep[i] = li; return i; });
      var ids = slots(list, 'focus', 8, live(base)), grp = (old[0] && old[0].getAttribute('data-sf-filter-item')) || 'home-edu';
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
      ids.length || frag.appendChild(none('강의'));
      old.forEach(function (li) { li.parentNode === ul && ul.removeChild(li); });
      ul.appendChild(frag);
      // 홈 분야 칩이 이미 눌려 있으면 다시 걸러요
      var on = document.querySelector('[data-sf-filter-group="' + grp + '"] .is-active');
      on && on.getAttribute('data-sf-filter') !== 'all' && on.click();
    }
    // ② 이달의 BEST 강의 TOP 5
    var ol = document.querySelector('ol.sf-top5');
    if (ol) {
      var o2 = [].slice.call(ol.children), k2 = {}, b2 = o2.map(function (li) { var i = idOf(li); k2[i] = li; return i; });
      var f2 = document.createDocumentFragment(), i2 = slots(list, 'best', 5, live(b2));
      i2.forEach(function (i) {
        var li = k2[i];
        if (!li) { li = document.createElement('li'); li.innerHTML = card(by[i], items); }
        f2.appendChild(li);
      });
      i2.length || f2.appendChild(none('강의'));
      o2.forEach(function (li) { li.parentNode === ol && ol.removeChild(li); });
      ol.appendChild(f2);
    }
  }
  // 라이브·커뮤니티 칸: 목록에 없는 상품 카드만 빼요(새 상품 카드를 만들어 넣지는 않아요 — 카드 모양이 상품마다 달라서)
  function prune(list, sel, w) {
    var has = {};
    list.forEach(function (x) { has[x.id] = 1; });
    sel().forEach(function (ul) {
      [].slice.call(ul.children).forEach(function (li) { var i = idOf(li); i && !has[i] && ul.removeChild(li); });
      ul.querySelector('a[href*="idx="]') || ul.querySelector('.sf-hc-none') || ul.appendChild(none(w));
    });
  }
  // (10/30 사장님) 라이브·커뮤니티 칸도 목록에서 바로 만들어요 — 새 상품을 올리면 홈에도 저절로(4칸)
  //   일시·마감·구분·장소: 코드 표(예전 상품) → 없으면 상품 상세 [라이브 안내]·[모임 안내](SFUI.roomInfo, 5분 기억)
  //   순서: 신청 받는 중(가까운 날짜 순) → 끝난 것(최근 순) · 판매기간 끝·품절은 '신청 마감'/'모집 마감'
  var SVG_D = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
  var SVG_P = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var dLabel = function (v) { var t = Date.parse(v || ''); if (!t) return ''; var d = new Date(t); return d.getMonth() + 1 + '월 ' + d.getDate() + '일 (' + '일월화수목금토'.charAt(d.getDay()) + ')'; };
  function infos(list, cb) {
    var items = SFUI.shopItems ? SFUI.shopItems() : {}, out = {}, wait = 0, fin = false;
    var end = function () { fin || (fin = true, cb(out)); };
    list.forEach(function (x) {
      var it = items[x.id];
      if (it && it.start) return void (out[x.id] = { start: it.start, end: it.end || '', deadline: it.deadline || '', kind: it.kind, place: it.place, date: it.date });
      if (!SFUI.roomInfo || wait >= 16) return;
      wait++;
      SFUI.roomInfo(x.id, function (o) {
        var m = o && o.meet || {};
        out[x.id] = { start: m.start || o && o.start || '', end: m.end || '', deadline: m.deadline || '', kind: m.kind, place: SFUI.meetPlace ? SFUI.meetPlace(m) : m.place, replay: o && o.replay };
        --wait || end();
      });
    });
    wait ? setTimeout(end, 2000) : end();
  }
  var order = function (a, b) { return a.done !== b.done ? (a.done ? 1 : -1) : a.done ? b.st - a.st : (a.st || 9e15) - (b.st || 9e15); };
  var nm = function (s) { return String(s || '').replace(/\s*\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/, ''); };
  function buildLive(list, ul) {
    infos(list, function (inf) {
      var now = Date.now(), rows = list.map(function (x) {
        var f = inf[x.id] || {}, st = Date.parse(f.start || '') || 0, en = Date.parse(f.end || '') || 0;
        return { x: x, f: f, st: st, done: !!st && SFUI.liveOver(st, en, now) };
      }).sort(order).slice(0, 4);
      ul.innerHTML = rows.map(function (r) {
        var x = r.x, f = r.f, ap = '/live/?idx=' + x.id;
        return '<li><article class="sf-lcard" data-sf-live data-start="' + esc(f.start) + '" data-end="' + esc(f.end) + '" data-deadline="' + esc(f.deadline) + '" data-link-apply="' + ap + '" data-link-live="/classroom"' +
          (f.replay ? ' data-link-replay="' + esc(f.replay) + '"' : '') + (x.so ? ' data-sold-out="true"' : '') + (x.sw ? ' data-sale-wait="true"' : '') + '>' + (x.at ? '<span data-at="' + esc(x.at) + '" hidden></span>' : '') +
          '<a class="sf-ccard" href="' + ap + '"><span class="sf-ccard__thumb">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" loading="lazy">' : '') + '</span><span class="sf-ccard__body"><strong>' + esc(nm(x.name)) + '</strong></span></a>' +
          '<span class="sf-tags"><span class="sf-badge" data-sf-live-badge></span></span><a class="sf-btn" data-sf-live-btn></a></article></li>';
      }).join('');
      rows.length ? SFUI.init && SFUI.init(ul) : ul.appendChild(none('라이브'));
      ul.classList.add('sf-hc-on');
    });
  }
  function buildMeet(list, ul) {
    infos(list, function (inf) {
      var now = Date.now(), rows = list.map(function (x) {
        var f = inf[x.id] || {}, li = { getAttribute: function (k) { return k === 'data-sold-out' ? String(x.so) : k === 'data-sale-wait' ? String(x.sw) : null; }, querySelector: function () { return x.at ? { getAttribute: function () { return x.at; } } : null; } };
        var s = SFUI.saleOver(li) ? ['ended', '모집 마감'] : SFUI.meetState(f, now);
        return { x: x, f: f, s: s, st: Date.parse(f.start || '') || 0, done: s[0] === 'ended' };
      }).sort(order).slice(0, 4);
      ul.innerHTML = rows.map(function (r) {
        var x = r.x, f = r.f, ev = SFUI.isEvent ? SFUI.isEvent(f.kind) : f.kind === '이벤트', dt = f.date || dLabel(f.start);
        return '<li><a class="sf-ccard sf-mcard" href="/community/?idx=' + x.id + '"><span class="sf-ccard__thumb">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" loading="lazy">' : '') + '</span><span class="sf-ccard__body"><span class="sf-tags">' +
          '<span class="sf-tag sf-tag--' + (ev ? 'event' : 'meet') + '">' + esc(f.kind || '모임') + '</span><span class="sf-tag sf-tag--' + r.s[0] + '">' + r.s[1] + '</span></span><strong>' + esc(nm(x.name)) + '</strong>' +
          '<span class="sf-mcard__meta">' + (dt ? '<span>' + SVG_D + esc(dt) + '</span>' : '') + (f.place ? '<span>' + SVG_P + esc(f.place) + '</span>' : '') + '</span></span></a></li>';
      }).join('');
      rows.length || ul.appendChild(none('모임·이벤트'));
      ul.classList.add('r3-meet-ok', 'sf-hc-on'); // r3HomeMeet(예전 고정 목록)가 다시 덮지 않게
    });
  }
  SFUI.__homeBuild = { live: buildLive, meet: buildMeet }; // 점검용
  var done = false, t0 = Date.now();
  function go() {
    if (done) return;
    // (10/30 사장님) 홈 칸 이름: '커뮤니티 모임 · 이벤트' → '커뮤니티' (홈 코드 위젯 글자는 디자인 모드에서 바꾸기 전까지 여기서)
    var hm = document.getElementById('h-meet');
    hm && hm.textContent !== '커뮤니티' && (hm.textContent = '커뮤니티');
    var ready = document.querySelector('ol.sf-top5') && document.querySelector('ul.sf-cards4--grid li[data-sf-filter-item]');
    if (!ready && document.readyState === 'complete' || Date.now() - t0 > 6000) { done = true; return show(); }
    if (!ready) return void setTimeout(go, 40);
    done = true;
    Promise.all([got, gotLive, gotMeet]).then(function (r) {
      try { r[0] && paint(r[0]); } catch (x) {}
      var lv = LV(), mt = MT(); // 다시 그리기 전에 칸을 잡아 둬요(안내만 남으면 LV()가 못 찾아요)
      try { r[1] && lv.forEach(function (u) { buildLive(r[1], u); }); } catch (x) { r[1] && prune(r[1], LV, '라이브'); }
      try { r[2] && mt.forEach(function (u) { buildMeet(r[2], u); }); } catch (x) { r[2] && prune(r[2], MT, '모임·이벤트'); }
      [].forEach.call(document.querySelectorAll('ul.sf-cards4--grid, ol.sf-top5'), function (e) { e.classList.add('sf-hc-on'); });
      r[1] || lv.forEach(function (u) { u.classList.add('sf-hc-on'); });
      r[2] || mt.forEach(function (u) { u.classList.add('sf-hc-on'); });
    });
  }
  go();
  // 늦어도 4초 뒤엔 보여요(받기가 늦거나 실패하면 지금 카드 그대로)
  setTimeout(show, 4000);
})()
