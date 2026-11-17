/* semak-data.mjs — semak integriti pangkalan data laman.
   Guna: npm run semak:data
   Tiada pakej luar. */
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));
const slidesDb = read('../data/slides.json');
const dalilDb = read('../data/dalil.json');
const jadualDb = read('../data/jadual.json');
const khatamDb = read('../data/khatam.json');

const slides = slidesDb.slides || [];
const sessions = slidesDb.sessions || [];
const dalil = dalilDb.dalil || [];
const errors = [];
const warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

/* ---- Dalil ---- */
const ids = new Set();
for (const d of dalil) {
  for (const k of ['id', 'jenis', 'tajuk', 'ms', 'sumber', 'status']) {
    if (!d[k]) err(`Dalil ${d.id || '(tanpa id)'}: medan \`${k}\` kosong.`);
  }
  if (ids.has(d.id)) err(`Dalil: id berganda \`${d.id}\`.`);
  ids.add(d.id);
  if (['ayat', 'hadis'].includes(d.jenis) && !d.arab) err(`Dalil ${d.id}: \`arab\` diperlukan untuk ${d.jenis}.`);
  if (d.jenis === 'ayat' && !d.rujuk) err(`Dalil ${d.id}: \`rujuk\` ayat kosong.`);
  if (d.pautan && !/^https:\/\//.test(d.pautan)) err(`Dalil ${d.id}: pautan bukan https.`);
  if (d.jenis === 'hadis' && !/sahih|hasan|daif|da'if|daif|mutawatir/i.test(d.status)) {
    warn(`Dalil ${d.id}: status hadis tidak menyatakan taraf (${d.status}).`);
  }
}

/* ---- Slaid ---- */
const TYPES = new Set(['hero', 'list', 'cards', 'ayat', 'quote', 'jadual', 'tahap', 'khatam', 'doa', 'rujukan']);
const sesiIds = new Set(sessions.map(s => s.id));
const usedSesi = new Set();

slides.forEach((s, i) => {
  const at = `Slaid ${i + 1}`;
  if (!TYPES.has(s.type)) err(`${at}: jenis \`${s.type}\` tidak didaftarkan.`);
  if (!sesiIds.has(s.sesi)) err(`${at}: sesi \`${s.sesi}\` tiada dalam senarai sesi.`);
  usedSesi.add(s.sesi);
  if (!s.masa) err(`${at}: medan \`masa\` kosong.`);
  if (!s.title && !s.text) err(`${at}: tiada \`title\` atau \`text\`.`);
  if (s.label && s.label.length > 46) warn(`${at}: label sidebar panjang (${s.label.length} aksara).`);
  if (s.type === 'ayat' && !(s.items || []).length) err(`${at}: slaid ayat tiada item.`);
  if (s.type === 'cards' && !(s.items || []).length) err(`${at}: slaid kad tiada item.`);
  (s.dalil || []).forEach(id => { if (!ids.has(id)) err(`${at}: dalil \`${id}\` tidak wujud.`); });
  (s.kumpulan || []).forEach(g => (g.ids || []).forEach(id => {
    if (!ids.has(id)) err(`${at}: rujukan \`${id}\` dalam kumpulan \`${g.h}\` tidak wujud.`);
  }));
});

/* ---- Sesi ---- */
sessions.forEach(se => {
  if (!usedSesi.has(se.id)) warn(`Sesi \`${se.id}\` tiada slaid.`);
  if (!/^\d{1,2}\.\d{2} – \d{1,2}\.\d{2}$/.test(se.masa)) warn(`Sesi \`${se.id}\`: format masa \`${se.masa}\`.`);
});

/* ---- Jadual ---- */
const seg = jadualDb.segmen || [];
const jangkaan = ['2.30 – 2.40', '2.40 – 3.00', '3.00 – 3.20', '3.20 – 3.50', '3.50 – 4.00', '4.00'];
if (seg.length !== jangkaan.length) err(`Jadual: ${seg.length} segmen, dijangka ${jangkaan.length}.`);
jangkaan.forEach((m, i) => { if (seg[i] && seg[i].masa !== m) err(`Jadual segmen ${i + 1}: masa \`${seg[i].masa}\`, dijangka \`${m}\`.`); });
const jumlah = seg.reduce((n, s) => n + (Number((s.tempoh || '').match(/(\d+)/)?.[1]) || 0), 0);
if (jumlah !== 90) err(`Jadual: jumlah tempoh ${jumlah} minit, dijangka 90 minit (2.30–4.00).`);

/* ---- Khatam ---- */
const surah = khatamDb.urutan_surah || [];
if (surah.length !== 22) err(`Khatam: ${surah.length} surah, dijangka 22 (93–114).`);
surah.forEach((x, i) => { if (x.no !== 93 + i) err(`Khatam: surah ke-${i + 1} bernombor ${x.no}, dijangka ${93 + i}.`); });
if (!khatamDb.doa?.arab || !khatamDb.doa?.ms) err('Khatam: doa mesti ada `arab` dan `ms`.');
if (!(khatamDb.langkah || []).length) err('Khatam: `langkah` kosong.');

/* ---- Tahap umur ---- */
const tahap = slides.find(s => s.type === 'tahap');
if (!tahap) err('Tiada slaid jenis `tahap` (Tahun 1–6).');
else {
  if ((tahap.items || []).length !== 3) err(`Slaid tahap: ${tahap.items.length} item, dijangka 3.`);
  (tahap.items || []).forEach(x => {
    if (!x.umur) err(`Tahap ${x.h}: \`umur\` kosong.`);
    if (!(x.fokus || []).length) err(`Tahap ${x.h}: \`fokus\` kosong.`);
    if (!(x.amalan || []).length) err(`Tahap ${x.h}: \`amalan\` kosong.`);
  });
}

/* ---- Kandungan wajib ---- */
const semua = JSON.stringify(slidesDb).toLowerCase();
for (const k of ['khalifah', 'hamba allah', 'bertanggungjawab', 'berdisiplin', 'berakhlak', 'amanah', 'jujur', 'bijaksana', 'keberkatan']) {
  if (!semua.includes(k)) err(`Kandungan wajib tidak dijumpai: \`${k}\`.`);
}
if (!/ad-dhuha|ad-duha/i.test(semua)) err('Urutan khatam Ad-Dhuha tidak dijumpai dalam slaid.');
if (!/al-baqarah/.test(semua)) err('Al-Baqarah 1–5 tidak dijumpai dalam slaid.');
if (/2\.40 – 3\.20|4\.00 – 5\.30|5\.30/.test(semua)) {
  warn('Terdapat teks masa lama dalam data/slides.json; semak semula.');
}

/* ---- Laporan ---- */
const kira = jenis => dalil.filter(d => d.jenis === jenis).length;
console.log(`Slaid        : ${slides.length}`);
console.log(`Sesi         : ${sessions.length}`);
console.log(`Dalil        : ${dalil.length} (ayat ${kira('ayat')}, hadis ${kira('hadis')}, tafsir ${kira('tafsir')}, nota ${kira('nota')})`);
console.log(`Jadual       : ${seg.length} segmen, ${jumlah} minit`);
console.log(`Khatam       : ${surah.length} surah (${surah[0]?.no}–${surah[surah.length - 1]?.no})`);
console.log(`Tahap umur   : ${(tahap?.items || []).length} peringkat\n`);

if (warns.length) {
  console.log(`⚠️  ${warns.length} amaran:`);
  warns.forEach(w => console.log(`   - ${w}`));
  console.log('');
}
if (errors.length) {
  console.log(`❌ ${errors.length} ralat:`);
  errors.forEach(e => console.log(`   - ${e}`));
  process.exit(1);
}
console.log('✅ Semua semakan data lulus.');
