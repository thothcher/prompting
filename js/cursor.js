/* A HUD reticle that trails the mouse: four corner brackets that turn and
   close in on anything clickable, and open wide over the 3D mountain.
   It also helps an audience follow the pointer on a projector. Only on
   devices with a mouse, and not when the viewer asks for reduced motion. */
(() => {
  'use strict';

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  let x = -100;
  let y = -100;
  let rx = x;
  let ry = y;
  let raf = 0;
  let last = null;

  const enabled = () => fine.matches && !still.matches;

  function frame() {
    raf = 0;
    rx += (x - rx) * 0.24;
    ry += (y - ry) * 0.24;
    if (Math.abs(x - rx) < 0.1 && Math.abs(y - ry) < 0.1) {
      rx = x;
      ry = y;
    } else {
      raf = requestAnimationFrame(frame);
    }
    ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
  }

  // The reticle's shape follows the cursor the page shows at that spot.
  function kind(el) {
    const c = el && el.nodeType === 1 ? getComputedStyle(el).cursor : '';
    if (/grab(bing)?$/.test(c)) return 'grab';
    if (/pointer$/.test(c)) return 'link';
    if (/text$/.test(c)) return 'text';
    return '';
  }

  function setKind(el) {
    if (el === last) return;
    last = el;
    const k = kind(el);
    ring.classList.toggle('is-link', k === 'link');
    ring.classList.toggle('is-grab', k === 'grab');
    ring.classList.toggle('is-text', k === 'text');
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !enabled()) return;
    if (!ring.classList.contains('is-on')) {
      rx = x = e.clientX; // appear where the mouse is, without sliding in
      ry = y = e.clientY;
      ring.classList.add('is-on');
    }
    x = e.clientX;
    y = e.clientY;
    setKind(e.target);
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => e.pointerType === 'mouse' && ring.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => ring.classList.remove('is-down'), { passive: true });
  // Content changes under a still mouse (a window opens, a summit is picked).
  document.addEventListener('pointerover', (e) => e.pointerType === 'mouse' && setKind(e.target), { passive: true });
  document.documentElement.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
  window.addEventListener('blur', () => ring.classList.remove('is-on', 'is-down'));

  const onChange = () => !enabled() && ring.classList.remove('is-on');
  fine.addEventListener('change', onChange);
  still.addEventListener('change', onChange);
})();
