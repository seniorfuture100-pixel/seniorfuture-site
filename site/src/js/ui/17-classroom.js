// 원본: src/classroom.js
/* classroom.js — 강의실(강의별 그룹 전용 페이지): 회차표 · 다음 수업 카드 · 1시간 전 입장 배너
   운영자는 회차마다 날짜와 링크만 바꾸면 돼요. 상태(예정·오늘·입장 가능·종료·다시보기)는 자동이에요.

   <div data-sf-classroom data-open-before="20" data-banner-before="60">
     <div data-sf-entry-banner hidden></div>             ← 1시간 전부터 보이는 배너(선택)
     <div data-sf-class-next></div>                      ← 다음 수업 카드(선택)
     <ol class="sf-class-list">
       <li data-sf-class-row data-no="1회차" data-title="시니어 돌봄 시장 구조"
           data-start="2026-11-04T19:30:00+09:00" data-end="2026-11-04T21:00:00+09:00"
           data-zoom="https://zoom.us/j/..." data-replay="https://..." data-files="https://..."></li>
       …
     </ol>
   </div>
   - data-replay 를 비워 두면 종료 후 '다시보기 준비 중'으로 보여요.
   - 허브(나의 강의실)에서도 같은 data-sf-classroom 블록에 배너만 넣어 쓸 수 있어요. */
SFUI.register('classroom', function (root) {
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];
  function pad(n) { return String(n).padStart(2, '0'); }
  function hm(t) { var d = new Date(t); return d.getHours() + ':' + pad(d.getMinutes()); }
  function md(t) { var d = new Date(t); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WEEK[d.getDay()] + ')'; }
  function sameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function link(cls, text, href) { var a = el('a', cls, text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; }
  function off(cls, text) { var a = el('a', cls + ' is-disabled', text); a.setAttribute('aria-disabled', 'true'); return a; }

  function readRows(box) {
    return Array.prototype.map.call(box.querySelectorAll('[data-sf-class-row]'), function (r) {
      var s = SFUI.parseDate(r.getAttribute('data-start'));
      return { el: r, no: r.getAttribute('data-no') || '', title: r.getAttribute('data-title') || '', start: s,
        end: SFUI.parseDate(r.getAttribute('data-end')) || (s + 90 * 60000),
        zoom: r.getAttribute('data-zoom'), replay: r.getAttribute('data-replay'), files: r.getAttribute('data-files') };
    }).filter(function (x) { return x.start; });
  }

  function state(x, now, before) {
    if (now >= x.end) return 'ended';
    if (now >= x.start - before) return 'open';
    if (sameDay(now, x.start)) return 'today';
    return 'upcoming';
  }

  function paintRow(x, st, before) {
    var r = x.el; r.className = 'sf-class-row is-' + st; r.textContent = '';
    var info = el('div', 'sf-class-row__info');
    info.appendChild(el('span', 'sf-class-row__no', x.no));
    info.appendChild(el('strong', 'sf-class-row__title', x.title));
    info.appendChild(el('span', 'sf-class-row__date', md(x.start) + ' ' + hm(x.start)));
    var act = el('div', 'sf-class-row__actions');
    if (st === 'ended') {
      act.appendChild(x.replay ? link('sf-btn sf-btn--outline sf-btn--s', '다시보기', x.replay) : el('span', 'sf-badge', '다시보기 준비 중'));
    } else if (st === 'open') {
      act.appendChild(x.zoom ? link('sf-btn sf-btn--primary sf-btn--s', 'Zoom 입장', x.zoom) : el('span', 'sf-badge sf-badge--live', '진행 중'));
    } else if (st === 'today') {
      act.appendChild(el('span', 'sf-badge sf-badge--live', '오늘'));
      act.appendChild(off('sf-btn sf-btn--primary sf-btn--s', hm(x.start - before) + '부터 입장'));
    } else {
      act.appendChild(el('span', 'sf-badge sf-badge--outline', '예정'));
    }
    if (x.files) act.appendChild(link('sf-btn sf-btn--text sf-btn--s', '자료', x.files));
    r.appendChild(info); r.appendChild(act);
  }

  function countdown(ms) {
    if (ms >= 86400000) return 'D-' + Math.ceil(ms / 86400000); // 하루 넘게 남으면 D-day로
    var s = Math.max(0, Math.floor(ms / 1000));
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  }

  function paintNext(box, x, st, now, before) {
    box.textContent = '';
    if (!x) { box.appendChild(el('p', 'sf-class-next__done', '모든 수업이 끝났어요. 다시보기는 아래 회차표에서 볼 수 있어요')); return; }
    box.className = 'sf-class-next is-' + st;
    var head = el('span', 'sf-badge ' + (st === 'upcoming' ? 'sf-badge--outline' : 'sf-badge--live'), st === 'upcoming' ? md(x.start) : (st === 'open' ? '지금 입장 가능' : '오늘 ' + hm(x.start)));
    box.appendChild(head);
    box.appendChild(el('strong', 'sf-class-next__title', x.no + ' · ' + x.title));
    box.appendChild(el('span', 'sf-class-next__date', md(x.start) + ' ' + hm(x.start) + ' ~ ' + hm(x.end) + ' · Zoom'));
    if (st !== 'open') {
      var cd = el('div', 'sf-class-next__count');
      cd.appendChild(el('span', null, '입장 가능까지'));
      cd.appendChild(el('b', null, countdown(x.start - before - now)));
      box.appendChild(cd);
      box.appendChild(off('sf-btn sf-btn--primary sf-btn--l sf-btn--block', 'Zoom으로 수업 입장'));
      box.appendChild(el('small', 'sf-class-next__help', '시작 ' + (before / 60000) + '분 전(' + hm(x.start - before) + ')부터 버튼이 열려요'));
    } else {
      box.appendChild(x.zoom ? link('sf-btn sf-btn--primary sf-btn--l sf-btn--block', 'Zoom으로 수업 입장', x.zoom) : off('sf-btn sf-btn--primary sf-btn--l sf-btn--block', '입장 링크 준비 중'));
    }
  }

  function paintBanner(bn, x, now, bannerBefore, before) {
    var key = 'sf-entry-banner:' + (x ? x.start : '');
    var show = x && now >= x.start - bannerBefore && now < x.end && SFUI.store.get(key) !== '1';
    bn.hidden = !show;
    if (!show) return;
    var mins = Math.ceil((x.start - now) / 60000);
    bn.className = 'sf-entry-banner';
    bn.textContent = '';
    bn.appendChild(el('span', 'sf-badge sf-badge--live', '오늘 ' + hm(x.start)));
    bn.appendChild(el('strong', 'sf-entry-banner__text', mins > 0 ? x.no + ' 라이브가 ' + mins + '분 뒤 시작해요. 입장 버튼은 ' + (before / 60000) + '분 전부터 열려요' : x.no + ' 라이브가 진행 중이에요'));
    var go = bn.getAttribute('data-href');
    if (go) { var a = el('a', 'sf-btn sf-btn--primary sf-btn--m', '강의실로 가기'); a.href = go; bn.appendChild(a); }
    var close = el('button', 'sf-entry-banner__close', '×'); close.type = 'button'; close.setAttribute('aria-label', '배너 닫기');
    close.addEventListener('click', function () { SFUI.store.set(key, '1'); bn.hidden = true; });
    bn.appendChild(close);
  }

  root.querySelectorAll('[data-sf-classroom]').forEach(function (box) {
    if (!SFUI.once(box, 'Classroom')) return;
    var before = Number(box.getAttribute('data-open-before') || 20) * 60000;
    var bannerBefore = Number(box.getAttribute('data-banner-before') || 60) * 60000;
    var rows = readRows(box), next = box.querySelector('[data-sf-class-next]'), bn = box.querySelector('[data-sf-entry-banner]');
    var lastStates = '';
    function paint() {
      var now = Date.now(), states = rows.map(function (x) { return state(x, now, before); });
      if (states.join() !== lastStates) { rows.forEach(function (x, i) { paintRow(x, states[i], before); }); lastStates = states.join(); }
      var i = states.findIndex(function (s) { return s !== 'ended'; });
      var x = i >= 0 ? rows[i] : null;
      if (next) paintNext(next, x, x ? states[i] : '', now, before);
      if (bn) paintBanner(bn, x, now, bannerBefore, before);
    }
    paint();
    setInterval(paint, 1000);
  });
})
