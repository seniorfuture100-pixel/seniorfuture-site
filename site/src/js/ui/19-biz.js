// 원본: src/biz.js
/* biz.js — 기업·공공기관(/business) 페이지 동작
   ① 고객 유형 탭      <div data-sf-segment> <button role="tab" aria-controls="needs-b2b">기업 협업</button> … </div>
                        <div role="tabpanel" id="needs-b2b">…</div>   (주소에 #b2g 가 있으면 공공기관 탭으로 시작)
   ② 6단계 프로세스    <ol data-sf-steps> <li><button data-sf-step>상담 및 문의</button><div data-sf-step-panel>…</div></li> … </ol>
                        PC는 가로 단계 + 아래 상세, 모바일은 세로 단계 + 바로 아래 상세 (sf-biz.css)
   ③ '이 서비스 문의하기' <a href="#contact" data-sf-prefill="현장 실증·PoC"> → 문의 폼의 협업 유형을 미리 골라 둠
   ④ 파트너 지원 신청서 탭 <div data-sf-segment data-sf-fill="apply_type"> <button role="tab" data-value="교육 강사" data-hash="lecture">…
                        탭을 누르면 폼의 name="apply_type" 칸(선택·라디오·글자 칸 모두)에 data-value를 넣어요.
                        주소 #lecture 또는 ?type=lecture 로 그 탭을 먼저 열어요.
   방향키 ←→(↑↓)·Home·End로 탭과 단계를 옮길 수 있어요. */
SFUI.register('biz', function(t) {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  function e(t, e, a, r) {
    var n = r ? [ "ArrowUp", "ArrowDown" ] : [ "ArrowLeft", "ArrowRight" ], i = t.indexOf(e), o = t.length, s = -1;
    return a.key === n[0] || "ArrowLeft" === a.key || "ArrowUp" === a.key ? s = (i - 1 + o) % o : a.key === n[1] || "ArrowRight" === a.key || "ArrowDown" === a.key ? s = (i + 1) % o : "Home" === a.key ? s = 0 : "End" === a.key && (s = o - 1), 
    s < 0 ? -1 : (a.preventDefault(), t[s].focus(), s);
  }
  t.querySelectorAll("[data-sf-segment]").forEach((function(t) {
    if (SFUI.once(t, "Segment")) {
      var a = Array.prototype.slice.call(t.querySelectorAll('[role="tab"]')), r = t.getAttribute("data-sf-fill");
      a.forEach((function(t) {
        t.addEventListener("click", (function() {
          i(t);
        })), t.addEventListener("keydown", (function(r) {
          var n = e(a, t, r);
          n >= 0 && i(a[n]);
        }));
      }));
      var n = location.hash.slice(1) || (location.search.match(/[?&]type=([^&]+)/) || [])[1];
      i(a.find((function(t) {
        return n && t.getAttribute("data-hash") === decodeURIComponent(n);
      })) || a[0]);
    }
    function i(t) {
      var e;
      e = t.getAttribute("data-value"), r && null != e && Array.prototype.forEach.call(document.querySelectorAll('[name="' + r + '"]').length ? document.querySelectorAll('[name="' + r + '"]') : document.querySelectorAll('input[type="radio"][value="' + e + '"]'), (function(t) {
        "radio" === t.type || "checkbox" === t.type ? t.checked = t.value === e : t.value = e, 
        t.dispatchEvent(new Event("change", {
          bubbles: !0
        }));
      })), a.forEach((function(e) {
        var a = e === t, r = document.getElementById(e.getAttribute("aria-controls"));
        e.setAttribute("aria-selected", String(a)), e.tabIndex = a ? 0 : -1, e.classList.toggle("is-active", a), 
        r && (r.hidden = !a);
      }));
    }
  })), t.querySelectorAll("[data-sf-steps]").forEach((function(t) {
    if (SFUI.once(t, "Steps")) {
      var a = Array.prototype.slice.call(t.querySelectorAll("[data-sf-step]"));
      a.forEach((function(t, n) {
        var i = t.closest("li").querySelector("[data-sf-step-panel]");
        i && (i.id || (i.id = "sf-step-panel-" + (n + 1)), t.setAttribute("aria-controls", i.id)), 
        t.addEventListener("click", (function() {
          r(n);
        })), t.addEventListener("keydown", (function(n) {
          var i = e(a, t, n, window.matchMedia("(max-width: 767.98px)").matches);
          i >= 0 && r(i);
        }));
      })), t.querySelectorAll("[data-sf-step-next]").forEach((function(t) {
        t.addEventListener("click", (function(e) {
          e.preventDefault();
          var n = a.indexOf(t.closest("li").querySelector("[data-sf-step]"));
          n < a.length - 1 && (r(n + 1), a[n + 1].focus());
        }));
      })), r(0);
    }
    function r(t) {
      a.forEach((function(e, a) {
        var r = e.closest("li"), n = r.querySelector("[data-sf-step-panel]"), i = a === t;
        e.setAttribute("aria-expanded", String(i)), e.setAttribute("aria-current", i ? "step" : "false"), 
        r.classList.toggle("is-active", i), r.classList.toggle("is-done", a < t), n && (n.hidden = !i);
      }));
    }
  })), t.querySelectorAll("[data-sf-prefill]").forEach((function(t) {
    SFUI.once(t, "Prefill") && t.addEventListener("click", (function() {
      var e = t.getAttribute("data-sf-prefill"), a = Array.prototype.find.call(document.querySelectorAll('input[type="radio"]'), (function(t) {
        return t.value === e;
      }));
      a && (a.checked = !0, a.dispatchEvent(new Event("change", {
        bubbles: !0
      })));
    }));
  }));
})
