/* sf-config.js — 사이트 설정 (공통 코드 Header 맨 위 <script id="sf-config">). 다른 코드보다 먼저 읽혀야 해요.
   모든 주소·수치는 공식 채널(apply.seniorfuture.kr · 링크트리)에서 확인한 값이에요. (2026-10-19) */
window.SF_SITE = Object.assign(window.SF_SITE || {}, {
  kakao: 'https://pf.kakao.com/_ZYaLG/chat',
  topbanner: { key: '2026-10-membership', text: '시니어퓨처 멤버십 모집 중 · 뉴스레터 · 심층 콘텐츠 · 웨비나 · 네트워킹', href: 'https://seniorfuturemembership.netlify.app/' },
  sns: {
    instagram: 'https://www.instagram.com/senior_future/',
    youtube: 'https://www.youtube.com/@seniorfuture',
    blog: 'https://blog.naver.com/senior_future',
    kakao: 'https://pf.kakao.com/_ZYaLG'
  },
  channels: [
    ['뉴스레터 무료 구독', 'https://walla.my/v/HdUG9uCe2rRx9tw1X91u'],
    ['멤버십', 'https://seniorfuturemembership.netlify.app/'],
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
