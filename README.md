# seniorfuture-site

시니어퓨처 사이트(아임웹)의 **공통 꾸밈 코드** 원본과 묶음 파일이에요.
아임웹 관리자 → SEO → Header Code 에는 짧은 연결 코드(`site/dist/header-loader.txt`)만 들어가고,
실제 꾸밈 코드는 이 저장소의 `dist/` 파일을 jsDelivr(무료 전송망)로 받아 써요.

## 왜 이렇게 하나요
- **빨라요**: 예전엔 페이지마다 꾸밈 코드 약 60만 자를 매번 새로 받았어요. 이제 한 번 받으면 브라우저에 저장돼 다음 페이지부터는 바로 써요.
- **되돌리기 쉬워요**: 버전(`v1.0.0` …)마다 파일이 그대로 남아요. 문제가 생기면 Header Code 의 버전 숫자만 예전 것으로 바꾸면 돼요.
- **고친 기록이 남아요**: 무엇을 언제 왜 바꿨는지 커밋 기록으로 남아요.
- **자동 점검**: 올릴 때마다 묶음이 원본과 같은지, 매일 아침 공개 사이트가 잘 열리는지 깃허브가 확인해요.

## 폴더
| 폴더 | 내용 |
|---|---|
| `site/src/js/<묶음>/` | 화면 기능 원본(읽기 쉬운 코드). `_order.json` 순서대로 합쳐요 |
| `site/src/css/<묶음>/` | 화면 꾸밈 원본. 파일 맨 위에 `화면 묶음`(common·home·login-join …)과 출처가 적혀 있어요 |
| `site/blocks/` | Header Code 에 그대로 남는 작은 코드(시험 장치 `stage.js`, 설정 `config.js`, 첫 화면 `early.js`) |
| `dist/` | 사이트가 실제로 받는 묶음 `sf.min.css` · `sf.min.js`, 지금 버전 `VERSION` |
| `site/dist/header-loader.txt` | 아임웹 Header Code 에 붙일 코드 |
| `tools/site/` | 묶음 만들기 도구 |
| `tools/check/` | 저장 전 비교 검사(`check.js`), 매일 점검(`daily.js`) |

## 고치는 순서
1. `site/src/...` 원본을 고쳐요(CSS는 순서가 중요해서 파일 순서를 바꾸지 않아요).
2. `dist/VERSION` 의 숫자를 올려요(예: v1.0.0 → v1.0.1).
3. `npm run build` → `dist/` 와 `site/dist/header-loader.txt` 가 새로 만들어져요.
4. 시험 모드(`site/dist/stage-loader.txt`)로 사이트 전체를 비교 검사해요(`tools/check/README.md`).
5. 커밋·푸시하고 같은 이름의 태그(`git tag v1.0.1 && git push --tags`)를 붙여요.
6. 아임웹 Header Code 를 새 `header-loader.txt` 로 바꿔 저장해요.

## 되돌리기
Header Code 안의 `@v1.0.1` 두 군데를 예전 버전(`@v1.0.0`)으로 바꿔 저장하면 끝이에요.

## 안전
- 이 저장소는 공개예요. 비밀번호·키·개인정보는 절대 넣지 않아요(사이트 화면에 이미 보이는 공개 주소만 있어요).
- jsDelivr 가 안 될 때는 깃허브 Pages(`seniorfuture100-pixel.github.io/seniorfuture-site`)에서 대신 받아요.
