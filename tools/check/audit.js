// 화면 품질 점검(10/26) — 사이트 탭(관리자 미리보기)에서 실행: __QA.run(urls, widths) → __QA.res
// 화면마다 정해진 너비의 iframe 으로 열어, 사람이 보면 거슬리는 것만 숫자로 모아요(지금 사이트를 바꾸지 않음)
//  wide: 가로 넘침(px)과 넘치는 요소 / img: 깨진 그림 / tap: 휴대폰에서 누르기 작은 버튼·링크(32px 미만)
//  small: 12px 미만 글자 / gap: 마지막 내용과 푸터 사이 빈칸 / dupId: 같은 id / noAlt: 설명 없는 그림 / err: 오류
(function () {
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function vis(W, e) { var r = e.getBoundingClientRect(), s = W.getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; }
  function name(e) { return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList[0] ? '.' + e.classList[0] : ''); }
  function measure(f, w) {
    var W = f.contentWindow, d = f.contentDocument, H = d.documentElement, o = {};
    o.title = (d.querySelector('h1') || {}).textContent; o.title = o.title && o.title.trim().slice(0, 30);
    o.sf = !!W.SFUI;
    o.wide = H.scrollWidth - W.innerWidth;
    if (o.wide > 2) o.wideBy = [].filter.call(d.querySelectorAll('body *'), function (e) { var r = e.getBoundingClientRect(); return r.right > w + 2 && r.width < w * 3 && vis(W, e); }).slice(-4).map(name);
    o.img = [].filter.call(d.images, function (i) { return i.complete && i.getAttribute('src') && !/^data:/.test(i.src) && i.naturalWidth === 0 && vis(W, i); }).map(function (i) { return i.src.slice(-50); });
    o.noAlt = [].filter.call(d.images, function (i) { return !i.hasAttribute('alt') && vis(W, i); }).length;
    if (w < 768) o.tap = [].filter.call(d.querySelectorAll('a[href], button, [role=button], input, select'), function (e) { var r = e.getBoundingClientRect(); return vis(W, e) && (r.height < 32 || r.width < 32) && r.top < H.scrollHeight && !e.closest('#doz_footer_wrap, .sf-ft, footer'); }).slice(0, 60).map(function (e) { var r = e.getBoundingClientRect(); return name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.textContent || '').trim().slice(0, 12); });
    o.small = [].filter.call(d.querySelectorAll('body *'), function (e) { if (!e.childNodes.length || ![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })) return false; return parseFloat(W.getComputedStyle(e).fontSize) < 12 && vis(W, e) && !e.closest('#doz_footer_wrap, .sf-ft, footer'); }).slice(0, 8).map(function (e) { return name(e) + ' ' + W.getComputedStyle(e).fontSize + ' ' + e.textContent.trim().slice(0, 14); });
    var ids = {}; d.querySelectorAll('[id]').forEach(function (e) { ids[e.id] = (ids[e.id] || 0) + 1; });
    o.dupId = Object.keys(ids).filter(function (k) { return ids[k] > 1 && !/^(\d|w\d|s\d)/.test(k); }).slice(0, 6);
    var ft = d.querySelector('#doz_footer_wrap'), secs = [].filter.call(d.querySelectorAll('.section_wrap, main > section'), function (s) { return s !== ft && !s.contains(ft) && vis(W, s) && s.getBoundingClientRect().height > 20; });
    if (ft && secs.length) {
      var last = secs[secs.length - 1], kids = [].filter.call(last.querySelectorAll('*'), function (e) { return vis(W, e) && e.getBoundingClientRect().height > 4 && (e.children.length === 0 || e.tagName === 'IMG'); });
      var bottom = kids.reduce(function (m, e) { return Math.max(m, e.getBoundingClientRect().bottom); }, 0);
      o.gap = Math.round(ft.getBoundingClientRect().top - bottom);
    }
    o.h = H.scrollHeight;
    return o;
  }
  function one(url, w) {
    return new Promise(function (done) {
      var f = document.createElement('iframe'), errs = [], t0 = Date.now();
      f.style.cssText = 'position:fixed;left:0;top:0;width:' + w + 'px;height:900px;border:0;z-index:-1;opacity:0;pointer-events:none';
      f.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'preview_mode=1';
      var hook = setInterval(function () { try { var W = f.contentWindow; if (W && !W.__qaHook) { W.__qaHook = 1; W.addEventListener('error', function (e) { errs.push(String(e.message).slice(0, 120)); }); } } catch (e) { } }, 20);
      f.onload = function () {
        clearInterval(hook);
        var W = f.contentWindow, load = Date.now() - t0;
        wait(2500).then(function () { W.scrollTo(0, 1e6); return wait(1500); }).then(function () { W.scrollTo(0, 1e6); return wait(800); }).then(function () {
          var o; try { o = measure(f, w); } catch (e) { o = { fail: String(e) }; }
          o.url = url; o.w = w; o.load = load; if (errs.length) o.err = errs.slice(0, 4);
          f.remove(); done(o);
        });
      };
      document.body.appendChild(f);
      setTimeout(function () { if (f.isConnected) { clearInterval(hook); f.remove(); done({ url: url, w: w, fail: 'timeout' }); } }, 40000);
    });
  }
  window.__QA = { res: [], busy: false, run: function (urls, widths) {
    var q = []; urls.forEach(function (u) { widths.forEach(function (w) { q.push([u, w]); }); });
    __QA.busy = true; __QA.res = [];
    return q.reduce(function (p, x) { return p.then(function () { return one(x[0], x[1]).then(function (o) { __QA.res.push(o); }); }); }, Promise.resolve()).then(function () { __QA.busy = false; return __QA.res; });
  } };
})();
