export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r = (tag, cls, html) => `<${tag} class="${cls}" data-r>${html}</${tag}>`;

/* Pendaftar jenis slaid: tambah jenis baharu di sini tanpa ubah kod lain. */
export const types = {
  hero:  s => `<h1 data-r>${esc(s.title)}</h1>${r('p','sub',esc(s.subtitle))}<div class="chips">${(s.meta||[]).map(m=>r('span','chip',esc(m))).join('')}</div>`,
  list:  s => `<h2 data-r>${esc(s.title)}</h2><ul>${s.items.map(i=>r('li','card',esc(i))).join('')}</ul>`,
  cards: s => `<h2 data-r>${esc(s.title)}</h2><div class="cards">${s.items.map(i=>r('div','card',`<b>${esc(i.h)}</b>${esc(i.b)}`)).join('')}</div>`,
  ayat:  s => `<h2 data-r>${esc(s.title)}</h2><div class="ayat">${s.items.map(i=>r('div','card',`<span class="n">${esc(i.n)}</span><span class="ar" lang="ar">${esc(i.ar)}</span><span class="ms">${esc(i.ms)}</span>`)).join('')}</div>`
,  quote: s => `${r('p','q',esc(s.text))}${s.sub?r('p','sub',esc(s.sub)):''}`
};

/* Panel butiran (Lagi / Sembunyi): data `butiran` = [{h, p:[...]}] */
const more = (s, i, ui) => !s.butiran?.length ? '' : r('div','more',
  `<button class="more-toggle" data-more aria-expanded="false" aria-controls="more-${i}">${esc(ui.labels.more)}</button>` +
  `<div class="more-body" id="more-${i}"><div class="more-inner">${s.butiran.map(b=>`<h3>${esc(b.h)}</h3>${b.p.map(p=>`<p>${esc(p)}</p>`).join('')}`).join('')}</div></div>`);

export function render(slides, root, ui) {
  root.innerHTML = slides.map((s, i) =>
    `<section class="slide t-${esc(s.type)}" data-i="${i}" data-sesi="${esc(s.sesi)}" aria-label="Slaid ${i+1}">${(types[s.type]||types.list)(s)}${s.nota?r('p','note',esc(s.nota)):''}${more(s,i,ui)}</section>`).join('');
  root.querySelectorAll('.slide').forEach(sl => {
    sl.querySelectorAll('[data-r]').forEach((e, i) => e.style.setProperty('--i', i));
    if (ui.butiranOpenByDefault) sl.classList.add('more-open');
  });
  return [...root.querySelectorAll('.slide')];
}
