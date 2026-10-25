// 원본: v1.0.14 (2026-10-24) 회사 소개(/about) v7 움직임
/* aboutV7 — 회사 소개 페이지 전용 (위젯에서 <script>가 지워지는 문제 때문에 공통 코드로 옮김)
   - 첫 화면 사진 4초마다 부드럽게 교체 + 스크롤하면 조금 커짐
   - WHY 문장 색 차오름 + 오른쪽 고정 사진 교체
   - 사례·SERVICES 줄 좌우에서 들어오기(.sf-side), OUR WAY 사진 확대 해제(.sf-zin)
   - PROOF 배경 어둠→밝음(.sf-bgshift), 마지막 카드 확대(.sf-zoom)
   '동작 줄이기' 기기에서는 움직임 없이 바로 최종 모습 */
SFUI.register('aboutV7', function () {
  var root=document.querySelector('main.sf-ab'); if(!root||!root.querySelector('.sf-h6')||!SFUI.once(root,'AboutV7')) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 첫 화면 사진: 4초마다 부드럽게 바뀜
  var hs=[].slice.call(root.querySelectorAll('.sf-h6-frame img')), dots=[].slice.call(root.querySelectorAll('.sf-h6-dots i')), hi=0;
  if(hs.length>1&&!reduce) setInterval(function(){
    if(document.hidden) return;
    hs[hi].classList.remove('is-on'); dots[hi]&&dots[hi].classList.remove('is-on');
    hi=(hi+1)%hs.length;
    hs[hi].classList.add('is-on'); dots[hi]&&dots[hi].classList.add('is-on');
    var nx=hs[(hi+1)%hs.length]; if(nx.loading==='lazy') nx.loading='eager';
  },4000);
  var hero=root.querySelector('.sf-h6'), media=root.querySelector('.sf-h6-media');
  // WHY: 문장 색 차오름 + 오른쪽 사진 교체
  var lines=[].slice.call(root.querySelectorAll('.sf-fill p')), wph=[].slice.call(root.querySelectorAll('.sf-w6-ph img'));
  var bg=root.querySelector('.sf-bgshift'), zoom=root.querySelector('.sf-zoom');
  function tick(){
    var vh=innerHeight;
    if(hero&&media&&!reduce){ var t=-hero.getBoundingClientRect().top; var p=Math.min(1,Math.max(0,t/(hero.offsetHeight||1))); media.style.setProperty('--hz',(1+p*0.08).toFixed(3)); }
    var lit=-1;
    lines.forEach(function(p,i){ var on=reduce||p.getBoundingClientRect().top<vh*0.6; p.classList.toggle('is-lit',on); if(on) lit=i; });
    if(wph.length){ var w=Math.max(0,Math.min(wph.length-1,lit)); wph.forEach(function(im,i){ im.classList.toggle('is-on',i===w); }); }
    if(bg) bg.classList.toggle('is-light', bg.getBoundingClientRect().top < vh*0.55);
    if(zoom&&zoom.getBoundingClientRect().top < vh*0.85) zoom.classList.add('is-in');
  }
  // 사례 카드: 왼쪽·오른쪽 번갈아 들어옴, WAY 사진 확대 해제
  var watch=[].slice.call(root.querySelectorAll('.sf-side,.sf-zin'));
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px 8% 0px'});
    watch.forEach(function(el){ io.observe(el); });
  } else watch.forEach(function(el){ el.classList.add('is-in'); });
  tick();
  addEventListener('scroll',tick,{passive:true}); addEventListener('resize',tick);
  setTimeout(tick,1200);
});
