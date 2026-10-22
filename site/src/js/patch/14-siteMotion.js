// 원본: src/site-motion.js
/* site-motion.js — 사이트 전체 움직임 (패스트캠퍼스·월급쟁이부자들 참고)
   ① 스크롤 등장: 섹션 제목·카드가 화면에 들어올 때 아래에서 살짝 떠오르며 나타나요(같은 줄 카드는 차례로 0.06초씩)
      - 처음 화면에 이미 보이는 것은 그대로 두고, 아래쪽만 움직여요. 상품 목록(그림자 DOM) 안 카드도 같이.
   ② 맨 위로 버튼: 600px 이상 내려가면 오른쪽 아래에 나타나요
   ③ 모바일 하단 탭: 아래로 내릴 땐 숨고, 위로 올리면 다시 나와요
   ④ 이미지: 다 불러온 뒤 부드럽게 나타나요(카드 썸네일)
   기기에서 '동작 줄이기'를 켠 방문자에게는 ①④를 하지 않아요. */
SFUI.register('siteMotion', function (root) {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEL = '.sf-sec-head, .sf-ccard, .sf-lcard, .sf-mcard, .sf-review, .sf-expert10, .sf-ex-card, .sf-icard, .sf-newsletter, .sf-pv-sec, .sf-bv-more li, .sf-sr-sec, ._post_item_wrap, .sf-help-card, .sf-ex-reviews li, .sf-pv-points li, .iw-shop-card, .sf-top5 li';
  if (!reduce && 'IntersectionObserver' in window) {
    var vh = window.innerHeight;
    var list = [].filter.call(root.querySelectorAll(SEL), function (e) {
      if (e.classList.contains('sf-rv') || e.closest('[data-sf-reveal], .sf-carousel--peek, [data-sf-track]')) return false;
      var r = e.getBoundingClientRect();
      return r.top > vh * 0.92 && r.height > 0;
    });
    if (list.length) {
      list.forEach(function (e) {
        var sib = e.parentNode ? [].indexOf.call(e.parentNode.children, e) : 0;
        e.style.setProperty('--sf-rv-delay', (Math.min(sib, 5) * 60) + 'ms');
        e.classList.add('sf-rv');
      });
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { var t = en.target; t.classList.add('is-in'); io.unobserve(t); setTimeout(function () { t.classList.remove('sf-rv', 'is-in'); }, 1300); } });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      list.forEach(function (e) { io.observe(e); });
      // 혹시 관찰이 실패해도 4초 뒤엔 모두 보이게
      setTimeout(function () { list.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-in'); }); }, 4000);
    }
    [].forEach.call(root.querySelectorAll('.sf-ccard__thumb img, .sf-bv-more__th img, .sw2-card-thumb img, .sf-review__top img'), function (img) {
      if (img.complete || img.classList.contains('sf-fade')) return;
      img.classList.add('sf-fade');
      img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
      img.addEventListener('error', function () { img.classList.add('is-loaded'); }, { once: true });
    });
  }
  if (root !== document || document.getElementById('sf-top')) return;
  var top = document.createElement('button');
  top.type = 'button'; top.id = 'sf-top'; top.className = 'sf-top'; top.setAttribute('aria-label', '맨 위로');
  top.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6"/></svg>';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(top);
  // 하단 탭바는 항상 보이게(10/21 결정) — 스크롤 때 숨겼다 되살리던 코드는 페이지 전체를 매번 다시 계산하게 해서 PC 휠이 버벅였어요(10/23 삭제)
  var ticking = false, on = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var want = window.scrollY > 600;
      if (want !== on) { on = want; top.classList.toggle('is-on', on); }
      ticking = false;
    });
  }, { passive: true });
})
