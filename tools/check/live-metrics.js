// Read-only production measurements. No orders or member data are submitted.
const { chromium } = require('playwright');
const fs = require('fs');
const paths = ['/', '/course', '/live', '/insight', '/community', '/shop_mypage'];
const output = 'report/live-metrics.json';
(async () => {
  fs.mkdirSync('report', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];
  for (const route of paths) {
    for (let trial = 1; trial <= 3; trial++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.qaMetrics = { lcp: null, cls: 0 };
        new PerformanceObserver(list => list.getEntries().forEach(e => { window.qaMetrics.lcp = e.startTime; })).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.qaMetrics.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      });
      for (const visit of ['cold', 'warm']) {
        const errors = [], failures = [];
        const onError = e => errors.push(e.message);
        const onResponse = r => { if (r.status() >= 400) failures.push({ url: r.url().split('?')[0], status: r.status() }); };
        page.on('pageerror', onError);
        page.on('response', onResponse);
        let status = null, navigationError = null;
        try { status = (await page.goto('https://seniorfuture.kr' + route, { waitUntil: 'domcontentloaded', timeout: 45000 })).status(); }
        catch (e) { navigationError = e.message; }
        await page.waitForTimeout(4000);
        const metrics = await page.evaluate(() => {
          const n = performance.getEntriesByType('navigation')[0];
          return { ...window.qaMetrics, ttfb: n.responseStart - n.requestStart, dcl: n.domContentLoadedEventEnd, overflow: document.documentElement.scrollWidth - innerWidth,
            resources: performance.getEntriesByType('resource').filter(r => /seniorfuture-site/.test(r.name)).map(r => ({ url: r.name, duration: r.duration, end: r.responseEnd })),
            sfui: !!window.SFUI, finalPath: location.pathname };
        });
        results.push({ route, trial, visit, status, navigationError, errors, failures, metrics });
        fs.writeFileSync(output, JSON.stringify(results, null, 2));
        console.log(route, trial, visit, status, JSON.stringify(metrics));
        page.off('pageerror', onError); page.off('response', onResponse);
      }
      await context.close();
    }
  }
  await browser.close();
})();
