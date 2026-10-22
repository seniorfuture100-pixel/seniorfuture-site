// 읽기 쉬운 JS 원본(site/src/js/<블록>/)을 _order.json 순서대로 합쳐 블록 파일로: node tools/site/jsbuild.js [--check] [블록...]
// 결과: site/build/js/<블록>.js
// --check: 사이트에 올라가 있는 블록(site/blocks/<블록>.js)과
//   ① 뜻 지문(문자열·숫자·속성·전역 이름 개수)이 같은지
//   ② 정의 없이 쓰는 바깥 이름(전역)이 같은지 — 도우미 이름이 어긋나면 여기서 잡혀요
const fs = require('fs'), path = require('path'), acorn = require('acorn'), { pathToFileURL } = require('url');
let terser = require('terser');
const root = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2), check = args.includes('--check');
const blocks = args.filter(a => !a.startsWith('--'));
const GLOB = /^(window|document|location|history|navigator|localStorage|sessionStorage|SFUI|SF_SITE|JSON|Math|Date|Object|Array|String|Number|setTimeout|requestAnimationFrame|getComputedStyle|matchMedia|IntersectionObserver|MutationObserver|fetch|URL|URLSearchParams|Promise|RegExp|CustomEvent)$/;
function fp(ast) { const m = new Map(); const add = k => m.set(k, (m.get(k) || 0) + 1); (function w(n, p, key) { if (!n || typeof n.type !== 'string') return; if (n.type === 'Literal') { if (n.regex) add('re:' + n.regex.pattern); else if (typeof n.value === 'string') add('s:' + n.value); else if (typeof n.value === 'number' && n.value > 1) add('n:' + n.value); } if (n.type === 'TemplateElement') add('s:' + n.value.cooked); if (n.type === 'MemberExpression' && !n.computed && n.property.type === 'Identifier') add('p:' + n.property.name); if (n.type === 'Property' && !n.computed && n.key.type === 'Identifier') add('k:' + n.key.name); if (n.type === 'Identifier' && GLOB.test(n.name) && !(p && p.type === 'MemberExpression' && key === 'property' && !p.computed) && !(p && p.type === 'Property' && key === 'key')) add('g:' + n.name); for (const k in n) { if (k === 'start' || k === 'end') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(x => w(x, n, k)); else if (v && typeof v.type === 'string') w(v, n, k); } })(ast); return m; }
const norm = async c => acorn.parse((await terser.minify(c, { compress: { passes: 2, unused: false }, mangle: false, format: { comments: false } })).code, { ecmaVersion: 'latest', allowReturnOutsideFunction: true });
function build(b) {
  const dir = path.join(root, 'site/src/js', b), order = JSON.parse(fs.readFileSync(path.join(dir, '_order.json'), 'utf8'));
  return order.map(o => fs.readFileSync(path.join(dir, o.file), 'utf8').replace(/\s+$/, '') + (o.stmt ? '' : ';')).join('\n');
}
(async () => {
  let P, A;
  if (check) { const lib = f => import(pathToFileURL(path.join(root, 'node_modules/terser/lib', f)).href); P = await lib('parse.js'); A = await lib('ast.js'); await lib('scope.js'); }
  function globals(code) { const t = P.parse(code); t.figure_out_scope(); const s = new Set(); t.globals.forEach((d, k) => s.add(k)); return s; }
  const list = blocks.length ? blocks : fs.readdirSync(path.join(root, 'site/src/js'));
  let bad = 0;
  fs.mkdirSync(path.join(root, 'site/build/js'), { recursive: true });
  for (const b of list) {
    const out = build(b); fs.writeFileSync(path.join(root, 'site/build/js', b + '.js'), out);
    if (!check) { console.log(b, out.length); continue; }
    const live = fs.readFileSync(path.join(root, 'site/blocks', b + '.js'), 'utf8');
    const a = fp(await norm(live)), c = fp(await norm(out)), d = [];
    new Set([...a.keys(), ...c.keys()]).forEach(k => { const x = a.get(k) || 0, y = c.get(k) || 0; if (x !== y) d.push((x > y ? '사이트+' : '원본+') + Math.abs(x - y) + ' ' + k.slice(0, 80)); });
    const ga = globals(live), gc = globals(out), gd = [...gc].filter(k => !ga.has(k)).map(k => '원본에만 전역 ' + k).concat([...ga].filter(k => !gc.has(k)).map(k => '사이트에만 전역 ' + k));
    if (d.length || gd.length) bad++;
    console.log(b, '지문 차이', d.length, '| 전역 이름 차이', gd.length); d.concat(gd).slice(0, 30).forEach(x => console.log('   ', x));
  }
  if (check) { console.log(bad ? '다름 ' + bad : '모두 같음'); process.exit(bad ? 1 : 0); }
})();
