// 저장 전 자동 검사 (10/22) — 아임웹 관리자 미리보기 탭(사이트 주소)에서 실행해요.
//   __CHK.run({ pages, widths, stage })  → 화면마다 '지문'(보이는 요소의 위치·크기·글자·색·글꼴 + 흔들림 + 오류·넘침·헤더·탭바·푸터)을 모아요
//      stage 에 새 코드 전체(site/dist/stage-code.txt)를 주면 이 탭에서만 시험 모드로 새 코드를 돌려요(sf-stage 장치)
//   __CHK.compare(a, b) → 화면별 차이(빠짐·새로 생김·움직임·글자·모양·흔들림 증가·오류·넘침·헤더·탭바·푸터)
//   __CHK.behave({ stage }) → 동작 검사(하단 탭 이동·뒤로 가기·인사이트 페이지 넘김·탭바 고정·헤더 995/1000px·상세 이동 대비책)
(function () {
  // 잡음(같은 코드라도 찍을 때마다 다른 것): 자동 넘김 배너·흐르는 줄 안쪽, 0에서 올라가는 숫자, 남은 시간, 배너 번호, 떠 있는 버튼
  var IGN_KIDS = '[data-sf-carousel] .sf-track, .sfw-banner .sf-track, .r3-flow__row, .r2-mq-track, .r3-fl-track, .r3-logowall__rows, .sf-ab-stat strong, .r3ap-nums strong, .sf-pt-stats strong, [data-sf-count]';
  var IGN_SELF = '[data-sf-countdown] *, [data-sf-countdown], .sf-top, #sf-top, .sf-fab, iframe, .r3-spop, .sf-toast, [data-sf-live-badge], .sf-peek-pager, .sf-peek-pager *, .ma-item';
  var STYLE = ['color', 'background-color', 'font-size', 'font-weight', 'border-radius', 'text-align'];
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  // 서서히 나타나는 효과(투명도)는 보지 않아요 — 있는지·어디 있는지만
  function isVis(W, e, r) { if (!r.width || !r.height) return false; var s = W.getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; }
  // 움직임 효과(transform)에 흔들리지 않는 문서 위치
  function docOff(e) {
    var x = 0, y = 0, n = e;
    while (n) {
      if (n.offsetParent === undefined) { var r = n.getBoundingClientRect(); var W = n.ownerDocument.defaultView; return [x + r.left, y + r.top + W.scrollY]; }
      x += n.offsetLeft; y += n.offsetTop;
      var p = n.offsetParent;
      if (!p) { var root = n.getRootNode && n.getRootNode(); if (root && root.host) { n = root.host; continue; } break; }
      n = p;
    }
    return [x, y];
  }
  var SECT = 'section, footer, header, .sf-sec, .section_wrap, [data-widget-type], .sf-pv__side, .sf-pv__main, main';
  function sectionOf(e) { var s = e.closest && e.closest(SECT); if (!s && e.getRootNode && e.getRootNode().host) s = e.getRootNode().host.closest(SECT); return s; }
  function keyOf(e, stop) {
    var p = []; for (var x = e, n = 0; x && x !== stop && n < 6; x = x.parentElement || (x.getRootNode && x.getRootNode().host), n++) {
      var c = [].filter.call(x.classList || [], function (k) { return !/^(is-|sf-rv|sf-cin|sf-fade|r2-in|r3-rv-|active|on$|open$|show|hover|focus|loaded|_)/.test(k); })[0];
      p.unshift(x.tagName.toLowerCase() + (c ? '.' + c : ''));
    }
    return p.join('>');
  }
  function textOf(e) {
    var t = ''; for (var i = 0; i < e.childNodes.length; i++) if (e.childNodes[i].nodeType === 3) t += e.childNodes[i].nodeValue;
    return t.replace(/\s+/g, ' ').trim().slice(0, 40).replace(/\d+(분|초|시간)\s*(전|남음)?|\d{1,2}:\d{2}(:\d{2})?/g, '#');
  }
  function collect(W, d) {
    var out = {}, cnt = {}, n = 0, secs = {}, secKey = new Map(), scnt = {};
    function sec(e) {
      var s = sectionOf(e); if (!s) return ['-', 0, 0];
      if (!secKey.has(s)) { var k = keyOf(s); scnt[k] = (scnt[k] || 0) + 1; k += '#' + scnt[k]; var o = docOff(s); secKey.set(s, [k, Math.round(o[0]), Math.round(o[1])]); secs[k] = [Math.round(o[0]), Math.round(o[1]), s.offsetWidth || 0, s.offsetHeight || 0]; }
      return secKey.get(s);
    }
    function walk(root) {
      var all = root.querySelectorAll('*');
      for (var i = 0; i < all.length && n < 3000; i++) {
        var e = all[i];
        if (e.shadowRoot) walk(e.shadowRoot);
        if (e.closest && (e.closest(IGN_SELF) || (e.parentElement && e.parentElement.closest(IGN_KIDS)))) continue;
        var tag = e.tagName, t = textOf(e), cls = (e.className && e.className.baseVal == null ? e.className : '') + '';
        var want = t || /^(IMG|SVG|BUTTON|A|INPUT|SELECT|TEXTAREA|VIDEO)$/.test(tag) || /\b(sf-|r2-|r3-|iw-)/.test(cls);
        if (!want) continue;
        var r = e.getBoundingClientRect(); if (!isVis(W, e, r)) continue;
        var s = W.getComputedStyle(e), k = keyOf(e) + (t ? '|' + t.slice(0, 16) : '');
        cnt[k] = (cnt[k] || 0) + 1; k += '#' + cnt[k];
        var o = s.position === 'fixed' ? [r.left, r.top] : docOff(e), S = s.position === 'fixed' ? ['fixed', 0, 0] : sec(e);
        var w = e.offsetWidth != null ? e.offsetWidth : r.width, h = e.offsetHeight != null ? e.offsetHeight : r.height;
        // [섹션, 섹션 안 x, 섹션 안 y, 폭, 높이, 모양, 글자]
        out[k] = [S[0], Math.round(o[0] - S[1]), Math.round(o[1] - S[2]), Math.round(w), Math.round(h), STYLE.map(function (p) { return s.getPropertyValue(p); }).join('|'), t];
        n++;
      }
    }
    walk(d);
    return { els: out, secs: secs };
  }
  async function quiet(W) {                                     // 늦게 오는 목록까지: 받는 파일 수가 1.5초 동안 그대로일 때까지(최대 8초)
    var last = -1, still = 0;
    for (var i = 0; i < 40; i++) { var n = W.performance.getEntriesByType('resource').length; if (n === last) { still += 200; if (still >= 1500) return; } else { still = 0; last = n; } await wait(200); }
  }
  function firstView(W, d) {                                   // 첫 화면(위 1화면)의 글자·그림·버튼 위치 — 흔들림 비교용(감싸는 상자는 내용이 차며 커지므로 제외)
    var o = {}, cnt = {};
    d.querySelectorAll('body *').forEach(function (e) {
      if (!textOf(e)) return;                                  // 글자만(그림은 늦게 들어오며 자리 잡는 게 정상)
      var r = e.getBoundingClientRect();
      if (r.top > W.innerHeight || r.bottom < 0 || r.width < 8 || r.height < 6 || !isVis(W, e, r)) return;
      if (e.closest(IGN_SELF) || (e.parentElement && e.parentElement.closest(IGN_KIDS))) return;
      var k = keyOf(e) + '|' + textOf(e).slice(0, 12); cnt[k] = (cnt[k] || 0) + 1; k += '#' + cnt[k];
      o[k] = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    });
    return o;
  }
  async function snap(url, w) {
    var f = document.createElement('iframe'), res = { url: url, w: w, errors: [] };
    f.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:' + (w < 768 ? 800 : 900) + 'px;z-index:2147483646;border:0;background:#fff;pointer-events:none';
    document.body.appendChild(f);
    var first = null, hooked = null, t0 = performance.now();
    var iv = setInterval(function () {
      var d; try { d = f.contentDocument; } catch (e) { return; }
      if (!d || !/seniorfuture/.test(d.URL)) return;
      if (hooked !== d && f.contentWindow) { hooked = d; f.contentWindow.addEventListener('error', function (e) { res.errors.push(String(e.message).slice(0, 100)); }); }
      if (!first && d.getElementById('doz_footer_wrap')) { var W = f.contentWindow; W.requestAnimationFrame(function () { try { first = firstView(W, d); res.firstAt = Math.round(performance.now() - t0); } catch (e) {} }); }
    }, 10);
    f.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'preview_mode=1';
    await Promise.race([new Promise(function (r) { f.onload = r; }), wait(25000)]);
    await wait(3500); clearInterval(iv);
    var W = f.contentWindow, d = f.contentDocument;
    try {
      res.stage = d.documentElement.getAttribute('data-sf-stage') === '1';
      var H = d.documentElement.scrollHeight;
      for (var y = 0; y < H; y += 700) { W.scrollTo({ top: y, behavior: 'instant' }); await wait(70); }
      var bar = d.querySelector('[data-sf-tabbar]');
      res.tabbarHiddenAfterScroll = !!(bar && (bar.classList.contains('is-hidden') || W.getComputedStyle(bar).transform !== 'none' && /matrix\(1, 0, 0, 1, 0, [1-9]/.test(W.getComputedStyle(bar).transform)));
      W.scrollTo({ top: 0, behavior: 'instant' });
      d.querySelectorAll('.r2-stag,.r2-lines,[data-sf-reveal],[data-sf-lines],.r3-rv,.r3ap-rv,.sf-rv').forEach(function (e) { e.classList.add('r2-in', 'is-in'); });
      d.querySelectorAll('*').forEach(function (h) { if (h.shadowRoot) h.shadowRoot.querySelectorAll('.sf-rv').forEach(function (e) { e.classList.add('is-in'); }); });
      await quiet(W);
      W.dispatchEvent(new W.Event('resize'));                    // 목록 높이 다시 계산(아임웹 목록은 크기 바뀜 신호 뒤에 맞춰져요)
      await wait(900);
      var vis = function (e) { if (!e) return false; var r = e.getBoundingClientRect(), s = W.getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
      res.m = {
        height: d.documentElement.scrollHeight,
        overflowX: d.documentElement.scrollWidth > d.documentElement.clientWidth + 1,
        mobileHeader: vis(d.querySelector('#doz_header_wrap > .sf-mh')),
        pcHeader: [].some.call(d.querySelectorAll('#doz_header_wrap a'), function (a) { return a.textContent.trim() === '무료 라이브' && vis(a); }),
        tabbar: vis(bar), footer: vis(d.getElementById('doz_footer_wrap')),
        shopCards: (function () { var c = 0; d.querySelectorAll('*').forEach(function (h) { if (h.shadowRoot) c += h.shadowRoot.querySelectorAll('.iw-shop-card').length; }); return c; })()
      };
      var cl = collect(W, d); res.els = cl.els; res.secs = cl.secs;
      var fin = firstView(W, d), moved = [];
      if (first) Object.keys(first).forEach(function (k) { var a = first[k], b = fin[k]; if (!b) return; if (Math.abs(a[1] - b[1]) > 4 || Math.abs(a[0] - b[0]) > 4) moved.push(k.split('>').slice(-2).join('>')); });
      res.late = moved;
    } catch (e) { res.err = String(e).slice(0, 160); }
    f.remove();
    return res;
  }
  function setStage(code) {
    try { if (code) { sessionStorage.setItem('sf_stage_code', code); sessionStorage.setItem('sf_stage', '1'); } else { sessionStorage.removeItem('sf_stage'); sessionStorage.removeItem('sf_stage_code'); } } catch (e) { return String(e); }
    return 'ok';
  }
  async function run(o) {
    var R = { at: new Date().toISOString(), stage: !!o.stage, pages: {}, done: [] };
    window.__CHKR = R;
    var st = setStage(o.stage || null); if (st !== 'ok') { R.err = st; return R; }
    try {
      for (var i = 0; i < o.pages.length; i++) for (var j = 0; j < o.widths.length; j++) {
        var p = o.pages[i], w = o.widths[j];
        R.pages[p.id + '@' + w] = await snap(p.url, w); R.done.push(p.id + '@' + w);
      }
    } finally { setStage(null); }
    R.fin = 1; return R;
  }
  function compare(A, B) {
    var out = {}, bad = 0;
    Object.keys(A.pages).forEach(function (k) {
      var a = A.pages[k], b = B.pages[k], r = { issues: [] };
      if (!b) { r.issues.push('검사 결과 없음'); out[k] = r; bad++; return; }
      if (b.err) r.issues.push('검사 실패: ' + b.err);
      if (B.stage && !b.stage) r.issues.push('시험 모드가 켜지지 않음');
      var ma = a.m || {}, mb = b.m || {};
      if (b.errors.length > a.errors.length) r.issues.push('오류 ' + a.errors.length + '→' + b.errors.length + ': ' + b.errors.slice(0, 2).join(' / '));
      if (mb.overflowX && !ma.overflowX) r.issues.push('가로 넘침 생김');
      ['mobileHeader', 'pcHeader', 'tabbar', 'footer'].forEach(function (x) { if (ma[x] !== mb[x]) r.issues.push({ mobileHeader: '모바일 헤더', pcHeader: 'PC 헤더', tabbar: '하단 탭바', footer: '푸터' }[x] + ' ' + (ma[x] ? '보임' : '안 보임') + '→' + (mb[x] ? '보임' : '안 보임')); });
      if (!a.tabbarHiddenAfterScroll && b.tabbarHiddenAfterScroll) r.issues.push('스크롤하면 하단 탭바가 숨음');
      if (ma.shopCards !== mb.shopCards) r.issues.push('상품 카드 수 ' + ma.shopCards + '→' + mb.shopCards);
      if (Math.abs((ma.height || 0) - (mb.height || 0)) > Math.max(30, (ma.height || 0) * 0.01)) r.issues.push('페이지 높이 ' + ma.height + '→' + mb.height);
      var newLate = (b.late || []).filter(function (x) { return (a.late || []).indexOf(x) < 0; });
      if (newLate.length) r.issues.push('첫 화면 뒤 흔들림 새로 생김 ' + newLate.length + '개: ' + newLate.slice(0, 3).join(', '));
      var ea = a.els || {}, eb = b.els || {}, miss = [], add = [], mv = [], sty = [], smv = [];
      var sa = a.secs || {}, sb = b.secs || {};
      // 섹션: 크기·가로 위치가 바뀌면 문제. 크기 그대로 세로로만 조금 밀린 건(위쪽 어딘가의 잡음) 페이지 높이의 1%·40px까지 무시
      var tolY = Math.max(40, (ma.height || 0) * 0.01);
      Object.keys(sa).forEach(function (k) { var x = sa[k], y = sb[k]; if (y && (Math.abs(x[0] - y[0]) > 3 || Math.abs(x[1] - y[1]) > tolY || Math.abs(x[2] - y[2]) > 3 || Math.abs(x[3] - y[3]) > 3)) smv.push(k.split('>').slice(-2).join('>') + ' (' + x.join(',') + ' → ' + y.join(',') + ')'); });
      Object.keys(ea).forEach(function (k) {
        var x = ea[k], y = eb[k]; if (!y) { miss.push(k); return; }
        if (x[0] !== y[0] || Math.abs(x[1] - y[1]) > 3 || Math.abs(x[2] - y[2]) > 3 || Math.abs(x[3] - y[3]) > 3 || Math.abs(x[4] - y[4]) > 3) mv.push(k.split('>').slice(-3).join('>') + ' (' + x.slice(1, 5).join(',') + ' → ' + y.slice(1, 5).join(',') + ')');
        if (x[5] !== y[5]) sty.push(k.split('>').slice(-3).join('>') + ' (' + x[5] + ' → ' + y[5] + ')');
      });
      Object.keys(eb).forEach(function (k) { if (!ea[k]) add.push(k); });
      if (smv.length) r.issues.push('섹션 위치·크기 바뀜 ' + smv.length + '개: ' + smv.slice(0, 3).join(' , '));
      if (miss.length) r.issues.push('빠진 요소 ' + miss.length + '개: ' + miss.slice(0, 3).join(' , '));
      if (add.length) r.issues.push('새로 생긴 요소 ' + add.length + '개: ' + add.slice(0, 3).join(' , '));
      if (mv.length) r.issues.push('위치·크기 바뀐 요소 ' + mv.length + '개: ' + mv.slice(0, 3).join(' , '));
      if (sty.length) r.issues.push('색·글꼴 바뀐 요소 ' + sty.length + '개: ' + sty.slice(0, 3).join(' , '));
      r.ok = !r.issues.length; if (!r.ok) bad++;
      out[k] = r;
    });
    return { ok: bad === 0, bad: bad, pages: out };
  }
  async function behave(o) {
    var res = [], st = setStage((o && o.stage) || null);
    function add(name, ok, note) { res.push({ name: name, ok: !!ok, note: note || '' }); }
    async function frame(url, w) {
      var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:800px;z-index:2147483646;border:0;background:#fff;pointer-events:none';
      f.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'preview_mode=1'; document.body.appendChild(f);
      await Promise.race([new Promise(function (r) { f.onload = r; }), wait(25000)]); await wait(3000); return f;
    }
    function softClick(f, el) {
      var d = f.contentDocument;
      return new Promise(function (r) { d.addEventListener('sf:softnav', function () { r('soft'); }, { once: true }); f.addEventListener('load', function () { r('reload'); }, { once: true }); setTimeout(function () { r('timeout'); }, 15000); el.click(); });
    }
    try {
      var f = await frame('/', 390), W = f.contentWindow, d = f.contentDocument, errs = [];
      W.addEventListener('error', function (e) { errs.push(String(e.message).slice(0, 80)); });
      var tab = [].find.call(d.querySelectorAll('.sf-tabbar a'), function (a) { return a.textContent.trim() === '교육'; });
      var how = tab ? await softClick(f, tab) : 'no-tab'; await wait(1500);
      var cards = 0; f.contentDocument.querySelectorAll('*').forEach(function (h) { if (h.shadowRoot) cards += h.shadowRoot.querySelectorAll('.iw-shop-card').length; });
      add('하단 탭 이동(홈→교육) 본문만 교체', how === 'soft' && f.contentWindow.location.pathname.indexOf('/course') === 0, how);
      add('교육 목록 카드 보임', cards > 0, cards + '개');
      var back = await new Promise(function (r) { f.contentDocument.addEventListener('sf:softnav', function () { r('soft'); }, { once: true }); f.addEventListener('load', function () { r('reload'); }, { once: true }); setTimeout(function () { r('timeout'); }, 15000); f.contentWindow.history.back(); });
      await wait(1200);
      add('뒤로 가기(교육→홈) 본문만 교체', back === 'soft' && /^\/(index)?$/.test(f.contentWindow.location.pathname), back);
      f.contentWindow.scrollTo({ top: 1500, behavior: 'instant' }); await wait(500); f.contentWindow.scrollTo({ top: 2200, behavior: 'instant' }); await wait(500);
      var b2 = f.contentDocument.querySelector('[data-sf-tabbar]');
      add('스크롤해도 하단 탭바 고정', b2 && !b2.classList.contains('is-hidden') && !f.contentDocument.documentElement.classList.contains('sf-tabbar-hidden'));
      add('오류 없음(홈·교육 이동 중)', errs.length === 0, errs.slice(0, 2).join(' / '));
      f.remove();
      var g = await frame('/insight', 390), gd = g.contentDocument;
      var p2 = [].find.call(gd.querySelectorAll('.pagination a'), function (a) { return a.textContent.trim() === '2'; });
      var h2 = p2 ? await softClick(g, p2) : 'no-page2'; await wait(1200);
      var ft = g.contentDocument.getElementById('doz_footer_wrap');
      add('인사이트 페이지 넘김 본문만 교체·푸터 유지', h2 === 'soft' && ft && g.contentWindow.getComputedStyle(ft).visibility !== 'hidden', h2);
      g.remove();
      for (var ww of [995, 1000]) {
        var hf = await frame('/', ww), hd = hf.contentDocument, HW = hf.contentWindow;
        var mh = hd.querySelector('#doz_header_wrap > .sf-mh'), mhv = !!(mh && HW.getComputedStyle(mh).display !== 'none' && mh.getBoundingClientRect().height > 0);
        var pc = [].some.call(hd.querySelectorAll('#doz_header_wrap a'), function (a) { var r = a.getBoundingClientRect(); return a.textContent.trim() === '무료 라이브' && r.height > 0 && HW.getComputedStyle(a).visibility !== 'hidden'; });
        add('헤더 ' + ww + 'px: ' + (ww < 1000 ? '모바일만' : 'PC만'), ww < 1000 ? (mhv && !pc) : (!mhv && pc), '모바일 ' + mhv + ' / PC ' + pc);
        hf.remove();
      }
      var c = await frame('/course', 390), cd = c.contentDocument, link = null;
      cd.querySelectorAll('*').forEach(function (h) { if (!link && h.shadowRoot) link = h.shadowRoot.querySelector('a[href*="idx="]'); });
      if (link) {
        var H = cd.documentElement; link.click(); await wait(400);
        var leaving = false; try { leaving = c.contentDocument === cd && H.classList.contains('sf-leaving'); } catch (e) {}
        add('상세 이동 시 이전 본문 지움(대비책)', leaving || c.contentDocument !== cd, leaving ? '지움' : '이미 넘어감');
      } else add('상세 이동 시 이전 본문 지움(대비책)', false, '카드 링크 없음');
      c.remove();
    } catch (e) { add('동작 검사 실행', false, String(e).slice(0, 120)); }
    finally { setStage(null); }
    return res;
  }
  // 한 번에: 지금 사이트(A) ↔ 새 코드(B) 비교 → 차이 난 화면만 양쪽을 한 번 더 찍어, 두 번 다 같은 종류의 차이가 날 때만 문제로 남겨요(타이밍 잡음 거르기)
  async function verify(o) {
    var A = o.base || await run({ pages: o.pages, widths: o.widths });
    var B = await run({ pages: o.pages, widths: o.widths, stage: o.stage });
    var c = compare(A, B), retried = [];
    var bad = Object.keys(c.pages).filter(function (k) { return !c.pages[k].ok; });
    for (var i = 0; i < bad.length; i++) {
      var k = bad[i], id = k.split('@')[0], w = +k.split('@')[1], pg = o.pages.filter(function (p) { return p.id === id; });
      var A2 = await run({ pages: pg, widths: [w] }), B2 = await run({ pages: pg, widths: [w], stage: o.stage });
      var c2 = compare(A2, B2).pages[k], kind = function (s) { return String(s).split(/[ :]/)[0]; };
      var again = c.pages[k].issues.filter(function (s) { return c2.issues.some(function (t) { return kind(t) === kind(s); }); });
      retried.push(k + ' ' + c.pages[k].issues.length + '→' + again.length);
      c.pages[k] = { ok: !again.length, issues: again, firstTry: c.pages[k].issues };
    }
    c.bad = Object.keys(c.pages).filter(function (k) { return !c.pages[k].ok; }).length; c.ok = !c.bad; c.retried = retried;
    return { A: A, B: B, cmp: c, behave: o.noBehave ? null : await behave({ stage: o.stage }) };
  }
  window.__CHK = { run: run, compare: compare, behave: behave, verify: verify, setStage: setStage };
})();
