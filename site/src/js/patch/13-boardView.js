// 원본: src/board-view.js
SFUI.register('boardView', function () {
  var v = document.querySelector('.board_view');
  if (!v || !/bmode=view/.test(location.search) || !SFUI.once(v, 'BoardView')) return;
  var path = location.pathname.replace(/\/$/, '') || '/';
  var isNotice = /^\/help/.test(path), isReview = /^\/review/.test(path);
  var root = document.documentElement;
  root.classList.add('sf-bv-on', isNotice ? 'sf-bv--notice' : 'sf-bv--article');
  var AMP = String.fromCharCode(38), tmp = document.createElement('div');
  function esc(s) { tmp.textContent = s == null ? '' : String(s); return tmp.innerHTML.replace(/"/g, AMP + '#34;'); }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  // 목록용 머리 영역 숨기기
  [].forEach.call(document.querySelectorAll('.sf-page, .sf-newsletter, [data-sf-move-before], .sf-help'), function (e) {
    var w = e.closest('[id^="w20"]') || e;
    (w.contains(v) ? e : w).classList.add('sf-bv-hide');
  });
  var h1 = v.querySelector('.view_tit'), catEl = h1 && h1.querySelector('.category');
  var cat = catEl ? catEl.textContent.trim() : '';
  if (catEl) (catEl.closest('a') || catEl).remove();
  var title = h1 ? h1.textContent.trim() : '';
  var boardName = (v.querySelector('.board_name a') || {}).textContent || (isReview ? '수강평' : isNotice ? '공지사항' : '인사이트');
  var sum = v.querySelector('.board_summary');
  var name = sum && sum.querySelector('.write') ? sum.querySelector('.write').textContent.trim() : '';
  var date = sum && sum.querySelector('.date') ? sum.querySelector('.date').textContent.trim() : '';
  var dateFull = sum && sum.querySelector('.date') ? (sum.querySelector('.date').getAttribute('title') || date) : date;
  var hit = sum && sum.querySelector('.hit-count') ? sum.querySelector('.hit-count').textContent.trim() : '';
  var bodyEl = v.querySelector('.board_txt_area');
  var words = bodyEl ? bodyEl.textContent.replace(/\s+/g, ' ').length : 0;
  var mins = Math.max(1, Math.round(words / 500));
  var head = el('header', 'sf-bv-head');
  if (isNotice) {
    head.innerHTML = '<a class="sf-bv-back" href="' + path + '">‹ 공지사항 목록</a>' + (cat ? '<span class="sf-bv-chip">' + esc(cat) + '</span>' : '') + '<h1>' + esc(title) + '</h1><p class="sf-bv-meta">' + esc(String(dateFull).split(' ')[0]) + (hit ? ' · ' + esc(hit) : '') + '</p>';
  } else {
    var avatar = sum && sum.querySelector('.avatar img') ? '<img src="' + esc(sum.querySelector('.avatar img').getAttribute('src')) + '" alt="">' : '';
    head.innerHTML = '<nav class="sf-bv-crumb" aria-label="현재 위치"><a href="' + path + '">' + esc(boardName.trim()) + '</a>' + (cat ? '<span aria-hidden="true">›</span><a class="is-cat" href="' + path + '?tab=' + encodeURIComponent(cat) + '">' + esc(cat) + '</a>' : '') + '</nav><h1>' + esc(title) + '</h1>'
      + '<div class="sf-bv-by"><span class="sf-bv-avatar">' + avatar + '</span><span class="sf-bv-who"><strong>' + esc(name) + '</strong><small>' + esc(String(dateFull).split(' ')[0]) + ' · ' + mins + '분 읽기</small></span>'
      + '<span class="sf-bv-share"><button type="button" class="sf-bv-link" data-sf-share-link aria-label="링크 복사">🔗 링크 복사</button><button type="button" class="sf-bv-kakao" data-sf-share-kakao>카카오톡 공유</button></span></div>';
  }
  if (h1) { var bt = h1.closest('.board-title') || h1; bt.parentNode.insertBefore(head, bt); bt.classList.add('sf-bv-hide'); }
  if (sum) sum.classList.add('sf-bv-sum');
  // 본문: #태그 문단 → 칩
  if (bodyEl) {
    [].forEach.call(bodyEl.querySelectorAll('p'), function (p) {
      var t = p.textContent.trim();
      if (/^(#[^\s#]+\s*)+$/.test(t)) {
        p.className = 'sf-bv-tags';
        p.innerHTML = t.split(/\s+/).map(function (x) { return '<a href="/search?keyword=' + encodeURIComponent(x.slice(1)) + '">' + esc(x) + '</a>'; }).join('');
      }
    });
  }
  var after = bodyEl ? bodyEl.nextSibling : null;
  function insertAfterBody(node) { if (bodyEl) bodyEl.parentNode.insertBefore(node, after); }
  if (!isNotice) {
    insertAfterBody(el('div', 'sf-bv-shareline', '<span>이 글이 도움이 됐다면 공유해 주세요</span><button type="button" class="sf-bv-link" data-sf-share-link aria-label="링크 복사">🔗</button><button type="button" class="sf-bv-kakao" data-sf-share-kakao>카카오톡 공유</button>'));
    // 관련 강의: 분야 이름 → 강의
    var MAP = { '전문가 인사이트': 5, '기업 사례 분석': 3, '트렌드': 4, '뉴스레터': 4 };
    var items = SFUI.shopItems ? SFUI.shopItems() : {}, ci = MAP[cat], key;
    var catKey = (SFUI.cats || []).filter(function (c) { return c[1] === cat; })[0];
    if (!ci && catKey) for (key in items) if (items[key].type === 'course' && items[key].cat === catKey[0]) { ci = key; break; }
    var cc = ci && SFUI.courseCards[ci];
    if (cc) insertAfterBody(el('a', 'sf-bv-course', '<img src="' + SFUI.courseImg + cc[2] + '" alt=""><span><small>' + (isReview ? '이 후기의 강의' : '이 글과 관련된 강의') + '</small><strong>' + esc(cc[0]) + '</strong><em>' + esc(cc[1]) + '</em></span><b>강의 보러 가기</b>'));
    var cl = v.querySelector('.sf-bv-course'); if (cl && ci) cl.href = '/course/?idx=' + ci;
    // 아래 카드: 같은 게시판 목록에서 가져오기
    var idx = new URLSearchParams(location.search).get('idx');
    fetch(path + '/' + (/preview_mode=1/.test(location.search) ? '?preview_mode=1' : ''), { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) {
      var d = new DOMParser().parseFromString(t, 'text/html');
      var cards = [].slice.call(d.querySelectorAll('._post_item_wrap')).map(function (c) {
        var a = c.querySelector('a[href*="idx="]'), img = c.querySelector('img'), tt = c.querySelector('.title'), em = tt && tt.querySelector('em:not(.notice-block):not(.addon-badge)');
        var tx = c.querySelector('.text'), dt = c.querySelector('.date');
        var tc = tt ? tt.cloneNode(true) : null;
        if (tc) [].forEach.call(tc.querySelectorAll('em, .icons, .addon-badge'), function (x) { x.remove(); });
        var ttl = tc ? tc.textContent.replace(/\s+/g, ' ').trim() : '';
        return a && { href: a.getAttribute('href'), img: (function () { var cw = c.querySelector('.card_wrapper'), m = cw && /url\(["']?([^"')]+)/.exec(cw.getAttribute('style') || ''); return m ? m[1] : img && (img.getAttribute('src') || img.getAttribute('data-src')); })(), cat: em ? em.textContent.trim() : '', title: ttl, text: tx ? tx.textContent.trim() : '', date: dt ? dt.textContent.trim() : '' };
      }).filter(function (c) { return c && c.href.indexOf('idx=' + idx) < 0 && c.title; }).slice(0, isReview ? 3 : 4);
      if (!cards.length) return;
      var sec = el('section', 'sf-bv-more', '<div class="sf-bv-more__in"><h2>' + (isReview ? '다른 수강평' : '함께 읽으면 좋은 글') + '</h2><ul class="sf-bv-more__list' + (isReview ? ' is-3' : '') + '">' + cards.map(function (c) {
        return '<li><a href="' + esc(c.href) + '"><span class="sf-bv-more__th">' + (c.img ? '<img src="' + esc(c.img) + '" alt="" loading="lazy">' : '') + '</span>' + (c.cat ? '<small>' + esc(c.cat) + '</small>' : '') + '<strong>' + esc(c.title) + '</strong><p>' + esc(c.text) + '</p><time>' + esc(c.date) + '</time></a></li>';
      }).join('') + '</ul></div>');
      var widget = v.closest('[id^="w20"]') || v;
      widget.parentNode.insertBefore(sec, widget.nextSibling);
      if (SFUI.init) SFUI.init(sec);
    }).catch(function () {});
    // 읽기 진행 막대
    var bar = el('div', 'sf-bv-progress'); bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    var onScroll = function () {
      var r = v.getBoundingClientRect(), total = r.height - innerHeight * 0.6, done = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.transform = 'scaleX(' + done + ')';
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  } else {
    var listBtn = v.querySelector('.table_bottom a.float_l, .table_bottom a[href*="list"]');
    if (listBtn) { listBtn.textContent = '목록으로'; listBtn.classList.add('sf-bv-listbtn'); }
  }
  // 이전/다음 글 줄 이름
  [].forEach.call(v.querySelectorAll('.list_tap a'), function (a, i) {
    if (!a.querySelector('.sf-bv-pn')) a.insertAdjacentHTML('afterbegin', '<span class="sf-bv-pn">' + (a.querySelector('.icon-arrow-up') ? '이전 글' : '다음 글') + '</span>');
  });
  if (SFUI.init) SFUI.init(head);
  var sl = v.querySelector('.sf-bv-shareline'); if (sl && SFUI.init) SFUI.init(sl);
})
