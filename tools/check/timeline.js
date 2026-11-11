// 첫 화면 시간표 (10/31): node tools/check/timeline.js [local] [경로]
//   휴대폰 느린 4G·CPU 4배에서 우리 CSS/JS 도착 시각, 꾸밈(sf-early-init) 시각, 첫 그림(FCP)·가장 큰 그림(LCP)과 그 요소를 보여 줘요.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), a = process.argv.slice(2), LOCAL = a[0] === 'local';
const P = (LOCAL ? a[1] : a[0]) || '/shop_view/?idx=82';
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (let run = 0; run < 2; run++) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', isMobile: true, hasTouch: true });
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    if (LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
      const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
      return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
    });
    await page.addInitScript(() => {
      window.__lcpE = [];
      new PerformanceObserver(l => l.getEntries().forEach(e => window.__lcpE.push([Math.round(e.startTime), e.element ? (e.element.tagName + '.' + String(e.element.className).slice(0, 40) + ' ' + (e.url || '').slice(-40)) : '?']))).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto((process.env.SITE_URL || 'https://seniorfuture.imweb.me') + P, { waitUntil: 'load', timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(4000);
    const r = await page.evaluate(() => {
      const R = e => Math.round(e);
      // 늦게 끝난 스크립트·CSS 순(푸터까지 읽기를 막는 후보)
      const res = performance.getEntriesByType('resource').filter(e => /^(script|link|css)$/.test(e.initiatorType) || /seniorfuture-site/.test(e.name))
        .filter(e => e.startTime < 9000).sort((x, y) => y.responseEnd - x.responseEnd)
        .map(e => [e.name.replace(/\?.*$/, '').replace(/^.*\/\/([^/]+)\/.*\/([^/]+)$/, '$1/$2').slice(-48), R(e.startTime), R(e.responseEnd), R(e.encodedBodySize / 1024) + 'KB', e.renderBlockingStatus || '']);
      const nav = performance.getEntriesByType('navigation')[0], fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const mk = performance.getEntriesByName('sf-early-init')[0];
      const ours = performance.getEntriesByType('resource').filter(e => /seniorfuture-site/.test(e.name)).map(e => [e.name.replace(/^.*\//, ''), R(e.startTime), R(e.responseEnd), R(e.encodedBodySize / 1024) + 'KB']);
      const cssEnd = R(Math.max.apply(null, performance.getEntriesByType('resource').filter(e => e.renderBlockingStatus === 'blocking').map(e => e.responseEnd)));
      const imgBefore = performance.getEntriesByType('resource').filter(e => e.initiatorType === 'img' && e.startTime < 6000).reduce((s, e) => s + (e.encodedBodySize || 0), 0);
      return { ours, cssEnd, imgKBbefore6s: R(imgBefore / 1024), ttfb: R(nav.responseStart), htmlEnd: R(nav.responseEnd), domInteractive: R(nav.domInteractive), dcl: R(nav.domContentLoadedEventStart), fcp: fcp && R(fcp.startTime), early: mk && R(mk.startTime), lcp: window.__lcpE, res: res.slice(0, 14), htmlKB: R(nav.encodedBodySize / 1024) };
    });
    console.log(JSON.stringify(r, null, 0));
    await ctx.close();
  }
  await br.close();
})();
