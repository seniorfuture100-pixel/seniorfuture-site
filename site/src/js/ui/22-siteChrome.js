// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
SFUI.register("siteChrome", (function() {
  var e = (window.SF_SITE || {}).kakao || "/help", t = document.querySelector('#doz_header_wrap [data-widget-type="inline_login_btn"]');
  if (t && SFUI.once(t, "Chrome")) {
    var a = document.createElement("a");
    a.className = "sf-hd-partner", a.href = "/partner", a.textContent = "파트너 지원", t.parentNode.insertBefore(a, t);
  }
  var r = document.querySelector("#doz_footer");
  if (r && SFUI.once(r, "Chrome")) {
    var n = document.createElement("div");
    n.className = "sf-ft", n.innerHTML = '<div class="sf-ft-in">' + o("sf-ft-a", "시니어퓨처", [ [ "회사 소개", "/about" ], [ "파트너 지원", "/partner" ], [ "제휴 문의", "/business#contact" ], [ "채용", "/about#careers" ], [ "수강평", "/review" ], [ "마케팅 파트너스", "/partners" ] ]) + o("sf-ft-b", "고객 지원", [ [ "공지사항", "/help#notice" ], [ "자주 묻는 질문", "/help#faq" ], [ "카카오톡 상담", e ] ]) + o("sf-ft-c", "정책", [ [ "이용약관", "/terms" ], [ "개인정보처리방침", "/terms#privacy" ], [ "환불 정책", "/terms#refund" ] ]) + '<div class="sf-ft-col sf-ft-cs"><h3>고객센터</h3><p>평일 10:00 – 18:00 (점심 12:00 – 13:00)</p><a class="sf-ft-kakao" href="' + e + '">카톡 상담하기</a></div></div>', 
    r.insertBefore(n, r.firstChild), r.classList.add("sf-ft-on"), n.addEventListener("click", (function(e) {
      var t = e.target.closest("[data-sf-ft]");
      if (t && window.SITE) {
        var a = "policy" === t.getAttribute("data-sf-ft") ? SITE.openPolicy : SITE.openPrivacy;
        "function" == typeof a && (e.preventDefault(), a.call(SITE));
      }
    }));
  }
  function o(e, t, a) {
    return '<nav class="sf-ft-col" aria-labelledby="' + e + '"><h3 id="' + e + '">' + t + "</h3><ul>" + a.map((function(e) {
      return '<li><a href="' + e[1] + '"' + (e[2] ? ' data-sf-ft="' + e[2] + '"' : "") + ">" + e[0] + "</a></li>";
    })).join("") + "</ul></nav>";
  }
}))
