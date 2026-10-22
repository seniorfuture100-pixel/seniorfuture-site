// 원본: src/mypage-view.js
/* mypage-view.js — 아임웹 마이페이지를 Figma 'PC/마이페이지'(30:2799) 배치로
   - 왼쪽: 프로필 카드(이름·누적 금액) + 메뉴 카드(내 강의 · 결제 내역 · 찜한 강의 · 오픈 알림 · 1:1 문의 · 회원 정보 수정)
   - 오른쪽: 흰 패널 + 맨 위 '나의 강의실 바로가기' 띠
   메뉴 이름은 RENAME 표에서 바꿔요. '내 강의'는 나의 강의실(/classroom)로 가요. 장바구니·배송지 관리는 숨겨요(교육 상품). */
SFUI.register('mypageView', function() {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  if (document.body.classList.contains("shop_mypage")) {
    var e = document.querySelector(".shop-content.mypage .row.show-grid");
    if (e && SFUI.once(e, "Mypage")) {
      document.documentElement.classList.add("sf-my-on");
      var t = {
        "m2=order": "결제 내역",
        "m2=wish_list": "찜한 강의",
        "m2=restock_notification": "오픈 알림",
        "m2=qna": "1:1 문의"
      }, s = /장바구니|배송지/, n = document.getElementById("mypage-summary");
      [].forEach.call(e.querySelectorAll(".left-menu"), (function(e) {
        var a = e.querySelector("ul");
        if (a) {
          a.classList.add("sf-my-menu"), [].forEach.call(a.querySelectorAll("a"), (function(e) {
            var n, a = e.getAttribute("href") || "";
            for (n in t) a.indexOf(n) > -1 && (e.textContent = t[n]);
            /정보 수정/.test(e.textContent) && (e.textContent = "회원 정보 수정"), /회원탈퇴/.test(e.textContent) && e.parentNode.classList.add("sf-my-leave"), 
            s.test(e.textContent) && (e.parentNode.hidden = !0);
          }));
          var r = document.createElement("li");
          r.innerHTML = '<a class="text-gray-dark" href="/classroom">내 강의</a>', a.insertBefore(r, a.firstChild), 
          e.classList.contains("hidden-xs") && (e.classList.add("sf-my-side"), n && (n.classList.add("sf-my-profile"), 
          e.insertBefore(n, e.firstChild)));
        }
      }));
      var a = e.querySelector(".col-md-10");
      if (a) {
        a.classList.add("sf-my-main");
        var r = document.createElement("a");
        r.className = "sf-my-strip", r.href = "/classroom", r.innerHTML = '<span><strong>나의 강의실</strong> 수강 중인 강의와 다음 수업을 한곳에서 볼 수 있어요</span><b>바로가기 <span aria-hidden="true">›</span></b>', 
        a.insertBefore(r, a.firstChild);
      }
    }
  }
})
