// 원본: src/site-header.js
/* site-header.js — 아임웹 기본 헤더 위에 Figma 헤더를 덧입혀요 (공통 코드, 모든 페이지)
   Figma: TopBanner · Header/PC · Header/Mobile · NavDropdown/Education · Mobile/전체 메뉴 · BottomTabBar · FloatingButton · PC/검색 - 입력 중
   - 아임웹 로그인·장바구니·검색 기능은 그대로 쓰고 모양과 위치만 바꿔요.
   - 설정(공통 코드에서 이 코드보다 위):
     window.SF_SITE = {
       kakao: 'http://pf.kakao.com/_xxxx/chat',             // 카톡 상담 링크
       topbanner: { key: '2026-11-open', text: '…', href: '/course' },   // false 면 띠배너 없음. key를 바꾸면 닫은 사람에게도 다시 보여요
       popular: ['장기요양 평가', '시니어 창업', …]           // 검색창 '지금 많이 찾는 검색어'
     } */
// (10/31 사장님) 이름은 '&' 대신 '/' · AI/AX 분야 추가(상품 요약 설명에 #AI 또는 #AX 꼬리표)
SFUI.cats = [
  ['intro', '시니어 산업 이해'], ['care', '요양/돌봄'], ['housing', '주거/시니어타운'], ['finance', '금융/보험'],
  ['commerce', '소비/커머스'], ['health', '헬스케어/에이지테크'], ['life', '여가/교육/일'], ['startup', '창업/사업개발'], ['ai', 'AI/AX']
]
