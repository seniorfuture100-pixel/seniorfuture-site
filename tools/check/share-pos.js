// 상품 화면 공유 아이콘 위치 점검 — PC 1280 / 휴대폰 390 에서 보이는 공유 단추의 자리·크기와 제목·배지 줄을 재고 캡처
//   PW_CHANNEL=chrome node tools/check/share-pos.js [/course/?idx=82 ...]   → 결과 표 + tools/check/out/share-*.png
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['/course/?idx=82', '/live/?idx=84', '/shop_view/?idx=103'];
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const VIEWS = [{ name: 'pc', viewport: { width: 1280, height: 900 } }, { name: 'm', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false }];

(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (const v of VIEWS) for (const p of PAGES) {
    const ctx = await br.newContext({ viewport: v.viewport, hasTouch: !!v.hasTouch, isMobile: !!v.isMobile });
    const pg = await ctx.newPage();
    if (process.env.STAGE) { // 시험 모드: STAGE=v1.0.xxx 로 그 버전의 stage-loader 를 넣고 열어요
      const code = await (await fetch(`https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@${process.env.STAGE}/site/dist/stage-loader.txt`)).text();
      await pg.addInitScript(c => { try { sessionStorage.setItem('sf_stage', '1'); sessionStorage.setItem('sf_stage_code', c); } catch (e) {} }, code);
    }
    await pg.goto('https://seniorfuture.kr' + p, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(3500);
    const m = await pg.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(innerWidth - r.right) }; };
      const btn = [...document.querySelectorAll('[onclick*="showDefalutSnsShareList"]')].find(b => b.getBoundingClientRect().width > 0);
      if (!btn) return { none: true };
      const vis = s => [...document.querySelectorAll(s)].find(e => e.getBoundingClientRect().width > 0);
      const title = vis('.sf-pv .goods_form header .view_tit');
      const badges = vis('.sf-pv .sf-pv-badges, .sf-pv [class*=badge]');
      const card = btn.closest('[class*=sf-pv-buy], [class*=sf-pv-side], [class*=sf-pv-head], [class*=sf-pv-sum], aside') || btn.parentElement.parentElement;
      const cs = getComputedStyle(btn), wr = getComputedStyle(btn.parentElement);
      return { btn: R(btn), wrap: btn.parentElement.className, wrapPos: wr.position, btnPos: cs.position + ' top:' + cs.top + ' right:' + cs.right, card: (card.className || '').toString().slice(0, 50), cardR: R(card), title: title && { cls: title.className.slice(0, 30), ...R(title) }, badges: badges && { cls: badges.className.slice(0, 30), ...R(badges) } };
    });
    console.log(`\n[${v.name}] ${p}\n` + JSON.stringify(m));
    if (!m.none) {
      const y = Math.max(0, m.btn.y - 120);
      await pg.screenshot({ path: path.join(OUT, `share-${v.name}-${p.replace(/\W+/g, '')}.png`), clip: { x: 0, y, width: v.viewport.width, height: 360 }, fullPage: true });
    }
    await ctx.close();
  }
  await br.close();
})();
