// 원본: src/product-view.js
/* product-view.js — 아임웹 상품 상세를 Figma 상세 화면 배치로 바꿔요 (상품 종류는 shop-list.js 의 ITEMS 로 판단)
   - (10/27) 세 종류 모두 탭 = 소개 · 프로그램 · 강사(라이브 '연사' · 커뮤니티 '호스트') · 후기, 후기 아래 '더 알아보기'(운영 정책 · 환불 규정 펼치기)
   - (10/27 v2) 본문 큰 제목 숨김 · [프로그램] '# 제목 | 90분' 회차 목록 · [강사] 이름 → 전문가 네트워크 카드 (사용법: docs/상품-상세-등록-안내.md)
   - 교육(PC/교육 상세 20:1011): 왼쪽 이미지 · 고정 탭 · 본문 / 오른쪽 고정 구매 박스
     (태그 · 제목 · 할인가 · 상품 금액 · 찜 + 수강 신청하기 · 공유하고 수익받기)
   - 무료 라이브(PC/무료 라이브 상세 22:1451): 오른쪽 신청 카드(상태 태그 · 마감 카운트다운 · 일시 · 무료로 신청하기 · 공유하기)
     왼쪽 이런 내용을 다뤄요 · 연사 소개 · 진행 안내 · 라이브 후 더 깊게 · 수강생 후기
   - 모임(PC/모임 상세 28:2452): 태그(모임/이벤트 · 모집 상태) · 참가비 · 참여 신청하기, 왼쪽 모임 안내 · 모임 소개 · 일정 · 호스트 · 장소
   - 배송·수량·장바구니·구매평(아임웹)은 숨기고, 후기는 수강평 게시판으로 모아요.
   - 상세 설명(관리자 상품 편집)에 글이 있으면 '소개' 자리에 그대로 보여 주고, 예시 내용은 SF_SITE.details[상품번호] 로 바꿀 수 있어요.
       교육: { who:[], points:[[제목,설명]], summary, chapters:[[제목,시간,설명]], teacher:{name,role,bio,href}, faq:[[질문,답]], refund }
       라이브: { topics:[], speaker:{name,bio}, guide:[[항목,내용]], courses:[상품번호] }
       모임: { intro, checks:[], schedule:[[날짜,내용]], host:{name,bio}, address } */
// (10/28) [프로그램] 글 줄들 → { desc:[설명 줄], items:[{ t:제목, m:'90분', d:[{ x:글, u:주소 }] }] }
//   상품 상세 회차 목록(progBox)과 강의실(r3Room)이 같이 써요
//   첫 줄들(예: 총 6회 · 회당 90분 · 온라인) = 설명 / '1회차 제목 (90분)' 또는 '# 제목 | 90분' = 한 회차 / '- 세부' = 그 회차 안 내용
SFUI.progItems = function(list) {
  var HR = /^#\s*(.+)$/, LR = /^(\d+)\s*(?:회차?\s*[·.:：\-)]|회차)\s*(.+?)(?:\s*[\(（]\s*(\d+\s*분)\s*[\)）])?$/, DR = /^[-–•]\s*/, UR = /(https?:\/\/[^\s<>"]+)/;
  var desc = [], items = [], cur = null;
  list.forEach((function(e) {
    var tx = (e.textContent || "").replace(/\s+/g, " ").trim(), m;
    if (!tx) return;
    if (m = HR.exec(tx)) {
      var ps = m[1].split("|"), tm = ps.length > 1 ? ps.pop().trim() : "";
      cur = { t: ps.join("|").replace(/^\d+\s*회차?\s*[·.:：\-)]?\s*/, "").trim(), m: tm, d: [] }, items.push(cur);
    } else if (!DR.test(tx) && (m = LR.exec(tx))) {
      cur = { t: m[2], m: m[3] || "", d: [] }, items.push(cur);
    } else if (cur) {
      var a = 1 === e.nodeType && e.querySelector("a[href]"), u = a ? a.getAttribute("href") : (UR.exec(tx) || [])[1], lb = tx.replace(DR, "");
      u && !a && (lb = lb.replace(u, "").replace(/[\s:：\-–]+$/, "").trim());
      u && (lb = lb.replace(/\s*미리\s?보기\s*/, " ").trim() || "강의 맛보기"); // 오른쪽에 '미리보기' 표시가 따로 붙어요
      cur.d.push({ x: lb, u: u && /^(https?:\/\/|\/)/.test(u) ? u : "" });
    } else desc.push(tx);
  }));
  return { desc: desc, items: items };
};
// (10/28) [수강 기간] 칸 글 → 고정 날짜 { s, e } (예: 2026.11.01 - 2026.12.31) 또는 결제일 기준 { n, u:'d'|'m' } (예: 결제일부터 90일 · 3개월)
SFUI.roomPeriod = function(t) {
  t = String(t || "");
  var D = /(\d{4})\s*[.\-\/년]\s*(\d{1,2})\s*[.\-\/월]\s*(\d{1,2})/g, a = [], m;
  while (m = D.exec(t)) a.push(new Date(+m[1], m[2] - 1, +m[3]).getTime());
  if (a.length) return { s: a[0], e: a.length > 1 ? a[1] + 864e5 - 1 : 0 };
  return (m = /(\d+)\s*(일|개월|달)/.exec(t)) ? { n: +m[1], u: "일" === m[2] ? "d" : "m" } : null;
};
// 실제 기간 { s, e } — 결제일 기준이면 결제일(yyyy-mm-dd)이 있어야 해요(결제일 포함 N일)
SFUI.roomRange = function(p, paid) {
  if (!p) return null;
  if (p.s) return { s: p.s, e: p.e };
  var b = paid ? Date.parse(String(paid).replace(/-/g, "/")) : 0;
  if (!b) return null;
  var e = new Date(b);
  "d" === p.u ? e.setDate(e.getDate() + p.n) : e.setMonth(e.getMonth() + p.n);
  return { s: b, e: e.getTime() - 1 };
};
SFUI.roomDate = function(t) {
  var d = new Date(t);
  return d.getFullYear() + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." + ("0" + d.getDate()).slice(-2);
};
// 화면 글: '2026.11.01 - 2026.12.31' / 결제일을 모르면 '결제일부터 90일'
SFUI.roomLabel = function(p, paid) {
  var rg = SFUI.roomRange(p, paid);
  return rg ? SFUI.roomDate(rg.s) + (rg.e ? " - " + SFUI.roomDate(rg.e) : "") : p && p.n ? "결제일부터 " + p.n + ("d" === p.u ? "일" : "개월") : "";
};
// (10/28) 강의실용 상품 정보: 상품 상세 글의 [프로그램]·[수강 기간]·[강의실] 칸을 읽어요
//   → done({ idx, title, img, prog:{desc,items}|null, period, room:'/class-x' }) · 못 읽으면 done(null) · 같은 탭에서 5분 동안 다시 안 받아요
SFUI.roomInfo = function(idx, done) {
  var k = "sf_room4_" + idx, C = null; // (10/29) room3: 모임 안내(meet)·일시(start) 추가 · (10/30) room4: [다시보기](replay)
  try { C = JSON.parse(sessionStorage.getItem(k) || "null"); } catch (x) {}
  if (C && Date.now() - C.at < 3e5) return done(C);
  if (!idx || !window.fetch || !window.DOMParser) return done(null);
  fetch("/shop_view/?idx=" + idx + (/preview_mode=1/.test(location.search) ? "&preview_mode=1" : ""), { credentials: "same-origin" }).then((function(r) {
    return r.ok ? r.text() : "";
  })).then((function(t) {
    var d = t && new DOMParser().parseFromString(t, "text/html");
    if (!d) return done(null);
    var tp = d.getElementById("prodDetailPC") || d.getElementById("prodDetailMobile"), W = tp && tp.content || d.getElementById("prod_detail_body");
    var og = d.querySelector('meta[property="og:image"]'), o = { at: Date.now(), idx: +idx, title: ((d.querySelector(".view_tit") || {}).textContent || "").trim(), img: og && og.getAttribute("content") || "", room: "", chat: "", period: null, prog: null };
    var RE = /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/, sec = "", P = [], pt = "", VR = /^(\d+)\s*회차?\s*[|:：\-]?\s*(https?:\/\/\S+)$/;
    o.videos = {};
    W && [].forEach.call(W.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,div"), (function(x) {
      if (x.querySelector("p,div,li,h1,h2,h3,h4,h5,h6")) return;
      var tx = (x.textContent || "").replace(/\s+/g, " ").trim(), m = RE.exec(tx);
      if (m) return void (sec = m[1].replace(/\s+/g, ""));
      if (!tx) return;
      if (/^(프로그램|커리큘럼|회차|수업구성)/.test(sec)) P.push(x);
      else if ("수강기간" === sec) pt || (pt = tx);
      else if (/^(카?톡방|단톡방|소통방|오픈채팅(방)?)(주소|링크)?$/.test(sec) && !o.chat) {
        // [톡방] 오픈채팅 주소 → 나의 강의실·강의실의 '톡방 입장' 버튼
        var ca = x.querySelector("a[href]"), cu = ca ? ca.getAttribute("href") : (/(https?:\/\/\S+)/.exec(tx) || [])[1] || "";
        /^https:\/\/[^\s"'<>]+$/.test(cu) && (o.chat = cu);
      } else if (/^다시보기(주소|링크|영상)?$/.test(sec) && !o.replay) {
        // (10/30) [다시보기] 주소 한 줄 → 끝난 무료 라이브 카드의 '다시보기' 버튼(없으면 '종료')
        var ra = x.querySelector("a[href]"), ru = ra ? ra.getAttribute("href") : (/(https?:\/\/\S+)/.exec(tx) || [])[1] || "";
        /^https:\/\/[^\s"'<>]+$/.test(ru) && (o.replay = ru);
      } else if (/^(강의)?영상(주소)?$/.test(sec)) {
        // [강의 영상] '1회차 https://vimeo.com/…' 한 줄씩 → 마이페이지 강의실의 바로보기
        var vm = VR.exec(tx), va = x.querySelector("a[href]");
        vm && (o.videos[+vm[1]] = va && /^https?:/.test(va.getAttribute("href")) ? va.getAttribute("href") : vm[2]);
      }
      else if (/^강의실(주소)?$/.test(sec) && !o.room) {
        var a = x.querySelector("a[href]"), u = (a ? a.getAttribute("href") : tx).replace(/^(https?:\/\/)?[^\/\s]*imweb\.me/, "").replace(/^(https?:\/\/)?(www\.)?seniorfuture\.[a-z.]+/, "");
        /^\/[\w\-\/]*$/.test(u) && (o.room = u);
      }
    }));
    o.period = SFUI.roomPeriod(pt), o.prog = P.length ? SFUI.progItems(P) : null;
    // (10/29) 모임: [모임 안내] 칸 + 상품명 일시 → 커뮤니티 목록 카드가 써요
    o.meet = SFUI.meetParse(W), o.start = SFUI.meetDate((/\[([^\[\]]*\d{1,2}:\d{2})\]\s*$/.exec(o.title) || [])[1] || "");
    try { sessionStorage.setItem(k, JSON.stringify(o)); } catch (x) {}
    done(o);
  }))["catch"]((function() {
    done(null);
  }));
};
// (10/29) 날짜 글 → ISO: '2026.11.12 18:00' · '2026/11/14 14:00' · '11/14 14:00'(올해, 반년 넘게 지났으면 내년) · 시각이 없으면 그날 23:59
SFUI.meetDate = function(v) {
  var m = /(?:(\d{4})\s*[.\/\-년]\s*)?(\d{1,2})\s*[.\/\-월]\s*(\d{1,2})\s*일?\.?(?:\s*\([^)]*\))?(?:\s*(\d{1,2}):(\d{2}))?/.exec(String(v || ""));
  if (!m) return "";
  var now = new Date(), y = m[1] ? +m[1] : now.getFullYear(), d = new Date(y, +m[2] - 1, +m[3], m[4] ? +m[4] : 23, m[4] ? +m[5] : 59);
  !m[1] && d.getTime() < now.getTime() - 15552e6 && d.setFullYear(y + 1);
  return isNaN(d.getTime()) ? "" : d.toISOString();
};
// (10/29) 모임 상세 글 [모임 안내] 칸(교육의 [수강 기간]처럼): '이름: 값' 한 줄씩
//   구분(모임·이벤트…) · 방식(온라인·오프라인) · 장소 · 마감(신청 마감 일시) · 정원 · 일시(상품명에 없을 때만) · 그 밖의 줄은 모임 안내 상자에 그대로
SFUI.meetParse = function(W) {
  var o = { rows: [] }, RE = /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/, sec = "";
  W && [].forEach.call(W.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,div"), (function(x) {
    if (x.querySelector("p,div,li,h1,h2,h3,h4,h5,h6")) return;
    var tx = (x.textContent || "").replace(/\s+/g, " ").trim(), m = RE.exec(tx);
    if (m) return void (sec = m[1].replace(/\s+/g, ""));
    if (!tx || !/^(모임|행사|이벤트)(안내|정보)$/.test(sec)) return;
    var kv = /^([^:：]{1,10}?)\s*[:：]\s*(.+)$/.exec(tx);
    if (!kv) return;
    var key = kv[1].replace(/\s+/g, ""), v = kv[2].trim();
    /^(구분|종류|유형)$/.test(key) ? o.kind = v : /^(방식|형태|진행방식)$/.test(key) ? o.mode = v : /^(장소|위치)$/.test(key) ? o.place = v
      : /^(신청)?마감$|^모집마감$/.test(key) ? o.deadline = SFUI.meetDate(v) : /^(일시|날짜)$/.test(key) ? o.start = SFUI.meetDate(v)
      : /^(정원|인원|모집인원)$/.test(key) ? o.cap = v : o.rows.push([ kv[1].trim(), v ]);
  }));
  return o;
};
// 장소 + 방식 한 줄: '서울 성동구 성수동 · 오프라인' (장소에 이미 방식이 있으면 그대로)
SFUI.meetPlace = function(o) {
  var pl = o && o.place || "", md = o && o.mode || "";
  return pl && md && pl.indexOf(md) < 0 ? pl + " · " + md : pl || md;
};
SFUI.register('productView', function() {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  if (document.body.classList.contains("shop_view")) {
    // (10/26) 상세 글(<template id="prodDetailPC">)은 페이지 맨 아래에 있어서, 그보다 먼저 돌면 [제목] 칸을 못 읽어요 → 다 읽힌 뒤 다시
    var w1 = document.getElementById("prod_detail_body");
    if (document.readyState === "loading" && !document.getElementById("prodDetailPC") && !(w1 && w1.textContent.trim())) {
      window.__sfPvWait || (window.__sfPvWait = 1, document.addEventListener("DOMContentLoaded", (function() {
        window.SFUI && SFUI.init && SFUI.init(document);
      })));
      return;
    }
    var e = document.querySelector(".goods_wrapper"), s = document.querySelector(".goods_form_wrap");
    if (e && s && SFUI.once(e, "ProductView")) {
      var t, a = window.SF_SITE || {}, n = new URLSearchParams(location.search).get("idx"), i = SFUI.shopItems && SFUI.shopItems()[n] || {}, r = i.type || (/^\/community/.test(location.pathname) ? "meet" : /^\/live/.test(location.pathname) ? "live" : "course"), c = "course" === r, o = "live" === r, p = "meet" === r, d = s.querySelector(".view_tit"), l = d ? d.textContent.trim() : document.title, f = String.fromCharCode(38), v = document.createElement("div"), u = [ "일", "월", "화", "수", "목", "금", "토" ], h = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>', b = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>', g = {
        3: [ "장기요양기관 운영 실무 입문: 인력·수가·평가까지 한 번에", "현장 운영자가 알려주는 6주 실무 과정", "763c8869ed481.jpg" ],
        4: [ "시니어 산업 지도: 2027 시장 구조와 기회 읽기", "숫자로 보는 시니어 시장과 진입 기회", "52414c2f66081.jpg" ],
        6: [ "시니어 고객을 위한 보험·신탁 상품 설계 실무", "연금·보험·신탁 상품 설계 실전", "c44590cd1fc7b.jpg" ],
        10: [ "시니어 비즈니스 창업 부트캠프 8주 과정", "아이템 검증부터 첫 고객까지 8주", "e733c00cd4254.jpg" ]
      }, m = SFUI.reviewData || [], _ = {
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
      // (10/29) 모임: 상품 글 [모임 안내] → 태그(구분)·장소·방식·마감·정원 (코드 표 없이 사장님이 직접)
      var MI = null;
      if (p) {
        var tp0 = document.getElementById("prodDetailPC") || document.getElementById("prodDetailMobile");
        MI = SFUI.meetParse(tp0 && tp0.content || document.getElementById("prod_detail_body"));
        MI.kind && (i.kind = MI.kind), (MI.place || MI.mode) && (i.place = SFUI.meetPlace(MI));
        MI.start && !i.start && (i.start = MI.start, i.end = new Date(Date.parse(MI.start) + 72e5).toISOString());
        MI.deadline ? i.deadline = MI.deadline : MI.start && !i.deadline && (i.deadline = MI.start);
      }
      var U = s.querySelector("header"), j = Date.now(), k = SFUI.parseDate(i.deadline), B = SFUI.parseDate(i.start), E = SFUI.parseDate(i.end), M = B && j >= B || k && j >= k, D = M ? '<span class="sf-tag sf-tag--closed">모집 마감</span>' : !M && k && k - j <= 2592e5 ? '<span class="sf-tag sf-tag--soon">마감 임박</span>' : '<span class="sf-tag sf-tag--recruit">모집중</span>', L = "";
      // (10/23 2차) 꼬리표 = 목록에서 읽어 둔 아임웹 상품 배지(없으면 아래 badgeFetch 가 목록을 한 번 받아 채워요)
      var ht = null;
      try { ht = (SFUI.__hash || {})[n] || JSON.parse(sessionStorage.getItem("sf_badges") || "{}")[n] || null; } catch (x) {}
      c && (ht || i.tags) && (L = SFUI.tagHtml ? SFUI.tagHtml(ht || i.tags) : ve(i.tags)), o && (L = D + (k && !M ? '<span class="sf-tag sf-tag--dday">D-' + Math.max(0, Math.ceil((k - j) / 864e5)) + "</span>" : "") + '<span class="sf-tag sf-tag--free">무료</span>'), 
      p && (L = '<span class="sf-tag sf-tag--' + ((SFUI.isEvent ? SFUI.isEvent(i.kind) : "이벤트" === i.kind) ? "event" : "meet") + '">' + oe(i.kind || "모임") + "</span>" + D), 
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
        // (10/27) 일시·장소·마감이 하나도 없으면(코드 표에 없는 새 모임) 빈 상자 대신 칸을 아예 빼요
        // (10/29) + 정원 · [모임 안내]의 그 밖의 줄(준비물·대상 등) · 마감에 시각까지
        var ic = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>', kt = k && new Date(k);
        var rows = [ [ h, "일시", (i.date || (B ? le(B) : "")) + (B ? " · " + fe(B) : "") ], [ b, "장소", i.place || "" ], [ '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c1.8.7 3 2.5 3.5 5.2"/></svg>', "정원", MI && MI.cap || "" ] ].concat((MI && MI.rows || []).map((function(e) {
          return [ ic, e[0], e[1] ];
        })), [ [ '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', "마감", k ? le(k) + (kt && (kt.getHours() !== 23 || kt.getMinutes() !== 59) && !(B && k === B) ? " " + fe(k) : "") + "까지" : "" ] ]).filter((function(e) {
          return e[2];
        }));
        return rows.length ? '<section class="sf-pv-sec sf-pv-meetinfo"><h2>모임 안내</h2><div class="sf-pv-infobox">' + rows.map((function(e) {
          return "<p>" + e[0] + "<b>" + e[1] + "</b><span>" + oe(e[2]) + "</span></p>";
        })).join("") + "</div></section>" : "";
      }
      // (10/26) 아임웹이 상세 글을 <template id="prodDetailPC"> 에 두고 늦게 꺼내요 → 비어 있으면 여기서 먼저 꺼내 읽어요
      (function() {
        var w0 = document.getElementById("prod_detail_body"), tp = document.getElementById("prodDetailPC") || document.getElementById("prodDetailMobile");
        w0 && tp && tp.content && !w0.textContent.trim() && w0.appendChild(tp.content.cloneNode(!0));
      })();
      // (10/27) 교육·무료 라이브·커뮤니티 상세를 같은 흐름으로: 소개 → 프로그램 → 강사(라이브 '연사'·커뮤니티 '호스트') → 후기 (탭은 이 4개만)
      //   후기 아래 '자주 묻는 질문'(펼침): 상세 설명 [자주 묻는 질문]의 Q/A + 교환·환불 안내 + 상품 문의(아임웹 문의 게시판)
      //   상세 설명의 예전 제목도 묶어요: [커리큘럼]·[진행 안내]·[프로그램 일정] → 프로그램, [강사 소개]·[연사]·[호스트] → 강사 칸
      var G = document.querySelector(".detail_detail_wrap"), J = document.querySelector(".detail_qna_wrap"), W = document.getElementById("prod_detail_body"), X = '<div class="sf-pv-own" data-sf-own></div>', Y = [], ee = "", FQ = [], OG = null, OW = W && ownSecs(W);
      var TL = c ? "강사" : o ? "연사" : "호스트", TH = c ? "강사 소개" : o ? "연사 소개" : "호스트";
      // (10/29) 하단 공통(쇼핑 설정 › 상품 상세 하단 공통)의 [운영 정책]·[환불 규정]만 있고 상세 글엔 [제목]이 없는 예시 상품(코드 표·SF_SITE.details)은
      //   예전 예시 화면을 그대로 두고, 그 두 칸만 '더 알아보기'로 가져와요(CF). 새 상품은 그대로 쓴 글 + 더 알아보기
      var CF = [];
      if (OW && OW.secs.length && OW.secs.every((function(e) {
        var k = secKind(e.t);
        return "policy" === k || "refund" === k;
      })) && !(W && (!(SFUI.__baseItems || {})[n] || SFUI.__baseItems[n].past) && !(a.items || {})[n] && !(a.details || a.courses || {})[n])) {
        OW.secs.forEach((function(e) {
          CF.push({ k: secKind(e.t), q: "교환·환불 안내" === e.t ? "환불 규정" : e.t, n: e.n });
        }));
        CF.sort((function(x, y) { return ("policy" === x.k ? 0 : 1) - ("policy" === y.k ? 0 : 1); }));
        [].forEach.call(W.querySelectorAll("p,h1,h2,h3,h4,h5,h6,div"), (function(x) {
          !x.querySelector("p,div") && /^\s*[\[【]\s*[^\[\]【】]{1,20}\s*[\]】]\s*$/.test(x.textContent) && (x.style.display = "none");
        }));
        OW = null;
      }
      // (10/23 2차) 예시 내용(가짜 강사·커리큘럼)은 예전부터 있던 상품(코드 표)이나 SF_SITE.details 가 있는 상품만. 새 상품은 쓴 글만 '소개'로
      !OW && W && (!(SFUI.__baseItems || {})[n] || SFUI.__baseItems[n].past) && !(a.items || {})[n] && !(a.details || a.courses || {})[n] && (OW = splitRefund({ pre: [].filter.call(W.childNodes, (function(e) {
        return !(1 === e.nodeType && /^(STYLE|SCRIPT)$/.test(e.tagName));
      })), secs: [] }));
      function sec(id, h, body, own) {
        // (10/27 v2) 쓴 글로 만든 칸은 큰 제목(소개·프로그램·강사 소개)을 화면에서 숨겨요(탭으로 이동, 읽기 도구용으로만 남김)
        return '<section id="' + id + '" class="sf-pv-sec' + (own ? ' sf-pv-ownsec" data-sf-own-g="' + own : "") + '"><h2' + (own ? ' class="sf-pv-srh"' : "") + ">" + h + "</h2>" + (body || "") + "</section>";
      }
      if (OW) {
        // 사장님이 쓴 글로 칸 만들기
        OG = { intro: [], program: [], teacher: [] };
        var hasPre = OW.pre.some((function(e) {
          return (e.textContent || "").trim() || e.querySelector && e.querySelector("img,iframe,video,table");
        }));
        hasPre && OG.intro.push({ n: OW.pre });
        // (10/27 v2) 더 알아보기 = [운영 정책] → [환불 규정] 순서(하단 공통). [자주 묻는 질문]을 쓴 상품은 그 뒤에 이어 붙여요
        var MP = [], MR = [], MQ = [];
        OW.secs.forEach((function(e) {
          var k = secKind(e.t);
          if ("period" === k) {
            // (10/28) [수강 기간] → 오른쪽 구매 상자에 '수강 기간 …' 한 줄 / [강의실] → 화면에는 안 보여요(나의 강의실이 읽어요)
            var pl = SFUI.roomLabel(SFUI.roomPeriod(e.n.map((function(x) { return x.textContent || ""; })).join(" ")));
            pl && V && V.parentNode.insertBefore(pe("p", "sf-pv-when sf-pv-period", h + "<span>수강 기간 " + oe(pl) + "</span>"), V);
          } else if ("room" === k || "meet" === k) {
            // 숨김 ([모임 안내]는 위 '모임 안내' 상자로)
          } else if ("faq" === k) {
            var qa = parseQA(e.n);
            qa ? qa.forEach((function(x) { MQ.push({ q: x[0], n: x[1] }); })) : MQ.push({ q: e.t, n: e.n });
          } else if ("policy" === k) MP.push({ q: e.t, n: e.n });
          else if ("refund" === k) MR.push({ q: "교환·환불 안내" === e.t ? "환불 규정" : e.t, n: e.n });
          else OG[k].push({ t: "intro" === k && !/^(소개|.{0,6}\s?소개)$/.test(e.t) ? e.t : "", n: e.n });
        }));
        FQ = MP.concat(MR, MQ);
        p && (ee += meetInfo());
        OG.intro.length && (Y.push([ "sf-pv-intro", "소개" ]), ee += sec("sf-pv-intro", "소개", "", "intro"));
        OG.program.length && (Y.push([ "sf-pv-program", "프로그램" ]), ee += sec("sf-pv-program", "프로그램", "", "program"));
        OG.teacher.length && (Y.push([ "sf-pv-teacher", TL ]), ee += sec("sf-pv-teacher", TH, "", "teacher"));
      } else if (c) {
        Y.push([ "sf-pv-intro", "소개" ], [ "sf-pv-program", "프로그램" ], [ "sf-pv-teacher", TL ]);
        ee += sec("sf-pv-intro", "이런 분께 추천해요", he(w.who) + '<h3 class="sf-pv-h3">이 강의에서 배우는 것</h3><ol class="sf-pv-points">' + w.points.map((function(e, s) {
          return "<li><small>0" + (s + 1) + "</small><strong>" + oe(e[0]) + "</strong><p>" + oe(e[1]) + "</p></li>";
        })).join("") + "</ol>" + X);
        ee += sec("sf-pv-program", "프로그램", '<p class="sf-pv-sub">' + oe(w.summary) + '</p><div class="sf-pv-chapters" data-sf-accordion>' + w.chapters.map((function(e, s) {
          return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><b>' + (s + 1) + "회차</b><span>" + oe(e[0]) + "</span><em>" + oe(e[1] || "") + "</em></button><div data-sf-acc-panel>" + oe(e[2] || "회차별 자료와 실습 과제가 함께 제공돼요.") + "</div></div>";
        })).join("") + "</div>");
        var se = w.teacher;
        ee += sec("sf-pv-teacher", TH, '<div class="sf-pv-teacher"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(se.name) + "</strong><small>" + oe(se.role) + "</small><p>" + oe(se.bio) + '</p><a href="' + oe(se.href || "/experts") + '">강사 프로필 보기 <span aria-hidden="true">›</span></a></div></div>');
        w.faq.forEach((function(e) { FQ.push({ q: e[0], h: oe(e[1]) }); }));
        w.refund && FQ.push({ q: "환불 규정", h: oe(w.refund) });
      } else if (o) {
        Y.push([ "sf-pv-intro", "소개" ], [ "sf-pv-program", "프로그램" ], [ "sf-pv-teacher", TL ]);
        var te = (B ? [ [ "일시", le(B) + " " + fe(B) + (E ? " – " + fe(E) : "") ] ] : []).concat(w.guide);
        ee += sec("sf-pv-intro", "이런 내용을 다뤄요", he(w.topics) + X);
        ee += sec("sf-pv-program", "프로그램", '<dl class="sf-pv-guide">' + te.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl>");
        ee += sec("sf-pv-teacher", TH, '<div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.speaker.name) + "</strong><p>" + oe(w.speaker.bio) + "</p></div></div>");
        var mc = w.courses.filter((function(e) { return g[e]; }));
        mc.length && (ee += '<section class="sf-pv-sec"><h2>라이브 후 더 깊게 배우고 싶다면</h2><ul class="sf-pv-more">' + mc.map((function(e) {
          var s = g[e], t = SFUI.shopItems && SFUI.shopItems()[e] || {};
          return '<li><a class="sf-ccard" href="/course/?idx=' + e + '"><span class="sf-ccard__thumb"><img src="https://cdn.imweb.me/upload/S20261016dceb77aecc2e2/' + s[2] + '" alt="" loading="lazy"></span><span class="sf-ccard__body"><strong>' + oe(s[0]) + "</strong><p>" + oe(s[1]) + '</p><span class="sf-tags">' + ve(t.tags || []) + "</span></span></a></li>";
        })).join("") + "</ul></section>");
      } else {
        Y.push([ "sf-pv-intro", "소개" ], [ "sf-pv-program", "프로그램" ], [ "sf-pv-teacher", TL ]);
        ee += meetInfo();
        ee += sec("sf-pv-intro", "모임 소개", '<p class="sf-pv-lead">' + oe(w.intro) + "</p>" + he(w.checks) + X);
        ee += sec("sf-pv-program", "프로그램", '<dl class="sf-pv-guide sf-pv-guide--rows">' + w.schedule.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl>");
        ee += sec("sf-pv-teacher", TH, '<div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.host.name) + "</strong><p>" + oe(w.host.bio) + "</p></div></div>");
      }
      // (10/29) 예시 상품: 하단 공통 [운영 정책]·[환불 규정]을 맨 앞에, 예시 '환불 규정'은 빼요
      CF.length && (FQ = CF.concat(FQ.filter((function(e) { return "환불 규정" !== e.q; }))));
      Y.push([ "sf-pv-review", "후기" ]), ee += ue();
      // (10/27 v2) 후기 아래 '더 알아보기'(탭 없음): 운영 정책 · 환불 규정 제목을 누르면 펼쳐져요. 상품 문의 게시판은 빼요
      J && (J.hidden = !0);
      FQ.length && (ee += '<section id="sf-pv-faq" class="sf-pv-sec"><h2>더 알아보기</h2><div class="sf-pv-faq sf-pv-more2" data-sf-accordion>' + FQ.map((function(e, s) {
        return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><span>' + oe(e.q) + '</span></button><div data-sf-acc-panel data-sf-fq="' + s + '">' + (e.h || "") + "</div></div>";
      })).join("") + "</div></section>");
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
      re && ie && ie.appendChild(re), W && ie && !W.textContent.trim() && !W.querySelector("img") && ie.classList.add("is-empty");
      // (10/28) 예시 내용 상품(3·11 등): 상세 글에 붙은 '하단 공통'(<교환 및 반품 가능 기간> …)이 소개 칸에 그대로(휴대폰은 아임웹이 늦게 한 번 더 넣어 두 번) 보였어요
      //   → '더 알아보기'에 환불 규정이 있으면 소개 칸에서는 그 줄부터 끝까지 숨기고, 없으면(무료 라이브 예시) 두 번째부터만 숨겨요. 남는 글이 없으면 칸째 숨겨요
      if (!OW && ie) {
        var hasRf = FQ.some((function(e) { return "환불 규정" === e.q; }));
        var rf1 = null; // 환불 규정이 없을 때 남겨 둘 첫 번째 안내 상자
        var hideRf = function() {
          ie.style.display = "";
          [].forEach.call(ie.querySelectorAll("p,div"), (function(x) {
            // (10/29) 하단 공통 [운영 정책]·[환불 규정] 제목 줄(휴대폰용 사본 포함)부터도 숨겨요 — 그 내용은 '더 알아보기'에 있어요
            if (x.querySelector("p,div") || !(/^\s*[<＜〈]\s*(교환|반품|환불)/.test(x.textContent || "") || CF.length && /^\s*[\[【]\s*(운영|학습|이용|수강)?\s?(정책|규정|안내)\s*[\]】]\s*$|^\s*[\[【]\s*환불\s?규정\s*[\]】]\s*$/.test(x.textContent || ""))) return;
            if (!hasRf && x.offsetParent && (!rf1 || rf1 === x.parentElement)) return void (rf1 = x.parentElement);
            if (!hasRf && rf1 === x.parentElement) return;
            for (var s = x; s; s = s.nextElementSibling) s.style.display = "none";
          }));
          var left = [].some.call(ie.querySelectorAll("p,li,h1,h2,h3,h4,img,iframe,video,table"), (function(x) {
            return x.offsetParent && ((x.textContent || "").trim() || /^(IMG|IFRAME|VIDEO|TABLE)$/.test(x.tagName));
          }));
          ie.style.display = left ? "" : "none";
        };
        hideRf(), setTimeout(hideRf, 1200), setTimeout(hideRf, 3500);
      }
      function body(list) {
        var t = pe("div", "sf-pv-ownbody shop_view_body fr-view");
        list.forEach((function(e) {
          t.appendChild(e);
        })), [].forEach.call(t.querySelectorAll("img"), (function(e) {
          var s = e.getAttribute("data-src") || e.getAttribute("data-original");
          s && !e.getAttribute("src") && (e.src = s);
        }));
        return t;
      }
      // (10/27 v2) [프로그램] 글 → 회차 목록(모두 펼친 상태로 시작)
      //   첫 줄들(예: 총 6회 · 회당 90분 · 온라인) = 설명 / '# 제목 | 90분' = 한 회차 / '- 세부' = 그 회차 안 내용
      //   세부 줄에 링크를 걸면(또는 주소를 붙여 쓰면) 파란 글씨 + ▶ + '미리보기' 로 보이고 누르면 이동해요
      //   예전처럼 '1회차 · 주제 (90분)'으로 쓴 줄도 회차로 읽어요. 회차 줄이 하나도 없으면 null(쓴 글 그대로)
      //   (10/27) 기본 입력 = '1회차 제목' (구분 기호 없이 띄어쓰기만, 시간 없이) → 화면도 '1회차 제목'
      //   (10/29) 맨 위에 '프로그램' 제목(수강생 후기와 같은 머리 모양) → 그 아래 설명 줄(쓴 그대로) → 회차(처음부터 모두 펼침)
      function progBox(list) {
        var PI = SFUI.progItems(list), desc = PI.desc, items = PI.items;
        if (!items.length) return null;
        // (10/29) 설명 줄을 제목 칸 안에 넣어 '수강생 후기'와 같은 간격(제목 → 설명 6px, 설명 → 목록 20px)
        var h2 = '<div class="sf-pv-sechead"><div><h2>프로그램</h2>' + (desc.length ? '<p class="sf-pv-sub sf-pv-progsub">' + desc.map(oe).join("<br>") + "</p>" : "") + '</div></div><div class="sf-pv-chapters sf-pv-chapters--own" data-sf-accordion>' + items.map((function(e, s) {
          return '<div data-sf-acc-item class="is-open"><button type="button" data-sf-acc-trigger><b>' + (s + 1) + "회차</b><span>" + oe(e.t) + "</span>" + (e.m ? "<em>" + oe(e.m) + "</em>" : "") + "</button><div data-sf-acc-panel>" + (e.d.length ? '<ul class="sf-pv-chdet">' + e.d.map((function(d) {
            return d.u ? '<li class="is-link"><a href="' + oe(d.u) + '"' + (/^https?:/.test(d.u) && d.u.indexOf(location.host) < 0 ? ' target="_blank" rel="noopener"' : "") + "><span>" + oe(d.x) + "</span><em>미리보기</em></a></li>" : "<li>" + oe(d.x) + "</li>";
          })).join("") + "</ul>" : "") + "</div></div>";
        })).join("") + "</div>";
        return pe("div", "sf-pv-prog", h2);
      }
      // (10/27 v2) [강사] 글에 쓴 이름이 전문가 네트워크(/experts)에 있으면 사진·분야·소속·함께한 주제 + 프로필 보기 카드로 바꿔요
      //   이름 다음 줄들은 카드 안 소개 글로 들어가요. 못 찾으면 쓴 글 그대로
      function teachCards(secEl) {
        var bd = secEl.querySelector(".sf-pv-ownbody");
        bd && expertsLoad((function(EX) {
          var card = null;
          [].slice.call(bd.children).forEach((function(e) {
            var tx = (e.textContent || "").replace(/\s+/g, " ").trim();
            if (!tx && !e.querySelector("img,iframe,video")) return;
            var key = tx.split(/\s*[·(（|,\/]\s*|\s+-\s+/)[0].replace(/\s*(님|강사|연사|호스트|대표)$/, "").trim(), x = key.length < 12 && EX[key];
            if (!x && tx.length < 30 && !e.querySelector("img,iframe,video")) key = tx.split(" ")[0], x = EX[key]; // '김난도 서울대학교 교수'처럼 이름 소속을 같이 쓴 줄
            if (x) {
              // (10/27) 카드 = 사진 · 이름 · 소속 · 한 줄 소개, '프로필 더 보기'로 핵심 이력·자기소개 (분야·함께한 활동은 안 보여요)
              var href = x[0] ? SFUI.experts.url(x[0]) + (/preview_mode=1/.test(location.search) ? "&preview_mode=1" : "") : "/experts";
              card = pe("div", "sf-pv-teacher sf-pv-tcard", '<span class="sf-pv-teacher__photo" aria-hidden="true"></span><div class="sf-pv-tcard__txt"><strong>' + oe(key) + "</strong>" + (x[2] ? "<small>" + oe(x[2]) + "</small>" : "") + '<p class="sf-pv-tone" hidden></p><div class="sf-pv-tmore" hidden></div><button type="button" class="sf-pv-tmorebtn" aria-expanded="false" hidden>프로필 더 보기</button><a class="sf-pv-tlink" href="' + oe(href) + '">' + TL + ' 프로필 보기 <span aria-hidden="true">›</span></a></div>');
              /^https:\/\/[^"'()\s]+$/.test(x[1]) && (card.firstChild.style.backgroundImage = 'url("' + x[1] + '")');
              x[1] || (card.firstChild.classList.add("is-ini"), card.firstChild.setAttribute("style", SFUI.experts.tile(key, 0)), card.firstChild.textContent = key.charAt(0));
              bd.insertBefore(card, e), bd.removeChild(e);
              x[0] && expertDetail(x[0], tFill(card));
            } else if (card) {
              var lk = card.querySelector(".sf-pv-tmorebtn");
              lk.parentNode.insertBefore(e, lk), e.classList.add("sf-pv-tbio");
            }
          }));
          card && secEl.classList.add("has-cards");
        }));
      }
      // 전문가 글의 칸 → 카드 안 한 줄 소개 / 펼침(핵심 이력·자기소개)
      function tFill(card) {
        return function(S) {
          var one = card.querySelector(".sf-pv-tone"), more = card.querySelector(".sf-pv-tmore"), btn = card.querySelector(".sf-pv-tmorebtn");
          (S["한줄소개"] || []).length && (one.textContent = S["한줄소개"].join(" "), one.hidden = !1);
          var h = [ [ "핵심이력", "핵심 이력" ], [ "자기소개", "자기소개" ] ].map((function(k) {
            var L = S[k[0]] || [];
            if (L.length && "자기소개" === k[0]) return "<h4>" + k[1] + "</h4>" + L.map((function(s) { return "<p>" + oe(s) + "</p>"; })).join("");
            return L.length ? "<h4>" + k[1] + "</h4>" + (L.length > 1 ? "<ul>" + L.map((function(s) { return "<li>" + oe(s.replace(/^[-–•]\s*/, "")) + "</li>"; })).join("") + "</ul>" : "<p>" + oe(L[0].replace(/^[-–•]\s*/, "")) + "</p>") : "";
          })).join("");
          if (!h) return;
          more.innerHTML = h, btn.hidden = !1;
          btn.addEventListener("click", (function() {
            var op = more.hidden;
            more.hidden = !op, btn.setAttribute("aria-expanded", op ? "true" : "false"), btn.textContent = op ? "프로필 접기" : "프로필 더 보기";
          }));
        };
      }
      OG && ([].forEach.call(ne.querySelectorAll("[data-sf-own-g]"), (function(e) {
        var g2 = e.getAttribute("data-sf-own-g");
        OG[g2].forEach((function(part) {
          part.t && e.appendChild(pe("h3", "sf-pv-h3", oe(part.t)));
          var pg = "program" === g2 && progBox(part.n);
          e.appendChild(pg || body(part.n));
        }));
        // (10/29) 강사(연사·호스트) 칸, 회차 줄 없이 쓴 프로그램 칸도 '수강생 후기'처럼 맨 위에 제목을 보여요
        var sh = "teacher" === g2 ? TL : "program" === g2 && !e.querySelector(".sf-pv-prog") ? "프로그램" : "";
        sh && e.insertBefore(pe("div", "sf-pv-sechead", "<div><h2>" + sh + "</h2></div>"), e.firstElementChild.nextSibling);
        "teacher" === g2 && teachCards(e);
      })), G && (G.hidden = !0), re && (re.hidden = !0));
      FQ.forEach((function(e, s) {
        var pn = ne.querySelector('[data-sf-fq="' + s + '"]');
        pn && e.n && pn.appendChild(body(e.n));
      }));
      document.querySelectorAll(".categorize.review-box, .detail_review_wrap").forEach((function(e) {
        e.hidden = !0;
      })), window.SFUI && SFUI.init && SFUI.init(S);
    }
  }
  // (10/27) 상세 설명 [제목] → 칸 종류
  function secKind(t) {
    t = String(t).replace(/\s+/g, " ").trim();
    if (/^수강\s?기간$/.test(t)) return "period";
    if (/^강의실(\s?주소)?$/.test(t) || /^(강의\s?)?영상(\s?주소)?$/.test(t) || /^(카?톡방|단톡방|소통방|오픈\s?채팅(방)?)(\s?(주소|링크))?$/.test(t) || /^다시\s?보기(\s?(주소|링크|영상))?$/.test(t)) return "room"; // [강의 영상]·[톡방]·[다시보기] 도 화면에는 숨김
    if (/^(모임|행사|이벤트)\s?(안내|정보)$/.test(t)) return "meet"; // (10/29) [모임 안내] → 모임 안내 상자(SFUI.meetParse)
    if (/^(자주\s?묻는\s?질문|FAQ|Q\s?&\s?A|질문과 답변|문의)$/i.test(t)) return "faq";
    if (/^(교환|반품|환불)/.test(t)) return "refund";
    if (/^(운영|학습|이용|수강|참여|참가)\s?(정책|규정|안내)$|정책$/.test(t)) return "policy"; // (10/27 v2) 하단 공통 [운영 정책] → 더 알아보기
    if (/(강사|연사|호스트|진행자|멘토|코치)/.test(t)) return "teacher";
    if (/^(프로그램|커리큘럼|진행\s?안내|진행\s?방식|일정|프로그램\s?일정|회차|세부\s?일정|타임\s?테이블|수업\s?구성)/.test(t) && !/소개$/.test(t)) return "program";
    return "intro";
  }
  // (10/27) [자주 묻는 질문] 칸: 'Q. 질문' 줄과 'A. 답' 줄을 짝으로. Q 줄이 없으면 null(통째로 한 항목)
  function parseQA(list) {
    var out = [], cur = null, QR = /^\s*Q(\s*[\.\):：]\s*|\s+)/i, AR = /^\s*A(\s*[\.\):：]\s*|\s+)/i;
    list.forEach((function(e) {
      var tx = (e.textContent || "").trim();
      if (!tx && !(e.querySelector && e.querySelector("img,iframe,video,table"))) return;
      if (QR.test(tx) && tx.length < 200 && !(e.querySelector && e.querySelector("img,table"))) {
        cur = [ tx.replace(QR, ""), [] ], out.push(cur);
      } else if (cur) {
        if (AR.test(tx) && 1 === e.nodeType && !e.querySelector("img,table")) {
          var c2 = e.cloneNode(!0), first = c2.firstChild;
          while (first && 3 !== first.nodeType && first.firstChild) first = first.firstChild;
          first && 3 === first.nodeType && (first.nodeValue = first.nodeValue.replace(AR, ""));
          cur[1].push(c2);
        } else cur[1].push(e);
      }
    }));
    return out.length ? out : null;
  }
  // (10/23) 상세 설명을 [제목] 줄로 나눠요. '[커리큘럼]'·'【강사 소개】'처럼 괄호로 감싼 20자 이내 한 줄만 제목으로 봐요
  //   첫 제목 앞의 글은 '소개' 칸. 제목 줄이 없으면 null → 예전처럼 예시 내용 + 상세 설명
  function ownSecs(W) {
    // (10/26) 아임웹이 본문을 겹겹이 감싸고 옆에 '하단 공통' 상자를 붙이면 [제목] 줄을 못 찾던 문제 → 제목 줄이 들어 있는 상자를 직접 찾아요
    var RE = /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/, hd = [].filter.call(W.querySelectorAll("p,h1,h2,h3,h4,h5,h6,div"), (function(x) {
      return !x.querySelector("p,div,img,iframe,video,table") && RE.test(x.textContent);
    }))[0];
    if (!hd) return null;
    var e = hd.parentElement, top = e;
    while (top.parentElement && top.parentElement !== W) top = top.parentElement;
    var t = [], a = [], n = null;
    [].slice.call(e.childNodes).forEach((function(e) {
      if (1 !== e.nodeType || !/^(STYLE|SCRIPT)$/.test(e.tagName)) {
        var s = 1 === e.nodeType && !e.querySelector("img,iframe,video,table") && RE.exec(e.textContent);
        s ? (n = { t: s[1], n: [] }, t.push(n)) : (n ? n.n : a).push(e);
      }
    }));
    // 본문 상자 바깥(같은 줄의 형제 — 예: 하단 공통 교환·환불 안내)은 마지막 칸 뒤로
    if (e !== W && top !== e) [].slice.call(W.childNodes).forEach((function(x) {
      x !== top && !(1 === x.nodeType && /^(STYLE|SCRIPT)$/.test(x.tagName)) && (x.textContent || "").trim() && (n ? n.n : a).push(x);
    })); else if (e !== W) [].slice.call(W.childNodes).forEach((function(x) {
      x !== e && !(1 === x.nodeType && /^(STYLE|SCRIPT)$/.test(x.tagName)) && (x.textContent || "").trim() && (n ? n.n : a).push(x);
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
  // (10/27 v2) 전문가 네트워크(/experts 코드 위젯의 프로필 33명)를 한 번 받아 { 이름: [칸 id, 사진, 분야, 소속, 함께한 주제] } 로 (탭 안에서는 다시 안 받아요)
  // (10/27) 전문가 게시판 글로 바꿈 → { 이름: [글 번호, 사진, 소속, 함께한 활동] }. 게시판이 없으면(게시 전 공개 페이지) 예전 위젯 프로필로
  function expertsLoad(done) {
    var EX = null, X = SFUI.experts;
    try { EX = JSON.parse(sessionStorage.getItem("sf_experts2") || "null"); } catch (x) {}
    if (EX) return done(EX);
    if (!window.fetch || !window.DOMParser || !X) return;
    fetch("/experts/" + (/preview_mode=1/.test(location.search) ? "?preview_mode=1" : ""), { credentials: "same-origin" }).then((function(r) {
      return r.ok ? r.text() : "";
    })).then((function(t) {
      var d = t && new DOMParser().parseFromString(t, "text/html"), out = {}, n = 0;
      d && [].forEach.call(d.querySelectorAll("#post_card_" + X.board + " ._post_item_wrap"), (function(it) {
        var c = X.card(it);
        c && !out[c.name] && (out[c.name] = [ c.idx, c.img, c.org, c.act ], n++);
      }));
      n || d && [ d ].concat([].map.call(d.querySelectorAll("template"), (function(x) { return x.content; }))).forEach((function(r) {
        [].forEach.call(r.querySelectorAll("article.sf-ex-pf[id]"), (function(a) {
          var h = a.querySelector("h2"), ph = a.querySelector(".sf-ex-ph"), og = a.querySelector(".sf-ex-hero h2 + p"), tk = a.querySelector(".sf-ex-talk");
          var u = ph && /url\(\s*["']?([^"')\s]+)/.exec(ph.getAttribute("style") || "");
          h && !out[h.textContent.trim()] && (out[h.textContent.trim()] = [ X.order[+a.id.slice(1) - 1] || 0, u ? u[1] : "", og ? og.textContent.trim() : "", tk ? tk.textContent.trim() : "" ], n++);
        }));
      }));
      if (!n) return;
      try { sessionStorage.setItem("sf_experts2", JSON.stringify(out)); } catch (x) {}
      done(out);
    }))["catch"]((function() {}));
  }
  // 전문가 글 한 개의 칸 → { 한줄소개: [줄…], 핵심이력: [...], 자기소개: [...] } (탭 안에서는 다시 안 받아요)
  function expertDetail(idx, done) {
    var k = "sf_exv_" + idx, C = null;
    try { C = JSON.parse(sessionStorage.getItem(k) || "null"); } catch (x) {}
    if (C) return done(C);
    if (!window.fetch || !window.DOMParser) return;
    fetch(SFUI.experts.url(idx) + (/preview_mode=1/.test(location.search) ? "&preview_mode=1" : ""), { credentials: "same-origin" }).then((function(r) {
      return r.ok ? r.text() : "";
    })).then((function(t) {
      var d = t && new DOMParser().parseFromString(t, "text/html"), b = d && d.querySelector(".board_txt_area"), o = {}, cur = null;
      var HD = /^\s*\[\s*(함께한\s*활동|한\s*줄\s*소개|핵심\s*이력|자기\s*소개)\s*\]\s*$/;
      if (!b) return;
      [].forEach.call(b.querySelectorAll("p, h1, h2, h3, h4, li, div"), (function(x) {
        if (x.querySelector("p, div, li, h1, h2, h3, h4")) return;
        var m = HD.exec(x.textContent), s = x.textContent.replace(/\s+/g, " ").trim();
        m ? (cur = m[1].replace(/\s+/g, ""), o[cur] = []) : cur && s && !/^[\-–]$/.test(s) && o[cur].push(s);
      }));
      try { sessionStorage.setItem(k, JSON.stringify(o)); } catch (x) {}
      done(o);
    }))["catch"]((function() {}));
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
  // (10/23) 상세 '수강생 후기' — 예시 후기 대신 공식 사이트(apply.seniorfuture.kr/reviews)의 실제 멤버 후기. 수강평 게시판에 진짜 후기가 생기면 r3ReviewData 가 그걸로 바꿔요
  function ue() {
    return '<section id="sf-pv-review" class="sf-pv-sec"><div data-sf-carousel><div class="sf-pv-sechead"><div><h2>수강생 후기</h2><p class="sf-pv-sub">시니어퓨처 스터디·네트워킹에 함께한 멤버들의 후기예요</p></div><div class="sf-pv-arrows"><button type="button" class="sf-arrow" data-sf-prev aria-label="이전 후기">‹</button><button type="button" class="sf-arrow" data-sf-next aria-label="다음 후기">›</button></div></div><div class="sf-track sf-pv-reviews" data-sf-track>' + m.map((function(e) {
      return '<a class="sf-review sf-slide" href="' + (e[3] ? "/review/?bmode=view&idx=" + e[3] : "/review") + '"><span class="sf-review__course">' + oe(e[0]) + '</span><span class="sf-review__top">' + (e[4] ? '<img class="sf-review__thumb" src="' + oe(e[4]) + '" alt="" loading="lazy">' : "") + '<span class="sf-review__quote">' + oe(e[1]) + '</span></span><span class="sf-review__body">' + oe(e[2].length > 76 ? e[2].slice(0, 76).replace(/\s+\S*$/, "") + "…" : e[2]) + '</span><span class="sf-review__more">후기 자세히 보기 →</span></a>';
    })).join("") + '</div></div><a class="sf-pv-allreview" href="/review">후기 전체보기 →</a></section>';
  }
  function he(e) {
    return '<ul class="sf-pv-who">' + e.map((function(e) {
      return "<li>" + oe(e) + "</li>";
    })).join("") + "</ul>";
  }
})
