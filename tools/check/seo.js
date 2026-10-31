// 검색·공유 미리보기 점검 (11/1): node tools/check/seo.js [상품번호...]
//   손님(휴대폰)으로 상품 상세 원본 HTML 을 받아 SEO 제목·설명, 카톡 공유(og) 제목·설명·이미지를 확인해요.
//   설명이 비었거나 본문 첫머리('[소개]…')가 그대로 나가면 ✗. 아임웹 서버에 1.5초 간격.
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['82', '83', '84', '85', '86', '94', '95', '96', '97', '98', '99', '100', '101', '102'];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const meta = (h, re) => { const m = re.exec(h); return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : ''; };
(async () => {
  let bad = 0;
  for (const id of ids) {
    const h = await (await fetch('https://seniorfuture.imweb.me/shop_view/?idx=' + id, { headers: { 'user-agent': UA } })).text();
    const r = {
      title: meta(h, /<title>([^<]*)<\/title>/i),
      desc: meta(h, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i),
      ogTitle: meta(h, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i),
      ogDesc: meta(h, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i),
      ogImg: meta(h, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i)
    };
    const q = [];
    if (!r.desc) q.push('설명 없음'); else if (/^\s*\[/.test(r.desc)) q.push('설명이 본문 첫머리');
    if (!r.ogDesc) q.push('공유 설명 없음'); else if (/^\s*\[/.test(r.ogDesc)) q.push('공유 설명이 본문 첫머리');
    if (!r.ogImg) q.push('공유 이미지 없음');
    if (r.ogImg) { try { const ir = await fetch(r.ogImg.replace(/^\/\//, 'https://'), { method: 'HEAD' }); if (!ir.ok) q.push('공유 이미지 ' + ir.status); } catch (e) { q.push('공유 이미지 못 받음'); } }
    if (q.length) bad++;
    console.log((q.length ? '✗ ' : '✓ ') + id.padEnd(4) + r.title.slice(0, 40).padEnd(42) + (q.length ? q.join(', ') : '') + ' | ' + r.desc.slice(0, 50));
    await new Promise(z => setTimeout(z, 1500));
  }
  console.log(bad ? '문제 ' + bad + '개' : '✓ 모두 정상');
})();
