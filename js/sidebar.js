import { esc } from './render.js';

/* Menu sisi: dijana daripada `sessions` dan `slides` (data/slides.json). */
export function initSidebar({ sessions, slides, ui }) {
  const side = document.getElementById('side'), L = ui.labels;
  side.innerHTML = `<div class="side-h"><b>Sesi majlis</b><button class="btn-sm" data-side="close" aria-label="Tutup menu">×</button></div>
  <button class="btn-all" data-side="all">${esc(L.allOff)}</button>` + sessions.map(se => {
    const items = slides.map((s, i) => [s, i]).filter(([s]) => s.sesi === se.id);
    return `<section class="grp" data-sesi="${esc(se.id)}"><button class="grp-h" aria-expanded="true"><span class="no">${se.no}</span><span><b>${esc(se.title)}</b><small>${esc(se.masa)} · ${items.length} slaid</small></span></button>
    <ol>${items.map(([s, i]) => `<li><button class="nav-item" data-go="${i}"><span>${esc(s.label || s.title || s.text)}</span><small>${esc(s.masa || '')}</small></button></li>`).join('')}</ol></section>`;
  }).join('');

  const open = on => document.body.classList.toggle('side-open', on ?? !document.body.classList.contains('side-open'));
  open(innerWidth >= ui.sidebarOpenMinWidth);
  const allBtn = side.querySelector('[data-side=all]');

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('#menu')) return open();
    if (t.closest('.scrim') || t.closest('[data-side=close]')) return open(false);
    if (t.closest('[data-side=all]')) {
      const on = document.body.classList.toggle('more-all');
      allBtn.textContent = on ? L.allOn : L.allOff;
      return;
    }
    const g = t.closest('.grp-h');
    if (g) g.setAttribute('aria-expanded', g.getAttribute('aria-expanded') !== 'true');
    if (t.closest('.nav-item') && innerWidth < ui.sidebarOpenMinWidth) open(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 's' || e.key === 'S') open(); });

  const items = [...side.querySelectorAll('.nav-item')];
  return i => {
    items.forEach((b, k) => b.classList.toggle('on', k === i));
    side.querySelectorAll('.grp').forEach(g => g.classList.toggle('on', !!g.querySelector('.nav-item.on')));
    items[i]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
}
