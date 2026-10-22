// 매일 공개 사이트 점검(깃허브 Actions 에서 실행): node tools/check/daily.js
// 로그인 안 한 손님 눈으로 화면마다 휴대폰(390)·PC(1280) 크기로 열어 봐요.
//  - 페이지가 열리는지(아직 공개 안 한 화면은 '공개 전'으로만 적고 실패로 치지 않음)
//  - 꾸밈 코드(sf.min.js·sf.min.css)가 실제로 읽혔는지, 꾸밈 코드에서 오류가 났는지
//  - 헤더·푸터가 있는지, 가로로 넘치는지, 휴대폰 하단 탭바가 보이는지
// 결과: report/report.md (+ 화면 사진). 문제가 하나라도 있으면 실패로 끝나 이슈가 열려요.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const SITE = process.env.SITE_URL || 'https://seniorfuture.imweb.me';
const PAGES = [['홈', '/'], ['교육', '/course'], ['무료 라이브', '/live'], ['인사이트', '/insight'], ['커뮤니티', '/community'], ['기업·기관', '/business'],
  ['소개', '/about'], ['파트너 지원', '/partner'], ['파트너', '/partners'], ['전문가', '/experts'], ['고객센터', '/help'], ['수강평', '/review'],
  ['검색', '/search'], ['로그인', '/login'], ['회원가입', '/site_join_type_choice']];
const out = path.resolve('report'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const br = await chromium.launch(), rows = [], bad = [];
  for (const [w, h, mobile] of [[390, 844, true], [1280, 860, false]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
    for (const [name, url] of PAGES) {
      const page = await ctx.newPage(), errs = [];
      page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
      page.on('console', m => { if (m.type() === 'error' && /\[sf-|SFUI|sf\.min/.test(m.text())) errs.push(m.text().slice(0, 160)); });
      let st = 0;
      try { const r = await page.goto(SITE + url, { waitUntil: 'load', timeout: 45000 }); st = r ? r.status() : 0; await page.waitForTimeout(2500); } catch (e) { errs.push('열기 실패 ' + String(e.message).slice(0, 80)); }
      const tag = name + ' @' + w;
      if (st === 404) { rows.push([tag, '공개 전(404)', '']); await page.close(); continue; }
      const r = await page.evaluate(m => {
        const H = document.documentElement, q = s => document.querySelector(s), vis = e => !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
        return {
          sfui: !!window.SFUI, css: !!q('#sf-css, style#sf-ui-css'), hd: H.classList.contains('sf-hd-on') || vis(q('.sf-mh')),
          ft: vis(q('#doz_footer_wrap')), wide: H.scrollWidth - innerWidth, tab: !m || vis(q('.sf-tabbar'))
        };
      }, mobile).catch(e => ({ err: String(e) }));
      const p = [];
      if (st && st >= 400) p.push('응답 ' + st);
      if (r.err) p.push(r.err);
      if (!r.sfui) p.push('꾸밈 JS 안 읽힘');
      if (!r.css) p.push('꾸밈 CSS 없음');
      if (!r.hd) p.push('헤더 꾸밈 없음');
      if (!r.ft) p.push('푸터 없음');
      if (r.wide > 2) p.push('가로 넘침 ' + r.wide + 'px');
      if (!r.tab) p.push('하단 탭바 없음');
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
  const md = '# 사이트 매일 점검 ' + new Date().toISOString().slice(0, 10) + '\n\n' + (bad.length ? '**문제 ' + bad.length + '곳** — ' + bad.join(', ') : '**모두 정상**') +
    '\n\n| 화면 | 결과 |\n|---|---|\n' + rows.map(r => '| ' + r[0] + ' | ' + r[1] + ' |').join('\n') + '\n\n화면 사진은 Actions 실행 결과의 daily-report 에 있어요.\n';
  fs.writeFileSync(path.join(out, 'report.md'), md);
  console.log(md);
  process.exit(bad.length ? 1 : 0);
})();
