// 로컬 전용 계약 시험. 아임웹·고객·실제 결제에는 접속하지 않아요.
// node tools/check/contact-profile-fixture.js → http://127.0.0.1:8774/
const http = require('http'), fs = require('fs'), path = require('path'), acorn = require('acorn');
const root = path.resolve(__dirname, '../..'), read = p => fs.readFileSync(path.join(root, p), 'utf8');
const core = read('site/src/js/ui/01-iife.js'), checkout = read('site/src/js/r3/07-iife.js');
const profile = read('site/src/js/r2/01-iife.js'), ast = acorn.parse(profile, {ecmaVersion: 2020});
let saveUI = '';
(function walk(n) { if (!n || typeof n !== 'object') return; if (n.type === 'FunctionDeclaration' && n.id.name === 'r2ProfTidy') saveUI = profile.slice(n.start, n.end); for (const k of Object.keys(n)) if (k !== 'parent') { if (Array.isArray(n[k])) n[k].forEach(walk); else if (n[k] && typeof n[k] === 'object') walk(n[k]); } })(ast);
if (!saveUI) throw Error('Native profile UI function not found');
const css = read('site/src/css/r3/65-r3-pay-10-21-주문서-간격-제목-주문-상품.css');
const cases = {};
function record(k) { return cases[k] ||= {name:'시험 회원', phone: k === 'ready' ? '00000000000' : '', account:'account@example.test', extra:'', marketing:'N', saves:0, unexpectedIdentityChange:false}; }
function form(k, p) {
  return `<form id="join_form"><input type="hidden" name="mode" value="fixture-edit"><input type="hidden" name="marker" value="preserve-me"><div class="native-fields"><div class="input_block form-group"><label class="mini-tit">이름</label><input id="join_name" name="name" value="${p.name}" required></div><div class="input_block form-group"><label class="mini-tit">연락처</label><input id="join_callnum" name="callnum" value="${p.phone}" required></div><div class="input_block form-group" id="identity"><input type="email" name="uid" readonly value="${p.account}"><input name="passwd" type="password"></div><div class="input_block form-group"><label class="mini-tit">이메일</label><input name="join_form_66073" value="${p.extra}"></div><div class="input_block form-group"><label>마케팅 수신 동의</label><input type="radio" name="marketing" value="N" checked></div><div class="input_block form-group r2-hide" id="current"><input name="passwd_org" type="password"></div><div class="input_block form-group"><button class="_join_btn" type="button">저장</button></div></div></form>`;
}
function wrap(k, body, code='') {
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>기본 정보 연동 시험 ${k}</title><style>:root{--sf-font:Arial,sans-serif}body{font-family:Arial,sans-serif;margin:16px}input,button,a{font-size:16px}input{display:block;padding:10px;max-width:100%;box-sizing:border-box}button{padding:12px}header{font-weight:bold;margin:12px 0}.r2-hide{display:none!important}.input_block{margin-bottom:16px}.r3pay-hide{display:none!important}main{max-width:1100px;margin:auto}${css}</style><body><main>${body}</main><script>window.MEMBER_HASH=${JSON.stringify(k==='guest'?'':'fixture-member')};</script><script>${core}</script><script>SFUI.shopItems=function(){return {}};SFUI.toast=function(){document.body.setAttribute('data-toast','success')};</script><script>${checkout}</script><script>${code}</script></body></html>`;
}
const sec = (h,b) => `<div><div><header>${h}</header>${b}</div></div>`;
http.createServer(async (req,res) => {
  const u = new URL(req.url,'http://127.0.0.1:8774');
  const ref = new URL(req.headers.referer || '/',u.origin);
  const k = u.searchParams.get('case') || ref.searchParams.get('case') || 'missing', p = record(k);
  res.setHeader('Cache-Control','no-store');
  if (u.pathname === '/fixture-assert') {
    let raw='';for await(const chunk of req) raw+=chunk;
    const data=new URLSearchParams(raw);
    const result={name:data.get('ordererName')===p.name,phone:data.get('ordererCall')===p.phone,email:data.get('ordererEmail')===(p.extra||p.account),identityPreserved:!p.unexpectedIdentityChange};
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));return;
  }
  if (u.pathname === '/dialog/join.cm') {
    if (k === 'failure') {res.writeHead(503);res.end('unavailable');return;}
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(form(k,p));return;
  }
  if (u.pathname === '/fixture-save') {
    let raw='';for await(const chunk of req) raw+=chunk;
    const data = new URLSearchParams(raw);
    p.unexpectedIdentityChange ||= data.get('uid')!==p.account || data.get('marketing')!==p.marketing || data.get('marker')!=='preserve-me';
    let result = {msg:'SUCCESS',mode:'edit'};
    if (k === 'save-failure') result={msg:'FAIL',flag:'passwdorg'};
    else {p.name=data.get('name');p.phone=data.get('callnum');p.extra=data.get('join_form_66073');p.saves++;}
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));return;
  }
  if(u.pathname==='/results') {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(cases));return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  if (u.pathname === '/shop_payment/') {
    const b = sec('주문 상품','<a href="/shop_view/?idx=84"><p>시험 무료 라이브</p><p>1개</p><p>0원</p></a>')+sec('주문자 정보','<div id="summary"><p>이전 주문자</p><p>11111111111</p><p>old@example.test</p><button type="button" id="edit-buyer">수정</button></div>');
    const body = `<div class="section_wrap"><div id="oms-shop-payment"><h2>주문결제</h2><div><div>${b}</div><div><div>${sec('결제 금액','<span>0원</span>')}${sec('결제 수단','<label><input type="radio" name="pay" checked>시험 결제</label>')}<button type="button" id="finish">신청하기</button><p id="final-result"></p></div></div></div></div></div>`;
    const code = `document.getElementById('edit-buyer').onclick=function(){document.getElementById('summary').innerHTML='<form><div><div><input name="ordererName" value="이전 주문자"></div><div><input name="ordererCall" value="11111111111"></div><div><input name="ordererEmail" value="old@example.test"></div></div></form>'};document.getElementById('finish').onclick=function(){var form=document.querySelector('#summary form');if(!form){document.getElementById('final-result').textContent='FIXTURE_ONLY_COMPLETED';return}fetch('/fixture-assert?case=${k}',{method:'POST',body:new URLSearchParams(new FormData(form))}).then(r=>r.json()).then(r=>{document.getElementById('final-result').textContent=JSON.stringify(r)})};`;
    res.end(wrap(k,body,code));return;
  }
  if (u.pathname === '/shop_mypage/') {
    const ret = '/shop_payment/?case='+encodeURIComponent(k);
    const code = `${saveUI};var form=document.getElementById('join_form'),btn=form.querySelector('._join_btn'),cur=document.getElementById('current');window.SITE_MEMBER={joinSubmit:function(){var data=new URLSearchParams(new FormData(form));var x=new XMLHttpRequest();x.open('POST','/fixture-save?case=${k}');x.onload=function(){var j=JSON.parse(x.responseText);SFUI.__joinDone(j);if(j.msg==='SUCCESS')location.href=${JSON.stringify(ret)}};x.send(data.toString())}};r2ProfTidy(form,document.getElementById('identity'),document.getElementById('join_name').parentElement,document.getElementById('join_callnum').parentElement,cur,btn);SFUI.checkoutProfile.setupForm(form,btn,cur);`;
    res.end(wrap(k,'<div class="r2-prof">'+form(k,p)+'</div>',code));return;
  }
  res.end(wrap('index','<h1>기본 정보 연동 계약 시험</h1>'+['missing','ready','failure','guest','save-failure'].map(k=>`<p><a href="/shop_payment/?case=${k}">${k}</a></p>`).join('')));
}).listen(8774,'127.0.0.1',()=>console.log('Local-only contact fixture: http://127.0.0.1:8774/'));
