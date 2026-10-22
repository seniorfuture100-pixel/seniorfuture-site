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
  function person(c) { return '<span class="hb-av" style="--c:' + c + '">' + svg(I.user) + '</span>'; }
  var SLIDES = [
    { k: 'edu', href: '/course', badge: '교육', title: '현장 전문가에게 배우는<br>시니어 산업 실무 교육', sub: '요양·주거·금융·헬스케어 · VOD와 기수제 스터디',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-tablet"><span class="hb-screen"><span class="hb-thumb"><b>요양·돌봄 실무</b><small>3강 · 현장 운영의 기본</small><span class="hb-playbtn">' + svg(I.play) + '</span></span><span class="hb-progress"><i></i></span></span></span>' +
        '<span class="hb-mini m1"><i class="hb-dot" style="--c:#12b886"></i><b>시니어 주거</b><small>기수제 스터디</small></span>' +
        '<span class="hb-mini m2"><i class="hb-dot" style="--c:#4c6ef5"></i><b>에이지테크</b><small>현장 사례</small></span>' +
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
    { k: 'biz', href: '/business', badge: '기업·기관', title: '기업·공공기관을 위한<br>시니어 비즈니스 파트너', sub: '임직원 교육 · 시장 진입 · 현장 실증',
      art: '<i class="hb-glow"></i>' +
        '<span class="hb-dash"><span class="hb-dhead">' + svg(I.bld) + '<b>협업 프로그램</b></span><span class="hb-dbars"><i style="--h:38%"></i><i style="--h:56%"></i><i style="--h:48%"></i><i style="--h:72%"></i><i style="--h:90%"></i></span><span class="hb-dchips"><i>교육</i><i>포럼</i><i>실증</i></span></span>' +
        '<span class="hb-chip c-50"><b>50곳+</b>함께한 기업·기관</span>' +
        '<span class="hb-check k1">' + svg(I.check) + '임직원 교육</span><span class="hb-check k2">' + svg(I.check) + '시장 진입</span><span class="hb-check k3">' + svg(I.check) + '현장 실증</span>' }
  ];
  track.innerHTML = SLIDES.map(function (s) {
    return '<a class="sfw-banner__slide sf-hb sf-hb--' + s.k + '" href="' + s.href + '">' +
      '<span class="sfw-banner__copy"><span class="sf-badge sf-badge--dark">' + s.badge + '</span><strong>' + s.title + '</strong><span>' + s.sub + '</span><em>자세히 보기' + svg(I.arrow) + '</em></span>' +
      '<span class="sf-hb__art" aria-hidden="true">' + s.art + '</span></a>';
  }).join('');
  var pager = el.querySelector('[data-sf-pager]');
  if (pager) pager.textContent = '1 / ' + SLIDES.length;
  el.classList.add('sf-hb-on');
});
