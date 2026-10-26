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
