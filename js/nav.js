export function initNav({ slides, data, cfg, onChange }) {
  const n = slides.length, dots = document.getElementById('dots'), bar = document.querySelector('.progress');
  let cur = -1, lock = 0;
  dots.innerHTML = slides.map((_, i) => `<button class="dot" role="tab" aria-label="Slaid ${i+1}" data-go="${i}"></button>`).join('');
  const dotEls = [...dots.children];

  function go(i, silent) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === cur) return;
    slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); if (k === i) s.scrollTop = 0; });
    dotEls.forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-selected', k === i); });
    bar.style.setProperty('--p', n > 1 ? i / (n - 1) : 1);
    cur = i;
    if (cfg.hash && !silent) history.replaceState(null, '', '#' + (i + 1));
    onChange?.(i, data[i]);
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-go]'); if (!b) return;
    if (b.dataset.go != null) go(+b.dataset.go); else (b.dataset.act === 'next' ? next : prev)();
  });
  if (cfg.keys) document.addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft','ArrowUp','PageUp'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0); else if (k === 'End') go(n - 1);
    else if (k === 'f' || k === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  });
  if (cfg.wheel) addEventListener('wheel', e => {
    if (e.target.closest('.side')) return;
    const sl = e.target.closest('.slide');
    if (sl && sl.scrollHeight > sl.clientHeight + 4) return;
    const t = Date.now(); if (t - lock < cfg.wheelCooldown || Math.abs(e.deltaY) < 24) return;
    lock = t; e.deltaY > 0 ? next() : prev();
  }, { passive: true });
  if (cfg.swipe) {
    let x0 = null;
    addEventListener('pointerdown', e => { if (!e.target.closest('button,.side,.more-body')) x0 = e.clientX; });
    addEventListener('pointerup', e => { if (x0 == null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 50) d < 0 ? next() : prev(); });
  }
  const start = cfg.hash ? (parseInt(location.hash.slice(1), 10) || 1) - 1 : 0;
  go(start, true);
  addEventListener('hashchange', () => cfg.hash && go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));
  return { go, next, prev };
}
