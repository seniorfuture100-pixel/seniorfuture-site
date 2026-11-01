// (11/2) 문구 다듬기 + 예시 글 숨기기 — 게시 후 UI/UX 점검(docs/검수/게시후-전체-UIUX-카피라이팅-디자인-최적화.md)
//  ① 디자인 위젯(코드 칸) 문구: 위젯 원본은 디자인 모드에서 고쳐 저장해야 하는데, 그전까지 같은 글자를 찾아 바꿔요.
//     글자가 정확히 같을 때만 바꾸므로 위젯을 새 문구로 저장하면 아무 일도 안 해요(그때 이 목록에서 지우면 돼요).
//  ② 고객센터 공지·자주 묻는 질문의 예시 글(SFUI.sampleHide, patch/06a) — 목록에서 숨김
SFUI.register('copyFix', function () {
  var p = location.pathname.replace(/\/$/, '') || '/';
  // [주소 규칙, 바꿀 글자, 새 글자]  — 주소 규칙 null = 모든 화면
  var R = [
    // 무료 라이브: 실제 일정(11/19 목)과 다른 '매주 수요일', 보내지 않는 문자·이메일 안내를 사실대로
    [/^\/live$/, '매주 수요일 저녁, 현업 전문가에게 무료로 배우고 바로 질문해요', '현장 전문가에게 무료로 배우고, 궁금한 점은 실시간으로 물어보세요'],
    [/^\/live$/, '매주 수요일 저녁, 현업 전문가와 무료로 만나요', '신청은 무료, 참여는 온라인(Zoom)으로 해요'],
    [/^\/live$/, '신청하면 시작 30분 전에 입장 링크를 문자와 이메일로 보내드려요', '신청한 라이브는 마이페이지 › 나의 강의실에서 입장할 수 있어요'],
    // 홈: 모집 중인 모임이 있는데 '최근 열린 모임' / '현업'·'현장' 섞임
    [/^\/$/, '최근 열린 모임이에요 · 다음 소식은', '모집 중인 모임과 지난 모임이에요 · 새 모임 소식은'],
    [/^\/$/, '현업 전문가에게 무료로 배우고, 질문도 바로 해보세요', '현장 전문가에게 무료로 배우고, 궁금한 점은 바로 물어보세요'],
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
    [/^\/business$/, '우리 제품과 서비스를 산업 관계자에게 어떻게 알리고, 새로운 고객과 파트너를 만날까요?', '제품과 서비스를 산업 관계자에게 알리고, 새로운 고객과 파트너를 만날 접점이 부족합니다.'],
    // 모든 화면: 띄어쓰기(맞춤법) 통일
    [null, '전체보기', '전체 보기'],
    [null, '더보기', '더 보기'],
    [null, '모집중', '모집 중']
  ].filter(function (r) { return !r[0] || r[0].test(p); });
  function fixText(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t;
    while ((t = w.nextNode())) {
      var v = t.nodeValue, o = v;
      if (!v.trim()) continue;
      for (var i = 0; i < R.length; i++) v.indexOf(R[i][1]) > -1 && (v = v.split(R[i][1]).join(R[i][2]));
      v !== o && (t.nodeValue = v);
    }
  }
  function hideSamples() {
    var H = SFUI.sampleHide || {};
    [].forEach.call(document.querySelectorAll('a[href*="bmode=view"]'), function (a) {
      var m = /idx=(\d+)/.exec(a.getAttribute('href') || '');
      if (!m || !H[m[1]]) return;
      var row = a.closest('li, tr, ._post_item_wrap, .li_board, [class*="_post_row"]');
      row && (row.style.display = 'none');
    });
  }
  function run() { [].forEach.call(document.querySelectorAll('.sf-scope'), fixText); hideSamples(); }
  run();
  // 게시판 목록은 아임웹이 본문을 다 읽은 뒤에 그려요 → 조금 뒤에 한 번 더
  window.addEventListener('load', run, { once: true });
  setTimeout(run, 1500);
});
