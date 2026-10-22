// 원본: src/form-slot.js
/* form-slot.js — 아임웹 '입력폼' 위젯을 코드 위젯 안의 자리로 옮겨 시안 모양으로 보여 줘요
   <div class="sf-form-slot" data-sf-form-slot="biz-contact" data-sf-hide="신청 분야"><h3>협업 문의하기</h3></div>
   - 이 코드 위젯 바로 아래(다음)에 있는 첫 입력폼 위젯을 찾아 자리 안으로 옮겨요. 전송·검사는 아임웹이 그대로 해요.
   - data-sf-hide: 이 글자로 시작하는 항목은 숨겨요(탭으로 값을 채우는 '신청 분야' 같은 항목). 여러 개는 | 로 구분.
   - 옮긴 뒤 비어 버린 원래 섹션은 숨겨요. */
SFUI.register('formSlot', function (root) {
  root.querySelectorAll('[data-sf-form-slot]').forEach(function (slot) {
    if (!SFUI.once(slot, 'FormSlot')) return;
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-widget-type="form"]'));
    var form = forms.filter(function (f) {
      return slot.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING && !f.closest('.sf-form-slot');
    })[0];
    if (!form) return;
    var oldSection = form.closest('.doz_section, [doz_type="section"], .section_wrap');
    slot.appendChild(form);
    slot.classList.add('is-filled');
    if (oldSection && !oldSection.querySelector('[data-widget-type]')) oldSection.style.display = 'none';

    var hide = (slot.getAttribute('data-sf-hide') || '').split('|').filter(Boolean);
    if (hide.length) {
      form.querySelectorAll('.form-group').forEach(function (g) {
        var label = g.querySelector('.control-label');
        var t = label ? label.textContent.trim() : '';
        if (hide.some(function (h) { return t.indexOf(h) === 0; })) g.classList.add('sf-hidden');
      });
    }
  });
})
