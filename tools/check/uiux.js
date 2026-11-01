// (11/2) UI/UX·문구 전수 수집: node tools/check/uiux.js [출력폴더]
// 손님 눈(로그인 안 함)으로 화면마다 휴대폰 390 / PC 1280 을 끝까지 내려 본 뒤 모아요(사이트는 안 바꿈).
//  copy: 화면 문구(헤더·푸터 뺀 본문 innerText) / tabs: 탭을 하나씩 눌렀을 때 바뀐 문구
//  type: 글자 크기·굵기·줄간격 조합별 개수 / btn: 버튼 높이·모서리·배경 / card: 카드 모서리·그림자 / input: 입력칸 높이·테두리
//  gaps: 본문 섹션 사이 빈칸 / small: 14px 미만 글자 / tap: 휴대폰 44px 미만 누르는 곳 / dead: href 없는(또는 #) 링크
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const SITE = process.env.SITE_URL || 'https://seniorfuture.imweb.me';
const PAGES = (process.env.PAGES ? process.env.PAGES.split(',') : null) || ['/', '/course', '/live', '/insight', '/community', '/business', '/about', '/partner', '/partners', '/experts', '/help', '/review', '/search', '/login', '/site_join_type_choice',
  '/shop_view/?idx=82', '/shop_view/?idx=83', '/shop_view/?idx=84', '/shop_view/?idx=85', '/insight/?bmode=view&idx=175163304', '/terms'];
const out = path.resolve(process.argv[2] || 'report/uiux'); fs.mkdirSync(out, { recursive: true });
const collect = () => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const skip = e => e.closest('#doz_header_wrap, #doz_footer_wrap, .sf-mh, .sf-tabbar, .sf-hd, header, footer, script, style, noscript');
  const own = e => [].some.call(e.childNodes, n => n.nodeType === 3 && n.nodeValue.trim());
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList[0] ? '.' + e.classList[0] : '');
  const all = [].filter.call(document.querySelectorAll('body *'), e => !skip(e) && vis(e));
  const cnt = (m, k, ex) => { m[k] = m[k] || { n: 0, ex: [] }; m[k].n++; if (m[k].ex.length < 3 && ex) m[k].ex.push(ex); };
  const type = {}, btn = {}, card = {}, input = {}, small = [], tap = [], dead = [];
  all.forEach(e => {
    const s = getComputedStyle(e), t = own(e) ? e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) : '';
    if (t) { cnt(type, s.fontSize + '/' + s.fontWeight + '/' + s.lineHeight, t); if (parseFloat(s.fontSize) < 14) small.push(parseFloat(s.fontSize) + 'px ' + nm(e) + ' ' + t); }
    const r = e.getBoundingClientRect();
    if (e.matches('a, button, [role=button], input[type=submit]') && r.height >= 20) {
      const bg = s.backgroundColor, filled = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      if (filled || parseFloat(s.borderTopWidth) > 0) cnt(btn, Math.round(r.height) + 'h r' + s.borderTopLeftRadius + ' ' + bg + ' ' + s.fontSize, e.textContent.trim().slice(0, 20));
      if (innerWidth < 768 && (r.height < 44 || r.width < 44) && e.textContent.trim()) tap.push(Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + e.textContent.trim().slice(0, 20));
      if (e.tagName === 'A' && (!e.getAttribute('href') || /^#?$|^javascript:;?$/.test(e.getAttribute('href'))) && !e.onclick && e.textContent.trim()) dead.push(nm(e) + ' ' + e.textContent.trim().slice(0, 20));
    }
    if (e.matches('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea')) cnt(input, Math.round(r.height) + 'h r' + s.borderTopLeftRadius + ' b' + s.borderTopWidth + ' ' + s.borderTopColor + ' ' + s.fontSize, e.placeholder || e.name);
    if ((s.boxShadow !== 'none' || (parseFloat(s.borderTopLeftRadius) >= 8 && parseFloat(s.borderTopWidth) > 0)) && r.width > 120 && r.height > 80) cnt(card, 'r' + s.borderTopLeftRadius + ' ' + (s.boxShadow === 'none' ? 'b' + s.borderTopWidth + ' ' + s.borderTopColor : s.boxShadow.slice(0, 50)), nm(e));
  });
  // 섹션 사이 빈칸: 본문 안 '블록 덩어리' — 너비 60% 이상이고 높이 40 이상인 최상위 덩어리들의 세로 간격
  const W = innerWidth, blocks = all.filter(e => { const r = e.getBoundingClientRect(); return r.width > W * 0.6 && r.height > 40 && !e.parentElement.closest('*') === false; })
    .filter(e => { const p = e.parentElement; const pr = p && p.getBoundingClientRect(); return !(p && pr.width > W * 0.6 && Math.abs(pr.height - e.getBoundingClientRect().height) < 2); });
  const tops = [];
  [].forEach.call(document.querySelectorAll('.doz_row, section, .sf-sec, [class*=section]'), e => { if (!skip(e) && vis(e)) { const r = e.getBoundingClientRect(); if (r.height > 40 && r.width > W * 0.6) tops.push([r.top + scrollY, r.bottom + scrollY, nm(e)]); } });
  tops.sort((a, b) => a[0] - b[0]);
  // 화면에 보이는 '내용'(글자·그림) 위아래 끝으로 덩어리 사이 실제 빈칸
  const ink = all.filter(e => (own(e) || e.tagName === 'IMG') ).map(e => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; }).sort((a, b) => a[0] - b[0]);
  const gaps = []; let end = ink.length ? ink[0][1] : 0;
  ink.forEach(([t, b]) => { if (t - end > (W < 768 ? 72 : 120)) gaps.push(Math.round(end) + '→' + Math.round(t) + ' (' + Math.round(t - end) + 'px)'); end = Math.max(end, b); });
  const main = document.querySelector('#doz_body, main, body');
  const txt = [].filter.call(main.querySelectorAll('*'), e => !skip(e) && vis(e) && own(e)).map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter((t, i, a) => t && a.indexOf(t) === i);
  return { h: document.documentElement.scrollHeight, copy: txt, type, btn, card, input, small: small.slice(0, 40), tap: tap.slice(0, 40), dead: dead.slice(0, 30), gaps, sec: tops.length };
};
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}), all = {};
  for (const [w, h, mobile] of [[390, 844, true], [1280, 860, false]].filter(x => (process.env.WIDTHS || '390,1280').split(',').map(Number).includes(x[0]))) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
    for (const url of PAGES) {
      const page = await ctx.newPage(), errs = [];
      page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      await new Promise(z => setTimeout(z, 3500));
      let st = 0; const t0 = Date.now();
      try { const r = await page.goto(SITE + url, { waitUntil: 'load', timeout: 60000 }); st = r ? r.status() : 0; } catch (e) { errs.push('열기 실패 ' + String(e.message).slice(0, 80)); }
      if (st === 429) { await new Promise(z => setTimeout(z, 60000)); try { const r = await page.goto(SITE + url, { waitUntil: 'load', timeout: 60000 }); st = r ? r.status() : 0; } catch (e) {} }
      const load = Date.now() - t0;
      await page.waitForTimeout(2000);
      // 끝까지 천천히 내리기(늦게 붙는 칸까지)
      for (let i = 0; i < 40; i++) { const done = await page.evaluate(() => { scrollTo({ top: scrollY + innerHeight * 0.9, behavior: 'instant' }); return scrollY + innerHeight >= document.documentElement.scrollHeight - 4; }); await page.waitForTimeout(350); if (done) break; }
      await page.waitForTimeout(1500); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
      const key = url + ' @' + w; let r = {};
      try { r = await page.evaluate(collect); } catch (e) { r = { err: String(e).slice(0, 200) }; }
      // 탭: role=tab 또는 이름에 tab 들어간 줄 안 버튼·링크(주소 바뀌지 않는 것만) 하나씩 눌러 바뀐 문구
      r.tabs = [];
      try {
        const tabs = await page.$$('[role=tab], [class*=tab] > button, [class*=tab] > li > button, [class*=tab] > li > a[href^="#"], [class*=Tab] button, .sf-chip, [class*=chip]');
        for (const t of tabs.slice(0, 14)) {
          const label = (await t.innerText().catch(() => '')).trim().slice(0, 20); if (!label || !(await t.isVisible().catch(() => false))) continue;
          const before = page.url(); await t.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(900);
          if (page.url().split('#')[0] !== before.split('#')[0]) { r.tabs.push(label + ' → 이동 ' + page.url().replace(SITE, '')); await page.goBack().catch(() => {}); await page.waitForTimeout(1500); continue; }
          const c = await page.evaluate(collect).catch(() => ({ copy: [] }));
          r.tabs.push(label + ' : ' + c.copy.filter(x => !r.copy.includes(x)).slice(0, 25).join(' | '));
        }
      } catch (e) { r.tabs.push('탭 오류 ' + String(e).slice(0, 80)); }
      r.st = st; r.load = load; r.errs = errs;
      await page.screenshot({ path: path.join(out, (url.replace(/[^\w]+/g, '_') || 'home') + '@' + w + '.png'), fullPage: true }).catch(() => {});
      all[key] = r; fs.writeFileSync(path.join(out, 'uiux.json'), JSON.stringify(all, null, 1));
      console.log(key, st, load + 'ms', (r.copy || []).length + '줄');
      await page.close();
    }
    await ctx.close();
  }
  await br.close();
})();
