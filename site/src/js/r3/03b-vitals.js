// 원본: (11/1) 실제 손님 화면의 속도·오류 → GA4 (이미 연결된 G-XKCJPYS3K1)
/* r3 vitals — 손님이 페이지를 떠날 때 한 번 'sf_vitals'(첫 그림·가장 큰 그림·꾸밈 시각·화면 밀림·반응 지연)를,
   스크립트 오류가 나면 'sf_error'(페이지당 3개까지, 주소는 지우고 100자)를 GA4 로만 보내요(메타·카카오 픽셀에는 안 보냄).
   개인정보는 넣지 않아요. GA4 관리 › 맞춤 정의에 page_kind·lcp·fcp·sf_init·cls·inp·msg 를 등록하면 보고서에서 볼 수 있어요. */
(function () {
  var W = window, D = document, P = W.performance;
  function send(name, p) { try { if (W.gtag) W.gtag('event', name, p); } catch (e) {} }
  function kind() {
    var p = location.pathname, q = location.search;
    if (/^\/(index)?$/.test(p)) return 'home';
    if (/^\/(shop_view|course|live|community)/.test(p) && /idx=/.test(q)) return 'product';
    var m = /^\/(course|live|community|insight|experts|projects|news|review|help|faq|shop_mypage|class|shop_payment|shop_cart|search)/.exec(p);
    return m ? m[1] : 'other';
  }
  // 1) 속도
  var v = { lcp: 0, cls: 0, inp: 0 }, sent = false;
  function watch(type, fn, o) { try { new PerformanceObserver(function (l) { l.getEntries().forEach(fn); }).observe(Object.assign({ type: type, buffered: true }, o || {})); } catch (e) {} }
  watch('largest-contentful-paint', function (e) { v.lcp = Math.round(e.startTime); });
  watch('layout-shift', function (e) { if (!e.hadRecentInput) v.cls += e.value; });
  watch('event', function (e) { if (e.interactionId && e.duration > v.inp) v.inp = Math.round(e.duration); }, { durationThreshold: 40 });
  function flush() {
    if (sent || !P || !P.getEntriesByName) return; sent = true;
    var f = P.getEntriesByName('first-contentful-paint')[0], m = P.getEntriesByName('sf-early-init')[0], n = P.getEntriesByType && P.getEntriesByType('navigation')[0];
    send('sf_vitals', {
      page_kind: kind(), lcp: v.lcp, fcp: f ? Math.round(f.startTime) : 0, sf_init: m ? Math.round(m.startTime) : 0,
      cls: Math.round(v.cls * 1000) / 1000, inp: v.inp, ttfb: n ? Math.round(n.responseStart) : 0,
      net: (navigator.connection && navigator.connection.effectiveType) || '', sf_ver: W.SF_VER || '',
      non_interaction: true, transport_type: 'beacon'
    });
  }
  D.addEventListener('visibilitychange', function () { if (D.visibilityState === 'hidden') flush(); });
  W.addEventListener('pagehide', flush);
  // 2) 오류 — 페이지당 3개까지
  var errN = 0;
  W.__sfErr = function (msg, src, line) {
    if (errN >= 3) return; errN++;
    send('sf_error', {
      page_kind: kind(), msg: String(msg || '').replace(/https?:\/\/\S+/g, '').slice(0, 100),
      src: String(src || '').replace(/\?.*$/, '').replace(/^.*\//, '').slice(0, 60), line: line || 0, sf_ver: W.SF_VER || '', non_interaction: true
    });
  };
  W.addEventListener('error', function (e) { if (e && e.message) W.__sfErr(e.message, e.filename, e.lineno); });
  W.addEventListener('unhandledrejection', function (e) { var r = e && e.reason; W.__sfErr('promise: ' + ((r && r.message) || r), '', 0); });
})()
