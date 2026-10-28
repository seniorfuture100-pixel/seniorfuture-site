// 원본: src/site-chrome.js
/* site-chrome.js — 아임웹 기본 헤더·푸터를 Figma 시안에 맞춰요 (공통 코드에 들어 있어 모든 페이지에 적용)
   - 헤더는 site-header.js 가 맡아요
   - 푸터: 링크 4묶음 + 고객센터를 넣고, 템플릿 문구·SNS 아이콘은 숨겨요.
     이용약관·개인정보처리방침·사업자 정보는 아임웹 값을 그대로 써요(환경설정에서 바꾸면 바로 반영).
   카카오톡 채널 주소: window.SF_SITE = { kakao: 'http://pf.kakao.com/_xxxx/chat' } 를 이 코드보다 위에 두면 연결돼요. */
SFUI.register('siteChrome', function () {
  var cfg = window.SF_SITE || {};
  var kakao = cfg.kakao || '/help';

  var foot = document.querySelector('#doz_footer');
  if (!foot || !SFUI.once(foot, 'Chrome')) return;
  function col(id, title, links) {
    return '<nav class="sf-ft-col" aria-labelledby="' + id + '"><h3 id="' + id + '">' + title + '</h3><ul>' +
      links.map(function (l) { return '<li><a href="' + l[1] + '"' + (l[2] ? ' data-sf-ft="' + l[2] + '"' : '') + '>' + l[0] + '</a></li>'; }).join('') +
      '</ul></nav>';
  }
  // SNS 동그라미: SF_SITE.sns = { youtube:'', instagram:'', blog:'', kakao:'' } 에 주소가 있는 것만 보여요
  function sns() {
    var s = cfg.sns || {}, names = { youtube: '유튜브', instagram: '인스타그램', blog: '블로그', kakao: '카카오톡 채널' };
    var html = Object.keys(names).filter(function (k) { return s[k]; }).map(function (k) {
      return '<a class="sf-ft-sns__a sf-ft-sns__a--' + k + '" href="' + s[k] + '" target="_blank" rel="noopener" aria-label="' + names[k] + '"></a>';
    }).join('');
    return html ? '<div class="sf-ft-sns">' + html + '</div>' : '';
  }
  var box = document.createElement('div');
  box.className = 'sf-ft';
  box.innerHTML = '<div class="sf-ft-in">' +
    col('sf-ft-a', '시니어퓨처', [['회사 소개', '/about'], ['파트너 지원', '/partner'], ['제휴 문의', '/business#contact'],  ['수강평', '/review'], ['마케팅 파트너스', '/partners']]) +
    col('sf-ft-b', '고객 지원', [['공지사항', '/help#notice'], ['자주 묻는 질문', '/help#faq'], ['카카오톡 상담', kakao]]) +
    col('sf-ft-c', '정책', [['이용약관', '/terms'], ['개인정보처리방침', '/terms#privacy'], ['환불 정책', '/terms#refund'], ['파트너 이용약관', '/terms#cpartner']]) + // (10/28) 교육 콘텐츠 파트너 이용약관 탭
    '<div class="sf-ft-col sf-ft-cs"><h3>고객센터</h3><p>평일 10:00 – 18:00 (점심 12:00 – 13:00)</p>' +
    '<a class="sf-ft-kakao" href="' + kakao + '">카톡 상담하기</a></div></div>' + sns();
  foot.insertBefore(box, foot.firstChild);
  foot.classList.add('sf-ft-on');

  // 아임웹 약관 창을 그대로 열어요
  box.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sf-ft]');
    if (!a || !window.SITE) return;
    var fn = a.getAttribute('data-sf-ft') === 'policy' ? SITE.openPolicy : SITE.openPrivacy;
    if (typeof fn === 'function') { e.preventDefault(); fn.call(SITE); }
  });
})
