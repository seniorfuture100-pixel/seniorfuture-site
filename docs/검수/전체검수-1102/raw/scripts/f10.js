// 흐름10 기업 문의·파트너 지원 폼: 칸·필수 표시·제출 버튼(제출 안 함). 폼이 iframe 이면 주소만
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } });
const r = await page.evaluate(() => {
  const vis = e => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
  const f = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(vis).filter(e => !e.closest('#doz_header_wrap, header, #cocoaModal'));
  const ifr = [...document.querySelectorAll('iframe')].filter(vis).map(i => i.src.slice(0, 80));
  const btn = [...document.querySelectorAll('a,button,input[type=submit]')].filter(vis).filter(b => /문의|지원|신청|보내|제출/.test(b.textContent || b.value) && !b.closest('#doz_header_wrap, header, footer, #doz_footer_wrap')).map(b => (b.textContent || b.value).trim().replace(/\s+/g, ' ').slice(0, 20) + ' ' + Math.round(b.getBoundingClientRect().height) + 'h ' + (b.getAttribute('href') || '').slice(0, 60));
  const anchor = location.hash ? !!document.querySelector(location.hash) : null;
  return { hash: location.hash, anchorFound: anchor, anchorY: location.hash && document.querySelector(location.hash) ? Math.round(document.querySelector(location.hash).getBoundingClientRect().top + scrollY) : null, fields: f.slice(0, 12).map(e => (e.name || e.placeholder || e.type).slice(0, 18) + ' ' + Math.round(e.getBoundingClientRect().height) + 'h r' + getComputedStyle(e).borderTopLeftRadius + (e.required ? ' 필수' : '')), iframes: ifr, buttons: btn.slice(0, 8) };
});
log(r);
