// 원본: src/r3-speed.js
/* r3-speed.js (10/21) — 탭을 누르면 바로 넘어가게
   ① 미리 준비: 메뉴·탭 링크에 마우스를 올리거나(약 0.2초) 손가락을 대는 순간 크롬이 다음 페이지를 미리 받아 둬요(Speculation Rules prefetch).
      로그인·로그아웃·장바구니·주문·결제·관리자·글쓰기처럼 '동작' 주소는 빼요. 크롬이 아닌 브라우저는 아무 일도 안 일어나요.
   ② 같은 내용 다시 받지 않기: 알림(🔔)이 페이지마다 받던 고객센터 공지(/help, 178KB)·주문 목록, 후기(/review)를
      이 탭에서 5분 동안 기억해 두고 다시 써요. 로그인 상태가 바뀌면 새로 받아요. */
(function () {
  // ③ PC 헤더: 우리 헤더 모양(html.sf-hd-on)을 스크립트가 읽히는 즉시 붙여요 — 원래는 본문을 다 읽은 뒤(2~3초 뒤)라 그동안 아임웹 원래 헤더('홈'·얇은 글씨)가 보였다가 바뀌었어요.
  //    모바일(991px 이하)은 우리 헤더를 스크립트가 직접 그려서, 미리 붙이면 잠깐 빈 헤더가 돼 그대로 둬요.
  try { if (window.matchMedia && matchMedia('(min-width: 992px)').matches) document.documentElement.classList.add('sf-hd-on'); } catch (e) {}
  var NOT = ':not([href*="logout"]):not([href*="login"]):not([href*="admin"]):not([href*="cart"]):not([href*="order"]):not([href*="payment"])' +
    ':not([href*="mode="]):not([href*="delete"]):not([href*="write"]):not([href*="cancel"]):not([href*=".cm"]):not([href*="wish"]):not([href*="#"]):not([target]):not([download])';
  try {
    if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
      var sel = 'a[href^="/"]' + NOT + ', a[href^="' + location.origin + '/"]' + NOT;
      var s = document.createElement('script'); s.type = 'speculationrules';
      s.textContent = JSON.stringify({
        // 미리 '받기'만 해요(prefetch). 미리 '그리기'(prerender)는 안 간 페이지까지 아임웹 방문 통계에 잡혀서 뺐어요(10/22)
        prefetch: [{ where: { selector_matches: sel }, eagerness: 'moderate' }]
      });
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (e) {}

  var of = window.fetch; if (!of || of.__sfc) return;
  var TTL = 5 * 60 * 1000;
  function who() { try { return (document.cookie.match(/_imweb_login_state=([^;]*)/) || [])[1] || '0'; } catch (e) { return '0'; } }
  function keyOf(u, o) {
    var url = typeof u === 'string' ? u : (u && u.url) || '', m = ((o && o.method) || 'GET').toUpperCase();
    url = url.replace(location.origin, '');
    if (m === 'GET' && (url === '/help' || url === '/review')) return 'g' + url;
    if (m === 'POST' && url === '/shop/oms/OMS_mypage_order_list.cm' && o && typeof o.body === 'string') return 'o:' + o.body;
    return null;
  }
  var f = function (u, o) {
    var k = keyOf(u, o); if (!k) return of.apply(this, arguments);
    k = 'sfc:' + who() + ':' + k;
    try {
      var c = JSON.parse(sessionStorage.getItem(k) || 'null');
      if (c && Date.now() - c.t < TTL) return Promise.resolve(new Response(c.b, { status: 200, headers: { 'Content-Type': c.ct || 'text/html' } }));
    } catch (e) {}
    return of.apply(this, arguments).then(function (r) {
      if (r && r.ok) r.clone().text().then(function (b) { try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), b: b, ct: r.headers.get('content-type') || '' })); } catch (e) {} }).catch(function () {});
      return r;
    });
  };
  f.__sfc = 1; window.fetch = f;
})()
