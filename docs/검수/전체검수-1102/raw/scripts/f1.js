// 흐름1 손님: 홈 → 교육 분야 → 상품 82 → 수강 신청 → 로그인 창
const steps = []; let clicks = 0; const T = Date.now(); const st = (n, ok, x) => steps.push([n, ok, Date.now() - T, clicks, x || '']);
const mo = page.viewportSize().width < 768;
const catL = page.locator('a[href*="cat="]:visible').first(); const cat = (await catL.count()) ? await catL.elementHandle() : null; st('홈: 교육 분야 링크 있음', !!cat, cat ? await cat.getAttribute('href') : '');
if (cat) { clicks++; await Promise.all([page.waitForLoadState('load'), cat.click()]).catch(e => st('분야 클릭 실패', false, e.message.slice(0, 60))); await page.waitForTimeout(2500); }
st('분야 목록 도착', /course/.test(page.url()), page.url().replace('https://seniorfuture.kr', ''));
await page.evaluate(async () => { for (let y = 0; y < 3000; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } }); const cardL = page.locator('a[href*="idx=82"]:visible').first(); const card = (await cardL.count()) ? await cardL.elementHandle() : null; st('목록에 상품 82 카드', !!card);
if (card) { clicks++; await card.click().catch(() => {}); await page.waitForLoadState('load'); await page.waitForTimeout(3000); } else { await page.goto('https://seniorfuture.kr/course/?idx=82'); await page.waitForTimeout(3000); }
st('상품 82 도착', /idx=82/.test(page.url()), page.url().replace('https://seniorfuture.kr', ''));
const buy = (await page.$$('a.buy, a._btn_buy, a.btn.buy')).filter(Boolean); let b = null; for (const x of buy) if (await x.isVisible()) { b = x; break; }
st('수강 신청하기 버튼 보임', !!b, b ? await b.evaluate(e => { const r = e.getBoundingClientRect(); return e.textContent.trim() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' y' + Math.round(r.y); }) : '');
if (b) { clicks++; await b.click().catch(e => st('클릭 실패', false, e.message.slice(0, 80))); await page.waitForTimeout(3000); }
// 옵션 선택 시트가 먼저 뜨면 한 번 더
const info = await page.evaluate(() => { const vis = e => e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
  const t = document.body.innerText; const m = [...document.querySelectorAll('.modal, [class*=modal], [class*=sheet], [class*=login], [id*=login]')].filter(vis).map(e => (e.id || e.className.toString()).slice(0, 40));
  return { url: location.href.replace('https://seniorfuture.kr', ''), kakao: /카카오/.test(t) && !!document.querySelector('[class*=kakao], a[href*=kakao], button[class*=kakao]'), naver: !!document.querySelector('[class*=naver]'), google: !!document.querySelector('[class*=google]'), layers: m.slice(0, 6), optionSheet: /옵션을 선택|옵션 선택/.test(t) }; });
st('신청 클릭 뒤 화면', info.kakao || /login/.test(info.url), JSON.stringify(info));
log(steps);

