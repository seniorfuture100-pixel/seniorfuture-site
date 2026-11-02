await page.locator(':is(a,button):has-text("이메일로 가입하기"):visible').first().click(); await page.waitForTimeout(2500);
page.on('dialog', d => { log('dialog', d.message()); d.dismiss(); });
await page.locator('#cocoaModal :is(label,span,div):has-text("모두 동의"):visible').last().click().catch(e => log('전체동의 실패', e.message.slice(0, 50))); await page.waitForTimeout(600);
const m = () => page.locator('#cocoaModal :is(a,button):text-is("가입하기"):visible').first();
if (await m().count()) { await m().click(); await page.waitForTimeout(3000); } else log('약관 창 가입하기 못 찾음');
const fields = await page.evaluate(() => [...document.querySelectorAll('#cocoaModal input:not([type=hidden]):not([type=checkbox]):not([type=radio]), #cocoaModal select')].filter(e => e.getBoundingClientRect().height > 0).map(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return (e.name || e.placeholder || e.type).slice(0, 18) + ' ' + Math.round(r.height) + 'h r' + s.borderTopLeftRadius + ' fs' + s.fontSize; }));
log('입력칸', fields);
log('필수 표시', await page.evaluate(() => [...document.querySelectorAll('#cocoaModal *')].filter(e => e.getBoundingClientRect().height > 0 && e.children.length === 0 && /^\*$|^필수$/.test(e.textContent.trim())).slice(0, 4).map(e => e.textContent.trim() + ' ' + getComputedStyle(e).color)
  .concat([...document.querySelectorAll('#cocoaModal [class*=require]')].slice(0, 3).map(e => 'class ' + e.className + ' ::after ' + getComputedStyle(e, '::after').content + ' ' + getComputedStyle(e, '::after').color + ' ' + getComputedStyle(e, '::after').backgroundColor))));
await page.screenshot({ path: process.env.SH + '-form.jpg', type: 'jpeg', quality: 70 });
const sub = page.locator('#cocoaModal :is(a,button,input[type=submit]):has-text("가입하기"):visible, #cocoaModal input[type=submit]:visible').last();
if (await sub.count()) { await sub.click().catch(e => log('클릭실패', e.message.slice(0, 60))); await page.waitForTimeout(2000);
  log('빈칸 제출 뒤 문구', await page.evaluate(() => [...document.querySelectorAll('#cocoaModal *, .alert, .toast, [role=alert]')].filter(e => e.getBoundingClientRect().height > 0 && e.children.length === 0 && /입력|필수|확인|선택|올바/.test(e.textContent) && e.textContent.trim().length < 60).slice(0, 8).map(e => e.textContent.trim() + ' | ' + getComputedStyle(e).color + ' ' + getComputedStyle(e).fontSize)));
  log('제출 뒤 url', page.url().replace('https://seniorfuture.kr', ''));
  //, d => { log('dialog', d.message()); d.dismiss(); });
}


