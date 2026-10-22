// 원본: src/share.js
/* share.js — 인사이트 상세 '링크 복사' · '카카오톡 공유'
   <button type="button" class="sf-share-link" data-sf-share-link>🔗 링크 복사</button>
   <button type="button" class="sf-share-kakao" data-sf-share-kakao>카카오톡 공유</button>
   - data-url 을 주면 그 주소를, 없으면 지금 페이지 주소를 공유해요.
   - 카카오톡 공유는 카카오 JavaScript SDK가 페이지에 있고 Kakao.init('앱 키')가 끝났을 때 동작해요.
     (카카오 개발자 콘솔에서 사이트 도메인 등록 필요). SDK가 없으면 휴대폰 기본 공유 창 → 그것도 없으면 링크 복사로 대신해요. */
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
      var K = window.Kakao;
      if (K && K.isInitialized && K.isInitialized() && K.Share) { K.Share.sendScrap({ requestUrl: url(b) }); return; }
      if (navigator.share) { navigator.share({ title: document.title, url: url(b) }).catch(function () {}); return; }
      copyLink(b);
    });
  });
})
