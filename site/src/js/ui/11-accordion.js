// 원본: src/accordion.js
/* accordion.js — FAQ·커리큘럼 펼침/접힘
   <div data-sf-accordion data-single>               ← data-single: 하나만 열림
     <div data-sf-acc-item class="is-open">
       <button data-sf-acc-trigger>다시보기는 언제까지 볼 수 있나요?</button>
       <div data-sf-acc-panel>라이브 종료 후 30일 동안 …</div>
     </div> …
   </div> */
SFUI.register('accordion', function (root) {
  var uid = 0;
  root.querySelectorAll('[data-sf-accordion]').forEach(function (acc) {
    if (!SFUI.once(acc, 'Acc')) return;
    var single = acc.hasAttribute('data-single');
    var items = acc.querySelectorAll('[data-sf-acc-item]');
    function set(item, open) {
      var btn = item.querySelector('[data-sf-acc-trigger]'), panel = item.querySelector('[data-sf-acc-panel]');
      item.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open;
    }
    items.forEach(function (item) {
      var btn = item.querySelector('[data-sf-acc-trigger]'), panel = item.querySelector('[data-sf-acc-panel]');
      if (!btn || !panel) return;
      var id = 'sf-acc-' + (++uid); panel.id = id; btn.setAttribute('aria-controls', id); btn.setAttribute('type', 'button');
      set(item, item.classList.contains('is-open'));
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        if (single && open) items.forEach(function (o) { if (o !== item) set(o, false); });
        set(item, open);
      });
    });
  });
})
