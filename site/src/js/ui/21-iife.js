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
  var a = location.search.match(/[?&]ref=([A-Za-z0-9_-]{2,40})(?:&|$)/), r = (window.SF_SHARE || {}).member;
  a && a[1] !== r && SFUI.store.set(t, JSON.stringify({
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
