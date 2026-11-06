const fs = require('fs'), path = require('path'), {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(root, 'dist/sf.min.css'), 'utf8');
const auth = fs.readFileSync(path.join(root, 'site/src/js/patch/08-authView.js'), 'utf8');
const out = path.resolve(root, '../../outputs/mobile-auth-1106');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const br=await chromium.launch({channel:'chrome'}); const results=[];
 for(const width of [320,390,1280]) for(const native of [false,true]) for(const provider of ["kakao","naver","google"]) {
  const page=await br.newPage({viewport:{width,height:844}});
  await page.route('https://**/*',r=>r.abort());
  await page.setContent(`<style>${css}</style><body class="login"><div class="widget login"><div class="sns_login_form"><p><a class="btn btn-kakao" href="/kakao">카카오</a></p><p><a class="btn btn-naver" href="/naver">네이버</a></p><p><a class="btn btn-google" href="/google">구글</a><span class="login_lately ${provider}">최근 로그인</span></p></div><form><div class="input_form"><input name="uid" placeholder="이메일"></div><div class="input_form"><input name="passwd" placeholder="비밀번호"></div><button class="btn-primary">로그인</button></form><div class="over_h"><a onclick="FindPassword()">비밀번호 찾기</a>${native?'<a href="/native-join" onclick="openJoin()">가입</a>':''}<a class="float_l non_btn" href="/guest">비회원 주문배송 조회</a></div></div><div data-sf-rooms><div class="sf-room-meta"><span class="sf-badge" data-tone="wait">입금 대기</span>${['plan','meet','pre','on','end',''].map(t=>`<span class="sf-badge" ${t?'data-tone="'+t+'"':''}>${t||'처리중'}</span>`).join('')}</div></div><script>var SFUI={register:function(n,f){f()},once:function(){return true}};</script><script>${auth}</script></body>`);
  const r=await page.evaluate(()=>({join:[...document.querySelectorAll('.sf-auth__join')].map(a=>({text:a.textContent,href:a.getAttribute('href'),onclick:a.getAttribute('onclick'),visible:!!a.getBoundingClientRect().height})),guest:document.querySelector('a[href="/guest"]').textContent,badges:[...document.querySelectorAll('.sf-badge')].map(b=>getComputedStyle(b).display!=='none'),recentHidden:!document.querySelector(".login_lately"),guestPlain:(()=>{const a=document.querySelector(".sf-auth__guest");return a&&getComputedStyle(a).borderTopWidth==="0px"&&a.parentElement===a.closest(".sf-auth").lastElementChild})(),overflow:document.documentElement.scrollWidth-innerWidth}));
  if(!r.recentHidden||!r.guestPlain||r.join.length!==1||!r.join[0].visible||r.guest!=='비회원 주문조회'||r.overflow>1||!r.badges[0]||r.badges.slice(1).some(v=>v!==(width>=768))||(native?r.join[0].onclick!=='openJoin()':r.join[0].href!=='/site_join_pattern_choice')) throw Error(JSON.stringify({width,native,r}));
  if(width===390&&!native&&provider==="google") await page.screenshot({path:path.join(out,'mobile-local-preview.png'),fullPage:true});
  results.push({width,native,provider,...r}); await page.close();
 }
 await br.close(); fs.writeFileSync(path.join(out,'fixture-results.json'),JSON.stringify(results,null,2)); console.log('PASS: 18 cases; recent-login hidden, guest plain link at bottom; only pending badge on mobile, desktop unchanged; signup absent/present, guest link preserved.');
})().catch(e=>{console.error(e);process.exit(1)});
