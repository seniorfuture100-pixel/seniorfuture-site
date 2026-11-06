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
    // (11/1) 같은 탭에서 로그아웃·다른 계정 로그인을 하면 이전 계정의 주문 목록·방금 한 주문·소개 글이 먼저 보였어요 → 로그인 상태(Y/N)·방식이 바뀌면 비워요
    var ck = function (n) { return (d.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')) || [])[1] || ''; };
    var who = ck('_imweb_login_state') + '|' + ck('login_lately');
    if (S && S.getItem('sf_who') !== who) {
      Object.keys(S).forEach(function (k) { if (/^(sf_(myorders|oms)|sfc:|sf-last-order$|sf-pay-free$|r3MyIntro$|sf_myav$)/.test(k)) S.removeItem(k); }); // (11/2) sfc: = r3b/02 응답 저장본도
      S.setItem('sf_who', who);
    }
  } catch (e) {}
  var mods = {};
  function run(n, root) { try { mods[n](root || d); } catch (e) { console.error('[SFUI]', n, e); if (w.__sfErr) w.__sfErr('[SFUI] ' + n + ': ' + (e && e.message), '', 0); } } // (11/1) 기능 오류도 GA4 로(r3/03b)
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
  // 회원 기본 정보는 아임웹에 저장해요. 주문 정보나 브라우저 저장소를 회원정보로 간주하지 않아요.
  w.SFUI.checkoutProfile = (function () {
    function $(s, r) { return (r || d).querySelector(s); }
    function $$(s, r) { return [].slice.call((r || d).querySelectorAll(s)); }
    function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
    function txt(s) { var e = d.createElement('div'); e.textContent = String(s || ''); return e.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
    function email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v)); }
    function phone(v) { return clean(v).replace(/\D/g, '').length >= 9; }
    function safeReturn(v) { return /^\/shop_payment\/?(?:\?[^#\r\n]*)?$/.test(v || '') && !/[\\"'<>\x00-\x1f\x7f-\uffff]/.test(v) ? v : ''; }
    function param(k) { try { return decodeURIComponent((location.search.match(new RegExp('[?&]' + k + '=([^&]*)')) || [])[1] || ''); } catch (e) { return ''; } }
    function fields(form) {
      var extra = null;
      $$('input[name^="join_form_"]', form).some(function (i) {
        var g = i.closest('.input_block, .form-group'), l = g && $('.mini-tit, label', g);
        if (l && /^(이메일|신청 안내 이메일)$/.test(clean(l.textContent))) { extra = i; return true; }
        return false;
      });
      return { name: $('input[name="name"]', form), phone: $('input[name="callnum"]', form), account: $('input[name="uid"]', form), extra: extra };
    }
    function values(f) {
      return { name: clean(f.name && f.name.value), phone: clean(f.phone && f.phone.value), email: clean(f.extra && f.extra.value) || clean(f.account && f.account.value) };
    }
    function missing(v) { return [!v.name && '이름', !phone(v.phone) && '연락처', !email(v.email) && '이메일'].filter(Boolean); }
    function read(done) {
      var x = new XMLHttpRequest(), called = false;
      function finish(err, v) { if (called) return; called = true; done(err, v); }
      x.open('POST', '/dialog/join.cm', true); x.timeout = 10000;
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      x.onload = function () {
        try {
          if (x.status !== 200) throw new Error('profile-http');
          var d = new DOMParser().parseFromString(x.responseText, 'text/html'), form = $('#join_form', d), f = form && fields(form);
          // 가입 폼·로그인 화면을 회원 저장값으로 오인하지 않아요. 토큰·비밀번호는 읽거나 복사하지 않아요.
          if (!f || !f.name || !f.phone || !f.account || !f.account.readOnly) throw new Error('profile-form');
          finish(null, values(f));
        } catch (e) { finish('기본 정보를 확인하지 못했어요. 다시 시도해 주세요.'); }
      };
      x.onerror = x.ontimeout = function () { finish('기본 정보를 확인하지 못했어요. 다시 시도해 주세요.'); };
      x.send('back_url=' + encodeURIComponent(btoa('/shop_mypage/?sf=profile')));
    }
    function profileUrl(edit) {
      return '/shop_mypage/?sf=profile&sf_return=' + encodeURIComponent(safeReturn(location.pathname + location.search)) + (edit ? '&sf_contact_edit=1' : '');
    }
    function setupForm(form, button, currentPassword) {
      var ret = safeReturn(param('sf_return')), f = fields(form), before = values(f), need = missing(before), edit = param('sf_contact_edit') === '1';
      // 기존 추가 이메일 항목만 안내 이메일로 써요. 계정 uid·비밀번호·마케팅 동의는 수정하지 않아요.
      if (f.extra) {
        var eg = f.extra.closest('.input_block, .form-group'), el = eg && $('.mini-tit, label', eg);
        if (el) el.textContent = '신청 안내 이메일';
        f.extra.type = 'email'; f.extra.placeholder = '신청 안내를 받을 이메일';
        if (ret && !clean(f.extra.value) && email(f.account && f.account.value)) f.extra.value = f.account.value;
      }
      if (!ret) return;
      document.documentElement.classList.add('sf-contact-complete');
      var show = [f.name, f.phone, f.extra].filter(function (i, index) { return i && (edit || need.indexOf(['이름', '연락처', '이메일'][index]) >= 0); });
      // 숨길 때에도 원래 입력값과 동의 값은 그대로 직렬화되게 보존해요.
      // 아임웹은 모든 입력칸을 한 div 안에 넣기도 해요. 바깥 div뿐 아니라 각 입력 그룹까지 확인해요.
      $$('.input_block, .form-group, .r2-prof-h', form).concat([].slice.call(form.children)).forEach(function (g) {
        if (g.tagName === 'INPUT' && g.type === 'hidden') return;
        if (g === currentPassword || (currentPassword && g.contains(currentPassword)) || (button && g.contains(button)) || show.some(function (i) { return g.contains(i); })) return;
        g.classList.add('sf-contact-extra');
      });
      if (currentPassword) currentPassword.classList.add('sf-contact-password');
      var intro = document.createElement('div'); intro.className = 'sf-contact-intro';
      intro.innerHTML = '<h3>' + (edit ? '신청 기본 정보 수정' : '신청에 필요한 정보만 입력해 주세요') + '</h3><p>저장한 정보는 마이페이지와 다음 신청에 사용돼요. 로그인 이메일은 바뀌지 않아요.</p><a href="' + txt(ret) + '">주문서로 돌아가기</a>';
      form.insertBefore(intro, form.firstChild);
      if (button) {
        button.textContent = '저장하고 신청 계속';
        form.__sfContactCheck = function () {
          var v = values(f), bad = missing(v), hint = $('.sf-contact-error', intro);
          if (!bad.length) return true;
          if (!hint) { hint = document.createElement('p'); hint.className = 'sf-contact-error'; hint.setAttribute('role', 'alert'); intro.appendChild(hint); }
          hint.textContent = '다음 정보를 확인해 주세요: ' + bad.join('·');
          [f.name, f.phone, f.extra].forEach(function (i, index) { if (i && bad.indexOf(['이름', '연락처', '이메일'][index]) >= 0) { var g = i.parentElement; while (g && g !== form) { g.classList.remove('sf-contact-extra'); g = g.parentElement; } } });
          return false;
        };
        form.addEventListener('submit', function (e) { if (!form.__sfContactCheck()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
      }
    }
    return { read: read, missing: missing, fields: fields, values: values, safeReturn: safeReturn, returnTo: function () { return safeReturn(param('sf_return')); }, profileUrl: profileUrl, setupForm: setupForm };
  })();
  d.addEventListener('DOMContentLoaded', function () { w.SFUI.init(d); });
})(window, document)
