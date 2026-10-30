// 런칭 점검용 상품 이미지(썸네일 16:9 · 상세 세로 이미지)를 HTML로 그려 PNG로 저장해요: node tools/launch/render-images.js
//   결과: assets/products/launch/*.png (GitHub Pages 로 열려요) · 사진 = 전문가 게시판 사진(아임웹 CDN)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'assets', 'products', 'launch');
const PHOTO = {
  kts: 'https://cdn.imweb.me/thumbnail/20261027/ca2a9f90f5578.jpg', // 김태성 케어링 대표
  chh: 'https://cdn.imweb.me/thumbnail/20261027/340b87e6686c9.jpg', // 최학희 시니어라이프비즈니스 대표
  pjb: 'https://cdn.imweb.me/thumbnail/20261027/0e96f4c514447.jpg', // 박재병 케어닥 대표
  lhs: 'https://cdn.imweb.me/thumbnail/20261027/5668efd1eb8d6.jpg'  // 이한선 MYSC
};
const FONT = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">';
const BASE = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:Pretendard,sans-serif;-webkit-font-smoothing:antialiased;word-break:keep-all}`;

// 썸네일: 왼쪽 글(꼬리표·제목·강사) + 오른쪽 인물 사진
const thumb = o => `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${BASE}
.t{width:1280px;height:720px;position:relative;overflow:hidden;background:${o.bg};color:${o.fg || '#fff'}}
.ph{position:absolute;right:0;top:0;width:560px;height:720px;background:url('${o.photo}') center 20%/cover}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,${o.bg} 0%,${o.bg}00 45%)}
.tx{position:absolute;left:80px;top:0;bottom:0;width:700px;display:flex;flex-direction:column;justify-content:center;gap:28px}
.tag{align-self:flex-start;background:${o.tagBg || '#ff6f0f'};color:#fff;font-weight:700;font-size:30px;padding:10px 22px;border-radius:10px}
h1{font-size:76px;line-height:1.18;font-weight:800;letter-spacing:-2px}
.by{font-size:30px;font-weight:600;opacity:.85}</style></head><body><div class="t"><div class="ph"></div><div class="tx">
<span class="tag">${o.tag}</span><h1>${o.title}</h1><p class="by">${o.by}</p></div></div></body></html>`;

// 상세 세로 이미지: 큰 제목 + 설명 + (선택) 카드 목록 · 사진
const detail = o => `<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${BASE}
.d{width:860px;background:${o.bg || '#fff'};color:${o.fg || '#191f28'};padding:110px 70px;text-align:center}
.k{color:#ff6f0f;font-weight:700;font-size:28px;margin-bottom:22px}
h2{font-size:58px;line-height:1.3;font-weight:800;letter-spacing:-1.5px}
.s{margin-top:28px;font-size:28px;line-height:1.6;color:${o.sub || '#4e5968'}}
.ph{margin:60px auto 0;width:420px;height:420px;border-radius:50%;background:url('${o.photo || ''}') center 20%/cover;${o.photo ? '' : 'display:none'}}
.nm{margin-top:28px;font-size:34px;font-weight:700}.rl{margin-top:8px;font-size:26px;color:${o.sub || '#4e5968'}}
ul{list-style:none;margin-top:64px;display:grid;gap:22px;text-align:left}
li{background:${o.card || '#f7f8fa'};border-radius:24px;padding:36px 40px}
li b{display:block;font-size:32px;font-weight:700;margin-bottom:10px}li span{font-size:26px;line-height:1.55;color:${o.sub || '#4e5968'}}
.n{display:inline-block;color:#ff6f0f;font-weight:800;margin-right:12px}</style></head><body><div class="d">
<p class="k">${o.kicker}</p><h2>${o.title}</h2>${o.sub2 ? `<p class="s">${o.sub2}</p>` : ''}
<div class="ph"></div>${o.name ? `<p class="nm">${o.name}</p><p class="rl">${o.role}</p>` : ''}
${o.items ? '<ul>' + o.items.map((x, i) => `<li><b><span class="n">${String(i + 1).padStart(2, '0')}</span>${x[0]}</b><span>${x[1]}</span></li>`).join('') + '</ul>' : ''}
</div></body></html>`;

const JOBS = {
  // 1) 교육 · 기수제
  'study12-thumb': thumb({ bg: '#1b2a4a', tag: '12기 모집', title: '시니어 비즈니스<br>실전 4주 스터디', by: '시니어퓨처 · 특강 김태성 케어링 대표', photo: PHOTO.kts }),
  'study12-d1': detail({ bg: '#1b2a4a', fg: '#fff', sub: '#c9d3e6', kicker: '시니어퓨처 12기 비즈니스 스터디', title: '시니어 시장,<br>뉴스로만 보고 계신가요?', sub2: '선도 기업의 수익모델과 고객 전략을 데이터로 해부하고<br>현업 전문가와 직접 토론하는 4주예요.' }),
  'study12-d2': detail({ kicker: '4주 동안 이렇게 배워요', title: '분석하고, 토론하고,<br>내 관점으로 정리해요', items: [
    ['Deep-Dive 기업 분석', '선도 기업의 수익모델·고객 정의·채널 전략·확장 방식을 데이터로 해부해요'],
    ['실무자 인사이트 워크숍', '현업 전문가의 솔루션 스토리와 산업 분석을 듣고 피어러닝으로 토론해요'],
    ['멤버십 혜택 포함', '트렌드 뉴스레터·기업 분석 콘텐츠·웨비나·현장 탐방 우선 참여'],
    ['소수 정예 10명', '토요일 오전 · 공덕역 FRONT1 · 정규 4회 출석 시 수료증']] }),
  'study12-d3': detail({ bg: '#fff5f0', kicker: '3회차 특강', title: 'AI 시대,<br>시니어 산업의 미래와 기회', photo: PHOTO.kts, name: '김태성', role: '케어링 대표' }),
  // 2) 교육 · VOD (회원그룹 이용권 30일)
  'trend-thumb': thumb({ bg: '#0f3d3a', tag: 'VOD · 30일 수강', title: '초고령사회<br>대전환 지도', by: '시니어트렌드 2027 · 최학희 대표', photo: PHOTO.chh }),
  'trend-d1': detail({ bg: '#0f3d3a', fg: '#fff', sub: '#cfe3df', kicker: '시니어트렌드 2027', title: '2027년, 시니어 시장은<br>무엇이 달라질까요?', sub2: '숫자와 사례로 초고령사회의 큰 흐름을 한 번에 정리해요.<br>언제든, 결제일부터 30일 동안 들을 수 있어요.' }),
  'trend-d2': detail({ kicker: '4강으로 정리해요', title: '흐름 → 소비 → 산업 → 기회', items: [
    ['초고령사회, 무엇이 바뀌나', '인구 구조와 가구 변화가 만드는 시장의 크기'],
    ['2027 시니어 소비 트렌드', '새로운 시니어가 돈을 쓰는 곳과 방식'],
    ['돌봄·주거·금융 산업 지도', '분야별 주요 플레이어와 빈자리'],
    ['기회를 잡는 기업의 조건', '바로 적용할 수 있는 체크리스트']] }),
  'trend-d3': detail({ bg: '#f2f7f6', kicker: '강사', title: '초고령사회 대전환 지도', photo: PHOTO.chh, name: '최학희', role: '시니어라이프비즈니스 대표' }),
  // 3) 무료 라이브
  'live-thumb': thumb({ bg: '#ff6f0f', tag: '무료 LIVE', tagBg: '#191f28', title: '시니어 케어 &<br>하우징의 다음 기회', by: '박재병 케어닥 대표 · 11월 19일 (목) 19:30', photo: PHOTO.pjb }),
  'live-d1': detail({ bg: '#fff5f0', kicker: '무료 LIVE · 11월 19일 (목) 19:30', title: '돌봄과 주거,<br>어디서 기회가 열릴까요?', sub2: '시니어 케어 & 하우징 산업의 변화를<br>현장 대표에게 직접 듣고 바로 질문해요.', photo: PHOTO.pjb, name: '박재병', role: '케어닥 대표' }),
  // 4) 커뮤니티
  'meet-thumb': thumb({ bg: '#3b2a6b', tag: '12월 커피챗', title: '시니어 비즈니스<br>커피챗 네트워킹', by: '호스트 이한선 MYSC · 공덕역 FRONT1', photo: PHOTO.lhs }),
  'meet-d1': detail({ bg: '#3b2a6b', fg: '#fff', sub: '#ddd6f0', kicker: '12월 4일 (금) 18:30 · 공덕역 FRONT1', title: '시니어 산업 사람들과<br>한자리에서 만나요', sub2: '투자·창업·현업 실무자가 모여 고민과 기회를 나눠요.<br>이번 호스트는 MYSC 이한선 님이에요.', photo: PHOTO.lhs, name: '이한선', role: 'MYSC · 시니어 비즈니스 투자' })
};

// (10/30) 교육 분야별 예시 8개 — 썸네일 + 상세 3장(문제 제기 · 커리큘럼 · 강사)
const P = id => `https://cdn.imweb.me/thumbnail/20261027/${id}.jpg`;
const COURSES = [
  { k: 'care', bg: '#14304a', tag: '요양 & 돌봄 · LIVE 4주', title: '간병·돌봄 서비스<br>운영 실무', who: '김견원', role: '케어네이션 대표', photo: P('8b7922a92fff6'),
    hook: '돌봄 서비스,<br>어디서 품질이 갈릴까요?', sub: '이용자 여정 · 인력 매칭 · 보호자 소통까지<br>운영 현장의 기준을 4주 동안 정리해요.',
    items: [['돌봄 시장과 이용자 여정', '누가, 언제, 왜 돌봄 서비스를 찾는지'], ['인력 매칭과 품질 관리', '매칭 기준·교육·평가를 어떻게 설계할까'], ['보호자 커뮤니케이션', '불만을 줄이는 안내·응대 흐름'], ['운영 지표와 수익 구조', '반복 이용과 단가를 함께 보는 법']] },
  { k: 'housing', bg: '#2d3a2a', tag: '주거 & 시니어 타운 · LIVE 4회', title: '시니어 주거 사업,<br>기획부터 운영까지', who: '지창대', role: '리브라이블리 대표', photo: P('cff83dd54a855'),
    hook: '시니어 주거,<br>공간보다 서비스가 먼저예요', sub: '입주자 니즈에서 출발해 서비스·운영 모델을<br>설계하는 과정을 사례로 따라가요.',
    items: [['시니어 주거 유형과 시장', '유형별 대상과 가격대 한눈에 보기'], ['입주자 니즈와 서비스 설계', '하루 일과로 보는 필요한 서비스'], ['운영 모델과 수익 구조', '임대·서비스·제휴 수익의 균형'], ['사례로 보는 입지·공간 기획', '입지와 공간이 운영에 주는 영향']] },
  { k: 'finance', bg: '#1f2a44', tag: '금융 & 보험 · VOD 60일', title: '시니어 금융,<br>고객 이해부터 상품까지', who: '이은정', role: '하나은행 본부장', photo: P('ddf8749b5216e'),
    hook: '은퇴 이후의 돈,<br>고객은 무엇을 걱정할까요?', sub: '소득·자산 구조에서 출발해 연금·신탁·보험 상품을<br>고객 눈높이로 정리해요. 결제일부터 60일 수강.',
    items: [['시니어 고객의 소득·자산 구조', '은퇴 전후로 달라지는 돈의 흐름'], ['연금·신탁·보험 상품 지형', '상품별 역할과 고르는 기준'], ['상담과 커뮤니케이션', '신뢰를 얻는 설명 순서'], ['상품 기획 체크리스트', '시니어 고객 관점의 점검표']] },
  { k: 'commerce', bg: '#4a2a1a', tag: '소비 & 커머스 · LIVE 3주', title: '5060 고객을 사로잡는<br>커머스 전략', who: '권정현', role: '더뉴그레이 대표', photo: P('fa995ecf421ca'),
    hook: '5060은 지금<br>무엇을, 어떻게 살까요?', sub: '새로운 5060의 구매 여정과 채널을 이해하고<br>상품·콘텐츠·CS 전략으로 연결해요.',
    items: [['새로운 5060 고객 이해', '취향과 구매 동기를 데이터로'], ['채널과 구매 여정', '검색·커뮤니티·라이브 커머스'], ['상품·콘텐츠·CS 설계', '첫 구매에서 재구매까지']] },
  { k: 'health', bg: '#0f3b45', tag: '헬스케어 & 에이지테크 · LIVE 4주', title: '에이지테크 서비스<br>기획과 현장 실증', who: '김지희', role: '효돌 대표', photo: P('b579d6e422870'),
    hook: '좋은 기술이<br>현장에서 쓰이려면', sub: '돌봄 현장의 문제 정의부터 실증(PoC)·확산까지<br>에이지테크 서비스의 전 과정을 다뤄요.',
    items: [['에이지테크 시장과 문제 정의', '현장의 진짜 문제를 찾는 법'], ['서비스 기획과 사용성', '어르신·보호자·기관 세 사용자'], ['실증(PoC) 설계와 운영', '기관 협업과 성과 지표'], ['확산과 사업화', '공공 사업·B2B·B2C 경로']] },
  { k: 'life', bg: '#3a2d4a', tag: '여가 & 교육 & 일 · VOD 60일', title: '시니어 여가·평생교육<br>프로그램 기획', who: '신승준', role: '대교뉴이프 대표', photo: P('af63fa1934367'),
    hook: '다시 배우고 일하는<br>신중년을 위한 기획', sub: '여가·평생교육·일 프로그램을 기획하고 운영하는 방법을<br>현장 사례로 정리해요. 결제일부터 60일 수강.',
    items: [['신중년 여가·학습 수요', '무엇을 배우고 싶어 할까'], ['프로그램 기획과 커리큘럼', '참여와 지속을 만드는 설계'], ['운영·모집·제휴', '기관·지자체와 함께하는 법']] },
  { k: 'startup', bg: '#1b1b1b', tag: '창업·사업개발 · LIVE 6주', title: '시니어 비즈니스<br>창업 부트캠프', who: '함동수', role: '똑비 대표', photo: P('2700d844b3134'),
    hook: '아이디어에서<br>첫 고객까지, 6주', sub: '시니어 시장의 문제 정의·검증·첫 판매까지<br>매주 과제와 피드백으로 함께 만들어요.',
    items: [['문제 정의와 고객 인터뷰', '누구의 어떤 불편인가'], ['아이템 검증(MVP)', '작게 만들어 빠르게 확인'], ['가격과 판매 채널', '처음 돈을 받는 구조'], ['협업·제휴와 지원사업', '기관·기업과 함께 키우기'], ['발표와 피드백', '전문가 피드백 데모데이']] },
  { k: 'intro', bg: '#22324a', tag: '시니어 산업 이해 · VOD 30일', title: '데이터로 보는<br>새로운 5060 고객', who: '이준호', role: '그레이스케일 대표', photo: P('59fdb92d2d96a'),
    hook: '우리가 아는 시니어,<br>정말 맞을까요?', sub: '인구·소비·라이프스타일 데이터로<br>새로운 5060 고객을 처음부터 이해해요. 결제일부터 30일 수강.',
    items: [['숫자로 보는 5060', '인구·가구·소득의 변화'], ['라이프스타일과 소비', '세대 안의 서로 다른 고객'], ['데이터를 기획에 쓰는 법', '공개 데이터로 시장 읽기']] }
];
COURSES.forEach(c => {
  JOBS[c.k + '-thumb'] = thumb({ bg: c.bg, tag: c.tag, title: c.title, by: c.who + ' ' + c.role, photo: c.photo });
  JOBS[c.k + '-d1'] = detail({ bg: c.bg, fg: '#fff', sub: '#d5dbe6', kicker: c.tag, title: c.hook, sub2: c.sub });
  JOBS[c.k + '-d2'] = detail({ kicker: '이렇게 배워요', title: c.title.replace('<br>', ' '), items: c.items });
  JOBS[c.k + '-d3'] = detail({ bg: '#fff5f0', kicker: '강사', title: c.title, photo: c.photo, name: c.who, role: c.role });
});
const ONLY = process.argv[2] ? new RegExp(process.argv[2]) : null;
if (ONLY) Object.keys(JOBS).forEach(k => ONLY.test(k) || delete JOBS[k]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
  const p = await b.newPage({ deviceScaleFactor: 1 });
  for (const [name, html] of Object.entries(JOBS)) {
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const el = await p.$('body > div');
    await el.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('ok', name);
  }
  await b.close();
})();
