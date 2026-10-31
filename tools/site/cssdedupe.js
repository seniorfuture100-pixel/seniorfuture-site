// CSS 안전 정리 (10/31): 결과(최종 스타일)가 이론적으로 같은 것만 지워요.
//   ① 같은 자리(같은 @media/@supports 안)에서 '선택자 + 선언 전체'가 완전히 같은 규칙이 여러 번 → 마지막 하나만 남김
//      (CSS 는 같은 우선순위면 뒤에 쓴 것이 이겨요. 뒤에 똑같은 규칙이 다시 있으니 앞의 것은 결과에 영향이 없어요)
//   ② 한 규칙 안에 같은 속성·같은 값·같은 !important 가 두 번 → 뒤의 하나만 남김
//   값이 다른 같은 속성(예: 옛 브라우저용 대비값)은 건드리지 않아요.
// 사용: const { dedupe } = require('./cssdedupe'); dedupe(cssText) → { css, removedRules, removedDecls }
//       node tools/site/cssdedupe.js dist/sf.min.css  → 얼마나 줄어드는지만 출력
const csstree = require('css-tree');

function dedupe(text) {
  const ast = csstree.parse(text, { parseValue: false, parseAtrulePrelude: false, parseRulePrelude: false, parseCustomProperty: false });
  let removedRules = 0, removedDecls = 0;
  // ② 규칙 안 중복 선언
  csstree.walk(ast, {
    visit: 'Rule', enter(rule) {
      const seen = new Map(), list = rule.block.children, kill = [];
      list.forEach((d, item) => {
        if (d.type !== 'Declaration') return;
        const k = d.property + '\u0000' + csstree.generate(d.value).trim() + '\u0000' + (d.important ? 1 : 0);
        if (seen.has(k)) kill.push(seen.get(k));
        seen.set(k, item);
      });
      kill.forEach(it => { list.remove(it); removedDecls++; });
    }
  });
  // ① 같은 목록(같은 at-rule 안) 안의 완전히 같은 규칙 — 마지막만 남김
  function pass(children) {
    if (!children) return;
    const last = new Map(), items = [];
    children.forEach((n, item) => { if (n.type === 'Rule') { const k = csstree.generate(n); last.set(k, item); items.push([k, item]); } });
    items.forEach(([k, item]) => { if (last.get(k) !== item) { children.remove(item); removedRules++; } });
    children.forEach(n => { if (n.type === 'Atrule' && n.block) pass(n.block.children); });
  }
  pass(ast.children);
  // ③ 같은 자리에서 뒤에 '완전히 같은 선택자' 규칙이 같은 속성을 다시 정하면(중요도도 같거나 더 셈) 앞 규칙의 그 줄은 적용될 일이 없어요 → 지움
  //    뒤 값이 일부 브라우저가 모르는 새 기능이면(앞 줄이 대비값일 수 있어서) 남겨요. 비어 버린 규칙은 지움
  const NEW = /color-mix\(|light-dark\(|\b\d*\.?\d+(dvh|svh|lvh|dvw|svw|lvw|cqw|cqh|cqi|cqb)\b|anchor\(|-webkit-|-moz-|-ms-|@/;
  let removedOver = 0;
  function over(children) {
    if (!children) return;
    const later = new Map(); // 선택자 → { 속성|중요도: true } (뒤에서부터 모음)
    const rules = []; children.forEach((n, item) => rules.push([n, item]));
    for (let i = rules.length - 1; i >= 0; i--) {
      const [n, item] = rules[i];
      if (n.type === 'Atrule' && n.block) { over(n.block.children); continue; }
      if (n.type !== 'Rule') continue;
      const sel = csstree.generate(n.prelude).trim(), L = later.get(sel) || new Map();
      const kill = [];
      n.block.children.forEach((d, it) => {
        if (d.type !== 'Declaration') return;
        const hit = L.get(d.property);
        if (hit && (hit.imp || !d.important)) kill.push(it);
      });
      kill.forEach(it => { n.block.children.remove(it); removedOver++; });
      // 이 규칙의 선언을 '뒤에 있는 것'으로 등록(새 기능 값은 등록 안 함 → 앞 줄을 지우지 않게)
      n.block.children.forEach(d => {
        if (d.type !== 'Declaration' || d.property.startsWith('--')) return;
        if (NEW.test(csstree.generate(d.value))) return;
        const cur = L.get(d.property); L.set(d.property, { imp: !!(d.important || (cur && cur.imp)) });
      });
      later.set(sel, L);
      if (n.block.children.isEmpty) { children.remove(item); removedRules++; }
    }
  }
  over(ast.children);
  return { css: csstree.generate(ast), removedRules, removedDecls, removedOver };
}
module.exports = { dedupe };

if (require.main === module) {
  const fs = require('fs'), zlib = require('zlib');
  const t = fs.readFileSync(process.argv[2] || 'dist/sf.min.css', 'utf8'), r = dedupe(t);
  const br = s => zlib.brotliCompressSync(Buffer.from(s)).length;
  console.log('규칙', r.removedRules, '선언', r.removedDecls, '덮인 줄', r.removedOver, '| 크기', t.length, '→', r.css.length, '| br', br(t), '→', br(r.css));
}
