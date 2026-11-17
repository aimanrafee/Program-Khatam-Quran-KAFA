/* push.js — push projek ke GitHub menggunakan token dalam .env
   Generik: tiada pakej luar. Perlu Node.js 18+ dan Git.
   Token TIDAK disimpan dalam .git/config. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
process.chdir(ROOT);

function die(m) {
  console.error('\n❌ ' + m);
  process.exit(1);
}

/* ---------- 1. Baca .env ---------- */
function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) {
    die('Fail .env tiada. Salin .env.example kepada .env dan isi token.');
  }

  const o = {};
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;

    const m = s.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;

    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    o[m[1]] = v;
  }
  return o;
}

const E = loadEnv();

for (const k of ['GITHUB_TOKEN', 'GITHUB_USER', 'GITHUB_REPO']) {
  if (!E[k] || /^ISI_/.test(E[k])) {
    die(`${k} belum diisi dalam .env`);
  }
}

/* Terima nama biasa ATAU URL penuh:
   https://github.com/user/repo.git
   git@github.com:user/repo.git
   user/repo
*/
(function normalizeRemote() {
  const strip = s => String(s).trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git\/?$/i, '')
    .replace(/^\/+|\/+$/g, '');

  let u = strip(E.GITHUB_USER);
  let r = strip(E.GITHUB_REPO);

  if (r.includes('/')) {
    const p = r.split('/');
    u = p[0];
    r = p[1];
  } else if (u.includes('/')) {
    u = u.split('/')[0];
  }

  if (!/^[\w.-]+$/.test(u) || !/^[\w.-]+$/.test(r)) {
    die(`Nama pengguna/repo tidak sah: "${u}" / "${r}"`);
  }

  E.GITHUB_USER = u;
  E.GITHUB_REPO = r;
})();

const BRANCH = E.GITHUB_BRANCH || 'main';
const TOKEN = E.GITHUB_TOKEN;
const REMOTE = `https://github.com/${E.GITHUB_USER}/${E.GITHUB_REPO}.git`;
const AUTH = 'Authorization: Basic ' + Buffer.from('x-access-token:' + TOKEN).toString('base64');
const AUTH_B64 = AUTH.split(' ').pop();

/* ---------- 2. Pembantu git (token disorok daripada output) ---------- */
function mask(s) {
  return String(s)
    .split(TOKEN).join('***')
    .split(AUTH_B64).join('***');
}

function git(args, { auth = false, soft = false } = {}) {
  const a = auth ? ['-c', 'http.extraheader=' + AUTH, ...args] : args;

  try {
    return execFileSync('git', a, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (e) {
    if (soft) return null;

    const err = mask((e.stderr || '') + (e.stdout || '') || e.message);
    const x = new Error(err);
    x.stderr = err;
    throw x;
  }
}

try {
  git(['--version']);
} catch {
  die('Git tidak dipasang. Muat turun di https://git-scm.com');
}

/* ---------- 3. Fail/pattern sulit ----------
   .env sentiasa dilindungi.
   Boleh tambah melalui GIT_SECRET_FILES dalam .env:
   GIT_SECRET_FILES=*.sqlite,config.local.json,*.pem
*/
const defaultSecret = ['.env'];
const envSecret = (E.GIT_SECRET_FILES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const SECRET = [...new Set([...defaultSecret, ...envSecret])];

const extraIgnore = (E.GIT_IGNORE_EXTRA || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const ignorePatterns = [...new Set([...SECRET, ...extraIgnore])];

let gi = fs.existsSync('.gitignore')
  ? fs.readFileSync('.gitignore', 'utf8')
  : '';

const existing = new Set(gi.split(/\r?\n/).map(x => x.trim()));
const tambah = ignorePatterns.filter(p => !existing.has(p));

if (tambah.length) {
  gi += (gi && !gi.endsWith('\n') ? '\n' : '')
    + '# ditambah oleh push.js\n'
    + tambah.join('\n')
    + '\n';

  fs.writeFileSync('.gitignore', gi);
  console.log('🔒 .gitignore dikemas kini:', tambah.join(', '));
}

/* ---------- 4. Sediakan repo ---------- */
if (!fs.existsSync('.git')) {
  git(['init']);
  console.log('📁 Repo git dicipta');
}

git(['checkout', '-B', BRANCH], { soft: true });

// Fallback untuk repo kosong yang belum ada commit.
if (!git(['rev-parse', '--verify', 'HEAD'], { soft: true })) {
  git(['symbolic-ref', 'HEAD', 'refs/heads/' + BRANCH], { soft: true });
}

if (E.GIT_NAME) git(['config', 'user.name', E.GIT_NAME]);
if (E.GIT_EMAIL) git(['config', 'user.email', E.GIT_EMAIL]);

if (
  !git(['config', 'user.name'], { soft: true }) ||
  !git(['config', 'user.email'], { soft: true })
) {
  die('Isi GIT_NAME dan GIT_EMAIL dalam .env, atau set git config --global user.name/user.email.');
}

git(['remote', 'remove', 'origin'], { soft: true });
git(['remote', 'add', 'origin', REMOTE]);

/* Pastikan fail/pattern sulit tidak sedang dijejak */
for (const pattern of SECRET) {
  const tracked = git(['ls-files', '--', pattern], { soft: true });

  if (tracked) {
    const files = tracked.split('\n').filter(Boolean);

    if (files.length) {
      git(['rm', '--cached', '-q', '--', ...files], { soft: true });
      console.log(`⚠️  ${files.join(', ')} dibuang daripada penjejakan (fail asal kekal).`);
      console.log('   Jika pernah di-push, ia MASIH ada dalam sejarah GitHub — tukar token / buang sejarah.');
    }
  }
}

/* ---------- 5. Commit ---------- */
const msg = process.argv.slice(2).join(' ')
  || 'Kemas kini ' + new Date().toLocaleString('sv-SE').slice(0, 16);

git(['add', '-A']);

const diff = git(['diff', '--cached', '--name-only']);
const hasHead = !!git(['rev-parse', '--verify', 'HEAD'], { soft: true });

if (diff) {
  console.log('📝 Fail berubah:\n   ' + diff.split('\n').join('\n   '));
  git(['commit', '-m', msg]);
  console.log('✅ Commit:', msg);
} else if (!hasHead) {
  die('Tiada fail untuk di-commit. Pastikan projek mempunyai fail selain .gitignore.');
} else {
  console.log('ℹ️  Tiada perubahan baharu untuk di-commit.');
}

/* ---------- 6. Push ---------- */
function push() {
  return git(['push', '-u', 'origin', BRANCH], { auth: true });
}

try {
  push();
} catch (e) {
  if (/rejected|fetch first|non-fast-forward/i.test(e.stderr)) {
    console.log('↻ Remote ada commit lain — cuba tarik (rebase) dahulu…');

    try {
      git(['pull', '--rebase', 'origin', BRANCH], { auth: true });
      push();
    } catch (e2) {
      die('Gagal selepas rebase:\n' + e2.stderr + '\nSelesaikan konflik secara manual.');
    }
  } else if (/401|403|Authentication|denied|not found|Repository not found/i.test(e.stderr)) {
    die(
      'Pengesahan gagal atau repo tiada. Semak token (Contents: Read and write), nama pengguna & repo.\n'
      + e.stderr
    );
  } else {
    die(e.stderr);
  }
}

console.log(`\n🚀 Berjaya push ke ${E.GITHUB_USER}/${E.GITHUB_REPO} (${BRANCH})`);
console.log(`🔗 https://github.com/${E.GITHUB_USER}/${E.GITHUB_REPO}`);

if (String(E.GITHUB_PAGES).toLowerCase() === 'true') {
  console.log(`🌐 https://${E.GITHUB_USER.toLowerCase()}.github.io/${E.GITHUB_REPO}/ (tunggu ~1 minit untuk Pages)`);
}