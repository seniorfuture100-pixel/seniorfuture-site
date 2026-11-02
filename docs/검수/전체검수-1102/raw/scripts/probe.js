// node probe.js <경로> <너비> <스크립트파일.js> [캡처이름]  — 손님 화면을 열고 스크립트(async 함수 본문)를 실행해 결과 출력
// 스크립트 안에서 page(플레이라이트)·log 사용 가능. 카카오·결제 등 외부 이동 요청은 막음.
const { chromium } = require('C:/Users/ghehd/Documents/seniorfuture/seniorfuture-site/node_modules/playwright');
const fs = require('fs');
const [P, Wd, F, SHOT] = process.argv.slice(2), W = +Wd, mo = W < 768;
const UA_MO = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
(async () => {
  const br = await chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext(mo ? { viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true, userAgent: UA_MO, locale: 'ko-KR' } : { viewport: { width: W, height: 900 }, locale: 'ko-KR' });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://seniorfuture.kr' });
  // 안전: 카카오톡 공유·채널, 결제, 알림 발송 쪽 요청은 실제로 보내지 않음(주소만 기록)
  const blocked = [];
  await ctx.route(/sharer\.kakao|talk-apps\.kakao|pf\.kakao|kakao\.com\/talk|api\.kakao\.com\/v2\/api\/talk|pay\.(toss|kakao|naver)|tosspayments|inicis|kcp\.co|nicepay/i, r => { blocked.push(r.request().method() + ' ' + r.request().url().slice(0, 120)); r.abort(); });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  page.on('popup', p => blocked.push('popup ' + p.url().slice(0, 120)));
  const log = (...a) => console.log(...a.map(x => typeof x === 'string' ? x : JSON.stringify(x)));
  const t0 = Date.now();
  await page.goto('https://seniorfuture.kr' + P, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(3000);
  try { await (new (Object.getPrototypeOf(async function () {}).constructor)('page', 'log', 'ctx', fs.readFileSync(F, 'utf8')))(page, log, ctx); } catch (e) { log('SCRIPT ERR', e.message.slice(0, 200)); }
  if (SHOT) await page.screenshot({ path: SHOT, type: 'jpeg', quality: 70 });
  log('blocked', blocked, 'pageerrors', errs, 'ms', Date.now() - t0);
  await br.close();
})();
