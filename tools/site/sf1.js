// 상품 글 비공개 칸 섞기·풀기(사이트 patch/07 SFUI.unSF1 과 같은 방식): node tools/site/sf1.js "https://open.kakao.com/o/xxx" [줄2 …]
//   → 'SF1:…' 줄을 출력. 풀어 보기: node tools/site/sf1.js --dec "SF1:…"
const K = 'sf-room|2026';
const enc = s => 'SF1:' + Buffer.from(Buffer.from(String(s).trim(), 'utf8').map((b, i) => b ^ K.charCodeAt(i % K.length))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = s => { const m = /^\s*SF1:([A-Za-z0-9_\-]+)\s*$/.exec(s); if (!m) return s; const b = Buffer.from(m[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'); return Buffer.from(b.map((x, i) => x ^ K.charCodeAt(i % K.length))).toString('utf8'); };
module.exports = { enc, dec };
if (require.main === module) {
  const a = process.argv.slice(2), d = a[0] === '--dec';
  for (const s of d ? a.slice(1) : a) console.log(d ? dec(s) : enc(s));
  // 스스로 점검: 섞고 풀면 원래 글자
  for (const t of ['https://open.kakao.com/o/abcDEF12', '1회차 https://vimeo.com/123456789/abcdef', '비밀번호: 4821', '한글 섞인 줄 ✓']) if (dec(enc(t)) !== t) { console.error('점검 실패', t); process.exit(1); }
}
