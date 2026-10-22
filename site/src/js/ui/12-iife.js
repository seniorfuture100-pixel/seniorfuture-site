// 원본: src/form-validate.js
/* form-validate.js — 문의·결제 폼 필수값 검사
   <form data-sf-validate>
     <div class="sf-field"><label for="name">담당자 이름 *</label><input id="name" name="name" data-required data-msg="담당자 이름을 입력해 주세요"></div>
     <input name="phone" data-required data-type="phone">   ← 휴대폰 11자리
     <input name="email" data-required data-type="email">
     <input name="contact" data-required data-type="contact">   ← 이메일 또는 전화번호
     <input type="radio" name="type" value="…" data-required data-msg="협업 유형을 골라 주세요">  ← 같은 name 중 하나
     <input type="checkbox" name="agree" data-required data-msg="개인정보 수집·이용에 동의해 주세요">
     <fieldset class="sf-field">  ← 둘 중 하나만 있으면 통과 (같은 data-oneof 이름끼리 한 묶음)
       <input type="file" name="resume" data-oneof="resume" data-msg="이력서 파일이나 참고 링크 중 하나를 남겨 주세요">
       <input type="url" name="link" data-oneof="resume">
     </fieldset>
     <div data-sf-error-summary class="sf-hidden"></div>
     <button type="submit">문의 보내기</button>
   </form>
   ※ 아임웹 '입력폼' 위젯에 붙일 때는 폼 바깥 코드 위젯에서
     SFUI.validate(document.querySelector('아임웹 폼 선택자'), {name:'필수 메시지', …}) 로 연결해요. */
(function () {
  var RULE = {
    email: { re: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: '이메일 형식을 다시 확인해 주세요' },
    phone: { re: /^01[016789]-?\d{3,4}-?\d{4}$/, msg: '휴대폰 번호 11자리를 입력해 주세요' },
    contact: { re: /^([^\s@]+@[^\s@]+\.[^\s@]{2,}|0\d{1,2}-?\d{3,4}-?\d{4})$/, msg: '이메일 또는 연락처 형식을 확인해 주세요' }
  };
  function field(input) { return input.closest('.sf-field') || input.closest('fieldset') || input.parentElement; }
  function showError(input, msg) {
    var f = field(input); f.classList.add('is-error'); input.setAttribute('aria-invalid', 'true');
    var e = f.querySelector('.sf-error'); if (!e) { e = document.createElement('p'); e.className = 'sf-error'; e.id = (input.id || input.name) + '-error'; f.appendChild(e); }
    e.textContent = msg; input.setAttribute('aria-describedby', e.id);
  }
  function clearError(input) { var f = field(input); f.classList.remove('is-error'); input.removeAttribute('aria-invalid'); var e = f.querySelector('.sf-error'); if (e) e.remove(); }
  function group(input) { return input.form ? input.form.querySelectorAll('[data-oneof="' + input.getAttribute('data-oneof') + '"]') : [input]; }
  function filled(i) { return i.type === 'file' ? i.files && i.files.length > 0 : !!(i.value || '').trim(); }
  function check(input) {
    var v = (input.value || '').trim();
    if (input.hasAttribute('data-oneof')) { // 묶음 중 하나라도 채우면 통과, 채운 칸은 형식도 검사
      var all = Array.prototype.slice.call(group(input)), any = all.filter(filled);
      if (!any.length) return all[0].getAttribute('data-msg') || '둘 중 하나는 꼭 입력해 주세요';
      for (var k = 0; k < any.length; k++) { var rr = RULE[any[k].getAttribute('data-type')]; if (rr && any[k].type !== 'file' && !rr.re.test(any[k].value.trim())) return rr.msg; }
      return '';
    }
    if (input.type === 'radio') { var on = input.form && input.form.querySelector('[name="' + input.name + '"]:checked'); return on ? '' : (input.getAttribute('data-msg') || '하나를 골라 주세요'); }
    if (input.type === 'checkbox' && !input.checked) return input.getAttribute('data-msg') || '필수 항목에 동의해 주세요';
    if (input.type !== 'checkbox' && !v) return input.getAttribute('data-msg') || '필수 항목을 입력해 주세요';
    var r = RULE[input.getAttribute('data-type')]; if (r && !r.re.test(v)) return r.msg;
    return '';
  }
  function bind(form, required) {
    if (!form || !SFUI.once(form, 'Validate')) return;
    if (required) Object.keys(required).forEach(function (n) { var i = form.querySelector('[name="' + n + '"]'); if (i) { i.setAttribute('data-required', ''); i.setAttribute('data-msg', required[n]); } });
    form.setAttribute('novalidate', '');
    var inputs = function () { return form.querySelectorAll('[data-required], [data-oneof]'); };
    var key = function (i) { return i.hasAttribute('data-oneof') ? 'oneof:' + i.getAttribute('data-oneof') : i.type === 'radio' ? 'radio:' + i.name : ''; };
    var bound = {};
    inputs().forEach(function (i) {
      var k = key(i); if (k) { if (bound[k]) return; bound[k] = 1; }
      i = k.indexOf('oneof:') === 0 ? group(i)[0] : i;
      var targets = i.hasAttribute('data-oneof') ? group(i) : i.type === 'radio' ? form.querySelectorAll('[name="' + i.name + '"]') : [i]; // 라디오·둘 중 하나 묶음은 어느 칸을 채워도 오류가 지워져요
      Array.prototype.forEach.call(targets, function (t) { t.addEventListener(t.type === 'checkbox' || t.type === 'radio' || t.type === 'file' ? 'change' : 'blur', function () { var m = check(i); if (m) showError(i, m); else clearError(i); }); });
    });
    form.addEventListener('submit', function (e) {
      var bad = [];
      var seen = {};
      inputs().forEach(function (i) { var k = key(i); if (k) { if (seen[k]) return; seen[k] = 1; if (k.indexOf('oneof:') === 0) i = group(i)[0]; } var m = check(i); if (m) { showError(i, m); bad.push(i); } else clearError(i); });
      var sum = form.querySelector('[data-sf-error-summary]');
      if (bad.length) {
        e.preventDefault(); e.stopImmediatePropagation();
        if (sum) { sum.textContent = '입력하지 않은 필수 항목 ' + bad.length + '개가 있어요. 빨간 표시를 확인해 주세요.'; sum.classList.remove('sf-hidden'); sum.setAttribute('role', 'alert'); }
        bad[0].focus();
      } else if (sum) sum.classList.add('sf-hidden');
    }, true);
  }
  SFUI.validate = bind;
  SFUI.register('formValidate', function (root) { root.querySelectorAll('form[data-sf-validate]').forEach(function (f) { bind(f); }); });
})()
