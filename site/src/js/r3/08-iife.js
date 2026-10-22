// 원본: src/r3-ready.js
/* r3-ready.js — 맨 마지막 모듈: 모든 꾸밈이 끝나면 본문을 보여 줘요 (sf-config.js 가 처음에 html.sf-preload 로 가려 둠) */
(function () {
  function show() { requestAnimationFrame(function () { setTimeout(function () { document.documentElement.classList.remove('sf-preload'); }, 120); }); }
  if (window.SFUI && SFUI.register) SFUI.register('r3Ready', show); else show();
})()
