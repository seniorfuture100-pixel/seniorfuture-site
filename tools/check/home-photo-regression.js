// 운영/후보 홈 전문가 명단·크롭·지연 로딩 비교. 운영 데이터 변경 없음.
const {chromium,devices}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),rows=[];
 for(const local of [false,true]){
  const c=await b.newContext({...devices['Pixel 7'],viewport:{width:390,height:844}}),p=await c.newPage(),requests=[];
  if(local)await c.route(/seniorfuture-site@[^/]+\/dist\/(sf\.min\.(?:css|js))/,r=>r.fulfill({path:path.resolve('dist',r.request().url().match(/sf\.min\.(?:css|js)/)[0]),contentType:r.request().url().includes('.css')?'text/css':'application/javascript'}));
  p.on('request',r=>requests.push(r.url()));
  await p.goto('https://seniorfuture.kr/',{waitUntil:'load'});await p.waitForTimeout(2500);
  const read=()=>p.evaluate(()=>[...document.querySelectorAll('.sf-expert10')].map(e=>{const ph=e.querySelector('.sf-expert10__ph'),img=ph?.querySelector('img'),s=ph&&getComputedStyle(ph);return{name:e.querySelector('strong')?.textContent,copy:e.textContent,href:e.querySelector('a')?.getAttribute('href'),src:img?.src||s?.backgroundImage.replace(/^url\(["']?|["']?\)$/g,''),width:ph?.getBoundingClientRect().width,height:ph?.getBoundingClientRect().height,crop:img?getComputedStyle(img).objectPosition:s?.backgroundPosition,loaded:img?img.complete&&img.naturalWidth>0:null}}));
  const initial=await read(),requestedBefore=initial.filter(x=>requests.includes(x.src)).length;
  await p.locator('.sf-experts10').scrollIntoViewIfNeeded();await p.waitForTimeout(3000);
  await p.locator('.sf-expert10').last().scrollIntoViewIfNeeded();await p.waitForTimeout(3000);
  const final=await read();await p.screenshot({path:'report/expert-'+(local?'candidate':'baseline')+'.png'});
  rows.push({local,version:await p.evaluate(()=>window.SF_VER),requestedBefore,requestedAfter:final.filter(x=>requests.includes(x.src)).length,cards:final});await c.close();
 }
 assert.deepEqual(rows[0].cards.map(({loaded,...x})=>x),rows[1].cards.map(({loaded,...x})=>x));
 fs.writeFileSync('report/home-photo-regression.json',JSON.stringify(rows,null,2));console.log(rows.map(r=>({local:r.local,version:r.version,count:r.cards.length,requestedBefore:r.requestedBefore,requestedAfter:r.requestedAfter,loaded:r.cards.filter(x=>x.loaded).length})));
 await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
