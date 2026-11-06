// 수동 배포: 소스 버전 커밋 뒤 node tools/site/cdn-release.js, 이어 git push origin cdn-vX.Y.Z.
// 원본 브랜치·태그·인덱스를 변경하지 않고 dist 3개 파일만 가진 별도 불변 태그를 만들어요.
const fs = require('fs'), cp = require('child_process');
function git(args, input) { return cp.execFileSync('git', args, {encoding:'utf8', input}).trim(); }
if (git(['status','--porcelain'])) throw Error('먼저 배포할 소스와 생성물을 커밋해 주세요.');
const version = fs.readFileSync('dist/VERSION','utf8').trim();
if (!/^v\d+\.\d+\.\d+$/.test(version)) throw Error('잘못된 버전');
const files = git(['ls-tree','--name-only','HEAD:dist']).split('\n').sort();
if (JSON.stringify(files) !== JSON.stringify(['VERSION','sf.min.css','sf.min.js'])) throw Error('dist 파일 목록 확인 필요');
const dist = git(['rev-parse','HEAD:dist']);
const tree = git(['mktree'], '040000 tree ' + dist + '\tdist\n');
const commit = git(['commit-tree',tree,'-m','CDN assets '+version+'; source '+git(['rev-parse','HEAD'])]);
git(['tag','-a','cdn-'+version,commit,'-m','dist-only CDN package '+version]);
console.log('Created cdn-'+version+'; dist tree '+dist);
