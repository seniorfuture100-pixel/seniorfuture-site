// 런런 위젯이 손님 화면 속도에 주는 영향: learn-run.me 를 막은 경우 vs 그대로 (휴대폰 4배 느린 CPU, 첫 방문)
//   PW_CHANNEL=chrome node tools/check/lms-speed.js [경로...]
const { chromium } = require('playwright');
const PATHS = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/course'];
const RUNS = 3;

async function once(br, url, block) {
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });  // 매번 새 창 = 캐시 없는 첫 방문
  const pg = await ctx.newPage();
  if (block) await pg.route(/learn-run\.me/, r => r.abort());
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await pg.addInitScript(() => { window.__lcp = 0; window.__tbt = 0;
    new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lcp = e.startTime; })).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => l.getEntries().forEach(e => { window.__tbt += Math.max(0, e.duration - 50); })).observe({ type: 'longtask', buffered: true }); });
  await pg.goto(url, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(3000);
  const m = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0], p = performance.getEntriesByName('first-contentful-paint')[0];
    return { fcp: p ? p.startTime : 0, lcp: window.__lcp, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, tbt: window.__tbt }; });
  await ctx.close(); return m;
}

(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const med = a => a.sort((x, y) => x - y)[a.length >> 1];
  for (const p of PATHS) {
    const url = 'https://seniorfuture.kr' + p, res = { 막음: [], 그대로: [] };
    for (let i = 0; i < RUNS; i++) { res.막음.push(await once(br, url, true)); res.그대로.push(await once(br, url, false)); }  // 번갈아 측정해 네트워크 흔들림을 나눠 가짐
    const row = k => Object.fromEntries(['fcp', 'lcp', 'dcl', 'load', 'tbt'].map(f => [f, Math.round(med(res[k].map(r => r[f])))]));
    const a = row('막음'), b = row('그대로');
    console.log(`\n${p} (중앙값 ${RUNS}회, ms)`);
    for (const f of Object.keys(a)) console.log(`  ${f.padEnd(4)} 막음 ${String(a[f]).padStart(6)}  그대로 ${String(b[f]).padStart(6)}  차이 ${b[f] - a[f] >= 0 ? '+' : ''}${b[f] - a[f]}`);
  }
  await br.close();
})();
