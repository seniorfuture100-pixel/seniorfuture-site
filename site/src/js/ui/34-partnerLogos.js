// 공식 출처: https://global.toyota/en/ · https://www.caredoc.kr/
// 합성 원본을 보존하고 교체 가능한 공식 로고를 별도 레이어로 배치합니다.
SFUI.register('partnerLogos', function () {
  document.querySelectorAll('.r3-logowall').forEach(function (wall) {
    if (!SFUI.once(wall, 'PartnerLogos')) return;
    var original = wall.querySelector('.r3-logowall__img');
    if (!original) return;
    var canvas = document.createElement('div'); canvas.className = 'sf-partner-canvas'; canvas.style.cssText = 'position:relative!important;width:100%!important;line-height:0!important';
    original.parentNode.insertBefore(canvas, original); canvas.appendChild(original); original.style.setProperty('display','block','important'); original.style.setProperty('width','100%','important'); original.style.setProperty('height','auto','important');
    if (/cefe122e312d9/.test(original.src)) {
      var toyota = document.createElement('span'); toyota.className = 'sf-partner-toyota'; toyota.style.cssText = 'position:absolute!important;left:29%!important;top:11.5%!important;width:13%!important;height:10%!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important';
      toyota.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@partner-logos-horizontal-1127/toyota-horizontal-user.png" alt="TOYOTA" style="display:block!important;width:86%!important;height:100%!important;object-fit:contain!important;max-width:none!important">'; canvas.appendChild(toyota);
    }
    var caredoc = document.createElement('div'); caredoc.className = 'sf-partner-caredoc'; caredoc.style.cssText = 'position:absolute!important;left:60%!important;top:84.5%!important;width:9%!important;height:11%!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important';
    caredoc.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@ed17f74d30298c2e59605e546141b189659b442f/site/assets/partners/caredoc-official.svg" alt="케어닥" style="display:block!important;width:94%!important;height:70%!important;object-fit:contain!important;max-width:none!important">';
    canvas.appendChild(caredoc);
    var label = (wall.getAttribute('aria-label') || '함께한 기업·기관').replace(/, 한국액티브시니어협회/g, '');
    if (label.indexOf('케어닥') < 0) wall.setAttribute('aria-label', label + ', 케어닥');
  });
});
