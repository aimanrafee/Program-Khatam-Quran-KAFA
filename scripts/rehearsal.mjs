/* rehearsal.mjs — cetak lembaran cue untuk latihan dan semakan masa.
   Guna: npm run rehearsal
   Tiada pakej luar. */
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));
const { slides, sessions } = read('../data/slides.json');
const { dalil } = read('../data/dalil.json');
const ids = new Set(dalil.map(d => d.id));

const minit = t => {
  const m = String(t || '').match(/^(\d{1,2})\.(\d{2})$/);
  return m ? +m[1] * 60 + +m[2] : null;
};
const selang = t => {
  const m = String(t || '').match(/(\d{1,2})\.(\d{2})\s*–\s*(\d{1,2})\.(\d{2})/);
  if (!m) return null;
  return (+m[3] * 60 + +m[4]) - (+m[1] * 60 + +m[2]);
};

let jumlah = 0;
for (const se of sessions) {
  const items = slides.map((s, i) => [s, i]).filter(([s]) => s.sesi === se.id);
  const tempoh = selang(se.masa);
  jumlah += tempoh ?? 0;
  console.log(`\n${'='.repeat(64)}`);
  console.log(`SESI ${se.no} · ${se.title} · ${se.masa}${tempoh ? ` · ${tempoh} minit` : ''} · ${items.length} slaid`);
  console.log('='.repeat(64));

  let lepas = null;
  for (const [s, i] of items) {
    const t = minit(s.masa);
    const flag = t !== null && lepas !== null && t < lepas ? '  ⚠️ masa undur' : '';
    if (t !== null) lepas = t;
    const label = s.label || s.title || s.text || '(tanpa label)';
    const ref = (s.dalil || []).filter(id => ids.has(id)).length;
    const more = (s.butiran || []).length;
    console.log(`${String(i + 1).padStart(2)}. ${String(s.masa || '–').padEnd(6)} ${label.padEnd(40)} ${ref ? `dalil:${ref} ` : ''}${more ? `butiran:${more}` : ''}${flag}`);
  }
}

console.log(`\n${'='.repeat(64)}`);
console.log(`Jumlah slaid: ${slides.length} · anggaran slot: ${jumlah} minit`);
console.log('='.repeat(64));
console.log('Peringatan: 2.30 mula, 2.40 tadabbur, 3.00 tazkirah, 3.20 serah, 3.50 ucapan guru, 4.00 rehat.');
