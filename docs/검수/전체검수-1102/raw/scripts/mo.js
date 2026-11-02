// MutationObserver 콜백 횟수(파일별) — 화면 다 그린 뒤 가만히 있는 5초 동안
const { chromium } = require('C:/Users/ghehd/Documents/seniorfuture/seniorfuture-site/node_modules/playwright');
const UA_MO = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
(async () => { const br = await chromium.launch({ channel: 'chrome' });
for (const P of ['/', '/course', '/insight', '/course/?idx=82', '/experts', '/live/?idx=84']) for (const W of [390, 1280]) {
  const ctx = await br.newContext(W < 768 ? { viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true, userAgent: UA_MO } : { viewport: { width: W, height: 900 } });
  await ctx.addInitScript(() => { const O = window.MutationObserver; window.__mo = {}; window.__moOn = false;
    window.MutationObserver = function (cb) { const where = ((new Error().stack || '').split('\n')[2] || '').replace(/^.*\/(?=[^/]+:\d+:\d+)/, '').replace(/\?[^:]*/, '').trim().slice(0, 60);
      return new O(function (m, o) { if (window.__moOn) window.__mo[where] = (window.__mo[where] || 0) + 1; return cb.call(this, m, o); }); };
    window.MutationObserver.prototype = O.prototype; });
  const page = await ctx.newPage(); await page.goto('https://seniorfuture.kr' + P, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(4000);
  await page.evaluate(() => { window.__moOn = true; }); await page.waitForTimeout(5000);
  const m = await page.evaluate(() => window.__mo); const hot = Object.entries(m).filter(([k, v]) => v / 5 > 2).map(([k, v]) => k + ' ' + (v / 5).toFixed(1) + '/초');
  console.log(P, W, '관찰자 콜백 합계', Object.values(m).reduce((a, b) => a + b, 0), '(5초)', hot.length ? '초당 2회 넘는 것: ' + hot.join(' | ') : '');
  await ctx.close(); await new Promise(r => setTimeout(r, 1500)); }
await br.close(); })();
