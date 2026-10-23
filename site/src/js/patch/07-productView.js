// 원본: src/product-view.js
/* product-view.js — 아임웹 상품 상세를 Figma 상세 화면 배치로 바꿔요 (상품 종류는 shop-list.js 의 ITEMS 로 판단)
   - 교육(PC/교육 상세 20:1011): 왼쪽 이미지 · 고정 탭(소개·커리큘럼·강사·후기·문의) · 본문 / 오른쪽 고정 구매 박스
     (태그 · 제목 · 할인가 · 상품 금액 · 찜 + 수강 신청하기 · 공유하고 수익받기)
   - 무료 라이브(PC/무료 라이브 상세 22:1451): 오른쪽 신청 카드(상태 태그 · 마감 카운트다운 · 일시 · 무료로 신청하기 · 공유하기)
     왼쪽 이런 내용을 다뤄요 · 연사 소개 · 진행 안내 · 라이브 후 더 깊게 · 수강생 후기
   - 모임(PC/모임 상세 28:2452): 태그(모임/이벤트 · 모집 상태) · 참가비 · 참여 신청하기, 왼쪽 모임 안내 · 모임 소개 · 일정 · 호스트 · 장소
   - 배송·수량·장바구니·구매평(아임웹)은 숨기고, 후기는 수강평 게시판으로 모아요.
   - 상세 설명(관리자 상품 편집)에 글이 있으면 '소개' 자리에 그대로 보여 주고, 예시 내용은 SF_SITE.details[상품번호] 로 바꿀 수 있어요.
       교육: { who:[], points:[[제목,설명]], summary, chapters:[[제목,시간,설명]], teacher:{name,role,bio,href}, faq:[[질문,답]], refund }
       라이브: { topics:[], speaker:{name,bio}, guide:[[항목,내용]], courses:[상품번호] }
       모임: { intro, checks:[], schedule:[[날짜,내용]], host:{name,bio}, address } */
SFUI.register('productView', function() {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  if (document.body.classList.contains("shop_view")) {
    var e = document.querySelector(".goods_wrapper"), s = document.querySelector(".goods_form_wrap");
    if (e && s && SFUI.once(e, "ProductView")) {
      var t, a = window.SF_SITE || {}, n = new URLSearchParams(location.search).get("idx"), i = SFUI.shopItems && SFUI.shopItems()[n] || {}, r = i.type || "course", c = "course" === r, o = "live" === r, p = "meet" === r, d = s.querySelector(".view_tit"), l = d ? d.textContent.trim() : document.title, f = String.fromCharCode(38), v = document.createElement("div"), u = [ "일", "월", "화", "수", "목", "금", "토" ], h = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>', b = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>', g = {
        3: [ "장기요양기관 운영 실무 입문: 인력·수가·평가까지 한 번에", "현장 운영자가 알려주는 6주 실무 과정", "763c8869ed481.jpg" ],
        4: [ "시니어 산업 지도: 2027 시장 구조와 기회 읽기", "숫자로 보는 시니어 시장과 진입 기회", "52414c2f66081.jpg" ],
        6: [ "시니어 고객을 위한 보험·신탁 상품 설계 실무", "연금·보험·신탁 상품 설계 실전", "c44590cd1fc7b.jpg" ],
        10: [ "시니어 비즈니스 창업 부트캠프 8주 과정", "아이템 검증부터 첫 고객까지 8주", "e733c00cd4254.jpg" ]
      }, m = [ [ "장기요양기관 운영 실무 입문", "“현장에서 바로 쓰는 인력 배치표를 얻었어요”", "요양기관을 처음 맡게 되어 막막했는데, 인력 기준과 수가 구조를 실제 사례로 설명해 주셔서 이해가 빨랐어요. 강의 자료로 받은 체크리스트를 평가 준비에 그대로 쓰고 있습니다." ], [ "2027 시니어 산업 트렌드 (무료 라이브)", "“90분 만에 시장 흐름이 한 장으로 정리됐어요”", "무료 라이브였는데 자료가 너무 좋아서 팀원들과 같이 다시 봤어요. 숫자로 보여 주니 내부 보고 자료로 바로 쓸 수 있었어요." ], [ "시니어 금융상품 설계", "“연금·신탁 상품을 고객 언어로 설명하게 됐어요”", "현장 상담에서 바로 쓸 수 있는 설명 순서를 배웠어요. 어려운 용어를 줄이니 상담 시간이 짧아졌어요." ] ], _ = {
        course: {
          who: [ "장기요양기관을 새로 열었거나 인수를 준비하는 원장님", "평가·인력 기준이 매번 헷갈리는 실무 책임자", "요양 산업으로 커리어를 옮기려는 30~50대 직장인" ],
          points: [ [ "수가 구조", "등급별 수가와 가산 항목을 표 하나로 정리" ], [ "인력 기준", "배치 기준과 대체 인력 운영법" ], [ "평가 대비", "지표별 준비 서류 체크리스트" ] ],
          summary: "총 6회 · 회당 90분 · 온라인 라이브 + 다시보기 30일",
          chapters: [ [ "장기요양 제도 한눈에 보기: 등급·급여·수가", "90분" ], [ "인력 배치 기준과 채용·교육 운영", "90분" ], [ "수가 청구 실무와 자주 생기는 환수 사례", "90분" ], [ "평가 지표별 준비 서류 체크리스트", "90분" ], [ "보호자 상담과 민원 대응 스크립트", "90분" ], [ "운영 개선 Q&A와 우리 기관 진단 실습", "90분" ] ],
          teacher: {
            name: "김지현",
            role: "요양 & 돌봄 · 前 OO요양원 원장 · 장기요양 컨설턴트",
            bio: "요양원을 10년간 운영하며 평가 최우수 등급을 4회 받았어요. 지금은 신규 기관 200여 곳의 운영을 돕고 있어요.",
            href: "/experts#e1"
          },
          faq: [ [ "다시보기는 언제까지 볼 수 있나요?", "라이브가 끝난 다음 날부터 30일 동안 나의 강의실에서 다시 볼 수 있어요." ], [ "회사 교육비로 결제하고 세금계산서를 받을 수 있나요?", "네. 결제 후 고객센터로 사업자등록증을 보내 주시면 세금계산서를 발행해 드려요." ], [ "수강 신청 후 환불은 어떻게 하나요?", "마이페이지 › 결제 내역에서 환불을 신청할 수 있어요. 아래 환불 규정을 확인해 주세요." ] ],
          refund: "개강 전 100% 환불 · 1회차 수강 후 2/3 환불 · 3회차 이후 환불 불가 (예시 규정)"
        },
        live: {
          topics: [ "요양기관 평가 지표 6개, 무엇부터 준비할까", "평가 전 2주, 서류 점검 순서", "작년 평가에서 가장 많이 감점된 항목 TOP 5" ],
          speaker: {
            name: "김지현",
            bio: "요양 컨설턴트 · 前 OO요양원 원장. 평가 최우수 등급 4회, 신규 기관 200여 곳 운영 자문."
          },
          guide: [ [ "방식", "Zoom 온라인 라이브 (질문은 채팅으로)" ], [ "입장 링크", "시작 30분 전 문자·이메일 발송" ], [ "다시보기", "종료 후 7일간 신청자에게 제공" ], [ "대상", "요양기관 원장·실무자, 요양 산업 관심자" ] ],
          courses: [ 3, 4 ]
        },
        meet: {
          intro: "요양기관을 운영하는 원장님들이 매주 모여 운영 고민을 나눠요. 이번 기수는 ‘평가 대비’와 ‘인력 채용’을 주제로 4주 동안 진행해요.",
          checks: [ "기관 운영 1년 이상 원장·관리자", "매 회차 사례 1개씩 준비해 공유", "모임 후 자유 네트워킹 30분" ],
          schedule: [ [ "1주차", "오리엔테이션 · 우리 기관 소개" ], [ "2주차", "평가 대비 사례 공유" ], [ "3주차", "인력 채용·교육 사례 공유" ], [ "4주차", "정리 · 다음 기수 계획" ] ],
          host: {
            name: "윤미래 · 시니어퓨처 파트너 연사",
            bio: "방문요양 프랜차이즈 대표, 지점 120곳 운영"
          },
          address: "서울 성동구 성수이로 00, 3층 시니어퓨처 라운지 (예시)"
        }
      }, w = {}, y = (a.details || a.courses || {})[n] || {};
      for (t in _[r]) w[t] = _[r][t];
      for (t in y) w[t] = y[t];
      var S = pe("div", "sf-pv sf-pv--" + r), x = pe("div", "sf-pv__main"), C = pe("aside", "sf-pv__side");
      C.setAttribute("data-sf-sticky", ""), C.setAttribute("data-gap", "24"), e.parentNode.insertBefore(S, e);
      var q = e.querySelector(".goods_thumbs_wrap");
      q && x.appendChild(q), C.appendChild(s), S.appendChild(x), S.appendChild(C), e.hidden = !0, 
      document.documentElement.classList.add("sf-pv-on");
      var I = c && (SFUI.cats || []).filter((function(e) {
        return e[0] === i.cat;
      }))[0], F = o ? [ "/live", "무료 라이브" ] : p ? [ "/community", "커뮤니티" ] : [ "/course", "교육" ], A = pe("nav", "sf-pv-crumb", '<a href="' + F[0] + '">' + F[1] + "</a>" + (I ? '<span aria-hidden="true">›</span><a href="/course?cat=' + I[0] + '">' + oe(I[1]) + "</a>" : "") + '<span aria-hidden="true">›</span><span aria-current="page">' + oe(l.split(":")[0]) + "</span>");
      A.setAttribute("aria-label", "현재 위치"), S.parentNode.insertBefore(A, S);
      var U = s.querySelector("header"), j = Date.now(), k = SFUI.parseDate(i.deadline), B = SFUI.parseDate(i.start), E = SFUI.parseDate(i.end), M = B && j >= B || k && j >= k, D = M ? '<span class="sf-tag sf-tag--closed">모집 마감</span>' : !M && k && k - j <= 2592e5 ? '<span class="sf-tag sf-tag--soon">마감 임박</span>' : '<span class="sf-tag sf-tag--recruit">모집중</span>', L = "";
      // (10/23 2차) 꼬리표 = 목록에서 읽어 둔 아임웹 상품 배지(없으면 아래 badgeFetch 가 목록을 한 번 받아 채워요)
      var ht = null;
      try { ht = (SFUI.__hash || {})[n] || JSON.parse(sessionStorage.getItem("sf_badges") || "{}")[n] || null; } catch (x) {}
      c && (ht || i.tags) && (L = SFUI.tagHtml ? SFUI.tagHtml(ht || i.tags) : ve(i.tags)), o && (L = D + (k && !M ? '<span class="sf-tag sf-tag--dday">D-' + Math.max(0, Math.ceil((k - j) / 864e5)) + "</span>" : "") + '<span class="sf-tag sf-tag--free">무료</span>'), 
      p && (L = '<span class="sf-tag sf-tag--' + ("이벤트" === i.kind ? "event" : "meet") + '">' + oe(i.kind || "모임") + "</span>" + D), 
      ht && !c && SFUI.tagHtml && (L += SFUI.tagHtml(ht));
      U && L && U.insertBefore(pe("div", "sf-tags sf-pv-tags", L), U.firstChild);
      ht || badgeFetch(n, (function(e) {
        if (e && SFUI.tagHtml) {
          var s = U && U.querySelector(".sf-pv-tags"), t = SFUI.tagHtml(e);
          c ? s ? s.innerHTML = t : U && U.insertBefore(pe("div", "sf-tags sf-pv-tags", t), U.firstChild) : s && s.insertAdjacentHTML("beforeend", t);
        }
      }));
      var N = s.querySelector(".pay_detail");
      if (N) {
        var T = N.querySelector(".real_price"), H = function(e) {
          return Number(String(e).replace(/[^0-9]/g, "")) || 0;
        }, O = [].filter.call(N.querySelectorAll("span, del, s, strike"), (function(e) {
          return e !== T && 0 === e.childElementCount && /원/.test(e.textContent) && (/^(DEL|S|STRIKE)$/.test(e.tagName) || /line-through/.test(getComputedStyle(e).textDecorationLine));
        }))[0];
        if (T && O && H(O.textContent) > H(T.textContent)) {
          var R = Math.round(100 * (1 - H(T.textContent) / H(O.textContent)));
          N.insertBefore(pe("div", "sf-pv-was", "<b>" + R + "%</b><s>" + oe(O.textContent.trim()) + "</s>"), N.firstChild), 
          O.style.display = "none";
        }
      }
      var z = s.querySelector(".buy_btns.pc ._btn_buy"), P = o ? "무료로 신청하기" : p ? "참가 신청하기" : "수강 신청하기";
      z && (z.textContent = P), s.querySelectorAll(".buy_btns.mobile ._btn_buy, .buy_btns.mobile .defualt.buy").forEach((function(e) {
        e.textContent = P;
      }));
      var Q = s.querySelector(".opt_block.total .body_font_color_70");
      Q && (Q.textContent = "상품 금액");
      var V = s.querySelector(".buy_btns.pc");
      if (o) {
        U && k && U.appendChild(pe("div", "sf-countdown sf-pv-cd", '<span data-sf-countdown-label>신청 마감까지 남은 시간</span><span class="sf-pv-cd__t"><b data-unit="d">0</b>일 <b data-unit="h">00</b>시간 <b data-unit="m">00</b>분 <b data-unit="s">00</b>초</span>'));
        var K = U && U.querySelector(".sf-pv-cd");
        K && (K.setAttribute("data-sf-countdown", ""), K.setAttribute("data-deadline", i.deadline), 
        K.setAttribute("data-ended-text", "신청이 마감되었어요"), d && U.insertBefore(K, d)), B && V && V.parentNode.insertBefore(pe("p", "sf-pv-when", h + "<span>" + le(B) + " " + fe(B) + (E ? " – " + fe(E) : "") + "</span>"), V), 
        V && V.parentNode.insertBefore(pe("button", "sf-pv-sharebtn", "공유하기"), V.nextSibling);
        var Z = s.querySelector(".sf-pv-sharebtn");
        Z && (Z.type = "button", Z.setAttribute("data-sf-share-link", "")), M && z && (z.textContent = "신청이 마감되었어요", 
        z.classList.add("is-disabled"));
      } else {
        var $ = pe("div", "sf-pv-share", "<div><strong>링크로 구매 시, 최대 " + oe(window.SF_SHARE && SF_SHARE.rate || "00%") + ' 적립</strong><span>친구가 결제하면 적립금이 쌓여요</span></div><button type="button" class="sf-pv-share__btn" data-sf-reward-share data-title="' + oe(l) + '">공유하고 수익받기</button>');
        V && V.parentNode.insertBefore($, V.nextSibling);
      }
      function meetInfo() {
        return '<section class="sf-pv-sec sf-pv-meetinfo"><h2>모임 안내</h2><div class="sf-pv-infobox">' + [ [ h, "일시", (i.date || (B ? le(B) : "")) + (B ? " · " + fe(B) : "") ], [ b, "장소", i.place || "" ], [ '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', "마감", k ? le(k) + "까지" : "" ] ].filter((function(e) {
          return e[2];
        })).map((function(e) {
          return "<p>" + e[0] + "<b>" + e[1] + "</b><span>" + oe(e[2]) + "</span></p>";
        })).join("") + "</div></section>";
      }
      var G = document.querySelector(".detail_detail_wrap"), J = document.querySelector(".detail_qna_wrap"), W = document.getElementById("prod_detail_body"), X = '<div class="sf-pv-own" data-sf-own></div>', Y = [ [ "sf-pv-intro", "소개" ] ], ee = "", OW = W && ownSecs(W);
      // (10/23 2차) 예시 내용(가짜 강사·커리큘럼)은 예전부터 있던 상품(코드 표)이나 SF_SITE.details 가 있는 상품만. 새 상품은 쓴 글만 '소개'로
      !OW && W && !(SFUI.__baseItems || {})[n] && !(a.items || {})[n] && !(a.details || a.courses || {})[n] && (OW = splitRefund({ pre: [].filter.call(W.childNodes, (function(e) {
        return !(1 === e.nodeType && /^(STYLE|SCRIPT)$/.test(e.tagName));
      })), secs: [] }));
      if (OW) {
        // (10/23) 상세 설명에 [제목] 줄이 있으면 예시 내용 대신 사장님이 쓴 글로 탭을 만들어요
        p && (ee += meetInfo());
        var hasPre = OW.pre.some((function(e) {
          return (e.textContent || "").trim() || e.querySelector && e.querySelector("img,iframe,video,table");
        }));
        Y = hasPre ? [ [ "sf-pv-intro", "소개" ] ] : [], hasPre && (ee += '<section id="sf-pv-intro" class="sf-pv-sec sf-pv-ownsec" data-sf-own-i="pre"><h2>소개</h2></section>');
        OW.secs.forEach((function(e, s) {
          var t = s || hasPre ? "sf-pv-d" + (s + 1) : "sf-pv-intro";
          Y.push([ t, e.t ]), ee += '<section id="' + t + '" class="sf-pv-sec sf-pv-ownsec" data-sf-own-i="' + s + '"><h2>' + oe(e.t) + "</h2></section>";
        })), (c || o) && (Y.push([ "sf-pv-review", "후기" ]), ee += ue());
      } else if (c) {
        Y.push([ "sf-pv-curri", "커리큘럼" ], [ "sf-pv-teacher", "강사" ], [ "sf-pv-review", "후기" ]), 
        ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>이런 분께 추천해요</h2>' + he(w.who) + "</section>", 
        ee += '<section class="sf-pv-sec"><h2>이 강의에서 배우는 것</h2><ol class="sf-pv-points">' + w.points.map((function(e, s) {
          return "<li><small>0" + (s + 1) + "</small><strong>" + oe(e[0]) + "</strong><p>" + oe(e[1]) + "</p></li>";
        })).join("") + "</ol>" + X + "</section>", ee += '<section id="sf-pv-curri" class="sf-pv-sec"><h2>커리큘럼</h2><p class="sf-pv-sub">' + oe(w.summary) + '</p><div class="sf-pv-chapters" data-sf-accordion>' + w.chapters.map((function(e, s) {
          return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><b>' + (s + 1) + "회</b><span>" + oe(e[0]) + "</span><em>" + oe(e[1] || "") + "</em></button><div data-sf-acc-panel>" + oe(e[2] || "회차별 자료와 실습 과제가 함께 제공돼요.") + "</div></div>";
        })).join("") + "</div></section>";
        var se = w.teacher;
        ee += '<section id="sf-pv-teacher" class="sf-pv-sec"><h2>강사 소개</h2><div class="sf-pv-teacher"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(se.name) + "</strong><small>" + oe(se.role) + "</small><p>" + oe(se.bio) + '</p><a href="' + oe(se.href || "/experts") + '">강사 프로필 보기 <span aria-hidden="true">›</span></a></div></div></section>', 
        ee += ue(), ee += '<section class="sf-pv-sec"><h2>자주 묻는 질문</h2><div class="sf-pv-faq" data-sf-accordion data-single>' + w.faq.map((function(e) {
          return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><b>Q</b><span>' + oe(e[0]) + "</span></button><div data-sf-acc-panel>" + oe(e[1]) + "</div></div>";
        })).join("") + '</div><div class="sf-pv-refund"><strong>환불 규정</strong><p>' + oe(w.refund) + "</p></div></section>";
      } else if (o) {
        Y.push([ "sf-pv-speaker", "연사" ], [ "sf-pv-guide", "진행 안내" ], [ "sf-pv-review", "후기" ]);
        var te = (B ? [ [ "일시", le(B) + " " + fe(B) + (E ? " – " + fe(E) : "") ] ] : []).concat(w.guide);
        ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>이런 내용을 다뤄요</h2>' + he(w.topics) + X + "</section>", 
        ee += '<section id="sf-pv-speaker" class="sf-pv-sec"><h2>연사 소개</h2><div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.speaker.name) + "</strong><p>" + oe(w.speaker.bio) + "</p></div></div></section>", 
        ee += '<section id="sf-pv-guide" class="sf-pv-sec"><h2>진행 안내</h2><dl class="sf-pv-guide">' + te.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl></section>", ee += '<section class="sf-pv-sec"><h2>라이브 후 더 깊게 배우고 싶다면</h2><ul class="sf-pv-more">' + w.courses.filter((function(e) {
          return g[e];
        })).map((function(e) {
          var s = g[e], t = SFUI.shopItems && SFUI.shopItems()[e] || {};
          return '<li><a class="sf-ccard" href="/course/?idx=' + e + '"><span class="sf-ccard__thumb"><img src="https://cdn.imweb.me/upload/S20261016dceb77aecc2e2/' + s[2] + '" alt="" loading="lazy"></span><span class="sf-ccard__body"><strong>' + oe(s[0]) + "</strong><p>" + oe(s[1]) + '</p><span class="sf-tags">' + ve(t.tags || []) + "</span></span></a></li>";
        })).join("") + "</ul></section>", ee += ue();
      } else {
        Y.push([ "sf-pv-schedule", "일정" ], [ "sf-pv-host", "호스트" ], [ "sf-pv-place", "장소" ]), 
        ee += meetInfo(), ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>모임 소개</h2><p class="sf-pv-lead">' + oe(w.intro) + "</p>" + he(w.checks) + X + "</section>", 
        ee += '<section id="sf-pv-schedule" class="sf-pv-sec"><h2>일정</h2><dl class="sf-pv-guide sf-pv-guide--rows">' + w.schedule.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl></section>", ee += '<section id="sf-pv-host" class="sf-pv-sec"><h2>호스트</h2><div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.host.name) + "</strong><p>" + oe(w.host.bio) + "</p></div></div></section>", 
        ee += '<section id="sf-pv-place" class="sf-pv-sec"><h2>장소</h2><div class="sf-pv-map" aria-hidden="true">' + b + '</div><p class="sf-pv-sub">' + oe(w.address) + "</p></section>";
      }
      Y.push([ "sf-pv-qna", "문의" ]);
      var ae = pe("nav", "sf-tabs sf-pv-tabs", Y.map((function(e, s) {
        return '<a href="#' + e[0] + '" class="sf-tab' + (s ? "" : " is-active") + '">' + e[1] + "</a>";
      })).join(""));
      OW && ae.classList.add("sf-pv-tabs--own"), ae.setAttribute("data-sf-anchor-tabs", ""), ae.setAttribute("data-offset", "130"), 
      ae.setAttribute("aria-label", "상세 내용 바로가기"), x.appendChild(ae);
      var ne = pe("div", "sf-pv-secs", ee);
      x.appendChild(ne);
      var ie = ne.querySelector("[data-sf-own]");
      G && ie && ie.appendChild(G);
      var re = document.querySelector(".detail_detail_wrap_mobile");
      if (re && ie && ie.appendChild(re), W && ie && !W.textContent.trim() && !W.querySelector("img") && ie.classList.add("is-empty"), 
      J) {
        var ce = pe("section", "sf-pv-sec sf-pv-qna");
        ce.id = "sf-pv-qna", ce.appendChild(pe("h2", "", "문의")), ce.appendChild(J), ne.appendChild(ce);
      }
      OW && ([].forEach.call(ne.querySelectorAll("[data-sf-own-i]"), (function(e) {
        var s = e.getAttribute("data-sf-own-i"), t = pe("div", "sf-pv-ownbody shop_view_body fr-view");
        ("pre" === s ? OW.pre : OW.secs[+s].n).forEach((function(e) {
          t.appendChild(e);
        })), [].forEach.call(t.querySelectorAll("img"), (function(e) {
          var s = e.getAttribute("data-src") || e.getAttribute("data-original");
          s && !e.getAttribute("src") && (e.src = s);
        })), e.appendChild(t);
      })), G && (G.hidden = !0), re && (re.hidden = !0));
      document.querySelectorAll(".categorize.review-box, .detail_review_wrap").forEach((function(e) {
        e.hidden = !0;
      })), window.SFUI && SFUI.init && SFUI.init(S);
    }
  }
  // (10/23) 상세 설명을 [제목] 줄로 나눠요. '[커리큘럼]'·'【강사 소개】'처럼 괄호로 감싼 20자 이내 한 줄만 제목으로 봐요
  //   첫 제목 앞의 글은 '소개' 칸. 제목 줄이 없으면 null → 예전처럼 예시 내용 + 상세 설명
  function ownSecs(W) {
    for (var e = W, s; (s = [].filter.call(e.children, (function(e) {
      return !/^(STYLE|SCRIPT)$/.test(e.tagName);
    }))).length === 1 && /^(DIV|SECTION|ARTICLE)$/.test(s[0].tagName); ) e = s[0];
    var t = [], a = [], n = null;
    return [].slice.call(e.childNodes).forEach((function(e) {
      if (1 !== e.nodeType || !/^(STYLE|SCRIPT)$/.test(e.tagName)) {
        var s = 1 === e.nodeType && !e.querySelector("img,iframe,video,table") && /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/.exec(e.textContent);
        s ? (n = { t: s[1], n: [] }, t.push(n)) : (n ? n.n : a).push(e);
      }
    }));
    return t.length ? splitRefund({ pre: a, secs: t }) : null;
  }
  // (10/23 2차) '상품 상세 하단 공통'(교환·반품 안내 '<교환 및 반품 가능 기간>' 등)은 마지막 칸에 섞이지 않게 '교환·환불 안내' 칸으로 떼어 내요
  function splitRefund(o) {
    var last = o.secs.length ? o.secs[o.secs.length - 1].n : o.pre, k = -1;
    last.some((function(e, s) {
      return /^\s*[<＜〈]\s*(교환|반품|환불)/.test(e.textContent || "") && (k = s, !0);
    }));
    k >= 0 && o.secs.push({ t: "교환·환불 안내", n: last.splice(k) });
    return o;
  }
  // 상세 화면에 꼬리표가 아직 없으면(목록을 거치지 않고 바로 들어온 경우) 같은 목록 주소를 한 번 받아 배지를 읽어요
  function badgeFetch(idx, done) {
    if (!idx || !SFUI.badgeTags || !window.fetch || !window.DOMParser) return;
    var pm = /preview_mode=1/.test(location.search) ? "?preview_mode=1" : "";
    fetch((location.pathname.replace(/\/$/, "") || "/") + pm, { credentials: "same-origin" }).then((function(e) {
      return e.ok ? e.text() : "";
    })).then((function(e) {
      var s = e && new DOMParser().parseFromString(e, "text/html"), a = {}, r = s ? [ s ].concat([].map.call(s.querySelectorAll("template"), (function(e) {
        return e.content;
      }))) : [];
      // 상품 카드는 목록 위젯의 그림자 영역 틀(<template>) 안에 들어 있어요
      r.forEach((function(s) {
        [].forEach.call(s.querySelectorAll("li.iw-shop-card[data-system-product-id]"), (function(e) {
        var s = SFUI.badgeTags(e.querySelector(".iw-shop-product-badges"));
          s && (a[e.getAttribute("data-system-product-id")] = s, SFUI.saveBadgeTags(e.getAttribute("data-system-product-id"), s));
        }));
      }));
      done(a[idx] || null);
    }))["catch"]((function() {}));
  }
  function oe(e) {
    return v.textContent = null == e ? "" : String(e), v.innerHTML.replace(/"/g, f + "#34;");
  }
  function pe(e, s, t) {
    var a = document.createElement(e);
    return s && (a.className = s), null != t && (a.innerHTML = t), a;
  }
  function de(e) {
    return (e < 10 ? "0" : "") + e;
  }
  function le(e) {
    var s = new Date(e);
    return s.getMonth() + 1 + "월 " + s.getDate() + "일 (" + u[s.getDay()] + ")";
  }
  function fe(e) {
    var s = new Date(e);
    return de(s.getHours()) + ":" + de(s.getMinutes());
  }
  function ve(e) {
    return SFUI.shopTags ? e.map((function(e) {
      var s = SFUI.shopTags[e];
      return s ? '<span class="sf-tag sf-tag--' + s[0] + '">' + s[1] + "</span>" : "";
    })).join("") : "";
  }
  function ue() {
    return '<section id="sf-pv-review" class="sf-pv-sec"><div data-sf-carousel><div class="sf-pv-sechead"><div><h2>수강생 후기</h2><p class="sf-pv-sub">시니어퓨처 강의·라이브를 들은 분들의 후기를 모두 모아 보여 드려요</p></div><div class="sf-pv-arrows"><button type="button" class="sf-arrow" data-sf-prev aria-label="이전 후기">‹</button><button type="button" class="sf-arrow" data-sf-next aria-label="다음 후기">›</button></div></div><div class="sf-track sf-pv-reviews" data-sf-track>' + m.map((function(e) {
      return '<a class="sf-review sf-slide" href="/review"><span class="sf-review__course">' + oe(e[0]) + '</span><span class="sf-review__top"><span class="sf-review__quote">' + oe(e[1]) + '</span></span><span class="sf-review__body">' + oe(e[2]) + '</span><span class="sf-review__more">후기 자세히 보기 →</span></a>';
    })).join("") + '</div></div><a class="sf-pv-allreview" href="/review">후기 전체보기 →</a></section>';
  }
  function he(e) {
    return '<ul class="sf-pv-who">' + e.map((function(e) {
      return "<li>" + oe(e) + "</li>";
    })).join("") + "</ul>";
  }
})
