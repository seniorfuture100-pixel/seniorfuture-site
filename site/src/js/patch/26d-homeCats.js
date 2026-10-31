// (10/31 사장님) 홈 분야 아이콘 줄 — 배너 아래 '가장 주목받는 강의' 위 (월부·패스트캠퍼스처럼)
//   PC 한 줄 10칸 · 휴대폰 5칸 × 2줄. 누르면 교육 목록이 그 분야로 걸러져 열려요(/course?cat=…)
//   아이콘은 입체감 있게 그린 SVG(그림 파일 없이 바로 떠요)
// 같이: 교육·홈 분야 칩 이름을 SFUI.cats 로 맞추고(&→/), 칩에 없는 분야(AI/AX)는 덧붙여요
(function () {
  // 그라데이션 id 가 아이콘끼리 겹치지 않게 접두어를 붙여요
  function g(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  var SH = '<ellipse cx="32" cy="56" rx="17" ry="3.2" fill="#1f2937" opacity=".12"/>'; // 바닥 그림자
  var HI = function (x, y, w, h, r) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="#fff" opacity=".45"/>'; }; // 윗면 반사광
  var ICON = {
    all: '<defs>' + g('ga1', '#c7d2fe', '#818cf8') + g('ga2', '#fde68a', '#f59e0b') + g('ga3', '#bbf7d0', '#22c55e') + g('ga4', '#fecaca', '#f87171') + '</defs>' + SH +
      '<rect x="12" y="11" width="18" height="18" rx="6" fill="url(#ga1)"/><rect x="34" y="11" width="18" height="18" rx="6" fill="url(#ga2)"/>' +
      '<rect x="12" y="33" width="18" height="18" rx="6" fill="url(#ga3)"/><rect x="34" y="33" width="18" height="18" rx="6" fill="url(#ga4)"/>' +
      HI(15, 13, 9, 3, 1.5) + HI(37, 13, 9, 3, 1.5) + HI(15, 35, 9, 3, 1.5) + HI(37, 35, 9, 3, 1.5),
    intro: '<defs>' + g('gi1', '#ffd2b0', '#ff8a3d') + g('gi2', '#ffb27a', '#ff6f0f') + g('gi3', '#ff9a52', '#e2550a') + '</defs>' + SH +
      '<rect x="12" y="34" width="11" height="18" rx="3.5" fill="url(#gi1)"/><rect x="26.5" y="25" width="11" height="27" rx="3.5" fill="url(#gi2)"/><rect x="41" y="15" width="11" height="37" rx="3.5" fill="url(#gi3)"/>' +
      HI(14, 36, 4, 10, 2) + HI(28.5, 27, 4, 16, 2) + HI(43, 17, 4, 22, 2) +
      '<path d="M11 27 L24 18 L33 22 L48 9" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/><path d="M42 8.5h6.5V15" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>',
    care: '<defs>' + g('gc1', '#ffb3c1', '#f43f5e') + g('gc2', '#ffffff', '#ffe4e6') + '</defs>' + SH +
      '<path d="M32 52C20 44 10 36 10 25.5 10 18.6 15.3 13 22 13c4.3 0 7.9 2.3 10 5.8C34.1 15.3 37.7 13 42 13c6.7 0 12 5.6 12 12.5C54 36 44 44 32 52z" fill="url(#gc1)"/>' +
      '<ellipse cx="21" cy="21" rx="6" ry="3.4" fill="#fff" opacity=".5" transform="rotate(-25 21 21)"/>' +
      '<rect x="27.5" y="24" width="9" height="20" rx="2.5" fill="url(#gc2)"/><rect x="22" y="29.5" width="20" height="9" rx="2.5" fill="url(#gc2)"/>',
    housing: '<defs>' + g('gh1', '#fff7ed', '#fed7aa') + g('gh2', '#ff9a52', '#e2550a') + g('gh3', '#93c5fd', '#3b82f6') + '</defs>' + SH +
      '<rect x="15" y="27" width="34" height="26" rx="4" fill="url(#gh1)"/>' +
      '<path d="M8.5 30 L32 11 L55.5 30 a3 3 0 0 1 -3.8 4.6 L32 18.6 12.3 34.6 A3 3 0 0 1 8.5 30z" fill="url(#gh2)"/>' +
      '<rect x="27" y="38" width="10" height="15" rx="2.5" fill="url(#gh3)"/><rect x="18.5" y="32" width="7" height="7" rx="1.8" fill="url(#gh3)"/><rect x="38.5" y="32" width="7" height="7" rx="1.8" fill="url(#gh3)"/>' +
      HI(17, 29, 14, 2.4, 1.2),
    finance: '<defs>' + g('gf1', '#fde68a', '#f59e0b') + g('gf2', '#fcd34d', '#d97706') + '</defs>' + SH +
      '<ellipse cx="32" cy="47" rx="17" ry="6" fill="url(#gf2)"/><rect x="15" y="40" width="34" height="7" fill="url(#gf2)"/><ellipse cx="32" cy="40" rx="17" ry="6" fill="url(#gf1)"/>' +
      '<rect x="15" y="31" width="34" height="9" fill="url(#gf2)"/><ellipse cx="32" cy="31" rx="17" ry="6" fill="url(#gf1)"/>' +
      '<rect x="15" y="21" width="34" height="10" fill="url(#gf2)"/><ellipse cx="32" cy="21" rx="17" ry="6" fill="url(#gf1)"/>' +
      '<ellipse cx="32" cy="21" rx="11" ry="3.6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/><text x="32" y="23.6" text-anchor="middle" font-size="8" font-weight="800" fill="#b45309" font-family="Arial">₩</text>',
    commerce: '<defs>' + g('gm1', '#d8b4fe', '#9333ea') + g('gm2', '#a855f7', '#7e22ce') + '</defs>' + SH +
      '<path d="M24 21v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#6b21a8" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M14 22.5a3 3 0 0 1 3-2.5h30a3 3 0 0 1 3 2.5l3 26A4 4 0 0 1 49 53H15a4 4 0 0 1-4-4.5z" fill="url(#gm1)"/>' +
      '<path d="M44 20h3a3 3 0 0 1 3 2.5l3 26A4 4 0 0 1 49 53h-3z" fill="url(#gm2)" opacity=".55"/>' + HI(16, 23, 18, 3, 1.5) +
      '<circle cx="24" cy="29" r="2.4" fill="#6b21a8"/><circle cx="40" cy="29" r="2.4" fill="#6b21a8"/>',
    health: '<defs>' + g('gl1', '#a7f3d0', '#10b981') + g('gl2', '#ffffff', '#ecfdf5') + '</defs>' + SH +
      '<rect x="10" y="12" width="44" height="40" rx="12" fill="url(#gl1)"/>' + HI(14, 15, 22, 4, 2) +
      '<path d="M15 33h8l4-9 6 17 5-11 3 3h8" fill="none" stroke="url(#gl2)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    life: '<defs>' + g('gb1', '#bfdbfe', '#3b82f6') + g('gb2', '#93c5fd', '#2563eb') + '</defs>' + SH +
      '<path d="M32 19C26 14 17 13 10 15v33c7-2 16-1 22 4z" fill="url(#gb1)"/><path d="M32 19c6-5 15-6 22-4v33c-7-2-16-1-22 4z" fill="url(#gb2)"/>' +
      '<path d="M32 19v33" stroke="#1e3a8a" stroke-width="1.4" opacity=".4"/>' +
      '<path d="M15 23c4-.8 8-.4 12 1M15 29c4-.8 8-.4 12 1M37 24c4-1.4 8-1.8 12-1M37 30c4-1.4 8-1.8 12-1" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/>' +
      '<path d="M43 8 l2 4.2 4.6.7-3.3 3.2.8 4.6L43 18.5l-4.1 2.2.8-4.6-3.3-3.2 4.6-.7z" fill="#fbbf24"/>',
    startup: '<defs>' + g('gs1', '#ffffff', '#cbd5e1') + g('gs2', '#ff9a52', '#e2550a') + g('gs3', '#fde047', '#f97316') + '</defs>' + SH +
      '<path d="M28 44c-3 3-4 7-4 10 3 0 7-1 10-4" fill="url(#gs3)"/>' +
      '<path d="M22 34l-7 2 5-9 8-1zM30 42l-2 7 9-5 1-8z" fill="url(#gs2)"/>' +
      '<path d="M50 11c-10 0-19 5-24 14l-4 9 8 8 9-4c9-5 14-14 14-24 0-1.7-1.3-3-3-3z" fill="url(#gs1)"/>' +
      '<circle cx="40" cy="24" r="5" fill="#3b82f6" stroke="#fff" stroke-width="2"/><path d="M44 14c2.5 0 4.5.6 6 2" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>',
    ai: '<defs>' + g('gx1', '#a5b4fc', '#6366f1') + g('gx2', '#818cf8', '#4338ca') + '</defs>' + SH +
      '<path d="M20 12v-4M28 12v-4M36 12v-4M44 12v-4M20 56v-4M28 56v-4M36 56v-4M44 56v-4M8 20h4M8 28h4M8 36h4M8 44h4M52 20h4M52 28h4M52 36h4M52 44h4" stroke="#6366f1" stroke-width="2.6" stroke-linecap="round"/>' +
      '<rect x="12" y="12" width="40" height="40" rx="10" fill="url(#gx1)"/><rect x="17" y="17" width="30" height="30" rx="7" fill="url(#gx2)"/>' + HI(15, 14.5, 18, 3, 1.5) +
      '<text x="32" y="37.5" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="Arial">AI</text>' +
      '<path d="M50 6l1.3 3.2L54.5 10.5 51.3 11.8 50 15 48.7 11.8 45.5 10.5 48.7 9.2z" fill="#fbbf24"/>'
  };
  var LABEL = { all: '전체 교육' };
  SFUI.catIcon = function (k) { return ICON[k] ? '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + ICON[k] + '</svg>' : ''; };

  // ① 홈 아이콘 줄
  SFUI.register('homeCats', function (root) {
    if (root !== document) return;
    var p = location.pathname.replace(/\/$/, '');
    if ((p && p !== '/index') || document.getElementById('sf-homecats')) return;
    var grid = document.querySelector('ul.sf-cards4--grid'), head = grid && grid.closest('section');
    head = head && head.previousElementSibling && head.previousElementSibling.matches('section.sf-sec') ? head.previousElementSibling : head;
    if (!head) return;
    var pv = /preview_mode=1/.test(location.search) ? 'preview_mode=1' : '';
    var link = function (k) { var q = [k === 'all' ? '' : 'cat=' + k, pv].filter(Boolean).join('&'); return '/course' + (q ? '?' + q : ''); };
    var list = SFUI.cats.map(function (c) { return [c[0], c[1]]; }).concat([['all', LABEL.all]]);
    var nav = document.createElement('nav');
    nav.id = 'sf-homecats'; nav.className = 'sf-homecats'; nav.setAttribute('aria-label', '교육 분야');
    nav.innerHTML = '<ul>' + list.map(function (c) {
      var name = c[1].replace(/\//g, '/<wbr>');
      return '<li><a href="' + link(c[0]) + '" data-cat="' + c[0] + '"><span class="sf-homecats__ic">' + SFUI.catIcon(c[0]) + '</span><span class="sf-homecats__t">' + name + '</span></a></li>';
    }).join('') + '</ul>';
    head.parentNode.insertBefore(nav, head);
  });

  // ② 분야 칩 이름 맞추기 + 빠진 분야 칩 덧붙이기 (교육 목록 [data-sf-shop-filter] · 홈 [data-sf-filter-group])
  SFUI.register('catChips', function (root) {
    var name = {}; SFUI.cats.forEach(function (c) { name[c[0]] = c[1]; });
    [['[data-sf-shop-filter]', 'data-cat'], ['[data-sf-filter-group]', 'data-sf-filter']].forEach(function (s) {
      [].forEach.call(root.querySelectorAll(s[0]), function (g) {
        var btns = [].slice.call(g.querySelectorAll('[' + s[1] + ']'));
        var known = btns.filter(function (b) { return name[b.getAttribute(s[1])]; });
        if (!known.length) return; // 분야 칩 묶음이 아니면(모집 상태·온라인/오프라인 등) 그대로
        known.forEach(function (b) { var t = name[b.getAttribute(s[1])]; b.textContent !== t && (b.textContent = t); });
        // 덧붙이기는 교육 목록 칩만(누르기를 문서 전체에서 받아요) — 홈 칩은 칩마다 누르기가 걸려 있어 새 칩이 동작하지 않아요
        if (s[1] !== 'data-cat') return;
        var last = known[known.length - 1];
        SFUI.cats.forEach(function (c) {
          if (g.querySelector('[' + s[1] + '="' + c[0] + '"]')) return;
          var nb = last.cloneNode(false);
          nb.setAttribute(s[1], c[0]); nb.textContent = c[1]; nb.classList.remove('is-active'); nb.setAttribute('aria-pressed', 'false');
          last.parentNode.insertBefore(nb, last.nextSibling); last = nb;
        });
      });
    });
  });
})()
