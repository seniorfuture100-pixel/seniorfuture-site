// 원본: src/sticky-box.js
/* sticky-box.js — 교육 상세 오른쪽 구매 박스 고정
   <aside data-sf-sticky data-gap="24">…</aside>
   헤더 높이(--sf-header-h) + gap 위치에 붙고, 부모 영역(본문)이 끝나면 자연스럽게 멈춰요.
   ※ 아임웹 섹션/컬럼에 overflow:hidden이 걸려 있으면 sticky가 동작하지 않아요. 그 경우 해당 컬럼 설정에서 꺼 주세요. */
SFUI.register('stickyBox', function(t) {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  t.querySelectorAll("[data-sf-sticky]").forEach((function(t) {
    if (SFUI.once(t, "Sticky")) {
      var e = Number(t.getAttribute("data-gap") || 24);
      window.addEventListener("resize", a), a();
    }
    function a() {
      var a = getComputedStyle(document.documentElement).getPropertyValue("--sf-header-h").trim() || "72px", r = window.matchMedia("(max-width: 767.98px)").matches;
      t.style.position = r ? "" : "sticky", t.style.top = r ? "" : "calc(" + a + " + " + e + "px)", 
      t.style.alignSelf = r ? "" : "flex-start";
    }
  }));
})
