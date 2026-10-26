// 원본: src/hash-guard.js
// 수강평 목록: 본문의 '수강 과정: …'을 메타 줄로, 작성자 이름은 가려서(김○○)
SFUI.register('reviewMeta', function (root) {
  if (!/^\/review/.test(location.pathname)) return;
  document.documentElement.classList.add('sf-rv-page'); // (10/26) 분류 표시 숨김(css qa/07)
  if (/bmode=/.test(location.search)) return;
  // (10/26) 게시판 이름: 수강평 → 참가자 후기
  var h1 = document.querySelector('.sf-page h1'), sub = document.querySelector('.sf-page .sf-page__sub');
  if (h1 && h1.textContent.trim() === '수강평') h1.textContent = '참가자 후기';
  if (sub && /솔직한 후기/.test(sub.textContent)) sub.textContent = '시니어퓨처와 함께한 멤버들의 이야기예요';
  var L = {}; (SFUI.reviewData || []).forEach(function (r) { L[r[1].replace(/^“|”$/g, '')] = r[0]; });
  root.querySelectorAll('._post_item_wrap').forEach(function (it) {
    if (!SFUI.once(it, 'RvMeta')) return;
    var sp = it.querySelector('.text span'), wr = it.querySelector('.writer');
    var m = sp && /^([\s\S]*?)\s*수강 과정:\s*([^.]+?)(?:\s*예시[\s\S]*)?\.?\s*$/.exec(sp.textContent.trim());
    if (m) {
      sp.textContent = m[1];
      if (wr) { var c = document.createElement('span'); c.className = 'sf-rv-course'; c.textContent = m[2]; wr.parentNode.insertBefore(c, wr.nextSibling); }
    }
    var tt = it.querySelector('.r2-ttl') || it.querySelector('.title'), lab = tt && L[tt.textContent.replace(/^\s*시니어 산업 이해\s*/, '').trim()];
    if (wr && lab) wr.textContent = lab; // 참가자 후기: 9기 · 규동님 (더힐실버타운)
    else if (wr) { var n = wr.textContent.trim(); wr.textContent = n === '관리자' ? '수강생' : n.charAt(0) + '○○'; }
  });
})
