// 코드 정리 상태 자동 확인(10/26): node tools/check/lint.js
// 실패(빨간불)로 치는 것 — 고치기 전엔 올리면 안 되는 것
//  ① 같은 이름의 화면 부품(SFUI.register)이 두 번 등록됨 → 나중 것이 앞의 것을 덮어 '가끔 두 번 생기는' 문제의 원인이었어요
//  ② 원본 폴더에 있는데 묶음 순서(_order.json)에 빠진 파일 / 순서에는 있는데 없는 파일
//  ③ 비밀값처럼 보이는 글자(API 키·토큰·비밀번호)가 원본·묶음에 들어 있음
//  ④ 묶음 JS 가 옛 브라우저(ES5) 문법을 벗어남 — 어르신 기기의 오래된 브라우저 대비
// 알림만(실패 아님): 완전히 똑같은 CSS 규칙이 여러 번, 묶음 크기
const fs = require('fs'), path = require('path'), acorn = require('acorn'), csstree = require('css-tree');
const root = path.resolve(__dirname, '..', '..'), src = path.join(root, 'site/src');
const bad = [], note = [];
const ls = d => fs.readdirSync(d, { withFileTypes: true });
const walk = d => ls(d).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = f => path.relative(root, f).replace(/\\/g, '/');

// ① 부품 이름 중복
const reg = {};
walk(path.join(src, 'js')).filter(f => f.endsWith('.js')).forEach(f => {
  const s = fs.readFileSync(f, 'utf8'), re = /SFUI\.register\(\s*["']([\w$]+)["']/g; let m;
  while ((m = re.exec(s))) (reg[m[1]] = reg[m[1]] || []).push(rel(f));
});
Object.keys(reg).forEach(k => { if (reg[k].length > 1) bad.push('부품 이름 두 번 등록: ' + k + ' — ' + reg[k].join(', ')); });

// ② 묶음 순서와 파일
['js', 'css'].forEach(t => ls(path.join(src, t)).filter(e => e.isDirectory()).forEach(e => {
  const d = path.join(src, t, e.name), of = path.join(d, '_order.json');
  if (!fs.existsSync(of)) return bad.push('묶음 순서 파일 없음: ' + rel(d));
  const order = JSON.parse(fs.readFileSync(of, 'utf8')).map(o => typeof o === 'string' ? o : o.file);
  const files = fs.readdirSync(d).filter(f => f !== '_order.json');
  files.filter(f => !order.includes(f)).forEach(f => bad.push('묶음에 빠진 파일(안 쓰이면 지우거나 순서에 넣기): ' + rel(path.join(d, f))));
  order.filter(f => !files.includes(f)).forEach(f => bad.push('순서에는 있는데 파일 없음: ' + rel(path.join(d, f))));
  const dup = order.filter((f, i) => order.indexOf(f) !== i);
  dup.forEach(f => bad.push('순서에 두 번 들어감: ' + rel(path.join(d, f))));
}));

// ③ 비밀값처럼 보이는 글자
const SECRET = [
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'sk- 키'], [/\bgh[pousr]_[A-Za-z0-9]{30,}/, '깃허브 토큰'], [/\bAKIA[0-9A-Z]{16}\b/, 'AWS 키'],
  [/AIza[0-9A-Za-z_-]{35}/, '구글 API 키'], [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '개인 키'],
  [/\b(secret_?key|client_?secret|api_?secret|access_?token|refresh_?token|password)\b\s*[:=]\s*["'][^"'\s]{8,}["']/i, '비밀값 대입'],
  [/[?&](key|secret|token)=[A-Za-z0-9]{24,}/i, '주소에 키']
];
const scan = walk(path.join(root, 'site')).concat(walk(path.join(root, 'dist')), walk(path.join(root, 'tools')), walk(path.join(root, '.github')))
  .filter(f => /\.(js|css|txt|html|json|md|ya?ml)$/.test(f) && !/node_modules/.test(f));
scan.forEach(f => {
  const s = fs.readFileSync(f, 'utf8');
  SECRET.forEach(([re, name]) => { const m = s.match(re); if (m) bad.push('비밀값처럼 보임(' + name + '): ' + rel(f) + ' — ' + m[0].slice(0, 12) + '…'); });
});

// ④ 옛 브라우저 문법(ES5)
const js = path.join(root, 'dist/sf.min.js');
if (fs.existsSync(js)) {
  try { acorn.parse(fs.readFileSync(js, 'utf8'), { ecmaVersion: 5 }); }
  catch (e) { bad.push('묶음 JS 가 ES5 문법을 벗어남: ' + e.message); }
}

// 알림: 완전히 같은 CSS 규칙(선택자+내용, 같은 @media 안)
const cssf = path.join(root, 'dist/sf.min.css');
if (fs.existsSync(cssf)) {
  const seen = new Map(); let dupN = 0;
  csstree.walk(csstree.parse(fs.readFileSync(cssf, 'utf8')), {
    visit: 'Rule', enter(node) {
      const at = this.atrule ? csstree.generate(this.atrule.prelude || { type: 'Raw', value: '' }) : '';
      const k = at + '|' + csstree.generate(node);
      if (seen.has(k)) { dupN++; if (seen.get(k) === 1) note.push('같은 CSS 규칙 여러 번: ' + csstree.generate(node.prelude).slice(0, 90)); seen.set(k, seen.get(k) + 1); }
      else seen.set(k, 1);
    }
  });
  note.unshift('완전히 같은 CSS 규칙 반복: ' + dupN + '개');
  note.push('묶음 크기 — JS ' + Math.round(fs.statSync(js).size / 1024) + 'KB, CSS ' + Math.round(fs.statSync(cssf).size / 1024) + 'KB');
}

console.log('부품 ' + Object.keys(reg).length + '개 확인');
note.slice(0, 40).forEach(x => console.log('· ' + x));
bad.forEach(x => console.log('✗ ' + x));
console.log(bad.length ? '문제 ' + bad.length + '개' : '✓ 문제 없음');
process.exit(bad.length ? 1 : 0);
