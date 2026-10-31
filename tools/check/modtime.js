// 기능(SFUI 모듈)별 실행 시간 (10/31): node tools/check/modtime.js [local] [경로...]
//   SFUI.init / register 를 감싸 모듈마다 걸린 시간·실행 횟수, 문서 전체 init 횟수를 세요(휴대폰, CPU 4배 느림).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..'), args = process.argv.slice(2), LOCAL = args[0] === 'local';
const SITE = 'https://seniorfuture.imweb.me';
const PAGES = (LOCAL ? args.slice(1) : args).length ? (LOCAL ? args.slice(1) : args) : ['/', '/shop_view/?idx=82', '/live', '/insight'];

(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (const p of PAGES) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'ko-KR', isMobile: true, hasTouch: true });
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    if (LOCAL) await page.route(/seniorfuture-site@[^/]+\/dist\/(.+)$/, r => {
      const f = path.join(root, 'dist', r.request().url().match(/\/dist\/([^?#]+)/)[1]);
      return fs.existsSync(f) ? r.fulfill({ path: f, contentType: /\.css$/.test(f) ? 'text/css' : 'application/javascript' }) : r.continue();
    });
    await page.addInitScript(() => {
      const T = window.__T = { mod: {}, inits: [], evalStart: 0 };
      let v;
      Object.defineProperty(window, 'SFUI', {
        configurable: true, get() { return v; },
        set(s) {
          v = s;
          const reg = s.register, init = s.init;
          // 자기 시간: 모듈 안에서 부른 다른 모듈(SFUI.init 안쪽) 시간은 빼요
          const stack = [];
          s.register = function (n, fn) {
            return reg.call(this, n, function (r) {
              const t = performance.now(); stack.push(0); try { return fn.apply(this, arguments); } finally {
                const all = performance.now() - t, inner = stack.pop();
                if (stack.length) stack[stack.length - 1] += all;
                const m = T.mod[n] || (T.mod[n] = { ms: 0, n: 0 }); m.ms += all - inner; m.n++;
              }
            });
          };
          s.init = function (r) { const t = performance.now(); try { return init.apply(this, arguments); } finally { T.inits.push([r === document ? 'DOC' : (r && r.nodeName) || '?', Math.round(performance.now() - t), Math.round(t)]); } };
        }
      });
    });
    await page.goto(SITE + p, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(6000);
    const T = await page.evaluate(() => window.__T);
    const mods = Object.entries(T.mod).sort((a, b) => b[1].ms - a[1].ms);
    const tot = mods.reduce((s, [, m]) => s + m.ms, 0);
    console.log('\n' + p, '| 모듈 합계', Math.round(tot) + 'ms', '| 문서 전체 init', T.inits.filter(x => x[0] === 'DOC').length + '번', T.inits.filter(x => x[0] === 'DOC').map(x => x[1] + 'ms@' + x[2]).join(' '));
    mods.slice(0, 15).forEach(([n, m]) => console.log('  ', n.padEnd(22), Math.round(m.ms) + 'ms', '×' + m.n));
    await ctx.close();
  }
  await br.close();
})();
