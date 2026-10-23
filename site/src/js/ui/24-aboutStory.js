// 원본: v1.0.11 (2026-10-23) 회사 소개 '스토리 진행선'
/* aboutStory — 회사 소개(/about)의 섹션들을 하나의 이야기로 묶어 보여 줘요 (사장님 결정: 은은하게)
   - 넓은 PC(1360px 이상): 왼쪽에 얇은 세로선 + 01~09 챕터. 스크롤하면 선이 주황으로 채워지고 지금 장이 켜져요. 누르면 그 장으로 이동
   - 그보다 좁은 화면: 맨 위에 3px 진행 막대만
   - 어두운 섹션(PROJECTS) 위에서는 선·글자를 밝은 색으로 바꿔요. '동작 줄이기' 기기에서는 부드러운 이동 없이 바로 */
SFUI.register('aboutStory', function () {
  var main = document.querySelector('main.sf-ab');
  if (!main || main.getAttribute('data-sf-story')) return;
  var secs = [].filter.call(main.children, function (s) { return s.tagName === 'SECTION' && !s.classList.contains('r2-press'); });
  if (secs.length < 3) return; // 섹션이 아직 덜 그려졌으면 다음 실행 때 다시 시도
  main.setAttribute('data-sf-story', '1');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function label(s, i) {
    var e = s.querySelector('.sf-ab-eye, .sf-dot');
    var t = e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
    t = t.replace(/^ABOUT\s+SENIOR\s*FUTURE$/i, 'ABOUT').replace(/\s*&\s*.*$/, '').replace(/^OUR\s+/i, '');
    return t || (i === secs.length - 1 ? 'CONTACT' : 'STORY');
  }
  var nav = document.createElement('nav');
  nav.className = 'r3-story';
  nav.setAttribute('aria-label', '회사 소개 목차');
  nav.innerHTML = '<span class="r3-story__line" aria-hidden="true"><i></i></span><ol>' + secs.map(function (s, i) {
    if (!s.id) s.id = 'ab-ch-' + (i + 1);
    var n = (i < 9 ? '0' : '') + (i + 1);
    return '<li><a href="#' + s.id + '"><i aria-hidden="true"></i><b>' + n + '</b><span>' + label(s, i) + '</span></a></li>';
  }).join('') + '</ol>';
  var bar = document.createElement('div');
  bar.className = 'r3-story-bar';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i></i>';
  document.body.appendChild(nav);
  document.body.appendChild(bar);
  var links = [].slice.call(nav.querySelectorAll('a'));
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var top = secs[i].getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.pageYOffset, vh = window.innerHeight || 800;
    var mt = main.getBoundingClientRect().top + y, mh = main.offsetHeight;
    var p = Math.min(1, Math.max(0, (y - mt) / Math.max(1, mh - vh)));
    nav.style.setProperty('--p', p.toFixed(4));
    bar.style.setProperty('--p', p.toFixed(4));
    var on = y + vh * 0.5 > mt && y < mt + mh - vh * 0.4;
    nav.classList.toggle('is-on', on);
    bar.classList.toggle('is-on', on);
    var cur = 0;
    secs.forEach(function (s, i) { if (s.getBoundingClientRect().top <= vh * 0.4) cur = i; });
    links.forEach(function (a, i) {
      a.classList.toggle('is-cur', i === cur);
      a.classList.toggle('is-past', i < cur);
      if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    nav.classList.toggle('is-dark', secs[cur].classList.contains('is-dark'));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
});
