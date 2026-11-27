// 원본: src/hash-guard.js
// 게시판 날짜: '9시간전' 대신 Figma처럼 2026.10.15
SFUI.register('absDate', function (root) {
  root.querySelectorAll('.date[title]').forEach(function (e) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(e.getAttribute('title')); if (m) e.textContent = m[1] + '.' + m[2] + '.' + m[3];
  });
  // 글 보기: 목록에서 이 글의 날짜를 찾아 머리말을 '2026.10.15 · N분 읽기'로, 작성자 '관리자'는 '시니어퓨처'로
  var who = document.querySelector('.sf-bv-who');
  if (!who || !SFUI.once(who, 'AbsDate')) return;
  if (/^\/insight/.test(location.pathname)) { var cm = document.querySelector('.board_view .comment_section'); if (cm && !cm.querySelector('a[href*="bmode=view"]')) cm.classList.add('sf-bv-hide'); }
  var nm = who.querySelector('strong'); if (nm && nm.textContent.trim() === '관리자') nm.textContent = '시니어퓨처';
})
