import { esc } from './render.js';

/* Panel dokumentasi: data dipautkan daripada data/dokumen.json. */
export function initDokumen(d) {
  const dlg = document.getElementById('dokumen');
  if (!dlg || !d) return null;
  const $ = id => document.getElementById(id);

  $('doc-tajuk').textContent = d.tajuk || 'Dokumentasi program';
  $('doc-sub').textContent = d.peringkat || '';
  $('doc-fakta').innerHTML = [
    ['Tarikh', d.tarikh], ['Masa', d.masa], ['Tempat', d.tempat],
    ['Pemantau', d.pemantau], ['Sasaran', d.sasaran]
  ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');

  $('doc-objektif').innerHTML = (d.objektif || []).length
    ? `<h3>Objektif</h3><ul>${d.objektif.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
    : '';

  const live = d.live || {};
  const liveLink = live.pautan
    ? `<a class="doc-btn live" href="${esc(live.pautan)}" target="_blank" rel="noopener noreferrer"><span>LIVE</span><b>${esc(live.platform || 'Facebook Live')}</b><small>Buka siaran langsung</small></a>`
    : `<div class="doc-btn live off"><span>LIVE</span><b>${esc(live.platform || 'Facebook Live')}</b><small>${esc(live.status || 'Pautan dikemas kini oleh penyelaras')}</small></div>`;

  $('doc-actions').innerHTML = (d.dokumen || []).map(x => `
    <a class="doc-btn" href="${esc(x.pautan)}" download>
      <span>${esc(x.jenis)}</span><b>${esc(x.tajuk)}</b><small>${esc(x.saiz || 'Muat turun')}</small>
    </a>`).join('') + liveLink + `
    <a class="doc-btn" href="${esc(d.halaman || 'majlis-khatam-2026.html')}">
      <span>HTML</span><b>Halaman dokumentasi</b><small>Cetak atau kongsi</small>
    </a>`;

  $('doc-nota').textContent = [live.nota, d.nota].filter(Boolean).join(' ');
  $('doc-page').href = d.halaman || 'majlis-khatam-2026.html';

  const info = document.getElementById('info');
  const open = () => { if (!dlg.open) dlg.showModal(); };
  info?.addEventListener('click', open);
  dlg.querySelector('[data-doc=close]')?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  return { open };
}
