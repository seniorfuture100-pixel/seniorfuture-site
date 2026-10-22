/* sf-stage (10/22) — 저장 전 시험 모드. 이 탭의 sessionStorage 에 sf_stage=1 과 sf_stage_code(새 코드 전체)가 있을 때만 동작해요.
   그때는 이 아래에 저장된 공통 코드(sf-* 블록)를 끄고, 새 코드를 이 자리에 대신 넣어요. 다른 사람·다른 탭에는 아무 영향이 없어요(탭을 닫으면 사라짐). */
(function () {
  try {
    var S = window.sessionStorage, code = S && S.getItem('sf_stage') === '1' && S.getItem('sf_stage_code');
    if (!code) return;
    var mo = new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) {
        var n = ms[i].addedNodes[j];
        if (n.nodeType !== 1 || !n.id || !/^sf-/.test(n.id) || n.id === 'sf-stage' || n.hasAttribute('data-sf-stage')) continue;
        if (n.tagName === 'SCRIPT') n.type = 'text/sf-off';          // 저장된 JS는 실행 안 함
        else if (n.tagName === 'STYLE' || n.tagName === 'LINK') n.media = 'not all';           // 저장된 CSS는 끔
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function () { mo.disconnect(); });
    document.documentElement.setAttribute('data-sf-stage', '1');
    document.write(code);
  } catch (e) {}
})();
