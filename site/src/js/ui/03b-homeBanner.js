// 10/23 새로 씀 — 홈 맨 위 배너를 6장(교육·무료 라이브·인사이트·커뮤니티·파트너 모집·기업·기관)으로
/* home-banner.js — 디자인 모드 코드 위젯(.sfw-banner)의 사진 슬라이드를 코드로 그린 입체 그림 슬라이드로 바꿔요.
   - 캐러셀(carousel.js)보다 먼저 실행돼야 해요(끝없이 돌기용 복제가 새 슬라이드로 만들어지게) → ui 묶음에서 carousel 앞
   - 그림은 사진 파일 없이 CSS로 그려서 빠르고, 글씨는 그림 위가 아니라 옆에 있어 또렷해요(모양은 qa/03-1023-banner.css)
   - 문구·주소를 바꾸려면 아래 SLIDES 만 고치면 돼요 */
SFUI.register('homeBanner', function () {
  var el = document.querySelector('.sfw-banner'), track = el && el.querySelector('[data-sf-track]');
  if (!track || track.querySelector('.sf-hb') || track.querySelector('[data-sf-clone]')) return;
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  function pills(list) { return list.map(function (p, i) { return '<i class="sf-hb__pill" style="--i:' + i + '">' + p + '</i>'; }).join(''); }
  var SLIDES = [
    { k: 'edu', href: '/course', badge: '교육', title: '현장 전문가에게 배우는<br>시니어 산업 실무 교육', sub: '요양·주거·금융·헬스케어 · VOD와 기수제 스터디',
      art: '<i class="sf-hb__orb"></i><span class="sf-hb__card c1"><b>요양·돌봄 실무</b><small>12강 · VOD</small></span><span class="sf-hb__card c2"><b>시니어 주거</b><small>기수제 스터디</small></span><span class="sf-hb__card c3"><b>에이지테크</b><small>현장 사례</small></span>' },
    { k: 'live', href: '/live', badge: '무료 라이브', title: '매달 열리는 무료 라이브,<br>현장 이야기를 실시간으로', sub: '1~2시간 · 질의응답 · 다시보기 제공',
      art: '<span class="sf-hb__play"><i></i></span><span class="sf-hb__onair"><i></i>LIVE</span><span class="sf-hb__bubble b1">질문 있어요!</span><span class="sf-hb__bubble b2">현장 이야기 최고예요</span>' },
    { k: 'insight', href: '/insight', badge: '인사이트', title: '시니어 산업을 읽는<br>깊이 있는 인사이트', sub: '산업 리포트 · 기업 사례 분석 · 트렌드',
      art: '<span class="sf-hb__board"><small>시니어 산업 규모</small><b>168조 원</b><span class="sf-hb__bars"><i style="--h:34%"></i><i style="--h:52%"></i><i style="--h:68%"></i><i style="--h:92%"></i></span></span><span class="sf-hb__tag">2030 전망</span>' },
    { k: 'meet', href: '/community', badge: '커뮤니티', title: '같은 고민을 가진 사람들과<br>함께 성장하는 커뮤니티', sub: '모임 · 네트워킹 · 현장 탐방',
      art: '<i class="sf-hb__ring"></i><span class="sf-hb__hub">함께</span>' + ['요양', '주거', '금융', '창업', '헬스', '마케팅'].map(function (t, i) { return '<span class="sf-hb__node n' + i + '">' + t + '</span>'; }).join('') },
    { k: 'partner', href: '/partner', badge: '파트너 모집', title: '현장 전문가를<br>파트너로 모십니다', sub: '강사 · 라이브 연사 · 기고 · 커뮤니티 운영',
      art: pills(['요양·돌봄', '시니어 주거', '보험·신탁', '헬스케어', '에이지테크', '시니어 마케팅']) },
    { k: 'biz', href: '/business', badge: '기업·기관', title: '기업·공공기관을 위한<br>시니어 비즈니스 파트너', sub: '임직원 교육 · 시장 진입 · 현장 실증',
      art: '<span class="sf-hb__panel"><small>함께하는 일</small><b><i></i>임직원 교육</b><b><i></i>시장 진입 전략</b><b><i></i>현장 실증 연계</b></span><i class="sf-hb__cube q1"></i><i class="sf-hb__cube q2"></i>' }
  ];
  track.innerHTML = SLIDES.map(function (s) {
    return '<a class="sfw-banner__slide sf-hb sf-hb--' + s.k + '" href="' + s.href + '">' +
      '<span class="sfw-banner__copy"><span class="sf-badge sf-badge--dark">' + s.badge + '</span><strong>' + s.title + '</strong><span>' + s.sub + '</span><em>자세히 보기' + ARROW + '</em></span>' +
      '<span class="sf-hb__art" aria-hidden="true">' + s.art + '</span></a>';
  }).join('');
  var pager = el.querySelector('[data-sf-pager]');
  if (pager) pager.textContent = '1 / ' + SLIDES.length;
  el.classList.add('sf-hb-on');
});
