// 흐름4 공유(손님): 공유 버튼들 → 링크 복사(클립보드) → 카카오 공유(요청은 막고 열리는지만)
const list = await page.evaluate(() => [...document.querySelectorAll('a,button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && /공유|복사|포인트/.test(b.textContent + (b.getAttribute('aria-label') || '')); }).map(b => (b.textContent.trim() || b.getAttribute('aria-label')).replace(/\s+/g, ' ').slice(0, 30) + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)));
log('공유 관련 버튼', list);
const sh = page.locator('.sf-pv-share__btn:visible, button:has-text("공유"):visible').first();
if (await sh.count()) { await sh.click(); await page.waitForTimeout(1500);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(e => 'ERR ' + e.message)); log('클릭 후 클립보드', clip);
  log('열린 창', await page.evaluate(() => [...document.querySelectorAll('[class*=share], [class*=sheet], [class*=modal], [class*=toast]')].filter(e => e.getBoundingClientRect().height > 20 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none').slice(0, 5).map(e => e.className.toString().slice(0, 40) + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 100))));
  await page.screenshot({ path: process.env.SH + '-a.jpg', type: 'jpeg', quality: 70 });
  const k = page.locator(':is(a,button):has-text("카카오톡"):visible').first();
  if (await k.count()) { await k.click().catch(() => {}); await page.waitForTimeout(2000); log('카카오 공유 누른 뒤 url', page.url()); }
  else log('카카오톡 공유 버튼 없음');
}
