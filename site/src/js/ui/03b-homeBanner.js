// 10/23 새로 씀 — 홈 맨 위 배너를 6장(교육·무료 라이브·인사이트·커뮤니티·파트너 모집·기업·기관)으로
/* home-banner.js — 디자인 모드 코드 위젯(.sfw-banner)의 사진 슬라이드를 코드로 그린 입체 장면 슬라이드로 바꿔요.
   - 캐러셀(carousel.js)보다 먼저 실행돼야 해요(끝없이 돌기용 복제가 새 슬라이드로 만들어지게) → ui 묶음에서 carousel 앞
   - 장면은 사진 파일 없이 CSS·SVG로 그려서 빠르고 선명해요. 글씨는 장면 옆(휴대폰은 아래)에 있어 또렷해요(모양은 qa/03-1023-banner.css)
   - 장면마다 3층: 뒤 은은한 빛 → 가운데 주인공(태블릿·휴대폰·리포트·모임·프로필·대시보드) → 앞에 떠 있는 작은 카드·배지
   - 숫자는 공식 자료에 있는 것만(168조 원·50곳+·5분). 문구·주소를 바꾸려면 아래 SLIDES 만 고치면 돼요 (10/23 2차) */
SFUI.register('homeBanner', function () {
  var el = document.querySelector('.sfw-banner'), track = el && el.querySelector('[data-sf-track]');
  if (!track || track.querySelector('.sf-hb') || track.querySelector('[data-sf-clone]')) return;
  function svg(d, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var I = {
    arrow: '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/>',
    check: '<path d="M5 12.5l4.2 4L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    user: '<circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4 20.5c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" fill="currentColor"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    search: '<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    mark: '<path d="M6 3.5h12v17l-6-4-6 4z" fill="currentColor"/>',
    chat: '<path d="M4 5.5h16v10H9l-5 4z" fill="currentColor"/>',
    bolt: '<path d="M13 2L5 13.5h6L10 22l8-11.5h-6z" fill="currentColor"/>',
    bld: '<path d="M4 20.5V6l8-3v17.5M12 9.5l8 2.5v8.5M3 20.5h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 9h2M7 12.5h2M7 16h2M15 14h2M15 17h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    medal: '<circle cx="12" cy="14" r="6" fill="currentColor"/><path d="M8.5 3.5h3l1.2 5M15.5 3.5h-3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
  };
  // (10/23 3차) 교육 장면: 태블릿 화면이 2.2초마다 다른 분야로 바뀌고, 아래 분야 칩 8개 중 지금 분야가 켜져요
  // [화면 제목, 한 줄, 칩 이름, 밝은 색, 진한 색, 글자 색]
  var CATS = [
    ['시니어 산업 이해', '시장 흐름과 기회 지도', '산업 이해', '#fff3bf', '#ffd43b', '#7a4a00'],
    ['요양·돌봄 실무', '현장 운영의 기본', '요양·돌봄', '#ffe8cc', '#ffc078', '#7c2d12'],
    ['주거·시니어 타운', '입지와 사업성 검토', '주거·타운', '#d3f9d8', '#8ce99a', '#1f5f2e'],
    ['금융·보험', '신탁·보험 상품 설계', '금융·보험', '#dbe4ff', '#91a7ff', '#2b3a99'],
    ['소비·커머스', '5060 고객 이해하기', '소비·커머스', '#ffdeeb', '#faa2c1', '#8c1d44'],
    ['헬스케어·에이지테크', '현장 도입 사례', '헬스케어', '#c5f6fa', '#66d9e8', '#0b5f6e'],
    ['여가·교육·일', '액티브 시니어 프로그램', '여가·일', '#f3d9fa', '#da77f2', '#6b1f80'],
    ['창업·사업개발', '아이디어에서 실행까지', '창업', '#e7f5ff', '#74c0fc', '#1a4f80']
  ];
  function person(c) { return '<span class="hb-av" style="--c:' + c + '">' + svg(I.user) + '</span>'; }
  var SLIDES = [
    { k: 'edu', href: '/course', badge: '교육', title: '현장 전문가에게 배우는<br>시니어 산업 실무 교육', sub: '8개 분야 · VOD와 기수제 스터디',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-tablet"><span class="hb-screen"><span class="hb-thumb"><b>' + CATS[0][0] + '</b><small>' + CATS[0][1] + '</small><span class="hb-playbtn">' + svg(I.play) + '</span></span><span class="hb-progress"><i></i></span></span></span>' +
        '<span class="hb-cats">' + CATS.map(function (c, i) { return '<i' + (i ? '' : ' class="is-on"') + '>' + c[2] + '</i>'; }).join('') + '</span>' +
        '<span class="hb-medal">' + svg(I.check) + '<b>수료</b></span>' },
    { k: 'live', href: '/live', badge: '무료 라이브', title: '매달 열리는 무료 라이브,<br>현장 이야기를 실시간으로', sub: '1~2시간 · 질의응답 · 다시보기 제공',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-phone"><span class="hb-screen"><span class="hb-onair"><i></i>LIVE</span><span class="hb-speaker">' + svg(I.user) + '</span><span class="hb-caption"><b>시니어 산업 트렌드</b><small>현장 전문가 라이브</small></span></span></span>' +
        '<span class="hb-chip c-join">' + svg(I.bolt) + '실시간 참여</span>' +
        '<span class="hb-bubble q1">질문 있어요!</span><span class="hb-bubble q2">현장 이야기 좋아요</span>' +
        '<span class="hb-heart h1">' + svg(I.heart) + '</span><span class="hb-heart h2">' + svg(I.heart) + '</span><span class="hb-heart h3">' + svg(I.heart) + '</span>' },
    { k: 'insight', href: '/insight', badge: '인사이트', title: '시니어 산업을 읽는<br>깊이 있는 인사이트', sub: '산업 리포트 · 기업 사례 분석 · 트렌드',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-report"><span class="hb-cover"><small>SENIOR FUTURE</small><b>시니어 산업<br>리포트</b></span><i class="hb-line w90"></i><i class="hb-line w70"></i><i class="hb-line w80"></i><i class="hb-line w50"></i></span>' +
        '<span class="hb-chart"><small>2030 시니어 산업 전망</small><b>168조 원</b><svg viewBox="0 0 160 56" aria-hidden="true"><defs><linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#20c997" stop-opacity=".35"/><stop offset="1" stop-color="#20c997" stop-opacity="0"/></linearGradient></defs><path d="M2 50 L40 40 L78 32 L116 18 L158 6 L158 56 L2 56Z" fill="url(#hbg)"/><path d="M2 50 L40 40 L78 32 L116 18 L158 6" fill="none" stroke="#0ca678" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="158" cy="6" r="4" fill="#0ca678"/></svg></span>' +
        '<span class="hb-round r-search">' + svg(I.search) + '</span><span class="hb-round r-mark">' + svg(I.mark) + '</span>' },
    { k: 'meet', href: '/community', badge: '커뮤니티', title: '같은 고민을 가진 사람들과<br>함께 성장하는 커뮤니티', sub: '모임 · 네트워킹 · 현장 탐방',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-crowd">' + person('#ffa94d') + person('#74c0fc') + person('#ffd43b') + person('#63e6be') + person('#e599f7') + '</span>' +
        '<span class="hb-event"><span class="hb-evicon">' + svg(I.cal) + '</span><span><small>이번 달 모임</small><b>현장 탐방 · 네트워킹</b></span><em>참여 신청</em></span>' +
        '<span class="hb-bubble q1">반가워요!</span><span class="hb-bubble q2">' + svg(I.chat) + '같이 가요</span>' },
    { k: 'partner', href: '/partner', badge: '파트너 모집', title: '현장 전문가를<br>파트너로 모십니다', sub: '강사 · 라이브 연사 · 기고 · 커뮤니티 운영',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-profile"><span class="hb-pava">' + svg(I.user) + '<i>' + svg(I.check) + '</i></span><b>현장 전문가</b><small>시니어 산업 파트너</small><span class="hb-ptags"><i>강의</i><i>라이브</i><i>기고</i></span></span>' +
        '<i class="hb-pill p1">요양·돌봄</i><i class="hb-pill p2">시니어 주거</i><i class="hb-pill p3">헬스케어</i><i class="hb-pill p4">에이지테크</i>' +
        '<span class="hb-chip c-time">' + svg(I.bolt) + '지원 5분</span>' },
    { k: 'biz', href: '/business', badge: '기업·기관', title: '기업·공공기관을 위한<br>시니어 비즈니스 파트너', sub: '맞춤 교육 · 콘텐츠·행사 협업 · 공동 프로젝트',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-dash"><span class="hb-dhead">' + svg(I.bld) + '<b>협업 프로그램</b></span><span class="hb-dbars"><i style="--h:38%"></i><i style="--h:56%"></i><i style="--h:48%"></i><i style="--h:72%"></i><i style="--h:90%"></i></span><span class="hb-dchips"><i>교육</i><i>행사</i><i>프로젝트</i></span></span>' +
        '<span class="hb-chip c-50"><b>50곳+</b>대학·공공기관·기업·미디어</span>' +
        '<span class="hb-check k1">' + svg(I.check) + '맞춤 교육</span><span class="hb-check k2">' + svg(I.check) + '행사 협업</span><span class="hb-check k3">' + svg(I.check) + '공동 프로젝트</span>' }
  ];
  track.innerHTML = SLIDES.map(function (s) {
    return '<a class="sfw-banner__slide sf-hb sf-hb--' + s.k + '" href="' + s.href + '">' +
      '<span class="sfw-banner__copy"><span class="sf-badge sf-badge--dark">' + s.badge + '</span><strong>' + s.title + '</strong><span>' + s.sub + '</span><em>자세히 보기' + svg(I.arrow) + '</em></span>' +
      '<span class="sf-hb__art" aria-hidden="true">' + s.art + '</span></a>';
  }).join('');
  var pager = el.querySelector('[data-sf-pager]');
  if (pager) pager.textContent = '1 / ' + SLIDES.length;
  el.classList.add('sf-hb-on');
  // (10/27) 휴대폰은 PC 배너(760×340)를 그대로 줄인 모양 → 장면 줄임 비율 = 배너 너비/760 (CSS --hb-k, qa/03 휴대폰 칸)
  // (10/27 2차) 장면마다 그림 크기·위치가 달라 여백이 들쭉날쭉(교육 위 8·아래 72, 파트너 오른쪽 10 등)하고 넘김 표시가 그림에 겹침
  //  → 장마다 실제 그림 범위를 재서: 오른쪽 여백 같게, 위아래 가운데, 넘김 표시 위로(넘치면 그만큼만 줄임)
  function place(s, pg) {
    var art = s.querySelector('.sf-hb__art'); if (!art) return;
    art.style.translate = ''; art.style.scale = '';
    var S = s.getBoundingClientRect(); if (!S.width) return;
    var kids = [].filter.call(art.children, function (e) { return !e.classList.contains('hb-glow') && e.offsetWidth; });
    function box() {
      var b = { l: 1e9, t: 1e9, r: -1e9, b: -1e9 };
      kids.forEach(function (e) { var r = e.getBoundingClientRect(); b.l = Math.min(b.l, r.left); b.t = Math.min(b.t, r.top); b.r = Math.max(b.r, r.right); b.b = Math.max(b.b, r.bottom); });
      return b;
    }
    var m = Math.max(10, 24 * S.width / 760), top = S.top + m, bot = S.bottom - Math.max(m, pg + 6), right = S.right - m;
    // 휴대폰은 글씨를 덜 줄여서 글씨 오른쪽 끝 ~ 배너 끝 사이에만 그림이 들어가게(겹침 방지)
    var cp = s.querySelector('.sfw-banner__copy'), left = cp && S.width < 760 ? cp.getBoundingClientRect().right + m : S.left;
    var B = box(), f = Math.min(1, (bot - top) / (B.b - B.t), (right - left) / (B.r - B.l));
    if (f < 1) { art.style.scale = f.toFixed(3); B = box(); }
    art.style.translate = Math.round(right - B.r) + 'px ' + Math.round((top + bot) / 2 - (B.t + B.b) / 2) + 'px';
  }
  function fit() {
    var s = track.querySelector('.sf-hb'), w = s && s.getBoundingClientRect().width;
    if (!w) return;
    el.style.setProperty('--hb-k', Math.min(1, w / 760).toFixed(4));
    // 넘김 표시가 차지하는 아래 높이(지금 슬라이드 기준)
    var cur = track.querySelector('.sf-hb.is-current') || s, p = el.querySelector('.sf-peek-pager'), pg = 0;
    if (p && p.offsetWidth) pg = cur.getBoundingClientRect().bottom - p.getBoundingClientRect().top;
    track.querySelectorAll('.sf-hb').forEach(function (x) { place(x, Math.max(0, pg)); });
  }
  var fitT;
  function refit() { clearTimeout(fitT); fitT = setTimeout(fit, 120); }
  fit();
  setTimeout(fit, 600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(track);
  // 분야 바꾸기: 진짜 배너와 끝없이 돌기용 복제 배너를 같은 순간에 같이 바꿔서, 넘어갈 때 티가 안 나요
  var ci = 0;
  function paint() {
    var c = CATS[ci];
    el.querySelectorAll('.sf-hb--edu').forEach(function (sl) {
      var t = sl.querySelector('.hb-thumb'); if (!t) return;
      t.style.setProperty('--t1', c[3]); t.style.setProperty('--t2', c[4]); t.style.setProperty('--ink', c[5]);
      t.querySelector('b').textContent = c[0]; t.querySelector('small').textContent = c[1];
      t.classList.remove('is-swap'); void t.offsetWidth; t.classList.add('is-swap');
      sl.querySelectorAll('.hb-cats i').forEach(function (x, j) { x.classList.toggle('is-on', j === ci); });
    });
  }
  setInterval(function () { if (document.hidden) return; ci = (ci + 1) % CATS.length; paint(); }, 2200);
});
