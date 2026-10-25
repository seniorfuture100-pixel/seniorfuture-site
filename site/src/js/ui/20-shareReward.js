// 원본: src/share-reward.js
/* share-reward.js — 결제란 '공유하고 수익받기' · 제목 옆 공유(↗)
   <button type="button" data-sf-reward-share data-title="강의 이름">공유하고 수익받기</button>
   - 로그인 회원: 고르는 창 없이 내 코드 링크(주소?ref=내 코드)를 바로 복사 → '링크를 복사했어요!' 창
                 (카카오톡에 바로 공유 / 확인 / 마케팅 파트너스 보러 가기)
   - 비로그인: '로그인이 필요해요' 창 — 카카오·네이버·구글 + 이메일(작게). 로그인 후 지금 페이지로 돌아와요.
   설정(사이트 공통 코드에서 한 번):
     window.SF_SHARE = {
       member: 'SF-1234',     // 로그인한 회원의 공유 코드. 비로그인이면 null
       rate: '00%',           // 적립 비율 문구
       partners: '/partners', // 마케팅 파트너스 페이지
       login: { kakao: '/login?provider=kakao', naver: '/login?provider=naver', google: '/login?provider=google', email: '/login' }
     };
     ※ 아임웹 소셜 로그인 주소는 사이트 설정에서 확인해 넣어요. 각 주소 뒤에 back=지금 페이지 가 붙어요.
   카카오톡 공유는 카카오 SDK(Kakao.init 완료)가 있으면 카카오 공유, 없으면 휴대폰 공유 창, 그것도 없으면 링크 복사로 대신해요. */
SFUI.register('shareReward', function (root) {
  var btns = root.querySelectorAll('[data-sf-reward-share]');
  if (!btns.length) return;
  function cfg() {
    var c = window.SF_SHARE || {}, l = c.login || {};
    if (typeof l === 'string') l = { kakao: l, naver: l, google: l, email: l };
    return { member: c.member || null, rate: c.rate || '00%', partners: c.partners || '/partners', login: { kakao: l.kakao || '/login', naver: l.naver || '/login', google: l.google || '/login', email: l.email || '/login' } };
  }
  // 글자 그대로 넣기(본문 텍스트용). 아임웹 공통 코드 칸이 '&amp;' 같은 문자 코드를 풀어 버려서 문자 코드를 직접 쓰지 않아요.
  function esc(s) { var t = document.createElement('div'); t.textContent = String(s); return t.innerHTML; }
  function toast(msg) {
    var t = document.querySelector('.sf-toast');
    if (!t) { t = document.createElement('div'); t.className = 'sf-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 3000);
  }
  function copy(text) {
    function legacy() { return new Promise(function (ok, fail) { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); } finally { ta.remove(); } }); }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(legacy);
    return legacy();
  }
  function kakao(u, title) {
    var K = window.Kakao;
    if (K && K.isInitialized && K.isInitialized() && K.Share) { K.Share.sendScrap({ requestUrl: u }); return; }
    if (navigator.share) { navigator.share({ title: title || document.title, url: u }).catch(function () {}); return; }
    copy(u).then(function () { toast('카카오톡을 열 수 없어 링크를 복사했어요. 대화창에 붙여 넣어 주세요'); });
  }
  function back(u) { return u + (u.indexOf('?') < 0 ? '?' : '&') + 'back=' + encodeURIComponent(location.pathname + location.search); }

  // 창 두 개를 한 번만 만들어 둬요
  var wrap = document.querySelector('.sf-rw');
  if (!wrap) {
    wrap = document.createElement('div'); wrap.className = 'sf-rw'; wrap.hidden = true;
    wrap.innerHTML =
      '<div class="sf-rw-dim" data-rw-close></div>' +
      '<div class="sf-rw-box sf-rw-login" role="dialog" aria-modal="true" aria-labelledby="sf-rw-h" data-rw="login">' +
        '<div class="sf-rw-head"><h2 id="sf-rw-h">로그인이 필요해요</h2><button type="button" class="sf-rw-x" data-rw-close aria-label="닫기">✕</button></div>' +
        '<p class="sf-rw-desc"></p>' +
        '<a class="sf-rw-social is-kakao" data-rw-login="kakao"><i aria-hidden="true"></i>카카오로 3초 만에 시작하기</a>' +
        '<a class="sf-rw-social is-naver" data-rw-login="naver"><i aria-hidden="true"></i>네이버로 시작하기</a>' +
        '<a class="sf-rw-social is-google" data-rw-login="google"><i aria-hidden="true">G</i>구글로 시작하기</a>' +
        '<a class="sf-rw-email" data-rw-login="email">이메일로 로그인</a>' +
        '<small class="sf-rw-back">로그인 후 이 페이지로 돌아와요</small>' +
      '</div>' +
      '<div class="sf-rw-box sf-rw-done" role="dialog" aria-modal="true" aria-labelledby="sf-rw-dh" data-rw="done" hidden>' +
        '<span class="sf-rw-star" aria-hidden="true">★</span><h2 id="sf-rw-dh">링크를 복사했어요!</h2><p class="sf-rw-done-p"></p>' +
        '<a class="sf-rw-guide-link" data-rw-partners>마케팅 파트너스 보러 가기 ›</a>' +
        '<button type="button" class="sf-rw-kakao" data-rw-kakao>카카오톡에 바로 공유</button><button type="button" class="sf-rw-ok" data-rw-close>확인</button>' +
      '</div>';
    document.body.appendChild(wrap);
  }
  var loginBox = wrap.querySelector('[data-rw="login"]'), doneBox = wrap.querySelector('[data-rw="done"]');
  var state = { url: '', title: '', opener: null };

  function show(box, focusEl) {
    loginBox.hidden = box !== loginBox; doneBox.hidden = box !== doneBox;
    wrap.hidden = false; document.documentElement.classList.add('sf-rw-lock'); focusEl.focus();
  }
  function close() { wrap.hidden = true; document.documentElement.classList.remove('sf-rw-lock'); if (state.opener) state.opener.focus(); }
  function open(btn) {
    var c = cfg();
    state.opener = btn; state.title = btn.getAttribute('data-title') || document.title;
    if (!c.member) {
      loginBox.querySelector('.sf-rw-desc').innerHTML = '로그인하면 내 링크로 친구가 결제할 때<br>결제 금액의 ' + esc(c.rate) + '를 수익으로 받을 수 있어요.';
      loginBox.querySelectorAll('[data-rw-login]').forEach(function (a) { a.href = back(c.login[a.getAttribute('data-rw-login')]); });
      show(loginBox, loginBox.querySelector('.sf-rw-x'));
      return;
    }
    var u = new URL(btn.getAttribute('data-url') || location.href); u.hash = ''; u.searchParams.set('ref', c.member); // 남이 준 ref는 내 코드로 바꿔요
    state.url = u.toString();
    copy(state.url).then(function () {
      doneBox.querySelector('.sf-rw-done-p').innerHTML = '이 링크로 들어온 친구가 결제하면<br>결제 금액의 ' + esc(c.rate) + '가 적립금으로 쌓여요.';
      doneBox.querySelector('[data-rw-partners]').href = c.partners;
      show(doneBox, doneBox.querySelector('[data-rw-kakao]'));
    }, function () { toast('복사하지 못했어요. 주소창의 주소를 길게 눌러 복사해 주세요'); });
  }

  btns.forEach(function (b) { if (SFUI.once(b, 'RewardShare')) b.addEventListener('click', function () { open(b); }); });
  if (!SFUI.once(wrap, 'RewardWrap')) return;
  wrap.addEventListener('click', function (e) {
    var t = e.target.closest('[data-rw-close],[data-rw-kakao]'); if (!t) return;
    if (t.hasAttribute('data-rw-close')) return close();
    kakao(state.url, state.title);
  });
  document.addEventListener('keydown', function (e) {
    if (wrap.hidden) return;
    if (e.key === 'Escape') return close();
    if (e.key === 'Tab') { // 창 안에서만 초점이 돌게
      var box = doneBox.hidden ? loginBox : doneBox;
      var f = Array.prototype.filter.call(box.querySelectorAll('a[href],button'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})
