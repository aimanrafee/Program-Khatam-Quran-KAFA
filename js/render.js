export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r = (tag, cls, html) => `<${tag} class="${cls}" data-r>${html}</${tag}>`;

const JENIS = { ayat: 'Ayat', hadis: 'Hadis', tafsir: 'Tafsir', nota: 'Nota' };
const indexDalil = db => new Map((db?.dalil?.dalil || []).map(d => [d.id, d]));

/* Kad dalil: teks, sumber, taraf dan pautan. */
function dalilCard(d) {
  const link = d.pautan
    ? `<a class="dalil-link" href="${esc(d.pautan)}" target="_blank" rel="noopener noreferrer">Buka sumber ↗</a>`
    : '';
  return `<article class="dalil-card">
    <header><span class="tag">${esc(JENIS[d.jenis] || 'Dalil')}</span><b>${esc(d.tajuk)}</b></header>
    ${d.arab ? `<p class="ar" lang="ar">${esc(d.arab)}</p>` : ''}
    <p class="ms">${esc(d.ms)}</p>
    <p class="src">${esc(d.sumber)}<span class="status">${esc(d.status)}</span></p>
    ${d.nota ? `<p class="dnote">${esc(d.nota)}</p>` : ''}
    ${link}
  </article>`;
}

function dalilBlock(s, db) {
  const idx = indexDalil(db);
  const list = (s.dalil || []).map(id => idx.get(id)).filter(Boolean);
  if (!list.length) return '';
  return `<div class="dalil-block" aria-label="Dalil dan rujukan">${list.map(dalilCard).join('')}</div>`;
}

/* Pendaftar jenis slaid: tambah jenis baharu di sini tanpa ubah kod lain. */
export const types = {
  hero:  s => `<h1 data-r>${esc(s.title)}</h1>${r('p','sub',esc(s.subtitle))}<div class="chips">${(s.meta||[]).map(m=>r('span','chip',esc(m))).join('')}</div>`,

  list:  s => `<h2 data-r>${esc(s.title)}</h2><ul>${(s.items||[]).map(i=>r('li','card',esc(i))).join('')}</ul>`,

  cards: s => `<h2 data-r>${esc(s.title)}</h2><div class="cards">${(s.items||[]).map(i=>r('div','card',`<b>${esc(i.h)}</b>${esc(i.b)}`)).join('')}</div>`,

  ayat:  s => `<h2 data-r>${esc(s.title)}</h2><div class="ayat">${(s.items||[]).map(i=>r('div','card',`<span class="n">${esc(i.n)}</span><span class="ar" lang="ar">${esc(i.ar)}</span><span class="ms">${esc(i.ms)}</span>`)).join('')}</div>`,

  quote: s => `${r('p','q',esc(s.text))}${s.sub?r('p','sub',esc(s.sub)):''}`,

  /* Aturcara dijana daripada data/jadual.json. */
  jadual: (s, db) => {
    const seg = db?.jadual?.segmen || [];
    if (!seg.length) return `<h2 data-r>${esc(s.title)}</h2>`;
    return `<h2 data-r>${esc(s.title)}</h2>
      <div class="jadual-wrap"><table class="jadual">
        <thead><tr><th>Masa</th><th>Tempoh</th><th>Acara</th></tr></thead>
        <tbody>${seg.map(x => `<tr class="${x.pemilik === 'Anda' ? 'on' : ''}">
          <td class="masa">${esc(x.masa)}</td>
          <td class="tempoh">${esc(x.tempoh || '')}</td>
          <td><b>${esc(x.tajuk)}</b><small>${esc(x.objektif || '')}</small><em>${esc(x.pemilik || '')}</em></td>
        </tr>`).join('')}</tbody>
      </table></div>`;
  },

  /* Tiga tahap umur dengan fokus dan amalan masing-masing. */
  tahap: s => `<h2 data-r>${esc(s.title)}</h2><div class="tahap">${(s.items||[]).map(i => `
    <article class="card tahap-card" data-r>
      <header><b>${esc(i.h)}</b><span class="umur">${esc(i.umur)}</span></header>
      <p>${esc(i.b)}</p>
      <h4>Fokus</h4><ul class="mini">${(i.fokus||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      <h4>Amalan</h4><ul class="mini">${(i.amalan||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      ${i.dalil ? `<p class="tahap-dalil">${esc(i.dalil)}</p>` : ''}
    </article>`).join('')}</div>`,

  /* Urutan bacaan khatam dijana daripada data/khatam.json. */
  khatam: (s, db) => {
    const k = db?.khatam;
    if (!k) return `<h2 data-r>${esc(s.title)}</h2>`;
    return `<h2 data-r>${esc(s.title)}</h2>
      <div class="steps">${(k.langkah||[]).map(x => `<div class="step">
        <span class="no">${esc(x.no)}</span>
        <div><b>${esc(x.tajuk)}</b><p>${esc(x.butiran)}</p></div>
      </div>`).join('')}</div>
      <div class="surah-grid" aria-label="Senarai surah 93 hingga 114">${(k.urutan_surah||[]).map(x => `
        <span class="surah"><b>${esc(x.no)}</b>${esc(x.nama)}<small>${esc(x.ayat)} ayat</small></span>`).join('')}
      </div>`;
  },

  /* Doa khatam penuh dengan makna. */
  doa: (s, db) => {
    const d = db?.khatam?.doa;
    if (!d) return `<h2 data-r>${esc(s.title)}</h2>`;
    return `<h2 data-r>${esc(s.title)}</h2>
      <div class="doa-card">
        <p class="ar long" lang="ar">${esc(d.arab)}</p>
        <p class="ms">${esc(d.ms)}</p>
        <p class="dnote">${esc(d.nota)}</p>
      </div>`;
  },

  /* Senarai rujukan padat: tajuk, sumber, taraf dan pautan. */
  rujukan: (s, db) => {
    const idx = indexDalil(db);
    const groups = s.kumpulan || [];
    return `<h2 data-r>${esc(s.title)}</h2><div class="rujukan">${groups.map(g => `
      <section class="ruj-group"><h3>${esc(g.h)}</h3><ul>${(g.ids||[]).map(id => {
        const d = idx.get(id);
        if (!d) return '';
        const body = `<b>${esc(d.sumber || d.tajuk)}</b><span>${esc(d.tajuk)}</span><small>${esc(d.status)}</small>`;
        return `<li>${d.pautan
          ? `<a href="${esc(d.pautan)}" target="_blank" rel="noopener noreferrer">${body}</a>`
          : `<div class="ruj-static">${body}</div>`}</li>`;
      }).join('')}</ul></section>`).join('')}</div>`;
  }
};

/* Panel butiran (Lagi / Sembunyi): data `butiran` = [{h, p:[...]}] */
const more = (s, i, ui) => !s.butiran?.length ? '' : r('div','more',
  `<button class="more-toggle" data-more aria-expanded="false" aria-controls="more-${i}">${esc(ui.labels.more)}</button>` +
  `<div class="more-body" id="more-${i}" aria-hidden="true"><div class="more-inner">${s.butiran.map(b=>`<h3>${esc(b.h)}</h3>${(b.p||[]).map(p=>`<p>${esc(p)}</p>`).join('')}`).join('')}</div></div>`);

export function render(slides, root, ui, db) {
  root.innerHTML = slides.map((s, i) =>
    `<section class="slide t-${esc(s.type)}" data-i="${i}" data-sesi="${esc(s.sesi)}" aria-label="Slaid ${i+1}">${(types[s.type]||types.list)(s, db, ui)}${dalilBlock(s, db)}${s.nota?r('p','note',esc(s.nota)):''}${more(s,i,ui)}</section>`).join('');
  root.querySelectorAll('.slide').forEach(sl => {
    sl.querySelectorAll('[data-r]').forEach((e, i) => e.style.setProperty('--i', i));
    if (ui.butiranOpenByDefault) sl.classList.add('more-open');
  });
  return [...root.querySelectorAll('.slide')];
}
