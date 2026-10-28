// 원본: src/hash-guard.js
// 수강평 목록: 본문의 '수강 과정: …'을 메타 줄로, 작성자 이름은 가려서(김○○)
// (10/27) 사진 없던 후기 → 공식 후기 페이지 사진 번호(사장님 지정). 사진은 저장소 site/assets/reviews(커밋 고정 주소)
var PH_BASE = 'https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@86f1fd00edc536c4cf86b8e8be20d3dd7fed21b8/site/assets/reviews/';
var PHOTO = {
  '수민님 (딜로이트 안진회계법인)': '14', '정원님 (창업 준비)': '14','호섭님 (재덕종합건설 전무)': '15', '승재님 (성균관대학교 사회학과)': '15',
  '주아님 (알리익스프레스)': '24', '정준님 (스타트업 대표)': '24', '혜리님 (서울대 농생대 대학원)': '27',
  '승현님 (배달의민족)': '21', '성수님 (삼성전자)': '21', '시현님 (연세대 심리 대학원)': '21',
  '승현님 (서울대 보건대학원)': '18', '태훈님 (행정사)': '18', '종수님 (MYSC 심사역)': '36',
  '태영님 (블루포인트파트너스 심사역)': '36', '기호님 (행복한삶 대표)': '33'
};
// (10/28 사장님) 새 수강평은 [제목] · [내용] · 마지막 줄 'OO님 (소속)'으로 써요 → 목록 카드 이름 자리에 그 줄을 보여 줘요
SFUI.rvSign = {
  end: /(?:^|\s)-?\s*([가-힣A-Za-z○·]{1,12}님(?:\s*\([^()]{1,40}\))?)\s*$/,
  line: function (t) { var m = /^\s*-?\s*([가-힣A-Za-z○·]{1,12}님(?:\s*\([^()]{1,40}\))?)\s*$/.exec(t || ''); return m ? m[1].replace(/님\s*\(/, '님 (') : ''; },
  // 목록 글자에 이름 줄이 잘려 안 보이면 글 보기에서 마지막 줄을 읽어 와요(한 번 읽으면 sessionStorage)
  fetch: function (id, done) {
    var k = 'sf_rvsign_' + id, c = null;
    try { c = sessionStorage.getItem(k); } catch (e) {}
    if (c !== null) { done(c); return; }
    fetch('/review/?bmode=view' + String.fromCharCode(38) + 'idx=' + id + (/preview_mode=1/.test(location.search) ? String.fromCharCode(38) + 'preview_mode=1' : ''), { credentials: 'same-origin' })
      .then(function (r) { return r.text(); }).then(function (t) {
        var b = new DOMParser().parseFromString(t, 'text/html').querySelector('.board_txt_area');
        var ls = b ? [].filter.call(b.querySelectorAll('p, div'), function (x) { return !x.querySelector('p, div') && x.textContent.trim(); }) : [];
        var s = ls.length ? SFUI.rvSign.line(ls[ls.length - 1].textContent) : '';
        try { sessionStorage.setItem(k, s); } catch (e) {}
        done(s);
      }).catch(function () {});
  }
};
SFUI.register('reviewMeta', function (root) {
  if (!/^\/review/.test(location.pathname)) return;
  document.documentElement.classList.add('sf-rv-page'); // (10/26) 분류 표시 숨김(css qa/07)
  if (/bmode=/.test(location.search)) return;
  // (10/26) 게시판 이름: 수강평 → 참가자 후기
  var h1 = document.querySelector('.sf-page h1'), sub = document.querySelector('.sf-page .sf-page__sub');
  if (h1 && h1.textContent.trim() === '수강평') h1.textContent = '참가자 후기';
  if (sub && /솔직한 후기/.test(sub.textContent)) sub.textContent = '시니어퓨처와 함께한 멤버들의 이야기예요';
  var fetched = 0, L = {}; (SFUI.reviewData || []).forEach(function (r) { L[r[1].replace(/^“|”$/g, '')] = r[0]; });
  root.querySelectorAll('._post_item_wrap').forEach(function (it) {
    if (!SFUI.once(it, 'RvMeta')) return;
    var lk = it.querySelector('a.post_link_wrap'), id = lk && ((lk.getAttribute('href') || '').match(/idx=(\d+)/) || [])[1];
    if (id && (SFUI.reviewHide || {})[id]) { (it.closest('._card_wrap') || it).remove(); return; } // (10/26) 임의로 만든 예시 글 빼기
    var sp = it.querySelector('.text span'), wr = it.querySelector('.writer');
    var m = sp && /^([\s\S]*?)\s*수강 과정:\s*([^.]+?)(?:\s*예시[\s\S]*)?\.?\s*$/.exec(sp.textContent.trim());
    if (m) {
      sp.textContent = m[1];
      if (wr) { var c = document.createElement('span'); c.className = 'sf-rv-course'; c.textContent = m[2]; wr.parentNode.insertBefore(c, wr.nextSibling); }
    }
    var tt = it.querySelector('.r2-ttl') || it.querySelector('.title'), lab = tt && L[(tt.classList.contains('r2-ttl') ? tt.textContent : [].filter.call(tt.childNodes, function (x) { return x.nodeType === 3; }).map(function (x) { return x.textContent; }).join('')).trim()];
    if (wr && lab) wr.textContent = lab; // 참가자 후기: 9기 · 규동님 (더힐실버타운)
    if (wr && !lab && sp) { // (10/28) 새 후기: 본문 끝 'OO님 (소속)' → 이름 자리, 카드 글에서는 빼요
      var se = SFUI.rvSign.end.exec(sp.textContent.trim());
      if (se) { lab = SFUI.rvSign.line(se[1]); wr.textContent = lab; sp.textContent = sp.textContent.trim().slice(0, se.index).trim(); }
      else if (id && fetched < 8) {
        fetched++;
        (function (wr, sp) { SFUI.rvSign.fetch(id, function (s) { if (!s) return; wr.textContent = s; var t = sp.textContent.trim(), j = t.lastIndexOf(s.split(' (')[0]); if (j > 0) sp.textContent = t.slice(0, j).trim(); }); })(wr, sp);
      }
    }
    if (wr) wr.textContent = wr.textContent.replace(/^\s*\d+\s*기\s*·\s*/, ''); // (10/27) 기수는 빼고 이름·소속만(규동님 (더힐실버타운)), 날짜는 css qa/08 에서 숨김
    var cw = it.querySelector('.card_wrapper');
    // (10/27) 사진 없던 후기: 사장님이 고른 공식 후기 페이지 사진(apply.seniorfuture.kr/reviews 번호)을 붙여요
    var who = wr && wr.textContent.trim(), ph = who && PHOTO[who];
    if (cw && ph && !/thumbnail|upload|sf-rvph/.test(cw.getAttribute('style') || '')) {
      cw.style.backgroundImage = 'url("' + PH_BASE + 'rv-' + ph + '.jpg?sf-rvph")';
      cw.style.backgroundSize = 'cover'; cw.style.backgroundPosition = 'center';
    }
    (it.closest('._card_wrap') || it).setAttribute('data-sf-ph', ph || (cw && cw.style.backgroundImage) || ('x' + Math.random()));
    if (cw && !/thumbnail|upload|sf-rvph/.test(cw.getAttribute('style') || '') && tt) { // (10/26) 원본처럼 사진 없는 후기: 한 줄 인용 상자
      it.classList.add('sf-rv-noimg');
      if (!cw.querySelector('.sf-rv-q')) { var q = document.createElement('span'); q.className = 'sf-rv-q'; q.textContent = '“' + (tt.classList.contains('r2-ttl') ? tt.textContent : [].filter.call(tt.childNodes, function (x) { return x.nodeType === 3; }).map(function (x) { return x.textContent; }).join('')).trim() + '”'; cw.appendChild(q); }
    }
    else if (wr && !/님 \(|님$|^\d+기|수강생|○○/.test(wr.textContent)) { var n = wr.textContent.trim(); wr.textContent = n === '관리자' ? '수강생' : n.charAt(0) + '○○'; } // (10/26) 이미 넣은 기수·이름은 다시 가리지 않아요
  });
  // (10/27) 같은 사진 카드가 붙어 보이지 않게 섞어요(바로 앞 3장과 사진이 다르게, 나머지 순서는 그대로)
  // 카드는 첫 줄 묶음(_post_row)과 큰 격자에 나뉘어 있어요 → 전체 순서를 정한 뒤 원래 자리(표시)에 차례로 넣어요
  var all = [].slice.call(document.querySelectorAll('[data-sf-ph]')), pool = all.slice(), out = [];
  while (pool.length) {
    var recent = out.slice(-3).map(function (c) { return c.getAttribute('data-sf-ph'); });
    var k = 0; for (var i = 0; i < pool.length; i++) if (recent.indexOf(pool[i].getAttribute('data-sf-ph')) < 0) { k = i; break; }
    out.push(pool.splice(k, 1)[0]);
  }
  if (out.some(function (c, i) { return c !== all[i]; })) {
    var marks = all.map(function (c) { var m = document.createComment('sf-rv'); c.parentNode.insertBefore(m, c); return m; });
    out.forEach(function (c, i) { marks[i].parentNode.insertBefore(c, marks[i]); });
    marks.forEach(function (m) { m.parentNode.removeChild(m); });
  }
})
