// 공식 출처: https://global.toyota/en/ · https://www.caredoc.kr/
// 합성 원본을 보존하고 교체 가능한 공식 로고를 별도 레이어로 배치합니다.
SFUI.register('partnerLogos', function () {
  document.querySelectorAll('.r3-logowall').forEach(function (wall) {
    if (!SFUI.once(wall, 'PartnerLogos')) return;
    var original = wall.querySelector('.r3-logowall__img');
    if (!original) return;
    var canvas = document.createElement('div'); canvas.className = 'sf-partner-canvas';
    original.parentNode.insertBefore(canvas, original); canvas.appendChild(original);
    if (/cefe122e312d9/.test(original.src)) {
      var toyota = document.createElement('span'); toyota.className = 'sf-partner-toyota';
      toyota.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@ed17f74d30298c2e59605e546141b189659b442f/site/assets/partners/toyota-official.svg" alt="TOYOTA">'; canvas.appendChild(toyota);
    }
    var caredoc = document.createElement('div'); caredoc.className = 'sf-partner-caredoc';
    caredoc.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/seniorfuture100-pixel/seniorfuture-site@ed17f74d30298c2e59605e546141b189659b442f/site/assets/partners/caredoc-official.svg" alt="케어닥" width="140" height="36">';
    wall.appendChild(caredoc);
    var label = wall.getAttribute('aria-label') || '함께한 기업·기관';
    if (label.indexOf('케어닥') < 0) wall.setAttribute('aria-label', label + ', 케어닥');
  });
});
