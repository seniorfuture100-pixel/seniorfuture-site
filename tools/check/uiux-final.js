// 최종 운영 버전: 공개 경로의 HTTP·가로 넘침·JS 예외 확인. 시각 검사는 uiux.js 결과와 함께 봐요.
const {chromium,devices}=require('playwright'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),rows=[];
 const before=JSON.parse(fs.readFileSync('report/uiux-device-before/uiux.json'));
 for(const width of [390,1280]){
  const c=await b.newContext({...width===390?devices['Pixel 7']:{},viewport:{width,height:860},locale:'ko-KR'});
  for(const url of Object.keys(before).filter(k=>k.endsWith(' @'+width)).map(k=>k.split(' @')[0])){
   const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   const res=await p.goto('https://seniorfuture.kr'+url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForTimeout(800);
   const m=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return{version:window.SF_VER,width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),ttfb:Math.round(n.responseStart),dcl:Math.round(n.domContentLoadedEventEnd)}});
   rows.push({url,width,status:res.status(),...m,errors});fs.writeFileSync('report/uiux-final.json',JSON.stringify(rows,null,2));console.log(url,width,m.version,m.overflow,errors.length);
   await p.close();await new Promise(r=>setTimeout(r,1500));
  }await c.close();
 }await b.close();
 if(rows.some(r=>r.status!==200||r.version!==fs.readFileSync('dist/VERSION','utf8').trim()||r.overflow>1||r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
