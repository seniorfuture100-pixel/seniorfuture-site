// 원본: src/r3-detail.js
/* r3-detail.js (10/22) — 상세 페이지(강의·라이브·모임·글)를 누르면 이전 화면 없이 바로 새 화면이 보이게 (사장님 결정)
   ① 미리 그려 두기(크롬 계열만): PC는 마우스를 올리면, 모바일은 손가락을 대거나 상세 링크가 화면에 0.4초 이상 보이면
      최근 2개를 보이지 않는 곳에 미리 다 그려 둬요. 누르면 그 화면으로 바로 바뀌어요. 데이터 절약 모드·느린 망은 안 함.
   ② 통계 보호: 미리 그리는 동안(document.prerendering)에는 방문·조회 기록 요청(아임웹 방문/상품 조회 기록·행동 분석,
      구글 애널리틱스, 네이버)을 보내지 않고 모아 뒀다가, 고객이 실제로 그 페이지를 여는 순간 보내요 → 안 연 페이지는 기록 없음.
      점검용: localStorage sf_pr_debug=1 이면 미리 그리는 동안의 요청을 localStorage sf_pr_log 에 남겨요.
   ③ 대비책: 미리 못 그린 상세 페이지(아이폰 사파리 등)로 넘어갈 때 0.12초 안에 안 바뀌면 이전 본문을 지우고 맨 위 진행 막대만 보여요.
   ④ 상세 페이지에는 html.sf-detail 을 붙여 스크롤 나타나기 효과 없이 내용이 처음부터 다 보이게(r3-nav.css). */
(function () {
  var H = document.documentElement;
  var NOT_PATH = /^\/(shop_payment|shop_cart|cart|login|logout|join|admin|backpg|shop_mypage|mypage|classroom|_\/)/;
  function detail(u) {
    if (!u || u.origin !== location.origin || NOT_PATH.test(u.pathname) || !/^\/[\w-]+\/?$/.test(u.pathname)) return false;
    var p = u.searchParams, ok = /^\d+$/.test(p.get('idx') || '');
    p.forEach(function (v, k) { if (!/^(idx|bmode|preview_mode|page|category|t|q)$/.test(k) || (k === 'bmode' && v !== 'view')) ok = false; });
    return ok;
  }
  function urlOf(h) { try { return new URL(h, location.href); } catch (e) { return null; } }
  if (detail(new URL(location.href))) H.classList.add('sf-detail');

  // ② 통계 보호 — 이 스크립트는 <head>에서 아임웹 스크립트보다 먼저 실행돼요
  if (document.prerendering) (function () {
    var LOG = /add_visit_log|add_prod_view_log|behavior-tracking|fo-analytics|google-analytics\.com|analytics\.google\.com|\/g\/collect|wcs\.naver|facebook\.com\/tr|kakao.*pixel|pixel\.kakao/i;
    var q = [], dbg = false, seen = { held: [], passed: [] };
    try { dbg = localStorage.getItem('sf_pr_debug') === '1'; if (dbg) localStorage.setItem('sf_pr_start', location.pathname + location.search.replace(/[?&]preview_mode=1/, '') + ' @' + Date.now()); } catch (e) {}
    function hold(u) { u = String(u && u.url || u || ''); var h = document.prerendering && LOG.test(u); if (dbg && document.prerendering) seen[h ? 'held' : 'passed'].push(u.split('?')[0].slice(0, 90)); return h; }
    var X = XMLHttpRequest.prototype, xo = X.open, xs = X.send;
    X.open = function (m, u) { this.__sfu = u; return xo.apply(this, arguments); };
    X.send = function () { var x = this, a = arguments; if (hold(x.__sfu)) { q.push(function () { xs.apply(x, a); }); return; } return xs.apply(x, a); };
    var of = window.fetch;
    if (of) window.fetch = function (u) { var s = this, a = arguments; if (hold(u)) return new Promise(function (ok, no) { q.push(function () { of.apply(s, a).then(ok, no); }); }); return of.apply(s, a); };
    var nb = navigator.sendBeacon && navigator.sendBeacon.bind(navigator);
    if (nb) navigator.sendBeacon = function (u, d) { if (hold(u)) { q.push(function () { nb(u, d); }); return true; } return nb(u, d); };
    var ds = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (ds && ds.set) Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, enumerable: ds.enumerable, get: ds.get,
      set: function (v) { var im = this; if (LOG.test(String(v)) && hold(v)) { q.push(function () { ds.set.call(im, v); }); return; } ds.set.call(im, v); } });
    document.addEventListener('prerenderingchange', function () {
      var a = q; q = [];
      if (dbg) try { var L = JSON.parse(localStorage.getItem('sf_pr_log') || '[]'); L.push({ t: Date.now(), page: location.pathname + location.search.replace(/[?&]preview_mode=1/, ''), held: seen.held, passed: seen.passed, sent: a.length }); localStorage.setItem('sf_pr_log', JSON.stringify(L.slice(-20))); } catch (e) {}
      a.forEach(function (f) { try { f(); } catch (e) {} });
    }, { once: true });
  })();

  // ① 미리 그려 두기
  var c = navigator.connection || {};
  var CAN = !!(window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) && !c.saveData && !/2g/.test(c.effectiveType || '');
  var picks = [], rules = null;
  function want(u) {
    if (!CAN || document.prerendering || !detail(u)) return;
    var k = u.pathname + u.search; if (k === location.pathname + location.search) return;
    var i = picks.indexOf(k); if (i === 0) return;
    if (i > 0) picks.splice(i, 1);
    picks.unshift(k); picks = picks.slice(0, 2);
    var s = document.createElement('script'); s.type = 'speculationrules';
    s.textContent = JSON.stringify({ prerender: [{ source: 'list', urls: picks, eagerness: 'immediate' }] });
    if (rules) rules.remove();
    (document.head || H).appendChild(s); rules = s;
  }
  function anchorOf(e) {
    var path = e.composedPath ? e.composedPath() : [e.target];
    for (var i = 0; i < path.length; i++) if (path[i] && path[i].tagName === 'A' && path[i].getAttribute && path[i].getAttribute('href')) return path[i];
    return null;
  }
  if (CAN) {
    var ht = 0;
    document.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var a = anchorOf(e); if (!a) return;
      clearTimeout(ht); ht = setTimeout(function () { want(urlOf(a.href)); }, 90);
    }, { passive: true });
    document.addEventListener('pointerout', function () { clearTimeout(ht); }, { passive: true });
    document.addEventListener('touchstart', function (e) { var a = anchorOf(e); if (a) want(urlOf(a.href)); }, { passive: true });
    // 모바일: 상세 링크가 화면에 0.4초 이상 보이면(그림자 DOM 안 상품 카드 포함)
    if (window.IntersectionObserver && window.matchMedia && matchMedia('(hover: none)').matches) {
      var timers = new WeakMap(), watched = new WeakSet();
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          var a = en.target;
          if (en.isIntersecting) timers.set(a, setTimeout(function () { want(urlOf(a.href)); }, 400));
          else clearTimeout(timers.get(a));
        });
      }, { threshold: 0.5 });
      var scan = function (root) {
        [].forEach.call(root.querySelectorAll('a[href*="idx="]'), function (a) { if (!watched.has(a) && detail(urlOf(a.href))) { watched.add(a); io.observe(a); } });
        [].forEach.call(root.querySelectorAll('*'), function (el) { if (el.shadowRoot) scan(el.shadowRoot); });
      };
      var st = 0, n = 0, later = function () { clearTimeout(st); st = setTimeout(function () { if (!document.prerendering && n++ < 40) scan(document); }, 600); };
      // 카드처럼 링크가 든 요소가 새로 붙을 때만 다시 찾아요(초 단위로 바뀌는 카운트다운 글자 등은 무시)
      var added = function (ms) { for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) { var x = ms[i].addedNodes[j]; if (x.nodeType === 1 && (x.tagName === 'A' || x.shadowRoot || x.querySelector('a[href*="idx="]'))) return later(); } };
      var start = function () { later(); new MutationObserver(added).observe(document.body, { childList: true, subtree: true }); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
      document.addEventListener('sf:softnav', later);
    }
  }

  // ③ 대비책: 미리 못 그린 페이지로 넘어갈 때 이전 본문 지우기
  var lt = 0, lt2 = 0;
  function off() { clearTimeout(lt); clearTimeout(lt2); H.classList.remove('sf-leaving'); }
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = anchorOf(e); if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u = urlOf(a.href); if (!u || u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
    if (u.pathname === location.pathname && u.search === location.search) return;   // 같은 페이지 안 이동(#)
    if (!detail(u)) return;                                                         // 상세 페이지로 갈 때만(목록 페이지 넘김 등은 푸터까지 지우지 않게)
    off();
    lt = setTimeout(function () { H.classList.add('sf-leaving'); }, 120);
    lt2 = setTimeout(off, 8000);                                                    // 이동이 취소된 경우 되돌리기
  });
  window.addEventListener('pageshow', off);
  window.addEventListener('popstate', off);
})()
