/* Holo windows: modal dialogs that unfold from the element that opened them. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h, icon } = GOP;

  let current = null;

  const corners = () =>
    ['tl', 'tr', 'bl', 'br'].map((c) => h('span', { class: 'corner corner--' + c, 'aria-hidden': 'true' }));

  /**
   * open({ origin, label, className, pc, kind, render(body, ctrl), onKey(e), onClose() })
   * origin: the element (or DOMRect) the window unfolds from; focus returns there.
   */
  function open(opts = {}) {
    if (current) current.close(true);

    const { origin, label, className = '', pc, kind = 'card', render, onKey, onClose } = opts;
    const originEl = origin instanceof Element ? origin : null;
    const originRect = originEl ? originEl.getBoundingClientRect() : origin || null;

    const closeBtn = h('button', { class: 'icon-btn holo__close', type: 'button', 'aria-label': 'Close', title: 'Close (Esc)' }, icon('close'));
    const body = h('div', { class: 'holo__body' });
    const panel = h(
      'div',
      { class: 'holo holo--modal ' + className, role: 'dialog', 'aria-modal': 'true', 'aria-label': label || null, tabindex: '-1' },
      corners(),
      h('span', { class: 'scan', 'aria-hidden': 'true' }),
      closeBtn,
      body
    );
    if (pc) panel.style.setProperty('--pc', pc);

    const backdrop = h('div', { class: 'layer__backdrop' });
    const layer = h('div', { class: 'layer' }, backdrop, panel);
    document.getElementById('layer-root').appendChild(layer);

    const background = [document.getElementById('main'), document.getElementById('topbar')];
    background.forEach((el) => el && el.setAttribute('inert', ''));
    document.documentElement.classList.add('is-locked');

    let closed = false;
    const ctrl = { el: panel, body, kind, returnTo: originEl, close };

    const offKeys = GOP.keys.add((e) => {
      if (onKey && onKey(e) === true) return true;
      if (e.key === 'Escape') {
        close();
        return true;
      }
      return false;
    }, 900);

    function close(instant) {
      if (closed) return;
      closed = true;
      offKeys();
      const finish = () => {
        layer.remove();
        background.forEach((el) => el && el.removeAttribute('inert'));
        document.documentElement.classList.remove('is-locked');
        if (current === ctrl) current = null;
        const target = ctrl.returnTo;
        if (target && document.contains(target) && !instant) target.focus({ preventScroll: true });
        if (onClose) onClose(ctrl);
      };
      if (instant || GOP.reduced() || !panel.animate) {
        finish();
        return;
      }
      panel.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.97)' }], { duration: 170, easing: 'ease-in' });
      const anim = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-in' });
      anim.onfinish = finish;
    }

    backdrop.addEventListener('click', () => close());
    closeBtn.addEventListener('click', () => close());

    if (render) render(body, ctrl);
    current = ctrl;

    GOP.boot(panel, 1000);
    GOP.unfold(panel, originRect);
    requestAnimationFrame(() => {
      const first = panel.querySelector('[data-autofocus]');
      (first || panel).focus({ preventScroll: true });
    });

    return ctrl;
  }

  GOP.holo = { open, corners, current: () => current };
})();
