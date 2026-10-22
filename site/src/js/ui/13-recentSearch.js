// 원본: src/recent-search.js
/* recent-search.js — 최근 검색어 저장(최대 10개) · 개별 삭제 · 모두 지우기
   <form data-sf-search action="/search"><input name="keyword" data-sf-search-input></form>
   <div data-sf-recent>
     <button data-sf-recent-clear>모두 지우기</button>
     <ul data-sf-recent-list></ul>
     <p data-sf-recent-empty>최근 검색어가 없어요</p>
   </div>
   ※ 검색 이동은 아임웹 검색(또는 action 주소)을 그대로 써요. 이 코드는 기록만 담당해요. */
SFUI.register('recentSearch', function(t) {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  var e = "sf_recent_search", a = 10;
  function r() {
    try {
      return JSON.parse(SFUI.store.get(e) || "[]");
    } catch (t) {
      return [];
    }
  }
  function n(t) {
    SFUI.store.set(e, JSON.stringify(t.slice(0, a)));
  }
  function i(t) {
    var e = t.querySelector("[data-sf-recent-list]"), a = t.querySelector("[data-sf-recent-empty]"), o = r();
    e && (e.innerHTML = "", o.forEach((function(a, o) {
      var s = document.createElement("li");
      s.className = "sf-recent-item";
      var l = document.createElement("a");
      l.textContent = a, l.href = (t.getAttribute("data-search-url") || "/search?keyword=") + encodeURIComponent(a);
      var c = document.createElement("button");
      c.type = "button", c.setAttribute("aria-label", a + " 삭제"), c.textContent = "×", 
      c.addEventListener("click", (function() {
        var e = r();
        e.splice(o, 1), n(e), i(t);
      })), s.appendChild(l), s.appendChild(c), e.appendChild(s);
    })), a && a.classList.toggle("sf-hidden", o.length > 0));
  }
  t.querySelectorAll("[data-sf-search]").forEach((function(t) {
    SFUI.once(t, "Search") && t.addEventListener("submit", (function() {
      var e = t.querySelector("[data-sf-search-input]"), a = e && e.value.trim();
      if (a) {
        var i = r().filter((function(t) {
          return t !== a;
        }));
        i.unshift(a), n(i);
      }
    }));
  })), t.querySelectorAll("[data-sf-recent]").forEach((function(t) {
    if (SFUI.once(t, "Recent")) {
      var a = t.querySelector("[data-sf-recent-clear]");
      a && a.addEventListener("click", (function() {
        SFUI.store.del(e), i(t);
      })), i(t);
    }
  }));
})
