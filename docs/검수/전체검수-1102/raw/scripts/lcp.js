// LCP 후보가 언제·무엇으로 바뀌는지(느린 4G·CPU 4배, 휴대폰)
const { chromium } = require('C:/Users/ghehd/Documents/seniorfuture/seniorfuture-site/node_modules/playwright');
(async () => { const br = await chromium.launch({ channel: 'chrome' });
for (const P of ['/insight', '/experts']) {
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ko-KR' }); const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => { window.__l = []; new PerformanceObserver(l => l.getEntries().forEach(e => { const n = e.element; window.__l.push([Math.round(e.startTime), e.size, n ? n.tagName.toLowerCase() + '.' + (n.className || '').toString().split(' ')[0] + ' ' + (n.textContent || '').trim().slice(0, 20) : '?', (e.url || '').slice(-50)]); })).observe({ type: 'largest-contentful-paint', buffered: true }); });
  await page.goto('https://seniorfuture.imweb.me' + P, { waitUntil: 'load', timeout: 120000 }).catch(() => {}); await page.waitForTimeout(4000);
  console.log(P, JSON.stringify(await page.evaluate(() => window.__l)));
  await ctx.close(); }
await br.close(); })();
