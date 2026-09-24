/* Boot: renders both pages, routes between them, and wires the top bar. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h, $, $$, store } = GOP;
  const root = document.documentElement;

  /* ============================================================= Router */

  const views = { prompts: $('#view-prompts'), mountain: $('#view-mountain') };
  const SECTIONS = ['framework', 'origins', 'rules', 'library'];
  let current = null;
  let pending = null;

  // Hashes are plain tokens (#mountain, #p04, #rules) so deep links also
  // work inside embedded viewers. Unknown anchors keep the current page.
  function parse() {
    const hash = (location.hash || '').slice(1);
    if (!hash || hash === 'prompts') return { view: 'prompts' };
    if (hash === 'mountain') return { view: 'mountain' };
    const m = /^p(\d{1,2})$/.exec(hash);
    if (m) return { view: 'prompts', prompt: parseInt(m[1], 10) };
    const mm = /^m(\d{1,2})$/.exec(hash);
    if (mm) return { view: 'mountain', mprompt: parseInt(mm[1], 10) };
    if (SECTIONS.includes(hash)) return { view: 'prompts', section: hash };
    return null;
  }

  function swap(view) {
    Object.entries(views).forEach(([name, el]) => {
      el.hidden = name !== view;
    });
    $$('.tab').forEach((t) => {
      if (t.dataset.route === view) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    current = view;
    window.scrollTo(0, 0);
  }

  function apply(route) {
    if (!route) return;
    const changed = route.view !== current;
    const done = () => {
      if (route.view === 'mountain') {
        GOP.mountainView.onShow();
        if (route.mprompt) GOP.mountainView.setPrompt(route.mprompt - 1);
        if (changed && GOP.presenter.isOn() && !pending) GOP.mountainView.first();
      }
      if (route.prompt) GOP.promptsView.openByNumber(route.prompt);
      else if (route.section) GOP.promptsView.showSection(route.section);
      else if (!changed && !pending) window.scrollTo({ top: 0, behavior: GOP.reduced() ? 'auto' : 'smooth' });
      const cb = pending;
      pending = null;
      if (cb) cb();
      GOP.emit('route', current);
    };
    if (!changed) {
      done();
      return;
    }
    const first = current === null;
    if (!first && document.startViewTransition && !GOP.reduced()) {
      const vt = document.startViewTransition(() => swap(route.view));
      vt.updateCallbackDone.then(done, done);
      // A skipped animation is fine: the page has already switched.
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
    } else {
      swap(route.view);
      done();
    }
  }

  function go(view, then) {
    pending = then || null;
    if (location.hash === '#' + view) apply(parse());
    else location.hash = view;
  }

  window.addEventListener('hashchange', () => apply(parse()));

  GOP.router = { current: () => current, go };

  /* ============================================================== Theme */

  const themeBtn = $('#btn-theme');
  const theme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  function paintThemeBtn() {
    const light = theme() === 'light';
    themeBtn.querySelector('use').setAttribute('href', light ? '#i-moon' : '#i-sun');
    themeBtn.querySelector('.sr-only').textContent = light ? 'Switch to dark theme' : 'Switch to light theme';
  }

  function toggleTheme() {
    const next = theme() === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    paintThemeBtn();
    GOP.emit('theme', next);
  }

  themeBtn.addEventListener('click', toggleTheme);

  /* ========================================================= Fullscreen */

  const fsBtn = $('#btn-fullscreen');
  if (!document.fullscreenEnabled) fsBtn.hidden = true;

  function toggleFullscreen() {
    try {
      const req = document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen();
      if (req && req.catch) req.catch(() => {});
    } catch (e) {
      /* fullscreen is optional */
    }
  }

  fsBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    fsBtn.setAttribute('aria-pressed', String(!!document.fullscreenElement));
  });

  /* =============================================================== Help */

  function openHelp(origin) {
    const row = (keys, text) => [
      h('dt', null, keys.map((k, i) => [i ? ' ' : null, h('kbd', null, k)])),
      h('dd', null, text)
    ];
    GOP.holo.open({
      origin,
      label: 'Keyboard shortcuts',
      render(body) {
        body.appendChild(
          h('div', { class: 'help' },
            h('h2', null, 'Keyboard shortcuts'),
            h('div', { class: 'help__grid' },
              h('section', null,
                h('h3', null, 'Anywhere'),
                h('dl', null,
                  row(['P'], 'Prompts page'),
                  row(['M'], 'Mountain page'),
                  row(['T'], 'Switch theme'),
                  row(['F'], 'Fullscreen'),
                  row(['Shift', 'P'], 'Presenter mode'),
                  row(['?'], 'This help')
                )
              ),
              h('section', null,
                h('h3', null, 'Prompts page'),
                h('dl', null,
                  row(['1-9', '0'], 'Open prompt 01 to 10'),
                  row(['←', '→'], 'Previous or next block'),
                  row(['Esc'], 'Close the block, then the prompt')
                )
              ),
              h('section', null,
                h('h3', null, 'Mountain page'),
                h('dl', null,
                  row(['[', ']'], 'Previous or next prompt'),
                  row(['1-6'], 'Choose a summit'),
                  row(['←', '→'], 'Previous or next summit'),
                  row(['Esc'], 'Close a concept')
                )
              ),
              h('section', null,
                h('h3', null, 'Presenter mode'),
                h('dl', null,
                  row(['→', '↓', 'PgDn', 'Space'], 'Next step'),
                  row(['←', '↑', 'PgUp'], 'Previous step'),
                  row(['Home', 'End'], 'First or last step'),
                  row(['B'], 'Blank the screen'),
                  row(['Esc'], 'Step out one level')
                )
              )
            )
          )
        );
      }
    });
  }

  $('#btn-help').addEventListener('click', (e) => openHelp(e.currentTarget));

  /* ========================================================= Global keys */

  GOP.keys.add((e) => {
    const k = e.key;
    const modal = GOP.holo.current();
    if (k === '?') {
      if (!modal) openHelp($('#btn-help'));
      return true;
    }
    if (k === 't' || k === 'T') {
      toggleTheme();
      return true;
    }
    if (k === 'f' || k === 'F') {
      toggleFullscreen();
      return true;
    }
    if (modal) return false;
    if (k === 'P' && e.shiftKey) {
      GOP.presenter.toggle();
      return true;
    }
    if (k === 'p' || k === 'P') {
      go('prompts');
      return true;
    }
    if (k === 'm' || k === 'M') {
      go('mountain');
      return true;
    }
    if (/^[0-9]$/.test(k)) {
      const n = k === '0' ? 10 : Number(k);
      if (current === 'prompts') {
        GOP.promptsView.openByNumber(n);
        return true;
      }
      if (current === 'mountain' && n <= 6) {
        GOP.mountainView.pick(n - 1);
        return true;
      }
    }
    return false;
  }, 100);

  /* =============================================================== Boot */

  GOP.promptsView.init();
  GOP.mountainView.init();
  paintThemeBtn();
  apply(parse() || { view: 'prompts' });
  GOP.presenter.update();
})();
