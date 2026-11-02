// 흐름3 멤버십 103: PC 라디오 → 버튼 문구 하나만 / 휴대폰 두 버튼 → 시트
const mo = page.viewportSize().width < 768, out = [];
const btns = () => page.evaluate(() => [...document.querySelectorAll('a.buy, a._btn_buy, a._buy_regularly')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden'; }).map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return b.textContent.trim() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + s.backgroundColor; }));
const sheet = () => page.evaluate(() => { const t = [...document.querySelectorAll('.r3-sheet, [class*=sheet], .modal, #cocoaModal, [class*=option]')].filter(e => e.getBoundingClientRect().height > 40 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'); return t.slice(0, 4).map(e => (e.id || e.className.toString()).slice(0, 40) + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 90)); });
if (!mo) {
  out.push(['처음 버튼', await btns()]);
  await page.click('label:has-text("정기구독")'); await page.waitForTimeout(800); out.push(['정기구독 고른 뒤', await btns()]);
  await page.click('label:has-text("1회 구매")'); await page.waitForTimeout(800); out.push(['1회 구매 고른 뒤', await btns()]);
  await page.click('label:has-text("정기구독")'); await page.waitForTimeout(500);
  await page.locator('a._btn_buy:visible, a._buy_regularly:visible').first().click(); await page.waitForTimeout(2500); out.push(['정기구독 신청 클릭', page.url().replace('https://seniorfuture.kr', ''), await sheet()]);
} else {
  out.push(['처음 버튼', await btns()]);
  await page.locator('a._buy_regularly:visible').first().click(); await page.waitForTimeout(2500); out.push(['정기구독 신청 클릭', page.url().replace('https://seniorfuture.kr', ''), await sheet()]);
  await page.screenshot({ path: process.env.SH + '-reg.jpg', type: 'jpeg', quality: 70 });
  await page.goto(page.url()); await page.waitForTimeout(3000);
  await page.locator('a.bg-brand.buy:visible').first().click(); await page.waitForTimeout(2500); out.push(['1회 수강 신청 클릭', page.url().replace('https://seniorfuture.kr', ''), await sheet()]);
}
log(out);
