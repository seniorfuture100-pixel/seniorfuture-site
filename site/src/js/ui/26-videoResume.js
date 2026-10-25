// 원본: v1.0.16 (2026-10-25) 자동 재생 영상 다시 켜기
/* videoResume — 다른 앱·채널에 갔다가 돌아오면(뒤로 가기·탭 전환) 휴대폰 브라우저가 자동 재생 영상을 멈춘 채로 둬서
   새로고침해야 다시 움직이던 것. 돌아오는 순간(pageshow·visibilitychange·focus·화면 바꾸기·첫 터치)에
   화면에 보이는 자동 재생 영상이 멈춰 있으면 소리 끈 채 다시 재생해요. 재생이 막히면(저전력 모드) 그대로 둬요(배경 사진이 보임). */
(function () {
  if (window.__sfVidResume) return;
  window.__sfVidResume = 1;
  function kick() {
    [].forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
      if (!v.paused || v.ended) return;
      var r = v.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > (window.innerHeight || 0)) return;
      v.muted = true;
      try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    });
  }
  function soon() { setTimeout(kick, 60); }
  window.addEventListener('pageshow', soon);
  window.addEventListener('focus', soon);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) soon(); });
  document.addEventListener('sf:softnav', function () { setTimeout(kick, 150); });
  document.addEventListener('touchstart', kick, { passive: true });
  window.addEventListener('scroll', function () { if (!window.__sfVidT) window.__sfVidT = setTimeout(function () { window.__sfVidT = 0; kick(); }, 400); }, { passive: true });
})();
