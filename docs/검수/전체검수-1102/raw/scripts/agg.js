// 측정 JSON → 01-글자.csv · 02-배치도/배치도.json · 03-오류 원자료 · 기준 이탈 목록(dev.json)
// node agg.js <measure 폴더> <결과 폴더>
const fs = require('fs'), path = require('path');
const M = process.argv[2], OUT = process.argv[3];
const files = fs.readdirSync(path.join(M, 'json')).filter(f => f.endsWith('.json'));
const R = files.map(f => JSON.parse(fs.readFileSync(path.join(M, 'json', f), 'utf8')));
// 기준(11-1102-uiux.css)
const STD = { h1: [26, 32], h2: [20, 24], h3: [18, 18], 본문: [16, 16], 보조: [14, 14], 캡션: [13, 13] };
const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const rows = [['화면', '너비', '영역', '역할', '선택자', 'font-size', 'weight', 'line-height(배)', '색', '배경', '대비', '기준', '차이', '판정', '예시 글자', '개수']];
const dev = []; // 기준 이탈
const roleCons = {}; // 역할·영역별 크기 분포(불일치 찾기)
R.forEach(r => {
  if (!r.texts) return;
  const mo = r.W < 768, g = {};
  r.texts.forEach(t => {
    const k = [t.zone, t.role, t.sel, t.fs, t.fw, t.lh, t.color, t.bg].join('|');
    (g[k] = g[k] || Object.assign({ n: 0 }, t)).n++;
  });
  Object.values(g).forEach(t => {
    const s = STD[t.role], std = s ? (mo ? s[0] : s[1]) : null, diff = std ? +(t.fs - std).toFixed(1) : '';
    const big = t.fs >= 18 || (t.fs >= 14 && t.fw >= 700), need = big ? 3 : 4.5;
    const bad = [];
    if (std && Math.abs(diff) > 1) bad.push('기준 ' + std + 'px와 ' + diff + 'px');
    if (t.fs <= 12) bad.push('12px 이하');
    else if (mo && t.fs < 14 && !/캡션|태그/.test(t.role)) bad.push('휴대폰 14px 미만');
    else if (mo && t.fs < 13) bad.push('13px 미만');
    if (t.role === '본문' && t.len > 40 && t.lh < 1.5) bad.push('본문 줄간격 ' + t.lh);
    if (t.cr != null && t.cr < need) bad.push('대비 ' + t.cr + ' < ' + need);
    rows.push([r.id, r.W, t.zone, t.role, t.sel, t.fs, t.fw, t.lh, t.color, t.bg, t.cr == null ? '' : t.cr, std || '', diff, bad.join('; ') || 'OK', t.t, t.n]);
    if (bad.length) dev.push({ page: r.id, path: r.path, W: r.W, zone: t.zone, role: t.role, sel: t.sel, fs: t.fs, fw: t.fw, lh: t.lh, cr: t.cr, bad, t: t.t, n: t.n });
    const ck = t.zone + '|' + t.role + '|' + (mo ? 'mo' : 'pc');
    (roleCons[ck] = roleCons[ck] || {})[t.fs] = (roleCons[ck][t.fs] || []).concat(r.id);
  });
});
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '01-글자.csv'), '﻿' + rows.map(r => r.map(q).join(',')).join('\n'));
fs.writeFileSync(path.join(M, 'dev-text.json'), JSON.stringify(dev));
const cons = Object.entries(roleCons).map(([k, v]) => ({ k, sizes: Object.fromEntries(Object.entries(v).map(([fs, ids]) => [fs, [...new Set(ids)].length])) }));
fs.writeFileSync(path.join(M, 'role-sizes.json'), JSON.stringify(cons, null, 1));

// 배치도
const lay = R.map(r => ({ 화면: r.id, 주소: r.path, 너비: r.W, 상태: r.status, 최종주소: r.finalUrl, 높이: r.H, 버전: r.sfv, 가로넘침: r.wide, 넘치는요소: r.wideBy, 섹션: (r.secs || []).map(s => ({ 번호: s.n, 요소: s.id ? '#' + s.id : s.name, y: s.y, 높이: s.h, 왼쪽여백: s.ink && s.ink.L, 오른쪽여백: s.ink && s.ink.R, 다음섹션까지: s.gapNext, 카드수: s.cards, 열: s.cols, 카드간격: s.cardGap, 카드너비: s.cardW, 카드모서리: s.cardRadius, 같은줄위치차: s.rowTopDiff, 버튼: s.btns })),
  작은터치: (r.small || []).filter(x => x.zone !== '푸터').length, 작은터치_목록: r.small, 겹침: r.over, 밀림_3초: r.moved, CLS: r.cls, 밀림기록: r.ls, 깨진그림: r.imgs, alt없음: r.noAlt, 큰그림: r.bigImg, 중복id: r.dupId, 이름없는버튼: r.unnamed }));
fs.mkdirSync(path.join(OUT, '02-배치도'), { recursive: true });
fs.writeFileSync(path.join(OUT, '02-배치도', '배치도.json'), JSON.stringify(lay, null, 1));
// 오류
const er = R.map(r => ({ id: r.id, W: r.W, path: r.path, errs: r.errs, fails: r.fails, bad: r.bad, err: r.err }));
fs.writeFileSync(path.join(M, 'errors.json'), JSON.stringify(er, null, 1));
console.log('pages', R.length, 'textRows', rows.length - 1, 'dev', dev.length);
