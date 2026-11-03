// 토스페이 숨김 되돌리기(파트너 다시 열기) — 저장소 파일을 원래대로 돌려요.
//   node tools/pg-restore/restore.js --check   지금 상태에서 되돌릴 수 있는지만 확인(아무것도 안 바꿈)
//   node tools/pg-restore/restore.js           스위치 끄기 + 약관 문구 되돌리기(저장소 파일만). 그다음 빌드·배포·아임웹 저장은 README 순서대로
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const { pairs } = require('./pairs.json');
const FILES = ['site/widgets/terms.code.html', 'docs/약관-관리자용/이용약관.txt', 'docs/약관-관리자용/개인정보처리방침.txt'];
const SWITCH = ['window.SF_PG_HIDE = true;', 'window.SF_PG_HIDE = false;'];

// 브라우저(아임웹 코드 편집기·관리자 약관 칸)에서도 같은 규칙: 한 번 나오면 바꾸고, 0번이면 건너뛰고, 2번 이상이면 멈춤
function applyPairs(text, ps) {
  const log = [];
  for (const p of ps) {
    const n = text.split(p.now).length - 1;
    if (n > 1) throw new Error(`'${p.name}' 이 ${n}번 나와요 — 손으로 확인 필요`);
    if (n === 1) text = text.replace(p.now, p.orig);
    log.push(`${p.name}: ${n ? '되돌림' : '없음(이 파일엔 해당 없음)'}`);
  }
  return { text, log };
}
module.exports = { applyPairs, pairs };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const cfg = path.join(root, 'site/blocks/config.js');
  const c = fs.readFileSync(cfg, 'utf8');
  const on = c.includes(SWITCH[0]);
  console.log(`스위치 SF_PG_HIDE: ${on ? '켜짐(숨김 중)' : c.includes(SWITCH[1]) ? '꺼짐(이미 열림)' : '찾을 수 없음!'}`);
  let found = 0;
  for (const f of FILES) {
    const p = path.join(root, f), s = fs.readFileSync(p, 'utf8');
    const r = applyPairs(s, pairs);
    found += r.log.filter(l => l.endsWith('되돌림')).length;
    console.log(`\n${f}\n  ` + r.log.join('\n  '));
    if (!check) fs.writeFileSync(p, r.text);
  }
  if (!check && on) fs.writeFileSync(cfg, c.replace(SWITCH[0], SWITCH[1]));
  console.log(`\n${check ? '[확인만]' : '[바꿈]'} 문구 ${found}곳` + (check ? '' : `, 스위치 ${on ? '끔' : '그대로'} → 다음: README 2단계(빌드·배포)`));
}
