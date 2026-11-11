// Current public products and WebKit coverage. Read-only, no orders submitted.
const { chromium, webkit, devices } = require('playwright');
const fs = require('fs');
const paths = ['/course/?idx=103', '/community/?idx=113', '/community/?idx=112', '/community/?idx=111'];
(async () => {
  const rows = [];
  for (const engine of ['chromium', 'webkit']) {
    const b = await (engine === 'chromium' ? chromium.launch({ channel: 'chrome' }) : webkit.launch());
    for (const width of (engine === 'chromium' ? [390,768,1280] : [390])) {
      const c = await b.newContext(engine === 'webkit' ? { ...devices['iPhone 13'], locale:'ko-KR' } : {viewport:{width,height:900},isMobile:width<1000,locale:'ko-KR'});
      for (const path of (engine === 'webkit' ? ['/', '/course', '/live', '/insight', '/community', '/login', '/course/?idx=82', '/live/?idx=84', ...paths] : paths)) {
        const p = await c.newPage(), errors=[], failures=[];
        p.on('pageerror',e=>errors.push(e.message));
        p.on('response',r=>{if(r.status()>=400) failures.push({url:r.url().split('?')[0],status:r.status()});});
        let status=0, problem='';
        try { const r=await p.goto('https://seniorfuture.kr'+path,{waitUntil:'load',timeout:45000});status=r.status();await p.waitForTimeout(2500); }
        catch(e){problem=e.message.slice(0,120);}
        const data=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {version:window.SF_VER,url:location.pathname+location.search,overflow:document.documentElement.scrollWidth-innerWidth,ttfb:n?.responseStart,dcl:n?.domContentLoadedEventEnd,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,buyVisible:[...document.querySelectorAll('a._btn_buy')].some(e=>e.getBoundingClientRect().height>0),structuredData:!!document.querySelector('#sf-ld')};}).catch(()=>({}));
        rows.push({engine,width,path,status,problem,...data,errors,failures});
        await p.screenshot({path:'report/current-'+engine+'-'+width+'-'+path.replace(/[^a-z0-9]/gi,'_')+'.png'}).catch(()=>{});
        fs.writeFileSync('report/current-coverage.json',JSON.stringify(rows,null,2));
        console.log(engine,width,path,status,data.version,errors.length);
        await p.close();await new Promise(r=>setTimeout(r,1600));
      }
      await c.close();
    }
    await b.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
