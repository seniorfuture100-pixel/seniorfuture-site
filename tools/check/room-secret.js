// 상품 글의 강의실 전용 칸([톡방]·[톡방 비밀번호]·[강의 영상]·[라이브 링크]·[다시보기])이 로그아웃한 손님에게 보이는지 점검
//   node tools/check/room-secret.js 98 99 82 …  → 상품마다 ① HTML 안에 들어 있는지 ② 화면에 보이는지 (값은 가려서 출력)
const { chromium } = require('playwright');
const ids = process.argv.slice(2);
const SEC = /^\s*[\[【]\s*(카?톡방|단톡방|소통방|오픈\s?채팅(방)?)?\s*(주소|링크|비\s?(밀\s?)?번(호)?)?\s*[\]】]\s*$|^\s*[\[【]\s*((강의\s?)?영상(\s?주소)?|라이브\s?(링크|주소)|다시\s?보기)\s*[\]】]\s*$/;
const mask = s => s.replace(/https?:\/\/\S+/g, u => u.slice(0, 22) + '…').replace(/(비밀번호|비번)?\s*[:：]?\s*\S{2,}$/, m => m.length > 30 ? m : m.slice(0, 2) + '***');
(async () => {
  const br = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  for (const id of ids) {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' }), p = await ctx.newPage();
    await p.goto('https://seniorfuture.imweb.me/shop_view/?idx=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 }); await p.waitForTimeout(6000);
    const r = await p.evaluate(SECs => {
      const SEC = new RegExp(SECs);
      const tp = document.getElementById('prodDetailPC') || document.getElementById('prodDetailMobile');
      const W = tp && tp.content || document.getElementById('prod_detail_body');
      const raw = [], seen = [];
      if (W) { let on = ''; W.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,div').forEach(x => { if (x.querySelector('p,div,li,h1,h2,h3,h4,h5,h6')) return; const t = (x.textContent || '').replace(/\s+/g, ' ').trim(); if (!t) return; if (/^\s*[\[【].{1,20}[\]】]\s*$/.test(t)) { on = SEC.test(t) ? t : ''; on && raw.push('# ' + t); return; } on && raw.push(t); }); }
      // 화면에 실제로 보이는 글 중 같은 칸 머리·주소가 있는지
      const body = document.body.innerText;
      const vis = body.split('\n').map(s => s.trim()).filter(s => SEC.test(s) || /open\.kakao\.com|vimeo\.com|zoom\.us|youtu/.test(s));
      return { title: document.title.slice(0, 30), raw, vis };
    }, SEC.source);
    console.log(`\n■ ${id} ${r.title}\n  HTML 안: ${r.raw.length ? r.raw.map(mask).join(' | ') : '없음'}\n  화면에 보임: ${r.vis.length ? r.vis.map(mask).join(' | ') : '없음'}`);
    await ctx.close();
  }
  await br.close();
})();
