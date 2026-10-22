// 원본: src/hash-guard.js
// 공통 안내 띠(share.js와 같은 .sf-toast)
SFUI.toast = SFUI.toast || function (msg) {
  var t = document.querySelector('.sf-toast');
  if (!t) { t = document.createElement('div'); t.className = 'sf-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 3000);
}
