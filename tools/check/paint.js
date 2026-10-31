// 첫 화면 깜빡임 점검 (11/1): node tools/check/paint.js [webkit|chrome] [경로] [local]
//   내 컴퓨터에 중계 서버(127.0.0.1:8787)를 띄워 페이지 HTML 을 느린 망처럼 조금씩 보내고(4KB/80ms),
//   로딩하는 동안 0.3초마다 화면을 찍어요 → 우리 꾸밈(sf-early-init) 전에 아임웹 원래 모양이 그려지는지 봐요.
//   사파리(WebKit)는 크롬의 '푸터까지 그리기 멈춤'(rel=expect)을 모를 수 있어서 따로 봐요.
//   local 을 주면 jsDelivr 의 우리 파일 대신 내 dist/ 를 써요. 사진: report/paint/<엔진>-<n>.png
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const { webkit, chromium } = require('playwright');
const root = path.resolve(__dirname, '..', '..'), a = process.argv.slice(2);
const ENGINE = a[0] || 'webkit', P = a[1] || '/', LOCAL = a.includes('local');
const UP = 'seniorfuture.imweb.me', PORT = 8787, out = path.join(root, 'report', 'paint');
fs.mkdirSync(out, { recursive: true });

const srv = http.createServer((req, res) => {
  const h = Object.assign({}, req.headers, { host: UP }); delete h['accept-encoding'];
  const up = https.request({ host: UP, path: req.url, method: req.method, headers: h }, ur => {
    const isHtml = /text\/html/.test(ur.headers['content-type'] || '');
    const hd = Object.assign({}, ur.headers); delete hd['content-length']; delete hd['content-security-policy'];
    if (hd.location) hd.location = hd.location.replace('https://' + UP, 'http://127.0.0.1:' + PORT);
    res.writeHead(ur.statusCode, hd);
    if (!isHtml) return ur.pipe(res);
    const parts = []; ur.on('data', c => parts.push(c)); ur.on('end', () => {
      const buf = Buffer.concat(parts); let i = 0;
      (function drip() { if (i >= buf.length) return res.end(); res.write(buf.slice(i, i + 4096)); i += 4096; setTimeout(drip, +process.env.DRIP || 80); })(); // DRIP=320 이면 4배 느리게
    });
  });
  up.on('error', () => res.end()); req.pipe(up);
});

(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const br = await (ENGINE === 'chrome' ? chromium.launch({ channel: 'chrome' }) : webkit.launch());
  // 아임웹은 휴대폰·PC 에 다른 화면을 보내서, 실제 기기 정보(아이폰 13 / 갤럭시 계열 크롬)로 접속해요
  const { devices } = require('playwright');
  const ctx = await br.newContext(Object.assign({}, devices[ENGINE === 'chrome' ? 'Pixel 7' : 'iPhone 13'], { locale: 'ko-KR' }));
  if (LOCAL) await ctx.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
    const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
    return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
  });
  const page = await ctx.newPage(); const t0 = Date.now(), log = [];
  const nav = page.goto('http://127.0.0.1:' + PORT + P, { waitUntil: 'load', timeout: 120000 }).catch(e => log.push('nav ' + e.message.slice(0, 60)));
  for (let n = 0; n < 24; n++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const st = await page.evaluate(() => ({ early: !!performance.getEntriesByName('sf-early-init').length, foot: !!document.getElementById('doz_footer_wrap'), head: !!document.getElementById('doz_header_wrap'), sfHead: !!document.querySelector('.sf-hd, .r2-hd, [data-sf-header], .sf-header') }));
      const f = path.join(out, ENGINE + '-' + String(n).padStart(2, '0') + '.png');
      await page.screenshot({ path: f, timeout: 3000 }).catch(() => {});
      log.push(((Date.now() - t0) / 1000).toFixed(1) + 's ' + JSON.stringify(st));
    } catch (e) { log.push(((Date.now() - t0) / 1000).toFixed(1) + 's -'); }
  }
  await nav;
  // 첫 그림(FCP)이 우리 꾸밈(sf-early-init)보다 먼저면 = 원래 모양이 비친 것
  const pt = await page.evaluate(() => {
    const f = performance.getEntriesByName('first-contentful-paint')[0], e = performance.getEntriesByName('sf-early-init')[0];
    return { fcp: f && Math.round(f.startTime), early: e && Math.round(e.startTime) };
  }).catch(() => ({}));
  console.log(ENGINE, P, 'FCP', pt.fcp, '꾸밈', pt.early, pt.fcp != null && pt.early != null ? (pt.fcp < pt.early ? '✗ 꾸미기 전에 그려짐(' + (pt.early - pt.fcp) + 'ms)' : '✓ 꾸민 뒤 첫 그림') : '?');
  if (process.env.VERBOSE) console.log(log.join('\n'));
  await br.close(); srv.close();
})();
