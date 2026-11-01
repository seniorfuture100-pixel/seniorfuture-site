// 상품 글 비공개 칸 중 아직 섞지 않은(SF1: 아닌) 줄이 있는 상품 찾기 — 로그인 없이 원본 HTML만 받아요(4초 간격)
//   node tools/check/room-plain.js 82 98 99 …  → 상품마다 칸 이름과 '그대로 / 섞음' 개수(값은 출력 안 함)
const ids = process.argv.slice(2);
const SEC = /^(카?톡방|단톡방|소통방|오픈\s?채팅(방)?)(\s?(주소|링크))?$|^((카?톡방|소통방|오픈\s?채팅(방)?)\s?)?비\s?(밀\s?)?번(호)?$|^(강의\s?)?영상(\s?주소)?$|^라이브\s?(링크|주소)$|^다시\s?보기(\s?(주소|링크|영상))?$/;
const txt = h => h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const hit = [];
  for (const id of ids) {
    let h = '';
    try { const r = await fetch('https://seniorfuture.imweb.me/shop_view/?idx=' + id); h = r.ok ? await r.text() : ''; if (r.status === 429) { console.log(id, '429 — 1분 쉬고 다시'); await sleep(60000); ids.push(id); continue; } } catch (e) {}
    const tp = (/<template[^>]*id="prodDetailPC"[^>]*>([\s\S]*?)<\/template>/.exec(h) || [])[1] || '';
    const title = txt((/<title>([\s\S]*?)<\/title>/.exec(h) || [])[1] || '').slice(0, 30);
    const lines = (tp.match(/<(p|li|h\d|div)[^>]*>[\s\S]*?<\/\1>/g) || []).map(txt).filter(Boolean);
    let sec = '', out = {};
    for (const l of lines) {
      const m = /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/.exec(l);
      if (m) { sec = SEC.test(m[1].trim()) ? m[1].trim() : ''; continue; }
      if (sec) { out[sec] = out[sec] || { 그대로: 0, 섞음: 0 }; out[sec][/^SF1:/.test(l) ? '섞음' : '그대로']++; }
      else if (/^SF1:/.test(l)) { out['(칸 밖 섞은 줄)'] = out['(칸 밖 섞은 줄)'] || { 그대로: 0, 섞음: 0 }; out['(칸 밖 섞은 줄)'].섞음++; }
      else if (/open\.kakao\.com\/o\//.test(l)) { out['(칸 밖 오픈채팅 주소)'] = out['(칸 밖 오픈채팅 주소)'] || { 그대로: 0, 섞음: 0 }; out['(칸 밖 오픈채팅 주소)'].그대로++; }
    }
    const ks = Object.keys(out);
    if (ks.length) { hit.push(id); console.log(id, title, '|', ks.map(k => `${k} 그대로 ${out[k].그대로} · 섞음 ${out[k].섞음}`).join(' | ')); }
    await sleep(4000);
  }
  console.log('\n비공개 칸이 있는 상품:', hit.join(', ') || '없음');
})();
