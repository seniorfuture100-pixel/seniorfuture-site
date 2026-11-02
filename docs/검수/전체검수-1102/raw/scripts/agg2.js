// 1차·2차 측정 비교 → 기준 이탈 묶음(두 번 다 나오면 확인됨). node agg2.js <measure> <measure2> <출력.json>
const fs = require('fs'), path = require('path');
const load = M => Object.fromEntries(fs.readdirSync(path.join(M, 'json')).map(f => { const r = JSON.parse(fs.readFileSync(path.join(M, 'json', f), 'utf8')); return [r.id + '@' + r.W, r]; }));
const A = load(process.argv[2]), B = load(process.argv[3]);
const STD = { h1: [26, 32], h2: [20, 24], h3: [18, 18], 본문: [16, 16], 보조: [14, 14], 캡션: [13, 13] };
const findings = []; // {kind, key, page, W, detail, confirmed}
const textDev = r => { const out = {}; (r.texts || []).forEach(t => { const mo = r.W < 768, s = STD[t.role], std = s ? (mo ? s[0] : s[1]) : null;
  const big = t.fs >= 18 || (t.fs >= 14 && t.fw >= 700), bad = [];
  if (t.fs <= 12) bad.push('12px이하'); else if (mo && t.fs < 14 && !/캡션|태그/.test(t.role)) bad.push('휴대폰14미만'); else if (mo && t.fs < 13) bad.push('13미만');
  if (t.role === '본문' && t.len > 40 && t.lh < 1.5) bad.push('줄간격' + t.lh);
  if (t.cr != null && t.cr < (big ? 3 : 4.5)) bad.push('대비');
  if (std && Math.abs(t.fs - std) > 1) bad.push('토큰차' + (t.fs - std).toFixed(1));
  bad.forEach(b => { const k = t.zone + '|' + t.role + '|' + t.sel + '|' + b.replace(/[\d.-]+$/, ''); out[k] = out[k] || Object.assign({ b, n: 0 }, t); out[k].n++; }); }); return out; };
const pages = Object.keys(A).filter(k => B[k]);
const textAll = {};
pages.forEach(k => { const a = textDev(A[k]), b = textDev(B[k]);
  Object.keys(a).forEach(x => { const t = a[x], key = x; (textAll[key] = textAll[key] || { zone: t.zone, role: t.role, sel: t.sel, b: t.b, fs: t.fs, fw: t.fw, lh: t.lh, cr: t.cr, color: t.color, bg: t.bg, ex: t.t, pages: [], conf: 0, tot: 0 }); textAll[key].pages.push(k); textAll[key].tot++; if (b[x]) textAll[key].conf++; }); });
// 배치
const lay = [];
pages.forEach(k => { const a = A[k], b = B[k], mo = a.W < 768;
  const push = (kind, detail, ok2) => lay.push({ kind, page: k, path: a.path, detail, confirmed: !!ok2 });
  if (a.wide > 0) push('가로넘침', a.wide + 'px ' + (a.wideBy || []).join(' '), b.wide > 0);
  if (a.cls > 0.1) push('CLS', a.cls + ' ' + JSON.stringify((a.ls || []).filter(x => x.v > 0.02).slice(0, 3)), b.cls > 0.1);
  const mv = (a.moved || []).filter(m => !/hb-|sf-hb|onair|bubble|chip/.test(m.el));
  const mv2 = (b.moved || []).filter(m => !/hb-|sf-hb|onair|bubble|chip/.test(m.el));
  if (mv.length) push('3초밀림', mv.length + '개 ' + mv.slice(0, 4).map(m => m.el + '[' + m.t + '] ' + m.from.join(',') + '→' + m.to.join(',')).join(' | '), mv2.length > 0);
  const sm = (a.small || []).filter(x => x.zone !== '푸터'), sm2 = (b.small || []).filter(x => x.zone !== '푸터');
  if (sm.length) push('작은터치', sm.length + '개 ' + sm.slice(0, 6).map(x => x.w + 'x' + x.h + ' ' + x.zone + ' ' + (x.t || x.sel.slice(-30))).join(' | '), sm2.length > 0);
  if ((a.over || []).length) push('겹침', a.over.length + '개 ' + a.over.slice(0, 2).map(o => o.a + ' ⟷ ' + o.b + ' ' + o.ox + 'x' + o.oy).join(' | '), (b.over || []).length > 0);
  if ((a.imgs || []).length) push('깨진그림', a.imgs.join(' '), (b.imgs || []).length > 0);
  if (a.noAlt) push('alt없음', a.noAlt + '개', b.noAlt > 0);
  if ((a.bigImg || []).length) push('400KB넘는그림', a.bigImg.join(' | '), (b.bigImg || []).length > 0);
  if ((a.unnamed || []).length) push('이름없는버튼', a.unnamed.slice(0, 4).join(' | '), (b.unnamed || []).length > 0);
  if ((a.dupId || []).length) push('중복id', a.dupId.join(','), (b.dupId || []).length > 0);
  // 섹션 좌우 여백: 휴대폰 16, PC 는 페이지에서 가장 흔한 값과 다른 섹션
  const secs = (a.secs || []).filter(s => s.ink && !/header|footer|tabbar/.test(s.name));
  secs.forEach(s => { if (mo && (Math.abs(s.ink.L - 16) > 2 || Math.abs(s.ink.R - 16) > 2) && s.h > 60) push('휴대폰여백', '#' + s.n + ' ' + (s.id || s.name).slice(0, 30) + ' L' + s.ink.L + ' R' + s.ink.R, (b.secs || []).some(z => z.n === s.n && z.ink && (Math.abs(z.ink.L - 16) > 2 || Math.abs(z.ink.R - 16) > 2))); });
  secs.forEach(s => { if (s.rowTopDiff > 2) push('카드위맞춤', '#' + s.n + ' ' + (s.id || s.name).slice(0, 30) + ' 같은 줄 위치차 ' + s.rowTopDiff + 'px', (b.secs || []).some(z => z.n === s.n && z.rowTopDiff > 2)); });
  // 주 버튼(주황·검정 채움) 높이·모서리
  (a.secs || []).forEach(s => (s.btns || []).forEach(x => { if (/255, 111, 15|30, 30, 30|31, 31, 31|17, 17, 17|33, 33, 33/.test(x.bg) && x.h >= 36 && x.h <= 70 && (Math.abs(x.h - 52) > 2 || x.r !== '12px')) push('주버튼', x.t + ' ' + x.w + 'x' + x.h + ' r' + x.r + ' ' + x.bg, (b.secs || []).some(z => (z.btns || []).some(y => y.t === x.t && y.h === x.h && y.r === x.r))); }));
});
fs.writeFileSync(process.argv[4], JSON.stringify({ text: Object.values(textAll).sort((x, y) => y.tot - x.tot), lay }, null, 1));
console.log('text groups', Object.keys(textAll).length, 'lay', lay.length, 'confirmed lay', lay.filter(x => x.confirmed).length);
