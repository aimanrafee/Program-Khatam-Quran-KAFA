import { esc } from './render.js';

/* Menu sisi: dijana daripada `sessions`, `slides` dan pangkalan dalil. */
export function initSidebar({ sessions, slides, ui, db, onAll }) {
  const side = document.getElementById('side'), menuBtn = document.getElementById('menu'), L = ui.labels;
  const dalilTitle = id => (db?.dalil?.dalil || []).find(d => d.id === id)?.tajuk || '';
  const cari = s => [s.label, s.title, s.text, s.sub, ...(s.butiran || []).flatMap(b => [b.h, ...(b.p || [])]), ...(s.dalil || []).map(dalilTitle)]
    .filter(Boolean).join(' ').toLowerCase();

  side.innerHTML = `<div class="side-h"><b>Sesi majlis</b><button class="btn-sm" data-side="close" aria-label="Tutup menu">×</button></div>
  <div class="side-search"><input type="search" data-side="search" placeholder="Cari slaid atau dalil…" aria-label="Cari slaid atau dalil"></div>
  <button class="btn-all" data-side="all" aria-pressed="false">${esc(L.allOff)}</button>` + sessions.map(se => {
    const items = slides.map((s, i) => [s, i]).filter(([s]) => s.sesi === se.id);
    return `<section class="grp" data-sesi="${esc(se.id)}"><button class="grp-h" aria-expanded="true"><span class="no">${se.no}</span><span><b>${esc(se.title)}</b><small>${esc(se.masa)} · ${items.length} slaid</small></span></button>
    <ol>${items.map(([s, i]) => `<li><button class="nav-item" data-go="${i}" data-cari="${esc(cari(s))}"><span>${esc(s.label || s.title || s.text)}</span><small>${esc(s.masa || '')}</small></button></li>`).join('')}</ol></section>`;
  }).join('') + `<section class="grp doc-grp"><button class="grp-h" aria-expanded="true"><span class="no">i</span><span><b>Dokumentasi</b><small>Laporan, PDF dan Word</small></span></button><ol>
    <li><a class="nav-item" href="majlis-khatam-2026.html">Halaman dokumentasi</a></li>
    <li><a class="nav-item" href="dokumen/Majlis-Khatam-2026-Dokumentasi.pdf" download>Muat turun PDF</a></li>
    <li><a class="nav-item" href="dokumen/Majlis-Khatam-2026-Dokumentasi.docx" download>Muat turun Word</a></li>
  </ol></section><p class="side-empty" hidden>Tiada slaid sepadan.</p>`;

  const open = on => {
    const next = on ?? !document.body.classList.contains('side-open');
    document.body.classList.toggle('side-open', next);
    side.inert = !next;
    side.setAttribute('aria-hidden', String(!next));
    menuBtn?.setAttribute('aria-expanded', String(next));
  };
  open(innerWidth >= ui.sidebarOpenMinWidth);
  const allBtn = side.querySelector('[data-side=all]');
  const items = [...side.querySelectorAll('.nav-item')];
  const search = side.querySelector('[data-side=search]');
  const empty = side.querySelector('.side-empty');

  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    items.forEach(b => { b.closest('li').hidden = !!q && !(b.dataset.cari || '').includes(q); });
    side.querySelectorAll('.grp').forEach(g => {
      g.hidden = ![...g.querySelectorAll('.nav-item')].some(b => !b.closest('li').hidden);
    });
    if (empty) empty.hidden = items.some(b => !b.closest('li').hidden);
  });

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('#menu')) return open();
    if (t.closest('.scrim') || t.closest('[data-side=close]')) return open(false);
    if (t.closest('[data-side=all]')) {
      const on = !document.body.classList.contains('more-all');
      document.body.classList.toggle('more-all', on);
      allBtn.textContent = on ? L.allOn : L.allOff;
      allBtn.setAttribute('aria-pressed', String(on));
      onAll?.(on);
      return;
    }
    const g = t.closest('.grp-h');
    if (g) g.setAttribute('aria-expanded', g.getAttribute('aria-expanded') !== 'true');
    if (t.closest('.nav-item') && innerWidth < ui.sidebarOpenMinWidth) open(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 's' || e.key === 'S') open();
    else if (e.key === 'Escape') open(false);
  });

  return i => {
    items.forEach(b => b.classList.toggle('on', +b.dataset.go === i));
    side.querySelectorAll('.grp').forEach(g => g.classList.toggle('on', !!g.querySelector('.nav-item.on')));
    items.find(b => +b.dataset.go === i)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
}
