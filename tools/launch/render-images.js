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
