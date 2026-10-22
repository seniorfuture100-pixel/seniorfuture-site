// 원본: src/r3-soft.js
/* r3-soft.js (10/22) — 헤더·하단 탭 페이지끼리는 본문만 바꿔 끼우기 (월부·패스트캠퍼스처럼 헤더는 그대로)
   - 대상: SOFT 목록의 페이지끼리 이동할 때만. 강의·글 상세, 주문서, 마이페이지, 로그인 등은 지금처럼 새 페이지로.
   - 순서: 링크 클릭 → 새 페이지 HTML(마우스 올릴 때 미리 받아 둠) → 헤더·푸터 사이 본문 교체
           → <head>의 아임웹 페이지 CSS·<body> 페이지 종류 클래스·제목·설명·헤더/하단 탭 표시 교체
           → 그 페이지 전용 아임웹 스크립트(게시판·폼 등)를 처음 한 번 불러오고, 페이지 설정·방문 기록 스크립트 실행(아임웹 통계에도 잡힘)
           → 아임웹 목록 위젯 다시 그리기(WidgetRuntime) → 우리 꾸밈(SFUI.init) 다시 실행
   - 떠난 페이지는 꾸며진 그대로 보관 → 뒤로/앞으로는 다시 받지 않고 되살리고, 보던 스크롤 위치로 돌아가요.
   - 무엇이든 어긋나면 그 자리에서 보통 이동으로 넘어가요(안전장치). */
(function () {
  var SOFT = /^\/(|index|course|live|insight|community|business|about|partner|experts|terms)\/?$/;
  var PAGE_HTML_CLASSES = ['r2-mo', 'sf-has-page-head'];
  var WIDGETS = /^(code|padding|text|form|board|newest)$/;
  var H = document.documentElement, cache = {}, busy = false;
  if (!window.fetch || !window.DOMParser || !history.pushState) return;

  function urlOf(href) { try { return new URL(href, location.href); } catch (e) { return null; } }
  // 목록의 페이지 넘김·분류(q·page·category)도 본문만 바꿔요(10/22 — 인사이트 페이지 넘길 때 푸터가 사라지던 것). 글 보기(bmode·idx)는 보통 이동.
  function okQuery(u) { var ok = true; u.searchParams.forEach(function (v, k) { if (!/^(preview_mode|q|page|category)$/.test(k)) ok = false; }); return ok; }
  function soft(u) { return !!u && u.origin === location.origin && SOFT.test(u.pathname) && okQuery(u) && !u.hash; }
  function here() { return soft(new URL(location.href)); }
  function keyOf(u) { var p = new URLSearchParams(u.search); p.delete('preview_mode'); var s = p.toString(); return (u.pathname.replace(/\/$/, '') || '/') + (s ? '?' + s : ''); }
  var age = {};
  function get(u, fresh) {
    var k = keyOf(u);
    if (cache[k] && age[k] && Date.now() - age[k] > 300000) fresh = true;   // 미리 받은 지 5분 넘으면 새로
    if (fresh || !cache[k]) age[k] = Date.now();
    if (fresh || !cache[k]) cache[k] = fetch(u.href, { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (!r.ok) throw r.status; return r.text(); })
      .then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); })
      .catch(function (e) { delete cache[k]; delete age[k]; throw e; });
    return cache[k];
  }
  function mid(d) {
    var hd = d.getElementById('doz_header_wrap'), ft = d.getElementById('doz_footer_wrap'), out = [];
    if (!hd || !ft) return null;
    for (var e = hd.nextElementSibling; e && e !== ft; e = e.nextElementSibling) out.push(e);
    return out;
  }
  function safeDoc(list) {
    return !!list && list.length > 0 && list.every(function (s) {
      if (s.querySelector('script:not([type="application/json"]), iframe')) return false;
      return [].slice.call(s.querySelectorAll('[data-widget-type]')).every(function (w) { return WIDGETS.test(w.getAttribute('data-widget-type')); });
    });
  }
  function srcKey(s) { return (s.getAttribute('src') || '').replace(/\?.*$/, ''); }
  function inlineScripts(d) {
    return [].slice.call(d.querySelectorAll('script:not([src]):not([id])')).filter(function (s) {
      var t = (s.type || '').toLowerCase(); return !t || t === 'text/javascript' || t === 'application/javascript';
    }).map(function (s) { return s.textContent; });
  }
  function bodyClasses(d) { return (d.body.className || '').split(/\s+/).filter(function (c) { return c && c !== 'page_ready'; }); }   // page_ready는 아임웹이 로딩 뒤 지움

  function setActive() {
    var p = location.pathname;
    document.querySelectorAll('.sf-tabbar a[data-match]').forEach(function (a) {
      var on = false; try { on = new RegExp(a.getAttribute('data-match')).test(p); } catch (e) {}
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function headerActive(nd) {
    var hd = document.getElementById('doz_header_wrap'), nh = nd.getElementById('doz_header_wrap'); if (!hd || !nh) return;
    hd.querySelectorAll('.nav-item._item.active, a.dropdown-toggle.active').forEach(function (e) { e.classList.remove('active'); });
    nh.querySelectorAll('.nav-item._item.active').forEach(function (n) {
      var a = n.querySelector('a[href]'); if (!a) return;
      var href = a.getAttribute('href');
      hd.querySelectorAll('.nav-item._item').forEach(function (m) { var b = m.querySelector('a[href]'); if (b && b.getAttribute('href') === href) m.classList.add('active'); });
    });
    nh.querySelectorAll('a.dropdown-toggle.active[href]').forEach(function (a) {
      hd.querySelectorAll('a.dropdown-toggle[href="' + a.getAttribute('href') + '"]').forEach(function (b) { b.classList.add('active'); });
    });
  }
  function headStyles(nd) {
    // 아임웹은 페이지마다 위젯 CSS를 <head>의 이름 없는 <style>에 합쳐 넣어요 → 앞 120자가 같은 것끼리 내용 교체(짝이 없으면 새로 붙임)
    var hs = [].slice.call(document.head.querySelectorAll('style:not([id])')), used = [];
    [].slice.call(nd.head.querySelectorAll('style:not([id])')).forEach(function (ns) {
      var pre = ns.textContent.slice(0, 120), hit = -1;
      for (var i = 0; i < hs.length; i++) if (used.indexOf(i) < 0 && hs[i].textContent.slice(0, 120) === pre) { hit = i; break; }
      if (hit < 0) { var c = document.createElement('style'); c.textContent = ns.textContent; document.head.appendChild(c); return; }
      used.push(hit); if (hs[hit].textContent !== ns.textContent) hs[hit].textContent = ns.textContent;
    });
  }
  function loadScripts(nd) {
    var have = {}; [].slice.call(document.scripts).forEach(function (s) { if (s.src) have[srcKey(s)] = 1; });
    var need = [].slice.call(nd.scripts).filter(function (s) { return s.getAttribute('src') && !have[srcKey(s)] && !s.async; });
    return need.reduce(function (p, s) {
      return p.then(function () { return new Promise(function (res) {
        var x = document.createElement('script'); x.src = s.getAttribute('src'); x.onload = res; x.onerror = res; document.body.appendChild(x);
      }); });
    }, Promise.resolve());
  }
  function runPageScripts(nd, oldDoc, referer, onlyLog) {
    // 새 페이지에만 있는 인라인 스크립트(페이지 설정·방문 기록·고정 헤더 등)를 실행. 방문 기록의 이전 주소는 직전 페이지로.
    var old = oldDoc ? inlineScripts(oldDoc) : [];
    // 헤더·섹션 고정(scrollToFixed)은 첫 페이지에서 이미 설정돼 있어서, 다시 돌면 빈 칸이 생겨요 → 실행하는 동안만 잠시 끔
    var $ = window.jQuery, S = window.SITE, f1 = $ && $.fn && $.fn.scrollToFixed, f2 = S && S.firstScrollFixed;
    if (f1) $.fn.scrollToFixed = function () { return this; };
    if (f2) S.firstScrollFixed = function () {};
    // 헤더는 그대로 두므로, 헤더를 다시 설정하는 블록(헤더 안 아이디·HEADER_·고정 헤더)은 빼고 본문 위젯 블록만 실행(중복 이벤트 방지)
    var hd = document.getElementById('doz_header_wrap'), hids = [];
    if (hd) [].slice.call(hd.querySelectorAll('[id]')).forEach(function (e) { if (/^[sw]20\d{6}/.test(e.id)) hids.push(e.id); });
    function headerish(b) {
      if (/firstScrollFixed|HEADER_|new_fixed_header_disable|fixed-menu-on|mobile_carousel_nav|_main_menu/.test(b)) return true;
      for (var i = 0; i < hids.length; i++) if (b.indexOf(hids[i]) >= 0) return true;
      return false;
    }
    try {
      inlineScripts(nd).forEach(function (t) {
        if (old.indexOf(t) >= 0) return;
        if (onlyLog && !/SITE_VISIT_LOG|JSON\.parse\(atob\(/.test(t)) return;
        var code = t;
        if (/\$\(function\s*\(\)\s*\{/.test(t) && !/SITE_VISIT_LOG/.test(t)) code = t.split(/(?=\$\(function\s*\(\)\s*\{)/).filter(function (b) { return !headerish(b); }).join(';\n');
        if (!code.trim()) return;
        try { (0, eval)(code.split('document.referrer').join(JSON.stringify(referer))); } catch (e) {}
      });
    } finally { if (f1) $.fn.scrollToFixed = f1; if (f2) S.firstScrollFixed = f2; }
  }
  // sf-r2-js 는 처음 읽힐 때 주소를 한 번만 기억해요 → 바꾼 뒤 다시 실행해서 새 주소 기준으로 꾸미게(전역 이벤트는 이미 걸려 있어 다시 걸지 않음)
  function rerunR2() {
    var s = document.getElementById('sf-r2-js'); if (!s && !window.__sfR2) return;
    var wa = window.addEventListener, da = document.addEventListener, noop = function () {};
    var reg = SFUI.register, SKIP = { r2Header: 1 };   // 헤더는 그대로라 헤더 모듈은 다시 돌리지 않아요(클릭 이벤트가 겹쳐 탭 이동을 막았음)
    window.addEventListener = noop; document.addEventListener = noop;
    SFUI.register = function (n, fn) { if (!SKIP[n]) reg.call(SFUI, n, fn); };
    try { if (window.__sfR2) window.__sfR2(); else (0, eval)(s.textContent); } catch (e) {} finally { window.addEventListener = wa; document.addEventListener = da; SFUI.register = reg; }
  }
  function after(u, scrollY) {
    PAGE_HTML_CLASSES.forEach(function (c) { H.classList.remove(c); });
    ['r2-ins', 'r2-help', 'r2-my'].forEach(function (c) { H.classList.remove(c); });
    setActive();
    // 모바일 전체 메뉴·검색 창이 열린 채로 이동했다면 닫기
    [].slice.call(document.querySelectorAll('.sf-drawer')).forEach(function (m) {
      var cs = getComputedStyle(m); if (m.hidden || cs.display === 'none' || cs.visibility === 'hidden') return;
      var x = m.querySelector('button[data-sf-drawer-close]'); if (x) x.click();
    });
    rerunR2();
    if (location.pathname === '/' && !document.querySelector('h1')) {           // 홈 화면 읽기용 제목(첫 방문 때만 넣던 것)
      var m = document.querySelector('main') || document.querySelector('#doz_body .section_wrap');
      if (m) { var h1 = document.createElement('h1'); h1.className = 'sf-sr-h1'; h1.textContent = '시니어퓨처 · 시니어 산업 실무 교육과 커뮤니티'; m.insertBefore(h1, m.firstChild); }
    }
    try { window.SFUI && SFUI.init(document); } catch (e) {}
    try { window.WidgetRuntime && WidgetRuntime.init(); } catch (e) {}
    try { window.__r3apInit && window.__r3apInit(); } catch (e) {}
    // 사이트가 부드러운 스크롤이라 순간 이동으로, 다른 코드가 위치를 바꿔도 잠깐 동안 다시 맞춰요(사용자가 그새 스크롤하면 멈춤)
    var want = scrollY || 0, moved = false, mark = function () { moved = true; };
    var jump = function () { if (!moved && Math.abs(window.scrollY - want) > 2) window.scrollTo({ top: want, left: 0, behavior: 'instant' }); };
    window.scrollTo({ top: want, left: 0, behavior: 'instant' });
    ['wheel', 'touchmove', 'keydown'].forEach(function (t) { window.addEventListener(t, mark, { once: true, passive: true }); });
    [50, 200, 600, 1300].forEach(function (ms) { setTimeout(jump, ms); });
    [0, 300, 1200, 3000].forEach(function (ms) { setTimeout(function () { try { window.dispatchEvent(new Event('resize')); } catch (e) {} }, ms); });   // 아래 여백 계산 등이 목록이 다 그려진 뒤 다시 맞도록
    try { if (window.gtag) gtag('event', 'page_view', { page_location: u.href, page_path: u.pathname, page_title: document.title }); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push({ event: 'sf_soft_view', page_path: u.pathname }); } catch (e) {}
    shown = u.href;
    document.dispatchEvent(new CustomEvent('sf:softnav', { detail: { url: u.href } }));
  }

  // 떠나는 페이지를 꾸며진 그대로 보관
  var kept = {}, shown = location.href;
  function keep(serverBody) {
    var cl = mid(document); if (!cl) return;
    var sb = serverBody || [];
    kept[keyOf(new URL(shown))] = {
      nodes: cl, title: document.title, serverBody: sb,
      styles: [].slice.call(document.head.querySelectorAll('style:not([id])')).map(function (st) { return [st, st.textContent]; }),
      active: [].slice.call(document.querySelectorAll('#doz_header_wrap .active')),
      html: PAGE_HTML_CLASSES.filter(function (c) { return H.classList.contains(c); }),
      desc: (document.querySelector('meta[name="description"]') || {}).content
    };
  }
  function swapBody(oldServer, newServer) {
    var keepRuntime = bodyClasses(document).filter(function (c) { return oldServer.indexOf(c) < 0; });
    var all = newServer.concat(keepRuntime), seen = {};
    document.body.className = all.filter(function (c) { return seen[c] ? false : (seen[c] = 1); }).join(' ');
  }
  // 기록 칸마다 번호를 붙이고, 그 칸에서 보던 스크롤 위치를 기억(뒤로·앞으로 모두 복원)
  var ys = {}, eid = 0;
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function saveY() { if (eid) ys[eid] = window.scrollY; }
  window.addEventListener('scroll', function () { saveY(); }, { passive: true });

  function swap(u, nd, oldDoc, push, y) {
    var nl = mid(nd), cl = mid(document);
    if (!safeDoc(nl) || !cl) throw 'unsafe';
    var oldServer = bodyClasses(oldDoc), ref = shown;
    keep(oldServer);
    headStyles(nd);
    var ft = document.getElementById('doz_footer_wrap');
    cl.forEach(function (e) { e.remove(); });
    nl.forEach(function (e) { ft.parentNode.insertBefore(document.importNode(e, true), ft); });
    document.title = nd.title;
    swapBody(oldServer, bodyClasses(nd));
    var a = document.querySelector('meta[name="description"]'), b = nd.querySelector('meta[name="description"]'); if (a && b) a.setAttribute('content', b.getAttribute('content'));
    headerActive(nd);
    if (push) { eid = newId(); history.pushState({ sfSoft: 1, id: eid }, '', u.href); }
    return loadScripts(nd).then(function () { runPageScripts(nd, oldDoc, ref, false); after(u, y); });
  }
  function restore(u, k, oldDoc, push, y) {
    var oldServer = bodyClasses(oldDoc), ref = shown;
    keep(oldServer);
    var ft = document.getElementById('doz_footer_wrap');
    mid(document).forEach(function (e) { e.remove(); });
    k.nodes.forEach(function (e) { ft.parentNode.insertBefore(e, ft); });
    k.styles.forEach(function (p) { if (p[0].isConnected && p[0].textContent !== p[1]) p[0].textContent = p[1]; });
    document.title = k.title;
    swapBody(oldServer, k.serverBody);
    var md = document.querySelector('meta[name="description"]'); if (md && k.desc != null) md.setAttribute('content', k.desc);
    document.querySelectorAll('#doz_header_wrap .active').forEach(function (e) { e.classList.remove('active'); });
    k.active.forEach(function (e) { e.classList.add('active'); });
    if (push) { eid = newId(); history.pushState({ sfSoft: 1, id: eid }, '', u.href); }
    after(u, y);
    k.html.forEach(function (c) { H.classList.add(c); });
    // 방문 기록·페이지 설정은 새 토큰이 필요해서 뒤에서 조용히 새로 받아 실행
    get(u, true).then(function (nd) { runPageScripts(nd, null, ref, true); }).catch(function () {});
  }
  function go(u, push, y) {
    if (busy) return; busy = true;
    var done = function () { busy = false; };
    var fail = function (why) {   // 실패하면 보통 이동 + 이유를 남겨 둬요(점검용: sessionStorage sf_soft_fail)
      busy = false;
      try { sessionStorage.setItem('sf_soft_fail', JSON.stringify({ to: u.pathname, from: new URL(shown).pathname, why: String(why && (why.stack || why.message) || why).slice(0, 400), t: Date.now() })); } catch (e) {}
      location.href = u.href;
    };
    if (push) saveY();
    var oldP = get(new URL(shown));                     // 지금 페이지의 서버 원본(바디 클래스·스크립트 비교용)
    var k = kept[keyOf(u)];
    if (k) {
      oldP.then(function (od) { restore(u, k, od, push, y); done(); }).catch(fail);
      return;
    }
    Promise.all([get(u), oldP]).then(function (r) {
      if (!safeDoc(mid(r[0])) || !mid(document)) return fail(!mid(document) ? 'no-mid-current' : 'unsafe-target');
      return swap(u, r[0], r[1], push, y).then(done);
    }).catch(fail);
  }

  if (here()) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    eid = (history.state && history.state.id) || newId();
    history.replaceState(Object.assign({}, history.state || {}, { sfSoft: 1, id: eid }), '', location.href);
  }
  // 클릭은 맨 먼저(window, 캡처 단계) 받아요 — 다른 코드가 전파를 막아도 탭 이동이 되게. 다른 코드(메뉴 닫기 등)는 그대로 실행돼요.
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download')) return;
    var u = urlOf(a.getAttribute('href')); if (!soft(u) || !here()) return;
    if (keyOf(u) === keyOf(new URL(location.href))) return;
    e.preventDefault(); go(u, true, 0);
  }, true);
  // 마우스를 올리거나 손가락을 대면 미리 받아 둬요
  ['pointerover', 'touchstart'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a || !here()) return;
      var u = urlOf(a.getAttribute('href'));
      if (soft(u) && keyOf(u) !== keyOf(new URL(location.href)) && !kept[keyOf(u)]) get(u).catch(function () {});
    }, { passive: true });
  });
  // 모바일(하단 탭이 보일 때)은 마우스 올림이 없어 미리 받을 틈이 없어요 → 화면이 쉴 때 지금 페이지와 하단 탭 페이지를 하나씩 미리 받아 둬요
  // (아임웹 서버가 페이지를 천천히 보내서 첫 탭 이동이 1초 넘게 걸리던 것). 데이터 절약 모드·느린 망에서는 안 해요.
  function warm() {
    var c = navigator.connection || {}, tb = document.querySelector('.sf-tabbar');
    if (document.prerendering) { document.addEventListener('prerenderingchange', function () { idle(warm); }, { once: true }); return; }   // 미리 그려지는 중엔 안 받음
    if (c.saveData || /2g/.test(c.effectiveType || '') || !here() || !tb || getComputedStyle(tb).display === 'none') return;
    var list = [new URL(location.href)];
    [].slice.call(tb.querySelectorAll('a[href]')).forEach(function (a) {
      var u = urlOf(a.getAttribute('href'));
      if (soft(u) && !kept[keyOf(u)] && !list.some(function (x) { return keyOf(x) === keyOf(u); })) list.push(u);
    });
    list.reduce(function (p, u) { return p.then(function () { return get(u).catch(function () {}); }); }, Promise.resolve());
  }
  function idle(fn) { if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 4000 }); else setTimeout(fn, 1500); }
  if (document.readyState === 'complete') idle(warm); else window.addEventListener('load', function () { idle(warm); });
  document.addEventListener('sf:softnav', function () { idle(warm); });
  // 뒤로·앞으로: 경로가 바뀐 경우만(#만 바뀐 약관 탭 등은 그대로). 보던 스크롤 위치로 돌아가요.
  var cur = keyOf(new URL(location.href));
  document.addEventListener('sf:softnav', function () { cur = keyOf(new URL(location.href)); });
  window.addEventListener('popstate', function (e) {
    var u = new URL(location.href); if (keyOf(u) === cur) return;
    var id = e.state && e.state.id, y = id && ys[id] != null ? ys[id] : 0;
    if (id) eid = id;
    if (soft(u) && document.getElementById('doz_footer_wrap')) go(u, false, y); else location.reload();
  });
})()
