// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
(function() {
  var t, e = window.SF_SITE || {};
  function n(t, e) {
    return (e || document).querySelector(t);
  }
  function a(t, e) {
    return [].slice.call((e || document).querySelectorAll(t));
  }
  function r(t) {
    var e = document.createElement("div");
    return e.textContent = t, e.innerHTML;
  }
  (t = document.getElementById("sf-patch-css")) && t.textContent.indexOf("r3-early-shop") < 0 && (t.textContent += " /*r3-early-shop*/.iw-shop-card[data-kind] .iw-shop-product-summary{display:none!important}");
  var s = {
    base: 10,
    byIdx: {}
  }, i = window.MEMBER_HASH ? "P" + String(window.MEMBER_HASH).slice(0, 7).toUpperCase() : null;
  var o, c, l = new URLSearchParams(location.search).get("idx");
  window.SF_SHARE = Object.assign({}, window.SF_SHARE || {}, {
    member: i,
    rate: (o = l, c = s.byIdx[o], (null == c ? s.base : c) + "%")
  });
  function d(t) {
    a("._post_item_wrap .card-summary", t).forEach((function(t) {
      if (!t.getAttribute("data-r3-meta")) {
        t.setAttribute("data-r3-meta", "1");
        var e = t.closest("._post_item_wrap"), n = t.querySelector(".writer"), a = t.querySelector(".date");
        if (n) {
          var r = e ? e.textContent : "", s = n.textContent.trim();
          n.textContent = /정동호 대표 칼럼/.test(r) ? "정동호 대표" : !s || /관리자|admin/i.test(s) ? "시니어퓨처" : s;
        }
        if (a) {
          var i = (a.getAttribute("title") || "").match(/(\d{4})-(\d{2})-(\d{2})/);
          i && (a.textContent = i[1] + "." + i[2] + "." + i[3]);
        }
      }
    }));
  }
  SFUI.register("r3ShareText", (function() {
    a(".sf-pv-share").forEach((function(t) {
      if (SFUI.once(t, "R3RATE")) {
        var e = t.firstElementChild;
        if (e && "BUTTON" !== e.tagName) {
          t.classList.add("r3-rsh");
          var a = n(".sf-pv-share__btn", t);
          a && (a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.6l-1.2 1.1"/><path d="M14 10.5a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.6l1.1-1.1"/></svg><span>링크 복사</span>', 
          a.setAttribute("aria-label", "내 추천 링크 복사")), e.className = "r3-rsh__t", e.innerHTML = '<i class="r3-rsh__coin" aria-hidden="true">P</i><div><strong>친구에게 추천하고 수익 받기</strong><a class="r3-rsh__more" href="/partners">어떻게 받나요? 자세히 보기 ›</a></div>';
        }
      }
    }));
  })), SFUI.register("r3PvTabs", (function() {
    var t = n(".sf-pv-tabs");
    if (t && SFUI.once(t, "R3Tabs")) {
      var e = 0;
      t.addEventListener("click", (function(t) {
        var n = t.target.closest && t.target.closest('a[href^="#"]');
        if (n) {
          var a = document.getElementById(n.getAttribute("href").slice(1));
          a && (t.preventDefault(), t.stopImmediatePropagation(), s(n), e = Date.now() + 1200, 
          window.scrollTo({
            top: Math.max(0, a.getBoundingClientRect().top + window.scrollY - r() + 1),
            behavior: "smooth"
          }), setTimeout((function() {
            e = 0, i();
          }), 1250));
        }
      }), !0), window.addEventListener("scroll", i, {
        passive: !0
      }), i(), setTimeout(i, 300);
    }
    function r() {
      var e = parseFloat(getComputedStyle(t).top);
      return (isNaN(e) ? 0 : e) + t.offsetHeight + 16;
    }
    function s(e) {
      a("a", t).forEach((function(t) {
        var n = t === e;
        t.classList.toggle("is-active", n), n ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current");
      }));
    }
    function i() {
      if (!(Date.now() < e)) {
        var n = a('a[href^="#"]', t).filter((function(t) {
          return null !== t.offsetParent;
        })), i = 0, o = r();
        n.forEach((function(t, e) {
          var n = document.getElementById(t.getAttribute("href").slice(1));
          n && null !== n.offsetParent && n.getBoundingClientRect().top - o <= 4 && (i = e);
        })), window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && (i = n.length - 1), 
        s(n[i]);
      }
    }
  })), SFUI.register("r3Footer", (function() {
    var t = n(".sf-ft");
    if (t && SFUI.once(t, "R3")) {
      var a = e.channels || [], s = n(".sf-ft-sns", t);
      if (s && s.remove(), a.length) {
        var i = document.createElement("nav");
        i.className = "r3-ft-ch", i.setAttribute("aria-label", "시니어퓨처 채널"), i.innerHTML = a.map((function(t) {
          return '<a href="' + t[1] + '" target="_blank" rel="noopener">' + r(t[0]) + "</a>";
        })).join(""), t.appendChild(i);
      }
      var o = e.company;
      if (o) {
        var c = document.createElement("p");
        c.className = "r3-ft-co", c.innerHTML = [ r(o.name), "대표 " + r(o.ceo), "사업자등록번호 " + r(o.biz), "통신판매업신고 " + r(o.report), "소재지 " + r(o.addr), "개인정보관리책임자 " + r(o.ceo), "호스팅제공자 (주)아임웹", "문의 " + r(o.tel || ""), '<a href="mailto:' + o.mail + '">' + r(o.mail) + "</a>" ].map((function(t) {
          return "<span>" + t + "</span>";
        })).join('<i aria-hidden="true">·</i>'), t.appendChild(c);
      }
    }
  })), SFUI.register("r3ReviewFlow", (function() {
    var t = n(".sf-home-review [data-sf-carousel]");
    if (t && SFUI.once(t, "R3Flow")) {
      var e = n("[data-sf-track]", t);
      if (e && !(e.children.length < 2)) {
        var r = [].slice.call(e.children), s = document.createElement("div");
        s.className = "r3-flow";
        var i = document.createElement("div");
        i.className = "r3-flow__row", r.forEach((function(t) {
          i.appendChild(t);
        }));
        var o = r.slice();
        s.appendChild(i), e.parentNode.insertBefore(s, e.nextSibling);
        for (var c = function() {
          return i.scrollWidth;
        }; c() < 1.2 * window.innerWidth && o.length < 40; ) r.forEach((function(t) {
          var e = t.cloneNode(!0);
          e.setAttribute("aria-hidden", "true"), a("a", e).forEach((function(t) {
            t.setAttribute("tabindex", "-1");
          })), i.appendChild(e), o.push(e);
        }));
        o.forEach((function(t) {
          var e = t.cloneNode(!0);
          e.setAttribute("aria-hidden", "true"), a("a", e).forEach((function(t) {
            t.setAttribute("tabindex", "-1");
          })), i.appendChild(e);
        }));
        var l = parseFloat(getComputedStyle(i).columnGap) || 0, d = (c() + l) / 2;
        e.style.display = "none", a("[data-sf-prev], [data-sf-next], [data-sf-pager]", t).forEach((function(t) {
          t.style.display = "none";
        })), t.removeAttribute("data-autoplay");
        var u, f = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, p = 0, m = !1, h = 0;
        if (s.addEventListener("touchstart", b, {
          passive: !0
        }), s.addEventListener("touchend", _, {
          passive: !0
        }), s.addEventListener("pointerdown", b), s.addEventListener("mouseenter", b), s.addEventListener("mouseleave", _), 
        s.addEventListener("focusin", b), s.addEventListener("focusout", _), s.addEventListener("scroll", (function() {
          m && (s.scrollLeft >= d ? s.scrollLeft -= d : s.scrollLeft <= 0 && (s.scrollLeft += d), 
          p = s.scrollLeft);
        }), {
          passive: !0
        }), !f) {
          var v = 0, g = !0;
          window.addEventListener("scroll", (function() {
            v = performance.now();
          }), {
            passive: !0
          }), "IntersectionObserver" in window && new IntersectionObserver((function(t) {
            g = t[0].isIntersecting;
          })).observe(s), function t(e) {
            h && !m && !document.hidden && g && e - v > 400 && ((p += 40 * Math.min(.05, (e - h) / 1e3)) >= d && (p -= d), 
            s.scrollLeft = p), h = e, requestAnimationFrame(t);
          }(0);
        }
      }
    }
    function b() {
      m = !0, clearTimeout(u);
    }
    function _() {
      clearTimeout(u), u = setTimeout((function() {
        m = !1, p = s.scrollLeft;
      }), 1500);
    }
  })), SFUI.register("r3InsightAll", (function() {
    var t = location.pathname, e = new URLSearchParams(location.search);
    if (/^\/insight/.test(t) && !e.get("bmode")) {
      var r = n("[data-sf-board-filter]");
      if (r && SFUI.once(r, "R3All")) {
        var s = null, i = [];
        r.addEventListener("click", (function() {
          requestAnimationFrame(l); // (10/26) 다음 그림 전에 채움 — 줄었다 커지던 것 없앰
        })), setTimeout((function() {
          l(), c(); // 다른 페이지 글을 미리 받아 둬서 분류를 처음 눌러도 바로 채워져요
        }), 700);
      }
    }
    function o(t) {
      var e = t.querySelector('a[href*="idx="]'), n = e && e.getAttribute("href").match(/[?&]idx=(\d+)/);
      return n ? n[1] : "";
    }
    function c() {
      if (s) return Promise.resolve(s);
      for (var n = function() {
        var t = 1;
        return a('[data-widget-type="board"] .pagination a').forEach((function(e) {
          var n = parseInt(e.textContent, 10);
          n > t && (t = n);
        })), t;
      }(), r = [], i = e.get("preview_mode") ? "&preview_mode=1" : "", o = 1; o <= n; o++) r.push(fetch(t.replace(/\/?$/, "/") + "?page=" + o + i, {
        credentials: "same-origin"
      }).then((function(t) {
        return t.text();
      })).catch((function() {
        return "";
      })));
      return Promise.all(r).then((function(t) {
        return s = [], t.forEach((function(t) {
          a('[data-widget-type="board"] ._card_wrap', (new DOMParser).parseFromString(t, "text/html")).forEach((function(t) {
            s.push(t);
          }));
        })), s;
      }));
    }
    function l() {
      i.forEach((function(t) {
        t.remove();
      })), i = [];
      var t = r.querySelector("[data-cat].is-active"), e = t ? t.getAttribute("data-cat") : "all";
      a('[data-widget-type="board"] .paging-block, [data-widget-type="board"] .pagination').forEach((function(t) {
        t.style.display = "none"; // (10/26) 페이지 번호 없이 전체 글을 한 번에
      }));
      var s = function() {
        a('[data-widget-type="board"] ._card_wrap').forEach((function(t) {
          var e = t.querySelector("._post_item_wrap");
          t.style.display = e && e.classList.contains("sf-hidden") ? "none" : "";
        }));
      };
      s(), setTimeout(s, 300), setTimeout(s, 1e3), c().then((function(t) {
        var s, c = (s = a('[data-widget-type="board"] ._post_row'))[s.length - 1] || n('[data-widget-type="board"] ._list_wrap .list-style');
        if (c && ((r.querySelector("[data-cat].is-active") || {}).getAttribute ? r.querySelector("[data-cat].is-active").getAttribute("data-cat") : "all") === e) {
          var l = {};
          a('[data-widget-type="board"] ._post_item_wrap').forEach((function(t) {
            t.classList.contains("sf-hidden") || (l[o(t)] = 1);
          })), t.forEach((function(t) {
            var n = t.querySelector("._post_item_wrap");
            if (n) {
              var r = o(n);
              if (r && !l[r]) {
                var s = (n.querySelector(".title em:not(.notice-block):not(.addon-badge)") || {}).textContent;
                if ("all" === e || s && s.trim() === e) {
                  l[r] = 1;
                  var u = document.importNode(t, !0);
                  u.classList.add("r3-ins-more"), u.style.display = "", a('[style*="display"]', u).forEach((function(t) {
                    /display:\s*none/.test(t.getAttribute("style")) && (t.style.display = "");
                  })), a("img[data-src]", u).forEach((function(t) {
                    t.getAttribute("src") && !/blank|data:/.test(t.getAttribute("src")) || (t.src = t.getAttribute("data-src"));
                  })), a(".sf-hidden", u).forEach((function(t) {
                    t.classList.remove("sf-hidden");
                  })), function(t) {
                    var e = t.querySelector(".title");
                    if (e && !e.querySelector(".r2-ttl")) {
                      var n = e.querySelector("em:not(.notice-block):not(.addon-badge)"), a = "";
                      if ([].slice.call(e.childNodes).forEach((function(t) {
                        3 === t.nodeType && t.textContent.trim() && (a += t.textContent, t.remove());
                      })), n) {
                        var r = document.createElement("div");
                        r.className = "r2-icat", r.textContent = n.textContent.trim(), e.parentNode.insertBefore(r, e);
                      }
                      var s = document.createElement("span");
                      s.className = "r2-ttl", s.textContent = a.trim(), e.appendChild(s);
                    }
                  }(u.querySelector("._post_item_wrap") || u), c.appendChild(u), i.push(u), d(u);
                }
              }
            }
          }));
          var u = a('[data-widget-type="board"] ._post_item_wrap').filter((function(t) {
            return !t.classList.contains("sf-hidden") && function(t) {
              var e = t.querySelector(".title em:not(.notice-block):not(.addon-badge)");
              return e ? e.textContent.trim() : "";
            }(t) === e;
          })).length;
          a(".r2-count").forEach((function(t) {
            t.textContent = u + "개의 글";
          }));
          var f = document.getElementById("sf-board-empty");
          f && (f.hidden = u > 0);
        }
      }));
    }
  })), SFUI.register("r3InsightMeta", (function() {
    d(document), setTimeout((function() {
      d(document);
    }), 800), setTimeout((function() {
      d(document);
    }), 2500);
  })), function() {
    function t() {
      document.querySelector(".sf-nav-edu .sf-navdrop:not(.sf-hidden)") && a(".sf-nav-edu").forEach((function(t) {
        var e = t.querySelector(".sf-navdrop"), n = t.querySelector("a");
        e && e.classList.add("sf-hidden"), n && n.setAttribute("aria-expanded", "false");
      }));
    }
    window.addEventListener("wheel", t, {
      passive: !0
    }), window.addEventListener("scroll", t, {
      passive: !0
    }), window.addEventListener("touchmove", t, {
      passive: !0
    });
  }();
  var u = '.r3-live-at{position:absolute;left:12px;top:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px 0 10px;border-radius:999px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);color:#1a1c20;font:700 13px/1 Pretendard,"Noto Sans KR",sans-serif;letter-spacing:-.01em;white-space:nowrap;pointer-events:none}.r3-live-at i{width:8px;height:8px;border-radius:50%;background:#ff3b30}[data-sf-live] [data-sf-live-btn]{display:flex!important;align-items:center;justify-content:center;height:36px!important;min-height:0!important;margin-top:16px;padding:0 12px!important;border:1px solid #d5d9e0!important;border-radius:6px!important;background:#fff!important;box-shadow:none!important;color:#1a1c20!important;font:600 14px/1 Pretendard,"Noto Sans KR",sans-serif!important;text-decoration:none!important;transition:background .15s ease,border-color .15s ease}[data-sf-live]>.iw-shop-body{margin-bottom:16px!important}[data-sf-live] [data-sf-live-btn]:hover{background:#f7f8fa!important;border-color:#c4c9d2!important}[data-sf-live][data-status="live"] [data-sf-live-btn]{background:#ff6f0f!important;border-color:#ff6f0f!important;color:#fff!important}[data-sf-live][data-status="ended"] [data-sf-live-btn],[data-sf-live] [data-sf-live-btn].is-replay{background:#f2f3f6!important;border-color:#f2f3f6!important;color:#4b5060!important}@media (max-width:767px){.sf-shop.sf-shop--list.sf-shop--live .iw-shop-grid.iw-shop-grid,.sf-shop.sf-shop--list.sf-shop--meet .iw-shop-grid.iw-shop-grid{grid-auto-flow:row!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-columns:auto!important;gap:24px 12px!important;overflow:visible!important;margin:0!important;padding:0!important}.sf-shop--live .iw-shop-product-name,.sf-shop--meet .iw-shop-product-name{font-size:15px!important}.r3-live-at{left:8px;top:auto;bottom:8px}.sf-shop--list .r3-live-at{left:6px;bottom:6px;height:22px;gap:4px;padding:0 8px 0 7px;font-size:11px}.sf-shop--list .r3-live-at i{width:6px;height:6px}}', f = [ "일", "월", "화", "수", "목", "금", "토" ], p = /\s*\[(?:(\d{4})[\/.\-])?(\d{1,2})[\/.\-](\d{1,2})\s+(\d{1,2}):(\d{2})\]\s*$/;
  function m(t) {
    var e = new Date, n = t[1] ? +t[1] : e.getFullYear(), a = new Date(n, +t[2] - 1, +t[3], +t[4], +t[5]);
    return !t[1] && a.getTime() < e.getTime() - 15552e6 && a.setFullYear(n + 1), isNaN(a.getTime()) ? null : a;
  }
  function h(t) {
    if (!t) return null;
    if (void 0 !== t.__r3d) return t.__r3d;
    for (var e, n = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), a = [], r = null; e = n.nextNode(); ) a.push(e);
    for (var s = a.length - 1; s >= 0; s--) {
      var i = a[s].nodeValue.match(p);
      if (i) {
        r = m(i), a[s].nodeValue = a[s].nodeValue.replace(p, "");
        break;
      }
      if (a[s].nodeValue.trim()) break;
    }
    return t.__r3d = r, r;
  }
  if (window.__sfFixDay = function(t) {
    var e = t && t.start && t.date ? Date.parse(t.start) : NaN;
    if (isNaN(e)) return t;
    var n, a = {};
    for (n in t) a[n] = t[n];
    return a.date = String(t.date).replace(/\(\s*[일월화수목금토]\s*\)/, "(" + "일월화수목금토".charAt(new Date(e + 324e5).getUTCDay()) + ")"), 
    a;
  }, window.SFUI && SFUI.shopItems && !SFUI.shopItems.__r3) {
    var v = SFUI.shopItems;
    SFUI.shopItems = function() {
      var t = v(), e = new URLSearchParams(location.search).get("idx"), n = document.querySelector(".goods_form_wrap .view_tit, .view_tit"), a = e && h(n);
      if (a) {
        var r, s = {}, i = t[e] || {
          type: "live"
        };
        for (r in i) s[r] = i[r];
        s.start = a.toISOString(), s.deadline = s.start, s.end = new Date(a.getTime() + 36e5).toISOString(), 
        t[e] = s;
      }
      for (var o in t) t[o] = window.__sfFixDay(t[o]);
      return t;
    }, SFUI.shopItems.__r3 = 1;
  }
  function g(t) {
    var e = h(t.querySelector(".iw-shop-product-name, span.iw-card-name-link, .sf-ccard__body strong"));
    if (e) return function(t, e) {
      var n = e.toISOString();
      if (t.getAttribute("data-start") === n) return !1;
      delete t.dataset.sfuiBoundLive, t.removeAttribute("data-status"), t.__r3changed = !0, 
      t.setAttribute("data-start", n), t.setAttribute("data-deadline", n), t.setAttribute("data-end", new Date(e.getTime() + 36e5).toISOString());
    }(t, e), e;
    var n = null;
    if (a("[data-at]", t).forEach((function(t) {
      var e = (t.getAttribute("data-at-kind") || "") + " " + t.className;
      !n && /end|close|finish/i.test(e) && (n = t.getAttribute("data-at"));
    })), n && !isNaN(Date.parse(n)) && t.getAttribute("data-start") !== n) {
      var r = Date.parse(n);
      t.setAttribute("data-start", n), t.setAttribute("data-deadline", n), t.setAttribute("data-end", new Date(r + 36e5).toISOString());
    }
    var s = Date.parse(n || t.getAttribute("data-start") || "");
    return isNaN(s) ? null : new Date(s);
  }
  function b(t) {
    var e = !1;
    a("[data-sf-live]", t).forEach((function(t) {
      t.__r3changed && (e = !0, t.__r3changed = !1);
      var n = g(t);
      if (n) {
        var a = t.querySelector(".sf-ccard__thumb, .iw-shop-media, .iw-card-thumb-link");
        if (a) {
          var r = a.querySelector(".r3-live-at");
          r || ((r = document.createElement("span")).className = "r3-live-at", r.setAttribute("aria-label", "라이브 시작"), 
          a.style.position = a.style.position || "relative", a.appendChild(r));
          var s = function(t) {
            var e = function(t) {
              return (t < 10 ? "0" : "") + t;
            };
            return e(t.getMonth() + 1) + "." + e(t.getDate()) + " (" + f[t.getDay()] + ") " + e(t.getHours()) + ":" + e(t.getMinutes());
          }(n);
          r.textContent !== s && (r.innerHTML = '<i aria-hidden="true"></i>' + s), t.__r3changed && (e = !0, 
          t.__r3changed = !1);
        }
      }
    })), e && SFUI.init(t);
  }
  SFUI.register("r3NameTime", (function() {
    h(document.querySelector(".view_tit")), document.title = document.title.replace(/\s*\[(?:\d{4}[\/.\-])?\d{1,2}[\/.\-]\d{1,2}\s+\d{1,2}:\d{2}\](?=\s*(?:[:|]|$))/, "");
  })), SFUI.register("r3Live", (function() {
    if (!n("#r3-live-css")) {
      var t = document.createElement("style");
      t.id = "r3-live-css", t.textContent = u, document.head.appendChild(t);
    }
    b(document);
    var e = 0;
    !function t() {
      a("div.js-custom-widget-container").forEach((function(t) {
        var e = t.shadowRoot;
        if (e) {
          if (!e.getElementById("r3-live-css")) {
            var n = document.createElement("style");
            n.id = "r3-live-css", n.textContent = u, e.appendChild(n);
          }
          b(e), a(".iw-shop-product-name, span.iw-card-name-link", e).forEach(h);
        }
      })), ++e < 40 && setTimeout(t, 250);
    }();
  })), SFUI.register("r3Crumb", (function() {
    var t = n('.sf-pv-crumb [aria-current="page"]'), e = n(".sf-pv .view_tit");
    if (t && e) {
      var r = e.cloneNode(!0);
      a('.ns-icon, img, i, [class*="badge"]', r).forEach((function(t) {
        t.remove();
      }));
      var s = r.textContent.replace(/\s+/g, " ").trim();
      s && (t.textContent = s);
    }
  }));
  function _() {
    var t = document.getElementById("doz_footer_wrap");
    if (t) {
      var e = a(".section_wrap").filter((function(e) {
        return !t.contains(e) && !e.closest("#doz_header_wrap") && e.getBoundingClientRect().height;
      })), n = e[e.length - 1];
      // 10/25: 우리 위젯(.sf-scope)으로 만든 페이지는 위젯이 아래 여백까지 스스로 정해요 → 아임웹 섹션 아래 여백 0(크기 바꿀 때 흰 띠 안 생기게)
      if (n && n.querySelector(".sf-scope") && !n.querySelector('.js-custom-widget-container, [data-widget-type="board"]')) { // (10/26) 상품·게시판 목록 칸은 제외 — 마지막 글자에서 푸터까지 96px로 모든 목록 페이지 통일
        n.style.setProperty("padding-bottom", "0px", "important"), n.style.setProperty("margin-bottom", "0px", "important");
        return;
      }
      if (n) {
        var r = t.getBoundingClientRect().top, s = document.documentElement.clientWidth, i = function(t, e, n) {
          var a = 0, r = getComputedStyle(document.body).backgroundColor;
          return n.forEach((function n(s) {
            [].forEach.call(s.querySelectorAll("*"), (function(s) {
              if (!t.contains(s) && !s.closest("#doz_header_wrap")) {
                s.shadowRoot && n(s.shadowRoot);
                var i = s.getBoundingClientRect();
                if (i.height && i.width && !(i.bottom <= a)) {
                  var o = getComputedStyle(s);
                  if ("fixed" !== o.position && "sticky" !== o.position && "hidden" !== o.visibility) {
                    var c = s.tagName, l = /^(IMG|BUTTON|INPUT|SELECT|TEXTAREA|IFRAME|VIDEO|SVG|svg)$/.test(c) || [].some.call(s.childNodes, (function(t) {
                      return 3 === t.nodeType && t.textContent.trim();
                    })), d = o.backgroundColor;
                    !l && i.width < .95 * e && (l = "rgba(0, 0, 0, 0)" !== d && "transparent" !== d && d !== r && "rgb(255, 255, 255)" !== d || "none" !== o.backgroundImage || parseFloat(o.borderBottomWidth) > 0), 
                    l && (a = i.bottom);
                  }
                }
              }
            }));
          })), a;
        }(t, s, e);
        if (i && !(i > r + 1)) {
          var o = parseFloat(getComputedStyle(n).paddingBottom) || 0, c = parseFloat(n.style.marginBottom) || 0, l = Math.round(o + c + 96 - (r - i));
          Math.abs(l - o - c) <= 1 || (n.style.setProperty("padding-bottom", Math.max(0, l) + "px", "important"), 
          n.style.setProperty("margin-bottom", "0px", "important")); // (10/26) 마이너스 여백 금지 — 늦게 그려지는 내용(마이페이지 표 등)을 푸터가 덮었어요
        }
      }
    }
  }
  function w() {
    a("[data-sf-carousel]:not([data-peek])").forEach((function(t) {
      var e = n("[data-sf-track]", t);
      e && e.clientWidth && t.classList.toggle("r3-static", e.scrollWidth - e.clientWidth <= 2);
    }));
  }
  SFUI.register("r3FootGap", (function() {
    var t;
    window.__r3FootGap || (window.__r3FootGap = 1, [ 0, 800, 2e3, 4500 ].forEach((function(t) {
      setTimeout(_, t);
    })), window.addEventListener("load", (function() {
      setTimeout(_, 100);
    })), window.addEventListener("resize", (function() {
      clearTimeout(t), t = setTimeout(_, 250);
    })), document.addEventListener("click", (function() {
      requestAnimationFrame(_), setTimeout(_, 700); // (10/26) 필터 누른 바로 다음 그림에서 맞춤 → 0.7초 뒤 두 번째로 움직이던 것 없앰
    }), !0));
  })), SFUI.register("r3StaticCarousel", (function() {
    var t;
    window.__r3Static || (window.__r3Static = 1, w(), setTimeout(w, 1500), window.addEventListener("resize", (function() {
      clearTimeout(t), t = setTimeout(w, 250);
    })));
  })), SFUI.register("r3DragScroll", (function() {
    if (!window.__r3Drag) {
      window.__r3Drag = 1;
      var t = null, e = 0, n = 0, a = !1, r = "";
      document.addEventListener("pointerdown", (function(r) {
        if ("mouse" === r.pointerType && 0 === r.button) {
          var s = r.composedPath ? r.composedPath() : [ r.target ];
          s[0] && /^(INPUT|TEXTAREA|SELECT)$/.test(s[0].tagName) || (t = function(t) {
            for (var e = 0; e < t.length; e++) {
              var n = t[e];
              if (n && 1 === n.nodeType) {
                if (n === document.body) return null;
                var a = getComputedStyle(n);
                if (("auto" === a.overflowX || "scroll" === a.overflowX) && n.scrollWidth > n.clientWidth + 2) return n;
              }
            }
            return null;
          }(s), t && (e = r.clientX, n = t.scrollLeft, a = !1));
        }
      }), !0), document.addEventListener("pointermove", (function(s) {
        if (t) {
          var i = s.clientX - e;
          !a && Math.abs(i) < 6 || (a || (a = !0, r = t.style.scrollSnapType, t.style.scrollSnapType = "none", 
          t.style.scrollBehavior = "auto", t.classList.add("r3-dragging")), t.scrollLeft = n - i, 
          t.dispatchEvent(new Event("pointerdown")));
        }
      }), !0), document.addEventListener("pointerup", s, !0), document.addEventListener("pointercancel", s, !0), 
      document.addEventListener("dragstart", (function(e) {
        t && e.preventDefault();
      }), !0);
    }
    function s() {
      if (t) {
        var e = t;
        if (t = null, a) {
          e.classList.remove("r3-dragging"), e.style.scrollBehavior = "", requestAnimationFrame((function() {
            e.style.scrollSnapType = r;
          })), e.dispatchEvent(new Event("mouseleave"));
          var n = function(t) {
            t.preventDefault(), t.stopPropagation();
          };
          document.addEventListener("click", n, !0), setTimeout((function() {
            document.removeEventListener("click", n, !0);
          }), 0);
        }
      }
    }
  }));
  SFUI.register("r3BoardView", (function() {
    var t = n(".sf-bv-head");
    if (t) {
      var e = n('meta[property="article:published_time"]'), r = n(".sf-bv-who small", t);
      if (r && e) {
        var s = (e.getAttribute("content") || "").match(/(\d{4})-(\d{2})-(\d{2})/);
        s && (r.textContent = s[1] + "." + s[2] + "." + s[3]);
      }
      a(".sf-bv-share, .sf-bv-shareline").forEach((function(t) {
        if (SFUI.once(t, "R3Share")) {
          t.classList.add("r3-share");
          var e = n(".sf-pv-share__btn", t);
          if (e && (e.textContent = "내 링크 공유하고 적립받기"), a("[data-sf-share-link]", t).forEach((function(t) {
            t.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L11.6 6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6"/></svg><span>주소 복사</span>', 
            t.setAttribute("aria-label", "주소 복사");
          })), a("[data-sf-share-kakao]", t).forEach((function(t) {
            t.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.7h1.2c5 0 9-3.2 9-7.1S17 3.5 12 3.5z"/></svg><span>카카오톡 공유</span>';
          })), t.classList.contains("sf-bv-shareline")) {
            var r = n("span", t);
            r && !r.querySelector("svg") && (r.className = "r3-share__t");
            var s = document.createElement("div");
            s.className = "r3-share__btns", a("button", t).forEach((function(t) {
              s.appendChild(t);
            })), t.appendChild(s);
          }
        }
      }));
    }
  })), SFUI.register("r3StepsScroll", (function() {
    var t = n("[data-sf-steps]");
    if (t && SFUI.once(t, "R3Steps")) {
      var e = window.matchMedia("(max-width: 767px)"), r = a("li", t).filter((function(e) {
        return e.parentNode === t;
      })), s = !1;
      window.addEventListener("scroll", (function() {
        s || (s = !0, requestAnimationFrame((function() {
          s = !1, i();
        })));
      }), {
        passive: !0
      }), e.addEventListener ? e.addEventListener("change", o) : e.addListener(o), o();
    }
    function i() {
      if (t.classList.contains("r3-steps")) {
        var e = .62 * window.innerHeight;
        r.forEach((function(t) {
          t.classList.toggle("r3-in", t.getBoundingClientRect().top < e);
        }));
      }
    }
    function o() {
      var n = e.matches;
      t.classList.toggle("r3-steps", n), n ? i() : r.forEach((function(t) {
        t.classList.remove("r3-in");
      }));
    }
  })), SFUI.register("r3WordFill", (function() {
    if (!window.__r3Fill) {
      var t = a(".sf-ab section:not(.sf-ab-hero) h2");
      if (t.length && (window.__r3Fill = 1, !window.matchMedia || !matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        var e = t.map((function(t) {
          s(t), t.classList.add("r3-fill");
          var e = (getComputedStyle(t).color.match(/\d+/g) || [ 0, 0, 0 ]).map(Number);
          return .299 * e[0] + .587 * e[1] + .114 * e[2] > 150 && t.classList.add("r3-fill--dark"), 
          {
            h: t,
            w: a(".r3-w", t)
          };
        })), n = !1;
        if (window.addEventListener("scroll", (function() {
          n || (n = !0, requestAnimationFrame((function() {
            n = !1, i();
          })));
        }), {
          passive: !0
        }), window.addEventListener("resize", i), i(), "IntersectionObserver" in window) {
          var r = new IntersectionObserver((function(t) {
            t.forEach((function(t) {
              t.isIntersecting && (t.target.classList.add("is-in"), r.unobserve(t.target));
            }));
          }), {
            threshold: 0,
            rootMargin: "0px 0px 8% 0px"
          });
          t.forEach((function(t) {
            var e = t.closest("section");
            e && a(".sf-ab-lead, .sf-ab-big, .sf-ab-head p", e).concat(a("h2 ~ p", e)).forEach((function(t) {
              t.closest("[data-sf-reveal], [data-sf-lines]") || t.classList.contains("r3-fade") || t.getBoundingClientRect().top < .9 * window.innerHeight || (t.classList.add("r3-fade"), 
              r.observe(t));
            }));
          }));
        }
      }
    }
    function s(t) {
      [].slice.call(t.childNodes).forEach((function(e) {
        if (3 === e.nodeType) {
          var n = e.textContent.split(/(\s+)/), a = document.createDocumentFragment();
          n.forEach((function(t) {
            if (t) if (/^\s+$/.test(t)) a.appendChild(document.createTextNode(t)); else {
              var e = document.createElement("span");
              e.className = "r3-w", e.textContent = t, a.appendChild(e);
            }
          })), t.replaceChild(a, e);
        } else 1 === e.nodeType && "BR" !== e.tagName && s(e);
      }));
    }
    function i() {
      var t = window.innerHeight;
      e.forEach((function(e) {
        var n = e.h.getBoundingClientRect(), a = Math.max(0, Math.min(1, (.88 * t - n.top) / (.42 * t))), r = Math.round(a * e.w.length);
        e.w.forEach((function(t, e) {
          var n = e < r;
          t.__on !== n && (t.__on = n, t.classList.toggle("is-on", n));
        }));
      }));
    }
  })), SFUI.register("r3ProjLink", (function() {
    a(".sf-ab-projlink").forEach((function(t) {
      SFUI.once(t, "R3Proj") && (t.innerHTML = "<span>" + r(t.textContent.replace(/[↗→]\s*$/, "").trim()) + '</span><i class="r3-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i>');
    }));
  }));
  var y = null;
  function E() {
    if (y) return y;
    function t(t) {
      return fetch("/shop/oms/OMS_mypage_order_list.cm", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: "page=" + t + "&order_type=all"
      }).then((function(t) {
        return t.json();
      }));
    }
    return y = t(1).then((function(e) {
      for (var n = Math.min(+e.pageCount || 1, 5), a = [], r = 2; r <= n; r++) a.push(t(r));
      return Promise.all(a).then((function(t) {
        return [ e ].concat(t);
      }));
    })).then((function(t) {
      return [].concat.apply([], t.map((function(t) {
        return e = t.html || "", r = (new DOMParser).parseFromString(e, "text/html"), s = [], 
        a("thead.item-subject", r).forEach((function(t) {
          var e = (t.textContent.match(/\d{15}/) || [])[0], r = (t.textContent.match(/\d{4}-\d{2}-\d{2}/) || [])[0], i = t.nextElementSibling;
          i && a("tr.content", i).forEach((function(t) {
            var a = n('a[href*="shop_view/?idx="]', t);
            if (a) {
              var i = +(a.getAttribute("href").match(/idx=(\d+)/) || [])[1], o = (n("[data-2]", t) || {}).textContent || "", c = ((n(".section_info", t) || n(".text-brand", t) || {}).textContent || "").replace(/\s+/g, " ").trim(), l = (n("[data-3] span", t) || {}).textContent || "", d = (n("img", t) || {}).src || "";
              s.push({
                no: e,
                date: r,
                idx: i,
                name: o.trim(),
                status: c,
                price: l.trim(),
                img: d
              });
            }
          }));
        })), s;
        var e, r, s;
      })));
    })), y;
  }
  SFUI.register("r3Classroom", (function() {
    var t = n(".sf-hub");
    if (t && SFUI.once(t, "R3Hub")) {
      var a = n("#hub-now", t), s = n("#hub-past", t);
      if (a) if (document.documentElement.classList.contains("sf-logged-in")) {
        a.innerHTML = '<li class="sf-hub-help">신청한 강의를 불러오고 있어요…</li>';
        var i = SFUI.shopItems && SFUI.shopItems() || {}, o = e.classrooms || {};
        E().then((function(t) {
          var e = {}, n = [], c = [], l = Date.now();
          t.forEach((function(t) {
            if (!/취소|반품|환불/.test(t.status) && !e[t.idx]) {
              e[t.idx] = 1;
              var a, s = i[t.idx] || {}, d = s.type || (/LIVE|라이브/i.test(t.name) ? "live" : "course"), u = t.name.match(p), f = u ? m(u) : s.start ? Date.parse(s.start) : 0, h = s.end ? Date.parse(s.end) : f ? f + 54e5 : 0, v = t.name.replace(p, "").trim(), g = !/^0원/.test(t.price), b = /입금/.test(t.status) ? "입금 대기" : g ? "결제 완료" : "신청 완료", _ = "live" === d ? "무료 라이브" : "meet" === d ? s.kind || "모임" : "강의", w = "live" === d ? "/live/" : "meet" === d ? "/community/" : "/course/";
              a = "live" === d ? h && l > h ? s.replay ? '<a class="sf-btn sf-btn--neutral sf-btn--l" href="' + s.replay + '" target="_blank" rel="noopener">다시보기</a>' : '<a class="sf-btn sf-btn--neutral sf-btn--l" href="' + w + "?idx=" + t.idx + '">다시보기 안내</a>' : f && l >= f - 12e5 && s.live ? '<a class="sf-btn sf-btn--primary sf-btn--l" href="' + s.live + '" target="_blank" rel="noopener">라이브 입장</a>' : '<a class="sf-btn sf-btn--outline sf-btn--l" href="' + w + "?idx=" + t.idx + '">라이브 정보</a>' : o[t.idx] ? '<a class="sf-btn sf-btn--primary sf-btn--l" href="' + o[t.idx] + '">강의실 입장</a>' : '<a class="sf-btn sf-btn--outline sf-btn--l" href="' + w + "?idx=" + t.idx + '">' + ("meet" === d ? "모임 정보" : "강의 정보") + "</a>";
              var y, E = f ? (y = new Date(f)).getMonth() + 1 + "월 " + y.getDate() + "일 (" + "일월화수목금토"[y.getDay()] + ") " + y.getHours() + ":" + String(y.getMinutes()).padStart(2, "0") : "", x = "course" !== d || o[t.idx] ? "live" !== d || s.live || h && l > h ? "" : "<p>입장 링크는 시작 전에 안내드려요</p>" : "<p>강의실 링크는 개강 전에 안내드려요</p>", S = '<li class="sf-hub-card"><div class="sf-hub-thumb" style="background:center/cover no-repeat url(\'' + t.img.replace(/'/g, "") + '\')" role="img" aria-label=""></div><div><small>' + _ + "</small><h2>" + r(v) + "</h2><p>" + (E ? E + " · " : "") + "신청일 " + (t.date || "").replace(/-/g, ".") + "</p>" + x + '</div><div class="sf-hub-side"><span class="sf-badge sf-badge--brand">' + b + "</span>" + a + "</div></li>";
              (h && l > h ? c : n).push(S);
            }
          })), a.innerHTML = n.join("") || '<li class="sf-hub-help">아직 신청한 강의가 없어요. <a href="/course">교육 둘러보기</a> · <a href="/live">무료 라이브</a></li>', 
          s && (s.innerHTML = c.join("") || '<li class="sf-hub-help">지난 강의가 아직 없어요.</li>');
        })).catch((function() {
          a.innerHTML = '<li class="sf-hub-help">신청 내역을 불러오지 못했어요. <a href="/shop_mypage/?m2=order">결제 내역</a>에서 확인해 주세요.</li>';
        }));
      } else a.innerHTML = '<li class="sf-hub-help">로그인하면 신청·결제한 강의가 여기에 보여요. <a href="/login?back_url=' + encodeURIComponent(btoa("/classroom")) + '">로그인하기</a></li>';
    }
  })), SFUI.register("r3SideSticky", (function() {
    var t = n(".sf-pv__side");
    if (t && SFUI.once(t, "R3Side")) {
      e(), window.addEventListener("resize", e), window.ResizeObserver && new ResizeObserver(e).observe(t);
    }
    function e() {
      if ("sticky" === getComputedStyle(t).position) {
        var e = t.getBoundingClientRect().height, n = window.innerHeight - 16;
        t.style.top = (e + 96 > n ? Math.round(n - e) : 96) + "px";
      } else t.style.top = "";
    }
  })), SFUI.register("r3LiveGuide", (function() {
    a(".sf-pv-guide > div").forEach((function(t) {
      var e = n("dt", t), a = n("dd", t);
      e && a && /입장 링크/.test(e.textContent) && /문자|이메일/.test(a.textContent) && (a.textContent = "시작 전에 신청하신 분께 안내드려요 · 나의 강의실에서도 확인할 수 있어요");
    }));
  })), SFUI.register("r3OrderWords", (function() {
    function t() {
      for (var t, e = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null); t = e.nextNode(); ) "상품준비" === t.nodeValue.trim() && (t.nodeValue = t.nodeValue.replace("상품준비", "접수 완료"));
    }
    /m2=order/.test(location.search) && (t(), setTimeout(t, 1200), setTimeout(t, 3e3));
  })), SFUI.register("r3AutoplayPause", (function() {
    if (!window.__r3AP) {
      window.__r3AP = 1;
      var t = null, e = !1;
      window.addEventListener("scroll", (function() {
        var n = a("[data-sf-carousel][data-autoplay]");
        e || (e = !0, n.forEach((function(t) {
          t.dispatchEvent(new Event("mouseenter"));
        }))), clearTimeout(t), t = setTimeout((function() {
          e = !1, n.forEach((function(t) {
            t.dispatchEvent(new Event("mouseleave"));
          }));
        }), 700);
      }), {
        passive: !0
      });
    }
  })), SFUI.register("r3Recent", (function() {
    var t = n(".sf-pv .view_tit") || n(".view_tit");
    if (t && SFUI.once(t, "R3Recent")) {
      var e = +(location.search.match(/idx=(\d+)/) || [])[1];
      if (e) {
        var a = location.pathname;
        if (/^\/(course|live|community|shop_view)/.test(a)) {
          var r = /^\/live/.test(a) ? "무료 라이브" : /^\/community/.test(a) ? "모임" : "강의", s = (n('meta[property="og:image"]') || {}).content || "", i = t.textContent.replace(p, "").replace(/\s*(SALE|NEW|BEST|HOT)\s*$/i, "").replace(/\s+/g, " ").trim();
          try {
            var o = JSON.parse(localStorage.getItem("sf_recent") || "[]").filter((function(t) {
              return t.i !== e;
            }));
            o.unshift({
              i: e,
              n: i,
              k: r,
              img: s,
              u: a.replace(/\/?$/, "/") + "?idx=" + e,
              t: Date.now()
            }), localStorage.setItem("sf_recent", JSON.stringify(o.slice(0, 20)));
          } catch (t) {}
        }
      }
    }
  })), SFUI.register("r3RecentView", (function() {
    var t = n(".r2-my-recent");
    t && !t.classList.contains("r3-rec-ok") && (a("li", t).forEach((function(t) {
      var e = n("a", t), a = e && e.getAttribute("href") || "";
      if (/^\/(course|live|community|shop_view)/.test(a)) {
        var r = n("b", t);
        r && (r.textContent = r.textContent.replace(/\s*(SALE|NEW|BEST|HOT)\s*$/i, ""));
        var s = n("small", t);
        s && (s.textContent = /^\/live/.test(a) ? "무료 라이브" : /^\/community/.test(a) ? "모임" : "강의");
      } else t.remove();
    })), t.classList.add("r3-rec-ok"));
  })), SFUI.register("r3MenuItems", (function() {
    a(".sf-menu__list").forEach((function(t) {
      if (SFUI.once(t, "R3Menu") && !n('a[href="/partners"].sf-menu__item', t)) {
        var e = n("a.sf-menu__item", t);
        if (e) {
          [ [ "파트너 지원", "/partner" ], [ "마케팅 파트너스", "/partners" ] ].forEach((function(a) {
            var r = e.cloneNode(!0);
            r.href = a[1];
            var s = n("span", r);
            s && (s.textContent = a[0]), r.removeAttribute("aria-current"), t.appendChild(r);
          }));
          var a = t.parentNode && n('.sf-menu__foot a[href="/partner"]', t.parentNode);
          a && a.remove();
        }
      }
    }));
  })), SFUI.register("r3MobileBell", (function() {
    var t = a(".sf-mh").filter((function(t) {
      return !t.closest(".sf-drawer");
    }))[0];
    if (t && SFUI.once(t, "R3Bell")) {
      var e = a(".sf-mh__btn", t).filter((function(t) {
        return /메뉴/.test(t.getAttribute("aria-label") || "");
      }))[0];
      if (e) {
        var s = document.createElement("button");
        s.type = "button", s.className = "sf-mh__btn r3-bell", s.setAttribute("aria-label", "알림"), 
        s.setAttribute("aria-expanded", "false"), s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/></svg><i class="r3-bell__dot" hidden></i>', 
        e.parentNode.insertBefore(s, e);
        var i = document.createElement("div");
        i.className = "r3-bellp", i.hidden = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-label", "알림"), 
        i.innerHTML = '<div class="r3-bellp__in"><div class="r3-bellp__h"><b>알림</b><button type="button" class="r3-bellp__x" aria-label="알림 닫기">×</button></div><section><h3>내 일정</h3><ul class="r3-bellp__my"><li class="r3-bellp__empty">불러오는 중…</li></ul></section><section><h3>공지사항</h3><ul class="r3-bellp__nt"><li class="r3-bellp__empty">불러오는 중…</li></ul><a class="r3-bellp__more" href="/help#notice">공지 전체보기 ›</a></section></div>', 
        document.body.appendChild(i);
        var o = n(".r3-bell__dot", s), c = document.documentElement.classList.contains("sf-logged-in"), l = SFUI.shopItems && SFUI.shopItems() || {}, d = 0, u = !1, f = n(".r3-bellp__my", i);
        c ? E().then((function(t) {
          var e = Date.now(), n = [], a = {};
          t.forEach((function(t) {
            if (!/취소|반품|환불/.test(t.status) && !a[t.idx]) {
              a[t.idx] = 1;
              var s = l[t.idx] || {}, i = t.name.match(p), o = i ? m(i) : s.start ? Date.parse(s.start) : 0;
              if (o && !(o < e - 72e5)) {
                var c, d, f = s.type || (/LIVE|라이브/i.test(t.name) ? "live" : "course");
                n.push({
                  st: o,
                  html: '<li><a href="/' + ("live" === f ? "live" : "meet" === f ? "community" : "course") + "/?idx=" + t.idx + '"><small>' + (c = o, 
                  d = new Date(c), d.getMonth() + 1 + "." + d.getDate() + " (" + "일월화수목금토"[d.getDay()] + ") " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0")) + (o - e < 864e5 && o > e ? " · 곧 시작" : "") + "</small><span>" + r(t.name.replace(p, "").trim()) + "</span></a></li>"
                }), o - e < 2592e5 && (u = !0);
              }
            }
          })), n.sort((function(t, e) {
            return t.st - e.st;
          })), f.innerHTML = n.slice(0, 4).map((function(t) {
            return t.html;
          })).join("") || '<li class="r3-bellp__empty">다가오는 일정이 없어요 · <a href="/live">무료 라이브 보기</a></li>', 
          h();
        })).catch((function() {
          f.innerHTML = '<li class="r3-bellp__empty"><a href="/classroom">나의 강의실</a>에서 확인해 주세요</li>';
        })) : f.innerHTML = '<li class="r3-bellp__empty"><a href="/login">로그인</a>하면 신청한 일정이 보여요</li>', 
        fetch("/help", {
          credentials: "same-origin"
        }).then((function(t) {
          return t.text();
        })).then((function(t) {
          var e = (new DOMParser).parseFromString(t, "text/html"), s = {}, o = [];
          a('a[href*="bmode=view"]', e).forEach((function(t) {
            var e = +(t.getAttribute("href").match(/idx=(\d+)/) || [])[1], n = t.textContent.replace(/\s+/g, " ").trim();
            e && n && !s[e] && (s[e] = 1, o.push({
              id: e,
              tx: n
            }));
          })), d = o.reduce((function(t, e) {
            return Math.max(t, e.id);
          }), 0), n(".r3-bellp__nt", i).innerHTML = o.slice(0, 3).map((function(t) {
            return '<li><a href="/help/?bmode=view&idx=' + t.id + '"><span>' + r(t.tx) + "</span></a></li>";
          })).join("") || '<li class="r3-bellp__empty">새 공지가 없어요</li>', h();
        })).catch((function() {})), s.addEventListener("click", (function() {
          v(i.hidden);
        })), i.addEventListener("click", (function(t) {
          (t.target === i || t.target.closest(".r3-bellp__x")) && v(!1);
        })), document.addEventListener("keydown", (function(t) {
          "Escape" !== t.key || i.hidden || (v(!1), s.focus());
        }));
      }
    }
    function h() {
      o.hidden = !(u || d > function() {
        try {
          return +localStorage.getItem("sf_bell_seen") || 0;
        } catch (t) {
          return 0;
        }
      }());
    }
    function v(t) {
      if (i.hidden = !t, s.setAttribute("aria-expanded", String(t)), t) {
        try {
          localStorage.setItem("sf_bell_seen", String(d));
        } catch (t) {}
        u = !1, h(), n(".r3-bellp__x", i).focus();
      }
    }
  })), SFUI.register("r3Orders", (function() {
    var t = n("[data-sf-orders]");
    if (t && SFUI.once(t, "R3Orders")) {
      var a = SFUI.shopItems && SFUI.shopItems() || {}, s = e.classrooms || {}, i = document.createElement("div");
      i.className = "r3-enter", i.hidden = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), 
      document.body.appendChild(i), i.addEventListener("click", (function(t) {
        (t.target === i || t.target.closest(".r3-enter__x")) && c();
        var e = t.target.closest(".r3-enter__acc > button");
        if (e) {
          var n = e.parentNode;
          n.classList.toggle("is-open"), e.setAttribute("aria-expanded", String(n.classList.contains("is-open")));
        }
      })), document.addEventListener("keydown", (function(t) {
        "Escape" !== t.key || i.hidden || c();
      }));
      E().then((function(e) {
        var c = {}, l = [];
        e.forEach((function(t) {
          var e = t.no + "-" + t.idx;
          if (!c[e]) {
            c[e] = 1;
            var n = a[t.idx] || {}, s = n.type || (/LIVE|라이브/i.test(t.name) ? "live" : "course"), i = t.name.match(p), d = i ? m(i) : n.start ? Date.parse(n.start) : 0, u = {
              no: t.no,
              idx: t.idx,
              it: n,
              type: s,
              start: d,
              end: n.end ? Date.parse(n.end) : d ? d + 54e5 : 0,
              title: t.name.replace(p, "").trim(),
              base: "live" === s ? "/live/" : "meet" === s ? "/community/" : "/course/"
            }, f = /취소|반품|환불/.test(t.status), h = !/^0원/.test(t.price), v = f ? t.status.replace("상품준비", "") || "취소" : /입금/.test(t.status) ? "입금 대기" : h ? "결제 완료" : "신청 완료", g = "live" === s ? "무료 라이브" : "meet" === s ? n.kind || "모임" : "강의", b = !f && !/입금/.test(t.status) && "meet" !== s;
            l.push({
              x: u,
              html: '<li class="sf-hub-card r3-ord' + (f ? " is-cancel" : "") + '"><div class="sf-hub-thumb" style="background:#f2f3f6 center/cover no-repeat url(\'' + t.img.replace(/'/g, "") + "')\"></div><div><small>" + g + "</small><h2>" + r(u.title) + "</h2><p>" + (d ? o(d) + " · " : "") + (t.date || "").replace(/-/g, ".") + " 신청 · " + r(t.price) + '</p></div><div class="sf-hub-side"><span class="sf-badge ' + (f ? "sf-badge--neutral" : "sf-badge--brand") + '">' + r(v) + "</span>" + (b ? '<button type="button" class="sf-btn sf-btn--primary sf-btn--l r3-ord__go" data-i="' + l.length + '">바로 입장하기</button>' : "") + '<a class="r3-ord__detail" href="/shop_mypage/?m2=order&idx=' + t.no + "&order_no=" + t.no + '">주문 상세 ›</a></div></li>'
            });
          }
        })), t.innerHTML = l.length ? '<ul class="sf-hub-list r3-ord-list">' + l.map((function(t) {
          return t.html;
        })).join("") + "</ul>" : '<div class="r2-my-load">아직 결제·신청한 강의가 없어요. <a href="/course">교육 둘러보기</a> · <a href="/live">무료 라이브</a></div>', 
        t.addEventListener("click", (function(t) {
          var e = t.target.closest(".r3-ord__go");
          e && function(t) {
            var e = t.it, a = Date.now(), c = "live" === t.type, l = "", d = t.start && a >= t.start - 12e5 && a <= t.end, u = t.end && a > t.end, f = c ? d ? "라이브가 시작됐어요.<br>지금 바로 입장해 주세요!" : u ? "라이브가 끝났어요.<br>다시보기를 확인해 주세요." : t.start ? o(t.start) + " 시작이에요.<br>시작 20분 전부터 입장할 수 있어요." : "라이브 일정은 곧 안내드려요." : s[t.idx] ? "강의실이 열려 있어요.<br>지금 바로 입장해 주세요!" : "강의실은 개강 전에 열려요.<br>열리면 여기서 바로 들어갈 수 있어요.";
            l += '<div class="r3-enter__in"><div class="r3-enter__h"><b>' + r(t.title) + '</b><button type="button" class="r3-enter__x" aria-label="닫기">×</button></div>', 
            l += '<div class="r3-enter__ban' + (c && d || !c && s[t.idx] ? " is-on" : "") + '">' + f + "</div>", 
            c ? (l += "<section><h3>라이브 링크</h3>" + (u ? e.replay ? '<a class="r3-enter__go" href="' + e.replay + '" target="_blank" rel="noopener">다시보기</a>' : '<span class="r3-enter__go is-off">다시보기 준비 중</span>' : e.live && d ? '<a class="r3-enter__go" href="' + e.live + '" target="_blank" rel="noopener">Zoom 입장하기</a>' : '<span class="r3-enter__go is-off">' + (e.live ? "시작 20분 전에 열려요" : "입장 링크 준비 중") + "</span>"), 
            l += '<div class="r3-enter__acc"><button type="button" aria-expanded="false">라이브 참여 방법 안내<i aria-hidden="true"></i></button><ol><li>PC는 Zoom 프로그램, 휴대폰은 Zoom 앱을 미리 설치해 주세요.</li><li>입장할 때 이름을 \'이름(소속)\'으로 바꿔 주세요.</li><li>질문은 채팅창에 남겨 주세요. 끝나고 다시보기를 드려요.</li></ol></div></section>') : l += "<section><h3>강의실</h3>" + (s[t.idx] ? '<a class="r3-enter__go" href="' + s[t.idx] + '">강의실 입장하기</a>' : '<span class="r3-enter__go is-off">개강 전에 열려요</span>') + "</section>", 
            e.chat && (l += '<section><h3>소통방 입장</h3><a class="r3-enter__chat" href="' + e.chat + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.4c-.1.3.3.6.6.4l4-2.7h1.2c5 0 9-3.2 9-7.1S17 3.5 12 3.5z"/></svg>소통방 입장</a></section>'), 
            l += '<a class="r3-enter__info" href="' + t.base + "?idx=" + t.idx + '">' + (c ? "라이브" : "강의") + " 정보 보기 ›</a></div>", 
            i.innerHTML = l, i.hidden = !1, document.documentElement.classList.add("r3-enter-on");
            var p = n(".r3-enter__x", i);
            p && p.focus();
          }(l[+e.getAttribute("data-i")].x);
        }));
      })).catch((function() {
        t.innerHTML = '<div class="r2-my-load">결제 내역을 불러오지 못했어요. <a href="/shop_mypage/?m2=order">아임웹 결제 내역 보기</a></div>';
      }));
    }
    function o(t) {
      var e = new Date(t);
      return e.getMonth() + 1 + "월 " + e.getDate() + "일 (" + "일월화수목금토"[e.getDay()] + ") " + e.getHours() + ":" + String(e.getMinutes()).padStart(2, "0");
    }
    function c() {
      i.hidden = !0, document.documentElement.classList.remove("r3-enter-on");
    }
  })), SFUI.register("r3FooterBrand", (function() {
    var t = n(".sf-ft"), e = t && n(".sf-ft-in", t);
    if (e && SFUI.once(t, "R3FtBrand")) {
      var s = n(".r3-ft-ch", t), i = s ? a("a", s) : [], o = {
        "인스타그램": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
        "유튜브": '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>',
        "네이버 블로그": '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8.5 16V8h1.8l3.4 5V8h1.8v8h-1.8l-3.4-5v5z" fill="currentColor" stroke="none"/>',
        "스레드": '<path d="M16.5 11.2c-.4-2.4-2-3.7-4.3-3.7-2.6 0-4.4 1.9-4.4 4.6 0 2.9 1.8 4.9 4.6 4.9 2.3 0 3.9-1.3 3.9-3.1 0-1.7-1.4-2.6-3.3-2.6-1.4 0-2.4.6-2.4 1.6 0 .8.7 1.3 1.6 1.3 1.6 0 2.8-1.3 2.8-3.8"/><circle cx="12" cy="12" r="9.5"/>',
        "카카오톡 채널": '<path d="M12 4C7 4 3 7.1 3 11c0 2.5 1.6 4.6 4.1 5.8L6.3 20l3.9-2.6h1.8c5 0 9-3.1 9-7S17 4 12 4z"/>'
      }, c = [], l = [];
      i.forEach((function(t) {
        var e = t.textContent.trim();
        o[e] ? c.push([ e, t.href ]) : l.push([ e, t.href ]);
      }));
      var d = document.createElement("div");
      if (d.className = "r3-ft-brand", d.innerHTML = '<a class="r3-ft-logo" href="/"><b>SENIOR</b> FUTURE</a><p>시니어 산업에 들어오는 사람과 기업을 교육·콘텐츠·커뮤니티로 모으고,<br>협업과 공동 프로젝트로 잇는 곳이에요.</p>' + (c.length ? '<div class="r3-ft-sns">' + c.map((function(t) {
        return '<a href="' + t[1] + '" target="_blank" rel="noopener" aria-label="' + t[0] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + o[t[0]] + "</svg></a>";
      })).join("") + "</div>" : ""), t.insertBefore(d, t.firstChild), l.length) {
        var u = document.createElement("nav");
        u.className = "sf-ft-col r3-ft-more", u.innerHTML = "<h3>구독 · 커뮤니티</h3><ul>" + l.map((function(t) {
          return '<li><a href="' + t[1] + '" target="_blank" rel="noopener">' + r(t[0]) + "</a></li>";
        })).join("") + "</ul>";
        var f = n(".sf-ft-cs", e);
        e.insertBefore(u, f || null);
      }
    }
  })), SFUI.register("r3OrderDetail", (function() {
    if (/m2=order/.test(location.search) && /order_no=/.test(location.search)) {
      var t = 0;
      !function e() {
        var r = n(".shop-content.mypage .col-md-10");
        if (r) {
          var s = [].filter.call(r.children, (function(t) {
            return !/r2-my-|r3-/.test(t.className || "") && t.getBoundingClientRect().height > 200;
          }))[0];
          if (!s || s.children.length < 3) t++ < 40 && setTimeout(e, 250); else {
            s.classList.add("r3-od");
            var i = [].filter.call(s.children, (function(t, e) {
              return e > 0 && t.getBoundingClientRect().height > 0;
            }));
            i.forEach((function(t, e) {
              t.classList.add("r3-od__sec"), 0 === e && t.classList.add("is-first"), e === i.length - 1 && t.classList.add("is-last");
            })), s.children[0] && s.children[0].classList.add("r3-od__head"), a(".r3-od__sec *", s).forEach((function(t) {
              !t.children.length && /^(주문자|배송지|결제정보|결제 정보|주문 상품)$/.test(t.textContent.trim()) && t.classList.add("r3-od__t");
            }));
          }
        }
      }();
    }
  })), SFUI.register("r3TabbarEnd", (function() {
    function t() {
      var t = n("[data-sf-tabbar]"), e = document.documentElement;
      t && t.classList.contains("is-hidden") && window.scrollY + window.innerHeight >= e.scrollHeight - 80 && (t.classList.remove("is-hidden"), 
      e.classList.remove("sf-tabbar-hidden"));
    }
    window.__r3TabbarEnd || (window.__r3TabbarEnd = 1, window.addEventListener("scroll", (function() {
      t(), requestAnimationFrame(t);
    }), {
      passive: !0
    }), function e(a) {
      var r = n("[data-sf-tabbar]");
      r ? new MutationObserver(t).observe(r, {
        attributes: !0,
        attributeFilter: [ "class" ]
      }) : a < 20 && setTimeout((function() {
        e(a + 1);
      }), 500);
    }(0));
  })), SFUI.register("r3PvTrim", (function() {
    var t = new URLSearchParams(location.search).get("idx"), e = ((window.SF_SITE || {}).details || {})[t];
    if (e && document.body.classList.contains("shop_view")) {
      var r = 0;
      !function t() {
        if (n(".sf-pv")) {
          if (e.noTeacher) {
            var s = n("#sf-pv-teacher");
            s && s.remove(), a('.sf-pv-tabs a[href="#sf-pv-teacher"]').forEach((function(t) {
              t.remove();
            }));
          }
          e.chapters && !e.chapters.length && a(".sf-pv-chapters").forEach((function(t) {
            t.remove();
          }));
        } else r++ < 40 && setTimeout(t, 150);
      }();
    }
  })), SFUI.register("r3RefLinks", (function() {
    function t() {
      a("[data-sf-reward-share]").forEach((function(t) {
        var e = new URL(location.href);
        e.hash = "", [ "ref", "utm_source", "utm_medium", "utm_campaign", "utm_content", "preview_mode" ].forEach((function(t) {
          e.searchParams.delete(t);
        })), e.searchParams.set("utm_source", "sf_partner"), e.searchParams.set("utm_medium", "referral"), 
        e.searchParams.set("utm_campaign", i), t.setAttribute("data-url", e.toString());
      }));
    }
    i && (t(), setTimeout(t, 1500));
  })), SFUI.register("r3SharePop", (function() {
    var t = n(".sf-pv .comment_num_warp .comment_num");
    if (t && SFUI.once(t, "R3Pop")) {
      var e = !!n(".sf-pv--live"), a = e ? null : i;
      t.setAttribute("aria-label", "공유하기"), t.setAttribute("aria-haspopup", "dialog");
      var r = document.createElement("div");
      r.className = "r3-spop", r.hidden = !0, r.setAttribute("role", "dialog"), r.setAttribute("aria-labelledby", "r3-spop-h"), 
      r.innerHTML = '<div class="r3-spop__head"><h3 id="r3-spop-h">' + (e ? "이 라이브를 친구에게 알려 주세요" : a ? "내 추천 링크로 공유해 보세요" : "이 강의를 공유해 보세요") + '</h3><button type="button" class="r3-spop__x" aria-label="닫기"></button></div><p class="r3-spop__p">' + (e ? "함께 들으면 더 좋아요. 링크를 복사하거나 카카오톡으로 바로 보내 보세요." : a ? "친구가 내 링크로 들어와 결제하면 나에게 적립금이 쌓여요." : "로그인하면 나만의 추천 링크가 만들어지고, 친구가 결제하면 적립금이 쌓여요.") + "</p>" + (e ? "" : '<a class="r3-spop__more" href="/partners">자세히 보기</a>') + '<div class="r3-spop__btns"><button type="button" class="r3-spop__b" data-act="copy"><i class="r3-spop__ic r3-spop__ic--copy" aria-hidden="true"></i>' + (a ? "내 추천 링크 복사" : "링크 복사") + '</button><button type="button" class="r3-spop__b" data-act="kakao"><i class="r3-spop__ic r3-spop__ic--kakao" aria-hidden="true"></i>카카오톡 공유</button></div>', 
      document.body.appendChild(r), t.addEventListener("click", (function(e) {
        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation(), r.hidden ? function() {
          c(), r.hidden = !1, t.setAttribute("aria-expanded", "true");
          var e = n("[data-act=copy]", r);
          e && e.focus(), window.SFT && SFT.track("select_content", {
            content_type: "share_popover"
          });
        }() : l(!0);
      }), !0), r.addEventListener("click", (function(t) {
        if (t.target.closest(".r3-spop__x")) return l(!0);
        var n = t.target.closest("[data-act]");
        if (n) {
          var r = function() {
            var t = new URL(location.href);
            return t.hash = "", [ "ref", "utm_source", "utm_medium", "utm_campaign", "utm_content", "preview_mode" ].forEach((function(e) {
              t.searchParams.delete(e);
            })), a ? (t.searchParams.set("utm_source", "sf_partner"), t.searchParams.set("utm_medium", "referral"), 
            t.searchParams.set("utm_campaign", a), t.searchParams.set("ref", a)) : e && (t.searchParams.set("utm_source", "share"), 
            t.searchParams.set("utm_medium", "link")), t.toString();
          }();
          if ("copy" === n.getAttribute("data-act")) o(r).then((function() {
            s(a ? "내 추천 링크를 복사했어요" : "링크를 복사했어요"), l();
          }), (function() {
            s("복사하지 못했어요. 주소창의 주소를 길게 눌러 복사해 주세요");
          })), window.SFT && SFT.track("share", {
            method: "copy",
            ref: a || "",
            live: e ? 1 : 0
          }); else {
            window.SFT && SFT.track("share", {
              method: "kakao",
              ref: a || "",
              live: e ? 1 : 0
            });
            var i = window.Kakao;
            if (i && i.isInitialized && i.isInitialized() && i.Share) return i.Share.sendScrap({
              requestUrl: r
            }), void l();
            if (navigator.share) return navigator.share({
              title: document.title,
              url: r
            }).catch((function() {})), void l();
            o(r).then((function() {
              s("카카오톡을 열 수 없어 링크를 복사했어요. 대화창에 붙여 넣어 주세요"), l();
            }));
          }
        }
      })), document.addEventListener("click", (function(e) {
        r.hidden || r.contains(e.target) || t.contains(e.target) || l();
      })), document.addEventListener("keydown", (function(t) {
        "Escape" === t.key && l(!0);
      })), window.addEventListener("resize", (function() {
        r.hidden || c();
      }));
    }
    function s(t) {
      var e = n(".sf-toast");
      e || ((e = document.createElement("div")).className = "sf-toast", e.setAttribute("role", "status"), 
      e.setAttribute("aria-live", "polite"), document.body.appendChild(e)), e.textContent = t, 
      e.classList.add("is-on"), clearTimeout(e._h), e._h = setTimeout((function() {
        e.classList.remove("is-on");
      }), 3e3);
    }
    function o(t) {
      function e() {
        return new Promise((function(e, n) {
          var a = document.createElement("textarea");
          a.value = t, a.setAttribute("readonly", ""), a.style.position = "fixed", a.style.opacity = "0", 
          document.body.appendChild(a), a.select();
          try {
            document.execCommand("copy") ? e() : n();
          } catch (t) {
            n(t);
          } finally {
            a.remove();
          }
        }));
      }
      return navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(t).catch(e) : e();
    }
    function c() {
      var e = t.getBoundingClientRect(), n = Math.min(400, document.documentElement.clientWidth - 32);
      r.style.width = n + "px";
      var a = Math.min(Math.max(16, e.right - n), document.documentElement.clientWidth - 16 - n);
      r.style.left = a + window.scrollX + "px", r.style.top = e.bottom + window.scrollY + 8 + "px";
    }
    function l(e) {
      r.hidden || (r.hidden = !0, t.setAttribute("aria-expanded", "false"), e && t.focus());
    }
  })), SFUI.register("r3AudCards", (function() {
    var t = a(".sf-biz .r3-aud > li, .sf-biz .r3-flow > li, .sf-pt .sf-pt-stats > li, .sf-pt .sf-pt-ex > article, .sf-pt .sf-pt-cmp > div, .sf-pt .sf-pt-steps > li, .sf-pt .sf-pt-who > li, .sf-pt .sf-pt-ben > div, .sf-pt .sf-pt-code").filter((function(t) {
      return !(t.parentElement && t.parentElement.classList.contains("r2-stag"));
    }));
    if (t.length) {
      t.forEach((function(t, e) {
        if (SFUI.once(t, "R3Aud")) {
          t.classList.add("r3-rv"), t.style.transitionDelay = e % 4 * 80 + "ms";
          var a = n("a[href]", t);
          a && (t.classList.add("is-link"), t.addEventListener("click", (function(t) {
            t.target.closest("a") || a.click();
          })));
        }
      }));
      var e = t.slice();
      window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches ? t.forEach((function(t) {
        t.classList.add("is-in");
      })) : (document.addEventListener("scroll", r, {
        capture: !0,
        passive: !0
      }), window.addEventListener("resize", r), r(), setTimeout(r, 400), setTimeout((function() {
        e.forEach((function(t) {
          t.getBoundingClientRect().top < (window.innerHeight || 800) && t.classList.add("is-in");
        }));
      }), 3e3));
    }
    function r() {
      var t = window.innerHeight || document.documentElement.clientHeight;
      e = e.filter((function(e) {
        var n = e.getBoundingClientRect();
        return !(n.top < .92 * t && n.bottom > 0) || (e.classList.add("is-in"), !1);
      })), e.length || (document.removeEventListener("scroll", r, !0), window.removeEventListener("resize", r));
    }
  })), SFUI.register("r3RewardDone", (function() {
    var t = n(".sf-rw-done");
    if (t && SFUI.once(t, "R3Done")) {
      var e = n(".sf-rw-star", t), a = "M32 5.5c1.6 0 3 .9 3.7 2.4l6.1 12.4 13.7 2c1.6.2 2.9 1.3 3.4 2.9.5 1.5.1 3.2-1.1 4.3l-9.9 9.6 2.3 13.6c.3 1.6-.4 3.2-1.7 4.1-1.3.9-3 1-4.4.3L32 50.6l-12.2 6.5c-1.4.7-3.1.6-4.4-.3-1.3-.9-2-2.5-1.7-4.1L16 39.1l-9.9-9.6c-1.2-1.1-1.6-2.8-1.1-4.3.5-1.6 1.8-2.7 3.4-2.9l13.7-2 6.1-12.4C29 6.4 30.4 5.5 32 5.5z";
      e && (e.outerHTML = '<span class="r3-star" aria-hidden="true"><svg viewBox="0 0 64 64"><defs><linearGradient id="r3sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".45" stop-color="#ffd33d"/><stop offset="1" stop-color="#f5a300"/></linearGradient><radialGradient id="r3sh" cx=".35" cy=".3" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><path d="' + a + '" fill="url(#r3sg)"/><path d="' + a + '" fill="url(#r3sh)"/></svg><i></i></span>');
      var s = n("h2", t);
      s && (s.textContent = "누군가의 성장이 나의 수익으로!");
      var i = n(".sf-rw-ok", t);
      i && (i.textContent = "링크 복사 완료");
      var o = n(".sf-rw-kakao", t);
      o && (o.textContent = "카카오톡으로 바로 보내기");
      var c = n(".sf-rw-guide-link", t);
      c && (c.textContent = "자세히 보기"), new MutationObserver((function() {
        t.hidden || (setTimeout(l, 0), t.classList.remove("is-pop"), t.offsetWidth, t.classList.add("is-pop"));
      })).observe(t, {
        attributes: !0,
        attributeFilter: [ "hidden" ]
      });
    }
    function l() {
      var e = n(".sf-rw-done-p", t);
      e && (e.innerHTML = "내 링크로 들어온 친구가 강의를 결제하면<br>결제 금액의 <em>" + r(window.SF_SHARE && SF_SHARE.rate || "10%") + "</em>를 수익으로 받을 수 있어요!");
    }
  })), SFUI.register("r3LoginPill", (function() {
    if (!SFUI.loggedIn) {
      var t = n('#doz_header_wrap [data-widget-type="inline_login_btn"]');
      if (t) {
        var e = a("a", t).filter((function(t) {
          return /로그인|login/i.test(t.textContent + (t.getAttribute("href") || ""));
        }))[0] || n("a", t);
        e && (document.documentElement.classList.add("r3-out"), a(".sf-hd-actions").forEach((function(t) {
          if (!n(".r3-login", t)) {
            var a = document.createElement("a");
            a.className = "sf-hd-partner r2-pill r3-login", a.href = e.getAttribute("href") || "/login", 
            a.textContent = "로그인", a.addEventListener("click", (function(t) {
              (/^javascript:|^#/.test(e.getAttribute("href") || "") || e.getAttribute("onclick")) && (t.preventDefault(), 
              e.click());
            })), t.appendChild(a);
          }
        })));
      }
    }
  })), SFUI.register("r3WishCards", (function() {
    if (/m2=wish_list/.test(location.search)) {
      var t = n(".table-wrap.wish");
      if (t && SFUI.once(t, "R3Wish")) {
        var e = n("h6", t), s = e && n("span", e);
        s && /위시리스트/.test(s.textContent) && (s.textContent = "찜한 내역"), e && e.classList.remove("hidden-sm", "hidden-xs");
        var i = a("._shop_item", t).filter((function(x) { // (10/26) 숨긴 상품(예시 모임 등)은 링크가 비어 카드가 안 생기고 화면이 비었어요 → 빼고 셈
          return !x.classList.contains("hide-prod");
        }));
        a(".b_cnt, h6 em", t).forEach((function(x) {
          x.textContent = i.length;
        }));
        if (i.length) {
          var o = i.map((function(t) {
            var e = n(".item-title a", t) || n('a[href*="idx="]', t), a = e ? e.getAttribute("href") : "", r = n("._org_img", t), s = r && (r.getAttribute("style") || "").match(/url\(["']?([^"')]+)/), i = n("img", t);
            return {
              idx: (a.match(/idx=(\d+)/) || [])[1],
              href: a,
              title: e ? e.textContent.trim() : "",
              img: s ? s[1] : i ? i.src : ""
            };
          })).filter((function(t) {
            return t.idx;
          }));
          !function() {
            var e = window.SF_CARDS || {}, s = document.createElement("div"), i = SFUI.shopTags || {}, c = SFUI.shopItems && SFUI.shopItems() || {}, l = o.map((function(t) {
              var n;
              if (e[t.idx]) {
                s.innerHTML = e[t.idx];
                var a = s.firstElementChild;
                a && a.setAttribute("href", t.href || a.getAttribute("href")), n = s.innerHTML;
              } else {
                var o = ((c[t.idx] || {}).tags || []).map((function(t) {
                  var e = i[t];
                  return e ? '<span class="sf-tag sf-tag--' + e[0] + '">' + e[1] + "</span>" : "";
                })).join("");
                n = '<a class="sf-ccard" href="' + r(t.href) + '"><span class="sf-ccard__thumb">' + (t.img ? '<img src="' + r(t.img) + '" alt="">' : "") + '</span><span class="sf-ccard__body"><strong>' + r(t.title) + "</strong>" + (o ? '<span class="sf-tags">' + o + "</span>" : "") + "</span></a>";
              }
              return '<li data-idx="' + t.idx + '">' + n + "</li>";
            })).join(""), d = document.createElement("div");
            d.className = "sf-scope r3-wish", d.innerHTML = '<ul class="sf-cards4 sf-cards4--grid r3-wish__grid">' + l + "</ul>", 
            a(".r3-wish__grid li", d).forEach((function(t) {
              var e = n(".sf-ccard__thumb", t);
              if (e) {
                var a = document.createElement("button");
                a.type = "button", a.className = "sf-wish", a.setAttribute("aria-pressed", "true"), 
                a.setAttribute("aria-label", "찜 취소"), a.setAttribute("data-idx", t.getAttribute("data-idx")), 
                a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>', 
                e.appendChild(a);
              }
            }));
            var u = n(".clearfix", t);
            u && u.classList.add("r3-wish-src"), d.addEventListener("click", (function(t) {
              var e = t.target.closest && t.target.closest(".sf-wish");
              if (e && (t.preventDefault(), t.stopPropagation(), !e.disabled)) {
                e.disabled = !0;
                var n = e.getAttribute("data-idx");
                fetch("/course/?idx=" + n, {
                  credentials: "same-origin"
                }).then((function(t) {
                  return t.text();
                })).then((function(t) {
                  var e = t.match(/addProdWish\('(s[0-9a-f]+)'/);
                  if (!e) throw 0;
                  return fetch("/shop/add_prod_wish.cm", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                      "X-Requested-With": "XMLHttpRequest"
                    },
                    body: "prod_code=" + e[1]
                  }).then((function(t) {
                    return t.json();
                  }));
                })).then((function(t) {
                  var n = "add" === t.res;
                  e.setAttribute("aria-pressed", n ? "true" : "false"), e.setAttribute("aria-label", n ? "찜 취소" : "찜하기"), 
                  SFUI.toast && SFUI.toast(n ? "찜 목록에 담았어요" : "찜을 취소했어요");
                })).catch((function() {})).then((function() {
                  e.disabled = !1;
                }));
              }
            })), t.appendChild(d), t.classList.add("r3-wish-on");
          }();
        } else {
          var w = n(".clearfix", t), q = document.createElement("div");
          w && w.classList.add("r3-wish-src"), q.className = "sf-scope r3-wish r3-wish--empty",
          q.innerHTML = '<strong>아직 찜한 강의가 없어요</strong><span>마음에 드는 강의의 하트를 누르면 여기에 모여요</span><a class="sf-btn sf-btn--s" href="/course">강의 둘러보기</a>',
          t.appendChild(q), t.classList.add("r3-wish-on", "r3-wish-empty");
        }
      }
    }
  })), SFUI.register("r3Profile", (function() {
    function t() {
      var t = n(".r2-prof form");
      if (t && !t.__r3) {
        t.__r3 = 1;
        var e = n("input[name=marketing_sms_agree]", t), r = n("input[name=marketing_email_agree]", t), s = (e || r) && (e || r).closest(".input_block, .form-group");
        s && s.classList.add("r2-hide"), a(".sns_login_form", t).forEach((function(t) {
          t.classList.add("r2-hide");
        }));
        var i = n(".r2-noti input.r2-switch", t);
        if (i && (e || r)) !!(e && e.checked || r && r.checked) && !i.checked && (i.checked = !0, 
        i.dispatchEvent(new Event("change"))), i.setAttribute("aria-checked", String(i.checked)), 
        i.addEventListener("change", (function() {
          [ e, r ].forEach((function(t) {
            t && t.checked !== i.checked && t.click(), t && (t.checked = i.checked);
          }));
        }));
        var o = n(".r2-prof-cur", t);
        o && o.classList.add("r2-hide");
      }
    }
    /^\/shop_mypage/.test(location.pathname) && !window.__r3Prof && (window.__r3Prof = 1, 
    new MutationObserver(t).observe(document.body, {
      childList: !0,
      subtree: !0
    }), t(), document.addEventListener("click", (function(t) {
      var e = t.target.closest && t.target.closest(".r2-prof form ._join_btn");
      if (e && !e.__r3pass) {
        var a = e.closest("form"), r = a && n("input[name=passwd_org]", a);
        r && !r.value && (t.preventDefault(), t.stopImmediatePropagation(), function(t) {
          var e = document.createElement("div");
          e.className = "r3-pwdlg", e.setAttribute("role", "dialog"), e.setAttribute("aria-modal", "true"), 
          e.setAttribute("aria-labelledby", "r3-pwdlg-t"), e.innerHTML = '<div class="r3-pwdlg__box"><h3 id="r3-pwdlg-t">비밀번호 확인</h3><p>회원 정보를 지키기 위해 저장 전에 한 번만 확인해요.</p><input type="password" autocomplete="current-password" placeholder="현재 비밀번호"><div class="r3-pwdlg__btns"><button type="button" class="is-cancel">취소</button><button type="button" class="is-ok">저장</button></div></div>', 
          document.body.appendChild(e);
          var a = n("input", e);
          function r() {
            e.remove();
          }
          function s() {
            if (a.value) {
              var e = a.value;
              r(), t(e);
            } else a.focus();
          }
          setTimeout((function() {
            a.focus();
          }), 30), n(".is-cancel", e).addEventListener("click", r), e.addEventListener("click", (function(t) {
            t.target === e && r();
          })), n(".is-ok", e).addEventListener("click", s), a.addEventListener("keydown", (function(t) {
            "Enter" === t.key && s(), "Escape" === t.key && r();
          }));
        }((function(t) {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(r, t), 
          r.dispatchEvent(new Event("input", {
            bubbles: !0
          })), r.dispatchEvent(new Event("change", {
            bubbles: !0
          })), e.__r3pass = 1, e.click(), setTimeout((function() {
            e.__r3pass = 0;
          }), 500);
        })));
      }
    }), !0));
  })), SFUI.register("r3RefundText", (function() {
    for (var t, e = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n = []; t = e.nextNode(); ) t.nodeValue.indexOf("(예시 규정)") > -1 && n.push(t);
    n.forEach((function(t) {
      t.nodeValue = "첫 회차 시작 전 전액 · 2회차 끝나기 전 2/3 · 3회차 시작 전 1/2 · 그 뒤 환불 없음 (평생교육법 기준 · 자세한 내용은 약관 및 정책 › 환불 정책)";
    }));
  })), SFUI.register("r3ShopTweaks", (function() {
    var t = 0;
    function e(t) {
      if (!t.querySelector(".r3-shop-tw")) {
        var e = document.createElement("style");
        e.className = "r3-shop-tw", e.textContent = ".iw-shop-card[data-kind] .iw-shop-product-summary{display:none!important}.r3-one-page{display:none!important}", 
        t.appendChild(e);
      }
      var n = t.querySelector(".iw-shop-paging"), a = t.querySelector(".iw-shop-pagination"), r = n ? /(^|\D)1\s*\/\s*1(\D|$)/.test(n.textContent) : !!a && a.querySelectorAll("a,button").length <= 1;
      [ n, a ].forEach((function(t) {
        t && t.classList.toggle("r3-one-page", r);
      }));
    }
    !function n() {
      a(".js-custom-widget-container").forEach((function(t) {
        var n = t.shadowRoot;
        n && n.querySelector(".iw-shop-card") && (e(n), n.__r3tw || (n.__r3tw = 1, new MutationObserver((function() {
          e(n);
        })).observe(n, {
          childList: !0,
          subtree: !0
        })));
      })), t++ < 20 && setTimeout(n, 500);
    }();
  })), SFUI.register("r3NoOpt", (function() {
    var t = n(".sf-pv .goods_select");
    n(".sf-pv") && document.documentElement.classList.toggle("r3-noopt", !t || !t.textContent.replace(/\s/g, ""));
  })), SFUI.register("r3HeadBr", (function() {
    var t;
    window.__r3HeadBr || (window.__r3HeadBr = 1, window.addEventListener("resize", (function() {
      clearTimeout(t), t = setTimeout(e, 200);
    })), "complete" === document.readyState ? e() : window.addEventListener("load", e), 
    setTimeout(e, 1500));
    function e() {
      a("h1 br, h2 br, h3 br").forEach((function(t) {
        for (var e = t.parentElement, n = [], a = t.previousSibling; a && "BR" !== a.nodeName; ) 1 === a.nodeType && n.unshift(a), 
        a = a.previousSibling;
        if (e.classList.remove("r3-nobr"), !(n.length < 2 || window.innerWidth > 767) && n[n.length - 1].offsetTop > n[0].offsetTop + 4) {
          var r = t.previousSibling;
          r && 3 === r.nodeType && /\s$/.test(r.textContent) || t.parentNode.insertBefore(document.createTextNode(" "), t), 
          e.classList.add("r3-nobr");
        }
      }));
    }
  }));
  // (10/26) 예시 모임(15~22) 대신 실제로 연 행사(29~51) — 모집 중이 먼저, 나머지는 최근 순
  var x = [[29, "시니어 비즈니스 투자 IR 및 Funding 전략", "d77f2f27fca38"], [30, "AI 시대, 노인 돌봄의 미래 Care-Tech 2026", "a7d4900cfc65a"], [31, "AI 시대, 엔딩 테크의 미래 Care-Tech 2026", "facf4b6cda539"], [32, "AI 시대, 초고령사회 돌봄 패러다임 속 시설 특화 전략", "f1a51c0e1b709"], [33, "AI 시대, 시니어 비즈니스 미래 Care-Tech 2026", "8dfa4bc36eff5"], [34, "AI 시대, 돌봄 산업의 미래: Care-Tech 2026 특별 세션", "59c091757aa28"], [35, "AI 시대, 시니어 산업의 미래와 기회 [SENIOR FUTURE X ACPR 2026]", "7847228203319"], [36, "[워크숍] 시니어 제품, 프리미엄 '라이프스타일'을 입다", "57c337c3f7ca1"], [37, "AI시대, Care-Tech 2026 세미나 | 돌봄 산업의 현재와 기회", "9731d41f40dc8"], [38, "세대 교류 북토크 — 시니어 산업의 미래와 노후 대비", "50e268bb2a9df"], [39, "시니어트렌드 2027 북토크 (초고령사회 대전환 지도)", "fcc28a7051fd0"], [40, "성남시니어혁신센터 강연 — 푸드테크와 AI와 시니어 비즈니스", "8b28babfb60f5"], [41, "성남시니어산업혁신센터 탐방 (시니어퓨처 8기)", "8f95e202999ea"], [42, "KB골든라이프 에이지테크랩 현장 스터디", "b5e13e7969c93"], [43, "KB골든라이프 에이지테크랩 현장 스터디 (10기 기간 회차)", "a8b1d80350106"], [44, "시니어 비즈니스 커피챗 네트워킹 (7/4)", "e009c0af9a4e8"], [45, "성남시니어혁신센터 고령친화제품 현장 투어", "208fa82b9b036"], [46, "시니어 비즈니스 커피챗 네트워킹 (8/1)", "79576d5586082"], [47, "시니어 비즈니스, 에이지테크 포럼 & 커피챗 네트워킹 (부산)", "90e56a9f2db10"], [48, "GLOBAL AGETECH FORUM IN BUSAN", "a3977596b5f99"], [49, "KB골든라이프 종로평창카운티 실버타운 현장 스터디", "fe41b99cf139c"], [50, "시니어 비즈니스 커피챗 네트워킹 — 케어닥 박재병 대표", "7cee9f2c00c68"], [51, "시니어퓨처 8기 멤버 커피챗", "e9e4554127fde"]];
  SFUI.register("r3HomeMeet", (function() {
    var t = n(".sf-cards4--meet");
    if (t && !t.classList.contains("r3-meet-ok")) {
      var e = SFUI.shopItems && SFUI.shopItems() || {}, s = Date.now(), i = a(".sf-mcard__meta svg", t).map((function(t) {
        return t.outerHTML;
      })), o = x.map((function(t) {
        var n = e[t[0]] || {}, a = Date.parse(n.start || "") || 0, r = Date.parse(n.deadline || "") || a;
        return {
          idx: t[0],
          name: t[1],
          img: "https://cdn.imweb.me/upload/S20261016dceb77aecc2e2/" + t[2] + ".jpg",
          it: n,
          st: a,
          open: r && s < r
        };
      })).sort((function(t, e) {
        return t.open !== e.open ? t.open ? -1 : 1 : t.open ? t.st - e.st : e.st - t.st;
      })).slice(0, 4);
      t.innerHTML = o.map((function(t) {
        var e = t.it, n = (SFUI.isEvent ? SFUI.isEvent(e.kind) : "이벤트" === e.kind);
        return '<li><a class="sf-ccard sf-mcard" href="/community/?idx=' + t.idx + '"><span class="sf-ccard__thumb"><img src="' + t.img + '" alt="" loading="lazy"></span><span class="sf-ccard__body"><span class="sf-tags"><span class="sf-tag sf-tag--' + (n ? "event" : "meet") + '">' + r(e.kind || "모임") + "</span>" + (t.open ? '<span class="sf-tag sf-tag--recruit">모집중</span>' : '<span class="sf-tag sf-tag--closed">모집 마감</span>') + "</span><strong>" + r(t.name) + '</strong><span class="sf-mcard__meta">' + (e.date ? "<span>" + (i[0] || "") + r(e.date) + "</span>" : "") + (e.place ? "<span>" + (i[1] || "") + r(e.place) + "</span>" : "") + "</span></span></a></li>";
      })).join(""), t.classList.add("r3-meet-ok");
    }
  })), SFUI.register("r3BizFloat", (function t() {
    var e = n(".sf-biz .r2-float");
    if (!e) {
      var a = (window.__r3FlTry || 0) + 1;
      return window.__r3FlTry = a, void (n(".sf-biz") && a < 20 && setTimeout(t, 250));
    }
    if (!n(".r3-fl-track", e)) {
      var r = [].slice.call(e.children);
      if (r.length) {
        var s = document.createElement("div");
        s.className = "r3-fl-track", r.forEach((function(t) {
          s.appendChild(t);
        })), r.forEach((function(t) {
          var e = t.cloneNode(!0);
          e.classList.add("r3-fl-dup"), s.appendChild(e);
        })), e.appendChild(s);
      }
    }
  })), SFUI.register("r3PartnerQA", (function() {
    var t = n(".sf-ap-grid");
    if (t && !t.classList.contains("r3-qa")) {
      var e = [].slice.call(t.children).filter((function(t) {
        return n("b", t) && n("p", t);
      }));
      if (e.length) if (e.forEach((function(t, e) {
        t.style.setProperty("--i", e), n("b", t).classList.add("r3-qa__q");
        var a = n("p", t);
        a.classList.add("r3-qa__a"), a.insertAdjacentHTML("afterbegin", '<i aria-hidden="true">✓</i>');
      })), t.classList.add("r3-qa"), "IntersectionObserver" in window) {
        var a = new IntersectionObserver((function(e) {
          e[0].isIntersecting && (t.classList.add("is-in"), a.disconnect());
        }), {
          threshold: 0,
          rootMargin: "0px 0px 8% 0px"
        });
        a.observe(t);
      } else t.classList.add("is-in");
    }
  })), SFUI.register("r3PartnerDraft", (function() {
    if (/^\/partner\/?$/.test(location.pathname) && !window.__r3PtDraft) {
      var t = n(".sf-scope") || document.body;
      if (/확인 필요/.test(t.textContent)) {
        window.__r3PtDraft = 1;
        for (var e, a = [ [ /판매 금액의 00%를 매월 정산해 드려요\.\s*\(확인 필요\)/, "판매 금액에 따라 매월 정산해 드려요." ], [ /운영팀이 영업일 기준 00일 안에 검토해요\.\s*\(확인 필요\)/, "운영팀이 검토한 뒤 결과를 알려 드려요." ], [ /\s*·\s*이름 확인 필요/, "" ], [ /\s*\(확인 필요\)/, "" ] ], r = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), s = []; e = r.nextNode(); ) /확인 필요/.test(e.nodeValue) && s.push(e);
        s.forEach((function(t) {
          var e = t.nodeValue;
          a.forEach((function(t) {
            e = e.replace(t[0], t[1]);
          })), t.nodeValue = e;
        }));
      }
    }
  })), SFUI.register("r3WriteToPartner", (function() {
    /^\/(insight|help)\b/.test(location.pathname) && a("a.btn").forEach((function(t) {
      // (10/23 사장님 결정) 글 아래 '글쓰기'를 '파트너 지원'으로 바꿔 두던 것 → 회색 네모 버튼으로 어색하게 보여 아예 숨김(글은 관리자에서 씀)
      "글쓰기" !== t.textContent.trim() && !t.classList.contains("r3-to-partner") || (t.hidden = !0, t.style.display = "none");
    }));
  })), SFUI.register("r3ShareName", (function() {
    a("button.comment_num[data-sns-share]").forEach((function(t) {
      t.getAttribute("aria-label") || t.textContent.trim() || t.setAttribute("aria-label", "공유하기");
    }));
  })), SFUI.register("r3SearchEmpty", (function() {
    var t = n(".sf-sr-title");
    function e() {
      /^‘’/.test(t.textContent.trim()) && (t.textContent = "무엇을 찾고 계세요?");
    }
    t && !new URLSearchParams(location.search).get("keyword") && (e(), SFUI.once(t, "R3SrEmpty") && new MutationObserver(e).observe(t, {
      childList: !0,
      characterData: !0,
      subtree: !0
    }));
  })), SFUI.register("r3ClosedCta", (function() {
    if (n(".sf-pv .sf-pv-tags .sf-tag--closed")) {
      var t = n(".sf-pv--live") ? "신청이 마감되었어요" : "모집이 마감되었어요";
      document.documentElement.classList.add("r3-closed"), a(".sf-pv .buy_btns.pc ._btn_buy, .buy_btns.mobile a.buy, .buy_btns.mobile .defualt.buy, .buy_btns.mobile ._btn_buy, .r3-tbar__btn").forEach((function(e) {
        e.textContent.trim() !== t && (e.textContent = t), e.classList.add("is-disabled", "r3-closed-btn"), 
        e.setAttribute("aria-disabled", "true");
      })), window.__r3Closed || (window.__r3Closed = 1, document.addEventListener("click", (function(t) {
        t.target.closest && t.target.closest(".r3-closed-btn") && (t.preventDefault(), t.stopImmediatePropagation());
      }), !0));
    }
  })), SFUI.register("r3TabletBar", (function() {
    var t = n(".sf-pv"), e = n(".sf-pv__side"), s = n(".sf-pv .buy_btns.pc ._btn_buy");
    if (t && e && s && !n(".r3-tbar")) {
      var i = n(".sf-pv .view_tit"), o = i ? i.cloneNode(!0) : null;
      o && a(".ns-icon, img, i", o).forEach((function(t) {
        t.remove();
      }));
      var c = f(o ? o.textContent : ""), l = f((n(".sf-pv .pay_detail .real_price") || {}).textContent || ""), d = document.createElement("div");
      d.className = "r3-tbar", d.setAttribute("aria-hidden", "true"), d.innerHTML = '<div class="r3-tbar__in"><div class="r3-tbar__t"><b>' + r(c) + "</b>" + (l && !n(".sf-pv--live") ? "<span>" + r(l) + "</span>" : "") + '</div><button type="button" class="r3-tbar__btn" tabindex="-1">' + r(f(s.textContent) || "신청하기") + "</button></div>", 
      document.body.appendChild(d);
      var u = n(".r3-tbar__btn", d);
      u.addEventListener("click", (function() {
        var t = n(".sf-pv .goods_select");
        t && t.textContent.replace(/\s/g, "") ? e.scrollIntoView({
          behavior: "smooth",
          block: "start"
        }) : s.click();
      })), new IntersectionObserver((function(t) {
        var e = p() && !t[0].isIntersecting && t[0].boundingClientRect.top < 0;
        d.classList.toggle("is-on", e), document.body.classList.toggle("r3-tbar-on", e), 
        d.setAttribute("aria-hidden", e ? "false" : "true"), u.tabIndex = e ? 0 : -1, document.body.classList.toggle("r3-tbar-pad", p());
      })).observe(s);
    }
    function f(t) {
      return String(t || "").replace(/\s+/g, " ").trim();
    }
    function p() {
      return window.innerWidth >= 768 && window.innerWidth <= 1023;
    }
  })), SFUI.register("r3HRowReveal", (function() {
    if (!window.__r3HRow && "IntersectionObserver" in window) {
      window.__r3HRow = 1;
      var t, e = new IntersectionObserver((function(t) {
        t.forEach((function(t) {
          t.isIntersecting && (a(".sf-rv", t.target).forEach((function(t) {
            t.classList.add("is-in"), setTimeout((function() {
              t.classList.remove("sf-rv", "is-in");
            }), 1300);
          })), e.unobserve(t.target));
        }));
      }), {
        threshold: 0,
        rootMargin: "0px 0px 8% 0px"
      });
      setTimeout(r, 300), setTimeout(r, 2e3), window.addEventListener("resize", (function() {
        clearTimeout(t), t = setTimeout(r, 300);
      })), document.addEventListener("scroll", (function(t) {
        var e = t.target;
        e && 1 === e.nodeType && a(".sf-rv:not(.is-in)", e).forEach((function(t) {
          t.classList.add("is-in");
        }));
      }), {
        capture: !0,
        passive: !0
      });
    }
    function r() {
      a("ul, ol, div").forEach((function(t) {
        if (!(t.__r3hr || t.scrollWidth <= t.clientWidth + 4) && n(".sf-rv", t)) {
          var a = getComputedStyle(t).overflowX;
          "auto" !== a && "scroll" !== a || (t.__r3hr = 1, e.observe(t));
        }
      }));
    }
  })), SFUI.register("r3RvStagger", (function() {
    function t() {
      var t = {};
      a(".sf-rv:not(.is-in)").forEach((function(e) {
        var n = e.getBoundingClientRect();
        if (n.height) {
          var a = Math.round(n.top + window.scrollY);
          (t[a] = t[a] || []).push([ n.left, e ]);
        }
      })), Object.keys(t).forEach((function(e) {
        t[e].sort((function(t, e) {
          return t[0] - e[0];
        })).forEach((function(t, e) {
          t[1].style.setProperty("--sf-rv-delay", 70 * Math.min(e, 5) + "ms");
        }));
      }));
    }
    setTimeout(t, 0), setTimeout(t, 1200);
  })), function() {
    try {
      var t = sessionStorage.getItem("r3MyIntro");
      t && document.documentElement.style.setProperty("--r3-intro", JSON.stringify(t));
    } catch (t) {}
  }(), SFUI.register("r3MyIntro", (function() {
    /^\/shop_mypage/.test(location.pathname) && !window.__r3MyIntro && (window.__r3MyIntro = 1, 
    new MutationObserver((function() {
      a(".r2-my-intro").some((function(t) {
        var e = t.textContent.trim();
        if (e) {
          try {
            sessionStorage.setItem("r3MyIntro", e);
          } catch (t) {}
          return document.documentElement.style.setProperty("--r3-intro", JSON.stringify(e)), 
          !0;
        }
      }));
    })).observe(document.body, {
      childList: !0,
      subtree: !0,
      characterData: !0
    }));
  })), SFUI.register("r3Countdown", (function() {
    a(".sf-pv-cd__t").forEach((function(t) {
      if (!t.__r3cd) {
        t.__r3cd = 1;
        var e = a("b[data-unit]", t);
        if (e.length) {
          var n = {
            d: "일",
            h: "시간",
            m: "분",
            s: "초"
          };
          [].slice.call(t.childNodes).forEach((function(t) {
            3 === t.nodeType && t.remove();
          })), e.forEach((function(e) {
            var a = document.createElement("span");
            a.className = "r3-cd-cell", t.insertBefore(a, e), a.appendChild(e);
            var r = document.createElement("small");
            r.textContent = n[e.getAttribute("data-unit")] || "", a.appendChild(r);
          })), t.classList.add("r3-cd");
        }
      }
    }));
  })), SFUI.register("r3FtLinks", (function() {
    a(".sf-ft a[data-sf-ft]").forEach((function(t) {
      var e = t.textContent.trim();
      /개인정보/.test(e) ? (t.removeAttribute("data-sf-ft"), t.href = "/terms#privacy") : /이용약관/.test(e) && (t.removeAttribute("data-sf-ft"), 
      t.href = "/terms#terms");
    }));
  }));
  var S = null;
  function L() {
    if (S) return S;
    try {
      var t = JSON.parse(sessionStorage.getItem("r3Rv2") || "null");
      if (t && t.t > Date.now() - 6e5) return S = Promise.resolve(t.l);
    } catch (t) {}
    return S = fetch("/review", {
      credentials: "same-origin"
    }).then((function(t) {
      return t.text();
    })).then((function(t) {
      var e = a("._post_item_wrap", (new DOMParser).parseFromString(t, "text/html")).map((function(t) {
        var e = n(".title", t), r = !(!e || !n(".notice-block", e)), s = e && a("em", e).filter((function(t) {
          return !t.classList.contains("notice-block");
        })).map((function(t) {
          return t.textContent.trim();
        }))[0] || "", i = e ? [].slice.call(e.childNodes).filter((function(t) {
          return 3 === t.nodeType;
        })).map((function(t) {
          return t.textContent;
        })).join(" ").replace(/\s+/g, " ").trim() : "", o = n("a.post_link_wrap", t) || n("a", t);
        return {
          notice: r,
          cat: s,
          title: i,
          body: ((n(".text", t) || {}).textContent || "").replace(/\s+/g, " ").trim(),
          href: o ? o.getAttribute("href") : "/review"
        };
      })).filter((function(t) {
        // (10/23) '예시 수강평…실제 후기로 바꿔 주세요' 글은 빼요(진짜 후기만)
        return t.title && !/예시 수강평|실제 후기로 바꿔/.test(t.body);
      }));
      try {
        sessionStorage.setItem("r3Rv2", JSON.stringify({
          t: Date.now(),
          l: e
        }));
      } catch (t) {}
      return e;
    })).catch((function() {
      return [];
    })), S;
  }
  function T(t, e) {
    return '<a class="sf-review' + (e ? " " + e : "") + '" href="' + r(t.href || "/review") + '"><span class="sf-review__course">' + r(t.cat || "수강생 후기") + '</span><span class="sf-review__top"><span class="sf-review__quote">' + r(t.title) + '</span></span><span class="sf-review__body">' + r(t.body.slice(0, 140)) + '</span><span class="sf-review__more">후기 자세히 보기 →</span></a>';
  }
  SFUI.register("r3ReviewData", (function() {
    var t = n("#sf-pv-review [data-sf-track]");
    t && SFUI.once(t, "R3Rv") && L().then((function(e) {
      e.length && (t.innerHTML = e.slice(0, 12).map((function(t) {
        return T(t, "sf-slide");
      })).join("")), t.classList.add("r3-rv-ready");
    }), (function() {
      t.classList.add("r3-rv-ready");
    }));
    var e = n(".sf-home-review [data-sf-track]");
    if (e && SFUI.once(e, "R3RvHome") && L().then((function(t) {
      var a = t.filter((function(t) {
        return !t.notice;
      })).slice(0, 8);
      if (a.length) {
        var r = n(".sf-home-review .r3-flow__row"), s = document.createElement("div");
        s.innerHTML = a.map((function(t) {
          return T(t);
        })).join("");
        var i = r || e;
        [].slice.call(s.children).reverse().forEach((function(t) {
          i.insertBefore(t, i.firstChild);
        }));
      }
    })), /^\/review\/?$/.test(location.pathname) && !/bmode=|idx=/.test(location.search) && !window.__r3RvMore) {
      var r = n("._card_wrap") || (n("._post_item_wrap") || {}).parentElement;
      if (r) {
        var s = n(".pagination") || n('[class*="paging"]');
        if (s) {
          window.__r3RvMore = 1, s.style.display = "none";
          var i = 1, o = !1, c = !1, l = document.createElement("div");
          l.className = "r3-rv-more", l.setAttribute("aria-live", "polite"), r.parentNode.insertBefore(l, r.nextSibling), 
          document.addEventListener("scroll", d, {
            capture: !0,
            passive: !0
          }), setTimeout(d, 600);
        }
      }
    }
    function d() {
      l.getBoundingClientRect().top < (window.innerHeight || 800) + 400 && function() {
        if (!o && !c) {
          o = !0, i++, l.textContent = "후기를 더 불러오고 있어요…";
          var t = new URL(location.href);
          t.searchParams.set("page", i), fetch(t.toString(), {
            credentials: "same-origin"
          }).then((function(t) {
            return t.text();
          })).then((function(t) {
            var e = (new DOMParser).parseFromString(t, "text/html"), s = a("._post_item_wrap a.post_link_wrap").map((function(t) {
              return t.getAttribute("href");
            })), i = a("._post_item_wrap", e).filter((function(t) {
              var e = n("a.post_link_wrap", t);
              return e && s.indexOf(e.getAttribute("href")) < 0;
            }));
            l.textContent = "", i.length ? i.forEach((function(t) {
              r.appendChild(document.importNode(t, !0));
            })) : c = !0;
          })).catch((function() {
            c = !0, l.textContent = "";
          })).then((function() {
            o = !1;
          }));
        }
      }();
    }
  })), SFUI.register("r3RefOrder", (function() {
    if (/^\/shop_payment\/?$/.test(location.pathname) && !window.__r3RefOrder) {
      window.__r3RefOrder = 1;
      var t = function() {
        try {
          return SFUI.referral && SFUI.referral.get();
        } catch (t) {
          return null;
        }
      }();
      if (t && t !== i) {
        var e, n = !1;
        r(), (e = new MutationObserver(r)).observe(document.body, {
          childList: !0,
          subtree: !0
        }), setTimeout((function() {
          e && e.disconnect();
        }), 3e4);
      }
    }
    function r() {
      if (!n) {
        var r = document.getElementById("oms-shop-payment");
        if (r) {
          var s = a("*", r).filter((function(t) {
            return !t.children.length && /^추천인 코드/.test(t.textContent.trim());
          }))[0];
          if (s) {
            for (var i = s, o = null, c = 0; c < 6 && i && !o; c++) o = (i = i.parentElement) && i.querySelector("input[type=text], input:not([type]), textarea");
            if (o && !o.value) {
              var l = "TEXTAREA" === o.tagName ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
              Object.getOwnPropertyDescriptor(l, "value").set.call(o, t), o.dispatchEvent(new Event("input", {
                bubbles: !0
              })), o.dispatchEvent(new Event("change", {
                bubbles: !0
              })), n = !0, e && e.disconnect(), window.SFT && SFT.track("referral_checkout", {
                ref: t
              });
            } else n = !!o;
          }
        }
      }
    }
  })), SFUI.register("r3RefApply", (function() {
    if (/^\/partners\/?$/.test(location.pathname) && !window.__r3RefApply) {
      window.__r3RefApply = 1;
      var t = 0;
      !function e() {
        var s = n(".sf-pt [data-sf-form-slot]") || n("[data-sf-form-slot]"), o = s && n("textarea", s);
        if (o) {
          if (function(t) {
            var e = a("input[type=radio]", t).filter((function(t) {
              return /^적립금/.test(t.value);
            }))[0];
            e && !e.checked && e.click();
            var n = e && (e.closest(".form-group") || e.closest("[class*=form]"));
            n && n.classList.add("r3-hide-pay"), a(".form-group", t).forEach((function(t) {
              var e = a("*", t).filter((function(t) {
                return !t.children.length && /^연락처/.test(t.textContent.trim());
              }))[0], n = a("input", t).filter((function(t) {
                return "hidden" !== t.type;
              }));
              if (e && !(n.length < 2)) {
                t.classList.add("r3-phone");
                for (var r = n[0].parentElement; r && r !== t && !n.every((function(t) {
                  return r.contains(t);
                })); ) r = r.parentElement;
                r && r.classList.add("r3-phone__row");
              }
            }));
          }(s), i) {
            if (!n(".r3-refcode", s)) {
              var c = document.createElement("div");
              c.className = "r3-refcode", c.innerHTML = '<span class="r3-refcode__l">내 추천 코드</span><b>' + r(i) + '</b><span class="r3-refcode__d">신청서와 함께 보내져요 · 보상은 적립금으로 드려요</span>', 
              s.insertBefore(c, s.firstChild);
            }
            var l = n(".sf-pt-code");
            if (l && SFUI.once(l, "R3CODE")) {
              var d = n("small", l), u = n("b", l), f = n("[data-sf-copy]", l);
              d && (d.textContent = "내 추천 코드"), u && (u.textContent = i), f && f.setAttribute("data-sf-copy", i);
            }
            s.addEventListener("mousedown", (function(t) {
              t.target.closest("button, a, input[type=submit]") && !t.target.closest("textarea") && p();
            }), !0), s.addEventListener("submit", p, !0);
          }
        } else t++ < 40 && setTimeout(e, 250);
        function p() {
          if (!(o.value.indexOf(i) >= 0)) {
            var t = "[추천 코드: " + i + "]\n" + o.value;
            Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(o, t), 
            o.dispatchEvent(new Event("input", {
              bubbles: !0
            })), o.dispatchEvent(new Event("change", {
              bubbles: !0
            }));
          }
        }
      }();
    }
  })), SFUI.register("r3PayNoPickup", (function() {
    function t() {
      var t = document.getElementById("oms-shop-payment");
      t && a("*", t).forEach((function(e) {
        if (!e.children.length && "방문수령 위치" === e.textContent.trim()) {
          for (var n = e, a = 0; a < 6 && n.parentElement && n.parentElement !== t && !n.querySelector("input"); a++) n = n.parentElement;
          n && n.querySelector("input") && !n.querySelector("input").required && (n.style.display = "none");
        }
      }));
    }
    /^\/shop_payment\/?$/.test(location.pathname) && !window.__r3PayNP && (window.__r3PayNP = 1, 
    t(), new MutationObserver(t).observe(document.body, {
      childList: !0,
      subtree: !0
    }));
  })), SFUI.register("r3Cs", (function() {
    a(".sf-ft-cs p").forEach((function(t) {
      /평일 10:00/.test(t.textContent) && (t.textContent = "카카오톡 채널 · 이메일로 문의를 받아요");
    }));
  }));
})()
