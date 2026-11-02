const btns = () => page.evaluate(() => [...document.querySelectorAll('a.btn, button.btn')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 100 && r.height > 30 && r.y < 700 && getComputedStyle(b).visibility !== 'hidden'; }).map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return b.textContent.trim() + ' [' + b.className.toString().slice(0, 40) + '] ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + s.backgroundColor; }));
log('처음', await btns());
await page.click('label:has-text("정기구독")'); await page.waitForTimeout(1000); log('정기구독 고름', await btns());
await page.screenshot({ path: process.env.SH + '-reg.jpg', type: 'jpeg', quality: 70 });
await page.click('label:has-text("1회 구매")'); await page.waitForTimeout(1000); log('1회 구매 고름', await btns());
