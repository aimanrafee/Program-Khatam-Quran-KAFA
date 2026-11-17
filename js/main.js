import { render } from './render.js';
import { initNav } from './nav.js';
import { initFx } from './fx.js';
import { initSidebar } from './sidebar.js';
import { initDokumen } from './dokumen.js';

const load = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' (' + r.status + ')'); return r.json(); });

try {
  const [content, fx] = await Promise.all([load('data/slides.json'), load('data/fx.json')]);
  const [dalil, jadual, khatam, dokumen] = await Promise.all([
    load('data/dalil.json').catch(() => ({ dalil: [] })),
    load('data/jadual.json').catch(() => ({ segmen: [] })),
    load('data/khatam.json').catch(() => null),
    load('data/dokumen.json').catch(() => null)
  ]);
  const db = { dalil, jadual, khatam, dokumen };
  const ui = fx.ui, deck = document.getElementById('deck'), badge = document.getElementById('badge'), clock = document.getElementById('clock');
  const els = render(content.slides, deck, ui, db);

  const setMore = (sl, on) => {
    sl.classList.toggle('more-open', on);
    const b = sl.querySelector('[data-more]');
    if (b) { b.setAttribute('aria-expanded', on); b.textContent = on ? ui.labels.less : ui.labels.more; }
    sl.querySelector('.more-body')?.setAttribute('aria-hidden', String(!on));
  };
  const mark = initSidebar({ sessions: content.sessions, slides: content.slides, ui, db, onAll: on => els.forEach(sl => setMore(sl, on)) });
  initDokumen(dokumen);
  initFx(fx);

  document.addEventListener('click', e => { const b = e.target.closest('[data-more]'); if (b) { const sl = b.closest('.slide'); setMore(sl, !sl.classList.contains('more-open')); } });

  let cur = 0;
  initNav({ slides: els, data: content.slides, cfg: fx.nav || {}, onChange: (i, s) => {
    cur = i; mark(i);
    const se = content.sessions.find(x => x.id === s.sesi);
    badge.textContent = `${se ? se.no + '. ' + se.title : ''} · ${s.masa || '-'} · ${i + 1}/${els.length}`;
  }});
  document.addEventListener('keydown', e => { if (e.key === 'm' || e.key === 'M') { const sl = els[cur]; setMore(sl, !sl.classList.contains('more-open')); } });
  if (ui.butiranOpenByDefault) els.forEach(sl => setMore(sl, true));

  const tick = () => clock.textContent = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
  tick(); setInterval(tick, 15000);
} catch (e) {
  document.getElementById('deck').innerHTML = `<p class="boot">Gagal memuat data: ${e.message}<br>Buka melalui pelayan (npm run serve) atau GitHub Pages, bukan terus dari fail.</p>`;
}
