/* semak-ayat.mjs — sahkan teks Arab dalam data/dalil.json dengan quran.ai MCP.
   Guna: npm run semak:ayat
   Node 18+ (fetch terbina). Tiada pakej luar. */
import fs from 'node:fs';

const ENDPOINT = process.env.QURAN_MCP_URL || 'https://mcp.quran.ai';
const EDITION = process.env.QURAN_EDITION || 'ar-uthmani-hafs';
const FILE = new URL('../data/dalil.json', import.meta.url);
const HEAD = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Klien MCP (Streamable HTTP) ---------- */
let sid = null;

function parseSse(text) {
  const out = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const data = block.split(/\r?\n/).filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('\n');
    if (!data) continue;
    try { out.push(JSON.parse(data)); } catch { /* abaikan */ }
  }
  return out;
}

async function post(body) {
  const headers = sid ? { ...HEAD, 'mcp-session-id': sid } : HEAD;
  const res = await fetch(ENDPOINT, {
    method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(45000)
  });
  const text = await res.text();
  const next = res.headers.get('mcp-session-id');
  if (next) sid = next;
  return { res, msgs: parseSse(text), text };
}

async function call(method, params, id = 1) {
  const body = { jsonrpc: '2.0', id, method, params };
  let { res, msgs, text } = await post(body);
  const msg = msgs.find(m => m.id === id);

  if (msg?.error && /rate|too many/i.test(msg.error.message || '')) {
    await wait(1500);
    ({ res, msgs, text } = await post(body));
    const retry = msgs.find(m => m.id === id);
    if (retry?.error) throw new Error(retry.error.message);
    if (!retry?.result) throw new Error('Tiada jawapan daripada MCP selepas cubaan semula.');
    return retry.result;
  }
  if (msg?.error) throw new Error(msg.error.message || 'Ralat MCP');
  if (!msg?.result) throw new Error(`Tiada jawapan MCP (HTTP ${res.status}): ${text.slice(0, 160)}`);
  return msg.result;
}

const notify = (method, params = {}) => post({ jsonrpc: '2.0', method, params });

async function connect() {
  await call('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'semak-ayat', version: '1.0' }
  });
  await notify('notifications/initialized');
}

/* ---------- Teks kanun ---------- */
const expand = ref => {
  const m = String(ref).trim().match(/^(\d{1,3}):(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/);
  if (!m) throw new Error(`Rujuk tidak sah: "${ref}" (guna S:V atau S:V-V)`);
  const s = +m[1], a = +m[2], b = m[3] ? +m[3] : a;
  if (b < a) throw new Error(`Julat terbalik: "${ref}"`);
  return Array.from({ length: b - a + 1 }, (_, k) => `${s}:${a + k}`);
};

/* Normalisasi untuk perbandingan: buang harakat dan tanda kecil,
   satukan bentuk alif/hamzah dan ya/alif maqsura, abaikan jarak. */
const norm = s => String(s ?? '')
  .replace(/[\u0623\u0625\u0622\u0671\u0672\u0673]/g, '\u0627') /* أ إ آ ٱ → ا */
  .replace(/\u0624/g, '\u0648')                               /* ؤ → و */
  .replace(/\u0626/g, '\u064A')                               /* ئ → ي */
  .replace(/\u0621/g, '')                                     /* ء dibuang */
  .replace(/\u0649/g, '\u064A')                               /* ى → ي */
  .replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF]/g, '')
  .replace(/[\u200B-\u200F\uFEFF]/g, '')
  .replace(/[\s\u00A0]+/g, '');

/* ---------- Semakan ---------- */
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const all = db.dalil || [];
const checked = all.filter(d => d.jenis === 'ayat' && d.rujuk && d.arab);

if (!checked.length) {
  console.error('Tiada entri ayat dengan `rujuk` dan `arab` dalam data/dalil.json.');
  process.exit(2);
}

const refs = [...new Set(checked.flatMap(d => expand(d.rujuk)))];

try {
  await connect();
} catch (e) {
  console.error(`❌ Tidak dapat menghubungi MCP quran.ai (${ENDPOINT}).`);
  console.error(`   ${e.message}`);
  console.error('   Semak sambungan internet atau tetapkan QURAN_MCP_URL.');
  process.exit(2);
}

let result;
try {
  result = await call('tools/call', {
    name: 'fetch_quran',
    arguments: { ayahs: refs, editions: EDITION }
  });
} catch (e) {
  console.error(`❌ Panggilan fetch_quran gagal: ${e.message}`);
  process.exit(2);
}

const payload = result.structuredContent
  || JSON.parse(result.content?.find(c => c.type === 'text')?.text || '{}');
const rows = payload.results?.[EDITION] || payload.results?.[Object.keys(payload.results || {})[0]] || [];
const byRef = new Map(rows.map(r => [r.ayah, r.text]));
const missing = refs.filter(r => !byRef.has(r));

if (missing.length) {
  console.error(`❌ Edisi "${EDITION}" tiada untuk: ${missing.join(', ')}`);
  console.error('   Cuba QURAN_EDITION=ar-uthmani-hafs atau semak ID edisi.');
  process.exit(2);
}

console.log(`Semak ${checked.length} petikan Al-Quran dalam data/dalil.json`);
console.log(`Sumber: quran.ai MCP · edisi ${EDITION}\n`);

let bad = 0;
for (const d of checked) {
  const canonical = expand(d.rujuk).map(r => byRef.get(r)).join(' ');
  /* Entri `petikan` ialah sebahagian ayat; cukup terkandung dalam teks kanun. */
  const a = norm(d.arab), b = norm(canonical);
  const ok = a === b || (d.petikan && a.length > 0 && b.includes(a));
  console.log(`${ok ? '✓' : '✗'} ${d.id.padEnd(12)} · ${String(d.rujuk).padEnd(9)} · ${d.tajuk}${d.petikan ? ' (petikan)' : ''}`);
  if (!ok) {
    bad++;
    console.log(`   data  : ${d.arab}`);
    console.log(`   kanun : ${canonical}`);
  }
}

const skipped = all.filter(d => d.jenis === 'ayat' && !d.rujuk);
if (skipped.length) console.log(`\nℹ️  ${skipped.length} entri ayat tanpa \`rujuk\` dilangkau.`);

console.log(`\n${bad ? '❌' : '✅'} ${checked.length - bad}/${checked.length} sepadan dengan teks kanun.`);
process.exit(bad ? 1 : 0);
