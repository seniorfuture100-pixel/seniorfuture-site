// 화면 품질 추가 점검(10/26) — 간격·글씨 깨짐·화면 밀림. 사이트 탭(관리자)에서 실행: __QA2.run(urls, widths) → __QA2.res
// audit.js 와 같은 방식(정해진 너비 iframe, 사이트를 바꾸지 않음). 사람이 보면 거슬리는 것만 모아요.
//  clip:  글자가 상자에 잘림(말줄임표·줄 수 제한을 일부러 건 곳은 빼요)
//  brk:   한 단어가 중간에서 줄바꿈(예: '수강신' / '청') — 한글·영문·숫자 사이에서 줄이 바뀐 곳
//  over:  글자끼리 겹침
//  font:  화면에 쓰인 글꼴이 실제로 받아졌는지(안 받아지면 기본 글꼴로 보임)
//  gaps:  섹션 사이 빈칸(마지막 내용 ↔ 다음 첫 내용). 너무 붙음(<12)·너무 벌어짐(휴대폰 >160, PC >240)만 표시
//  cls:   첫 화면이 뜬 뒤 내용이 밀린 정도(Layout Shift 합, 0.1 넘으면 눈에 띔) / lcp: 가장 큰 내용이 뜬 시각(ms)
(function () {
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var WORD = /[0-9A-Za-z가-힣]/;
  function vis(W, e) { var r = e.getBoundingClientRect(), s = W.getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; }
  function name(e) { return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList[0] ? '.' + e.classList[0] : ''); }
  function ownText(e) { return [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); }); }
  function hiddenUp(W, e) { for (var p = e; p && p.nodeType === 1; p = p.parentElement) { var s = W.getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return true; } return false; }
  function measure(f, w) {
    var W = f.contentWindow, d = f.contentDocument, o = {}, skip = '#doz_footer_wrap, footer, .sf-ft, script, style, noscript, [aria-hidden=true], .sr-only, .blind';
    o.title = ((d.querySelector('h1') || {}).textContent || '').trim().slice(0, 24);
    var texts = [].filter.call(d.querySelectorAll('body *'), function (e) { return ownText(e).length && !e.closest(skip) && vis(W, e) && !hiddenUp(W, e); });
    o.n = texts.length;
    // 잘림
    o.clip = texts.filter(function (e) {
      var s = W.getComputedStyle(e);
      if (s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) return false;
      var hid = function (v) { return v === 'hidden' || v === 'clip'; };
      return (hid(s.overflowX) && e.scrollWidth > e.clientWidth + 2) || (hid(s.overflowY) && e.scrollHeight > e.clientHeight + 2);
    }).slice(0, 8).map(function (e) { return name(e) + ' "' + e.textContent.trim().slice(0, 16) + '"'; });
    // 단어 중간 줄바꿈
    var brk = [];
    texts.slice(0, 900).forEach(function (e) {
      if (brk.length >= 10) return;
      ownText(e).forEach(function (n) {
        var v = n.nodeValue; if (v.length > 400) return;
        var rg = d.createRange(), prevTop = null, prevCh = '';
        for (var i = 0; i < v.length; i++) {
          var ch = v[i]; if (/\s/.test(ch)) { prevCh = ' '; continue; }
          rg.setStart(n, i); rg.setEnd(n, i + 1);
          var r = rg.getClientRects()[0]; if (!r) continue;
          if (prevTop !== null && r.top > prevTop + 4 && WORD.test(ch) && WORD.test(prevCh)) {
            var s = v.lastIndexOf(' ', i), t = v.indexOf(' ', i);
            brk.push(name(e) + ' "' + v.slice(s < 0 ? 0 : s + 1, t < 0 ? v.length : t).slice(0, 16) + '" @' + (i - (s < 0 ? 0 : s + 1)));
            break;
          }
          prevTop = r.top; prevCh = ch;
        }
      });
    });
    o.brk = brk;
    // 겹침(서로 조상이 아닌 글자 상자끼리 4px 넘게 겹침)
    var boxes = texts.map(function (e) { var rg = d.createRange(); rg.selectNodeContents(e); var r = rg.getBoundingClientRect(); return { e: e, r: r }; }).filter(function (b) { return b.r.width > 2 && b.r.height > 2; });
    var over = [];
    for (var i = 0; i < boxes.length && over.length < 6; i++) for (var j = i + 1; j < boxes.length && over.length < 6; j++) {
      var a = boxes[i], b = boxes[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      var x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (x > 4 && y > 4) {
        // 위에 덮인 것이 진짜 보이는지(배지가 그림 위에 얹힌 것 같은 의도된 배치는 서로 다른 쌓임이라 elementFromPoint 로 거름)
        var cx = Math.max(a.r.left, b.r.left) + x / 2, cy = Math.max(a.r.top, b.r.top) + y / 2;
        if (cy < 0 || cy > W.innerHeight) { W.scrollTo(0, W.scrollY + cy - W.innerHeight / 2); var ra = a.e.getBoundingClientRect(), rb = b.e.getBoundingClientRect(); cy = (Math.max(ra.top, rb.top) + Math.min(ra.bottom, rb.bottom)) / 2; cx = (Math.max(ra.left, rb.left) + Math.min(ra.right, rb.right)) / 2; }
        var top = d.elementFromPoint(cx, cy);
        if (top && (a.e.contains(top) || b.e.contains(top) || top.contains(a.e) || top.contains(b.e)))
          over.push(name(a.e) + ' "' + a.e.textContent.trim().slice(0, 10) + '" × ' + name(b.e) + ' "' + b.e.textContent.trim().slice(0, 10) + '"');
      }
    }
    o.over = over;
    // 글꼴
    var fams = {};
    texts.forEach(function (e) { var f0 = W.getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim(); fams[f0] = (fams[f0] || 0) + 1; });
    o.font = Object.keys(fams).map(function (k) { var ok = /^(sans-serif|serif|monospace|system-ui|-apple-system)$/i.test(k) || d.fonts.check('16px "' + k + '"', '가'); return k + ':' + fams[k] + (ok ? '' : ' ✗안받아짐'); });
    // 섹션 사이 빈칸
    W.scrollTo(0, 0);
    var secs = [].filter.call(d.querySelectorAll('#doz_body .section_wrap, .doz_sys .section_wrap, body .section_wrap'), function (s) { return !s.parentElement.closest('.section_wrap') && vis(W, s) && s.getBoundingClientRect().height > 20; });
    var leafs = function (s) { return [].filter.call(s.querySelectorAll('*'), function (e) { var r = e.getBoundingClientRect(); return (e.tagName === 'IMG' || ownText(e).length || /^(BUTTON|INPUT|IFRAME|VIDEO|svg)$/.test(e.tagName)) && r.height > 4 && vis(W, e) && !hiddenUp(W, e); }); };
    var prevB = null, gaps = [], lim = w < 768 ? 160 : 240, sy = W.scrollY;
    secs.forEach(function (s, k) {
      var L = leafs(s); if (!L.length) return;
      var t = Math.min.apply(null, L.map(function (e) { return e.getBoundingClientRect().top; })), b = Math.max.apply(null, L.map(function (e) { return e.getBoundingClientRect().bottom; }));
      if (prevB !== null) { var g = Math.round(t - prevB); if (g < 12 || g > lim) gaps.push('섹션' + k + '(' + Math.round(t + sy) + 'px) 위 ' + g + 'px'); }
      prevB = b;
    });
    var ft = d.querySelector('#doz_footer_wrap');
    if (ft && prevB !== null) { var g2 = Math.round(ft.getBoundingClientRect().top - prevB); if (g2 < 12 || g2 > lim) gaps.push('푸터 위 ' + g2 + 'px'); }
    o.gaps = gaps; o.secs = secs.length;
    return o;
  }
  function one(url, w) {
    return new Promise(function (done) {
      var f = document.createElement('iframe'), t0 = Date.now(), perf = { cls: 0, lcp: 0 };
      f.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:' + (w < 768 ? 800 : 900) + 'px;border:0;z-index:-1;opacity:0.01;pointer-events:none';
      f.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'preview_mode=1';
      var hook = setInterval(function () {
        try {
          var W = f.contentWindow; if (!W || W.__qa2 || !W.PerformanceObserver || W.location.href === 'about:blank') return; W.__qa2 = 1;
          new W.PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { if (!e.hadRecentInput) perf.cls += e.value; }); }).observe({ type: 'layout-shift', buffered: true });
          new W.PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { perf.lcp = Math.round(e.startTime); }); }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) { }
      }, 15);
      f.onload = function () {
        clearInterval(hook);
        var W = f.contentWindow;
        // 첫 화면 밀림은 스크롤 전 3초만 셈
        wait(3000).then(function () {
          var cls = Math.round(perf.cls * 1000) / 1000, lcp = perf.lcp;
          W.scrollTo(0, 1e6); return wait(1500).then(function () { W.scrollTo(0, 1e6); return wait(800); }).then(function () {
            var o; try { o = measure(f, w); } catch (e) { o = { fail: String(e).slice(0, 120) }; }
            o.url = url; o.w = w; o.cls = cls; o.lcp = lcp; o.load = Date.now() - t0;
            f.remove(); done(o);
          });
        });
      };
      document.body.appendChild(f);
      setTimeout(function () { if (f.isConnected) { clearInterval(hook); f.remove(); done({ url: url, w: w, fail: 'timeout' }); } }, 45000);
    });
  }
  window.__QA2 = { res: [], busy: false, run: function (urls, widths) {
    var q = []; urls.forEach(function (u) { widths.forEach(function (w) { q.push([u, w]); }); });
    __QA2.busy = true; __QA2.res = [];
    return q.reduce(function (p, x) { return p.then(function () { return one(x[0], x[1]).then(function (o) { __QA2.res.push(o); }); }); }, Promise.resolve()).then(function () { __QA2.busy = false; return __QA2.res; });
  } };
})();
