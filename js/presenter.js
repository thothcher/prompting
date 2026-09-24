/* Presenter mode: bigger text, a HUD, and one linear "next / back" flow
   through both pages, so the lecture can be driven with a clicker. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h, $, store } = GOP;
  const root = document.documentElement;
  const hud = $('#hud');
  const blackout = $('#blackout');
  const btn = $('#btn-presenter');

  let on = root.getAttribute('data-presenter') === 'on';
  let idle = 0;

  const route = () => (GOP.router ? GOP.router.current() : 'prompts');
  const pageView = () => (route() === 'mountain' ? GOP.mountainView : GOP.promptsView);

  function set(value) {
    on = value;
    if (on) root.setAttribute('data-presenter', 'on');
    else root.removeAttribute('data-presenter');
    store.set('presenter', on ? 'on' : 'off');
    btn.setAttribute('aria-pressed', String(on));
    hud.hidden = !on;
    if (!on) {
      root.classList.remove('cursor-hidden');
      clearTimeout(idle);
    }
    update();
    GOP.emit('presenter', on);
    setTimeout(() => GOP.emit('layout'), 60);
  }

  function update() {
    if (!on) return;
    const st = pageView().status();
    hud.replaceChildren(
      h('span', { class: 'hud__label' }, st.label),
      h('span', { class: 'hud__pos' }, st.pos),
      h('span', { class: 'hud__keys' }, '→ next  ·  ← back')
    );
  }

  // Close a card window that is not part of the step flow.
  function closeStrayWindow() {
    const m = GOP.holo.current();
    if (m && m.kind !== 'explain') m.close(true);
  }

  function next() {
    closeStrayWindow();
    if (route() === 'prompts') {
      if (!GOP.promptsView.next()) GOP.router.go('mountain', () => GOP.mountainView.first());
    } else {
      GOP.mountainView.next();
    }
    update();
  }

  function prev() {
    closeStrayWindow();
    if (route() === 'mountain') {
      if (!GOP.mountainView.prev()) GOP.router.go('prompts', () => GOP.promptsView.last());
    } else {
      GOP.promptsView.prev();
    }
    update();
  }

  function toggleBlackout(show) {
    blackout.hidden = !show;
  }

  // Blackout swallows the next key press, like B in PowerPoint.
  GOP.keys.add((e) => {
    if (blackout.hidden) return false;
    if (e.key === 'Shift') return false;
    toggleBlackout(false);
    return true;
  }, 1000);

  blackout.addEventListener('click', () => toggleBlackout(false));

  GOP.keys.add((e) => {
    if (!on) return false;
    const k = e.key;
    const onControl = e.target && e.target.closest && e.target.closest('button, a, [role="button"], [role="tab"]');
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !onControl)) {
      next();
      return true;
    }
    if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
      prev();
      return true;
    }
    if (k === 'Home') {
      pageView().first();
      update();
      return true;
    }
    if (k === 'End') {
      pageView().last();
      update();
      return true;
    }
    if (k === 'b' || k === 'B' || k === '.') {
      toggleBlackout(true);
      return true;
    }
    if (k === 'Escape') {
      pageView().stepOut();
      update();
      return true;
    }
    return false;
  }, 500);

  document.addEventListener('mousemove', () => {
    if (!on) return;
    root.classList.remove('cursor-hidden');
    clearTimeout(idle);
    idle = setTimeout(() => root.classList.add('cursor-hidden'), 2500);
  }, { passive: true });

  btn.addEventListener('click', () => set(!on));
  GOP.on('prompts:change', update);
  GOP.on('mountain:change', update);
  GOP.on('route', update);

  btn.setAttribute('aria-pressed', String(on));
  hud.hidden = !on;

  GOP.presenter = {
    isOn: () => on,
    toggle: () => set(!on),
    update
  };
})();
