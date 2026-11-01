// (10/30 사장님) 인사이트 인기글: 게시판에서 '공지'로 체크한 글 중 본문 맨 끝에 '#인기1'~'#인기4'가 있는 글을
//   인사이트 맨 위 'BEST 이번 주 많이 읽은 인사이트' 4칸에 번호 순서대로 채워요(모자란 칸은 원래 카드 그대로)
//   번호를 제목이 아니라 본문 끝에 두는 까닭: 제목은 카톡·검색 미리보기 제목이 되고, 미리보기 설명은 본문 앞부분이라 끝 줄은 안 나와요
//   글 보기 화면에서는 '#인기N' 글자를 숨겨요
(function () {
  var RE = /#\s*인기\s*(\d{1,2})/, p = location.pathname, q = new URLSearchParams(location.search), KEY = 'sf_inspop1';
  if (!/^\/insight/.test(p)) return;
  var pv = /preview_mode=1/.test(location.search) ? '&preview_mode=1' : '';
  var esc = function (s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };

  // 글 보기: 본문의 '#인기N' 지우기(그 줄이 비면 줄째로 숨김)
  function hideTag() {
    var box = document.querySelector('.board_txt_area');
    if (!box) return false;
    var w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT), t, hit = [];
    while ((t = w.nextNode())) RE.test(t.nodeValue) && hit.push(t);
    hit.forEach(function (n) {
      n.nodeValue = n.nodeValue.replace(new RegExp(RE.source, 'g'), '');
      var b = n.parentNode && n.parentNode.closest && n.parentNode.closest('p, div, li');
      b && b !== box && !b.textContent.trim() && !b.querySelector('img, iframe, video') && (b.style.display = 'none');
    });
    return true;
  }
  if (q.get('bmode') === 'view') {
    var n0 = 0;
    (function go() { if (!hideTag() && ++n0 < 40) setTimeout(go, 150); })();
    return;
  }
  if (q.get('bmode') || !/^\/insight\/?$/.test(p)) return;

  // 글 하나 읽기: 본문 끝 '#인기N' + 미리보기 제목·설명·사진
  // (11/2 속도) 글 한 장(약 330KB)을 통째로 DOM 으로 만들던 것 → 글자에서 바로 찾아요(느린 휴대폰에서 멈춤이 컸어요)
  var dec = function (s) { var x = document.createElement('textarea'); x.innerHTML = s || ''; return x.value; };
  function readPost(idx) {
    return fetch('/insight/?bmode=view&idx=' + idx + pv, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var at = t ? t.indexOf('board_txt_area') : -1;
      if (at < 0) return null;
      var body = t.slice(at).replace(/<[^>]+>/g, ''), all = body.match(new RegExp(RE.source, 'g'));
      if (!all) return null;
      var meta = function (k) { var m = new RegExp('<meta[^>]+property="og:' + k + '"[^>]+content="([^"]*)"').exec(t); return m ? dec(m[1]) : ''; };
      var tt = meta('title') || dec((/<title>([^<]*)/.exec(t) || [])[1]), cut = tt.lastIndexOf(' : ');
      return { idx: idx, rank: +RE.exec(all[all.length - 1])[1], title: (cut > 0 ? tt.slice(0, cut) : tt).trim(), img: meta('image'), desc: meta('description').replace(/\s+/g, ' ').trim() };
    }).catch(function () { return null; });
  }
  function card(x) {
    var ds = x.desc.length > 54 ? x.desc.slice(0, 54).trim() + '…' : x.desc;
    return '<li data-sf-pop="' + x.rank + '"><a class="sf-ccard sf-icard" href="/insight/?bmode=view&amp;idx=' + x.idx + '"><span class="sf-ccard__thumb">' +
      (x.img ? '<img src="' + esc(x.img) + '" alt="" class="sf-fade is-loaded">' : '') + '</span><span class="sf-ccard__body">' +
      (x.cat ? '<span class="sf-icat">' + esc(x.cat) + '</span>' : '') + '<strong>' + esc(x.title) + '</strong>' + (ds ? '<p>' + esc(ds) + '</p>' : '') + '</span></a></li>';
  }
  function paint(list) {
    var ul = document.querySelector('.sf-cards4--ins');
    if (!ul || !list.length || ul.getAttribute('data-sf-pop')) return;
    var old = [].slice.call(ul.children), ids = list.map(function (x) { return String(x.idx); });
    var keep = old.filter(function (li) { var a = li.querySelector('a[href*="idx="]'), m = a && /idx=(\d+)/.exec(a.getAttribute('href')); return !(m && ids.indexOf(m[1]) > -1); });
    ul.innerHTML = list.slice(0, 4).map(card).join('');
    keep.slice(0, Math.max(0, 4 - list.length)).forEach(function (li) { ul.appendChild(li); });
    ul.setAttribute('data-sf-pop', '1');
  }
  function run() {
    var C = null;
    try { C = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (x) {}
    if (C && Date.now() - C.at < 3e5) return paint(C.list);
    // 공지로 체크한 글만 후보(아임웹은 공지 글에만 '공지' 딱지를 보여 줘요)
    //   다른 페이지에서 가져와 붙인 글(r3-ins-more, r3InsightAll)은 숨김 표시가 지워져 있어 빼요
    var items = [].slice.call(document.querySelectorAll('[data-widget-type="board"] ._post_item_wrap')), cand = [], seen = {};
    items.forEach(function (it) {
      var nb = it.querySelector('.notice-block'), a = it.querySelector('a[href*="idx="]'), m = a && /[?&;]idx=(\d+)/.exec(a.getAttribute('href'));
      if (!nb || nb.style.display === 'none' || it.closest('.r3-ins-more') || !m || seen[m[1]]) return;
      seen[m[1]] = 1;
      var em = it.querySelector('.r2-icat') || it.querySelector('.title em:not(.notice-block):not(.addon-badge)');
      cand.push({ idx: m[1], cat: em ? em.textContent.trim() : '' });
    });
    if (!cand.length) return;
    // (11/2 속도) 10개를 한꺼번에 받던 것 → 하나씩 받다가 4칸이 차면 멈춰요(느린 망에서 3MB 넘게 받았어요)
    var got = [], ranks = {};
    (function next(i) {
      if (i >= Math.min(cand.length, 10) || Object.keys(ranks).length >= 4) {
        var list = got.sort(function (a, b) { return a.rank - b.rank; });
        try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), list: list })); } catch (x) {}
        return paint(list);
      }
      readPost(cand[i].idx).then(function (x) { x && (x.cat = cand[i].cat, got.push(x), ranks[x.rank] = 1); next(i + 1); });
    })(0);
  }
  window.SFUI && (SFUI.__insBest = { read: readPost, paint: paint }); // 점검용
  var n1 = 0;
  (function wait() {
    // (11/2 속도) 페이지를 다 받은 뒤에 시작해요(첫 화면 그리는 동안 글 받기가 망을 같이 쓰지 않게)
    if (document.querySelector('[data-widget-type="board"] ._post_item_wrap') && document.querySelector('.sf-cards4--ins')) return void (document.readyState === 'complete' ? setTimeout(run, 300) : window.addEventListener('load', function () { setTimeout(run, 300); }, { once: true }));
    ++n1 < 60 && setTimeout(wait, 200);
  })();
})()
