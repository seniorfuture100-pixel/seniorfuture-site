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
      deadline: "2026-10-18T18:00:00+09:00"
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
      deadline: "2026-10-19T18:00:00+09:00"
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
  }, e = {
    best: [ "best", "🔥 BEST" ],
    new: [ "new", "NEW" ],
    hot: [ "hot", "인기급상승" ],
    early: [ "early", "얼리버드" ],
    first: [ "first", "선착순" ],
    closing: [ "closing", "마감임박" ]
  }, a = [];
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
  function s(t) {
    var e = Date.now(), a = SFUI.parseDate(t.deadline), s = SFUI.parseDate(t.start);
    return s && e >= s || a && e >= a ? [ "closed", "모집 마감" ] : a && a - e <= 2592e5 ? [ "soon", "마감 임박" ] : [ "recruit", "모집중" ];
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
        }(), d = i.querySelectorAll("li.iw-shop-card"), u = d[0] && l[d[0].getAttribute("data-system-product-id")], f = u && u.type || "course", p = i.querySelector(".widget-sandbox-root") || c.parentNode;
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
              if ("course" === r) t.setAttribute("data-category", a.cat || ""), n && tg && (n.innerHTML = '<span class="sf-tags">' + SFUI.tagHtml(tg) + "</span>"); else if ("live" === r) {
                var o = (t.querySelector('a[href*="idx="]') || {}).getAttribute ? t.querySelector('a[href*="idx="]').getAttribute("href") : "#";
                t.setAttribute("data-sf-live", ""), t.setAttribute("data-start", a.start || ""), 
                t.setAttribute("data-end", a.end || ""), t.setAttribute("data-deadline", a.deadline || ""), 
                t.setAttribute("data-link-apply", o), t.setAttribute("data-link-live", a.live || "/classroom"), 
                t.setAttribute("data-link-replay", a.replay || "/classroom"), n && (n.innerHTML = '<span class="sf-tags"><span data-sf-live-badge class="sf-badge"></span></span>');
                var c = document.createElement("a");
                c.setAttribute("data-sf-live-btn", ""), c.className = "sf-btn sf-btn--block sf-shop-cta", 
                t.appendChild(c);
              } else if ("meet" === r) {
                var l = s(a);
                t.setAttribute("data-status", l[0]), t.setAttribute("data-kind", "이벤트" === a.kind ? "event" : "meet"), 
                t.setAttribute("data-place", /온라인/.test(a.place || "") ? "online" : "offline"), 
                n && (n.innerHTML = '<span class="sf-tags"><span class="sf-tag sf-tag--' + ("이벤트" === a.kind ? "event" : "meet") + '">' + (a.kind || "모임") + '</span><span class="sf-tag sf-tag--' + l[0] + '">' + l[1] + "</span></span>");
                var d = document.createElement("div");
                d.className = "sf-shop-meta", d.innerHTML = (a.date ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>' + a.date + "</span>" : "") + (a.place ? '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>' + a.place + "</span>" : ""), 
                i.appendChild(d);
              }
              ht && "course" !== r && n && n.insertAdjacentHTML("beforeend", '<span class="sf-tags">' + SFUI.tagHtml(ht) + "</span>");
            }
          }(t, a, a.type || f);
        })), "meet" === f && function(t) {
          var e = [].slice.call(t.querySelectorAll("li.iw-shop-card"));
          e.filter((function(t) {
            return "closed" === t.getAttribute("data-status");
          })).forEach((function(e) {
            t.appendChild(e);
          }));
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
        o.textContent = "조건에 맞는 항목이 없어요. 다른 조건을 골라 보세요.", t.shadowRoot.querySelector(".iw-shop-grid").after(o)), 
        o.hidden = n > 0;
      }
    }
  }
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
