// 원본: src/auth-view.js (10/22 새 디자인으로 바꿈)
/* auth-view.js — 로그인·회원가입 화면을 한 장의 카드로 (페이지와 팝업 창 모두)
   - 페이지: /login, /site_join_type_choice
   - 팝업 창(#cocoaModal): 헤더 '로그인'을 누르면 뜨는 로그인 창, '회원가입'을 누르면 뜨는 가입 선택 창
   - 가운데 로고 · 혜택 한 줄(무료 라이브 안내) · 노란 카카오 버튼 · 다른 소셜은 동그란 아이콘 줄
   - 로그인: 이메일·비밀번호 칸 · 검정 '로그인' 버튼 · 아래 '비밀번호 찾기 | 이메일 회원가입'
   - 회원가입 선택: '이메일로 가입하기' 테두리 버튼 · 아래 '이미 회원이세요? 로그인'
   - 약관 동의 창은 CSS(sf-auth v2)만으로 같은 느낌으로 맞춰요.
   - 카카오·네이버·구글·애플 버튼은 관리자에서 켜면 아임웹이 넣고, 여기서 자리만 옮겨요.
   - 아임웹이 폼을 페이지가 뜬 뒤에 그려서, 내용이 생길 때까지 기다렸다가 적용해요. */
SFUI.register('authView', function () {
  var KAKAO = '<svg class="sf-auth__kicon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.66 1.76 5 4.41 6.33l-.9 3.3c-.08.3.26.54.52.37l3.93-2.6c.5.07 1.02.1 1.54.1 5.25 0 9.5-3.36 9.5-7.5S17.25 3.5 12 3.5z"/></svg>';
  var GIFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 7h-2.18A3 3 0 0 0 12 4.02 3 3 0 0 0 6.18 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-5-1a1 1 0 1 1 0 2h-2V7a1 1 0 0 1 1-1zm-6 0a1 1 0 0 1 1 1v1H8a1 1 0 1 1 0-2zm2 14H6v-8h5v8zm0-10H5V9h6v1zm7 10h-5v-8h5v8zm1-10h-6V9h6v1z"/></svg>';
  var NAMES = { naver: '네이버', google: '구글', apple: '애플', facebook: '페이스북', line: '라인' };
  function social(w) {
    // 카카오는 큰 버튼, 나머지는 동그란 아이콘 줄로
    var kakao = w.querySelector('.sns_login_form a.btn-kakao, .sns_login_form a[class*=kakao]');
    if (kakao && !kakao.querySelector('.sf-auth__kicon')) { kakao.innerHTML = KAKAO + '<span>카카오로 3초만에 시작하기</span>'; kakao.classList.add('sf-auth__kakao'); }
    var row = document.createElement('div');
    row.className = 'sf-auth__social';
    [].forEach.call(w.querySelectorAll('.sns_login_form a.btn, .sns_login_form button.btn'), function (a) {
      if (a === kakao) return;
      var k = Object.keys(NAMES).filter(function (n) { return a.className.indexOf(n) > -1 || (a.id || '').indexOf(n) > -1; })[0] || 'etc';
      a.classList.add('sf-auth__round', 'sf-auth__round--' + k);
      a.setAttribute('aria-label', (NAMES[k] || '소셜') + '로 시작하기');
      a.title = (NAMES[k] || '소셜') + '로 시작하기';
      a.textContent = '';
      row.appendChild(a);
    });
    var sns = w.querySelector('.sns_login_form');
    if (row.children.length && sns) sns.parentNode.insertBefore(row, sns.nextSibling);
  }
  function decorate(w, isLogin) {
    if (w.querySelector('.sf-auth__head')) return;
    w.classList.add('sf-auth', isLogin ? 'sf-auth--login' : 'sf-auth--join');
    var head = document.createElement('div');
    head.className = 'sf-auth__head';
    head.innerHTML = '<span class="sf-logo"><b>SENIOR</b> FUTURE</span>' +
      '<h1 class="sf-auth__sr">' + (isLogin ? '로그인' : '회원가입') + '</h1>' +
      '<p class="sf-auth__promo">' + GIFT + '<span>지금 가입하고 무료 라이브·신규 강의 소식 먼저 받아보세요</span></p>';
    var close = w.querySelector(':scope > button.close');
    w.insertBefore(head, close ? close.nextSibling : w.firstChild);
    social(w);
    if (!isLogin) {
      // 회원가입 선택: 'ID/PW 회원가입' → '이메일로 가입하기', 아래에 로그인 안내
      var mail = w.querySelector('a[onclick*="openJoin("]');
      if (mail) { mail.textContent = '이메일로 가입하기'; mail.classList.add('sf-auth__mail'); }
      var foot = document.createElement('div');
      foot.className = 'sf-auth__links';
      foot.innerHTML = '<span>이미 회원이세요?</span><a href="/login">로그인</a>';
      w.appendChild(foot);
      return;
    }
    // 입력칸: 라벨은 화면 읽기용으로만 두고, 칸 안 안내 글자로 보여 줘요
    [].forEach.call(w.querySelectorAll('.input_form input:not([type=hidden])'), function (i) {
      var l = document.createElement('label');
      l.className = 'sf-auth__label sf-auth__sr';
      l.textContent = i.getAttribute('placeholder') || '';
      if (!i.id) i.id = 'sf-auth-' + (i.name || 'f') + (w.closest('#cocoaModal') ? '-m' : '');
      l.htmlFor = i.id;
      i.parentNode.insertBefore(l, i);
      if (i.name === 'uid') { i.setAttribute('autocomplete', 'username'); i.setAttribute('inputmode', 'email'); }
      if (i.name === 'passwd') i.setAttribute('autocomplete', 'current-password');
    });
    var btn = w.querySelector('form .btn-primary');
    if (btn) btn.textContent = '로그인';
    var over = w.querySelector('.over_h, .sf-auth__links');
    if (over) {
      var join = over.querySelector('a[onclick*="openJoin"], a.float_l'), find = over.querySelector('a[onclick*="FindPassword"], a.float_r');
      over.className = 'sf-auth__links';
      if (find) { find.className = ''; find.textContent = '비밀번호 찾기'; over.insertBefore(find, over.firstChild); }
      if (join) { join.className = ''; join.textContent = '이메일 회원가입'; }
    }
  }
  // 팝업 창: 로그인(.modal_site_login) · 가입 선택(.modal_site_join 안 .widget.login)
  function modal() {
    var m = document.getElementById('cocoaModal'); if (!m) return;
    var w = null, isLogin = m.classList.contains('modal_site_login');
    if (isLogin) w = m.querySelector('article.modal_article.login');
    else if (m.classList.contains('modal_site_join')) w = m.querySelector('article.modal_article .widget.login');
    if (!w || !w.querySelector('.sns_login_form, form')) return;
    m.classList.add('sf-authm');
    decorate(w, isLogin);
  }
  if (!window.__sfAuthModal && window.jQuery) {
    window.__sfAuthModal = 1;
    jQuery(document).on('shown.bs.modal', '#cocoaModal', modal);
    jQuery(document).on('hidden.bs.modal', '#cocoaModal', function () { this.classList.remove('sf-authm'); });
  }
  modal();
  // 페이지
  var b = document.body, isLogin = b.classList.contains('login'), isJoin = /(^|\s)site_join/.test(b.className);
  if (!isLogin && !isJoin) return;
  var w = document.querySelector('.widget.login');
  if (!w || w.closest('#cocoaModal') || !SFUI.once(w, 'Auth')) return;
  function apply() { document.documentElement.classList.add('sf-auth-on'); decorate(w, isLogin); }
  function ready() { return isLogin ? w.querySelector('form') : w.querySelector('.sns_login_form, a[onclick*="openJoin("]'); }
  if (ready()) return apply();
  var mo = new MutationObserver(function () { if (ready()) { mo.disconnect(); apply(); } });
  mo.observe(w, { childList: true, subtree: true });
  setTimeout(function () { mo.disconnect(); }, 15000);
})
