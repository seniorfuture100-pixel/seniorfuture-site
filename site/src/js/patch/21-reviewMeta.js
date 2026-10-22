// 원본: src/hash-guard.js
// 수강평 목록: 본문의 '수강 과정: …'을 메타 줄로, 작성자 이름은 가려서(김○○)
SFUI.register('reviewMeta', function (root) {
  if (!/^\/review/.test(location.pathname) || /bmode=/.test(location.search)) return;
  root.querySelectorAll('._post_item_wrap').forEach(function (it) {
    if (!SFUI.once(it, 'RvMeta')) return;
    var sp = it.querySelector('.text span'), wr = it.querySelector('.writer');
    var m = sp && /^([\s\S]*?)\s*수강 과정:\s*([^.]+?)(?:\s*예시[\s\S]*)?\.?\s*$/.exec(sp.textContent.trim());
    if (m) {
      sp.textContent = m[1];
      if (wr) { var c = document.createElement('span'); c.className = 'sf-rv-course'; c.textContent = m[2]; wr.parentNode.insertBefore(c, wr.nextSibling); }
    }
    if (wr) { var n = wr.textContent.trim(); wr.textContent = n === '관리자' ? '수강생' : n.charAt(0) + '○○'; }
  });
})
