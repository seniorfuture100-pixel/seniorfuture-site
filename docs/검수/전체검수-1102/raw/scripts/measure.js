// 전체 검수 1102 — 화면×너비마다 글자(A)·배치(B)·오류(C)·밀림을 재요. 사이트는 바꾸지 않음(내 브라우저 안에서만 상자 그림).
// node measure.js <출력폴더> <목록.json> [너비들 예: 390,1280]
const { chromium } = require('C:/Users/ghehd/Documents/seniorfuture/seniorfuture-site/node_modules/playwright');
const fs = require('fs'), path = require('path');
const OUT = path.resolve(process.argv[2]), LIST = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const WIDTHS = (process.argv[4] || '390,1280').split(',').map(Number);
const SITE = 'https://seniorfuture.kr';
const UA_MO = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
fs.mkdirSync(path.join(OUT, 'png'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'json'), { recursive: true });

const INIT = () => {
  window.__ls = [];
  try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.hadRecentInput) return;
    window.__ls.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).slice(0, 3).map(s => { const n = s.node; return n && n.nodeType === 1 ? n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.classList && n.classList[0] ? '.' + n.classList[0] : '') : (n ? '#text' : '?'); }) }); })).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
};

// 화면 안에서 실행: 보이는 요소의 위치 기록(밀림 비교용)
const SNAP = () => {
  const deepIn = r => { const o = []; const w = n => { for (const k of n.children) { o.push(k); if (k.shadowRoot) w(k.shadowRoot); w(k); } }; w(r); return o; }; // 아임웹 새 위젯은 그림자 DOM 안
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const own = e => [].some.call(e.childNodes, n => n.nodeType === 3 && n.nodeValue.trim());
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList[0] ? '.' + e.classList[0] : '');
  const o = {}; window.__sfi = window.__sfi || 0; // 번호는 두 번 찍어도 겹치지 않게 전역으로
  deepIn(document.body).forEach(e => { if (!(own(e) || e.tagName === 'IMG' || e.tagName === 'BUTTON')) return; const r = e.getBoundingClientRect(); if (r.top > innerHeight || r.bottom < 0 || !vis(e)) return;
    e.__sfk = e.__sfk || ('k' + (window.__sfi++)); o[e.__sfk] = [Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height), nm(e), (e.textContent || e.alt || '').trim().slice(0, 20)]; });
  return o;
};

const COLLECT = () => {
  const deepIn = r => { const o = []; const w = n => { for (const k of n.children) { o.push(k); if (k.shadowRoot) w(k.shadowRoot); w(k); } }; w(r); return o; }; // 아임웹 새 위젯은 그림자 DOM 안
  const W = innerWidth, MO = W < 768;
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const own = e => [].some.call(e.childNodes, n => n.nodeType === 3 && n.nodeValue.trim());
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + [].slice.call(e.classList, 0, 2).map(c => '.' + c).join('');
  const sel = e => { const a = []; let x = e; for (let i = 0; x && x !== document.body && i < 3; i++, x = x.parentElement) a.unshift(nm(x)); return a.join('>'); };
  const zone = e => e.closest('#doz_header_wrap, .sf-hd, .sf-mh, header') ? '헤더' : e.closest('#doz_footer_wrap, .sf-ft, footer') ? '푸터' : e.closest('.sf-tabbar') ? '탭바' : e.closest('.sf-band, [class*=band], [class*=topbar]') ? '띠배너' : '본문';
  const rgb = c => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const bgOf = e => { for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.backgroundImage !== 'none') return null; const c = rgb(s.backgroundColor); if ((c[3] === undefined ? 1 : c[3]) > 0.5) return c; } return [255, 255, 255, 1]; };
  const role = (e, s, fs, fw, t) => {
    const tg = e.tagName;
    if (e.closest('input,select,textarea') || /^(INPUT|SELECT|TEXTAREA|OPTION|LABEL)$/.test(tg)) return '입력칸';
    if (e.closest('[role=tab],[role=tablist]')) return '탭';
    for (let x = e, i = 0; x && i < 4; x = x.parentElement, i++) if (/(^|[\s_-])tabs?([\s_-]|$)/i.test(typeof x.className === 'string' ? x.className : '') && !/tabbar/.test(x.className)) return '탭';
    const b = e.closest('button, [role=button], a[class*=btn], [class*=btn], a[class*=button]');
    if (b) { const bs = getComputedStyle(b); if (bs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(bs.borderTopWidth) > 0) return '버튼'; }
    if (/^H1$/.test(tg) || e.closest('h1')) return 'h1';
    if (/^H2$/.test(tg) || e.closest('h2')) return 'h2';
    if (/^H3$/.test(tg) || e.closest('h3,h4')) return 'h3';
    if (/(^|\s)[\d,]+\s?원$|^₩|^\d{1,3}(,\d{3})+$|무료$/.test(t) && t.length < 16) return '가격';
    if (parseFloat(s.borderTopLeftRadius) >= 8 && (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(s.borderTopWidth) > 0) && t.length < 14) return '태그';
    if (fw >= 600 && fs >= 14 && (e.closest('[class*=card]') || /title|tit|name/i.test(e.className + ' ' + (e.parentElement && e.parentElement.className)))) return '제목(카드)';
    if (fs >= 20 && fw >= 600) return 'h2';
    if (fs >= 17 && fw >= 600) return 'h3';
    if (fs <= 13) return '캡션';
    if (fs < 16) return '보조';
    return '본문';
  };
  const texts = [];
  const all = deepIn(document.body).filter(e => !/^(SCRIPT|STYLE|NOSCRIPT|SVG|PATH)$/i.test(e.tagName) && !e.closest('.__sfbox') && vis(e));
  all.forEach(e => {
    if (!own(e)) return;
    const s = getComputedStyle(e), t = [].filter.call(e.childNodes, n => n.nodeType === 3).map(n => n.nodeValue).join(' ').trim().replace(/\s+/g, ' ');
    if (!t) return;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.right <= 0 || r.left >= W || e.closest('svg')) return; // 넘겨진 슬라이드·아이콘 글자 제외
    const fs = parseFloat(s.fontSize), fw = +s.fontWeight || (s.fontWeight === 'bold' ? 700 : 400), lh = s.lineHeight === 'normal' ? +(fs * 1.2).toFixed(1) : parseFloat(s.lineHeight);
    const fg = rgb(s.color), bg = bgOf(e);
    let cr = null; if (bg) { const a = fg[3] === undefined ? 1 : fg[3], mix = fg.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a)); const L1 = lum(mix), L2 = lum(bg); cr = +((Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05)).toFixed(2); }
    texts.push({ zone: zone(e), role: role(e, s, fs, fw, t), sel: sel(e), fs, fw, lh: +(lh / fs).toFixed(2), lhPx: lh, color: s.color, bg: bg ? 'rgb(' + bg.slice(0, 3).join(',') + ')' : '그림', cr, y: Math.round(r.top + scrollY), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), t: t.slice(0, 30), len: t.length });
  });
  // 섹션: 아임웹 섹션 + 헤더·푸터
  const fixd = b => { for (let x = b; x; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const H0 = e => e.getBoundingClientRect().height;
  const split = e => { let x = e; for (let i = 0; i < 12; i++) { const k = [].filter.call(x.children, c => vis(c) && H0(c) > 8 && !fixd(c) && !/section_bg/.test(c.className) && c.querySelector('img, video, iframe, a, p, span, strong, h1, h2, h3, li')); if (k.length === 1 && H0(k[0]) >= H0(x) * 0.8) x = k[0]; else return k.length >= 2 ? k : [e]; } return [e]; };
  const secEls = [].concat.apply([], [].filter.call(document.querySelectorAll('#doz_header_wrap, .section_wrap, #doz_footer_wrap, .sf-tabbar'), e => vis(e) && e.getBoundingClientRect().height > 8 && !(e.parentElement && e.parentElement.closest('.section_wrap')))
    .map(e => /section_wrap/.test(e.className) ? split(e) : [e]))
    .reduce((acc, e) => { const sub = [].filter.call(e.querySelectorAll('section, .sf-sec'), s => vis(s) && H0(s) > 40 && !fixd(s) && !(s.parentElement && s.parentElement.closest('section, .sf-sec') && e.contains(s.parentElement.closest('section, .sf-sec'))));
      return acc.concat(sub.length >= 2 ? sub : [e]); }, []);
  const ink = e => { let L = 1e9, R = -1e9, T = 1e9, B = -1e9; deepIn(e).forEach(c => { if (!(own(c) || /^(IMG|BUTTON|INPUT|VIDEO|IFRAME|SVG)$/i.test(c.tagName)) || !vis(c)) return; const r = c.getBoundingClientRect(); if (r.width < 2 || r.left < 0 || r.right > W) return; L = Math.min(L, r.left); R = Math.max(R, r.right); T = Math.min(T, r.top + scrollY); B = Math.max(B, r.bottom + scrollY); }); return L < 1e9 ? { L: Math.round(L), R: Math.round(W - R), T: Math.round(T), B: Math.round(B) } : null; };
  const cardsIn = e => deepIn(e).filter(c => { if (!vis(c)) return false; const s = getComputedStyle(c), r = c.getBoundingClientRect(); return r.width > 120 && r.width < W * 0.98 && r.height > 80 && (s.boxShadow !== 'none' || (parseFloat(s.borderTopLeftRadius) >= 6 && (parseFloat(s.borderTopWidth) > 0 || s.backgroundColor !== 'rgba(0, 0, 0, 0)'))); })
    .filter((c, i, a) => !a.some(p => p !== c && p.contains(c)));
  const btnsIn = e => deepIn(e).filter(b => b.matches('a, button, [role=button], input[type=submit]')).filter(b => { if (!vis(b)) return false; const s = getComputedStyle(b), r = b.getBoundingClientRect(); return r.height >= 30 && r.width >= 60 && b.textContent.trim() && (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(s.borderTopWidth) > 0); });
  const secs = secEls.map((e, i) => {
    const r = e.getBoundingClientRect(), k = ink(e), cs = cardsIn(e), bs = btnsIn(e);
    const rows = {}; cs.forEach(c => { const cr = c.getBoundingClientRect(), y = Math.round(cr.top + scrollY); const key = Object.keys(rows).find(z => Math.abs(z - y) <= 6) || y; (rows[key] = rows[key] || []).push(cr); });
    const rowArr = Object.values(rows).map(a => a.sort((p, q) => p.left - q.left));
    const best = rowArr.sort((a, b) => b.length - a.length)[0] || [];
    const gapX = best.length > 1 ? Math.round(best[1].left - best[0].right) : null;
    const topDiff = rowArr.map(a => Math.round(Math.max(...a.map(z => z.top)) - Math.min(...a.map(z => z.top)))).reduce((m, v) => Math.max(m, v), 0);
    return { n: i + 1, name: nm(e), id: e.id || '', y: Math.round(r.top + scrollY), h: Math.round(r.height), ink: k,
      cards: cs.length, cols: best.length, cardGap: gapX, cardRadius: [...new Set(cs.map(c => getComputedStyle(c).borderTopLeftRadius))].slice(0, 4), cardW: best[0] ? Math.round(best[0].width) : null, rowTopDiff: topDiff,
      btns: bs.slice(0, 12).map(b => { const s = getComputedStyle(b), q = b.getBoundingClientRect(); return { t: b.textContent.trim().replace(/\s+/g, ' ').slice(0, 16), h: Math.round(q.height), w: Math.round(q.width), r: s.borderTopLeftRadius, bg: s.backgroundColor }; }) };
  });
  secs.forEach((s, i) => { const nx = secs[i + 1]; s.gapNext = nx && s.ink && nx.ink ? nx.ink.T - s.ink.B : null; });
  // 누르기 작은 곳(휴대폰), 겹침, 넘침
  const taps = deepIn(document.body).filter(b => b.matches('a[href], button, [role=button], input:not([type=hidden]), select, label[for]') && vis(b));
  const small = MO ? taps.map(b => { const r = b.getBoundingClientRect(); return { b, r }; }).filter(o => (o.r.height < 44 || o.r.width < 44) && o.r.width > 1).map(o => ({ zone: zone(o.b), sel: sel(o.b), w: Math.round(o.r.width), h: Math.round(o.r.height), t: (o.b.textContent || o.b.getAttribute('aria-label') || o.b.title || '').trim().replace(/\s+/g, ' ').slice(0, 16), y: Math.round(o.r.top + scrollY) })) : [];
  const fx = b => { for (let x = b; x; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const boxes = taps.filter(b => !fx(b)).map(b => [b, b.getBoundingClientRect()]).filter(([, r]) => r.width > 4 && r.height > 4);
  const over = [];
  for (let i = 0; i < boxes.length && over.length < 30; i++) for (let j = i + 1; j < boxes.length; j++) {
    const [a, ra] = boxes[i], [b, rb] = boxes[j]; if (a.contains(b) || b.contains(a)) continue;
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ox > 4 && oy > 4) over.push({ a: sel(a) + ' ' + a.textContent.trim().slice(0, 10), b: sel(b) + ' ' + b.textContent.trim().slice(0, 10), ox: Math.round(ox), oy: Math.round(oy), y: Math.round(ra.top + scrollY) });
  }
  const wide = document.documentElement.scrollWidth - W;
  const wideBy = wide > 1 ? all.filter(e => { const r = e.getBoundingClientRect(); return r.right > W + 1 && r.width < W * 2; }).slice(0, 6).map(e => sel(e) + ' →' + Math.round(e.getBoundingClientRect().right)) : [];
  const imgs = deepIn(document.body).filter(i => i.tagName === 'IMG' && i.complete && i.getAttribute('src') && !/^data:/.test(i.src) && i.naturalWidth === 0 && vis(i)).map(i => i.src.slice(-60));
  const noAlt = deepIn(document.body).filter(i => i.tagName === 'IMG' && !i.hasAttribute('alt') && vis(i)).length;
  const bigImg = performance.getEntriesByType('resource').filter(e => e.initiatorType === 'img' || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(e.name)).filter(e => e.encodedBodySize > 400 * 1024).map(e => Math.round(e.encodedBodySize / 1024) + 'KB ' + e.name.slice(-70));
  const ids = {}; document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; });
  const dupId = Object.keys(ids).filter(k => ids[k] > 1).slice(0, 8);
  const unnamed = deepIn(document.body).filter(b => b.matches('a[href], button') && vis(b) && !(b.textContent.trim() || b.getAttribute('aria-label') || b.title || (b.querySelector('img[alt]:not([alt=""])')))).slice(0, 10).map(b => sel(b) + ' ' + (b.getAttribute('href') || '').slice(0, 40));
  return { W, H: document.documentElement.scrollHeight, title: document.title, h1: (document.querySelector('h1') || {}).textContent, texts, secs, small, over, wide, wideBy, imgs, noAlt, bigImg, dupId, unnamed, sfv: [...document.querySelectorAll('script[src],link[href]')].map(e => e.src || e.href).filter(u => /seniorfuture-site@/.test(u)).map(u => u.match(/@([^/]+)/)[1]).filter((v, i, a) => a.indexOf(v) === i) };
};

// 상자·번호 그리기(내 브라우저에서만)
const DRAW = secs => {
  const W = innerWidth;
  secs.forEach(s => {
    const d = document.createElement('div'); d.className = '__sfbox';
    d.style.cssText = 'position:absolute;left:2px;top:' + s.y + 'px;width:' + (W - 4) + 'px;height:' + s.h + 'px;border:3px solid rgba(255,0,80,.85);box-sizing:border-box;z-index:2147483646;pointer-events:none';
    const t = document.createElement('div'); t.textContent = s.n + ' ' + (s.id || s.name).slice(0, 24) + ' y' + s.y + ' h' + s.h + (s.ink ? ' L' + s.ink.L + ' R' + s.ink.R : '') + (s.gapNext != null ? ' ↓' + s.gapNext : '') + (s.cards ? ' 카드' + s.cards + '·' + s.cols + '열' : '');
    t.style.cssText = 'position:absolute;left:0;top:0;background:rgba(255,0,80,.9);color:#fff;font:700 12px/1.4 sans-serif;padding:2px 6px';
    d.appendChild(t); document.body.appendChild(d);
    if (s.ink) { const k = document.createElement('div'); k.className = '__sfbox'; k.style.cssText = 'position:absolute;left:' + s.ink.L + 'px;top:' + s.ink.T + 'px;width:' + (W - s.ink.L - s.ink.R) + 'px;height:' + (s.ink.B - s.ink.T) + 'px;border:1px dashed rgba(0,120,255,.9);z-index:2147483645;pointer-events:none'; document.body.appendChild(k); }
  });
  document.body.style.position = document.body.style.position || 'relative';
};

(async () => {
  const br = await chromium.launch({ channel: 'chrome' });
  const all = {};
  for (const [id, p] of LIST) for (const W of WIDTHS) {
    const key = id + '@' + W, mo = W < 768;
    const ctx = await br.newContext(mo ? { viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, userAgent: UA_MO, locale: 'ko-KR' }
      : { viewport: { width: W, height: W === 768 ? 1024 : 900 }, locale: 'ko-KR' });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    const errs = [], fails = [], bad = [];
    page.on('console', m => { if (/error|warning/.test(m.type())) { const l = m.location() || {}; errs.push({ type: m.type(), msg: m.text().slice(0, 200), at: (l.url || '').replace(/\?.*$/, '').slice(-80) + ':' + (l.lineNumber || 0), ours: /seniorfuture-site/.test(l.url || '') || /\bSF|sf-|SFUI/.test(m.text()) }); } });
    page.on('pageerror', e => errs.push({ type: 'pageerror', msg: String(e.message).slice(0, 200), at: ((e.stack || '').match(/https?:[^\s)]+/) || [''])[0].slice(-100), ours: /seniorfuture-site/.test(e.stack || '') }));
    page.on('requestfailed', r => { const f = (r.failure() || {}).errorText || ''; if (!/ERR_ABORTED/.test(f) || /seniorfuture-site/.test(r.url())) fails.push({ url: r.url().slice(0, 140), why: f }); });
    page.on('response', r => { if (r.status() >= 400) bad.push({ url: r.url().slice(0, 140), st: r.status(), ours: /seniorfuture-site/.test(r.url()) }); });
    const t0 = Date.now(); let res = { id, path: p, W };
    try {
      const resp = await page.goto(SITE + p, { waitUntil: 'load', timeout: 60000 });
      res.status = resp && resp.status(); res.finalUrl = page.url().replace(SITE, '');
      res.loadMs = Date.now() - t0;
      const a = await page.evaluate(SNAP); await page.waitForTimeout(3000); const b = await page.evaluate(SNAP);
      const inV = q => q[0] + q[2] > 0 && q[0] < W; // 옆으로 넘어가는 슬라이드(자동 넘김)는 밀림에서 제외
      const slide = (p, q) => Math.abs(p[0] - q[0]) > 100 && Math.abs(p[1] - q[1]) < 10;
      res.moved = Object.keys(a).filter(k => b[k] && inV(a[k]) && inV(b[k]) && !slide(a[k], b[k]) && (Math.abs(a[k][0] - b[k][0]) >= 1 || Math.abs(a[k][1] - b[k][1]) >= 1 || Math.abs(a[k][2] - b[k][2]) >= 1 || Math.abs(a[k][3] - b[k][3]) >= 1))
        .map(k => ({ el: a[k][4], t: a[k][5], from: a[k].slice(0, 4), to: b[k].slice(0, 4) })).slice(0, 25);
      res.vanished = Object.keys(a).filter(k => !b[k]).length;
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } scrollTo(0, 0); });
      await page.waitForTimeout(1500);
      Object.assign(res, await page.evaluate(COLLECT));
      res.ls = await page.evaluate(() => window.__ls); res.cls = +res.ls.reduce((s, e) => s + e.v, 0).toFixed(3);
      await page.evaluate(DRAW, res.secs);
      // 용량 때문에 JPG(품질 70): PNG 로는 화면당 1.5~3MB 라 저장소가 너무 커짐
      await page.screenshot({ path: path.join(OUT, 'png', key.replace(/[^\w@.-]/g, '_') + '.jpg'), type: 'jpeg', quality: 70, fullPage: true, timeout: 60000 }).catch(e => res.shotErr = e.message.slice(0, 80));
    } catch (e) { res.err = e.message.slice(0, 160); }
    res.errs = errs; res.fails = fails; res.bad = bad;
    fs.writeFileSync(path.join(OUT, 'json', key.replace(/[^\w@.-]/g, '_') + '.json'), JSON.stringify(res));
    console.log(key.padEnd(22), res.status, 'H', res.H, 'texts', res.texts ? res.texts.length : '-', 'err', errs.length, 'moved', res.moved ? res.moved.length : '-', 'cls', res.cls, res.err || '');
    await ctx.close();
    await new Promise(r => setTimeout(r, 1200));
  }
  await br.close();
})();
