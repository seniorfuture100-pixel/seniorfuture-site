// (11/2) 화면을 위에서 아래까지 한 화면씩 찍기(휴대폰 에뮬레이션은 전체 페이지 찍기가 흰 화면이 돼서): node tools/check/shots.js 폴더 [390|1280]
// PAGES=/,/course 처럼 일부만. 파일: <주소>@<너비>-<순번>.png
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const SITE = process.env.SITE_URL || 'https://seniorfuture.imweb.me';
const out = path.resolve(process.argv[2] || 'report/shots'), W = +(process.argv[3] || 390); fs.mkdirSync(out, { recursive: true });
const PAGES = (process.env.PAGES || '/,/course,/live,/insight,/community,/business,/about,/partner,/partners,/experts,/help,/review,/search,/login,/site_join_type_choice,/shop_view/?idx=82,/shop_view/?idx=83,/shop_view/?idx=84,/shop_view/?idx=85,/insight/?bmode=view&idx=175163304,/terms').split(',');
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const mob = W < 768, ctx = await br.newContext({ viewport: { width: W, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob, locale: 'ko-KR' });
  for (const url of PAGES) {
    const page = await ctx.newPage(); await new Promise(z => setTimeout(z, 3000));
    try { await page.goto(SITE + url, { waitUntil: 'load', timeout: 60000 }); } catch (e) { console.log(url, 'fail'); await page.close(); continue; }
    await page.waitForTimeout(2500);
    const base = (url.replace(/[^\w]+/g, '_') || 'home') + '@' + W;
    for (let i = 0; i < (+process.env.MAX || 30); i++) {
      await page.screenshot({ path: path.join(out, base + '-' + String(i).padStart(2, '0') + '.png') });
      // html 에 scroll-behavior:smooth 가 걸려 있어 바로 안 움직여요 → instant 로 내림
      const done = await page.evaluate(() => { const y = scrollY; scrollTo({ top: y + innerHeight * 0.92, behavior: 'instant' }); return scrollY === y; });
      if (done) break; await page.waitForTimeout(700);
    }
    console.log(url); await page.close();
  }
  await br.close();
})();
