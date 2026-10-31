// 속도 측정 (10/31): node tools/check/perf.js [local]
//   손님(로그아웃) 화면을 휴대폰 느린 4G·CPU 4배 느림으로 열어 첫 화면(LCP)·멈춤 시간(TBT 근사)·우리 JS 실행 시간·받은 양을 재요.
//   local 을 주면 운영 사이트 대신 내 컴퓨터의 dist/ 파일(아직 배포 안 한 새 코드)을 끼워 넣어 재요(jsDelivr 주소를 가로채요).
//   화면마다 3번 재서 가운데 값을 써요. 결과: report/perf-<운영|local>.json
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), MODE = process.argv[2] || '', LOCAL = MODE === 'local';
// MODE: (없음) 운영 · local 내 dist · block 우리 파일 막기(아임웹만) · nojs 우리 JS만 막기 · cached 두 번째 방문(파일 저장된 상태)
const SITE = 'https://seniorfuture.imweb.me';
const ONLY = process.argv.slice(3);
const PAGES0 = [['home', '/'], ['course', '/course'], ['live', '/live'], ['community', '/community'], ['insight', '/insight'],
  ['experts', '/experts'], ['pv82', '/shop_view/?idx=82'], ['live99', '/live/?idx=99'], ['post', '/insight/?bmode=view&idx=175163304']];
const PAGES = ONLY.length ? PAGES0.filter(p => ONLY.includes(p[0])) : PAGES0;
const RUNS = 3;
const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}), out = {};
  for (const [id, p] of PAGES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', isMobile: true, hasTouch: true });
      const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable');
      // NET=lte 이면 보통 LTE(20Mbps, 40ms)·CPU 2배 느림(보통 휴대폰) — 기본은 느린 4G(1.6Mbps, 150ms)·CPU 4배
      const LTE = process.env.NET === 'lte';
      await cdp.send('Network.emulateNetworkConditions', LTE ? { offline: false, latency: 40, downloadThroughput: 20e6 / 8, uploadThroughput: 5e6 / 8 } : { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: LTE ? 2 : 4 });
      let bytes = 0, ours = 0;
      page.on('response', async r => { try { const l = +(r.headers()['content-length'] || 0); bytes += l; if (/seniorfuture-site/.test(r.url())) ours += l; } catch (e) {} });
      if (MODE === 'block') await page.route(/seniorfuture-site@/, r => r.abort());
      if (MODE === 'nojs') await page.route(/seniorfuture-site@[^/]+\/dist\/.*\.js/, r => r.abort());
      if (MODE === 'cached') { await page.goto(SITE + p, { waitUntil: 'load', timeout: 90000 }).catch(() => {}); await page.goto('about:blank'); }
      if (LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
        const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
        return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
      });
      await page.addInitScript(() => {
        window.__lcp = 0; window.__lt = 0;
        new PerformanceObserver(l => { const e = l.getEntries(); window.__lcp = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lt += Math.max(0, e.duration - 50); })).observe({ type: 'longtask', buffered: true });
      });
      const t0 = Date.now();
      await page.goto(SITE + p, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
      await page.waitForTimeout(4000);
      const m = await page.evaluate(() => {
        const sc = performance.getEntriesByType('resource').filter(e => /seniorfuture-site/.test(e.name));
        return { lcp: Math.round(window.__lcp), tbt: Math.round(window.__lt), dcl: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd), sfBytes: sc.reduce((a, e) => a + (e.encodedBodySize || 0), 0) };
      });
      m.load = Date.now() - t0; m.bytes = bytes;
      runs.push(m);
      await ctx.close();
    }
    out[id] = { lcp: med(runs.map(r => r.lcp)), tbt: med(runs.map(r => r.tbt)), dcl: med(runs.map(r => r.dcl)), sfKB: Math.round(med(runs.map(r => r.sfBytes)) / 1024) };
    console.log(id.padEnd(10), 'LCP', out[id].lcp, 'TBT', out[id].tbt, 'DCL', out[id].dcl, 'sf', out[id].sfKB + 'KB');
  }
  await br.close();
  fs.mkdirSync(path.join(root, 'report'), { recursive: true });
  fs.writeFileSync(path.join(root, 'report', 'perf-' + (MODE || '운영') + (process.env.NET ? '-' + process.env.NET : '') + '.json'), JSON.stringify(out, null, 1));
})();
