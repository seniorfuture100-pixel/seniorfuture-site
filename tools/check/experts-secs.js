// 전문가 게시판 글마다 어떤 [칸]을 썼는지 세기(로그인 없이 · 1.5초 간격): node tools/check/experts-secs.js 글번호…
const sleep = ms => new Promise(r => setTimeout(r, ms));
const txt = h => h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
(async () => {
  const agg = {}, rows = [];
  for (const id of process.argv.slice(2)) {
    const h = await (await fetch('https://seniorfuture.imweb.me/experts/?bmode=view&idx=' + id)).text();
    const i = h.indexOf('board_txt_area'), body = i < 0 ? '' : h.slice(i, i + 60000);
    const title = txt((/<title>([\s\S]*?)<\/title>/.exec(h) || [])[1] || '').split(':')[0].trim().slice(0, 24);
    const lines = (body.match(/<(p|li|h\d|div)[^>]*>[\s\S]*?<\/\1>/g) || []).map(txt).filter(Boolean);
    const secs = []; let pre = 0;
    for (const l of lines) { const m = /^\[\s*([^\]]{1,20})\s*\]$/.exec(l); if (m) secs.push(m[1].replace(/\s+/g, '')); else if (!secs.length) pre++; }
    [...new Set(secs)].forEach(s => agg[s] = (agg[s] || 0) + 1);
    rows.push(`${title} | ${[...new Set(secs)].join(' + ') || '(칸 없음)'}`);
    await sleep(1500);
  }
  console.log(rows.join('\n'));
  console.log('\n칸별 글 수:', JSON.stringify(agg));
})();
