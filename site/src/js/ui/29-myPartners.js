// 원본: v1.0.27 (2026-10-25) 마이페이지 › 파트너스
/* myPartners — 마이페이지 › 파트너스 › 링크 생성하기(?sf=partners) (왼쪽 메뉴 묶음은 r2My 가 만들어요)
   - /course 목록에서 강의를 읽어 표로(새 강의도 자동) · 분야·검색·정렬 · 홍보 링크 복사(주소?ref=내 코드)
   - (10/25) 수익 내역·정산 내역 화면은 사장님 요청으로 뺐어요(지금 단계에서는 필요 없음) */
(function () {
  if (window.__sfMyPartners) return;
  window.__sfMyPartners = 1;
  var qs = new URLSearchParams(location.search);

  if (!/^\/shop_mypage/.test(location.pathname) || qs.get('sf') !== 'partners') return;

  var tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s == null ? '' : String(s); return tmp.innerHTML; }
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'; }
  function cfg() { var c = window.SF_SHARE || {}; return { code: c.member || null, rate: parseInt(c.rate || 10, 10) || 10 }; }
  function toast(msg) {
    var t = document.querySelector('.sf-toast');
    if (!t) { t = document.createElement('div'); t.className = 'sf-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 2500);
  }
  function copy(text) {
    function legacy() { return new Promise(function (ok, fail) { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); } finally { ta.remove(); } }); }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(legacy);
    return legacy();
  }
  var LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';

  // ── 강의 목록: /course 의 상품 목록(<template> 안 카드)에서 읽어요. 같은 탭에서는 10분 동안 다시 안 불러요 ──
  function loadCourses() {
    try { var c = JSON.parse(sessionStorage.getItem('sf_pt_courses') || 'null'); if (c && Date.now() - c.t < 6e5) return Promise.resolve(c.list); } catch (e) {}
    return fetch('/course', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (h) {
      var d = new DOMParser().parseFromString(h, 'text/html');
      var html = [].map.call(d.querySelectorAll('template'), function (t) { return t.innerHTML; }).join('') + d.body.innerHTML;
      var td = new DOMParser().parseFromString(html, 'text/html'), seen = {}, list = [];
      [].forEach.call(td.querySelectorAll('.iw-shop-card[data-system-product-id]'), function (c) {
        var id = c.getAttribute('data-system-product-id'); if (seen[id]) return; seen[id] = 1;
        var nm = c.querySelector('.iw-shop-product-name'), img = c.querySelector('img.iw-shop-thumbnail');
        var sale = c.querySelector('.iw-shop-sale-price'), lst = c.querySelector('.iw-shop-list-price');
        function num(el) { var m = el && el.textContent.replace(/\s+/g, ' ').match(/([\d,]+)\s*원/); return m ? parseInt(m[1].replace(/,/g, ''), 10) : null; }
        var p = num(sale); if (p == null) return;
        list.push({ id: id, name: nm ? nm.textContent.replace(/\s+/g, ' ').trim() : '', img: img ? (img.getAttribute('src') || '').replace(/\?.*$/, '') + '?w=200' : '', price: p, list: num(lst), soldout: c.getAttribute('data-sold-out') === 'true' });
      });
      try { sessionStorage.setItem('sf_pt_courses', JSON.stringify({ t: Date.now(), list: list })); } catch (e) {}
      return list;
    });
  }

  function head() {
    return '<div class="sf-myp-top"><h2 class="r2-my-h">링크 생성하기</h2><a class="sf-myp-guide" href="/partners">마케팅 파트너스 안내 ›</a></div>';
  }

  function renderLinks(pane) {
    var c = cfg(), cats = SFUI.cats || [], items = SFUI.shopItems ? SFUI.shopItems() : {};
    pane.innerHTML = head() +
      '<div class="sf-myp-code"><div><small>내 추천 코드</small><b>' + esc(c.code || '-') + '</b></div><p>강의 링크 뒤에 내 코드가 붙어요. 이 링크로 들어온 분이 결제하면 결제 금액의 <em>' + c.rate + '%</em>를 수익으로 받을 수 있어요.</p></div>' +
      '<div class="sf-myp-flt"><select aria-label="분야"><option value="">전체 분야</option>' + cats.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + '</option>'; }).join('') + '</select>' +
      '<input type="search" placeholder="어떤 강의를 추천해 볼까요?" aria-label="강의 검색">' +
      '<select aria-label="정렬"><option value="new">최신순</option><option value="earn">예상 수익 높은순</option><option value="low">가격 낮은순</option></select></div>' +
      '<div class="sf-myp-wrap"><table class="sf-myp-tb"><thead><tr><th>강의</th><th>가격</th><th>수익률</th><th>예상 수익</th><th>홍보 링크</th></tr></thead><tbody><tr><td colspan="5" class="sf-myp-msg">강의를 불러오는 중…</td></tr></tbody></table></div>' +
      '<p class="sf-myp-note">예상 수익은 지금 판매 가격 기준이에요. 실제 수익은 결제 금액(쿠폰·적립금 사용 등)에 따라 달라지고, 결제가 취소·환불되면 수익도 취소돼요.</p>';
    var sel = pane.querySelectorAll('.sf-myp-flt select'), q = pane.querySelector('.sf-myp-flt input'), body = pane.querySelector('tbody'), all = [];
    function draw() {
      var cat = sel[0].value, word = q.value.trim().toLowerCase(), sort = sel[1].value;
      var rows = all.filter(function (x) { return (!cat || (items[x.id] || {}).cat === cat) && (!word || x.name.toLowerCase().indexOf(word) > -1); });
      rows.sort(sort === 'earn' ? function (a, b) { return b.price - a.price; } : sort === 'low' ? function (a, b) { return a.price - b.price; } : function (a, b) { return b.id - a.id; });
      body.innerHTML = rows.length ? rows.map(function (x) {
        var earn = Math.floor(x.price * c.rate / 100);
        return '<tr><td><a class="sf-myp-c" href="/course/?idx=' + x.id + '">' + (x.img ? '<img src="' + esc(x.img) + '" alt="" loading="lazy">' : '<i></i>') + '<b>' + esc(x.name) + '</b></a></td>' +
          '<td class="sf-myp-pr">' + (x.list && x.list > x.price ? '<s>' + won(x.list) + '</s>' : '') + '<span>' + won(x.price) + '</span></td>' +
          '<td><em class="sf-myp-rate">' + c.rate + '%</em></td><td class="sf-myp-earn"><small>예상 수익</small><strong>' + won(earn) + '</strong></td>' +
          '<td><button type="button" class="sf-myp-lk" data-id="' + x.id + '" aria-label="' + esc(x.name) + ' 홍보 링크 복사">' + LINK + '<span>링크 복사</span></button></td></tr>';
      }).join('') : '<tr><td colspan="5" class="sf-myp-msg">' + (all.length ? '조건에 맞는 강의가 없어요' : '아직 추천할 수 있는 강의가 없어요') + '</td></tr>';
    }
    loadCourses().then(function (l) { all = l; draw(); }, function () { body.innerHTML = '<tr><td colspan="5" class="sf-myp-msg">강의 목록을 불러오지 못했어요. <a href="/course">교육 페이지</a>에서 강의를 골라 [공유하고 수익받기]를 눌러 주세요.</td></tr>'; });
    sel[0].addEventListener('change', draw); sel[1].addEventListener('change', draw); q.addEventListener('input', draw);
    pane.addEventListener('click', function (e) {
      var b = e.target.closest('.sf-myp-lk'); if (!b) return;
      if (!c.code) { toast('로그인 정보를 확인하지 못했어요. 새로고침 후 다시 눌러 주세요'); return; }
      var u = location.origin + '/course/?idx=' + b.getAttribute('data-id') + '&ref=' + encodeURIComponent(c.code);
      copy(u).then(function () {
        pane.querySelectorAll('.sf-myp-lk.is-on').forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on'); toast('홍보 링크를 복사했어요');
      }, function () { toast('복사하지 못했어요. 다시 눌러 주세요'); });
    });
  }

  function go() {
    var pane = document.querySelector('.shop-content.mypage .r2-my-pane');
    if (!pane) return false;
    if (pane.__sfMyp) return true;
    pane.__sfMyp = 1;
    renderLinks(pane);
    return true;
  }
  var tries = 0;
  (function wait() { if (go() || ++tries > 80) return; setTimeout(wait, 150); })();
})();
