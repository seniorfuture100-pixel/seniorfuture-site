// 원본: src/share.js
/* share.js — 인사이트 상세 '링크 복사' · '카카오톡 공유'
   <button type="button" class="sf-share-link" data-sf-share-link>🔗 링크 복사</button>
   <button type="button" class="sf-share-kakao" data-sf-share-kakao>카카오톡 공유</button>
   - data-url 을 주면 그 주소를, 없으면 지금 페이지 주소를 공유해요.
   - 카카오톡 공유는 카카오 JavaScript SDK가 페이지에 있고 Kakao.init('앱 키')가 끝났을 때 동작해요.
     (카카오 개발자 콘솔에서 사이트 도메인 등록 필요). SDK가 없으면 휴대폰 기본 공유 창 → 그것도 없으면 링크 복사로 대신해요. */
/* 카카오톡 공유 도우미 SFUI.kakaoShare(url) → 보냈으면 true
   아임웹이 넣은 window.Kakao(1.x, 아임웹 앱 키·카카오 로그인용)는 우리 도메인으로 공유가 안 돼서 건드리지 않아요.
   공유는 시니어퓨처 카카오 앱(ID 1615215)의 JavaScript 키로 따로 띄운 SDK 2.x 로 보내요.
   - 이 키는 브라우저용 공개 키예요(카카오 콘솔 'JS SDK 도메인'에 등록한 seniorfuture.kr·seniorfuture.imweb.me 에서만 동작). REST·어드민 키는 쓰지 않아요.
   - 공유 버튼에 손이 가면(마우스 올림·터치·포커스) 미리 받아 둬요. 아직 못 받았으면 false → 부르는 쪽이 휴대폰 공유 창·링크 복사로 대신해요. */
(function () {
  var KEY = '535551552f5d62d8b063cbee4a4f7482', SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js', SRI = 'sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w';
  var K = null, busy = false, SEL = '[data-sf-share-kakao], [data-act="kakao"], .sf-pv-share, .sf-rw, [data-sf-reward-share], .r3-share';
  // <script>로 넣으면 SDK가 이미 있는 window.Kakao(아임웹 것)에 덮어써서 카카오 로그인이 깨져요 → 받은 코드를 exports 객체 안에서만 실행
  function load() {
    if (K || busy || !window.fetch) return; busy = true;
    fetch(SRC, { integrity: SRI, mode: 'cors' }).then(function (r) { return r.text(); }).then(function (code) {
      var k = {}; new Function('exports', 'module', code)(k, { exports: k });
      k.init(KEY); K = k;
    }).catch(function () { busy = false; });
  }
  SFUI.kakaoShare = function (url) {
    if (K && K.Share) { try { K.Share.sendScrap({ requestUrl: url }); return true; } catch (e) {} }
    load(); return false;
  };
  ['pointerover', 'touchstart', 'focusin'].forEach(function (t) {
    document.addEventListener(t, function (e) { var x = e.target; x && x.closest && x.closest(SEL) && load(); }, { capture: true, passive: true });
  });
  setTimeout(function () { document.querySelector(SEL) && load(); }, 3000); // 글 보기처럼 버튼이 바로 보이는 화면
})();
SFUI.register('share', function (root) {
  function url(btn) { return btn.getAttribute('data-url') || location.href.split('#')[0]; }
  function toast(msg) {
    var t = document.querySelector('.sf-toast');
    if (!t) { t = document.createElement('div'); t.className = 'sf-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 3000);
  }
  function legacyCopy(text) {
    return new Promise(function (ok, fail) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); } finally { ta.remove(); }
    });
  }
  function copy(text) { // 새 방식이 막히면(권한·인앱 브라우저) 예전 방식으로 한 번 더 시도해요
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    return legacyCopy(text);
  }
  function copyLink(btn) {
    copy(url(btn)).then(function () { toast('링크를 복사했어요'); }, function () { toast('복사하지 못했어요. 주소창의 주소를 길게 눌러 복사해 주세요'); });
  }
  root.querySelectorAll('[data-sf-share-link]').forEach(function (b) {
    if (!SFUI.once(b, 'ShareLink')) return;
    b.addEventListener('click', function () { copyLink(b); });
  });
  // 파트너 코드 등 글자 복사: <button data-sf-copy="SF-KIM" data-msg="코드를 복사했어요">복사</button>
  root.querySelectorAll('[data-sf-copy]').forEach(function (b) {
    if (!SFUI.once(b, 'Copy')) return;
    b.addEventListener('click', function () {
      copy(b.getAttribute('data-sf-copy')).then(function () { toast(b.getAttribute('data-msg') || '복사했어요'); }, function () { toast('복사하지 못했어요. 길게 눌러 직접 복사해 주세요'); });
    });
  });
  root.querySelectorAll('[data-sf-share-kakao]').forEach(function (b) {
    if (!SFUI.once(b, 'ShareKakao')) return;
    b.addEventListener('click', function () {
      if (SFUI.kakaoShare(url(b))) return;
      if (navigator.share) { navigator.share({ title: document.title, url: url(b) }).catch(function () {}); return; }
      copyLink(b);
    });
  });
})
