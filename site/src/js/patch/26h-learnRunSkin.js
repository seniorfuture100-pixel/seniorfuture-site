// (11/5) 런런 강의실(/learn-run) 시니어퓨처 옷 입히기 — docs/런런-베타/런런-UIUX-설계-1105.md
//  런런 화면은 #learnrun-app 의 shadowRoot 안이라 사이트 CSS 가 닿지 않아요 → 그 안에 <style id=sf-lr-skin> 하나를 넣어요.
//  기준: 시니어퓨처 토큰(qa/11-1102-uiux.css) = 당근 SEED(주황 #ff6f0f 은 화면당 한 곳, 글자 #212124, 4px 간격).
//  시니어 가독성: 보조 글자 최소 14px(캡션 13px), 본문 16px, 누르는 곳 44~48px.
//  ② 처음 들어오면 '강좌 목록'(남의 강좌까지 전부) 대신 '내 학습'을 한 번 열어요(나의 강의실 '강의실 입장'에서 바로 내 강의).
//  런런을 빼면 #learnrun-app 이 없어 아무 일도 안 해요.
SFUI.register('learnRunSkin', function () {
  if (!/^\/learn-run\/?$/.test(location.pathname)) return;
  var ID = 'sf-lr-skin';
  // 떠 있는 '1:1 문의' 버튼이 휴대폰에서 영상 조작줄·카드 버튼을 가려요(11/4 점검) → 강의실에선 숨겨요(푸터 '1:1 문의하기'는 그대로)
  var fabCss = document.createElement('style');
  fabCss.textContent = 'html:root body .sf-fab.sf-fab,html:root body .sf-fab.r2-fab.r2-fab{display:none!important}';
  document.head.appendChild(fabCss);
  var O = '#ff6f0f', T = '#212124', T2 = '#555d6d', T3 = '#6b7280', LINE = '#eaebee', BG = '#f2f3f6', TINT = '#fff5f0', OT = '#c94400';
  var CSS = [
    // 1) 토큰: 런런 파랑 → 시니어퓨처 주황, 회색 글자 → 사이트 글자색(흰 바탕 대비 4.5 이상)
    ':host{--color-brand-100:' + TINT + ';--color-brand-200:#ffe8da;--color-brand-300:#ffd2b5;--color-brand-400:#ffb07f;--color-brand-500:#ff9e66;',
    '--color-brand-600:' + O + ';--color-brand-700:#e14d00;--color-brand-800:' + OT + ';--color-brand-900:#8a2e00;--color-brand-1000:#4a1800;',
    '--color-runrun-brand:' + O + ';--color-primary:' + O + ';--color-btn-primary:' + O + ';--color-primary-light:#ff9e66;--color-primary-sub:#ffb07f;',
    '--color-primary-5:' + TINT + ';--color-primary-10:#ffe8da;--color-primary-20:#ffd2b5;--color-primary-30:#ffb07f;--color-primary-40:#ff9e66;',
    '--color-primary-50:' + O + ';--color-primary-60:' + OT + ';--color-primary-70:#a33700;--color-primary-80:#6e2500;--color-primary-90:#3a1400;',
    '--color-fg-brand:' + OT + ';--color-stroke-focus-ring:#e14d00;',
    '--color-fg-neutral:' + T + ';--color-text-normal:' + T + ';--color-text-dark:' + T + ';--color-text-body:#3d4350;',
    '--color-text-subtit-gray:' + T2 + ';--color-text-subtit:' + T2 + ';--color-text-gray:' + T2 + ';--color-text-light:' + T3 + ';--color-text-muted:' + T3 + ';',
    '--color-fg-neutral-muted:' + T2 + ';--color-fg-neutral-subtle:' + T3 + ';',
    '--color-bg-primary:' + BG + ';--color-layer-basement:' + BG + ';--color-stroke-neutral-weak:' + LINE + ';',
    'font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif;font-size:16px}',
    '*:not(.material-icon){font-family:inherit}',
    '.material-icon{font-family:"Material Symbols Rounded"!important}',
    ':focus-visible{outline:none!important;box-shadow:0 0 0 2px #fff,0 0 0 4px #e14d00!important}',

    // 2) 위 메뉴(강좌목록·내 학습…): 16px, 지금 칸 = 진한 글자 + 진한 밑줄(당근 탭), 휴대폰은 옆으로 밀기
    '.gnb-nav{scrollbar-width:none}.gnb-nav::-webkit-scrollbar{display:none}',
    '.gnb-label{font-size:16px!important}.gnb-link{min-height:44px}',
    '.gnb-link.is-active,.gnb-link.is-active .gnb-label{color:' + T + '!important;font-weight:700!important;border-bottom-color:' + T + '!important}',
    '.gnb-underline.is-active{background:' + T + '!important}', // 런런이 파랑(#2a43a6)을 직접 써서 토큰으로 안 바뀌어요
    'a.gnb-staff-btn{background:' + T + '!important;color:#fff!important;border-radius:8px!important}',

    // 3) 제목: 화면 24px · 레슨 22px(사이트 휴대폰 h1 26 아래 단계)
    'h1.title{font-size:24px!important;font-weight:700!important;letter-spacing:-0.02em;color:' + T + '!important}',
    '.lesson-title{font-size:22px!important;font-weight:700!important;line-height:1.35;letter-spacing:-0.02em}',
    '.lesson-duration{font-size:14px!important}',

    // 4) 강좌 목록 카드: 설명·레슨 수 12 → 14px, 칩
    '.card-desc,.meta-label{font-size:14px!important;color:' + T2 + '!important}',
    '.status-chip{background:' + TINT + '!important;color:' + OT + '!important;font-weight:700!important}',
    '.group-chip{background:' + BG + '!important;color:' + T2 + '!important}',

    // 5) 내 학습: 숫자 진하게, 카드 제목 18px, 보조 14px, 막대 8px, 버튼 48px
    //    주황은 화면당 한 곳 — 맨 위(최근) 카드의 버튼만 주황, 나머지는 회색 버튼
    '.m-stat{font-size:14px!important;min-height:36px}.m-stat b{font-size:16px!important;color:' + T + '!important}',
    '.stat-label{font-size:15px!important}.stat-num{color:' + T + '!important}',
    '.mobile-card{border-radius:12px!important;border:1px solid ' + LINE + '}',
    '.mobile-card-title{font-size:18px!important;font-weight:700!important;line-height:1.4;color:' + T + '!important}',
    '.mobile-card-meta,.mobile-card-meta span,.progress-pct{font-size:14px!important;color:' + T2 + '!important}',
    '.progress-track{height:8px!important;background:' + BG + '!important}.progress-fill{height:8px!important;background:' + O + '!important}',
    'a.resume-link{min-height:48px!important;display:flex!important;align-items:center;justify-content:center;gap:4px;background:' + BG + '!important;color:' + T + '!important;font-size:16px!important;font-weight:700!important;border:0!important;border-radius:8px!important}',
    'a.resume-link .resume-icon{color:inherit!important;font-size:18px!important}',
    '.mobile-card:first-of-type a.resume-link{background:' + O + '!important;color:#fff!important}',
    // PC 내 학습(카드 + 위 숫자 칸)
    '.stat-value{color:' + T + '!important}',
    '.lr-card .card-title{font-size:18px!important;line-height:1.4;color:' + T + '!important}',
    '.lr-card .duration{font-size:13px!important;color:#fff!important}',
    '.tab-count{background:' + T2 + '!important}',
    // 내 과제
    '.course-name{font-size:14px!important;color:' + T2 + '!important}',
    'button.submit-btn{min-height:44px;font-size:15px!important;font-weight:700!important;background:' + O + '!important;color:#fff!important;border-radius:8px!important}',
    // 수강 등록 안 된(끝난·취소된) 레슨: 안내 크게, '수강 신청하기' = 주황 48px(우리 상품 상세로 가요)
    '.locked-title{font-size:18px!important;font-weight:700!important;color:' + T + '!important}',
    '.locked-desc{font-size:15px!important;color:' + T2 + '!important}',
    'a.locked-link{display:inline-flex!important;align-items:center;min-height:48px;padding:0 24px!important;background:' + O + '!important;color:#fff!important;font-size:16px!important;font-weight:700!important;border-radius:8px!important}',
    '.post-lock{font-size:15px!important}',
    '.lesson-progress-fill{background:' + O + '!important}.lesson-chip{font-size:14px!important}',

    // 6) 영상 화면: 레슨 목록 글자, 빈 '강의 설명이 없습니다' 칸 숨김, 댓글 버튼 44px
    '.lesson-no{font-size:15px!important}.lesson-name{font-size:17px!important;color:' + T + '!important}',
    '.lesson-item.is-current .lesson-name{color:' + OT + '!important;font-weight:700!important}',
    '.lesson-thumb-time{font-size:13px!important}',
    // 휴대폰 '커리큘럼' 아래 시트: 제목 18px, 레슨 16px, '재생중' 14px 주황 글자
    '.sheet-title{font-size:18px!important;font-weight:700!important;color:' + T + '!important}',
    '.sheet-item{min-height:56px!important}.sheet-item-title{font-size:16px!important;color:' + T + '!important}',
    '.sheet-item-meta{font-size:14px!important;color:' + T2 + '!important}.sheet-item-meta.is-current{color:' + OT + '!important;font-weight:700!important}',
    '.acc-label,.tab-label{font-size:17px!important}',
    '*:has(> .m-desc--empty),*:has(> .intro-desc--empty),.m-desc--empty,.intro-desc--empty{display:none!important}',
    '.post-photo-hint,.composer-count{font-size:13px!important}',
    'button.composer-submit{min-height:44px;min-width:64px;font-size:15px!important;font-weight:700!important;background:' + O + '!important;border-radius:8px!important}',
    '.list-empty,.lr-empty__desc{font-size:15px!important;color:' + T2 + '!important}',

    // 7) 고르기 칸·누르는 곳
    '.lr-select__trigger{min-height:44px!important;font-size:15px!important}.lr-select__label{font-size:15px!important}',
    '.curriculum-btn,.acc-toggle,.intro-toggle{min-height:44px}'
  ].join('\n');

  var opened = false;
  // '내 학습'이 아니면 누르고, 1.5초 뒤에도 아니면 다시(최대 3번) — 런런이 지난 화면을 늦게 되살려 덮는 때가 있어요
  function toMine(root, k) {
    var act = root.querySelector('.gnb-link.is-active');
    if (act && /내\s*학습/.test(act.textContent)) return emptyToList(root);
    if (k > 2) return;
    var links = root.querySelectorAll('.gnb-link');
    for (var i = 0; i < links.length; i++) if (/내\s*학습/.test(links[i].textContent)) { links[i].click(); break; }
    setTimeout(function () { toMine(root, k + 1); }, 1500);
  }
  // '내 학습'이 비어 있으면 '강좌 목록'으로 — 런런은 관리자가 직접 넣은 수강(무통장 입금 확인 뒤 수동 등록 등)을
  // '내 학습'에 안 보여 줘요(11/5 확인). 빈 화면에 멈추지 않게, 목록이 다 그려질 시간(2.5초)을 두고 한 번만 봐요
  function emptyToList(root) {
    setTimeout(function () {
      var act = root.querySelector('.gnb-link.is-active');
      if (!act || !/내\s*학습/.test(act.textContent)) return;
      if (root.querySelector('.mobile-card, .lr-card')) return;
      var links = root.querySelectorAll('.gnb-link');
      for (var i = 0; i < links.length; i++) if (/강좌\s*목록/.test(links[i].textContent)) { links[i].click(); break; }
    }, 2500);
  }
  function put() {
    var host = document.getElementById('learnrun-app');
    var root = host && host.shadowRoot;
    if (!root) return false;
    if (!root.getElementById(ID)) {
      var st = document.createElement('style');
      st.id = ID;
      st.textContent = CSS;
      root.appendChild(st); // 런런 style 뒤 = 같은 무게면 이쪽이 이겨요
    }
    // 메뉴만 그려졌을 땐 런런이 아직 지난 화면을 되살리는 중이라 누른 게 덮여요 → 본문(제목·레슨·잠김)이 뜬 뒤에 봐요
    if (!opened && root.querySelector('.gnb-link') && root.querySelector('h1.title, .lesson-title, .locked')) {
      // 첫 화면이 그려진 그때 한 번만: '내 학습'이 아니면 '내 학습'으로.
      // 런런은 지난번 보던 레슨을 다시 여는데, 수강이 끝났거나 취소된 레슨이면 '수강 등록이 필요합니다'부터 떠서 헷갈려요(11/5 일반 회원 점검).
      // 손님이 그 뒤에 다른 메뉴를 누르면 건드리지 않아요.
      opened = true;
      toMine(root, 0);
    }
    return true;
  }
  var n = 0, t = setInterval(function () { if ((put() && opened) || ++n > 60) clearInterval(t); }, 500); // 런런 앱은 늦게 떠요(최대 30초)
  if (window.MutationObserver) new MutationObserver(put).observe(document.documentElement, { childList: true, subtree: true });
});
