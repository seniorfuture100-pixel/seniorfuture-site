// Local-only regression: delayed FAQ, tab stability, hidden-panel focus and re-init.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const css = fs.readFileSync(path.join(root, 'dist/sf.min.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'dist/sf.min.js'), 'utf8');
const widget = fs.readFileSync(path.join(root, 'site/widgets/help.code.html'), 'utf8');
const board = n => '<div class="li_board"><ul class="li_header"><li class="tit">제목</li></ul>' + Array.from({length:n}, (_,i) => '<ul class="li_body"><li class="tit"><a class="list_text_title" href="/faq/?bmode=view&idx='+i+'">질문 '+i+'</a></li><li class="time" title="2026-11-28">2026-11-28</li></ul>').join('') + '</div>';
(async () => {
  const browser = await chromium.launch({channel:process.env.PW_CHANNEL || 'chrome'});
  try {
    for (const width of [390,1280]) {
      const page = await browser.newPage({viewport:{width,height:844}});
      page.on('pageerror', e => console.error('PAGE',e.message));
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await page.route('**/*', async route => {
        if (new URL(route.request().url()).pathname === '/faq/') {
          await gate;
          return route.fulfill({contentType:'text/html',body:'<div data-widget-type="board">'+board(2)+'</div>'});
        }
        if (new URL(route.request().url()).pathname !== '/help') return route.abort();
        return route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div class="section_wrap"><div class="sf-scope">'+widget+'</div><div doz_type="widget"><div data-widget-type="board">'+board(1)+'</div></div></div><div id="doz_footer_wrap"><footer id="doz_footer">footer</footer></div>'});
      });
      await page.goto('https://fixture.test/help', {waitUntil:'domcontentloaded'});
      await page.addScriptTag({content:js});
      await page.evaluate(() => SFUI.init(document));
      await page.waitForSelector('.sf-help-panels',{timeout:3000});
      const y = () => page.locator('#doz_footer_wrap').evaluate(e => e.getBoundingClientRect().top + scrollY);
      const initial = await y(); release();
      await page.waitForSelector('.sf-faq-list');
      const ready = await y();
      await page.getByRole('tab',{name:'공지사항',exact:true}).click();
      const notice = await y();
      if (await page.locator('#faq').isVisible()) throw Error('inactive FAQ remains visible');
      await page.getByRole('tab',{name:'자주 묻는 질문',exact:true}).click();
      const faq = await y();
      if (Math.max(initial,ready,notice,faq)-Math.min(initial,ready,notice,faq)>1) throw Error('footer shift '+JSON.stringify({initial,ready,notice,faq}));
      await page.evaluate(() => { SFUI.init(document); window.__sfR2(); SFUI.init(document); });
      if (await page.locator('.sf-help-panels').count() !== 1) throw Error('duplicate panels');
      console.log('PASS '+width+' '+JSON.stringify({initial,ready,notice,faq}));
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
