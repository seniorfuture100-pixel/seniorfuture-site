// 시험 모드가 공통 자원만 끄고 새 화면 부품은 보존하는지 확인.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
let observe, written = '';
const context = {
  window: { sessionStorage: { getItem: k => k === 'sf_stage' ? '1' : '<test>' } },
  MutationObserver: function (fn) { observe = fn; this.observe = () => {}; this.disconnect = () => {}; },
  document: { documentElement: { setAttribute() {} }, addEventListener() {}, write: s => { written = s; } }
};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname, '../../site/blocks/stage.js'), 'utf8'), context);
const node = (id, tagName, staged) => ({ nodeType: 1, id, tagName, hasAttribute: () => !!staged });
const items = [node('sf-js', 'SCRIPT'), node('sf-css', 'LINK'), node('sf-js', 'SCRIPT', true), node('sf-menu', 'DIV'), node('sf-board-empty', 'P'), node('sf-early-css', 'STYLE'), node('sf-top', 'BUTTON')];
observe([{ addedNodes: items }]);
assert.strictEqual(written, '<test>');
assert.strictEqual(items[0].type, 'text/sf-off');
assert.strictEqual(items[1].media, 'not all');
assert.deepStrictEqual(items.map(x => x.id), ['sf-js-off', 'sf-css-off', 'sf-js', 'sf-menu', 'sf-board-empty', 'sf-early-css', 'sf-top']);
console.log('PASS: original resources disabled; staged resources and dynamic UI preserved');
