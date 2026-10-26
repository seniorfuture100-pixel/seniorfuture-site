// 원본: src/product-view.js
/* product-view.js — 아임웹 상품 상세를 Figma 상세 화면 배치로 바꿔요 (상품 종류는 shop-list.js 의 ITEMS 로 판단)
   - 교육(PC/교육 상세 20:1011): 왼쪽 이미지 · 고정 탭(소개·커리큘럼·강사·후기·문의) · 본문 / 오른쪽 고정 구매 박스
     (태그 · 제목 · 할인가 · 상품 금액 · 찜 + 수강 신청하기 · 공유하고 수익받기)
   - 무료 라이브(PC/무료 라이브 상세 22:1451): 오른쪽 신청 카드(상태 태그 · 마감 카운트다운 · 일시 · 무료로 신청하기 · 공유하기)
     왼쪽 이런 내용을 다뤄요 · 연사 소개 · 진행 안내 · 라이브 후 더 깊게 · 수강생 후기
   - 모임(PC/모임 상세 28:2452): 태그(모임/이벤트 · 모집 상태) · 참가비 · 참여 신청하기, 왼쪽 모임 안내 · 모임 소개 · 일정 · 호스트 · 장소
   - 배송·수량·장바구니·구매평(아임웹)은 숨기고, 후기는 수강평 게시판으로 모아요.
   - 상세 설명(관리자 상품 편집)에 글이 있으면 '소개' 자리에 그대로 보여 주고, 예시 내용은 SF_SITE.details[상품번호] 로 바꿀 수 있어요.
       교육: { who:[], points:[[제목,설명]], summary, chapters:[[제목,시간,설명]], teacher:{name,role,bio,href}, faq:[[질문,답]], refund }
       라이브: { topics:[], speaker:{name,bio}, guide:[[항목,내용]], courses:[상품번호] }
       모임: { intro, checks:[], schedule:[[날짜,내용]], host:{name,bio}, address } */
SFUI.register('productView', function() {
  // ↓ 사이트 기준(10/22): 원본과 달라 사이트에 올라가 있는 코드로 맞춤

  if (document.body.classList.contains("shop_view")) {
    // (10/26) 상세 글(<template id="prodDetailPC">)은 페이지 맨 아래에 있어서, 그보다 먼저 돌면 [제목] 칸을 못 읽어요 → 다 읽힌 뒤 다시
    var w1 = document.getElementById("prod_detail_body");
    if (document.readyState === "loading" && !document.getElementById("prodDetailPC") && !(w1 && w1.textContent.trim())) {
      window.__sfPvWait || (window.__sfPvWait = 1, document.addEventListener("DOMContentLoaded", (function() {
        window.SFUI && SFUI.init && SFUI.init(document);
      })));
      return;
    }
    var e = document.querySelector(".goods_wrapper"), s = document.querySelector(".goods_form_wrap");
    if (e && s && SFUI.once(e, "ProductView")) {
      var t, a = window.SF_SITE || {}, n = new URLSearchParams(location.search).get("idx"), i = SFUI.shopItems && SFUI.shopItems()[n] || {}, r = i.type || "course", c = "course" === r, o = "live" === r, p = "meet" === r, d = s.querySelector(".view_tit"), l = d ? d.textContent.trim() : document.title, f = String.fromCharCode(38), v = document.createElement("div"), u = [ "일", "월", "화", "수", "목", "금", "토" ], h = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>', b = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>', g = {
        3: [ "장기요양기관 운영 실무 입문: 인력·수가·평가까지 한 번에", "현장 운영자가 알려주는 6주 실무 과정", "763c8869ed481.jpg" ],
        4: [ "시니어 산업 지도: 2027 시장 구조와 기회 읽기", "숫자로 보는 시니어 시장과 진입 기회", "52414c2f66081.jpg" ],
        6: [ "시니어 고객을 위한 보험·신탁 상품 설계 실무", "연금·보험·신탁 상품 설계 실전", "c44590cd1fc7b.jpg" ],
        10: [ "시니어 비즈니스 창업 부트캠프 8주 과정", "아이템 검증부터 첫 고객까지 8주", "e733c00cd4254.jpg" ]
      }, m = [
        // (10/26) 참가자 후기 47개 전체(apply.seniorfuture.kr/reviews) — 수강평 게시판(/review)에도 같은 내용
        ["9기 · 규동님 (더힐실버타운)", "“산업의 최전선에 계신 분들과 깊이 있게 소통할 수 있는 네트워크였습니다”", "현재 실버타운을 운영하면서 현장에서 마주하는 다양한 고민과 인사이트를 나눌 수 있는 파트너를 찾고 있었습니다. 산업의 최전선에 계신 분들과 깊이 있게 소통하고 서로의 경험을 공유할 수 있는 네트워크였습니다."],
        ["9기 · 미혜님 (LG이노텍)", "“막연했던 방향성이 선명해졌습니다”", "오랫동안 인사(HR) 분야에서 쌓아온 역량을 바탕으로, 전문적인 시니어 컨설턴트로 진화하기 위해 이번 프로그램에 참여했습니다. 막연했던 방향성이 '이키가이' 세션과 체계적인 커리큘럼을 통해 선명해졌고, 다양한 관점을 가진 분들과 소통하며 저만의 전문적인 '뷰'를 확장할 수 있었습니다."],
        ["9기 · 민우님 (이노하이 대표)", "“AI 기술이 현장에서 어떻게 쓰일 수 있을지 초석을 다졌습니다”", "AI 기반 시니어 케어 서비스를 직접 개발하며 항상 '현장의 병목 현상'에 대한 갈증이 있었습니다. 국내외 사례를 분석하고 관점을 공유하는 과정에서, 제가 만들고 있는 AI 기술이 실제 현장에서 어떻게 가치 있게 쓰일 수 있을지 초석을 다질 수 있었습니다."],
        ["9기 · 유진님 (비로소고운 대표)", "“실무적인 인사이트가 제 고민에 방향을 더해주었습니다”", "현재 영유아 방문 교육 브랜드를 운영하며 쌓아온 교구 중심 시스템과 강사 매니지먼트 노하우를 시니어 시장에 어떻게 이식할 수 있을지 고민하며 참여했습니다. 시니어퓨처의 실무적인 인사이트는 제 고민에 방향을 더해주었습니다."],
        ["9기 · 양현님 (논스)", "“대화가 끊이지 않을 정도로 결이 맞는 분들을 만났습니다”", "시니어 시장에 관심 있는 사람들을 밖에서는 만나기 힘들지만, 시니어퓨처 안에서는 대화가 끊이지 않을 정도로 결이 맞는 분들을 쉽게 만날 수 있었습니다. 특히 현장에서 직접 뛰고 있는 전문가들을 만나 얻은 인사이트는 무엇과도 바꿀 수 없는 소중한 자산이 되었습니다."],
        ["9기 · 민선님 (네슬러코리아)", "“기존 사업을 시니어 타깃에 맞춰 다시 바라보게 됐습니다”", "평소 시니어 산업에 대한 관심이 커지던 중, 제가 지금 하고 있는 일과 이 시장을 어떻게 연결할 수 있을지 고민하며 시니어퓨처를 찾았습니다. 이번 과정을 통해 단순히 새로운 아이템을 찾는 것을 넘어, 기존 사업을 시니어 타깃에 맞춰 다시 바라보고 적용할 수 있는 실질적인 인사이트를 얻었습니다."],
        ["8기 · 가람님 (MYSC)", "“앞으로 어떤 방향으로 탐색할지 많은 힌트를 얻었습니다”", "시니어 산업에 관심은 있었지만 어떻게 접근해야 할지 막연했습니다. 프로그램을 통해 다양한 분야의 사람들과 아이디어와 관점을 나누며 시니어 산업을 바라보는 시야를 넓힐 수 있었고, 앞으로 어떤 방향으로 탐색해볼지 많은 힌트를 얻었습니다."],
        ["8기 · 정현님 (로디랩)", "“시니어 산업을 바라보는 시야가 넓어졌습니다”", "시니어 산업에 관심은 있었지만 어디서부터 접근해야 할지 막막했습니다. 프로그램에서 여러 분야의 분들과 아이디어와 관점을 나누며 시니어 산업을 보는 시야가 넓어졌고, 앞으로 무엇을 더 탐색해볼지 방향을 잡는 데 많은 힌트를 얻었습니다."],
        ["8기 · 태현님 (유니움)", "“시니어 산업이 더 성장할 분야라는 걸 다시 느꼈습니다”", "시니어 산업이 앞으로 더욱 성장할 분야라는 점을 다시 한번 느낄 수 있었던 시간이었습니다. 다양한 분야에서 시니어 산업을 고민하고 있는 분들의 생각과 경험을 들으며 산업에 대한 이해의 폭이 넓어졌습니다. 다음 기수에서도 기회가 된다면 더욱 깊이 참여해보고 싶습니다."],
        ["8기 · 성욱님 (핍티식스)", "“시니어 비즈니스에도 기회가 있겠다고 생각했습니다”", "시니어 산업을 비즈니스 목적으로 고려하지 않고 추천을 받아서 들어왔는데, 네트워킹도 좋고 실제 아이디어도 구체화할 수 있어서 좋았습니다. 정말 시니어 비즈니스에도 기회가 있을 수 있겠다고 생각했습니다."],
        ["8기 · 동주님 (게임 프로그래머)", "“생각의 폭이 넓어졌습니다”", "시니어 산업을 다양한 관점에서 바라보는 이야기를 들으며 생각의 폭이 넓어졌습니다. 다른 분야에서 활동하는 분들과 의견을 나누는 경험이 의미 있는 시간이었습니다."],
        ["8기 · 다은님 (프리랜서)", "“부산에서 서울까지 오가며 참여할 만큼 의미 있었습니다”", "부산에서 서울까지 오가며 참여할 만큼 의미 있는 시간이었습니다. 다양한 분야에서 시니어 산업을 고민하는 사람들과 만나 아이디어와 인사이트를 나누며 산업을 바라보는 시야를 넓힐 수 있었습니다. 앞으로 어떤 방향으로 시니어 비즈니스를 탐색해볼지 많은 힌트를 얻을 수 있었습니다."],
        ["8기 · 수민님 (딜로이트 안진회계법인)", "“고객을 정하고 문제를 정의하는 과정의 중요성을 느꼈습니다”", "창업을 준비하며 필요한 역할과 역량에 대해 다시 생각해볼 수 있는 시간이었습니다. 특히 고객을 명확하게 설정하고 문제를 정의하는 과정의 중요성을 느낄 수 있었습니다."],
        ["8기 · 정원님 (창업 준비)", "“사업 방향을 더 구체적으로 생각해볼 수 있었습니다”", "시니어 산업에 관심은 있었지만 실제 아이디어를 어떻게 발전시켜야 할지 고민이 많았습니다. 프로그램을 통해 다양한 배경의 참가자들과 아이디어를 논의하며 사업 방향을 조금 더 구체적으로 생각해볼 수 있었습니다."],
        ["8기 · 호섭님 (재덕종합건설 전무)", "“막연했던 시니어 산업에 접근하는 길이 보였습니다”", "시니어 산업에 관심은 있었지만 어떻게 다가가야 할지 막연했습니다. 프로그램에서 다양한 분야의 사람들과 생각을 나누며 시니어 산업을 바라보는 눈이 넓어졌고, 앞으로 어떤 방향으로 살펴볼지 많은 힌트를 얻었습니다."],
        ["8기 · 승재님 (성균관대학교 사회학과)", "“실제 산업의 모습과 가능성을 이해할 수 있었습니다”", "시니어 산업에 대해 막연하게만 알고 있었는데 다양한 분야의 참가자들과 함께 활동하며 실제 산업의 모습과 가능성을 이해할 수 있었습니다. 팀 활동과 논의를 통해 많은 인사이트를 얻을 수 있었던 시간이었습니다."],
        ["7기 · 효진님 (중앙사회서비스원)", "“함께 파고들면서 관점이 확 넓어졌어요”", "회사에서는 항상 혼자 리서치하다 보니 시야가 점점 좁아졌는데, 여기서는 한 가지 주제를 가지고 함께 파고들어서 관점이 확 넓어졌어요. 편하게 이야기 나누면서 인사이트를 주고받는 시간이 정말 좋았습니다."],
        ["7기 · 원석님 (포스코인터내셔널)", "“네트워킹으로 좋은 팀원을 얻고 아이디어톤 수상까지 했습니다”", "시니어 산업 비즈니스 목적으로 들어왔는데 네트워킹으로 좋은 팀원도 얻고, 아이디어톤 수상도 할 수 있었습니다. 이를 기점으로 계속 고도화해볼 예정입니다."],
        ["7기 · 주아님 (알리익스프레스)", "“직접 현장에 몸을 담그며 인사이트를 얻었어요”", "시니어 산업 관련 행사들을 그냥 정보로만 소비했는데, 여기서는 직접 현장에 몸을 담그면서 인사이트를 얻는 경험을 했어요. 좋은 기회로 후원을 받아 현장을 가게 되어 몸소 체험할 수 있었고, 마음 맞는 팀원과 함께해서 정말 즐거웠습니다."],
        ["7기 · 혜인님 (스타트업 대표)", "“협업 아이디어가 자연스럽게 많이 생겼습니다”", "시니어 분들을 위한 음악치료를 진행하고 있는데, 여기서 다양한 분들과 네트워킹하다 보니 협업 아이디어가 자연스럽게 많이 생겼고, 고민을 나눌 사람들도 만나서 정말 든든했습니다."],
        ["7기 · 보영님 (서울대 MBA)", "“혼자 고민하던 관심이 함께 성장하는 단계로 바뀌었어요”", "시니어 산업에 관심만 많았지 어디서부터 공부해야 할지 몰라 막막했습니다. 우연히 지인의 추천을 받아 가입하게 되었는데 기대했던 것보다 다양한 사람들과 네트워킹하고 교류할 수 있었던 게 특히 큰 힘이 됐어요. 관심이 '혼자 고민하는 단계'에서 '함께 배우고 성장하는 단계'로 넘어갈 수 있어서 좋았습니다."],
        ["7기 · 경화님 (디지털 튜터)", "“함께 만들고 발전시켜 나가는 시간이었습니다”", "세대가 함께 시니어 산업 비즈니스 아이디어를 구체화해 나가는 과정이 정말 좋았습니다. 제가 가진 지식과 경험을 나누고, 청년들이 가진 새로운 생각을 들으면서 서로의 강점이 자연스럽게 이어지는 느낌이었어요. 일방적으로 배우는 관계가 아니라, 함께 만들고 발전시켜 나가는 시간이어서 더 의미 있었습니다."],
        ["7기 · 연숙님 (외국계 간호사)", "“참여하길 정말 잘했다는 생각이 듭니다”", "외국에서 오랫동안 간호사로 일하면서 시니어 산업에 관심이 커졌는데, 막상 젊은 세대는 이 문제를 어떻게 바라보는지 늘 궁금했어요. 여기 와서 그 생각들을 직접 들을 수 있어서 정말 좋았습니다. 시니어 산업을 진지하게 고민하는 청년들이 이렇게 많다는 게 신기했고, 대화를 나누다 보니 저도 많이 배우고 관점이 확 넓어졌어요. 참여하길 정말 잘했다는 생각이 듭니다."],
        ["7기 · 명조님 (LG전자)", "“오히려 제가 더 많이 배우는 시간이었어요”", "젊은 청년들과 공통의 관심사로 이렇게 대화를 나눈 게 정말 오랜만인데, 각자의 경험과 시각을 편하게 나누다 보니 저도 어느 순간 마음이 열리고, 오히려 제가 더 많이 배우는 시간이었어요. 앞으로도 이런 세대 간 대화 자리가 더 많아졌으면 좋겠네요."],
        ["6기 · 승미님 (WEMADE)", "“'나도 할 수 있겠다'는 확신을 오랜만에 느꼈습니다”", "시니어 산업에 관심이 있었지만 막상 어디서부터 시작해야 할지 막막했어요. 개발자라서 늘 기술로 문제를 해결하는 일에 익숙했는데, 여기서는 아이디어를 꺼내기만 하면 그냥 흘려보내지 않고 다 같이 붙어서 파고들어 줘서 진심으로 같이 고민해주는 느낌이었습니다. '나도 할 수 있겠다'는 확신을 오랜만에 느꼈습니다."],
        ["6기 · 유빈님 (카카오모빌리티)", "“창업 프로세스를 배우며 빠르게 고도화할 수 있었습니다”", "부모님 세대가 겪는 문제를 그냥 지켜보기만 하는 게 늘 답답해서 창업으로 풀어보고 싶었습니다. 그러나 어떻게 시작할지 전혀 감이 오지 않았어요. 그런데 여기 와서 같은 관심사를 가진 분들이랑 얘기 나누고, 실제로 문제를 해결하는 방법과 창업 프로세스를 배우다 보니 빠른 속도로 고도화할 수 있었습니다."],
        ["6기 · 정준님 (스타트업 대표)", "“협력할 수 있는 파트너까지 생겼습니다”", "사내벤처로 창업을 시작했는데, 솔직히 네트워킹이나 의견을 나눌 곳이 거의 없었어요. 같은 문제를 고민하는 사람을 찾는 것도 쉽지 않았고요. 그런데 여기 들어오니까 좋은 인사이트도 많이 배우고, 사업 얘기를 편하게 할 수 있는 분들을 만나게 됐어요. 협력할 수 있는 파트너까지 생겨서 정말 큰 힘이 됐습니다."],
        ["6기 · 진석님 (스타트업 대표)", "“다들 실제 경험을 아낌없이 공유해줬어요”", "시니어 헬스케어 스타트업을 운영하면서 정보가 너무 부족했는데, 다들 실제 경험을 아낌없이 공유해줘서 큰 도움이 됐어요. 팀원들과 함께 문제를 풀어가는 경험이 사업에 큰 도움이 되었습니다."],
        ["6기 · 덕성님 (한국중앙연구원 박사)", "“서로 배우고 아이디어를 나누는 과정이 즐거웠습니다”", "중국에서 의료·헬스케어 분야에 오래 있었고 시니어 산업에 관심이 많았지만, 젊은 세대와 깊이 이야기를 나눌 기회가 없었습니다. 여기서는 서로 배우고 아이디어를 나누는 과정이 정말 즐거웠고 큰 인사이트를 얻었습니다. 앞으로 한국과 중국이 시니어 산업에서 함께 협력할 기회가 생기면 좋겠습니다."],
        ["6기 · 준일님 (한국노인인력개발원)", "“마음도 시야도 한층 더 확장된 느낌이에요”", "다른 세대와 자연스럽게 이야기 나눈 게 너무 오랜만이었어요. 서로에게 배우는 느낌이 참 좋았습니다. 이렇게 뛰어나고 멋진 분들이 많은 줄 몰랐고, 또 젊은 분들과 진지하게 시니어 산업을 이야기할 기회가 거의 없었는데 너무 즐겁고 새로웠습니다. 덕분에 마음도 시야도 한층 더 확장된 느낌이에요."],
        ["5기 · 혜리님 (서울대 농생대 대학원)", "“사고 확장과 진로에 큰 도움이 되었어요”", "고령친화식품 창업 쪽에 관심이 많았는데 저와 같은 관심사를 가진 분들을 찾기 너무 어려웠어요. 그런데 여기서는 다양한 분들과 함께 배우고 교류할 수 있어서 정말 좋았습니다. 마음 맞는 분들과 편하게 이야기 나누고 사업 아이디어를 주고받으면서 사고 확장과 진로에 큰 도움이 되었어요."],
        ["4기 · 정현님 (LG전자)", "“비슷한 관심사를 가진 분들과 얘기하며 힘이 많이 났습니다”", "황혼 육아 서비스를 기획하면서 혼자 고군분투하다 보니 막히는 부분이 많았는데, 우연히 시니어퓨처를 알게 되어서 비슷한 관심사를 가진 분들이랑 얘기하다 보니 재밌고 힘이 많이 났습니다."],
        ["4기 · 설빈님 (삼성병원 간호사)", "“'나만 이런 생각 한 게 아니구나' 느꼈어요”", "시니어 헬스케어에 관심 있지만 대화 나눌 사람이 없었거든요. 여기서는 그게 너무 자연스러웠어요. '나만 이런 생각 한 게 아니구나'라고 느낀 게 참 좋았습니다."],
        ["4기 · 승현님 (배달의민족)", "“UX 시야가 완전히 넓어졌어요”", "UX 시야가 완전히 넓어졌어요. 활동 중 시니어 자서전 서비스를 기획하면서 재미도 많이 느끼고 다양한 사람들의 피드백을 들을 수 있어서 좋았습니다."],
        ["4기 · 성수님 (삼성전자)", "“계속 더 찾아보고 싶어지는 경험이었습니다”", "약학 쪽으로만 보던 시야가 산업 전체로 확장됐어요. 한 번 배우고 끝나는 게 아니라 계속 더 찾아보고 싶어지는 경험이었습니다."],
        ["3기 · 시현님 (연세대 심리 대학원)", "“끝나고도 서로 응원해주는 관계가 된 게 큰 선물 같아요”", "심리학적으로 시니어 세대가 겪는 문제가 정말 크다는 걸 알면서도 혼자 고민만 하고 있었는데, 여기서는 그 문제를 진지하게 다루고 함께 스터디하며 해결 방법을 같이 모색할 수 있어서 좋았습니다. 프로젝트를 하면서 팀원들과 금방 친해졌고, 끝나고도 계속 교류하면서 서로 응원해주는 관계가 된 것도 큰 선물 같아요."],
        ["2기 · 승현님 (서울대 보건대학원)", "“쓰고 있던 논문을 정리하는 데도 도움이 됐어요”", "시니어 산업을 연구하면서 서로 소통할 수 있는 공간이 정말 필요했는데, 여기서 마음껏 이야기 나눌 수 있어 좋았습니다. 덕분에 쓰고 있던 논문도 한층 더 깔끔하게 정리하는 데 도움이 됐어요."],
        ["2기 · 태훈님 (행정사)", "“평소 접하기 어려운 분들을 만나 인사이트를 많이 얻었습니다”", "시니어 산업 안에서 네트워킹을 하다 보니 평소에는 접하기 어려운 시니어 관심사를 가진 사람들을 만나 편하게 이야기 나눌 수 있었습니다. 좋은 사람들을 많이 알게 되면서 인사이트도 정말 많이 얻었습니다."],
        ["태성님 (케어링 대표)", "“혼자가 아니라 같이 성장하고 있다는 느낌이었어요”", "시니어 산업을 다루는 커뮤니티를 본 적이 없었는데, 이렇게 같은 업계 사람들과 연결되고 활동하는 곳이 있다는 게 처음엔 정말 신기했어요. 다들 각자 경험과 의견을 아낌없이 나누다 보니 새로운 인사이트가 계속 생기고, 혼자가 아니라 같이 성장하고 있다는 느낌이 들어서 큰 위로가 됐습니다."],
        ["대영님 (더뉴그레이 공동대표)", "“세대가 섞여 같은 문제를 고민하는 모습이 좋았습니다”", "세대가 섞여 같은 문제를 고민하고 인사이트를 나누는 모습이 정말 좋았습니다. 앞으로도 이렇게 좋은 분들과 계속 협력하고 성장하고 싶습니다."],
        ["성금님 (한국시니어TV 대표)", "“젊은 세대가 시니어 산업을 진지하게 다루는 게 인상 깊었습니다”", "젊은 세대가 시니어 산업을 이렇게 진지하게 다루고 있다는 게 인상 깊었습니다. 앞으로도 이런 활동이 계속되면 좋겠고, 다들 오래 힘 있게 이어가길 응원합니다."],
        ["종수님 (MYSC 심사역)", "“시니어의 지혜와 지식이 제대로 전달되는 점이 좋았어요”", "시니어 일자리 문제에 관심이 많아서 계속 고민하고 있었는데, 여기서는 시니어 분들이 가진 지혜와 지식이 제대로 전달될 수 있는 점이 정말 좋았어요. 이런 흐름이 더 확산되면 시니어 일자리의 의미가 완전히 달라질 것 같아서 진심으로 응원하고 싶습니다."],
        ["태영님 (블루포인트파트너스 심사역)", "“좋은 딥테크 아이디어를 다양하게 접할 수 있었습니다”", "시니어 산업 속 딥테크 아이디어에 관심이 많았는데, 좋은 아이디어들을 다양하게 접할 수 있어 신선하고 인상 깊은 시간이었습니다."],
        ["슬아님 (삼성KPMG 컨설턴트)", "“시니어 산업을 훨씬 잘 이해하게 됐습니다”", "시니어 산업 커뮤니티에 관심이 많았는데, 여기서 아이디어를 훨씬 더 많이 얻게 됐어요. 다양한 사람들과 네트워킹하며 시니어 산업을 훨씬 잘 이해하게 됐습니다."],
        ["수길님 (MENTORY 사업개발)", "“지금 하고 있는 일에도 정말 많은 도움이 됐습니다”", "시니어 쪽으로 사업을 고민하고 있었는데, 여기서 좋은 인사이트도 많이 얻고 네트워크도 잘 형성돼서 현재 하고 있는 일에도 정말 많은 도움이 됐습니다."],
        ["기호님 (행복한삶 대표)", "“진지하게 시니어 산업만을 다루는 단체는 처음 봤어요”", "시니어 산업에서 오래 활동해왔지만, 이렇게 진지하게 시니어 산업만을 다루고 교류하는 단체를 본 적이 없었어요. 그래서 참여하는 내내 너무 좋았고, 이런 활동이 오래 계속되면 좋겠고, 진심으로 많은 응원을 보내고 싶습니다."],
        ["한솔님 (보살핌 대표)", "“함께 산업 자체를 키워나갈 수 있겠다는 기대가 생겼어요”", "다양한 분들과 네트워킹하면서 서로 다른 관점을 배우는 시간이 정말 좋았습니다. 다들 시니어 산업에 진심이고, 함께 활동하면서 산업 자체를 더 키워나갈 수 있겠다는 기대가 생겼어요."]
      ], _ = {
        course: {
          who: [ "장기요양기관을 새로 열었거나 인수를 준비하는 원장님", "평가·인력 기준이 매번 헷갈리는 실무 책임자", "요양 산업으로 커리어를 옮기려는 30~50대 직장인" ],
          points: [ [ "수가 구조", "등급별 수가와 가산 항목을 표 하나로 정리" ], [ "인력 기준", "배치 기준과 대체 인력 운영법" ], [ "평가 대비", "지표별 준비 서류 체크리스트" ] ],
          summary: "총 6회 · 회당 90분 · 온라인 라이브 + 다시보기 30일",
          chapters: [ [ "장기요양 제도 한눈에 보기: 등급·급여·수가", "90분" ], [ "인력 배치 기준과 채용·교육 운영", "90분" ], [ "수가 청구 실무와 자주 생기는 환수 사례", "90분" ], [ "평가 지표별 준비 서류 체크리스트", "90분" ], [ "보호자 상담과 민원 대응 스크립트", "90분" ], [ "운영 개선 Q&A와 우리 기관 진단 실습", "90분" ] ],
          teacher: {
            name: "김지현",
            role: "요양 & 돌봄 · 前 OO요양원 원장 · 장기요양 컨설턴트",
            bio: "요양원을 10년간 운영하며 평가 최우수 등급을 4회 받았어요. 지금은 신규 기관 200여 곳의 운영을 돕고 있어요.",
            href: "/experts#e1"
          },
          faq: [ [ "다시보기는 언제까지 볼 수 있나요?", "라이브가 끝난 다음 날부터 30일 동안 나의 강의실에서 다시 볼 수 있어요." ], [ "회사 교육비로 결제하고 세금계산서를 받을 수 있나요?", "네. 결제 후 고객센터로 사업자등록증을 보내 주시면 세금계산서를 발행해 드려요." ], [ "수강 신청 후 환불은 어떻게 하나요?", "마이페이지 › 결제 내역에서 환불을 신청할 수 있어요. 아래 환불 규정을 확인해 주세요." ] ],
          refund: "개강 전 100% 환불 · 1회차 수강 후 2/3 환불 · 3회차 이후 환불 불가 (예시 규정)"
        },
        live: {
          topics: [ "요양기관 평가 지표 6개, 무엇부터 준비할까", "평가 전 2주, 서류 점검 순서", "작년 평가에서 가장 많이 감점된 항목 TOP 5" ],
          speaker: {
            name: "김지현",
            bio: "요양 컨설턴트 · 前 OO요양원 원장. 평가 최우수 등급 4회, 신규 기관 200여 곳 운영 자문."
          },
          guide: [ [ "방식", "Zoom 온라인 라이브 (질문은 채팅으로)" ], [ "입장 링크", "시작 30분 전 문자·이메일 발송" ], [ "다시보기", "종료 후 7일간 신청자에게 제공" ], [ "대상", "요양기관 원장·실무자, 요양 산업 관심자" ] ],
          courses: [ 3, 4 ]
        },
        meet: {
          intro: "요양기관을 운영하는 원장님들이 매주 모여 운영 고민을 나눠요. 이번 기수는 ‘평가 대비’와 ‘인력 채용’을 주제로 4주 동안 진행해요.",
          checks: [ "기관 운영 1년 이상 원장·관리자", "매 회차 사례 1개씩 준비해 공유", "모임 후 자유 네트워킹 30분" ],
          schedule: [ [ "1주차", "오리엔테이션 · 우리 기관 소개" ], [ "2주차", "평가 대비 사례 공유" ], [ "3주차", "인력 채용·교육 사례 공유" ], [ "4주차", "정리 · 다음 기수 계획" ] ],
          host: {
            name: "윤미래 · 시니어퓨처 파트너 연사",
            bio: "방문요양 프랜차이즈 대표, 지점 120곳 운영"
          },
          address: "서울 성동구 성수이로 00, 3층 시니어퓨처 라운지 (예시)"
        }
      }, w = {}, y = (a.details || a.courses || {})[n] || {};
      for (t in _[r]) w[t] = _[r][t];
      for (t in y) w[t] = y[t];
      var S = pe("div", "sf-pv sf-pv--" + r), x = pe("div", "sf-pv__main"), C = pe("aside", "sf-pv__side");
      C.setAttribute("data-sf-sticky", ""), C.setAttribute("data-gap", "24"), e.parentNode.insertBefore(S, e);
      var q = e.querySelector(".goods_thumbs_wrap");
      q && x.appendChild(q), C.appendChild(s), S.appendChild(x), S.appendChild(C), e.hidden = !0, 
      document.documentElement.classList.add("sf-pv-on");
      var I = c && (SFUI.cats || []).filter((function(e) {
        return e[0] === i.cat;
      }))[0], F = o ? [ "/live", "무료 라이브" ] : p ? [ "/community", "커뮤니티" ] : [ "/course", "교육" ], A = pe("nav", "sf-pv-crumb", '<a href="' + F[0] + '">' + F[1] + "</a>" + (I ? '<span aria-hidden="true">›</span><a href="/course?cat=' + I[0] + '">' + oe(I[1]) + "</a>" : "") + '<span aria-hidden="true">›</span><span aria-current="page">' + oe(l.split(":")[0]) + "</span>");
      A.setAttribute("aria-label", "현재 위치"), S.parentNode.insertBefore(A, S);
      var U = s.querySelector("header"), j = Date.now(), k = SFUI.parseDate(i.deadline), B = SFUI.parseDate(i.start), E = SFUI.parseDate(i.end), M = B && j >= B || k && j >= k, D = M ? '<span class="sf-tag sf-tag--closed">모집 마감</span>' : !M && k && k - j <= 2592e5 ? '<span class="sf-tag sf-tag--soon">마감 임박</span>' : '<span class="sf-tag sf-tag--recruit">모집중</span>', L = "";
      // (10/23 2차) 꼬리표 = 목록에서 읽어 둔 아임웹 상품 배지(없으면 아래 badgeFetch 가 목록을 한 번 받아 채워요)
      var ht = null;
      try { ht = (SFUI.__hash || {})[n] || JSON.parse(sessionStorage.getItem("sf_badges") || "{}")[n] || null; } catch (x) {}
      c && (ht || i.tags) && (L = SFUI.tagHtml ? SFUI.tagHtml(ht || i.tags) : ve(i.tags)), o && (L = D + (k && !M ? '<span class="sf-tag sf-tag--dday">D-' + Math.max(0, Math.ceil((k - j) / 864e5)) + "</span>" : "") + '<span class="sf-tag sf-tag--free">무료</span>'), 
      p && (L = '<span class="sf-tag sf-tag--' + ((SFUI.isEvent ? SFUI.isEvent(i.kind) : "이벤트" === i.kind) ? "event" : "meet") + '">' + oe(i.kind || "모임") + "</span>" + D), 
      ht && !c && SFUI.tagHtml && (L += SFUI.tagHtml(ht));
      U && L && U.insertBefore(pe("div", "sf-tags sf-pv-tags", L), U.firstChild);
      ht || badgeFetch(n, (function(e) {
        if (e && SFUI.tagHtml) {
          var s = U && U.querySelector(".sf-pv-tags"), t = SFUI.tagHtml(e);
          c ? s ? s.innerHTML = t : U && U.insertBefore(pe("div", "sf-tags sf-pv-tags", t), U.firstChild) : s && s.insertAdjacentHTML("beforeend", t);
        }
      }));
      var N = s.querySelector(".pay_detail");
      if (N) {
        var T = N.querySelector(".real_price"), H = function(e) {
          return Number(String(e).replace(/[^0-9]/g, "")) || 0;
        }, O = [].filter.call(N.querySelectorAll("span, del, s, strike"), (function(e) {
          return e !== T && 0 === e.childElementCount && /원/.test(e.textContent) && (/^(DEL|S|STRIKE)$/.test(e.tagName) || /line-through/.test(getComputedStyle(e).textDecorationLine));
        }))[0];
        if (T && O && H(O.textContent) > H(T.textContent)) {
          var R = Math.round(100 * (1 - H(T.textContent) / H(O.textContent)));
          N.insertBefore(pe("div", "sf-pv-was", "<b>" + R + "%</b><s>" + oe(O.textContent.trim()) + "</s>"), N.firstChild), 
          O.style.display = "none";
        }
      }
      var z = s.querySelector(".buy_btns.pc ._btn_buy"), P = o ? "무료로 신청하기" : p ? "참가 신청하기" : "수강 신청하기";
      z && (z.textContent = P), s.querySelectorAll(".buy_btns.mobile ._btn_buy, .buy_btns.mobile .defualt.buy").forEach((function(e) {
        e.textContent = P;
      }));
      var Q = s.querySelector(".opt_block.total .body_font_color_70");
      Q && (Q.textContent = "상품 금액");
      var V = s.querySelector(".buy_btns.pc");
      if (o) {
        U && k && U.appendChild(pe("div", "sf-countdown sf-pv-cd", '<span data-sf-countdown-label>신청 마감까지 남은 시간</span><span class="sf-pv-cd__t"><b data-unit="d">0</b>일 <b data-unit="h">00</b>시간 <b data-unit="m">00</b>분 <b data-unit="s">00</b>초</span>'));
        var K = U && U.querySelector(".sf-pv-cd");
        K && (K.setAttribute("data-sf-countdown", ""), K.setAttribute("data-deadline", i.deadline), 
        K.setAttribute("data-ended-text", "신청이 마감되었어요"), d && U.insertBefore(K, d)), B && V && V.parentNode.insertBefore(pe("p", "sf-pv-when", h + "<span>" + le(B) + " " + fe(B) + (E ? " – " + fe(E) : "") + "</span>"), V), 
        V && V.parentNode.insertBefore(pe("button", "sf-pv-sharebtn", "공유하기"), V.nextSibling);
        var Z = s.querySelector(".sf-pv-sharebtn");
        Z && (Z.type = "button", Z.setAttribute("data-sf-share-link", "")), M && z && (z.textContent = "신청이 마감되었어요", 
        z.classList.add("is-disabled"));
      } else {
        var $ = pe("div", "sf-pv-share", "<div><strong>링크로 구매 시, 최대 " + oe(window.SF_SHARE && SF_SHARE.rate || "00%") + ' 적립</strong><span>친구가 결제하면 적립금이 쌓여요</span></div><button type="button" class="sf-pv-share__btn" data-sf-reward-share data-title="' + oe(l) + '">공유하고 수익받기</button>');
        V && V.parentNode.insertBefore($, V.nextSibling);
      }
      function meetInfo() {
        return '<section class="sf-pv-sec sf-pv-meetinfo"><h2>모임 안내</h2><div class="sf-pv-infobox">' + [ [ h, "일시", (i.date || (B ? le(B) : "")) + (B ? " · " + fe(B) : "") ], [ b, "장소", i.place || "" ], [ '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', "마감", k ? le(k) + "까지" : "" ] ].filter((function(e) {
          return e[2];
        })).map((function(e) {
          return "<p>" + e[0] + "<b>" + e[1] + "</b><span>" + oe(e[2]) + "</span></p>";
        })).join("") + "</div></section>";
      }
      // (10/26) 아임웹이 상세 글을 <template id="prodDetailPC"> 에 두고 늦게 꺼내요 → 비어 있으면 여기서 먼저 꺼내 읽어요
      (function() {
        var w0 = document.getElementById("prod_detail_body"), tp = document.getElementById("prodDetailPC") || document.getElementById("prodDetailMobile");
        w0 && tp && tp.content && !w0.textContent.trim() && w0.appendChild(tp.content.cloneNode(!0));
      })();
      var G = document.querySelector(".detail_detail_wrap"), J = document.querySelector(".detail_qna_wrap"), W = document.getElementById("prod_detail_body"), X = '<div class="sf-pv-own" data-sf-own></div>', Y = [ [ "sf-pv-intro", "소개" ] ], ee = "", OW = W && ownSecs(W);
      // (10/23 2차) 예시 내용(가짜 강사·커리큘럼)은 예전부터 있던 상품(코드 표)이나 SF_SITE.details 가 있는 상품만. 새 상품은 쓴 글만 '소개'로
      !OW && W && (!(SFUI.__baseItems || {})[n] || SFUI.__baseItems[n].past) && !(a.items || {})[n] && !(a.details || a.courses || {})[n] && (OW = splitRefund({ pre: [].filter.call(W.childNodes, (function(e) {
        return !(1 === e.nodeType && /^(STYLE|SCRIPT)$/.test(e.tagName));
      })), secs: [] }));
      if (OW) {
        // (10/23) 상세 설명에 [제목] 줄이 있으면 예시 내용 대신 사장님이 쓴 글로 탭을 만들어요
        p && (ee += meetInfo());
        var hasPre = OW.pre.some((function(e) {
          return (e.textContent || "").trim() || e.querySelector && e.querySelector("img,iframe,video,table");
        }));
        Y = hasPre ? [ [ "sf-pv-intro", "소개" ] ] : [], hasPre && (ee += '<section id="sf-pv-intro" class="sf-pv-sec sf-pv-ownsec" data-sf-own-i="pre"><h2>소개</h2></section>');
        OW.secs.forEach((function(e, s) {
          var t = s || hasPre ? "sf-pv-d" + (s + 1) : "sf-pv-intro";
          Y.push([ t, e.t ]), ee += '<section id="' + t + '" class="sf-pv-sec sf-pv-ownsec" data-sf-own-i="' + s + '"><h2>' + oe(e.t) + "</h2></section>";
        })), (c || o || p) && (Y.push([ "sf-pv-review", "후기" ]), ee += ue()); // (10/26) 모임도 교육처럼 후기 탭
      } else if (c) {
        Y.push([ "sf-pv-curri", "커리큘럼" ], [ "sf-pv-teacher", "강사" ], [ "sf-pv-review", "후기" ]), 
        ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>이런 분께 추천해요</h2>' + he(w.who) + "</section>", 
        ee += '<section class="sf-pv-sec"><h2>이 강의에서 배우는 것</h2><ol class="sf-pv-points">' + w.points.map((function(e, s) {
          return "<li><small>0" + (s + 1) + "</small><strong>" + oe(e[0]) + "</strong><p>" + oe(e[1]) + "</p></li>";
        })).join("") + "</ol>" + X + "</section>", ee += '<section id="sf-pv-curri" class="sf-pv-sec"><h2>커리큘럼</h2><p class="sf-pv-sub">' + oe(w.summary) + '</p><div class="sf-pv-chapters" data-sf-accordion>' + w.chapters.map((function(e, s) {
          return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><b>' + (s + 1) + "회</b><span>" + oe(e[0]) + "</span><em>" + oe(e[1] || "") + "</em></button><div data-sf-acc-panel>" + oe(e[2] || "회차별 자료와 실습 과제가 함께 제공돼요.") + "</div></div>";
        })).join("") + "</div></section>";
        var se = w.teacher;
        ee += '<section id="sf-pv-teacher" class="sf-pv-sec"><h2>강사 소개</h2><div class="sf-pv-teacher"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(se.name) + "</strong><small>" + oe(se.role) + "</small><p>" + oe(se.bio) + '</p><a href="' + oe(se.href || "/experts") + '">강사 프로필 보기 <span aria-hidden="true">›</span></a></div></div></section>', 
        ee += ue(), ee += '<section class="sf-pv-sec"><h2>자주 묻는 질문</h2><div class="sf-pv-faq" data-sf-accordion data-single>' + w.faq.map((function(e) {
          return '<div data-sf-acc-item><button type="button" data-sf-acc-trigger><b>Q</b><span>' + oe(e[0]) + "</span></button><div data-sf-acc-panel>" + oe(e[1]) + "</div></div>";
        })).join("") + '</div><div class="sf-pv-refund"><strong>환불 규정</strong><p>' + oe(w.refund) + "</p></div></section>";
      } else if (o) {
        Y.push([ "sf-pv-speaker", "연사" ], [ "sf-pv-guide", "진행 안내" ], [ "sf-pv-review", "후기" ]);
        var te = (B ? [ [ "일시", le(B) + " " + fe(B) + (E ? " – " + fe(E) : "") ] ] : []).concat(w.guide);
        ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>이런 내용을 다뤄요</h2>' + he(w.topics) + X + "</section>", 
        ee += '<section id="sf-pv-speaker" class="sf-pv-sec"><h2>연사 소개</h2><div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.speaker.name) + "</strong><p>" + oe(w.speaker.bio) + "</p></div></div></section>", 
        ee += '<section id="sf-pv-guide" class="sf-pv-sec"><h2>진행 안내</h2><dl class="sf-pv-guide">' + te.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl></section>", ee += '<section class="sf-pv-sec"><h2>라이브 후 더 깊게 배우고 싶다면</h2><ul class="sf-pv-more">' + w.courses.filter((function(e) {
          return g[e];
        })).map((function(e) {
          var s = g[e], t = SFUI.shopItems && SFUI.shopItems()[e] || {};
          return '<li><a class="sf-ccard" href="/course/?idx=' + e + '"><span class="sf-ccard__thumb"><img src="https://cdn.imweb.me/upload/S20261016dceb77aecc2e2/' + s[2] + '" alt="" loading="lazy"></span><span class="sf-ccard__body"><strong>' + oe(s[0]) + "</strong><p>" + oe(s[1]) + '</p><span class="sf-tags">' + ve(t.tags || []) + "</span></span></a></li>";
        })).join("") + "</ul></section>", ee += ue();
      } else {
        Y.push([ "sf-pv-schedule", "프로그램 일정" ], [ "sf-pv-host", "호스트" ], [ "sf-pv-review", "후기" ]), 
        ee += meetInfo(), ee += '<section id="sf-pv-intro" class="sf-pv-sec"><h2>모임 소개</h2><p class="sf-pv-lead">' + oe(w.intro) + "</p>" + he(w.checks) + X + "</section>", 
        ee += '<section id="sf-pv-schedule" class="sf-pv-sec"><h2>프로그램 일정</h2><dl class="sf-pv-guide sf-pv-guide--rows">' + w.schedule.map((function(e) {
          return "<div><dt>" + oe(e[0]) + "</dt><dd>" + oe(e[1]) + "</dd></div>";
        })).join("") + "</dl></section>", ee += '<section id="sf-pv-host" class="sf-pv-sec"><h2>호스트</h2><div class="sf-pv-teacher sf-pv-teacher--s"><span class="sf-pv-teacher__photo" aria-hidden="true"></span><div><strong>' + oe(w.host.name) + "</strong><p>" + oe(w.host.bio) + "</p></div></div></section>", 
        ee += ue(); // (10/26) 호스트 아래 '장소'는 빼고(장소는 위 모임 안내에) 후기
      }
      Y.push([ "sf-pv-qna", "문의" ]);
      var ae = pe("nav", "sf-tabs sf-pv-tabs", Y.map((function(e, s) {
        return '<a href="#' + e[0] + '" class="sf-tab' + (s ? "" : " is-active") + '">' + e[1] + "</a>";
      })).join(""));
      OW && ae.classList.add("sf-pv-tabs--own"), ae.setAttribute("data-sf-anchor-tabs", ""), ae.setAttribute("data-offset", "130"), 
      ae.setAttribute("aria-label", "상세 내용 바로가기"), x.appendChild(ae);
      var ne = pe("div", "sf-pv-secs", ee);
      x.appendChild(ne);
      var ie = ne.querySelector("[data-sf-own]");
      G && ie && ie.appendChild(G);
      var re = document.querySelector(".detail_detail_wrap_mobile");
      if (re && ie && ie.appendChild(re), W && ie && !W.textContent.trim() && !W.querySelector("img") && ie.classList.add("is-empty"), 
      J) {
        var ce = pe("section", "sf-pv-sec sf-pv-qna");
        ce.id = "sf-pv-qna", ce.appendChild(pe("h2", "", "문의")), ce.appendChild(J), ne.appendChild(ce);
      }
      OW && ([].forEach.call(ne.querySelectorAll("[data-sf-own-i]"), (function(e) {
        var s = e.getAttribute("data-sf-own-i"), t = pe("div", "sf-pv-ownbody shop_view_body fr-view");
        ("pre" === s ? OW.pre : OW.secs[+s].n).forEach((function(e) {
          t.appendChild(e);
        })), [].forEach.call(t.querySelectorAll("img"), (function(e) {
          var s = e.getAttribute("data-src") || e.getAttribute("data-original");
          s && !e.getAttribute("src") && (e.src = s);
        })), e.appendChild(t);
      })), G && (G.hidden = !0), re && (re.hidden = !0));
      document.querySelectorAll(".categorize.review-box, .detail_review_wrap").forEach((function(e) {
        e.hidden = !0;
      })), window.SFUI && SFUI.init && SFUI.init(S);
    }
  }
  // (10/23) 상세 설명을 [제목] 줄로 나눠요. '[커리큘럼]'·'【강사 소개】'처럼 괄호로 감싼 20자 이내 한 줄만 제목으로 봐요
  //   첫 제목 앞의 글은 '소개' 칸. 제목 줄이 없으면 null → 예전처럼 예시 내용 + 상세 설명
  function ownSecs(W) {
    // (10/26) 아임웹이 본문을 겹겹이 감싸고 옆에 '하단 공통' 상자를 붙이면 [제목] 줄을 못 찾던 문제 → 제목 줄이 들어 있는 상자를 직접 찾아요
    var RE = /^\s*[\[【]\s*([^\[\]【】]{1,20}?)\s*[\]】]\s*$/, hd = [].filter.call(W.querySelectorAll("p,h1,h2,h3,h4,h5,h6,div"), (function(x) {
      return !x.querySelector("p,div,img,iframe,video,table") && RE.test(x.textContent);
    }))[0];
    if (!hd) return null;
    var e = hd.parentElement, top = e;
    while (top.parentElement && top.parentElement !== W) top = top.parentElement;
    var t = [], a = [], n = null;
    [].slice.call(e.childNodes).forEach((function(e) {
      if (1 !== e.nodeType || !/^(STYLE|SCRIPT)$/.test(e.tagName)) {
        var s = 1 === e.nodeType && !e.querySelector("img,iframe,video,table") && RE.exec(e.textContent);
        s ? (n = { t: s[1], n: [] }, t.push(n)) : (n ? n.n : a).push(e);
      }
    }));
    // 본문 상자 바깥(같은 줄의 형제 — 예: 하단 공통 교환·환불 안내)은 마지막 칸 뒤로
    if (e !== W && top !== e) [].slice.call(W.childNodes).forEach((function(x) {
      x !== top && !(1 === x.nodeType && /^(STYLE|SCRIPT)$/.test(x.tagName)) && (x.textContent || "").trim() && (n ? n.n : a).push(x);
    })); else if (e !== W) [].slice.call(W.childNodes).forEach((function(x) {
      x !== e && !(1 === x.nodeType && /^(STYLE|SCRIPT)$/.test(x.tagName)) && (x.textContent || "").trim() && (n ? n.n : a).push(x);
    }));
    return t.length ? splitRefund({ pre: a, secs: t }) : null;
  }
  // (10/23 2차) '상품 상세 하단 공통'(교환·반품 안내 '<교환 및 반품 가능 기간>' 등)은 마지막 칸에 섞이지 않게 '교환·환불 안내' 칸으로 떼어 내요
  function splitRefund(o) {
    var last = o.secs.length ? o.secs[o.secs.length - 1].n : o.pre, k = -1;
    last.some((function(e, s) {
      return /^\s*[<＜〈]\s*(교환|반품|환불)/.test(e.textContent || "") && (k = s, !0);
    }));
    k >= 0 && o.secs.push({ t: "교환·환불 안내", n: last.splice(k) });
    return o;
  }
  // 상세 화면에 꼬리표가 아직 없으면(목록을 거치지 않고 바로 들어온 경우) 같은 목록 주소를 한 번 받아 배지를 읽어요
  function badgeFetch(idx, done) {
    if (!idx || !SFUI.badgeTags || !window.fetch || !window.DOMParser) return;
    var pm = /preview_mode=1/.test(location.search) ? "?preview_mode=1" : "";
    fetch((location.pathname.replace(/\/$/, "") || "/") + pm, { credentials: "same-origin" }).then((function(e) {
      return e.ok ? e.text() : "";
    })).then((function(e) {
      var s = e && new DOMParser().parseFromString(e, "text/html"), a = {}, r = s ? [ s ].concat([].map.call(s.querySelectorAll("template"), (function(e) {
        return e.content;
      }))) : [];
      // 상품 카드는 목록 위젯의 그림자 영역 틀(<template>) 안에 들어 있어요
      r.forEach((function(s) {
        [].forEach.call(s.querySelectorAll("li.iw-shop-card[data-system-product-id]"), (function(e) {
        var s = SFUI.badgeTags(e.querySelector(".iw-shop-product-badges"));
          s && (a[e.getAttribute("data-system-product-id")] = s, SFUI.saveBadgeTags(e.getAttribute("data-system-product-id"), s));
        }));
      }));
      done(a[idx] || null);
    }))["catch"]((function() {}));
  }
  function oe(e) {
    return v.textContent = null == e ? "" : String(e), v.innerHTML.replace(/"/g, f + "#34;");
  }
  function pe(e, s, t) {
    var a = document.createElement(e);
    return s && (a.className = s), null != t && (a.innerHTML = t), a;
  }
  function de(e) {
    return (e < 10 ? "0" : "") + e;
  }
  function le(e) {
    var s = new Date(e);
    return s.getMonth() + 1 + "월 " + s.getDate() + "일 (" + u[s.getDay()] + ")";
  }
  function fe(e) {
    var s = new Date(e);
    return de(s.getHours()) + ":" + de(s.getMinutes());
  }
  function ve(e) {
    return SFUI.shopTags ? e.map((function(e) {
      var s = SFUI.shopTags[e];
      return s ? '<span class="sf-tag sf-tag--' + s[0] + '">' + s[1] + "</span>" : "";
    })).join("") : "";
  }
  // (10/23) 상세 '수강생 후기' — 예시 후기 대신 공식 사이트(apply.seniorfuture.kr/reviews)의 실제 멤버 후기. 수강평 게시판에 진짜 후기가 생기면 r3ReviewData 가 그걸로 바꿔요
  function ue() {
    return '<section id="sf-pv-review" class="sf-pv-sec"><div data-sf-carousel><div class="sf-pv-sechead"><div><h2>수강생 후기</h2><p class="sf-pv-sub">시니어퓨처 스터디·네트워킹에 함께한 멤버들의 후기예요</p></div><div class="sf-pv-arrows"><button type="button" class="sf-arrow" data-sf-prev aria-label="이전 후기">‹</button><button type="button" class="sf-arrow" data-sf-next aria-label="다음 후기">›</button></div></div><div class="sf-track sf-pv-reviews" data-sf-track>' + m.map((function(e) {
      return '<a class="sf-review sf-slide" href="/review"><span class="sf-review__course">' + oe(e[0]) + '</span><span class="sf-review__top"><span class="sf-review__quote">' + oe(e[1]) + '</span></span><span class="sf-review__body">' + oe(e[2].length > 76 ? e[2].slice(0, 76).replace(/\s+\S*$/, "") + "…" : e[2]) + '</span><span class="sf-review__more">후기 자세히 보기 →</span></a>';
    })).join("") + '</div></div><a class="sf-pv-allreview" href="/review">후기 전체보기 →</a></section>';
  }
  function he(e) {
    return '<ul class="sf-pv-who">' + e.map((function(e) {
      return "<li>" + oe(e) + "</li>";
    })).join("") + "</ul>";
  }
})
