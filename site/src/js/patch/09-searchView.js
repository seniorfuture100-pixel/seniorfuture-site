// 원본: src/search-view.js
/* search-view.js — 아임웹 검색 결과(search_widget_v2)를 Figma 'PC/검색 결과'(33:3579)처럼
   - 가운데 둥근 검색창 · "‘검색어’ 검색 결과 N개" 제목 · 탭 이름(교육·라이브·모임 / 인사이트·후기)
   - 상품 결과를 주소(/course · /live · /community)로 나눠 '교육 N · 무료 라이브 N · 모임 N' 묶음으로 보여 주고,
     교육 카드에는 태그(🔥 BEST 등)를 붙여요. 결과 없음 화면엔 인기 검색어를 보여 줘요. */
SFUI.register('searchView', function() {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  var e = document.querySelector(".search_widget_v2");
  if (e && SFUI.once(e, "Search")) {
    document.documentElement.classList.add("sf-sr-on");
    var r = new URLSearchParams(location.search).get("keyword") || "", t = [ [ "/course", "교육", "/course" ], [ "/live", "무료 라이브", "/live" ], [ "/community", "모임", "/community" ] ], n = window.SF_SITE && SF_SITE.popular || [ "장기요양 평가", "시니어 창업", "에이지테크", "시니어 타운", "보험 신탁", "5060 마케팅" ], s = {
      "쇼핑": "교육·라이브·모임",
      "게시판": "인사이트·후기"
    }, a = u("h1", "sf-sr-title"), o = e.querySelector(".sw2-top"), c = e.querySelector(".sw2-nav");
    o && c && o.insertBefore(a, c), [].forEach.call(e.querySelectorAll(".sw2-tabs a"), (function(e) {
      var r = e.textContent.trim();
      s[r] ? e.textContent = s[r] : "지도" !== r && "갤러리" !== r || (e.parentNode.hidden = !0);
    })), d();
    var i = !1;
    new MutationObserver((function() {
      i || (i = !0, setTimeout((function() {
        d(), i = !1;
      }), 60));
    })).observe(e, {
      childList: !0,
      subtree: !0
    });
  }
  function u(e, r, t) {
    var n = document.createElement(e);
    return r && (n.className = r), null != t && (n.innerHTML = t), n;
  }
  function l(e) {
    var r = document.createElement("div");
    return r.textContent = e, r.innerHTML;
  }
  function d() {
    var s = e.querySelector(".sw2-body");
    if (s) {
      var o = s.querySelector(".sw2-result > .sw2-grid:not(.sf-sr-grid)"), c = o ? [].slice.call(o.querySelectorAll(".sw2-card")) : [], i = s.querySelectorAll(".sw2-card").length;
      a.innerHTML = "‘" + l(r) + "’ 검색 결과 <b>" + i + "</b>개";
      var d = s.querySelector(".sw2-empty");
      if (d && !d.querySelector(".sf-sr-pop") && d.insertAdjacentHTML("beforeend", '<div class="sf-sr-pop"><strong>이런 검색어는 어때요?</strong><div class="sf-chips">' + n.map((function(e) {
        return '<a class="sf-chip" href="/search?keyword=' + encodeURIComponent(e) + '">' + l(e) + "</a>";
      })).join("") + "</div></div>"), c.length) {
        var f = c.some((function(e) {
          var r = e.querySelector("a[href]");
          return r && /^\/(course|live|community)\//.test(r.getAttribute("href"));
        }));
        if (c.forEach((function(e) {
          var r, t, n, s, a = e.querySelector("a.sw2-card-name");
          a && !e.querySelector(".sf-tags") && a.insertAdjacentHTML("afterend", (r = a.getAttribute("href"), 
          t = /idx=(\d+)/.exec(r || ""), n = SFUI.shopItems ? SFUI.shopItems() : {}, (s = t && n[t[1]]) && s.tags && SFUI.shopTags ? '<span class="sf-tags">' + s.tags.map((function(e) {
            var r = SFUI.shopTags[e];
            return r ? '<span class="sf-tag sf-tag--' + r[0] + '">' + r[1] + "</span>" : "";
          })).join("") + "</span>" : ""));
        })), f) {
          var h = u("div", "sf-sr-groups");
          t.forEach((function(e) {
            var r = c.filter((function(r) {
              var t = r.querySelector("a[href]");
              return t && 0 === t.getAttribute("href").indexOf(e[0] + "/");
            }));
            if (r.length) {
              var t = u("section", "sf-sr-sec", '<div class="sf-sr-head"><h2>' + e[1] + " <b>" + r.length + '</b></h2><a href="' + e[2] + '">더보기 <span aria-hidden="true">›</span></a></div>'), n = u("div", "sw2-grid sf-sr-grid");
              r.forEach((function(e) {
                n.appendChild(e);
              })), t.appendChild(n), h.appendChild(t);
            }
          })), o.parentNode.insertBefore(h, o), o.hidden = !o.querySelector(".sw2-card");
        }
      }
    }
  }
})
