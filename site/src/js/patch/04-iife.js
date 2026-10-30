// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
!function() {
  var t = {
    3: {
      type: "course",
      cat: "care",
      tags: [ "best", "early" ]
    },
    4: {
      type: "course",
      cat: "intro",
      tags: []
    },
    5: {
      type: "course",
      cat: "housing",
      tags: [ "hot", "first" ]
    },
    6: {
      type: "course",
      cat: "finance",
      tags: [ "best" ]
    },
    7: {
      type: "course",
      cat: "commerce",
      tags: [ "closing", "early" ]
    },
    8: {
      type: "course",
      cat: "health",
      tags: [ "early" ]
    },
    9: {
      type: "course",
      cat: "life",
      tags: [ "hot" ]
    },
    10: {
      type: "course",
      cat: "startup",
      tags: [ "best", "first" ]
    },
    11: {
      type: "live",
      start: "2026-10-28T19:30:00+09:00",
      end: "2026-10-28T21:00:00+09:00",
      deadline: "2026-10-27T17:00:00+09:00"
    },
    12: {
      type: "live",
      start: "2026-10-21T19:30:00+09:00",
      end: "2026-10-21T20:00:00+09:00",
      deadline: "2026-10-20T17:00:00+09:00"
    },
    13: {
      type: "live",
      start: "2026-11-05T19:30:00+09:00",
      end: "2026-11-05T21:00:00+09:00",
      deadline: "2026-11-04T17:00:00+09:00"
    },
    14: {
      type: "live",
      start: "2026-11-12T19:30:00+09:00",
      end: "2026-11-12T21:00:00+09:00",
      deadline: "2026-11-11T17:00:00+09:00"
    },
    15: {
      type: "meet",
      kind: "모임",
      date: "11월 8일 (일)",
      place: "서울 성수 · 오프라인",
      start: "2026-11-08T14:00:00+09:00",
      deadline: "2026-11-06T18:00:00+09:00"
    },
    16: {
      type: "meet",
      kind: "이벤트",
      date: "11월 14일 (토)",
      place: "온라인 · Zoom",
      start: "2026-11-14T19:30:00+09:00",
      deadline: "2026-11-12T18:00:00+09:00"
    },
    17: {
      type: "meet",
      kind: "모임",
      date: "11월 20일 (금)",
      place: "서울 강남 · 오프라인",
      start: "2026-11-20T19:30:00+09:00",
      deadline: "2026-11-18T18:00:00+09:00"
    },
    18: {
      type: "meet",
      kind: "이벤트",
      date: "11월 27일 (금)",
      place: "경기 판교 · 오프라인",
      start: "2026-11-27T14:00:00+09:00",
      deadline: "2026-11-25T18:00:00+09:00"
    },
    19: {
      type: "meet",
      kind: "모임",
      date: "12월 3일 (목)",
      place: "온라인 · Zoom",
      start: "2026-12-03T19:30:00+09:00",
      deadline: "2026-12-01T18:00:00+09:00"
    },
    20: {
      type: "meet",
      kind: "모임",
      date: "12월 6일 (일)",
      place: "서울 여의도 · 오프라인",
      start: "2026-12-06T14:00:00+09:00",
      deadline: "2026-10-20T18:00:00+09:00"
    },
    21: {
      type: "meet",
      kind: "이벤트",
      date: "12월 12일 (토)",
      place: "서울 성수 · 오프라인",
      start: "2026-12-12T19:00:00+09:00",
      deadline: "2026-10-15T18:00:00+09:00"
    },
    22: {
      type: "meet",
      kind: "모임",
      date: "9월 20일 (일)",
      place: "서울 성수 · 오프라인",
      start: "2026-09-20T14:00:00+09:00",
      deadline: "2026-09-18T18:00:00+09:00"
    },
    23: {
      type: "live",
      start: "2026-11-19T19:30:00+09:00",
      end: "2026-11-19T21:00:00+09:00",
      deadline: "2026-11-18T17:00:00+09:00"
    },
    24: {
      type: "live",
      start: "2026-11-26T19:30:00+09:00",
      end: "2026-11-26T21:00:00+09:00",
      deadline: "2026-11-25T17:00:00+09:00"
    },
    25: {
      type: "live",
      start: "2026-09-24T19:30:00+09:00",
      end: "2026-09-24T21:00:00+09:00",
      deadline: "2026-09-23T17:00:00+09:00"
    },
    26: {
      type: "live",
      start: "2026-09-10T19:30:00+09:00",
      end: "2026-09-10T21:00:00+09:00",
      deadline: "2026-09-09T17:00:00+09:00"
    }
,
    // (10/26) 지난 행사(idx 29~51, events.json·created.json 에서 생성) — 모집 마감 표시·정렬용
    29: {"type": "meet", "kind": "세미나", "past": true, "date": "7월 4일 (토)", "start": "2026-07-04T11:00:00+09:00", "place": "공덕역 Front1", "deadline": "2026-07-04T11:00:00+09:00"},
    30: {"type": "meet", "kind": "세미나", "past": true, "date": "7월 18일 (토)", "start": "2026-07-18T10:40:00+09:00", "place": "공덕역 Front1", "deadline": "2026-07-18T10:40:00+09:00"},
    31: {"type": "meet", "kind": "세미나", "past": true, "date": "8월 8일 (토)", "start": "2026-08-08T10:40:00+09:00", "place": "공덕역 Front1", "deadline": "2026-08-08T10:40:00+09:00"},
    32: {"type": "meet", "kind": "웨비나", "past": true, "date": "8월 13일 (목)", "start": "2026-08-13T20:00:00+09:00", "place": "온라인", "deadline": "2026-08-13T20:00:00+09:00"},
    33: {"type": "meet", "kind": "세미나", "past": true, "date": "8월 29일 (토)", "start": "2026-08-29T10:40:00+09:00", "place": "공덕역 Front1", "deadline": "2026-08-29T10:40:00+09:00"},
    34: {"type": "meet", "kind": "세미나", "past": true, "date": "2월 21일 (토)", "start": "2026-02-21T00:00:00+09:00", "deadline": "2026-02-21T00:00:00+09:00"},
    35: {"type": "meet", "kind": "포럼", "past": true, "date": "3월 22일 (일)", "start": "2026-03-22T10:00:00+09:00", "place": "서울 COEX 1F 그랜드볼룸", "deadline": "2026-03-22T10:00:00+09:00"},
    36: {"type": "meet", "kind": "워크숍", "past": true, "date": "4월 11일 (토)", "start": "2026-04-11T00:00:00+09:00", "deadline": "2026-04-11T00:00:00+09:00"},
    37: {"type": "meet", "kind": "세미나", "past": true, "date": "4월 18일 (토)", "start": "2026-04-18T15:00:00+09:00", "place": "서울대입구역 DESKER", "deadline": "2026-04-18T15:00:00+09:00"},
    38: {"type": "meet", "kind": "북토크", "past": true, "date": "5월 13일 (수)", "start": "2026-05-13T15:00:00+09:00", "place": "논현역 이투데이 19F", "deadline": "2026-05-13T15:00:00+09:00"},
    39: {"type": "meet", "kind": "북토크", "past": true, "start": "2026-01-01T00:00:00+09:00", "deadline": "2026-01-01T00:00:00+09:00"},
    40: {"type": "meet", "kind": "강연", "past": true, "start": "2026-01-01T00:00:00+09:00", "place": "성남시니어혁신센터", "deadline": "2026-01-01T00:00:00+09:00"},
    41: {"type": "meet", "kind": "현장 탐방", "past": true, "date": "2월 19일 (목)", "start": "2026-02-19T14:00:00+09:00", "place": "성남시니어산업혁신센터", "deadline": "2026-02-19T14:00:00+09:00"},
    42: {"type": "meet", "kind": "현장 탐방", "past": true, "date": "6월 11일 (목)", "start": "2026-06-11T09:30:00+09:00", "place": "KB골든라이프빌딩", "deadline": "2026-06-11T09:30:00+09:00"},
    43: {"type": "meet", "kind": "현장 탐방", "past": true, "start": "2026-01-01T00:00:00+09:00", "place": "KB골든라이프빌딩", "deadline": "2026-01-01T00:00:00+09:00"},
    44: {"type": "meet", "kind": "네트워킹", "past": true, "date": "7월 4일 (토)", "start": "2026-07-04T09:30:00+09:00", "place": "서울 마포구 공덕역 Front1", "deadline": "2026-07-04T09:30:00+09:00"},
    45: {"type": "meet", "kind": "현장 탐방", "past": true, "date": "7월 9일 (목)", "start": "2026-07-09T09:30:00+09:00", "place": "경기도 성남시 중원구 양현로 405", "deadline": "2026-07-09T09:30:00+09:00"},
    46: {"type": "meet", "kind": "네트워킹", "past": true, "date": "8월 1일 (토)", "start": "2026-08-01T09:30:00+09:00", "place": "서울 마포구 공덕역 인근", "deadline": "2026-08-01T09:30:00+09:00"},
    47: {"type": "meet", "kind": "포럼", "past": true, "date": "9월 9일 (수)", "start": "2026-09-09T13:00:00+09:00", "place": "부산 BEXCO 제1전시장 314~315호", "deadline": "2026-09-09T13:00:00+09:00"},
    48: {"type": "meet", "kind": "포럼", "past": true, "date": "9월 9일 (수)", "start": "2026-09-09T13:00:00+09:00", "place": "부산 BEXCO 제1전시장 314~315호", "deadline": "2026-09-09T13:00:00+09:00"},
    49: {"type": "meet", "kind": "현장 탐방", "past": true, "date": "9월 18일 (금)", "start": "2026-09-18T11:00:00+09:00", "place": "종로평창카운티", "deadline": "2026-09-18T11:00:00+09:00"},
    50: {"type": "meet", "kind": "네트워킹", "past": true, "date": "10월 2일 (금)", "start": "2026-10-02T18:30:00+09:00", "place": "서울 마포구 공덕역 FRONT1", "deadline": "2026-10-02T18:30:00+09:00"},
    51: {"type": "meet", "kind": "네트워킹", "past": true, "start": "2026-01-01T00:00:00+09:00", "deadline": "2026-01-01T00:00:00+09:00"},
    // (10/26) 지난 기수(8·9·10기) — 판매 종료
    52: {"type": "course", "past": true},
    53: {"type": "course", "past": true},
    54: {"type": "course", "past": true},
    // (10/26) 인스타그램(@senior_future) 2024~2025 행사(idx 55~61) — 지난 행사. 날짜 모르는 55는 게시일(2024-07)로 정렬만
    55: {"type": "meet", "kind": "세미나", "past": true, "start": "2024-07-30T00:00:00+09:00", "deadline": "2024-07-30T00:00:00+09:00"},
    56: {"type": "meet", "kind": "아이디어톤", "past": true, "date": "12월 7일 (토)", "start": "2024-12-07T00:00:00+09:00", "deadline": "2024-12-07T00:00:00+09:00"},
    57: {"type": "meet", "kind": "콘서트", "past": true, "date": "12월 21일 (토)", "start": "2024-12-21T14:00:00+09:00", "place": "서울창업허브 공덕", "deadline": "2024-12-21T14:00:00+09:00"},
    58: {"type": "meet", "kind": "플로깅", "past": true, "date": "5월 10일 (토)", "start": "2025-05-10T14:00:00+09:00", "place": "뚝섬한강공원", "deadline": "2025-05-10T14:00:00+09:00"},
    59: {"type": "meet", "kind": "프로젝트", "past": true, "date": "5월 17일 (토)", "start": "2025-05-17T14:00:00+09:00", "place": "서울창업허브 공덕", "deadline": "2025-05-17T14:00:00+09:00"},
    60: {"type": "meet", "kind": "아이디어톤", "past": true, "date": "7월 5일 (토)", "start": "2025-07-05T10:00:00+09:00", "place": "디캠프 마포", "deadline": "2025-07-05T10:00:00+09:00"},
    61: {"type": "meet", "kind": "콘서트", "past": true, "date": "7월 19일 (토)", "start": "2025-07-19T14:00:00+09:00", "place": "서울창업허브 공덕", "deadline": "2025-07-19T14:00:00+09:00"}
  }, e = {
    best: [ "best", "🔥 BEST" ],
    new: [ "new", "NEW" ],
    hot: [ "hot", "인기급상승" ],
    early: [ "early", "얼리버드" ],
    first: [ "first", "선착순" ],
    closing: [ "closing", "마감임박" ]
  }, a = [];
  // (10/26) 모임/이벤트 탭: 세미나·포럼·웨비나·강연·북토크·워크숍·콘서트·아이디어톤 등은 이벤트, 커피챗·네트워킹·현장 탐방은 모임
  SFUI.isEvent = function(k) {
    return /이벤트|세미나|웨비나|포럼|강연|북토크|워크숍|콘서트|아이디어톤|프로젝트/.test(k || "");
  };
  SFUI.shopItems = function() {
    var k, o = {}, x = window.SF_SITE && SF_SITE.items || {};
    for (k in t) o[k] = t[k];
    for (k in x) o[k] = x[k];
    for (k in SFUI.__hash) { var q = {}, z; for (z in o[k] || {}) q[z] = o[k][z]; q.tags = SFUI.__hash[k]; o[k] = q; }
    return o;
  };
  SFUI.shopTags = e;
  // (10/23 2차) 아임웹 상품 편집 '상품 강조 설정 → 상품 배지' 체크칸 → 꼬리표
  //   베스트→BEST · 주문폭주→인기급상승 · 오늘출발→얼리버드 · MD추천→선착순 한정
  //   (요약 설명 #꼬리표 방식은 요약 설명이 광고 문구로도 나가서 뺐어요. 대표 이미지 좌상단·하단 배지는 지금 목록 화면에 실려 오지 않아 못 써요)
  //   (10/23) NEW 는 쓰지 않아요 — 새 목록 위젯이 '신상품' 체크를 내보내지 않아 새 상품에 붙일 수 없어서, 예전 상품 표에서도 뺐어요
  //   체크칸이 하나도 없으면 위 표(t)의 tags 를 그대로 써요. 목록에서 읽은 값은 상세 화면도 쓰도록 sessionStorage 에 남겨요
  var BADGE = { best: "best", hot: "hot", "today-shipping": "early", md: "limited" };
  e.limited = [ "first", "선착순 한정" ];
  SFUI.__baseItems = t;
  SFUI.__hash = SFUI.__hash || {};
  SFUI.badgeTags = function(box) {
    var out = [];
    box && [].forEach.call(box.querySelectorAll(".iw-shop-badge"), function(b) {
      var m = /iw-shop-badge--([a-z-]+)/.exec(b.className), k = m && BADGE[m[1]];
      k && out.indexOf(k) < 0 && out.push(k);
    });
    return out.length ? out : null;
  };
  SFUI.saveBadgeTags = function(idx, tags) {
    if (!idx || !tags) return;
    SFUI.__hash[idx] = tags;
    try { var o = JSON.parse(sessionStorage.getItem("sf_badges") || "{}"); o[idx] = tags; sessionStorage.setItem("sf_badges", JSON.stringify(o)); } catch (x) {}
  };
  SFUI.tagHtml = function(list) {
    return (list || []).map(function(t) {
      var x = e[t];
      return x ? '<span class="sf-tag sf-tag--' + x[0] + '">' + x[1] + "</span>" : "";
    }).join("");
  };
  // (10/30) 커뮤니티 상태: 모집중 · 마감 임박 · 종료 (SFUI.meetState, ui/06)
  function s(t) {
    return SFUI.meetState(t);
  }
  function r(r) {
    var i = r.shadowRoot;
    if (i) {
      var c = i.querySelector(".iw-shop-grid");
      if (c) {
        var l = function() {
          var e, a = {}, s = window.SF_SITE && SF_SITE.items || {};
          for (e in t) a[e] = t[e];
          for (e in s) a[e] = s[e];
          if (window.__sfFixDay) for (e in a) a[e] = __sfFixDay(a[e]);
          return a;
        }(), d = i.querySelectorAll("li.iw-shop-card"), p = i.querySelector(".widget-sandbox-root") || c.parentNode;
        // (10/27) 목록 종류: 메뉴 주소 우선(/live·/community·/course). 예전엔 첫 카드로만 정해서, 코드 표에 없는 새 상품이 맨 앞에 오면
        //   무료 라이브 목록 전체가 '교육'으로 꾸며졌어요(신청 버튼이 카드 위로). 홈은 코드 표에 있는 첫 카드 기준
        var pth = location.pathname, u = [].filter.call(d, (function(x) {
          return l[x.getAttribute("data-system-product-id")];
        }))[0], f = /^\/live/.test(pth) ? "live" : /^\/community/.test(pth) ? "meet" : /^\/course/.test(pth) ? "course" : u && l[u.getAttribute("data-system-product-id")].type || "course";
        if (!i.getElementById("sf-shop-css")) {
          var h = document.createElement("style");
          h.id = "sf-shop-css", h.textContent = ((window.SF_SHADOW_CSS || "") + [].map.call(document.querySelectorAll("style#sf-ui-css, style#sf-patch-css"), (function(t) {
            return t.textContent;
          })).join("\n")).replace(/:root /g, ""), i.appendChild(h), a.push(i);
        }
        p.classList.add("sf-shop", "sf-shop--" + f, /^\/(index)?$/.test(location.pathname) ? "sf-shop--home" : "sf-shop--list"), 
        r.setAttribute("data-sf-shop", f), [].forEach.call(d, (function(t) {
          var a = l[t.getAttribute("data-system-product-id")] || {
            type: f
          };
          !function(t, a, r) {
            if (!t.getAttribute("data-sf-card")) {
              t.setAttribute("data-sf-card", r);
              var i = t.querySelector(".iw-card-info-link") || t, n = t.querySelector(".iw-shop-product-badges"), ht = SFUI.badgeTags(n), tg = ht || a.tags;
              SFUI.saveBadgeTags(t.getAttribute("data-system-product-id"), ht);
              if ("course" === r) t.setAttribute("data-category", a.cat || ""), a.past && t.setAttribute("data-past", ""), n && tg && (n.innerHTML = '<span class="sf-tags">' + SFUI.tagHtml(tg) + "</span>"); else if ("live" === r) {
                var o = (t.querySelector('a[href*="idx="]') || {}).getAttribute ? t.querySelector('a[href*="idx="]').getAttribute("href") : "#";
                t.setAttribute("data-sf-live", ""), t.setAttribute("data-start", a.start || ""), 
                t.setAttribute("data-end", a.end || ""), t.setAttribute("data-deadline", a.deadline || ""), 
                t.setAttribute("data-link-apply", o), t.setAttribute("data-link-live", a.live || "/classroom"), 
                a.replay && t.setAttribute("data-link-replay", a.replay), n &&(n.innerHTML = '<span class="sf-tags"><span data-sf-live-badge class="sf-badge"></span></span>');
                var c = document.createElement("a");
                c.setAttribute("data-sf-live-btn", ""), c.className = "sf-btn sf-btn--block sf-shop-cta",
                t.appendChild(c);
                // (10/30) 상품명에 [일시]가 없는 새 라이브: 상품 글 [라이브 안내] 일시·마감을 읽어 와서(SFUI.roomInfo, 5분 기억) 상태·순서를 맞춰요
                //   상품명 [ ]는 공유·검색 제목에 그대로 나가서, 일시는 본문에 두는 게 기본이에요
                var nm0 = (t.querySelector(".iw-shop-product-name, span.iw-card-name-link") || {}).textContent || "";
                !a.start && !/\[[^\[\]]*\d{1,2}:\d{2}\]\s*$/.test(nm0) && SFUI.roomInfo && SFUI.roomInfo(t.getAttribute("data-system-product-id"), (function(o) {
                  var mi = o && o.meet || {};
                  if (!mi.start || t.getAttribute("data-start")) return;
                  t.setAttribute("data-start", mi.start), t.setAttribute("data-deadline", mi.deadline || mi.start), mi.end && t.setAttribute("data-end", mi.end);
                  delete t.dataset.sfuiBoundLive, t.removeAttribute("data-status");
                  var rt = t.getRootNode && t.getRootNode();
                  rt && SFUI.init(rt);
                  // 상태가 생겼으니 목록 순서도 다시(LIVE → 마감 임박 → 모집중 → 마감 → 지난 라이브)
                  var g1 = t.parentElement, od = { live: 0, closing: 1, open: 2, closed: 3, ended: 4 };
                  g1 && [].slice.call(g1.querySelectorAll("li.iw-shop-card")).map((function(li) {
                    var s1 = li.getAttribute("data-status") || "open", tm = Date.parse(li.getAttribute("data-start") || "") || 0;
                    return [ li, od[s1] != null ? od[s1] : 2, "ended" === s1 ? -tm : tm ];
                  })).sort((function(x, y) { return x[1] - y[1] || x[2] - y[2]; })).forEach((function(x) { g1.appendChild(x[0]); }));
                }));
              } else if ("meet" === r) {
                var l = SFUI.saleOver(t) ? [ "ended", "모집 마감" ] : s(a); // (10/30) 판매기간 종료·품절이면 바로 모집 마감
                t.setAttribute("data-status", l[0]), t.setAttribute("data-kind", SFUI.isEvent(a.kind) ? "event" : "meet"), t.setAttribute("data-start", a.start || ""), 
                a.past && t.setAttribute("data-past", ""), // (10/26) 지난 행사: 가격 대신 '지난 행사'(css qa/07)

                t.setAttribute("data-place", /온라인/.test(a.place || "") ? "online" : "offline"), 
                n && (n.innerHTML = '<span class="sf-tags"><span class="sf-tag sf-tag--' + (SFUI.isEvent(a.kind) ? "event" : "meet") + '">' + (a.kind || "모임") + '</span><span class="sf-tag sf-tag--' + l[0] + '">' + l[1] + "</span></span>");
                var d = document.createElement("div");
                d.className = "sf-shop-meta", d.innerHTML = (a.date ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>' + a.date + "</span>" : "") + (a.place ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' + a.place + "</span>" : ""),
                i.appendChild(d);
                // (10/29) 코드 표에 없는 새 모임: 상품 글 [모임 안내] + 상품명 일시를 읽어 와서(SFUI.roomInfo, 5분 기억) 태그·일시·장소·온라인/오프라인을 채워요
                !a.start && !a.place && SFUI.roomInfo && SFUI.roomInfo(t.getAttribute("data-system-product-id"), (function(o) {
                  // 기억해 둔 값이면 바로 불려요 → 다른 카드가 다 그려진 뒤(순서 정렬이 맞게) 채우려고 한 박자 늦춰요
                  setTimeout((function() { fill(o, 0); }), 0);
                }));
                function fill(o, tr) {
                  if (!o) return;
                  // 카드가 아직 목록 칸(.iw-shop-grid)에 들어가기 전이면 조금 뒤 다시(순서 정렬을 그 칸에서 해야 해요)
                  if (!(t.parentElement && t.parentElement.classList.contains("iw-shop-grid")) && tr < 20) return void setTimeout((function() { fill(o, tr + 1); }), 150);
                  var mi = o.meet || {}, b = { type: "meet", kind: mi.kind || a.kind, place: SFUI.meetPlace(mi), start: o.start || mi.start || "", end: mi.end || "", past: a.past };
                  b.deadline = mi.deadline || b.start;
                  if (b.start) { var dd = new Date(b.start); b.date = dd.getMonth() + 1 + "월 " + dd.getDate() + "일 (" + "일월화수목금토".charAt(dd.getDay()) + ")"; }
                  var l2 = SFUI.saleOver(t) ? [ "ended", "모집 마감" ] : s(b), sq = function(x) { return String(x || "").replace(/[<>&"]/g, ""); };
                  t.setAttribute("data-status", l2[0]), t.setAttribute("data-kind", SFUI.isEvent(b.kind) ? "event" : "meet"), t.setAttribute("data-start", b.start);
                  t.setAttribute("data-place", /온라인/.test(b.place) ? "online" : "offline");
                  n && (n.innerHTML = '<span class="sf-tags"><span class="sf-tag sf-tag--' + (SFUI.isEvent(b.kind) ? "event" : "meet") + '">' + sq(b.kind || "모임") + '</span><span class="sf-tag sf-tag--' + l2[0] + '">' + l2[1] + "</span></span>");
                  d.innerHTML = (b.date ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>' + b.date + "</span>" : "") + (b.place ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' + sq(b.place) + "</span>" : "");
                  // 날짜가 생겼으니 목록 순서(모집 중 가까운 날짜 → 마감 최근 순)도 다시
                  //   아임웹이 목록을 다시 그리면 원래 순서로 되돌려요 → 칸을 지켜보다 순서가 다르면 다시 맞춰요(같으면 손대지 않아 반복되지 않아요)
                  var g0 = t.parentElement, so = function() {
                    var cs = [].slice.call(g0.children).filter(function(x) { return x.matches && x.matches("li.iw-shop-card"); }), st0 = function(x) { return Date.parse(x.getAttribute("data-start") || "") || 9e15; };
                    var want = cs.filter(function(x) { return "ended" !== x.getAttribute("data-status"); }).sort(function(x, y) { return st0(x) - st0(y); })
                      .concat(cs.filter(function(x) { return "ended" === x.getAttribute("data-status"); }).sort(function(x, y) { return st0(y) - st0(x); }));
                    want.some(function(x, k) { return x !== cs[k]; }) && want.forEach(function(x) { g0.appendChild(x); });
                  };
                  if (g0) {
                    so();
                    g0.__sfSort || (g0.__sfSort = 1, new MutationObserver((function() { requestAnimationFrame(so); })).observe(g0, { childList: !0 }));
                  }
                  var hs = t.getRootNode && t.getRootNode().host;
                  hs && SFUI.__shopFilter && SFUI.__shopFilter(hs);
                }
              }
              ht && "course" !== r && n && n.insertAdjacentHTML("beforeend", '<span class="sf-tags">' + SFUI.tagHtml(ht) + "</span>");
            }
          }(t, a, a.type || f);
        })), "meet" === f && function(t) {
          var e = [].slice.call(t.querySelectorAll("li.iw-shop-card"));
          // (10/26) 모집 중은 가까운 날짜 순, 마감·지난 행사는 최근 순으로 뒤에 · (10/30) 뒤로 보내는 건 종료(신청 마감이 지난) 모임
          var st = function(x) { return Date.parse(x.getAttribute("data-start") || "") || 0; };
          var op = e.filter(function(x) { return "ended" !== x.getAttribute("data-status"); }).sort(function(x, y) { return st(x) - st(y); });
          var cl = e.filter(function(x) { return "ended" === x.getAttribute("data-status"); }).sort(function(x, y) { return st(y) - st(x); });
          op.concat(cl).forEach(function(x) { t.appendChild(x); });
        }(c), SFUI.init(i), "live" === f && function(g) {
          var o2 = {
            live: 0,
            closing: 1,
            open: 2,
            closed: 3,
            ended: 4
          };
          [].slice.call(g.querySelectorAll("li.iw-shop-card")).map((function(li) {
            var it = l[li.getAttribute("data-system-product-id")] || {}, s = li.getAttribute("data-status") || "open", tm = Date.parse(it.start || "") || 0;
            return [ li, o2[s] != null ? o2[s] : 2, "ended" === s ? -tm : tm ];
          })).sort((function(a, b) {
            return a[1] - b[1] || a[2] - b[2];
          })).forEach((function(x) {
            g.appendChild(x[0]);
          }));
        }(c), o(), n(r);
      }
    }
  }
  function i(t) {
    var e = [].slice.call(document.querySelectorAll("[data-sf-shop]"));
    if (1 === e.length) return e[0];
    for (var a = 0; a < e.length; a++) if (t.compareDocumentPosition(e[a]) & Node.DOCUMENT_POSITION_FOLLOWING) return e[a];
    return null;
  }
  function n(t) {
    if (t && t.shadowRoot) {
      var e = [].slice.call(document.querySelectorAll("[data-sf-shop-filter]")).filter((function(e) {
        return i(e) === t;
      }));
      if (e.length) {
        var a = new URLSearchParams(location.search), s = 0, r = e.map((function(t, e) {
          var r = t.getAttribute("data-value") || 0 === e && a.get("cat") || t.getAttribute("data-param") && a.get(t.getAttribute("data-param")) || "all";
          return t.querySelector('[data-cat="' + r + '"]') || (r = "all"), t.setAttribute("data-value", r), 
          [].forEach.call(t.querySelectorAll("[data-cat]"), (function(t) {
            var e = t.getAttribute("data-cat") === r;
            t.classList.toggle("is-active", e), t.setAttribute("aria-pressed", String(e)), "tab" === t.getAttribute("role") && t.setAttribute("aria-selected", String(e));
          })), s = Math.max(s, Number(t.getAttribute("data-limit") || 0)), r;
        })), n = 0;
        [].forEach.call(t.shadowRoot.querySelectorAll("li.iw-shop-card"), (function(t) {
          var e = function(t) {
            var e = (t.getAttribute("data-category") || "").split(" "), a = t.getAttribute("data-status") || "";
            return /^(open|closing|recruit|soon)$/.test(a) && e.push("recruit"), "live" === a && e.push("live"), 
            /^(ended|closed)$/.test(a) && e.push("ended"), t.getAttribute("data-kind") && e.push(t.getAttribute("data-kind")), 
            t.getAttribute("data-place") && e.push(t.getAttribute("data-place")), e;
          }(t), a = r.every((function(t) {
            return "all" === t || e.indexOf(t) > -1;
          }));
          a && s && n >= s && (a = !1), t.classList.toggle("sf-hidden", !a), a && n++;
        }));
        var nm = t.shadowRoot.querySelector(".iw-shop-product-count-num");
        nm && (nm.textContent = n);
        var o = t.shadowRoot.getElementById("sf-shop-empty");
        o || ((o = document.createElement("p")).id = "sf-shop-empty", o.className = "sf-shop-empty", 
        o.innerHTML = (function() { // (10/26) 상품 없는 곳: 업데이트 예정 + 다른 분야 안내
          var w = /^\/live/.test(location.pathname) ? "라이브" : /^\/community/.test(location.pathname) ? "모임·이벤트" : "강의";
          return "<strong>새로운 " + w + "를 준비하고 있어요. 곧 업데이트될 예정이에요.</strong><span>다른 분야도 둘러보세요</span>";
        })(), t.shadowRoot.querySelector(".iw-shop-grid").after(o)), 
        o.hidden = n > 0;
      }
    }
  }
  SFUI.__shopFilter = n; // (10/29) 모임 카드 정보가 늦게 채워지면 필터(온라인/오프라인·모집 상태)를 다시 적용할 때 써요
  function o() {
    [].forEach.call(document.querySelectorAll("[data-sf-before-shop]:not([data-sf-moved])"), (function(t) {
      var e = document.querySelector("[data-sf-shop]");
      if (e) {
        var a = e.closest("[data-widget-type]") || e.closest(".section_wrap") || e, s = t.closest("[data-widget-type]") || t;
        a.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING && a.parentNode.insertBefore(s, a), 
        t.setAttribute("data-sf-moved", "");
      }
    }));
  }
  function c() {
    o(), [].forEach.call(document.querySelectorAll("div.js-custom-widget-container"), (function(t) {
      var e = t.shadowRoot;
      e && e.querySelector("li.iw-shop-card:not([data-sf-card])") && r(t), e && !t.hasAttribute("data-sf-ready") && t.setAttribute("data-sf-ready", ""), // 10/25 우리 스타일을 입힌 뒤에 보이게(css qa/07)
      e && !t.__sfObs && (t.__sfObs = new MutationObserver(d), 
      t.__sfObs.observe(e, {
        childList: !0,
        subtree: !0
      }));
    }));
  }
  document.addEventListener("click", (function(t) {
    var e = t.target.closest && t.target.closest("[data-sf-shop-filter] [data-cat]");
    if (e) {
      var a = e.closest("[data-sf-shop-filter]"), s = e.getAttribute("data-cat");
      a.setAttribute("data-value", s), n(i(a));
      var r = a.hasAttribute("data-url") ? "cat" : a.getAttribute("data-param");
      if (r) {
        var o = new URL(location.href);
        "all" === s ? o.searchParams.delete(r) : o.searchParams.set(r, s), history.replaceState(null, "", o);
      }
    }
  }));
  var l = !1;
  function d() {
    l || (l = !0, requestAnimationFrame((function() {
      l = !1, c();
    })));
  }
  SFUI.register("meetStatus", (function(t) {
    [].forEach.call(t.querySelectorAll("[data-sf-meet]"), (function(t) {
      var e = s({
        start: t.getAttribute("data-start"),
        deadline: t.getAttribute("data-deadline")
      });
      t.setAttribute("data-status", e[0]);
      var a = t.querySelector("[data-sf-meet-status]");
      a && (a.className = "sf-tag sf-tag--" + e[0], a.textContent = e[1]);
    }));
  })), SFUI.register("shopList", (function() {
    window.__sfShopInit || (window.__sfShopInit = !0, c(), new MutationObserver(d).observe(document.body, {
      childList: !0,
      subtree: !0
    }), setInterval((function() {
      a.forEach((function(t) {
        [].forEach.call(t.querySelectorAll("[data-sf-live]"), (function(t) {
          delete t.dataset.sfuiBoundLive;
        })), SFUI.init(t);
      })), [].forEach.call(document.querySelectorAll("[data-sf-shop]"), (function(t) {
        n(t);
      }));
    }), 3e4));
  }));
}()
