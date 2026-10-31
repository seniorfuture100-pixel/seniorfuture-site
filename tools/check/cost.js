// 우리 코드가 쓰는 시간 나눠 보기 (10/31): node tools/check/cost.js [local]
//   같은 화면을 '우리 코드 있음' / '우리 코드 막음(아임웹만)'으로 열어(휴대폰, CPU 4배 느림)
//   스크립트 실행·스타일 계산·배치(레이아웃) 시간을 비교해요. 차이 = 우리 코드 몫.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), LOCAL = process.argv[2] === 'local';
const SITE = 'https://seniorfuture.imweb.me';
const PAGES = [['home', '/'], ['pv82', '/shop_view/?idx=82'], ['live', '/live'], ['insight', '/insight']];
const KEYS = ['ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration', 'TaskDuration'];

async function measure(br, p, block) {
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', isMobile: true, hasTouch: true });
  const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  if (block) await page.route(/seniorfuture-site@/, r => r.abort());
  else if (LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
    const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
    return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
  });
  await page.goto(SITE + p, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(5000);
  const m = {}; (await cdp.send('Performance.getMetrics')).metrics.forEach(x => { if (KEYS.includes(x.name)) m[x.name] = Math.round(x.value * 1000); });
  await ctx.close();
  return m;
}
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (const [id, p] of PAGES) {
    const a = [], b = [];
    for (let i = 0; i < 2; i++) { a.push(await measure(br, p, false)); b.push(await measure(br, p, true)); }
    const avg = (L, k) => Math.round(L.reduce((s, x) => s + (x[k] || 0), 0) / L.length);
    console.log(id.padEnd(8), KEYS.map(k => k.replace('Duration', '') + ' ' + avg(a, k) + ' (아임웹만 ' + avg(b, k) + ')').join(' | '));
  }
  await br.close();
})();
