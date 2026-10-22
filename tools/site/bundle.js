// 외부 파일(깃허브 → jsDelivr)용 묶음 만들기: node tools/site/bundle.js <버전 예: v1.0.0>
// 먼저 build.js 로 site/build/ 를 만든 뒤 실행해요.
// 결과
//  dist/sf.min.css : CSS 7묶음(ui·patch·r2·r3·r3p·nav·qa)을 지금 순서 그대로 한 파일로
//  dist/sf.min.js  : JS 5묶음(ui·patch·r2·r3·r3b)을 순서 그대로, 묶음마다 try 로 감싸(하나가 멈춰도 나머지는 실행)
//                    + 상품 카드(그림자 영역)에 넣을 CSS(window.SF_SHADOW_CSS)
//  site/dist/header-loader.txt : 아임웹 Header Code 에 붙일 짧은 코드(시험 장치·설정·외부 파일 2개·sf-early)
//  site/dist/stage-loader.txt  : 저장 전 시험 모드용(같은 코드, 시험 장치만 빼고 data-sf-stage 표시)
const fs = require('fs'), path = require('path'), terser = require('terser');
const root = path.resolve(__dirname, '..', '..'), site = path.join(root, 'site');
const ver = process.argv[2]; if (!/^v\d+\.\d+\.\d+$/.test(ver || '')) { console.log('버전을 v1.0.0 처럼 주세요'); process.exit(1); }
const REPO = 'seniorfuture100-pixel/seniorfuture-site';
const CDN = 'https://cdn.jsdelivr.net/gh/' + REPO + '@' + ver + '/dist/';
// jsDelivr 가 안 될 때 대신 받을 곳(깃허브 Pages, 저장소의 같은 파일)
const ALT = 'https://seniorfuture100-pixel.github.io/seniorfuture-site/dist/';
const rd = p => fs.readFileSync(path.join(site, p), 'utf8');
const CSS = ['ui', 'patch', 'r2', 'r3', 'r3p', 'nav', 'qa'], JS = ['ui', 'patch', 'r2', 'r3', 'r3b'];
(async () => {
  const css = CSS.map(b => '/*sf-' + b + '*/' + rd('build/css/' + b + '.css')).join('\n');
  const shadow = 'window.SF_SHADOW_CSS=' + JSON.stringify(rd('build/css/ui.css') + '\n' + rd('build/css/patch.css')) + ';';
  const js = JS.map(b => '/* sf-' + b + ' */\ntry {\n' + rd('build/js/' + b + '.js') + '\n} catch (e) { console.error("[sf-' + b + ']", e); }').join('\n');
  const min = await terser.minify(shadow + '\n' + js, { compress: { passes: 1 }, mangle: true, format: { comments: false } });
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dist/sf.min.css'), css);
  fs.writeFileSync(path.join(root, 'dist/sf.min.js'), '/*! seniorfuture-site ' + ver + ' */\n' + min.code);
  fs.writeFileSync(path.join(root, 'dist/VERSION'), ver + '\n');
  const stage = rd('blocks/stage.js'), config = rd('blocks/config.js'), early = rd('blocks/early.js');
  function loader(st) {
    const tag = st ? ' data-sf-stage' : '';
    return [
      st ? '' : '<script id="sf-stage">' + stage + '</script>',
      '<link rel="expect" href="#doz_footer_wrap" blocking="render" id="sf-expect">',
      '<script id="sf-config"' + tag + '>' + config + '</script>',
      // 외부 CSS(한 번 받으면 브라우저에 저장돼 다음부터 바로 씀) + 다른 코드가 덧붙여 쓰는 빈 자리
      '<link rel="stylesheet" id="sf-css" href="' + CDN + 'sf.min.css" onerror="this.onerror=null;this.href=\'' + ALT + 'sf.min.css\'"' + tag + '>',
      '<style id="sf-patch-css"' + tag + '></style>',
      '<script id="sf-js" src="' + CDN + 'sf.min.js" onerror="var s=document.createElement(\'script\');s.src=\'' + ALT + 'sf.min.js\';s.onload=function(){window.SFUI&&SFUI.init(document)};document.head.appendChild(s)"' + tag + '></script>',
      '<script id="sf-early"' + tag + '>' + early + '</script>'
    ].filter(Boolean).join('\n');
  }
  fs.writeFileSync(path.join(site, 'dist/header-loader.txt'), loader(false));
  fs.writeFileSync(path.join(site, 'dist/stage-loader.txt'), loader(true));
  const gz = b => require('zlib').gzipSync(b).length;
  console.log(ver, 'css', css.length, 'gz', gz(css), '| js', min.code.length, 'gz', gz(min.code), '| header-loader', loader(false).length);
})();
