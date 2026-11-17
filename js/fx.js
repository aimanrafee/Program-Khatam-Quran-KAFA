/* Harness micro-interaksi: setiap kesan didaftar di `effects`, dikawal oleh data/fx.json. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const effects = {
  ripple(o) {
    document.addEventListener('pointerdown', e => {
      const el = e.target.closest(o.selector); if (!el) return;
      const b = el.getBoundingClientRect(), d = Math.max(b.width, b.height), s = document.createElement('span');
      s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - b.left - d/2}px;top:${e.clientY - b.top - d/2}px;--rp:${o.duration}ms`;
      el.appendChild(s); s.addEventListener('animationend', () => s.remove());
    });
  },
  tilt(o) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest(o.selector); if (!el || e.pointerType === 'touch') return;
      const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      el.style.setProperty('--ry', (x * o.max * 2).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * o.max * 2).toFixed(2) + 'deg');
    });
    document.addEventListener('pointerout', e => { const el = e.target.closest(o.selector); if (el) { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); } });
  },
  magnetic(o) {
    document.addEventListener('pointermove', e => {
      document.querySelectorAll(o.selector).forEach(el => {
        const b = el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width/2), dy = e.clientY - (b.top + b.height/2);
        const near = Math.hypot(dx, dy) < Math.max(b.width, b.height);
        el.style.transform = near ? `translate(${dx * o.strength}px,${dy * o.strength}px)` : '';
      });
    });
  }
};

export function initFx(cfg) {
  const m = cfg.motion || {}, root = document.documentElement.style;
  if (m.duration) root.setProperty('--dur', m.duration);
  if (m.easing) root.setProperty('--ease', m.easing);
  if (m.stagger) root.setProperty('--stagger', m.stagger);
  if (reduce) return;
  for (const [name, opts] of Object.entries(cfg.effects || {})) effects[name]?.(opts);
}
