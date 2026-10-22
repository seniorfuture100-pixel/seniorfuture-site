// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
SFUI.register("meetStatus", (function(r) {
  [].forEach.call(r.querySelectorAll("[data-sf-meet]"), (function(t) {
    var n = Date.now(), a = SFUI.parseDate(t.getAttribute("data-deadline")), s = SFUI.parseDate(t.getAttribute("data-start")), e = s && n >= s || a && n >= a ? [ "closed", "모집 마감" ] : a && a - n <= 2592e5 ? [ "soon", "마감 임박" ] : [ "recruit", "모집중" ];
    t.setAttribute("data-status", e[0]);
    var g = t.querySelector("[data-sf-meet-status]");
    g && (g.className = "sf-tag sf-tag--" + e[0], g.textContent = e[1]);
  }));
}))
