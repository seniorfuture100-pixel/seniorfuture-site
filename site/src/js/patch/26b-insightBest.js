// (10/30 사장님) 인사이트 인기글: 게시판에서 '공지'로 체크한 글 중 본문 맨 끝에 '#인기1'~'#인기4'가 있는 글을
//   인사이트 맨 위 'BEST 이번 주 많이 읽은 인사이트' 4칸에 번호 순서대로 채워요(모자란 칸은 비우고, 하나도 없으면 칸째 숨김)
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
  // (11/2) 목록 카드 요약 글 다듬기: 아임웹이 본문 앞 100자를 자르면서 원문 태그('<title>…</title>')·잘린 문자 코드('&#', '&quo')·
  //   블로그에서 옮긴 사진 설명 자리('사진 설명을 입력하세요.')가 그대로 보였어요 → 화면 글자만 고쳐요(글 자체는 그대로)
  var ta = document.createElement('textarea'), ENT = ['quot', 'amp', 'lt', 'gt', 'nbsp', 'apos', 'hellip', 'middot', 'lsquo', 'rsquo', 'ldquo', 'rdquo', 'ndash', 'mdash'];
  function tidy(t) {
    t = t.replace(/<title>[\s\S]*?<\/title>/gi, ' ').replace(/<\/?[a-z][^>]*>/gi, ' ');
    // 끝에서 잘린 문자 코드만 지워요('&#', '&quo') — AT&T·R&D·Q&A 같은 보통 글자는 그대로(Codex)
    var m = /&(#x?[0-9a-fA-F]*|[a-z]{0,7})$/.exec(t);
    m && (m[1].charAt(0) === '#' || !m[1] || ENT.some(function (e) { return e.indexOf(m[1]) === 0; })) && (t = t.slice(0, m.index));
    ta.innerHTML = t.replace(/</g, '&lt;'); // 문자 코드만 풀어요(태그는 위에서 지움)
    return ta.value.replace(/사진 설명을 입력하세요\.?/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tidyAll() {
    [].forEach.call(document.querySelectorAll('.show_body > span:not([data-sf-tidy])'), function (s) {
      var t = s.textContent, c = tidy(t);
      c !== t.trim() && (s.textContent = c);
      s.setAttribute('data-sf-tidy', '');
    });
  }
  tidyAll(); document.addEventListener('DOMContentLoaded', tidyAll); window.addEventListener('load', tidyAll);
  var bw = 0; (function watch() { var b = document.querySelector('[data-widget-type="board"]'); if (b) return void new MutationObserver(tidyAll).observe(b, { childList: true, subtree: true }); ++bw < 50 && setTimeout(watch, 200); })();

  // 글 하나 읽기: 본문 끝 '#인기N' + 미리보기 제목·설명·사진
  function readPost(idx) {
    return fetch('/insight/?bmode=view&idx=' + idx + pv, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var d = t && new DOMParser().parseFromString(t, 'text/html'), box = d && d.querySelector('.board_txt_area');
      if (!box) return null;
      var all = box.textContent.match(new RegExp(RE.source, 'g'));
      if (!all) return null;
      var meta = function (k) { var m = d.querySelector('meta[property="og:' + k + '"]'); return m ? m.getAttribute('content') || '' : ''; };
      var tt = meta('title') || d.title || '', cut = tt.lastIndexOf(' : ');
      return { idx: idx, rank: +RE.exec(all[all.length - 1])[1], title: (cut > 0 ? tt.slice(0, cut) : tt).trim(), img: meta('image'), desc: meta('description').replace(/\s+/g, ' ').trim() };
    }).catch(function () { return null; });
  }
  function card(x) {
    var ds = x.desc.length > 54 ? x.desc.slice(0, 54).trim() + '…' : x.desc;
    return '<li data-sf-pop="' + x.rank + '"><a class="sf-ccard sf-icard" href="/insight/?bmode=view&amp;idx=' + x.idx + '"><span class="sf-ccard__thumb">' +
      (x.img ? '<img src="' + esc(x.img) + '" alt="" class="sf-fade is-loaded">' : '') + '</span><span class="sf-ccard__body">' +
      (x.cat ? '<span class="sf-icat">' + esc(x.cat) + '</span>' : '') + '<strong>' + esc(x.title) + '</strong>' + (ds ? '<p>' + esc(ds) + '</p>' : '') + '</span></a></li>';
  }
  // (11/2) 디자인에 들어 있는 4칸은 견본 글(예시 숫자)이라 채우지 않아요 → 진짜 인기글만, 하나도 없으면 칸 전체를 숨겨요(CSS r3/12)
  function paint(list) {
    var ul = document.querySelector('.sf-cards4--ins');
    if (!ul || ul.getAttribute('data-sf-pop')) return;
    ul.innerHTML = list.slice(0, 4).map(card).join('');
    ul.setAttribute('data-sf-pop', list.length ? '1' : '0');
    var sec = ul.closest('section'); sec && sec.classList.toggle('sf-ins-empty', !list.length); // :has() 못 쓰는 브라우저용
  }
  // (11/2 사장님) '#인기N' 글이 없으면 칸을 숨기지 말고, 목록에 보이는 글 중 조회수 높은 4편으로 채워요
  function byViews() {
    var seen = {}, out = [];
    [].forEach.call(document.querySelectorAll('[data-widget-type="board"] ._post_item_wrap'), function (it) {
      var a = it.querySelector('a[href*="idx="]'), m = a && /[?&;]idx=(\d+)/.exec(a.getAttribute('href'));
      if (!m || seen[m[1]] || it.querySelector('.card.secret')) return;
      seen[m[1]] = 1;
      var vw = [].filter.call(it.querySelectorAll('small'), function (s) { return /조회/.test(s.textContent); })[0];
      var tt = it.querySelector('.title'), tc = tt && tt.cloneNode(true);
      tc && [].forEach.call(tc.querySelectorAll('em, .r2-icat, .icons, .addon-badge'), function (x) { x.parentNode && x.parentNode.removeChild(x); }); // 제목 글자는 span 안에 있을 수 있어 span 은 남겨요
      var cw = it.querySelector('.card_wrapper'), im = cw && /url\(\s*["']?([^"')]+)/.exec((cw.getAttribute('style') || '').replace(/&quot;/g, '"'));
      var em = it.querySelector('.r2-icat') || it.querySelector('.title em:not(.notice-block):not(.addon-badge)'), sb = it.querySelector('.show_body > span');
      out.push({ idx: m[1], rank: 0, views: vw ? +(vw.textContent.replace(/\D/g, '') || 0) : 0, title: tc ? tc.textContent.replace(/\s+/g, ' ').trim() : '', img: im && !/no-image/.test(im[1]) ? im[1] : '', desc: sb ? tidy(sb.textContent) : '', cat: em ? em.textContent.trim() : '' });
    });
    return out.filter(function (x) { return x.title; }).sort(function (a, b) { return b.views - a.views; }).slice(0, 4).map(function (x, i) { x.rank = i + 1; return x; });
  }
  function run() {
    var C = null;
    try { C = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (x) {}
    if (C && Date.now() - C.at < 3e5 && C.list.length) return paint(C.list);
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
    if (!cand.length) return paint(byViews());
    // (11/2 속도) 10개를 한꺼번에 받던 것 → 하나씩 받다가 4칸이 차면 멈춰요(느린 망에서 3MB 넘게 받았어요)
    var got = [], ranks = {};
    (function next(i) {
      if (i >= Math.min(cand.length, 10) || (ranks[1] && ranks[2] && ranks[3] && ranks[4])) { // 1~4위가 모두 찼을 때만 일찍 멈춰요
        var list = got.sort(function (a, b) { return a.rank - b.rank; });
        try { list.length && sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), list: list })); } catch (x) {}
        return paint(list.length ? list : byViews());
      }
      readPost(cand[i].idx).then(function (x) { x && (x.cat = cand[i].cat, got.push(x), ranks[x.rank] = 1); next(i + 1); });
    })(0);
  }
  window.SFUI && (SFUI.__insBest = { read: readPost, paint: paint }); // 점검용
  var n1 = 0;
  (function wait() {
    // 목록과 BEST 영역이 준비되면 바로 시작해 불필요한 load 대기를 없애요.
    if (document.querySelector('[data-widget-type="board"] ._post_item_wrap') && document.querySelector('.sf-cards4--ins')) return void run();
    ++n1 < 60 && setTimeout(wait, 200);
  })();
})()
