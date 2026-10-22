// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
// window.__sfR2 로 이름을 붙여 둬요 — 화면 바꾸기(r3-soft)가 새 주소 기준으로 다시 부를 때 써요(외부 파일로 옮긴 뒤에도 동작)
(window.__sfR2 = function() {
  var e = window.SF_SITE || {}, t = location.pathname.replace(/\/$/, "") || "/", r = new URLSearchParams(location.search), a = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, n = document.documentElement;
  function i(e, t) {
    return (t || document).querySelector(e);
  }
  function o(e, t) {
    return [].slice.call((t || document).querySelectorAll(e));
  }
  function s(e) {
    var t = document.createElement("div");
    return t.textContent = e, t.innerHTML;
  }
  var c = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>', l = e.kakao || "";
  function d(e) {
    if (l) return e.href = l, e.target = "_blank", void (e.rel = "noopener");
    e.href = "#", e.setAttribute("data-r2-kakao-todo", "");
  }
  function f() {
    var e = 0;
    if (o(".viewport-nav.desktop").forEach((function(t) {
      var r = (t.closest(".inline-section-wrap") || t).getBoundingClientRect();
      r.height > 0 && r.top < 240 && r.bottom > e && (e = r.bottom);
    })), !e) {
      var t = document.getElementById("doz_header_wrap");
      t && (e = t.getBoundingClientRect().bottom);
    }
    n.style.setProperty("--r2-hb", Math.max(0, Math.round(e)) + "px");
  }
  document.addEventListener("click", (function(e) {
    e.target.closest && e.target.closest("[data-r2-kakao-todo]") && (e.preventDefault(), 
    e.stopPropagation(), window.SFUI && SFUI.toast && SFUI.toast("카카오톡 채널 연결을 준비하고 있어요"));
  }), !0), window.addEventListener("scroll", f, {
    passive: !0
  }), window.addEventListener("resize", f), document.addEventListener("mouseover", (function(e) {
    e.target.closest && e.target.closest(".sf-nav-edu") && f();
  })), SFUI.register("r2Header", (function() {
    var t = document.getElementById("doz_header_wrap");
    if (t && SFUI.once(t, "R2")) {
      f();
      var r, a = SFUI.cats || [];
      if (o(".sf-nav-edu .sf-navdrop").forEach((function(e) {
        e.classList.add("r2-mega"), e.innerHTML = '<div class="r2-mega__in"><a class="r2-mega__all" href="/course">전체 강의 보기' + c + '</a><div class="r2-mega__grid">' + a.map((function(e) {
          return '<a href="/course?cat=' + e[0] + '"><span>' + s(e[1].replace("·", " & ")) + "</span>" + c + "</a>";
        })).join("") + "</div></div>";
      })), document.addEventListener("mouseover", (function(e) {
        e.target.closest && e.target.closest(".sf-nav-edu") && f();
      })), SFUI.loggedIn) {
        n.classList.add("r2-in");
        var l = t.querySelector('[data-widget-type="inline_login_btn"]'), u = l && l.querySelector("img"), p = u && u.getAttribute("src"), m = p && !/default_profile/.test(p) ? '<img src="' + p + '" alt="">' : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>';
        o(".sf-hd-actions").forEach((function(e) {
          if (!e.querySelector(".r2-acct")) {
            var t = document.createElement("a");
            t.className = "r2-bell", t.href = "/help#notice", t.setAttribute("aria-label", "알림"), 
            t.setAttribute("role", "button"), t.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg>';
            var r = document.createElement("div");
            r.className = "r2-acct", r.innerHTML = '<a class="r2-acct__btn" href="/shop_mypage"><span class="r2-acct__av">' + m + "</span><span>마이페이지</span></a>";
            var a = e.querySelector(".sf-hd-partner");
            a ? e.insertBefore(t, a) : e.appendChild(t), e.appendChild(r);
          }
        })), o(".sf-menu__auth").forEach((function(e) {
          e.innerHTML = '<a class="sf-btn sf-btn--dark" href="/shop_mypage">마이페이지</a>';
        })), document.addEventListener("click", (function(e) {
          e.target.closest && e.target.closest(".r2-bell") && window.ALARM_MENU && ALARM_MENU.showAlarmSlide && (e.preventDefault(), 
          ALARM_MENU.showAlarmSlide(), n.classList.add("r2-alarm-open"), function e(t) {
            var r = document.querySelector("#site_alarm_slidemenu ._alarm_header");
            if (r) {
              if (!r.querySelector(".r2-alarm-x")) {
                var a = document.createElement("button");
                a.type = "button", a.className = "r2-alarm-x", a.setAttribute("aria-label", "알림 닫기"), 
                a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>', 
                a.addEventListener("click", (function() {
                  var e = document.getElementById("site_alarm_slidemenu_backdrop");
                  e && e.click(), n.classList.remove("r2-alarm-open");
                })), r.insertBefore(a, r.firstChild);
              }
              setTimeout((function() {
                var e = document.getElementById("site_alarm_tab"), t = document.querySelector(".r2-alarm-empty");
                if (e) if (e.querySelector(".tile")) t && t.remove(); else if (!t) {
                  var r = document.createElement("p");
                  r.className = "r2-alarm-empty", r.textContent = "새 알림이 없어요", e.appendChild(r);
                }
              }), 2e3);
              var i = r.querySelector(".r2-alarm-x");
              i && i.focus();
            } else t < 30 && setTimeout((function() {
              e(t + 1);
            }), 100);
          }(0));
        })), document.addEventListener("keydown", (function(e) {
          if ("Escape" === e.key && n.classList.contains("r2-alarm-open")) {
            var t = document.getElementById("site_alarm_slidemenu_backdrop");
            t && t.click(), n.classList.remove("r2-alarm-open");
          }
        })), o(".sf-tabbar a").forEach((function(e) {
          /\/classroom/.test(e.getAttribute("href")) && (e.href = "/shop_mypage", e.setAttribute("data-match", "^/(classroom|class-|shop_mypage)"));
        }));
      }
      o(".sf-hd-search").forEach((function(e) {
        e.querySelector(".r2-sq") || (e.classList.add("r2-sbox"), e.insertAdjacentHTML("beforeend", '<span class="r2-sq">검색</span>'));
      })), o(".sf-hd-partner").forEach((function(e) {
        e.classList.add("r2-pill");
      })), window.addEventListener("resize", (function() {
        clearTimeout(r), r = setTimeout((function() {
          _(), E();
        }), 400);
      })), setTimeout((function() {
        _(), E();
      }), 800), setTimeout(E, 2500), o(".sf-fab").forEach((function(e) {
        e.classList.add("r2-fab"), e.textContent = "1:1 문의", e.setAttribute("aria-label", "1:1 문의 (카카오톡 채널)"), 
        d(e);
      })), o(".sf-menu__sub a, .sf-navdrop a").forEach((function(e) {
        "창업·사업개발" === e.textContent.trim() && (e.textContent = "창업 & 사업개발");
      })), o(".sf-menu__foot a").forEach((function(e) {
        /카카오톡 상담/.test(e.textContent) && (e.textContent = "1:1 문의", d(e));
      })), o(".sf-ft a").forEach((function(e) {
        var t = e.textContent.trim();
        "카카오톡 상담" === t ? (e.textContent = "1:1 문의", d(e)) : "카톡 상담하기" === t && (e.textContent = "1:1 문의하기", 
        d(e));
      }));
      var h = e.popular && e.popular.length >= 10 ? e.popular : [ "장기요양 운영", "시니어 타운", "요양기관 평가", "보험·신탁 설계", "에이지테크", "시니어 창업", "방문요양", "5060 마케팅", "무료 라이브", "시니어 일자리" ], v = document.getElementById("sf-search");
      if (v) {
        v.classList.add("r2-search");
        var g = i("input[data-sf-search-input]", v);
        g && (g.placeholder = "어떤 강의·인사이트를 찾으세요?");
        var b = i(".sf-search__pop", v);
        if (b) {
          b.innerHTML = h.slice(0, 10).map((function(e, t) {
            return "<li" + (t < 5 ? ' class="is-top"' : "") + '><a href="/search?keyword=' + encodeURIComponent(e) + '"><b>' + (t + 1) + "</b>" + s(e) + "</a></li>";
          })).join("");
          var y = b.previousElementSibling;
          y && (y.textContent = "인기 검색어");
        }
        var w = i("[data-sf-recent-clear]", v);
        w && (w.textContent = "전체 삭제"), document.addEventListener("click", (function(e) {
          e.target.closest && e.target.closest("[data-sf-search-open]") && f();
        }), !0);
      }
    }
    function _() {
      window.innerWidth < 768 || o("#doz_header_wrap .viewport-nav.desktop").forEach((function(e) {
        var t = e.querySelector(":scope > li._more_menu");
        t && o(":scope > ul._more_list > li", t).forEach((function(r) {
          r.classList.remove("dropdown-submenu"), r.classList.add("dropdown"), e.insertBefore(r, t);
        }));
      }));
    }
    function E() {
      o("#doz_header_wrap .sf-hd-search.r2-sbox .r2-sq").forEach((function(e) {
        e.textContent = "검색";
      }));
    }
  })), SFUI.register("r2Bleed", (function() {
    var e = i(".sfw-banner");
    if (e && SFUI.once(e, "R2Bleed")) {
      a(), window.addEventListener("resize", a), e.classList.add("r2-bleed");
      for (var t = e.parentElement; t && t !== document.body; t = t.parentElement) {
        var r = getComputedStyle(t).overflowX;
        "hidden" !== r && "clip" !== r || (t.style.overflowX = "visible");
      }
      setTimeout(o, 60), window.addEventListener("resize", (function() {
        setTimeout(o, 60);
      }));
    }
    function a() {
      n.style.setProperty("--r2-vw", document.documentElement.clientWidth + "px");
    }
    function o() {
      var t = e.querySelector("[data-sf-track]"), r = t && (t.querySelector(".is-current") || t.querySelector('[data-sf-n="0"]:not([data-sf-clone])'));
      if (t && r && !(window.innerWidth < 768)) {
        var a = t.style.scrollBehavior;
        t.style.scrollBehavior = "auto", t.scrollLeft = r.offsetLeft - (t.clientWidth - r.offsetWidth) / 2, 
        t.style.scrollBehavior = a;
      }
    }
  })), SFUI.register("r2BannerPh", (function() {
    var e = /(763c8869ed481|fef4a0a062de5|1842ce4e584a5|e036249b57bbf|52414c2f66081)\.jpg/;
    o(".sfw-banner__slide").forEach((function(t) {
      var r = t.querySelector("img");
      r && e.test(r.getAttribute("src") || "") && !t.classList.contains("r2-ph") && (t.classList.add("r2-ph"), 
      t.setAttribute("data-ph", "예시 이미지 · 실제 사진으로 바꿔 주세요"));
    }));
  })), SFUI.register("r2ShopTap", (function() {
    var e = 0;
    !function t() {
      var r = o("[data-sf-shop]");
      r.forEach((function(e) {
        var t = e.shadowRoot;
        if (t && !t.querySelector("#r2-tap")) {
          var r = document.createElement("style");
          r.id = "r2-tap", r.textContent = "*{-webkit-tap-highlight-color:transparent}a:focus:not(:focus-visible),.iw-card-info-link:focus:not(:focus-visible){outline:0!important}a,.iw-shop-card{-webkit-touch-callout:none}.iw-shop-card{height:100%}.iw-card-info-link{flex:1 1 auto}.iw-card-name-link{display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;min-height:2.9em;line-height:1.45!important;white-space:normal!important}.iw-card-actions{margin-top:0!important}.iw-card-period:empty{display:none!important}.sf-shop--live .iw-shop-product-badges{display:none!important}.sf-shop-cta{margin-top:auto!important}.iw-shop-card:has(.sf-shop-cta) .iw-card-info-link{padding-bottom:16px}.sf-shop--list .iw-shop-paging{margin-bottom:16px!important}.sf-shop--meet .iw-shop-media,.sf-shop--meet .iw-card-thumb-link{aspect-ratio:16/9!important;height:auto!important}.sf-shop--meet .iw-shop-thumbnail{width:100%!important;height:100%!important;aspect-ratio:16/9!important;object-fit:cover!important}.iw-card-name-link{min-height:0!important;-webkit-line-clamp:3!important}.iw-shop-product-summary{display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.iw-card-info-link{flex:0 0 auto!important}.iw-shop-body{flex:0 0 auto!important}.iw-shop-product-badges{margin-top:10px!important}.sf-shop-cta{margin-top:auto!important}.iw-shop-card .iw-card-info-link+.sf-shop-cta,.iw-shop-card>.sf-shop-cta{margin-top:auto!important}.iw-card-name-link{transition:color .2s ease}.iw-shop-card:hover .iw-card-name-link{color:var(--sf-text-brand,#e14d00)!important}.sf-shop .iw-shop-card:focus-within{outline:0!important}.sf-shop .iw-shop-card:has(:focus-visible){outline:3px solid var(--sf-text-brand,#e14d00)!important;outline-offset:4px;border-radius:8px}", 
          t.appendChild(r);
        }
      })), ++e < 40 && (!r.length || r.some((function(e) {
        return !e.shadowRoot || !e.shadowRoot.querySelector("#r2-tap");
      }))) && setTimeout(t, 250);
    }();
  })), SFUI.register("r2Insight", (function() {
    var e = "/" === t || "" === t || /^\/index/.test(t);
    if ((e || /^\/insight/.test(t)) && !r.get("bmode") && (o('[data-widget-type="board"], [data-widget-type="newest"]').forEach((function(e) {
      e.querySelector(".type_grid") && e.classList.add("r2-bgrid");
    })), o(".r2-bgrid ._post_item_wrap .title").forEach((function(e) {
      if (!e.querySelector(".r2-ttl")) {
        var t = e.querySelector("em:not(.notice-block):not(.addon-badge)"), r = "";
        if ([].slice.call(e.childNodes).forEach((function(e) {
          3 === e.nodeType && e.textContent.trim() && (r += e.textContent, e.remove());
        })), t) {
          var a = document.createElement("div");
          a.className = "r2-icat", a.textContent = t.textContent.trim(), e.parentNode.insertBefore(a, e);
        }
        var n = document.createElement("span");
        n.className = "r2-ttl", n.textContent = r.trim(), e.appendChild(n);
      }
    })), !e)) {
      n.classList.add("r2-ins");
      var a = i("[data-sf-board-filter]"), c = i("#h-best");
      c = c && c.closest("section");
      var l = i(".sf-newsletter");
      (l = l && l.closest("section")) && (l.hidden = !0);
      var d = null;
      o("h2, h3, strong").some((function(e) {
        if ("전체 글" === e.textContent.trim() && !e.children.length) return d = e, !0;
      })), a && a.addEventListener("click", (function() {
        setTimeout(f, 0);
      })), f(), setTimeout(f, 600);
    }
    function f() {
      var e = a && a.querySelector("[data-cat].is-active"), t = e ? e.getAttribute("data-cat") : "all", r = "all" !== t;
      n.classList.toggle("r2-ins-cat", r), c && (c.hidden = r);
      var i = o('[data-widget-type="board"] ._post_item_wrap:not(.sf-hidden)').length;
      d && (d.innerHTML = r ? s(t) + ' <span class="r2-count">' + i + "개의 글</span>" : "전체 글");
    }
  })), SFUI.register("r2Motion", (function() {
    var e = i(".sf-biz") || i(".sf-pt");
    if (e && SFUI.once(e, "R2Motion")) {
      n.classList.add("r2-mo");
      var t = e.classList.contains("sf-biz"), r = e.querySelector("section");
      if (r) {
        r.classList.add("r2-hero"), m(r.querySelector("h1"));
        var s = r.querySelector(".sf-dot, .sf-pt-pill");
        s && s.classList.add("r2-eyebrow");
        var c = r.querySelector(".sf-diagram");
        if (c && t) {
          var l = document.createElement("div");
          l.className = "r2-float", l.setAttribute("aria-hidden", "true"), l.innerHTML = [ [ "g-o", "교육", "임직원 시니어 고객 교육" ], [ "g-b", "컨설팅", "시니어 시장 진입 전략" ], [ "g-g", "프로젝트", "지자체 시니어 창업 지원" ], [ "g-d", "리서치", "5060 소비자 패널 조사" ] ].map((function(e, t) {
            return '<div class="r2-fc r2-fc--' + t + " " + e[0] + '"><small>' + e[1] + "</small><b>" + e[2] + "</b></div>";
          })).join(""), c.parentNode.insertBefore(l, c), c.classList.add("r2-off");
        }
        requestAnimationFrame((function() {
          setTimeout((function() {
            r.classList.add("r2-play");
          }), 60);
        }));
      }
      o("section h2", e).forEach((function(e) {
        r && r.contains(e) || (m(e), e.classList.add("r2-rv"));
      }));
      o(".sf-need-cards, .sf-sol-list, .sf-cases, .sf-metrics, .sf-why, .sf-ap-grid, .sf-ap-ways, .sf-ap-dark, .sf-ap-ben, .sf-ap-steps, .sf-ap-stories, .sf-pt-stats, .sf-pt-ex, .sf-pt-cmp, .sf-pt-steps, .sf-pt-faq, .sf-pt-story, .sf-steps", e).forEach((function(e) {
        e.classList.add("r2-stag"), [].forEach.call(e.children, (function(e, t) {
          e.style.setProperty("--i", Math.min(t, 8));
        }));
      })), o(".sf-logos", e).forEach((function(e) {
        if (!e.classList.contains("r2-mq")) {
          var t = [].slice.call(e.children);
          if (!(t.length < 4)) {
            var r = Math.ceil(t.length / 2), a = document.createElement("div");
            a.className = "r2-marquee", [ t.slice(0, r), t.slice(r) ].forEach((function(e, t) {
              var r = document.createElement("div");
              r.className = "r2-mq-row" + (t ? " is-rev" : "");
              var n = document.createElement("div");
              n.className = "r2-mq-track", e.concat(e).forEach((function(t, r) {
                var a = t.cloneNode(!0);
                r >= e.length && a.setAttribute("aria-hidden", "true"), n.appendChild(a);
              })), r.appendChild(n), a.appendChild(r);
            })), e.classList.add("r2-mq"), e.parentNode.insertBefore(a, e.nextSibling);
          }
        }
      })), o(".sf-pt-chat", e).forEach((function(e) {
        e.classList.add("r2-stag"), [].forEach.call(e.children, (function(e, t) {
          e.style.setProperty("--i", 2 * t);
        }));
      }));
      var d = o(".sf-metrics b, .sf-metrics strong, .sf-pt-stats b, [data-sf-count]", e), f = i(".sf-sol-sec", e);
      if (f && f.classList.add("r2-sticky"), !a && "IntersectionObserver" in window) {
        var u = new IntersectionObserver((function(e) {
          e.forEach((function(e) {
            e.isIntersecting && (e.target.classList.add("r2-in"), u.unobserve(e.target), o("b, strong, [data-sf-count]", e.target).filter((function(e) {
              return d.indexOf(e) > -1;
            })).forEach(h));
          }));
        }), {
          threshold: .15,
          rootMargin: "0px 0px -8% 0px"
        });
        o(".r2-rv, .r2-stag", e).forEach((function(e) {
          u.observe(e);
        }));
        var p = null;
        window.addEventListener("scroll", (function() {
          clearTimeout(p), p = setTimeout(v, 120);
        }), {
          passive: !0
        }), setTimeout(v, 1200);
      } else o(".r2-rv, .r2-stag", e).forEach((function(e) {
        e.classList.add("r2-in");
      }));
    }
    function m(e) {
      if (e && !e.querySelector(".r2-ln")) {
        var t = e.innerHTML.split(/<br\s*\/?>/i);
        e.innerHTML = t.map((function(e, t) {
          return '<span class="r2-ln"><span style="--d:' + .09 * t + 's">' + e + "</span></span>";
        })).join(""), e.classList.add("r2-lines");
      }
    }
    function h(e) {
      var t = e.textContent.match(/^([^\d]*)([\d,.]+)(.*)$/);
      if (t) {
        var r = parseFloat(t[2].replace(/,/g, ""));
        if (r) {
          var a = (t[2].split(".")[1] || "").length, n = null;
          requestAnimationFrame((function i(o) {
            n || (n = o);
            var s = Math.min(1, (o - n) / 1200), c = r * (1 - Math.pow(1 - s, 3));
            e.textContent = t[1] + (a ? c.toFixed(a) : Math.round(c).toLocaleString("ko-KR")) + t[3], 
            s < 1 && requestAnimationFrame(i);
          }));
        }
      }
    }
    function v() {
      o(".r2-rv:not(.r2-in), .r2-stag:not(.r2-in)", e).forEach((function(e) {
        var t = e.getBoundingClientRect();
        t.top < .92 * window.innerHeight && t.bottom > 0 && (e.classList.add("r2-in"), o("b, strong, [data-sf-count]", e).filter((function(e) {
          return d.indexOf(e) > -1;
        })).forEach(h));
      }));
    }
  })), SFUI.register("r2Press", (function() {
    var t = i(".sf-ab-press");
    if (t && SFUI.once(t, "R2Press")) {
      var r = e.press || [ [ "g-o", "“시니어 산업 실무 교육”… 시니어퓨처, 누적 수강생 2천 명 돌파", "2026-10-11" ], [ "g-b", "시니어퓨처, 지자체와 시니어 창업 교육 협약", "2026-09-29" ], [ "g-d", "5060 고객을 이해하는 법, 현업 전문가에게 배운다", "2026-09-18" ], [ "g-g", "요양기관 원장 네트워킹 모임, 3기까지 이어진 이유", "2026-08-30" ], [ "g-o", "에이지테크 스타트업과 요양 현장을 잇는 실증 프로그램", "2026-08-12" ], [ "g-b", "시니어 산업 인사이트 뉴스레터, 구독자 1만 명 넘어", "2026-07-21" ] ].map((function(e) {
        return {
          g: e[0],
          t: e[1],
          d: e[2]
        };
      })), n = document.createElement("section");
      n.className = "r2-press", n.setAttribute("aria-labelledby", "r2-press-h"), n.innerHTML = '<div class="r2-press__head"><h2 id="r2-press-h">언론에 소개된 시니어퓨처</h2><div class="r2-press__ctl"><span class="r2-press__arr"><button type="button" data-r2-prev aria-label="이전 기사"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" data-r2-next aria-label="다음 기사">' + c + '</button></span><a class="r2-press__all" href="' + (e.pressHref || "#") + '"' + (e.pressHref ? "" : " data-sf-link-later") + '>보도자료 보러 가기 <span aria-hidden="true">→</span></a></div></div><div class="r2-press__track" tabindex="0" aria-label="언론 기사 목록">' + r.map((function(e) {
        var t = e.img ? '<img src="' + e.img + '" alt="">' : e.o ? '<span class="r2-press__ph is-outlet ' + (e.g || "g-o") + '"><b>' + s(e.o) + "</b><small>" + s(e.d) + "</small></span>" : '<span class="r2-press__ph ' + (e.g || "g-o") + '">' + s(e.t) + "<small>예시 이미지 · 실제 기사 사진으로 바꿔 주세요</small></span>";
        return '<a class="r2-press__card" href="' + (e.href || "#") + '"' + (e.href ? ' target="_blank" rel="noopener"' : " data-sf-link-later") + '><span class="r2-press__thumb">' + t + "</span><strong>" + s(e.t) + "</strong><time>" + s(e.d) + "</time></a>";
      })).join("") + "</div>", t.parentNode.replaceChild(n, t);
      var o = i(".r2-press__track", n);
      i("[data-r2-prev]", n).addEventListener("click", (function() {
        l(-1);
      })), i("[data-r2-next]", n).addEventListener("click", (function() {
        l(1);
      })), o.addEventListener("scroll", d, {
        passive: !0
      }), d(), document.addEventListener("click", (function(e) {
        e.target.closest && e.target.closest(".r2-press [data-sf-link-later]") && (e.preventDefault(), 
        SFUI.toast && SFUI.toast("기사 링크는 곧 연결돼요"));
      }));
    }
    function l(e) {
      var t = o.children[0], r = t ? t.getBoundingClientRect().width + 24 : 300;
      o.scrollBy({
        left: e * r,
        behavior: a ? "auto" : "smooth"
      });
    }
    function d() {
      i("[data-r2-prev]", n).disabled = o.scrollLeft < 4, i("[data-r2-next]", n).disabled = o.scrollLeft > o.scrollWidth - o.clientWidth - 4;
    }
  })), SFUI.register("r2My", (function() {
    if (document.body.classList.contains("shop_mypage")) {
      var e = i(".shop-content.mypage .row.show-grid"), t = e && e.querySelector(".col-md-10");
      if (e && t && SFUI.once(e, "R2My")) {
        n.classList.add("r2-my");
        var a = r.get("m2") || "", c = r.get("sf") || (a ? "" : "orders"), l = document.getElementById("mypage-summary"), f = l && (l.textContent.match(/([^\s]+)\s*님/) || [])[1] || "", u = (l && (l.textContent.match(/([\d,]+)\s*원/) || [])[1], 
        c ? "sf=" + c : "m2=" + a), p = o(".shop-content.mypage .left-menu a").filter((function(e) {
          return /탈퇴/.test(e.textContent);
        }))[0], m = p && p.getAttribute("href") || "#", h = [ [ "학습", [ [ "결제 내역", "/shop_mypage/?sf=orders", "sf=orders" ], [ "찜한 내역", "/shop_mypage/?m2=wish_list", "m2=wish_list" ], [ "열람 내역", "/shop_mypage/?sf=recent", "sf=recent" ] ] ], [ "계정", [ [ "로그아웃", "/logout.cm?back_url=Lw==", "out" ], [ "회원탈퇴", m, "leave" ] ] ] ], v = [];
        h.forEach((function(e) {
          e[1].forEach((function(e) {
            v.push(e);
          }));
        }));
        var g = '<div class="r2-my-card"><span class="r2-my-av"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg></span><div class="r2-my-who"><b>' + s(f || "회원") + '</b><p class="r2-my-intro"></p></div><a class="r2-my-edit" href="/shop_mypage/?sf=profile">프로필 수정</a></div>', b = {
          order: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
          wish: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
          bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>',
          eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
        }, y = '<nav class="r2-my-quick" aria-label="바로가기">' + [ [ "결제 내역", "/shop_mypage/?sf=orders", "order", "sf=orders" ], [ "찜한 내역", "/shop_mypage/?m2=wish_list", "wish", "m2=wish_list" ], [ "열람 내역", "/shop_mypage/?sf=recent", "eye", "sf=recent" ] ].map((function(e) {
          return '<a href="' + e[1] + '"' + (e[3] === u ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + b[e[2]] + "</svg><span>" + e[0] + "</span></a>";
        })).join("") + "</nav>", w = document.createElement("aside");
        w.className = "r2-my-side", w.innerHTML = g + h.map((function(e) {
          return '<nav aria-label="' + e[0] + '"><small>' + e[0] + "</small>" + e[1].map(k).join("") + "</nav>";
        })).join(""), e.insertBefore(w, e.firstChild);
        var _ = document.createElement("div");
        _.className = "r2-my-mob", _.innerHTML = g + y, t.insertBefore(_, t.firstChild);
        var E = document.createElement("nav");
        E.className = "r2-my-acct", E.setAttribute("aria-label", "계정"), E.innerHTML = [ [ "로그아웃", "/logout.cm?back_url=Lw==", "out" ], [ "회원탈퇴", m, "leave" ] ].map(k).join(""), 
        p && o('a[data-k="leave"]').forEach((function(e) {
          e.addEventListener("click", (function(e) {
            0 !== m.indexOf("javascript") && "#" !== m || (e.preventDefault(), p.click());
          }));
        })), t.appendChild(E), o('.r2-my-acct a[data-k="kakao"]').forEach(d), fetch("/dialog/join.cm", {
          credentials: "same-origin"
        }).then((function(e) {
          return e.text();
        })).then((function(e) {
          var t = (new DOMParser).parseFromString(e, "text/html"), r = (t.querySelector("input[name=photo]") || {}).value || "", a = {};
          o('input[name="join_form[]"]', t).forEach((function(e) {
            var r = e.closest(".input_block, .form-group"), n = r && r.querySelector(".mini-tit, label"), i = t.querySelector('[name="join_form_' + e.value + '"]');
            n && i && i.value && (a[n.textContent.replace(/\s+|필수입력/g, "")] = i.value);
          }));
          var n = a["한줄소개"] || [ a["직무"] || a["직군"], a["소속"] ].filter(Boolean).join(" · ");
          o(".r2-my-intro").forEach((function(e) {
            e.textContent = n || "한 줄 소개를 적어 보세요", e.classList.toggle("is-empty", !n);
          })), r && !/default_profile/.test(r) && o(".r2-my-av").forEach((function(e) {
            e.innerHTML = '<img src="' + r.replace(/"/g, "") + '" alt="">';
          }));
        })).catch((function() {})), o('.r2-my-side a[data-k="kakao"], .r2-my-chips a[data-k="kakao"]').forEach(d);
        var L = _.querySelector("[aria-current]");
        if (L && L.scrollIntoView) L.parentNode.scrollLeft = L.offsetLeft - 16;
        if (c) {
          var S = document.createElement("section");
          if (S.className = "r2-my-pane", t.appendChild(S), n.classList.add("r2-my-own"), 
          "class" === c && (S.innerHTML = '<h2 class="r2-my-h">내 강의</h2><div class="r2-my-load">불러오는 중…</div>', 
          fetch("/classroom", {
            credentials: "same-origin"
          }).then((function(e) {
            return e.text();
          })).then((function(e) {
            var t = (new DOMParser).parseFromString(e, "text/html"), r = t.querySelector(".sf-hub"), a = r && r.closest("._widget_data");
            if (!a) throw 0;
            o(".sf-hub > h1, .sf-hub > h1 + p", a).forEach((function(e) {
              e.remove();
            }));
            var n = document.createElement("div");
            n.className = "r2-my-class", o("style", t).forEach((function(e) {
              if (/\.sf-hub/.test(e.textContent) && !document.getElementById("r2-hub-css")) {
                var t = document.createElement("style");
                t.id = "r2-hub-css", t.textContent = e.textContent, document.head.appendChild(t);
              }
            })), [].forEach.call(a.children, (function(e) {
              n.appendChild(document.importNode(e, !0));
            })), o("p, span", n).forEach((function(e) {
              !e.children.length && e.textContent.indexOf("강사 윤미래") > -1 && (e.textContent = e.textContent.replace("강사 윤미래", "강사 김지현"));
            })), S.querySelector(".r2-my-load").replaceWith(n), SFUI.init(n);
          })).catch((function() {
            S.querySelector(".r2-my-load").innerHTML = '강의 목록을 불러오지 못했어요. <a href="/classroom">나의 강의실에서 보기</a>';
          }))), "orders" === c && (S.innerHTML = '<h2 class="r2-my-h">결제 내역</h2><div class="r3-orders" data-sf-orders><div class="r2-my-load">불러오는 중…</div></div>'), 
          "recent" === c) {
            var x = [];
            try {
              x = JSON.parse(localStorage.getItem("sf_recent") || "[]");
            } catch (e) {}
            S.innerHTML = '<h2 class="r2-my-h">열람 내역</h2>' + (x.length ? '<ul class="r2-my-recent">' + x.map((function(e) {
              return '<li><a href="' + e.u + '"><span class="r2-my-recent__th"' + (e.img ? ' style="background-image:url(' + encodeURI(String(e.img)).replace(/[()'"]/g, "") + ')"' : "") + "></span><span><small>" + s(e.k || "") + "</small><b>" + s(e.n || "") + "</b></span></a></li>";
            })).join("") + '</ul><p class="r2-my-note">최근 본 강의·라이브·모임 20개까지 이 기기에 보관돼요.</p>' : '<div class="r2-my-load">아직 본 강의가 없어요. <a href="/course">교육 둘러보기</a></div>');
          }
          "profile" === c && q(), o(".r2-my-edit").forEach((function(e) {
            e.addEventListener("click", (function(e) {
              if (S && !e.metaKey && !e.ctrlKey) if (e.preventDefault(), S.querySelector(".r2-prof")) S.scrollIntoView({
                behavior: "smooth",
                block: "start"
              }); else {
                try {
                  history.pushState(null, "", "/shop_mypage/?sf=profile");
                } catch (e) {}
                o(".r2-my-quick a[aria-current], .r2-my-side a[aria-current]").forEach((function(e) {
                  e.removeAttribute("aria-current");
                })), q();
                var t = S.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({
                  top: t,
                  behavior: "smooth"
                });
              }
            }));
          }));
        }
      }
    }
    function k(e) {
      return '<a href="' + e[1] + '" data-k="' + e[2] + '"' + (e[2] === u ? ' aria-current="page"' : "") + ">" + e[0] + "</a>";
    }
    function q() {
      S.innerHTML = '<h2 class="r2-my-h">프로필 설정</h2><div class="r2-prof"><div class="r2-prof-skel" aria-label="불러오는 중"><i class="is-av"></i><i></i><i></i><i></i><i></i><i></i></div></div>', 
      n.classList.add("r2-prof-wait");
      var e = S.querySelector(".r2-prof"), t = 0;
      !function r() {
        var a = i(".modal_site_join"), s = a && a.querySelector("article.modal_article");
        if (!s) return t % 5 == 0 && window.SITE_MEMBER && SITE_MEMBER.editProfile && SITE_MEMBER.editProfile(btoa("/shop_mypage/?sf=profile")), 
        ++t < 150 ? setTimeout(r, 100) : (n.classList.remove("r2-prof-wait"), void (e.innerHTML = "프로필을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요."));
        e.innerHTML = "", e.appendChild(s), setTimeout((function() {
          n.classList.remove("r2-prof-wait");
        }), 50), a.style.display = "none", a.classList.remove("in"), o(".modal-backdrop").forEach((function(e) {
          e.remove();
        })), document.body.classList.remove("modal-open"), document.body.style.paddingRight = "", 
        [ 0, 300, 1e3, 2500 ].forEach((function(e) {
          setTimeout((function() {
            n.classList.remove("modal-scroll-control");
          }), e);
        }));
        var c = s.querySelector("form");
        if (c) {
          var l = O("input[name=uid]"), d = (O("input[name=passwd_org]"), O("#join_name")), f = O("#join_callnum");
          if (l) {
            l.classList.add("r2-prof-pw");
            var u = l.querySelector("input[name=uid]");
            u && u.classList.add("r2-hide"), d && l.parentNode.insertBefore(d, l.nextSibling), 
            W(d || l, "기본 정보"), f && l.parentNode.insertBefore(f, (d || l).nextSibling);
            var p = document.createElement("button");
            p.type = "button", p.className = "r2-pw-toggle", p.textContent = "비밀번호 변경", p.setAttribute("aria-expanded", "false"), 
            p.addEventListener("click", (function() {
              l.classList.toggle("is-open"), p.setAttribute("aria-expanded", String(l.classList.contains("is-open")));
            }));
            var m = f || d || l;
            m.parentNode.insertBefore(p, m.nextSibling);
          }
          o("select", c).forEach((function(e) {
            if (!/^birth_/.test(e.name) && ![].some.call(e.options, (function(e) {
              return e.defaultSelected;
            })) && !e.querySelector('option[value=""]')) {
              var t = document.createElement("option");
              t.value = "", t.textContent = "선택해 주세요", e.insertBefore(t, e.firstChild), e.value = "";
            }
          }));
          var h = D("소속"), v = D("직무") || D("직군"), g = D("경력");
          if (g && g.classList.add("r2-hide"), h && v && v.parentNode.insertBefore(h, v), 
          W(h || v, "직무 정보", "맞춤 강의 추천에 쓰여요 (선택)"), v) {
            var b = v.querySelector(".mini-tit, label");
            b && /직군/.test(b.textContent) && (b.textContent = "직무");
            var y = v.querySelector("input");
            y && !y.placeholder && (y.placeholder = "예: 요양원 운영, 시니어 마케팅");
          }
          if (h) {
            var w = h.querySelector("input");
            w && !w.placeholder && (w.placeholder = "예: 시니어퓨처");
          }
          [ "input[name=gender]", "#join_addr", "#birth_y" ].forEach((function(e) {
            var t = O(e);
            t && t.classList.add("r2-hide");
          }));
          var _ = D("관심분야");
          _ && _.classList.add("r2-hide");
          var E = O("#join_home_page");
          if (E) {
            var L = E.querySelector(".mini-tit, label");
            L && (L.textContent = "링크 (블로그·링크드인)");
            var S = E.querySelector("input");
            S && (S.placeholder = "https://");
            var x = v || h;
            x && x.parentNode.insertBefore(E, x.nextSibling);
          }
          var k = D("마케팅수신동의");
          if (k) {
            var q = o("input[type=radio]", k).filter((function(e) {
              return "동의" === e.value;
            }))[0], M = o("input[type=radio]", k).filter((function(e) {
              return "동의" !== e.value;
            }))[0];
            if (q && M) {
              k.classList.add("r2-hide");
              var C = document.createElement("div");
              C.className = "r2-noti", C.innerHTML = '<div class="r2-prof-h">알림 설정</div><label class="r2-noti__row"><span><b>마케팅 정보 수신 동의</b><small>강의·라이브·이벤트 소식을 이메일·문자로 받아요. 언제든 끌 수 있어요.</small></span><input type="checkbox" class="r2-switch" role="switch"' + (q.checked ? " checked" : "") + "></label>";
              var T = C.querySelector("input");
              T.setAttribute("aria-checked", String(q.checked)), T.addEventListener("change", (function() {
                (T.checked ? q : M).click(), (T.checked ? q : M).checked = !0, T.setAttribute("aria-checked", String(T.checked));
              }));
              var B = E || v || h;
              B && B.parentNode.insertBefore(C, B.nextSibling);
            }
          }
          var A = D("한줄소개");
          if (A && d) {
            d.parentNode.insertBefore(A, d.nextSibling);
            var I = A.querySelector("input, textarea");
            I && (I.placeholder = "예: 요양기관 운영 10년차 · 시니어 주거에 관심");
          }
          var N = c.querySelector("._recommend_code_wrap");
          if (N) {
            var H = N.closest(".form-group");
            H && H.classList.add("r2-hide");
          }
          var F = c.querySelector("._join_btn");
          F && (F.textContent = "저장");
          var U = c.querySelector(".input_form._passwd_org"), R = F && F.closest(".input_block, .form-group");
          if (U && R) {
            var j = document.createElement("div");
            j.className = "input_block form-group r2-prof-cur", j.innerHTML = '<label class="mini-tit">현재 비밀번호 <small>저장할 때 확인용으로 필요해요</small></label>', 
            j.appendChild(U), R.parentNode.insertBefore(j, R);
            var z = U.querySelector("input");
            z && (z.placeholder = "현재 비밀번호");
            var P = c.querySelector("input[name=passwd]");
            P && (P.placeholder = "새 비밀번호 (바꿀 때만)");
          }
        }
        function O(e) {
          var t = c.querySelector(e);
          return t && t.closest(".input_block, .form-group");
        }
        function D(e) {
          var t = null;
          return o(".input_block", c).some((function(r) {
            var a = r.querySelector(".mini-tit, label");
            if (a && 0 === a.textContent.replace(/\s/g, "").indexOf(e)) return t = r, !0;
          })), t;
        }
        function W(e, t, r) {
          if (e) {
            var a = document.createElement("div");
            a.className = "r2-prof-h", a.innerHTML = t + (r ? " <small>" + r + "</small>" : ""), 
            e.parentNode.insertBefore(a, e);
          }
        }
      }();
    }
  })), SFUI.register("r2Help", (function() {
    if (/^\/help/.test(t) && !r.get("bmode")) {
      var e = i(".sf-help");
      if (e && SFUI.once(e, "R2Help")) {
        n.classList.add("r2-help");
        var s = i(".sf-help-tabs", e);
        s && (o("a", s).forEach((function(e) {
          e.hasAttribute("data-sf-kakao-channel") && e.remove();
        })), s.setAttribute("role", "tablist"), s.removeAttribute("data-sf-anchor-tabs"));
        var c = o(".sf-help-card", e);
        c[0] && (c[0].querySelector("b").textContent = "1:1 문의", c[0].querySelector("small").textContent = "카카오톡 채널로 바로 연결 · 확인되는 대로 답변드려요", 
        c[0].removeAttribute("data-sf-kakao-channel"), d(c[0])), c[1] && (c[1].removeAttribute("data-sf-kakao-channel"), 
        d(c[1])), o(".sf-help-more a", e).forEach((function(e) {
          e.textContent = "1:1 문의하기", e.removeAttribute("data-sf-kakao-channel"), d(e);
        }));
        var l = i('[data-widget-type="board"]'), f = l && (l.closest('[doz_type="widget"]') || l);
        s && s.addEventListener("click", (function(e) {
          var t = e.target.closest('a[href^="#"]');
          if (t) {
            e.preventDefault(), e.stopImmediatePropagation();
            var r = t.getAttribute("href").slice(1);
            v(r), history.replaceState(null, "", "#" + r);
          }
        }), !0), v(/notice/.test(location.hash) || /keyword=|page=/.test(location.search) ? "notice" : "faq"), 
        window.addEventListener("hashchange", (function() {
          if (/^#(notice|faq)$/.test(location.hash)) {
            v(location.hash.slice(1));
            var e = i(".sf-help-tabs");
            e && e.scrollIntoView({
              block: "start"
            });
          }
        })), document.addEventListener("click", (function(e) {
          var t = e.target.closest && e.target.closest('a[href="/help#notice"], a[href="/help#faq"]');
          if (t) {
            e.preventDefault(), history.replaceState(null, "", t.getAttribute("href").slice(5)), 
            v(t.getAttribute("href").slice(6));
            var r = i(".sf-help-tabs");
            r && window.scrollTo({
              top: r.getBoundingClientRect().top + window.scrollY - 120,
              behavior: a ? "auto" : "smooth"
            });
          }
        }));
        var u = i('[data-widget-type="board"] .li_board');
        if (u && !u.classList.contains("r2-ntable")) {
          u.classList.add("r2-ntable");
          var p = u.querySelector(".li_header");
          p && (p.innerHTML = '<li class="tit">공지사항</li><li class="r2-pin-h"></li><li class="date">날짜</li>'), 
          o("ul.li_body", u).forEach((function(e) {
            var t = e.querySelector("li.time"), r = t && /^(\d{4}-\d{2}-\d{2})/.exec(t.getAttribute("title") || "");
            if (r && (t.textContent = r[1]), e.classList.contains("is-pin") && !e.querySelector(".r2-pin")) {
              var a = document.createElement("li");
              a.className = "r2-pin", a.setAttribute("aria-label", "고정 공지"), a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l-1 5 3 3H7l3-3-1-5zM12 12v8"/></svg>', 
              e.insertBefore(a, t);
            }
          }));
          var m = o("ul.li_body", u).filter((function(e) {
            return !e.hidden;
          }));
          if (m.length > 5 && !u.querySelector(".r2-nmore")) {
            m.slice(5).forEach((function(e) {
              e.classList.add("r2-nfold");
            })), n.classList.add("r2-nfolded");
            var h = document.createElement("button");
            h.type = "button", h.className = "r2-nmore", h.setAttribute("aria-expanded", "false"), 
            h.innerHTML = "공지사항 전체 보기 <span>(" + m.length + ")</span>", h.addEventListener("click", (function() {
              var e = !1 === n.classList.toggle("r2-nfolded");
              h.setAttribute("aria-expanded", String(e)), h.innerHTML = e ? "접기" : "공지사항 전체 보기 <span>(" + m.length + ")</span>";
            })), u.parentNode.insertBefore(h, u.nextSibling);
          }
        }
      }
    }
    function v(e) {
      n.classList.toggle("r2-help-notice", "notice" === e), n.classList.toggle("r2-help-faq", "notice" !== e), 
      s && o("a", s).forEach((function(t) {
        var r = t.getAttribute("href") === "#" + e;
        t.classList.toggle("is-active", r), t.setAttribute("role", "tab"), t.setAttribute("aria-selected", String(r));
      })), f && (f.hidden = "notice" !== e);
    }
  }));
})()
