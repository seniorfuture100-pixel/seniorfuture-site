// 코드 나누기 전 의존 관계 보기 (10/31): node tools/site/deps.js
//   파일마다 만드는 공용 이름(SFUI.x = / window.x = / SF_x =)과 쓰는 공용 이름을 모아,
//   '이 파일이 만든 이름을 다른 어느 파일이 쓰는지'를 보여 줘요. 화면별 묶음으로 뗄 때 같이 가야 할 파일을 찾는 용도예요.
const fs = require('fs'), path = require('path');
const src = path.resolve(__dirname, '..', '..', 'site', 'src', 'js');
const BLOCKS = ['ui', 'patch', 'r2', 'r3', 'r3b'];
const CORE = new Set(['register', 'init', 'once', 'store', 'parseDate']);
const files = [];
for (const b of BLOCKS) for (const o of JSON.parse(fs.readFileSync(path.join(src, b, '_order.json'), 'utf8'))) {
  const f = path.join(src, b, o.file); if (!fs.existsSync(f)) continue;
  files.push({ id: b + '/' + o.file, t: fs.readFileSync(f, 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '') });
}
const def = {}, use = {};
for (const f of files) {
  f.defs = new Set(); f.uses = new Set();
  for (const m of f.t.matchAll(/\b(?:SFUI\.([A-Za-z_$][\w$]*)|window\.((?:SF|__sf|sf)[\w$]*)|\b(SF_[A-Z_]+))\s*=(?!=)/g)) f.defs.add(m[1] ? 'SFUI.' + m[1] : (m[2] || m[3]));
  for (const m of f.t.matchAll(/\bSFUI\.([A-Za-z_$][\w$]*)|\bwindow\.((?:SF|__sf|sf)[\w$]*)|\b(SF_[A-Z_]+)\b|\b(__sf[\w$]*)\b/g)) {
    const n = m[1] ? 'SFUI.' + m[1] : (m[2] || m[3] || m[4]); if (m[1] && CORE.has(m[1])) continue; f.uses.add(n);
  }
  f.defs.forEach(n => (def[n] = def[n] || []).push(f.id));
  f.uses.forEach(n => { if (!f.defs.has(n)) (use[n] = use[n] || []).push(f.id); });
}
const want = process.argv[2]; // 파일 이름 일부를 주면 그 파일만
for (const f of files) {
  if (want && f.id.indexOf(want) < 0) continue;
  const out = [...f.defs].map(n => n + ' → ' + ((use[n] || []).join(', ') || '(아무도 안 씀)'));
  const need = [...f.uses].filter(n => !f.defs.has(n)).map(n => n + ' ← ' + ((def[n] || ['?']).join(', ')));
  console.log('\n## ' + f.id + ' (' + Math.round(f.t.length / 1024) + 'KB)');
  if (out.length) console.log('  만드는 것:\n    ' + out.join('\n    '));
  if (need.length) console.log('  쓰는 것:\n    ' + need.join('\n    '));
}
