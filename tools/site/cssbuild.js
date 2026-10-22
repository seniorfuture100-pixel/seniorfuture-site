// 화면별 CSS 원본(site/src/css/<블록>/)을 _order.json 순서대로 합쳐 한 줄로 압축: node tools/site/cssbuild.js [--check] [블록...]
// 결과: site/build/css/<블록>.css
// --check: 사이트에 올라가 있는 블록(site/blocks/<블록>.css)과 규칙 하나하나가 순서까지 같은지 확인
const fs = require('fs'), path = require('path'), csstree = require('css-tree');
const root = path.resolve(__dirname, '..', '..');
const args = process.argv.slice(2), check = args.includes('--check');
const list = args.filter(a => !a.startsWith('--')); const blocks = list.length ? list : fs.readdirSync(path.join(root, 'site/src/css'));
const min = t => csstree.generate(csstree.parse(t, { parseValue: false, parseCustomProperty: false }));
let bad = 0;
fs.mkdirSync(path.join(root, 'site/build/css'), { recursive: true });
for (const b of blocks) {
  const dir = path.join(root, 'site/src/css', b), order = JSON.parse(fs.readFileSync(path.join(dir, '_order.json'), 'utf8'));
  const out = min(order.map(o => fs.readFileSync(path.join(dir, o.file), 'utf8')).join('\n'));
  fs.writeFileSync(path.join(root, 'site/build/css', b + '.css'), out);
  if (!check) { console.log(b, out.length); continue; }
  const want = min(fs.readFileSync(path.join(root, 'site/blocks', b + '.css'), 'utf8'));
  if (want === out) console.log(b, '같음', out.length);
  else { bad++; let i = 0; while (i < out.length && out[i] === want[i]) i++; console.log(b, '다름 @', i, JSON.stringify(out.slice(i - 40, i + 60)), '\n   사이트', JSON.stringify(want.slice(i - 40, i + 60))); }
}
if (check) { console.log(bad ? '다름 ' + bad : '모두 같음'); process.exit(bad ? 1 : 0); }
