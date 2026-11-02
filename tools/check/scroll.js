// 스크롤 버벅임 측정 (11/2): node tools/check/scroll.js [pc|mo] [화면id...]
//   손님(로그아웃) 화면을 끝까지 내렸다가 다시 올리며 프레임 간격을 재요.
//   over50 = 50ms 넘게 멈춘 프레임 수(눈에 띄는 끊김), max = 가장 긴 멈춤, long = 스크롤 중 긴 작업(50ms+) 합계, cls = 스크롤 중 화면 밀림
//   mo 는 휴대폰 크기 + CPU 4배 느림(보통 휴대폰보다 가혹). PROF=1 이면 가장 오래 걸린 함수 목록도 냄
const { chromium } = require('playwright');
const SITE = process.env.SITE || 'https://seniorfuture.imweb.me';
const MODE = process.argv[2] || 'pc', ONLY = process.argv.slice(3);
const PAGES0 = [['home', '/'], ['course', '/course'], ['live', '/live'], ['insight', '/insight'], ['community', '/community'],
  ['business', '/business'], ['about', '/about'], ['partner', '/partner'], ['partners', '/partners'], ['review', '/review'],
  ['experts', '/experts'], ['projects', '/projects'], ['news', '/news'], ['help', '/help'], ['terms', '/terms'],
  ['pv82', '/shop_view/?idx=82'], ['live84', '/live/?idx=84'], ['meet85', '/community/?idx=85']];
const PAGES = ONLY.length ? PAGES0.filter(p => ONLY.includes(p[0])) : PAGES0;

const RUN = () => new Promise(done => {
  const fr = [], longs = []; let cls = 0, last = 0, dir = 1, n = 0;
  const po = new PerformanceObserver(l => l.getEntries().forEach(e => longs.push(e.duration)));
  try { po.observe({ type: 'longtask' }); } catch (e) {}
  const pl = new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value; }));
  try { pl.observe({ type: 'layout-shift' }); } catch (e) {}
  const step = t => {
    if (last) fr.push(t - last); last = t; n++;
    window.scrollBy(0, dir * 50);
    const end = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    if (dir > 0 && (end || n > 900)) dir = -1;
    if (dir < 0 && window.scrollY <= 0) {
      po.disconnect(); pl.disconnect();
      const s = fr.slice().sort((a, b) => a - b);
      return done({ frames: fr.length, H: document.documentElement.scrollHeight, over50: fr.filter(f => f > 50).length,
        over100: fr.filter(f => f > 100).length, max: Math.round(s[s.length - 1] || 0), p95: Math.round(s[Math.floor(s.length * .95)] || 0),
        long: Math.round(longs.reduce((a, b) => a + b, 0)), cls: +cls.toFixed(3) });
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});

(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}), out = {};
  for (const [id, p] of PAGES) {
    const mo = MODE === 'mo';
    const ctx = await br.newContext(mo ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ko-KR' } : { viewport: { width: 1280, height: 800 }, locale: 'ko-KR' });
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    if (mo) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    if (process.env.BLOCK) await page.route(new RegExp(process.env.BLOCK), r => r.abort()); // 예: BLOCK=clarity 비교용
    if (process.env.LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => { // LOCAL=1: 배포 전 내 dist/ 로 재기
      const f = require('path').resolve(__dirname, '..', '..', 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
      return require('fs').existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
    });
    try {
      await page.goto(SITE + p, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(2500);
      if (process.env.PROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
      const r = await page.evaluate(RUN);
      if (process.env.PROF) {
        const { profile } = await cdp.send('Profiler.stop'), self = {}, byId = {};
        profile.nodes.forEach(nd => byId[nd.id] = nd);
        const dt = profile.timeDeltas; let i = 0;
        profile.samples.forEach(sid => { const nd = byId[sid], f = nd.callFrame, k = (f.functionName || '(anon)') + ' ' + f.url.replace(/^.*\//, '').slice(0, 40) + ':' + f.lineNumber + ':' + f.columnNumber; self[k] = (self[k] || 0) + (dt[i++] || 0) / 1000; });
        r.top = Object.entries(self).filter(([k]) => !/^\((idle|program|garbage collector)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v) + 'ms');
      }
      out[id] = r;
      console.log(id.padEnd(9), JSON.stringify(r));
    } catch (e) { console.log(id, 'ERR', e.message.slice(0, 120)); }
    await ctx.close();
  }
  await br.close();
  require('fs').writeFileSync(require('path').resolve(__dirname, '..', '..', 'report', 'scroll-' + MODE + '.json'), JSON.stringify(out, null, 1));
})();
