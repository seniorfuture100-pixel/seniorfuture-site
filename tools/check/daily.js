// 매일 공개 사이트 점검(깃허브 Actions 에서 실행): node tools/check/daily.js
// 로그인 안 한 손님 눈으로 화면마다 휴대폰(390)·태블릿(768)·PC(1280) 크기로 열어 봐요.
//  - 페이지가 열리는지(아직 공개 안 한 화면은 '공개 전'으로만 적고 실패로 치지 않음)
//  - 꾸밈 코드(sf.min.js·sf.min.css)가 실제로 읽혔는지, 꾸밈 코드에서 오류가 났는지
//  - 헤더·푸터가 있는지, 가로로 넘치는지, 휴대폰 하단 탭바가 보이는지
// 결과: report/report.md (+ 화면 사진). 문제가 하나라도 있으면 실패로 끝나 이슈가 열려요.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const SITE = process.env.SITE_URL || 'https://seniorfuture.imweb.me';
const PAGES = [['홈', '/'], ['교육', '/course'], ['무료 라이브', '/live'], ['인사이트', '/insight'], ['커뮤니티', '/community'], ['기업·기관', '/business'],
  ['소개', '/about'], ['파트너 지원', '/partner'], ['파트너', '/partners'], ['전문가', '/experts'], ['고객센터', '/help'], ['수강평', '/review'],
  ['검색', '/search'], ['로그인', '/login'], ['회원가입', '/site_join_type_choice'],
  // (11/1) 상품 상세 — 교육·옵션 마감·모임(/shop_view)·무료 라이브·분야 상품 / 인사이트 글
  ['상품 교육 82', '/shop_view/?idx=82'], ['상품 옵션마감 94', '/shop_view/?idx=94'], ['상품 모임 97', '/shop_view/?idx=97'],
  ['상품 라이브 99', '/shop_view/?idx=99'], ['상품 분야 102', '/shop_view/?idx=102'], ['인사이트 글', '/insight/?bmode=view&idx=175163304']];
// (11/1) 상품 상세만 더 보는 것: 신청 버튼, 구조화 데이터(#sf-ld), 숨긴 칸 주소가 화면에 안 보임, 꾸민 뒤 첫 그림
async function productChecks(page) {
  return page.evaluate(() => {
    const p = [], vis = e => !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
    if (![].some.call(document.querySelectorAll('.buy_btns ._btn_buy, .buy_btns .buy, .buy_btns a.btn'), vis)) p.push('신청 버튼 안 보임');
    if (!document.getElementById('sf-ld')) p.push('구조화 데이터 없음');
    if (/open\.kakao\.com|zoom\.us\/j|youtube\.com\/watch|vimeo\.com\/\d/.test(document.body.innerText)) p.push('숨긴 칸 주소가 화면에 보임');
    const f = performance.getEntriesByName('first-contentful-paint')[0], e = performance.getEntriesByName('sf-early-init')[0];
    if (f && e && f.startTime < e.startTime - 50) p.push('꾸미기 전에 그려짐(' + Math.round(e.startTime - f.startTime) + 'ms)');
    return p;
  }).catch(e => ['상품 검사 실패 ' + String(e).slice(0, 60)]);
}
const out = path.resolve('report'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}), rows = [], bad = [];
  // WIDTHS=1280 처럼 일부 너비만(내 컴퓨터에서 다시 볼 때). IPHONE=0 이면 아이폰 점검 건너뜀
  const WIDTHS = (process.env.WIDTHS || '390,768,1280').split(',').map(Number);
  for (const [w, h, mobile] of [[390, 844, true], [768, 1024, true], [1280, 860, false]].filter(x => WIDTHS.includes(x[0]))) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
    for (const [name, url] of PAGES) {
      const page = await ctx.newPage(), errs = [];
      page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      page.on('console', m => { if (m.type() === 'error' && /\[sf-|SFUI|sf\.min/.test(m.text())) errs.push(m.text().slice(0, 160)); });
      let st = 0;
      // (11/1) 아임웹은 같은 주소에서 페이지를 몰아 열면 429(요청 과다)로 몇 분 막아요 → 4초 간격, 429면 1분 쉬고 한 번 더, 그래도면 '건너뜀'(실패 아님)
      const open = async () => { await new Promise(z => setTimeout(z, 4000)); const r = await page.goto(SITE + url, { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(2500); return r ? r.status() : 0; };
      try { st = await open(); if (st === 429) { await new Promise(z => setTimeout(z, 60000)); st = await open(); } } catch (e) { errs.push('열기 실패 ' + String(e.message).slice(0, 80)); }
      const tag = name + ' @' + w;
      if (st === 404) { rows.push([tag, '공개 전(404)', '']); await page.close(); continue; }
      if (st === 429) { rows.push([tag, '⏭ 건너뜀(아임웹 요청 과다 429)', '']); await page.close(); continue; }
      const r = await page.evaluate(m => {
        const H = document.documentElement, q = s => document.querySelector(s), vis = e => !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
        return {
          sfui: !!window.SFUI, css: !!q('#sf-css, style#sf-ui-css'), hd: H.classList.contains('sf-hd-on') || vis(q('.sf-mh')),
          ft: vis(q('#doz_footer_wrap')), wide: H.scrollWidth - innerWidth, tab: !m || H.classList.contains('sf-auth-on') || vis(q('.sf-tabbar'))  // 로그인·가입 화면은 일부러 탭바를 숨김
        };
      }, w < 768 && !/^\/shop_view/.test(url)).catch(e => ({ err: String(e) }));  // 하단 탭바는 767px 이하에서만(태블릿은 헤더 메뉴) · 상품 상세는 탭바 대신 신청 버튼 줄(설계)
      const p = [];
      if (st && st >= 400) p.push('응답 ' + st);
      if (r.err) p.push(r.err);
      if (!r.sfui) p.push('꾸밈 JS 안 읽힘');
      if (!r.css) p.push('꾸밈 CSS 없음');
      if (!r.hd) p.push('헤더 꾸밈 없음');
      if (!r.ft) p.push('푸터 없음');
      if (r.wide > 2) p.push('가로 넘침 ' + r.wide + 'px');
      if (!r.tab) p.push('하단 탭바 없음');
      if (/idx=/.test(url) && /^\/shop_view/.test(url)) (await productChecks(page)).forEach(x => p.push(x));
      errs.forEach(e => p.push('오류: ' + e));
      const shot = tag.replace(/[^\w가-힣@]+/g, '_') + '.png';
      await page.screenshot({ path: path.join(out, shot) }).catch(() => {});
      rows.push([tag, p.length ? '❌ ' + p.join(' / ') : '✅', shot]);
      if (p.length) bad.push(tag);
      await page.close();
    }
    await ctx.close();
  }
  await br.close();
  // (11/1) 아이폰(사파리 엔진 WebKit, 실제 아이폰 정보) — 아임웹은 휴대폰 정보로 접속하면 휴대폰용 화면을 보내요. 상품 상세 3곳
  if (process.env.IPHONE !== '0') try {
    const { webkit, devices } = require('playwright'), wb = await webkit.launch();
    const wctx = await wb.newContext(Object.assign({}, devices['iPhone 13'], { locale: 'ko-KR' }));
    for (const [name, url] of [['상품 교육 82', '/shop_view/?idx=82'], ['상품 모임 97', '/shop_view/?idx=97'], ['상품 라이브 99', '/shop_view/?idx=99']]) {
      const page = await wctx.newPage(), errs = []; page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      let st = 0;
      const open = async () => { await new Promise(z => setTimeout(z, 4000)); const r = await page.goto(SITE + url, { waitUntil: 'load', timeout: 45000 }); await page.waitForTimeout(2500); return r ? r.status() : 0; };
      try { st = await open(); if (st === 429) { await new Promise(z => setTimeout(z, 60000)); st = await open(); } } catch (e) { errs.push('열기 실패'); }
      if (st === 429) { rows.push([name + ' @iPhone', '⏭ 건너뜀(아임웹 요청 과다 429)', '']); await page.close(); continue; }
      const p = await productChecks(page);
      const r = await page.evaluate(() => ({ sfui: !!window.SFUI, wide: document.documentElement.scrollWidth - innerWidth })).catch(() => ({}));
      if (!r.sfui) p.push('꾸밈 JS 안 읽힘'); if (r.wide > 2) p.push('가로 넘침 ' + r.wide + 'px');
      errs.forEach(e => p.push('오류: ' + e));
      const tag = name + ' @iPhone', shot = tag.replace(/[^\w가-힣@]+/g, '_') + '.png';
      await page.screenshot({ path: path.join(out, shot) }).catch(() => {});
      rows.push([tag, p.length ? '❌ ' + p.join(' / ') : '✅', shot]); if (p.length) bad.push(tag);
      await page.close();
    }
    await wb.close();
  } catch (e) { rows.push(['아이폰(WebKit)', '⏭ 건너뜀: ' + String(e.message).slice(0, 80), '']); }
  const md = '# 사이트 매일 점검 ' + new Date().toISOString().slice(0, 10) + '\n\n' + (bad.length ? '**문제 ' + bad.length + '곳** — ' + bad.join(', ') : '**모두 정상**') +
    '\n\n| 화면 | 결과 |\n|---|---|\n' + rows.map(r => '| ' + r[0] + ' | ' + r[1] + ' |').join('\n') + '\n\n화면 사진은 Actions 실행 결과의 daily-report 에 있어요.\n';
  fs.writeFileSync(path.join(out, 'report.md'), md);
  console.log(md);
  process.exit(bad.length ? 1 : 0);
})();
