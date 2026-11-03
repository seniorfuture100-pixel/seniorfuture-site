/* sf-config.js — 사이트 설정 (공통 코드 Header 맨 위 <script id="sf-config">). 다른 코드보다 먼저 읽혀야 해요.
   모든 주소·수치는 공식 채널(apply.seniorfuture.kr · 링크트리)에서 확인한 값이에요. (2026-10-19) */
window.SF_SITE = Object.assign(window.SF_SITE || {}, {
  kakao: 'https://pf.kakao.com/_ZYaLG/chat',
  topbanner: { key: '2026-11-platform-renewal', text: '🎉 시니어 산업 플랫폼 시니어퓨처 리뉴얼! 교육 · 무료 라이브 · 인사이트 · 커뮤니티를 한곳에서!', href: '/course' },   // (11/2 사장님) 오픈 → 리뉴얼 안내(key 바꿔 닫은 분께도 다시 보여요)
  // (11/3 사장님) 홈 '시니어퓨처 전문가 네트워크' 16명(PC 4×4) 순서 — 옛 페이지 '기업·기관·학계 연사 초청' 순서 기준,
  //   안정기·황규만·김현미·박동명·최학희·이보람 빼고(김용근 교수는 전문가 게시판 글이 없어 뺌), 박재병(케어닥)·김견원(케어네이션)·이은정·정한나·신승준 추가,
  //   박재병·김견원은 떨어뜨려 배치. 이름은 전문가 게시판 글 제목 맨 앞 이름 그대로 — 이 목록 길이만큼 홈에 나와요
  homeExperts: ['김난도', '김영선', '정순둘', '주수산나', '홍주화', '박영란', '김정태', '김태성', '하정화', '임희숙', '장진호', '김견원', '이은정', '정한나', '신승준', '박재병'],
  sns: {
    instagram: 'https://www.instagram.com/senior_future/',
    youtube: 'https://www.youtube.com/@seniorfuture',
    blog: 'https://blog.naver.com/senior_future',
    kakao: 'https://pf.kakao.com/_ZYaLG'
  },
  channels: [
    ['뉴스레터 무료 구독', 'https://walla.my/v/HdUG9uCe2rRx9tw1X91u'],
    ['네이버 카페', 'https://cafe.naver.com/seniorfuture2311'],
    ['네이버 프리미엄콘텐츠', 'https://contents.premium.naver.com/seniorfuture/seniorfutureinsight'],
    ['스레드', 'https://www.threads.com/@senior_future'],
    ['인스타그램', 'https://www.instagram.com/senior_future/'],
    ['유튜브', 'https://www.youtube.com/@seniorfuture'],
    ['네이버 블로그', 'https://blog.naver.com/senior_future'],
    ['카카오톡 채널', 'https://pf.kakao.com/_ZYaLG'],
    ['네트워킹 오픈채팅', 'https://open.kakao.com/o/gatyJ8hh']
  ],
  company: {
    name: '시니어퓨처 (SeniorFuture)', ceo: '정동호', biz: '858-27-01782', report: '2026-서울관악-0090',
    tel: '010-3237-4502', mail: 'seniorfuture100@gmail.com', addr: '서울특별시 관악구 남부순환로170길 66-4, 1동 2층 202호 (신림동, 디딤하우스)'
  },
  pressHref: 'https://apply.seniorfuture.kr/press',
  press: [
    { o: '머니투데이', t: '"돌봄 공백, 기술로 메운다"…경기도 창업 \'에이지테크\'로 회춘', d: '2026-10-14', href: 'https://n.news.naver.com/mnews/article/008/0005426331', g: 'g-o' },
    { o: '여성경제신문', t: '대학 강좌부터 민간 커뮤니티까지···시니어 창업 교육, 실제 협업으로 이어질까', d: '2026-09-17', href: 'https://www.womaneconomy.co.kr/news/articleView.html?idxno=258837', g: 'g-b' },
    { o: '브라보마이라이프', t: '시니어퓨처, 내달 부산서 \'에이지테크 포럼\' 개최', d: '2026-08-24', href: 'https://bravo.etoday.co.kr/view/atc_view/19889', g: 'g-g' },
    { o: '여성경제신문', t: '"65세만 보고 덤볐다간 망한다"···시니어 지갑은 어떻게 열리나', d: '2026-08-02', href: 'https://www.womaneconomy.co.kr/news/articleView.html?idxno=256800', g: 'g-d' },
    { o: '브라보마이라이프', t: '"복지 넘어 산업으로"… AI 시대 시니어 비즈니스 해법', d: '2026-03-23', href: 'https://bravo.etoday.co.kr/view/atc_view/18837', g: 'g-o' },
    { o: '서울경제', t: '"에이지테크부터 창업까지…커리어로 잇는 시니어 산업 함께해요"', d: '2026-01-12', href: 'https://www.sedaily.com/NewsView/2K79WADYVP', g: 'g-b' },
    { o: '서울경제', t: '"초고령사회는 위기이자 기회…AI·실행력 갖춘 청년이 시니어 산업 주역"', d: '2025-12-17', href: 'https://n.news.naver.com/mnews/article/011/0004568306', g: 'g-g' },
    { o: '서울경제', t: '청년, AI로 초고령사회 해법 찾다… \'시니어퓨처 아이디어톤\' 성료', d: '2025-07-28', href: 'https://n.news.naver.com/mnews/article/011/0004514156', g: 'g-d' },
    { o: '브라보마이라이프', t: '시니어 비즈니스, 청년이 이끈다… MYSC·시니어퓨처 MOU 체결', d: '2025-07-03', href: 'https://bravo.etoday.co.kr/view/atc_view/16568', g: 'g-o' },
    { o: '매일경제', t: '"시니어 비즈니스 지금이 기회" 기업과 청년의 새로운 전장으로', d: '2025-04-30', href: 'https://n.news.naver.com/article/030/0003308822', g: 'g-b' }
  ]
});
// (11/2) PG 재심사 스위치 — true 면 파트너 모집·추천 수익 안내를 가려요(코드·내용은 그대로). 심사 통과 뒤 false 로 바꿔 배포하면 원래 화면으로 돌아와요.
//   쓰는 곳: css/qa/12-1102-pg-hide.css(html.sf-pg-hide), js/ui/03b-homeBanner.js(파트너 모집 배너), js/r2/01-iife.js(마이페이지 '파트너스' 메뉴)
window.SF_PG_HIDE = true;   // (11/3 사장님) 토스페이 2차 반려 — '파트너 지원 등 가맹점↔파트너 계약 구조가 보이는 화면·경로 모두 삭제' 요구로 다시 켬
if (window.SF_PG_HIDE) {
  document.documentElement.classList.add('sf-pg-hide');
  // 파트너 지원·신청·마케팅 파트너스 페이지는 주소로 들어와도 홈으로(페이지·내용은 그대로 둠 → 스위치 끄면 원래대로)
  if (/^\/(partner|partners|partner-apply)(\/|$)/.test(location.pathname)) location.replace('/');
}
// (11/2 사장님) Microsoft Clarity 히트맵·화면 녹화 — 프로젝트 '시니어퓨처 아임웹 (2026.11~)'(z7cxscbz9h), 가림 '엄격'(화면 글자 모두 가림 → 회원 정보가 녹화에 안 남음)
//   끄려면 이 블록만 지우고 배포. 개인정보처리방침 '행태정보'에 Microsoft Corporation(Clarity) 명시
(function (c, l, a, r, i, t, y) {
  if (c[a]) return;
  c[a] = function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
  y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, 'clarity', 'script', 'z7cxscbz9h');
