// 원본: src/site-header.js
SFUI.register('siteHeader', function () {
  var cfg = window.SF_SITE || {};
  var kakao = cfg.kakao || '/help';
  var wrap = document.getElementById('doz_header_wrap');
  if (!wrap || !SFUI.once(wrap, 'Header')) return;
  var root = document.documentElement;
  root.classList.add('sf-hd-on');
  var path = location.pathname;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function txt(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  var ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l12 8-12 8z"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 010 8M18 14c2.5.5 4 2.5 4 6"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    // (10/25) 하단 탭 전용: 교육=학사모, 무료 라이브=카메라+LIVE 점, 커뮤니티=3명
    edu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.8v4c0 1.6 2.5 3.2 5.5 3.2s5.5-1.6 5.5-3.2v-4"/><path d="M21.5 9.5v5"/></svg>',
    live: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="13.5" height="12" rx="3"/><path d="M16 10.5l5.5-3v9L16 13.5z"/><circle class="sf-tab-dot" cx="7" cy="10.5" r="1.7"/></svg>',
    team: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M6.5 19.5c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"/><circle cx="5.3" cy="9.8" r="2.3"/><path d="M1.8 18.2c0-2.5 1.5-4.2 3.7-4.4"/><circle cx="18.7" cy="9.8" r="2.3"/><path d="M22.2 18.2c0-2.5-1.5-4.2-3.7-4.4"/></svg>'
  };

  // 로그인 상태: 아임웹 로그인 버튼 안에 '회원 정보' 링크가 있으면 로그인한 상태
  var loginW = wrap.querySelector('[data-widget-type="inline_login_btn"]');
  var loggedIn = !!(loginW && loginW.querySelector('[onclick*="showMemberProfile"]'));
  SFUI.loggedIn = loggedIn;
  root.classList.toggle('sf-logged-in', loggedIn);
  var loginA = loginW && [].slice.call(loginW.querySelectorAll('a')).filter(function (a) { return /로그인|login/i.test(a.textContent + a.getAttribute('href')); })[0];
  var joinA = loginW && [].slice.call(loginW.querySelectorAll('a')).filter(function (a) { return /회원가입|join/i.test(a.textContent + a.getAttribute('href')); })[0];
  var loginHref = (loginA && loginA.getAttribute('href')) || '/login';
  var joinHref = (joinA && joinA.getAttribute('href')) || '/site_join_pattern_choice';

  // ① 띠배너 (헤더 위)
  var tb = cfg.topbanner === false ? null : (cfg.topbanner || { key: '2026-11-open', text: '11월 신규 교육 오픈 · 얼리버드 모집 중', href: '/course' });
  if (tb) {
    var bar = el('div', 'sf-topbanner', '<a href="' + tb.href + '">' + txt(tb.text) + '</a><button type="button" data-sf-close aria-label="띠배너 닫기">' + ICON.close + '</button>');
    bar.setAttribute('data-sf-topbanner', tb.key);
    wrap.parentNode.insertBefore(bar, wrap);
  }

  // ② 로고: SENIOR(주황) FUTURE(검정)
  [].forEach.call(wrap.querySelectorAll('.logo_title a'), function (a) {
    a.innerHTML = '<span class="sf-logo"><b>SENIOR</b> FUTURE</span>';
    a.setAttribute('aria-label', '시니어퓨처 홈');
  });

  // ③ PC 메뉴: '교육'에 드롭다운
  var catLinks = SFUI.cats.map(function (c) { return '<a href="/course?cat=' + c[0] + '">' + c[1] + '</a>'; });
  [].forEach.call(wrap.querySelectorAll('.viewport-nav.desktop > li'), function (li) {
    var a = li.querySelector('a');
    if (!a) return;
    var name = a.textContent.trim();
    if (name === '홈') li.classList.add('sf-nav-home');
    if (name !== '교육') return;
    li.classList.add('sf-nav-edu');
    a.setAttribute('aria-haspopup', 'true');
    a.setAttribute('aria-expanded', 'false');
    a.insertAdjacentHTML('beforeend', '<span class="sf-nav-caret">' + ICON.down + '</span>');
    var panel = el('div', 'sf-navdrop sf-hidden',
      '<div class="sf-navdrop__main"><small>교육</small><a href="/course">전체 교육</a></div>' +
      '<div class="sf-navdrop__cats"><small>카테고리</small><div class="sf-navdrop__grid"><div>' + catLinks.slice(0, 4).join('') + '</div><div>' + catLinks.slice(4).join('') + '</div></div></div>');
    li.appendChild(panel);
  });
  // 아임웹이 메뉴를 복제해도 동작하도록 문서 전체에서 이벤트를 받아요 (마우스 올리면 열림, 벗어나면 0.2초 뒤 닫힘)
  var dropTimer = null;
  function setDrop(li, open) {
    [].forEach.call(document.querySelectorAll('.sf-nav-edu'), function (x) {
      var on = open && x === li, p = x.querySelector('.sf-navdrop'), t = x.querySelector('a');
      if (p) p.classList.toggle('sf-hidden', !on);
      if (t) t.setAttribute('aria-expanded', String(on));
    });
  }
  document.addEventListener('mouseover', function (e) {
    var li = e.target.closest && e.target.closest('.sf-nav-edu');
    if (li) { clearTimeout(dropTimer); setDrop(li, true); }
    else if (document.querySelector('.sf-nav-edu .sf-navdrop:not(.sf-hidden)')) { clearTimeout(dropTimer); dropTimer = setTimeout(function () { setDrop(null, false); }, 200); }
  });
  document.addEventListener('focusin', function (e) { var li = e.target.closest && e.target.closest('.sf-nav-edu'); setDrop(li, !!li); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrop(null, false); });

  // ④ PC 오른쪽: 검색 · 파트너 지원 | 로그인
  if (loginW) {
    var act = el('div', 'sf-hd-actions',
      '<button type="button" class="sf-hd-search" data-sf-search-open aria-label="검색">' + ICON.search + '</button>' +
      '<a class="sf-hd-partner" href="/partner">파트너 지원</a>' +
      (loggedIn ? '<a class="sf-hd-class" href="/classroom">나의 강의실</a>' : ''));
    loginW.parentNode.insertBefore(act, loginW);
  }

  // ⑤ 모바일 헤더 (Figma Header/Mobile: 로고 · 검색 · 메뉴) — 아임웹 모바일 헤더는 숨겨요
  var mh = el('div', 'sf-mh',
    '<a class="sf-mh__logo" href="/" aria-label="시니어퓨처 홈"><span class="sf-logo"><b>SENIOR</b> FUTURE</span></a>' +
    '<button type="button" class="sf-mh__btn" data-sf-search-open aria-label="검색">' + ICON.search + '</button>' +
    '<button type="button" class="sf-mh__btn" data-sf-open="sf-menu" aria-label="전체 메뉴">' + ICON.menu + '</button>');
  wrap.insertBefore(mh, wrap.firstChild);

  // ⑥ 전체 메뉴 (오른쪽에서 열림, 교육은 펼침)
  var auth = loggedIn
    ? '<a class="sf-btn sf-btn--outline" href="/shop_mypage">마이페이지</a><a class="sf-btn sf-btn--dark" href="/classroom">나의 강의실</a>'
    : '<a class="sf-btn sf-btn--outline" href="' + loginHref + '">로그인</a><a class="sf-btn sf-btn--dark" href="' + joinHref + '">회원가입</a>';
  function item(name, href) { return '<a class="sf-menu__item" href="' + href + '"><span>' + name + '</span>' + ICON.right + '</a>'; }
  var menu = el('div', 'sf-drawer sf-drawer--full',
    '<div class="sf-drawer__dim" data-sf-drawer-close></div>' +
    '<nav class="sf-drawer__panel sf-menu" role="dialog" aria-modal="true" aria-label="전체 메뉴">' +
      '<div class="sf-menu__head"><span class="sf-logo"><b>SENIOR</b> FUTURE</span><button type="button" class="sf-mh__btn" data-sf-drawer-close aria-label="메뉴 닫기">' + ICON.close + '</button></div>' +
      '<div class="sf-menu__auth">' + auth + '</div>' +
      '<div class="sf-menu__list" data-sf-accordion>' +
        '<div class="sf-menu__group" data-sf-acc-item>' +
          '<button type="button" class="sf-menu__item" data-sf-acc-trigger aria-expanded="false"><span>교육</span>' + ICON.down + '</button>' +
          '<div class="sf-menu__sub" data-sf-acc-panel hidden><a class="is-all" href="/course">전체 교육</a>' + catLinks.join('') + '</div>' +
        '</div>' +
        item('무료 라이브', '/live') + item('인사이트', '/insight') + item('커뮤니티', '/community') + item('기업·공공기관', '/business') + item('시니어퓨처', '/about') +
      '</div>' +
      '<div class="sf-menu__foot"><a href="/partner">파트너 지원</a><a href="/help">고객센터</a><a href="/help#notice">공지사항</a><a href="' + kakao + '">카카오톡 상담</a></div>' +
    '</nav>');
  menu.id = 'sf-menu';
  menu.hidden = true;
  menu.setAttribute('data-sf-drawer', '');
  document.body.appendChild(menu);

  // ⑦ 검색창 (Figma 검색 - 입력 중): 최근 검색어(브라우저 저장) + 많이 찾는 검색어 → 아임웹 /search
  var popular = cfg.popular || ['장기요양 평가', '시니어 창업', '에이지테크', '시니어 타운', '보험 신탁', '5060 마케팅', '평생교육', '방문요양'];
  var sv = el('div', 'sf-drawer sf-search-layer',
    '<div class="sf-drawer__dim" data-sf-drawer-close></div>' +
    '<div class="sf-search" role="dialog" aria-modal="true" aria-label="검색">' +
      '<form class="sf-search__head" data-sf-search action="/search" method="get" role="search">' +
        '<button type="button" class="sf-mh__btn sf-search__back" data-sf-drawer-close aria-label="검색 닫기">' + ICON.back + '</button>' +
        '<label class="sf-search__box">' + ICON.search + '<input name="keyword" data-sf-search-input type="search" placeholder="강의, 연사, 키워드 검색" autocomplete="off" aria-label="검색어"></label>' +
        '<button type="button" class="sf-search__x" data-sf-drawer-close aria-label="닫기">' + ICON.close + '</button>' +
      '</form>' +
      '<div class="sf-search__body">' +
        '<section class="sf-search__sec" data-sf-recent data-search-url="/search?keyword="><div class="sf-search__h"><h2>최근 검색어</h2><button type="button" data-sf-recent-clear>모두 지우기</button></div>' +
          '<ul class="sf-search__recent" data-sf-recent-list></ul><p class="sf-search__empty" data-sf-recent-empty>최근 검색어가 없어요</p></section>' +
        '<section class="sf-search__sec"><h2>지금 많이 찾는 검색어</h2><ol class="sf-search__pop">' +
          popular.map(function (w, i) { return '<li><a href="/search?keyword=' + encodeURIComponent(w) + '"><b>' + (i + 1) + '</b>' + txt(w) + '</a></li>'; }).join('') +
        '</ol></section>' +
      '</div>' +
    '</div>');
  sv.id = 'sf-search';
  sv.hidden = true;
  sv.setAttribute('data-sf-drawer', '');
  document.body.appendChild(sv);
  // 머리말 버튼(복제돼도 됨) → 숨은 실제 버튼을 눌러 drawer.js로 열어요
  ['sf-menu', 'sf-search'].forEach(function (id) {
    var t = el('button', 'sf-hidden'); t.type = 'button'; t.id = id + '-trigger'; t.setAttribute('data-sf-drawer-open', id); t.tabIndex = -1;
    document.body.appendChild(t);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sf-open], [data-sf-search-open]');
    if (!b) return;
    var id = b.getAttribute('data-sf-open') || 'sf-search';
    document.getElementById(id + '-trigger').click();
    if (id === 'sf-search') setTimeout(function () { var i = sv.querySelector('input'); if (i) i.focus(); }, 60);
  });
  sv.querySelector('form').addEventListener('submit', function (e) { var i = this.querySelector('input'); if (!i.value.trim()) e.preventDefault(); });

  // ⑧ 하단 탭바 (모바일) — 상세·결제·로그인 화면에선 숨김
  var hideBar = /shop_payment|shop_cart|login|site_join|\/(course|live|community)\/?$/.test(path) && /idx=/.test(location.search) ||
    /shop_payment|shop_cart|login|site_join|shop_view/.test(path);
  if (!hideBar) {
    var tabs = [['홈', '/', '^/(index)?$', ICON.home], ['교육', '/course', '^/course', ICON.edu], ['무료 라이브', '/live', '^/live', ICON.live],
      ['커뮤니티', '/community', '^/community', ICON.team], ['MY', loggedIn ? '/classroom' : loginHref, '^/(classroom|class-|shop_mypage)', ICON.user]];
    var nav = el('nav', 'sf-tabbar', tabs.map(function (t) { return '<a href="' + t[1] + '" data-match="' + t[2] + '">' + t[3] + '<span>' + t[0] + '</span></a>'; }).join(''));
    nav.setAttribute('data-sf-tabbar', '');
    nav.setAttribute('aria-label', '주요 메뉴');
    document.body.appendChild(nav);
  }

  // ⑨ 카톡 상담 버튼 (PC 오른쪽 아래)
  if (cfg.fab !== false && !/shop_payment/.test(path)) {
    var fab = el('a', 'sf-fab', ICON.chat + '<span>카톡 상담</span>');
    fab.href = kakao;
    if (/^https?:/.test(kakao)) { fab.target = '_blank'; fab.rel = 'noopener'; }
    document.body.appendChild(fab);
  }

  // ⑩ 스크롤하면 헤더 위쪽 고정 + 그림자
  // 스크롤하면 헤더 아래 선
  window.addEventListener('scroll', function () { wrap.classList.toggle('is-stuck', window.scrollY > 4); }, { passive: true });
  SFUI.init(document);
})
