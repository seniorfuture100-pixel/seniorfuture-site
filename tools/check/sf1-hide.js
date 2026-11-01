// 섞은 줄(SF1:)이 제목 줄 없이 남아도 상품 화면에 안 보이는지 점검(로그아웃 손님 · 상품 글에 줄을 끼워 넣어 시험)
//   node tools/check/sf1-hide.js 82 [v1.0.146]  — 버전을 주면 그 버전 시험 모드(stage-loader)로, 없으면 지금 운영 코드로
const { chromium } = require('playwright');
const { enc } = require('../site/sf1');
const [id, ver] = process.argv.slice(2);
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const ctx = await br.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
  if (ver) {
    const code = await (await fetch(`https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@${ver}/site/dist/stage-loader.txt`)).text();
    await ctx.addInitScript(c => { try { sessionStorage.setItem('sf_stage', '1'); sessionStorage.setItem('sf_stage_code', c); } catch (e) {} }, code);
  }
  const line = enc('https://open.kakao.com/o/LEFTOVER-TEST');
  const p = await ctx.newPage();
  await p.route(/\/shop_view\/\?idx=\d+$/, async r => {
    const res = await r.fetch(); let h = await res.text();
    h = h.replace(/(<template[^>]*id="prodDetailPC"[^>]*>[\s\S]*?<\/p>)/, `$1<p>${line}</p>`); // 첫 줄 뒤(소개 칸)에 남은 줄처럼 끼워 넣기
    r.fulfill({ response: res, body: h });
  });
  await p.goto('https://seniorfuture.imweb.me/shop_view/?idx=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 }); await p.waitForTimeout(7000);
  const r = await p.evaluate(() => ({ stage: document.documentElement.getAttribute('data-sf-stage'), shown: /SF1:/.test(document.body.innerText), inHtml: /SF1:/.test(document.documentElement.innerHTML) }));
  console.log(id, ver || '운영', '| 시험 모드', r.stage || '-', '| 원본에 있음', r.inHtml, '| 화면에 보임', r.shown);
  await br.close();
})();
