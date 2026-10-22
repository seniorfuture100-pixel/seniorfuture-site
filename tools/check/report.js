// 검사 결과(JSON)를 사람이 읽는 보고서로: node tools/check/report.js <결과.json> [보고서.md]
// 결과.json = { title, cmp: { ok, bad, pages: { 'home@390': { ok, issues: [] } } }, behave: [{ name, ok, note }] }
const fs = require('fs');
const [inp, outp] = process.argv.slice(2);
const r = JSON.parse(fs.readFileSync(inp, 'utf8'));
const L = [];
const okAll = r.cmp.ok && (r.behave || []).every(b => b.ok);
L.push('# ' + (r.title || '저장 전 자동 검사') + ' — ' + (okAll ? '✅ 저장해도 됨' : '⛔ 저장하지 말 것'));
L.push('');
L.push('- 화면 비교: ' + Object.keys(r.cmp.pages).length + '곳 중 ' + (Object.keys(r.cmp.pages).length - r.cmp.bad) + '곳 같음' + (r.cmp.bad ? ', **' + r.cmp.bad + '곳 다름**' : ''));
if (r.behave) L.push('- 동작 검사: ' + r.behave.filter(b => b.ok).length + '/' + r.behave.length + ' 통과');
L.push('');
const bad = Object.entries(r.cmp.pages).filter(([, v]) => !v.ok);
if (bad.length) {
  L.push('## 달라진 화면'); L.push('');
  bad.forEach(([k, v]) => { L.push('### ' + k); v.issues.forEach(s => L.push('- ' + String(s).slice(0, 400))); L.push(''); });
}
if (r.behave) {
  L.push('## 동작 검사'); L.push(''); L.push('| 항목 | 결과 | 메모 |'); L.push('|---|---|---|');
  r.behave.forEach(b => L.push('| ' + b.name + ' | ' + (b.ok ? '통과' : '**실패**') + ' | ' + (b.note || '') + ' |'));
}
const md = L.join('\n') + '\n';
if (outp) fs.writeFileSync(outp, md); else process.stdout.write(md);
