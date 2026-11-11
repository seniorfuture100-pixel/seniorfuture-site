// (11/2) 문구 다듬기 + 예시 글 숨기기 — 게시 후 UI/UX 점검(docs/검수/게시후-전체-UIUX-카피라이팅-디자인-최적화.md)
//  ① 디자인 위젯(코드 칸) 문구: 위젯 원본은 디자인 모드에서 고쳐 저장해야 하는데, 그전까지 같은 글자를 찾아 바꿔요.
//     글자가 정확히 같을 때만 바꾸므로 위젯을 새 문구로 저장하면 아무 일도 안 해요(그때 이 목록에서 지우면 돼요).
//  ② 고객센터 공지·자주 묻는 질문의 예시 글(SFUI.sampleHide, patch/06a) — 목록에서 숨김
SFUI.register('copyFix', function () {
  var p = location.pathname.replace(/\/$/, '') || '/';
  // [주소 규칙, 바꿀 글자, 새 글자]  — 주소 규칙 null = 모든 화면
  var R = [
    // 무료 라이브: 실제 일정(11/19 목)과 다른 '매주 수요일', 보내지 않는 문자·이메일 안내를 사실대로
    [/^\/live$/, '매주 수요일 저녁, 현업 전문가에게 무료로 배우고 바로 질문해요', '인사이트를 습득하고, 궁금한 점은 바로 물어보세요'],
    // 파트너 지원: 활동 이름을 신청서 분야(교육 강사·라이브 연사·인사이트 기고·커뮤니티 운영)와 같게, 버튼 이름 하나로
    [/^\/partner$/, '교육 집필', '교육 강사'],
    [/^\/partner$/, '교육 콘텐츠 참여하기', '교육 강사 지원하기'],
    [/^\/partner$/, '강연 파트너 신청하기', '라이브 연사 지원하기'],
    [/^\/partner$/, '콘텐츠 기고 참여하기', '인사이트 기고 지원하기'],
    [/^\/partner$/, '커뮤니티 파트너 신청하기', '커뮤니티 운영 지원하기'],
    [/^\/partner$/, '전문가 참여 신청하기', '파트너 지원하기'],
    [/^\/partner$/, '파트너 신청하기', '파트너 지원하기'],
    // 기업·공공기관: 고민 4개 중 하나만 질문형이던 것 → 같은 꼴
    [/^\/business$/, '홍보·시장 접점 확대', '홍보 채널과 시장 접점 부족'],
    [/^\/business$/, '전문 파트너 및 협력 네트워크 부족', '협력 파트너·네트워크 부족'], // PC 카드에서 혼자 두 줄이던 제목
    [/^\/business$/, '우리 제품과 서비스를 산업 관계자에게 어떻게 알리고, 새로운 고객과 파트너를 만날까요?', '제품과 서비스를 산업 관계자에게 알리고, 새로운 고객과 파트너를 만날 접점이 부족합니다.'],
    // 모든 화면: 띄어쓰기(맞춤법) 통일
    [null, '전체보기', '전체 보기'],
    [null, '더보기', '더 보기'],
    [null, '모집중', '모집 중']
  ].filter(function (r) { return !r[0] || r[0].test(p); });
  var SKIP = 'script, style, textarea, input, select, [contenteditable], .board_txt_area, .sf-review, .sf-pv-reviews, .sf-rv-list';
  function fixText(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t;
    while ((t = w.nextNode())) {
      var v = t.nodeValue, o = v, pe = t.parentElement;
      // (Codex) 글 본문·후기·입력칸·코드는 건드리지 않아요. 띄어쓰기 규칙(주소 null)은 링크·버튼·꼬리표 글자에만
      if (!v.trim() || !pe || pe.closest(SKIP)) continue;
      var ui = !!pe.closest('a, button, .sf-tag, .sf-badge');
      for (var i = 0; i < R.length; i++) (R[i][0] || ui) && v.indexOf(R[i][1]) > -1 && (v = v.split(R[i][1]).join(R[i][2]));
      v !== o && (t.nodeValue = v);
    }
  }
  function hideSamples() {
    var H = SFUI.sampleHide || {};
    [].forEach.call(document.querySelectorAll('a[href*="bmode=view"]'), function (a) {
      var m = /idx=(\d+)/.exec(a.getAttribute('href') || '');
      if (!m || !H[m[1]] || a.closest(SKIP)) return; // 글 본문 안 링크는 그대로
      // 줄 전체(목록 줄 ul.li_body · 카드 · 표 줄)를 숨겨요 — closest 하나로 찾으면 더 가까운 제목 칸(li.tit)만 숨겨져서 하나씩 찾아요
      var row = a.closest('ul.li_body') || a.closest('._post_item_wrap') || a.closest('tr') || a.closest('[data-widget-type="board"] li, .li_board li, .sf-help li, .r3-bellp li') || (a.closest('.comment_section .list_tap') ? a : null); // Lists and previous/next navigation only; keep article body links intact.
      row && row.style.setProperty('display', 'none', 'important'); // 공지 목록 CSS 의 display:flex!important 를 이겨야 해요
    });
  }
  // (11/3 사장님) 홈 다섯 섹션의 짧은 설명. 카드·글 본문·다른 화면은 그대로 둬요.
  function homeCopy() {
    if (p !== '/') return;
    var copy = [
      ['h-course', '가장 주목받는 강의', '시니어 산업의 이해부터 사업의 실행까지'],
      ['h-live', '무료 라이브 강의', '전문가에게 배우고, 궁금한 점은 바로 물어보세요'],
      ['h-meet', '커뮤니티', '네트워킹·현장 탐방으로 배우고 연결돼요'],
      ['h-top', '이달의 BEST', '시니어 비즈니스에 필요한 배움을 골랐어요'],
      ['h-ex', '시니어퓨처 전문가 네트워크', '강연·자문 등으로 함께한 학계·산업·기관 전문가']
    ];
    copy.forEach(function (c) {
      var h = document.getElementById(c[0]), head = h && h.closest('.sf-scope .sf-sec-head'), sub = head && head.querySelector('p');
      if (!head) return;
      if (c[1] && h.textContent !== c[1]) h.textContent = c[1];
      if (sub && sub.textContent !== c[2]) sub.textContent = c[2];
    });
  }
  function run() {
    [].forEach.call(document.querySelectorAll('.sf-scope'), fixText); hideSamples();
    homeCopy();
  }
  run();
  // 게시판 목록은 아임웹이 본문을 다 읽은 뒤에 그려요 → 조금 뒤에 한 번 더
  // 고객센터 자주 묻는 질문은 우리 코드(patch/16)가 /faq 를 받아 늦게 붙여요 → 바뀔 때마다 숨김만 다시(가벼운 일만 해요)
  window.addEventListener('load', run, { once: true });
  // 글 링크가 새로 붙을 때만 다시 봐요(다른 변화는 무시), 같은 화면에서 두 번 걸지 않아요(Codex)
  if (SFUI.__copyFixMo) SFUI.__copyFixMo.disconnect();
  var LINK = 'a[href*="bmode=view"]', mo = SFUI.__copyFixMo = new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) { var n = ms[i].addedNodes[j]; if (n.nodeType === 1 && (n.matches(LINK) || n.querySelector(LINK))) { clearTimeout(mo.t); mo.t = setTimeout(hideSamples, 120); return; } }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  // 고객센터·FAQ·공지 화면은 목록이 언제 붙을지 몰라 계속 지켜봐요(그 밖의 화면은 10초)
  /^\/(help|faq|notice)/.test(p) || setTimeout(function () { mo.disconnect(); run(); }, 10000);
});
