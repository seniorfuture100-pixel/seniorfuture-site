// (11/1) 상품 상세 → 구글 구조화 데이터(JSON-LD). 화면에는 안 보이고, 검색 결과에 강의·행사 정보(가격·일시·장소)가 붙을 수 있게 해요.
//   교육 = Course(+ 가격), 무료 라이브·모임 = Event(일시·온라인/오프라인·장소·가격). 값은 꾸며진 상세 화면과 본문 [라이브 안내]·[모임 안내]에서 읽어요.
SFUI.register('pvLd', function () {
  if (!document.body.classList.contains('shop_view') || document.getElementById('sf-ld')) return;
  var pv = document.querySelector('.sf-pv'); if (!pv) return;
  var meta = function (s) { var m = document.querySelector(s); return m ? (m.getAttribute('content') || '').trim() : ''; };
  var vt = document.querySelector('.goods_form .view_tit'), vc = vt && vt.cloneNode(true);
  vc && [].forEach.call(vc.querySelectorAll('.prod_icon, em, .icons'), function (x) { x.parentNode.removeChild(x); }); // 배지(BEST 등) 글자는 빼요
  var name = ((vc && vc.textContent) || meta('meta[property="og:title"]')).replace(/\s+/g, ' ').trim();
  if (!name) return;
  var price = parseInt(((document.querySelector('.goods_form .real_price') || {}).textContent || '').replace(/[^\d]/g, ''), 10) || 0;
  var soldOut = /판매\s?기간이 마감|품절/.test((document.querySelector('.goods_form .buy_btns.pc') || {}).textContent || '');
  var url = location.origin + location.pathname + '?idx=' + new URLSearchParams(location.search).get('idx');
  var org = { '@type': 'Organization', name: '시니어퓨처', url: location.origin + '/' };
  var offer = { '@type': 'Offer', price: price, priceCurrency: 'KRW', availability: 'https://schema.org/' + (soldOut ? 'SoldOut' : 'InStock'), url: url };
  var d = { '@context': 'https://schema.org', name: name, description: meta('meta[name="description"]') || meta('meta[property="og:description"]'), image: meta('meta[property="og:image"]'), url: url };
  if (/sf-pv--(meet|live)/.test(pv.className)) {
    var tp = document.getElementById('prodDetailPC') || document.getElementById('prodDetailMobile'), mi = SFUI.meetParse ? SFUI.meetParse(tp && tp.content || document.getElementById('prod_detail_body')) : {};
    // 본문 '일시' 글자에서 바로 한국 시간(+09:00)을 만들어요 — 읽는 기기(구글 로봇)의 시간대와 상관없게
    var p2 = function (n) { return ('0' + (n || 0)).slice(-2); };
    var DT = /(\d{4})\s*[.\/\-년]\s*(\d{1,2})\s*[.\/\-월]\s*(\d{1,2})/, TM = /(\d{1,2}):(\d{2})/;
    var part = String(mi.when || '').split(/\s*[~～–—]\s*|\s+-\s+/), a = DT.exec(part[0] || ''), ta = TM.exec(part[0] || '') || TM.exec(mi.when || '');
    if (!a) return; // 일시가 없으면 행사 정보를 안 넣어요
    var day = a[1] + '-' + p2(a[2]) + '-' + p2(a[3]), stamp = function (dd, t) { return dd + 'T' + (t ? p2(t[1]) + ':' + t[2] : '00:00') + ':00+09:00'; };
    var start = stamp(day, ta), b = part[1] || '', bd = DT.exec(b), bt = TM.exec(b);
    var end = bd ? stamp(bd[1] + '-' + p2(bd[2]) + '-' + p2(bd[3]), bt) : bt ? stamp(day, bt) : '';
    var online = /온라인|zoom|줌/i.test((mi.mode || '') + ' ' + (mi.place || '')) || /sf-pv--live/.test(pv.className);
    d['@type'] = 'Event'; d.startDate = start; if (end) d.endDate = end;
    d.eventStatus = 'https://schema.org/EventScheduled';
    d.eventAttendanceMode = 'https://schema.org/' + (online ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode');
    d.location = online ? { '@type': 'VirtualLocation', url: url } : { '@type': 'Place', name: mi.place || '서울', address: { '@type': 'PostalAddress', streetAddress: mi.place || '', addressCountry: 'KR' } };
    d.organizer = org; d.offers = offer;
  } else {
    d['@type'] = 'Course'; d.provider = org; d.offers = offer;
  }
  var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'sf-ld'; s.textContent = JSON.stringify(d);
  document.head.appendChild(s);
});
