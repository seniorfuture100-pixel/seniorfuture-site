// 묶음 기본 동작 확인(10/26, 운영 사이트에 접속하지 않음): node tools/check/smoke.js
// 아임웹 화면 뼈대(헤더·섹션·게시판·푸터)를 흉내 낸 빈 페이지에 dist/sf.min.css·js 를 넣고 휴대폰·태블릿·PC 너비로 열어
//  - 꾸밈 코드가 오류 없이 끝까지 실행되는지(SFUI 가 생기고 부품이 등록되는지)
//  - 가로로 넘치지 않는지
// 를 봐요. 실제 화면 모양 점검은 tools/check/check.js(저장 전)·daily.js(매일)가 맡아요.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const js = fs.readFileSync(path.join(root, 'dist/sf.min.js'), 'utf8'), css = fs.readFileSync(path.join(root, 'dist/sf.min.css'), 'utf8');
const PATHS = ['/', '/course', '/insight', '/review', '/course/', '/shop_mypage'];
const html = p => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>history.replaceState(null,'',${JSON.stringify(p)});window.MEMBER_HASH='';</script><style>.inside{padding:0 16px}</style><style id="sf-css">${css}</style></head>
<body><div id="doz_header_wrap"><header class="doz_header"><a href="/">시니어퓨처</a></header></div>
<div class="section_wrap"><div class="inside"><h1>시험</h1><div data-widget-type="board"><div class="list-style type_grid"><div class="_card_wrap"><div class="_post_item_wrap"><a class="post_link_wrap" href="/review/?bmode=view&idx=1"><span class="title">글</span></a></div></div></div></div></div></div>
<div id="doz_footer_wrap"><footer>푸터</footer></div><script>${js}</script></body></html>`;
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}), bad = [];  // 내 컴퓨터: PW_CHANNEL=chrome
  for (const [w, h] of [[390, 844], [768, 1024], [1280, 860]]) {
    for (const p of PATHS) {
      const ctx = await br.newContext({ viewport: { width: w, height: h }, locale: 'ko-KR' }), page = await ctx.newPage(), errs = [];
      // (뼈대의 .inside 좌우 여백은 아임웹과 같게 — 게시판 격자가 음수 여백을 써요)
      // 바깥 주소(아임웹·CDN)는 막아요 — 이 확인은 묶음만 봐요
      await page.route(/^https?:/, r => r.request().url().startsWith('http://sf.test') ? r.continue() : r.abort());
      page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      await page.route('http://sf.test/**', r => r.fulfill({ contentType: 'text/html', body: html(p) }));
      await page.goto('http://sf.test' + p, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => ({ sfui: !!window.SFUI, wide: document.documentElement.scrollWidth - innerWidth }));
      const tag = p + ' @' + w, q = [];
      if (!r.sfui) q.push('SFUI 없음');
      if (r.wide > 2) q.push('가로 넘침 ' + r.wide + 'px');
      if (p === '/shop_mypage') {
        const mobile = await page.evaluate(() => {
          const box = document.createElement('div'); box.setAttribute('data-sf-rooms', '');
          box.innerHTML = '<ul class="sf-rooms"><li class="sf-room-card" data-ty="live"><div class="sf-room-meta"><small>무료 라이브</small><span class="sf-badge">신청 완료</span></div><h2>시험 강의</h2><p class="sf-room-when">일시 <em>D-6</em><b>11월 12일 (목) 19:30</b></p></li><li class="sf-room-card is-pending" data-ty="course"><div class="sf-room-meta"><small>교육</small><span class="sf-badge">입금 대기</span></div><h2>입금 대기 시험</h2></li></ul>';
          const unreadable = document.createElement('li');
          unreadable.className = 'sf-room-card';
          unreadable.innerHTML = '<h2>구매한 교육</h2><p class="sf-room-when">교육 정보를 불러오지 못했어요.</p><span class="r3-ord__go">강의실 준비 중</span>';
          box.querySelector('ul').appendChild(unreadable);
          document.body.appendChild(box); SFUI.roomTidy(box, [], []);
          const badges = box.querySelectorAll('.sf-room-meta .sf-badge'), when = box.querySelector('.sf-room-when');
          const order = document.createElement('div'); order.className = 'sf-oc';
          order.innerHTML = '<div class="sf-oc__top">결제 완료</div><div class="sf-oc__body"><span class="sf-oc__th"></span><div class="sf-oc__tx"><strong>시니어 산업의 사업 기회를 이해하는 아주 긴 시험 상품명</strong><p class="sf-oc__sum"><b>150,000원</b><span>무통장입금</span></p></div></div><div class="sf-oc__bank">입금 안내</div><div class="sf-oc__act"><a class="sf-oc__btn">주문 상세</a></div>';
          document.body.appendChild(order);
          if (unreadable.classList.contains('is-end') || !unreadable.querySelector('.r3-ord__go') || !box.querySelector('ul.sf-rooms').contains(unreadable)) throw Error('상세 로딩 실패가 종료로 분류됨');
          const result = { doneHidden: getComputedStyle(badges[0]).display === 'none', waitingVisible: getComputedStyle(badges[1]).display !== 'none', matchingSize: getComputedStyle(badges[1]).fontSize === getComputedStyle(badges[1].previousElementSibling).fontSize, dateBeforeDday: when.textContent.indexOf('19:30') < when.textContent.indexOf('D-6'), actionBelow: order.querySelector('.sf-oc__act').getBoundingClientRect().top >= order.querySelector('.sf-oc__bank').getBoundingClientRect().bottom, actionRow: getComputedStyle(order.querySelector('.sf-oc__act')).gridRowStart };
          order.remove(); box.remove(); return result;
        });
        if (!mobile.dateBeforeDday || !mobile.waitingVisible) q.push('강의실 날짜 순서/입금 대기 상태 회귀');
        if (w < 768 && (!mobile.doneHidden || !mobile.matchingSize || !mobile.actionBelow)) q.push('모바일 상태칩 크기/중복 상태/주문 상세 하단 배치 실패: ' + JSON.stringify(mobile));
        if (w >= 768 && (mobile.doneHidden || mobile.actionRow !== '2')) q.push('PC 배치 변경');
      }

      errs.forEach(e => q.push('오류: ' + e));
      console.log((q.length ? '✗ ' : '✓ ') + tag + (q.length ? ' — ' + q.join(' / ') : ''));
      if (q.length) bad.push(tag);
      await ctx.close();
    }
  }
  await br.close();
  console.log(bad.length ? '문제 ' + bad.length + '곳' : '✓ 모두 정상');
  process.exit(bad.length ? 1 : 0);
})();
