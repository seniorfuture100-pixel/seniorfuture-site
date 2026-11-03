// 런런(LMS) 베타 전후 비교: 설치 전 사이트 상태를 저장하고(save), 원복 뒤 같은지 비교해요(compare)
//   node tools/check/lms-snapshot.js save     → docs/런런-베타/설치전-스냅샷.json
//   node tools/check/lms-snapshot.js compare  → 달라진 곳만 출력(원복 확인용)
// 손님(로그아웃) 화면만 봐요. 로그인·관리자 정보·개인정보는 담지 않아요.
const fs = require('fs'), path = require('path');
const BASE = 'https://seniorfuture.kr';
const FILE = path.join(__dirname, '../../docs/런런-베타/설치전-스냅샷.json');
const PAGES = ['/', '/course', '/live', '/community', '/shop_view/?idx=82', '/shop_view/?idx=83', '/shop_view/?idx=84', '/shop_view/?idx=85', '/shop_view/?idx=103'];
const PRODUCTS = [82, 83, 84, 85, 103];
const get = async (u, o) => { const r = await fetch(BASE + u, Object.assign({ headers: { 'user-agent': 'Mozilla/5.0 sf-lms-snapshot' }, redirect: 'manual' }, o)); return { status: r.status, loc: r.headers.get('location'), text: r.status < 300 ? await r.text() : '' }; };

async function snap() {
  const out = { at: new Date().toISOString(), base: BASE, routes: {}, pages: {}, products: {}, sitemap: [] };
  // 런런이 만들 수 있는 주소들(설치 전엔 없어야 해요)
  for (const u of ['/learn-run', '/learn-run/']) { const r = await get(u); out.routes[u] = r.status + (r.loc ? ' → ' + r.loc : ''); }
  for (const u of PAGES) {
    const r = await get(u); const t = r.text;
    out.pages[u] = {
      status: r.status,
      loader: (t.match(/@v1\.0\.\d+/) || [''])[0],                                   // 공통 코드 버전(참고: 원복과 무관하게 바뀔 수 있어요)
      scriptHosts: [...new Set([...t.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(m => { try { return new URL(m[1], BASE).host; } catch (e) { return m[1].slice(0, 40); } }))].sort(),
      iframes: [...new Set([...t.matchAll(/<iframe[^>]+src=["']([^"']+)/g)].map(m => m[1].replace(/\?.*$/, '')))].sort(),
      learnRun: /learn-run|learnrun/i.test(t)                                          // 앱이 넣은 스크립트·링크 흔적
    };
  }
  for (const id of PRODUCTS) {
    const r = await get('/shop_view/?idx=' + id), t = r.text;  // 83처럼 판매안함이면 301이라 설명을 못 봐요
    const room = (t.match(/\[강의실\][\s\S]{0,200}?(\/[\w\-\/?=&]*)/) || [])[1] || '';
    out.products[id] = { status: r.status, hasRoomLine: /\[강의실\]/.test(t), room };
  }
  const sm = await get('/sitemap.xml');
  out.sitemap = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '')).filter(u => !/[?&]idx=/.test(u)).sort();
  return out;
}

(async () => {
  const mode = process.argv[2] || 'compare';
  const now = await snap();
  if (mode === 'save') { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(now, null, 2)); console.log('저장:', FILE); console.log(JSON.stringify(now.routes), 'learnRun 흔적:', Object.values(now.pages).some(p => p.learnRun)); return; }
  const before = JSON.parse(fs.readFileSync(FILE, 'utf8')); const diff = [];
  for (const k of Object.keys(before.routes)) before.routes[k] !== now.routes[k] && diff.push(`주소 ${k}: ${before.routes[k]} → ${now.routes[k]}`);
  for (const u of Object.keys(before.pages)) { const a = before.pages[u], b = now.pages[u] || {};
    a.status !== b.status && diff.push(`${u} 상태 ${a.status} → ${b.status}`);
    JSON.stringify(a.scriptHosts) !== JSON.stringify(b.scriptHosts) && diff.push(`${u} 스크립트 출처 달라짐: +[${(b.scriptHosts || []).filter(x => !a.scriptHosts.includes(x))}] -[${a.scriptHosts.filter(x => !(b.scriptHosts || []).includes(x))}]`);
    JSON.stringify(a.iframes) !== JSON.stringify(b.iframes) && diff.push(`${u} iframe 달라짐: ${JSON.stringify(b.iframes)}`);
    !a.learnRun && b.learnRun && diff.push(`${u} 런런 흔적이 남아 있어요`); }
  for (const id of Object.keys(before.products)) { const a = before.products[id], b = now.products[id] || {};
    a.status !== b.status && diff.push(`상품 ${id} 상태 ${a.status} → ${b.status}`);
    a.hasRoomLine !== b.hasRoomLine && diff.push(`상품 ${id} [강의실] 칸: ${a.hasRoomLine} → ${b.hasRoomLine} (${b.room})`); }
  const add = now.sitemap.filter(u => !before.sitemap.includes(u)), del = before.sitemap.filter(u => !now.sitemap.includes(u));
  (add.length || del.length) && diff.push(`메뉴(사이트맵) +${JSON.stringify(add)} -${JSON.stringify(del)}`);
  console.log(diff.length ? '다른 곳 ' + diff.length + '개\n- ' + diff.join('\n- ') : '✓ 설치 전과 같아요(런런 흔적 없음)');
  process.exitCode = diff.length ? 1 : 0;
})();
