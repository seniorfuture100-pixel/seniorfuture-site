// 원본: src/hash-guard.js
// 교육 상세(모바일) 아래 고정 신청줄에 ♡ — 페이지의 아임웹 찜 버튼을 대신 눌러요
SFUI.register('mobileWish', function () {
  var bar = document.querySelector('._mobile_action_btn_wrap .pay-box'), src = document.querySelector('a._wish_button');
  if (!bar || !src || bar.querySelector('.sf-mwish')) return;
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'sf-mwish';
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>';
  var sync = function () { var on = /\b(active|on)\b/.test(src.className); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? '찜 취소' : '찜하기'); };
  sync();
  b.addEventListener('click', function () { src.click(); setTimeout(sync, 900); });
  bar.insertBefore(b, bar.firstChild);
})
