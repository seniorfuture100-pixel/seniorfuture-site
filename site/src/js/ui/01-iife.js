// 원본: src/_core.js
/* SFUI core — 모든 기능 파일 맨 위에 같은 코드가 들어있어요(한 번만 실행됨) */
(function (w, d) {
  if (w.SFUI) return;
  // (10/31) 새 버전이 배포되면 이 탭의 임시 저장본(주문·강의실·전문가 목록 등)을 비워 바뀐 코드로 새로 받아요. 추천 코드·시험 모드 값은 그대로
  try {
    var S = w.sessionStorage, V = w.SF_VER;
    if (S && V && S.getItem('sf_ver') !== V) {
      Object.keys(S).forEach(function (k) { if (/^sf_(myorders|oms|room|exhome|experts|exv|pt_courses|badges)/.test(k)) S.removeItem(k); });
      S.setItem('sf_ver', V);
    }
  } catch (e) {}
  var mods = {};
  function run(n, root) { try { mods[n](root || d); } catch (e) { console.error('[SFUI]', n, e); } }
  w.SFUI = {
    register: function (n, fn) { mods[n] = fn; if (d.readyState !== 'loading') run(n, d); },
    init: function (root) { Object.keys(mods).forEach(function (n) { run(n, root); }); },
    // 같은 요소에 두 번 연결되지 않게 표시(data-sfui-bound-*). data-sf-* 설정 속성과 이름이 겹치지 않아요.
    once: function (el, key) { var k = 'sfuiBound' + key; if (el.dataset[k]) return false; el.dataset[k] = '1'; return true; },
    store: {
      get: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { w.localStorage.setItem(k, v); } catch (e) {} },
      del: function (k) { try { w.localStorage.removeItem(k); } catch (e) {} }
    },
    parseDate: function (s) { if (!s) return null; var t = Date.parse(String(s).replace(' ', 'T')); return isNaN(t) ? null : t; }
  };
  d.addEventListener('DOMContentLoaded', function () { w.SFUI.init(d); });
})(window, document)
