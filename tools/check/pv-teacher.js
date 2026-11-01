// 상품 상세 강사(연사·호스트) 칸 글자 크기 재기 + 캡처: node tools/check/pv-teacher.js 상품번호 [v버전(시험 모드)]
const { chromium } = require('playwright');
const path = require('path');
const [id, ver] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const code = ver ? await (await fetch(`https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@${ver}/site/dist/stage-loader.txt`)).text() : '';
  for (const [w, h] of [[1280, 900], [390, 844]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, locale: 'ko-KR', deviceScaleFactor: w < 500 ? 2 : 1 });
    code && await ctx.addInitScript(c => { try { sessionStorage.setItem('sf_stage', '1'); sessionStorage.setItem('sf_stage_code', c); } catch (e) {} }, code);
    const p = await ctx.newPage();
    await p.goto('https://seniorfuture.imweb.me/shop_view/?idx=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 }); await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const sec = [...document.querySelectorAll('[data-sf-own-g="teacher"]')][0];
      if (!sec) return null;
      const b = sec.querySelector('.sf-pv-tmorebtn'); b && !b.hidden && b.click();
      const pick = sel => { const e = sec.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); return sel + ' ' + s.fontSize + '/' + s.lineHeight + ' w' + s.fontWeight + ' ' + s.color; };
      const body = document.querySelector('[data-sf-own-g="intro"] .sf-pv-ownbody p, .sf-pv-ownbody p');
      const bs = body && getComputedStyle(body);
      return { cls: sec.className, rows: ['.sf-pv-sechead h2', '.sf-pv-tname, .sf-pv-tcard strong, .sf-pv-tcard b', '.sf-pv-trole, .sf-pv-tcard small', '.sf-pv-tone', '.sf-pv-tbio', '.sf-pv-tmore h4', '.sf-pv-tmore li', '.sf-pv-tmore p', '.sf-pv-tmorebtn'].map(pick).filter(Boolean), body: bs ? '본문 p ' + bs.fontSize + '/' + bs.lineHeight + ' ' + bs.color : '', html: sec.querySelector('.sf-pv-tcard') ? sec.querySelector('.sf-pv-tcard').outerHTML.replace(/style="[^"]*"/g, '').slice(0, 700) : '' };
    });
    console.log(`\n■ ${w}px`, JSON.stringify(r, null, 1));
    const el = await p.$('[data-sf-own-g="teacher"]');
    el && await el.screenshot({ path: path.join(__dirname, `pv-teacher-${id}-${w}${ver ? '-' + ver : ''}.png`) });
    await ctx.close();
  }
  await br.close();
})();
