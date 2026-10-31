// 첫 그림 전 메인 스레드 기록 (10/31): node tools/check/trace.js [local] [경로]
//   휴대폰 느린 4G·CPU 4배에서 Chrome trace 를 떠서, 첫 그림(FCP) 전까지 오래 걸린 일(스크립트 해석·실행·HTML 읽기·배치 등)을
//   파일별로 합쳐 보여 줘요. 우리 파일(seniorfuture-site)과 아임웹 파일을 나눠 봐요.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), a = process.argv.slice(2), LOCAL = a[0] === 'local';
const P = (LOCAL ? a[1] : a[0]) || '/shop_view/?idx=82';
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', isMobile: true, hasTouch: true });
  const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  if (LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
    const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
    return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
  });
  const tf = path.join(root, 'report', 'trace.json'); fs.mkdirSync(path.dirname(tf), { recursive: true });
  await br.startTracing(page, { path: tf, categories: ['devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'loading'] });
  await page.goto('https://seniorfuture.imweb.me' + P, { waitUntil: 'load', timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await br.stopTracing();
  await br.close();
  const ev = JSON.parse(fs.readFileSync(tf, 'utf8')).traceEvents;
  const nav = ev.find(e => e.name === 'navigationStart' || e.name === 'NavigationStart') || ev.find(e => e.name === 'TracingStartedInBrowser');
  const t0 = nav.ts;
  const fcp = ev.find(e => e.name === 'firstContentfulPaint'), fcpT = fcp ? fcp.ts : Infinity;
  const mark = ev.find(e => e.name === 'sf-early-init');
  console.log('FCP', fcp ? Math.round((fcp.ts - t0) / 1000) : '?', 'early', mark ? Math.round((mark.ts - t0) / 1000) : '?');
  // 메인 스레드: 첫 그림 전 X(완료) 이벤트 중 맨 바깥 일만
  const main = ev.filter(e => e.ph === 'X' && e.ts < fcpT && e.ts > t0 && e.dur > 3000 && /^(EvaluateScript|v8\.compile|v8\.compileModule|ParseHTML|FunctionCall|Layout|UpdateLayoutTree|RunTask|TimerFire|EventDispatch|v8\.run)$/.test(e.name));
  const sum = {};
  main.forEach(e => {
    if (e.name === 'RunTask') return;
    const url = (e.args && e.args.data && (e.args.data.url || e.args.data.functionName && e.args.data.url)) || (e.args && e.args.fileName) || '';
    const who = /seniorfuture-site/.test(url) ? '우리 JS' : url ? url.replace(/\?.*$/, '').split('/').pop().slice(0, 30) : '';
    const k = e.name + (who ? ' · ' + who : '');
    sum[k] = (sum[k] || 0) + e.dur / 1000;
  });
  Object.entries(sum).sort((x, y) => y[1] - x[1]).slice(0, 25).forEach(([k, v]) => console.log(String(Math.round(v)).padStart(6) + 'ms', k));
  // 큰 덩어리 시간표
  main.filter(e => e.name !== 'RunTask' && e.dur > 80000).forEach(e => {
    const url = (e.args && e.args.data && e.args.data.url) || '';
    console.log('  @' + Math.round((e.ts - t0) / 1000), e.name, Math.round(e.dur / 1000) + 'ms', url.replace(/\?.*$/, '').split('/').pop().slice(0, 40));
  });
})();
