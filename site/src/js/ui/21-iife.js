// 사이트 기준(10/22): 예전 원본에 같은 코드가 없어 사이트에 올라가 있는 코드를 풀어 씀
(function() {
  var t = "sf_ref";
  function e() {
    try {
      var e = JSON.parse(SFUI.store.get(t) || "null");
      return e && Date.now() - e.t < 2592e6 ? e.c : null;
    } catch (t) {
      return null;
    }
  }
  SFUI.referral = {
    get: e,
    clear: function() {
      SFUI.store.del(t);
    }
  };
  // (10/31) 내 코드는 SF_SHARE.member(나중에 r3 에서 생김) 대신 회원 고유값으로 바로 — 예전엔 내 링크를 누르면 친구 코드가 내 코드로 덮였어요(QA 10/26 4장)
  var a = location.search.match(/[?&]ref=([A-Za-z0-9_-]{2,40})(?:&|$)/), r = window.MEMBER_HASH ? "P" + String(window.MEMBER_HASH).slice(0, 7).toUpperCase() : null;
  a && a[1].toUpperCase() !== r && SFUI.store.set(t, JSON.stringify({
    c: a[1],
    t: Date.now()
  })), SFUI.register("referral", (function(t) {
    var a = (window.SF_SHARE || {}).endpoint, r = e();
    t.querySelectorAll("[data-sf-ref-report]").forEach((function(t) {
      if (SFUI.once(t, "RefReport") && a && r) {
        var e = JSON.stringify({
          order: t.getAttribute("data-order"),
          ref: r
        });
        navigator.sendBeacon ? navigator.sendBeacon(a, new Blob([ e ], {
          type: "application/json"
        })) : fetch(a, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: e,
          keepalive: !0
        }).catch((function() {}));
      }
    }));
  }));
})()
