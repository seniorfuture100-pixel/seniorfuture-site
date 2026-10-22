// 원본: src/r3-track.js
/* r3-track.js — 마케팅 트래킹 자리 (10/20)
   - ID는 window.SF_TRACK 에 넣으면 켜져요. 비어 있으면 dataLayer 에만 쌓고 외부 스크립트는 안 불러요.
       SF_TRACK = { ga4: 'G-XXXX', meta: '1234567890', kakao: '1234567890', naver: 's_xxxx', gtm: 'GTM-XXXX' }
   - 아임웹 관리자(마케팅 › 외부 서비스 연동)에서 이미 GA4·메타 픽셀을 켰다면 기본 스크립트는 아임웹 것을 쓰고(중복 로드 안 함),
     여기서는 아임웹이 안 잡는 '시니어퓨처 행동'만 이벤트로 보내요.
   - 주소에 ?sf_debug=1 을 붙이면 콘솔에 이벤트가 찍혀요.
   - 개인정보(이름·연락처·이메일)는 어떤 이벤트에도 넣지 않아요. */
(function () {
  var W = window, D = document, T = W.SF_TRACK = W.SF_TRACK || {};
  var DEBUG = /[?&]sf_debug=1/.test(location.search);
  W.dataLayer = W.dataLayer || [];
  function load(src) { var s = D.createElement('script'); s.async = true; s.src = src; (D.head || D.documentElement).appendChild(s); }
  // 1) 기본 스크립트 (ID가 있고, 아임웹이 아직 안 불렀을 때만)
  if (T.gtm && !W.google_tag_manager) { W.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' }); load('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(T.gtm)); }
  if (T.ga4 && !W.gtag) {
    W.gtag = function () { W.dataLayer.push(arguments); };
    W.gtag('js', new Date()); W.gtag('config', T.ga4);
    load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(T.ga4));
  }
  if (T.meta && !W.fbq) {
    var f = W.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    W.fbq('init', T.meta); W.fbq('track', 'PageView');
    load('https://connect.facebook.net/en_US/fbevents.js');
  }
  if (T.kakao && !W.kakaoPixel) {
    load('https://t1.daumcdn.net/kas/static/kp.js');
    var kt = 0; (function kp() { if (W.kakaoPixel) { W.kakaoPixel(T.kakao).pageView(); return; } if (kt++ < 40) setTimeout(kp, 250); })();
  }
  if (T.naver && !W.wcs) {
    load('https://wcs.naver.net/wcslog.js');
    var nt = 0; (function nv() { if (W.wcs) { W.wcs_add = W.wcs_add || {}; W.wcs_add.wa = T.naver; W.wcs_do && W.wcs_do(); return; } if (nt++ < 40) setTimeout(nv, 250); })();
  }

  // 2) 공통 이벤트 보내기
  var META = { sign_up: 'CompleteRegistration', view_item: 'ViewContent', add_to_wishlist: 'AddToWishlist', begin_checkout: 'InitiateCheckout', generate_lead: 'Lead', purchase: 'Purchase', search: 'Search', live_signup: 'Schedule' };
  var KAKAO = { sign_up: 'completeRegistration', view_item: 'viewContent', add_to_wishlist: 'addToWishList', begin_checkout: 'viewCart', generate_lead: 'participation', purchase: 'purchase', search: 'search' };
  function track(name, p) {
    p = p || {};
    W.dataLayer.push(Object.assign({ event: 'sf_' + name }, p));
    try { if (W.gtag) W.gtag('event', name, p); } catch (e) {}
    try { if (W.fbq) { if (META[name]) W.fbq('track', META[name], p); else W.fbq('trackCustom', 'sf_' + name, p); } } catch (e) {}
    try { if (W.kakaoPixel && T.kakao && KAKAO[name]) W.kakaoPixel(T.kakao)[KAKAO[name]](p.item_name || p.search_term || ''); } catch (e) {}
    if (DEBUG && W.console) console.log('[sf-track]', name, p);
  }
  W.SFT = { track: track };

  // 3) 처음 들어온 경로(utm) 기억 — 이벤트에 같이 실어 보내요 (개인정보 아님)
  try {
    var q = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k).slice(0, 100); });
    if (Object.keys(utm).length) { utm.landing = location.pathname; localStorage.setItem('sf_utm', JSON.stringify(utm)); }
  } catch (e) {}

  // 4) 페이지·클릭에서 자동으로 잡는 이벤트
  function idx() { return new URLSearchParams(location.search).get('idx'); }
  function itemName() { var h = D.querySelector('.sf-pv h1, .sf-pv-title, .goods_name, h1'); return h ? h.textContent.trim().slice(0, 80) : ''; }
  function price() { var e = D.querySelector('.sf-pv .real_price, .real_price, .sale_price'); var n = e && parseInt(e.textContent.replace(/[^\d]/g, ''), 10); return n || 0; }
  function kind() { var p = location.pathname; return /^\/live/.test(p) ? 'live' : /^\/community/.test(p) ? 'meet' : /^\/course/.test(p) ? 'course' : 'other'; }
  function onReady(fn) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', fn); else fn(); }
  onReady(function () {
    var path = location.pathname;
    // 상품 상세 보기
    if (idx() && /^\/(course|live|community)/.test(path)) setTimeout(function () { track('view_item', { item_id: idx(), item_name: itemName(), item_category: kind(), value: price(), currency: 'KRW' }); }, 800);
    // 주문서 진입 / 주문 완료 (아임웹 기본 구매 이벤트와 별도로 우리 이름으로 한 번 더)
    if (/^\/shop_payment\/?$/.test(path)) track('begin_checkout', { currency: 'KRW' });
    if (/^\/shop_payment_complete/.test(path)) {
      var no = new URLSearchParams(location.search).get('order_code') || '';
      try { if (no && sessionStorage.getItem('sf_done_' + no)) return; if (no) sessionStorage.setItem('sf_done_' + no, '1'); } catch (e) {}
      track('purchase', { transaction_id: no, currency: 'KRW' });
    }
    // 검색
    var kw = new URLSearchParams(location.search).get('keyword');
    if (/^\/search/.test(path) && kw) track('search', { search_term: kw.slice(0, 60) });
    // 가입 완료(아임웹이 가입 직후 보내는 주소 표시를 읽어요)
    if (/join_complete|signup_complete/.test(location.href)) track('sign_up', { method: 'site' });
  });
  // 클릭 위임: 신청·찜·공유·문의
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a, button'); if (!a) return;
    var t = (a.textContent || '').replace(/\s+/g, ' ').trim(), href = a.getAttribute('href') || '';
    if (a.closest('.buy_btns, .sf-pv__side, .sf-pv-bar') && /신청|구매|결제|참여/.test(t)) track('begin_checkout', { item_id: idx(), item_name: itemName(), item_category: kind(), value: price(), currency: 'KRW' });
    else if (/wish|찜/.test((a.className || '') + ' ' + (a.getAttribute('aria-label') || '') + ' ' + t)) track('add_to_wishlist', { item_id: idx() || '', item_category: kind() });
    else if (a.matches('[data-sf-reward-share], .r3-share a, .r3-share button') || /주소 복사|카카오톡 공유|공유하기/.test(t)) track('share', { method: /카카오/.test(t) ? 'kakao' : 'link', item_id: idx() || location.pathname });
    else if (/pf\.kakao\.com|open\.kakao\.com/.test(href) || a.matches('[data-k="kakao"]')) track('contact', { method: 'kakao', where: location.pathname });
    else if (a.matches('[data-sf-prefill]')) track('select_content', { content_type: 'b2b_service', item_id: a.getAttribute('data-sf-prefill') });
  }, true);
  // 폼 제출(협업 문의·파트너 지원·마케팅 파트너스 신청) — 아임웹 입력폼
  D.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.closest) return;
    var where = f.closest('[data-sf-form-slot]') ? f.closest('[data-sf-form-slot]').getAttribute('data-sf-form-slot') : location.pathname;
    if (/login|join|search/i.test(f.action || '') || f.querySelector('input[type=password]')) return;
    track('generate_lead', { form: where });
  }, true);
})()
