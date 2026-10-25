// 원본: v1.0.22 (2026-10-25) 마케팅 파트너스 가입 신청서
/* partnersJoin — /partners 의 아임웹 입력폼(#partners-form)을 인프런식 '가입' 화면으로 보여 줘요
   - 입력폼 항목은 지우지 않고(기존 신청 내역 보존) 화면에서만 정리: 계약자명·이메일·휴대폰 번호 + 이용약관 동의
   - '주로 추천할 채널'(필수)은 '기타'를 자동 선택한 뒤 숨김, 채널 주소·추천 강의 칸도 숨김(추천 코드는 r3RefApply 가 숨은 칸에 계속 넣어요)
   - 개인정보 안내 상자 대신 마케팅 파트너스 약관(/terms#partners) 동의 문구, 제출 버튼은 '가입하기' */
(function () {
  if (window.__sfPartnersJoin) return;
  window.__sfPartnersJoin = 1;
  function label(g) { var l = g.querySelector('.control-label'); return l ? l.textContent.trim() : ''; }
  function setLabel(g, t) {
    var l = g.querySelector('.control-label'); if (!l) return;
    for (var i = 0; i < l.childNodes.length; i++) { var n = l.childNodes[i]; if (n.nodeType === 3 && n.textContent.trim()) { n.textContent = t; return; } }
  }
  function ph(g, t) { [].forEach.call(g.querySelectorAll('input[type=text],input[type=tel],input[type=email]'), function (x, k) { if (!x.placeholder) x.placeholder = typeof t === 'string' ? t : t[k] || ''; }); }
  function setup() {
    if (!/^\/partners\/?$/.test(location.pathname)) return true;
    var f = document.querySelector('#partners-form [data-widget-type="form"]');
    if (!f) return false;
    if (f.__sfJoin) return true;
    f.__sfJoin = 1;
    f.classList.add('sf-pj');
    [].forEach.call(f.querySelectorAll('.form-group'), function (g) {
      var t = label(g);
      if (/^이름/.test(t)) { setLabel(g, '계약자명'); ph(g, '실명 입력'); }
      else if (/^연락처/.test(t)) { setLabel(g, '휴대폰 번호'); ph(g, ['010', '0000', '0000']); }
      else if (/^이메일/.test(t)) { ph(g, '이메일 입력'); }
      else if (/^주로 추천할 채널/.test(t)) {
        var rs = [].slice.call(g.querySelectorAll('input[type=radio]'));
        if (!rs.some(function (r) { return r.checked; })) {
          var r = rs.filter(function (x) { return /기타/.test(x.value); })[0] || rs[rs.length - 1];
          if (r) r.click();
        }
        g.classList.add('sf-hidden');
      } else if (/^채널 주소|^추천하고 싶은|^보상 방식/.test(t)) {
        g.classList.add('sf-hidden');
      } else if (g.classList.contains('privacy') || /개인정보/.test(t)) {
        var cb = g.querySelector('input[type=checkbox]'); if (!cb) return;
        var wrap = cb.closest('label') || cb.parentElement;
        setLabel(g, '이용약관 동의');
        [].forEach.call(g.querySelectorAll('*'), function (el) {
          if (el.contains(wrap) || wrap.contains(el) || el.closest('.control-label')) return;
          if (el.parentElement && (el.parentElement.contains(wrap) || el.parentElement === g)) el.style.display = 'none';
        });
        var note = document.createElement('p');
        note.className = 'sf-pj-note';
        note.innerHTML = '수익금 정산은 <a href="/terms#partners" target="_blank" rel="noopener">시니어퓨처 마케팅 파트너스 약관</a>(제7조·제10조)에 따라 진행돼요.';
        var lab = g.querySelector('.control-label');
        if (lab && lab.nextSibling) g.insertBefore(note, lab.nextSibling); else g.appendChild(note);
        var sp = wrap.querySelector('span'); if (sp) sp.textContent = '마케팅 파트너스 이용약관 동의';
        wrap.classList.add('sf-pj-agree');
      }
    });
    // 순서: 계약자명 → 이메일 → 휴대폰 번호
    var gs = [].slice.call(f.querySelectorAll('.form-group'));
    var gPhone = gs.filter(function (g) { return /^휴대폰 번호/.test(label(g)); })[0], gMail = gs.filter(function (g) { return /^이메일/.test(label(g)); })[0];
    if (gPhone && gMail && gPhone.parentNode === gMail.parentNode) gPhone.parentNode.insertBefore(gMail, gPhone);
    var b = f.querySelector('._input_form_submit'); if (b) b.textContent = '정산 신청하기';
    return true;
  }
  function tryLater() { var n = 0; (function go() { if (setup() || ++n > 60) return; setTimeout(go, 250); })(); }
  tryLater();
  document.addEventListener('DOMContentLoaded', tryLater);
  document.addEventListener('sf:softnav', function () { setTimeout(tryLater, 200); });
})();
