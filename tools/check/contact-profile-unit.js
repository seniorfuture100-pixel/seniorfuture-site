// DOM 밖에서 검사할 수 있는 경계: 복귀 주소·누락 판정. 실제 아임웹 저장 시험을 대신하지 않아요.
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const source = fs.readFileSync(path.resolve(__dirname, '../../site/src/js/ui/01-iife.js'), 'utf8');
const win = {}, doc = {cookie:'',readyState:'loading',addEventListener(){}};
vm.runInNewContext(source, {window:win,document:doc,console});
const cp = win.SFUI.checkoutProfile;
let checks=0;
function equal(a,b) { assert.equal(a,b); checks++; }
equal(cp.safeReturn('/shop_payment/?order_code=fixture&case=1'),'/shop_payment/?order_code=fixture&case=1');
for(const bad of ['https://example.test/shop_payment/','//example.test/shop_payment/','/shop_mypage/','/shop_payment/?x=" onclick="evil','/shop_payment/?x=<script>','/shop_payment/?x=\n','/shop_payment/?x=\\evil','/shop_payment/#fragment','/shop_payment/?x=한글']) equal(cp.safeReturn(bad),'');
equal(Array.from(cp.missing({name:'시험',phone:'00000000000',email:'qa@example.test'})).join(','),'');
equal(Array.from(cp.missing({name:'',phone:'',email:''})).join(','),'이름,연락처,이메일');
equal(Array.from(cp.missing({name:'시험',phone:'123',email:'bad'})).join(','),'연락처,이메일');
console.log(JSON.stringify({passed:checks,scope:'Pure validation and redirect boundary; no external requests or customer data'}));
